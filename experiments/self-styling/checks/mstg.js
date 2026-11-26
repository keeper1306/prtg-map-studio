const fs=require('fs');
const { chromium } = require('/home/claude/prtg-map-studio/tests/node_modules/playwright');
const FILE=process.argv[2], OUT=process.argv[3]||'/tmp/mstg', PUBLIC=process.argv[4]==='public';
const raw=fs.readFileSync(FILE,'utf8');
let store={left:40,top:30,width:640,height:340,zindex:3,externallink:'',htmlbefore:'',htmlafter:''};
const hist=[];
function render(before){
  let h=raw.replace(/^<!--.*-->\n/,'');
  h=h.replace(/<@itemid>/g,'mapitem_9').replace(/<@subid>/g,'9').replace(/<@objectid>/g,'2106').replace(/<@editmode>/g,'0').replace(/<@width>/g,'640').replace(/<@height>/g,'340');
  h=h.replace(/<#mapobject type="coordinates"[^>]*>/,'position:absolute;left:40px;top:30px;width:640px;height:340px;');
  h=h.replace(/<#mapobject type="htmlbefore"[^>]*>/,before);
  h=h.replace(/<#objectproperty name="Name"[^>]*>/,'Traffic core-sw-01');
  h=h.replace(/<#object type="graph"[^>]*>/,'<img src="/chart.png?type=graph&graphid=0&id=2106" alt="chart">');
  return h.replace(/<#[^>]*>/g,'');
}
function histdata(q){
  hist.push(q.toString());
  const n=60, now=Date.now(), rows=[];
  for(let i=0;i<n;i++){const t=new Date(now-(n-i)*60000);rows.push({datetime:t.toISOString().slice(0,16).replace('T',' '),'Traffic In (Speed)':40+20*Math.sin(i/6),'Traffic Out (Speed)':25+10*Math.cos(i/8),'Errors In':i%17===0?3:0,'Downtime':0});}
  return {histdata:rows};
}
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1400,height:900}});
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(/NEGW/.test(m.text()))console.log(m.text());if(m.type()==='error')errs.push(m.text());});
  await p.route('**/*',async r=>{
    const u=new URL(r.request().url());
    if(/mapshow\.htm$/.test(u.pathname)){const inner=(u.pathname.startsWith('/public')?'/public':'/controls')+'/maponly.htm?id=2252';
      return r.fulfill({contentType:'text/html; charset=utf-8',body:`<!doctype html><html><body style="margin:0"><div style="height:60px;background:#0B1F3A"></div><iframe src="${inner}" style="margin-left:60px;width:900px;height:420px;border:0"></iframe></body></html>`});}
    if(/maponly\.htm$/.test(u.pathname))return r.fulfill({contentType:'text/html; charset=utf-8',body:`<!doctype html><html><body style="margin:0;background:#EEF1F5"><div id="map">${render(store.htmlbefore)}</div><script>window.reloadItem=function(h){var m=document.getElementById('map');m.innerHTML=h;[].forEach.call(m.querySelectorAll('script'),function(s){var n=document.createElement('script');n.textContent=s.textContent;s.replaceWith(n);});};</script></body></html>`});
    if(u.pathname==='/api/historicdata.json'){if(PUBLIC)return r.fulfill({status:401,body:''});return r.fulfill({contentType:'application/json',body:JSON.stringify(histdata(u.searchParams))});}
    if(u.pathname==='/api/table.json'){if(PUBLIC)return r.fulfill({status:401,body:''});return r.fulfill({contentType:'application/json',body:JSON.stringify({channels:[{name:'Traffic In (Speed)'},{name:'Traffic Out (Speed)'},{name:'Errors In'},{name:'Downtime'}]})});}
    if(u.pathname==='/chart.png')return r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="#ccc"/></svg>'});
    if(u.pathname==='/welcome.htm')return r.fulfill({contentType:'text/html',body:'<html><head><meta name="csrf-token" content="TOK123"></head></html>'});
    if(u.pathname==='/api/mapsettings.htm')return r.fulfill({contentType:'application/json',body:JSON.stringify(store)});
    if(u.pathname==='/api/editmapobject.htm'){const q=new URLSearchParams(r.request().postData());store=Object.assign({},store,{htmlbefore:q.get('htmlbefore_').replace(/"/g,"'")});return r.fulfill({body:'ok'});}
    return r.fulfill({status:404,body:''});
  });
  await p.addInitScript(()=>{const o=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='width'&&/^-/.test(String(v)))console.log('NEGW '+this.tagName+' '+new Error().stack.split('\n').slice(1,4).join(' / '));return o.call(this,n,v);};});
  const F=()=>p.frame({url:/maponly/});
  const B="document.querySelector('[data-mst-bar]').shadowRoot";
  const st=()=>F().evaluate(()=>{const r=document.getElementById('mapitem_9');const svg=r.querySelector('svg.gsvg');
    return {card:getComputedStyle(r).backgroundColor,g:r.querySelector('.gown').getAttribute('data-g'),paths:svg?svg.querySelectorAll('path').length:0,rects:svg?svg.querySelectorAll('rect').length:0,
      legend:[...r.querySelectorAll('.gli .gnm')].map(x=>x.textContent).join('|'),img:(r.querySelector('.gown img')||{}).src||'',mss:r.style.getPropertyValue('--mss'),gear:!!r.querySelector('.mst-gear')};});
  await p.goto('http://prtg.test/'+(PUBLIC?'public/':'')+'mapshow.htm?id=2252');await p.waitForTimeout(800);
  console.log('start',JSON.stringify(await st()));
  if(process.argv[4]==='crafted'){
    store.htmlbefore="<i class='mst-cfg' data-c='"+encodeURIComponent(JSON.stringify({look:'<img src=x onerror=alert(1)>',set:'zz',cstyle:'evil',period:'9',maxCh:9999,lw:-5,names:'<img src=x onerror=window.PWN=1>,Traffic',title:'<b onclick=1>Hi</b>',publicGear:'yes',fontC:'red;}body{display:none',sz:99999,__proto__x:1}))+"'></i>";
    await p.goto('http://prtg.test/mapshow.htm?id=2252');await p.waitForTimeout(900);
    console.log('crafted',JSON.stringify(await st()),await F().evaluate(()=>({pwn:!!window.PWN,imgs:document.querySelectorAll('#mapitem_9 img[src=x]').length,title:(document.querySelector('#mapitem_9 .gtitle')||{}).textContent,body:getComputedStyle(document.body).display,hist:0})),decodeURIComponent(hist.at(-1)||''));
    console.log('errors',errs);await b.close();return;}
  if(PUBLIC){
    store.htmlbefore="<i class='mst-cfg' data-c='"+encodeURIComponent(JSON.stringify({publicGear:true,period:'2',look:'Dark card'}))+"'></i>";
    await p.goto('http://prtg.test/public/mapshow.htm?id=2252');await p.waitForTimeout(800);
    console.log('public with option',JSON.stringify(await st()));console.log('errors',errs.filter(e=>!/401/.test(e)));await b.close();return;
  }
  await F().evaluate(()=>document.querySelector('#mapitem_9 .mst-gear').click());await p.waitForTimeout(300);
  await p.screenshot({path:OUT+'-1.png'});
  const click=(menu,fn)=>p.evaluate(([B,menu,fn])=>{const sh=eval(B);[...sh.querySelectorAll('.m>.t')].find(x=>x.textContent.startsWith(menu)).click();return new Function('sh',fn)(sh);},[B,menu,fn]);
  await click('Chart',"[...sh.querySelectorAll('.seg button')].find(b=>b.textContent==='Bars').click();[...sh.querySelectorAll('.seg button')].find(b=>b.textContent==='2 days').click();");
  await p.waitForTimeout(500);console.log('bars, 2 days',JSON.stringify(await st()),'last request',decodeURIComponent(hist.at(-1)).replace(/sdate.*$/,''));
  await click('Channels',"return 0;");await p.waitForTimeout(300);
  await p.evaluate(([B])=>{const sh=eval(B);[...sh.querySelectorAll('.pc')].find(l=>/Traffic Out/.test(l.textContent)).querySelector('input').click();},[B]);
  await p.waitForTimeout(400);console.log('only Traffic Out',JSON.stringify(await st()));
  await p.screenshot({path:OUT+'-2.png'});
  await click('Looks',"[...sh.querySelectorAll('.lk')].find(x=>/Neon plum/.test(x.textContent)).click();");
  await p.evaluate(([B])=>{const sh=eval(B);[...sh.querySelectorAll('.t')].find(x=>x.textContent==='Flexible').click();},[B]);
  await p.waitForTimeout(300);console.log('neon + flexible',JSON.stringify(await st()));
  await F().evaluate(()=>{const r=document.getElementById('mapitem_9');r.style.width='960px';r.style.height='510px';});await p.waitForTimeout(400);
  console.log('box 1.5x',JSON.stringify(await st()));
  await p.mouse.click(5,5);await p.screenshot({path:OUT+'-3.png'});
  await click('Save',"sh.querySelector('.b.pri').click();");await p.waitForTimeout(500);
  console.log('saved',await p.evaluate(B+".querySelector('.msg').textContent"),decodeURIComponent((/data-c='([^']*)'/.exec(store.htmlbefore)||[])[1]||'').replace(/\s/g,''));
  await F().evaluate(h=>window.reloadItem(h),render(store.htmlbefore));await p.waitForTimeout(700);
  console.log('after PRTG refresh',JSON.stringify(await st()));
  console.log('errors',errs);await b.close();
})();
