/* Builds the self-styling test objects into experiments/self-styling/.   node tools/build.js [table graph donut ...]
   Every object = its own parts (types/<name>/) + the shared parts (common/). The new types also carry Map Studio's own builder code,
   copied out of extension/js/09-objects.js by extract.js, so they look exactly like the objects Map Studio makes. */
const fs=require('fs'), path=require('path');
const B=require('./barcss'), K=require('./kitrun');
const DIR=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(DIR,f),'utf8');
const LOOKS13=JSON.parse(read('types/looks13.json'));
const BCSS='[\n'+B.PCSS.concat(B.EXTRA).map(x=>'    '+JSON.stringify(x)).join(',\n')+'\n  ].join("\\n")';
const LEGACY={table:{pfx:'mst.',noun:'table'},graph:{pfx:'msg.',noun:'graph'}};

function prelude(pfx,noun){
  return '(function(){\n  var root=document.getElementById("__ITEMID__");\n  if(!root||root.__mst)return;\n  root.__mst=1;\n'+
    '  var SUB=root.getAttribute(\'subid\')||\'\';\n  var PFX='+JSON.stringify(pfx)+', NOUN='+JSON.stringify(noun)+';\n';
}
function common(){return [].slice.call(arguments).map(p=>read('common/'+p+'.js')).join('\n');}
/* the script as PRTG may see it: no PRTG tags, no end of the script element, ASCII only */
function finish(js){
  js=js.replace('__GEAR__',()=>B.GEAR)   /* already a JS string literal (barcss.js keeps it as JSON.stringify(...) of the svg) */.replace('__BCSS__',()=>BCSS);
  js=js.replace(/<#/g,'<\\u0023').replace(/<@/g,'<\\u0040').replace(/<\/script/gi,'<\\/script');
  if(/<[#@]/.test(js))throw new Error('script contains a PRTG tag');
  js=js.replace('__ITEMID__','<@itemid>');
  js=js.replace(/[^\x00-\x7f]/g,ch=>'\\u'+ch.charCodeAt(0).toString(16).padStart(4,'0'));
  return js;
}
function check(name,file){
  if(/[^\x00-\x7f]/.test(file))throw new Error(name+': non-ASCII left in the file');
  const lens=file.split('\n').map(l=>l.length), long=Math.max(...lens);
  if(long>=900){const i=lens.indexOf(long);throw new Error(name+': line '+(i+1)+' has '+long+' characters (PRTG fills in no tags with lines that long): '+file.split('\n')[i].slice(0,140));}
  const scripts=(file.match(/<script>/g)||[]).length;
  try{for(const m of file.matchAll(/<script>\n([\s\S]*?)<\/script>/g))new Function(m[1].replace(/<@itemid>/g,'x'));}
  catch(e){throw new Error(name+': the script does not parse: '+e.message);}
  return {bytes:file.length,longest:long,scripts};
}

function buildLegacy(t){
  const L=LEGACY[t];
  const lookTxt='{\n'+LOOKS13.names.map(n=>'    '+JSON.stringify(n)+':'+JSON.stringify(LOOKS13.looks[n])).join(',\n')+'\n  }';
  let head=read('types/'+t+'/head.js').replace('__LOOKS__',()=>lookTxt).replace('__LOOKNAMES__',()=>JSON.stringify(LOOKS13.names));
  let js=prelude(L.pfx,L.noun)+(t==='graph'?read('types/graph/graphRuntime.js')+'\n':'')+head+common('core','save','sizer','bar')+
    read('types/'+t+'/menus.js')+(fs.existsSync(path.join(DIR,'types',t,'extra.js'))?read('types/'+t+'/extra.js'):'')+common('tail');
  js=finish(js);
  const file=read('types/'+t+'/markup.html').replace('${css}',()=>read('types/'+t+'/style.css')).replace('${js}',()=>js);
  return file;
}

/* ---------- the new types: Map Studio's own file, made restylable ---------- */
function kitSource(k,T,type){
  const rts=k.__kit.names.filter((n,i,a)=>/Runtime$/.test(n)&&a.indexOf(n)===i);
  return '  /* ---------- Map Studio\'s own code for this object, copied from extension/js/09-objects.js (its own scope) ---------- */\n'+
    '  var KIT=(function(){\n'+
    '  var TYPE='+JSON.stringify(type)+',__m=null,G,GR,DN,SB,IC,SC,TL,GM,LK,T;function M(){return __m;}function isPaste(){return false;}function anyOn(){return false;}\n'+
    '  '+K.PMS+'\n'+k.__kit.text+'\n'+
    '  return {BUILD:function(m){__m=G=GR=DN=SB=IC=SC=TL=GM=LK=T=m;return '+T.build+'(m);},flexAppend:flexAppend,lookOf:lookOf,LOOKORDER:LOOKORDER,PMS:__PMS,\n'+
    '    RT:{'+rts.map(n=>n+':'+n).join(',')+'},EXP:{'+(T.expose||[]).map(n=>n+':'+n).join(',')+'}};\n  })();\n'+
    '  var BUILD=KIT.BUILD, flexAppend=KIT.flexAppend, lookOf=KIT.lookOf, RT=KIT.RT, __PMS=KIT.PMS, EXP=KIT.EXP;\n';
}
function buildKit(t){
  const T=require(path.join(DIR,'types',t,'type.js'));
  const k=K.make(T.mstype,[T.build,T.blank,'flexAppend','lookOf','LOOKORDER'].concat(T.roots||[],T.expose||[]));
  let M0=k.use(k[T.blank]());
  if(T.defaults)M0=k.use(T.defaults(M0,k)||M0);
  const base=k.flexAppend(k[T.build](M0));
  const p=/<div class="(map_object[^"]*?)"\s+id=/.exec(base.replace(/<@\w+>/g,'@').replace(/<#[^>]*>/g,''));
  const BASECLS=p[1].replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
  const looks=k.LOOKORDER.filter(n=>!(T.noLooks||[]).includes(n));
  const spec=JSON.stringify(T.spec);
  let js=prelude(T.pfx,T.noun)+kitSource(k,T,T.mstype)+
    '  var M0='+JSON.stringify(M0,null,1).replace(/\n\s*/g,'\n   ')+';\n  var BASECLS='+JSON.stringify(BASECLS)+';\n  var SPEC='+spec+';\n  var LOOKNAMES='+JSON.stringify(looks)+';\n'+
    common('core','kit')+(T.extra?read('types/'+t+'/'+T.extra):'')+common('save','sizer','bar','kitbar')+read('types/'+t+'/menus.js')+common('tail');
  js=finish(js);
  /* the file: Map Studio's own, with its scripts replaced by this one, and its CSS marked so the script can rewrite it */
  let file=base.replace(/^<!--[^\n]*-->/,'<!--Map Studio Tests: Map Studio '+T.title+' - restyle it on the map (test)-->');
  file=file.replace(/<div class="map_object /,'<div class="map_object mssk ');
  file=file.replace(/<style>/g,'<style class="mss-css">');
  file=file.replace(/\n?<script>[\s\S]*?<\/script>\n?/g,'\n');
  if(T.fileTweak)file=T.fileTweak(file,k);
  file=file.replace(/\s*$/,'\n')+'<style>\n'+read('common/kit.css')+'</style>\n<script>\n'+js+'</script>\n';
  return file;
}

const want=process.argv.slice(2).length?process.argv.slice(2):Object.keys(LEGACY).concat(fs.readdirSync(path.join(DIR,'types')).filter(d=>fs.existsSync(path.join(DIR,'types',d,'type.js'))));
for(const t of want){
  const file=LEGACY[t]?buildLegacy(t):buildKit(t);
  const name='map-studio-zz-'+t+'-self-styling.htm';
  const c=check(name,file);
  fs.writeFileSync(path.join(DIR,name),file);
  console.log(name,'bytes',c.bytes,'longest line',c.longest,'scripts',c.scripts);
}
