function draw01(U,paint){
  var K=U.K, C=U.C, esc=U.esc;
  function settle(p){return p.then(function(v){return {ok:true,v:v};},function(e){return {ok:false,e:e};});}
  function render(S,T,now){
    var html=U.header(C.kicker||'IT operations · NOC wall display',C.title||'NOC overview',['Refreshes with the map','Live PRTG data','Updated '+U.hhmm(now)+':'+('0'+now.getSeconds()).slice(-2)]);
    var list=S.ok?S.v:[], cnt={up:0,warn:0,down:0,unusual:0,paused:0};
    list.forEach(function(s){var st=U.stateOf(s);if(cnt[st]!==undefined)cnt[st]++;});
    html+='<section aria-label="Sensor status" style="display:flex;flex-wrap:wrap;gap:12px">'+[['up','Up'],['warn','Warning'],['down','Down'],['unusual','Unusual'],['paused','Paused']].map(function(x){
      return '<div style="flex:1 1 180px;background:'+K.card+';border:1px solid '+K.line+';border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:12px"><span style="width:12px;height:12px;border-radius:50%;background:'+U.col(x[0])+'"></span><div><div style="font-family:\'Space Grotesk\',sans-serif;font-size:28px;font-weight:600">'+(S.ok?cnt[x[0]].toLocaleString('en-US'):'–')+'</div><div style="font-size:12px;color:'+K.mute+'">'+x[1]+'</div></div></div>';
    }).join('')+'</section>';
    /* alarms: down first, then warning, then unusual; the longest-standing first within each */
    var ord={down:0,warn:1,unusual:2}, al=list.filter(function(s){return ord[U.stateOf(s)]!==undefined;}).sort(function(a,b){var d=ord[U.stateOf(a)]-ord[U.stateOf(b)];if(d)return d;return (U.num(U.raw(b,'downtimesince'))||0)-(U.num(U.raw(a,'downtimesince'))||0);});
    var rows=al.slice(0,C.alarmRows||7).map(function(s){var st=U.stateOf(s), since=U.ago(U.raw(s,'downtimesince'));
      return '<tr style="border-top:1px solid '+K.line+'"><td style="padding:9px 6px;border-top:1px solid '+K.line+'"><span style="display:inline-flex;align-items:center;gap:6px;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;color:'+K.page+';background:'+U.col(st)+'">'+U.WORD[st]+'</span></td>'+
        '<td class="ell" style="padding:9px 6px;font-weight:500;max-width:170px;border-top:1px solid '+K.line+'">'+esc(U.strip(s.device))+'</td><td class="ell" style="padding:9px 6px;color:'+K.soft+';max-width:170px;border-top:1px solid '+K.line+'">'+esc(U.strip(s.sensor))+'</td>'+
        '<td class="ell" style="padding:9px 6px;color:'+K.mute+';max-width:260px;border-top:1px solid '+K.line+'">'+esc(U.strip(U.raw(s,'message'))||'—')+'</td><td class="num" style="padding:9px 6px;text-align:right;color:'+K.mute+';border-top:1px solid '+K.line+'">'+esc(since||'—')+'</td></tr>';}).join('');
    var alarms=U.card('flex:2 1 560px',U.h2('Current alarms','· '+(S.ok?al.length:'–')+' open')+(S.ok?(al.length?'<div style="overflow:hidden"><table style="width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed"><colgroup><col style="width:96px"><col style="width:22%"><col style="width:22%"><col><col style="width:64px"></colgroup><thead><tr style="text-align:left;color:'+K.mute+';font-size:12px"><th style="padding:8px 6px;font-weight:500">Status</th><th style="padding:8px 6px;font-weight:500">Device</th><th style="padding:8px 6px;font-weight:500">Sensor</th><th style="padding:8px 6px;font-weight:500">Message</th><th style="padding:8px 6px;font-weight:500;text-align:right">Since</th></tr></thead><tbody>'+rows+'</tbody></table></div>':U.empty('No open alarms. Every sensor is up or paused.')):U.empty(U.errText(S.e))));
    /* sites: one ping sensor each */
    var pings=list.filter(function(s){return /(^|[\s,])pingsensor([\s,]|$)/.test(String(s.tags||''));});
    var sites=pings.slice().sort(function(a,b){var o={down:0,warn:1,unusual:2,up:3,paused:4,unknown:5};return (o[U.stateOf(a)]-o[U.stateOf(b)])||U.strip(a.device).localeCompare(U.strip(b.device));}).slice(0,C.sites||8);
    var siteHtml=sites.map(function(s){var st=U.stateOf(s), ms=U.num(U.raw(s,'lastvalue'));
      return '<div style="border:1px solid '+K.line+';border-radius:8px;padding:10px 12px;background:#1B212C;display:flex;flex-direction:column;gap:4px;min-width:0"><div style="display:flex;align-items:center;gap:8px;min-width:0"><span style="flex:0 0 10px;width:10px;height:10px;border-radius:50%;background:'+U.col(st)+'"></span><span class="ell" style="font-weight:600">'+esc(U.strip(s.device))+'</span></div><div class="ell" style="font-size:12px;color:'+K.mute+'">'+U.WORD[st]+' · '+(st==='down'||ms===null?'—':(ms<10?ms.toFixed(1).replace(/\.0$/,''):Math.round(ms)))+' ms</div></div>';}).join('');
    var sitesCard=U.card('flex:1 1 320px',U.h2('Sites')+(S.ok?(sites.length?'<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">'+siteHtml+'</div>':U.empty('No ping sensors found.')):U.empty(U.errText(S.e))));
    html+='<div style="display:flex;flex-wrap:wrap;gap:16px">'+alarms+sitesCard+'</div>';
    /* top 10 ping latency */
    var top=pings.filter(function(s){return U.num(U.raw(s,'lastvalue'))!==null&&U.stateOf(s)!=='down';}).sort(function(a,b){return U.num(U.raw(b,'lastvalue'))-U.num(U.raw(a,'lastvalue'));}).slice(0,10);
    var mx=Math.max(C.latencyScale||200,top.length?U.num(U.raw(top[0],'lastvalue')):0);
    var topHtml=top.map(function(s){var ms=U.num(U.raw(s,'lastvalue')), warn=ms>(C.latencyWarn||150);
      return '<div style="display:flex;align-items:center;gap:10px;font-size:13px"><span class="ell" style="flex:0 0 150px">'+esc(U.strip(s.device))+'</span><span style="flex:1 1 auto;height:8px;background:'+K.track+';border-radius:4px;overflow:hidden"><span style="display:block;height:8px;border-radius:4px;width:'+Math.max(1,Math.round(ms/mx*100))+'%;background:'+(warn?K.warn:K.blue)+'"></span></span><span class="num" style="flex:0 0 56px;text-align:right;color:'+K.soft+'">'+(ms<10?ms.toFixed(1).replace(/\.0$/,''):Math.round(ms))+' ms</span></div>';}).join('');
    var topCard=U.card('flex:1 1 380px',U.h2('Top 10 ping latency')+(S.ok?(top.length?'<div style="display:flex;flex-direction:column;gap:8px">'+topHtml+'</div>':U.empty('No ping sensors with a value.')):U.empty(U.errText(S.e))));
    /* core bandwidth, 24 h */
    var bw;
    if(!T.ok)bw=U.empty(T.e&&T.e.none?'No traffic sensor found. Set one in the object’s settings.':U.errText(T.e));
    else{
      var rows2=T.v.rows, ks=U.trafficKeys(rows2), a=U.series(rows2,ks.i).map(function(v){return v===null?null:v*8;}), b=U.series(rows2,ks.o).map(function(v){return v===null?null:v*8;});
      var pa=U.peakOf(a), pb=U.peakOf(b), top2=Math.max(pa||0,pb||0)*1.05||1, il=U.pts(a,0,top2);
      bw=U.svgChart(220,(il?'<path d="'+U.area(il)+'" fill="'+K.blue+'" fill-opacity="0.15"></path>':'')+U.poly(il,K.blue,2)+U.poly(U.pts(b,0,top2),K.orange,2),'Inbound and outbound traffic over the last 24 hours')+U.xLabels(24,5);
      T.leg=U.legend([[U.lineKey(K.blue),'In · peak '+U.fbps(pa)],[U.lineKey(K.orange),'Out · peak '+U.fbps(pb)]]);
    }
    var bwCard=U.card('flex:2 1 560px',U.head2((C.trafficTitle||'Core bandwidth')+(T.ok&&T.v.name?' \u00B7 '+T.v.name:'')+' · last 24 h',T.leg||'')+bw);
    html+='<div style="display:flex;flex-wrap:wrap;gap:16px">'+topCard+bwCard+'</div>';
    paint(html);
  }
  var now=new Date();
  render({ok:false,e:{loading:1}},{ok:false,e:{loading:1}},now);
  var S=settle(U.sensors('objid,sensor,device,status,lastvalue,message,downtimesince,tags'));
  var T=settle(S.then(function(r){
    var id=C.traffic;
    if(!id&&r.ok){var t=r.v.filter(function(s){return /bandwidthsensor|snmptrafficsensor|trafficsensor/.test(String(s.tags||''));})[0];if(t)id=t.objid;}
    if(!id){var e=new Error('none');e.none=1;throw e;}
    var name=r.ok?(r.v.filter(function(s){return String(s.objid)===String(id);})[0]||{}):{};
    return U.hist(id,24,900,C.ttl).then(function(rows){return {rows:rows,name:name.device?U.strip(name.device)+' \u00B7 '+U.strip(name.sensor).replace(/^SNMP Traffic v2\s*/i,''):''};});
  }));
  Promise.all([S,T]).then(function(x){render(x[0],x[1],new Date());});
}
