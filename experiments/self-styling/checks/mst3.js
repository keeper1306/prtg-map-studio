// runs the bar in a page whose map is inside a short iframe, as on PRTG's View Map
const base=require('fs').readFileSync(__dirname+'/mst3base.js','utf8');
const i=base.indexOf("  const s=()=>p.evaluate");
const pre=base.slice(0,i);
const body=`
  const F=()=>p.frame({url:/maponly/});
  const s=()=>F().evaluate(()=>{const r=document.getElementById('mapitem_7');const cs=getComputedStyle(r);
    const ths=[...r.querySelectorAll('.ms-sens thead th')].filter(t=>getComputedStyle(t).display!=='none').map(t=>t.textContent);
    const rows=[...r.querySelectorAll('.ms-sens tbody tr')].filter(t=>getComputedStyle(t).display!=='none').map(t=>(t.querySelector('td.col-device,td.col-sensor')||{}).textContent);
    return {card:cs.backgroundColor,ths:ths.join('|'),rows:rows.join(','),gear:!!r.querySelector('.mst-gear')};});
  const B="document.querySelector('[data-mst-bar]').shadowRoot";
  await p.goto('http://prtg.test/'+(PUBLIC?'public/':'')+'mapshow.htm?id=2252');await p.waitForTimeout(500);
  if(PUBLIC){console.log('public gear',JSON.stringify(await s()));console.log('errors',errs);await b.close();return;}
  await F().evaluate(()=>document.querySelector('#mapitem_7 .mst-gear').click());await p.waitForTimeout(300);
  const vp=p.viewportSize();
  const rect=await p.evaluate(B+".querySelector('.bar').getBoundingClientRect().toJSON()");
  console.log('bar in top page',JSON.stringify(rect),'viewport',vp.width,vp.height);
  await p.screenshot({path:OUT+'-bar.png'});
  const menus=await p.evaluate(B+"&&[...document.querySelector('[data-mst-bar]').shadowRoot.querySelectorAll('.m>.t')].map(b=>b.textContent.replace(/\\s*\\u25BE/,''))");
  for(const m of menus){
    const r=await p.evaluate(([B,m])=>{const sh=eval(B);const b=[...sh.querySelectorAll('.m>.t')].find(x=>x.textContent.startsWith(m));b.click();
      const pop=b.parentNode.querySelector('.pop');const pr=pop.getBoundingClientRect();return {m,top:Math.round(pr.top),bottom:Math.round(pr.bottom),right:Math.round(pr.right),inside:pr.top>=0&&pr.bottom<=innerHeight&&pr.right<=innerWidth&&pr.left>=0,scroll:pop.scrollHeight>pop.clientHeight};},[B,m]);
    console.log('menu',JSON.stringify(r));
    if(m.trim()==='Colors')await p.screenshot({path:OUT+'-cols.png'});
  }
  await p.evaluate(B+".querySelector('.m>.t').click()"); // Looks open
  await p.evaluate(([B])=>{const sh=eval(B);[...sh.querySelectorAll('.lk')].find(x=>/Dark card/.test(x.textContent)).click();},[B]);
  await p.evaluate(([B])=>{const sh=eval(B);const b=[...sh.querySelectorAll('.m>.t')].find(x=>x.textContent.startsWith('Filters'));b.click();
    [...sh.querySelectorAll('.pc')].find(l=>/^Down$/.test(l.textContent.trim())).querySelector('input').click();},[B]);
  await p.waitForTimeout(700);
  console.log('changed',JSON.stringify(await s()),'dirty',await p.evaluate(B+".querySelector('.t.save').classList.contains('dirty')"));
  await p.mouse.click(5,5);await p.waitForTimeout(100);
  await p.screenshot({path:OUT+'-changed.png'});
  await p.evaluate(([B])=>{const sh=eval(B);[...sh.querySelectorAll('.m>.t')].find(x=>x.textContent.startsWith('Save')).click();sh.querySelector('.b.pri').click();},[B]);
  await p.waitForTimeout(500);
  console.log('save msg',await p.evaluate(B+".querySelector('.msg').textContent"),'dirty',await p.evaluate(B+".querySelector('.t.save').classList.contains('dirty')"));
  // PRTG refreshes the item inside the iframe while the bar is open
  await F().evaluate(h=>window.reloadItem(h), render('mapitem_7','7',store.htmlbefore));await p.waitForTimeout(700);
  console.log('after refresh',JSON.stringify(await s()),'bars',await p.evaluate(()=>document.querySelectorAll('[data-mst-bar]').length));
  await p.evaluate(B+".querySelector('.t.x').click()");await p.waitForTimeout(200);
  console.log('closed, bars',await p.evaluate(()=>document.querySelectorAll('[data-mst-bar]').length),JSON.stringify(await s()));
  console.log('errors',errs);await b.close();
})();`;
const mainStart=pre.indexOf("(async()=>{");
const code=pre+body;
require('fs').writeFileSync(__dirname+'/mst3run.js',code);
require('child_process').execFileSync('node',[__dirname+'/mst3run.js',...process.argv.slice(2)],{stdio:'inherit'});
