/* Tile (one sensor: what it reports, in the colour of its state). Options as in Map Studio's Tile menu and side panel.
   Camera is left out: it needs a camera's address, which this object has no place to keep safely.
   The String tile reads the sensor's message from a hidden line the other kinds do not have; this file always carries it. */
module.exports={
  mstype:'tile', build:'buildTile', blank:'blankTL', pfx:'mstl.', noun:'tile', title:'Tile',
  noLooks:['PRTG default'],
  expose:['tKindSvg','TKINDS'],
  spec:{
    kind:['enum',['stat','string','bar','interface','chips','chipsfit']],
    channel:['text',60],
    min:['text',20], max:['text',20], warn:['text',20], error:['text',20],
    cap:['text',20],
    strip:['text',80], okW:['text',80], infoW:['text',80], warnW:['text',80], errW:['text',80],
    hide:['text',120], only:['text',120],
    chipw:['int',60,400],
    cols:['text',4], ratio:['text',8]
  },
  fileTweak:function(file){
    if(/class="tmsg"/.test(file))return file;
    const at='<div class="tbody"></div>';
    if(file.indexOf(at)<0)throw new Error('tile: no .tbody in the file');
    return file.replace(at,at+'\n    <div class="tmsg" style="display:none"><#objectstatus name="message" id="<@objectid>"></div>');
  }
};
