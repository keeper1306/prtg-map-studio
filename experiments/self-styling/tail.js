  /* ---------- start ---------- */
  R.apply=apply;R.openFn=openBar;
  apply(R.open&&R.draft?R.draft:savedRaw());
  if(window.MutationObserver){
    var mq=false, mo=new MutationObserver(function(){
      if(mq)return;mq=true;
      setTimeout(function(){mq=false;if(!document.documentElement.contains(root)){mo.disconnect();return;}wrapStatus();
        if(dataOk===false)fallbackCss(eff(clean(R.open&&R.draft?R.draft:savedRaw())));},300);
    });
    mo.observe(root,{childList:true,subtree:true});
  }
  if(inPreview()||inDesigner())return;
  if(isPublic()&&!readShared().publicGear)return;
  var g=el('button','mst-gear',GEAR,document);g.type='button';g.title='Change how this table looks';g.setAttribute('aria-label','Change how this table looks');
  ['mousedown','dblclick'].forEach(function(ev){g.addEventListener(ev,function(e){e.stopPropagation();});});
  g.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(barHost()){closeBar(false);apply(savedRaw());}else openBar();});
  root.appendChild(g);
  if(R.open&&!barHost())openBar();
  else if(R.open)root.classList.add('mst-open');
})();
