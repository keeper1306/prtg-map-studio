  /* PRTG refreshes the rows on its own: wrap the status words again, and where PRTG would not build the table again, hide again */
  function onMutate(){
    wrapStatus();
    if(dataOk===false)fallbackCss(eff(clean(R.open&&R.draft?R.draft:savedRaw())));
  }
