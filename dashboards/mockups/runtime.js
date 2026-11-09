/* Map Studio mockup dashboards: one PRTG map object that draws a whole 1280 x 900 dashboard in the look of the
   owner's mockups, with live PRTG data. The drawing lives in a shadow root, so PRTG's own CSS can't change it,
   and is scaled to the item's box. Data: PRTG's API from the map page (the viewer's own PRTG session),
   cached on window.top for C.ttl seconds so PRTG's 30-second map refresh doesn't ask again every time. */
function msmkRuntime(root, C){
  if(!root||root.__msmk)return;root.__msmk=1;
  var host=root.querySelector('.msmk-host');if(!host)return;
  var K={up:'#3FB950',warn:'#E3B341',down:'#F47067',unusual:'#E58A3A',paused:'#8C96A8',blue:'#5B9DFF',orange:'#F29A4A',violet:'#B7A4F5',mute:'#A0A9B8',text:'#E6E9EF',soft:'#C9D0DB',card:'#161B24',line:'#262D3A',track:'#222A36',page:'#0E1218'};
  (function fonts(){try{var d=document;if(d.getElementById('msmk-fonts'))return;var l=d.createElement('link');l.id='msmk-fonts';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap';(d.head||d.documentElement).appendChild(l);}catch(e){}})();
  var sh;try{sh=host.shadowRoot||host.attachShadow({mode:'open'});}catch(e){return;}
  host.textContent='';host.style.background=K.page;
  sh.innerHTML='<style>:host{all:initial;display:block;position:absolute;inset:0;overflow:hidden;background:'+K.page+'}'+
    '.stage{position:absolute;left:0;top:0;width:1280px;height:900px;transform-origin:0 0}'+
    'main{box-sizing:border-box;width:1280px;height:900px;overflow:hidden;padding:24px;background:'+K.page+';color:'+K.text+';font-family:Inter,system-ui,"Segoe UI",sans-serif;font-size:14px;line-height:normal;text-align:left}'+
    'h1,h2{margin:0}table{border-spacing:0}*{box-sizing:border-box}.num{font-variant-numeric:tabular-nums}.ell{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
    '.empty{color:'+K.mute+';font-size:13px;padding:14px 4px;line-height:1.45}</style><div class="stage"><main></main></div>';
  var stage=sh.querySelector('.stage'), main=sh.querySelector('main');
  function fit(){var w=root.clientWidth||1280,h=root.clientHeight||900,s=Math.min(w/1280,h/900);stage.style.transform='scale('+s+')';stage.style.left=((w-1280*s)/2)+'px';stage.style.top=((h-900*s)/2)+'px';}
  fit();try{new ResizeObserver(fit).observe(root);}catch(e){}
  /* View Map scales the map to the window; the page around it takes the dashboard's colour instead of white */
  (function pageBg(){function set(d){try{d.documentElement.style.background=K.page;if(d.body)d.body.style.background=K.page;}catch(e){}}
    var framed=false;try{framed=window.parent!==window;}catch(e){}
    if(/mapshow/i.test(location.pathname)||framed)set(document);   /* the map's own frame (View Map, public page), never PRTG's main page */
    try{if(framed&&/mapshow/i.test(window.parent.location.pathname))set(window.parent.document);}catch(e){}})();

  /* ---- data ---- */
  var TOP;try{TOP=window.top;void TOP.document;}catch(e){TOP=window;}
  var cache=TOP.__msmkCache||(TOP.__msmkCache={});
  function getJ(path,params,ttl){
    var q=[],k;for(k in params)if(params[k]!==undefined&&params[k]!==null&&params[k]!=='')q.push(k+'='+encodeURIComponent(params[k]));
    var pre=/^\/api\/v1\//.test(location.pathname)?'/api/v1':'', url=pre+path+'?'+q.join('&'), c=cache[url], now=Date.now();
    if(c&&now-c.t<(ttl||C.ttl)*1000)return c.p;
    var p=fetch(url,{credentials:'include',headers:{'X-Requested-With':'XMLHttpRequest'}}).then(function(r){if(!r.ok){var e=new Error('http '+r.status);e.status=r.status;throw e;}return r.json();});
    cache[url]={t:now,p:p};p.catch(function(){if(cache[url]&&cache[url].p===p)delete cache[url];});
    return p;
  }
  var scope=root.getAttribute('objectid');
  function sensors(cols,extra){var p={content:'sensors',count:'*',columns:cols};if(scope&&scope!=='0')p.id=scope;for(var k in extra)p[k]=extra[k];return getJ('/api/table.json',p).then(function(j){return (j&&j.sensors)||[];});}
  function channels(id){return getJ('/api/table.json',{content:'channels',id:id,columns:'name,lastvalue'}).then(function(j){return (j&&j.channels)||[];});}
  function p2(n){return (n<10?'0':'')+n;}
  function ds(d){return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())+'-'+p2(d.getHours())+'-'+p2(d.getMinutes())+'-'+p2(d.getSeconds());}
  function hist(id,hours,avg,ttl){var now=new Date();return getJ('/api/historicdata.json',{id:id,avg:avg,sdate:ds(new Date(now.getTime()-hours*3600000)),edate:ds(now),usecaption:1},ttl).then(function(j){return (j&&(j.histdata||j.values))||[];});}
  function num(v){if(typeof v==='number')return isFinite(v)?v:null;if(v===null||v===undefined)return null;var m=/-?[\d,]*\.?\d+/.exec(String(v).replace(/<[^>]*>/g,''));if(!m)return null;var x=parseFloat(m[0].replace(/,/g,''));return isFinite(x)?x:null;}
  function raw(o,k){var v=o[k+'_raw'];if(v===undefined||v===''||v===null)v=o[k];return v;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function strip(s){var d=document.createElement('div');d.innerHTML=String(s==null?'':s);return (d.textContent||'').replace(/\s+/g,' ').trim();}
  function stateOf(s){var n=num(raw(s,'status'));if(n===3)return 'up';if(n===4)return 'warn';if(n===10)return 'unusual';if(n===5||n===13||n===14)return 'down';if(n===7||n===8||n===9||n===11||n===12)return 'paused';
    var t=strip(s.status).toLowerCase();if(/^up/.test(t))return 'up';if(/^warn/.test(t))return 'warn';if(/^down/.test(t))return 'down';if(/^unusual/.test(t))return 'unusual';if(/^pause/.test(t))return 'paused';return 'unknown';}
  var WORD={up:'Up',warn:'Warning',down:'Down',unusual:'Unusual',paused:'Paused',unknown:'Unknown'};
  function col(st){return K[st]||K.paused;}
  function ago(sec){sec=num(sec);if(sec===null||sec<0)return '';if(sec<90)return Math.round(sec)+' s';if(sec<5400)return Math.round(sec/60)+' min';if(sec<172800)return Math.round(sec/3600)+' h';return Math.round(sec/86400)+' d';}
  function hhmm(d){return p2(d.getHours())+':'+p2(d.getMinutes());}
  function pts(a,lo,hi){var n=a.length;if(n<2)return '';return a.map(function(v,i){return (i*100/(n-1)).toFixed(2)+','+(v===null?40:(40-(v-lo)/((hi-lo)||1)*38)).toFixed(2);}).join(' ');}
  function area(line){return line?'M0,40 L'+line.split(' ').join(' L')+' L100,40 Z':'';}
  /* bits per second from a PRTG value with its unit ("1,234 kbit/s", "12 MByte/s") */
  function bps(v,unit){var x=num(v);if(x===null)return null;var u=String(unit||v||''), m=/([kKMGT]?)(bit|byte)\/s/i.exec(u);if(!m)return x;var f={'':1,k:1e3,K:1e3,M:1e6,G:1e9,T:1e12}[m[1]]||1;return x*f*(/byte/i.test(m[2])?8:1);}
  function fbps(b){if(b===null||b===undefined)return '—';var u=['bit/s','kbit/s','Mbit/s','Gbit/s','Tbit/s'],i=0;while(Math.abs(b)>=1000&&i<u.length-1){b/=1000;i++;}return (b>=100||i===0?Math.round(b):b.toFixed(1)).toString().replace(/\.0$/,'')+' '+u[i];}
  function legend(items){return '<div style="display:flex;gap:14px;font-size:12px;color:'+K.mute+'">'+items.map(function(it){return '<span style="display:inline-flex;align-items:center;gap:6px">'+it[0]+esc(it[1])+'</span>';}).join('')+'</div>';}
  function lineKey(c){return '<span style="width:14px;height:3px;background:'+c+'"></span>';}
  function dashKey(c){return '<span style="width:14px;height:0;border-top:2px dashed '+c+'"></span>';}
  function boxKey(c){return '<span style="width:10px;height:10px;background:'+c+'"></span>';}
  function card(style,inner){return '<section style="background:'+K.card+';border:1px solid '+K.line+';border-radius:10px;padding:16px;min-width:0;'+(style||'')+'">'+inner+'</section>';}
  function h2(t,sub){return '<h2 style="margin:0 0 12px;font-size:15px;font-weight:600">'+esc(t)+(sub?' <span style="color:'+K.mute+';font-weight:400">'+esc(sub)+'</span>':'')+'</h2>';}
  function head2(t,leg){return '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-bottom:12px"><h2 style="margin:0;font-size:15px;font-weight:600">'+esc(t)+'</h2>'+(leg||'')+'</div>';}
  function pill(t){return '<span style="padding:6px 10px;border:1px solid #2A3240;border-radius:999px">'+esc(t)+'</span>';}
  function header(kicker,title,pills){return '<header style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px"><div><div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:'+K.mute+'">'+esc(kicker)+'</div><h1 style="margin:4px 0 0;font-family:\'Space Grotesk\',Inter,sans-serif;font-size:28px;font-weight:600">'+esc(title)+'</h1></div><div style="display:flex;flex-wrap:wrap;gap:8px;font-size:12px;color:'+K.mute+'">'+pills.map(pill).join('')+'</div></header>';}
  function empty(t){return '<div class="empty">'+esc(t)+'</div>';}
  function errText(e){if(e&&e.loading)return 'Loading…';return (e&&e.status===401)?'Sign in to PRTG to see live data here.':'PRTG did not send this data.';}
  function xLabels(hours,n,last){var now=Date.now(),o=[],i;for(i=0;i<n;i++){var d=new Date(now-hours*3600000*(1-i/(n-1)));o.push(i===n-1&&last?last:hhmm(d));}return '<div style="display:flex;justify-content:space-between;font-size:11px;color:'+K.mute+';margin-top:6px">'+o.map(function(t){return '<span>'+esc(t)+'</span>';}).join('')+'</div>';}
  function svgChart(h,inner,label){return '<svg viewBox="0 0 100 40" preserveAspectRatio="none" style="width:100%;height:'+h+'px;display:block" role="img" aria-label="'+esc(label||'')+'">'+inner+'</svg>';}
  function poly(p,c,w,dash){return p?'<polyline points="'+p+'" fill="none" stroke="'+c+'" stroke-width="'+(w||2)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+' vector-effect="non-scaling-stroke"></polyline>':'';}
  function hline(y,c,w,dash){return '<line x1="0" y1="'+y.toFixed(2)+'" x2="100" y2="'+y.toFixed(2)+'" stroke="'+c+'" stroke-width="'+(w||1)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+' vector-effect="non-scaling-stroke"></line>';}
  /* the two traffic channels of a historic answer: "Traffic In (speed)" / "Traffic Out (speed)", or the first two speed channels */
  function trafficKeys(rows){
    var ks=rows.length?Object.keys(rows[0]):[], sp=ks.filter(function(k){return /speed/i.test(k)&&!/_raw$|\(raw\)$/i.test(k);});
    var i=sp.filter(function(k){return /\bin\b/i.test(k);})[0]||sp[0], o=sp.filter(function(k){return /\bout\b/i.test(k);})[0]||sp[1];
    return {i:i,o:o};
  }
  function series(rows,k){return rows.map(function(r){return k?num(r[k]):null;});}
  function peakOf(a){var m=null;a.forEach(function(v){if(v!==null&&(m===null||v>m))m=v;});return m;}
  var U={K:K,getJ:getJ,sensors:sensors,channels:channels,hist:hist,num:num,raw:raw,esc:esc,strip:strip,stateOf:stateOf,WORD:WORD,col:col,ago:ago,hhmm:hhmm,pts:pts,area:area,bps:bps,fbps:fbps,legend:legend,lineKey:lineKey,dashKey:dashKey,boxKey:boxKey,card:card,h2:h2,head2:head2,header:header,empty:empty,errText:errText,xLabels:xLabels,svgChart:svgChart,poly:poly,hline:hline,trafficKeys:trafficKeys,series:series,peakOf:peakOf,scope:scope,C:C};
  function paint(html){main.innerHTML='<div style="display:flex;flex-direction:column;gap:16px;height:100%">'+html+'</div>';}
  try{C.draw(U,paint);}catch(e){paint(header('Map Studio',C.title||'Dashboard',[])+card('',empty('Could not draw this dashboard: '+(e&&e.message))));}
}
