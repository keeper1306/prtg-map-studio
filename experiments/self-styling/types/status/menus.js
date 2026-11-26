  /* the Tiles menu, as in Map Studio's floating bar */
  var SLABELS=[['up','Up'],['warning','Warning'],['down','Down'],['ack','Down (acknowledged)'],['paused','Paused'],['unusual','Unusual'],
    ['unknown','Unknown'],['total','Total'],['pctup','Percent up']];
  function typeMenus(U){
    U.menu(U.r1,'Tiles',function(pop){
      var E=U.E, d=U.d;
      U.pop=pop;U.note(pop,'Which counts to show (keep at least one).');
      var g=el('div','cols2');pop.appendChild(g);
      SLABELS.forEach(function(s){
        var w=el('label','pc','<input type="checkbox"><span>'+esc(s[1])+'</span>'), c=w.querySelector('input');
        c.addEventListener('change',function(){
          var t=(E().tiles||[]).slice(), at=t.indexOf(s[0]);
          if(c.checked&&at<0)t.push(s[0]);
          else if(!c.checked&&at>-1){if(t.length<2){c.checked=true;return;}t.splice(at,1);}
          d.tiles=t;U.change();U.sync();
        });
        U.syncs.push(function(){c.checked=(E().tiles||[]).indexOf(s[0])>-1;});g.appendChild(w);
      });
      U.pfSeg(pop,'Caption under the number',[['of','of N sensors'],['none','None']],'cap');
      U.pfCheck(pop,'Grey out the states that have none','quiet');
      U.pfSelect(pop,'Box height',[['','Fill the object'],['small','Small (64 px)'],['medium','Medium (96 px)'],['large','Large (140 px)']],'boxH');
    });
  }
