const fs=require('fs');
const { chromium } = require('/home/claude/prtg-map-studio/tests/node_modules/playwright');
const FILE=process.argv[2], OUT=process.argv[3]||'/tmp/mst2', PUBLIC=process.argv[4]==='public';
const raw=fs.readFileSync(FILE,'utf8');
let store={left:40,top:30,width:900,height:520,zindex:3,externallink:'map.htm?id=99',htmlbefore:"<b class='keep'>Hello</b>",htmlafter:''};
const posts=[], tableReqs=[];
const DATA=[
 {cls:'sg',status:'Up',code:'3',device:'core-sw-01',sensor:'Ping',group:'Network',message:'OK',lastvalue:'12 msec',priority:'***',downtimesince:'',uptime:'99.9 %',minigraph:'~',probegroupdevice:'Local » Network » core-sw-01',favorite:''},
 {cls:'sr',status:'Down',code:'5',device:'fw-edge',sensor:'HTTP',group:'Edge',message:'Timeout',lastvalue:'-',priority:'*****',downtimesince:'3 h',uptime:'91 %',minigraph:'~',probegroupdevice:'Local » Edge » fw-edge',favorite:'★'},
 {cls:'sy',status:'Warning',code:'4',device:'db-02',sensor:'Disk',group:'Data',message:'85 %',lastvalue:'85 %',priority:'****',downtimesince:'',uptime:'99 %',minigraph:'~',probegroupdevice:'Local » Data » db-02',favorite:''},
 {cls:'sg',status:'Up',code:'3',device:'web-01',sensor:'CPU',group:'Web',message:'OK',lastvalue:'4 %',priority:'***',downtimesince:'',uptime:'100 %',minigraph:'~',probegroupdevice:'Local » Web » web-01',favorite:''},
 {cls:'sb',status:'Paused',code:'7',device:'lab-01',sensor:'Ping',group:'Lab',message:'Paused',lastvalue:'',priority:'**',downtimesince:'',uptime:'',minigraph:'~',probegroupdevice:'Local » Lab » lab-01',favorite:''}];
