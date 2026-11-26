  /* ---------- start ---------- */
  R.apply=apply;R.openFn=openBar;
  apply(R.open&&R.draft?R.draft:savedRaw());
  if(inPreview()||inDesigner())return;
  if(isPublic()&&!readShared().publicGear)return;
  var g=el('button','mst-gear',GEAR,document);g.type='button';g.title='Change how this graph looks';g.setAttribute('aria-label','Change how this graph looks');
  ['mousedown','dblclick'].forEach(function(ev){g.addEventListener(ev,function(e){e.stopPropagation();});});
  g.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(barHost()){closeBar(false);apply(savedRaw());}else openBar();});
  root.appendChild(g);
  if(R.open&&R.size)sizeApply();
  if(R.open&&!barHost())openBar();
  else if(R.open){root.classList.add('mst-open');if(!isPublic())selShow();}
})();
