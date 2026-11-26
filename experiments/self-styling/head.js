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
    var q='id='+encodeURIComponent(MAP)+'&subid='+encodeURIComponent(SUB)+'&type=objectproperties';
    return api('/api/mapsettings.htm?'+q).then(function(t){
      var j=JSON.parse(t), un=function(v){return (v==null?'':String(v)).replace(/&apos;/g,'"');};
      var before=un(j.htmlbefore).replace(CFGRE,'').replace(/^\s+/,'');
      before=cfgTag(c)+(before?'\n'+before:'');
      return token().then(function(tk){
        var p=new URLSearchParams();
        p.set('subid',SUB);p.set('id',MAP);
        p.set('top',String(parseInt(j.top,10)||0));p.set('left',String(parseInt(j.left,10)||0));
        p.set('width',String(parseInt(j.width,10)||0));p.set('height',String(parseInt(j.height,10)||0));
        p.set('zindex',String(parseInt(j.zindex,10)||0));
        p.set('htmlbefore_',qfix(before));p.set('htmlafter_',qfix(un(j.htmlafter)));
        p.set('ElementLink',j.externallink==null?'':String(j.externallink));
        return api('/api/editmapobject.htm',{method:'POST',headers:{'anti-csrf-token':tk,'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},body:p.toString()});
      });
    }).then(function(){return api('/api/mapsettings.htm?'+q);}).then(function(t){
      var j=JSON.parse(t);
      if(String(j.htmlbefore||'').indexOf('mst-cfg')<0)throw new Error('PRTG did not keep the new look');
      var el=root.querySelector('.mst-cfg');
      if(!el){el=document.createElement('i');el.className='mst-cfg';root.insertBefore(el,root.firstChild);}
      el.setAttribute('data-c',packed(c));
    });
  }

