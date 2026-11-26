  /* the legend's place is a class on the donut's body (lg-right, lg-below, lg-none) */
  function markupApply(m){
    var b=root.querySelector('.dbody');if(!b)return;
    var lg=(['right','below','none'].indexOf(m.legend)>-1)?m.legend:'right';
    ['right','below','none'].forEach(function(x){b.classList.toggle('lg-'+x,x===lg);});
  }
