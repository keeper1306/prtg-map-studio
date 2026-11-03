
/* @region: linkstyle -- the shared Connector line looks and the saved Link style, used by the dashboard and objects regions */
/* ---------- the shared map link style: one saved look, used both by the Link style object (built in the dashboard module's objects tab)
   you push to PRTG, and, by default, by the Map designer's own connectors (also in the dashboard module). Top-level and not inside
   either module's IIFE, since both need to read and write it, and the two modules do not share a closure. ---------- */
var LK_VKEYS=['line','dash','width','opacity','glow','round','colorMode','color','bend','radius','start','end','inset','flow','flowSec','calm','wait'];
var LK_DEFAULTS={line:'curve',dash:'solid',width:5,opacity:100,glow:true,round:true,colorMode:'status',color:'#2f80ed',bend:22,radius:20,
  start:'none',end:'none',inset:28,flow:false,flowSec:1.4,calm:false,wait:4};
function lkDefLoad(){try{var o=JSON.parse(localStorage.getItem(CFG.keys.linkStyle)||'null');return (o&&typeof o==='object')?o:null;}catch(e){return null;}}
function lkDefSave(o){try{localStorage.setItem(CFG.keys.linkStyle,JSON.stringify(o));}catch(e){}}
var LKDEF=(function(){var saved=lkDefLoad(), o={};LK_VKEYS.forEach(function(k){o[k]=(saved&&saved[k]!==undefined)?saved[k]:LK_DEFAULTS[k];});return o;})();
function lkDefSync(L){   /* called whenever the Link style object's own fields render, so editing it updates the shared default live */
  var changed=false;
  LK_VKEYS.forEach(function(k){if(JSON.stringify(LKDEF[k])!==JSON.stringify(L[k])){LKDEF[k]=L[k];changed=true;}});
  if(changed)lkDefSave(LKDEF);
}
function lkNum(v,lo,hi,d){v=parseFloat(v);if(isNaN(v))v=d;return Math.max(lo,Math.min(hi,v));}
/* the Map designer's three line shapes (straight/elbow/curve) are a subset of the Link style vocabulary; this is the closest match */
function lsLnType(line){return (line==='elbow'||line==='relbow')?'elbow':(line==='straight'?'straight':'curve');}
/* The modern line looks and the label for a Connector. One drawer shared by the designer canvas, the
   pickers' thumbnails and the pushed live link (it is sent to PRTG as text, so it carries everything it
   needs and refers to nothing else in this file). Given the line's path data and paint it returns SVG
   markup: defs, the line itself, and what goes over the line (the label). */
/* the colours a Connector paints each state with: PRTG's by default, or the colour set chosen for it */
var LNPAL0={up:'#b4cc38',warning:'#ffd400',down:'#d71920',unusual:'#f5821f',paused:'#3b8dd0',unknown:'#9aa4af'};
function lnPal(p){
  var o={}, k, set=null, i, S=(window.PMSSETS&&window.PMSSETS.sets)||[];
  for(k in LNPAL0)o[k]=LNPAL0[k];
  if(p&&p.colorSet)for(i=0;i<S.length;i++)if(S[i][0]===p.colorSet)set=S[i][2];
  if(set)for(k in set)if(o[k]!==undefined)o[k]=set[k];
  return o;
}
/* A Connector always carries its own line settings and takes its colour from status. Older ones followed the
   shared Link style; this brings them across once, keeping how they looked. */
