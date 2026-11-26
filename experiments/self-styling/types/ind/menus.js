  /* the Industrial menu: the kind as Map Studio's pictures, then what that kind needs (from Map Studio's side panel) */
  function typeMenus(U){
    U.menu(U.r1,'Industrial',function(pop){
      var E=U.E, d=U.d;
      pfPics(U,pop,'Kind',EXP.IKINDS.filter(function(k){return k[0]!=='fence'&&k[0]!=='line';}),EXP.iKindSvg,'kind');
      function part(test,into){var w=el('div');(into||pop).appendChild(w);showWhen(U,w,test);return w;}
      function kind(){var ks=[].slice.call(arguments);return function(e){return ks.indexOf(e.kind)>-1;};}
      pfText(U,part(kind('onoff','tank','pv','count')),'Channel (name or number; blank = the main channel)','channel','',60);
      var la=part(kind('lamps'));
      pfText(U,la,'Lamps (words, comma separated)','lamps','RUN, STOP, ERROR, MAINT',200);
      pfText(U,la,'Read only these channels (blank = all)','only','',200);
      pfText(U,la,'Rows under the lamps','rows','Operating Mode, Cycle Time',200);
      var oo=part(kind('onoff'));
      U.pfSeg(oo,'Style',[['lamp','Lamp'],['switch','Switch'],['word','Word']],'oStyle');
      pfText(U,oo,'Word when on','onW','On',40);pfText(U,oo,'Word when off','offW','Off',40);
      pfText(U,oo,'On when the value contains (blank = On, Yes, True, Open, Running or above 0)','onIf','',80);
      U.pfSelect(oo,'Which side is a problem',[['none','Neither'],['on','On is a problem (red)'],['off','Off is a problem (red)']],'bad');
      var sc=part(kind('tank','pv'));
      pfText(U,sc,'Scale from','min','0',20);pfText(U,sc,'to','max','automatic',20);
      pfText(U,sc,'Warning from','warn','the channel’s limit',20);pfText(U,sc,'Alarm from','error','the channel’s limit',20);
      var tk=part(kind('tank'));
      U.pfSeg(tk,'Shape',[['tank','Tank'],['silo','Silo']],'shape');
      pfText(U,tk,'Second value under the level','chan2','Volume',60);
      var fc=part(kind('tank','pv'));
      U.pfColor(fc,'Fill / trend colour',function(){return E().fill||'#4F8DDB';},function(v){d.fill=v;},function(){delete d.fill;});
      var pv=part(kind('pv'));
      pfText(U,pv,'Setpoint (blank = none)','sp','',20);
      U.pfCheck(pv,'Trend line of the last hour','trend');
      var ct=part(kind('count'));
      U.pfSeg(ct,'Style',[['ring','Ring'],['pill','Pill']],'cStyle');
      pfText(U,ct,'Warning at (days left)','warn','30',20);pfText(U,ct,'Alarm at','error','7',20);pfText(U,ct,'Full ring at','max','365',20);
      var eq=part(kind('equip'));
      var es=U.pfSelect(eq,'Equipment',EXP.IEQ,'eq');
      es.addEventListener('change',function(){if(EXP.EQNEW[es.value]){d.ms=true;d.hb=true;U.change();U.sync();}});   /* as in Map Studio: a new symbol starts with machine state and health */
      U.pfSeg(eq,'Layout',[['stack','Stacked'],['row','In a row']],'eLay');
      U.pfCheck(eq,'Show the machine’s own state (run, stop, fault)','ms');
      var e1=part(function(e){return e.kind==='equip'&&!e.ms;},eq);
      pfText(U,e1,'Show the value of (blank = the status word)','channel','',60);pfText(U,e1,'Word when up','upW','Up, or for example Running',40);
      var e2=part(function(e){return e.kind==='equip'&&!!e.ms;},eq);
      pfText(U,e2,'State channel (blank = the main channel)','msch','',60);
      pfText(U,e2,'Fault when this channel is on','fch','Fault or SF LED',60);
      pfText(U,e2,'Second value under the word','val2','Output Frequency',60);
      pfText(U,e2,'Running when the value says','wRun','',120);pfText(U,e2,'Stopped when it says','wStop','',120);
      pfText(U,e2,'Changing when it says','wChg','',120);pfText(U,e2,'Fault when it says','wFault','',120);
      pfText(U,e2,'Words shown for running, stopped, changing, fault','wShow','',120);
      U.pfCheck(eq,'Data health badge','hb');
      var e3=part(function(e){return e.kind==='equip'&&!!e.hb;},eq);
      U.pfCheck(e3,'With the time of the last reading','hage');
      pfText(U,e3,'Stale after (minutes; blank = 3 sensor scans)','stale','',6);pfText(U,e3,'Age from a channel','ageCh','',60);
    },'shotsw');
  }
