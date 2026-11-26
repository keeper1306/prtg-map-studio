  /* the legend's place is a class on the sunburst's body (lg-right, lg-below, lg-none) */
  function markupApply(m){
    var b=root.querySelector('.sbbody');if(!b)return;
    var lg=(['right','below','none'].indexOf(m.legend)>-1)?m.legend:'below';
    ['right','below','none'].forEach(function(x){b.classList.toggle('lg-'+x,x===lg);});
  }
