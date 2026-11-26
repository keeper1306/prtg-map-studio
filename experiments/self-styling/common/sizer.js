  /* ---------- the selection outline: drag a handle to change the item's size (saved with "Save for everyone") ---------- */
  /* PRTG's tooltip (the object's name) opens over a small object and covered its handles: while the outline shows, tooltips let the
     pointer through */
  var SELCSS='html.mst-sizing .tooltip{pointer-events:none !important}'+
    '.mst-sel{position:absolute;box-sizing:border-box;border:1.5px solid #1A9FD9;pointer-events:none;z-index:2147483000}'+
    '.mst-sel i{position:absolute;width:10px;height:10px;margin:-6px 0 0 -6px;box-sizing:border-box;border:1.5px solid #1A9FD9;border-radius:50%;background:#fff;pointer-events:auto;touch-action:none}'+
    '.mst-sel i:hover{background:#E6F3FA}'+
    '.mst-sel b{position:absolute;left:50%;top:100%;transform:translate(-50%,8px);padding:2px 7px;border-radius:4px;background:#0E7CB0;color:#fff;font:600 11px/1.4 "Segoe UI",Roboto,Arial,sans-serif;white-space:nowrap;pointer-events:none}';
  var SELH=[['nw',0,0],['n',.5,0],['ne',1,0],['e',1,.5],['se',1,1],['s',.5,1],['sw',0,1],['w',0,.5]];
  function selId(){return 'mst-sel-'+KEY.replace(/[^\w-]/g,'_');}
  function selRemove(){var o=document.getElementById(selId());if(o)o.remove();if(!document.querySelector('.mst-sel'))document.documentElement.classList.remove('mst-sizing');}
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
    document.documentElement.classList.add('mst-sizing');
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

