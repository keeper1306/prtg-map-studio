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

