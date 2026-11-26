/* Status counts (the sensors under a group, device or probe, counted by state). Options as in Map Studio's Tiles menu. */
module.exports={
  mstype:'status', build:'buildStatus', blank:'blankSC', pfx:'msst.', noun:'status card', title:'Status counts',
  noLooks:['PRTG default'],   /* as in Map Studio's Looks menu for status counts */
  extra:'extra.js',
  spec:{
    tiles:['list',['up','warning','down','ack','paused','unusual','unknown','total','pctup']],
    cap:['enum',['of','none']],
    quiet:['bool'],
    boxH:['enum',['','small','medium','large'],null,'']
  }
};
