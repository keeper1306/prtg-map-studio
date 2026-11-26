  /* ---------- the gauge: PRTG's dial or Map Studio's ring, whichever the face needs ---------- */
  function faceOf(e){return e.engine==='prtg'?(e.nstyle?'n-'+e.nstyle:'classic'):(e.style||'progress');}
  function modelTweak(m){
    /* PRTG's dial reads "all channels" (data-mapview) only when PRTG draws it, so on the dial the gauge shows the main channel */
    if(m.engine==='prtg')m.kind='sensor-primary';
    if(m.engine==='ring')m.nstyle='';
  }
  function markupApply(m){
    var pl=root.querySelector('[data-plugin="channelgauges"]'), gw=root.querySelector('.gwrap'), ring=(m.engine==='ring');
    if(pl)pl.style.display=ring?'none':'';
    if(gw)gw.style.display=ring?'':'none';
    if(ring&&pl&&!root.hasAttribute('data-primarychannel'))root.setAttribute('data-primarychannel',pl.getAttribute('data-primarychannel')||'');
  }
