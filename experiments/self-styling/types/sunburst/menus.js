  /* the Sunburst menu, as in Map Studio's floating bar (PRTG classic left out: it is PRTG's own drawing, other markup) */
  function typeMenus(U){
    U.menu(U.r1,'Sunburst',function(pop){
      pfPics(U,pop,'Style',[['solid','Solid'],['gaps','Separated'],['glow','Glow'],['pastel','Soft pastel']],EXP.sbFaceSvg,'face');
      U.pfCheck(pop,'Size by number of sensors','sizeSensors');
      U.pfCheck(pop,'Size by priority','sizePriority');
      U.pfCheck(pop,'Hide paused devices','hidePaused');
      U.pfSelect(pop,'In the middle',EXP.SBCENTERS,'center');
      U.pfSelect(pop,'Legend',[['right','Right of the ring'],['below','Below the ring'],['none','No legend']],'legend');
      U.pfRange(pop,'Hole in the middle','hole',0,70,' %');
      U.pfRange(pop,'Rings shown (0 = all)','depth',0,8,'');
      U.pfCheck(pop,'Names on the slices','labels');
      U.pfCheck(pop,'Slices are links to PRTG','links');
    },'shotsw');
  }
