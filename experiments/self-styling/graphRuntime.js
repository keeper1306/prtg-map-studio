  var graphRuntime=function graphRuntime(root,C,src){   /* Map Studio's own graph drawing (1.15.7), unchanged */
    var NS='http://www.w3.org/2000/svg', box=root.querySelector('.gown'), wrap, svg, leg, tip, ro=null, timer=null, D=null, lastv={}, off={}, ALLS=null, lims={}, HV=null;
    if(!box)return;
    function el(n,a,p){var e=document.createElementNS(NS,n),k;for(k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
    function dv(c,p){var e=document.createElement('div');e.className=c;if(p)p.appendChild(e);return e;}
    function clear(n){while(n.firstChild)n.removeChild(n.firstChild);}
    function stop(){if(timer){clearInterval(timer);timer=null;}if(ro){try{ro.disconnect();}catch(e){}ro=null;}}
    function fall(){
      var t=root.querySelector('template.gfall');
      stop();
      if(t&&t.innerHTML){box.innerHTML=t.innerHTML;box.setAttribute('data-g','fallback');}
      else say('No data');
    }
    function say(t){clear(box);var d=dv('gmsg',box);d.textContent=t;box.setAttribute('data-g','message');}
    function p2(n){return (n<10?'0':'')+n;}
    function ds(d){return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())+'-'+p2(d.getHours())+'-'+p2(d.getMinutes())+'-'+p2(d.getSeconds());}
    function fmt(v){
      var a=Math.abs(v),s;
      if(a>=1e12)return +(v/1e12).toFixed(1)+'T';
      if(a>=1e9)return +(v/1e9).toFixed(1)+'G';
      if(a>=1e6)return +(v/1e6).toFixed(1)+'M';
      if(a>=1e4)return +(v/1e3).toFixed(1)+'k';
      if(a>=100)return String(Math.round(v));
      if(a>=1)return String(+v.toFixed(1));
      if(a===0)return '0';
      return String(+v.toFixed(2));
    }
    function nice(min,max,n){
      var span=(max-min)||1, raw=span/n, mag=Math.pow(10,Math.floor(Math.log(raw)/Math.LN10)), r=raw/mag, st=(r<1.5?1:(r<3?2:(r<7?5:10)))*mag, a=Math.floor(min/st)*st, b=Math.ceil(max/st)*st, t=[], x;
      for(x=a;x<=b+st/2;x+=st)t.push(+x.toFixed(10));
      return t;
    }
    function lin(r){return r.map(function(p,i){return (i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1);}).join('');}
    function curve(r){
      var d,i,p0,p1,p2,p3,a,b;
      if(r.length<3)return lin(r);
      d='M'+r[0][0].toFixed(1)+' '+r[0][1].toFixed(1);
      for(i=0;i<r.length-1;i++){
        p0=r[i-1]||r[i];p1=r[i];p2=r[i+1];p3=r[i+2]||p2;
        a=Math.max(Math.min(p1[1],p2[1]),Math.min(Math.max(p1[1],p2[1]),p1[1]+(p2[1]-p0[1])/6));   /* the curve never goes past its neighbours, so a smooth line cannot swing below zero */
        b=Math.max(Math.min(p1[1],p2[1]),Math.min(Math.max(p1[1],p2[1]),p2[1]-(p3[1]-p1[1])/6));
        d+='C'+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+' '+a.toFixed(1)+' '+(p2[0]-(p3[0]-p1[0])/6).toFixed(1)+' '+b.toFixed(1)+' '+p2[0].toFixed(1)+' '+p2[1].toFixed(1);
      }
      return d;
    }
    function num(v){if(typeof v==='number')return isFinite(v)?v:null;if(typeof v==='string'&&v!==''){var f=parseFloat(v.replace(/,/g,''));return isFinite(f)?f:null;}return null;}
    function sample(){
      var rows=[],i,n=C.sampleN||72,f=72/n;
      if(C.heat||C.ring){
        n=C.heat?168:96;var st=(C.heat?3600:900)*1000, end=Date.now();
        for(i=0;i<n;i++){var tt=new Date(end-(n-1-i)*st), hh=tt.getHours()+tt.getMinutes()/60, wk=(tt.getDay()===0||tt.getDay()===6)?0.45:1;
          rows.push({datetime:'Sample '+(i+1),'Traffic In':8+wk*48*Math.max(0,Math.sin((hh-6)/24*Math.PI*2))+6*Math.sin(i*1.7)*Math.sin(i/3),'Traffic Out':4+wk*18*Math.max(0,Math.sin((hh-7)/24*Math.PI*2))});}
        return rows;
      }
      if(C.band)n=Math.max(n,144);
      for(i=0;i<n;i++){var u=i*72/n, jit=C.band?Math.abs(Math.sin(i*12.9898)*43758.5453%1)*14:0;rows.push({datetime:'Sample '+(i+1),'Traffic In':38+22*Math.sin(u/7)+9*Math.sin(u/2.3)+u*0.2+jit,'Traffic Out':16+9*Math.sin(u/9+1)+4*Math.sin(u/3.1)+jit*0.4});}
      return rows;
    }
    function build(rows){
      var skip={datetime:1,coverage:1,Downtime:1,datetime_raw:1}, names=[], k, i, want=[], s=[], tot=0;
      if(!rows.length)return null;
      if((C.bars||C.combo)&&rows.length>36){   /* one bar per stretch of time, so the bars stay readable */
        var step=Math.ceil(rows.length/36), out=[];
        for(i=0;i<rows.length;i+=step){
          var grp=rows.slice(i,i+step), o={datetime:grp[0].datetime}, kk;
          for(kk in rows[0]){
            if(kk==='datetime')continue;
            var sm=0,cn=0;grp.forEach(function(r){var x=num(r[kk]);if(x!==null){sm+=x;cn++;}});
            o[kk]=cn?sm/cn:'';
          }
          out.push(o);
        }
        rows=out;
      }
      for(k in rows[0])if(!skip[k]&&k.indexOf('_raw')<0)names.push(k);
      if(C.names){C.names.split(',').forEach(function(x){x=x.replace(/^\s+|\s+$/g,'').toLowerCase();if(x)want.push(x);});}
      names.forEach(function(nm){
        var vals=rows.map(function(r){return num(r[nm]);}), any=vals.some(function(v){return v!==null;}), ok=!want.length||want.some(function(w){return nm.toLowerCase().indexOf(w)>-1;});
        if(any&&ok)s.push({name:nm,v:vals});
      });
      if(!want.length){
        s.forEach(function(q){var lo=null,hi=null;q.v.forEach(function(x){if(x===null)return;if(lo===null||x<lo)lo=x;if(hi===null||x>hi)hi=x;});q.flat=(lo===hi);});
        s=s.filter(function(q){return !q.flat;}).concat(s.filter(function(q){return q.flat;})).slice(0,C.max||3);   /* channels that actually move come first */
      }
      if(!s.length)return null;
      s.forEach(function(q){var m=0;q.v.forEach(function(x){if(x!==null&&Math.abs(x)>m)m=Math.abs(x);});q.max=m;});
      /* two scales at most, as PRTG does: the first channel and the ones of a similar size share the left axis, the rest the right axis. Without a list of names, a third scale is left out rather than drawn as a squashed line. */
      var r0=s[0].max||1, r1=0, keep=[];
      s.forEach(function(q){
        var m=q.max||1, near0=(m/r0<=20&&r0/m<=20);
        if(C.combo){q.g=(q===s[0])?0:1;keep.push(q);}
        else if(C.stack||C.stackA||C.mirror||C.band){q.g=0;keep.push(q);}
        else if(near0){q.g=0;keep.push(q);}
        else if(!r1||(m/r1<=20&&r1/m<=20)){if(!r1)r1=m;q.g=1;keep.push(q);}
        else if(want.length){q.g=1;keep.push(q);}
      });
      s=keep;
      return {rows:rows,s:s};
    }
    function ask(path,params){   /* in the designer's preview the item sits in a sandboxed frame with no PRTG session, so the tool fetches for it and sends the answer back */
      return new Promise(function(res,rej){
        var id='h'+Math.random().toString(36).slice(2);
        function on(e){var d=e.data;if(!d||d.type!=='pm-hist-r'||d.id!==id)return;window.removeEventListener('message',on);if(d.ok)res(d.json);else rej(new Error('x'));}
        window.addEventListener('message',on);
        window.top.postMessage({type:'pm-hist',id:id,path:path,params:params},'*');
        setTimeout(function(){window.removeEventListener('message',on);rej(new Error('t'));},20000);
      });
    }
    function getJ(path,params){
      var q=[],k,pre;
      if(location.protocol==='about:')return ask(path,params);
      for(k in params)q.push(k+'='+encodeURIComponent(params[k]));
      pre=/^\/api\/v1\//.test(location.pathname)?'/api/v1':'';
      return fetch(pre+path+'?'+q.join('&'),{credentials:'include',headers:{'X-Requested-With':'XMLHttpRequest'}}).then(function(r){if(!r.ok)throw new Error('http');return r.json();});
    }
    function load(){
      if(C.sample){if(C.threshold||C.needLims)lims={'Traffic In':{wh:60,eh:72,wl:null,el:null}};D=build(src&&src.demo?src.demo():sample());draw();return;}
      var id=root.getAttribute('objectid'), now=new Date(), pad=14*3600000, rng=C.range*1000;
      (src?src(getJ,ds(new Date(now.getTime()-rng-pad)),ds(new Date(now.getTime()+pad))):getJ('/api/historicdata.json',{id:id,avg:C.avg,sdate:ds(new Date(now.getTime()-rng-pad)),edate:ds(new Date(now.getTime()+pad)),usecaption:1})).then(function(j){
        var rows=j&&(j.histdata||j.values), last=-1, i, n, keep;
        if(!rows)throw new Error('none');
        for(i=rows.length-1;i>=0;i--){var r=rows[i],k,has=false;for(k in r){if(k!=='datetime'&&k!=='coverage'&&r[k]!==''&&r[k]!==null){has=true;break;}}if(has){last=i;break;}}
        if(last<0){D=null;say('No data yet');return;}
        n=C.points;keep=rows.slice(Math.max(0,last-n+1),last+1);
        D=build(keep);
        if(!D){say('No data yet');return;}
        draw();
        if(C.legendValues||C.threshold||C.needLims)return getJ('/api/table.json',{content:'channels',columns:(C.threshold||C.needLims)?'name,lastvalue,info=treejson':'name,lastvalue',id:id}).then(function(t){
          if(t&&t.channels){lastv={};t.channels.forEach(function(c){
            lastv[c.name]=c.lastvalue;
            var f=c.info&&c.info.data&&c.info.data[0];
            if((C.threshold||C.needLims)&&f&&f.limitmode){var nb=function(v){return (v===''||v==null||isNaN(+v))?null:+v;};lims[c.name]={wh:nb(f.limitmaxwarning),eh:nb(f.limitmaxerror),wl:nb(f.limitminwarning),el:nb(f.limitminerror)};}
          });draw();}
        }).catch(function(){});
      }).catch(function(){fall();});
    }
    function stCol(tl,v,base){if(!tl||v===null)return base;if((tl.eh!==null&&v>=tl.eh)||(tl.el!==null&&v<=tl.el))return C.down;if((tl.wh!==null&&v>=tl.wh)||(tl.wl!==null&&v<=tl.wl))return C.warn;return base;}
    function mixc(a,b,t){var x=String(a).replace('#',''),y=String(b).replace('#',''),o='#',i,v;if(x.length!==6||y.length!==6)return b;for(i=0;i<6;i+=2){v=Math.round(parseInt(x.substr(i,2),16)*(1-t)+parseInt(y.substr(i,2),16)*t);o+=(v<16?'0':'')+v.toString(16);}return o;}
    function stepd(r){return r.map(function(p,i){return i?('H'+p[0].toFixed(1)+'V'+p[1].toFixed(1)):('M'+p[0].toFixed(1)+' '+p[1].toFixed(1));}).join('');}
    function shp(r){return C.step?stepd(r):(C.smooth?curve(r):lin(r));}
    function limOf(nm){var k;if(lims[nm])return lims[nm];for(k in lims){if(nm.indexOf(k+' (')===0)return lims[k];}return null;}
    function draw(){
      if(!D||!document.body.contains(box))return;
      var all=D.s, vis=all.filter(function(q){return !off[q.name];});
      all.forEach(function(q,i){q.col0=C.colors[i%C.colors.length];});
      ALLS=all;
      function cp(q){var o={},k;for(k in q)o[k]=q[k];return o;}
      if(C.mirror)vis=vis.slice(0,2).map(function(q,i){if(i!==1)return q;var o=cp(q);o.raw=q.v;o.v=q.v.map(function(x){return x===null?null:-Math.abs(x);});o.g=0;return o;});
      else if(C.band&&D.rows.length>20){
        var kb=Math.max(2,Math.round(D.rows.length/40)), rows2=[], j0;
        for(j0=0;j0<D.rows.length;j0+=kb)rows2.push(D.rows[j0]);
        vis=vis.map(function(q){var o=cp(q),mv=[],lo=[],hi=[],j,k;
          for(j=0;j<D.rows.length;j+=kb){var sm=0,cn=0,mn=null,mx=null;for(k=j;k<Math.min(D.rows.length,j+kb);k++){var x=q.v[k];if(x===null)continue;sm+=x;cn++;if(mn===null||x<mn)mn=x;if(mx===null||x>mx)mx=x;}mv.push(cn?sm/cn:null);lo.push(mn);hi.push(mx);}
          o.v=mv;o.lo=lo;o.hi=hi;return o;});
        var rows0=D.rows;D.rows=rows2;D.s=vis;
        try{drawInner();}finally{D.s=all;D.rows=rows0;}
        return;
      }
      else if(C.stackA){var acc=[];vis=vis.map(function(q){var o=cp(q);o.raw=q.v;o.g=0;o.v=q.v.map(function(x,j){var b=acc[j]||0, t=b+(x===null?0:Math.max(0,x));acc[j]=t;return (x===null&&!b)?null:t;});return o;}).reverse();}
      D.s=vis;
      try{drawInner();}finally{D.s=all;}
    }
    function special(W,H){
      var q=D.s[0], col=q.col0||C.colors[0], n=q.v.length, i, cur=null, first=null, lo=null, hi=null, tl=limOf(q.name);
      for(i=0;i<n;i++){var x=q.v[i];if(x===null)continue;if(first===null)first=x;cur=x;if(lo===null||x<lo)lo=x;if(hi===null||x>hi)hi=x;}
      if(cur===null)return;
      function tx(x,y,t,a){var e=el('text',a||{},svg);e.setAttribute('x',x);e.setAttribute('y',y);e.textContent=t;return e;}
      function ttl(e,t){var tt=el('title',{},e);tt.textContent=t;}
      if(C.spark){
        var big=lastv[q.name]!=null?String(lastv[q.name]).replace(/<[^>]*>/g,''):fmt(cur), d=cur-first, chg=(first!==null&&d!==0)?(d>0?'\u25B2 ':'\u25BC ')+fmt(Math.abs(d)):'';
        var cw=chg?chg.length*7+14:0, fs=Math.max(12,Math.min(H*0.3,(W-24-cw)/(0.62*Math.max(3,big.length))));   /* 1.14.1: leave room for the change figure */
        tx(12,12+fs*0.85,big,{fill:C.text,'font-size':fs.toFixed(1),'font-weight':600});
        tx(13,12+fs*0.85+16,q.name+' \u00B7 '+(['last 2 hours','last 2 days','last 30 days','last 365 days'][C.period]||''),{fill:C.muted,'font-size':11});
        if(chg)tx(W-12,12+Math.min(fs*0.45,14),chg,{fill:stCol(tl,cur,C.muted),'font-size':12,'text-anchor':'end'});
        var top=Math.min(H-24,12+fs*0.85+26), bot=H-6, pts=[], span=(hi-lo)||1;
        for(i=0;i<n;i++)if(q.v[i]!==null)pts.push([8+(W-16)*i/Math.max(1,n-1),bot-(bot-top)*(q.v[i]-lo)/span]);
        if(pts.length){var ln=lin(pts);el('path',{d:ln+'L'+pts[pts.length-1][0].toFixed(1)+' '+bot+'L'+pts[0][0].toFixed(1)+' '+bot+'Z',fill:col,'fill-opacity':0.14},svg);el('path',{d:ln,fill:'none',stroke:col,'stroke-width':C.lw,'stroke-linejoin':'round'},svg);var lp2=pts[pts.length-1];el('circle',{cx:lp2[0],cy:lp2[1],r:3,fill:stCol(tl,cur,col)},svg);}
        return;
      }
      var stp=(C.avg||(C.heat?3600:900))*1000, end=Date.now(), DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      function tAt(k){return new Date(end-(n-1-k)*stp);}   /* the steps are regular, the last one is the latest */
      if(C.heat){
        var sm=[],cn=[],d1,h1,k;for(d1=0;d1<7;d1++){sm.push([]);cn.push([]);for(h1=0;h1<24;h1++){sm[d1].push(0);cn[d1].push(0);}}
        for(k=0;k<n;k++){var v=q.v[k];if(v===null)continue;var t=tAt(k),dd=(t.getDay()+6)%7,hh=t.getHours();sm[dd][hh]+=v;cn[dd][hh]++;}
        var mn=null,mx2=null;for(d1=0;d1<7;d1++)for(h1=0;h1<24;h1++)if(cn[d1][h1]){var a1=sm[d1][h1]/cn[d1][h1];if(mn===null||a1<mn)mn=a1;if(mx2===null||a1>mx2)mx2=a1;}
        var lw=30, bh=14, cw=(W-lw-4)/24, ch=(H-bh-4)/7, sp=(mx2-mn)||1;
        for(d1=0;d1<7;d1++){
          tx(lw-5,4+d1*ch+ch/2+3.5,DAYS[d1],{fill:C.muted,'font-size':Math.min(10,ch*0.8),'text-anchor':'end'});
          for(h1=0;h1<24;h1++){
            var has=cn[d1][h1]>0, av=has?sm[d1][h1]/cn[d1][h1]:null, f=has?(av-mn)/sp:0;
            var cell=el('rect',{x:(lw+h1*cw).toFixed(1),y:(4+d1*ch).toFixed(1),width:Math.max(1,cw-1.5).toFixed(1),height:Math.max(1,ch-1.5).toFixed(1),rx:Math.min(3,cw/4),fill:has?(tl?stCol(tl,av,mixc(C.card,col,0.15+0.85*f)):mixc(C.card,col,0.12+0.88*f)):mixc(C.card,C.muted,0.08)},svg);
            ttl(cell,DAYS[d1]+' '+h1+':00 \u2013 '+(has?fmt(av):'no data'));
          }
        }
        for(h1=0;h1<24;h1+=6)tx(lw+h1*cw,H-3,h1+':00',{fill:C.muted,'font-size':10});
        return;
      }
      if(C.ring){
        var cx=W/2, cy=H/2, Rr=Math.max(20,Math.min(W,H)/2-16), r0=Rr*0.46, span2=(hi-Math.min(0,lo))||1, base0=Math.min(0,lo), wa=Math.PI*2*stp/86400000*0.86;
        el('circle',{cx:cx,cy:cy,r:r0,fill:'none',stroke:C.grid},svg);el('circle',{cx:cx,cy:cy,r:Rr,fill:'none',stroke:C.grid,'stroke-dasharray':'2 4'},svg);
        for(k=0;k<n;k++){
          var v2=q.v[k];if(v2===null)continue;
          var t2=tAt(k), fr=(t2.getHours()+t2.getMinutes()/60)/24, a0=fr*Math.PI*2-Math.PI/2, a2=a0+wa, rr2=r0+(Rr-r0)*Math.max(0.04,(v2-base0)/span2);
          var P0=[cx+r0*Math.cos(a0),cy+r0*Math.sin(a0)],P1=[cx+rr2*Math.cos(a0),cy+rr2*Math.sin(a0)],P2=[cx+rr2*Math.cos(a2),cy+rr2*Math.sin(a2)],P3=[cx+r0*Math.cos(a2),cy+r0*Math.sin(a2)];
          var wd=el('path',{d:'M'+P0.map(function(z){return z.toFixed(1);}).join(' ')+'L'+P1.map(function(z){return z.toFixed(1);}).join(' ')+'L'+P2.map(function(z){return z.toFixed(1);}).join(' ')+'L'+P3.map(function(z){return z.toFixed(1);}).join(' ')+'Z',fill:stCol(tl,v2,col),'fill-opacity':(k>=n-4)?1:0.85},svg);
          ttl(wd,t2.getHours()+':'+(t2.getMinutes()<10?'0':'')+t2.getMinutes()+' \u2013 '+fmt(v2));
        }
        [['0',0],['6',0.25],['12',0.5],['18',0.75]].forEach(function(z){var a3=z[1]*Math.PI*2-Math.PI/2;tx(cx+(Rr+9)*Math.cos(a3),cy+(Rr+9)*Math.sin(a3)+3.5,z[0],{fill:C.muted,'font-size':10,'text-anchor':'middle'});});
        tx(cx,cy+2,fmt(cur),{fill:C.text,'font-size':Math.max(11,Math.min(22,r0*0.55)).toFixed(1),'font-weight':600,'text-anchor':'middle'});
        tx(cx,cy+Math.max(11,Math.min(22,r0*0.55))*0.75+4,'24 h',{fill:C.muted,'font-size':10,'text-anchor':'middle'});
      }
    }
    function drawInner(){
      var W,H,pl,pr=10,pt=8,pb,iw,ih,min,max,i,j,t,ticks,gx,xs,s,path,area,defs,gid,hx,hit,dots,guide,w0,pts,glowId=null;
      if(!D)return;
      if(box.getAttribute('data-g')!=='ok'){clear(box);wrap=dv('gwrap',box);svg=el('svg',{'class':'gsvg',preserveAspectRatio:'none'});wrap.appendChild(svg);tip=dv('gtip',wrap);tip.style.display='none';leg=dv('glegend',box);box.setAttribute('data-g','ok');}
      var KK=((C.flex&&root.clientWidth&&root.clientHeight)?Math.max(0.2,Math.min(6,Math.min(root.clientWidth/C.flex.w,root.clientHeight/C.flex.h))):1)*(C.ts||1);   /* Flexible: the drawing grows with the object */
      W=Math.max(60,wrap.clientWidth/KK);H=Math.max(50,wrap.clientHeight/KK);
      svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.setAttribute('width',W*KK);svg.setAttribute('height',H*KK);clear(svg);
      if((C.spark||C.heat||C.ring)&&D.s.length){special(W,H);legend(C.spark?[D.s[0]]:null);return;}
      pl=C.axis?44:10;pb=C.axis?22:8;iw=W-pl-pr;ih=H-pt-pb;
      var has1=D.s.some(function(q){return q.g===1;}), max1=0, tk1=[], min1=0, ns, st1, rw1, mg1;
      if(has1)pr=44;iw=W-pl-pr;
      min=0;max=0;
      D.s.forEach(function(q){if(q.g===1){q.v.forEach(function(x){if(x!==null&&x>max1)max1=x;});}else{q.v.forEach(function(x){if(x===null)return;if(x>max)max=x;if(x<min)min=x;});if(q.hi)q.hi.forEach(function(x,k){if(x!==null&&x>max)max=x;var y=q.lo[k];if(y!==null&&y<min)min=y;});}});
      if(C.stack){max=0;D.rows.forEach(function(r0,ri){var t0=0;D.s.forEach(function(q){var x=q.v[ri];if(x!==null&&x>0)t0+=x;});if(t0>max)max=t0;});}
      if(max<=min)max=min+1;
      if(C.mirror){var m2=Math.max(Math.abs(min),Math.abs(max));min=-m2;max=m2;}
      ticks=nice(min,max,Math.max(2,Math.min(5,Math.floor(ih/38))));min=ticks[0];max=ticks[ticks.length-1];
      if(has1){
        ns=ticks.length-1;if(max1<=0)max1=1;rw1=max1/ns;mg1=Math.pow(10,Math.floor(Math.log(rw1)/Math.LN10));rw1/=mg1;st1=(rw1<=1?1:(rw1<=2?2:(rw1<=2.5?2.5:(rw1<=5?5:10))))*mg1;
        for(i=0;i<=ns;i++)tk1.push(+(i*st1).toFixed(10));max1=st1*ns;
      }
      function X(i2){if(C.bars||C.combo)return pl+iw/D.rows.length*(i2+0.5);return pl+(D.rows.length>1?i2*iw/(D.rows.length-1):iw/2);}
      function Y(y,g){return g===1?(pt+ih-(y-min1)/(max1-min1)*ih):(pt+ih-(y-min)/(max-min)*ih);}
      function V(q,x){return Y(x,q.g);}
      defs=el('defs',{},svg);
      ticks.forEach(function(tv){
        var y=Y(tv);
        if(C.gridOn!==false||tv===0)el('line',{x1:pl,x2:W-pr,y1:y,y2:y,stroke:C.grid,'stroke-width':1,'stroke-dasharray':tv===0?'':'3 4'},svg);
        if(C.axis){var tx=el('text',{x:pl-8,y:y+4,'text-anchor':'end',fill:C.muted,'font-size':11},svg);tx.textContent=fmt(C.mirror?Math.abs(tv):tv);}
      });
      if(C.axis&&has1){
        var c1=D.s.filter(function(q){return q.g===1;})[0].col||C.colors[1];
        tk1.forEach(function(tv,ti){var t1=el('text',{x:W-pr+8,y:Y(tv,1)+4,'text-anchor':'start',fill:C.muted,'font-size':11},svg);t1.textContent=fmt(tv);});
      }
      if(C.axis){
        var cnt=Math.max(2,Math.min(5,Math.floor(iw/90)));
        for(i=0;i<cnt;i++){
          j=Math.round(i*(D.rows.length-1)/(cnt-1));
          var lab=String(D.rows[j].datetime||'').split(' - ')[0].replace(/^\d+\/\d+\/\d+\s+/,'').replace(/:\d\d(\s*[AP]M)?$/,'$1').replace(/:00(\s*[AP]M)/,'$1');
          if(C.period>=2)lab=String(D.rows[j].datetime||'').split(' - ')[0].replace(/\s+.*$/,'').replace(/\/\d{4}$/,'');
          var xt=el('text',{x:X(j),y:H-5,'text-anchor':i===0?'start':(i===cnt-1?'end':'middle'),fill:C.muted,'font-size':11},svg);xt.textContent=lab;
        }
      }
      var base=[];
      D.s.forEach(function(q,si){
        var col=q.col0||C.colors[si%C.colors.length], seg='', first=null, lastx=null, runs=[], cur0=null;
        q.col=col;
        if(C.bars||(C.combo&&si===0)){
          var nb=D.rows.length, slot=iw/nb, bw=(C.stack||C.combo)?Math.max(2,slot*0.72):Math.max(2,slot*0.76/D.s.length);
          q.v.forEach(function(x,k2){
            if(x===null)return;
            var cx=pl+slot*(k2+0.5), x0=(C.stack||C.combo)?cx-bw/2:cx-slot*0.38+bw*si, y0, y1, b0;
            if(C.stack){b0=base[k2]||0;y0=Y(b0);y1=Y(b0+Math.max(0,x));base[k2]=b0+Math.max(0,x);}else{y0=Y(0,q.g);y1=Y(x,q.g);}
            el('rect',{x:x0.toFixed(1),y:Math.min(y0,y1).toFixed(1),width:Math.max(1,bw-(bw>6?1.5:0)).toFixed(1),height:Math.max(1,Math.abs(y0-y1)).toFixed(1),rx:Math.min(C.br==null?3:C.br,bw/3),fill:col,'fill-opacity':C.combo?0.6:1},svg);
          });
          return;
        }
        if(C.dotsOnly){var tlD=limOf(q.name);q.v.forEach(function(x,k2){if(x===null)return;el('circle',{cx:X(k2).toFixed(1),cy:Y(x,q.g).toFixed(1),r:D.rows.length>150?2:3,fill:stCol(tlD,x,col),'fill-opacity':0.9},svg);});return;}
        q.v.forEach(function(x,k2){
          if(x===null){cur0=null;return;}
          var pt=[X(k2),Y(x,q.g)];
          if(!cur0){cur0=[];runs.push(cur0);}
          cur0.push(pt);
          if(first===null)first=pt[0];lastx=pt[0];
        });
        seg=runs.map(shp).join('');
        if(q.lo){   /* min / max band */
          var bd='',bu=[],bl=[];q.v.forEach(function(x,k2){if(q.hi[k2]===null)return;bu.push([X(k2),Y(q.hi[k2],q.g)]);bl.unshift([X(k2),Y(q.lo[k2],q.g)]);});
          if(bu.length)el('path',{d:lin(bu)+bl.map(function(p){return 'L'+p[0].toFixed(1)+' '+p[1].toFixed(1);}).join('')+'Z',fill:col,'fill-opacity':0.18,stroke:'none'},svg);
        }
        if(!seg)return;
        /* threshold colours: the line and its fill turn yellow and red past the channel's own limits (a hard-edged vertical gradient) */
        var paint=col, tl=C.threshold?limOf(q.name):null;
        if(tl){
          var tid='gt'+si+'_'+Math.floor(Math.random()*1e6), tg=el('linearGradient',{id:tid,gradientUnits:'userSpaceOnUse',x1:0,x2:0,y1:pt,y2:pt+ih},defs);
          var lo=(q.g===1?min1:min), hi=(q.g===1?max1:max), cut=[tl.eh,tl.wh,tl.wl,tl.el].filter(function(v){return v!==null&&v>lo&&v<hi;}).sort(function(a2,b2){return b2-a2;});
          var cAt=function(v){if((tl.eh!==null&&v>=tl.eh)||(tl.el!==null&&v<=tl.el))return C.down;if((tl.wh!==null&&v>=tl.wh)||(tl.wl!==null&&v<=tl.wl))return C.warn;return col;};
          var edges=[hi].concat(cut).concat([lo]), ofs=function(v){return Math.max(0,Math.min(1,(Y(v,q.g)-pt)/ih));};
          for(var e2=0;e2<edges.length-1;e2++){var cc=cAt((edges[e2]+edges[e2+1])/2);el('stop',{offset:ofs(edges[e2]),'stop-color':cc},tg);el('stop',{offset:ofs(edges[e2+1]),'stop-color':cc},tg);}
          paint='url(#'+tid+')';
          if(si===0)cut.forEach(function(v){var yy=Y(v,q.g);el('line',{x1:pl,x2:W-pr,y1:yy,y2:yy,stroke:cAt(v),'stroke-width':1.6,'stroke-dasharray':'6 4'},svg);});
        }
        if(C.area&&(C.fillAll||si===0||D.s.length<3)){
          var ar='', yb=Y(Math.max(min,0)).toFixed(1);
          runs.forEach(function(r){ar+=shp(r)+'L'+r[r.length-1][0].toFixed(1)+' '+yb+'L'+r[0][0].toFixed(1)+' '+yb+'Z';});
          if(C.solid)el('path',{d:ar,fill:col,'fill-opacity':C.sfo,stroke:'none'},svg);
          else if(tl)el('path',{d:ar,fill:paint,'fill-opacity':Math.max(0.12,C.fa*0.8),stroke:'none'},svg);
          else{
            gid='ga'+si+'_'+Math.floor(Math.random()*1e6);
            var lg=el('linearGradient',{id:gid,x1:0,y1:0,x2:0,y2:1},defs), fo=C.glow?Math.min(0.7,Math.max(0.35,C.fa*1.8)):(si===0?C.fa:C.fa*0.43);
            el('stop',{offset:'0%','stop-color':col,'stop-opacity':fo},lg);el('stop',{offset:'100%','stop-color':col,'stop-opacity':0},lg);
            el('path',{d:ar,fill:'url(#'+gid+')',stroke:'none'},svg);
          }
        }
        if(C.glow&&!glowId){glowId='gg'+Math.floor(Math.random()*1e6);var gf=el('filter',{id:glowId,x:'-10%',y:'-30%',width:'120%',height:'160%'},defs);el('feGaussianBlur',{'in':'SourceGraphic',stdDeviation:2.6,result:'b'},gf);var gm=el('feMerge',{},gf);el('feMergeNode',{'in':'b'},gm);el('feMergeNode',{'in':'SourceGraphic'},gm);}
        var lp={d:seg,fill:'none',stroke:paint,'stroke-width':C.solid?Math.max(1,C.lw*0.65):C.lw,'stroke-linejoin':'round','stroke-linecap':'round'};
        if(C.glow)lp.filter='url(#'+glowId+')';
        el('path',lp,svg);
        if(C.dots&&D.rows.length<=40)runs.forEach(function(r){r.forEach(function(p){el('circle',{cx:p[0],cy:p[1],r:3,fill:C.card,stroke:col,'stroke-width':2},svg);});});
        var li=q.v.length-1;while(li>=0&&q.v[li]===null)li--;
        if(li>=0&&!C.stackA){var ly=Y(q.v[li],q.g), ld={cx:X(li),cy:ly,r:3,fill:col};if(C.glow)ld.filter='url(#'+glowId+')';el('circle',{cx:X(li),cy:ly,r:6,fill:col,'fill-opacity':0.18},svg);el('circle',ld,svg);}
      });
      HV={X:X,Y:Y};
      legend();
      if(C.tips)hover();
    }
    function legend(only){   /* 1.14.1: a sparkline lists only the channel it shows */
      clear(leg);
      (only||ALLS||D.s).forEach(function(q){
        var it=dv('gli'+(off[q.name]?' goff':''),leg), sw=dv('gsw',it), nm=dv('gnm',it), vl=dv('gvl',it), cur=null, k3;
        sw.style.background=q.col0||q.col;nm.textContent=q.name;
        if(!only&&(ALLS||D.s).length>1){
          it.style.cursor='pointer';it.title=off[q.name]?'Show this channel':'Hide this channel';
          it.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();var shown=(ALLS||[]).filter(function(x){return !off[x.name];}).length;if(!off[q.name]&&shown<=1)return;off[q.name]=!off[q.name];draw();});
        }
        for(k3=q.v.length-1;k3>=0;k3--)if(q.v[k3]!==null){cur=q.v[k3];break;}
        vl.textContent=lastv[q.name]!=null?String(lastv[q.name]).replace(/<[^>]*>/g,''):(cur===null?'':fmt(cur));
      });
      if(C.legend===false)leg.style.display='none';
    }
    function hover(){
      var W=parseFloat(svg.getAttribute('width')), H=parseFloat(svg.getAttribute('height')), pl=C.axis?44:10, pr=D.s.some(function(q){return q.g===1;})?44:10, pt=8, pb=C.axis?22:8, iw=W-pl-pr, ih=H-pt-pb, guide, dots, hit;
      var X=HV.X, Y=HV.Y, SS=D.s, RW=D.rows;   /* what was drawn, kept for the mouse: the full list is put back after drawing */
      {
        guide=el('line',{y1:pt,y2:pt+ih,stroke:C.muted,'stroke-width':1,'stroke-opacity':0.5,visibility:'hidden'},svg);
        dots=SS.map(function(q){return el('circle',{r:C.bars?0:4,fill:q.col,stroke:C.card,'stroke-width':2,visibility:'hidden'},svg);});
        hit=el('rect',{x:pl,y:pt,width:iw,height:ih,fill:'transparent'},svg);
        hit.addEventListener('mousemove',function(e){
          var r=svg.getBoundingClientRect(), mxp=(e.clientX-r.left)*(W/r.width), k4=Math.max(0,Math.min(RW.length-1,(C.bars||C.combo)?Math.floor((mxp-pl)/iw*RW.length):Math.round((mxp-pl)/iw*(RW.length-1)))), html='<b>'+String(RW[k4].datetime||'').split(' - ')[0]+'</b>', any=false;
          guide.setAttribute('x1',X(k4));guide.setAttribute('x2',X(k4));guide.setAttribute('visibility','visible');
          SS.forEach(function(q,qi){
            var x=q.v[k4];
            if(x===null){dots[qi].setAttribute('visibility','hidden');return;}
            any=true;dots[qi].setAttribute('cx',X(k4));dots[qi].setAttribute('cy',Y(x,q.g));dots[qi].setAttribute('visibility','visible');
            html+='<div><i style="background:'+q.col+'"></i>'+q.name.replace(/</g,'&lt;')+' <b>'+fmt(q.raw?q.raw[k4]:x)+'</b></div>';
          });
          if(!any){tip.style.display='none';return;}
          tip.innerHTML=html;tip.style.display='block';
          var tw=tip.offsetWidth, tl=X(k4)+12;if(tl+tw>W)tl=X(k4)-tw-12;
          tip.style.left=Math.max(0,tl)+'px';tip.style.top=(pt+6)+'px';
        });
        hit.addEventListener('mouseleave',function(){guide.setAttribute('visibility','hidden');dots.forEach(function(d){d.setAttribute('visibility','hidden');});tip.style.display='none';});
      }
    }
    box.setAttribute('data-g','loading');
    if(typeof ResizeObserver!=='undefined'){
      ro=new ResizeObserver(function(){if(!document.body.contains(box)){stop();return;}if(D&&box.getAttribute('data-g')==='ok')draw();});
      ro.observe(box);
    }
    load();
    if(!C.sample&&C.refresh>0)timer=setInterval(function(){if(!document.body.contains(box)){stop();return;}load();},C.refresh*1000);
  };
