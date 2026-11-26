/* Runs Map Studio's own builder code (copied out by extract.js) in Node, with stand-ins for the editor's state.
   kitrun.make(type, roots) gives an object with the copied functions; M() and TYPE answer for the model passed to use(m). */
const X=require('./extract'), fs=require('fs'), path=require('path');
/* the status colour sets (06-dashboard.js keeps them on window.PMSSETS); the copied code reads them from __PMS instead */
const DASH=fs.readFileSync(path.join(__dirname,'..','..','..','extension','js','06-dashboard.js'),'utf8');
const pm=/window\.PMSSETS=(\{cur:'',over:\{\},sets:\[[\s\S]*?\]\});/.exec(DASH);
if(!pm)throw new Error('PMSSETS not found in 06-dashboard.js');
const PMS='var __PMS='+pm[1]+';';
function fixText(t){return t.replace(/window\.PMSSETS/g,'__PMS');}
/* the editor's state the pure code still reads: which type is open, its model, paste mode */
const SHIM=['TYPE','M','isPaste','anyOn','ANYT','FRc','G','GR','DN','SB','IC','SC','TL','GM','LK','T','prevEl'];
function make(type,roots,opt){
  opt=opt||{};
  const k=X.kit(roots,{skip:SHIM.concat(opt.skip||[])});
  k.text=fixText(k.text);
  const src='var TYPE='+JSON.stringify(type)+',__m=null,G,GR,DN,SB,IC,SC,TL,GM,LK,T;function M(){return __m;}function isPaste(){return false;}function anyOn(){return false;}\n'
    +PMS+'\n'+(opt.pre||'')+'\n'+k.text+'\nreturn {use:function(m){__m=G=GR=DN=SB=IC=SC=TL=GM=LK=T=m;return m;},'+k.names.filter((n,i,a)=>a.indexOf(n)===i).map(n=>JSON.stringify(n)+':typeof '+n+'==="undefined"?undefined:'+n).join(',')+'};';
  const f=new Function(src);
  const api=f();
  api.__kit=k;
  return api;
}
module.exports={make,SHIM,PMS,fixText};
