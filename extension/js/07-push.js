
/* @region: push */
/* Adds the Dashboard's items to a PRTG map, and on the next push updates the items it added instead of adding new ones.
   It uses the same calls PRTG's own map designer makes:
     GET  api/table.json?content=maps&columns=name,objid     the list of maps
     GET  /api/mapobject.json                                 the catalogue of object files (to find the Custom HTML element by name)
     POST /api/addobjecttomap.htm                             objectid, top, left, id, width, height, mapobject_, noautoposition, result
     POST /api/editmapobject.htm                              subid, id, top, left, width, height, zindex, htmlbefore_, htmlafter_, ElementLink
     GET  /api/deletesubobject.htm                            id, subid
   These are the designer's own calls, not PRTG's documented API, so they are kept together here.
   What was sent for each item is remembered, per server, map and layout, so a later push can tell new, changed, unchanged and removed items apart. */
(function pushModule(){
  var _pq=[140,37,52,63,146,221,107,244];
try{
  var $=function(id){return document.getElementById(id);};
  var KEY=CFG.keys.pushes, SKEY=CFG.keys.sync;
  var S={maps:null,objFile:null,catalog:null,tgt:{},reviewed:null,cls:null,busy:false,forgetArm:null,deleteArm:null};
  var bannerT=null;
  /* a result or an error shows over the Dashboard, whichever sections are open; a new action clears the last one */
  function banner(msg,kind){
    var b=$('prtgmsg');
    clearTimeout(bannerT);
    if(msg&&(kind==='err'||kind==='ok')){
      $('prtgmsgtext').textContent=msg;b.className=kind;b.hidden=false;
      placePop();   /* the login card sits below the message, not over it */
      if(kind==='ok')bannerT=setTimeout(function(){b.hidden=true;$('prtgbar').style.setProperty('--msgH','0px');},12000);
    }else{b.hidden=true;$('prtgbar').style.setProperty('--msgH','0px');}
  }
  /* the login card is fixed to the window under the connection bar, so no panel can cut it off and a short window can scroll it */
  /* the first screen is a full-page "Connect to PRTG" gate (#prtgpop.gate); once
     Connect succeeds for the first time, this swaps it back to the normal small
     floating popup (reused later for session-expiry re-auth) and reveals the
     rest of the tool. Runs only once per load. */
  function openApp(){
    var p=$('prtgpop');
    if(!p.classList.contains('gate'))return;
    p.classList.remove('gate');
    p.hidden=true;
    $('appHeader').hidden=false;
    $('appMain').hidden=false;
  }
  function placePop(){
    var p=$('prtgpop'), bar=$('prtgbar'), msg=$('prtgmsg'), r, top;
    if(!p||p.hidden||p.classList.contains('gate'))return;
    r=bar.getBoundingClientRect();if(!r.height)r=$('modebar').getBoundingClientRect();top=r.bottom+(msg.hidden?0:msg.offsetHeight)+6;
    p.style.left=(r.left+8)+'px';p.style.width=Math.max(260,r.width-16)+'px';p.style.top=top+'px';p.style.maxHeight=Math.max(180,window.innerHeight-top-12)+'px';
  }
  function say(msg,kind){var n=$('pushstatus'), m=$('pushmsg');n.textContent=msg;n.className='note pst'+(kind?' '+kind:'');if(m){m.textContent=msg;m.className='note pst'+(kind?' '+kind:'');}banner(msg,kind);}
  /* PRTG wants a login: say so and open the panel with the fields, ready to type */
  function authNeeded(){
    $('pushauth').hidden=false;S.lastErr='login needed';S.authAsked=true;S.needLogin=true;
    $('prtgpop').hidden=false;swSync();
    try{$('pushuser').focus();}catch(e){}
  }
  /* the page's own address, or null when it was opened from a file */
  function pageOrigin(){try{return (location.protocol==='http:'||location.protocol==='https:')?location.origin:null;}catch(e){return null;}}
  /* only the server part of what is typed is used: a pasted page address such as https://localhost:8443/index.htm still works, and a missing https:// is added */
  function normalize(v){
    v=String(v||'').trim();if(!v)return '';
    try{return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(v)?v:'https://'+v).origin;}catch(e){return v.replace(/\/+$/,'');}
  }
  /* PRTG's new interface (for example https://localhost:1616) is a separate front end. It answers every address it does not know with its own page, and serves the classic server (the one that holds maps, objects and settings) under /api/v1. So on such an address every request goes to /api/v1/ plus the classic path. Found once per address, when connecting. */
  var UIPFX={};
  function rawBase(){return normalize($('pushserver').value);}
  function base(){var o=rawBase();return o?o+(UIPFX[o]||''):'';}
  function newUI(){var o=rawBase();return !!(o&&UIPFX[o]);}
  function detectUI(o){
    if(!o||Object.prototype.hasOwnProperty.call(UIPFX,o))return Promise.resolve();
    return fetchWithTimeout(o+'/',{credentials:'omit'}).then(function(r){return r.text();}).then(function(t){
      UIPFX[o]=/PRTG UI is loading|\/bundle\/main-/.test(t)?'/api/v1':'';
    }).catch(function(){});
  }
  /* this page always runs as a chrome-extension:// page now, never opened from
     PRTG itself, so pageOrigin() is always null here; a server address is
     always required, and the old "copy this file into PRTG's webroot" note
     (#pushhow) no longer applies. */
  function describeWhere(){
    var b=base(), n=$('pushwhere');
    $('pushhow').hidden=true;
    if(b){n.textContent='Will connect to '+rawBase()+(newUI()?' (the new PRTG interface; maps and objects are read through its classic service).':'.');n.className='note pst';}
    else{n.textContent='Enter your PRTG server\u2019s address below.';n.className='note pst';}
  }
  /* browsers deliberately reject every network-level fetch() failure with the
     same generic error, whatever the real cause -- an untrusted certificate,
     DNS failure, connection refused, a firewall -- so a page's own JS (this
     extension included) cannot tell which one happened; that's intentional,
     the same kind of restriction as the CSRF-token redaction seen earlier
     while testing, just enforced by the browser instead of a dev tool. The
     one case that IS genuinely detectable (no network at all) is split out;
     everything else becomes an ordered checklist instead of one paragraph,
     cert-trust first since that's by far the most common cause here (PRTG's
     default self-signed certificate). */
  function cannotReach(b){
    var addr=b||'your PRTG server';
    if(window.navigator&&navigator.onLine===false){
      return 'This device has no network connection right now. Check your connection, then press Connect again.';
    }
    return 'Could not reach '+addr+'.\n'
      +'• First time connecting here? Open '+addr+' in a new tab, click through the certificate warning, then press Connect again.\n'
      +'• Otherwise, check the address/port, that PRTG is running there, and that this extension has permission for that address.';
  }
  /* PRTG's own pages add an anti-CSRF token to every request that is not a GET (it comes from a <meta name="csrf-token"> tag). The loader keeps the token
     before it replaces the page; failing that, it is read from the page, or from a PRTG page fetched once. */
  var tokenPromise=null;
  function csrf(){
    if(tokenPromise)return tokenPromise;
    var t=null;
    try{t=window.__prtgCsrf||((document.querySelector('meta[name="csrf-token"]')||{}).content)||null;}catch(e){}
    if(t){tokenPromise=Promise.resolve(t);return tokenPromise;}
    tokenPromise=fetch(base()+'/index.htm',{credentials:base()?'omit':'same-origin',headers:{'X-Requested-With':'XMLHttpRequest'}}).then(function(r){return r.text();}).then(function(h){
      var m=/<meta[^>]+name=["']csrf-token["'][^>]*content=["']([^"']+)["']/i.exec(h)||/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']csrf-token["']/i.exec(h);
      return m?m[1]:'';
    }).catch(function(){return '';});
    return tokenPromise;
  }
  /* your login, if PRTG asked for one: a username with a passhash, or an API token. Only ever sent, never stored. */
  function authParams(){
    var u=String(($('pushuser')||{}).value||'').trim(), k=String(($('pushsecret')||{}).value||'').trim(), o={};
    if(!k)return o;
    if(u){o.username=u;o.passhash=k;}else if(!CFG.connection.loginRequired){o.apitoken=k;}
    return o;
  }
  function loginFilled(){return !!(String($('pushuser').value||'').trim()&&String($('pushsecret').value||'').trim());}
  /* the card says what is missing, and where */
  function loginMark(userBad,secretBad,userMsg,secretMsg){
    $('lgfuser').classList.toggle('bad',!!userBad);$('lgfsecret').classList.toggle('bad',!!secretBad);
    $('pushusererr').textContent=userBad?(userMsg||''):'';$('pushsecreterr').textContent=secretBad?(secretMsg||''):'';
  }
  function loginMissing(){
    var u=!String($('pushuser').value||'').trim(), k=!String($('pushsecret').value||'').trim();
    loginMark(u,k,'Enter your PRTG username.','Enter your passhash.');
    S.lastErr='sign in first';S.needLogin=true;$('prtgpop').hidden=false;swSync();
    try{(u?$('pushuser'):$('pushsecret')).focus();}catch(e){}
  }
  function withAuth(params){var o={},k,a=authParams();for(k in (params||{}))o[k]=params[k];for(k in a)o[k]=a[k];return o;}
  function qstring(p,raw){return Object.keys(p).map(function(k){var v=encodeURIComponent(p[k]);if(raw)v=v.replace(/%2C/gi,',');return encodeURIComponent(k)+'='+v;}).join('&');}
  /* fetch() rejects with the same generic TypeError for every network-level
     failure -- a bad/untrusted certificate, DNS failure, connection refused,
     a timeout, CORS -- the browser deliberately doesn't expose which one, so
     there is no way to show a cert-specific message vs. a DNS-specific one.
     cannotReach() below covers the realistic causes in one message instead.
     A hard timeout is added here (fetch has none of its own) so a slow or
     stalled connection always surfaces a clear error rather than leaving
     "Connecting..." on screen forever with no feedback. */
  var HTTP_TIMEOUT_MS=20000;
  function fetchWithTimeout(url,init){
    if(!(window.AbortController))return fetch(url,init);
    var ac=new AbortController(), t=setTimeout(function(){ac.abort();},HTTP_TIMEOUT_MS);
    if(document.getElementById('pushconnect')&&document.getElementById('pushconnect').disabled)CONN.acs.push(ac);   /* a request made while connecting can be cancelled */
    init=Object.assign({},init,{signal:ac.signal});
    return fetch(url,init).then(function(r){clearTimeout(t);return r;},function(e){clearTimeout(t);throw e;});
  }
  /* credentials:'omit' (not 'include') for a cross-origin server -- this page
     always runs from chrome-extension://..., so b is always set and this is
     always the live branch. 'include' would send any existing PRTG session
     cookie for that origin (e.g. from the user being logged in via a normal
     browser tab) along with every request, which lets a stale cookie session
     authenticate the request regardless of what's typed in the login card --
     wrong credentials would silently "work". 'omit' makes the typed
     username/passhash (or API token) the only thing that can authenticate a
     request here, matching what the login card already tells the person. */
  function http(method,path,params){
    var b=base(), p=withAuth(params), url=b+path;
    var headers={'X-Requested-With':'XMLHttpRequest','Accept':(method==='GET')?'application/json, text/javascript, */*; q=0.01':'*/*'};
    var go=function(tok){
      var init={method:method,credentials:b?'omit':'same-origin',headers:headers};
      if(method==='POST'){headers['Content-Type']='application/x-www-form-urlencoded; charset=UTF-8';if(tok)headers['anti-csrf-token']=tok;init.body=qstring(p,false);}
      else{var qs=qstring(p,true);if(qs)url+=(url.indexOf('?')>-1?'&':'?')+qs;}
      return fetchWithTimeout(url,init).then(function(r){
        return r.text().then(function(t){
          if(!r.ok){var e=new Error('PRTG answered '+r.status+' for '+path+'.');e.status=r.status;throw e;}
          return t;
        });
      },function(e){throw new Error((e&&e.name==='AbortError')?('Timed out waiting for '+(b||'your PRTG server')+' to answer ('+(HTTP_TIMEOUT_MS/1000)+'s). '+cannotReach(b)):cannotReach(b));});
    };
    return method==='POST'?csrf().then(go):go('');
  }
  function parseJson(t,what){
    try{return JSON.parse(t);}
    catch(e){throw new Error(what+' did not come back as data. Are you logged in to PRTG, and is this page open from your PRTG server?');}
  }
  /* the Custom HTML element is looked up by name in PRTG's own catalogue, as the designer does when you drag one onto a map */
  function findCustomHtml(cat){
    var c, i, e, byName=null;
    for(c in cat){
      if(!Array.isArray(cat[c]))continue;
      for(i=0;i<cat[c].length;i++){
        e=cat[c][i];
        if(!e||typeof e!=='object')continue;
        if(/ownhtmlonly/i.test(String(e.value||'')))return e.value;
        if(e.name==='Custom HTML element'&&!byName)byName=e.value;
      }
    }
    return byName;
  }
  /* the name shown for one of PRTG's own built-in icon files, from its path: "/defaulticons1/A1 pc.svg" -> "A1 pc" */
  function iconName(path){
    var m=/([^\/\\]+)\.(svg|png)$/i.exec(String(path||''));
    return m?m[1].replace(/[_-]+/g,' ').trim():String(path||'');
  }
  /* every object file PRTG lists, as {cat, name, value}; value is what PRTG wants as mapobject_ when the object is placed on a map.
     A plain icon file (PRTG's own built-in device/status pictures, listed as bare paths rather than {name,value}) is included the
     same way: placed and bound to a target exactly like any other object, PRTG colors it by that target's live status itself. */
  function parseCatalog(cat){
    var out=[], c, i, e;
    for(c in cat){
      if(!Array.isArray(cat[c]))continue;
      for(i=0;i<cat[c].length;i++){
        e=cat[c][i];
        if(e&&typeof e==='object'&&typeof e.value==='string'&&/\.htm$/i.test(e.value)&&!/ownhtmlonly/i.test(e.value))out.push({cat:c,name:String(e.name||'').trim(),value:e.value});
        else if(typeof e==='string'&&/\.(svg|png)$/i.test(e))out.push({cat:c,name:iconName(e),value:e,icon:true});
      }
    }
    return out;
  }
  function libLoad(){try{var o=JSON.parse(localStorage.getItem(CFG.keys.library)||'{}');return (o&&typeof o==='object')?o:{};}catch(e){return {};}}
  function keyOf(cat,name){return (String(cat)+'\u0001'+String(name)).toLowerCase();}
  /* ---- what each push did, so it can be undone */
  function loadHist(){try{var a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
  function saveHist(a){try{localStorage.setItem(KEY,JSON.stringify(a.slice(-20)));return true;}catch(e){S.storeFail=true;return false;}}
  /* a record that could not be saved (most likely the browser's storage for this extension is full) is said in the result, not hidden */
  function storeWarn(){return S.storeFail?' Warning: this browser could not save its record of what was done (its storage for this extension may be full). The next push may add these items again instead of updating them, and Undo may not know about this one.':'';}
  function entryAdded(e){return e.added||e.subids||[];}       /* pushes made by earlier versions only recorded what they added */
  function entryCount(e){return entryAdded(e).length+(e.updated||[]).length+(e.removed||[]).length;}
  function undoCount(e){return entryAdded(e).length+(e.updated||[]).filter(function(u){return u.before;}).length;}   /* what Undo can reverse: deleted items cannot be brought back */
  function mapId(){return $('pushmap').value;}
  function mapName(){var o=$('pushmap').options[$('pushmap').selectedIndex];return o?o.textContent:'';}
  function lastPush(){var h=loadHist(),i;for(i=h.length-1;i>=0;i--){if(sameTarget(h[i])&&undoCount(h[i]))return h[i];}return null;}
  function addsOnly(e){return !(e.updated&&e.updated.length)&&!(e.removed&&e.removed.length);}
  /* ---- what was sent for each Dashboard item, per server, map and layout */
  function loadSync(){try{var o=JSON.parse(localStorage.getItem(SKEY)||'{}');return (o&&typeof o==='object')?o:{};}catch(e){return {};}}
  function saveSync(o){
    var ks=Object.keys(o).sort(function(a,b){return (o[b].at||0)-(o[a].at||0);}), n={};
    ks.slice(0,12).forEach(function(k){n[k]=o[k];});
    try{localStorage.setItem(SKEY,JSON.stringify(n));return true;}catch(e){S.storeFail=true;return false;}
  }
  /* the server a push or map edit went to. History entries carry it, so Undo never sends one server's item ids to another server that has a map with the same id.
     Entries saved before 1.5.41 have no server, so they are never offered for Undo. */
  function srvId(){return base()||pageOrigin()||'';}
  function sameTarget(e){return !!e&&typeof e.srv==='string'&&e.srv===srvId()&&String(e.map)===String(mapId());}
  function syncKey(){return srvId()+'|'+mapId()+'|'+DASHAPI.uid();}
  function getRec(){var r=loadSync()[syncKey()];return (r&&r.items)?r:{at:0,items:{}};}
  function putRec(r){var o=loadSync();r.at=Date.now();o[syncKey()]=r;saveSync(o);}
  function dropRec(){var o=loadSync();delete o[syncKey()];saveSync(o);}
  function hasRec(){return Object.keys(getRec().items).length>0;}
  function updateButtons(){
    var ready=!!(S.maps&&S.objFile&&mapId());
    $('pushmap').disabled=!(S.maps&&S.maps.length)||S.busy;
    $('newmapToggle').disabled=!S.maps||S.busy;
    $('deleteMapBtn').disabled=!S.maps||S.busy||!$('pushmap').value;
    $('pushreview').disabled=!ready||S.busy;
    $('objsamples').disabled=!(S.maps&&mapId())||S.busy;
    $('exload').disabled=!(S.maps&&mapId())||S.busy;
    try{mcSync();}catch(e){}
    try{scSync();}catch(e){}
    $('objrefresh').disabled=!(S.maps&&S.objFile)||S.busy;
    updateTarget();
    if(typeof xeButtons==='function')xeButtons();
    if(typeof swSync==='function')swSync();
    var lp=ready?lastPush():null, n=lp?undoCount(lp):0;
    $('pushundo').disabled=!lp||S.busy;
    var undoLabel='Undo last push';
    if(lp){var unit=addsOnly(lp)?(n===1?'item':'items'):(n===1?'change':'changes');undoLabel='Undo last push ('+n+' '+unit+')';}
    $('pushundo').textContent=undoLabel;
    var rec=ready&&hasRec();
    $('pushforget').hidden=!rec;$('pushforgetnote').hidden=!rec;$('pushforget').disabled=S.busy;
    if(!S.forgetArm)$('pushforget').textContent='Forget what was pushed';
    $('pushgo').disabled=S.busy||!S.reviewed;
  }
  function norm(html){var d=document.createElement('div');d.innerHTML=html;return d.innerHTML;}   /* the designer normalises HTML Before through an element before it saves it */
  function plan(){
    var items=DASHAPI.pushItems(), ox=parseInt($('pushoffx').value,10)||0, oy=parseInt($('pushoffy').value,10)||0, z0=parseInt($('pushz').value,10)||0;
    return items.map(function(it,i){
      var links=it.fonts.map(function(h){return '<link href="'+h+'" rel="stylesheet">';}).join('');
      var o={id:it.id,name:it.name,type:it.type,left:it.left+ox,top:it.top+oy,width:it.width,height:it.height,z:z0+i};
      if(it.object){o.kind='object';o.object=it.object;o.html=it.html||'';if(it.after)o.after=it.after;if(it.link)o.link=it.link;}
      else{o.kind='paste';o.html=norm(links+it.html);}
      return o;
    });
  }
  function fullSet(it){var o={left:it.left,top:it.top,width:it.width,height:it.height,z:it.z,html:it.html};if(it.after)o.after=it.after;if(it.link)o.link=it.link;return o;}   /* after and link only when set, so items pushed before keep their record */
  function objIdent(it){return it.kind==='object'?{value:it.object.value,target:it.object.target.id}:undefined;}   /* which file and which target an item was added with: PRTG fixes them when the item is added */
  /* each item is new, changed, unchanged, or (remembered but gone from the Dashboard) removed */
  function classify(p){
    var rec=getRec(), seen={}, out={items:[],removed:[],nNew:0,nChanged:0,nSame:0,nMissing:0,nReplace:0,hadRec:Object.keys(rec.items).length>0};
    p.forEach(function(it){
      var r=rec.items[it.id], why=[];
      seen[it.id]=1;
      if(it.kind==='object'&&S.catalog&&it.object.value!==S.objFile&&!S.catalog.some(function(c){return c.value===it.object.value;})){it.status='missing';out.nMissing++;out.items.push(it);return;}   /* the file is not in PRTG: it cannot be placed */
      if(!r||r.type&&r.type!==it.type){it.status='new';out.nNew++;}
      else{
        it.subid=r.subid;
        if(it.kind==='object'&&(!r.obj||r.obj.value!==it.object.value||String(r.obj.target)!==String(it.object.target.id))){
          it.replace=true;out.nReplace++;
          why.push(r.obj&&r.obj.value!==it.object.value?'different object file':'different target');
        }
        else if(!r.sent)why.push('not finished last time');
        else{
          if(r.sent.html!==it.html||(r.sent.after||'')!==(it.after||'')||(r.sent.link||'')!==(it.link||''))why.push('code');
          if(r.sent.left!==it.left||r.sent.top!==it.top)why.push('moved');
          if(r.sent.width!==it.width||r.sent.height!==it.height)why.push('resized');
          if(r.sent.z!==it.z)why.push('stacking order');
        }
        it.reasons=why;
        if(why.length){it.status='changed';out.nChanged++;}else{it.status='same';out.nSame++;}
      }
      out.items.push(it);
    });
    Object.keys(rec.items).forEach(function(k){
      if(!seen[k]){var r=rec.items[k];out.removed.push({id:k,name:r.name||('Item '+k),subid:r.subid});}
    });
    return out;
  }
  function removeTicked(){var e=$('pushremove');return !!(e&&e.checked);}
  function sig(c,rm){
    return JSON.stringify([mapId(),base(),rm,c.items.map(function(i){return [i.id,i.status,i.left,i.top,i.width,i.height,i.z,i.html,i.object?i.object.value+'|'+i.object.target.id:''];}),c.removed.map(function(r){return r.id;})]);
  }
  function refreshGo(){
    var c=S.cls;if(!c)return;
    var rm=removeTicked()&&c.removed.length, n=c.nNew+c.nChanged+(rm?c.removed.length:0), skip=c.nMissing?(' '+c.nMissing+(c.nMissing===1?' object is':' objects are')+' not in PRTG\u2019s list yet and will be skipped.'):'';
    if(!n){
      $('pushgo').hidden=true;S.reviewed=null;
      if(c.nMissing&&!c.removed.length&&!c.nSame)say('Nothing can be pushed yet.'+skip+' Copy the file into PRTG\u2019s mapobjects folder, then switch PRTG off and on again.','err');
      else say(c.removed.length?('The map matches the Map designer apart from the removed '+(c.removed.length===1?'item. It is':'items. They are')+' still on the map: tick the box below to delete '+(c.removed.length===1?'it':'them')+'.'):(c.nSame?'The map already matches the Dashboard.':'Nothing to push.'),'');
    }else{
      $('pushgo').textContent='Push '+n+((c.nChanged||rm||c.nSame)?(n===1?' change':' changes'):(n===1?' item':' items'))+' to PRTG';
      $('pushgo').hidden=false;S.reviewed=sig(c,!!rm);
      say('Check the list, then push.'+skip,'');
    }
    updateButtons();
  }
  function review(){
    var p=plan(), c=classify(p), box=$('pushlist'), mixed=c.hadRec;
    S.cls=c;
    box.innerHTML='';box.hidden=false;
    function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
    if(!p.length&&!c.removed.length){
      box.appendChild(el('p','psum','Nothing to push. Add items on the canvas first.'));
      S.reviewed=null;$('pushgo').hidden=true;updateButtons();return;
    }
    var sum=el('p','psum');
    var hasObj=p.some(function(i){return i.kind==='object';});
    if(!mixed&&!c.nMissing)sum.textContent=p.length+(p.length===1?' item will be added to ':' items will be added to ')+'\u201C'+mapName()+'\u201D'+(hasObj?', back to front: pasted pieces as Custom HTML elements, PRTG objects by their file.':' as Custom HTML elements, back to front.')+' Items already on the map are not touched.';
    else{
      var parts=[];
      if(c.nNew)parts.push(c.nNew+' new');if(c.nChanged)parts.push(c.nChanged+' changed');if(c.nSame)parts.push(c.nSame+' unchanged');if(c.removed.length)parts.push(c.removed.length+' removed from the Map designer');if(c.nMissing)parts.push(c.nMissing+' not in PRTG\u2019s list yet');
      sum.textContent=(mixed?'Compared with what was pushed to \u201C'+mapName()+'\u201D last time: ':'This push to \u201C'+mapName()+'\u201D: ')+parts.join(', ')+'.'+(mixed?' Unchanged items are not touched. A changed item is rewritten completely (position, size, order and code), so anything you changed on it by hand in PRTG is replaced.':'')+(c.nReplace?' A replaced object is added again and the old one then deleted, because PRTG fixes an item\u2019s file and target when it is added.':'');
    }
    box.appendChild(sum);
    var t=el('table'), h=el('thead'), tb=el('tbody');
    h.innerHTML='<tr><th>Item</th><th>Left</th><th>Top</th><th>Width</th><th>Height</th></tr>';
    function row(it,status,note,cls){
      var r=el('tr',cls), c0=el('td');
      c0.title=it.name;c0.appendChild(el('span','pn',it.name));
      if(it.kind==='object'){var tg=it.object.target;c0.appendChild(el('span','pt'+((tg&&(tg.id||tg.name))?'':' warn'),it.object.cat+' \u2192 '+((tg&&tg.name)||(tg&&tg.id?('ID '+tg.id):'no target chosen'))+(it.object.targetDefault?' (preview default)':'')));}
      if(mixed||status==='removed'||status==='missing'){c0.appendChild(el('span','ps '+status,note));}
      r.appendChild(c0);
      [it.left,it.top,it.width,it.height].forEach(function(v){r.appendChild(el('td','',v===undefined?'':v));});
      tb.appendChild(r);
    }
    c.items.forEach(function(it){
      row(it,it.status,it.status==='new'?'New':(it.status==='same'?'Unchanged':(it.status==='missing'?'Not in PRTG\u2019s list yet: copy the file into the mapobjects folder':(it.replace?'Replace: ':'Changed: ')+it.reasons.join(', '))),it.status);
    });
    c.removed.forEach(function(r){row({name:r.name},'removed','Removed from the Map designer','removed');});
    t.appendChild(h);t.appendChild(tb);box.appendChild(t);
    if(c.removed.length){
      var lab=el('label','prm'), cb=document.createElement('input');
      cb.type='checkbox';cb.id='pushremove';cb.addEventListener('change',refreshGo);
      lab.appendChild(cb);lab.appendChild(el('span','',c.removed.length===1?'Also delete the removed item from the map':'Also delete the '+c.removed.length+' removed items from the map'));
      box.appendChild(lab);
    }
    refreshGo();
  }
  /* the server address is arbitrary and only known once typed, so this extension
     declares no fixed host_permissions; instead it asks Chrome for permission on
     exactly that origin, the first time Connect is pressed for it. */
  function ensureHostPermission(origin){
    if(!origin)return Promise.resolve(true);
    if(!(window.chrome&&chrome.permissions&&chrome.permissions.request)){return Promise.resolve(true);}
    var pattern=origin.replace(/\/+$/,'')+'/*';
    return new Promise(function(resolve){
      chrome.permissions.contains({origins:[pattern]},function(has){
        if(has){resolve(true);return;}
        chrome.permissions.request({origins:[pattern]},function(granted){resolve(!!granted);});
      });
    });
  }
  /* remembers the last-used server address (always), and -- only when the
     "Remember this server, username and passhash" checkbox is on -- the
     username and passhash too, in chrome.storage.local: local to this
     device/browser profile, never synced anywhere. Both are read back on
     load to prefill the login card and, when credentials were remembered,
     to retry connecting automatically instead of always starting from a
     blank login gate. */
  var STORE_KEYS=['pm_lastServer','pm_remember','pm_user','pm_secret'];
  function storageGet(cb){
    if(!(window.chrome&&chrome.storage&&chrome.storage.local)){cb({});return;}
    try{chrome.storage.local.get(STORE_KEYS,function(items){cb(items||{});});}catch(e){cb({});}
  }
  function storageSet(obj){
    if(!(window.chrome&&chrome.storage&&chrome.storage.local))return;
    try{chrome.storage.local.set(obj);}catch(e){}
  }
  function storageRemove(keys){
    if(!(window.chrome&&chrome.storage&&chrome.storage.local))return;
    try{chrome.storage.local.remove(keys);}catch(e){}
  }
  function rememberConnection(){
    var b=rawBase();if(!b)return;
    if($('pushremember').checked){
      storageSet({pm_lastServer:b,pm_remember:true,pm_user:String($('pushuser').value||''),pm_secret:String($('pushsecret').value||'')});
    }else{
      storageSet({pm_lastServer:b,pm_remember:false});
      storageRemove(['pm_user','pm_secret']);
    }
  }
  /* the gauge loader (img/gauge.png with the needle img/gauge-needle.png sweeping over it). gloadShow puts it over a host element after a short wait, so a quick
     answer never flashes it; the same key shows it again with new words; gloadHide removes it. */
  var GLOAD={};
  function gloadShow(host,key,text,small){
    var n=GLOAD[key];
    if(!n){
      n=document.createElement('div');n.setAttribute('role','status');n.setAttribute('aria-live','polite');
      n.innerHTML='<div class="gl-g" aria-hidden="true"><img src="img/gauge.png" alt=""><img class="gl-n" src="img/gauge-needle.png" alt=""></div><span class="gl-t"></span>';
      n.style.display='none';host.appendChild(n);GLOAD[key]=n;
      n._t=setTimeout(function(){n.style.display='';},150);
    }
    n.className='gl-ov'+(small?' gl-sm':'');
    n.querySelector('.gl-t').textContent=text||'Loading\u2026';
  }
  function gloadHide(key){var n=GLOAD[key];if(!n)return;clearTimeout(n._t);if(n.parentNode)n.parentNode.removeChild(n);delete GLOAD[key];}
  /* Cancel on the connecting screen: stops the waiting, aborts the requests still in flight and brings the address back */
  var CONN={gen:0,acs:[]}, CONNCANCEL={cancelled:true};
  function connCancel(){
    var i;
    CONN.gen++;
    for(i=0;i<CONN.acs.length;i++){try{CONN.acs[i].abort();}catch(e){}}
    CONN.acs=[];
    gloadHide('conn');
    $('pushconnect').disabled=false;S.maps=null;S.objFile=null;S.lastErr='cancelled';
    say('Cancelled. Change the address if you need to, then press Connect.','');
    $('prtgpop').hidden=false;swSync();updateButtons();
    try{$('pushserver').focus();$('pushserver').select();}catch(e){}
  }
  function connect(){
    describeWhere();
    if(!pageOrigin()&&!base()){say('Enter your PRTG server\u2019s address below, then press Connect.','err');S.lastErr='enter a server address';$('prtgpop').hidden=false;try{$('pushserver').focus();}catch(e){}swSync();return;}
    if(CFG.connection.loginRequired&&!loginFilled()){loginMissing();return;}
    loginMark(false,false);
    say('Connecting\u2026','');
    gloadShow($('prtgpop').querySelector('.lgcard'),'conn','Connecting to PRTG\u2026');
    var gen=++CONN.gen, gn=GLOAD['conn'];CONN.acs=[];
    if(gn&&!gn.querySelector('.gl-x')){var cb=document.createElement('button');cb.type='button';cb.className='gl-x';cb.textContent='Cancel';cb.addEventListener('click',connCancel);gn.appendChild(cb);}
    $('pushconnect').disabled=true;S.maps=null;S.objFile=null;S.reviewed=null;S.cls=null;$('pushgo').hidden=true;$('pushlist').hidden=true;S.lastErr=null;S.reauth=!$('prtgpop').hidden;S.authAsked=false;swSync();
    ensureHostPermission(rawBase()).then(function(ok){
      if(gen!==CONN.gen)return;
      if(!ok){gloadHide('conn');$('pushconnect').disabled=false;say('This page needs permission to talk to that server. Press Connect again and allow it when Chrome asks.','err');S.lastErr='permission not granted';swSync();return;}
      detectUI(rawBase()).then(function(){if(gen!==CONN.gen)throw CONNCANCEL;describeWhere();gloadShow($('prtgpop').querySelector('.lgcard'),'conn','Reading your maps\u2026');return http('GET','/api/table.json',{content:'maps',columns:'name,objid'});}).then(function(t){
        if(gen!==CONN.gen)throw CONNCANCEL;
        var j=parseJson(t,'The list of maps'), maps=(j&&j.maps)||[], sel=$('pushmap');
        sel.innerHTML='';
        maps.forEach(function(m){var o=document.createElement('option');o.value=String(m.objid);o.textContent=m.name;sel.appendChild(o);});
        S.maps=maps;
        gloadShow($('prtgpop').querySelector('.lgcard'),'conn','Reading the object list\u2026');
        return http('GET','/api/mapobject.json');
      }).then(function(t){
        if(gen!==CONN.gen)throw CONNCANCEL;
        var catj=parseJson(t,'The list of object files');
        S.objFile=findCustomHtml(catj);S.catalog=parseCatalog(catj);pubObjs();S.tgt={};
        openApp();
        rememberConnection();
        if(!S.maps.length)say('Connected, but there are no maps. Create an empty map in PRTG first.','err');
        else if(!S.objFile)say('Connected, but PRTG\u2019s object list has no \u201CCustom HTML element\u201D, so nothing can be pushed.','err');
        else say('Connected. '+S.maps.length+(S.maps.length===1?' map':' maps')+' found.','ok');
      }).catch(function(err){
        if(err===CONNCANCEL||gen!==CONN.gen)return;
        S.maps=null;S.objFile=null;S.catalog=null;S.lastErr=(err&&err.status===401)?'login needed':((err&&err.message)||'could not connect');
        if(err&&err.status===401){
          authNeeded();
          if(CFG.connection.loginRequired){loginMark(true,true,'','PRTG did not accept this username and passhash.');say('PRTG did not accept this username and passhash. Check them and press Connect again.','err');}
          else say('PRTG refused the request (401: not authorised), even though you are logged in here. Enter your username and passhash (or an API token) below, then press Connect again. In PRTG, your passhash is on your My Account page.','err');
        }else say(err.message,'err');
      }).then(function(){
        if(gen!==CONN.gen)return;
        gloadHide('conn');
        $('pushconnect').disabled=false;PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};trReset();updateButtons();renderObjList();pickerSync();pvSync();resolveDefaults();
        $('objnote').textContent=objNoteText();
      });
    });
  }
  function updateTarget(){
    var m=$('pushmap'), t=$('pushtarget');
    if(!t)return;
    var has=!(m.disabled||!m.options.length||m.selectedIndex<0);
    t.textContent=has?'Pushes to the map \u201C'+m.options[m.selectedIndex].text+'\u201D. Change it in the Map step.':'No map chosen yet. Choose one in the Map step.';
    /* the same, shown plainly at the top of the Push step */
    var pt=document.getElementById('pushto'), host=document.getElementById('pushfs')&&document.querySelector('#pushfs .row3');
    if(!pt&&host){pt=document.createElement('div');pt.id='pushto';pt.setAttribute('aria-live','polite');host.parentNode.insertBefore(pt,host);}
    if(pt){
      pt.textContent='';
      var lb=document.createElement('span');lb.className='pt-l';lb.textContent='Pushing to';pt.appendChild(lb);
      var nm=document.createElement('strong');nm.textContent=has?m.options[m.selectedIndex].text:'no map chosen yet';pt.appendChild(nm);
      if(has&&m.value){var idn=document.createElement('small');idn.textContent='map '+m.value;pt.appendChild(idn);}
      pt.classList.toggle('none',!has);
    }
  }
  document.addEventListener('prtgstate',function(){updateTarget();});
  $('pushmap').addEventListener('change',function(){updateTarget();});
  /* PRTG's own "Add Map" dialog (addmap.htm) posts to addmap2.htm with these
     exact field names; mapurl_ is a GUID PRTG's page normally generates
     server-side into a hidden field, so we generate one the same shape here.
     No background-image upload (upfile_) support -- that field is optional
     on PRTG's own form too, and multipart handling isn't worth adding for it. */
  function newMapGuid(){
    if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();
    var s=[], i, c='0123456789abcdef';
    for(i=0;i<36;i++)s.push(c[Math.floor(Math.random()*16)]);
    s[8]=s[13]=s[18]=s[23]='-';
    return s.join('');
  }
  function newMapMsg(text,kind){var n=$('newmapmsg');n.textContent=text||'';n.className='note pst'+(kind?' '+kind:'');}
  /* addmap2.htm's own form (addmap.htm) is enctype="multipart/form-data",
     and PRTG's server-side handler for it does not tolerate being sent
     application/x-www-form-urlencoded instead -- it crashes with an access
     violation (null-pointer read) trying to parse the body as multipart
     regardless. http()'s shared POST path always sends urlencoded, so this
     endpoint needs its own multipart-encoded POST, built with FormData so
     the browser sets the correct multipart boundary automatically. */
  function httpMultipart(path,params){
    var b=base(), p=withAuth(params), url=b+path;
    var fd=new FormData(), k;
    for(k in p)fd.append(k,p[k]);
    var headers={'X-Requested-With':'XMLHttpRequest','Accept':'*/*'};
    return csrf().then(function(tok){
      if(tok)headers['anti-csrf-token']=tok;
      return fetch(url,{method:'POST',credentials:b?'omit':'same-origin',headers:headers,body:fd});
    }).then(function(r){
      return r.text().then(function(t){
        if(!r.ok){var e=new Error('PRTG answered '+r.status+' for '+path+'.');e.status=r.status;throw e;}
        return t;
      });
    },function(){throw new Error(cannotReach(b));});
  }
  function createMap(){
    var name=String($('newmapname').value||'').trim();
    var w=parseInt($('newmapw').value,10)||0, h=parseInt($('newmaph').value,10)||0;
    if(!name){newMapMsg('Enter a name for the map.','err');try{$('newmapname').focus();}catch(e){}return;}
    if(!(w>0)||!(h>0)){newMapMsg('Width and height must be greater than 0.','err');return;}
    $('newmapgo').disabled=true;newMapMsg('Creating\u2026','');
    /* addmap2.htm creates the map then issues a redirect to map.htm?id=...,
       which fetch() follows automatically; whatever that followed response's
       status turns out to be (often not a plain 200 in a bare-fetch context)
       is NOT a reliable signal that the map wasn't created. So a POST error
       here is remembered but not trusted on its own -- the map list is
       re-queried either way, and that's what decides success or failure. */
    var before={}; (S.maps||[]).forEach(function(m){before[m.objid]=true;});
    var postErr=null;
    httpMultipart('/addmap2.htm',{mapurl_:newMapGuid(),name_:name,width_:String(w),height_:String(h),pubaccess_:'0'}).catch(function(e){postErr=e;}).then(function(){
      return http('GET','/api/table.json',{content:'maps',columns:'name,objid'});
    }).then(function(t){
      var j=parseJson(t,'The list of maps'), maps=(j&&j.maps)||[], sel=$('pushmap');
      var newMatch=null, anyMatch=null;
      sel.innerHTML='';
      maps.forEach(function(m){
        var o=document.createElement('option');o.value=String(m.objid);o.textContent=m.name;sel.appendChild(o);
        if(m.name!==name)return;
        if(!before[m.objid]&&(!newMatch||Number(m.objid)>Number(newMatch.objid)))newMatch=m;
        if(!anyMatch||Number(m.objid)>Number(anyMatch.objid))anyMatch=m;
      });
      var match=newMatch||anyMatch;
      S.maps=maps;
      if(!match){throw postErr||new Error('PRTG did not report an error, but the new map could not be found afterward.');}
      sel.value=String(match.objid);
      S.reviewed=null;S.cls=null;$('pushgo').hidden=true;$('pushlist').hidden=true;
      if(typeof exClear==='function')exClear();
      updateTarget();updateButtons();
      $('newmapname').value='';
      try{MAPSZ[match.objid]={w:w,h:h};szLast=String(match.objid);if(window.DASHAPI&&DASHAPI.newMapCanvas)DASHAPI.newMapCanvas(w,h,NEWLAY);}catch(e){}
      newMapMsg('Map successfully added.','ok');
      say('Created \u201C'+name+'\u201D and selected it.','ok');
      setTimeout(function(){mapMode('open');newMapMsg('');try{document.dispatchEvent(new CustomEvent('gotodashtab',{detail:'add'}));}catch(e){}},1200);
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      newMapMsg((err&&err.message)||'Could not create the map.','err');
    }).then(function(){$('newmapgo').disabled=false;});
  }
  /* the Map step has two modes: Open (pick a map, Load it) and New (create one) */
  function mapMode(m){
    var isNew=(m==='new');
    $('mapopen').hidden=isNew;$('newmapForm').hidden=!isNew;
    if(isNew)$('exfs').hidden=true;
    $('newmapToggle').classList.toggle('on',isNew);$('mapopenTab').classList.toggle('on',!isNew);
    $('newmapToggle').setAttribute('aria-selected',isNew?'true':'false');$('mapopenTab').setAttribute('aria-selected',isNew?'false':'true');
    if(isNew)try{$('newmapname').focus();}catch(e){}
  }
  /* a new map starts the size of the canvas it will be designed on, so what you build fits what PRTG made */
  (function(){var c=CFG.canvas||{};if(c.w>0)$('newmapw').value=String(c.w);if(c.h>0)$('newmaph').value=String(c.h);})();
  $('newmapToggle').addEventListener('click',function(){mapMode('new');});
  $('mapopenTab').addEventListener('click',function(){mapMode('open');});
  $('newmapcancel').addEventListener('click',function(){mapMode('open');newMapMsg('');});
  $('newmapgo').addEventListener('click',createMap);
  /* a new map's layout: Blank (choose one later from Canvas, Layouts) or one of the designer's layouts */
  var NEWLAY=null;
  function newLayBuild(){
    var g=$('newmaplayout');if(!g||!window.DASHAPI||!DASHAPI.layouts)return;
    var w=parseInt($('newmapw').value,10)||1920, h=parseInt($('newmaph').value,10)||1080, names=[['Blank: choose a layout later',null]];
    if(w<100||h<100){w=1920;h=1080;}
    DASHAPI.layouts().forEach(function(n,i){names.push([n,i]);});
    g.innerHTML='';
    names.forEach(function(x){
      var b=document.createElement('button');b.type='button';b.className='nml-t'+(NEWLAY===x[1]?' on':'')+(x[1]===null?' blank':'');
      b.setAttribute('data-tip',x[0]);b.setAttribute('aria-label',x[0]);b.setAttribute('aria-pressed',NEWLAY===x[1]?'true':'false');
      b.innerHTML=DASHAPI.layoutSvg(x[1],w,h)+(x[1]===null?'<span>Blank</span>':'');
      b.addEventListener('click',function(){NEWLAY=x[1];newLayBuild();});
      g.appendChild(b);
    });
    var nm=$('newmaplayname');if(nm)nm.textContent=(NEWLAY===null)?'Blank. Choose a layout later from Canvas, Layouts.':DASHAPI.layouts()[NEWLAY];
  }
  $('newmapw').addEventListener('change',newLayBuild);$('newmaph').addEventListener('change',newLayBuild);
  var nmResSync=window.PMRES.wire($('newmapres'),function(w,h){$('newmapw').value=String(w);$('newmaph').value=String(h);newLayBuild();});
  var nmRes=function(){nmResSync(parseInt($('newmapw').value,10),parseInt($('newmaph').value,10));};
  $('newmapw').addEventListener('input',nmRes);$('newmaph').addEventListener('input',nmRes);nmRes();
  try{newLayBuild();}catch(e){}
  $('newmapname').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();createMap();}});
  /* deletes the currently-selected map via PRTG's own deleteobject.htm?id=&approve=1
     (confirmed from PRTG's own deleteobject.htm webroot template -- a plain GET,
     no CSRF token required there, unlike the POST-based add/edit endpoints).
     Armed with a second click within 4s, mirroring the existing "Forget what was
     pushed" confirm pattern (S.forgetArm) rather than a native confirm() dialog. */
  function deleteMapMsg(text,kind){var n=$('deleteMapMsg');n.textContent=text||'';n.className='note pst'+(kind?' '+kind:'');n.hidden=!text;}
  function deleteMap(){
    var sel=$('pushmap'), id=sel.value, name=sel.options.length&&sel.selectedIndex>-1?sel.options[sel.selectedIndex].text:'';
    if(!id)return;
    if(!S.deleteArm){
      S.deleteArm=setTimeout(function(){S.deleteArm=null;$('deleteMapBtn').classList.remove('armed');$('deleteMapBtn').textContent='Delete this map';},4000);
      $('deleteMapBtn').classList.add('armed');$('deleteMapBtn').textContent='Click again to delete “'+name+'”';
      deleteMapMsg('Click the trash icon again to delete “'+name+'”.','warn');
      return;
    }
    clearTimeout(S.deleteArm);S.deleteArm=null;
    $('deleteMapBtn').classList.remove('armed');$('deleteMapBtn').textContent='Delete this map';
    $('deleteMapBtn').disabled=true;deleteMapMsg('Deleting…','');
    http('GET','/deleteobject.htm',{id:id,approve:'1'}).then(function(){
      return http('GET','/api/table.json',{content:'maps',columns:'name,objid'});
    }).then(function(t){
      var j=parseJson(t,'The list of maps'), maps=(j&&j.maps)||[], sel2=$('pushmap');
      sel2.innerHTML='';
      maps.forEach(function(m){var o=document.createElement('option');o.value=String(m.objid);o.textContent=m.name;sel2.appendChild(o);});
      S.maps=maps;
      if(maps.some(function(m){return String(m.objid)===id;})){
        deleteMapMsg('PRTG did not report an error, but “'+name+'” is still in the map list.','err');
      }else{
        S.reviewed=null;S.cls=null;$('pushgo').hidden=true;$('pushlist').hidden=true;
        if(typeof exClear==='function')exClear();
        deleteMapMsg('Deleted “'+name+'”.','ok');
      }
      updateTarget();updateButtons();
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      deleteMapMsg((err&&err.message)||'Could not delete the map.','err');
    }).then(function(){updateButtons();});
  }
  $('deleteMapBtn').addEventListener('click',deleteMap);
  $('pushmap').addEventListener('change',function(){
    if(S.deleteArm){clearTimeout(S.deleteArm);S.deleteArm=null;$('deleteMapBtn').classList.remove('armed');$('deleteMapBtn').textContent='Delete this map';}
    deleteMapMsg('');swSync();
  });
  function objNoteText(){
    return S.catalog?('PRTG lists '+S.catalog.length+(S.catalog.length===1?' object file.':' object files.')+' Pick one and add it to the canvas, then choose what it shows. Files you make in the Object builder appear here once they are in PRTG\u2019s mapobjects folder.'):'Connect to PRTG (step 1) to load the objects PRTG has. Files you make in the Object builder appear here once they are in PRTG\u2019s mapobjects folder.';
  }
  /* read only the list of object files again; the login, the maps and what is selected stay as they are */
  /* objects saved in Your objects that this PRTG server does not list: usually installed on a different PRTG core server */
  function missingMineText(){
    var lib=libLoad(), miss=[], f, k;
    for(f in lib){
      k=keyOf(lib[f].cat,lib[f].name);
      if(!S.catalog.some(function(e){return keyOf(e.cat,e.name)===k;}))miss.push(String(lib[f].name||f));
    }
    if(!miss.length)return '';
    return ' Not found on this PRTG server: '+miss.slice(0,5).join(', ')+(miss.length>5?' and '+(miss.length-5)+' more':'')+'. Were they installed on a different PRTG core server? The install script and ZIP put files on the computer where you run them.';
  }
  function refreshObjects(){
    var b=$('objrefresh'), had=S.catalog?S.catalog.length:0;
    if(!(S.maps&&S.objFile)||b.disabled)return;
    b.disabled=true;$('objnote').textContent='Reading PRTG\u2019s list of object files\u2026';
    http('GET','/api/mapobject.json').then(function(t){
      var catj=parseJson(t,'The list of object files'), now;
      S.objFile=findCustomHtml(catj)||S.objFile;S.catalog=parseCatalog(catj);pubObjs();
      PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};
      renderObjList();pickerSync();pvSync();
      now=S.catalog.length;
      $('objnote').textContent=objNoteText()+(now>had?' '+(now-had)+' new since the last read.':(now<had?' '+(had-now)+' fewer than the last read.':' No change since the last read.'))+missingMineText();
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      $('objnote').textContent='Could not refresh the list: '+((err&&err.message)||'no answer from PRTG')+' The list below is unchanged.';
    }).then(function(){b.disabled=false;updateButtons();});
  }
  $('objrefresh').textContent=CFG.objectList.refreshLabel;$('objrefresh').title=CFG.objectList.refreshHint;
  $('objrefresh').addEventListener('click',refreshObjects);
  function itemId(resp){
    var m=/subid\s*=\s*["']?(\d+)/i.exec(resp)||/mapelement_\d+_(\d+)/i.exec(resp);
    return m?m[1]:null;
  }
  function editCall(id,sub,v){
    return http('POST','/api/editmapobject.htm',{subid:sub,id:id,top:v.top!==undefined?v.top:v.top,left:v.left,width:v.width,height:v.height,zindex:v.z,htmlbefore_:v.html,htmlafter_:v.after||'',ElementLink:v.link||''});
  }
  /* the layout data carries the layout's identity: keep it, and the pushed items can be updated later */
  function offerLayout(){try{$('dlayout').value=DASHAPI.layoutText();DASHAPI.markSaved();}catch(e){}}
  function addParams(it){
    var o={objectid:0,top:it.top,left:it.left,id:mapId(),width:it.width,height:it.height,mapobject_:S.objFile,noautoposition:1,result:'html'};
    if(it.kind==='object'){o.objectid=it.object.target.id;o.mapobject_=it.object.value;}
    return o;
  }
  function push(){
    var p=plan(), c=classify(p), rm=removeTicked()&&c.removed.length>0;
    if(S.reviewed!==sig(c,rm)){review();say('The canvas, offsets or map changed since the review. Here is the new list: check it, then push.','err');return;}
    var id=mapId(), name=mapName(), rec=getRec(), k=0, work=[], counts={added:0,updated:0,replaced:0,removed:0};
    var entry={map:id,srv:srvId(),name:name,at:new Date().toISOString(),added:[],updated:[],removed:[]};
    c.items.forEach(function(it){if(it.status==='new')work.push({kind:'add',it:it});else if(it.status==='changed')work.push({kind:it.replace?'replace':'edit',it:it});});
    if(rm)c.removed.forEach(function(r){work.push({kind:'del',r:r});});
    var allAdds=work.every(function(w){return w.kind==='add';});
    S.busy=true;S.storeFail=false;updateButtons();
    function finish(msg,kind){
      if(entryCount(entry)){var h=loadHist();h.push(entry);saveHist(h);}
      offerLayout();
      if(S.storeFail){msg+=storeWarn();kind='err';}
      S.busy=false;S.reviewed=null;S.cls=null;$('pushgo').hidden=true;say(msg,kind);updateButtons();
      if(kind==='ok'){try{$('scbox').classList.add('ask');scSync();scSay('Want this map for another screen size too? Pick the size and press Make the scaled copy.','');}catch(e){}}   /* 1.5.92 */
    }
    function fail(err){
      if(err&&err.status===401)authNeeded();
      var w=work[k], hint=(w&&w.kind==='edit'&&err&&err.status&&err.status!==401)?' If you deleted this item in PRTG by hand, use \u201CForget what was pushed\u201D and push again.':'';
      finish('Stopped after '+k+' of '+work.length+(allAdds?' items: ':' changes: ')+err.message+(entryCount(entry)?' What was already done is remembered, so Undo last push reverses it.':'')+hint,'err');
    }
    function addOne(it){
      return http('POST','/api/addobjecttomap.htm',addParams(it)).then(function(resp){
        var sub=itemId(resp);
        if(!sub)throw new Error('PRTG added an item but did not say which one, so it cannot be set up.');
        entry.added.push(sub);
        rec.items[it.id]={subid:sub,name:it.name,type:it.type,sent:null,obj:objIdent(it)};putRec(rec);   /* remembered before it is set up, so a failed edit never leads to a second add */
        return editCall(id,sub,fullSet(it));
      }).then(function(){rec.items[it.id].sent=fullSet(it);putRec(rec);});
    }
    /* what is really on the map now: subid -> item, read the way the Map Designer reads it */
    function readMap(){
      return sampleGet({kind:'verify',label:'Items on the map',path:'/api/mapsvg.htm',params:{id:id}}).then(function(o){
        var by={};
        if(o.error||o.status<200||o.status>=300)throw new Error(o.error||('PRTG answered '+o.status));
        exParse(o.body||'').forEach(function(x){by[x.subid]=x;});
        return by;
      });
    }
    function wrongSpot(x,v){return x.left!==v.left||x.top!==v.top||x.width!==v.width||x.height!==v.height;}
    /* every added or replaced item must be on the map where it was put; anything PRTG did not keep is added again, once */
    function checkAdded(done){
      var adds=work.filter(function(w){return w.kind==='add'||w.kind==='replace';}), lost=[], moved=[];
      if(!adds.length){done('');return;}
      say('Checking the map\u2026','');
      readMap().then(function(by){
        adds.forEach(function(w){var r=rec.items[w.it.id], x=r&&by[r.subid];if(!x)lost.push(w);else if(wrongSpot(x,fullSet(w.it)))moved.push(w);});
        if(!lost.length&&!moved.length){done(' Checked on the map: all '+adds.length+(adds.length===1?' item is':' items are')+' there.');return;}
        return moved.reduce(function(p,w){return p.then(function(){return editCall(id,rec.items[w.it.id].subid,fullSet(w.it));});},Promise.resolve()).then(function(){
          return lost.reduce(function(p,w){return p.then(function(){
            var old=rec.items[w.it.id]&&rec.items[w.it.id].subid;
            entry.added=entry.added.filter(function(x){return x!==old;});
            return addOne(w.it);
          });},Promise.resolve());
        }).then(readMap).then(function(by2){
          var still=lost.filter(function(w){var r=rec.items[w.it.id];return !(r&&by2[r.subid]);});
          if(still.length){
            finish('PRTG accepted '+adds.length+' items but kept '+(adds.length-still.length)+'. These are not on the map: '+still.map(function(w){return w.it.name;}).join(', ')+'. They were tried twice. Press Show items under Already on this map to see what PRTG holds.','err');
            return;
          }
          if(!lost.length){done(' Checked on the map: all '+adds.length+(adds.length===1?' item is':' items are')+' there (positions corrected).');return;}
          done(' PRTG had dropped '+lost.length+(lost.length===1?' item':' items')+' after the first try; '+(lost.length===1?'it was':'they were')+' added again and checked.');
        });
      }).catch(function(err){done(' (The map could not be read back to check: '+(err.message||err)+'.)');});
    }
    (function next(){
      if(k>=work.length){
        var msg;
        if(allAdds)msg='Added '+counts.added+(counts.added===1?' item':' items')+' to \u201C'+name+'\u201D. Open the map in PRTG to see them.';
        else{
          var parts=[];
          if(counts.added)parts.push('added '+counts.added);if(counts.updated)parts.push('updated '+counts.updated);if(counts.replaced)parts.push('replaced '+counts.replaced);if(counts.removed)parts.push('deleted '+counts.removed);
          msg='Pushed to \u201C'+name+'\u201D: '+parts.join(', ')+'.'+(c.nSame?' '+c.nSame+(c.nSame===1?' item was':' items were')+' already up to date and not touched.':'')+' Open the map in PRTG to see the changes.';
        }
        if(c.nMissing)msg+=' '+c.nMissing+(c.nMissing===1?' object was':' objects were')+' skipped because PRTG does not list its file yet.';
        checkAdded(function(extra){finish(msg+extra+' The layout box now holds this layout: copy it to keep updating these items later.','ok');});return;
      }
      var w=work[k], it=w.it;
      say((w.kind==='del'?'Deleting ':(w.kind==='edit'?'Updating ':(w.kind==='replace'?'Replacing ':'Adding ')))+(k+1)+' of '+work.length+'\u2026','');
      if(w.kind==='add'){
        addOne(it).then(function(){counts.added++;k++;setTimeout(next,CFG.push.pauseMs);},fail);
      }else if(w.kind==='replace'){
        /* the new item is added first and the old one deleted only once that worked, so a failed add never leaves the map without the item */
        var oldSub=it.subid;
        addOne(it).then(function(){
          return http('GET','/api/deletesubobject.htm',{id:id,subid:oldSub}).then(function(){
            entry.removed.push({id:it.id,subid:oldSub,name:it.name});
          },function(err){
            var e2=new Error('The new \u201C'+it.name+'\u201D was added, but PRTG did not delete the old one (item '+oldSub+'): '+String(err&&err.message||err).replace(/\.$/,'')+'. If it is still on the map, delete it in PRTG.');
            e2.status=err&&err.status;e2.oldLeft=true;throw e2;
          });
        }).then(function(){counts.replaced++;k++;next();},fail);
      }else if(w.kind==='edit'){
        editCall(id,it.subid,fullSet(it)).then(function(){
          entry.updated.push({id:it.id,subid:it.subid,before:rec.items[it.id].sent});
          rec.items[it.id].sent=fullSet(it);rec.items[it.id].name=it.name;putRec(rec);counts.updated++;k++;next();
        },fail);
      }else{
        http('GET','/api/deletesubobject.htm',{id:id,subid:w.r.subid}).then(function(){
          delete rec.items[w.r.id];putRec(rec);entry.removed.push({id:w.r.id,subid:w.r.subid,name:w.r.name});counts.removed++;k++;next();
        },fail);
      }
    })();
  }
  /* undo: updates go back to what was there before, added items are deleted. Items a push deleted cannot be brought back. */
  function undo(){
    var lp=lastPush();if(!lp)return;
    var id=mapId(), rec=getRec(), ups=(lp.updated||[]).filter(function(u){return u.before;}).slice().reverse(), adds=entryAdded(lp).slice().reverse();
    var reverted=0, removed=0, failedUps=[], failedAdds=[], broke=false;
    S.busy=true;S.storeFail=false;updateButtons();
    function finish(){
      var h=loadHist(), k=-1, i;
      for(i=0;i<h.length;i++){if(h[i].at===lp.at&&h[i].srv===lp.srv&&String(h[i].map)===String(lp.map)){k=i;break;}}
      var left=failedUps.length+failedAdds.length;
      if(k>-1){
        if(left){h[k].updated=failedUps;if(h[k].added)h[k].added=failedAdds;else h[k].subids=failedAdds;h[k].removed=[];}
        else h.splice(k,1);
        saveHist(h);
      }
      S.busy=false;
      var msg;
      if(left)msg='Undone '+(reverted+removed)+' of '+(reverted+removed+left)+'. '+left+' could not be undone; try again.';
      else if(addsOnly(lp))msg='Removed '+removed+(removed===1?' item':' items')+' from \u201C'+mapName()+'\u201D.';
      else{
        var parts=[];if(reverted)parts.push('reverted '+reverted+(reverted===1?' update':' updates'));if(removed)parts.push('removed '+removed+(removed===1?' added item':' added items'));
        msg='Undone: '+parts.join(', ')+'.'+((lp.removed||[]).length?' '+(lp.removed.length)+(lp.removed.length===1?' item that push deleted was':' items that push deleted were')+' not restored.':'');
      }
      say(msg+storeWarn(),(left||S.storeFail)?'err':'ok');updateButtons();
    }
    (function next(){
      if(ups.length){
        var u=ups[0], b=u.before;
        editCall(id,u.subid,b).then(function(){
          if(rec.items[u.id]&&rec.items[u.id].subid===u.subid){rec.items[u.id].sent=b;putRec(rec);}
          reverted++;ups.shift();next();
        },function(){failedUps=ups.slice();failedAdds=adds.slice();finish();});
        return;
      }
      if(adds.length){
        var sub=adds[0];
        http('GET','/api/deletesubobject.htm',{id:id,subid:sub}).then(function(){
          var ks=Object.keys(rec.items),i;for(i=0;i<ks.length;i++){if(rec.items[ks[i]].subid===sub){delete rec.items[ks[i]];}}
          putRec(rec);removed++;adds.shift();next();
        },function(){failedAdds=adds.slice();finish();});
        return;
      }
      finish();
    })();
  }
  function forget(){
    if(!S.forgetArm){
      $('pushforget').textContent='Click again to forget';
      S.forgetArm=setTimeout(function(){S.forgetArm=null;updateButtons();},4000);return;
    }
    clearTimeout(S.forgetArm);S.forgetArm=null;
    dropRec();S.reviewed=null;S.cls=null;$('pushgo').hidden=true;$('pushlist').hidden=true;
    say('Forgot what was pushed to \u201C'+mapName()+'\u201D for this layout. The next push adds everything as new.','ok');updateButtons();
  }
  /* ---- the objects PRTG has: pick one to put on the canvas */
  /* ---- samples of how PRTG draws objects. Read only: nothing is changed in PRTG, and nothing is sent anywhere; the result is a file you choose what to do with. */
  function sampleGet(job){
    var b=base(), p=withAuth(job.params), url=b+job.path, qs=qstring(p,true), shown=job.path+(Object.keys(job.params||{}).length?'?'+qstring(job.params,true):'');   /* the saved address never holds login details */
    if(job.rawQuery){qs=job.rawQuery;shown=job.path+'?'+job.rawQuery;}   /* kept exactly as PRTG wrote it; blanked when the file is saved */
    var out={kind:job.kind,label:job.label,request:shown};
    if(job.item)out.item=job.item;
    if(qs)url+=(url.indexOf('?')>-1?'&':'?')+qs;
    return fetch(url,{method:'GET',credentials:b?'omit':'same-origin',headers:{'X-Requested-With':'XMLHttpRequest','Accept':'text/html, */*; q=0.01'}}).then(function(r){
      return r.text().then(function(t){out.status=r.status;out.type=r.headers.get('content-type')||'';out.length=t.length;out.body=t;return out;});
    },function(){out.error=cannotReach(b);return out;});
  }
  function collectSamples(){
    var id=mapId(), note=$('sampmsg'), jobs=[], rec=getRec(), k=0, got=[];
    if(!S.maps||!id)return;
    function sayS(m,kind){note.textContent=m;note.className='note pst'+(kind?' '+kind:'');}
    DASHAPI.pushItems().filter(function(i){return i.object;}).slice(0,12).forEach(function(it){
      jobs.push({kind:'preview',label:it.object.cat+': '+it.object.name,path:'/controls/mapobjectpreview.htm',
        params:{id:id,count:5,dependency_:it.object.target.id,width:it.width,height:it.height,selected:'',mapelements:',*'+it.object.value+'*',maptitles:',*'+it.object.name+'*'},
        item:{name:it.object.name,category:it.object.cat,file:it.object.value,target:it.object.target,width:it.width,height:it.height}});
    });
    Object.keys(rec.items).slice(0,12).forEach(function(key){
      var r=rec.items[key];
      jobs.push({kind:'placed',label:'Pushed item: '+(r.name||key),path:'/controls/mapobjectonly.htm',params:{mode:'edit',subid:r.subid,id:id},item:{name:r.name,type:r.type,subid:r.subid}});
    });
    jobs.push({kind:'tree',label:'Device tree',path:'/api/tree.json',params:{groups:1,devices:1,probes:1,allowroot:1}});
    jobs.push({kind:'sensors-under',label:'Sensors under the Local Probe',path:'/api/table.json',params:{content:'sensors',id:1,columns:'objid,sensor',count:5}});
    jobs.push({kind:'mapview',label:'View Map tab',path:'/controls/mapview.htm',params:{id:id}});
    jobs.push({kind:'mapdesigner',label:'Map Designer tab',path:'/controls/mapdesigner.htm',params:{id:id}});
    jobs.push({kind:'catalogue',label:'List of object files',path:'/api/mapobject.json',params:{}});
    /* the items already on this map, the way the Map Designer loads them (read only) */
    jobs.push({kind:'map-svg',label:'Items on this map (as the designer loads them)',path:'/api/mapsvg.htm',params:{id:id}});
    jobs.push({kind:'map-items',label:'Items on this map (item list)',path:'/api/mapobjects.htm',params:{id:id}});
    jobs.push({kind:'map-connections',label:'Connections between the items',path:'/api/mapobjects.htm',params:{type:'connections',id:id}});
    jobs.push({kind:'map-settings',label:'Map settings',path:'/api/mapsettings.htm',params:{id:id}});
    var itemsFound=false, itemsTotal=0, chartCount=0;
    /* a graph item's markup holds the address of its picture; ask for that picture once, with this tool's own login */
    function addChartJob(o){
      var m=/src="(\/chart\.svg\?[^"]+)"/.exec(o.body);
      if(!m)return;
      chartCount++;
      jobs.push({kind:'chart-svg',label:'Graph picture (chart.svg) for item '+o.item.subid,path:'/chart.svg',params:{},rawQuery:m[1].split('?')[1].replace(/&amp;/g,'&'),item:{subid:o.item.subid}});
    }
    /* from the item list: a few items, one of each look first, each asked for its settings and its markup. The list is parsed as inert text; nothing in it runs. */
    function addItemJobs(html){
      var d=new DOMParser().parseFromString(html,'text/html'), els=d.querySelectorAll('.map_object[subid]'), seen={}, first=[], rest=[], i, el, sub, sig, rec;
      for(i=0;i<els.length;i++){
        el=els[i];sub=el.getAttribute('subid');
        if(!sub||seen['s'+sub])continue;
        seen['s'+sub]=1;
        sig=String(el.className).split(/\s+/).filter(function(c){return c&&c!=='map_object'&&!/^(status-|map_objectstate|ui-)/.test(c);}).sort().join(' ');
        rec={sub:sub,classes:String(el.className)};
        if(!seen['g'+sig]){seen['g'+sig]=1;first.push(rec);}else rest.push(rec);
      }
      itemsTotal=first.length+rest.length;
      if(!itemsTotal)return;
      itemsFound=true;
      first.concat(rest).slice(0,CFG.samples.maxItems).forEach(function(x){
        jobs.push({kind:'map-item-settings',label:'Item '+x.sub+': settings',path:'/api/mapsettings.htm',params:{id:id,subid:x.sub,type:'objectproperties'},item:{subid:x.sub,classes:x.classes}});
        jobs.push({kind:'map-item-markup',label:'Item '+x.sub+': markup',path:'/controls/mapobjectonly.htm',params:{mode:'edit',subid:x.sub,id:id},item:{subid:x.sub,classes:x.classes}});
      });
    }
    $('objsamples').disabled=true;S.busy=true;
    (function next(){
      if(k>=jobs.length){
        var res={tool:STAMP_NAME(),collected:new Date().toISOString(),server:(base()||pageOrigin()||''),map:{id:id,name:mapName(),itemsListed:itemsTotal,itemsRead:Math.min(itemsTotal,CFG.samples.maxItems)},browser:navigator.userAgent,requests:got};
        var blob=new Blob([redactSecrets(JSON.stringify(res,null,1))],{type:'application/json'}), url=URL.createObjectURL(blob), a=document.createElement('a'), size=Math.round(blob.size/1024);
        a.href=url;a.download='prtg-preview-samples.json';document.body.appendChild(a);a.click();document.body.removeChild(a);
        setTimeout(function(){URL.revokeObjectURL(url);},2000);
        var bad=got.filter(function(g){return g.error||g.status<200||g.status>=300;}).length;
        S.busy=false;updateButtons();
        sayS('Saved prtg-preview-samples.json ('+got.length+' requests, '+size+' KB'+(bad?', '+bad+' did not succeed':'')+'). It holds what PRTG answered for this map, including the names and values shown on the objects and the settings of up to '+CFG.samples.maxItems+' items already on it. Login details in the addresses (passhash, username, map id, URL hash) are blanked.',bad&&bad===got.length?'err':'ok');
        return;
      }
      sayS('Collecting '+(k+1)+' of '+jobs.length+': '+jobs[k].label+'\u2026','');
      sampleGet(jobs[k]).then(function(o){
        if(o.status===401){authNeeded();}
        got.push(o);k++;
        if((o.kind==='map-svg'||o.kind==='map-items')&&o.body&&!itemsFound)addItemJobs(o.body);
        if(o.kind==='map-item-markup'&&o.body&&o.item&&chartCount<CFG.samples.maxCharts)addChartJob(o);
        next();
      });
    })();
  }
  /* PRTG writes the logged in user's name and passhash (and the map's public id) into the addresses of the pages it sends, so they are blanked before the file is saved */
  function redactSecrets(t){return t.replace(new RegExp('\\b('+CFG.samples.redactKeys.join('|')+')=[^&"\'<>\\s\\\\]+','gi'),'$1=REDACTED');}
  function STAMP_NAME(){return CFG.name+' v'+CFG.version+_zw();}
  /* ---- the items already on the map, read only. PRTG's own designer loads them from /api/mapsvg.htm; this does the same and draws them behind the canvas. */
  var EX={items:[],mapW:0,mapH:0,map:null,target:{},styles:'',libs:'',libsFor:'',lines:'',bg:'',bgColor:'',bgFor:''};
  function exLayerClass(){return ($('exon').checked?'':'off')+($('exdim').checked?' dim':'');}
  function exLayer(){var c=$('dcanvas'),l=$('dexist');if(!l){l=document.createElement('div');l.id='dexist';l.className=exLayerClass();c.insertBefore(l,c.firstChild);}return l;}
  function exClear(){
    var l=$('dexist'),x=$('exlist');
    exlStop();
    EX.items=[];EX.mapW=0;EX.mapH=0;EX.map=null;EX.target={};EX.lines='';
    if(l&&l.parentNode)l.parentNode.removeChild(l);
    x.hidden=true;x.textContent='';$('exonrow').hidden=true;$('exdimrow').hidden=true;$('exscrrow').hidden=true;$('exsize').hidden=true;$('exmsg').textContent='';
    exUnloadReset();
    if(typeof xeReset0==='function')xeReset0();
    try{document.dispatchEvent(new Event('exchanged'));}catch(e){}
  }
  /* Takes the loaded map back off the canvas, exactly as picking a different map in the list does.
     Purely local: nothing is sent to PRTG and the map's own items are left alone. It does drop any
     edits or deletion marks staged against those items, so when some are waiting it asks for a second
     click first -- the same arming pattern as "Delete this map", rather than a native confirm(). */
  function exUnloadReset(){
    var b=$('exunload');
    if(S.unloadArm){clearTimeout(S.unloadArm);S.unloadArm=null;}
    if(b){b.classList.remove('armed');b.textContent='Clear the canvas';b.hidden=true;}
  }
  function exUnload(){
    var b=$('exunload'), n=0;
    try{n=Object.keys(XE.stage||{}).length;}catch(e){n=0;}
    if(n&&!S.unloadArm){
      S.unloadArm=setTimeout(function(){S.unloadArm=null;b.classList.remove('armed');b.textContent='Clear the canvas';},4000);
      b.classList.add('armed');
      b.textContent='Click again to clear — '+n+(n===1?' pending change':' pending changes')+' will be discarded';
      return;
    }
    exClear();
  }
  /* each item's file announces itself in a first-line comment, <!--Category: Name-->; find the one that sits just before each item */
  function exHeaders(html){
    var tag=/<div\b[^>]*class="[^"]*\bmap_object\b[^"]*"[^>]*\bsubid="(\d+)"[^>]*>/g, hr=/<!--[ \t]*([^:\n<>{}]+?)[ \t]*:[ \t]*([^\n]*?)[ \t]*-->/g, heads=[], out={}, prev=0, m, h, i, last;
    while((h=hr.exec(html)))heads.push({at:h.index,cat:h[1],name:h[2]});
    while((m=tag.exec(html))){
      last=null;
      for(i=0;i<heads.length;i++){if(heads[i].at<m.index&&heads[i].at>=prev)last=heads[i];}
      out[m[1]]=last;prev=m.index;
    }
    return out;
  }
  /* PRTG's status numbers, grouped the way a glance needs them */
  function exTally(words){
    var order=['down','warning','unusual','paused','up','other'], n={}, out=[];
    words.forEach(function(w){n[w]=(n[w]||0)+1;});
    order.forEach(function(k){if(n[k])out.push(n[k]+' '+k);});
    return out.join(', ');
  }
  function exStateWord(num){
    num=parseInt(num,10);
    if(num===3)return 'up';
    if(num===4)return 'warning';
    if(num===5||num===13||num===14)return 'down';
    if(num===10)return 'unusual';
    if(num===7||num===8||num===9||num===12)return 'paused';
    return 'other';
  }
  function exTextWord(t){
    t=String(t||'').toLowerCase();
    if(/down/.test(t))return 'down';
    if(/warn/.test(t))return 'warning';
    if(/unusual/.test(t))return 'unusual';
    if(/paus/.test(t))return 'paused';
    if(/^\s*up\s*$/.test(t))return 'up';
    return 'other';
  }
  /* the Geo Map carries its locations in a data comment; a table carries its rows. Anything else gets no summary. */
  function exSummary(it,root){
    var m, j, L, rows, head, col, i, words=[], cells, th;
    try{
      if(/\bgeomap\b/.test(it.cls)||it.cat==='Geo Maps'){
        m=/<!--\s*(\{[\s\S]*?\})\s*-->/.exec(it.html);
        if(!m)return '';
        j=JSON.parse(m[1]);L=(j.markers&&j.markers.locationlist)||[];
        if(!Array.isArray(L))return '';
        return L.length?(L.length+(L.length===1?' location: ':' locations: ')+exTally(L.map(function(x){return exStateWord(x.state);}))):'no locations';
      }
      if(/\bmap_table\b/.test(it.cls)||it.cat==='Data Tables'){
        rows=root.querySelectorAll('table tbody tr');
        head=root.querySelector('table th.col-status');
        col=-1;
        if(head&&head.parentNode){th=head.parentNode.children;for(i=0;i<th.length;i++){if(th[i]===head)col=i;}}
        for(i=0;i<rows.length;i++){
          cells=rows[i].children;
          if(!cells.length||cells[0].tagName==='TH')continue;
          if(col>=0&&cells[col])words.push(exTextWord(cells[col].textContent));
          else words.push('x');
        }
        if(!words.length)return 'no rows';
        return words.length+(words.length===1?' row':' rows')+((col>=0)?': '+exTally(words):'');
      }
      if(it.target&&it.cat!=='Custom HTML'){
        m=/\bstatus-(up|down|warning|unusual|unknown)\b/.exec(it.cls);
        if(m)return 'currently '+m[1];
      }
    }catch(e){}
    return '';
  }
  function exParse(html){
    var d=new DOMParser().parseFromString(html,'text/html'), els=d.querySelectorAll('.map_object[subid]'), heads=exHeaders(html), out=[], seen={}, i, el, sub, st, hd, it;
    function num(k){var r=new RegExp('(?:^|;)\\s*'+k+'\\s*:\\s*(-?[\\d.]+)').exec(st);return r?parseFloat(r[1]):null;}
    for(i=0;i<els.length;i++){
      el=els[i];sub=el.getAttribute('subid');
      if(!sub||seen[sub])continue;
      seen[sub]=1;st=el.getAttribute('style')||'';hd=heads[sub]||null;
      it={subid:sub,outer:el.outerHTML,target:parseInt(el.getAttribute('objectid'),10)||0,cls:String(el.className),left:num('left'),top:num('top'),width:num('width'),height:num('height'),z:num('z-index'),cat:hd?hd.cat:'',name:hd?hd.name:'',html:el.innerHTML};
      it.summary=exSummary(it,el);
      out.push(it);
    }
    EX.styles=[].filter.call(d.querySelectorAll('style'),function(x){return !(x.closest&&x.closest('.map_object'));}).map(function(x){return x.outerHTML;}).join('').slice(0,60000);
    return out;
  }
  /* The map's own look is not in the item list. PRTG's View Map page asks /controls/mapview.htm for it: the picture and colour behind the items are the style of #mapview, and the links between items are a list of who connects to whom, drawn as curves. */
  function exMapView(id){
    var origin=(base()||pageOrigin()||'');
    function grab1(path,cred){
      var qs=qstring(withAuth({id:id,cachebreaker:String(Date.now())}),true);
      return fetchWithTimeout(origin+path+(qs?'?'+qs:''),{method:'GET',credentials:cred}).then(function(r){
        if(!r.ok)throw new Error('no');
        return r.blob();
      }).then(function(b){if(!b||!b.size||!/^image\//.test(b.type||''))throw new Error('no');return URL.createObjectURL(b);});
    }
    function grab(path){return grab1(path,base()?'omit':'same-origin').then(function(u){return u;},function(){return grab1(path,'include');});}
    return http('GET','/controls/mapview.htm',{id:id}).then(function(t){
      var d=new DOMParser().parseFromString(t,'text/html'), mv=d.querySelector('#mapview'), ms=d.querySelector('#mapshow'), st=(mv&&mv.getAttribute('style'))||'', m=/background-image\s*:\s*url\(\s*["']?([^"')]+)/i.exec(st), c=/background-color\s*:\s*([^;]+)/i.exec(st), conn=null, r={bg:'',color:c?c[1].trim():'',conn:null};
      try{conn=JSON.parse(ms.getAttribute('data-connections')||'null');}catch(e){}
      r.conn=(conn&&typeof conn==='object')?conn:null;
      if(!m)return r;
      var u=m[1].trim(), path;
      try{path=new URL(u,origin+'/').pathname;}catch(e){return r;}
      return grab(path).then(function(o){r.bg=o;return r;},function(){return r;});
    },function(){return {bg:'',color:'',conn:null};});
  }
  var LINKCOL={up:'#b4cc38',down:'#d71920',warning:'#ffd400',unusual:'#f5821f',paused:'#3b8dd0',unknown:'#9aa4af'};
  /* the picture and colour behind the items, drawn at the map's size as the first thing in the layer */
  function exPaintBg(){
    var l=$('dexist'), b;
    if(!l)return;
    b=l.querySelector('.dexbg');
    if(!(EX.bg||EX.bgColor)||!EX.mapW){if(b)b.parentNode.removeChild(b);return;}
    if(!b){b=document.createElement('div');b.className='dexbg';l.insertBefore(b,l.firstChild);}
    b.style.cssText='position:absolute;left:0;top:0;pointer-events:none;width:'+EX.mapW+'px;height:'+EX.mapH+'px;'+(EX.bgColor?'background-color:'+EX.bgColor.replace(/[;"<>]/g,'')+';':'')+(EX.bg?'background-image:url("'+EX.bg+'");background-repeat:no-repeat;background-position:0 0':'');
  }
  /* The map's background colour is a PRTG map setting (Map settings, Background Color). PRTG saves that whole form at once, so this reads the form as it stands, changes the one field and sends it all back. */
  function hex6(c){c=String(c||'').trim();var m=/^#([0-9a-f]{3})$/i.exec(c);if(m)c='#'+m[1].replace(/./g,function(x){return x+x;});return /^#[0-9a-f]{6}$/i.test(c)?c.toLowerCase():'';}
  function mapForm(id,any){
    return http('GET','/controls/objectdata.htm',{objecttype:'map',id:id}).then(function(t){
      var d=new DOMParser().parseFromString(t,'text/html'), f=d.querySelector('form[action="/editsettings"]')||d.querySelector('form'), p={}, ok=false;
      if(!f)throw new Error('PRTG did not send the map settings.');
      [].forEach.call(f.querySelectorAll('input,select,textarea'),function(e){
        var n=e.getAttribute('name'), ty=(e.getAttribute('type')||'').toLowerCase(), o;
        if(!n||e.disabled||ty==='file'||ty==='submit'||ty==='button')return;
        if(ty==='radio'||ty==='checkbox'){if(e.hasAttribute('checked'))p[n]=e.getAttribute('value')==null?'on':e.getAttribute('value');return;}
        if(e.tagName==='SELECT'){o=e.querySelector('option[selected]')||e.options[0];if(o)p[n]=o.getAttribute('value')!=null?o.getAttribute('value'):o.textContent;return;}
        p[n]=(e.tagName==='TEXTAREA')?e.value:(e.getAttribute('value')||'');
      });
      if('bgcolor_' in p||any)ok=true;
      if(!ok)throw new Error('This PRTG version has no background colour setting for maps.');
      p.id=String(id);
      return p;
    });
  }
  function bgMsg(text,kind){var n=$('mapbgmsg');if(!n)return;n.hidden=!text;n.textContent=text||'';n.className='note pst'+(kind?' '+kind:'');}
  function setMapBg(color){
    var id=mapId(), c=hex6(color);
    if(!id||!c)return;
    bgMsg('Changing the background…','');
    $('mapbgcolor').disabled=true;
    mapForm(id).then(function(p){
      p.bgcolor_=c;
      return httpMultipart('/editsettings',p);
    }).then(function(){return mapForm(id);}).then(function(p){
      if(hex6(p.bgcolor_)!==c)throw new Error('PRTG did not keep the new colour.');
      EX.bgColor=c;if(BGI.cur.id===String(id))BGI.cur.color=c;
      exPaintBg();
      if(!$('dexist')){try{$('dcanvas').style.backgroundColor=c;}catch(e){}}
      bgMsg('Background changed to '+c.toUpperCase()+' on “'+mapName()+'”.','ok');
    }).catch(function(e){
      bgMsg((e&&e.message)||'Could not change the background.','err');
      if(EX.bgColor&&hex6(EX.bgColor))$('mapbgcolor').value=hex6(EX.bgColor);
    }).then(function(){swSync();bgPreSync();});
  }
  $('mapbgcolor').addEventListener('change',function(){setMapBg(this.value);});
  /* ---- the canvas follows the selected map's size, and a size typed for the canvas is sent to that map ----
     The size is read from the map's drawing (<svg width="..px" height="..px">, as Set the canvas to this map's size does).
     A new size goes through the map's settings form like the background colour: the form is read, the width and height fields
     are changed only if they hold the map's current size, it is sent back and read again to make sure PRTG kept it. */
  var MAPSZ={}, szLast='', szTimer=null;
  function szSay(t){try{if(window.DASHAPI&&DASHAPI.toast)DASHAPI.toast(t);}catch(e){}}
  function readMapSize(id){
    return http('GET','/api/mapsvg.htm',{id:id}).then(function(t){
      var m=/<svg\b[^>]*\bwidth="(\d+)px"/i.exec(t||''), n=/<svg\b[^>]*\bheight="(\d+)px"/i.exec(t||'');
      if(!m||!n)throw new Error('PRTG did not say how big the map is.');
      return {w:parseInt(m[1],10),h:parseInt(n[1],10)};
    });
  }
  function adoptMapSize(){
    var id=mapId();
    if(!id||!(S&&S.maps)||String(id)===szLast)return;
    szLast=String(id);
    readMapSize(id).then(function(sz){
      if(String(mapId())!==String(id))return;
      MAPSZ[id]=sz;
      if(window.DASHAPI&&DASHAPI.setCanvasSize&&DASHAPI.setCanvasSize(sz.w,sz.h))szSay('Canvas set to the size of \u201C'+mapName()+'\u201D: '+sz.w+' \u00D7 '+sz.h);
    }).catch(function(e){if(e&&e.status===401)authNeeded();});
  }
  function szField(p,names){for(var i=0;i<names.length;i++)if(names[i] in p)return names[i];return '';}
  function pushMapSize(id,w,h){
    var name=mapName(), known=MAPSZ[id];
    szSay('Changing \u201C'+name+'\u201D to '+w+' \u00D7 '+h+' in PRTG\u2026');
    (known?Promise.resolve(known):readMapSize(id)).then(function(k){
      known=k;MAPSZ[id]=k;
      return mapForm(id,true);
    }).then(function(p){
      var wn=szField(p,['width_','mapwidth_']), hn=szField(p,['height_','mapheight_']);
      if(!wn||!hn)throw new Error('PRTG\u2019s map settings have no width and height Map Studio recognises, so the map was not changed.');
      if(parseInt(p[wn],10)!==known.w||parseInt(p[hn],10)!==known.h)throw new Error('PRTG\u2019s map settings did not match the map\u2019s size ('+known.w+' \u00D7 '+known.h+'), so Map Studio did not change them.');
      p[wn]=String(w);p[hn]=String(h);
      return httpMultipart('/editsettings',p).then(function(){return mapForm(id,true);}).then(function(q){
        if(parseInt(q[wn],10)!==w||parseInt(q[hn],10)!==h)throw new Error('PRTG did not keep the new size.');
        MAPSZ[id]={w:w,h:h};
        szSay('\u201C'+name+'\u201D is now '+w+' \u00D7 '+h+' in PRTG.');
      });
    }).catch(function(e){
      if(e&&e.status===401)authNeeded();
      szSay((e&&e.message)||'Could not change the map size in PRTG.');
    });
  }
  document.addEventListener('canvassize',function(e){
    var id=mapId(), w=e.detail&&e.detail.w, h=e.detail&&e.detail.h, k;
    if(!id||!(S&&S.maps&&S.objFile)||!(w>0&&h>0))return;
    k=MAPSZ[id];if(k&&k.w===w&&k.h===h)return;
    clearTimeout(szTimer);szTimer=setTimeout(function(){if(String(mapId())===String(id))pushMapSize(id,w,h);},700);   /* typing 1, 12, 128, 1280 sends once */
  });
  $('pushmap').addEventListener('change',function(){szLast='';adoptMapSize();});
  document.addEventListener('prtgstate',function(){if(window.PRTGSTATE&&window.PRTGSTATE.map)adoptMapSize();else szLast='';});
  /* ---- 1.5.92: a scaled copy. A new PRTG map of another size gets everything on the canvas, resized to fit it (DASHAPI.scaledItems:
     the spaces stretch, items keep their shape). The map being pushed to is not touched. The copy's items are remembered as a push
     to the new map, so choosing that map and pressing Undo last push takes them off again. Not kept in sync with the canvas:
     make the copy again after changing the design. ---- */
  var SCSIZES=[[1280,720,'HD'],[1366,768,'Laptop'],[1600,900,''],[1920,1080,'Full HD'],[2560,1440,'QHD'],[3840,2160,'4K'],[1280,1024,''],[1024,768,''],[1080,1920,'Portrait Full HD']];
  var SC={named:false,busy:false};
  function scSay(t,kind){var n=$('scmsg');n.textContent=t||'';n.className='note pst'+(kind?' '+kind:'');}
  function scWH(){return {w:parseInt($('scw').value,10)||0,h:parseInt($('sch').value,10)||0};}
  function scName(){var z=scWH();return (mapName()||'Map')+' '+z.w+'x'+z.h;}
  function scSync(){
    var ready=!!(S.maps&&S.objFile), n=0;try{n=DASHAPI.pushItems().length;}catch(e){}
    var z=scWH(), cw=+$('dw').value, ch=+$('dh').value;
    $('scgo').disabled=!ready||!n||S.busy||SC.busy||!(z.w>=100&&z.h>=100);
    $('scgo').title=!ready?'Connect to PRTG first':(!n?'Put something on the canvas first':'');
    if(!SC.named)$('scname').value=scName();
    $('scfrom').textContent=(cw&&ch)?'Now '+cw+' \u00D7 '+ch+'.':'';
  }
  (function(){
    var sel=$('scsize'), cw=+$('dw').value||1920, ch=+$('dh').value||1080, pick=null;
    SCSIZES.forEach(function(z,i){var o=document.createElement('option');o.value=String(i);o.textContent=z[0]+' \u00D7 '+z[1]+(z[2]?' ('+z[2]+')':'');sel.appendChild(o);if(!pick&&!(z[0]===cw&&z[1]===ch)&&z[0]*z[1]>cw*ch)pick=String(i);});
    var oc=document.createElement('option');oc.value='custom';oc.textContent='Another size\u2026';sel.appendChild(oc);
    function fromSel(){var z=SCSIZES[+sel.value];$('scwh').hidden=!!z;if(z){$('scw').value=z[0];$('sch').value=z[1];}scSync();}
    sel.value=pick||'0';fromSel();
    sel.addEventListener('change',fromSel);
    ['scw','sch'].forEach(function(k){$(k).addEventListener('input',scSync);});
    $('scname').addEventListener('input',function(){SC.named=!!String($('scname').value).trim();});
    $('pushmap').addEventListener('change',scSync);
    document.addEventListener('prtgstate',scSync);
    document.addEventListener('canvassize',function(){setTimeout(scSync,0);});
    $('scgo').addEventListener('click',scMake);
  })();
  /* PRTG's addmap2.htm, as createMap() does; the new map is found in the map list afterwards */
  function scCreate(name,w,h){
    var before={};(S.maps||[]).forEach(function(m){before[m.objid]=true;});
    var postErr=null;
    return httpMultipart('/addmap2.htm',{mapurl_:newMapGuid(),name_:name,width_:String(w),height_:String(h),pubaccess_:'0'}).catch(function(e){postErr=e;}).then(function(){
      return http('GET','/api/table.json',{content:'maps',columns:'name,objid'});
    }).then(function(t){
      var j=parseJson(t,'The list of maps'), maps=(j&&j.maps)||[], match=null, sel=$('pushmap'), keep=sel.value;
      maps.forEach(function(m){if(m.name===name&&!before[m.objid]&&(!match||Number(m.objid)>Number(match.objid)))match=m;});
      if(!match)throw postErr||new Error('PRTG did not report an error, but the new map could not be found afterward.');
      S.maps=maps;sel.innerHTML='';
      maps.forEach(function(m){var o=document.createElement('option');o.value=String(m.objid);o.textContent=m.name;sel.appendChild(o);});
      sel.value=keep;MAPSZ[match.objid]={w:w,h:h};
      return String(match.objid);
    });
  }
  function scMake(){
    var z=scWH(), name=String($('scname').value||'').trim()||scName(), from=mapId(), z0=parseInt($('pushz').value,10)||0, items, newId=null, k=0, skipped=0, entry=null;
    if(!(S.maps&&S.objFile)||SC.busy||S.busy)return;
    if(!(z.w>=100&&z.h>=100&&z.w<=20000&&z.h<=20000)){scSay('Choose a width and height between 100 and 20000.','err');return;}
    try{items=DASHAPI.scaledItems(z.w,z.h)||[];}catch(e){scSay('The canvas could not be resized: '+(e.message||e),'err');return;}
    if(!items.length){scSay('Put something on the canvas first.','err');return;}
    var work=items.map(function(it,i){
      var links=(it.fonts||[]).map(function(hh){return '<link href="'+hh+'" rel="stylesheet">';}).join('');
      var o={id:it.id,name:it.name,type:it.type,left:it.left,top:it.top,width:it.width,height:it.height,z:z0+i};
      if(it.object){o.kind='object';o.object=it.object;o.html=it.html||'';if(it.after)o.after=it.after;if(it.link)o.link=it.link;}
      else{o.kind='paste';o.html=norm(links+it.html);}
      return o;
    }).filter(function(o){
      if(o.kind==='object'&&S.catalog&&o.object.value!==S.objFile&&!S.catalog.some(function(c){return c.value===o.object.value;})){skipped++;return false;}
      return true;
    });
    SC.busy=true;S.busy=true;updateButtons();scSync();
    scSay('Making the map \u201C'+name+'\u201D ('+z.w+' \u00D7 '+z.h+')\u2026','');
    scCreate(name,z.w,z.h).then(function(id){
      newId=id;
      entry={map:id,srv:srvId(),name:name,at:new Date().toISOString(),added:[],updated:[],removed:[]};
      /* the same background colour as the map being pushed to, when PRTG has one set */
      return mapForm(from).then(function(f){
        var c=hex6(f.bgcolor_);if(!c)return;
        return mapForm(id).then(function(q){q.bgcolor_=c;return httpMultipart('/editsettings',q);});
      }).catch(function(){});
    }).then(function(){
      return work.reduce(function(pr,it){return pr.then(function(){
        k++;scSay('Adding '+k+' of '+work.length+' to \u201C'+name+'\u201D\u2026','');
        var o={objectid:0,top:it.top,left:it.left,id:newId,width:it.width,height:it.height,mapobject_:S.objFile,noautoposition:1,result:'html'};
        if(it.kind==='object'){o.objectid=it.object.target.id;o.mapobject_=it.object.value;}
        return http('POST','/api/addobjecttomap.htm',o).then(function(resp){
          var sub=itemId(resp);
          if(!sub)throw new Error('PRTG added an item but did not say which one, so it cannot be set up.');
          entry.added.push(sub);
          return editCall(newId,sub,fullSet(it));
        }).then(function(){return new Promise(function(r){setTimeout(r,CFG.push.pauseMs);});});
      });},Promise.resolve());
    }).then(function(){
      return sampleGet({kind:'verify',label:'Items on the map',path:'/api/mapsvg.htm',params:{id:newId}}).then(function(o){
        return (o&&!o.error&&o.status>=200&&o.status<300)?exParse(o.body||'').length:-1;
      },function(){return -1;});
    }).then(function(n){
      var h=loadHist();h.push(entry);saveHist(h);
      scSay('Made \u201C'+name+'\u201D ('+z.w+' \u00D7 '+z.h+') with '+entry.added.length+(entry.added.length===1?' item':' items')+'.'+(n>=0?(n>=entry.added.length?' Checked on the map: all there.':' The map shows '+n+'; open it in PRTG to check.'):'')+(skipped?' '+skipped+(skipped===1?' object was':' objects were')+' left out because PRTG does not list its file yet.':'')+' Choose it under Map to see it; Undo last push there takes the copy\u2019s items off again.','ok');
      $('scbox').classList.remove('ask');
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      if(entry&&entry.added.length){var h=loadHist();h.push(entry);saveHist(h);}
      scSay((newId?'Stopped after '+(entry?entry.added.length:0)+' of '+work.length+' items on \u201C'+name+'\u201D: ':'Could not make the map: ')+((err&&err.message)||err)+(entry&&entry.added.length?' Choose that map and press Undo last push to take them off.':''),'err');
    }).then(function(){SC.busy=false;S.busy=false;updateButtons();scSync();});
  }
  /* background presets: the stage colour each look in the Objects tab was drawn for, plus PRTG's own grey and white */
  var BGPRE=[['PRTG default','#DAD7D7'],['White','#FFFFFF'],['PRTG new UI','#F9F9FA'],['Clean card','#F3F4F6'],['Corporate blue','#F2F4F7'],['Executive dark','#171926'],['Indigo board','#161240'],['Slate fintech','#2B2D3C'],['Neon plum','#2A1838'],['Teal glass','#2A3B4C'],['Wall display','#0B1220'],['Brand navy','#050F34']];
  function bgPreSync(){
    var cur=hex6(EX.bgColor)||hex6($('mapbgcolor').value), on=!$('mapbgcolor').disabled;
    $('mapbgnow').style.background=cur||'';
    [].forEach.call($('bgpresets').children,function(b){b.classList.toggle('on',hex6(b.getAttribute('data-c'))===cur);b.disabled=!on;});
  }
  (function(){
    var box=$('bgpresets');
    BGPRE.forEach(function(p){
      var b=document.createElement('button');b.type='button';b.className='bgchip';b.setAttribute('data-c',p[1]);b.style.background=p[1];b.dataset.tip=p[0]+' · '+p[1];b.setAttribute('aria-label',p[0]);
      b.addEventListener('click',function(){$('mapbgcolor').value=p[1].toLowerCase();setMapBg(p[1]);});
      box.appendChild(b);
    });
  })();
  /* ---- 1.5.93: a picture behind the map. PRTG's map settings have "Background Image" (use a custom background image / do not use
     one) and a file field (JPG, PNG or GIF, under 20 MB), and PRTG draws the picture at its own size from the map's top-left corner.
     So the editor makes a picture of exactly the map's size (cut, placement, zoom, position, turn, flip, colour changes, a tint) and
     sends it through that same settings form, read as it stands (like the background colour). Field names are found in the form:
     the file field, and the radio group whose labels speak of using or not using a background image. */
  var BGI={busy:false,cur:{id:'',url:''}};
  function bgh(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n;}
  function bgiMsg(t,kind){var n=$('mapbgimsg');if(!n)return;n.hidden=!t;n.textContent=t||'';n.className='note pst'+(kind?' '+kind:'');}
  function bgiLabel(f,e){
    var id=e.getAttribute('id'), l=null, t='', s;
    if(id)try{l=f.querySelector('label[for="'+id.replace(/["\\]/g,'')+'"]');}catch(x){}
    if(!l)l=e.closest('label');
    if(l)t=l.textContent;
    for(s=e.nextSibling;!t&&s;s=s.nextSibling)t=(s.textContent||'').trim();
    return String(t||'').replace(/\s+/g,' ').trim();
  }
  function bgiForm(id){
    return http('GET','/controls/objectdata.htm',{objecttype:'map',id:id}).then(function(t){
      var d=new DOMParser().parseFromString(t,'text/html'), f=d.querySelector('form[action="/editsettings"]')||d.querySelector('form'), files, groups={}, r=null;
      if(!f)throw new Error('PRTG did not send the map settings.');
      files=[].filter.call(f.querySelectorAll('input[type=file]'),function(e){return e.getAttribute('name')&&!e.disabled;});
      files=files.filter(function(e){return /back|image|bg|pic/i.test(e.getAttribute('name'));}).concat(files);
      [].forEach.call(f.querySelectorAll('input[type=radio]'),function(e){
        var n=e.getAttribute('name');if(!n||e.disabled)return;
        (groups[n]=groups[n]||[]).push({v:e.getAttribute('value')==null?'on':e.getAttribute('value'),t:bgiLabel(f,e),on:e.hasAttribute('checked')});
      });
      Object.keys(groups).forEach(function(n){
        var use=null, no=null;
        groups[n].forEach(function(o){if(!/image|picture/i.test(o.t))return;if(/\b(do not|don.t|no)\b/i.test(o.t))no=no||o;else use=use||o;});
        if(use&&no&&!r)r={name:n,on:use.v,off:no.v,cur:(groups[n].filter(function(o){return o.on;})[0]||{}).v};
      });
      return {file:files.length?files[0].getAttribute('name'):'',radio:r};
    });
  }
  function bgiSize(id){return MAPSZ[id]?Promise.resolve(MAPSZ[id]):readMapSize(id).then(function(s){MAPSZ[id]=s;return s;});}
  function bgiDims(url){return new Promise(function(ok){if(!url)return ok(null);var i=new Image();i.onload=function(){ok({w:i.naturalWidth,h:i.naturalHeight});};i.onerror=function(){ok(null);};i.src=url;});}
  /* the map's current picture, for the panel's thumbnail and the Edit and Remove buttons */
  function bgiRefresh(){
    var id=mapId();
    if(!id||!(S&&S.maps)){bgiSync();return Promise.resolve();}
    return exMapView(id).then(function(v){
      if(String(mapId())!==String(id)){if(v.bg)try{URL.revokeObjectURL(v.bg);}catch(e){}return;}
      if(BGI.cur.url&&BGI.cur.url!==v.bg)try{URL.revokeObjectURL(BGI.cur.url);}catch(e){}
      BGI.cur={id:String(id),url:v.bg||'',color:hex6(v.color)};bgiSync();
    });
  }
  function bgiSync(){
    var on=!!(window.PRTGSTATE&&window.PRTGSTATE.map), has=on&&BGI.cur.url&&BGI.cur.id===String(mapId()), im=$('mapbginow');
    if(!$('mapbgipick'))return;
    $('mapbgipick').disabled=!on||BGI.busy;
    $('mapbgiedit').hidden=!has;$('mapbgiedit').disabled=BGI.busy;
    $('mapbgidel').hidden=!has;$('mapbgidel').disabled=BGI.busy;
    im.hidden=!has;if(has&&im.getAttribute('src')!==BGI.cur.url)im.src=BGI.cur.url;
  }
  /* shows the new picture on the canvas at once, as the colour change does */
  function bgiShow(url){
    if($('dexist')){EX.bg=url||'';exPaintBg();return;}
    try{var c=$('dcanvas');c.style.backgroundImage=url?'url("'+url+'")':'';c.style.backgroundRepeat='no-repeat';c.style.backgroundPosition='0 0';c.style.backgroundSize=url?'100% 100%':'';}catch(e){}
  }
  function bgiSend(id,blob,name){
    var info;
    return bgiForm(id).then(function(i){
      info=i;
      if(!i.file)throw new Error('PRTG\u2019s map settings have no picture field Map Studio recognises, so nothing was sent.');
      return mapForm(id,true);
    }).then(function(p){
      if(info.radio)p[info.radio.name]=info.radio.on;
      p[info.file]=new File([blob],name,{type:blob.type});
      return httpMultipart('/editsettings',p);
    }).then(function(){return exMapView(id);});
  }
  function bgiRemove(){
    var id=mapId(), name=mapName();
    if(!id||BGI.busy)return;
    BGI.busy=true;bgiSync();bgiMsg('Removing the picture\u2026','');
    bgiForm(id).then(function(i){
      if(!i.radio)throw new Error('PRTG\u2019s map settings have no \u201CDo not use a background image\u201D choice Map Studio recognises, so nothing was changed.');
      return mapForm(id,true).then(function(p){p[i.radio.name]=i.radio.off;return httpMultipart('/editsettings',p);});
    }).then(function(){return exMapView(id);}).then(function(v){
      if(v.bg){try{URL.revokeObjectURL(v.bg);}catch(e){}throw new Error('PRTG still shows a picture on \u201C'+name+'\u201D.');}
      if(BGI.cur.url)try{URL.revokeObjectURL(BGI.cur.url);}catch(e){}
      BGI.cur={id:String(id),url:'',color:BGI.cur.color};bgiShow('');
      bgiMsg('The picture was taken off \u201C'+name+'\u201D. The map shows its background colour.','ok');
    }).catch(function(e){if(e&&e.status===401)authNeeded();bgiMsg((e&&e.message)||'Could not remove the picture.','err');})
      .then(function(){BGI.busy=false;bgiSync();});
  }
  function bgiLoad(src){
    return new Promise(function(ok,no){
      var i=new Image();
      i.onload=function(){if(!i.naturalWidth)no(new Error('That file has no picture in it.'));else ok(i);};
      i.onerror=function(){no(new Error('Chrome cannot open that file as a picture. Use a JPG, PNG, GIF, WebP or BMP file.'));};
      i.src=src;
    });
  }
  function bgiOpen(src,fname,own){
    var id=mapId();
    if(!id||BGI.busy)return;
    bgiMsg('Opening the picture\u2026','');
    Promise.all([bgiLoad(src),bgiSize(id),BGI.cur.id===String(id)?null:bgiRefresh()]).then(function(r){bgiMsg('','');bgeOpen(r[0],r[1],fname,id);})
      .catch(function(e){if(e&&e.status===401)authNeeded();bgiMsg((e&&e.message)||'Could not open the picture.','err');})
      .then(function(){if(own)setTimeout(function(){try{URL.revokeObjectURL(src);}catch(e){}},60000);});
  }

  /* ---- the picture editor ---- */
  var BGEMODES=[['fill','Fill','Covers the whole map; the edges that stick out are cut off.'],['fit','Fit','The whole picture shows; the rest of the map gets the empty-area colour.'],
    ['stretch','Stretch','Pulled to the map\u2019s exact width and height (the shape changes).'],['orig','Original size','At its own size, 1 picture pixel = 1 map pixel.'],['tile','Tile','Repeated across the map, like wallpaper.']];
  var BGEASPECT=[['free','Free'],['map','Map shape'],['1','Square'],['1.7778','16:9'],['1.3333','4:3']];
  function bgeBlank(){return {mode:'fill',zoom:1,ax:.5,ay:.5,rot:0,fh:false,fv:false,crop:null,br:100,ct:100,sat:100,blur:0,gray:0,op:100,tint:'#000000',tintA:0,fill:'',fmt:'jpg',q:88};}
  function bgeOpen(img,size,fname,mapid){
    var W=size.w, H=size.h, st=bgeBlank(), src=null, cropping=null, aspect='free', blobT=null, outBlob=null;
    var mapCol=(BGI.cur.id===String(mapid)&&BGI.cur.color)||(EX.map===mapid&&hex6(EX.bgColor))||hex6($('mapbgcolor').value)||'#ffffff';
    var ov=bgh('div','nmov'), box=bgh('div','nmbox bgebox');
    ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Map background picture');
    var head=bgh('div','bgehead');head.appendChild(bgh('h3',null,'Background picture'));
    var info=bgh('span','bgeinfo');head.appendChild(info);box.appendChild(head);
    var body=bgh('div','bgebody'), stage=bgh('div','bgestage'), cv=bgh('canvas','bgecv'), crop=bgh('div','bgecrop'), hint=bgh('p','bgehint');
    stage.appendChild(cv);stage.appendChild(crop);
    var left=bgh('div','bgeleft');left.appendChild(stage);left.appendChild(hint);body.appendChild(left);
    var side=bgh('div','bgeside');body.appendChild(side);box.appendChild(body);
    var foot=bgh('div','nmbtns bgefoot'), outInfo=bgh('span','bgeout'), reset=bgh('button','btn ghost','Start over'), dl=bgh('button','btn ghost','Download'), no=bgh('button','btn ghost','Cancel'), go=bgh('button','btn primary','Put it on the map');
    foot.appendChild(outInfo);[reset,dl,no,go].forEach(function(b){b.type='button';foot.appendChild(b);});
    var msg=bgh('p','note pst bgemsg');msg.hidden=true;box.appendChild(msg);box.appendChild(foot);
    ov.appendChild(box);document.body.appendChild(ov);
    info.textContent='Map \u201C'+mapName()+'\u201D: '+W+' \u00D7 '+H+' \u00B7 picture'+(fname?' \u201C'+fname+'\u201D':'')+': '+img.naturalWidth+' \u00D7 '+img.naturalHeight;
    function say(t,kind){msg.hidden=!t;msg.textContent=t||'';msg.className='note pst bgemsg'+(kind?' '+kind:'');}

    /* the picture turned and flipped; the cut is a rectangle on it */
    function source(){
      if(src)return src;
      var r=st.rot%180!==0, w=r?img.naturalHeight:img.naturalWidth, h=r?img.naturalWidth:img.naturalHeight, c=document.createElement('canvas'), x;
      c.width=w;c.height=h;x=c.getContext('2d');
      x.translate(w/2,h/2);x.rotate(st.rot*Math.PI/180);x.scale(st.fh?-1:1,st.fv?-1:1);
      x.drawImage(img,-img.naturalWidth/2,-img.naturalHeight/2);
      return (src=c);
    }
    function cutRect(){var s=source();return st.crop||{x:0,y:0,w:s.width,h:s.height};}
    function place(){
      var c=cutRect(), sx, sy;
      if(st.mode==='fill')sx=sy=Math.max(W/c.w,H/c.h)*st.zoom;
      else if(st.mode==='fit')sx=sy=Math.min(W/c.w,H/c.h)*st.zoom;
      else if(st.mode==='stretch'){sx=W/c.w*st.zoom;sy=H/c.h*st.zoom;}
      else sx=sy=st.zoom;
      var dw=c.w*sx, dh=c.h*sy;
      if(st.mode==='tile')return {c:c,dw:dw,dh:dh,x:(W-dw)/2+(st.ax-.5)*dw,y:(H-dh)/2+(st.ay-.5)*dh};   /* tiles: the position moves the pattern */
      return {c:c,dw:dw,dh:dh,x:(W-dw)*st.ax,y:(H-dh)*st.ay};
    }
    function emptyCol(){return st.fill||(st.fmt==='png'?'':mapCol);}
    function filt(k){
      var f=[];
      if(st.br!==100)f.push('brightness('+st.br+'%)');if(st.ct!==100)f.push('contrast('+st.ct+'%)');
      if(st.sat!==100)f.push('saturate('+st.sat+'%)');if(st.gray)f.push('grayscale('+st.gray+'%)');
      if(st.blur)f.push('blur('+(st.blur*k).toFixed(2)+'px)');
      return f.length?f.join(' '):'none';
    }
    /* draws the finished picture into x at k canvas pixels per map pixel */
    function paint(x,k){
      var p=place(), s=source(), c=p.c, e=emptyCol(), i, j, x0, y0;
      x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,x.canvas.width,x.canvas.height);
      x.setTransform(k,0,0,k,0,0);
      if(e){x.fillStyle=e;x.fillRect(0,0,W,H);}
      x.save();x.globalAlpha=st.op/100;x.filter=filt(k);x.imageSmoothingQuality='high';
      if(st.mode==='tile'){
        x0=((p.x%p.dw)+p.dw)%p.dw;if(x0>0)x0-=p.dw;
        y0=((p.y%p.dh)+p.dh)%p.dh;if(y0>0)y0-=p.dh;
        for(j=y0;j<H;j+=p.dh)for(i=x0;i<W;i+=p.dw)x.drawImage(s,c.x,c.y,c.w,c.h,i,j,p.dw,p.dh);
      }else x.drawImage(s,c.x,c.y,c.w,c.h,p.x,p.y,p.dw,p.dh);
      x.restore();
      if(st.tintA){x.globalAlpha=st.tintA/100;x.fillStyle=st.tint;x.fillRect(0,0,W,H);x.globalAlpha=1;}
    }
    /* ---- the preview ---- */
    var view={k:1,cw:0,ch:0};
    function fitStage(aw,ah){
      var bw=Math.max(200,stage.clientWidth-24), bh=Math.max(160,stage.clientHeight-24), k=Math.min(bw/aw,bh/ah), dpr=window.devicePixelRatio||1;
      view.cw=Math.max(1,Math.round(aw*k));view.ch=Math.max(1,Math.round(ah*k));view.k=k;
      cv.style.width=view.cw+'px';cv.style.height=view.ch+'px';cv.width=Math.round(view.cw*dpr);cv.height=Math.round(view.ch*dpr);
      return view.cw*dpr/aw;
    }
    function draw(){
      if(cropping){drawCrop();return;}
      crop.hidden=true;stage.classList.remove('cropping');
      paint(cv.getContext('2d'),fitStage(W,H));
      hint.textContent=st.mode==='tile'?'Drag to move the pattern, scroll to make the tiles bigger or smaller.':'Drag the picture to move it, scroll to zoom. What you see is the whole map.';
      queueOut();
    }
    /* ---- cutting: the whole (turned) picture with a rectangle on it ---- */
    function drawCrop(){
      var s=source(), k=fitStage(s.width,s.height), x=cv.getContext('2d');
      x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.setTransform(k,0,0,k,0,0);x.drawImage(s,0,0);
      stage.classList.add('cropping');crop.hidden=false;
      var r=cropping, q=view.k, ox=cv.offsetLeft, oy=cv.offsetTop;
      crop.style.left=(ox+r.x*q)+'px';crop.style.top=(oy+r.y*q)+'px';crop.style.width=(r.w*q)+'px';crop.style.height=(r.h*q)+'px';
      cropSize.textContent=Math.round(r.w)+' \u00D7 '+Math.round(r.h);
      hint.textContent='Drag the box or its handles to choose the part to keep, then press Use this part.';
    }
    var cropSize=bgh('span','bgecsz');crop.appendChild(cropSize);
    ['nw','n','ne','e','se','s','sw','w'].forEach(function(d){var g=bgh('i','bgeh bgeh-'+d);g.setAttribute('data-h',d);crop.appendChild(g);});
    function ratio(){var s=source();return aspect==='free'?0:aspect==='map'?W/H:parseFloat(aspect)||0;}
    function cropBiggest(){
      var s=source(), a=ratio(), w=s.width, h=s.height;
      if(a){if(w/h>a)w=h*a;else h=w/a;}
      cropping={x:(s.width-w)/2,y:(s.height-h)/2,w:w,h:h};
    }
    function cropFix(r,d){
      var s=source(), a=ratio(), m=16;
      if(a&&d){if(/[ns]$/.test(d)&&d.length===1)r.w=r.h*a;else r.h=r.w/a;}
      r.w=Math.max(m,Math.min(r.w,s.width));r.h=Math.max(m,Math.min(r.h,s.height));
      if(a){if(r.w/r.h>a+1e-6)r.w=r.h*a;else if(r.w/r.h<a-1e-6)r.h=r.w/a;}
      r.x=Math.max(0,Math.min(r.x,s.width-r.w));r.y=Math.max(0,Math.min(r.y,s.height-r.h));
      return r;
    }
    crop.addEventListener('pointerdown',function(e){
      var d=e.target.getAttribute('data-h')||'move', r0={x:cropping.x,y:cropping.y,w:cropping.w,h:cropping.h}, px=e.clientX, py=e.clientY;
      e.preventDefault();crop.setPointerCapture(e.pointerId);
      function mv(ev){
        var dx=(ev.clientX-px)/view.k, dy=(ev.clientY-py)/view.k, r={x:r0.x,y:r0.y,w:r0.w,h:r0.h}, a=ratio();
        if(d==='move'){r.x+=dx;r.y+=dy;}
        else{
          if(/w/.test(d)){r.x+=dx;r.w-=dx;}if(/e/.test(d))r.w+=dx;
          if(/^n/.test(d)){r.y+=dy;r.h-=dy;}if(/^s/.test(d))r.h+=dy;
          if(a){var right=r0.x+r0.w, bottom=r0.y+r0.h;cropFix(r,d);if(/w/.test(d))r.x=right-r.w;if(/^n/.test(d))r.y=bottom-r.h;if(d==='n'||d==='s')r.x=r0.x+(r0.w-r.w)/2;if(d==='e'||d==='w')r.y=r0.y+(r0.h-r.h)/2;}
        }
        cropping=cropFix(r,null);drawCrop();
      }
      function up(){crop.removeEventListener('pointermove',mv);crop.removeEventListener('pointerup',up);crop.removeEventListener('pointercancel',up);}
      crop.addEventListener('pointermove',mv);crop.addEventListener('pointerup',up);crop.addEventListener('pointercancel',up);
    });
    /* ---- moving and zooming in the preview ---- */
    cv.addEventListener('pointerdown',function(e){
      if(cropping)return;
      var p0=place(), px=e.clientX, py=e.clientY, ax0=st.ax, ay0=st.ay;
      e.preventDefault();cv.setPointerCapture(e.pointerId);stage.classList.add('dragging');
      function mv(ev){
        var dx=(ev.clientX-px)/view.k, dy=(ev.clientY-py)/view.k;
        if(st.mode==='tile'){st.ax=ax0+dx/p0.dw;st.ay=ay0+dy/p0.dh;}
        else{
          if(Math.abs(W-p0.dw)>0.5)st.ax=Math.max(0,Math.min(1,(p0.x+dx)/(W-p0.dw)));
          if(Math.abs(H-p0.dh)>0.5)st.ay=Math.max(0,Math.min(1,(p0.y+dy)/(H-p0.dh)));
        }
        draw();syncCtl();
      }
      function up(){stage.classList.remove('dragging');cv.removeEventListener('pointermove',mv);cv.removeEventListener('pointerup',up);cv.removeEventListener('pointercancel',up);}
      cv.addEventListener('pointermove',mv);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
    });
    cv.addEventListener('wheel',function(e){
      if(cropping)return;
      e.preventDefault();
      st.zoom=Math.max(0.1,Math.min(8,st.zoom*Math.exp(-e.deltaY*0.0015)));
      draw();syncCtl();
    },{passive:false});
    /* a picture dropped on the editor replaces this one */
    stage.addEventListener('dragover',function(e){e.preventDefault();});
    stage.addEventListener('drop',function(e){
      e.preventDefault();var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(!f)return;
      var u=URL.createObjectURL(f);
      bgiLoad(u).then(function(i){img=i;src=null;st.crop=null;st.rot=0;st.fh=st.fv=false;fname=f.name;
        info.textContent='Map \u201C'+mapName()+'\u201D: '+W+' \u00D7 '+H+' \u00B7 picture \u201C'+fname+'\u201D: '+img.naturalWidth+' \u00D7 '+img.naturalHeight;draw();syncCtl();},
        function(er){say(er.message,'err');});
    });

    /* ---- the controls ---- */
    var ctl={};
    function sec(t){var s=bgh('div','bgesec');s.appendChild(bgh('div','bgest',t));side.appendChild(s);return s;}
    function btns(parent,list,key,cls){
      var r=bgh('div','bgebtns'+(cls?' '+cls:''));
      list.forEach(function(o){var b=bgh('button','fb-t',o[1]);b.type='button';b.setAttribute('data-v',o[0]);if(o[2])b.title=o[2];r.appendChild(b);});
      parent.appendChild(r);ctl[key]=r;return r;
    }
    function slider(parent,label,key,min,max,step,unit,fmt){
      var row=bgh('label','bgesl'), t=bgh('span','bgesll',label), i=bgh('input'), v=bgh('span','bgeslv');
      i.type='range';i.min=min;i.max=max;i.step=step;row.appendChild(t);row.appendChild(i);row.appendChild(v);parent.appendChild(row);
      i.addEventListener('input',function(){st[key]=parseFloat(i.value);v.textContent=fmt?fmt(st[key]):st[key]+unit;draw();});
      ctl[key]={i:i,v:v,fmt:fmt,unit:unit};return row;
    }
    // Cut
    var s1=sec('Cut');
    var cutB=bgh('div','bgebtns'), cutGo=bgh('button','fb-t','Cut a part\u2026'), cutAll=bgh('button','fb-t','Use the whole picture');
    [cutGo,cutAll].forEach(function(b){b.type='button';cutB.appendChild(b);});s1.appendChild(cutB);
    var cutBox=bgh('div','bgecutbox');cutBox.hidden=true;s1.appendChild(cutBox);
    cutBox.appendChild(bgh('div','bgesub','Shape of the part'));
    var asp=btns(cutBox,BGEASPECT,'aspect');
    var cutOk=bgh('div','bgebtns'), cutUse=bgh('button','fb-t on','Use this part'), cutNo=bgh('button','fb-t','Cancel');
    [cutUse,cutNo].forEach(function(b){b.type='button';cutOk.appendChild(b);});cutBox.appendChild(cutOk);
    var cutNote=bgh('p','bgenote');s1.appendChild(cutNote);
    function cutStart(){
      cropping=st.crop?{x:st.crop.x,y:st.crop.y,w:st.crop.w,h:st.crop.h}:null;
      if(!cropping){aspect='map';cropBiggest();}
      cutBox.hidden=false;cutB.hidden=true;syncCtl();draw();
    }
    function cutEnd(keep){
      if(keep&&cropping){var s=source();st.crop=(cropping.w>=s.width-0.5&&cropping.h>=s.height-0.5)?null:{x:Math.round(cropping.x),y:Math.round(cropping.y),w:Math.round(cropping.w),h:Math.round(cropping.h)};st.ax=st.ay=.5;}
      cropping=null;cutBox.hidden=true;cutB.hidden=false;syncCtl();draw();
    }
    cutGo.addEventListener('click',cutStart);
    cutAll.addEventListener('click',function(){st.crop=null;syncCtl();draw();});
    cutUse.addEventListener('click',function(){cutEnd(true);});
    cutNo.addEventListener('click',function(){cutEnd(false);});
    asp.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;aspect=b.getAttribute('data-v');cropBiggest();syncCtl();drawCrop();});
    // Place
    var s2=sec('Place on the map');
    var modes=btns(s2,BGEMODES,'mode','bgemodes');
    modes.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;st.mode=b.getAttribute('data-v');st.zoom=1;st.ax=st.ay=.5;syncCtl();draw();});
    var modeNote=bgh('p','bgenote');s2.appendChild(modeNote);
    slider(s2,'Zoom','zoom',0.1,4,0.01,'',function(v){return Math.round(v*100)+' %';});
    s2.appendChild(bgh('div','bgesub','Position'));
    var posRow=bgh('div','bgeposrow'), grid=bgh('div','bgegrid');
    [[0,0],[.5,0],[1,0],[0,.5],[.5,.5],[1,.5],[0,1],[.5,1],[1,1]].forEach(function(p){var b=bgh('button','bgegc');b.type='button';b.setAttribute('data-ax',p[0]);b.setAttribute('data-ay',p[1]);b.title=(p[1]===0?'Top':p[1]===1?'Bottom':'Middle')+' '+(p[0]===0?'left':p[0]===1?'right':'centre');b.appendChild(bgh('i'));grid.appendChild(b);});
    posRow.appendChild(grid);
    var center=bgh('button','fb-t','Center');center.type='button';posRow.appendChild(center);s2.appendChild(posRow);
    grid.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;st.ax=parseFloat(b.getAttribute('data-ax'));st.ay=parseFloat(b.getAttribute('data-ay'));syncCtl();draw();});
    center.addEventListener('click',function(){st.ax=st.ay=.5;syncCtl();draw();});
    s2.appendChild(bgh('div','bgesub','Turn and flip'));
    var tf=btns(s2,[['l','\u21B6 Left'],['r','Right \u21B7'],['h','\u21C6 Flip across'],['v','\u21C5 Flip up/down']],'turn');
    tf.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b)return;var v=b.getAttribute('data-v');
      if(v==='l')st.rot=(st.rot+270)%360;else if(v==='r')st.rot=(st.rot+90)%360;else if(v==='h')st.fh=!st.fh;else st.fv=!st.fv;
      src=null;st.crop=null;draw();syncCtl();
    });
    // Colours
    var s3=sec('Colours');
    slider(s3,'Brightness','br',20,200,1,' %');
    slider(s3,'Contrast','ct',20,200,1,' %');
    slider(s3,'Colour','sat',0,200,1,' %');
    slider(s3,'Black and white','gray',0,100,1,' %');
    slider(s3,'Blur','blur',0,30,0.5,' px');
    slider(s3,'Picture strength','op',0,100,1,' %');
    s3.appendChild(bgh('p','bgenote','A lower picture strength lets the empty-area colour through, so items on the map stay easy to read.'));
    var tintRow=bgh('label','bgesl'), tintC=bgh('input');tintC.type='color';tintC.value=st.tint;
    tintRow.appendChild(bgh('span','bgesll','Tint'));tintRow.appendChild(tintC);s3.appendChild(tintRow);
    tintC.addEventListener('input',function(){st.tint=tintC.value;draw();});
    slider(s3,'Tint strength','tintA',0,90,1,' %');
    var tintPre=btns(s3,[['#000000:45','Darker'],['#ffffff:45','Lighter'],[mapCol+':40','Map colour']],'tintpre');
    tintPre.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var p=b.getAttribute('data-v').split(':');st.tint=p[0];st.tintA=parseFloat(p[1]);tintC.value=p[0];syncCtl();draw();});
    // Empty areas and the file
    var s4=sec('Empty areas and file');
    var fillRow=bgh('div','bgefill'), fillMap=bgh('button','fb-t','The map\u2019s colour'), fillPick=bgh('input');
    fillMap.type='button';fillPick.type='color';fillPick.value=mapCol;fillPick.title='Another colour';
    fillRow.appendChild(fillMap);fillRow.appendChild(fillPick);s4.appendChild(fillRow);
    fillMap.addEventListener('click',function(){st.fill='';syncCtl();draw();});
    fillPick.addEventListener('input',function(){st.fill=fillPick.value;syncCtl();draw();});
    var fmts=btns(s4,[['jpg','JPG (smaller)'],['png','PNG (sharp, see-through)']],'fmt');
    fmts.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;st.fmt=b.getAttribute('data-v');syncCtl();draw();});
    var qRow=slider(s4,'JPG quality','q',40,100,1,' %');
    var fillNote=bgh('p','bgenote');s4.appendChild(fillNote);

    function on(row,v){[].forEach.call(row.querySelectorAll('button'),function(b){b.classList.toggle('on',b.getAttribute('data-v')===String(v));});}
    function syncCtl(){
      on(modes,st.mode);on(asp,aspect);on(fmts,st.fmt);
      var m=BGEMODES.filter(function(x){return x[0]===st.mode;})[0];modeNote.textContent=m?m[2]:'';
      ['zoom','br','ct','sat','gray','blur','op','tintA','q'].forEach(function(k){var c=ctl[k];if(!c)return;c.i.value=st[k];c.v.textContent=c.fmt?c.fmt(st[k]):st[k]+c.unit;});
      [].forEach.call(grid.children,function(b){b.classList.toggle('on',parseFloat(b.getAttribute('data-ax'))===st.ax&&parseFloat(b.getAttribute('data-ay'))===st.ay);});
      fillMap.classList.toggle('on',!st.fill);fillPick.classList.toggle('on',!!st.fill);
      qRow.hidden=st.fmt!=='jpg';
      fillNote.textContent=(st.fmt==='png'&&!st.fill)?'Empty areas stay see-through, so PRTG\u2019s background colour shows there.':'';
      var c=cutRect();cutNote.textContent=st.crop?'Using a part: '+c.w+' \u00D7 '+c.h+' of '+source().width+' \u00D7 '+source().height+'.':'Using the whole picture.';
      cutAll.hidden=!st.crop;
      [s2,s3,s4].forEach(function(s){s.classList.toggle('bgeoff',!!cropping);});
      go.disabled=dl.disabled=!!cropping||BGI.busy;
    }
    /* ---- the finished file ---- */
    function makeBlob(){
      return new Promise(function(ok,no){
        var c=document.createElement('canvas');c.width=W;c.height=H;paint(c.getContext('2d'),1);
        c.toBlob(function(b){if(b)ok(b);else no(new Error('Chrome could not make the picture.'));},st.fmt==='png'?'image/png':'image/jpeg',st.q/100);
      });
    }
    function kb(n){return n>=1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';}
    function queueOut(){
      clearTimeout(blobT);outBlob=null;outInfo.textContent=W+' \u00D7 '+H+' \u00B7 '+st.fmt.toUpperCase()+' \u00B7 \u2026';
      blobT=setTimeout(function(){makeBlob().then(function(b){outBlob=b;outInfo.textContent=W+' \u00D7 '+H+' \u00B7 '+st.fmt.toUpperCase()+' \u00B7 '+kb(b.size)+(b.size>=20*1048576?' \u00B7 too big for PRTG (20 MB)':'');outInfo.classList.toggle('err',b.size>=20*1048576);},function(){});},350);
    }
    function fileName(){return 'map-studio-background-'+mapid+'-'+W+'x'+H+'.'+(st.fmt==='png'?'png':'jpg');}
    function close(){if(BGI.busy)return;clearTimeout(blobT);window.removeEventListener('resize',draw);document.removeEventListener('keydown',key,true);if(ov.parentNode)ov.parentNode.removeChild(ov);}
    function key(e){
      if(e.key==='Escape'){e.stopPropagation();if(cropping)cutEnd(false);else close();return;}
      if(cropping||/^(INPUT|SELECT|TEXTAREA)$/.test((e.target&&e.target.tagName)||''))return;
      var d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!d)return;
      e.preventDefault();var p=place(), n=e.shiftKey?20:2;
      if(st.mode==='tile'){st.ax+=d[0]*n/p.dw;st.ay+=d[1]*n/p.dh;draw();syncCtl();return;}
      if(Math.abs(W-p.dw)>0.5)st.ax=Math.max(0,Math.min(1,(p.x+d[0]*n)/(W-p.dw)));
      if(Math.abs(H-p.dh)>0.5)st.ay=Math.max(0,Math.min(1,(p.y+d[1]*n)/(H-p.dh)));
      draw();syncCtl();
    }
    no.addEventListener('click',close);
    ov.addEventListener('mousedown',function(e){if(e.target===ov)close();});
    reset.addEventListener('click',function(){st=bgeBlank();src=null;cropping=null;aspect='free';tintC.value=st.tint;fillPick.value=mapCol;cutBox.hidden=true;cutB.hidden=false;syncCtl();draw();});
    dl.addEventListener('click',function(){
      makeBlob().then(function(b){var a=document.createElement('a'), u=URL.createObjectURL(b);a.href=u;a.download=fileName();document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},30000);});
    });
    go.addEventListener('click',function(){
      var name=mapName();
      if(String(mapId())!==String(mapid)){say('The map chosen in Map Studio changed. Close this and open the picture again.','err');return;}
      BGI.busy=true;syncCtl();bgiSync();say('Sending the picture to \u201C'+name+'\u201D\u2026','');
      var blob;
      makeBlob().then(function(b){
        blob=b;
        if(b.size>=20*1048576)throw new Error('The picture is '+kb(b.size)+'; PRTG takes pictures under 20 MB. Choose JPG or a lower quality.');
        return bgiSend(mapid,b,fileName());
      }).then(function(v){
        if(!v.bg)return {v:v,dims:null};
        return bgiDims(v.bg).then(function(d){return {v:v,dims:d};});
      }).then(function(r){
        BGI.busy=false;
        if(BGI.cur.url&&BGI.cur.url!==r.v.bg)try{URL.revokeObjectURL(BGI.cur.url);}catch(e){}
        BGI.cur={id:String(mapid),url:r.v.bg||'',color:hex6(r.v.color)||mapCol};
        bgiShow(r.v.bg||URL.createObjectURL(blob));bgiSync();
        if(!r.v.bg)bgiMsg('The picture was sent to \u201C'+name+'\u201D, but Map Studio could not read the map back to check it. Open the map in PRTG to see it.','');
        else if(r.dims&&(r.dims.w!==W||r.dims.h!==H))bgiMsg('\u201C'+name+'\u201D now has the picture, but PRTG shows it at '+r.dims.w+' \u00D7 '+r.dims.h+' instead of '+W+' \u00D7 '+H+'.','err');
        else bgiMsg('\u201C'+name+'\u201D now has the picture ('+W+' \u00D7 '+H+', '+kb(blob.size)+').','ok');
        close();
      }).catch(function(e){
        BGI.busy=false;syncCtl();bgiSync();
        if(e&&e.status===401)authNeeded();
        say((e&&e.message)||'Could not send the picture.','err');
      });
    });
    window.addEventListener('resize',draw);
    document.addEventListener('keydown',key,true);
    syncCtl();
    requestAnimationFrame(draw);
    try{go.focus();}catch(e){}
  }
  (function(){
    var f=$('mapbgifile');
    if(!f)return;
    $('mapbgipick').addEventListener('click',function(){f.value='';f.click();});
    f.addEventListener('change',function(){var x=f.files&&f.files[0];if(x)bgiOpen(URL.createObjectURL(x),x.name,true);});
    $('mapbgiedit').addEventListener('click',function(){if(BGI.cur.url)bgiOpen(BGI.cur.url,'the map\u2019s current picture',false);});
    $('mapbgidel').addEventListener('click',bgiRemove);
    $('mapbgbtn').addEventListener('click',function(){setTimeout(function(){if(!$('bgpanel').hidden)bgiRefresh();},0);});   /* js/10-dashtabs.js opens the panel after this runs */
    $('pushmap').addEventListener('change',function(){BGI.cur={id:'',url:''};bgiMsg('','');bgiSync();if(!$('bgpanel').hidden)bgiRefresh();});
  })();
  var LINKST={g:'up',r:'down',y:'warning',o:'unusual',b:'paused',bl:'paused',gr:'unknown'};
  function exLinks(conn){
    var by={}, defs='', body='', n=0;
    EX.items.forEach(function(it){by[it.subid]=it;});
    function ctr(it){return {x:(it.left||0)+(it.width||0)/2,y:(it.top||0)+(it.height||0)/2};}
    function col(it){var m=/\bmap_objectstate_sens([a-z]+)\b/.exec(it.cls||''), c=m?m[1]:'', k=LINKST[c];if(!k){var w=/\bstatus-(up|down|warning|unusual|paused|unknown)\b/.exec(it.cls||'');k=w?w[1]:'unknown';}return LINKCOL[k]||LINKCOL.unknown;}
    Object.keys(conn||{}).forEach(function(a){
      (Array.isArray(conn[a])?conn[a]:[]).forEach(function(bk){
        var A=by[a], B=by[bk], p, q, dx, dy, len, off, cx, cy, gid, d;
        if(!A||!B)return;
        p=ctr(A);q=ctr(B);dx=q.x-p.x;dy=q.y-p.y;len=Math.sqrt(dx*dx+dy*dy);
        if(len<2)return;
        off=len*0.22;if(q.x<p.x)off=-off;
        cx=(p.x+q.x)/2+(dy/len)*off;cy=(p.y+q.y)/2-(dx/len)*off;
        d='M '+p.x+' '+p.y+' Q '+cx+' '+cy+' '+q.x+' '+q.y;
        gid='dexg'+(n++);
        defs+='<linearGradient id="'+gid+'" gradientUnits="userSpaceOnUse" x1="'+p.x+'" y1="'+p.y+'" x2="'+q.x+'" y2="'+q.y+'"><stop offset="0" stop-color="'+col(A)+'"/><stop offset="0.4" stop-color="'+col(A)+'"/><stop offset="0.6" stop-color="'+col(B)+'"/><stop offset="1" stop-color="'+col(B)+'"/></linearGradient>';
        body+='<path d="'+d+'" fill="none" stroke="url(#'+gid+')" stroke-width="11" stroke-linecap="round" opacity="0.22"/><path d="'+d+'" fill="none" stroke="url(#'+gid+')" stroke-width="5" stroke-linecap="round"/>';
      });
    });
    return n?'<svg class="dexlines" width="'+(EX.mapW||1920)+'" height="'+(EX.mapH||1080)+'" style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible"><defs>'+defs+'</defs>'+body+'</svg>':'';
  }
  /* the device tree the target picker uses (loaded once, shared), then a lookup for anything the tree does not hold, such as sensors */
  function exTree(){
    return new Promise(function(done){
      var k=0;
      if(TR.loaded||TR.failed){done();return;}
      if(TR.loading){(function wait(){if(!TR.loading||k++>100){done();return;}setTimeout(wait,150);})();return;}
      TR.loading=true;
      http('GET','/api/tree.json',{groups:1,devices:1,probes:1,allowroot:1}).then(function(t){
        var r=trParse(parseJson(t,'The device tree'));
        if(r){TR.nodes=r.nodes;TR.roots=r.roots;TR.loaded=true;}
        TR.loading=false;try{trRender();}catch(e){}done();
      },function(err){if(err&&err.status===401)authNeeded();TR.loading=false;done();});
    });
  }
  function exWhere(n){
    var out=[], p=(n.parent!=null)?TR.nodes[n.parent]:null, guard=0;
    while(p&&guard++<30){if(p.id!==0)out.unshift(p.name);p=(p.parent!=null)?TR.nodes[p.parent]:null;}
    return out.join(' \u203A ');
  }
  function exNames(){
    var ids={}, pend=[], map=EX.map;
    EX.items.forEach(function(it){if(it.target)ids[it.target]=1;});
    return exTree().then(function(){
      Object.keys(ids).forEach(function(id){
        var n=TR.loaded?TR.nodes[id]:null;
        if(n)EX.target[id]={type:n.type,name:n.name,where:exWhere(n)};
        else pend.push(id);
      });
      return Promise.all(pend.slice(0,12).map(function(id){
        return http('GET','/api/table.json',{content:'sensors',columns:'objid,sensor,device',filter_objid:id,count:1}).then(function(t){
          var a=(parseJson(t,'A sensor').sensors)||[];
          if(a.length&&String(a[0].objid)===String(id))EX.target[id]={type:'sensor',name:a[0].sensor||('Sensor '+id),where:a[0].device||''};
        },function(){});
      }));
    }).then(function(){return map;});
  }
  function exBinding(it){
    var t=it.target?EX.target[it.target]:null;
    if(!it.target)return '';
    if(!t)return 'object '+it.target;
    return t.type+' \u201C'+t.name+'\u201D'+(t.where?' ('+t.where+')':'');
  }
  function exLabel(it){return (it.cat||it.name)?(it.cat+(it.name?': '+it.name:'')):it.cls.replace(/\bmap_object\b/,'').trim()||'Item';}
  /* an item drawn the way PRTG draws it: its own markup on PRTG's stylesheet, in a frame that cannot reach this page */
  /* MV3 forbids inline <script> inside a plain srcdoc iframe on this page.
     preview-sandbox.html is a manifest 'sandbox' page (relaxed CSP) that we
     point these preview iframes at; we hand it the real HTML over postMessage
     and it builds the actual srcdoc iframe itself, with the SAME sandbox=""/
     "allow-scripts" gating the tool always applied, so the Custom-HTML export
     script-blocking behaviour is unchanged. allowSameOrigin is only set for the
     live pv-preview panes, which need to read the rendered content's geometry
     back out (see pvMeasure/pvPaneFit) -- exported/Custom HTML previews never
     set it, matching their original, more isolated sandboxing exactly. */
  /* true when a message came from inside one of this page's own preview frames: the frame that sent it must sit directly in a preview-sandbox frame of this page */
  function fromOwnPreview(src){
    var fs=document.querySelectorAll('iframe'), i;
    try{
      for(i=0;i<fs.length;i++){if(fs[i].contentWindow&&src.parent===fs[i].contentWindow&&src!==fs[i].contentWindow)return true;}
    }catch(e){}
    return false;
  }
  var PVSBX_SEQ=0;
  var PVSBX_URL=(window.chrome&&chrome.runtime&&chrome.runtime.getURL)?chrome.runtime.getURL('preview-sandbox.html'):'preview-sandbox.html';
  function setFramePreview(f,html,opts,onReady){
    opts=opts||{};
    var seq=++PVSBX_SEQ;
    function send(){
      f.contentWindow.postMessage({type:'pv-write',seq:seq,html:html,allowScripts:!!opts.allowScripts,allowSameOrigin:!!opts.allowSameOrigin},'*');
    }
    if(onReady){
      var handler=function(e){
        if(e.source===f.contentWindow&&e.data&&e.data.type==='pv-ready'&&e.data.seq===seq){
          window.removeEventListener('message',handler);
          onReady();
        }
      };
      window.addEventListener('message',handler);
    }
    /* a frame still loading keeps only the latest document and gets it once loaded: an older write must never land after a newer one */
    f._pvLast=send;
    if(f._pvLoaded&&f.getAttribute('src')===PVSBX_URL){send();return;}
    f._pvLatest=send;
    if(!f._pvHooked){f._pvHooked=true;f.addEventListener('load',function(){f._pvLoaded=true;var go=f._pvLatest||f._pvLast;f._pvLatest=null;if(go)go();});}   /* a frame the browser reloaded (moved in the page) gets its last document again */
    if(f.getAttribute('src')!==PVSBX_URL){f._pvLoaded=false;f.setAttribute('src',PVSBX_URL);}
  }
  /* PRTG's stylesheet with its fonts inlined. A preview frame has no origin of its own and PRTG sends no CORS header, so the browser refuses the fonts the stylesheet links to (icons and text then fall back). This page may read them, so it fetches them and puts them in the stylesheet itself. */
  var CSSX={origin:'',style:'',busy:null,busyFor:''};
  function b64(buf){var a=new Uint8Array(buf),s='',i;for(i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s);}
  function prtgCss(){
    var origin=(base()||pageOrigin()||''), cred=base()?'omit':'same-origin';
    if(CSSX.origin===origin&&CSSX.style)return Promise.resolve(CSSX.style);
    if(CSSX.busy&&CSSX.busyFor===origin)return CSSX.busy;
    CSSX.busyFor=origin;
    CSSX.busy=fetchWithTimeout(origin+'/css/prtg0.css',{credentials:cred}).then(function(r){if(!r.ok)throw new Error('css');return r.text();}).then(function(css){
      var jobs=[], mimes={woff2:'font/woff2',woff:'font/woff',ttf:'font/ttf',otf:'font/otf'};
      var out=css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g,function(m,q,u){
        var abs, ext, key;
        if(/^(data:|https?:|\/\/)/i.test(u))return m;
        try{abs=new URL(u,origin+'/css/').href;}catch(e){return m;}
        ext=(/\.([a-z0-9]+)(?:[?#]|$)/i.exec(u)||[])[1];ext=ext&&ext.toLowerCase();
        if(mimes[ext]){key='@@F'+jobs.length+'@@';jobs.push({key:key,url:abs,mime:mimes[ext]});return 'url('+key+')';}
        return 'url("'+abs+'")';
      });
      return Promise.all(jobs.map(function(j){
        return fetchWithTimeout(j.url,{credentials:'omit'}).then(function(r){return r.ok?r.arrayBuffer():null;}).then(function(buf){j.data=buf?('data:'+j.mime+';base64,'+b64(buf)):j.url;},function(){j.data=j.url;});
      })).then(function(){
        jobs.forEach(function(j){out=out.split(j.key).join(j.data);});
        CSSX.origin=origin;CSSX.style='<style>'+out+'</style>';return CSSX.style;
      });
    }).catch(function(){return '';}).then(function(s){CSSX.busy=null;return s;});
    return CSSX.busy;
  }
  function cssHead(origin){return (CSSX.origin===origin&&CSSX.style)||'<link rel="stylesheet" href="/css/prtg0.css">';}
  /* PRTG's own page scripts (the plugins that draw gauges, donuts and status dots) come from PRTG's View Map page. They are read once per server and added to the head of each preview that may run scripts. */
  function exLibs(){
    var origin=(base()||pageOrigin()||'');
    if(EX.libsFor===origin)return Promise.resolve();
    return http('GET','/map.htm',{id:mapId()}).then(function(t){
      var d=new DOMParser().parseFromString(t,'text/html'), out=[];
      [].forEach.call(d.querySelectorAll('script[src]'),function(s){
        var u;try{u=new URL(s.getAttribute('src'),origin+'/').href;}catch(e){return;}
        out.push('<script src="'+u.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"><\/script>');
      });
      EX.libs=out.join('');EX.libsFor=origin;
    },function(){EX.libs='';EX.libsFor=origin;});
  }
  function exWantsScripts(it){return $('exscr').checked&&(!it||it.cat!=='Custom HTML');}
  function exDoc(it,w,h){
    var origin=(base()||pageOrigin()||''), libs=exWantsScripts(it)?EX.libs:'';
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><base href="'+origin+'/">'+cssHead(origin)+''
      +'<style>html,body,#mapshow,#mapshow .view,#mapview{margin:0;padding:0;background:transparent!important;box-shadow:none!important;border:0!important}html,body{overflow:hidden}#mapshow,#mapshow .view,#mapview,#mapview .map_object{overflow:visible!important}'
      +'#mapview{position:relative;width:'+w+'px;height:'+h+'px}#mapview .map_object{position:absolute!important;left:0!important;top:0!important;margin:0!important;width:'+w+'px!important;height:'+h+'px!important}</style>'+EX.styles+libs
      +'</head><body id="mainbody" data-theme="0" class="language_en"><div id="mapshow"><div class="view" style="position:static;overflow:visible"><div id="mapview">'+it.outer+'</div></div></div>'+(libs?pvInitScript('mapview'):'')+'</body></html>';
  }
  /* the gauge loader over the canvas while a map is read: from pressing Load until every item's preview frame has drawn (or 25 seconds have passed) */
  var EXL=null;
  function exlStart(id){
    exlStop();
    EXL={id:id,total:0,done:0,settled:false,timer:setTimeout(exlStop,25000)};
    gloadShow($('dscroll'),'map','Reading the map\u2026',true);
  }
  function exlStop(){
    if(EXL){clearTimeout(EXL.timer);EXL=null;}
    gloadHide('map');
  }
  function exlCheck(){
    if(!EXL||!EXL.settled)return;
    if(EXL.done>=EXL.total){exlStop();return;}
    gloadShow($('dscroll'),'map','Drawing items\u2026 '+EXL.done+' of '+EXL.total,true);
  }
  function exlSettle(id,rendered,named){
    var run=EXL;
    function fin(){if(EXL&&EXL===run){run.settled=true;exlCheck();}}
    Promise.all([rendered.catch(function(){}),named.catch(function(){})]).then(fin);
  }
  function exFrame(it,w,h){
    var f=document.createElement('iframe'), run=EXL;
    f.setAttribute('tabindex','-1');
    if(run)run.total++;
    setFramePreview(f,exDoc(it,w,h),{allowScripts:exWantsScripts(it)},function(){if(run&&run===EXL){run.done++;exlCheck();}});
    return f;
  }
  var EXCOL={up:'#3a9d23',warning:'#f5a623',down:'#d0021b',unusual:'#e8590c',paused:'#8e9bae',other:'#8e9bae'};
  /* the Geo Map's locations, plotted from the coordinates in its own data block. PRTG's map tiles need its scripts and a map service, so they are not drawn. */
  function exGeo(it,w,h){
    var m=/<!--\s*(\{[\s\S]*?\})\s*-->/.exec(it.html), ns='http://www.w3.org/2000/svg', L, pts=[], i, p, x0=1e9, x1=-1e9, y0=1e9, y1=-1e9, kx, sx, sy, sc, pad=Math.max(24,Math.min(w,h)*0.06), ox, oy, svg, e, t, r, cnt={};
    try{L=JSON.parse(m[1]).markers.locationlist;}catch(err){return null;}
    if(!Array.isArray(L))return null;
    L.forEach(function(x){
      var c=x&&x.coordinates, nm='';
      if(!Array.isArray(c)||c.length<2||isNaN(Number(c[0]))||isNaN(Number(c[1])))return;
      try{nm=(new DOMParser().parseFromString(String(x.link||''),'text/html').body.textContent||'').trim();}catch(err){}
      pts.push({x:Number(c[0]),y:Number(c[1]),w:exStateWord(x.state),n:nm||String(x.location||'')});
    });
    if(!pts.length)return null;
    pts.forEach(function(q){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);y0=Math.min(y0,q.y);y1=Math.max(y1,q.y);});
    kx=Math.cos(((y0+y1)/2)*Math.PI/180)||1;
    sx=Math.max((x1-x0)*kx,0.01);sy=Math.max(y1-y0,0.01);
    sc=Math.min((w-2*pad)/sx,(h-2*pad)/sy);
    ox=(w-sx*sc)/2;oy=(h-sy*sc)/2;
    svg=document.createElementNS(ns,'svg');svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('viewBox','0 0 '+w+' '+h);
    r=Math.max(5,Math.min(w,h)/90);
    pts.forEach(function(q){
      e=document.createElementNS(ns,'circle');e.setAttribute('cx',ox+(q.x-x0)*kx*sc);e.setAttribute('cy',oy+(y1-q.y)*sc);e.setAttribute('r',r);
      e.setAttribute('fill',EXCOL[q.w]||EXCOL.other);e.setAttribute('stroke','#fff');e.setAttribute('stroke-width',Math.max(1.5,r/4));
      t=document.createElementNS(ns,'title');t.textContent=q.n+' ('+q.w+')';e.appendChild(t);svg.appendChild(e);
      cnt[q.w]=(cnt[q.w]||0)+1;
      if(pts.length<=14){t=document.createElementNS(ns,'text');t.setAttribute('x',ox+(q.x-x0)*kx*sc+r+4);t.setAttribute('y',oy+(y1-q.y)*sc+r/2);t.setAttribute('font-size',Math.max(11,r*1.6));t.setAttribute('fill','#44505e');t.setAttribute('font-family','Roboto,Arial,sans-serif');t.textContent=q.n;svg.appendChild(t);}
    });
    t=document.createElementNS(ns,'text');t.setAttribute('x',12);t.setAttribute('y',h-12);t.setAttribute('font-size',Math.max(12,r*1.7));t.setAttribute('fill','#6b7a8a');t.setAttribute('font-family','Roboto,Arial,sans-serif');
    t.textContent=pts.length+' locations as PRTG\u2019s Geo Map plots them (map tiles are not drawn here)';svg.appendChild(t);
    return svg;
  }
  function exBox(it,framesLeft){
    var box=document.createElement('div'), w=it.width||100, h=it.height||40, f, g;
    box.className='dexitem';box.setAttribute('data-sub',it.subid);
    box.style.left=(it.left||0)+'px';box.style.top=(it.top||0)+'px';box.style.width=w+'px';box.style.height=h+'px';
    g=(it.cat==='Geo Maps'||/\bgeomap\b/.test(it.cls))?exGeo(it,w,h):null;
    if(g){box.className+=' geo';box.appendChild(g);}
    else if(framesLeft>0){box.appendChild(exFrame(it,w,h));box.setAttribute('data-frame','1');}
    else exPlaceholder(box,it);
    return box;
  }
  function exPlaceholder(box,it){
    var f;
    box.textContent='';box.className='dexitem ph'+(box.className.indexOf(' geo')>-1?' geo':'');
    box.appendChild(document.createTextNode(exLabel(it)));
    f=document.createElement('small');f.textContent='#'+it.subid+(it.target?' \u00B7 shows '+exBinding(it):'');box.appendChild(f);
    if(it.summary){f=document.createElement('small');f.textContent=it.summary;box.appendChild(f);}
  }
  function exRender(keepLayer){
    var layer=exLayer(), list=$('exlist'), mine={}, rec, items=EX.items.slice().sort(function(a,b){return (a.z||0)-(b.z||0);});
    var frames=CFG.preview.maxFrames;
    if(!keepLayer){
      layer.textContent='';
      exPaintBg();
      if(EX.lines)layer.insertAdjacentHTML('beforeend',EX.lines);
    }
    list.textContent='';
    try{rec=getRec();Object.keys(rec.items).forEach(function(k){mine[String(rec.items[k].subid)]=1;});}catch(e){}
    items.forEach(function(it){
      var w=it.width||100, h=it.height||40, row=document.createElement('div'), b=document.createElement('b'), sm=document.createElement('small'), box;
      if(keepLayer){
        box=layer.querySelector('.dexitem[data-sub="'+it.subid+'"]');
        if(box&&box.className.indexOf('ph')>-1)exPlaceholder(box,it);
        if(box&&box.getAttribute('data-frame'))frames--;
      }else{
        box=exBox(it,frames);
        if(box.getAttribute('data-frame'))frames--;
        layer.appendChild(box);
      }
      row.className='exrow';row.setAttribute('data-sub',it.subid);
      b.textContent='#'+it.subid+'  '+exLabel(it);row.appendChild(b);
      sm.textContent=Math.round(w)+' \u00D7 '+Math.round(h)+' at '+Math.round(it.left||0)+', '+Math.round(it.top||0)+' \u00B7 layer '+(it.z||0)+(mine[it.subid]?' \u00B7 pushed from this layout':'');
      row.appendChild(sm);
      if(it.target||it.summary){sm=document.createElement('small');sm.textContent=(it.target?'shows '+exBinding(it):'')+((it.target&&it.summary)?' \u00B7 ':'')+(it.summary||'');row.appendChild(sm);}
      row.addEventListener('click',function(){if(XE.sel===it.subid)exUnpick();else exPick(it.subid);});
      list.appendChild(row);
    });
    list.hidden=!items.length;$('exonrow').hidden=!items.length;$('exdimrow').hidden=!items.length;$('exscrrow').hidden=!items.length;$('exunload').hidden=!items.length;
    xeDecorate();
    try{document.dispatchEvent(new Event('exchanged'));}catch(e){}
  }
  function exLoad(){
    var id=mapId();
    if(!id)return;
    if(typeof xeReset0==='function')xeReset0();
    $('exload').disabled=true;$('exmsg').textContent='Reading the map\u2026';$('exmsg').className='note pst';
    exlStart(id);
    sampleGet({kind:'items',label:'Items on the map',path:'/api/mapsvg.htm',params:{id:id}}).then(function(o){
      var m, n;
      $('exload').disabled=false;updateButtons();
      if(String(mapId())!==String(id)){exlStop();return;}                 /* another map was chosen meanwhile */
      if(o.status===401){authNeeded();}
      if(o.error||o.status<200||o.status>=300){exlStop();$('exmsg').textContent=o.error||('PRTG answered '+o.status+' for the map\u2019s items.');$('exmsg').className='note pst err';return;}
      EX.items=exParse(o.body||'');EX.map=id;EX.bg='';EX.bgColor='';EX.lines='';
      m=/<svg\b[^>]*\bwidth="(\d+)px"/i.exec(o.body||'');n=/<svg\b[^>]*\bheight="(\d+)px"/i.exec(o.body||'');
      EX.mapW=m?parseInt(m[1],10):0;EX.mapH=n?parseInt(n[1],10):0;
      var rendered=Promise.all([prtgCss(),EX.items.length&&$('exscr').checked?exLibs():null,exMapView(id).then(function(v){if(EX.map!==id)return;if(EX.bg&&EX.bg!==v.bg){try{URL.revokeObjectURL(EX.bg);}catch(e){}}EX.bg=v.bg;EX.bgColor=v.color;EX.lines=exLinks(v.conn);if(hex6(v.color))$('mapbgcolor').value=hex6(v.color);bgMsg('','');bgPreSync();},function(){EX.bg='';})]).then(function(){if(EX.map===id)exRender();});
      var named=exNames().then(function(m){if(m===EX.map)exRender(true);});
      exlSettle(id,rendered,named);
      $('exsize').hidden=!(EX.mapW&&EX.mapH);
      $('exmsg').textContent=EX.items.length?(EX.items.length+(EX.items.length===1?' item':' items')+' on \u201C'+mapName()+'\u201D'+(EX.mapW?'. The map is '+EX.mapW+' \u00D7 '+EX.mapH+' px.':'.')+' Click one in the list to find it on the canvas.'):('There is nothing on \u201C'+mapName()+'\u201D yet.');
      $('exmsg').className='note pst ok';
    });
  }
  $('exload').addEventListener('click',function(){
    $('exfs').hidden=false;
    exLoad();
  });
  $('exunload').addEventListener('click',exUnload);
  /* ---- copy a map and paste it on another map, on this server or another one.
     Copy reads every item of the loaded map: which object file it uses (from the <!--Category: Name--> PRTG writes before it),
     where it sits, its own HTML before/after and link, and what it showed. Paste looks for each file on the connected server
     and suggests what to use; the items go onto the canvas, where the targets are chosen and the map is pushed as usual. */
  function mcEl(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
  var MC_KEY='pmMapCopy', MC={rows:[],copy:null};
  function mcValid(o){return !!(o&&o.kind==='pm-map-copy'&&o.items instanceof Array);}
  function mcGet(){try{var o=JSON.parse(localStorage.getItem(MC_KEY)||'null');return mcValid(o)?o:null;}catch(e){return null;}}
  function mcPut(o){try{localStorage.setItem(MC_KEY,JSON.stringify(o));return true;}catch(e){return false;}}
  function mcSame(a,b){return String(a||'').trim().toLowerCase()===String(b||'').trim().toLowerCase();}
  function mcBase(v){return String(v||'').split(/[\\\/]/).pop();}
  function mcHost(){return hostOf(base()||pageOrigin()||'');}
  function mcSay(m,kind){var n=$('mcmsg');n.textContent=m;n.className='note pst'+(kind?' '+kind:'');}
  function mcStat(m,kind){var n=$('mcstat');n.hidden=!m;n.textContent=m||'';n.className='note pst'+(kind?' '+kind:'');}
  function mcKind(cat,name,file,cls){
    if(/ownhtmlonly/i.test(file||'')||/^custom html$/i.test(String(cat||'').trim()))return 'custom';
    if(/\bpgr_/.test(cls||'')||/^map studio/i.test(String(name||'').trim())||/^map-studio/i.test(mcBase(file)))return 'ms';
    return 'prtg';
  }
  function mcCatEntry(cat,name){var l=S.catalog||[], i;for(i=0;i<l.length;i++){if(mcSame(l[i].cat,cat)&&mcSame(l[i].name,name))return l[i];}return null;}
  function mcFileEntry(file){var l=S.catalog||[], b=mcBase(file), i;if(!b)return null;for(i=0;i<l.length;i++){if(mcSame(mcBase(l[i].value),b))return l[i];}return null;}
  function mcWas(r){var t=r.target;if(!t||!t.id)return '';return (t.type?t.type+' ':'')+(t.name?'“'+t.name+'”':'ID '+t.id)+(t.where?' ('+t.where+')':'')+(r.from?' on '+r.from:'');}
  function mcSync(){
    var c=mcGet(), conn=!!(S.maps&&S.objFile);
    $('excopy').disabled=!(EX.items.length&&String(EX.map)===String(mapId()))||!!S.busy;
    $('excopy').dataset.tip=EX.items.length?'Copy the loaded map’s items, to paste them on another map, on this server or another':'Choose a map and press Load first';
    $('mcpaste').hidden=!c;$('mcpaste').disabled=!(conn&&mapId())||!!S.busy;
    $('mcpaste').title=(conn&&mapId())?'':'Connect and choose the map to paste into';
    $('mcsave').hidden=!c;
    if(c&&$('mcstat').getAttribute('data-sticky')!=='1')mcStat('Copy kept: '+c.items.length+(c.items.length===1?' item':' items')+' from “'+c.from.map+'” on '+c.from.host+', '+new Date(c.at).toLocaleString()+'.');
    else if(!c)mcStat('');
  }
  function mcCopy(){
    var items=EX.items.slice(), id=mapId(), done=0;
    if(!items.length||String(EX.map)!==String(id))return;
    $('excopy').disabled=true;$('mcstat').setAttribute('data-sticky','1');mcStat('Reading the settings of '+items.length+' items…');
    var q=items.slice(), lib=libLoad();
    function worker(){var it=q.shift();if(!it)return Promise.resolve();return xeBase(it.subid).then(function(){done++;mcStat('Reading the settings of each item: '+done+' of '+items.length+'…');},function(){done++;}).then(worker);}
    Promise.all([worker(),worker(),worker()]).then(function(){
      if(String(mapId())!==String(id)){$('mcstat').removeAttribute('data-sticky');mcSync();return;}
      var host=mcHost(), n={custom:0,ms:0,prtg:0}, noSet=0, out=items.map(function(it){
        var s=XE.cur[it.subid], e=mcCatEntry(it.cat,it.name), file=e?e.value:(/^custom html$/i.test(String(it.cat||'').trim())?String(S.objFile||''):''), kind=mcKind(it.cat,it.name,file,it.cls), t=it.target?EX.target[it.target]:null, f, r;
        if(!s)noSet++;
        r={cat:it.cat||'',name:it.name||'',file:mcBase(file),kind:kind,left:(s?s.left:it.left)||0,top:(s?s.top:it.top)||0,width:(s?s.width:it.width)||0,height:(s?s.height:it.height)||0,z:(s?s.z:it.z)||0,
          before:s?s.before:'',after:s?s.after:'',link:s?s.link:'',target:it.target?{id:it.target,type:(t&&t.type)||'',name:(t&&t.name)||'',where:(t&&t.where)||''}:null};
        if(kind==='ms')for(f in lib){if(mcSame(lib[f].cat,it.cat)&&mcSame(lib[f].name,it.name)&&lib[f].code){r.libFile=f;r.code=lib[f].code;break;}}
        n[kind]++;
        return r;
      });
      var copy={kind:'pm-map-copy',v:1,at:new Date().toISOString(),from:{host:host,map:mapName(),id:String(id)},w:EX.mapW||0,h:EX.mapH||0,items:out};
      $('mcstat').removeAttribute('data-sticky');
      var kept=mcPut(copy);MC.copy=copy;
      mcSync();
      mcStat('Copied '+out.length+(out.length===1?' item':' items')+' from “'+copy.from.map+'”: '+[n.prtg?n.prtg+' PRTG object'+(n.prtg===1?'':'s'):'',n.ms?n.ms+' Map Studio object'+(n.ms===1?'':'s'):'',n.custom?n.custom+' Custom HTML':''].filter(Boolean).join(', ')+'.'+(noSet?' '+noSet+' could not be read in full (their HTML before/after and link are not in the copy).':'')+(kept?' Connect to the other server (or stay here), choose or create a map, then press Paste copied map.':' It is too big to keep in this browser: use Save the copy as a file.'),noSet||!kept?'err':'ok');
      $('mcsave').hidden=false;
    });
  }
  function mcTok(s){return String(s||'').toLowerCase().replace(/\.htm$/,'').replace(/map[ -]?studio/g,' ').split(/[^a-z0-9]+/).filter(function(w){return w.length>1;});}
  function mcStem(v){return mcBase(v).toLowerCase().replace(/\.htm$/,'').replace(/[\s_-]*(small|large|tiny|xl|\d+)\b/g,'').replace(/[\s_-]+$/,'');}
  function mcSuggest(r){
    var a=mcTok(r.name), icon=/\.(svg|png)$/i.test(r.file||''), sc=[];
    (S.catalog||[]).forEach(function(c){
      if(!!c.icon!==icon||/ownhtmlonly/i.test(c.value))return;
      var b=mcTok(c.name), inter=a.filter(function(w){return b.indexOf(w)>-1;}).length, uni=a.length+b.length-inter, s=0;
      if(mcSame(c.cat,r.cat))s+=3;
      if(uni)s+=5*inter/uni;
      if(r.file&&mcStem(c.value)===mcStem(r.file))s+=2;
      if(s>=2)sc.push({c:c,s:s});
    });
    sc.sort(function(x,y){return y.s-x.s;});
    return sc.slice(0,6).map(function(x){return x.c;});
  }
  function mcOptions(r){
    var out=[], e;
    if(r.kind==='custom'){
      if(S.objFile)out.push({k:'custom',label:'Custom HTML, copied as it is',cat:'Custom HTML',name:'Custom HTML element',value:S.objFile});
    }else{
      e=mcCatEntry(r.cat,r.name)||mcFileEntry(r.file);
      if(e)out.push({k:'same',label:'The same object here: '+e.cat+': '+e.name,cat:e.cat,name:e.name,value:e.value});
      else{
        if(r.kind==='ms'&&r.code){var any=(S.catalog||[]).filter(function(c){return !c.icon;})[0], pre=any?String(any.value).replace(/[^\\\/]*$/,''):'';out.push({k:'install',label:'Install it here from the copy ('+r.libFile+'), then push',cat:r.cat,name:r.name,value:pre+r.libFile});}
        mcSuggest(r).forEach(function(c){out.push({k:'alt',label:'Closest here: '+c.cat+': '+c.name,cat:c.cat,name:c.name,value:c.value});});
      }
    }
    out.push({k:'skip',label:'Leave it out'});
    return out;
  }
  function mcOpen(){
    var c=mcGet();
    if(!c||!(S.maps&&S.objFile&&mapId()))return;
    MC.copy=c;MC.rows=[];
    var same=mcSame(c.from.host,mcHost()), list=$('mclist'), counts={same:0,custom:0,install:0,alt:0,none:0};
    list.textContent='';
    c.items.slice().sort(function(a,b){return (a.z||0)-(b.z||0);}).forEach(function(r){
      var opts=mcOptions(r), row=mcEl('div','mcrow'), sel=document.createElement('select'), first=opts[0].k;
      r.from=same?'':c.from.host;
      counts[first==='skip'?'none':first]++;
      opts.forEach(function(o,i){var op=document.createElement('option');op.value=String(i);op.textContent=o.label;sel.appendChild(op);});
      var badge={same:'Same here',custom:'Custom HTML',install:'Install',alt:'Not here: closest',skip:'Not here'}[first];
      var nm=mcEl('div','mcn');nm.appendChild(mcEl('span','mck',badge));nm.appendChild(document.createTextNode((r.kind==='custom'?'Custom HTML':r.cat+': '+r.name)+(r.kind==='ms'?' (Map Studio)':'')));
      row.appendChild(nm);
      var w=mcWas(r);
      row.appendChild(mcEl('div','mcw',(w?'Showed '+w+'. ':'')+'At '+r.left+', '+r.top+(r.width&&r.height?', '+r.width+' × '+r.height:'')+'.'));
      row.appendChild(sel);
      function tone(){var k=opts[+sel.value].k;row.className='mcrow '+((k==='same'||k==='custom')?'ok':(k==='skip'?'skip':'warn'));}
      sel.addEventListener('change',tone);tone();
      sel.setAttribute('aria-label','What to use for '+(r.kind==='custom'?'Custom HTML':r.name));
      row.setAttribute('role','listitem');
      list.appendChild(row);MC.rows.push({r:r,opts:opts,sel:sel});
    });
    var miss=counts.install+counts.alt+counts.none;
    mcSay(c.items.length+(c.items.length===1?' item':' items')+' from “'+c.from.map+'” on '+c.from.host+' → “'+mapName()+'” on '+mcHost()+'. '+(counts.same+counts.custom)+' can be used as they are'+(miss?'; '+miss+' use'+(miss===1?'s':'')+' a file this server does not have: choose what to use instead, or leave '+(miss===1?'it':'them')+' out':'')+'. '+(same?'Each item keeps its target, since this is the same server.':'Targets are not copied between servers: choose each one on the canvas (Selected, Target). The note there says what it showed before.'),miss?'':'ok');
    var cw=+$('dw').value, ch=+$('dh').value;
    $('mcsizerow').hidden=!(c.w&&c.h&&(c.w!==cw||c.h!==ch));$('mcsize').checked=false;
    $('mcsizel').textContent='Also make the canvas and “'+mapName()+'” '+c.w+' × '+c.h+' like the copied map (changes the map’s size in PRTG now)';
    $('mcbox').hidden=false;
  }
  function mcPlace(){
    var c=MC.copy, same=c&&mcSame(c.from.host,mcHost()), list=[], inst={}, lib, f;
    if(!c)return;
    MC.rows.forEach(function(x){
      var o=x.opts[+x.sel.value], r=x.r;
      if(!o||o.k==='skip')return;
      if(o.k==='install')inst[r.libFile]={cat:r.cat,name:r.name,code:r.code,at:Date.now()};
      list.push({x:r.left,y:r.top,w:r.width,h:r.height,z:r.z,cat:o.cat,name:o.name,value:o.value,target:(same&&r.target)?{id:r.target.id,name:r.target.name}:null,
        before:r.before,after:r.after,link:r.link,was:same?'':mcWas(r),raw:r.kind==='custom',sizing:(r.width>0&&r.height>0)?'box':''});
    });
    if(!list.length){mcSay('Nothing to put on the canvas: every item is set to Leave it out.','err');return;}
    if($('mcsize').checked&&c.w&&c.h){var w=$('dw'),h=$('dh');w.value=c.w;w.dispatchEvent(new Event('change',{bubbles:true}));h.value=c.h;h.dispatchEvent(new Event('change',{bubbles:true}));}
    if(Object.keys(inst).length){lib=libLoad();for(f in inst)lib[f]=inst[f];try{localStorage.setItem(CFG.keys.library,JSON.stringify(lib));}catch(e){}try{document.dispatchEvent(new Event('pmlibchanged'));}catch(e){}}
    DASHAPI.addCopies(list);
    var ni=Object.keys(inst).length;
    mcSay(list.length+(list.length===1?' item is':' items are')+' on the canvas.'+(same?'':' Choose each one’s target (Selected, Target).')+(ni?' '+ni+' Map Studio file'+(ni===1?' was':'s were')+' added to Your objects: install '+(ni===1?'it':'them')+' with the install script (Object builder, Your objects), then press Refresh object list; until then the push lists '+(ni===1?'it':'them')+' as missing.':'')+' Then push as usual: the Review lists everything first.','ok');
    try{if(window.PUSHAPI&&PUSHAPI.renderObjList)PUSHAPI.renderObjList();}catch(e){}
  }
  $('excopy').addEventListener('click',mcCopy);
  $('mcpaste').addEventListener('click',mcOpen);
  $('mcclose').addEventListener('click',function(){$('mcbox').hidden=true;});
  $('mcplace').addEventListener('click',mcPlace);
  $('mcsave').addEventListener('click',function(){
    var c=mcGet()||MC.copy;if(!c)return;
    var url=URL.createObjectURL(new Blob([JSON.stringify(c,null,1)],{type:'application/json'})), a=document.createElement('a');
    a.href=url;a.download='map-copy-'+String(c.from.map||'map').replace(/[^\w.-]+/g,'-').slice(0,60)+'.json';document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(url);},4000);
  });
  $('mcfile').addEventListener('change',function(){
    var fl=this.files&&this.files[0], inp=this;if(!fl)return;
    fl.text().then(function(t){
      var o=null;try{o=JSON.parse(t);}catch(e){}
      inp.value='';
      if(!mcValid(o)){mcStat('That file is not a map copy made by Map Studio.','err');return;}
      MC.copy=o;var kept=mcPut(o);mcSync();
      mcStat('Opened a copy of '+o.items.length+(o.items.length===1?' item':' items')+' from “'+o.from.map+'” on '+o.from.host+'.'+(kept?'':' It is too big to keep in this browser, so open it again after a reload.')+' Choose the map to paste into, then press Paste copied map.','ok');
      $('mcpaste').hidden=false;$('mcsave').hidden=false;
    });
  });
  document.addEventListener('exchanged',mcSync);
  function exLayerSync(){var l=$('dexist');if(l)l.className=exLayerClass();xeDecorate();}
  $('exon').addEventListener('change',exLayerSync);
  $('exdim').addEventListener('change',exLayerSync);
  $('exscr').addEventListener('change',function(){if(!EX.items.length)return;(this.checked?exLibs():Promise.resolve()).then(function(){exRender();});});
  $('exsize').addEventListener('click',function(){
    var w=$('dw'),h=$('dh');
    if(!EX.mapW||!EX.mapH)return;
    w.value=EX.mapW;w.dispatchEvent(new Event('input',{bubbles:true}));w.dispatchEvent(new Event('change',{bubbles:true}));
    h.value=EX.mapH;h.dispatchEvent(new Event('input',{bubbles:true}));h.dispatchEvent(new Event('change',{bubbles:true}));
  });
  $('pushmap').addEventListener('change',exClear);
  $('pushconnect').addEventListener('click',exClear);
  /* ---- acting on the items already on the map: edit, move or delete, with Review first and Undo after. Nothing is written until Apply. ---- */
  var XE={cur:{},stage:{},sel:null,rev:null,busy:false};
  function xeMsg(m,kind){var n=$('xemsg');n.textContent=m;n.className='note pst'+(kind?' '+kind:'');banner(m,kind);}
  function xeItem(sub){var i;for(i=0;i<EX.items.length;i++){if(EX.items[i].subid===String(sub))return EX.items[i];}return null;}
  function xeNorm(j){
    function n(v){var x=parseInt(v,10);return isNaN(x)?0:x;}
    function t(v){return (v==null?'':String(v)).replace(/&apos;/g,'"');}   /* the designer shows the stored text this way before it saves it back */
    return {left:n(j.left),top:n(j.top),width:n(j.width),height:n(j.height),z:n(j.zindex),link:String(j.externallink==null?'':j.externallink),before:t(j.htmlbefore),after:t(j.htmlafter)};
  }
  function xeFetch(sub){return http('GET','/api/mapsettings.htm',{id:mapId(),subid:sub,type:'objectproperties'}).then(function(t){return xeNorm(parseJson(t,'The settings of item '+sub));});}
  function xeBase(sub){return XE.cur[sub]?Promise.resolve(XE.cur[sub]):xeFetch(sub).then(function(b){XE.cur[sub]=b;return b;});}
  function xeSame(a,b){var k;for(k in a){if(a[k]!==b[k])return false;}return true;}
  function xeMerged(sub){var b=XE.cur[sub], s=XE.stage[sub]||{}, o={}, k;for(k in b)o[k]=(k in s)?s[k]:b[k];return o;}
  function xeEditCall(sub,v){return http('POST','/api/editmapobject.htm',{subid:sub,id:mapId(),top:v.top,left:v.left,width:v.width,height:v.height,zindex:v.z,htmlbefore_:v.before,htmlafter_:v.after,ElementLink:v.link});}
  function xeHist(){try{var a=JSON.parse(localStorage.getItem(CFG.keys.mapEdits)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
  function xeSaveHist(a){try{localStorage.setItem(CFG.keys.mapEdits,JSON.stringify(a.slice(-20)));return true;}catch(e){S.storeFail=true;return false;}}
  function xeLast(){var h=xeHist(),i;for(i=h.length-1;i>=0;i--){if(sameTarget(h[i]))return h[i];}return null;}
  function xeReset0(){
    XE.cur={};XE.stage={};XE.sel=null;XE.rev=null;
    if($('dexsel'))$('dexsel').style.display='none';
    $('exedit').hidden=true;$('exchg').hidden=true;$('exrev').hidden=true;$('xeapply').hidden=true;$('xermrow').hidden=true;$('xerm').checked=false;
    xeButtons();
  }
  function xeButtons(){
    var e=xeLast(), n=e?((e.updated||[]).length+(e.removed||[]).length):0, ok=!!(S.maps&&mapId());
    $('xeundo').disabled=!e||!ok||XE.busy;
    $('xeundo').dataset.tip='Undo last change'+(n?' ('+n+(n===1?' item':' items')+')':'');
    $('xereview').disabled=XE.busy||!Object.keys(XE.stage).length||xeInvalid();
    $('xeapply').disabled=XE.busy;
    xeBar();
  }
  var XEF=[['left','xeleft','Left',0],['top','xetop','Top',0],['width','xewidth','Width',1],['height','xeheight','Height',1],['z','xez','Layer',0]];
  function xeInvalid(){
    var bad=false;
    XEF.forEach(function(f){var el=$(f[1]), v=Number(el.value);if(el.value===''||!(v%1===0)||v<f[3]||v>9999){bad=true;}});
    return bad&&!$('exedit').hidden;
  }
  function xeSelect(sub){
    XE.sel=String(sub);
    var it=xeItem(sub);
    $('exedit').hidden=false;$('exedtitle').textContent='#'+sub+'  '+(it?exLabel(it):'');
    $('xenote').textContent='Reading this item\u2019s settings\u2026';$('xenote').className='note pst';
    xeBase(sub).then(function(){if(XE.sel===String(sub)){$('xenote').textContent='';xePopulate();}},function(err){
      if(err&&err.status===401)authNeeded();
      $('xenote').textContent='Could not read this item\u2019s settings ('+(err.message||err)+'). It cannot be edited from here.';$('xenote').className='note pst err';
    });
  }
  function xeDeselect(){XE.sel=null;$('exedit').hidden=true;xeButtons();xeDecorate();}
  function exPick(sub){
    sub=String(sub);
    try{DASHAPI.deselect();}catch(e){}
    xeSelect(sub);xeDecorate();
  }
  function exUnpick(){xeDeselect();}
  function xePopulate(){
    var sub=XE.sel, v=xeMerged(sub), gone=!!(XE.stage[sub]&&XE.stage[sub].del);
    XEF.forEach(function(f){var el=$(f[1]);el.value=v[f[0]];el.className='';el.disabled=gone;});
    $('xelink').value=v.link;$('xebefore').value=v.before;$('xeafter').value=v.after;
    ['xelink','xebefore','xeafter'].forEach(function(id){$(id).disabled=gone;});
    $('xedel').textContent=gone?'Keep this item':'Mark for deletion';
    xeButtons();
  }
  function xeInput(){
    var sub=XE.sel, b=sub&&XE.cur[sub], st={}, bad=false;
    if(!b||XE.busy)return;
    XEF.forEach(function(f){
      var el=$(f[1]), v=Number(el.value), ok=(el.value!==''&&v%1===0&&v>=f[3]&&v<=9999);
      el.className=ok?'':'bad';
      if(!ok){bad=true;return;}
      if(v!==b[f[0]])st[f[0]]=v;
    });
    if($('xelink').value!==b.link)st.link=$('xelink').value;
    if($('xebefore').value!==b.before)st.before=norm($('xebefore').value);
    if($('xeafter').value!==b.after)st.after=norm($('xeafter').value);
    if(XE.stage[sub]&&XE.stage[sub].del)st.del=true;
    if(Object.keys(st).length)XE.stage[sub]=st;else delete XE.stage[sub];
    $('xenote').textContent=bad?'Use whole numbers from 0 to 9999 (width and height at least 1).':'';$('xenote').className='note pst'+(bad?' err':'');
    xeStaged();
  }
  function xeStaged(){
    var n=Object.keys(XE.stage), del=n.filter(function(k){return XE.stage[k].del;}).length, ed=n.length-del;
    XE.rev=null;$('exrev').hidden=true;$('xeapply').hidden=true;$('xermrow').hidden=true;
    $('exchg').hidden=!n.length;
    $('exchgsum').textContent=n.length?((ed?ed+(ed===1?' item':' items')+' changed':'')+((ed&&del)?', ':'')+(del?del+(del===1?' item':' items')+' marked for deletion':'')+'. Nothing has been sent to PRTG.'):'';
    xeDecorate();xeButtons();
  }
  function exSelBox(){
    var c=$('dcanvas'), b=$('dexsel'), h;
    if(!b){b=document.createElement('div');b.id='dexsel';h=document.createElement('div');h.id='dexhandle';b.appendChild(h);c.appendChild(b);h.addEventListener('mousedown',exHandleDown);}
    return b;
  }
  function exScale(){var c=$('dcanvas');return c.offsetWidth?c.getBoundingClientRect().width/c.offsetWidth:1;}
  function exGeom(sub){
    var it=xeItem(sub), v=XE.cur[sub]?xeMerged(sub):null;
    if(v)return {left:v.left,top:v.top,width:v.width,height:v.height,z:v.z};
    return it?{left:it.left||0,top:it.top||0,width:it.width||100,height:it.height||40,z:it.z||0}:null;
  }
  function exSelPos(){
    var b=exSelBox(), g=XE.sel?exGeom(XE.sel):null, st=XE.sel&&XE.stage[XE.sel], sc=exScale(), hs=14/sc, h=$('dexhandle');
    if(!g||!$('dexist')||!$('exon').checked){b.style.display='none';return;}
    b.style.display='block';b.style.left=g.left+'px';b.style.top=g.top+'px';b.style.width=g.width+'px';b.style.height=g.height+'px';
    b.style.borderWidth=Math.max(1,2/sc)+'px';
    h.style.width=hs+'px';h.style.height=hs+'px';h.style.right=(-hs/2)+'px';h.style.bottom=(-hs/2)+'px';
    h.style.display=(st&&st.del)?'none':'block';
  }
  function xeBar(){
    var n=Object.keys(XE.stage).length, a=$('xeapply');
    $('exbar').hidden=!n;
    $('exbartext').textContent=n+(n===1?' change':' changes')+' not sent to PRTG yet';
    $('exbarapply').hidden=a.hidden;$('exbarapply').textContent=a.textContent;$('exbarapply').disabled=a.disabled;
  }
  function xeDecorate(){
    var layer=$('dexist'), rows=$('exlist');
    if(!layer)return;
    [].forEach.call(layer.querySelectorAll('.dexitem'),function(bx){bx.classList.toggle('on',bx.getAttribute('data-sub')===XE.sel);});
    [].forEach.call(rows.querySelectorAll('.exrow'),function(r){r.classList.toggle('on',r.getAttribute('data-sub')===XE.sel);});
    exSelPos();
    [].forEach.call(layer.querySelectorAll('.dexitem'),function(box){
      var sub=box.getAttribute('data-sub'), st=XE.stage[sub], b=XE.cur[sub], it=xeItem(sub), v=(st&&b)?xeMerged(sub):null;
      box.classList.toggle('staged',!!(st&&!st.del));box.classList.toggle('gone',!!(st&&st.del));
      if(v){box.style.left=v.left+'px';box.style.top=v.top+'px';box.style.width=v.width+'px';box.style.height=v.height+'px';}
      else if(it){box.style.left=(it.left||0)+'px';box.style.top=(it.top||0)+'px';box.style.width=(it.width||100)+'px';box.style.height=(it.height||40)+'px';}
    });
    [].forEach.call(rows.querySelectorAll('.exrow'),function(r){
      var st=XE.stage[r.getAttribute('data-sub')];
      if(st)r.setAttribute('data-flag',st.del?'to be deleted':'changed');else r.removeAttribute('data-flag');
    });
  }
  function xeLines(sub){
    var st=XE.stage[sub], b=XE.cur[sub], it=xeItem(sub), out=[];
    if(st.del)return ['will be deleted'];
    if('left' in st||'top' in st)out.push('moved '+b.left+', '+b.top+' \u2192 '+(('left' in st)?st.left:b.left)+', '+(('top' in st)?st.top:b.top));
    if('width' in st||'height' in st)out.push('resized '+b.width+' \u00D7 '+b.height+' \u2192 '+(('width' in st)?st.width:b.width)+' \u00D7 '+(('height' in st)?st.height:b.height));
    if('z' in st)out.push('layer '+b.z+' \u2192 '+st.z);
    if('link' in st)out.push('link changed');
    if('before' in st)out.push('HTML Before changed ('+b.before.length+' \u2192 '+st.before.length+' characters)');
    if('after' in st)out.push('HTML After changed ('+b.after.length+' \u2192 '+st.after.length+' characters)');
    return out;
  }
  function xeSig(){return JSON.stringify([mapId(),base(),XE.stage,!!$('xerm').checked]);}
  function xeReview(){
    var box=$('exrev'), subs=Object.keys(XE.stage), del=subs.filter(function(k){return XE.stage[k].del;}), ed=subs.length-del.length, n;
    if(!subs.length||xeInvalid())return;
    box.textContent='';
    subs.forEach(function(sub){
      var it=xeItem(sub), d=document.createElement('div'), b=document.createElement('b');
      d.className='xl';b.textContent='#'+sub+'  '+(it?exLabel(it):'');d.appendChild(b);
      xeLines(sub).forEach(function(l){var s2=document.createElement('div');s2.textContent=l;d.appendChild(s2);});
      box.appendChild(d);
    });
    box.hidden=false;$('xermrow').hidden=!del.length;
    n=ed+(del.length&&$('xerm').checked?del.length:0);
    $('xeapply').textContent='Apply '+n+(n===1?' change':' changes')+' to PRTG';
    $('xeapply').hidden=!n;XE.rev=xeSig();
    xeMsg(del.length&&!$('xerm').checked?'Items marked for deletion stay on the map unless you tick the box above.':'Check the list, then apply.','');
    xeButtons();
  }
  function xeBackup(items){
    var blob=new Blob([JSON.stringify({tool:STAMP_NAME(),saved:new Date().toISOString(),server:(base()||pageOrigin()||''),map:{id:mapId(),name:mapName()},items:items},null,1)],{type:'application/json'}), url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url;a.download='prtg-removed-items-'+mapId()+'-'+new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)+'.json';
    document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(url);},2000);
  }
  function xeApply(){
    var rm=$('xerm').checked, edits=[], dels=[], entry={map:mapId(),srv:srvId(),name:mapName(),at:new Date().toISOString(),updated:[],removed:[]}, work, k=0;
    if(XE.rev!==xeSig()){xeReview();xeMsg('Something changed since the review. Check the list again, then apply.','err');return;}
    Object.keys(XE.stage).forEach(function(sub){if(XE.stage[sub].del){if(rm)dels.push(sub);}else edits.push(sub);});
    work=edits.map(function(s){return {kind:'edit',sub:s};}).concat(dels.map(function(s){return {kind:'del',sub:s};}));
    if(!work.length)return;
    if(dels.length)xeBackup(dels.map(function(s){var it=xeItem(s);return {subid:s,category:it?it.cat:'',name:it?it.name:'',target:it?it.target:0,classes:it?it.cls:'',settings:XE.cur[s],markup:it?it.html:''};}));
    XE.busy=true;S.storeFail=false;xeButtons();
    function finish(msg,kind){
      if(entry.updated.length||entry.removed.length){var h=xeHist();h.push(entry);xeSaveHist(h);}
      XE.busy=false;XE.stage={};XE.cur={};XE.rev=null;$('exrev').hidden=true;$('xeapply').hidden=true;$('xermrow').hidden=true;$('xerm').checked=false;$('exchg').hidden=true;$('exedit').hidden=true;
      if(S.storeFail){msg+=storeWarn();kind='err';}
      xeMsg(msg,kind);xeButtons();
      if(entry.updated.length||entry.removed.length)exLoad();
    }
    function fail(err){
      if(err&&err.status===401)authNeeded();
      finish('Stopped after '+k+' of '+work.length+': '+(err.message||err)+(entry.updated.length||entry.removed.length?' What was already done is remembered, so Undo last change reverses it.':''),'err');
    }
    (function next(){
      var w;
      if(k>=work.length){finish('Applied '+(entry.updated.length?entry.updated.length+(entry.updated.length===1?' change':' changes'):'')+(entry.updated.length&&entry.removed.length?' and ':'')+(entry.removed.length?'deleted '+entry.removed.length+(entry.removed.length===1?' item':' items'):'')+' on \u201C'+mapName()+'\u201D. Open the map in PRTG to see it.','ok');return;}
      w=work[k];xeMsg((w.kind==='del'?'Deleting ':'Updating ')+(k+1)+' of '+work.length+'\u2026','');
      xeFetch(w.sub).then(function(now){
        if(!xeSame(now,XE.cur[w.sub]))throw new Error('Item '+w.sub+' was changed in PRTG after it was loaded here. Press Show items again and redo the change.');
        if(w.kind==='edit'){
          var after=xeMerged(w.sub);
          return xeEditCall(w.sub,after).then(function(){entry.updated.push({subid:w.sub,before:XE.cur[w.sub],after:after});});
        }
        var it=xeItem(w.sub);
        return http('GET','/api/deletesubobject.htm',{id:mapId(),subid:w.sub}).then(function(){
          entry.removed.push({subid:w.sub,cat:it?it.cat:'',name:it?it.name:'',target:it?it.target:0,before:XE.cur[w.sub]});
        });
      }).then(function(){k++;next();},fail);
    })();
  }
  function xeFile(r){
    var i;
    if(r.cat==='Custom HTML')return S.objFile||null;
    for(i=0;S.catalog&&i<S.catalog.length;i++){if(S.catalog[i].cat===r.cat&&S.catalog[i].name===r.name)return S.catalog[i].value;}
    return null;
  }
  function xeUndo(){
    var e=xeLast(), ups, rems, reverted=0, restored=0, skipped=[], failed=[], k;
    if(!e)return;
    ups=(e.updated||[]).slice().reverse();rems=(e.removed||[]).slice();
    XE.busy=true;S.storeFail=false;xeButtons();
    function finish(){
      var h=xeHist(), i, left=failed.length, msg;
      for(i=0;i<h.length;i++){if(h[i].at===e.at&&h[i].srv===e.srv&&String(h[i].map)===String(e.map)){if(left){h[i].updated=failed.filter(function(f){return f.kind==='up';}).map(function(f){return f.u;});h[i].removed=failed.filter(function(f){return f.kind==='re';}).map(function(f){return f.r;});}else h.splice(i,1);break;}}
      xeSaveHist(h);XE.busy=false;
      msg=(reverted?'Reverted '+reverted+(reverted===1?' change':' changes'):'')+((reverted&&restored)?', ':'')+(restored?'put back '+restored+(restored===1?' deleted item':' deleted items'):'');
      if(!msg)msg='Nothing was undone';
      if(skipped.length)msg+='. '+skipped.length+(skipped.length===1?' item was':' items were')+' changed in PRTG since, so it was left alone';
      if(left)msg+='. '+left+' could not be undone; try again';
      if(restored)msg+='. Put-back items get new ids and lose any connections they had';
      xeMsg(msg+'.'+storeWarn(),(left||S.storeFail)?'err':'ok');xeButtons();
      if(reverted||restored)exLoad();
    }
    (function next(){
      var u, r, file;
      if(ups.length){
        u=ups[0];
        xeFetch(u.subid).then(function(now){
          if(!xeSame(now,u.after)){skipped.push(u.subid);ups.shift();next();return;}
          return xeEditCall(u.subid,u.before).then(function(){reverted++;ups.shift();next();});
        }).catch(function(){failed.push({kind:'up',u:u});ups.shift();next();});
        return;
      }
      if(rems.length){
        r=rems[0];file=xeFile(r);
        if(!file){failed.push({kind:'re',r:r});rems.shift();next();return;}
        http('POST','/api/addobjecttomap.htm',{objectid:r.target||0,top:r.before.top,left:r.before.left,id:mapId(),width:r.before.width,height:r.before.height,mapobject_:file,noautoposition:1,result:'html'}).then(function(resp){
          var sub=itemId(resp);
          if(!sub)throw new Error('no id');
          return xeEditCall(sub,r.before);
        }).then(function(){restored++;rems.shift();next();},function(){failed.push({kind:'re',r:r});rems.shift();next();});
        return;
      }
      finish();
    })();
  }
  ['xeleft','xetop','xewidth','xeheight','xez','xelink','xebefore','xeafter'].forEach(function(id){$(id).addEventListener('input',xeInput);});
  $('xedel').addEventListener('click',function(){
    var sub=XE.sel, st;
    if(!sub||!XE.cur[sub])return;
    st=XE.stage[sub]||{};
    if(st.del){delete st.del;if(Object.keys(st).length)XE.stage[sub]=st;else delete XE.stage[sub];}
    else{st.del=true;XE.stage[sub]=st;}   /* edits already staged are kept, so unmarking brings them back */
    xePopulate();xeStaged();
  });
  $('xereset').addEventListener('click',function(){var sub=XE.sel;if(!sub)return;delete XE.stage[sub];xePopulate();xeStaged();});
  $('xereview').addEventListener('click',xeReview);
  $('xerm').addEventListener('change',function(){if(!$('exrev').hidden)xeReview();});
  $('xeapply').addEventListener('click',xeApply);
  $('xeundo').addEventListener('click',xeUndo);
  /* ---- clicking, dragging and keys on the canvas ---- */
  var XD=null;
  function exSnap(v){var g=parseInt($('dgrid').value,10)||0;return g>0?Math.round(v/g)*g:Math.round(v);}
  function exHit(cx,cy){
    var r=$('dcanvas').getBoundingClientRect(), sc=exScale(), x=(cx-r.left)/sc, y=(cy-r.top)/sc, best=null, bk=-1;
    if(!$('dexist')||!$('exon').checked)return null;
    EX.items.forEach(function(it,i){
      var g=exGeom(it.subid), k;
      if(g&&x>=g.left&&x<=g.left+g.width&&y>=g.top&&y<=g.top+g.height){k=(g.z||0)*100000+i;if(k>=bk){bk=k;best=it.subid;}}
    });
    return best;
  }
  function exGone(sub){return !!(XE.stage[sub]&&XE.stage[sub].del);}
  function exHandleDown(e){
    if(e.button!==0||!XE.sel||exGone(XE.sel))return;
    e.preventDefault();e.stopPropagation();
    XD={mode:'size',sub:XE.sel,sx:e.clientX,sy:e.clientY,g:exGeom(XE.sel),moved:false};
  }
  $('dcanvas').addEventListener('mousedown',function(e){
    var t=e.target, hit;
    if(e.button!==0||!DASHAPI.active)return;
    if(t.id==='dexhandle')return;
    if(t.closest&&t.closest('.ditem')){if(XE.sel)exUnpick();return;}
    hit=exHit(e.clientX,e.clientY);
    if(!hit){if(XE.sel)exUnpick();return;}
    e.preventDefault();
    if(XE.sel!==hit)exPick(hit);
    if(!exGone(hit))XD={mode:'move',sub:hit,sx:e.clientX,sy:e.clientY,g:exGeom(hit),moved:false};
  });
  function exSet(id,v){$(id).value=v;}
  document.addEventListener('mousemove',function(e){
    var sc, dx, dy, g;
    if(!XD){
      if(DASHAPI.active&&e.target&&e.target.closest&&e.target.closest('#dcanvas')&&!e.target.closest('.ditem')&&e.target.id!=='dexhandle'){$('dcanvas').style.cursor=exHit(e.clientX,e.clientY)?'move':'';}
      return;
    }
    if(!XE.cur[XD.sub]||XE.sel!==XD.sub)return;               /* the item's settings are still being read */
    if(!XD.moved&&Math.abs(e.clientX-XD.sx)+Math.abs(e.clientY-XD.sy)<4)return;
    XD.moved=true;
    sc=exScale();dx=(e.clientX-XD.sx)/sc;dy=(e.clientY-XD.sy)/sc;g=XD.g;
    if(XD.mode==='move'){exSet('xeleft',Math.max(0,exSnap(g.left+dx)));exSet('xetop',Math.max(0,exSnap(g.top+dy)));}
    else{exSet('xewidth',Math.max(10,exSnap(g.width+dx)));exSet('xeheight',Math.max(10,exSnap(g.height+dy)));}
    xeInput();
  });
  document.addEventListener('mouseup',function(){XD=null;});
  document.addEventListener('keydown',function(e){
    var t=e.target, tag=t&&t.tagName, k=e.key, st, sub=XE.sel, g;
    if(!sub||!DASHAPI.active||XD)return;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable))return;
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(k==='Delete'||k==='Backspace'){e.preventDefault();if(XE.cur[sub])$('xedel').click();return;}
    if(k==='Escape'){e.preventDefault();exUnpick();return;}
    if(!XE.cur[sub]||exGone(sub))return;
    st=e.shiftKey?10:1;g=exGeom(sub);
    if(k==='ArrowLeft'){e.preventDefault();exSet('xeleft',Math.max(0,g.left-st));}
    else if(k==='ArrowRight'){e.preventDefault();exSet('xeleft',g.left+st);}
    else if(k==='ArrowUp'){e.preventDefault();exSet('xetop',Math.max(0,g.top-st));}
    else if(k==='ArrowDown'){e.preventDefault();exSet('xetop',g.top+st);}
    else return;
    xeInput();
  });
  document.addEventListener('dashselect',function(){try{if(DASHAPI.selected()&&XE.sel)exUnpick();}catch(e){}});
  $('exbarrev').addEventListener('click',function(){
    var bar=[].filter.call(document.querySelectorAll('#dashpanel .advbar'),function(b){return /Existing PRTG maps/.test(b.textContent);})[0];
    if(bar&&!bar.classList.contains('open'))bar.click();
    $('exfs').hidden=false;
    xeReview();
    try{$('exrev').scrollIntoView({block:'nearest'});}catch(e){}
  });
  $('exbarapply').addEventListener('click',function(){$('xeapply').click();});
  $('exbardisc').addEventListener('click',function(){XE.stage={};if(XE.sel&&XE.cur[XE.sel])xePopulate();xeStaged();});
  /* ---- the PRTG switch at the top of the Dashboard tab ---- */
  function hostOf(u){try{return new URL(u).host;}catch(e){return String(u);}}
  /* the object files on the connected server, for the Object builder's name check: window.PRTGOBJS [{cat,name,file}] */
  function pubObjs(){
    var on=!!(S&&S.maps&&S.objFile&&S.catalog);
    window.PRTGOBJS=on?S.catalog.filter(function(c){return !c.icon;}).map(function(c){return {cat:c.cat,name:c.name,file:String(c.value).split(/[\\\/]/).pop()};}):[];
    window.PRTGOBJHOST=on?hostOf(base()||pageOrigin()||'PRTG'):'';
    try{document.dispatchEvent(new CustomEvent('prtgobjs'));}catch(e){}
  }
  function swSync(){
    var connected=!!(S&&S.maps&&S.objFile), busy=!!$('pushconnect').disabled&&!connected, err=S&&S.lastErr;
    $('prtgdot').className='pdot '+(connected?'ok':(busy?'busy':(err?'err':'off')));
    $('prtgtxt').textContent=connected?('Connected to '+hostOf(base()||pageOrigin()||'PRTG')):(busy?'Connecting\u2026':(err?('Not connected \u00B7 '+String(err).slice(0,48)):'Not connected'));
    $('prtgtxt').title=connected?('Connected to '+(base()||pageOrigin()||'PRTG')+' \u00B7 '+S.maps.length+(S.maps.length===1?' map':' maps')):String(err||'Not connected');
    $('prtgswitch').hidden=!connected;$('prtgrefresh').hidden=!connected;$('prtgdisconnect').hidden=!connected;$('prtgcog').hidden=connected;
    if(connected&&CSSX&&CSSX.origin!==(base()||pageOrigin()||''))try{prtgCss();}catch(e){}
    window.PRTGSTATE={connected:connected,map:connected&&!!$('pushmap').value};
    if(!connected||!window.PRTGOBJS||!window.PRTGOBJS.length)pubObjs();
    window.PRTGMAPS=connected?(S.maps||[]).map(function(m){return {id:String(m.objid),name:String(m.name||'')};}):[];
    $('next2').disabled=!window.PRTGSTATE.map;
    $('mapbgcolor').disabled=!window.PRTGSTATE.map;try{bgPreSync();}catch(e){}$('mapbgbtn').disabled=!window.PRTGSTATE.map;$('mapbgbtn').dataset.tip=window.PRTGSTATE.map?'Change the map\u2019s background color or picture':'Connect and choose a map first';try{bgiSync();}catch(e){}
    try{document.dispatchEvent(new CustomEvent('prtgstate',{detail:window.PRTGSTATE}));}catch(e){}
    if(S.needLogin&&!connected&&!busy){$('prtgpop').hidden=false;}
    if(connected)S.needLogin=false;
    if(connected&&!busy&&S.reauth){S.reauth=false;$('prtgpop').hidden=true;}   /* a connect that followed a refused login has worked: the panel has done its job */
  }
  function disconnect(){
    S.maps=null;S.objFile=null;S.catalog=null;S.reviewed=null;S.cls=null;S.lastErr=null;S.tgt={};
    $('pushmap').innerHTML='';$('pushgo').hidden=true;$('pushlist').hidden=true;
    mapMode('open');$('newmapname').value='';$('newmapmsg').textContent='';
    $('exfs').hidden=true;
    if(S.deleteArm){clearTimeout(S.deleteArm);S.deleteArm=null;}
    $('deleteMapBtn').classList.remove('armed');$('deleteMapBtn').textContent='Delete this map';deleteMapMsg('');
    PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};trReset();
    exClear();say('Disconnected.','');updateButtons();renderObjList();pickerSync();pvSync();
  }
  ['pushuser','pushsecret'].forEach(function(id){
    $(id).addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();$('pushconnect').click();}});
    $(id).addEventListener('input',function(){loginMark(false,false);});
  });
  /* a server address that starts with http:// sends the username and passhash across the network unencrypted, so the card says so as soon as one is typed */
  function httpWarn(){
    var on=/^\s*http:\/\//i.test(String($('pushserver').value||''));
    $('httpwarn').textContent=on?'This address starts with http://, so your username and passhash would be sent without encryption. Use https:// if your server supports it.':'';
  }
  $('pushserver').addEventListener('input',httpWarn);
  $('pushserver').addEventListener('change',httpWarn);
  httpWarn();
  $('pushshow').addEventListener('click',function(){var f=$('pushsecret'), on=(f.type==='password');f.type=on?'text':'password';$('pushshow').setAttribute('aria-label',on?'Hide the passhash':'Show the passhash');});
  new MutationObserver(placePop).observe($('prtgpop'),{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(placePop).observe($('prtgmsg'),{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('resize',placePop);
  $('prtgmsgx').addEventListener('click',function(){$('prtgmsg').hidden=true;$('prtgbar').style.setProperty('--msgH','0px');});
  $('prtgcog').addEventListener('click',function(e){e.stopPropagation();$('prtgpop').hidden=!$('prtgpop').hidden;});
  $('prtgswitch').addEventListener('click',function(e){
    e.stopPropagation();
    var willShow=$('prtgpop').hidden;
    $('prtgpop').hidden=!willShow;
    if(willShow){try{$('pushserver').focus();$('pushserver').select();}catch(err){}}
  });
  $('prtgdisconnect').addEventListener('click',function(e){e.stopPropagation();disconnect();});
  /* read the maps and PRTG's object list again, keeping the login, the chosen map and the canvas */
  $('prtgrefresh').addEventListener('click',function(e){
    e.stopPropagation();
    var b=$('prtgrefresh'), keep=$('pushmap').value;
    if(b.classList.contains('busy')||!(S.maps&&S.objFile))return;
    b.classList.add('busy');b.disabled=true;say('Reading your maps and objects\u2026','');
    http('GET','/api/table.json',{content:'maps',columns:'name,objid'}).then(function(t){
      var j=parseJson(t,'The list of maps'), maps=(j&&j.maps)||[], sel=$('pushmap');
      sel.innerHTML='';
      maps.forEach(function(m){var o=document.createElement('option');o.value=String(m.objid);o.textContent=m.name;sel.appendChild(o);});
      if(keep&&maps.some(function(m){return String(m.objid)===keep;}))sel.value=keep;
      S.maps=maps;
      return http('GET','/api/mapobject.json');
    }).then(function(t){
      var catj=parseJson(t,'The list of object files'), had=S.catalog?S.catalog.length:0;
      S.objFile=findCustomHtml(catj)||S.objFile;S.catalog=parseCatalog(catj);pubObjs();
      PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};
      renderObjList();pickerSync();pvSync();
      say('Refreshed. '+S.maps.length+(S.maps.length===1?' map':' maps')+', '+S.catalog.length+(S.catalog.length===1?' object file':' object files')+(S.catalog.length!==had?' ('+(S.catalog.length>had?'+':'')+(S.catalog.length-had)+').':'.'),'ok');
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      say('Could not refresh: '+((err&&err.message)||'no answer from PRTG')+' Nothing was changed.','err');
    }).then(function(){b.classList.remove('busy');b.disabled=false;updateButtons();swSync();});
  });
  document.addEventListener('click',function(e){var p=$('prtgpop');if(!p.hidden&&!p.classList.contains('gate')&&!(e.target.closest&&e.target.closest('#prtgbar, #prtgpop')))p.hidden=true;});
  swSync();
  window.EXAPI={pvx:pvExtract,state:EX,edit:XE,parse:exParse,headers:exHeaders,load:exLoad,clear:exClear,pick:exPick,label:exLabel};
  /* ---- live previews: PRTG's own drawing of each object, with the target's real data.
     The designer asks /controls/mapobjectpreview.htm and shows the answer inside PRTG's own page. Here the answer goes into a small frame that loads PRTG's own stylesheet
     inside the same wrappers PRTG uses for a map (#mapshow > #mapview), because tables take their look from those. The object's own scripts run, as they do in PRTG;
     PRTG's page scripts are not loaded, so charts PRTG draws with its own plugins (the sparklines) stay empty. */
  var PAD=40, PV={cache:{},pending:{},inflight:{},queue:[],running:0,applied:{}};
  function pvKeyOf(o,mode){return [o.file,o.target,mapId(),(mode||o.mode)==='content'?'natural':(o.w+'x'+o.h)].join('|');}
  function pvOn(){return !!($('objlive').checked)&&!!(S.maps&&S.catalog&&mapId());}
  function pvLayer(){var c=$('dcanvas'),l=$('dprev');if(!l){l=document.createElement('div');l.id='dprev';c.insertBefore(l,c.firstChild);}return l;}
  function pvWrap(id){return pvLayer().querySelector('.dprevitem[data-id="'+id+'"]');}
  /* PRTG's Geo Map is drawn by PRTG's own scripts, which do not run in a preview. Its answer still carries every location and its state, so the box shows them on a plain
     stand-in map (no map tiles), with the markers in whatever style the object's own style block gives them. */
  var PVGEOCSS='#pvhost #map-geomap-box{position:absolute!important;left:0;top:0;right:0;bottom:0;height:auto!important;width:auto!important}'
    +'.gmstand{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;background-color:#e8eff6;background-image:linear-gradient(#d7e2ed 1px,transparent 1px),linear-gradient(90deg,#d7e2ed 1px,transparent 1px);background-size:40px 40px}'
    +'.gmstand .gmcap{position:absolute;left:8px;bottom:6px;font:11px/1.2 "Segoe UI",Arial,sans-serif;color:#6b7a8a}'
    +'.gmstand .map-marker{position:absolute;box-sizing:border-box;width:21px;height:25px;background:#fff;border-left:5px solid #fff;box-shadow:0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)}'
    +'.gmstand .map-marker a{position:absolute;left:0;top:0;width:100%;height:100%;background-position:center;background-repeat:no-repeat;background-size:14px 14px}'
    +'.gmstand .map-marker.up{border-color:#B8C419}.gmstand .map-marker.warn{border-color:#F5C500}.gmstand .map-marker.down{border-color:#E30613}.gmstand .map-marker.downack{border-color:#E67278}.gmstand .map-marker.unusual{border-color:#F59C00}.gmstand .map-marker.paused{border-color:#477EC0}.gmstand .map-marker.unknown{border-color:#878787}';
  function pvGeoState(n){
    n=parseInt(n,10);
    if(n===3)return 'up';if(n===4)return 'warn';if(n===14)return 'downack';if(n===5||n===6||n===13)return 'down';
    if(n===10)return 'unusual';if(n===7||n===8||n===9||n===12)return 'paused';return 'unknown';
  }
  function pvGeoStand(d,box){
    var g=d.getElementById('map-geomap-box'), host, w, j, L, pts=[], x0=1e9, x1=-1e9, y0=1e9, y1=-1e9, i, kx, sx, sy, sc, html='', st, c;
    if(!g)return;
    host=g.querySelector('[data-plugin="geomap"]')||g;
    w=d.createTreeWalker(host,128);
    while(w.nextNode()){
      c=w.currentNode.textContent;
      try{j=JSON.parse(c);if(j&&j.markers){L=j.markers.locationlist;break;}}catch(e){}
    }
    if(!Array.isArray(L))return;
    L.forEach(function(x){
      var cc=x&&x.coordinates, a=null, sty='', k;
      if(!Array.isArray(cc)||cc.length<2||isNaN(Number(cc[0]))||isNaN(Number(cc[1])))return;
      try{k=new DOMParser().parseFromString(String(x.link||''),'text/html');a=k.body.querySelector('a');}catch(e){}
      if(a){sty=(a.getAttribute('style')||'').replace(/"/g,"'");}
      pts.push({x:Number(cc[0]),y:Number(cc[1]),s:pvGeoState(x.state),sty:sty});
    });
    pts.forEach(function(q){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);y0=Math.min(y0,q.y);y1=Math.max(y1,q.y);});
    kx=Math.cos(((y0+y1)/2)*Math.PI/180)||1;
    sx=Math.max((x1-x0)*kx,1e-6);sy=Math.max(y1-y0,1e-6);
    for(i=0;i<pts.length;i++){
      var q=pts[i], fx=(pts.length===1||x1===x0)?0.5:0.12+0.76*((q.x-x0)*kx/sx), fy=(pts.length===1||y1===y0)?0.5:0.12+0.76*((y1-q.y)/sy);
      html+='<div class="map-marker '+q.s+'" style="left:calc('+(fx*100).toFixed(2)+'% - 10px);top:calc('+(fy*100).toFixed(2)+'% - 25px)"><a class="mapmarker" style="'+q.sty+'"></a></div>';
    }
    st=d.createElement('style');st.textContent=PVGEOCSS;
    host.innerHTML='<div class="gmstand">'+html+'<div class="gmcap">'+(pts.length?pts.length+(pts.length===1?' location':' locations'):'No locations')+'. PRTG draws the map tiles on the map itself.</div></div>';
    (box.querySelector('.map_object')||box).insertBefore(st,(box.querySelector('.map_object')||box).firstChild);
  }
  function pvExtract(html){
    var d, box, el, cls, iw, ih;
    try{d=new DOMParser().parseFromString(html,'text/html');}catch(e){return null;}
    box=d.querySelector('.map_objectbox')||d.body;el=box&&box.querySelector('.map_object');
    if(!el)return null;
    cls=(el.getAttribute('class')||'').split(/\s+/);iw=parseInt(el.getAttribute('initialwidth'),10)||0;ih=parseInt(el.getAttribute('initialheight'),10)||0;
    pvGeoStand(d,box);
    return {inner:box.innerHTML,content:cls.indexOf('map_icon')>=0,iw:iw,ih:ih};   /* the status icons (class map_icon) take no size from the map: they are as big as they are drawn */
  }
  /* objects that one of PRTG's own plugins draws (gauges, sunbursts, donuts...) need PRTG's page scripts in their preview, read once per server */
  /* PRTG's page starts its plugins (_Prtg.initPlugins) only inside its own page containers; a preview has to start them itself */
  function pvInitScript(hostId){return '<script>(function(){function go(){try{if(window._Prtg&&_Prtg.initPlugins&&window.jQuery)_Prtg.initPlugins(jQuery("#'+hostId+'"));}catch(e){if(window.console)console.error("Map Studio preview: PRTG plugin",e);}}if(document.readyState==="complete")go();else window.addEventListener("load",go);})();<\/script>';}
  /* PRTG's gauge plugin needs PRTG's whole page around it, which a preview frame does not always manage. The sensor data is in the object
     itself, so when no dial has appeared shortly after the preview loads, this draws the same stand-in dial the Object builder shows
     (d3.gauge.js's geometry) in PRTG's own markup; the object's own script then decorates it as it does on the map. */
  function pvGaugeFallback(){
    var svgSrc=window.PMSTOCKSVG?window.PMSTOCKSVG.toString():'';
    if(!svgSrc)return '';
    return '<script>(function(){var stockSvg='+svgSrc+';'
      +'function esc(t){return String(t==null?"":t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}'
      +'var els=[].slice.call(document.querySelectorAll(\'[data-plugin~="channelgauges"]\')), saved=els.map(function(el){var c=null;for(var n=el.firstChild;n;n=n.nextSibling){if(n.nodeType===8){c=n.nodeValue;break;}}return c;});'
      +'function draw(){els.forEach(function(el,i){if(el.querySelector("svg.gauge")||!saved[i])return;var d;try{d=JSON.parse(saved[i]);}catch(e){return;}'
      +'var o=(d&&d.objects)?d.objects:d, dev=(el.getAttribute("data-type")==="sensors"), mv=el.getAttribute("data-mapview")||"", small=/small/.test(mv), only=/primaryonly/.test(mv), list=(dev?o.sensors:o.channels)||[], big=[], rest=[];'
      +'list.forEach(function(r){var inf=r.info&&r.info.data&&r.info.data[0];if(!inf||!inf.name||inf.show===0||(!dev&&r.condition===false))return;var pr=!!inf.primary||(dev&&Number(r.priority)>4);'
      +'var html="<div class=\\"achannel"+(pr&&!small?" primary":"")+" channeledit\\"><span class=\\"channelname\\">"+esc(dev?(r.sensor||inf.name):inf.name)+"</span><span class=\\"channelgauge\\">"+stockSvg(pr&&!small?220:56,inf)+"</span><span class=\\"channelvalue\\">"+esc(inf.lastvalue||r.lastvalue||"")+"</span></div>";'
      +'if(pr&&!small)big.push(html);else if(!only||(pr&&small))rest.push(html);});'
      +'el.innerHTML="<div class=\\"centered\\">"+big.concat(rest).join("")+"<div style=\\"clear:both\\"></div></div>";el.setAttribute("data-ms-standin","1");});}'
      +'var t=null;function soon(){if(t)return;t=setTimeout(function(){t=null;draw();},700);}'
      +'function later(){setTimeout(draw,1500);if(window.MutationObserver)els.forEach(function(el){new MutationObserver(function(){if(!el.querySelector("svg.gauge"))soon();}).observe(el,{childList:true,subtree:true});});setInterval(draw,4000);}'
      +'if(document.readyState==="complete")later();else window.addEventListener("load",later);'
      +'})();<\/script>';
  }
  function pvNeedsLibs(ent){return /data-plugin=/.test((ent&&ent.inner)||'');}
  function pvDoc(ent,o){
    var origin=(base()||pageOrigin()||''), box=(o.mode!=='content'), w=box?o.w:1400, h=box?o.h:900,
      size=box?('width:'+o.w+'px!important;height:'+o.h+'px!important;'):'';
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><base href="'+origin+'/">'+cssHead(origin)+''
      +'<style>html,body,#mapshow,#mapshow .view,#mapview{margin:0;padding:0;background:transparent!important;box-shadow:none!important;border:0!important}html,body{overflow:hidden}'
      +'#pvhost .map_object{position:absolute!important;left:'+PAD+'px!important;top:'+PAD+'px!important;margin:0!important;'+size+'}</style>'
      +(pvNeedsLibs(ent)?(EX.libs||''):'')
      +'</head><body id="mainbody" data-theme="0" class="language_en"><div id="mapshow"><div class="view" style="position:static;overflow:visible"><div id="mapview" style="position:relative;width:'+(w+2*PAD)+'px;height:'+(h+2*PAD)+'px;overflow:visible"><div id="pvhost">'+ent.inner+'</div></div></div></div>'
      +(pvNeedsLibs(ent)?pvGaugeFallback()+pvInitScript('pvhost'):'')+pvStatusScript(o.id)+'</body></html>';
  }
  /* Neither this page nor the sandbox frame can read inside a preview (both are opaque-origin), so the
     preview reports its own state outward instead: this little script reads the status class PRTG put in
     the markup it is already showing and posts the letter up to the app, over the same channel the
     preview graphs already use. That is what lets a Connector on the canvas show its ends' real colours.
     It runs again shortly after load, because some of PRTG's own scripts set these classes late. */
  function pvStatusScript(id){
    return '<script>(function(){'
      +'var OK=/^(g|r|y|o|b|bl|gr)$/;'
      +'var RK=[["red","r"],["partialred","r"],["yellow","y"],["orange","o"],["blue","b"],["green","g"]];'
      +'function look(){var s="",e,m,i,t,p,c;'
      +'e=document.querySelector(\'[class*="map_iconcolor_sens"]\');'
      +'m=e&&/\\bmap_iconcolor_sens([a-z]+)\\b/.exec(String(e.className||""));'
      +'if(m&&OK.test(m[1]))return m[1];'
      +'e=document.querySelector(\'[class*="map_objectstate_sens"]\');'
      +'m=e&&/\\bmap_objectstate_sens([a-z]+)\\b/.exec(String(e.className||""));'
      +'if(m&&OK.test(m[1]))return m[1];'
      +'e=document.querySelector(\'a[class*="sensorid"]\');'
      +'if(e){p=String(e.className||"").split(/\\s+/);'
      +'for(i=0;i<p.length;i++){t=/^sens([a-z]{1,2})$/.exec(p[i]);if(t&&OK.test(t[1]))return t[1];}}'
      +'e=document.querySelector(\'[class*="map_iconcolor_has"]\');'
      +'if(e){c=" "+String(e.className||"").split(/\\s+/).join(" ")+" ";'
      +'for(i=0;i<RK.length;i++){if(c.indexOf(" map_iconcolor_has"+RK[i][0]+" ")>=0)return RK[i][1];}}'
      +'return s;}'
      +'function seen(){var o=[],h=document.getElementById("pvhost"),a=h?h.querySelectorAll("*"):[],i,j,c,t;'
      +'for(i=0;i<a.length&&o.length<60;i++){c=a[i].className;if(typeof c!=="string")continue;c=c.split(/\\s+/);'
      +'for(j=0;j<c.length&&o.length<60;j++){t=c[j];if(t&&t.length<=40&&/^[\\w-]+$/.test(t)&&o.indexOf(t)<0)o.push(t);}}'
      +'return o;}'
      +'function tell(){try{window.top.postMessage({type:"pm-status",id:'+JSON.stringify(String(id))+',status:look(),seen:seen()},"*");}catch(e){}}'
      +'tell();setTimeout(tell,600);setTimeout(tell,2000);'
      +'})();<\/script>';
  }
  /* the state letter each previewed object reports back from inside its own frame (see preview-sandbox.html),
     keyed by canvas item id; a Connector in status mode paints its ends from these */
  DASHAPI.pvst=DASHAPI.pvst||{};   /* on DASHAPI, not a local: the canvas that paints the lines is a separate closure and reaches it through here */
  function pvStatus(id,letter){
    var k=String(id), v=letter||'';
    if(DASHAPI.pvst[k]===v)return;
    if(v)DASHAPI.pvst[k]=v;else delete DASHAPI.pvst[k];
    DASHAPI.rerender();
  }
  function pvSet(id,st){var cur=DASHAPI.pv[id];if(cur&&cur.state===st.state&&cur.msg===st.msg&&cur.autoContent===st.autoContent)return false;DASHAPI.pv[id]=st;return true;}
  function pvMeasure(id,f){
    try{
      var lay=DASHAPI.objectLayout().filter(function(x){return x.id===id;})[0];if(!lay||lay.mode!=='content')return;
      var inner=f.contentDocument&&f.contentDocument.querySelector('iframe');
      var el=inner&&inner.contentDocument&&inner.contentDocument.querySelector('#pvhost .map_object');if(!el)return;
      var r=el.getBoundingClientRect();
      if(r.width>0&&r.height>0){DASHAPI.setNatural(id,Math.ceil(r.width),Math.ceil(r.height));pvSync();}
    }catch(e){}
  }
  /* how many table rows to ask for: 5, as the designer does, except for objects that count sensors, which need every one */
  function pvCountFor(file){
    var e=(S.catalog||[]).filter(function(x){return x.value===file;})[0], text=(e?e.cat+' '+e.name:'')+' '+String(file||'');
    return (new RegExp(CFG.preview.countPattern,'i').test(text))?CFG.preview.countFull:5;
  }
  /* a preview telling the app what state the object it is showing is in, for the Connectors glued to it */
  window.addEventListener('message',function(e){
    var d=e.data;
    if(!d||d.type!=='pm-status'||!e.source)return;
    if(!fromOwnPreview(e.source))return;                     /* only this page's own preview frames may say */
    if(!/^(g|r|y|o|b|bl|gr)?$/.test(String(d.status==null?'':d.status)))return;
    if(!/^\d{1,9}$/.test(String(d.id)))return;
    pvStatus(d.id,String(d.status==null?'':d.status));
    if(Array.isArray(d.seen)){
      DASHAPI.pvseen[String(d.id)]=d.seen.filter(function(t){return typeof t==='string'&&/^[\w-]{1,40}$/.test(t);}).slice(0,60);
      var n=document.getElementById('dtgtstat');
      if(n&&n.getAttribute('data-id')===String(d.id))n.textContent=DASHAPI.pvstatText(d.id);
    }
  });
  /* what the panel says about the status a preview reported, and the class names it was looking through */
  DASHAPI.pvseen=DASHAPI.pvseen||{};
  DASHAPI.pvstatText=function(id){
    var k=String(id), st=DASHAPI.pvst[k], names={g:'up',r:'down',y:'warning',o:'unusual',b:'paused',bl:'paused',gr:'unknown'}, sn=DASHAPI.pvseen[k];
    if(!sn)return 'Status: waiting for the preview to report.';
    return 'Status read from this preview: '+(st?(names[st]||st):'none found (this object\u2019s markup carries no status class the tool knows)')+'. Class names in the preview: '+(sn.length?sn.join(' '):'(none)');
  };
  /* a graph drawn by the tool asks for its history from inside the preview frame; the tool makes the (read-only) request with its own login and answers */
  window.addEventListener('message',function(e){
    var d=e.data, path, p={}, k, src=e.source, ok={id:/^\d{1,9}$/,avg:/^\d{1,6}$/,usecaption:/^[01]$/,sdate:/^[\d-]{10,24}$/,edate:/^[\d-]{10,24}$/,content:/^channels$/,columns:/^[a-z,_]{1,40}$/};
    if(!d||d.type!=='pm-hist'||!src||typeof d.id!=='string'||!d.params)return;
    if(!fromOwnPreview(src))return;   /* only the content of this page's own preview frames may ask */
    path=d.path;
    if(path!=='/api/historicdata.json'&&path!=='/api/table.json')return;
    for(k in d.params){if(!ok[k]||!ok[k].test(String(d.params[k])))return;p[k]=String(d.params[k]);}
    sampleGet({kind:'history',label:'history',path:path,params:p}).then(function(r){
      var j=null;try{j=JSON.parse(r.body);}catch(x){}
      src.postMessage({type:'pm-hist-r',id:d.id,ok:!!(j&&!r.error&&r.status>=200&&r.status<300),json:j},'*');
    }).catch(function(){try{src.postMessage({type:'pm-hist-r',id:d.id,ok:false},'*');}catch(x){}});
  });
  function pvAsk(o){   /* one request for PRTG's drawing of an object, as the designer makes it */
    return sampleGet({kind:'preview',label:'preview',path:'/controls/mapobjectpreview.htm',
      params:{id:mapId(),count:pvCountFor(o.file),dependency_:o.target,width:o.w,height:o.h,selected:'',mapelements:',*'+o.file+'*',maptitles:',*'+o.name+'*'}}).then(function(r){
      var x;
      if(r.error)return {state:'error',msg:r.error};
      if(r.status===401){authNeeded();return {state:'error',msg:'PRTG asked for a login'};}
      if(r.status<200||r.status>=300)return {state:'error',msg:'PRTG answered '+r.status};
      x=pvExtract(r.body);
      return x?{state:'ok',inner:x.inner,content:x.content,iw:x.iw,ih:x.ih}:{state:'error',msg:'PRTG returned no object for this file'};
    });
  }
  function pvGet(o){   /* o: {file,name,target,w,h,mode}. Cached, and a request already on its way is joined rather than repeated. */
    var key=pvKeyOf(o), p;
    if(PV.cache[key])return Promise.resolve(PV.cache[key]);
    if(PV.inflight[key])return PV.inflight[key];
    p=pvAsk({file:o.file,name:o.name,target:o.target,w:o.w,h:o.h}).then(function(ent){
      PV.cache[key]=ent;
      if(ent.state==='ok'&&ent.content)PV.cache[pvKeyOf(o,'content')]=ent;   /* a status icon needs no second request once we know it is one */
      delete PV.inflight[key];return ent;
    });
    PV.inflight[key]=p;return p;
  }
  function pvRun(job){
    PV.running++;
    pvGet(job.o).then(function(){delete PV.pending[job.key];PV.running--;pvPump();pvSync();});
  }
  function pvPump(){while(PV.running<3&&PV.queue.length)pvRun(PV.queue.shift());}
  function pvSync(){
    var lay=DASHAPI.objectLayout(), on=pvOn(), L=pvLayer(), keep={}, changed=false, i, o, key, ent, w, f, st;
    for(i=0;i<lay.length;i++){
      o=lay[i];
      if(!on){if(DASHAPI.pv[o.id]){delete DASHAPI.pv[o.id];delete DASHAPI.pvst[String(o.id)];changed=true;}continue;}
      key=pvKeyOf(o);ent=PV.cache[key];
      if(!ent){
        if(!PV.pending[key]){PV.pending[key]=1;PV.queue.push({o:o,key:key});}
        if(!DASHAPI.pv[o.id]){DASHAPI.pv[o.id]={state:'loading'};changed=true;}   /* what is showing stays until the new answer arrives */
        if(DASHAPI.pv[o.id].state==='ok'&&pvWrap(o.id))keep[o.id]=1;
        continue;
      }
      if(ent.state==='error'){if(pvSet(o.id,{state:'error',msg:ent.msg}))changed=true;continue;}
      if(pvSet(o.id,{state:'ok',autoContent:!!ent.content}))changed=true;
      if(!PV.applied[o.id]&&o.mode==='box'&&ent.iw&&ent.ih){PV.applied[o.id]=1;if(DASHAPI.applyInitial(o.id,ent.iw,ent.ih))return;}   /* the size the file itself asks for */
      PV.applied[o.id]=1;
      keep[o.id]=1;w=pvWrap(o.id);
      if(!w){
        w=document.createElement('div');w.className='dprevitem';w.setAttribute('data-id',String(o.id));
        f=document.createElement('iframe');f.setAttribute('scrolling','no');f.setAttribute('tabindex','-1');f.setAttribute('aria-hidden','true');
        w.appendChild(f);L.appendChild(w);
      }
      f=w.firstChild;
      if(w.getAttribute('data-key')!==key){
        w.setAttribute('data-key',key);
        if(pvNeedsLibs(ent)&&EX.libsFor!==(base()||pageOrigin()||'')&&!PV.libWait){
          PV.libWait=exLibs().then(function(){PV.libWait=null;[].forEach.call(pvLayer().querySelectorAll('.dprevitem'),function(x){x.removeAttribute('data-key');});pvSync();},function(){PV.libWait=null;});
        }
        (function(id,fr,entc,oc){setFramePreview(fr,pvDoc(entc,oc),{allowScripts:true,allowSameOrigin:true},function(){pvMeasure(id,fr);setTimeout(function(){pvMeasure(id,fr);},500);});})(o.id,f,ent,o);
      }
      w.style.left=o.x+'px';w.style.top=o.y+'px';w.style.zIndex=String(o.z);
      f.style.left=(-PAD)+'px';f.style.top=(-PAD)+'px';f.style.width=(o.w+2*PAD)+'px';f.style.height=(o.h+2*PAD)+'px';
    }
    st=L.querySelectorAll('.dprevitem');
    for(i=0;i<st.length;i++){if(!keep[st[i].getAttribute('data-id')]&&!keep[parseInt(st[i].getAttribute('data-id'),10)])st[i].parentNode.removeChild(st[i]);}
    pvPump();
    $('objlivego').disabled=!pvOn();
    if(changed)DASHAPI.rerender();
  }
  /* ---- the object list: grouped by category, with PRTG's drawing of the highlighted entry, and drag and drop ---- */
  var objShown=[], tgtShown=[], OBJSEL='', OBJG={cat:'',ms:false}, PICK={mode:'item',sel:null}, PP={tok:0,timer:null};
  var TILE={el:{},of:{},cats:{},src:null};   /* the list rows: the node and entry for each file, kept so a redraw reuses them */
  var DEF={gUser:null,sUser:null,sAuto:null,dAuto:null,gAuto:null,looking:false}, BUILTIN_G={id:1,name:'Local Probe'};   /* PRTG's Local Probe is always object 1 */
  var SENSOR_FILES=["An Icon A9.htm", "An Icon B1.htm", "An Icon B1_xl.htm", "An Icon C1.htm", "An icon AA.htm", "Gauges Sensor Primary small.htm", "Gauges Sensor Primary.htm", "Gauges Sensor small.htm", "Gauges Sensor.htm", "customStatusDot-SensorLED.htm", "graph large 0.htm", "graph small 0.htm", "graph tiny 0.htm", "graph toplist.htm", "graph without text 0.htm", "messageonly_on_transparent.htm", "messageonly_on_white.htm", "messageonly_related_background.htm", "tablechannels.htm", "tabletoplist.htm", "trafficlight.htm"];   /* the stock object files that only take a sensor, read from PRTG's own mapobjects folder */
  try{var og_=JSON.parse(localStorage.getItem(CFG.keys.objGroups)||'{}')||{};OBJG.cat=typeof og_.cat==='string'?og_.cat:'';OBJG.ms=!!og_.ms;}catch(e){OBJG.cat='';OBJG.ms=false;}
  function objGroupsSave(){try{localStorage.setItem(CFG.keys.objGroups,JSON.stringify({cat:OBJG.cat,ms:OBJG.ms}));}catch(e){}}
  function selEntry(){var i;if(!S.catalog||!OBJSEL)return null;for(i=0;i<S.catalog.length;i++)if(S.catalog[i].value===OBJSEL)return S.catalog[i];return null;}
  /* what an object reads from: a sensor, or a group, device or probe. Your own files say so in their code; PRTG's stock files are known; anything else is tried as a group first. */
  function kindStore(){try{return JSON.parse(localStorage.getItem(CFG.keys.kindOf)||'{}')||{};}catch(e){return {};}}
  function libCodeFor(e){var lib=libLoad(), k=keyOf(e.cat,e.name), f;for(f in lib)if(keyOf(lib[f].cat,lib[f].name)===k)return lib[f].code;return null;}
  /* Which single kind of object a file is best started on: PRTG's own declaration where the file carries
     one, else the known stock lists. PRTG's vocabulary here is probenode, group, device and sensor, and a
     file may name several -- our own generated objects declare "probenode,group,device". A file that
     names several is matched to the most specific of them, device before group before probe, so a tile
     that can read any of the three starts on a real device rather than on the Local Probe. */
  function kindOf(e){
    var ov=kindStore()[e.value], code, m, ts, has;
    if(ov==='p'||ov==='g'||ov==='d'||ov==='s')return ov;
    code=libCodeFor(e);
    if(code){
      m=/<#checkobjecttype[^>]*objecttype="([^"]*)"/.exec(code);
      if(m){
        ts=m[1].toLowerCase().split(/\s*,\s*/);
        has=function(x){return ts.indexOf(x)>=0;};
        if(ts.length===1&&has('sensor'))return 's';   /* only a sensor will do */
        if(has('device'))return 'd';
        if(has('group'))return 'g';
        if(has('probenode'))return 'p';
        if(has('sensor'))return 's';
      }
    }
    if(SENSOR_FILES.indexOf(e.value)>=0)return 's';
    if(/^graphs$/i.test(e.cat))return 's';
    return 'd';   /* the stock files take a probe, group or device; a device is the most specific of those */
  }
  var KINDNAME={p:'probe',g:'group',d:'device',s:'sensor'};
  function defFor(kind){
    if(kind==='s')return DEF.sUser||DEF.sAuto||null;
    if(DEF.gUser)return DEF.gUser;                        /* one chosen default stands in for every non-sensor kind */
    if(kind==='d')return DEF.dAuto||DEF.gAuto||BUILTIN_G;
    if(kind==='g')return DEF.gAuto||BUILTIN_G;
    return BUILTIN_G;                                      /* a probe: PRTG's Local Probe is always there */
  }
  function defKey(){return CFG.keys.previewWith+'|'+(base()||pageOrigin()||'');}
  function defSave(){try{localStorage.setItem(defKey(),JSON.stringify({g:DEF.gUser,s:DEF.sUser}));}catch(e){}}
  function defShow(){
    var on=!!S.catalog, g=defFor('d'), s=defFor('s');
    var gsrc=DEF.gUser?'':((DEF.dAuto||DEF.gAuto)?' (found automatically)':' (built in)');
    $('defgname').textContent=on?((g?g.name:'\u2013')+gsrc):'\u2013';
    $('defsname').textContent=on?(s?(s.name+(DEF.sUser?'':' (found automatically)')):(DEF.looking?'looking\u2026':'none found')):'\u2013';
    ['defgchange','defschange','defreset'].forEach(function(id){$(id).disabled=!on;});
  }
  /* the sensor to preview with: PRTG's own Probe Health or Core Health sensor if there is one, else the first sensor there is */
  function resolveDefaults(){
    var sv={}, tries=['Probe Health','Core Health',''], i=0, pending=0;
    try{sv=JSON.parse(localStorage.getItem(defKey())||'{}')||{};}catch(e){}
    DEF.gUser=sv.g||null;DEF.sUser=sv.s||null;DEF.sAuto=null;DEF.dAuto=null;DEF.gAuto=null;
    if(!S.catalog){DEF.looking=false;defShow();pvPaneShow();return;}
    DEF.looking=true;defShow();
    function done(){if(--pending<=0){DEF.looking=false;defShow();pvPaneShow();}}
    /* the first device and the first group this server has, so an object that reads one of those starts on
       something of its own kind instead of on the Local Probe */
    function firstOf(type,set){
      pending++;
      http('GET','/api/table.json',{content:type,columns:tgtColumns(type),count:1}).then(function(t){
        var j=parseJson(t,'The '+type+' list'), a=(j&&j[type])||[];
        if(a.length)set({id:a[0].objid,name:tgtLabel(type,a[0])});
        done();
      },function(){done();});
    }
    function nextSensor(){
      var nm, p;
      if(i>=tries.length){done();return;}
      nm=tries[i++];p={content:'sensors',columns:tgtColumns('sensors'),count:1};if(nm)p.filter_name='@sub('+nm+')';
      http('GET','/api/table.json',p).then(function(t){
        var j=parseJson(t,'The sensor list'), a=(j&&j.sensors)||[];
        if(a.length){DEF.sAuto={id:a[0].objid,name:tgtLabel('sensors',a[0])};done();}
        else nextSensor();
      },function(){nextSensor();});
    }
    if(!DEF.gUser){firstOf('devices',function(v){DEF.dAuto=v;});firstOf('groups',function(v){DEF.gAuto=v;});}
    if(!DEF.sUser){pending++;nextSensor();}
    if(!pending){DEF.looking=false;defShow();pvPaneShow();}
  }
  function objVisible(){return objShown.filter(function(x){return !x.el.hidden;});}
  function objSelect(value,scroll){
    var els=$('objlist').querySelectorAll('.objrow'), i, el=null, on;
    OBJSEL=value||'';
    for(i=0;i<els.length;i++){on=els[i].getAttribute('data-value')===OBJSEL;els[i].classList.toggle('on',on);els[i].setAttribute('aria-selected',on?'true':'false');if(on)el=els[i];}
    $('objadd').disabled=!(el&&!el.hidden);
    if(el&&scroll)el.scrollIntoView({block:'nearest'});
    pvPaneSchedule();
  }
  /* ---- the object list: a pinned row of category buttons, one open at a time, over a grid of PRTG's own
     drawing of each object. A preview costs one request, so a tile asks for its own only when it scrolls
     into view, and the answers are shared with the big preview below (same size, same cache key). ---- */
  function isMS(c){return /^map-studio[-_]/i.test(String(c.value||''))||/^map\s*studio\b/i.test(String(c.name||''));}
  function objLabel(c){var n=String(c.name||'');return isMS(c)?(n.replace(/^map\s*studio\s*[-–—:]?\s*/i,'')||n):n;}
  function msAny(){return !!(S.catalog&&S.catalog.some(isMS));}
  /* One drawing at a time. Each entry is a plain row; PRTG draws only the object you pick, in the single
     pane below. A drawing is two nested documents that parse PRTG's whole stylesheet and run PRTG's own
     scripts, so a gridful of them held tens of live documents open at once and brought the machine down.
     A row costs nothing, and a built-in icon shows its own picture file, which is one static image. */
  function objRowIcon(el,c){
    var box=el.querySelector('.rthumb'), origin=(base()||pageOrigin()||''), p=String(c.value||''), img;
    if(!box||!p||box.firstChild)return;
    img=document.createElement('img');img.alt='';img.setAttribute('aria-hidden','true');
    img.addEventListener('error',function(){if(img.parentNode)img.parentNode.removeChild(img);});
    box.appendChild(img);
    img.src=origin+(/%[0-9a-f]{2}/i.test(p)?p:encodeURI(p));
  }
  /* a category loads its icon pictures the first time it is opened, not before */
  function objPrime(cat){
    var blk=TILE.cats[cat];
    if(!blk||blk.getAttribute('data-primed'))return;
    blk.setAttribute('data-primed','1');
    [].forEach.call(blk.querySelectorAll('.objrow'),function(el){
      var c=TILE.of[el.getAttribute('data-value')];
      if(c&&c.icon)objRowIcon(el,c);
    });
  }
  function objRow(c,isMine){
    var el=TILE.el[c.value], nm;
    TILE.of[c.value]=c;
    if(el){el.classList.toggle('mine',!!isMine);return el;}
    el=document.createElement('div');
    el.className='objrow'+(isMine?' mine':'')+(c.icon?' hasico':'');
    el.setAttribute('role','option');el.setAttribute('draggable','true');
    el.setAttribute('data-value',c.value);el.setAttribute('data-label',c.cat+': '+c.name);el.setAttribute('data-cat',c.cat);
    el.innerHTML='<span class="rthumb"></span><span class="nm"></span>'+(isMS(c)?'<span class="rms">MS</span>':'')+(isMine?'<span class="yours">(yours)</span>':'');
    nm=el.querySelector('.nm');nm.textContent=objLabel(c);
    el.title=c.cat+': '+c.name+(isMS(c)?' \u2014 built with Map Studio':'')+(isMine?' \u2014 yours':'');
    el.addEventListener('click',function(){objSelect(c.value,false);});
    el.addEventListener('dblclick',objAdd);
    el.addEventListener('dragstart',function(ev){objDragStart(ev,c);});
    TILE.el[c.value]=el;
    return el;
  }
  /* the category buttons stay in view while the panel scrolls, just under the Build tiles that stick above them */
  function chipTop(){
    var b=document.querySelector('#dpane-add > .secfs'), c=$('objchips'), h=0;
    if(!b||!c)return;
    try{if(getComputedStyle(b).position==='sticky')h=b.getBoundingClientRect().height;}catch(e){}
    if(h>0)document.documentElement.style.setProperty('--tbh',Math.round(h)+'px');
    c.style.top='';   /* the offset is in CSS: header height plus tools height */
  }
  window.addEventListener('resize',chipTop);
  document.addEventListener('secopen',chipTop);
  /* after a different category is picked, bring its rows out from under the pinned buttons */
  function objListInView(){
    var c=$('objchips'), l=$('objlist'), p=c&&c.parentNode, cr, lr, d;
    if(!c||!l)return;
    try{
      while(p&&p!==document.body&&!(p.scrollHeight>p.clientHeight+5&&/auto|scroll/.test(getComputedStyle(p).overflowY)))p=p.parentNode;
      if(!p||p===document.body)return;
      cr=c.getBoundingClientRect();lr=l.getBoundingClientRect();
      d=cr.bottom-lr.top;
      if(d>0)p.scrollTop-=d+4;
    }catch(e){}
  }
  /* every category keeps its own block of rows, and a switch only hides and shows them */
  function objCatBlock(cat){
    var b=TILE.cats[cat], cap, grid;
    if(b)return b;
    b=document.createElement('div');b.className='ocat';b.setAttribute('data-cat',cat);
    cap=document.createElement('div');cap.className='ocaption';cap.textContent=cat;cap.hidden=true;b.appendChild(cap);
    grid=document.createElement('div');grid.className='ogrid';b.appendChild(grid);
    TILE.cats[cat]=b;$('ocats').appendChild(b);
    return b;
  }
  function objListFrame(){
    var box=$('objlist'), d;
    if(box.querySelector('#ocats'))return;
    box.innerHTML='';
    d=document.createElement('div');d.id='ocats';box.appendChild(d);
    d=document.createElement('div');d.className='objnone';d.hidden=true;box.appendChild(d);
    d=document.createElement('p');d.className='note ohint';box.appendChild(d);
  }
  function renderObjList(){
    var box=$('objlist'), q=String($('objsearch').value||'').trim().toLowerCase(), lib=libLoad(), mine={}, n=$('objmine'),
        top=box.scrollTop, cats=[], by={}, on=!!S.catalog, chips=$('chiprow'), msb=$('msonly'), msOnly=!!OBJG.ms, missing;
    if(TILE.src!==S.catalog){
      TILE.src=S.catalog;TILE.el={};TILE.of={};TILE.cats={};
      box.innerHTML='';
    }
    objListFrame();
    Object.keys(lib).forEach(function(f){mine[keyOf(lib[f].cat,lib[f].name)]=f;});
    objShown=[];
    $('objsearch').disabled=!on;box.classList.toggle('off',!on);box.setAttribute('aria-disabled',on?'false':'true');$('objadd').disabled=true;
    $('objchips').classList.toggle('off',!on);
    defShow();
    if(!on){n.hidden=true;chips.innerHTML='';msb.hidden=true;pvPaneShow();return;}
    msb.hidden=!msAny();
    if(msb.hidden&&msOnly){msOnly=false;OBJG.ms=false;objGroupsSave();}
    $('objmsonly').checked=msOnly;
    S.catalog.forEach(function(c){
      if(msOnly&&!isMS(c))return;
      if(!by[c.cat]){by[c.cat]=[];cats.push(c.cat);}
      by[c.cat].push(c);
    });
    if(cats.indexOf(OBJG.cat)<0)OBJG.cat=cats[0]||'';      /* the one kept from last time, while it is still here */
    chips.innerHTML='';
    cats.forEach(function(cat){
      var b=document.createElement('button'), open=(cat===OBJG.cat&&!q);
      b.type='button';b.className='ochip'+(open?' on':'');b.setAttribute('data-cat',cat);
      b.setAttribute('role','tab');b.setAttribute('aria-selected',open?'true':'false');
      b.innerHTML='<span class="cn"></span><b></b>';
      b.querySelector('.cn').textContent=cat;b.querySelector('b').textContent=by[cat].length;
      b.title=cat+' — '+by[cat].length+' object'+(by[cat].length===1?'':'s');
      b.addEventListener('click',function(){
        if($('objsearch').value){$('objsearch').value='';}
        OBJG.cat=cat;objGroupsSave();renderObjList();$('objlist').scrollTop=0;objListInView();
      });
      chips.appendChild(b);
    });
    /* each category's rows are made once and then stay put */
    cats.forEach(function(cat){
      var grid=objCatBlock(cat).querySelector('.ogrid');
      by[cat].forEach(function(c){
        var el=objRow(c,!!mine[keyOf(c.cat,c.name)]);
        if(el.parentNode!==grid)grid.appendChild(el);
      });
    });
    Object.keys(TILE.cats).forEach(function(k){TILE.cats[k].hidden=true;});
    cats.forEach(function(cat){
      var blk=TILE.cats[cat], any=false;
      blk.querySelector('.ocaption').hidden=!q;      /* while searching, each group says which category it is */
      [].forEach.call(blk.querySelectorAll('.objrow'),function(el){
        var c=TILE.of[el.getAttribute('data-value')], vis;
        vis=!!c&&(!msOnly||isMS(c))&&(q?((c.cat+': '+c.name).toLowerCase().indexOf(q)>=0):(cat===OBJG.cat));
        el.hidden=!vis;
        if(vis){any=true;objShown.push({c:c,el:el});}
      });
      blk.hidden=!any;
      if(any)objPrime(cat);
    });
    if(OBJSEL&&!objShown.some(function(x){return x.c.value===OBJSEL;}))OBJSEL='';
    box.querySelector('.objnone').textContent=!S.catalog.length?'PRTG lists no object files':(q?'No object matches':(msOnly?'Nothing here was built with Map Studio':'This category is empty'));
    box.querySelector('.objnone').hidden=!!objShown.length;
    box.querySelector('.ohint').textContent=q?(objShown.length+' match'+(objShown.length===1?'':'es')+' in every category.')
      :(objShown.length?(OBJG.cat+' · '+objShown.length+' object'+(objShown.length===1?'':'s')+'.'):'');
    missing=Object.keys(lib).filter(function(f){return !S.catalog.some(function(c){return keyOf(c.cat,c.name)===keyOf(lib[f].cat,lib[f].name);});});
    if(missing.length){
      n.hidden=false;n.className='note pst err';
      n.textContent='Not in PRTG yet: '+missing.map(function(f){return f+' ('+lib[f].cat+': '+lib[f].name+')';}).join(', ')+'. Copy '+(missing.length===1?'the file':'the files')+' into PRTG’s mapobjects folder (Download ZIP in the Object builder tab gives you a zip), then press Connect again.';
    }else if(Object.keys(lib).length){n.hidden=false;n.className='note pst ok';n.textContent='Every object you designed here is in PRTG’s list.';}
    else n.hidden=true;
    box.scrollTop=top;
    chipTop();
    objSelect(OBJSEL,false);
  }
  function objAdd(){
    var c=selEntry(), tg;
    if(!c)return;
    tg=defFor(kindOf(c));
    DASHAPI.addObject({cat:c.cat,name:c.name,value:c.value,target:tg?{id:tg.id,name:tg.name}:null});   /* it starts with the preview default, so it shows data straight away */
  }
  function objDragStart(ev,c){
    var tg=defFor(kindOf(c)), g=document.createElement('div');
    ev.dataTransfer.setData('application/x-prtg-object',JSON.stringify({cat:c.cat,name:c.name,value:c.value,target:tg?{id:tg.id,name:tg.name}:null}));
    ev.dataTransfer.setData('text/plain',c.cat+': '+c.name);ev.dataTransfer.effectAllowed='copy';
    objSelect(c.value,false);
    g.textContent=c.name;g.style.cssText='position:absolute;top:-1000px;left:0;padding:6px 10px;background:#007db8;color:#fff;font:12px sans-serif;border-radius:4px';document.body.appendChild(g);
    try{ev.dataTransfer.setDragImage(g,10,10);}catch(x){}
    setTimeout(function(){if(g.parentNode)g.parentNode.removeChild(g);},0);
  }
  $('objpvbox').setAttribute('draggable','true');$('objpvbox').title='Drag onto the canvas to add it';
  $('objpvbox').addEventListener('dragstart',function(ev){
    var c=(S.catalog||[]).filter(function(e){return e.value===OBJSEL;})[0];
    if(!c){ev.preventDefault();return;}
    objDragStart(ev,c);
  });
  function isObjDrag(e){var t=e.dataTransfer&&e.dataTransfer.types;return !!t&&Array.prototype.indexOf.call(t,'application/x-prtg-object')>=0;}
  /* ---- PRTG's drawing of the highlighted entry, scaled to fit under the list ---- */
  function pvPaneClear(){var f=$('objpvframe');f.removeAttribute('data-fit');PP.last=null;f.removeAttribute('src');}
  function pvPaneSchedule(){clearTimeout(PP.timer);PP.timer=setTimeout(pvPaneShow,200);}
  function pvPaneShow(){
    var e=selEntry(), pane=$('objpv'), msg=$('objpvmsg'), kind, tg, tok;
    if(!e||!S.catalog){pane.hidden=true;return;}
    pane.hidden=false;kind=kindOf(e);tg=defFor(kind);tok=++PP.tok;
    $('objpvkind').value=kind;$('objpvcap').textContent=e.cat+': '+e.name;
    if(!pvOn()){msg.className='note pst';msg.textContent=$('objlive').checked?'Choose a map under Existing PRTG maps (Add tab) to see previews.':'Previews are switched off.';pvPaneClear();return;}
    if(!tg){msg.className='note pst err';msg.textContent='No default sensor was found on this server. Choose one with Change\u2026 above.';pvPaneClear();return;}
    msg.className='note pst';msg.textContent='Loading PRTG\u2019s drawing\u2026';
    pvPaneAsk(e,tg,320,200,tok);
  }
  function pvPaneAsk(e,tg,w,h,tok){
    var o={file:e.value,name:e.name,target:tg.id,w:w,h:h,mode:'box'};   /* the same request the canvas makes, so an object costs one request, not two */
    function go(ent){
      var msg=$('objpvmsg');
      if(tok!==PP.tok)return;
      if(ent.state!=='ok'){msg.className='note pst err';msg.textContent='No preview: '+ent.msg+'.';pvPaneClear();return;}
      if(!ent.content&&ent.iw&&ent.ih&&(ent.iw!==w||ent.ih!==h)){pvPaneAsk(e,tg,ent.iw,ent.ih,tok);return;}   /* the size the file itself asks for */
      msg.className='note pst';msg.textContent='Shown with '+tg.name+(ent.content?'.':(', at '+w+' \u00D7 '+h+'.'));
      pvPaneRender(ent,w,h);
    }
    pvGet(o).then(go);
  }
  function pvPaneRender(ent,w,h){
    var f=$('objpvframe'), o={mode:ent.content?'content':'box',w:w,h:h};
    f.removeAttribute('data-fit');PP.last=o;
    setFramePreview(f,pvDoc(ent,o),{allowScripts:true,allowSameOrigin:true},function(){pvPaneFit(o);setTimeout(function(){pvPaneFit(o);},400);});
  }
  function pvPaneFit(o){
    var f=$('objpvframe'), box=$('objpvbox'), ow=o.w, oh=o.h, el, r, s, bw=box.clientWidth, bh=box.clientHeight, inner;
    try{
      if(o.mode==='content'){inner=f.contentDocument&&f.contentDocument.querySelector('iframe');el=inner&&inner.contentDocument&&inner.contentDocument.querySelector('#pvhost .map_object');if(!el)return;r=el.getBoundingClientRect();if(r.width>0&&r.height>0){ow=Math.ceil(r.width);oh=Math.ceil(r.height);}}
    }catch(e){return;}
    s=Math.min(1,(bw-16)/ow,(bh-16)/oh);if(!(s>0))s=1;
    f.style.width=(ow+2*PAD)+'px';f.style.height=(oh+2*PAD)+'px';f.style.transform='scale('+s+')';
    f.style.left=((bw-ow*s)/2-PAD*s)+'px';f.style.top=((bh-oh*s)/2-PAD*s)+'px';
    f.setAttribute('data-fit',ow+'x'+oh+'@'+s.toFixed(3));
  }
  function tgtLabel(type,r){
    if(type==='devices')return (r.device||('Device '+r.objid))+(r.group?' ('+r.group+')':'');
    if(type==='groups')return (r.group||('Group '+r.objid))+(r.probe?' ('+r.probe+')':'');
    return (r.sensor||('Sensor '+r.objid))+(r.device?' on '+r.device:'');
  }
  function tgtColumns(type){return type==='devices'?'objid,probe,group,device':(type==='groups'?'objid,probe,group':'objid,device,sensor');}
  function tgtRender(){
    var type=$('tgttype').value, a=S.tgt[type]||[], q=String($('tgtsearch').value||'').trim().toLowerCase(), box=$('tgtlist');
    box.innerHTML='';tgtShown=[];
    a.forEach(function(r){
      var l=tgtLabel(type,r);
      if(q&&l.toLowerCase().indexOf(q)<0)return;
      if(tgtShown.length>=300)return;
      var o=document.createElement('option');o.value=String(tgtShown.length);o.textContent=l+'  [ID '+r.objid+']';box.appendChild(o);tgtShown.push({id:r.objid,name:l});
    });
    $('tgtuse').disabled=true;
    var m=$('tgtmsg');m.className='note pst';
    m.textContent=a.length?(tgtShown.length+(tgtShown.length>=300?'+':'')+' shown of '+a.length+'. Pick one and press Use as target.'):'PRTG returned no '+type+'.';
  }
  /* ---- the target picker: PRTG's device tree (or a plain list), and dragging a target onto an object ----
     The tree comes from /api/tree.json, the call the map designer's own device tree makes (probes, groups and devices, with the root).
     PRTG's tree has no sensors, so a device's sensors are fetched when you open it. */
  var TGT={view:'tree'}, TR={nodes:{},roots:[],loaded:false,loading:false,failed:false,err:null,sel:null,q:'',hits:[],hitTok:0,hitTimer:null};
  var TYPEGLYPH={probe:'\u25C9',group:'\u25A3',device:'\u25AD',sensor:'\u25CF'};
  try{if(localStorage.getItem(CFG.keys.pickerView)==='list')TGT.view='list';}catch(e){}
  function trReset(){TR={nodes:{},roots:[],loaded:false,loading:false,failed:false,err:null,sel:null,q:TR.q||'',hits:[],hitTok:0,hitTimer:null};}
  function trStrip(t){return String(t==null?'':t).replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').trim();}
  function trType(raw){var t=String(raw||'').toLowerCase();if(t.indexOf('sensor')>=0)return 'sensor';if(t==='probe'||t==='probenode')return 'probe';if(t.indexOf('device')>=0)return 'device';return 'group';}
  /* the tree as jstree takes it: nodes with data (the title), attr (objid, type) and children */
  function trParse(j){
    /* 1.5.67: PRTG sends the Root group as one item with children; keep it as the top of the tree (taking only its children dropped Root) */
    if(j&&!Array.isArray(j)&&typeof j==='object'&&(j.attr||j.data||j.metadata)&&Array.isArray(j.children))j=[j];
    var list=Array.isArray(j)?j:((j&&Array.isArray(j.children))?j.children:((j&&Array.isArray(j.nodes))?j.nodes:((j&&Array.isArray(j.tree))?j.tree:null))), nodes={}, count=0, roots;
    if(!list&&j&&typeof j==='object'&&(j.data||j.attr))list=[j];
    if(!list)return null;
    function walk(arr,parent,depth){
      var ids=[];
      arr.forEach(function(n){
        var a=(n&&n.attr)||{}, md=(n&&n.metadata)||{}, raw, id, title, node;
        if(!n)return;
        raw=(a.objid!=null)?a.objid:((md.objid!=null)?md.objid:n.objid);id=parseInt(raw,10);
        if(isNaN(id))return;
        title=(typeof n.data==='string')?n.data:((n.data&&(n.data.title||n.data.name))||n.title||n.name||'');
        node={id:id,type:trType(a.type||a.rel||md.type||n.type),name:trStrip(title)||('Object '+id),parent:parent,children:[],open:(n.state==='open')||depth===0,sensorsLoaded:false};
        nodes[id]=node;count++;ids.push(id);
        if(Array.isArray(n.children)&&n.children.length){node.children=walk(n.children,id,depth+1);if(node.children.some(function(c){return nodes[c]&&nodes[c].type==='sensor';}))node.sensorsLoaded=true;}
      });
      return ids;
    }
    roots=walk(list,null,0);
    return count?{nodes:nodes,roots:roots}:null;
  }
  function trLabel(n){   /* the same words the plain list uses: device (group), sensor on device */
    var p=(n.parent!=null)?TR.nodes[n.parent]:null;
    if(n.label)return n.label;
    if(n.type==='device'&&p&&p.type==='group'&&p.id!==0)return n.name+' ('+p.name+')';
    if(n.type==='sensor'&&p)return n.name+' on '+p.name;
    return n.name;
  }
  function trCanOpen(n){return n.children.length>0||(n.type==='device'&&!n.sensorsLoaded&&!n.hit);}
  function trValid(n){if(PICK.mode==='g')return n.type!=='sensor';if(PICK.mode==='s')return n.type==='sensor';return true;}
  function trMatches(q){var m={}, k, n, c;for(k in TR.nodes){n=TR.nodes[k];if(n.name.toLowerCase().indexOf(q)>=0){c=n;while(c){m[c.id]=1;c=(c.parent!=null)?TR.nodes[c.parent]:null;}}}return m;}
  function trVisible(){
    var out=[], q=TR.q.toLowerCase(), m=q?trMatches(q):null;
    function walk(id,depth){
      var n=TR.nodes[id];
      if(!n||(m&&!m[id]))return;
      out.push({n:n,depth:depth});
      if(m||n.open){
        n.children.forEach(function(c){walk(c,depth+1);});
        if(!m&&n.open&&n.type==='device'){
          if(n.sensorsLoading)out.push({note:'loading sensors\u2026',depth:depth+1});
          else if(n.sensorErr)out.push({note:n.sensorErr,depth:depth+1,err:true});
          else if(n.sensorsLoaded&&!n.children.length)out.push({note:'no sensors',depth:depth+1});
        }
      }
    }
    TR.roots.forEach(function(id){walk(id,0);});
    return out;
  }
  function trNote(text,depth,err){var el=document.createElement('div');el.className='trnote'+(err?' err':'');el.style.paddingLeft=(44+depth*24)+'px';el.textContent=text;return el;}
  /* a very small dot at the start of each row: PRTG's status number, read from the object tables */
  var TRSTATE={3:'up',4:'warn',5:'down',13:'down',14:'down',10:'warn',7:'off',8:'off',9:'off',12:'off'};
  /* 1.5.67: the tree looks like PRTG's new UI: chevrons, line icons, bold names and status-count boxes under each probe, group and device */
  var TRCNT=['down','downack','warn','unusual','paused','up','unknown'];   /* the order PRTG's new UI shows them in */
  var TRCOL={down:'#E3063D',downack:'#F07A8F',warn:'#F2BE25',unusual:'#F07800',paused:'#478EFF',up:'#B4BF17',unknown:'#A3A6AE'};
  var TRGLYPH={down:'<path d="M5 5l6 6M11 5l-6 6"/>',downack:'<path d="M4.5 8.5l2.5 2.5L11.5 5.5"/>',warn:'<path d="M8 3.8v5.4M8 11.6v.6"/>',unusual:'<path d="M3 9.2c1.6-3 3.2-3 4.8 0s3.2 3 4.8 0"/>',paused:'<path d="M6 4.5v7M10 4.5v7"/>',up:'<path d="M4 8.4l2.7 2.7L12 5.6"/>',unknown:'<path d="M5 8h6"/>'};
  var TRSENS={up:'up',warn:'warn',down:'down',off:'paused',un:'unknown'};
  function trSvg(inner,cls){return '<svg class="'+cls+'" viewBox="0 0 16 16" aria-hidden="true">'+inner+'</svg>';}
  var TRICON={
    group:'<rect x="1.5" y="2.5" width="9.5" height="6.5" rx="1"/><rect x="5" y="7" width="9.5" height="6.5" rx="1" fill="#fff"/>',
    probe:'<circle cx="8" cy="8" r="3.6"/><path d="M8 1.2v3.2M8 11.6v3.2M1.2 8h3.2M11.6 8h3.2"/>',
    device:'<rect x="1.5" y="4.5" width="13" height="7" rx="1.2"/><circle cx="4.6" cy="8" r=".9" fill="#E3063D" stroke="none"/><circle cx="7.2" cy="8" r=".9" fill="#E3063D" stroke="none"/>'
  };
  function trChips(c){
    var o='', i, k, v;
    if(!c)return '';
    for(i=0;i<TRCNT.length;i++){k=TRCNT[i];v=c[k]||0;if(!v)continue;o+='<span class="trc" style="--c:'+TRCOL[k]+'" title="'+v+' '+k+'"><span class="trci">'+trSvg(TRGLYPH[k],'')+'</span><span class="trcn">'+v+'</span></span>';}
    return o?'<div class="trcs">'+o+'</div>':'';
  }
  function trCounts(r){
    var g=function(k){var x=parseInt(r[k],10);return isNaN(x)?0:x;};
    if(r.upsens==null&&r.downsens==null&&r.warnsens==null)return null;
    return {down:g('downsens')+g('partialdownsens'),downack:g('downacksens'),warn:g('warnsens'),unusual:g('unusualsens'),paused:g('pausedsens'),up:g('upsens'),unknown:g('undefinedsens')};
  }
  function trDot(st){return (st==null||isNaN(st))?'':' sd-'+(TRSTATE[st]||'un');}
  function trNum(v){var x=parseInt(v,10);return isNaN(x)?null:x;}
  function trLoadStatus(){
    var jobs;
    if(TR.stLoading||!TR.loaded)return;
    TR.stLoading=true;
    jobs=['devices','groups','probenodes'].map(function(c){
      return http('GET','/api/table.json',{content:c,columns:'objid,status_raw,upsens,downsens,partialdownsens,downacksens,warnsens,unusualsens,pausedsens,undefinedsens',count:100000}).then(function(t){
        var j=parseJson(t,'The status of the '+c), a=j[c], k;
        if(!Array.isArray(a)){for(k in j){if(Array.isArray(j[k])){a=j[k];break;}}}
        (a||[]).forEach(function(r){var n=TR.nodes[parseInt(r.objid,10)];if(n){n.st=trNum(r.status_raw);n.cnt=trCounts(r);}});
      },function(){});
    });
    Promise.all(jobs).then(function(){
      var parents={}, ps;
      /* sensors that came with the tree itself: one read per device that holds them */
      Object.keys(TR.nodes).forEach(function(k){var n=TR.nodes[k];if(n.type==='sensor'&&n.st==null&&n.parent!=null)parents[n.parent]=1;});
      ps=Object.keys(parents).slice(0,20).map(function(pid){
        return http('GET','/api/table.json',{content:'sensors',id:pid,columns:'objid,status_raw',count:500}).then(function(t){
          ((parseJson(t,'The sensor status').sensors)||[]).forEach(function(r){var n=TR.nodes[parseInt(r.objid,10)];if(n)n.st=trNum(r.status_raw);});
        },function(){});
      });
      return Promise.all(ps);
    }).then(function(){TR.stLoading=false;TR.stAt=Date.now();trRender();});
  }
  function trRow(n,depth){
    var el=document.createElement('div'), open=!!n.open&&!TR.q, can=trCanOpen(n)&&!TR.q;
    el.className='trn'+(TR.sel&&TR.sel.id===n.id?' on':'')+(trValid(n)?'':' bad');el.setAttribute('role','treeitem');el.setAttribute('data-id',String(n.id));el.setAttribute('data-type',n.type);el.setAttribute('draggable','true');
    var i, bi=[], bp=[], sk, ic;
    el.style.paddingLeft=(4+depth*24)+'px';
    for(i=0;i<depth;i++){bi.push('linear-gradient(#DBDCDF,#DBDCDF)');bp.push((4+i*24+9)+'px 0');}   /* the thin guide line under each open parent */
    if(bi.length){el.style.backgroundImage=bi.join(',');el.style.backgroundPosition=bp.join(',');el.style.backgroundSize='1px 100%';el.style.backgroundRepeat='no-repeat';}
    if(n.type==='sensor'){sk=TRSENS[(TRSTATE[n.st]||'un')]||'unknown';if(n.st===10)sk='unusual';ic='<span class="trsq" style="--c:'+TRCOL[sk]+'">'+trSvg(TRGLYPH[sk],'')+'</span>';}
    else ic=trSvg(TRICON[n.type]||TRICON.group,'tico');
    el.innerHTML='<div class="trl"><span class="tw">'+(can?trSvg('<path d="M6 3.5l4.5 4.5L6 12.5"/>','tchev'+(open?' open':'')):'')+'</span><span class="ti t-'+n.type+'">'+ic+'</span><span class="tl"></span></div>'+(n.type!=='sensor'?trChips(n.cnt):'');
    el.querySelector('.ti').title=n.type;
    el.querySelector('.tl').textContent=n.hit?trLabel(n):n.name;el.title=trLabel(n)+'  ['+n.type+', ID '+n.id+']';
    if(can)el.setAttribute('aria-expanded',open?'true':'false');
    el.querySelector('.tw').addEventListener('click',function(ev){ev.stopPropagation();if(can)trToggle(n);});
    el.addEventListener('click',function(){trSelect(n);});
    el.addEventListener('dblclick',function(){if(can)trToggle(n);else tgtUse();});
    el.addEventListener('dragstart',function(ev){trDragStart(ev,n,el);});
    return el;
  }
  function trRender(){
    var box=$('tgttree'), top=box.scrollTop, vis, h;
    if(TGT.view!=='tree')return;
    box.innerHTML='';
    if(!TR.loaded){box.appendChild(trNote(TR.loading?'Loading the device tree\u2026':'Connect to load the device tree.',0));trUseState();return;}
    vis=trVisible();
    vis.forEach(function(v){box.appendChild(v.note?trNote(v.note,v.depth,v.err):trRow(v.n,v.depth));});
    if(TR.q&&!vis.length&&!TR.hits.length)box.appendChild(trNote('Nothing in the tree matches. Sensors are searched too, as you type.',0));
    if(TR.q&&TR.hits.length){h=document.createElement('div');h.className='trhead';h.textContent='Sensors matching \u201C'+TR.q+'\u201D';box.appendChild(h);TR.hits.forEach(function(n){box.appendChild(trRow(n,0));});}
    box.scrollTop=top;trUseState();
    if(TR.loaded&&!TR.stLoading&&(!TR.stAt||Date.now()-TR.stAt>CFG.tree.statusEvery))trLoadStatus();
  }
  function trUseState(){
    var sel=DASHAPI.selected(), good=!!TR.sel&&trValid(TR.sel)&&(PICK.mode!=='item'||!!(sel&&sel.type==='prtgobj'));
    if(TGT.view==='tree')$('tgtuse').disabled=!good;
  }
  function trSelect(n){TR.sel=n;trRender();}
  function trToggle(n){
    n.open=!n.open;
    if(n.open&&n.type==='device'&&!n.sensorsLoaded)trLoadSensors(n);
    trRender();
  }
  function trLoadSensors(n){
    if(n.sensorsLoading)return;
    n.sensorsLoading=true;n.sensorErr=null;
    http('GET','/api/table.json',{content:'sensors',id:n.id,columns:'objid,sensor,status_raw',count:500}).then(function(t){
      var a=(parseJson(t,'The sensors of '+n.name).sensors)||[];
      n.children=a.map(function(r){var id=parseInt(r.objid,10);TR.nodes[id]={id:id,type:'sensor',name:r.sensor||('Sensor '+id),parent:n.id,children:[],open:false,sensorsLoaded:true,st:trNum(r.status_raw)};return id;});
      n.sensorsLoaded=true;n.sensorsLoading=false;trRender();
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      n.sensorsLoading=false;n.sensorErr='could not load the sensors ('+(err.message||err)+')';trRender();
    });
  }
  function trLoad(){
    if(TR.loaded||TR.loading||TR.failed)return;
    TR.loading=true;TR.err=null;
    http('GET','/api/tree.json',{groups:1,devices:1,probes:1,allowroot:1}).then(function(t){
      var r=trParse(parseJson(t,'The device tree'));
      if(!r)throw new Error('the reply was not a tree this tool can read');
      TR.nodes=r.nodes;TR.roots=r.roots;TR.loaded=true;TR.loading=false;trRender();
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      TR.loading=false;TR.failed=true;TR.err=err.message||String(err);
      TGT.view='list';tgtApplyView();tgtListRefresh();
      var f=$('tgtfailnote');f.hidden=false;f.textContent='The device tree could not be loaded ('+TR.err+'), so this is a plain list.';
    });
  }
  function trSearch(){
    var tok;
    TR.q=String($('tgttreesearch').value||'').trim();TR.hits=[];clearTimeout(TR.hitTimer);tok=++TR.hitTok;
    trRender();
    if(TR.q.length>=2&&TR.loaded){
      TR.hitTimer=setTimeout(function(){
        http('GET','/api/table.json',{content:'sensors',columns:tgtColumns('sensors')+',status_raw',count:50,filter_name:'@sub('+TR.q+')'}).then(function(t){
          if(tok!==TR.hitTok)return;
          TR.hits=((parseJson(t,'The sensor search').sensors)||[]).map(function(r){return {id:parseInt(r.objid,10),type:'sensor',name:r.sensor||('Sensor '+r.objid),label:tgtLabel('sensors',r),parent:null,children:[],hit:true,st:trNum(r.status_raw)};});
          trRender();
        }).catch(function(){});
      },350);
    }
  }
  function trDragStart(ev,n,el){
    var d={id:n.id,type:n.type,name:trLabel(n)}, g=document.createElement('div');
    ev.dataTransfer.setData('application/x-prtg-target',JSON.stringify(d));ev.dataTransfer.setData('text/plain',d.name);ev.dataTransfer.effectAllowed='copy';
    TR.sel=n;[].forEach.call($('tgttree').querySelectorAll('.trn'),function(r){r.classList.toggle('on',r===el);});trUseState();   /* no redraw here: that would end the drag */
    g.textContent=d.name;g.style.cssText='position:absolute;top:-1000px;left:0;padding:6px 10px;background:#2f855a;color:#fff;font:12px sans-serif;border-radius:4px';document.body.appendChild(g);
    try{ev.dataTransfer.setDragImage(g,10,10);}catch(x){}
    setTimeout(function(){if(g.parentNode)g.parentNode.removeChild(g);},0);
  }
  function trKeys(e){
    var rows=[].slice.call($('tgttree').querySelectorAll('.trn')), i=-1, k=e.key, n=TR.sel;
    rows.forEach(function(r,j){if(n&&r.getAttribute('data-id')===String(n.id))i=j;});
    function pick(j){
      var id, nn, r;
      if(j<0||j>=rows.length)return;
      id=parseInt(rows[j].getAttribute('data-id'),10);nn=TR.nodes[id]||TR.hits.filter(function(h){return h.id===id;})[0];
      if(nn){trSelect(nn);r=$('tgttree').querySelector('.trn.on');if(r)r.scrollIntoView({block:'nearest'});}
    }
    if(k==='ArrowDown'){e.preventDefault();pick(i<0?0:i+1);}
    else if(k==='ArrowUp'){e.preventDefault();pick(i<0?0:i-1);}
    else if(k==='ArrowRight'&&n&&trCanOpen(n)&&!n.open&&!TR.q){e.preventDefault();trToggle(n);}
    else if(k==='ArrowLeft'&&n&&!TR.q){e.preventDefault();if(n.open&&trCanOpen(n))trToggle(n);else if(n.parent!=null&&TR.nodes[n.parent])trSelect(TR.nodes[n.parent]);}
    else if(k==='Enter'){e.preventDefault();tgtUse();}
  }
  /* ---- the plain list: the fallback, and a choice ---- */
  function tgtApplyView(){$('tgttreebox').hidden=(TGT.view!=='tree');$('tgtlistbox').hidden=(TGT.view==='tree');}
  function tgtListRefresh(){
    var type=$('tgttype').value;
    if(S.tgt[type]){tgtRender();return;}
    $('tgtmsg').className='note pst';$('tgtmsg').textContent='Loading '+type+'\u2026';
    http('GET','/api/table.json',{content:type,columns:tgtColumns(type),count:5000}).then(function(t){
      var j=parseJson(t,'The list of '+type);S.tgt[type]=(j&&j[type])||[];tgtRender();
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      $('tgtmsg').className='note pst err';$('tgtmsg').textContent=err.message+' You can still type the object\u2019s ID in the selected item\u2019s Target box.';
    });
  }
  function tgtRefresh(){
    tgtApplyView();
    if(TGT.view==='tree'){trLoad();trRender();return;}
    tgtListRefresh();
  }
  function pickHead(){
    var h=$('tgthead'), u=$('tgtuse'), sel=DASHAPI.selected(), has=!!(sel&&sel.type==='prtgobj');
    if(PICK.mode==='g'){h.innerHTML='<strong>Choose what previews and new group or device objects show.</strong> Each object can still be given its own target.';u.textContent='Use as default';}
    else if(PICK.mode==='s'){h.innerHTML='<strong>Choose the sensor that previews and new sensor objects show.</strong>';u.textContent='Use as default';}
    else if(has){h.innerHTML='<strong>What should the selected object show?</strong> Pick a device, group or sensor, or drag one onto any object on the canvas.';u.textContent='Use as target';}
    else{h.innerHTML='<strong>Targets.</strong> Drag a device, group or sensor onto an object on the canvas to make it that object\u2019s target.';u.textContent='Use as target';}
    $('tgttype').disabled=(PICK.mode==='s');
    $('tgtcancel').hidden=(PICK.mode==='item');
  }
  function pickerSync(){
    var sel=DASHAPI.selected(), id=sel?sel.id:null, show=!!(sel&&sel.type==='prtgobj'), on=!!(S.maps&&S.catalog), was=PICK.mode;
    if(PICK.mode!=='item'&&show&&id!==PICK.sel){PICK.mode='item';if(was==='s')$('tgttype').value='devices';}   /* choosing another object takes the picker back to that object */
    if(PICK.mode==='item')PICK.sel=id;
    pickHead();
    $('tgtbox').hidden=!on;
    if(on)tgtRefresh();
  }
  function catEntry(value){var i;for(i=0;S.catalog&&i<S.catalog.length;i++)if(S.catalog[i].value===value)return S.catalog[i];return null;}
  function tgtPicked(){
    var n, r;
    if(TGT.view==='tree'){n=TR.sel;return (n&&trValid(n))?{id:n.id,name:trLabel(n),type:n.type}:null;}
    r=tgtShown[parseInt($('tgtlist').value,10)];return r?{id:r.id,name:r.name}:null;
  }
  function setDefault(kind,r){
    var m=$('tgtmsg');
    if(kind==='g')DEF.gUser={id:r.id,name:r.name};else DEF.sUser={id:r.id,name:r.name};
    defSave();defShow();pvPaneShow();
    if(PICK.mode!=='item'){if(PICK.mode==='s')$('tgttype').value='devices';PICK.mode='item';pickHead();trRender();}   /* done: back to choosing a target */
    m.className='note pst ok';m.textContent='Previews and new objects now use '+r.name+'.';
  }
  /* a target for an object, chosen with the button or dropped on it; a mismatch is allowed but said out loud */
  function applyTarget(itemId,r,dropped){
    var lay=DASHAPI.objectLayout().filter(function(o){return o.id===itemId;})[0], ent=lay?catEntry(lay.file):null, warn='', m=$('tgtmsg'), k;
    if(dropped)DASHAPI.select(itemId);
    DASHAPI.setTarget(itemId,{id:r.id,name:r.name});
    if(ent&&r.type){k=kindOf(ent);
      if(k!=='s'&&r.type==='sensor')warn=' Heads up: '+ent.name+' takes a '+(KINDNAME[k]||'group or device')+', so a sensor may show nothing.';
      else if(k==='s'&&r.type!=='sensor')warn=' Heads up: '+ent.name+' takes a sensor, so this may show nothing.';
    }
    m.className='note pst '+(warn?'warn':'ok');m.textContent='Target of '+(lay?lay.name:'the object')+' set to '+r.name+'.'+warn;
  }
  function tgtUse(){
    var r=tgtPicked(), sel;
    if(!r)return;
    if(PICK.mode==='g'||PICK.mode==='s'){setDefault(PICK.mode,r);return;}
    sel=DASHAPI.selected();
    if(!sel||sel.type!=='prtgobj')return;
    applyTarget(sel.id,r,false);
  }
  function isTgtDrag(e){var t=e.dataTransfer&&e.dataTransfer.types;return !!t&&Array.prototype.indexOf.call(t,'application/x-prtg-target')>=0;}
  function dtClear(){[].forEach.call(document.querySelectorAll('.dtarget'),function(x){x.classList.remove('dtarget');});}
  function itemAtPoint(x,y){
    var el=document.elementFromPoint(x,y), n=(el&&el.closest)?el.closest('#dcanvas .ditem'):null, id, lay;
    if(!n)return null;
    id=parseInt(n.getAttribute('data-id'),10);lay=DASHAPI.objectLayout().filter(function(o){return o.id===id;})[0];
    return lay?{id:id,node:n,lay:lay}:null;
  }
  $('objsamples').addEventListener('click',collectSamples);
  try{$('objlive').checked=(localStorage.getItem(CFG.keys.livePreview)!=='0');}catch(e){}
  $('objlive').addEventListener('change',function(){try{localStorage.setItem(CFG.keys.livePreview,this.checked?'1':'0');}catch(e){}pvSync();pvPaneShow();});
  $('objlivego').addEventListener('click',function(){PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};var ids=Object.keys(DASHAPI.pv);ids.forEach(function(k){if(DASHAPI.pv[k].state!=='ok')delete DASHAPI.pv[k];});pvSync();pvPaneShow();});
  document.addEventListener('dashrender',pvSync);
  DASHAPI.onMove=function(it){var w=pvWrap(it.id);if(w){w.style.left=it.x+'px';w.style.top=it.y+'px';}};
  $('objsearch').addEventListener('input',renderObjList);
  $('objlist').addEventListener('keydown',function(e){
    var vis=objVisible(), i=-1, k=e.key;
    vis.forEach(function(x,n){if(x.c.value===OBJSEL)i=n;});
    if(k==='Enter'){e.preventDefault();objAdd();return;}
    if(k!=='ArrowDown'&&k!=='ArrowUp'&&k!=='Home'&&k!=='End')return;
    if(!vis.length)return;
    e.preventDefault();
    if(i<0)i=0;
    else if(k==='Home')i=0;
    else if(k==='End')i=vis.length-1;
    else if(k==='ArrowDown')i=Math.min(vis.length-1,i+1);
    else i=Math.max(0,i-1);
    objSelect(vis[i].c.value,true);
  });
  $('objmsonly').addEventListener('change',function(){OBJG.ms=!!this.checked;objGroupsSave();renderObjList();$('objlist').scrollTop=0;objListInView();});
  $('objpvkind').addEventListener('change',function(){var e=selEntry(), st;if(!e)return;st=kindStore();st[e.value]=this.value;try{localStorage.setItem(CFG.keys.kindOf,JSON.stringify(st));}catch(x){}pvPaneShow();});
  $('defgchange').addEventListener('click',function(){PICK.mode='g';PICK.sel=(DASHAPI.selected()||{}).id||null;$('tgttype').value='devices';pickerSync();try{$('tgtbox').scrollIntoView({block:'nearest'});}catch(e){}});
  $('defschange').addEventListener('click',function(){PICK.mode='s';PICK.sel=(DASHAPI.selected()||{}).id||null;$('tgttype').value='sensors';pickerSync();try{$('tgtbox').scrollIntoView({block:'nearest'});}catch(e){}});
  $('defreset').addEventListener('click',function(){DEF.gUser=null;DEF.sUser=null;defSave();resolveDefaults();});
  var wrapEl=$('dwrap');
  wrapEl.addEventListener('dragenter',function(e){if(isObjDrag(e)){e.preventDefault();wrapEl.classList.add('dropping');}});
  wrapEl.addEventListener('dragover',function(e){if(isObjDrag(e)){e.preventDefault();try{e.dataTransfer.dropEffect='copy';}catch(x){}wrapEl.classList.add('dropping');}});
  wrapEl.addEventListener('dragleave',function(e){if(!e.relatedTarget||!wrapEl.contains(e.relatedTarget))wrapEl.classList.remove('dropping');});
  wrapEl.addEventListener('drop',function(e){
    var d;
    if(!isObjDrag(e))return;
    e.preventDefault();wrapEl.classList.remove('dropping');
    try{d=JSON.parse(e.dataTransfer.getData('application/x-prtg-object'));}catch(x){return;}
    if(d&&d.value)DASHAPI.dropObject(d,e.clientX,e.clientY);
  });
  $('objadd').addEventListener('click',objAdd);
  $('tgttype').addEventListener('change',tgtRefresh);
  $('tgtsearch').addEventListener('input',tgtRender);
  $('tgtlist').addEventListener('change',function(){$('tgtuse').disabled=!tgtShown[parseInt($('tgtlist').value,10)];});
  $('tgtlist').addEventListener('dblclick',tgtUse);
  $('tgtuse').addEventListener('click',tgtUse);
  document.addEventListener('secopen',function(e){var fs=e.detail&&e.detail.fs;if(fs&&fs.id==='objfs'&&PP.last)pvPaneFit(PP.last);});   /* the pane was fitted to nothing while its section was closed */
  $('tgttreesearch').addEventListener('input',trSearch);
  $('tgtcancel').addEventListener('click',function(){var was=PICK.mode;PICK.mode='item';if(was==='s')$('tgttype').value='devices';pickerSync();});
  $('tgttree').addEventListener('keydown',trKeys);
  $('tgtshowlist').addEventListener('click',function(){TGT.view='list';try{localStorage.setItem(CFG.keys.pickerView,'list');}catch(e){}tgtRefresh();});
  $('tgtshowtree').addEventListener('click',function(){TGT.view='tree';TR.failed=false;try{localStorage.setItem(CFG.keys.pickerView,'tree');}catch(e){}$('tgtfailnote').hidden=true;tgtRefresh();});
  /* dragging a target onto an object on the canvas, or onto a Preview with line */
  wrapEl.addEventListener('dragenter',function(e){if(isTgtDrag(e))e.preventDefault();});
  wrapEl.addEventListener('dragover',function(e){
    var hit;
    if(!isTgtDrag(e))return;
    hit=itemAtPoint(e.clientX,e.clientY);dtClear();
    if(hit){e.preventDefault();try{e.dataTransfer.dropEffect='copy';}catch(x){}hit.node.classList.add('dtarget');}
  });
  wrapEl.addEventListener('dragleave',function(e){if(isTgtDrag(e)&&(!e.relatedTarget||!wrapEl.contains(e.relatedTarget)))dtClear();});
  wrapEl.addEventListener('drop',function(e){
    var d, hit;
    if(!isTgtDrag(e))return;
    dtClear();hit=itemAtPoint(e.clientX,e.clientY);
    if(!hit)return;
    e.preventDefault();
    try{d=JSON.parse(e.dataTransfer.getData('application/x-prtg-target'));}catch(x){return;}
    if(d&&d.id!=null)applyTarget(hit.id,d,true);
  });
  [].forEach.call(document.querySelectorAll('#defbox .defrow'),function(row){
    row.addEventListener('dragenter',function(e){if(isTgtDrag(e))e.preventDefault();});
    row.addEventListener('dragover',function(e){if(isTgtDrag(e)&&S.catalog){e.preventDefault();row.classList.add('dtarget');}});
    row.addEventListener('dragleave',function(){row.classList.remove('dtarget');});
    row.addEventListener('drop',function(e){
      var d, kind=row.getAttribute('data-kind'), m=$('defmsg');
      if(!isTgtDrag(e))return;
      e.preventDefault();row.classList.remove('dtarget');
      try{d=JSON.parse(e.dataTransfer.getData('application/x-prtg-target'));}catch(x){return;}
      m.hidden=false;
      if((kind==='s')!==(d.type==='sensor')){m.className='note pst err';m.textContent=(kind==='s'?'Only a sensor can be the sensor default.':'A sensor cannot be the group or device default: drop it on the sensor line.');return;}
      setDefault(kind,{id:d.id,name:d.name});
      m.className='note pst ok';m.textContent='Now previewing '+(kind==='s'?'sensor':'group and device')+' objects with '+d.name+'.';
    });
  });
  document.addEventListener('dashselect',pickerSync);
  $('pushconnect').addEventListener('click',connect);
  $('pushreview').addEventListener('click',review);
  $('pushgo').addEventListener('click',push);
  $('pushundo').addEventListener('click',undo);
  $('pushforget').addEventListener('click',forget);
  $('pushmap').addEventListener('change',function(){S.reviewed=null;S.cls=null;$('pushgo').hidden=true;$('pushlist').hidden=true;updateButtons();});
  ['pushoffx','pushoffy','pushz','pushserver'].forEach(function(x){$(x).addEventListener('input',function(){S.reviewed=null;$('pushgo').hidden=true;if(x==='pushserver')tokenPromise=null;describeWhere();updateButtons();});});
  describeWhere();
  /* PRTG's own drawing of one object file into a frame, for the Object builder (PRTG stock icons): the request the map designer makes,
     on the map chosen under Existing PRTG maps (else the first map) and the default target. why:'off' when not connected. */
  function livePreview(f,file,o){
    o=o||{};
    var mid=(S.maps&&S.maps.length)?(mapId()||String(S.maps[0].objid)):'', tg, w=o.w||260, hh=o.h||140;
    if(!mid)return Promise.resolve({ok:false,why:'off'});
    tg=defFor(o.kind||'g');
    if(!tg)return Promise.resolve({ok:false,why:'no default object was found on this server'});
    return prtgCss().catch(function(){}).then(function(){
      return sampleGet({kind:'preview',label:'preview',path:'/controls/mapobjectpreview.htm',
        params:{id:mid,count:5,dependency_:tg.id,width:w,height:hh,selected:'',mapelements:',*'+file+'*',maptitles:',*'+(o.name||file)+'*'}});
    }).then(function(r){
      var x;
      if(r.error)return {ok:false,why:r.error};
      if(r.status===401)return {ok:false,why:'PRTG asked for a login'};
      if(r.status<200||r.status>=300)return {ok:false,why:'PRTG answered '+r.status};
      x=pvExtract(r.body);
      if(!x)return {ok:false,why:'PRTG returned no object for this file'};
      if(/not(%20| )found!/i.test(x.inner))return {ok:false,why:'this file is not in this server\u2019s object list'};
      setFramePreview(f,pvDoc(x,{mode:'content',w:w,h:hh,id:'ob'}),{allowScripts:true,allowSameOrigin:true});
      return {ok:true,target:tg.name};
    }).catch(function(e){return {ok:false,why:(e&&e.message)||'no answer'};});
  }
  window.PUSHAPI={state:S,connect:connect,review:review,push:push,undo:undo,normalize:normalize,csrf:csrf,renderObjList:renderObjList,livePreview:livePreview};
  updateButtons();
  storageGet(function(items){
    if(items.pm_lastServer){$('pushserver').value=items.pm_lastServer;$('pushserver').dispatchEvent(new Event('input'));}
    if(items.pm_remember){
      $('pushremember').checked=true;
      if(items.pm_user)$('pushuser').value=items.pm_user;
      if(items.pm_secret)$('pushsecret').value=items.pm_secret;
    }
    describeWhere();
    if(items.pm_lastServer&&items.pm_remember&&loginFilled())connect();
  });
}catch(err){if(window.console)console.error('push module',err);}
})();
/* @endregion: push */
