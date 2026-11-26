  /* ---------- Map Studio's own builder, run on the map ----------
     The object file is Map Studio's own file for the default settings (that is also what PRTG shows without a script).
     A change builds the file again with Map Studio's own code (copied into this script) and takes from it what can change on
     the map: the CSS, the classes on the object, the title, and the settings its drawing code runs with. */
  var KSETS=__PMS.sets;   /* the status colour sets, as Map Studio's Colors menu has them */
  var COMMONKEYS=['look','set','font','size','tsize','radius','shadow','border','ts','talign','ov','showTitle','title','flex','fw','fh','tflex','publicGear'];
  var KOV=[['text','Text'],['muted','Labels and captions'],['cardBg','Fill'],['border','Border'],['titleBg','Title bar'],['titleColor','Title bar text'],
    ['titleText','Title text'],['accent','Accent']];
  var KTS=[['bar','Bar'],['heading','Heading'],['divider','Heading with a line'],['accent','Accent mark']];
  var KSHADOWS=[['none','None'],['soft','Soft'],['strong','Strong'],['glow','Glow']];
  /* the fonts Map Studio offers: Google fonts by name, the system ones by Map Studio's own keys */
  var FONTS=[['Roboto','Roboto',1],['Inter','Inter',1],['Open Sans','Open Sans',1],['Lato','Lato',1],['Montserrat','Montserrat',1],
    ['Source Sans 3','Source Sans 3',1],['__system__','Segoe UI',0],['__arial__','Arial',0],['__verdana__','Verdana',0],['__georgia__','Georgia',0],
    ['__tahoma__','Tahoma',0],['Roboto Mono','Roboto Mono',1]];

  /* a saved setting is used only if it is one of the known values; anything else is ignored */
  function cleanSpec(o,c){
    Object.keys(SPEC).forEach(function(k){
      var s=SPEC[k], v=o[k], r;
      if(s[0]==='enum')r=(s[1].indexOf(v)>=0)?v:undefined;
      else if(s[0]==='int')r=int(v,s[1],s[2]);
      else if(s[0]==='bool')r=bool(v);
      else if(s[0]==='text'){r=txt(v,s[1]);if(r!==undefined)r=r.replace(/["]/g,'').trim();}
      else if(s[0]==='list'){if(Array.isArray(v)){r=[];v.forEach(function(x){if(s[1].indexOf(x)>=0&&r.indexOf(x)<0)r.push(x);});if(!r.length&&!s[2])r=undefined;}}
      else if(s[0]==='hex')r=hex(v);
      if(r!==undefined)c[k]=r;
    });
    return c;
  }
  function clean(o){
    var c={}, v;
    if(!o||typeof o!=='object')return c;
    function put(key,val){if(val!==undefined)c[key]=val;}
    put('look',LOOKNAMES.indexOf(o.look)>=0?o.look:undefined);
    put('set',has(KSETS,o.set)?o.set:undefined);
    put('font',has(FONTS,o.font)?o.font:undefined);
    put('size',int(o.size,8,40));put('tsize',int(o.tsize,8,60));put('radius',int(o.radius,0,40));
    put('shadow',has(KSHADOWS,o.shadow)?o.shadow:undefined);
    put('ts',has(KTS,o.ts)?o.ts:undefined);
    put('talign',(o.talign===''||o.talign==='left'||o.talign==='center'||o.talign==='right')?o.talign:undefined);
    if(o.ov&&typeof o.ov==='object'){v={};KOV.forEach(function(s){var h=hex(o.ov[s[0]]);if(h)v[s[0]]=h;});if(Object.keys(v).length)c.ov=v;}
    ['border','showTitle','flex','tflex','publicGear'].forEach(function(b){put(b,bool(o[b]));});
    put('fw',int(o.fw,40,6000));put('fh',int(o.fh,30,6000));
    v=txt(o.title,80);if(v!==undefined)put('title',v.replace(/["]/g,'').trim());
    return cleanSpec(o,c);
  }
  /* the settings in force: the defaults of Map Studio's own file, then what was chosen */
  function lookBase(name){var L=name?lookOf(name):JSON.parse(JSON.stringify(M0.look));if(name)L.c=JSON.parse(JSON.stringify(M0.look.c||L.c));return L;}
  function setOfC(c){var k='';KSETS.forEach(function(s){if(JSON.stringify(s[2])===JSON.stringify({up:c.up,warning:c.warning,down:c.down,unusual:c.unusual,paused:c.paused,unknown:c.unknown}))k=s[0];});return k;}
  function eff(d){
    d=d||{};
    var L=lookBase(d.look), b={look:d.look||M0.look.name||'',set:setOfC(L.c||{})||'prtg',font:L.font,size:L.size,tsize:L.titleSize,radius:L.radius,
      shadow:(L.shadow===true?'soft':(L.shadow||'none')),border:L.bw>0,ts:L.titleStyle,talign:L.align||'',showTitle:M0.titleMode!=='none',title:'',
      flex:!!M0.fit,fw:M0.fitW,fh:M0.fitH,tflex:!!M0.titleFlex,publicGear:false};
    Object.keys(SPEC).forEach(function(k){b[k]=(k in M0)?M0[k]:SPEC[k][3];});
    return mix(b,d);
  }
  function modelOf(c){
    var m=JSON.parse(JSON.stringify(M0)), L=lookBase(c.look), ov=c.ov||{}, S=null;
    KSETS.forEach(function(s){if(s[0]===c.set)S=s[2];});
    if(S)L.c=mix(L.c,S);
    if(L.mode!=='prtg'){
      L.mode='custom';L.font=c.font;L.size=c.size;L.titleSize=c.tsize;L.radius=c.radius;L.shadow=c.shadow;
      L.bw=c.border?(L.bw>0?L.bw:1):0;L.titleStyle=c.ts;L.align=c.talign;
      KOV.forEach(function(o){if(ov[o[0]]){L[o[0]]=ov[o[0]];if(o[0]==='cardBg'||o[0]==='border')L.card=true;}});
    }
    m.look=L;
    if(!c.showTitle)m.titleMode='none';else if(c.title){m.titleMode='custom';m.title=c.title;}else if(m.titleMode==='none')m.titleMode='object';
    Object.keys(SPEC).forEach(function(k){if(c[k]!==undefined)m[k]=c[k];});
    if(c.flex&&c.fw&&c.fh){m.fit=true;m.initW=m.fitW=c.fw;m.initH=m.fitH=c.fh;m.titleFlex=!!c.tflex;}
    else{m.fit=false;}
    if(typeof modelTweak==='function')modelTweak(m,c);
    return m;
  }

  /* ---------- what a built file changes on the map ---------- */
  var OBS=[];   /* the watchers the drawing code started, switched off before it runs again */
  function tracked(fn){
    var MO=window.MutationObserver, RO=window.ResizeObserver;
    function wrap(B){if(!B)return B;return function(cb){var o=new B(cb);OBS.push(o);return o;};}
    window.MutationObserver=wrap(MO);window.ResizeObserver=wrap(RO);
    try{fn();}catch(e){if(window.console)console.warn('Map Studio test object:',e);}
    finally{window.MutationObserver=MO;window.ResizeObserver=RO;}
  }
  function untrack(){OBS.forEach(function(o){try{o.disconnect();}catch(e){}});OBS=[];}
  function noTags(s){return String(s).replace(/<#[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
  function partsOf(t){
    var p={css:[],links:[],scripts:[],cls:[]}, m, re=/<style>([\s\S]*?)<\/style>/g;
    while((m=re.exec(t)))p.css.push(m[1]);
    re=/<link href="([^"]+)" rel="stylesheet">/g;while((m=re.exec(t)))p.links.push(m[1].replace(/&amp;/g,'&'));
    re=/<script>([\s\S]*?)<\/script>/g;while((m=re.exec(t)))p.scripts.push(m[1]);
    m=/<div class="(map_object[^"]*?)"\s+id=/.exec(t.replace(/<@\w+>/g,'@').replace(/<#[^>]*>/g,''));if(m)p.cls=noTags(m[1]).split(' ').filter(Boolean);
    return p;
  }
  /* each script in a Map Studio file calls one drawing function with its settings: find which, and with what */
  function jobsOf(scripts){
    var out=[];
    scripts.forEach(function(s){
      /* the settings are one line of JSON, or several (Map Studio writes machine state's as pretty JSON, to keep lines short) */
      var f=/\(function (\w+)\(root,C\)\{/.exec(s), c=/\n\s*var CFG=(\{[\s\S]*?\});\n\s*\(function \w+\(root,C\)\{/.exec(s), x=/\n\s*var C=\{w:(\d+),h:(\d+),tf:(\d)\};/.exec(s);
      if(x)out.push(['flexRuntime',{w:+x[1],h:+x[2],tf:+x[3]}]);
      else if(f&&c&&RT[f[1]]){try{out.push([f[1],JSON.parse(c[1])]);}catch(e){}}
    });
    return out;
  }
  var KL={css:null,cls:BASECLS.slice(),jobs:null};
  function kitApply(m){
    var t, p, st, r=root;
    try{t=flexAppend(BUILD(m));}catch(e){if(window.console)console.warn('Map Studio test object:',e);return;}
    p=partsOf(t);
    st=r.querySelector('style.mss-css');
    var css=p.css.join('\n');
    if(st&&css!==KL.css){st.textContent=css;KL.css=css;}
    p.links.forEach(loadFontHref);
    /* classes: what the new file has and the last one had not, and the other way round (PRTG's own classes stay) */
    KL.cls.forEach(function(k){if(p.cls.indexOf(k)<0)r.classList.remove(k);});
    p.cls.forEach(function(k){if(!r.classList.contains(k))r.classList.add(k);});
    KL.cls=p.cls;
    titleApply(m);
    if(typeof markupApply==='function')markupApply(m,t);
    var jobs=jobsOf(p.scripts), sj=JSON.stringify(jobs);
    if(sj!==KL.jobs){
      KL.jobs=sj;untrack();
      Object.keys(r).forEach(function(k){if(/^__ms/.test(k)&&k!=='__mst')delete r[k];});
      r.style.removeProperty('--mss');r.removeAttribute('data-scale');
      jobs.forEach(function(j){tracked(function(){RT[j[0]](r,j[1]);});});
    }
  }
  /* the title: hidden, PRTG's own (the object's name), or a text of its own */
  function titleApply(m){
    var t=root.querySelector('.gtitle');if(!t)return;
    t.style.display=(m.titleMode==='none')?'none':'';
    var b=t.querySelector('b')||t;
    if(b.__orig==null)b.__orig=b.innerHTML;
    if(m.titleMode==='custom')b.textContent=m.title;else if(b.innerHTML!==b.__orig)b.innerHTML=b.__orig;
  }
  /* PRTG's hover preview gives the object a width but no height; objects whose drawing fills the box (status counts, and Map
     Studio's own too) then collapse to 0 px. In the preview only, such an object gets its normal height, scaled to the width. */
  function previewHeight(){
    if(!inPreview()||root.offsetHeight>0)return;
    var iw=parseInt(root.getAttribute('initialwidth'),10)||parseInt(M0.initW,10)||0, ih=parseInt(root.getAttribute('initialheight'),10)||parseInt(M0.initH,10)||0;
    if(!(iw>0&&ih>0))return;
    root.style.height=Math.round(ih*(root.offsetWidth||iw)/iw)+'px';
  }
  function apply(d){kitApply(modelOf(eff(clean(d))));previewHeight();}

