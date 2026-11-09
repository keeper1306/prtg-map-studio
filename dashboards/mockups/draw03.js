function draw03(U,paint){
  var K=U.K, C=U.C, esc=U.esc;
  function settle(p){return p.then(function(v){return {ok:true,v:v};},function(e){return {ok:false,e:e};});}
  function chanBps(chs,re){var c=chs.filter(function(x){return re.test(U.strip(x.name));})[0];if(!c)return null;var v=U.num(c.lastvalue_raw);return v===null?null:v*8;}
  function ifName(s){return U.strip(s.sensor).replace(/^SNMP Traffic v2\s*/i,'').replace(/\s*Traffic$/i,'')||U.strip(s.sensor);}
  function fp(p){return p===null?'–':(p<1?(p<0.01&&p>0?'< 0.01':p.toFixed(2)):Math.round(p))+'';}
  function render(G,T,S,E){
    var html=U.header(C.kicker||'Network engineering',C.title||'WAN & bandwidth',['Refresh '+C.ttl+' s','Live PRTG data']);
    html+='<section aria-label="Link utilisation" style="display:flex;flex-wrap:wrap;gap:12px">'+C.links.map(function(l,i){
      var g=G&&G[i], ok=g&&g.ok, v=ok?g.v:{}, use=ok&&v.i!==null?Math.max(v.i||0,v.o||0):null, p=use===null?null:use/l.cap*100, dash=p===null?0:Math.max(0.6,Math.min(100,p)/100*125.66), c=p!==null&&p>=80?K.warn:K.blue;
      return '<div style="flex:1 1 240px;min-width:0;background:'+K.card+';border:1px solid '+K.line+';border-radius:10px;padding:16px;display:flex;flex-direction:column;align-items:center;gap:4px">'+
        '<div style="align-self:stretch;display:flex;justify-content:space-between;gap:8px;font-size:13px;min-width:0"><span class="ell" style="font-weight:600">'+esc(l.name)+'</span><span style="flex:0 0 auto;color:'+K.mute+'">'+esc(U.fbps(l.cap))+'</span></div>'+
        '<svg viewBox="0 0 100 58" style="width:200px;height:116px" role="img" aria-label="'+esc(l.name)+' utilisation"><path d="M10,52 A40,40 0 0 1 90,52" fill="none" stroke="'+K.line+'" stroke-width="9" stroke-linecap="round"></path>'+
        (p!==null?'<path d="M10,52 A40,40 0 0 1 90,52" fill="none" stroke="'+c+'" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+dash.toFixed(1)+' 200"></path>':'')+
        '<text x="50" y="46" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="17" font-weight="600" fill="'+K.text+'">'+fp(p)+' %</text></svg>'+
        '<div style="font-size:12px;color:'+K.mute+'">'+(ok?'In '+U.fbps(v.i)+' · Out '+U.fbps(v.o):(g?esc(U.errText(g.e)):'Loading…'))+'</div></div>';
    }).join('')+'</section>';
    /* main link, 24 h, with the warning limit */
    var l0=C.links[0], ch;
    if(T&&T.ok){
      var rows=T.v, ks=U.trafficKeys(rows), a=U.series(rows,ks.i).map(function(v){return v===null?null:v*8;}), b=U.series(rows,ks.o).map(function(v){return v===null?null:v*8;});
      var pk=Math.max(U.peakOf(a)||0,U.peakOf(b)||0), lim=l0.cap*C.limit, onScale=lim<=pk*1.6, top=onScale?Math.max(pk,lim)*1.1:(pk*1.1||1), il=U.pts(a,0,top);
      ch=U.svgChart(200,(onScale?U.hline(40-lim/top*38,K.warn,1.5,'5 4'):'')+(il?'<path d="'+U.area(il)+'" fill="'+K.blue+'" fill-opacity="0.15"></path>':'')+U.poly(il,K.blue,2)+U.poly(U.pts(b,0,top),K.orange,2),l0.name+' traffic over the last 24 hours')+U.xLabels(24,5,'now');
      T.leg=U.legend([[U.lineKey(K.blue),'In'],[U.lineKey(K.orange),'Out'],[U.dashKey(K.warn),Math.round(C.limit*100)+' % warning limit'+(onScale?'':' ('+U.fbps(lim)+', above the chart)')]]);
    }else ch=U.empty(T?U.errText(T.e):'Loading…');
    html+=U.card('',U.head2(l0.name+' · traffic last 24 h',T&&T.leg||'')+ch);
    /* busiest interfaces (no NetFlow sensor here) and interface errors */
    var tk;
    if(S&&S.ok){
      var tr=S.v.filter(function(s){return /bandwidthsensor/.test(String(s.tags||''))&&U.num(s.lastvalue_raw)!==null;}).sort(function(x,y){return U.num(y.lastvalue_raw)-U.num(x.lastvalue_raw);}).slice(0,6);
      var mx=tr.length?U.num(tr[0].lastvalue_raw):1;
      tk=tr.length?'<div style="display:flex;flex-direction:column;gap:9px">'+tr.map(function(s){var b2=U.num(s.lastvalue_raw);
        return '<div style="display:flex;align-items:center;gap:10px;font-size:13px;min-width:0"><span class="ell num" style="flex:0 0 210px">'+esc(U.strip(s.device))+' → '+esc(ifName(s))+'</span><span style="flex:0 0 90px;color:'+K.mute+'">'+(/wmi/i.test(String(s.tags))?'WMI':'SNMP')+'</span><span style="flex:1 1 160px;height:8px;background:'+K.track+';border-radius:4px;overflow:hidden"><span style="display:block;height:8px;width:'+Math.max(1,Math.round(b2/mx*100))+'%;background:'+K.blue+';border-radius:4px"></span></span><span class="num" style="flex:0 0 84px;text-align:right">'+esc(U.fbps(b2*8))+'</span></div>';}).join('')+'</div>':U.empty('No traffic sensors with a value.');
    }else tk=U.empty(S?U.errText(S.e):'Loading…');
    var tkCard=U.card('flex:2 1 560px',U.h2(C.talkersTitle||'Top talkers · busiest interfaces now')+tk+(S&&S.ok&&!S.v.some(function(s){return /flow|netflow|sflow|jflow|ipfix/i.test(String(s.tags||''));})?'<div style="font-size:11px;color:'+K.mute+';margin-top:10px">No NetFlow sensor on this PRTG, so these are interfaces, not conversations.</div>':''));
    var er;
    if(E&&E.ok){
      var rr=E.v.filter(function(r){return r.err!==null||r.disc!==null;});
      er=rr.length?'<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="text-align:left;color:'+K.mute+';font-size:12px"><th style="padding:6px;font-weight:500">Interface</th><th style="padding:6px;font-weight:500;text-align:right">Errors</th><th style="padding:6px;font-weight:500;text-align:right">Discards</th></tr></thead><tbody>'+rr.slice(0,5).map(function(r){
        return '<tr><td class="ell" style="padding:8px 6px;border-top:1px solid '+K.line+';max-width:200px">'+esc(r.name)+'</td><td class="num" style="padding:8px 6px;text-align:right;border-top:1px solid '+K.line+';color:'+(r.err>0?K.down:K.soft)+'">'+(r.err===null?'—':r.err)+'</td><td class="num" style="padding:8px 6px;text-align:right;border-top:1px solid '+K.line+';color:'+K.soft+'">'+(r.disc===null?'—':r.disc)+'</td></tr>';}).join('')+'</tbody></table>'
        :U.empty('These interfaces have no Errors or Discards channels. Turn them on in each SNMP Traffic sensor’s settings (additional channels: Errors and Discards) to fill this table.');
    }else er=U.empty(E?U.errText(E.e):'Loading…');
    html+='<div style="display:flex;flex-wrap:wrap;gap:16px">'+tkCard+U.card('flex:1 1 340px',U.h2('Interface errors · now')+er)+'</div>';
    paint(html);
  }
  render(null,null,null,null);
  var CH=C.links.map(function(l){return U.channels(l.id);});
  var G=Promise.all(CH.map(function(p){return settle(p.then(function(chs){return {i:chanBps(chs,/^traffic in/i),o:chanBps(chs,/^traffic out/i)};}));}));
  var T=settle(U.hist(C.links[0].id,24,900,C.ttl));
  var S=settle(U.sensors('objid,sensor,device,status,lastvalue,tags'));
  var E=settle(Promise.all(CH).then(function(all){return all.map(function(chs,i){
    var e=chs.filter(function(c){return /error/i.test(U.strip(c.name));}), d=chs.filter(function(c){return /discard/i.test(U.strip(c.name));});
    function sum(a){if(!a.length)return null;return a.reduce(function(t,c){return t+(U.num(c.lastvalue)||0);},0);}
    return {name:C.links[i].name,err:sum(e),disc:sum(d)};
  });}));
  Promise.all([G,T,S,E]).then(function(x){render(x[0],x[1],x[2],x[3]);});
}
