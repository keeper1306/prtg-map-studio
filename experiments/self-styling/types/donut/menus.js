  /* the Donut menu, as in Map Studio's floating bar (plus the middle and the gap from its side panel) */
  function typeMenus(U){
    U.menu(U.r1,'Donut',function(pop){
      U.pfSelect(pop,'Shows',[['all','All sensor states'],['alarms','Alarms only']],'mode');
      U.pfSelect(pop,'Legend',[['right','Right of the ring'],['below','Below the ring'],['none','No legend']],'legend');
      U.pfSelect(pop,'In the middle',[['total','Number of sensors'],['percentup','Percent up'],['none','Nothing']],'center');
      var w=U.pf(pop,'Caption under the number (empty = Map Studio’s)'), i=el('input','ps');i.type='text';i.maxLength=24;w.appendChild(i);
      i.addEventListener('change',function(){U.d.caption=i.value;U.change();});U.syncs.push(function(){i.value=U.E().caption||'';});
      U.pfRange(pop,'Ring thickness','thick',6,60,' %');
      U.pfRange(pop,'Gap between slices','gap',0,10,'');
      U.pfCheck(pop,'Hide states with zero','hideZero');
      U.pfCheck(pop,'Show the counts','showCounts');
    });
  }
