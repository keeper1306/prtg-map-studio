  /* the Icon menu, as in Map Studio's floating bar: the style (pictures drawn by the icon's own CSS in up, warning and down),
     the text next to it, animation; plus the card behind it and the colours, from the side panel */
  var ISTY=[['led','LED'],['dot','Dot'],['glow','Glow dot'],['orb','Soft orb'],['ring','Ring'],['pulse','Pulse'],['badge','Badge'],['glyph','Line icon'],
    ['tile','Tile'],['shield','Shield'],['square','Square'],['diamond','Diamond'],['hexagon','Hexagon'],['corner','Corner tab'],['rbar','Rounded bar'],
    ['sign','Warning sign'],['bars','Signal bars'],['server','Server'],['beacon','Beacon'],['flag','Flag'],['traffic','Traffic light'],
    ['tlout','Outlined traffic light'],['tlh','Horizontal traffic light'],['ledstrip','LED strip'],['sbar','Status bar'],['heart','Heartbeat'],['pill','Status pill']];
  /* a picture of a style: Map Studio's own file for it, drawn in three states with its own CSS (as Map Studio's gallery does) */
  function iconPic(id){
    var m=modelOf(eff(mix(U0.d,{style:id,text:'none',card:false})));
    var t=BUILD(m), css=(/<style>([\s\S]*?)<\/style>/.exec(t)||[])[1]||'', sv=(/<svg class="pst-ic"[\s\S]*?<\/svg>/.exec(t)||[''])[0];
    var cls=(BASECLS.filter(function(c){return /^pst_/.test(c);})[0]||'pst_x'), gid='pic'+id;
    var cell=function(k){return '<span class="map_object pst_obj '+cls+' map_objectstate_'+k+'" style="position:relative;display:inline-block;width:26px;height:26px;margin:0 1px">'+
      '<a class="pst">'+sv.replace(/<@itemid>/g,gid+k)+'</a></span>';};
    return '<span style="display:block;height:100%;background:#fff"><style>'+css.replace(/<\/style/gi,'')+'</style>'+cell('sensg')+cell('sensy')+cell('sensr')+'</span>';
  }
  var U0={d:{}};
  function typeMenus(U){
    U0=U;
    U.menu(U.r1,'Icon',function(pop){
      pfPics(U,pop,'Style',ISTY,iconPic,'style');
      U.pfSelect(pop,'Text next to it',[['none','Icon only'],['name','Icon and object name'],['word','Icon and status word'],['both','Icon, name and status word']],'text');
      U.pfCheck(pop,'Animate','animate');
      U.pfCheck(pop,'A card behind it (then Looks set the card)','card');
      U.pfSelect(pop,'Colours',[['look','The look’s status colours'],['prtg','PRTG’s own']],'palette');
    },'shotsw');
  }
