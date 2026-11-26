  /* the Tile menu: the kind as Map Studio's pictures, then what that kind needs (from Map Studio's side panel) */
  function typeMenus(U){
    U.menu(U.r1,'Tile',function(pop){
      pfPics(U,pop,'Kind',EXP.TKINDS.filter(function(k){return k[0]!=='camera';}),EXP.tKindSvg,'kind');
      function part(kinds){var w=el('div');pop.appendChild(w);showWhen(U,w,function(e){return kinds.indexOf(e.kind)>-1;});return w;}
      var a=part(['stat','bar']);
      pfText(U,a,'Channel (name or number; blank = the main channel)','channel','Traffic Total',60);
      var b=part(['bar']);
      pfText(U,b,'Scale from','min','0',20);pfText(U,b,'to','max','automatic',20);
      pfText(U,b,'Warning from','warn','the channel’s limit',20);pfText(U,b,'Error from','error','the channel’s limit',20);
      var i=part(['interface']);
      pfText(U,i,'Link speed in Mbit/s (blank = compare with the peak)','cap','',20);
      var s=part(['string']);
      pfText(U,s,'Remove this text first','strip','^Status:\\s*',80);
      pfText(U,s,'Green when the message contains','okW','OK, Running',80);
      pfText(U,s,'Blue when it contains','infoW','Idle',80);
      pfText(U,s,'Amber when it contains','warnW','Slow',80);
      pfText(U,s,'Red when it contains','errW','Failed, Timeout',80);
      var c=part(['chips','chipsfit']);
      pfText(U,c,'Hide channels','hide','Downtime',120);
      pfText(U,c,'Show only these channels (blank = all)','only','',120);
      var cw=part(['chips']);U.pfRange(cw,'Chip width','chipw',60,400);
      var cf=part(['chipsfit']);pfText(U,cf,'Columns (blank = automatic)','cols','',4);pfText(U,cf,'Chip shape (wide : high)','ratio','2.4',8);
    },'shotsw');
  }
