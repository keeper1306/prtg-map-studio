/* The stand-in check for a self-styling object: a fake PRTG map page with sample data (no real PRTG).
   node tools/harness.js <type> [--shots]     Prints PASS/FAIL lines; screenshots go to the scratch folder given by SHOTS=... */
const fs=require('fs'), path=require('path');
const REPO=path.join(__dirname,'..','..','..');
const {chromium}=require(path.join(REPO,'tests','node_modules','playwright'));
const TYPE=process.argv[2], FILE=path.join(__dirname,'..','map-studio-zz-'+TYPE+'-self-styling.htm');
const SHOTS=process.env.SHOTS||'';
const raw=fs.readFileSync(FILE,'utf8');
const results=[];
const e0=()=>0;
function check(name,ok,detail){results.push(ok);console.log((ok?'PASS ':'FAIL ')+name+(ok?'':'  '+JSON.stringify(detail)));}

/* sample PRTG data */
const ST=[['Up',3,'sg'],['Down',5,'sr'],['Warning',4,'sy'],['Up',3,'sg'],['Paused',7,'sb'],['Up',3,'sg'],['Unusual',10,'so'],['Down (Acknowledged)',13,'sr']];
const SENS=ST.map((s,i)=>({objid:2000+i,name:'Sensor '+i,sensor:'Sensor '+i,device:'device-'+i,status:s[0],status_raw:s[1],lastvalue:(10*i+3)+' %',lastvalue_raw:10*i+3,
  priority:3,message:'OK',group:'Group',probegroupdevice:'Probe > Group > device-'+i,basetype:'device',totalsens:3,upsens:2,downsens:i%2,warnsens:0,pausedsens:0,
  unusualsens:0,undefinedsens:0,partialdownsens:0,downacksens:0}));
