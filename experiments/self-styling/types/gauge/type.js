/* Gauge (sensors only, as Map Studio's gauges since 1.8.1). Options as in Map Studio's Gauge menu.
   The default is Map Studio's: Flat minimalist on PRTG's own dial, Corporate blue.
   Map Studio's own ring faces need a drawing area the dial file does not have; this file carries one (hidden until a ring face is
   chosen), with its own copy of the channel data, so every face can be picked on the map. */
module.exports={
  mstype:'gauge', build:'buildGauge', blank:'blankG', pfx:'msga.', noun:'gauge', title:'Gauge',
  expose:['gFaceSvg','GFACES','NFACE_DEF'],
  extra:'extra.js',
  spec:{
    engine:['enum',['prtg','ring']],
    nstyle:['enum',['neon','flat','cyber','amb','clean','']],
    style:['enum',['progress','zones','threshold','gradient','led','solid','speedo']],
    nbg:['enum',['look','dark','light']],
    nscale:['enum',['off','outside','inside']],
    nline:['enum',['off','full','value']],
    npal:['enum',['prtg','cnp'],null,'prtg'],
    fit:['bool'],
    kind:['enum',['sensor-primary','sensor-all']],
    shape:['enum',['ring','half']],
    thick:['int',4,40],
    needle:['bool'],
    showMinMax:['bool'],
    glow:['bool'],
    colorMode:['enum',['status','accent']]
  },
  fileTweak:function(file){
    /* the ring faces' drawing area, after PRTG's dial, with the same channel data */
    const m=/(\n\s*<!--\n\s*\{\n\s*"objects":<#table[\s\S]*?\n\s*\}\n\s*-->)\n\t<\/div>/.exec(file);
    if(!m)throw new Error('gauge: the channel data was not found in the dial file');
    return file.replace(m[0],m[0]+'\n  <div class="gwrap" style="display:none">\n    <svg class="gsvg" preserveAspectRatio="xMidYMid meet"></svg>'+m[1]+'\n  </div>');
  }
};
