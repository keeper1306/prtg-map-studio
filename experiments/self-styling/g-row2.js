    /* ---- row 2: quick settings ---- */
    lab(r2,'Font',sel(FONTS.map(function(f){return [f[0],f[1]];}),'font','s'));
    numBox(r2,'Text','size',10,24);
    numBox(r2,'Title','tsize',10,30);
    numBox(r2,'Corners','radius',0,24);
    lab(r2,'Span',sel(PERIODS,'period','s short'));
    sep(r2);
    toggle(r2,'Title','showTitle','Show the title');
    toggle(r2,'Legend','legend','Show the legend');
    toggle(r2,'Axis','axis','Axis numbers');
    toggle(r2,'Grid','gridOn','Grid lines');

