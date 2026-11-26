/* Industrial (a Tile underneath, family 'ind'). Options as in Map Studio's Industrial menu and side panel.
   Fence and Line are left out (they keep their settings in HTML Before already). */
module.exports={
  mstype:'tile', build:'buildTile', blank:'blankInd', pfx:'msin.', noun:'industrial object', title:'Industrial',
  noLooks:['PRTG default'],
  expose:['iKindSvg','IKINDS','IEQ','EQNEW'],
  spec:{
    kind:['enum',['lamps','onoff','tank','equip','pv','count']],
    channel:['text',60], chan2:['text',60],
    min:['text',20], max:['text',20], warn:['text',20], error:['text',20],
    lamps:['text',200], rows:['text',200], only:['text',200],
    onW:['text',40], offW:['text',40], onIf:['text',80], bad:['enum',['none','on','off']], oStyle:['enum',['lamp','switch','word']],
    shape:['enum',['tank','silo']], fill:['hex'],
    eq:['enum',['pump','motor','valve','fan','conveyor','plc','vfd','breaker','ups']], eLay:['enum',['stack','row']], upW:['text',40],
    sp:['text',20], trend:['bool'], cStyle:['enum',['ring','pill']],
    ms:['bool'], hb:['bool'], hage:['bool'], msch:['text',60], fch:['text',60], val2:['text',60],
    wRun:['text',120], wStop:['text',120], wChg:['text',120], wFault:['text',120], wShow:['text',120],
    stale:['text',6], ageCh:['text',60]
  },
  /* machine state and the health badge read three hidden lines the other kinds do not have; this file always carries them */
  tweakEvery:true,
  fileTweak:function(file){
    if(/class="eqs-lc"/.test(file))return file;
    const at='<div class="tbody"></div>';
    if(file.indexOf(at)<0)throw new Error('industrial: no .tbody in the file');
    return file.replace(at,at+'\n    <div class="eqs-lc" style="display:none"><#objectstatus name="lastcheck" id="<@objectid>"></div>'+
      '\n    <div class="eqs-iv" style="display:none"><#objectproperty name="interval" show="number" id="<@objectid>"></div>'+
      '\n    <div class="eqs-msg" style="display:none"><#objectstatus name="message" id="<@objectid>"></div>');
  },
  variants:[
    {label:'equipment: pump',patch:{kind:'equip',eq:'pump'}},
    {label:'equipment: PLC with machine state and health',patch:{kind:'equip',eq:'plc',ms:true,hb:true}},
    {label:'equipment: pump with health badge',patch:{kind:'equip',eq:'pump',hb:true}},
    {label:'silo',patch:{kind:'tank',shape:'silo'}},
    {label:'countdown pill',patch:{kind:'count',cStyle:'pill'}}
  ]
};
