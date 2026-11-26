  /* ---------- the floating bar (built like Map Studio's): shared frame, Save menu and placement; each type adds its own menus ---------- */
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
  /* where the object is on the top page */
  function topRect(){
    var r=liveRoot().getBoundingClientRect(), x=r.left, y=r.top, w=window, fe;
    try{while(w!==w.top&&(fe=w.frameElement)){var f=fe.getBoundingClientRect();x+=f.left+fe.clientLeft;y+=f.top+fe.clientTop;w=w.parent;}}catch(e){}
    return {left:x,top:y,right:x+r.width,bottom:y+r.height,width:r.width,height:r.height};
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
      syncs.push(function(){s.value=String(E()[key]);});return s;
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
    function pfRange(pop,text,key,min,max,unit){
      var w=pf(pop,text), g=el('div','rg','<input type="range" min="'+min+'" max="'+max+'" step="1"><output></output>');w.appendChild(g);
      var i=g.querySelector('input'), o=g.querySelector('output'), u=unit==null?' px':unit;
      function show(){i.value=E()[key];o.textContent=E()[key]+u;}
      i.addEventListener('input',function(){d[key]=parseInt(i.value,10);o.textContent=d[key]+u;change();});
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
      syncs.push(function(){[].forEach.call(g.children,function(b){b.classList.toggle('on',b.getAttribute('data-v')===String(E()[key]));});});
      return g;
    }
    function pfSelect(pop,text,opts,key){var w=pf(pop,text), s=sel(opts,key,'ps');w.appendChild(s);return s;}
    function pfColor(pop,text,get,set,reset){
      var w=el('div','pr','<span>'+esc(text)+'</span><input type="color"><button type="button" class="cp" title="Back to the look’s colour">Look’s</button>');
      var i=w.querySelector('input');
      i.addEventListener('input',function(){set(i.value);change();});
      w.querySelector('button').addEventListener('click',function(){reset();change();sync();});
      syncs.push(function(){i.value=get();});pop.appendChild(w);
    }
    function note(pop,text){pop.appendChild(el('div','note',esc(text)));}
    /* Fixed | Flexible: Flexible remembers the size the item has now as its normal size */
    function flexSeg(row,tipFixed,tipFlex,keys){
      keys=keys||{on:'flex',w:'fw',h:'fh'};
      var w=el('span','seg2');
      [['fixed','Fixed',tipFixed],['flex','Flexible',tipFlex]].forEach(function(o){
        var b=el('button','t',esc(o[1]));b.type='button';b.title=o[2];b.setAttribute('data-v',o[0]);
        b.addEventListener('click',function(){
          if(o[0]==='flex'){var lr=liveRoot();d[keys.on]=true;d[keys.w]=lr.clientWidth||400;d[keys.h]=lr.clientHeight||300;}
          else{d[keys.on]=false;delete d[keys.w];delete d[keys.h];}
          change();sync();
        });
        w.appendChild(b);
      });
      syncs.push(function(){[].forEach.call(w.children,function(b){b.classList.toggle('on',(b.getAttribute('data-v')==='flex')===!!E()[keys.on]);});});
      row.appendChild(w);return w;
    }
    var U={d:d,E:E,sync:sync,change:change,syncs:syncs,r1:r1,r2:r2,host:host,view:view,pub:pub,sep:sep,lab:lab,numBox:numBox,toggle:toggle,sel:sel,
      menu:menu,pf:pf,pfRange:pfRange,pfCheck:pfCheck,pfSeg:pfSeg,pfSelect:pfSelect,pfColor:pfColor,note:note,flexSeg:flexSeg};

    /* ---- row 1: the type's menus, then Save and close ---- */
    barMenus(U);
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
        if(writeLocal(mine)){say('Saved on this '+(pub?'screen':'browser')+' only.'+(sizeDirty()?' A new size is kept only with “Save for everyone”.':''),'ok');R.savedSig=sig(d);dirtyShow();}
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

    /* ---- row 2: the type's quick settings ---- */
    barQuick(U);

    function sig(c){return JSON.stringify(clean(c));}
    if(R.savedSig==null)R.savedSig=sig(savedRaw());
    R.onSize=function(){dirtyShow();};
    function dirtyShow(){var dirty=sig(d)!==R.savedSig||sizeDirty();saveBtn.classList.toggle('dirty',dirty);saveBtn.title=dirty?'Changes not saved yet':'';}
    sync();

    /* keep the bar next to the object: above it, or below it, or over it when neither has room */
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
    /* a click elsewhere or Escape closes an open menu: on the top page and on the map's own page (View Map shows the map in a frame) */
    var DOCS=(document===TOPDOC)?[TOPDOC]:[TOPDOC,document];
    host.__stop=function(){clearInterval(tick);DOCS.forEach(function(dc){dc.removeEventListener('mousedown',outside,true);dc.removeEventListener('keydown',keys,true);});};
    function outside(e){if(openPop&&!(e.composedPath&&e.composedPath().indexOf(host)>=0))closePops();}
    function keys(e){if(e.key==='Escape'&&openPop){closePops();e.stopPropagation();}}
    DOCS.forEach(function(dc){dc.addEventListener('mousedown',outside,true);dc.addEventListener('keydown',keys,true);});
    ['mousedown','click','dblclick','keydown','wheel'].forEach(function(ev){host.addEventListener(ev,function(e){e.stopPropagation();});});
  }

