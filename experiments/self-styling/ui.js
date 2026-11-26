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
    R.open=false;if(!keepDraft)R.draft=null;
    var r=liveRoot();if(r)r.classList.remove('mst-open');
  }
  function reopen(){closeBar(true);if(R.openFn)R.openFn();else openBar();}
  /* where the table is on the top page */
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
    liveRoot().classList.add('mst-open');
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
        if(writeLocal(mine)){say('Saved on this '+(pub?'screen':'browser')+' only.','ok');R.savedSig=sig(d);dirtyShow();}
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
    function dirtyShow(){var dirty=sig(d)!==R.savedSig;saveBtn.classList.toggle('dirty',dirty);saveBtn.title=dirty?'Changes not saved yet':'';}
    sync();

    /* keep the bar next to the table: above it, or below it, or over it when neither has room */
    function place(){
      if(!host.isConnected)return;
      var rt=topRect(), vw=view.innerWidth, vh=view.innerHeight, bw=bar.offsetWidth, bh=bar.offsetHeight, y, xx;
      if(rt.top-bh-10>=8)y=rt.top-bh-10;else if(rt.bottom+10+bh<=vh-8)y=rt.bottom+10;else y=Math.max(8,rt.top+8);
      xx=Math.min(Math.max(8,rt.left),Math.max(8,vw-bw-8));
      bar.style.left=Math.round(xx)+'px';bar.style.top=Math.round(y)+'px';
    }
    place();
    var tick=setInterval(function(){
      if(!host.isConnected){clearInterval(tick);return;}
      if(!document.documentElement.contains(liveRoot())&&!R.apply){closeBar(true);return;}
      if(!openPop)place();
    },300);
    host.__stop=function(){clearInterval(tick);TOPDOC.removeEventListener('mousedown',outside,true);TOPDOC.removeEventListener('keydown',keys,true);};
    function outside(e){if(openPop&&!(e.composedPath&&e.composedPath().indexOf(host)>=0))closePops();}
    function keys(e){if(e.key==='Escape'&&openPop){closePops();e.stopPropagation();}}
    TOPDOC.addEventListener('mousedown',outside,true);TOPDOC.addEventListener('keydown',keys,true);
    ['mousedown','click','dblclick','keydown','wheel'].forEach(function(ev){host.addEventListener(ev,function(e){e.stopPropagation();});});
  }

