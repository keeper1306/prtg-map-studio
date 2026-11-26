/* Which choices can change on the map: builds Map Studio's file for the default and for each variant, and compares the markup
   without the CSS, the scripts and the root's classes (those the script can change; anything else needs PRTG to build the file).
   node tools/variants.js <type>      (variants come from types/<type>/type.js: variants:[{label, patch}] or the spec's values) */
const path=require('path'), K=require('./kitrun');
const t=process.argv[2], T=require(path.join(__dirname,'..','types',t,'type.js'));
const k=K.make(T.mstype,[T.build,T.blank,'flexAppend','lookOf','LOOKORDER']);
let M0=k.use(k[T.blank]());if(T.defaults)M0=k.use(T.defaults(M0,k)||M0);
function markup(m){
  k.use(m);let s=k.flexAppend(k[T.build](m));
  s=s.replace(/<style>[\s\S]*?<\/style>/g,'<style/>').replace(/<script>[\s\S]*?<\/script>/g,'<script/>').replace(/<link [^>]*>/g,'');
  s=s.replace(/<div class="map_object[^"]*"/,'<div class="ROOT"').replace(/^<!--[^\n]*-->/,'');
  s=s.replace(/<div class="gtitle"><b>[^<]*<\/b><\/div>/,'<div class="gtitle"><b>TITLE</b></div>');
  return s;
}
const base=markup(JSON.parse(JSON.stringify(M0)));
const vars=[];
Object.keys(T.spec).forEach(key=>{const s=T.spec[key];
  const vals=s[0]==='enum'?s[1]:s[0]==='bool'?[true,false]:s[0]==='int'?[s[1],s[2]]:s[0]==='list'?[s[1].slice(0,2)]:['Sample text'];
  vals.forEach(v=>vars.push({label:key+'='+JSON.stringify(v),patch:{[key]:v}}));});
(T.variants||[]).forEach(v=>vars.push(v));
let n=0;
vars.forEach(v=>{
  const m=Object.assign(JSON.parse(JSON.stringify(M0)),v.patch);
  if(T.modelTweakNode)T.modelTweakNode(m);
  let mk;try{mk=markup(m);}catch(e){console.log('ERROR '+v.label+': '+e.message);n++;return;}
  if(mk===base){console.log('same   '+v.label);return;}
  n++;let i=0;while(i<mk.length&&mk[i]===base[i])i++;
  console.log('DIFFER '+v.label+'\n   default: '+JSON.stringify(base.slice(Math.max(0,i-60),i+100))+'\n   this   : '+JSON.stringify(mk.slice(Math.max(0,i-60),i+100)));
});
console.log(n?n+' choices change the markup':'every choice can change on the map');
