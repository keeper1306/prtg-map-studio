  function barMenus(U){
    var d=U.d, E=U.E, sync=U.sync, change=U.change, syncs=U.syncs, r1=U.r1, host=U.host, menu=U.menu, pf=U.pf, pfRange=U.pfRange,
      pfCheck=U.pfCheck, pfSeg=U.pfSeg, pfSelect=U.pfSelect, pfColor=U.pfColor, note=U.note, sep=U.sep;
    menu(r1,'Looks',function(pop){
      var g=el('div','looks');pop.appendChild(g);
      LOOKNAMES.forEach(function(n){
        var L=LOOKS[n], b=el('button','lk');b.type='button';b.setAttribute('data-v',n);
        var bg=L.card?L.bg:'#F2F4F7', top=L.ts==='bar'?L.tbg:bg;
        b.innerHTML='<i style="background:'+bg+'"><b style="background:'+top+'"></b><u style="top:13px;background:'+L.line+'"></u>'+
          '<u style="top:19px;background:'+L.link+';right:45%"></u></i><span>'+esc(n)+'</span>';
        b.addEventListener('click',function(){DETAILKEYS.forEach(function(k){delete d[k];});d.look=n;change();sync();});
        g.appendChild(b);
      });
      syncs.push(function(){[].forEach.call(g.children,function(b){b.classList.toggle('on',b.getAttribute('data-v')===E().look);});});
      pfSelect(pop,'Shadow',SHADOWS,'shadow');
      pfCheck(pop,'Border round the card','border');
    },'wide');
    menu(r1,'Colors',function(pop){
      pfSelect(pop,'Status colours',Object.keys(SETS).map(function(k){return [k,SETS[k][0]];}).concat([['own','My own']]),'set');
      var g=el('div','cols2');pop.appendChild(g);
      STKEYS.forEach(function(s,i){
        var w=el('label','sw','<input type="color"><span>'+esc(s[1])+'</span>'), inp=w.querySelector('input');
        inp.addEventListener('input',function(){var e=E(), S=SETS[e.set]||SETS.prtg, o=mix(e.own);
          if(e.set!=='own')STKEYS.forEach(function(x,j){if(!o[x[0]])o[x[0]]=S[j+1];});
          o[s[0]]=inp.value;d.own=o;d.set='own';change();sync();});
        syncs.push(function(){var e=E(), S=SETS[e.set]||SETS.prtg;inp.value=(e.set==='own'&&e.own&&e.own[s[0]])||S[i+1];});
        g.appendChild(w);
      });
      pop.appendChild(el('div','ph','Or each colour of the look on its own'));
      OV.forEach(function(o){
        pfColor(pop,o[1],function(){var e=E(), L=LOOKS[e.look];return (e.ov&&e.ov[o[0]])||(o[0]==='stripe'?(L.zebra||'#F8FAFC'):L[o[0]])||'#000000';},
          function(v){d.ov=mix(d.ov);d.ov[o[0]]=v;},function(){if(d.ov){d.ov=mix(d.ov);delete d.ov[o[0]];}});
      });
    },'wide');
    menu(r1,'Title',function(pop){
      var w=pf(pop,'Text'), i=el('input','ps');i.type='text';i.maxLength=80;i.placeholder='PRTG’s own title';w.appendChild(i);
      i.addEventListener('input',function(){d.title=i.value;change();});syncs.push(function(){if(TOPDOC.activeElement!==host)i.value=E().title||'';});
      pfSeg(pop,'Style',TSTYLES,'ts');
      pfSeg(pop,'Align',[['left','Left'],['center','Centre'],['right','Right']],'talign');
      pfRange(pop,'Size','tsize',10,30);
    });
    menu(r1,'Header',function(pop){
      pfCheck(pop,'Show the header row','head');
      pfSeg(pop,'Style',HSTYLES,'hs');
      pfCheck(pop,'Capital letters','caps');
    });
    menu(r1,'Row style',function(pop){
      pfCheck(pop,'Stripes on every other row','stripes');
      pfCheck(pop,'Lines between rows','lines');
      pfCheck(pop,'Highlight the row under the mouse','hover');
      pfRange(pop,'Row spacing','pad',2,20);
      pfRange(pop,'Side spacing','cellx',4,28);
    });
    menu(r1,'Status',function(pop){
      var w=pf(pop,'Shown as'), g=el('div','seg');w.appendChild(g);
      SHAPES.forEach(function(o){var b=el('button','',esc(o[1]));b.type='button';b.setAttribute('data-v',o[0]);
        b.addEventListener('click',function(){d.status=o[0];change();sync();});g.appendChild(b);});
      syncs.push(function(){[].forEach.call(g.children,function(b){b.classList.toggle('on',b.getAttribute('data-v')===E().status);});});
      pfRange(pop,'Dot size','dot',6,20);
      pfCheck(pop,'Tint rows that are down or warning','tint');
    });
    sep(r1);
    menu(r1,'Columns',function(pop){
      note(pop,'Tick the columns to show; the arrows change their order.');
      var cl=el('div','colist');pop.appendChild(cl);
      function draw(){
        cl.innerHTML='';
        var cur=E().cols.slice(), all=cur.concat(keysOf(COLS).filter(function(k){return cur.indexOf(k)<0;}));
        all.forEach(function(k){
          var on=cur.indexOf(k)>=0, name='';COLS.forEach(function(x){if(x[0]===k)name=x[1];});
          var r=el('div','cr'+(on?'':' off'),'<label><input type="checkbox"'+(on?' checked':'')+'><span>'+esc(name)+'</span></label>'+
            (on?'<button type="button" data-m="-1" title="Move up">↑</button><button type="button" data-m="1" title="Move down">↓</button>':''));
          r.querySelector('input').addEventListener('change',function(){
            var c=E().cols.slice(), i=c.indexOf(k);
            if(this.checked&&i<0)c.push(k);else if(!this.checked&&i>=0){if(c.length<2){this.checked=true;return;}c.splice(i,1);}
            d.cols=c;change();draw();
          });
          [].forEach.call(r.querySelectorAll('button'),function(b){b.addEventListener('click',function(){
            var c=E().cols.slice(), i=c.indexOf(k), j=i+parseInt(b.getAttribute('data-m'),10);
            if(j<0||j>=c.length)return;c.splice(i,1);c.splice(j,0,k);d.cols=c;change();draw();
          });});
          cl.appendChild(r);
        });
      }
      syncs.push(draw);
    });
    menu(r1,'Sort and rows',function(pop){
      pfSelect(pop,'Sort by',SORTS,'sortBy');
      pfSeg(pop,'Order',[['asc','A to Z, low to high'],['desc','Z to A, high to low']],'sortDir');
      var w=pf(pop,'Rows (0 = PRTG’s paging)'), i=el('input','ps');i.type='number';i.min=0;i.max=500;w.appendChild(i);
      i.addEventListener('change',function(){var n=int(i.value,0,500);if(n===undefined){i.value=E().count;return;}d.count=n;change();});
      syncs.push(function(){i.value=E().count;});
      pop.appendChild(el('div','ph','Behaviour'));
      pfCheck(pop,'Names link to PRTG','links');
      pfCheck(pop,'Click a heading to sort','sortable');
      pfCheck(pop,'Show PRTG’s “Items” line','infoheader');
    });
    menu(r1,'Filters',function(pop){
      pop.appendChild(el('div','ph','Status (none ticked = all)'));
      var g=el('div','cols2');pop.appendChild(g);
      STATUSDEF.forEach(function(sd){
        var w=el('label','pc','<input type="checkbox"><span>'+esc(sd[1])+'</span>'), c=w.querySelector('input');
        c.addEventListener('change',function(){var l=(E().statuses||[]).filter(function(x){return x!==sd[0];});if(c.checked)l.push(sd[0]);d.statuses=l;change();});
        syncs.push(function(){c.checked=(E().statuses||[]).indexOf(sd[0])>=0;});g.appendChild(w);
      });
      pfCheck(pop,'Follow the map’s tag filter','mapTags');
      var w1=pf(pop,'Only sensors with the tag'), t=el('input','ps');t.type='text';t.placeholder='e.g. ping firewall';w1.appendChild(t);
      t.addEventListener('change',function(){d.reqTag=t.value;change();sync();});syncs.push(function(){t.value=E().reqTag||'';});
      var w2=pf(pop,'Name contains'), n=el('input','ps');n.type='text';n.maxLength=40;w2.appendChild(n);
      n.addEventListener('change',function(){d.nameHas=n.value;change();sync();});syncs.push(function(){n.value=E().nameHas||'';});
      pfCheck(pop,'Only sensors with a value','onlyValue');
      pfCheck(pop,'Only favourites','onlyFav');
    });
  }
  function barQuick(U){
    var r2=U.r2, lab=U.lab, sel=U.sel, numBox=U.numBox, toggle=U.toggle, sep=U.sep;
    lab(r2,'Font',sel(FONTS.map(function(f){return [f[0],f[1]];}),'font','s'));
    numBox(r2,'Text','size',10,24);
    numBox(r2,'Title','tsize',10,30);
    numBox(r2,'Corners','radius',0,24);
    sep(r2);
    U.flexSeg(r2,'Keeps its size: a smaller box scrolls',
      'Text, row spacing and dots grow and shrink with the box; the title keeps its size and the text stays at 12 px or more. The size it has now counts as normal');
    sep(r2);
    toggle(r2,'Title','showTitle','Show the title');
    toggle(r2,'Header','head','Show the header row');
    toggle(r2,'Stripes','stripes','Stripes on every other row');
    toggle(r2,'Lines','lines','Lines between rows');
    toggle(r2,'Tint','tint','Tint rows that are down or warning');
  }
