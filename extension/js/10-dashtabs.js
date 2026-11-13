
/* @region: dashtabs -- the Dashboard tab's sections are regrouped into four tabs (names and grouping in config, dashTabs). Nothing inside a section changes. */
(function dashTabs(){
try{
  var dp=document.getElementById('dashpanel'), mb=document.getElementById('modebar'), eb=document.getElementById('editbar');
  if(!dp||!mb)return;
  var DT=CFG.dashTabs, MAP={}, FOLD={}, FOLDOPEN={}, DTABS=DT.tabs.map(function(t){MAP[t.id]=t.sections;return [t.id,t.icon,t.label];});
  DT.fold.forEach(function(n){FOLD[n]=1;});
  DT.foldOpen.forEach(function(n){FOLDOPEN[n]=1;});
  var bars={}, panes={}, btns={}, cur=DT.start;
  [].forEach.call(dp.querySelectorAll(':scope > .secfs'),function(fs){var t=fs.querySelector(':scope > .advbar .sectitle');if(t)bars[t.textContent]=fs;});
  DTABS.forEach(function(t){
    var d=document.createElement('div');d.className='dpane'+(t[0]===cur?' on':'');d.id='dpane-'+t[0];
    MAP[t[0]].forEach(function(title){var fs=bars[title];if(!fs)return;if(!FOLD[title]&&!FOLDOPEN[title])fs.classList.add('flat');d.appendChild(fs);if(FOLDOPEN[title]){var ob=fs.querySelector(':scope > .advbar');if(ob&&ob.getAttribute('aria-expanded')!=='true')ob.click();}});
    dp.appendChild(d);panes[t[0]]=d;
  });
  /* the Design step's tools sit under the header: keep their sticky offset equal to the header's height, and keep the map
     background settings (opened from the Background tool) out of that fixed block, with the settings that scroll */
  (function(){
    var setH=function(){document.documentElement.style.setProperty('--mbh',(mb.offsetHeight||0)+'px');};
    setH();try{new ResizeObserver(setH).observe(mb);}catch(e){window.addEventListener('resize',setH);}
    /* and the tools' own height, for what sticks under them (the PRTG Server Objects category buttons) */
    var tools=document.querySelector('#dpane-add > .secfs');
    var setT=function(){var hh=tools?tools.getBoundingClientRect().height:0;if(hh>0)document.documentElement.style.setProperty('--tbh',Math.round(hh)+'px');};
    if(tools){setT();try{new ResizeObserver(setT).observe(tools);}catch(e){}}
    /* the category buttons stay pinned only while header, tools and buttons together leave at least 40% of the panel to scroll */
    var pnl=document.getElementById('panel');
    var chipStick=function(){
      var c=document.getElementById('objchips');if(!c||!pnl)return;
      var need=(mb.offsetHeight||0)+(tools?tools.getBoundingClientRect().height:0)+c.offsetHeight;
      c.classList.toggle('nostick',need>pnl.clientHeight*0.6);
    };
    try{var ro=new ResizeObserver(chipStick);ro.observe(mb);if(tools)ro.observe(tools);if(pnl)ro.observe(pnl);var oc=document.getElementById('objchips');if(oc)ro.observe(oc);}catch(e){window.addEventListener('resize',chipStick);}
    var bgp=document.getElementById('bgpanel'), bfs=bgp&&bgp.closest('fieldset');
    if(bgp&&bfs&&bfs.parentNode){var hold=document.createElement('div');hold.className='bghold';hold.appendChild(bgp);bfs.parentNode.insertBefore(hold,bfs.nextSibling);}
  })();
  var row=document.createElement('div');row.id='dtabs';row.setAttribute('role','tablist');
  DTABS.forEach(function(t){
    var b=document.createElement('button');b.type='button';b.setAttribute('role','tab');
    b.innerHTML='<span class="dti">'+t[1]+'</span>'+t[2]+(t[0]==='add'?'<span class="dtn"></span>':'');
    b.addEventListener('click',function(){show(t[0]);});
    row.appendChild(b);btns[t[0]]=b;
  });
  mb.insertBefore(row,eb||null);
  /* steps unlock in order: Map after connecting, Design and Push once a map is chosen */
  var ORDER=DTABS.map(function(t){return t[0];});
  function pst(){return window.PRTGSTATE||{connected:false,map:false};}
  function allowed(k){return k==='map'||!!pst().map;}
  function refresh(){
    ORDER.forEach(function(k,i){
      var ok=allowed(k);
      btns[k].disabled=!ok;
      btns[k].classList.toggle('done',ok&&i<ORDER.indexOf(cur));
    });
  }
  function show(k){
    if(!panes[k]||!allowed(k))return;
    cur=k;
    DTABS.forEach(function(t){var on=t[0]===k;panes[t[0]].classList.toggle('on',on);btns[t[0]].classList.toggle('on',on);btns[t[0]].setAttribute('aria-selected',on?'true':'false');});
    refresh();
    if(window.SECAPI)try{document.dispatchEvent(new CustomEvent('secopen',{detail:{fs:panes[k]}}));}catch(e){}
  }
  document.addEventListener('prtgstate',function(){if(!allowed(cur))show('map');refresh();});
  [].forEach.call(document.querySelectorAll('#dashpanel [data-goto]'),function(b){b.addEventListener('click',function(){show(b.getAttribute('data-goto'));});});
  document.addEventListener('gotodashtab',function(e){var k=e&&e.detail;if(k&&panes[k])show(k);});
  /* the same line icons the Objects tab uses, on the Build buttons */
  (function(){
    function sv(p){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+p+'</svg>';}
    var IC={
      frame:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
      label:'<path d="M5 6h14M12 6v13M9 19h6"/>',
      button:'<rect x="3" y="8" width="18" height="9" rx="4.5"/><path d="M8 12.5h8"/>',
      bg:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 17l9-9M8 12l4-4M13 17l4-4"/>',
      shape:'<path d="M3 9.5h10V6l8 6-8 6v-3.5H3z"/>',
      connector:'<circle cx="4" cy="6" r="2"/><circle cx="20" cy="18" r="2"/><path d="M6 6h5a3 3 0 0 1 3 3v3a3 3 0 0 0 3 3h3"/>',
      banner:'<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 12h12"/>',
      fence:'<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="M8 3v2M16 3v2M21 8h-2M21 16h-2M3 8h2M3 16h2"/>',
      fline:'<path d="M3 18c4 0 4-6 9-6s5-6 9-6"/>',
      existing:'<rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><path d="M8 7h.01M8 17h.01"/>'
    };
    [].forEach.call(document.querySelectorAll('#dashpanel .addgrid .btn'),function(b){
      var k=b.getAttribute('data-add')||'existing';
      if(b.classList.contains('bgpick')){b.insertAdjacentHTML('afterbegin',sv(IC.bg));return;}
      if(IC[k])b.innerHTML=sv(IC[k])+'<span>'+b.textContent+'</span>';
    });
  })();
  /* the PRTG Server Objects section is shown by the sixth button under Build */
  (function(){
    var fs=document.getElementById('objfs'), btn=document.getElementById('showexisting');
    if(!fs||!btn)return;
    fs.classList.add('folded');
    btn.addEventListener('click',function(){
      var open=fs.classList.contains('folded');
      fs.classList.toggle('folded',!open);btn.classList.toggle('on',open);btn.setAttribute('aria-expanded',open?'true':'false');
      if(open){try{document.dispatchEvent(new CustomEvent('secopen',{detail:{fs:fs}}));fs.scrollIntoView({block:'nearest'});}catch(e){}}
    });
  })();
  /* Build tiles: one click arms a tile and the next click on the canvas places it; a double-click adds it at the default spot; a tile can also be dragged onto the canvas */
  (function(){
    var grid=document.querySelector('#dashpanel .addgrid'), wrapEl=document.getElementById('dwrap');
    if(!grid||!wrapEl||!window.DASHAPI||!DASHAPI.addAt)return;
    var NAMES={frame:'frame',label:'label',button:'button',banner:'banner',bg:'background',shape:'shape',connector:'connector',fence:'fence',fline:'line'}, armed=null, tiles=[].slice.call(grid.querySelectorAll('[data-add]'));
    var hint=document.createElement('p');hint.id='addhint';hint.className='note pst';
    var base='';   /* the tiles' own tooltips explain how to add; the line shows only while a tile is armed */
    hint.textContent=base;hint.hidden=true;grid.parentNode.insertBefore(hint,grid.nextSibling);
    function arm(type){
      armed=type;
      tiles.forEach(function(t){t.classList.toggle('armed',t.getAttribute('data-add')===type);});
      wrapEl.classList.toggle('placing',!!type);
      hint.classList.toggle('on',!!type);
      hint.hidden=!type;
      hint.textContent=type?('Click on the canvas to place the '+NAMES[type]+'. Esc cancels.'):base;
    }
    function added(){try{document.dispatchEvent(new CustomEvent('builditemadded'));}catch(e){}}
    /* choosing any tile other than PRTG Server Objects closes that section */
    function hideExisting(){var fs=document.getElementById('objfs'), bt=document.getElementById('showexisting');if(fs&&!fs.classList.contains('folded')){fs.classList.add('folded');if(bt){bt.classList.remove('on');bt.setAttribute('aria-expanded','false');}}}
    /* the Background tile shows the color choices for the map's own background, and any other tile closes them */
    var bgBtn=document.getElementById('mapbgbtn'), bgPanel=document.getElementById('bgpanel');
    function bgShow(on){if(!bgBtn||!bgPanel)return;bgPanel.hidden=!on;bgBtn.classList.toggle('on',on);bgBtn.setAttribute('aria-expanded',on?'true':'false');}
    if(bgBtn)bgBtn.addEventListener('click',function(e){e.stopPropagation();arm(null);hideExisting();bgShow(bgPanel.hidden);});
    var exBtn2=document.getElementById('showexisting');if(exBtn2)exBtn2.addEventListener('click',function(){bgShow(false);});
    /* capture on the grid so the tool's own one-click add does not also run */
    grid.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('[data-add]');if(!b||!grid.contains(b))return;
      e.stopPropagation();
      var type=b.getAttribute('data-add');
      hideExisting();bgShow(false);
      if(e.detail>=2){arm(null);fromCanvas=0;DASHAPI.add(type);added();return;}   /* the second click of a double-click */
      arm(armed===type?null:type);
    },true);
    /* the next press on the canvas places the armed item, even on top of another item */
    wrapEl.addEventListener('mousedown',function(e){
      if(!armed||e.button!==0)return;
      e.preventDefault();e.stopPropagation();
      var type=armed;arm(null);
      fromCanvas=0;   /* placing is not selecting: stay on the Add tab */
      DASHAPI.addAt(type,e.clientX,e.clientY);added();
    },true);
    document.addEventListener('keydown',function(e){if(armed&&e.key==='Escape')arm(null);});
    ['mObj','dtabs'].forEach(function(id){var n=document.getElementById(id);if(n)n.addEventListener('click',function(ev){if(id==='mObj'||(ev.target.closest&&ev.target.closest('button')))arm(null);});});
    /* drag a tile onto the canvas */
    var MIME='application/x-build-item';
    tiles.forEach(function(t){
      t.draggable=true;
      t.addEventListener('dragstart',function(e){
        hideExisting();arm(null);
        try{e.dataTransfer.setData(MIME,t.getAttribute('data-add'));e.dataTransfer.setData('text/plain',NAMES[t.getAttribute('data-add')]);e.dataTransfer.effectAllowed='copy';}catch(x){}
      });
    });
    function isBuild(e){var ty=e.dataTransfer&&e.dataTransfer.types;return !!ty&&[].indexOf.call(ty,MIME)>=0;}
    wrapEl.addEventListener('dragover',function(e){if(!isBuild(e))return;e.preventDefault();try{e.dataTransfer.dropEffect='copy';}catch(x){}wrapEl.classList.add('dropping');});
    wrapEl.addEventListener('dragleave',function(e){if(isBuild(e)&&(!e.relatedTarget||!wrapEl.contains(e.relatedTarget)))wrapEl.classList.remove('dropping');});
    wrapEl.addEventListener('drop',function(e){
      if(!isBuild(e))return;
      e.preventDefault();wrapEl.classList.remove('dropping');
      var type=e.dataTransfer.getData(MIME);if(!NAMES[type])return;
      fromCanvas=0;
      DASHAPI.addAt(type,e.clientX,e.clientY);added();
    });
  })();
  /* the Selected bar is gone: the selected item's settings sit under the Build tiles, headed by the item's own name, and only while something is selected */
  (function(){
    var sf=bars['Selected'];if(!sf)return;
    sf.classList.add('nobar');sf.hidden=true;
    var of2=document.getElementById('objfs'), obt=document.getElementById('showexisting'), fromCv=false;
    /* the list of PRTG Server Objects and the selected item's settings never show together: opening the list hides the settings,
       and picking an item on the canvas closes the list */
    function sync(){var s=null;try{s=window.DASHAPI&&DASHAPI.selected&&DASHAPI.selected();}catch(e){}sf.hidden=!s||!!(of2&&!of2.classList.contains('folded'));}
    function closeList(){if(of2&&!of2.classList.contains('folded')){of2.classList.add('folded');if(obt){obt.classList.remove('on');obt.setAttribute('aria-expanded','false');}}}
    var cvw=document.getElementById('dwrap');
    if(cvw)cvw.addEventListener('mousedown',function(){fromCv=true;setTimeout(function(){fromCv=false;},400);},true);
    document.addEventListener('dashselect',function(){
      var s=null;try{s=window.DASHAPI&&DASHAPI.selected&&DASHAPI.selected();}catch(e){}
      if(fromCv&&s)closeList();
      sync();
    });
    if(of2)try{new MutationObserver(sync).observe(of2,{attributes:true,attributeFilter:['class']});}catch(e){}
    sync();
  })();
  /* Build has no title bar (the tiles say what they are); PRTG Server Objects shows a plain title like the other items do */
  (function(){
    var bf=bars['Build'];if(bf)bf.classList.add('nobar');
    var of=bars['PRTG Server Objects'];
    if(of){
      of.classList.add('nobar');
      var t=document.createElement('h4');t.className='ftitle';t.textContent='PRTG Server Objects';
      var bar=of.querySelector(':scope > .advbar');of.insertBefore(t,bar?bar.nextSibling:of.firstChild);
    }
  })();
  /* the Canvas section is a button at the top of the canvas that unfolds its three parts */
  (function(){
    var cv=bars['Canvas'], head=document.querySelector('#dashstage .undoredo'), det=cv?[].slice.call(cv.querySelectorAll('details.subsec')):[];
    if(!cv||!head||!det.length)return;
    var pop=document.createElement('div');pop.id='dcanvaspop';pop.hidden=true;
    det.forEach(function(d){pop.appendChild(d);});
    cv.style.display='none';   /* its note still counts the items for the Design tab */
    ['mousedown','click','dblclick','keydown'].forEach(function(ev){pop.addEventListener(ev,function(e){e.stopPropagation();});});
    var btn=document.createElement('button');btn.type='button';btn.id='dcanvasbtn';btn.className='ico txt';btn.setAttribute('data-tip','Canvas size, zoom, items and saved layouts');
    btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14"/></svg><span>Canvas</span><small id="dcanvassize"></small>';
    head.insertBefore(btn,head.firstChild);head.appendChild(pop);
    var szEl=btn.querySelector('#dcanvassize');
    function szSync(w,h){
      if(!(w>0&&h>0)){w=parseInt(document.getElementById('dw').value,10);h=parseInt(document.getElementById('dh').value,10);}
      if(w>0&&h>0){szEl.textContent=w+' \u00D7 '+h;btn.title='Canvas size: '+w+' \u00D7 '+h+' px';}
    }
    document.addEventListener('dsize',function(e){szSync(e.detail.w,e.detail.h);});szSync();
    function close(){pop.hidden=true;btn.classList.remove('on');}
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      if(pop.hidden){pop.hidden=false;btn.classList.add('on');if(!pop.querySelector('details[open]')&&det[1])det[1].open=true;}else close();
    });
    document.addEventListener('mousedown',function(e){if(!pop.hidden&&!pop.contains(e.target)&&!btn.contains(e.target))close();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!pop.hidden)close();});
  })();
  show(cur);refresh();
  /* sections without a fold are opened once and cannot be closed */
  Object.keys(bars).forEach(function(title){
    if(FOLD[title])return;
    var bar=bars[title].querySelector(':scope > .advbar');
    if(bar&&!bar.classList.contains('open'))bar.click();
  });
  /* count badge on Layers, taken from the "Items on the canvas" note */
  (function(){
    var note=bars['Canvas']&&bars['Canvas'].querySelector('.secnote'), badge=btns.add.querySelector('.dtn');
    if(!note||!badge)return;
    function sync(){var m=/^(\d+)/.exec(note.textContent);badge.textContent=m?m[1]:'';}
    new MutationObserver(sync).observe(note,{childList:true,characterData:true,subtree:true});sync();
  })();
  /* clicking an item on the canvas opens the Selected tab */
  var fromCanvas=0, lastSel=null, stage=document.getElementById('dashstage');
  if(stage)stage.addEventListener('pointerdown',function(){fromCanvas=Date.now();},true);
  document.addEventListener('dashselect',function(){
    var s=null;try{s=window.DASHAPI&&DASHAPI.selected&&DASHAPI.selected();}catch(e){}
    var id=s?s.id:null;
    if(id!==null&&id!==lastSel&&Date.now()-fromCanvas<DT.canvasClickMs){show('add');setTimeout(function(){try{bars['Selected'].scrollIntoView({block:'nearest'});}catch(e){}},0);}
    lastSel=id;
  });
  var pg=document.getElementById('pushgo');if(pg&&pg.parentNode)pg.parentNode.classList.add('stickyfoot');   /* Push stays in view at the bottom of the panel */
  /* the Review changes strip opens the Add tab, where the changes to items already on the map are reviewed (the Existing PRTG maps section) */
  var rev=document.getElementById('exbarrev');
  if(rev)rev.addEventListener('click',function(){show('map');},true);
}catch(err){if(window.console)console.error('dashboard tabs',err);}
})();
/* @endregion: dashtabs */
