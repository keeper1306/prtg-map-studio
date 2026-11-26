  /* ---------- the bar of the new types: Looks, Colors, the type's own menu, Title; quick settings as in Map Studio's bar ---------- */
  var DETAILKEYS=['font','size','tsize','radius','shadow','border','ts','talign','ov'];
  /* a text box in a menu: the value is kept when the box loses focus or Enter is pressed (clean() checks it) */
  function pfText(U,pop,text,key,ph,max){
    var w=U.pf(pop,text), i=el('input','ps');i.type='text';i.maxLength=max||80;if(ph)i.placeholder=ph;w.appendChild(i);
    i.addEventListener('change',function(){U.d[key]=i.value;U.change();U.sync();});
    U.syncs.push(function(){if(TOPDOC.activeElement!==U.host)i.value=U.E()[key]==null?'':String(U.E()[key]);});
    return w;
  }
  /* a grid of pictures (Map Studio's own), one per choice */
  function pfPics(U,pop,text,list,pic,key,onPick){
    var w=U.pf(pop,text), g=el('div','shots');w.appendChild(g);
    list.forEach(function(f){
      var b=el('button','shot','<i>'+pic(f[0])+'</i><span>'+esc(f[1])+'</span>');b.type='button';b.setAttribute('data-v',f[0]);b.title=f[1];
      b.addEventListener('click',function(){if(onPick)onPick(f[0]);else U.d[key]=f[0];U.change();U.sync();});
      g.appendChild(b);
    });
    U.syncs.push(function(){var v=String(U.E()[key]);[].forEach.call(g.children,function(b){b.classList.toggle('on',b.getAttribute('data-v')===v);});});
    return g;
  }
  /* parts of a menu shown only for some choices */
  function showWhen(U,node,test){U.syncs.push(function(){node.style.display=test(U.E())?'':'none';});return node;}
  function barMenus(U){
    var d=U.d, E=U.E, sync=U.sync, change=U.change, syncs=U.syncs, r1=U.r1, host=U.host, menu=U.menu, pf=U.pf, pfRange=U.pfRange,
      pfCheck=U.pfCheck, pfSeg=U.pfSeg, pfSelect=U.pfSelect, pfColor=U.pfColor, note=U.note;
    if(LOOKNAMES.length)menu(r1,'Looks',function(pop){
      var g=el('div','looks');pop.appendChild(g);
      LOOKNAMES.forEach(function(n){
        var L=lookOf(n), b=el('button','lk');b.type='button';b.setAttribute('data-v',n);
        var bg=(L.mode==='prtg')?'#FFFFFF':(L.card?L.cardBg:'#F2F4F7'), top=(L.titleStyle==='bar'&&L.mode!=='prtg')?L.titleBg:bg;
        b.innerHTML='<i style="background:'+bg+'"><b style="background:'+top+'"></b><u style="top:13px;background:'+L.line+'"></u>'+
          '<u style="top:19px;background:'+(L.accent||L.link)+';right:45%"></u></i><span>'+esc(n)+'</span>';
        b.addEventListener('click',function(){DETAILKEYS.forEach(function(k){delete d[k];});d.look=n;change();sync();});
        g.appendChild(b);
      });
      syncs.push(function(){[].forEach.call(g.children,function(b){b.classList.toggle('on',b.getAttribute('data-v')===E().look);});});
      pfSelect(pop,'Shadow',KSHADOWS,'shadow');
      pfCheck(pop,'Border round the card','border');
    },'wide');
    menu(r1,'Colors',function(pop){
      pfSelect(pop,'Status colours',KSETS.map(function(s){return [s[0],s[1]];}),'set');
      note(pop,'Up, warning, down and the other states, as in Map Studio’s Colors menu.');
      pop.appendChild(el('div','ph','Or each colour of the look on its own'));
      KOV.forEach(function(o){
        pfColor(pop,o[1],function(){var e=E(), L=lookBase(e.look);return (e.ov&&e.ov[o[0]])||(/^#[0-9a-fA-F]{6}$/.test(L[o[0]]||'')?L[o[0]]:'#000000');},
          function(v){d.ov=mix(d.ov);d.ov[o[0]]=v;},function(){if(d.ov){d.ov=mix(d.ov);delete d.ov[o[0]];}});
      });
    },'wide');
    typeMenus(U);
    menu(r1,'Title',function(pop){
      var w=pf(pop,'Text'), i=el('input','ps');i.type='text';i.maxLength=80;i.placeholder='The object’s name';w.appendChild(i);
      i.addEventListener('input',function(){d.title=i.value;change();});syncs.push(function(){if(TOPDOC.activeElement!==host)i.value=E().title||'';});
      pfSeg(pop,'Style',KTS,'ts');
      pfSeg(pop,'Align',[['','As the look has it'],['left','Left'],['center','Centre'],['right','Right']],'talign');
      pfRange(pop,'Size','tsize',8,60);
      pfCheck(pop,'Title grows and shrinks with a Flexible object','tflex');
    });
  }
  function barQuick(U){
    var r2=U.r2, lab=U.lab, sel=U.sel, numBox=U.numBox, toggle=U.toggle, sep=U.sep;
    lab(r2,'Font',sel(FONTS.map(function(f){return [f[0],f[1]];}),'font','s'));
    numBox(r2,'Text','size',8,40);
    numBox(r2,'Title','tsize',8,60);
    numBox(r2,'Corners','radius',0,40);
    sep(r2);
    U.flexSeg(r2,'Keeps its size: a smaller box shows less room for the drawing',
      'Text and drawing grow and shrink with the box; the title keeps its size. The size it has now counts as normal');
    sep(r2);
    toggle(r2,'Title','showTitle','Show the title');
    if(typeof typeQuick==='function')typeQuick(U);
  }