const LABEL={status:'Status',device:'Device',sensor:'Sensor',group:'Group',message:'Message',lastvalue:'Last Value',minigraph:'Graph',downtimesince:'Down since',uptime:'Uptime',priority:'Priority',favorite:'Fav',probegroupdevice:'Probe / Group / Device'};
function table(q){
  const cols=(q.get('columns')||'').split(','), sb=q.get('sortby')||'status', desc=sb[0]==='-', key=desc?sb.slice(1):sb, st=q.getAll('filter_status'), n=+(q.get('count')||50);
  let rows=DATA.filter(r=>!st.length||st.includes(r.code));
  rows.sort((a,b)=>String(a[key]).localeCompare(String(b[key]))*(desc?-1:1));
  rows=rows.slice(0,n);
  const url='/controls/table.htm?'+q.toString();
  return `<div class="table-wrapper" refreshurl="${url}"><form><div class="tabletitle">${q.get('tabletitle')||''}</div><table class="table"><thead><tr>${cols.map(c=>`<th class="col-${c}">${LABEL[c]||c}</th>`).join('')}</tr></thead><tbody>`+
    rows.map((r,i)=>`<tr class="${i%2?'even':'odd'} ${r.cls}">${cols.map(c=>`<td class="col-${c}">${c==='device'||c==='sensor'?'<a href="#">'+r[c]+'</a>':r[c]}</td>`).join('')}</tr>`).join('')+`</tbody></table></form></div>`;
}
function render(itemid,subid,before){
  let h=raw.replace(/^<!--.*-->\n/,'');
  h=h.replace(/<@itemid>/g,itemid).replace(/<@subid>/g,subid).replace(/<@objectid>/g,'50').replace(/<@editmode>/g,'0').replace(/<@tagfilterstring>/g,'*');
  h=h.replace(/<#mapobject type="coordinates"[^>]*>/,'position:absolute;left:40px;top:30px;width:980px;height:560px;');
  h=h.replace(/<#mapobject type="htmlbefore"[^>]*>/,before);
  let n=0;
  h=h.replace(/<#table([\s\S]*?)>/g,(m,attrs)=>{const q=new URLSearchParams();const re=/(\w+)="([^"]*)"/g;let x;q.set('tableid',n===0?'sensortable':'channeltable_map');while((x=re.exec(attrs)))if(x[1]!=='tableid')q.set(x[1],x[2]);n++;
    return q.get('content')==='channels'?'<div class="table-wrapper" refreshurl="/controls/table.htm?'+q.toString()+'"><table class="table"><tbody><tr><td>-</td></tr></tbody></table></div>':table(q);});
  return h.replace(/<#[^>]*>/g,'');
}
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1500,height:950}});
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.route('**/*',async r=>{
    const u=new URL(r.request().url());
    if(u.pathname==='/mapshow.htm'||u.pathname==='/public/mapshow.htm'){
      const inner=(u.pathname.startsWith('/public')?'/public':'/controls')+'/maponly.htm?id=2252';
      return r.fulfill({contentType:'text/html',body:`<!doctype html><html><body style="margin:0;background:#fff"><div style="height:60px;background:#0B1F3A"></div><iframe id="mf" src="${inner}" style="margin-left:60px;width:1000px;height:380px;border:0"></iframe></body></html>`});
    }
    if(u.pathname==='/controls/maponly.htm'||u.pathname==='/public/maponly.htm'){
      return r.fulfill({contentType:'text/html',body:`<!doctype html><html><body style="margin:0;background:#EEF1F5"><div id="map">${render('mapitem_7','7',store.htmlbefore)}</div>
      <script>window.reloadItem=function(h){var m=document.getElementById('map');m.innerHTML=h;[].forEach.call(m.querySelectorAll('script'),function(s){var n=document.createElement('script');n.textContent=s.textContent;s.replaceWith(n);});};</script></body></html>`});
    }
    if(u.pathname==='/controls/table.htm'){ tableReqs.push(u.search); if(u.searchParams.get('content')==='channels')return r.fulfill({contentType:'text/html',body:'<div class="prtg-plugin"><div class="table-wrapper" refreshurl="/controls/table.htm?'+u.searchParams+'"><table class="table"><tbody><tr><td>-</td></tr></tbody></table></div></div>'}); if(PUBLIC)return r.fulfill({status:401,body:'no'}); return r.fulfill({contentType:'text/html',body:'<div class="prtg-plugin">'+table(u.searchParams)+'</div>'});}
    if(u.pathname==='/welcome.htm')return r.fulfill({contentType:'text/html',body:'<html><head><meta name="csrf-token" content="TOK123"></head></html>'});
    if(u.pathname==='/api/mapsettings.htm'){ if(PUBLIC)return r.fulfill({status:401,body:'no'}); return r.fulfill({contentType:'application/json',body:JSON.stringify(store)});}
    if(u.pathname==='/api/editmapobject.htm'){
      const h=r.request().headers(); const q=new URLSearchParams(r.request().postData()); posts.push(Object.fromEntries(q));
      if(h['anti-csrf-token']!=='TOK123')return r.fulfill({status:403,body:'bad'});
      store=Object.assign({},store,{htmlbefore:q.get('htmlbefore_').replace(/"/g,"'"),htmlafter:q.get('htmlafter_')});
      return r.fulfill({contentType:'text/html',body:'ok'});
    }
    if(/googleapis/.test(u.host))return r.fulfill({contentType:'text/css',body:''});
    return r.fulfill({status:404,body:''});
  });
  const s=()=>p.evaluate(()=>{const r=document.getElementById('mapitem_7');const cs=getComputedStyle(r);
    const ths=[...r.querySelectorAll('.ms-sens thead th')].filter(t=>getComputedStyle(t).display!=='none').map(t=>t.textContent);
    const rows=[...r.querySelectorAll('.ms-sens tbody tr')].filter(t=>getComputedStyle(t).display!=='none').map(t=>t.querySelector('td.col-device,td.col-sensor')?.textContent);
    return {card:cs.backgroundColor,ths:ths.join('|'),rows:rows.join(','),gear:!!r.querySelector('.mst-gear'),cls:r.className.replace('map_object map_table ','')};});
  if(PUBLIC){
    // public page: first without the publicGear option, then with it
    await p.goto('http://prtg.test/public/maponly.htm?id=2252');await p.waitForTimeout(300);
    console.log('public, no option',JSON.stringify(await s()));
    store.htmlbefore="<i class='mst-cfg' data-c='"+encodeURIComponent(JSON.stringify({publicGear:true,look:'Dark card',statuses:['down','warning'],cols:['status','device','message']}))+"'></i>";
    await p.goto('http://prtg.test/public/maponly.htm?id=2252');await p.waitForTimeout(600);
    console.log('public, option on, data fetch refused -> fallback',JSON.stringify(await s()));
    await p.click('#mapitem_7 .mst-gear');await p.waitForTimeout(200);
    console.log('buttons',await p.evaluate(()=>[...document.querySelector('[data-mst-panel]').shadowRoot.querySelectorAll('.ft button')].map(b=>b.textContent).join(' | ')));
    // a crafted setting is ignored
    store.htmlbefore="<i class='mst-cfg' data-c='"+encodeURIComponent(JSON.stringify({look:'x</style><script>',font:'x;}body{display:none',ov:{bg:'red;background:url(http://evil)'},cols:['status','x{}body{display:none}'],title:'<img src=x onerror=alert(1)>',size:999}))+"'></i>";
    await p.goto('http://prtg.test/public/maponly.htm?id=2252');await p.waitForTimeout(500);
    console.log('crafted',JSON.stringify(await s()), await p.evaluate(()=>{const r=document.getElementById('mapitem_7');return [r.style.getPropertyValue('--ms-font'),r.style.getPropertyValue('--c-card'),r.style.getPropertyValue('--ms-size'),r.style.getPropertyValue('--ms-tt'),getComputedStyle(document.body).display];}));
    console.log('errors',errs);await b.close();return;
  }
  await p.goto('http://prtg.test/controls/maponly.htm?id=2252');
  await p.waitForTimeout(400);
  console.log('start',JSON.stringify(await s()),'table requests',tableReqs.length);
  await p.click('#mapitem_7 .mst-gear');await p.waitForTimeout(200);
  await p.evaluate(()=>{const sh=document.querySelector('[data-mst-panel]').shadowRoot;
    sh.querySelectorAll('details').forEach(d=>d.open=true);
    [...sh.querySelectorAll('.lk')].find(b=>b.title==='Neon plum').click();
    [...sh.querySelectorAll('.shapes button')].find(b=>b.textContent==='Pill').click();
    const cr=()=>[...sh.querySelectorAll('.cr')];
    cr().find(c=>/Group/.test(c.textContent)).querySelector('input').click();
    cr().find(c=>/Priority/.test(c.textContent)).querySelector('input').click();
    [...sh.querySelectorAll('label.chk')].find(l=>/^Down$/.test(l.textContent.trim())).querySelector('input').click();
    [...sh.querySelectorAll('label.chk')].find(l=>/^Warning$/.test(l.textContent.trim())).querySelector('input').click();
    const sel=[...sh.querySelectorAll('.row')].find(r=>/Sort by/.test(r.textContent)).querySelector('select');sel.value='device';sel.dispatchEvent(new Event('change'));
  });
  await p.waitForTimeout(800);
  console.log('edited',JSON.stringify(await s()),'last request',decodeURIComponent(tableReqs.at(-1)||''));
  await p.screenshot({path:OUT+'-1.png'});
  await p.evaluate(()=>{const sh=document.querySelector('[data-mst-panel]').shadowRoot;sh.querySelector('[data-a=all]').click();});
  await p.waitForTimeout(500);
  console.log('msg',await p.evaluate(()=>document.querySelector('[data-mst-panel]').shadowRoot.querySelector('.msg').textContent));
  console.log('stored',decodeURIComponent((/data-c='([^']*)'/.exec(store.htmlbefore)||[])[1]||'').replace(/\s/g,''), '| keeps', /keep/.test(store.htmlbefore));
  await p.evaluate(()=>document.querySelector('[data-mst-panel]').shadowRoot.querySelector('.x').click());
  await p.evaluate(h=>window.reloadItem(h), render('mapitem_7','7',store.htmlbefore));
  await p.waitForTimeout(600);
  console.log('after PRTG refresh',JSON.stringify(await s()));
  await p.hover('#mapitem_7');await p.screenshot({path:OUT+'-2.png'});
  console.log('errors',errs);
  await b.close();
})();
