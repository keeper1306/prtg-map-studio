
/* @region: info -- a small "i" beside each section or heading that has notes; hover it for a second (or tab to it) to read them */
(function infoModule(){
try{
  var tip=null, timer=null, hider=null;
  function $(id){return document.getElementById(id);}
  function mkTip(){
    tip=document.createElement('div');tip.id='infotip';tip.hidden=true;tip.setAttribute('role','tooltip');document.body.appendChild(tip);
    tip.addEventListener('mouseenter',function(){clearTimeout(hider);});
    tip.addEventListener('mouseleave',function(){hideSoon();});
  }
  /* a note counts when nothing between it and its owner hides it (a folded section does not hide it) */
  function hidden(n,owner){
    var e=n;
    while(e&&e!==owner){
      if(e.hidden||(e.style&&e.style.display==='none')){if(!(e.classList&&e.classList.contains('secbody')&&e.parentNode===owner))return true;}
      e=e.parentNode;
    }
    return false;
  }
  function notesOf(owner){
    var list=[], out=[], i, s;
    if(owner.classList.contains('secfs'))list=owner.querySelectorAll('p.note:not(.pst)');
    else if(owner.classList.contains('stage-head')){s=owner.nextElementSibling;while(s&&!s.classList.contains('stage-head')){if(s.matches('p.note:not(.pst)'))list.push(s);s=s.nextElementSibling;}}
    else if(owner.classList.contains('legtitle'))list=owner.parentNode.querySelectorAll(':scope > p.note:not(.pst)');
    for(i=0;i<list.length;i++){if(!hidden(list[i],owner)&&list[i].textContent.trim())out.push(list[i]);}
    return out;
  }
  function mkIcon(owner){
    var ic=document.createElement('span');
    ic.className='infoi';ic.textContent='i';ic.tabIndex=0;ic.setAttribute('role','img');ic.setAttribute('aria-label','Information');ic._owner=owner;
    ['mousedown','click'].forEach(function(ev){ic.addEventListener(ev,function(e){e.stopPropagation();});});
    return ic;
  }
  function place(ic,box){
    var r=ic.getBoundingClientRect(), w=box.offsetWidth, h=box.offsetHeight, x=Math.min(Math.max(8,r.left-8),window.innerWidth-w-8), y=r.bottom+8;
    if(y+h>window.innerHeight-8)y=Math.max(8,r.top-h-8);
    box.style.left=x+'px';box.style.top=y+'px';
  }
  function show(ic){
    var ns=notesOf(ic._owner);
    if(!ns.length)return;
    if(!tip)mkTip();
    tip.textContent='';
    ns.forEach(function(n){
      var d=document.createElement('div'), c=n.cloneNode(true);
      d.className='tipitem';c.removeAttribute('id');c.className='tipnote';c.hidden=false;c.style.display='';
      [].forEach.call(c.querySelectorAll('[id]'),function(x){x.removeAttribute('id');});
      d.appendChild(c);tip.appendChild(d);
    });
    tip.hidden=false;place(ic,tip);
  }
  function hide(){if(tip)tip.hidden=true;}
  function hideSoon(){clearTimeout(hider);hider=setTimeout(hide,200);}
  function refresh(){
    [].forEach.call(document.querySelectorAll('#panel .secfs'),function(fs){
      var bar=fs.querySelector(':scope > .advbar'), ic, n;
      if(!bar)return;
      n=notesOf(fs).length;ic=bar.querySelector(':scope > .infoi');
      if(n&&!ic){ic=mkIcon(fs);bar.appendChild(ic);}
      if(ic)ic.classList.toggle('none',!n);
    });
    [].forEach.call(document.querySelectorAll('.stage-head, #legtype .legtitle'),function(sh){
      var host=sh.classList.contains('legtitle')?sh:sh.querySelector('h2'), ic, n;
      if(!host)return;
      n=notesOf(sh).length;ic=host.querySelector(':scope > .infoi');
      if(n&&!ic){ic=mkIcon(sh);ic.classList.add('inl');host.appendChild(ic);}
      if(ic)ic.classList.toggle('none',!n);
    });
  }
  var later=null;
  function soon(){clearTimeout(later);later=setTimeout(refresh,150);}
  document.addEventListener('mouseover',function(e){
    var ic=e.target.closest&&e.target.closest('.infoi');
    if(!ic||ic.classList.contains('none'))return;
    clearTimeout(hider);clearTimeout(timer);
    timer=setTimeout(function(){show(ic);},CFG.info.delay);
  });
  document.addEventListener('mouseout',function(e){
    var ic=e.target.closest&&e.target.closest('.infoi');
    if(!ic)return;
    clearTimeout(timer);hideSoon();
  });
  document.addEventListener('focusin',function(e){var ic=e.target.closest&&e.target.closest('.infoi');if(ic&&!ic.classList.contains('none')){clearTimeout(hider);show(ic);}});
  document.addEventListener('focusout',function(e){if(e.target.closest&&e.target.closest('.infoi'))hide();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')hide();});
  document.addEventListener('click',soon);
  new MutationObserver(soon).observe($('panel'),{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','style']});
  refresh();
  window.INFOAPI={refresh:refresh,notes:notesOf};
}catch(err){if(window.console)console.error('info icons',err);}
})();
/* @endregion: info */
