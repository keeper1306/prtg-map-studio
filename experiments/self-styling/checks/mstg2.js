const fs=require('fs');
const { chromium } = require('/home/claude/prtg-map-studio/tests/node_modules/playwright');
const FILE=process.argv[2], OUT=process.argv[3]||'/tmp/mstg', PUBLIC=process.argv[4]==='public';
const raw=fs.readFileSync(FILE,'utf8');
let store={left:40,top:30,width:640,height:340,zindex:3,externallink:'',htmlbefore:'',htmlafter:''};
const hist=[];
function render(before){
  let h=raw.replace(/^<!--.*-->\n/,'');
  h=h.replace(/<@itemid>/g,'mapitem_9').replace(/<@subid>/g,'9').replace(/<@objectid>/g,'2106').replace(/<@editmode>/g,'0').replace(/<@width>/g,'640').replace(/<@height>/g,'340');
  h=h.replace(/<#mapobject type="coordinates"[^>]*>/,'position:absolute;left:'+store.left+'px;top:'+store.top+'px;width:'+store.width+'px;height:'+store.height+'px;z-index:'+store.zindex+';');
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
      return r.fulfill({contentType:'text/html; charset=utf-8',body:`<!doctype html><html><body style="margin:0"><div style="height:60px;background:#0B1F3A"></div><iframe src="${inner}" style="margin-left:60px;width:1200px;height:640px;border:0"></iframe></body></html>`});}
    if(/maponly\.htm$/.test(u.pathname))return r.fulfill({contentType:'text/html; charset=utf-8',body:`<!doctype html><html><body style="margin:0;background:#EEF1F5"><div id="map">${render(store.htmlbefore)}</div><script>window.reloadItem=function(h){var m=document.getElementById('map');m.innerHTML=h;[].forEach.call(m.querySelectorAll('script'),function(s){var n=document.createElement('script');n.textContent=s.textContent;s.replaceWith(n);});};</script></body></html>`});
    if(u.pathname==='/api/historicdata.json'){if(PUBLIC)return r.fulfill({status:401,body:''});return r.fulfill({contentType:'application/json',body:JSON.stringify(histdata(u.searchParams))});}
    if(u.pathname==='/api/table.json'){if(PUBLIC)return r.fulfill({status:401,body:''});return r.fulfill({contentType:'application/json',body:JSON.stringify({channels:[{name:'Traffic In (Speed)'},{name:'Traffic Out (Speed)'},{name:'Errors In'},{name:'Downtime'}]})});}
    if(u.pathname==='/chart.png')return r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="#ccc"/></svg>'});
    if(u.pathname==='/welcome.htm')return r.fulfill({contentType:'text/html',body:'<html><head><meta name="csrf-token" content="TOK123"></head></html>'});
    if(u.pathname==='/api/mapsettings.htm')return r.fulfill({contentType:'application/json',body:JSON.stringify(store)});
    if(u.pathname==='/api/editmapobject.htm'){const q=new URLSearchParams(r.request().postData());store=Object.assign({},store,{htmlbefore:q.get('htmlbefore_').replace(/"/g,"'"),left:+q.get('left'),top:+q.get('top'),width:+q.get('width'),height:+q.get('height')});return r.fulfill({body:'ok'});}
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
  const click=(menu)=>p.evaluate(([B,menu])=>{const sh=eval(B);[...sh.querySelectorAll('.m>.t')].find(x=>x.textContent.startsWith(menu)).click();},[B,menu]);
  await click('Chart');await p.waitForTimeout(400);
  console.log('shots',await p.evaluate(([B])=>{const sh=eval(B);return [...sh.querySelectorAll('.shot')].map(b=>b.getAttribute('data-v')+':'+(b.querySelector('svg')?b.querySelector('svg').querySelectorAll('path,rect,circle').length:0)).join(' ')},[B]));
  await p.screenshot({path:OUT+'-chart.png'});
  await p.evaluate(([B])=>{const sh=eval(B);sh.querySelector('.shot[data-v="spark"]').click();},[B]);await p.waitForTimeout(300);
  await click('Looks');await p.evaluate(([B])=>{const sh=eval(B);[...sh.querySelectorAll('.lk')].find(x=>/Neon plum/.test(x.textContent)).click();},[B]);
  await click('Chart');await p.waitForTimeout(300);await p.screenshot({path:OUT+'-chart2.png'});
  await p.mouse.click(1300,800);
  const fr=await p.$('iframe');const fb=await fr.boundingBox();
  const hpos=async n=>{const r=await F().evaluate(n=>{const i=document.querySelectorAll('.mst-sel i')[n].getBoundingClientRect();return [i.left+i.width/2,i.top+i.height/2];},n);return [fb.x+r[0],fb.y+r[1]];};
  console.log('outline',await F().evaluate(()=>{const o=document.querySelector('.mst-sel');return o?[o.style.left,o.style.top,o.style.width,o.style.height,o.querySelector('b').textContent].join(' '):'none';}));
  let [x,y]=await hpos(4);await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+120,y+60,{steps:6});await p.mouse.up();await p.waitForTimeout(300);
  [x,y]=await hpos(0);await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x-20,y-10,{steps:4});await p.mouse.up();await p.waitForTimeout(400);
  console.log('after drag',JSON.stringify(await F().evaluate(()=>{const r=document.getElementById('mapitem_9');const o=document.querySelector('.mst-sel');return {st:r.style.cssText.match(/left[^;]*;|top[^;]*;|width[^;]*;|height[^;]*;/g).join(''),badge:o.querySelector('b').textContent,ow:o.style.width,svgw:(r.querySelector('svg.gsvg')||{}).getAttribute&&r.querySelector('svg.gsvg').getAttribute('width')};})),'dirty',await p.evaluate(B+".querySelector('.dirty')!==null"));
  await p.screenshot({path:OUT+'-drag.png'});
  await click('Save');await p.evaluate(([B])=>eval(B).querySelector('.b.pri').click(),[B]);await p.waitForTimeout(600);
  console.log('saved',await p.evaluate(B+".querySelector('.msg').textContent"),JSON.stringify({l:store.left,t:store.top,w:store.width,h:store.height}),'dirty',await p.evaluate(B+".querySelector('.dirty')!==null"));
  await F().evaluate(h=>window.reloadItem(h),render(store.htmlbefore));await p.waitForTimeout(700);
  console.log('after PRTG refresh',await F().evaluate(()=>{const r=document.getElementById('mapitem_9');const o=document.querySelector('.mst-sel');return r.style.width+' '+r.style.height+' outline '+(o?o.querySelector('b').textContent:'none');}));
  [x,y]=await hpos(3);await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x-200,y,{steps:4});await p.mouse.up();await p.waitForTimeout(300);
  await F().evaluate(h=>window.reloadItem(h),render(store.htmlbefore));await p.waitForTimeout(700);
  console.log('unsaved drag kept over refresh',await F().evaluate(()=>document.getElementById('mapitem_9').style.width));
  await p.evaluate(([B])=>eval(B).querySelector('.t.x').click(),[B]);await p.waitForTimeout(300);
  console.log('closed without saving',await F().evaluate(()=>document.getElementById('mapitem_9').style.width+' outline '+!!document.querySelector('.mst-sel')));
  console.log('errors',errs);await b.close();
})();