function connNorm(p){
  if(!p||!p.isConnector||p.cn2)return p;
  p.cn2=1;
  if(p.matchLS!==false){
    if(typeof LKDEF!=='undefined'){p.lt=lsLnType(LKDEF.line);p.thick=lkNum(LKDEF.width,1,40,5);p.anim=!!LKDEF.flow;p.ha='none';p.hb='none';}
    p.matchLS=false;
  }
  p.dash=p.dash||'solid';p.colorMode='status';
  if(p.label&&!p.labelStyle)p.labelStyle='pill';
  return p;
}
var LNTYPES=[['straight','Straight'],['elbow','Elbow'],['sharp','Square elbow'],['corner','Corner, across first'],['cornerv','Corner, down first'],['zig','Zig-zag across'],['zigv','Zig-zag down'],['curve','S-curve'],['bow','Bow']];
var LNLOOKS=[['plain','Plain'],['glow','Soft glow'],['tube','Tube'],['beads','Beads'],['chevron','Chevron'],['taper','Taper'],['rail','Rail'],['lifted','Lifted'],['pulse','Pulse'],['circuit','Circuit'],['sweep','Dash sweep']];
function mkLook(S){
  var NS='http://www.w3.org/2000/svg', w=S.w, u=String(S.uid).replace(/[^\w-]/g,''), look=S.look||'plain', d=S.d, paint=S.paint, c1=S.c1, c2=S.c2||S.c1, defs='', body='', over='', m=null, L=0, run=!!S.anim&&!S.thumb, sp=S.sp||1.6;
  function R(n){return Math.round(n*100)/100;}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  try{m=document.createElementNS(NS,'path');m.setAttribute('d',d);L=m.getTotalLength();}catch(e){m=null;L=0;}
  function at(s){var q=m.getPointAtLength(Math.max(0,Math.min(L,s)));return [q.x,q.y];}
  function tan(s){var a=at(s-1.5),b=at(s+1.5),x=b[0]-a[0],y=b[1]-a[1],n=Math.sqrt(x*x+y*y)||1;return [x/n,y/n];}
  function line(wd,stroke,extra){return '<path d="'+d+'" fill="none" stroke="'+stroke+'" stroke-width="'+R(wd)+'" stroke-linecap="round" stroke-linejoin="round"'+(extra||'')+'/>';}
  function flow(period){return run?'<animate attributeName="stroke-dashoffset" from="'+R(period)+'" to="0" dur="'+R(period/(60*(1.6/sp)))+'s" repeatCount="indefinite"/>':'';}
  var i, s, p, t, n, k, x, y, pts, a, b, hw, per;
  if(look==='glow'){
    defs='<filter id="lkb'+u+'" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="'+R(Math.max(3,w*1.1))+'"/></filter>';
    body='<g opacity=".6" filter="url(#lkb'+u+')">'+line(w*2.4,paint)+'</g>'+line(Math.max(2,w*0.8),paint);
  }else if(look==='tube'){
    body=line(w+Math.max(4,w*0.9),'#0f172a',' stroke-opacity=".5"')+line(w,paint)+'<g transform="translate(0,'+R(-w*0.2)+')">'+line(Math.max(1.5,w*0.28),'#ffffff',' stroke-opacity=".38"')+'</g>';
  }else if(look==='beads'){
    per=w*3.1;
    body='<path d="'+d+'" fill="none" stroke="'+paint+'" stroke-width="'+R(w*1.5)+'" stroke-linecap="round" stroke-dasharray="0.01 '+R(per)+'">'+flow(per+0.01)+'</path>';
  }else if(look==='chevron'){
    body=line(Math.max(1.5,w*0.4),paint,' stroke-opacity=".32"');
    if(m&&L>10){
      k=Math.max(5,w*1.7);n=Math.max(26,w*7);
      if(run){   /* the arrows travel from the start to the end, one after another */
        var cn=Math.max(1,Math.floor(L/n)), T=Math.max(1.2,L/(80*(1.6/sp))), sw=R(Math.max(2,w*0.6)),
            cd='M'+R(-k*0.6)+' '+R(k)+'L'+R(k*0.6)+' 0L'+R(-k*0.6)+' '+R(-k), tm;
        for(i=0;i<cn;i++){
          tm=' dur="'+R(T)+'s" begin="-'+R(T*i/cn)+'s" repeatCount="indefinite"';
          body+='<path d="'+cd+'" fill="none" stroke="'+c1+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round" opacity="0">'+
            '<animateMotion path="'+d+'" rotate="auto"'+tm+'/>'+
            '<animate attributeName="stroke" values="'+c1+';'+c1+';'+c2+';'+c2+'" keyTimes="0;.5;.5;1" calcMode="discrete"'+tm+'/>'+
            '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.06;.94;1"'+tm+'/></path>';
        }
      }else{
        for(s=n/2;s<L-n/4;s+=n){
          p=at(s);t=tan(s);x=-t[1];y=t[0];
          a=[p[0]-t[0]*k*0.6+x*k,p[1]-t[1]*k*0.6+y*k];b=[p[0]-t[0]*k*0.6-x*k,p[1]-t[1]*k*0.6-y*k];
          body+='<path d="M'+R(a[0])+' '+R(a[1])+'L'+R(p[0]+t[0]*k*0.6)+' '+R(p[1]+t[1]*k*0.6)+'L'+R(b[0])+' '+R(b[1])+'" fill="none" stroke="'+paint+'" stroke-width="'+R(Math.max(2,w*0.6))+'" stroke-linecap="round" stroke-linejoin="round"/>';
        }
      }
    }
  }else if(look==='taper'){
    if(m&&L>4){
      n=Math.max(14,Math.round(L/5));pts=[];var q2=[];
      for(i=0;i<=n;i++){
        s=L*i/n;p=at(s);t=tan(s);hw=(w*1.9+(Math.max(1.2,w*0.3)-w*1.9)*(i/n))/2;
        pts.push((R(p[0]-t[1]*hw))+' '+(R(p[1]+t[0]*hw)));q2.push((R(p[0]+t[1]*hw))+' '+(R(p[1]-t[0]*hw)));
      }
      body='<path d="M'+pts.join('L')+'L'+q2.reverse().join('L')+'Z" fill="'+paint+'" stroke="'+paint+'" stroke-width="1" stroke-linejoin="round"/>';
    }else body=line(w,paint);
  }else if(look==='rail'){
    defs='<mask id="lkm'+u+'" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="40000" height="40000"><rect x="-20000" y="-20000" width="40000" height="40000" fill="#fff"/>'+line(Math.max(1.5,w*0.7),'#000')+'</mask>';
    body='<g mask="url(#lkm'+u+')">'+line(w*1.9,paint)+'</g>';
  }else if(look==='lifted'){
    defs='<filter id="lks'+u+'" x="-20%" y="-100%" width="140%" height="300%"><feDropShadow dx="0" dy="'+R(Math.max(3,w))+'" stdDeviation="'+R(Math.max(2.5,w*0.8))+'" flood-color="#0f172a" flood-opacity=".32"/></filter>';
    body='<g filter="url(#lks'+u+')">'+line(w,paint)+'</g>';
  }else if(look==='pulse'){
    body=line(w,paint,' stroke-opacity=".55"');
    if(m&&L>4){
      p=at(L*0.38);k=Math.max(4.5,w*1.15);
      if(S.thumb)body+='<circle cx="'+R(p[0])+'" cy="'+R(p[1])+'" r="'+R(k*1.9)+'" fill="'+c1+'" fill-opacity=".3"/><circle cx="'+R(p[0])+'" cy="'+R(p[1])+'" r="'+R(k)+'" fill="'+c1+'"/>';
      else body+='<g><circle r="'+R(k*1.9)+'" fill="'+c1+'" fill-opacity=".3"/><circle r="'+R(k)+'" fill="'+c1+'"/><animateMotion path="'+d+'" dur="'+R(Math.max(1.2,L/(110/(1.6/sp))))+'s" repeatCount="indefinite"/></g>';
    }
  }else if(look==='circuit'){
    body=line(Math.max(1.6,w*0.4),paint);
    if(m&&L>4){
      a=at(0);b=at(L);k=Math.max(5,w*1.3);
      body+='<circle cx="'+R(a[0])+'" cy="'+R(a[1])+'" r="'+R(k)+'" fill="#fff" stroke="'+c1+'" stroke-width="'+R(Math.max(2,w*0.55))+'"/><circle cx="'+R(b[0])+'" cy="'+R(b[1])+'" r="'+R(k)+'" fill="#fff" stroke="'+c2+'" stroke-width="'+R(Math.max(2,w*0.55))+'"/>';
    }
  }else if(look==='sweep'){
    per=w*6.5+w*2.4;
    body='<path d="'+d+'" fill="none" stroke="'+paint+'" stroke-width="'+R(w)+'" stroke-linecap="round" stroke-dasharray="'+R(w*5)+' '+R(w*2.8)+'">'+flow(w*7.8)+'</path>';
  }
  if(S.label&&S.label.text&&(S.label.style==='pill'||S.label.style==='solid'||S.label.style==='plain')&&m&&L>4){
    var lu=!!S.label.up, fs=Math.max(8,Math.min(60,+S.label.size||14)), tx=String(S.label.text).slice(0,60);
    if(lu)tx=tx.toUpperCase();
    var tw=tx.length*fs*(lu?0.66:0.58)+fs*1.5, th=fs*1.9, la=S.label.al, lpos=(la==='start')?Math.min(L/2,tw/2+fs):((la==='end')?Math.max(L/2,L-tw/2-fs):L/2), mid=at(lpos), st=S.label.style, cx=R(mid[0]), cy=R(mid[1]);
    var fam=String(S.label.fam||'Segoe UI').replace(/[^\w ,-]/g,''), tc=/^#[0-9a-fA-F]{6}$/.test(String(S.label.color||''))?S.label.color:(st==='solid'?'#ffffff':'#0f172a');
    var lwt=String(S.label.wt||'600').replace(/[^0-9]/g,'')||'600';
    var ff='font-family="'+fam+',Arial,sans-serif" font-size="'+fs+'" font-weight="'+lwt+'"'+(S.label.it?' font-style="italic"':'')+(S.label.un?' text-decoration="underline"':'')+' text-anchor="middle"';
    if(st==='solid')over='<rect x="'+R(cx-tw/2)+'" y="'+R(cy-th/2)+'" width="'+R(tw)+'" height="'+R(th)+'" rx="'+R(th/2)+'" fill="'+paint+'"/><text x="'+cx+'" y="'+R(cy+fs*0.35)+'" '+ff+' fill="'+tc+'">'+esc(tx)+'</text>';
    else if(st==='plain')over='<text x="'+cx+'" y="'+R(cy+fs*0.35)+'" '+ff+' fill="'+tc+'" stroke="#ffffff" stroke-width="'+R(fs*0.3)+'" paint-order="stroke" stroke-linejoin="round">'+esc(tx)+'</text>';
    else over='<rect x="'+R(cx-tw/2)+'" y="'+R(cy-th/2)+'" width="'+R(tw)+'" height="'+R(th)+'" rx="'+R(th/2)+'" fill="#ffffff" stroke="'+paint+'" stroke-width="'+R(Math.max(1.6,fs*0.14))+'"/><text x="'+cx+'" y="'+R(cy+fs*0.35)+'" '+ff+' fill="'+tc+'">'+esc(tx)+'</text>';
  }
  if(over)over='<g data-lbl="1">'+over+'</g>';
  return {defs:defs,body:body,over:over};
}
/* a small picture of each way of showing the text */
function lblThumb(st){
  var a='#b4cc38';
  if(st==='none')return '<svg viewBox="0 0 72 34" width="72" height="34"><path d="M4 17H68" stroke="'+a+'" stroke-width="3.4" stroke-linecap="round"/></svg>';
  if(st==='solid')return '<svg viewBox="0 0 72 34" width="72" height="34"><path d="M4 17H68" stroke="'+a+'" stroke-width="3.4" stroke-linecap="round"/><rect x="18" y="8" width="36" height="18" rx="9" fill="'+a+'"/><text x="36" y="21" text-anchor="middle" font-family="Arial" font-size="10" font-weight="700" fill="#fff">Text</text></svg>';
  if(st==='plain')return '<svg viewBox="0 0 72 34" width="72" height="34"><path d="M4 17H68" stroke="'+a+'" stroke-width="3.4" stroke-linecap="round"/><text x="36" y="21" text-anchor="middle" font-family="Arial" font-size="10" font-weight="700" fill="#0f172a" stroke="#fff" stroke-width="3" paint-order="stroke">Text</text></svg>';
  return '<svg viewBox="0 0 72 34" width="72" height="34"><path d="M4 17H68" stroke="'+a+'" stroke-width="3.4" stroke-linecap="round"/><rect x="18" y="8" width="36" height="18" rx="9" fill="#fff" stroke="'+a+'" stroke-width="1.8"/><text x="36" y="21" text-anchor="middle" font-family="Arial" font-size="10" font-weight="700" fill="#0f172a">Text</text></svg>';
}
/* a small picture of each look, drawn by the same code as the real thing, for the pickers */
var LKTH=0;
function lookThumb(look,W,H){
  W=W||72;H=H||34;LKTH++;
  var id='lkt'+LKTH, A='#b4cc38', B='#d71920', d='M6 '+(H-9)+' C '+(W*0.3)+' '+(H-9)+', '+(W*0.38)+' 9, '+(W*0.5)+' 9 S '+(W*0.72)+' '+(H-10)+', '+(W-7)+' '+(H-14),
    g='<defs><linearGradient id="'+id+'" gradientUnits="userSpaceOnUse" x1="6" y1="0" x2="'+(W-7)+'" y2="0"><stop offset="0" stop-color="'+A+'"/><stop offset=".48" stop-color="'+A+'"/><stop offset=".52" stop-color="'+B+'"/><stop offset="1" stop-color="'+B+'"/></linearGradient></defs>', r;
  if(look==='plain')r={defs:'',body:'<path d="'+d+'" fill="none" stroke="url(#'+id+')" stroke-width="3.4" stroke-linecap="round"/>',over:''};
  else r=mkLook({look:look,d:d,paint:'url(#'+id+')',w:3.4,c1:A,c2:B,uid:id,thumb:true});
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" style="display:block;overflow:visible">'+g+r.defs+r.body+r.over+'</svg>';
}
function lsSpeed(){var s=lkNum(LKDEF.flowSec,0.4,20,1.4);return s>=2.2?3:(s<=1.0?0.8:1.6);}
function lsColor(){return (LKDEF.colorMode==='custom'&&/^#[0-9a-fA-F]{6}$/.test(String(LKDEF.color)))?LKDEF.color:'#2f80ed';}
/* @endregion: linkstyle */
