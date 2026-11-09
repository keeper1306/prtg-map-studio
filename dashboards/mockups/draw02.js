function draw02(U,paint){
  var K=U.K, C=U.C, esc=U.esc;
  function settle(p){return p.then(function(v){return {ok:true,v:v};},function(e){return {ok:false,e:e};});}
  function fmtPct(v){if(v===null)return '–';var s=v>=99.99?v.toFixed(3):v.toFixed(2);return s+' %';}
  /* one service: availability over the window from PRTG's daily Downtime (per cent of each day) */
  function slo(sv){
    return U.hist(sv.id,24*C.days,86400,C.ttl).then(function(rows){
      var d=rows.map(function(r){var c=U.num(r.coverage);return c===0?null:U.num(r.Downtime);}).filter(function(v){return v!==null;});
      if(!d.length)throw new Error('no data');
      /* the window's budget is (100 - goal) % of C.days days; what the days so far used of it is left over, as SLO windows count it */
      var allowed=100-sv.goal, sum=d.reduce(function(a,b){return a+b;},0), act=100-sum/d.length, used=allowed>0?(sum/C.days)/allowed:1, left=1-used;
      var last=d.slice(-7), downL=last.reduce(function(a,b){return a+b;},0)/last.length, burn=allowed>0?downL/allowed:0;   /* last 7 days against an even burn */
      var rem=[],acc=0;d.forEach(function(x,i){acc+=x;rem.push(100*(1-(acc/C.days)/(allowed||1)));});
      return {sv:sv,act:act,left:left,burn:burn,rem:rem,days:d.length};
    });
  }
  function stateOf(r){if(r.left<=0)return ['Exhausted',K.down];if(r.left<0.3||r.burn>1.2)return ['At risk',K.warn];return ['Healthy',K.up];}
  function render(R,L,now){
    var html=U.header(C.kicker||'Site reliability · '+C.days+'-day window',C.title||'SLOs & error budget',['Refresh '+Math.round(C.ttl/60)+' min','Live PRTG data']);
    html+='<section aria-label="Service level objectives" style="display:flex;flex-wrap:wrap;gap:12px">'+C.services.map(function(sv,i){
      var r=R&&R[i], ok=r&&r.ok, v=ok?r.v:null, st=ok?stateOf(v):['…',K.paused], w=ok?Math.max(0,Math.min(100,Math.round(v.left*100))):0;
      return '<div style="flex:1 1 260px;min-width:0;background:'+K.card+';border:1px solid '+K.line+';border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:10px">'+
        '<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;min-width:0"><span class="ell" style="font-weight:600">'+esc(sv.name)+'</span><span style="flex:0 0 auto;font-size:12px;font-weight:600;padding:2px 8px;border-radius:999px;color:'+K.page+';background:'+st[1]+'">'+st[0]+'</span></div>'+
        '<div style="font-size:12px;color:'+K.mute+'">Availability ≥ '+sv.goal+' %</div>'+
        '<div style="display:flex;align-items:baseline;gap:8px"><span style="font-family:\'Space Grotesk\',sans-serif;font-size:30px;font-weight:600">'+(ok?fmtPct(v.act):'–')+'</span><span style="font-size:12px;color:'+K.mute+'">actual</span></div>'+
        '<div><div style="display:flex;justify-content:space-between;font-size:12px;color:'+K.mute+';margin-bottom:6px"><span>Error budget left</span><span style="color:'+K.text+';font-weight:600">'+(ok?(v.left<-1?'< −100 %':(Math.round(v.left*100)+' %').replace('-','−')):'–')+'</span></div>'+
        '<div style="position:relative;height:12px;background:'+K.track+';border-radius:3px"><div style="position:absolute;left:0;top:0;bottom:0;width:25%;background:#2B323F;border-radius:3px 0 0 3px"></div><div style="position:absolute;left:0;top:3px;height:6px;width:'+w+'%;background:'+st[1]+';border-radius:2px"></div></div>'+
        '<div style="font-size:11px;color:'+K.mute+';margin-top:6px">'+(ok?'Burn rate '+(v.burn>99?'> 99':v.burn.toFixed(1))+'×'+(v.days<C.days?' · day '+v.days+' of '+C.days:' · shaded = last 25 %'):(r&&!r.ok?esc(U.errText(r.e)):'Loading…'))+'</div></div></div>';
    }).join('')+'</section>';
    /* burn-down for the service with the least budget left */
    var worst=null;(R||[]).forEach(function(r){if(r&&r.ok&&(!worst||r.v.left<worst.left))worst=r.v;});
    var bd;
    if(worst){
      var rem=worst.rem.map(function(v){return Math.max(-100,v);}), lo=Math.max(-100,Math.min(-15,Math.floor(Math.min.apply(null,rem)/10)*10)), hi=105, n=C.days;
      var line=rem.map(function(v,i){return (i*100/(n-1)).toFixed(2)+','+(40-(v-lo)/(hi-lo)*38).toFixed(2);}).join(' ');
      var even='0,'+(40-(100-lo)/(hi-lo)*38).toFixed(2)+' 100,'+(40-(0-lo)/(hi-lo)*38).toFixed(2), zy=40-(0-lo)/(hi-lo)*38;
      bd=U.svgChart(230,U.hline(zy,'#3A4352',1)+U.poly(even,K.mute,1.5,'4 4')+U.poly(line,K.down,2.5),'Error budget remaining over the window')+
        '<div style="display:flex;justify-content:space-between;font-size:11px;color:'+K.mute+';margin-top:6px"><span>Day 1</span><span>Day 10</span><span>Day 20</span><span>Day '+n+' · budget at 0 line</span></div>';
    }else bd=U.empty(R?'No availability data yet.':'Loading…');
    var bdCard=U.card('flex:1 1 520px',U.head2('Budget burn-down · '+(worst?worst.sv.name:'…'),U.legend([[U.lineKey(K.down),'Remaining'],[U.dashKey(K.mute),'Even burn']]))+bd);
    /* latency percentiles per hour, from the sensor's raw values */
    var lt;
    if(L&&L.ok){
      var hrs=L.v, all=[];hrs.forEach(function(h){if(h)all.push(h.p99);});
      var top=Math.max(C.latencySlo*1.15,Math.max.apply(null,all.length?all:[1])*1.1);
      function ser(k){return hrs.map(function(h){return h?h[k]:null;});}
      function pp(a){var o=[],n=a.length;a.forEach(function(v,i){if(v!==null)o.push((i*100/(n-1)).toFixed(2)+','+(40-v/top*38).toFixed(2));});return o.join(' ');}
      lt=U.svgChart(230,U.hline(40-C.latencySlo/top*38,K.warn,1,'3 3')+U.poly(pp(ser('p50')),K.blue,2)+U.poly(pp(ser('p95')),K.violet,2)+U.poly(pp(ser('p99')),K.orange,2),'Latency percentiles over 24 hours')+
        U.xLabels(24,5,'Dashed = '+C.latencySlo+' ms p95 SLO');
    }else lt=U.empty(L?U.errText(L.e):'Loading…');
    var ltCard=U.card('flex:1 1 520px',U.head2((C.latencyName||'Latency')+' · 24 h',U.legend([[U.lineKey(K.blue),'p50'],[U.lineKey(K.violet),'p95'],[U.lineKey(K.orange),'p99']]))+lt);
    html+='<div style="display:flex;flex-wrap:wrap;gap:16px">'+bdCard+ltCard+'</div>';
    /* HTTP status mix: needs a sensor with one channel per status class */
    html+=U.card('',U.head2('HTTP status mix · last hour',U.legend([[U.boxKey('#3B6FB8'),'2xx'],[U.boxKey('#8FB8F5'),'3xx'],[U.boxKey(K.warn),'4xx'],[U.boxKey(K.down),'5xx']]))+
      (C.mix&&C.mix.length?'':U.empty('No sensor on this PRTG counts HTTP answers by status code. A sensor with one channel per class (2xx, 3xx, 4xx, 5xx), for example from the web server’s logs or an API, would fill these bars.')));
    paint(html);
  }
  render(null,null,new Date());
  var R=Promise.all(C.services.map(function(sv){return settle(slo(sv));}));
  var L=settle(U.hist(C.latencyId,24,0,C.ttl).then(function(rows){
    var key=null, ks=rows.length?Object.keys(rows[0]):[];
    key=ks.filter(function(k){return /^response time$/i.test(k);})[0]||ks.filter(function(k){return /response time|loading time/i.test(k)&&!/min|max/i.test(k);})[0];
    if(!key)throw new Error('no channel');
    var by={}, t0=Date.now()-24*3600000;
    rows.forEach(function(r,i){var v=U.num(r[key]);if(v===null)return;var h=Math.min(23,Math.floor(i/rows.length*24));(by[h]=by[h]||[]).push(v);});
    var out=[],h;for(h=0;h<24;h++){var a=(by[h]||[]).sort(function(x,y){return x-y;});if(!a.length){out.push(null);continue;}function q(p){return a[Math.min(a.length-1,Math.floor(p*(a.length-1)+0.5))];}out.push({p50:q(.5),p95:q(.95),p99:q(.99)});}
    return out;
  }));
  Promise.all([R,L]).then(function(x){render(x[0],x[1],new Date());});
}
