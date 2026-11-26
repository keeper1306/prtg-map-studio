    /* ---- row 1: the menus ---- */
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
    menu(r1,'Chart',function(pop){
      var w=pf(pop,'Chart style'), g=el('div','seg');w.appendChild(g);
      CSTYLES.forEach(function(o){var b=el('button','',esc(o[1]));b.type='button';b.setAttribute('data-v',o[0]);
        b.addEventListener('click',function(){d.cstyle=o[0];change();sync();});g.appendChild(b);});
      syncs.push(function(){[].forEach.call(g.children,function(b){b.classList.toggle('on',b.getAttribute('data-v')===E().cstyle);});});
      pfSeg(pop,'Time span',PERIODS,'period');
    },'wide');
    menu(r1,'Channels',function(pop){
      note(pop,'Tick the channels to draw. None ticked = the ones that change most.');
      var box=el('div','colist');pop.appendChild(box);box.appendChild(el('div','note','Asking PRTG for the channels…'));
      var w=pf(pop,'Or type parts of their names (comma separated)'), t=el('input','ps');t.type='text';t.maxLength=200;w.appendChild(t);
      t.addEventListener('change',function(){d.names=t.value;change();sync();});syncs.push(function(){t.value=E().names||'';});
      var wm=pf(pop,'At most this many channels'), mx=el('input','ps');mx.type='number';mx.min=1;mx.max=10;wm.appendChild(mx);
      mx.addEventListener('change',function(){var n=int(mx.value,1,10);if(n===undefined){mx.value=E().maxCh;return;}d.maxCh=n;change();});
      syncs.push(function(){mx.value=E().maxCh;});
      channels().then(function(list){
        box.innerHTML='';
        if(!list.length){box.appendChild(el('div','note','PRTG did not list the channels here. Type their names instead.'));return;}
        list.forEach(function(nm){
          var r=el('label','pc','<input type="checkbox"><span>'+esc(nm)+'</span>'), c=r.querySelector('input');
          function picked(){return (E().names||'').split(',').map(function(x){return x.trim().toLowerCase();}).filter(Boolean);}
          c.addEventListener('change',function(){
            var p=picked().filter(function(x){return x!==nm.toLowerCase();});if(c.checked)p.push(nm.toLowerCase());
            d.names=p.join(', ');if(c.checked&&p.length>E().maxCh)d.maxCh=Math.min(10,p.length);change();sync();
          });
          syncs.push(function(){c.checked=picked().indexOf(nm.toLowerCase())>=0;});
          box.appendChild(r);
        });
        sync();
      });
    });
    menu(r1,'Lines and bars',function(pop){
      pfRange(pop,'Line width','lw',1,6);
      var w=pf(pop,'Fill strength'), g=el('div','rg','<input type="range" min="0" max="80" step="1"><output></output>');w.appendChild(g);
      var i=g.querySelector('input'), o=g.querySelector('output');
      i.addEventListener('input',function(){d.fillA=parseInt(i.value,10);o.textContent=d.fillA+' %';change();});
      syncs.push(function(){i.value=E().fillA;o.textContent=E().fillA+' %';});
      pfRange(pop,'Bar corners','bradius',0,12);
      pfCheck(pop,'Dots on the line','dots');
      pfCheck(pop,'Grid lines','gridOn');
      pfCheck(pop,'Axis numbers','axis');
      pfCheck(pop,'Legend','legend');
      pfCheck(pop,'Values in the legend','legendValues');
    });
    menu(r1,'Colors',function(pop){
      pfSelect(pop,'Status colours (warning and down lines, threshold colours)',Object.keys(SETS).map(function(k){return [k,SETS[k][0]];}),'set');
      pfSeg(pop,'Lines take',[['look','The look’s accent first'],['status','The status colours']],'series');
      pop.appendChild(el('div','ph','Each line on its own'));
      var g=el('div','cols2');pop.appendChild(g);
      [0,1,2,3,4].forEach(function(i){
        var w=el('label','sw','<input type="color"><span>Line '+(i+1)+'</span>'), inp=w.querySelector('input');
        inp.addEventListener('input',function(){var l=(E().lineCols||[]).slice();while(l.length<5)l.push('');l[i]=inp.value;d.lineCols=l;change();});
        syncs.push(function(){inp.value=seriesColors(E())[i]||'#888888';});g.appendChild(w);
      });
      var rb=el('button','mini','Lines back to the look’s colours');rb.type='button';pop.appendChild(rb);
      rb.addEventListener('click',function(){delete d.lineCols;change();sync();});
      pop.appendChild(el('div','ph','Or each colour of the look on its own'));
      OV.forEach(function(o){
        pfColor(pop,o[1],function(){var e=E(), L=LOOKS[e.look];return (e.ov&&e.ov[o[0]])||(o[0]==='grid'?gridOf(L,e.ov||{}):L[o[0]])||'#000000';},
          function(v){d.ov=mix(d.ov);d.ov[o[0]]=v;},function(){if(d.ov){d.ov=mix(d.ov);delete d.ov[o[0]];}});
      });
    },'wide');
    menu(r1,'Title',function(pop){
      var w=pf(pop,'Text'), i=el('input','ps');i.type='text';i.maxLength=80;i.placeholder='The sensor’s name';w.appendChild(i);
      i.addEventListener('input',function(){d.title=i.value;change();});syncs.push(function(){if(TOPDOC.activeElement!==host)i.value=E().title||'';});
      pfSeg(pop,'Style',TSTYLES,'ts');
      pfSeg(pop,'Align',[['left','Left'],['center','Centre'],['right','Right']],'talign');
      pfRange(pop,'Size','tsize',10,30);
    });
