/* The real Map Studio in a test browser, with a way in to its objects code (as in docs/HISTORY.md, 1.15.2, "How the files were
   checked"): a copy of the extension with window.__OBX=function(s){return eval(s)}; right after the first try{ of 09-objects.js,
   served by tests/mock-prtg.py. Used only to check that the copied code builds the same files as Map Studio. */
const fs=require('fs'), path=require('path'), os=require('os'), {spawn}=require('child_process');
const REPO=path.join(__dirname,'..','..','..');
const {chromium}=require(path.join(REPO,'tests','node_modules','playwright'));
function copyDir(a,b){fs.mkdirSync(b,{recursive:true});for(const n of fs.readdirSync(a)){const s=path.join(a,n),d=path.join(b,n);if(fs.statSync(s).isDirectory())copyDir(s,d);else fs.copyFileSync(s,d);}}
async function open(port){
  port=port||8791;
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'msobx-'));
  copyDir(path.join(REPO,'extension'),dir);
  const f=path.join(dir,'js','09-objects.js'), t=fs.readFileSync(f,'utf8'), i=t.indexOf('try{');
  fs.writeFileSync(f,t.slice(0,i+4)+'window.__OBX=function(s){return eval(s)};'+t.slice(i+4));
  const py=process.platform==='win32'?'python':'python3';
  const srv=spawn(py,[path.join(REPO,'tests','mock-prtg.py'),dir,String(port)],{stdio:'ignore'});
  const base='http://127.0.0.1:'+port;
  for(let k=0;k<60;k++){try{await fetch(base+'/__state');break;}catch(e){await new Promise(r=>setTimeout(r,100));}}
  const browser=await chromium.launch();
  const page=await browser.newPage();
  const errs=[];page.on('pageerror',e=>errs.push(String(e)));
  await page.goto(base+'/ext/app.html');
  await page.waitForFunction(()=>typeof window.__OBX==='function');
  return {page,errs,
    ev:(expr)=>page.evaluate(e=>{var r=window.__OBX(e);return r===undefined?null:JSON.parse(JSON.stringify(r));},expr),
    close:async()=>{await browser.close();srv.kill();try{fs.rmSync(dir,{recursive:true,force:true});}catch(e){}}};
}
module.exports={open};