function tableJson(attrs){
  const content=(/content=['"](\w+)['"]/.exec(attrs)||[])[1]||'sensors';
  if(content==='channels')return JSON.stringify({channels:[{name:'Traffic In',lastvalue:'12 Mbit/s',lastvalue_raw:12},{name:'Traffic Out',lastvalue:'3 Mbit/s',lastvalue_raw:3},{name:'Downtime',lastvalue:'0 %',lastvalue_raw:0}]});
  if(content==='devices'||content==='groups')return JSON.stringify({[content]:SENS.slice(0,5).map((s,i)=>Object.assign({},s,{name:'Item '+i}))});
  return JSON.stringify({sensors:SENS});
}
const LABEL={status:'Status',device:'Device',sensor:'Sensor',group:'Group',message:'Message',lastvalue:'Last Value',minigraph:'Graph',downtimesince:'Down since',uptime:'Uptime',priority:'Priority',favorite:'Fav',probegroupdevice:'Probe / Group / Device'};
function tableHtml(q){
  const cols=(q.get('columns')||'status,device,sensor').split(','), n=+(q.get('count')||50);
  const rows=SENS.slice(0,n), url='/controls/table.htm?'+q.toString();
  return `<div class="table-wrapper" refreshurl="${url}"><form><div class="tabletitle">${q.get('tabletitle')||'Sensors'}</div><table class="table"><thead><tr>${cols.map(c=>`<th class="col-${c}">${LABEL[c]||c}</th>`).join('')}</tr></thead><tbody>`+
    rows.map((r,i)=>`<tr class="${i%2?'even':'odd'} ${ST[i][2]}">${cols.map(c=>`<td class="col-${c}">${c==='device'||c==='sensor'?'<a href="#">'+r[c]+'</a>':(r[c]==null?'':r[c])}</td>`).join('')}</tr>`).join('')+`</tbody></table></form></div>`;
}
function render(itemid,subid,before,opt){
  opt=opt||{};
  let h=raw.replace(/^<!--.*-->\n/,'');
  const w=+(/initialwidth="(\d+)"/.exec(h)||[0,400])[1], hh=+(/initialheight="(\d+)"/.exec(h)||[0,300])[1];
  const W=opt.w||w, H=opt.h||hh;
  h=h.replace(/<@itemid>/g,itemid).replace(/<@subid>/g,subid).replace(/<@objectid>/g,'50').replace(/<@editmode>/g,opt.edit?'1':'0')
    .replace(/<@tagfilterstring>/g,'').replace(/<@width>/g,String(W)).replace(/<@height>/g,String(H));
  h=h.replace(/<#mapobject type="coordinates"[^>]*>/,`position:absolute;left:40px;top:60px;width:${W}px;height:${H}px;`);
  h=h.replace(/<#mapobject type="htmlbefore"[^>]*>/,before);
  h=h.replace(/<#objectproperty name="Name"[^>]*>/g,'Core switch');
  h=h.replace(/<#table([\s\S]*?)>/g,(m,attrs)=>{
    if(/output=['"]json['"]/.test(attrs))return tableJson(attrs);
    const q=new URLSearchParams();const re=/(\w+)="([^"]*)"/g;let x;while((x=re.exec(attrs)))q.set(x[1],x[2]);
    return q.get('content')==='channels'?'<div class="table-wrapper" refreshurl="/controls/table.htm?'+q+'"><table class="table"><tbody><tr><td>-</td></tr></tbody></table></div>':tableHtml(q);
  });
  return h.replace(/<#[^>]*>/g,'');
}
let store, posts=[];
function reset(before){store={left:40,top:60,width:+(/initialwidth="(\d+)"/.exec(raw)||[0,400])[1],height:+(/initialheight="(\d+)"/.exec(raw)||[0,300])[1],zindex:3,externallink:'',htmlbefore:before==null?"<b class='keep'>Hello</b>":before,htmlafter:''};posts=[];}

(async()=>{
  reset();
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1500,height:950}});
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!/favicon|404/.test(m.text()))errs.push(m.text());});
  let mode='view';
  await p.route('**/*',async r=>{
    const u=new URL(r.request().url());
    const pub=u.pathname.startsWith('/public');
    if(/\/(public\/)?mapshow\.htm$/.test(u.pathname)){
      const inner=(pub?'/public':'/controls')+'/maponly.htm?id=2252';
      return r.fulfill({contentType:'text/html',body:`<!doctype html><html><body style="margin:0;background:#fff"><div style="height:60px;background:#0B1F3A"></div><iframe id="mf" src="${inner}" style="margin-left:60px;width:1200px;height:700px;border:0"></iframe></body></html>`});
    }
    if(/maponly\.htm$|mapdesigner\.htm$/.test(u.pathname)){
      const it=render('mapitem_7','7',store.htmlbefore,{edit:mode==='designer'});
      const body=mode==='designer'?`<div id="mapeditor">${it}</div>`:mode==='preview'?`<div class="previewloading" style="position:relative;width:600px;height:500px">${it}</div>`:`<div id="map">${it}</div>`;
      return r.fulfill({contentType:'text/html',body:`<!doctype html><html><head><meta name="csrf-token" content="TOK123"></head><body style="margin:0;background:#EEF1F5">${body}
        <script>window.reloadItem=function(h){var m=document.getElementById('map');m.innerHTML=h;[].forEach.call(m.querySelectorAll('script'),function(s){var n=document.createElement('script');n.textContent=s.textContent;s.replaceWith(n);});};</script></body></html>`});
    }
    if(u.pathname==='/controls/table.htm'){if(pub)return r.fulfill({status:401,body:'no'});return r.fulfill({contentType:'text/html',body:'<div class="prtg-plugin">'+tableHtml(u.searchParams)+'</div>'});}
    if(u.pathname==='/api/table.json')return r.fulfill({contentType:'application/json',body:tableJson("content='"+(u.searchParams.get('content')||'sensors')+"'")});
    if(u.pathname==='/welcome.htm')return r.fulfill({contentType:'text/html',body:'<html><head><meta name="csrf-token" content="TOK123"></head></html>'});
    if(u.pathname==='/api/mapsettings.htm'){if(pub)return r.fulfill({status:401,body:'no'});return r.fulfill({contentType:'application/json',body:JSON.stringify(store)});}
    if(u.pathname==='/api/editmapobject.htm'){
      const hd=r.request().headers(), q=new URLSearchParams(r.request().postData());posts.push(Object.fromEntries(q));
      if(hd['anti-csrf-token']!=='TOK123')return r.fulfill({status:403,body:'bad'});
      /* PRTG turns raw quotes in HTML Before into apostrophes */
      store=Object.assign({},store,{htmlbefore:q.get('htmlbefore_').replace(/"/g,"'"),htmlafter:q.get('htmlafter_'),width:+q.get('width'),height:+q.get('height'),left:+q.get('left'),top:+q.get('top')});
      return r.fulfill({contentType:'text/html',body:'ok'});
    }
    if(/googleapis|gstatic/.test(u.host))return r.fulfill({contentType:'text/css',body:''});
    return r.fulfill({status:404,body:''});
  });
  const frame=()=>p.frame({url:/maponly/})||p.mainFrame();
  async function S(){return frame().evaluate(()=>{const r=document.getElementById('mapitem_7');if(!r)return null;const cs=getComputedStyle(r);
    const css=r.querySelector('style.mss-css');const box=r.querySelector('.gbox')||r;
    return {cls:r.className,gear:!!r.querySelector('.mst-gear'),css:css?css.textContent.length+':'+css.textContent.slice(0,0):null,cssText:css?css.textContent:'',
      bg:getComputedStyle(box).backgroundColor,font:getComputedStyle(box).fontFamily,scale:r.getAttribute('data-scale'),mss:r.style.getPropertyValue('--mss'),
      w:r.offsetWidth,h:r.offsetHeight,html:r.innerHTML.length,svg:r.querySelectorAll('svg path,svg circle').length,
      cfg:(r.querySelector('.mst-cfg')||{}).outerHTML||''};});}
  const bar=()=>p.evaluateHandle(()=>{const h=document.querySelector('[data-mst-bar]');return h&&h.shadowRoot;});
  async function inBar(fn,arg){return p.evaluate(([f,a])=>{const sh=document.querySelector('[data-mst-bar]').shadowRoot;return (new Function('sh','a',f))(sh,a);},[fn,arg]);}
  async function openMenu(name){await inBar("var b=[].find.call(sh.querySelectorAll('.r .t'),function(x){return x.textContent.replace(/\\s*\\u25BE/,'').trim()===a;});if(!b)throw new Error('no menu '+a);b.click();",name);}

  /* 1: View Map */
  await p.goto('http://prtg.test/mapshow.htm?id=2252');await p.waitForTimeout(700);
  let s0=await S();
  check('draws on View Map with no errors',s0&&errs.length===0,{errs,s0:s0&&s0.cls});
  check('gear is there',s0&&s0.gear);
  await frame().hover('#mapitem_7');await frame().click('#mapitem_7 .mst-gear');await p.waitForTimeout(300);
  const menus=await inBar("return [].map.call(sh.querySelectorAll('.r .t'),function(b){return b.textContent.replace(/\\s*\\u25BE/,'').trim();}).join('|');");
  check('bar opens: '+menus,!!menus&&/Save/.test(menus));
  check('size outline shows',await frame().evaluate(()=>!!document.querySelector('.mst-sel')));
  if(SHOTS)await p.screenshot({path:path.join(SHOTS,TYPE+'-1-bar.png')});
  /* 2: a look */
  let looks=0;
  if(/Looks/.test(menus)){
    await openMenu('Looks');
    looks=await inBar("var l=sh.querySelectorAll('.lk');var b=[].find.call(l,function(x){return /dark|Indigo|Neon/i.test(x.textContent)&&!x.classList.contains('on');});b.click();return b.textContent;");
    await p.waitForTimeout(400);
    const s1=await S();
    check('a look changes it ('+looks+')',s1.cssText!==s0.cssText||s1.bg!==s0.bg||s1.cls!==s0.cls,{bg0:s0.bg,bg1:s1.bg});
  }
  /* the type's own menu: every control once, no errors */
  const own=menus.split('|').filter(m=>!/^(Looks|Colors|Title|Save|Ã—|Fixed|Flexible|Text|Corners)$/.test(m)&&!/^[A-Z][a-z]+$/.test('')).filter(m=>m&&m.length>1&&!['Title','Legend','Axis','Grid','Header','Stripes','Lines','Tint'].includes(m));
  for(const m of own.slice(0,6)){
    if(/Save|Looks|Colors|^Title$/.test(m))continue;
    await openMenu(m);await p.waitForTimeout(150);
    const n=await inBar("var pop=[].find.call(sh.querySelectorAll('.pop'),function(x){return !x.hidden;});if(!pop)return 0;var k=0;"+
      "[].forEach.call(pop.querySelectorAll('select'),function(s){if(s.options.length>1){s.selectedIndex=(s.selectedIndex+1)%s.options.length;s.dispatchEvent(new Event('change'));k++;}});"+
      "[].forEach.call(pop.querySelectorAll('input[type=checkbox]'),function(c,i){if(i<4){c.click();k++;}});"+
      "[].forEach.call(pop.querySelectorAll('.seg button:not(.on)'),function(b,i){if(i<1){b.click();k++;}});"+
      "var sh2=[].filter.call(pop.querySelectorAll('.shots .shot:not(.on)'),function(b){return b.offsetParent;});if(sh2.length){sh2[sh2.length>1?1:0].click();k++;}return k;");
    await p.waitForTimeout(300);
    check('menu '+m+': '+n+' controls changed, no errors',errs.length===0,errs);
  }
  if(SHOTS)await p.screenshot({path:path.join(SHOTS,TYPE+'-2-changed.png')});
  await p.keyboard.press('Escape');await p.waitForTimeout(100);   /* close the open menu, as a user would before dragging */
  /* 3: Flexible */
  await inBar("var b=[].find.call(sh.querySelectorAll('.seg2 .t'),function(x){return x.textContent==='Flexible';});if(b)b.click();");
  await p.waitForTimeout(300);
  await frame().evaluate(()=>{const r=document.getElementById('mapitem_7');r.style.width=Math.round(r.offsetWidth*1.5)+'px';r.style.height=Math.round(r.offsetHeight*1.5)+'px';});
  await p.waitForTimeout(500);
  const sf=await S();
  check('Flexible grows with the box (scale '+(sf.scale||sf.mss)+')',parseFloat(sf.scale||sf.mss)>1.2,sf);
  const title=()=>frame().evaluate(()=>{const t=document.querySelector('#mapitem_7 .tabletitle,#mapitem_7 .gtitle');return t?getComputedStyle(t).fontSize:'';});
  const tBig=await title();
  await frame().evaluate(()=>{const r=document.getElementById('mapitem_7');r.style.width=Math.round(r.offsetWidth/1.5)+'px';r.style.height=Math.round(r.offsetHeight/1.5)+'px';});
  await p.waitForTimeout(400);
  const tNorm=await title();
  check('Flexible: the title keeps its size ('+tNorm+' at normal size, '+tBig+' when bigger)',tBig===tNorm,{tBig,tNorm});
  if(TYPE==='table'){
    await frame().evaluate(()=>{const r=document.getElementById('mapitem_7');r.style.width=Math.round(r.offsetWidth/3)+'px';r.style.height=Math.round(r.offsetHeight/3)+'px';});
    await p.waitForTimeout(400);
    const small=await frame().evaluate(()=>{const r=document.getElementById('mapitem_7');const td=r.querySelector('.ms-sens tbody td');return {scale:r.getAttribute('data-scale'),td:td&&getComputedStyle(td).fontSize,ov:getComputedStyle(r).overflow};});
    check('Flexible table at a third of its size: text stays 12 px or more ('+small.td+', scale '+small.scale+', '+small.ov+')',parseFloat(small.td)>=11.9&&/auto|scroll/.test(small.ov),small);
  }
  await frame().evaluate(([w,h])=>{const r=document.getElementById('mapitem_7');r.style.width=w+'px';r.style.height=h+'px';},[s0.w,s0.h]);
  await p.waitForTimeout(400);
  /* 4: the outline: drag the bottom-right handle 60 px */
  const hb=await frame().evaluate(()=>{const i=document.querySelectorAll('.mst-sel i')[4];const r=i.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
  const fo=await p.evaluate(()=>{const f=document.getElementById('mf').getBoundingClientRect();return {x:f.left,y:f.top};});
  await frame().evaluate(()=>{window.__pe=[];['pointerdown','pointermove','pointerup'].forEach(t=>document.addEventListener(t,e=>window.__pe.push(t+':'+e.target.tagName),true));});
  await p.mouse.move(fo.x+hb.x,fo.y+hb.y);await p.mouse.down();await p.mouse.move(fo.x+hb.x+60,fo.y+hb.y+40,{steps:5});await p.mouse.up();
  await p.waitForTimeout(200);
  const sd=await S();
  if(process.env.DEBUGDRAG)console.log('  events',JSON.stringify(await frame().evaluate(()=>window.__pe.slice(0,8))),'fo',JSON.stringify(fo),'hb',JSON.stringify(hb));
  if(process.env.DEBUGDRAG)console.log('  top page at that point:',await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);const sh=document.querySelector('[data-mst-bar]');
    return (e&&e.tagName+'#'+e.id+'.'+e.className)+' | open pops '+(sh?[].filter.call(sh.shadowRoot.querySelectorAll('.pop'),x=>!x.hidden).length:'-')+' | bar '+(sh?JSON.stringify(sh.shadowRoot.querySelector('.bar').getBoundingClientRect()):'-');},[fo.x+hb.x,fo.y+hb.y]));
  if(process.env.DEBUGDRAG)console.log('  (drag debug: at handle',JSON.stringify(await frame().evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&(e.tagName+'.'+e.className+' '+(e.parentNode&&e.parentNode.className));},[hb.x,hb.y])),')');
  /* 5: Save for everyone */
  await openMenu('Save');
  await inBar("[].find.call(sh.querySelectorAll('.b'),function(x){return x.textContent==='Save for everyone';}).click();");
  await p.waitForTimeout(800);
  const msg=await inBar("return sh.querySelector('.msg').textContent;");
  const last=posts[posts.length-1]||{};
  check('Save for everyone: '+msg.slice(0,40),/Saved for everyone/.test(msg),msg);
  check('saved in HTML Before, other content kept',/mst-cfg/.test(last.htmlbefore_||'')&&/keep/.test(last.htmlbefore_||''),last.htmlbefore_);
  check('the outline changed the size by 60 x 40 ('+s0.w+' x '+s0.h+' -> '+sd.w+' x '+sd.h+')',sd.w===s0.w+60&&sd.h===s0.h+40,{s0:[s0.w,s0.h],sd:[sd.w,sd.h]});
  check('new size sent ('+last.width+' x '+last.height+')',+last.width===sd.w&&+last.height===sd.h,{sent:[last.width,last.height],now:[sd.w,sd.h]});
  const cssSaved=(await S()).cssText;
  /* 6: PRTG's refresh draws the item again from what PRTG stored */
  await inBar("sh.querySelector('.x').click();");
  await frame().evaluate(h=>window.reloadItem(h),render('mapitem_7','7',store.htmlbefore,{w:store.width,h:store.height}));
  await p.waitForTimeout(800);
  const sr=await S();
  check('after PRTG\'s refresh the saved look is back',sr.cssText===cssSaved||(!sr.cssText&&sr.bg===sd.bg),{len:[sr.cssText.length,cssSaved.length]});
  check('no errors so far',errs.length===0,errs);
  if(SHOTS)await p.screenshot({path:path.join(SHOTS,TYPE+'-3-saved.png')});
  /* 7: a crafted setting is ignored */
  reset("<i class='mst-cfg' data-c='"+encodeURIComponent(JSON.stringify({look:'x</style><script>window.__bad=1</script>',font:'x;}body{display:none',ov:{cardBg:'red;background:url(http://evil)',text:'#12345'},
    title:'<img src=x onerror=window.__bad=1>',size:999,mode:'x',thick:'40;x',caption:'</style><script>window.__bad=1</script>',cols:['x{}'],kind:'<b>'}))+"'></i>");
  await p.goto('http://prtg.test/mapshow.htm?id=2252');await p.waitForTimeout(700);
  const sc=await S();
  const bad=await frame().evaluate(()=>({bad:!!window.__bad,body:getComputedStyle(document.body).display,imgs:document.querySelectorAll('#mapitem_7 img').length,
    evil:/evil|body\{display:none|<\/style>|<script/.test(((document.querySelector('#mapitem_7 style.mss-css')||{}).textContent||'')+((document.getElementById('mapitem_7')||{}).getAttribute('style')||''))}));
  check('crafted settings are ignored',!bad.bad&&bad.body!=='none'&&!bad.imgs&&!bad.evil&&errs.length===e0(),{bad,errs});
  /* 8: public link: no gear unless the shared setting allows it, then no Save for everyone */
  reset();
  await p.goto('http://prtg.test/public/mapshow.htm?id=2252');await p.waitForTimeout(600);
  check('public link: no gear by default',!(await S()).gear);
  reset("<i class='mst-cfg' data-c='"+encodeURIComponent(JSON.stringify({publicGear:true}))+"'></i>");
  await p.goto('http://prtg.test/public/mapshow.htm?id=2252');await p.waitForTimeout(600);
  const sp=await S();
  let pubBtns='';
  if(sp.gear){await frame().hover('#mapitem_7');await frame().click('#mapitem_7 .mst-gear');await p.waitForTimeout(200);await openMenu('Save');pubBtns=await inBar("return [].map.call(sh.querySelectorAll('.b'),function(b){return b.textContent;}).join('|');");}
  check('public link with the option: gear, only this screen ('+pubBtns+')',sp.gear&&!/Save for everyone/.test(pubBtns));
  /* 9: Map Designer and hover preview: drawn, no gear */
  reset();mode='designer';
  await p.goto('http://prtg.test/controls/mapdesigner.htm?id=2252');await p.waitForTimeout(600);
  const sz=await S();
  check('Map Designer: drawn, no gear',sz&&!sz.gear&&errs.length===0,{sz,errs});
  mode='preview';
  await p.goto('http://prtg.test/controls/maponly.htm?id=2252');await p.waitForTimeout(600);
  const sv=await S();
  check('hover preview: drawn, no gear',sv&&!sv.gear&&errs.length===0,{errs});
  mode='view';
  console.log(results.every(Boolean)?'ALL PASS':'FAILED: '+results.filter(x=>!x).length);
  await b.close();
  process.exit(results.every(Boolean)?0:1);
})().catch(e=>{console.log('FAIL harness error',e);process.exit(2);});
