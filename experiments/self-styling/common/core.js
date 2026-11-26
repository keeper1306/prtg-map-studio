  /* ---------- shared by every self-styling object: which item this is, its saved settings, and the checks they pass ---------- */
  function keysOf(list){return list.map(function(x){return x[0];});}
  function has(list,v){return keysOf(list).indexOf(v)>=0;}
  function hex(v){return (typeof v==='string'&&/^#[0-9a-fA-F]{6}$/.test(v))?v:undefined;}
  function int(v,lo,hi){var n=parseInt(v,10);return (isNaN(n)||n<lo||n>hi)?undefined:n;}
  function bool(v){return typeof v==='boolean'?v:undefined;}
  function txt(v,max){if(typeof v!=='string')return undefined;return v.replace(/[\u0000-\u001F\u007F<>\\]/g,'').slice(0,max);}
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
  var MAP=mapId(), KEY=PFX+MAP+'.'+SUB;
  /* what is open survives PRTG's refresh of the map (about every 30 s): it is kept on the top page, per map item */
  var REG;try{REG=window.top.__mstReg||(window.top.__mstReg={});}catch(e){REG=window.__mstReg||(window.__mstReg={});}
  var R=REG[KEY]||(REG[KEY]={open:false,draft:null,cache:{}});
  if(!R.cache)R.cache={};

  /* the shared settings live in the item's HTML Before as <i class="mst-cfg" data-c="...">; this browser's own in localStorage.
     Both pass clean(), which keeps only known values: anything else is ignored */
  function readShared(){
    var el=root.querySelector('.mst-cfg'), c;
    if(!el)return {};
    try{c=JSON.parse(decodeURIComponent((el.getAttribute('data-c')||'').replace(/\s+/g,'')));}catch(e){return {};}
    return clean(c);
  }
  function readLocal(){try{var v=localStorage.getItem(KEY);return v?clean(JSON.parse(v)):null;}catch(e){return null;}}
  function writeLocal(c){try{if(c)localStorage.setItem(KEY,JSON.stringify(clean(c)));else localStorage.removeItem(KEY);return true;}catch(e){return false;}}
  /* what this screen shows: the shared settings, then this browser's own (its public-link choice never overrides the shared one) */
  function savedRaw(){var s=readShared(), l=readLocal();if(l){delete l.publicGear;}return mix(s,l);}
  function cssStr(s){return '"'+String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/[\r\n]+/g,' ')+'"';}
  function fontStack(f){return '"'+f+'","Segoe UI",Roboto,Arial,sans-serif';}
  function loadFont(f){
    var F=null;FONTS.forEach(function(x){if(x[0]===f)F=x;});
    if(!F||!F[2]||f==='Roboto')return;
    loadFontHref('https://fonts.googleapis.com/css2?family='+encodeURIComponent(f).replace(/%20/g,'+')+':wght@400;500;600;700&display=swap');
  }
  function loadFontHref(href){
    if(!/^https:\/\/fonts\.googleapis\.com\/css2\?family=[\w+]+(:wght@[\d;]+)?&display=swap$/.test(href))return;
    var id='mst-font-'+href.replace(/^.*family=([\w+]+).*$/,'$1').replace(/\W+/g,'-'), d;
    try{d=window.top.document;d.head.appendChild;}catch(e){d=document;}
    [document,d].forEach(function(doc){
      if(doc.getElementById(id))return;
      var l=doc.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;doc.head.appendChild(l);
    });
  }
  function shadowCss(s,acc){
    if(s==='soft')return '0 1px 3px rgba(15,23,42,.12),0 4px 12px rgba(15,23,42,.06)';
    if(s==='strong')return '0 10px 28px rgba(0,0,0,.35)';
    if(s==='glow')return '0 0 0 1px color-mix(in srgb,'+acc+' 35%,transparent),0 8px 26px color-mix(in srgb,'+acc+' 20%,transparent)';
    return 'none';
  }

