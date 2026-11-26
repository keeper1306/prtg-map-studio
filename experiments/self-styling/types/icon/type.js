/* Status icon (Map Studio's own icons, drawn with CSS from PRTG's state class: no script needed to draw).
   Options as in Map Studio's Icon menu. PRTG's stock icons are left out (they are PRTG's own drawings). */
module.exports={
  mstype:'icon', build:'buildIcon', blank:'blankI', pfx:'msic.', noun:'icon', title:'Icon',
  noLooks:['PRTG default'],
  spec:{
    style:['enum',['led','dot','glow','orb','ring','pulse','badge','glyph','tile','shield','square','diamond','hexagon','corner','rbar','sign',
      'bars','server','beacon','flag','traffic','tlout','tlh','ledstrip','sbar','heart','pill']],
    palette:['enum',['look','prtg']],
    text:['enum',['none','name','word','both']],
    animate:['bool'],
    card:['bool']
  }
};
module.exports.extra='extra.js';
