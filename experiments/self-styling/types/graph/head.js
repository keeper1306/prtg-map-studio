  /* ---------- what can be chosen (everything read from a saved setting is checked against these) ---------- */
  var LOOKS=__LOOKS__;
  var LOOKNAMES=__LOOKNAMES__;
  var SETS={
    prtg:['PRTG UI','#B8C419','#F5C500','#E30613','#F59C00','#477EC0','#878787'],
    fresh:['Fresh green','#2FA84F','#F0AD22','#D8402F','#F08A22','#8B93A3','#9AA0AD'],
    vivid:['Vivid','#22C55E','#FACC15','#EF4444','#F97316','#3B82F6','#94A3B8'],
    safe:['Color-blind safe','#009E73','#F0E442','#D55E00','#CC79A7','#56B4E9','#999999'],
    bright:['Bright, for dark cards','#4ADE80','#FBBF24','#F87171','#FB923C','#93C5FD','#9CA3AF']
  };
  var FONTS=[['Roboto','Roboto',1],['Inter','Inter',1],['Open Sans','Open Sans',1],['Lato','Lato',1],['Montserrat','Montserrat',1],
    ['Source Sans 3','Source Sans 3',1],['Segoe UI','Segoe UI',0],['Arial','Arial',0],['Verdana','Verdana',0],['Georgia','Georgia',0],['Consolas','Consolas',0]];
  var CSTYLES=[['area','Line, soft fill'],['smooth','Smooth, soft fill'],['line','Line only'],['bars','Bars'],['stacked','Stacked bars'],
    ['overlap','Overlapping areas'],['stackarea','Stacked area'],['mirror','Mirrored (in / out)'],['threshold','Threshold colours'],['glow','Glow gradient'],
    ['step','Stepped line'],['spark','Sparkline with value'],['combo','Bars + line'],['heatmap','Heatmap: hour by day'],['band','Min / max band'],
    ['dots','Dots'],['ring','24-hour ring']];
  var PERIODS=[['0','2 hours'],['1','2 days'],['2','30 days'],['3','365 days']];
  var TSTYLES=[['bar','Bar'],['heading','Heading'],['divider','Heading with a line'],['accent','Accent mark']];
  var SHADOWS=[['none','None'],['soft','Soft'],['strong','Strong'],['glow','Glow']];
  var OV=[['bg','Card'],['border','Border'],['text','Text'],['muted','Secondary text'],['tbg','Title bar'],['tfg','Title text'],['accent','Accent'],['grid','Grid lines']];
  var DETAILKEYS=['font','size','tsize','radius','shadow','border','ts','talign','ov','lineCols'];

  /* a saved setting is used only if it is one of the known values; anything else is ignored */
  function clean(o){
    var c={}, v;
    if(!o||typeof o!=='object')return c;
    function put(key,val){if(val!==undefined)c[key]=val;}
    put('look',LOOKS.hasOwnProperty(o.look)?o.look:undefined);
    put('set',SETS.hasOwnProperty(o.set)?o.set:undefined);
    put('series',(o.series==='look'||o.series==='status')?o.series:undefined);
    if(o.ov&&typeof o.ov==='object'){v={};OV.forEach(function(s){var h=hex(o.ov[s[0]]);if(h)v[s[0]]=h;});if(Object.keys(v).length)c.ov=v;}
    if(Array.isArray(o.lineCols)){v=o.lineCols.slice(0,5).map(function(x){return hex(x)||'';});if(v.some(Boolean))c.lineCols=v;}
    put('font',has(FONTS,o.font)?o.font:undefined);
    put('size',int(o.size,10,24));put('tsize',int(o.tsize,10,30));put('radius',int(o.radius,0,24));
    put('lw',int(o.lw,1,6));put('fillA',int(o.fillA,0,80));put('bradius',int(o.bradius,0,12));put('maxCh',int(o.maxCh,1,10));
    put('shadow',has(SHADOWS,o.shadow)?o.shadow:undefined);
    put('ts',has(TSTYLES,o.ts)?o.ts:undefined);
    put('talign',(o.talign==='left'||o.talign==='center'||o.talign==='right')?o.talign:undefined);
    put('cstyle',has(CSTYLES,o.cstyle)?o.cstyle:undefined);
    put('period',has(PERIODS,String(o.period))?String(o.period):undefined);
    put('fw',int(o.fw,60,6000));put('fh',int(o.fh,40,6000));
    ['border','showTitle','legend','axis','gridOn','dots','legendValues','publicGear','flex'].forEach(function(b){put(b,bool(o[b]));});
    put('title',txt(o.title,80));
    v=txt(o.names,200);if(v!==undefined)put('names',v.replace(/["]/g,'').trim());
    return c;
  }
  function lookDef(n){
    var L=LOOKS[n]||LOOKS['Corporate blue'];
    return {font:L.font,size:L.size,tsize:L.tsize,radius:L.radius,shadow:L.shadow,border:L.bw>0,ts:L.ts,talign:'left'};
  }
  var BASE={look:'Corporate blue',set:'prtg',series:'look',showTitle:true,title:'',publicGear:false,
    cstyle:'area',period:'0',flex:false,names:'',maxCh:3,lw:2,fillA:28,bradius:3,dots:false,gridOn:true,axis:true,legend:true,legendValues:true};
  function eff(d){var look=(d&&d.look)||BASE.look;return mix(BASE,lookDef(look),d);}


  function hexRgb(h){h=String(h).replace('#','');return [parseInt(h.substr(0,2),16)||0,parseInt(h.substr(2,2),16)||0,parseInt(h.substr(4,2),16)||0];}
  function blend(a,b,t){var x=hexRgb(a), y=hexRgb(b);return '#'+x.map(function(v,i){var n=Math.round(v+(y[i]-v)*t);return (n<16?'0':'')+n.toString(16);}).join('');}
  function cardOf(L,ov){return L.card?(ov.bg||L.bg):'#FFFFFF';}
  function gridOf(L,ov){return ov.grid||blend(cardOf(L,ov),ov.text||L.text,0.16);}
  /* the lines' colours, as Map Studio picks them: the accent first, then colours far enough apart; or the status colours */
  function seriesColors(c){
    var L=LOOKS[c.look]||LOOKS['Corporate blue'], ov=c.ov||{}, S=SETS[c.set]||SETS.prtg, out, own=c.lineCols||[];
    if(c.series==='status')out=[S[5],S[1],S[2],S[4],S[3],S[6]];
    else{
      out=[ov.accent||L.accent];
      [S[2],'#8B5CF6','#EC4899',S[1],'#06B6D4'].forEach(function(x){
        var a=hexRgb(x), ok=out.every(function(o){var b=hexRgb(o);return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])>150;});
        if(ok)out.push(x);
      });
    }
    return out.map(function(x,i){return own[i]||x;});
  }

  /* ---------- the look, and the graph drawn again when what it shows changes ---------- */
  var lastGC='';
  function graphCfg(c){
    var L=LOOKS[c.look]||LOOKS['Corporate blue'], ov=c.ov||{}, S=SETS[c.set]||SETS.prtg, per=parseInt(c.period,10)||0, cs=c.cstyle;
    var spec=[{range:7200,avg:0,points:120,refresh:60},{range:172800,avg:300,points:576,refresh:300},{range:2592000,avg:3600,points:720,refresh:900},{range:31536000,avg:86400,points:365,refresh:3600}][per];
    if(cs==='heatmap')spec=(per>=2)?{range:2592000,avg:3600,points:720,refresh:900}:{range:604800,avg:3600,points:168,refresh:900};
    else if(cs==='ring')spec={range:86400,avg:900,points:96,refresh:300};
    var card=cardOf(L,ov), text=ov.text||L.text;
    return {range:spec.range,avg:spec.avg,points:spec.points,refresh:spec.refresh,period:per,text:text,
      step:cs==='step',spark:cs==='spark',combo:cs==='combo',heat:cs==='heatmap',band:cs==='band',dotsOnly:cs==='dots',ring:cs==='ring',
      needLims:(cs==='dots'||cs==='ring'||cs==='heatmap'||cs==='spark'),axis:!!c.axis,legend:!!c.legend,tips:!(cs==='spark'||cs==='heatmap'||cs==='ring'),
      area:['area','smooth','step','overlap','stackarea','mirror','threshold','glow'].indexOf(cs)>=0,smooth:(cs==='smooth'||cs==='glow'),
      fillAll:(cs==='overlap'||cs==='stackarea'||cs==='mirror'),solid:(cs==='overlap'||cs==='stackarea'||cs==='mirror'),
      sfo:(cs==='stackarea'?0.88:(cs==='mirror'?0.62:0.5)),stackA:cs==='stackarea',mirror:cs==='mirror',threshold:cs==='threshold',glow:cs==='glow',
      warn:S[2],down:S[3],bars:(cs==='bars'||cs==='stacked'),stack:cs==='stacked',dots:!!c.dots,lw:c.lw,fa:c.fillA/100,gridOn:!!c.gridOn,br:c.bradius,
      max:c.maxCh,names:c.names||'',legendValues:!!c.legendValues,grid:gridOf(L,ov),muted:ov.muted||L.muted,card:card,colors:seriesColors(c),
      ts:c.size/13,flex:(c.flex&&c.fw&&c.fh)?{w:c.fw,h:c.fh}:null};
  }
  function redraw(gc){
    var old=root.querySelector('.gown');if(!old)return;
    var box=document.createElement('div');box.className='gown';box.setAttribute('data-g','loading');
    old.parentNode.replaceChild(box,old);   /* the old drawing stops by itself once its box is gone */
    if(inPreview())gc=mix(gc,{refresh:0});
    var t=root.querySelector('template.gfall');   /* where PRTG draws the picture instead (a public link), ask it for the chosen time span */
    if(t){if(t.__orig==null)t.__orig=t.innerHTML;t.innerHTML=t.__orig.replace(/(graphid(?:=|%3D|["']?\s*[:=]\s*["']?))\d/gi,'$1'+gc.period);}
    graphRuntime(root,gc);
  }
  function apply(d){
    var c=eff(clean(d)), L=LOOKS[c.look]||LOOKS['Corporate blue'], ov=c.ov||{}, st=root.style, cls=root.classList, acc=ov.accent||L.accent;
    function v(n,val){st.setProperty(n,val);}
    loadFont(c.font);
    v('--ms-font',fontStack(c.font));v('--ms-size',c.size+'px');v('--ms-small',Math.max(9,Math.round(c.size*12/13))+'px');
    v('--ms-tsize',c.tsize+'px');v('--ms-radius',c.radius+'px');v('--ms-talign',c.talign);
    v('--c-card',L.card?(ov.bg||L.bg):'transparent');v('--c-border',L.card&&c.border?(ov.border||L.border):'transparent');v('--ms-bw',L.card&&c.border?'1px':'0px');
    v('--ms-shadow',L.card?shadowCss(c.shadow,acc):'none');
    v('--c-text',ov.text||L.text);v('--c-muted',ov.muted||L.muted);v('--c-tbg',ov.tbg||L.tbg);v('--c-tfg',ov.tfg||L.tfg);v('--c-accent',acc);
    v('--c-tipbg',cardOf(L,ov));
    TSTYLES.forEach(function(t){cls.toggle('mst-t-'+t[0],c.ts===t[0]);});
    cls.toggle('mst-notitle',!c.showTitle);cls.toggle('mst-tt',!!c.title);
    if(c.title)v('--ms-tt',cssStr(c.title));else st.removeProperty('--ms-tt');
    flexOn(c.flex&&c.fw&&c.fh?c:null);
    var gc=graphCfg(c), sgc=JSON.stringify(gc);
    if(sgc!==lastGC){lastGC=sgc;redraw(gc);}
  }
  /* Flexible: text and drawing grow and shrink with the box; the size it had when Flexible was chosen counts as normal */
  var FX=null;
  function flexOn(c){
    if(!c){if(FX){FX.ro&&FX.ro.disconnect();FX=null;}root.style.removeProperty('--mss');return;}
    if(!FX){FX={};FX.ro=window.ResizeObserver?new ResizeObserver(function(){fit();}):null;if(FX.ro)FX.ro.observe(root);}
    FX.w=c.fw;FX.h=c.fh;fit();
    function fit(){if(!FX)return;var w=root.clientWidth, h=root.clientHeight;if(!w||!h)return;
      root.style.setProperty('--mss',Math.max(0.2,Math.min(6,Math.min(w/FX.w,h/FX.h))).toFixed(4));}
  }
  /* the sensor's channels, for the Channels menu */
  function channels(){
    var id=root.getAttribute('objectid');
    return fetch('/api/table.json?content=channels&columns=name&count=*&id='+encodeURIComponent(id),{credentials:'same-origin',headers:{'X-Requested-With':'XMLHttpRequest'}})
      .then(function(r){if(!r.ok)throw 0;return r.json();})
      .then(function(j){var o=[];(j.channels||[]).forEach(function(c){var n=String(c.name_raw||c.name||'').replace(/<[^>]*>/g,'').trim();if(n&&o.indexOf(n)<0)o.push(n);});return o;})
      .catch(function(){return [];});
  }


