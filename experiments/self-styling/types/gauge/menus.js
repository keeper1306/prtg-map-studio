  /* the Gauge menu, as in Map Studio's floating bar: the faces as pictures, then what fits the face */
  function typeMenus(U){
    U.menu(U.r1,'Gauge',function(pop){
      var E=U.E, d=U.d;
      var w=U.pf(pop,'Face'), g=el('div','shots faces');w.appendChild(g);
      EXP.GFACES.forEach(function(f){
        var b=el('button','shot','<i>'+EXP.gFaceSvg(f[0])+'</i><span>'+esc(f[1])+'</span>');b.type='button';b.setAttribute('data-v',f[0]);b.title=f[1];
        b.addEventListener('click',function(){
          var k=f[0];
          if(k==='classic'||k.indexOf('n-')===0){
            var ns=(k==='classic')?'':k.slice(2), df=EXP.NFACE_DEF[ns]||{};
            if(faceOf(E())!==k){d.nline=df.nline||'off';d.nscale=df.nscale||'off';}   /* each face starts from its own value line and scale */
            d.engine='prtg';d.nstyle=ns;
          }else{d.engine='ring';d.style=k;d.nstyle='';}
          U.change();U.sync();
        });
        g.appendChild(b);
      });
      U.syncs.push(function(){var f=faceOf(E());[].forEach.call(g.children,function(b){b.classList.toggle('on',b.getAttribute('data-v')===f);});});
      /* PRTG's dial */
      var dial=el('div');pop.appendChild(dial);
      U.pfCheck(dial,'Fit the gauges to the object’s size','fit');
      U.pfSelect(dial,'Background',[['look','From the look'],['dark','Dark'],['light','Light']],'nbg');
      U.pfSelect(dial,'Scale numbers',[['off','Off'],['outside','Outside the dial'],['inside','Inside, round the needle']],'nscale');
      U.pfSelect(dial,'Value line',[['off','Off'],['full','Complete (thick to the value, thin after)'],['value','Up to the value only']],'nline');
      U.pfSelect(dial,'Zone colours',[['prtg','PRTG’s (or the look’s)'],['cnp','Cyan, navy and pink']],'npal');
      /* Map Studio's ring */
      var ring=el('div');pop.appendChild(ring);
      U.pfSelect(ring,'Shows',[['sensor-primary','Sensor: main channel'],['sensor-all','Sensor: all channels']],'kind');
      U.pfSelect(ring,'Shape',[['ring','Ring (270°)'],['half','Half ring (180°)']],'shape');
      U.pfRange(ring,'Thickness','thick',4,40);
      U.pfCheck(ring,'Needle','needle');
      U.pfCheck(ring,'Minimum and maximum','showMinMax');
      U.pfCheck(ring,'Glow','glow');
      U.pfSelect(ring,'Colour',[['status','By status'],['accent','Accent']],'colorMode');
      U.syncs.push(function(){
        var e=E(), isRing=(e.engine==='ring');
        dial.style.display=isRing?'none':'';ring.style.display=isRing?'':'none';
        var fit=dial.querySelector('.pc');if(fit)fit.style.display=(!isRing&&!e.nstyle)?'':'none';   /* only PRTG classic */
        [].forEach.call(dial.querySelectorAll('.pf'),function(p,i){if(i===0)p.style.display=e.nstyle?'':'none';});   /* background: modern faces */
      });
    },'shotsw');
  }
