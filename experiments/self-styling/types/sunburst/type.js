/* Sunburst (a group's or probe's device tree as rings). Options as in Map Studio's Sunburst menu.
   The default is Map Studio's (Separated, Light card). PRTG classic is left out: it is PRTG's own drawing, with other markup. */
module.exports={
  mstype:'sunburst', build:'buildSunburst', blank:'blankSB', pfx:'mssb.', noun:'sunburst', title:'Sunburst',
  noLooks:['PRTG default'],
  expose:['sbFaceSvg','SBCENTERS'],
  extra:'extra.js',
  spec:{
    face:['enum',['solid','gaps','glow','pastel']],
    sizeSensors:['bool'], sizePriority:['bool'], hidePaused:['bool'],
    center:['enum',['total','pctup','name','none']],
    legend:['enum',['right','below','none']],
    hole:['int',0,70], depth:['int',0,8],
    labels:['bool'], links:['bool']
  },
  variants:[]
};
