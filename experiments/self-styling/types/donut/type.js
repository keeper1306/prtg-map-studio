/* Donut (Map Studio's ring donut: the states of the sensors under an object). Options as in Map Studio's Donut menu. */
module.exports={
  mstype:'donut', build:'buildDonut', blank:'blankD', pfx:'msdn.', noun:'donut', title:'Donut',
  noLooks:['PRTG default'],   /* as in Map Studio's Looks menu for a ring donut */
  spec:{
    mode:['enum',['all','alarms']],
    legend:['enum',['right','below','none']],
    center:['enum',['total','percentup','none']],
    caption:['text',24],
    thick:['int',6,60],
    gap:['int',0,10],
    hideZero:['bool'],
    showCounts:['bool']
  },
  extra:'extra.js'
};
