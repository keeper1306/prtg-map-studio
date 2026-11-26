  /* ---------- the icon: its drawing (svg) and the text next to it come from the built file; PRTG's tags in them are filled from
     what the page already has (the object's name is in the link's tooltip, which PRTG filled in) ---------- */
  function markupApply(m,t){
    var a=root.querySelector('a.pst');if(!a)return;
    var ma=/<a class="([^"]*)"/.exec(t);if(ma)a.className=ma[1];
    var ms=/<svg class="pst-ic"[\s\S]*?<\/svg>/.exec(t);
    var sv=a.querySelector('svg.pst-ic');
    if(ms&&sv&&!sv.__mssSame){
      var html=ms[0].replace(/<@itemid>/g,root.id);
      if(sv.outerHTML!==html){var tmp=document.createElement('div');tmp.innerHTML=html;var nsv=tmp.firstChild;if(nsv)a.replaceChild(nsv,sv);}
    }
    var mb=/<span class="pst-b">[\s\S]*?<\/span><\/span>/.exec(t), b=a.querySelector('.pst-b');
    if(mb){
      /* PRTG's tooltip moves the title into data-original-title once the mouse has been over it */
      var name=a.getAttribute('title')||a.getAttribute('data-original-title')||'';
      var h=mb[0].replace(/<#objectproperty(?:"[^"]*"|[^">])*>/g,function(){return esc(name);});   /* its quoted values hold <@objectid> */
      if(!b){var tmp2=document.createElement('div');tmp2.innerHTML=h;a.appendChild(tmp2.firstChild);}
      else if(b.outerHTML!==h)b.outerHTML=h;
    }else if(b)b.parentNode.removeChild(b);
  }
  /* as in Map Studio: Looks only for an icon with its card on (without a card a look would only change the status colours) */
  function lookShown(e){return !!e.card;}
