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

  /* the Chart menu's pictures: each style drawn by the graph engine itself with sample data, in this graph's look and colours */
  var SHOTS={key:'',svg:{}};
  function shots(c){
    var key=JSON.stringify([c.look,c.set,c.series,c.ov,c.lw,c.fillA,c.dots,c.gridOn,c.bradius,c.maxCh,c.font]);
    if(SHOTS.key===key)return SHOTS.svg;
    var out={}, host=document.createElement('div'), RO=window.ResizeObserver;
    host.style.cssText='position:fixed;left:-10000px;top:0;width:210px;height:82px;visibility:hidden;font-family:'+fontStack(c.font)+';';
    document.body.appendChild(host);
    try{
      window.ResizeObserver=undefined;   /* a picture is drawn once: no watcher is left behind */
      CSTYLES.forEach(function(x){
        var gc=graphCfg(mix(c,{cstyle:x[0],axis:false,legend:false,names:'',flex:false,size:13}));
        gc.sample=true;gc.sampleN=(x[0]==='heatmap'||x[0]==='ring'||x[0]==='band')?0:18;gc.tips=false;gc.refresh=0;gc.legendValues=false;
        host.innerHTML='<div><div class="gown" style="width:210px;height:82px"></div></div>';
        try{graphRuntime(host.firstChild,gc);var sv=host.querySelector('svg');
          out[x[0]]=sv?'<span style="display:block;width:100%;height:100%;background:'+gc.card+'">'+sv.outerHTML.replace(/ width="[^"]*" height="[^"]*"/,' width="100%" height="100%"')+'</span>':'';}catch(e){out[x[0]]='';}
      });
    }finally{window.ResizeObserver=RO;if(host.parentNode)host.parentNode.removeChild(host);}
    SHOTS={key:key,svg:out};return out;
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
    menu(r1,'Chart',function(pop){
      var w=pf(pop,'Chart style'), g=el('div','shots');w.appendChild(g);
      CSTYLES.forEach(function(o){var b=el('button','shot','<i></i><span>'+esc(o[1])+'</span>');b.type='button';b.setAttribute('data-v',o[0]);b.title=o[1];
        b.addEventListener('click',function(){d.cstyle=o[0];change();sync();});g.appendChild(b);});
      syncs.push(function(){
        [].forEach.call(g.children,function(b){b.classList.toggle('on',b.getAttribute('data-v')===E().cstyle);});
        var p=shots(E());[].forEach.call(g.children,function(b){var i=b.firstChild,h=p[b.getAttribute('data-v')]||'';if(i.__h!==h){i.__h=h;i.innerHTML=h;}});
      });
      pfSeg(pop,'Time span',PERIODS,'period');
    },'shotsw');
    menu(r1,'Channels',function(pop){
      note(pop,'Tick the channels to draw. None ticked = the ones that change most.');
      var box=el('div','colist');pop.appendChild(box);box.appendChild(el('div','note','Asking PRTG for the channels…'));
      var w=pf(pop,'Or type parts of their names (comma separated)'), t=el('input','ps');t.type='text';t.maxLength=200;w.appendChild(t);
      t.addEventListener('change',function(){d.names=t.value;change();sync();});syncs.push(function(){t.value=E().names||'';});
      var wm=pf(pop,'At most this many channels'), mx=el('input','ps');mx.type='number';mx.min=1;mx.max=10;wm.appendChild(mx);
      mx.addEventListener('change',function(){var n=int(mx.value,1,10);if(n===undefined){mx.value=E().maxCh;return;}d.maxCh=n;change();});
      syncs.push(function(){mx.value=E().maxCh;});
      channels().then(function(list){
        box.innerHTML='';
        if(!list.length){box.appendChild(el('div','note','PRTG did not list the channels here. Type their names instead.'));return;}
        list.forEach(function(nm){
          var r=el('label','pc','<input type="checkbox"><span>'+esc(nm)+'</span>'), c=r.querySelector('input');
          function picked(){return (E().names||'').split(',').map(function(x){return x.trim().toLowerCase();}).filter(Boolean);}
          c.addEventListener('change',function(){
            var p=picked().filter(function(x){return x!==nm.toLowerCase();});if(c.checked)p.push(nm.toLowerCase());
            d.names=p.join(', ');if(c.checked&&p.length>E().maxCh)d.maxCh=Math.min(10,p.length);change();sync();
          });
          syncs.push(function(){c.checked=picked().indexOf(nm.toLowerCase())>=0;});
          box.appendChild(r);
        });
        sync();
      });
    });
    menu(r1,'Lines and bars',function(pop){
      pfRange(pop,'Line width','lw',1,6);
      var w=pf(pop,'Fill strength'), g=el('div','rg','<input type="range" min="0" max="80" step="1"><output></output>');w.appendChild(g);
      var i=g.querySelector('input'), o=g.querySelector('output');
      i.addEventListener('input',function(){d.fillA=parseInt(i.value,10);o.textContent=d.fillA+' %';change();});
      syncs.push(function(){i.value=E().fillA;o.textContent=E().fillA+' %';});
      pfRange(pop,'Bar corners','bradius',0,12);
      pfCheck(pop,'Dots on the line','dots');
      pfCheck(pop,'Grid lines','gridOn');
      pfCheck(pop,'Axis numbers','axis');
      pfCheck(pop,'Legend','legend');
      pfCheck(pop,'Values in the legend','legendValues');
    });
    menu(r1,'Colors',function(pop){
      pfSelect(pop,'Status colours (warning and down lines, threshold colours)',Object.keys(SETS).map(function(k){return [k,SETS[k][0]];}),'set');
      pfSeg(pop,'Lines take',[['look','The look’s accent first'],['status','The status colours']],'series');
      pop.appendChild(el('div','ph','Each line on its own'));
      var g=el('div','cols2');pop.appendChild(g);
      [0,1,2,3,4].forEach(function(i){
        var w=el('label','sw','<input type="color"><span>Line '+(i+1)+'</span>'), inp=w.querySelector('input');
        inp.addEventListener('input',function(){var l=(E().lineCols||[]).slice();while(l.length<5)l.push('');l[i]=inp.value;d.lineCols=l;change();});
        syncs.push(function(){inp.value=seriesColors(E())[i]||'#888888';});g.appendChild(w);
      });
      var rb=el('button','mini','Lines back to the look’s colours');rb.type='button';pop.appendChild(rb);
      rb.addEventListener('click',function(){delete d.lineCols;change();sync();});
      pop.appendChild(el('div','ph','Or each colour of the look on its own'));
      OV.forEach(function(o){
        pfColor(pop,o[1],function(){var e=E(), L=LOOKS[e.look];return (e.ov&&e.ov[o[0]])||(o[0]==='grid'?gridOf(L,e.ov||{}):L[o[0]])||'#000000';},
          function(v){d.ov=mix(d.ov);d.ov[o[0]]=v;},function(){if(d.ov){d.ov=mix(d.ov);delete d.ov[o[0]];}});
      });
    },'wide');
    menu(r1,'Title',function(pop){
      var w=pf(pop,'Text'), i=el('input','ps');i.type='text';i.maxLength=80;i.placeholder='The sensor’s name';w.appendChild(i);
      i.addEventListener('input',function(){d.title=i.value;change();});syncs.push(function(){if(TOPDOC.activeElement!==host)i.value=E().title||'';});
      pfSeg(pop,'Style',TSTYLES,'ts');
      pfSeg(pop,'Align',[['left','Left'],['center','Centre'],['right','Right']],'talign');
      pfRange(pop,'Size','tsize',10,30);
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
    lab(r2,'Span',sel(PERIODS,'period','s short'));
    sep(r2);
    var fxw=el('span','seg2');
    [['fixed','Fixed','Keeps its size; a smaller box shows less room for the drawing'],['flex','Flexible','Text and drawing grow and shrink with the box. The size it has now counts as normal']].forEach(function(o){
      var b=el('button','t',esc(o[1]));b.type='button';b.title=o[2];b.setAttribute('data-v',o[0]);
      b.addEventListener('click',function(){
        if(o[0]==='flex'){var lr=liveRoot();d.flex=true;d.fw=lr.clientWidth||520;d.fh=lr.clientHeight||300;}else{d.flex=false;delete d.fw;delete d.fh;}
        change();sync();
      });
      fxw.appendChild(b);
    });
    syncs.push(function(){[].forEach.call(fxw.children,function(b){b.classList.toggle('on',(b.getAttribute('data-v')==='flex')===!!E().flex);});});
    r2.appendChild(fxw);sep(r2);
    toggle(r2,'Title','showTitle','Show the title');
    toggle(r2,'Legend','legend','Show the legend');
    toggle(r2,'Axis','axis','Axis numbers');
    toggle(r2,'Grid','gridOn','Grid lines');

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

