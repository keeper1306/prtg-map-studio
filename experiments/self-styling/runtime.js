(function(){
  var root=document.getElementById("__ITEMID__");
  if(!root||root.__mst)return;
  root.__mst=1;
  var SUB=root.getAttribute('subid')||'';

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
  var STKEYS=[['up','Up'],['warn','Warning'],['down','Down'],['unusual','Unusual'],['paused','Paused'],['unknown','Unknown']];
  var FONTS=[['Roboto','Roboto',1],['Inter','Inter',1],['Open Sans','Open Sans',1],['Lato','Lato',1],['Montserrat','Montserrat',1],
    ['Source Sans 3','Source Sans 3',1],['Segoe UI','Segoe UI',0],['Arial','Arial',0],['Verdana','Verdana',0],['Georgia','Georgia',0],['Consolas','Consolas',0]];
  var COLS=[['status','Status'],['sensor','Sensor'],['device','Device'],['probegroupdevice','Probe / group / device'],['group','Group'],
    ['message','Message'],['lastvalue','Last value'],['minigraph','Mini graph'],['priority','Priority'],['favorite','Favorite'],
    ['downtimesince','Down since'],['uptime','Uptime']];
  var SORTS=[['status','Status'],['sensor','Sensor'],['device','Device'],['probegroupdevice','Probe / group / device'],['priority','Priority'],
    ['lastvalue','Last value'],['downtimesince','Down since'],['uptime','Uptime']];
  var STATUSDEF=[['up','Up',['3']],['warning','Warning',['4']],['down','Down',['5']],['downack','Down (acknowledged)',['13']],
    ['downpartial','Down (partial)',['14']],['unusual','Unusual',['10']],['paused','Paused',['7','8','9','12']],['unknown','Unknown',['1','2','0']]];
  var STROWS={up:['sg'],warning:['sy'],down:['sr'],downack:['sr'],downpartial:['sr'],unusual:['so'],paused:['sb'],unknown:['sx']};
  var SHAPES=[['dot','Dot'],['dottext','Dot and word'],['pill','Pill'],['square','Square'],['diamond','Diamond'],['ring','Ring'],
    ['bar','Bar'],['rowbar','Stripe on the row'],['text','Coloured word']];
  var TSTYLES=[['bar','Bar'],['heading','Heading'],['divider','Heading with a line'],['accent','Accent mark']];
  var HSTYLES=[['fill','Filled'],['line','Underlined'],['plain','Plain']];
  var SHADOWS=[['none','None'],['soft','Soft'],['strong','Strong'],['glow','Glow']];
  var OV=[['bg','Card'],['border','Border'],['text','Text'],['muted','Secondary text'],['link','Links'],['tbg','Title bar'],['tfg','Title text'],
    ['hfg','Header text'],['hbg','Header fill'],['accent','Accent'],['stripe','Stripe'],['line','Row lines'],['hover','Row hover']];
  var FILE={cols:['status','device','sensor','group','message','lastvalue','minigraph','downtimesince','uptime'],sortBy:'status',sortDir:'asc',
    count:10,statuses:[],mapTags:true,reqTag:'',nameHas:'',onlyValue:false,onlyFav:false,links:true,sortable:true,infoheader:true};
  var DATAKEYS=['cols','sortBy','sortDir','count','statuses','mapTags','reqTag','nameHas','onlyValue','onlyFav','links','sortable','infoheader'];
  var DETAILKEYS=['font','size','tsize','pad','cellx','radius','dot','shadow','border','ts','talign','hs','caps','head','status','tint','stripes','lines','hover','ov'];

  function keysOf(list){return list.map(function(x){return x[0];});}
  function has(list,v){return keysOf(list).indexOf(v)>=0;}
  function hex(v){return (typeof v==='string'&&/^#[0-9a-fA-F]{6}$/.test(v))?v:undefined;}
  function int(v,lo,hi){var n=parseInt(v,10);return (isNaN(n)||n<lo||n>hi)?undefined:n;}
  function bool(v){return typeof v==='boolean'?v:undefined;}
  function txt(v,max){if(typeof v!=='string')return undefined;return v.replace(/[\u0000-\u001F\u007F<>\\]/g,'').slice(0,max);}
  /* a saved setting is used only if it is one of the known values; anything else is ignored */
  function clean(o){
    var c={}, v, k;
    if(!o||typeof o!=='object')return c;
    function put(key,val){if(val!==undefined)c[key]=val;}
    put('look',LOOKS.hasOwnProperty(o.look)?o.look:undefined);
    put('set',(SETS.hasOwnProperty(o.set)||o.set==='own')?o.set:undefined);
    if(o.own&&typeof o.own==='object'){v={};STKEYS.forEach(function(s){var h=hex(o.own[s[0]]);if(h)v[s[0]]=h;});if(Object.keys(v).length)c.own=v;}
    if(o.ov&&typeof o.ov==='object'){v={};OV.forEach(function(s){var h=hex(o.ov[s[0]]);if(h)v[s[0]]=h;});if(Object.keys(v).length)c.ov=v;}
    put('font',has(FONTS,o.font)?o.font:undefined);
    put('size',int(o.size,10,24));put('tsize',int(o.tsize,10,30));put('pad',int(o.pad,2,20));put('cellx',int(o.cellx,4,28));
    put('radius',int(o.radius,0,24));put('dot',int(o.dot,6,20));put('count',int(o.count,0,500));
    put('shadow',has(SHADOWS,o.shadow)?o.shadow:undefined);
    put('ts',has(TSTYLES,o.ts)?o.ts:undefined);put('hs',has(HSTYLES,o.hs)?o.hs:undefined);
    put('talign',(o.talign==='left'||o.talign==='center'||o.talign==='right')?o.talign:undefined);
    put('status',has(SHAPES,o.status)?o.status:undefined);
    put('sortBy',has(SORTS,o.sortBy)?o.sortBy:undefined);
    put('sortDir',(o.sortDir==='asc'||o.sortDir==='desc')?o.sortDir:undefined);
    ['border','showTitle','caps','head','tint','stripes','lines','hover','mapTags','onlyValue','onlyFav','links','sortable','infoheader','publicGear'].forEach(function(b){put(b,bool(o[b]));});
    put('title',txt(o.title,80));
    v=txt(o.nameHas,40);if(v!==undefined)put('nameHas',v.replace(/["()]/g,'').trim());
    if(typeof o.reqTag==='string'){
      v=o.reqTag.split(/[\s,]+/).filter(function(t){return /^[\w.\-:]{1,40}$/.test(t);}).slice(0,10);
      c.reqTag=v.join(' ');
    }
    if(Array.isArray(o.cols)){v=[];o.cols.forEach(function(x){if(has(COLS,x)&&v.indexOf(x)<0)v.push(x);});if(v.length)c.cols=v;}
    if(Array.isArray(o.statuses)){v=[];o.statuses.forEach(function(x){if(has(STATUSDEF,x)&&v.indexOf(x)<0)v.push(x);});c.statuses=v;}
    if(Array.isArray(o.hide)&&!c.cols){   /* a setting saved by the first test file: hidden columns */
      v=FILE.cols.filter(function(x){return o.hide.indexOf(x)<0;});if(v.length)c.cols=v;
    }
    for(k in c){if(c[k]===undefined)delete c[k];}
    return c;
  }
  function lookDef(n){
    var L=LOOKS[n]||LOOKS['Corporate blue'];
    return {font:L.font,size:L.size,tsize:L.tsize,pad:L.pad,cellx:L.cellx,radius:L.radius,dot:L.dot,shadow:L.shadow,border:L.bw>0,
      ts:L.ts,talign:'left',hs:L.hs,caps:L.caps,head:true,status:L.status==='pill'?'pill':'dot',tint:true,stripes:false,lines:true,hover:true};
  }
  var BASE={look:'Corporate blue',set:'prtg',showTitle:true,title:'',publicGear:false};
  function eff(d){var look=(d&&d.look)||BASE.look;return mix(BASE,lookDef(look),FILE,d);}

  function mix(){var o={},i,k,a;for(i=0;i<arguments.length;i++){a=arguments[i];if(a)for(k in a)if(Object.prototype.hasOwnProperty.call(a,k))o[k]=a[k];}return o;}
  function inPreview(){return !!(root.closest&&root.closest('.previewloading'));}
  function inDesigner(){return /mapdesigner|mapeditor/i.test(location.pathname)||!!(root.closest&&root.closest('#mapeditor'));}
  function isPublic(){try{if(/\/public\//i.test(window.top.location.pathname))return true;}catch(e){return true;}return /\/public\//i.test(location.pathname);}
  function mapId(){
    var hrefs=[location.href],m,i;
    try{hrefs.push(window.parent.location.href);}catch(e){}
    try{hrefs.push(window.top.location.href);}catch(e){}
    for(i=0;i<hrefs.length;i++){m=/[?&]id=(\d+)/.exec(hrefs[i])||/\/maps\/(\d+)/.exec(hrefs[i]);if(m)return m[1];}
    return '';
  }
  var MAP=mapId(), KEY='mst.'+MAP+'.'+SUB;
  var REG;try{REG=window.top.__mstReg||(window.top.__mstReg={});}catch(e){REG=window.__mstReg||(window.__mstReg={});}
  var R=REG[KEY]||(REG[KEY]={open:false,draft:null,cache:{}});
  if(!R.cache)R.cache={};

  function readShared(){
    var el=root.querySelector('.mst-cfg'), c;
    if(!el)return {};
    try{c=JSON.parse(decodeURIComponent((el.getAttribute('data-c')||'').replace(/\s+/g,'')));}catch(e){return {};}
    return clean(c);
  }
  function readLocal(){try{var v=localStorage.getItem(KEY);return v?clean(JSON.parse(v)):null;}catch(e){return null;}}
  function writeLocal(c){try{if(c)localStorage.setItem(KEY,JSON.stringify(clean(c)));else localStorage.removeItem(KEY);return true;}catch(e){return false;}}
  /* what this screen shows: the shared look, then this browser's own (its sharing choice never overrides the shared one) */
  function savedRaw(){var s=readShared(), l=readLocal();if(l){delete l.publicGear;}return mix(s,l);}
  function cssStr(s){return '"'+String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/[\r\n]+/g,' ')+'"';}
  function fontStack(f){return '"'+f+'","Segoe UI",Roboto,Arial,sans-serif';}
  function loadFont(f){
    var F=null;FONTS.forEach(function(x){if(x[0]===f)F=x;});
    if(!F||!F[2]||f==='Roboto')return;
    var id='mst-font-'+f.replace(/\W+/g,'-');
    if(document.getElementById(id))return;
    var l=document.createElement('link');l.id=id;l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(f).replace(/%20/g,'+')+':wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
  }
  function shadowCss(s,acc){
    if(s==='soft')return '0 1px 3px rgba(15,23,42,.12),0 4px 12px rgba(15,23,42,.06)';
    if(s==='strong')return '0 10px 28px rgba(0,0,0,.35)';
    if(s==='glow')return '0 0 0 1px color-mix(in srgb,'+acc+' 35%,transparent),0 8px 26px color-mix(in srgb,'+acc+' 20%,transparent)';
    return 'none';
  }

  /* ---------- the look ---------- */
  function apply(d){
    var c=eff(clean(d)), L=LOOKS[c.look]||LOOKS['Corporate blue'], ov=c.ov||{}, st=root.style, S=SETS[c.set]||SETS.prtg, own=c.own||{};
    var acc=ov.accent||L.accent, cls=root.classList, k;
    function v(n,val){st.setProperty(n,val);}
    loadFont(c.font);
    v('--ms-font',fontStack(c.font));v('--ms-size',c.size+'px');v('--ms-head',Math.max(9,Math.round(c.size*10/13))+'px');
    v('--ms-tsize',c.tsize+'px');v('--ms-pad',c.pad+'px');v('--ms-cellx',c.cellx+'px');v('--ms-radius',c.radius+'px');v('--ms-dot',c.dot+'px');
    v('--ms-talign',c.talign);
    var card=L.card?(ov.bg||L.bg):'transparent';
    v('--c-card',card);v('--c-border',L.card&&c.border?(ov.border||L.border):'transparent');v('--ms-bw',L.card&&c.border?'1px':'0px');
    v('--ms-shadow',L.card?shadowCss(c.shadow,acc):'none');
    v('--c-text',ov.text||L.text);v('--c-muted',ov.muted||L.muted);v('--c-link',ov.link||L.link);v('--c-line',ov.line||L.line);
    v('--c-rline',c.lines?(ov.line||L.line):'transparent');v('--c-hover',c.hover?(ov.hover||L.hover):'transparent');
    v('--c-tbg',ov.tbg||L.tbg);v('--c-tfg',ov.tfg||L.tfg);v('--c-hfg',ov.hfg||L.hfg);v('--c-hbg',ov.hbg||L.hbg);v('--c-accent',acc);
    v('--c-stripe',c.stripes?(ov.stripe||L.zebra||'color-mix(in srgb,'+(ov.text||L.text)+' 5%,'+(L.card?(ov.bg||L.bg):'transparent')+')'):'transparent');
    v('--s-up',own.up||S[1]);v('--s-warn',own.warn||S[2]);v('--s-down',own.down||S[3]);
    v('--s-unusual',own.unusual||S[4]);v('--s-paused',own.paused||S[5]);v('--s-unknown',own.unknown||S[6]);
    TSTYLES.forEach(function(t){cls.toggle('mst-t-'+t[0],c.ts===t[0]);});
    HSTYLES.forEach(function(t){cls.toggle('mst-h-'+t[0],c.hs===t[0]);});
    SHAPES.forEach(function(t){cls.toggle('mst-st-'+t[0],c.status===t[0]);});
    cls.toggle('mst-hcaps',!!c.caps);cls.toggle('mst-nohead',!c.head);cls.toggle('mst-tint',!!c.tint);cls.toggle('mst-nohover',!c.hover);
    cls.toggle('mst-notitle',!c.showTitle);cls.toggle('mst-tt',!!c.title);
    if(c.title)v('--ms-tt',cssStr(c.title));else st.removeProperty('--ms-tt');
    wrapStatus();
    dataLater(c);
  }
  /* the pill needs the status word in its own element */
  function wrapStatus(){
    [].forEach.call(root.querySelectorAll('tbody td.col-status'),function(td){
      if(td.querySelector('.mst-sw'))return;
      var s=document.createElement('span');s.className='mst-sw';
      while(td.firstChild)s.appendChild(td.firstChild);
      td.appendChild(s);
    });
  }

  /* ---------- what the table shows: PRTG builds the rows again with the chosen columns, order, sort, filters and row count ---------- */
  function sameData(c){return DATAKEYS.every(function(k){return JSON.stringify(c[k])===JSON.stringify(FILE[k]);});}
  function mapTagOf(q){var t=q.get('filter_tags')||'', m=/^@tag\((.*)\)$/.exec(t);return m?m[1]:'';}
  function codesOf(list){
    var set={};STATUSDEF.forEach(function(s){if(list.indexOf(s[0])>=0)s[2].forEach(function(x){set[x]=1;});});
    return ['3','4','5','10','13','14','7','8','9','12','1','2','0'].filter(function(x){return set[x];});
  }
  function urlFor(orig,c){
    var u=new URL(orig,location.href), q0=u.searchParams, q=new URLSearchParams(), content=q0.get('content')||'sensors', mt=mapTagOf(q0), dir=c.sortDir==='desc'?'-':'';
    ['tableid','id'].forEach(function(k){if(q0.get(k)!=null)q.set(k,q0.get(k));});
    q.set('content',content);
    if(content==='channels'){
      q.set('columns',q0.get('columns')||'name,lastvalue_');
      q.set('sortby',dir+(c.sortBy==='lastvalue'?'lastvalue':'name'));
    }else{
      q.set('columns',c.cols.join(','));q.set('sortby',dir+c.sortBy);q.set('infoheader',c.infoheader?'true':'false');
    }
    q.set('links',c.links?'true':'false');q.set('sortable',c.sortable?'true':'false');q.set('refreshable','true');
    if(q0.get('tabletitle')!=null)q.set('tabletitle',q0.get('tabletitle'));
    if(content!=='channels'){
      var req=(c.reqTag||'').split(' ').filter(Boolean);
      if(!req.length){if(c.mapTags&&mt)q.append('filter_tags','@tag('+mt+')');}
      else req.forEach(function(t){q.append('filter_tags',c.mapTags&&mt?'@tag('+mt+' +'+t+')':'@tag('+t+')');});
      codesOf(c.statuses||[]).forEach(function(x){q.append('filter_status',x);});
      if(c.nameHas)q.set('filter_name','@sub('+c.nameHas+')');
      if(c.onlyValue)q.set('filter_lastvalue','@ntxt()');
      if(c.onlyFav)q.set('filter_favorite','1');
    }
    if(c.count>0)q.set('count',String(c.count));
    return u.pathname+'?'+q.toString();
  }
  function sameUrl(a,b){
    function norm(x){var u=new URL(x,location.href), l=[];u.searchParams.forEach(function(v,k){l.push(k+'='+v);});return u.pathname+'?'+l.sort().join('&');}
    try{return norm(a)===norm(b);}catch(e){return a===b;}
  }
  var dataT=null, dataTok=0, dataOk=null;
  function dataLater(c){clearTimeout(dataT);dataT=setTimeout(function(){applyData(c);},250);}
  function applyData(c){
    if(inPreview())return;
    if(isPublic()){dataOk=false;fallbackCss(sameData(c)?null:c);return;}   /* PRTG does not build tables again for a public link */
    var tok=++dataTok, jobs=[];
    [].forEach.call(root.querySelectorAll('.table-wrapper[refreshurl]'),function(w){
      if(!w.hasAttribute('data-mst-orig'))w.setAttribute('data-mst-orig',w.getAttribute('refreshurl'));
      var orig=w.getAttribute('data-mst-orig'), url=sameData(c)?orig:urlFor(orig,c);
      if(sameUrl(url,orig))url=orig;
      if(w.getAttribute('refreshurl')===url&&(w.__mstShown===url||url===orig))return;
      w.setAttribute('refreshurl',url);
      if(R.cache[url]){w.innerHTML=R.cache[url];w.__mstShown=url;}
      jobs.push(fetch(url,{credentials:'same-origin',headers:{'X-Requested-With':'XMLHttpRequest'}}).then(function(r){
        if(!r.ok)throw new Error('PRTG answered '+r.status);return r.text();
      }).then(function(t){
        if(tok!==dataTok)return;
        var d=new DOMParser().parseFromString(t,'text/html'), nw=d.querySelector('.table-wrapper');
        if(!nw)throw new Error('no table in PRTG\u2019s answer');
        R.cache[url]=nw.innerHTML;w.innerHTML=nw.innerHTML;w.__mstShown=url;
      }));
    });
    fallbackCss(null);
    if(!jobs.length)return;
    root.classList.add('mst-busy');
    Promise.all(jobs).then(function(){if(tok!==dataTok)return;dataOk=true;root.classList.remove('mst-busy');wrapStatus();},
      function(){if(tok!==dataTok)return;dataOk=false;root.classList.remove('mst-busy');fallbackCss(c);});
  }
  /* where PRTG will not build the table again (a public link, no sign-in), hide what can be hidden on the rows already there */
  function fallbackCss(c){
    var tag=root.querySelector('style.mst-gen'), sel='[data-mst="'+KEY+'"]', css=[];
    root.setAttribute('data-mst',KEY);
    if(!tag){tag=document.createElement('style');tag.className='mst-gen';root.appendChild(tag);}
    if(c){
      var ths=root.querySelectorAll('.ms-sens thead tr:first-child th');
      [].forEach.call(ths,function(th,i){
        var m=/(?:^|\s)col-([\w-]+)/.exec(th.className||'');
        if(m&&c.cols.indexOf(m[1])<0)css.push(sel+' .ms-sens thead tr:first-child th:nth-child('+(i+1)+'),'+sel+' .ms-sens tbody td.col-'+m[1]+'{display:none !important;}');
      });
      if((c.statuses||[]).length){
        var keep=[];c.statuses.forEach(function(s){(STROWS[s]||[]).forEach(function(p){if(keep.indexOf(p)<0)keep.push(p);});});
        css.push(sel+' .ms-sens tbody tr'+keep.map(function(p){return ':not([class^="'+p+'"]):not([class*=" '+p+'"])';}).join('')+'{display:none !important;}');
      }
    }
    tag.textContent=css.join('\n');
  }

  /* ---------- saving the look into the map item (PRTG keeps it in the item's HTML Before) ---------- */
  function api(path,opt){
    opt=opt||{};opt.credentials='same-origin';
    opt.headers=mix({'X-Requested-With':'XMLHttpRequest'},opt.headers);
    return fetch(path,opt).then(function(r){
      return r.text().then(function(t){if(!r.ok){var e=new Error('PRTG answered '+r.status);e.status=r.status;throw e;}return t;});
    });
  }
  function token(){
    var docs=[document],i,m;
    try{docs.push(window.parent.document);}catch(e){}
    try{docs.push(window.top.document);}catch(e){}
    for(i=0;i<docs.length;i++){m=docs[i].querySelector('meta[name="csrf-token"]');if(m&&m.content)return Promise.resolve(m.content);}
    return api('/welcome.htm').then(function(t){
      var d=new DOMParser().parseFromString(t,'text/html'), mm=d.querySelector('meta[name="csrf-token"]');
      if(!mm||!mm.content)throw new Error('Could not find PRTG\u2019s security token');
      return mm.content;
    });
  }
  function qfix(h){
    h=String(h==null?'':h);if(h.indexOf('"')<0)return h;
    var out='',i=0,n=h.length,c,j,q,m,end,d;
    while(i<n){
      c=h.charAt(i);
      if(c==='<'&&h.substr(i,4)==='<!--'){j=h.indexOf('-->',i+4);j=(j<0)?n:j+3;out+=h.slice(i,j);i=j;continue;}
      if(c==='<'&&/[A-Za-z\/!?]/.test(h.charAt(i+1)||'')){
        j=i+1;q='';
        while(j<n){d=h.charAt(j);if(q){if(d===q)q='';}else if(d==='"'||d==="'")q=d;else if(d==='>')break;j++;}
        j=Math.min(n,j+1);out+=h.slice(i,j);
        m=/^<(script|style)\b/i.exec(h.slice(i,j));
        if(m){end=h.toLowerCase().indexOf('</'+m[1].toLowerCase(),j);end=(end<0)?n:end;out+=h.slice(j,end);j=end;}
        i=j;continue;
      }
      out+=(c==='"')?'&quot;':c;i++;
    }
    return out;
  }
  function packed(c){return encodeURIComponent(JSON.stringify(clean(c)));}
  function cfgTag(c){
    var s=packed(c), parts=[],i;
    for(i=0;i<s.length;i+=200)parts.push(s.slice(i,i+200));
    return '<i class="mst-cfg" data-c="'+parts.join('\n')+'"></i>';
  }
  var CFGRE=/<i\s+class=["']mst-cfg["'][^>]*>\s*<\/i>/i;
  function saveShared(c){
    if(!MAP||!SUB)return Promise.reject(new Error('Could not tell which map and item this is'));
    var q='id='+encodeURIComponent(MAP)+'&subid='+encodeURIComponent(SUB)+'&type=objectproperties', SZ=null;
    return api('/api/mapsettings.htm?'+q).then(function(t){
      var j=JSON.parse(t), un=function(v){return (v==null?'':String(v)).replace(/&apos;/g,'"');};
      var before=un(j.htmlbefore).replace(CFGRE,'').replace(/^\s+/,'');
      before=cfgTag(c)+(before?'\n'+before:'');
      return token().then(function(tk){
        var p=new URLSearchParams();
        p.set('subid',SUB);p.set('id',MAP);
        SZ=sizeFor(j);
        p.set('top',String(SZ.t));p.set('left',String(SZ.l));
        p.set('width',String(SZ.w));p.set('height',String(SZ.h));
        p.set('zindex',String(parseInt(j.zindex,10)||0));
        p.set('htmlbefore_',qfix(before));p.set('htmlafter_',qfix(un(j.htmlafter)));
        p.set('ElementLink',j.externallink==null?'':String(j.externallink));
        return api('/api/editmapobject.htm',{method:'POST',headers:{'anti-csrf-token':tk,'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},body:p.toString()});
      });
    }).then(function(){return api('/api/mapsettings.htm?'+q);}).then(function(t){
      var j=JSON.parse(t);
      if(String(j.htmlbefore||'').indexOf('mst-cfg')<0)throw new Error('PRTG did not keep the new look');
      if(SZ&&(parseInt(j.width,10)!==SZ.w||parseInt(j.height,10)!==SZ.h))throw new Error('PRTG did not keep the new size');
      sizeSaved();
      var el=root.querySelector('.mst-cfg');
      if(!el){el=document.createElement('i');el.className='mst-cfg';root.insertBefore(el,root.firstChild);}
      el.setAttribute('data-c',packed(c));
    });
  }

  /* ---------- the bar (built like Map Studio's floating bar) ---------- */
  var GEAR=__GEAR__;
  var BCSS=__BCSS__;
  /* the bar goes on the top page, so the map's frame cannot cut it off */
  var TOPDOC;try{TOPDOC=window.top.document;TOPDOC.body.appendChild;}catch(e){TOPDOC=document;}
  function el(tag,cls,html,doc){var e=(doc||TOPDOC).createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function barHost(){return TOPDOC.querySelector('[data-mst-bar="'+KEY+'"]');}
  function liveRoot(){return document.getElementById(root.id)||root;}
  function applyLive(c){if(R.apply)R.apply(c);else apply(c);}
  function closeBar(keepDraft){
    var h=barHost();if(h){if(h.__stop)h.__stop();h.remove();}
    R.open=false;if(!keepDraft){R.draft=null;sizeRevert();}selRemove();
    var r=liveRoot();if(r)r.classList.remove('mst-open');
  }
  function reopen(){closeBar(true);if(R.openFn)R.openFn();else openBar();}
  /* where the table is on the top page */
  function topRect(){
    var r=liveRoot().getBoundingClientRect(), x=r.left, y=r.top, w=window, fe;
    try{while(w!==w.top&&(fe=w.frameElement)){var f=fe.getBoundingClientRect();x+=f.left+fe.clientLeft;y+=f.top+fe.clientTop;w=w.parent;}}catch(e){}
    return {left:x,top:y,right:x+r.width,bottom:y+r.height,width:r.width,height:r.height};
  }

  /* ---------- the selection outline: drag a handle to change the item's size (saved with "Save for everyone") ---------- */
  var SELCSS='.mst-sel{position:absolute;box-sizing:border-box;border:1.5px solid #1A9FD9;pointer-events:none;z-index:2147483000}'+
    '.mst-sel i{position:absolute;width:10px;height:10px;margin:-6px 0 0 -6px;box-sizing:border-box;border:1.5px solid #1A9FD9;border-radius:50%;background:#fff;pointer-events:auto;touch-action:none}'+
    '.mst-sel i:hover{background:#E6F3FA}'+
    '.mst-sel b{position:absolute;left:50%;top:100%;transform:translate(-50%,8px);padding:2px 7px;border-radius:4px;background:#0E7CB0;color:#fff;font:600 11px/1.4 "Segoe UI",Roboto,Arial,sans-serif;white-space:nowrap;pointer-events:none}';
  var SELH=[['nw',0,0],['n',.5,0],['ne',1,0],['e',1,.5],['se',1,1],['s',.5,1],['sw',0,1],['w',0,.5]];
  function selId(){return 'mst-sel-'+KEY.replace(/[^\w-]/g,'_');}
  function selRemove(){var o=document.getElementById(selId());if(o)o.remove();}
  function px(v,alt){var n=parseFloat(v);return (/px$/.test(String(v))&&!isNaN(n))?Math.round(n):Math.round(alt);}
  function sizeNow(){var r=liveRoot(),s=r.style;return {l:px(s.left,r.offsetLeft),t:px(s.top,r.offsetTop),w:px(s.width,r.offsetWidth),h:px(s.height,r.offsetHeight)};}
  function sizeApply(){
    if(!R.size)return;var s=liveRoot().style;
    s.left=R.size.l+'px';s.top=R.size.t+'px';s.width=R.size.w+'px';s.height=R.size.h+'px';
  }
  function sizeDirty(){var a=R.size,b=R.size0;return !!(a&&b&&(a.l!==b.l||a.t!==b.t||a.w!==b.w||a.h!==b.h));}
  function sizeRevert(){if(R.size&&R.size0){R.size=R.size0;sizeApply();}R.size=null;R.size0=null;}
  function sizeFor(j){   /* what to send to PRTG: its own numbers, moved by what was dragged */
    var o={l:parseInt(j.left,10)||0,t:parseInt(j.top,10)||0,w:parseInt(j.width,10)||0,h:parseInt(j.height,10)||0};
    if(sizeDirty()){o.l+=R.size.l-R.size0.l;o.t+=R.size.t-R.size0.t;o.w=R.size.w;o.h=R.size.h;}
    return o;
  }
  function sizeSaved(){if(R.size){R.size0={l:R.size.l,t:R.size.t,w:R.size.w,h:R.size.h};}}
  function selPlace(){
    var o=document.getElementById(selId()), r=liveRoot();
    if(!o)return;
    if(!document.documentElement.contains(r)){o.remove();return;}
    var par=r.offsetParent||r.parentNode;
    if(o.parentNode!==par)par.appendChild(o);
    o.style.left=r.offsetLeft+'px';o.style.top=r.offsetTop+'px';o.style.width=r.offsetWidth+'px';o.style.height=r.offsetHeight+'px';
    var z=parseInt(getComputedStyle(r).zIndex,10);o.style.zIndex=String(isNaN(z)?2147483000:z+1);
    var sz=R.size||sizeNow();o.querySelector('b').textContent=sz.w+' × '+sz.h+' px';
  }
  function selShow(){
    selRemove();
    if(!document.getElementById('mst-sel-css')){var st=document.createElement('style');st.id='mst-sel-css';st.textContent=SELCSS;document.head.appendChild(st);}
    if(!R.size0)R.size0=sizeNow();
    var o=document.createElement('div');o.className='mst-sel';o.id=selId();
    SELH.forEach(function(h){
      var i=document.createElement('i');i.style.left=(h[1]*100)+'%';i.style.top=(h[2]*100)+'%';i.style.cursor=h[0]+'-resize';
      i.title='Drag to change the size';
      ['mousedown','click','dblclick'].forEach(function(ev){i.addEventListener(ev,function(e){e.preventDefault();e.stopPropagation();});});
      i.addEventListener('pointerdown',function(e){
        e.preventDefault();e.stopPropagation();
        var r=liveRoot(), k=(r.getBoundingClientRect().width/(r.offsetWidth||1))||1, s0=R.size||sizeNow(), x0=e.clientX, y0=e.clientY;
        try{i.setPointerCapture(e.pointerId);}catch(er){}
        function mv(ev){
          var dx=(ev.clientX-x0)/k, dy=(ev.clientY-y0)/k, s={l:s0.l,t:s0.t,w:s0.w,h:s0.h};
          if(h[1]===1)s.w=Math.max(80,Math.round(s0.w+dx));
          if(h[1]===0){s.w=Math.max(80,Math.round(s0.w-dx));s.l=s0.l+s0.w-s.w;}
          if(h[2]===1)s.h=Math.max(50,Math.round(s0.h+dy));
          if(h[2]===0){s.h=Math.max(50,Math.round(s0.h-dy));s.t=s0.t+s0.h-s.h;}
          R.size=s;sizeApply();selPlace();if(R.onSize)R.onSize();
        }
        function up(){i.removeEventListener('pointermove',mv);i.removeEventListener('pointerup',up);i.removeEventListener('pointercancel',up);}
        i.addEventListener('pointermove',mv);i.addEventListener('pointerup',up);i.addEventListener('pointercancel',up);
      });
      o.appendChild(i);
    });
    o.appendChild(document.createElement('b'));
    (liveRoot().offsetParent||liveRoot().parentNode).appendChild(o);
    selPlace();
  }

  function openBar(){
    if(barHost())return;
    R.open=true;
    if(!R.draft)R.draft=savedRaw();
    var d=R.draft, pub=isPublic(), view=TOPDOC.defaultView||window;
    liveRoot().classList.add('mst-open');if(!pub)selShow();
    var host=el('div');host.setAttribute('data-mst-bar',KEY);TOPDOC.body.appendChild(host);
    var sh=host.attachShadow({mode:'open'});
    var stl=el('style');stl.textContent=BCSS;sh.appendChild(stl);
    var bar=el('div','bar');sh.appendChild(bar);
    var r1=el('div','r'), r2=el('div','r');bar.appendChild(r1);bar.appendChild(r2);
    var syncs=[];
    function E(){return eff(d);}
    function sync(){syncs.forEach(function(f){f();});dirtyShow();}
    function change(){applyLive(d);dirtyShow();}
    function sep(row){row.appendChild(el('span','sep'));}

    /* ---- small controls ---- */
    function lab(row,text,ctl){var w=el('label','lab');w.appendChild(el('b','',esc(text)));w.appendChild(ctl);row.appendChild(w);return w;}
    function numBox(row,text,key,min,max){
      var i=el('input','n');i.type='number';i.min=min;i.max=max;
      function show(){i.value=E()[key];}
      i.addEventListener('change',function(){var n=int(i.value,min,max);if(n===undefined){show();return;}d[key]=n;change();sync();});
      syncs.push(show);lab(row,text,i);return i;
    }
    function toggle(row,text,key,tip){
      var b=el('button','t',esc(text));b.type='button';if(tip)b.title=tip;
      b.addEventListener('click',function(){d[key]=!E()[key];change();sync();});
      syncs.push(function(){b.classList.toggle('on',!!E()[key]);});row.appendChild(b);return b;
    }
    function sel(opts,key,cls){
      var s=el('select',cls||'s');
      opts.forEach(function(o){var op=el('option');op.value=o[0];op.textContent=o[1];s.appendChild(op);});
      s.addEventListener('change',function(){d[key]=s.value;change();sync();});
      syncs.push(function(){s.value=E()[key];});return s;
    }

    /* ---- menus ---- */
    var openPop=null;
    function closePops(){if(openPop){openPop.hidden=true;openPop.__btn.classList.remove('open');openPop=null;}}
    function menu(row,text,build,cls){
      var m=el('span','m'), b=el('button','t'+(cls?' '+cls:''),esc(text)+' <i>▾</i>'), pop=el('div','pop');
      b.type='button';pop.hidden=true;pop.__btn=b;m.appendChild(b);m.appendChild(pop);row.appendChild(m);
      var built=false;
      b.addEventListener('click',function(e){
        e.stopPropagation();
        if(openPop===pop){closePops();return;}
        closePops();
        if(!built){build(pop);built=true;sync();}
        pop.hidden=false;b.classList.add('open');openPop=pop;placePop(pop,b);
      });
      return b;
    }
    function placePop(pop,b){
      pop.classList.remove('up');pop.style.left='0px';pop.style.maxHeight='';
      var vh=view.innerHeight, vw=view.innerWidth, br=b.getBoundingClientRect(), below=vh-br.bottom-14, above=br.top-14;
      if(below<260&&above>below){pop.classList.add('up');pop.style.maxHeight=Math.max(160,above)+'px';}
      else pop.style.maxHeight=Math.max(160,below)+'px';
      var pr=pop.getBoundingClientRect();
      if(pr.right>vw-8)pop.style.left=Math.round(vw-8-pr.right)+'px';
    }
    function pf(pop,text){var w=el('div','pf');if(text)w.appendChild(el('div','pl',esc(text)));pop.appendChild(w);return w;}
    function pfRange(pop,text,key,min,max){
      var w=pf(pop,text), g=el('div','rg','<input type="range" min="'+min+'" max="'+max+'" step="1"><output></output>');w.appendChild(g);
      var i=g.querySelector('input'), o=g.querySelector('output');
      function show(){i.value=E()[key];o.textContent=E()[key]+' px';}
      i.addEventListener('input',function(){d[key]=parseInt(i.value,10);o.textContent=d[key]+' px';change();});
      syncs.push(show);
    }
    function pfCheck(pop,text,key){
      var w=el('label','pc','<input type="checkbox"><span>'+esc(text)+'</span>'), c=w.querySelector('input');
      c.addEventListener('change',function(){d[key]=c.checked;change();sync();});
      syncs.push(function(){c.checked=!!E()[key];});pop.appendChild(w);return c;
    }
    function pfSeg(pop,text,opts,key){
      var w=pf(pop,text), g=el('div','seg');w.appendChild(g);
      opts.forEach(function(o){var b=el('button','',esc(o[1]));b.type='button';b.setAttribute('data-v',o[0]);
        b.addEventListener('click',function(){d[key]=o[0];change();sync();});g.appendChild(b);});
      syncs.push(function(){[].forEach.call(g.children,function(b){b.classList.toggle('on',b.getAttribute('data-v')===E()[key]);});});
    }
    function pfSelect(pop,text,opts,key){var w=pf(pop,text);w.appendChild(sel(opts,key,'ps'));}
    function pfColor(pop,text,get,set,reset){
      var w=el('div','pr','<span>'+esc(text)+'</span><input type="color"><button type="button" class="cp" title="Back to the look’s colour">Look’s</button>');
      var i=w.querySelector('input');
      i.addEventListener('input',function(){set(i.value);change();});
      w.querySelector('button').addEventListener('click',function(){reset();change();sync();});
      syncs.push(function(){i.value=get();});pop.appendChild(w);
    }
    function note(pop,text){pop.appendChild(el('div','note',esc(text)));}

    /* ---- row 1: the menus ---- */
    menu(r1,'Looks',function(pop){
      var g=el('div','looks');pop.appendChild(g);
      LOOKNAMES.forEach(function(n){
        var L=LOOKS[n], b=el('button','lk');b.type='button';b.setAttribute('data-v',n);
        var bg=L.card?L.bg:'#F2F4F7', top=L.ts==='bar'?L.tbg:bg;
        b.innerHTML='<i style="background:'+bg+'"><b style="background:'+top+'"></b><u style="top:13px;background:'+L.line+'"></u>'+
          '<u style="top:19px;background:'+L.link+';right:45%"></u></i><span>'+esc(n)+'</span>';
        b.addEventListener('click',function(){DETAILKEYS.forEach(function(k){delete d[k];});d.look=n;change();sync();});
        g.appendChild(b);
      });
      syncs.push(function(){[].forEach.call(g.children,function(b){b.classList.toggle('on',b.getAttribute('data-v')===E().look);});});
      pfSelect(pop,'Shadow',SHADOWS,'shadow');
      pfCheck(pop,'Border round the card','border');
    },'wide');
    menu(r1,'Colors',function(pop){
      pfSelect(pop,'Status colours',Object.keys(SETS).map(function(k){return [k,SETS[k][0]];}).concat([['own','My own']]),'set');
      var g=el('div','cols2');pop.appendChild(g);
      STKEYS.forEach(function(s,i){
        var w=el('label','sw','<input type="color"><span>'+esc(s[1])+'</span>'), inp=w.querySelector('input');
        inp.addEventListener('input',function(){var e=E(), S=SETS[e.set]||SETS.prtg, o=mix(e.own);
          if(e.set!=='own')STKEYS.forEach(function(x,j){if(!o[x[0]])o[x[0]]=S[j+1];});
          o[s[0]]=inp.value;d.own=o;d.set='own';change();sync();});
        syncs.push(function(){var e=E(), S=SETS[e.set]||SETS.prtg;inp.value=(e.set==='own'&&e.own&&e.own[s[0]])||S[i+1];});
        g.appendChild(w);
      });
      pop.appendChild(el('div','ph','Or each colour of the look on its own'));
      OV.forEach(function(o){
        pfColor(pop,o[1],function(){var e=E(), L=LOOKS[e.look];return (e.ov&&e.ov[o[0]])||(o[0]==='stripe'?(L.zebra||'#F8FAFC'):L[o[0]])||'#000000';},
          function(v){d.ov=mix(d.ov);d.ov[o[0]]=v;},function(){if(d.ov){d.ov=mix(d.ov);delete d.ov[o[0]];}});
      });
    },'wide');
    menu(r1,'Title',function(pop){
      var w=pf(pop,'Text'), i=el('input','ps');i.type='text';i.maxLength=80;i.placeholder='PRTG’s own title';w.appendChild(i);
      i.addEventListener('input',function(){d.title=i.value;change();});syncs.push(function(){if(TOPDOC.activeElement!==host)i.value=E().title||'';});
      pfSeg(pop,'Style',TSTYLES,'ts');
      pfSeg(pop,'Align',[['left','Left'],['center','Centre'],['right','Right']],'talign');
      pfRange(pop,'Size','tsize',10,30);
    });
    menu(r1,'Header',function(pop){
      pfCheck(pop,'Show the header row','head');
      pfSeg(pop,'Style',HSTYLES,'hs');
      pfCheck(pop,'Capital letters','caps');
    });
    menu(r1,'Row style',function(pop){
      pfCheck(pop,'Stripes on every other row','stripes');
      pfCheck(pop,'Lines between rows','lines');
      pfCheck(pop,'Highlight the row under the mouse','hover');
      pfRange(pop,'Row spacing','pad',2,20);
      pfRange(pop,'Side spacing','cellx',4,28);
    });
    menu(r1,'Status',function(pop){
      var w=pf(pop,'Shown as'), g=el('div','seg');w.appendChild(g);
      SHAPES.forEach(function(o){var b=el('button','',esc(o[1]));b.type='button';b.setAttribute('data-v',o[0]);
        b.addEventListener('click',function(){d.status=o[0];change();sync();});g.appendChild(b);});
      syncs.push(function(){[].forEach.call(g.children,function(b){b.classList.toggle('on',b.getAttribute('data-v')===E().status);});});
      pfRange(pop,'Dot size','dot',6,20);
      pfCheck(pop,'Tint rows that are down or warning','tint');
    });
    sep(r1);
    menu(r1,'Columns',function(pop){
      note(pop,'Tick the columns to show; the arrows change their order.');
      var cl=el('div','colist');pop.appendChild(cl);
      function draw(){
        cl.innerHTML='';
        var cur=E().cols.slice(), all=cur.concat(keysOf(COLS).filter(function(k){return cur.indexOf(k)<0;}));
        all.forEach(function(k){
          var on=cur.indexOf(k)>=0, name='';COLS.forEach(function(x){if(x[0]===k)name=x[1];});
          var r=el('div','cr'+(on?'':' off'),'<label><input type="checkbox"'+(on?' checked':'')+'><span>'+esc(name)+'</span></label>'+
            (on?'<button type="button" data-m="-1" title="Move up">↑</button><button type="button" data-m="1" title="Move down">↓</button>':''));
          r.querySelector('input').addEventListener('change',function(){
            var c=E().cols.slice(), i=c.indexOf(k);
            if(this.checked&&i<0)c.push(k);else if(!this.checked&&i>=0){if(c.length<2){this.checked=true;return;}c.splice(i,1);}
            d.cols=c;change();draw();
          });
          [].forEach.call(r.querySelectorAll('button'),function(b){b.addEventListener('click',function(){
            var c=E().cols.slice(), i=c.indexOf(k), j=i+parseInt(b.getAttribute('data-m'),10);
            if(j<0||j>=c.length)return;c.splice(i,1);c.splice(j,0,k);d.cols=c;change();draw();
          });});
          cl.appendChild(r);
        });
      }
      syncs.push(draw);
    });
    menu(r1,'Sort and rows',function(pop){
      pfSelect(pop,'Sort by',SORTS,'sortBy');
      pfSeg(pop,'Order',[['asc','A to Z, low to high'],['desc','Z to A, high to low']],'sortDir');
      var w=pf(pop,'Rows (0 = PRTG’s paging)'), i=el('input','ps');i.type='number';i.min=0;i.max=500;w.appendChild(i);
      i.addEventListener('change',function(){var n=int(i.value,0,500);if(n===undefined){i.value=E().count;return;}d.count=n;change();});
      syncs.push(function(){i.value=E().count;});
      pop.appendChild(el('div','ph','Behaviour'));
      pfCheck(pop,'Names link to PRTG','links');
      pfCheck(pop,'Click a heading to sort','sortable');
      pfCheck(pop,'Show PRTG’s “Items” line','infoheader');
    });
    menu(r1,'Filters',function(pop){
      pop.appendChild(el('div','ph','Status (none ticked = all)'));
      var g=el('div','cols2');pop.appendChild(g);
      STATUSDEF.forEach(function(sd){
        var w=el('label','pc','<input type="checkbox"><span>'+esc(sd[1])+'</span>'), c=w.querySelector('input');
        c.addEventListener('change',function(){var l=(E().statuses||[]).filter(function(x){return x!==sd[0];});if(c.checked)l.push(sd[0]);d.statuses=l;change();});
        syncs.push(function(){c.checked=(E().statuses||[]).indexOf(sd[0])>=0;});g.appendChild(w);
      });
      pfCheck(pop,'Follow the map’s tag filter','mapTags');
      var w1=pf(pop,'Only sensors with the tag'), t=el('input','ps');t.type='text';t.placeholder='e.g. ping firewall';w1.appendChild(t);
      t.addEventListener('change',function(){d.reqTag=t.value;change();sync();});syncs.push(function(){t.value=E().reqTag||'';});
      var w2=pf(pop,'Name contains'), n=el('input','ps');n.type='text';n.maxLength=40;w2.appendChild(n);
      n.addEventListener('change',function(){d.nameHas=n.value;change();sync();});syncs.push(function(){n.value=E().nameHas||'';});
      pfCheck(pop,'Only sensors with a value','onlyValue');
      pfCheck(pop,'Only favourites','onlyFav');
    });
    sep(r1);
    var saveBtn=menu(r1,'Save',function(pop){
      var b1=el('button','b pri','Save for everyone'), b2=el('button','b',pub?'Only on this screen':'Only on this browser'), b3=el('button','b','Start over');
      [b1,b2,b3].forEach(function(b){b.type='button';});
      if(!pub)pop.appendChild(b1);pop.appendChild(b2);pop.appendChild(b3);
      note(pop,pub?'Only your screen changes. The shared look stays as it was saved in PRTG.':
        '“Save for everyone” stores the look in this map item in PRTG. “Only on this browser” keeps it just for you.');
      if(readLocal()){var fg=el('button','mini','Forget this browser’s own look');fg.type='button';pop.appendChild(fg);
        fg.addEventListener('click',function(){writeLocal(null);R.draft=readShared();applyLive(R.draft);reopen();});}
      if(!pub){
        pop.appendChild(el('div','ph','Public links'));
        pfCheck(pop,'Show the gear on public links','publicGear');
        note(pop,'Visitors of a public link can then change only their own screen. Nobody can change the shared look without signing in to PRTG.');
      }
      var msg=el('div','msg');msg.setAttribute('aria-live','polite');pop.appendChild(msg);
      function say(t,k){msg.textContent=t;msg.className='msg'+(k?' '+k:'');}
      b3.addEventListener('click',function(){R.draft={};applyLive(R.draft);reopen();});
      b2.addEventListener('click',function(){
        var mine=clean(d);delete mine.publicGear;
        if(writeLocal(mine)){say('Saved on this '+(pub?'screen':'browser')+' only.'+(sizeDirty()?' A new size is kept only with \u201cSave for everyone\u201d.':''),'ok');R.savedSig=sig(d);dirtyShow();}
        else say('This browser would not keep it (storage is full or blocked).','err');
      });
      b1.addEventListener('click',function(){
        b1.disabled=true;say('Saving in PRTG…');
        saveShared(d).then(function(){
          var hadLocal=!!readLocal();writeLocal(null);R.savedSig=sig(d);dirtyShow();
          say('Saved for everyone. Other screens show it after PRTG’s next refresh (about 30 s).'+(hadLocal?' This browser’s own look was cleared.':''),'ok');
          b1.disabled=false;
        },function(err){
          b1.disabled=false;
          var t=String(err&&err.message||err);
          if(err&&(err.status===401||err.status===403))t='PRTG did not allow it: your account may not have permission to edit this map. Use “Only on this browser” instead.';
          say('Not saved: '+t,'err');
        });
      });
    },'save');
    var x=el('button','t x','×');x.type='button';x.title='Close (changes not saved are dropped)';r1.appendChild(x);
    x.addEventListener('click',function(){closeBar(false);applyLive(savedRaw());});

    /* ---- row 2: quick settings ---- */
    lab(r2,'Font',sel(FONTS.map(function(f){return [f[0],f[1]];}),'font','s'));
    numBox(r2,'Text','size',10,24);
    numBox(r2,'Title','tsize',10,30);
    numBox(r2,'Corners','radius',0,24);
    sep(r2);
    toggle(r2,'Title','showTitle','Show the title');
    toggle(r2,'Header','head','Show the header row');
    toggle(r2,'Stripes','stripes','Stripes on every other row');
    toggle(r2,'Lines','lines','Lines between rows');
    toggle(r2,'Tint','tint','Tint rows that are down or warning');

    function sig(c){return JSON.stringify(clean(c));}
    if(R.savedSig==null)R.savedSig=sig(savedRaw());
    R.onSize=function(){dirtyShow();};
    function dirtyShow(){var dirty=sig(d)!==R.savedSig||sizeDirty();saveBtn.classList.toggle('dirty',dirty);saveBtn.title=dirty?'Changes not saved yet':'';}
    sync();

    /* keep the bar next to the table: above it, or below it, or over it when neither has room */
    function place(){
      if(!host.isConnected)return;
      var rt=topRect(), vw=view.innerWidth, vh=view.innerHeight, bw=bar.offsetWidth, bh=bar.offsetHeight, y, xx;
      var gb=document.getElementById(selId())?38:10;   /* leave the size label under the outline free */
      if(rt.top-bh-10>=8)y=rt.top-bh-10;else if(rt.bottom+gb+bh<=vh-8)y=rt.bottom+gb;else y=Math.max(8,rt.top+8);
      xx=Math.min(Math.max(8,rt.left),Math.max(8,vw-bw-8));
      bar.style.left=Math.round(xx)+'px';bar.style.top=Math.round(y)+'px';
    }
    place();
    var tick=setInterval(function(){
      if(!host.isConnected){clearInterval(tick);return;}
      if(!document.documentElement.contains(liveRoot())&&!R.apply){closeBar(true);return;}
      if(!openPop)place();selPlace();
    },300);
    host.__stop=function(){clearInterval(tick);TOPDOC.removeEventListener('mousedown',outside,true);TOPDOC.removeEventListener('keydown',keys,true);};
    function outside(e){if(openPop&&!(e.composedPath&&e.composedPath().indexOf(host)>=0))closePops();}
    function keys(e){if(e.key==='Escape'&&openPop){closePops();e.stopPropagation();}}
    TOPDOC.addEventListener('mousedown',outside,true);TOPDOC.addEventListener('keydown',keys,true);
    ['mousedown','click','dblclick','keydown','wheel'].forEach(function(ev){host.addEventListener(ev,function(e){e.stopPropagation();});});
  }

  /* ---------- start ---------- */
  R.apply=apply;R.openFn=openBar;
  apply(R.open&&R.draft?R.draft:savedRaw());
  if(window.MutationObserver){
    var mq=false, mo=new MutationObserver(function(){
      if(mq)return;mq=true;
      setTimeout(function(){mq=false;if(!document.documentElement.contains(root)){mo.disconnect();return;}wrapStatus();
        if(dataOk===false)fallbackCss(eff(clean(R.open&&R.draft?R.draft:savedRaw())));},300);
    });
    mo.observe(root,{childList:true,subtree:true});
  }
  if(inPreview()||inDesigner())return;
  if(isPublic()&&!readShared().publicGear)return;
  var g=el('button','mst-gear',GEAR,document);g.type='button';g.title='Change how this table looks';g.setAttribute('aria-label','Change how this table looks');
  ['mousedown','dblclick'].forEach(function(ev){g.addEventListener(ev,function(e){e.stopPropagation();});});
  g.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(barHost()){closeBar(false);apply(savedRaw());}else openBar();});
  root.appendChild(g);
  if(R.open&&R.size)sizeApply();
  if(R.open&&!barHost())openBar();
  else if(R.open){root.classList.add('mst-open');if(!isPublic())selShow();}
})();
