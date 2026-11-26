/* Copies functions and values out of Map Studio's extension/js/09-objects.js (the PURE2 region), with everything they use,
   so a self-styling object can run Map Studio's own CSS and drawing code on the map.
   Usage from another build script: const X=require('./extract'); X.kit(['donutCss','donutRuntime'],{skip:[...]}) */
const fs=require('fs'), path=require('path');
const SRC=path.join(__dirname,'..','..','..','extension','js','09-objects.js');
const lines=fs.readFileSync(SRC,'utf8').split('\n');
const a=lines.findIndex(l=>l.includes('/*PURE2-START*/')), b=lines.findIndex(l=>l.includes('/*PURE2-END*/'));
if(a<0||b<0)throw new Error('PURE2 markers not found in 09-objects.js');

/* closure-level blocks: a line at two spaces' indent that starts a declaration, up to the next line at two spaces that is not a closer */
const blocks=[];   /* {names:[], text, start} */
let cur=null;
/* a few small helpers the builders use sit after PURE2-END; they are read too, and only these names are taken from there */
const OUTSIDE=new Set(['readableOn']);
for(let i=a+1;i<lines.length;i++){
  const l=lines[i];
  if(i>=b&&cur&&!cur.after){blocks.push(cur);cur=null;}
  if(i>=b&&!/^  (function|var) /.test(l)&&!cur)continue;
  const top=/^  \S/.test(l), closer=/^  [}\])]/.test(l);
  if(top&&!closer){
    if(cur)blocks.push(cur);
    cur=null;
    let m;
    if((m=/^  function ([A-Za-z_$][\w$]*)\s*\(/.exec(l)))cur={names:[m[1]],text:[l],start:i+1};
    else if((m=/^  var (.*)$/.exec(l))){
      /* var a=..., b=...: every name declared at the top level of the statement */
      cur={names:[],text:[l],start:i+1,isVar:true};
    }else cur={names:[],text:[l],start:i+1,other:true};
    if(i>=b){cur.after=true;if(!cur.names.length||!OUTSIDE.has(cur.names[0]))cur.drop=true;}
  }else if(cur)cur.text.push(l);
}
if(cur)blocks.push(cur);
for(let i=blocks.length-1;i>=0;i--)if(blocks[i].drop)blocks.splice(i,1);
/* page-level helpers the objects code uses (04-page.js: familyStack, isLocalFont, ...): top-level functions at no indent */
const PAGE=fs.readFileSync(path.join(__dirname,'..','..','..','extension','js','04-page.js'),'utf8').split('\n');
for(let i=0;i<PAGE.length;i++){
  if(/^var /.test(PAGE[i])){   /* page-level values (MONOFONTS, WEBSAFE, ...): up to the line where the braces close */
    const t=[PAGE[i]];let bal=(s)=>(s.match(/[{[(]/g)||[]).length-(s.match(/[}\])]/g)||[]).length, d=bal(PAGE[i]);
    while(d>0&&i+1<PAGE.length){i++;t.push(PAGE[i]);d+=bal(PAGE[i]);}
    if(/\bdocument\.|\bwindow\./.test(t.join('\n')))continue;   /* the page's own elements: never wanted (a local "out" would match them) */
    blocks.push({names:[],text:t.join('\n'),start:-(i+1),page:true,isVar:true});
    continue;
  }
  const m=/^function ([A-Za-z_$][\w$]*)\s*\(/.exec(PAGE[i]);if(!m)continue;
  const t=[PAGE[i]];
  if(!/}\s*$/.test(PAGE[i])||(PAGE[i].split('{').length!==PAGE[i].split('}').length)){for(i++;i<PAGE.length;i++){t.push(PAGE[i]);if(/^}/.test(PAGE[i]))break;}}
  blocks.push({names:[m[1]],text:t.join('\n'),start:-(i+1),page:true});
}
/* names in var statements: scan the statement's top level for "name=" after "var " or "," */
function varNames(src){
  const out=[];let i=src.indexOf('var ')+4, depth=0, q=null, expect=true;
  for(;i<src.length;i++){
    const c=src[i];
    if(q){if(c==='\\'){i++;continue;}if(c===q)q=null;continue;}
    if(c==='"'||c==="'"||c==='`'){q=c;continue;}
    if('([{'.includes(c)){depth++;continue;}
    if(')]}'.includes(c)){depth--;continue;}
    if(depth===0&&c===';')break;
    if(depth===0&&c===','){expect=true;continue;}
    if(depth===0&&expect){const m=/^\s*([A-Za-z_$][\w$]*)/.exec(src.slice(i));if(m){out.push(m[1]);i+=m[0].length-1;expect=false;}}
  }
  return out;
}
blocks.forEach(bl=>{if(Array.isArray(bl.text))bl.text=bl.text.join('\n');if(bl.isVar)bl.names=varNames(bl.text);});
const byName={};
blocks.forEach(bl=>bl.names.forEach(n=>{(byName[n]=byName[n]||[]).push(bl);}));

/* identifiers a block uses, outside strings and comments (regex literals are rare enough to be read as code) */
function idents(src){
  const out=new Set();let i=0,q=null;
  while(i<src.length){
    const c=src[i], d=src[i+1];
    if(q){if(c==='\\'){i+=2;continue;}if(c===q)q=null;i++;continue;}
    if(c==='/'&&d==='*'){const j=src.indexOf('*/',i+2);i=j<0?src.length:j+2;continue;}
    if(c==='/'&&d==='/'){const j=src.indexOf('\n',i);i=j<0?src.length:j;continue;}
    if(c==='"'||c==="'"||c==='`'){q=c;i++;continue;}
    const m=/^[A-Za-z_$][\w$]*/.exec(src.slice(i,i+80));
    if(m){if(src[i-1]!=='.')out.add(m[0]);i+=m[0].length;continue;}
    i++;
  }
  return out;
}
/* the blocks needed for some roots, in file order. skip: names left out (the caller defines them itself) */
function kit(roots,opt){
  opt=opt||{};const skip=new Set(opt.skip||[]), need=new Set(), seen=new Set(), missing=new Set();
  const stack=roots.slice();
  while(stack.length){
    const n=stack.pop();if(seen.has(n)||skip.has(n))continue;seen.add(n);
    const bls=byName[n];if(!bls){missing.add(n);continue;}
    bls.forEach(bl=>{if(need.has(bl))return;need.add(bl);idents(bl.text).forEach(x=>{if(byName[x]&&!seen.has(x)&&!skip.has(x))stack.push(x);});});
  }
  const list=blocks.filter(bl=>need.has(bl));
  return {text:list.map(bl=>bl.text).join('\n'),names:[].concat(...list.map(bl=>bl.names)),missing:[...missing],blocks:list};
}
module.exports={kit,blocks,byName,idents};
if(require.main===module){
  const r=kit(process.argv.slice(2));
  console.log('names:',r.names.join(' '));
  console.log('missing:',r.missing.join(' '));
  console.log('bytes:',r.text.length,'longest line:',Math.max(...r.text.split('\n').map(l=>l.length)));
}
