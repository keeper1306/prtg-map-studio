
/* @region: dashboard */
(function dashboardModule(){
  var _dq=[227,61,148,198,255,200,154,240];
try{
  function newUid(){return Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);}
  var D={w:CFG.canvas.w,h:CFG.canvas.h,grid:CFG.canvas.grid,zoom:CFG.canvas.zoom,items:[],nextId:1,sel:null,uid:newUid(),ordSeq:0};   /* the identity of this layout: items pushed to PRTG are remembered against it. ordSeq hands out ever-increasing stacking numbers (it.ord) so items can be reordered. */
  var scale=1, drag=null, editing=null, editFrame=false, pre=null, moveTimer=null;
  var undoStack=[], redoStack=[], committed='', savedSnap=null;   /* savedSnap: the layout as it was when last saved, loaded or pushed */
  var htmlCache={}, baseSnap=null, fontSig='';
  var canvas=document.getElementById('dcanvas');
  var wrap=document.getElementById('dwrap');
  var selBox=document.getElementById('dselbox');
  var handle=document.getElementById('dhandle');
  var stageEl=document.getElementById('dashstage');
  var formEl=document.getElementById('dform');
  var listEl=document.getElementById('ditems');
  var codeEl=null;

  /*PURE-START*/
  function extend(a,b){for(var k in b)a[k]=b[k];return a;}
  function clone(o){return JSON.parse(JSON.stringify(o));}
  function byId(id){for(var i=0;i<D.items.length;i++){if(D.items[i].id===id)return D.items[i];}return null;}
  function descendants(id){
    var out=[],seen={};
    (function walk(pid){
      for(var i=0;i<D.items.length;i++){
        var it=D.items[i];
        if(it.parent===pid&&!seen[it.id]){seen[it.id]=1;out.push(it);walk(it.id);}
      }
    })(id);
    return out;
  }
  function isDesc(anc,id){var d=descendants(anc);for(var i=0;i<d.length;i++){if(d[i].id===id)return true;}return false;}
  function isGroupFrame(it){return it.type==='frame'&&it.p.group!==false;}
  function depthOf(it){var d=0,c=it;while(c&&c.parent!=null&&d<30){c=byId(c.parent);d++;}return d;}
  function layerOf(it){return (it.type==='frame'&&!it.p.shape)?0:((it.type==='tile'||it.type==='banner'||it.type==='prtgobj')?1:2);}   /* only the default bucket a brand-new item starts in; it.ord (below) is what actually controls stacking once set */
  function ordOf(it){return (typeof it.ord==='number')?it.ord:(layerOf(it)*100000);}   /* items made before ord existed (an old saved layout) fall back to the old fixed category */
  function enforceNesting(list){   /* an item must never render behind its own parent frame, however it.ord was set */
    var guard=0, changed=true;
    while(changed&&guard++<50){
      changed=false;
      for(var i=0;i<list.length;i++){
        var it=list[i];
        if(it.parent==null)continue;
        var p=-1,j;
        for(j=0;j<list.length;j++){if(list[j].id===it.parent){p=j;break;}}
        if(p>i){var moved=list.splice(i,1)[0];list.splice(p,0,moved);changed=true;}
      }
    }
    return list;
  }
  function objMode(it){   /* a PRTG object is either a box you size, or as big as PRTG draws it (the status icons) */
      if(it.type!=='prtgobj')return 'box';
      if(it.p.sizing==='box'||it.p.sizing==='content')return it.p.sizing;
      var pv=(DASHAPI.pv||{})[it.id];
      return (pv&&pv.autoContent)?'content':'box';
    }
    function canSize(it){return isBox(it)||it.type==='label'||it.type==='button';}   /* labels and buttons take a fixed box (width and height) when dragged */
    function setBoxSize(it,w,h){
      var v=it.state.v, a=(it.type==='button')?'bw':'lw', b=(it.type==='button')?'bh':'lh';
      v[a]=String(Math.max(20,Math.round(w)));v[b]=String(Math.max(20,Math.round(h)));
    }
    function isBox(it){return it.type==='frame'||it.type==='tile'||it.type==='banner'||(it.type==='prtgobj'&&objMode(it)==='box');}   /* items with a size of their own, which you can resize */
  function order(){
    var arr=[];
    for(var i=0;i<D.items.length;i++)arr.push({it:D.items[i],i:i});
    arr.sort(function(a,b){return (ordOf(a.it)-ordOf(b.it))||(a.i-b.i);});
    return enforceNesting(arr.map(function(o){return o.it;}));
  }
  /* ---------- manual stacking: bring to front / send to back / step one at a time ---------- */
  function groupBlock(it){   /* a group frame always carries its contents with it when it moves in the stack */
    if(!isGroupFrame(it))return [it];
    var ord=order(), ids={};ids[it.id]=1;
    descendants(it.id).forEach(function(d){ids[d.id]=1;});
    return ord.filter(function(x){return ids[x.id];});
  }
  function maxOrd(){var m=null;D.items.forEach(function(x){var o=ordOf(x);if(m===null||o>m)m=o;});return m===null?0:m;}
  function minOrd(){var m=null;D.items.forEach(function(x){var o=ordOf(x);if(m===null||o<m)m=o;});return m===null?0:m;}
  /* where an item sits in the stack: 1 is the very back */
  function layerPos(it){var ord=order(), i;for(i=0;i<ord.length;i++)if(ord[i].id===it.id)return {n:i+1,total:ord.length};return {n:0,total:ord.length};}
  function layerEdge(it){
    var ord=order(), blk=groupBlock(it), ids={}; blk.forEach(function(x){ids[x.id]=1;});
    var first=-1,last=-1,i;
    for(i=0;i<ord.length;i++){if(ids[ord[i].id]){if(first<0)first=i;last=i;}}
    return {atTop:(first<0)||(last===ord.length-1),atBottom:(first<=0)};
  }
  function bringToFront(it){
    var blk=groupBlock(it), base=maxOrd()+1;
    blk.forEach(function(x,i){x.ord=base+i;});
    renderAll();buildForm();commit();
  }
  function sendToBack(it){
    var blk=groupBlock(it), base=minOrd()-blk.length;
    blk.forEach(function(x,i){x.ord=base+i;});
    renderAll();buildForm();commit();
  }
  function stepLayer(it,dir){   /* dir: +1 forward one step, -1 backward one step */
    var ord=order(), blk=groupBlock(it), ids={}; blk.forEach(function(x){ids[x.id]=1;});
    var first=-1,last=-1,i;
    for(i=0;i<ord.length;i++){if(ids[ord[i].id]){if(first<0)first=i;last=i;}}
    if(first<0)return;
    var tgtIdx=(dir>0)?last+1:first-1;
    if(tgtIdx<0||tgtIdx>=ord.length)return;
    var nbr=ord[tgtIdx], nbrBlock=groupBlock(nbr);
    if(dir>0){
      var base1=ordOf(blk[0]);
      nbrBlock.forEach(function(x,i){x.ord=base1+i;});
      blk.forEach(function(x,i){x.ord=base1+nbrBlock.length+i;});
    }else{
      var base2=ordOf(nbrBlock[0]);
      blk.forEach(function(x,i){x.ord=base2+i;});
      nbrBlock.forEach(function(x,i){x.ord=base2+blk.length+i;});
    }
    renderAll();buildForm();commit();
  }
  /* ---------- the grid: lines to see, snapping that pulls an item to them, and a way to put everything on them ----------
     Snapping can be Magnetic (an item is pulled to a line only when it is close, so it can still go anywhere), Strict, or Off. Holding Alt while dragging moves freely. */
  D.snap='magnet';D.gtype='square';D.cols=12;D.margin=40;D.gutter=20;D.showGrid=false;
  var FREE=false;
  function colLines(){
    var N=Math.max(1,parseInt(D.cols,10)||1), m=+D.margin||0, gt=+D.gutter||0, cw=(D.w-2*m-(N-1)*gt)/N, out=[], i, a;
    if(!(cw>=4))return null;
    for(i=0;i<N;i++){a=m+i*(cw+gt);out.push(a,a+cw);}
    return {lines:out,cw:cw,N:N,m:m,gt:gt};
  }
  function snapAxis(v,axis,force){
    var g=D.grid>0?D.grid:10, mode=force||D.snap||'magnet', near, cl, i;
    if(mode==='off'||(FREE&&!force))return Math.round(v);
    if(axis==='x'&&D.gtype==='cols'&&(cl=colLines())){near=cl.lines[0];for(i=1;i<cl.lines.length;i++)if(Math.abs(cl.lines[i]-v)<Math.abs(near-v))near=cl.lines[i];}
    else near=Math.round(v/g)*g;
    if(mode==='strict'||force)return Math.round(near);
    return Math.abs(near-v)<=Math.min(g/2,8/scale)?Math.round(near):Math.round(v);
  }
  function snapV(v){return snapAxis(v,'y');}
  function snapX(v){return snapAxis(v,'x');}
  /* ---- several items at once: Shift+click adds or removes an item; the bar above the canvas then aligns or spaces them out ---- */
  var MS={};
  function msIds(){return Object.keys(MS).map(Number).filter(function(id){return !!byId(id);});}
  function msClear(){if(Object.keys(MS).length){MS={};msPaint();}}
  function msPaint(){
    var ns=canvas.querySelectorAll('.ditem'), i, ids=msIds(), bar=document.getElementById('dalign');
    for(i=0;i<ns.length;i++){var on=!!MS[ns[i].getAttribute('data-id')];if(ns[i].classList.contains('msel')!==on)ns[i].classList.toggle('msel',on);}
    if(bar){bar.hidden=ids.length<2;var n=bar.querySelector('.alcount');if(n)n.textContent=ids.length+' selected';var dd=bar.querySelectorAll('[data-dist]');for(i=0;i<dd.length;i++)dd[i].disabled=ids.length<3;}
  }
  function msToggle(it){
    if(!Object.keys(MS).length&&D.sel!=null&&D.sel!==it.id)MS[D.sel]=1;
    if(MS[it.id])delete MS[it.id];else MS[it.id]=1;
    msPaint();
  }
  function msMove(it,dx,dy,ids){
    it.x+=dx;it.y+=dy;
    if(isGroupFrame(it))descendants(it.id).forEach(function(c){if(!ids[c.id]){c.x+=dx;c.y+=dy;}});
  }
  function msAlign(how){
    var ids=msIds(), set={}, its, L, R, T, B, i;
    if(ids.length<2)return;
    ids.forEach(function(id){set[id]=1;});
    its=ids.map(byId);
    L=Math.min.apply(null,its.map(function(o){return o.x;}));R=Math.max.apply(null,its.map(function(o){return o.x+o.w;}));
    T=Math.min.apply(null,its.map(function(o){return o.y;}));B=Math.max.apply(null,its.map(function(o){return o.y+o.h;}));
    if(how==='dh'||how==='dv'){
      var hz=(how==='dh'), key=hz?'x':'y', sz=hz?'w':'h', sorted=its.slice().sort(function(a,b){return a[key]-b[key];}), total=0, gap, pos;
      if(sorted.length<3)return;
      sorted.forEach(function(o){total+=o[sz];});
      gap=((hz?R-L:B-T)-total)/(sorted.length-1);pos=hz?L:T;
      sorted.forEach(function(o){var d=Math.round(pos)-o[key];if(hz)msMove(o,d,0,set);else msMove(o,0,d,set);pos+=o[sz]+gap;});
    }else{
      its.forEach(function(o){
        var dx=0, dy=0;
        if(how==='l')dx=L-o.x;else if(how==='c')dx=(L+R)/2-(o.x+o.w/2);else if(how==='r')dx=R-(o.x+o.w);
        else if(how==='t')dy=T-o.y;else if(how==='m')dy=(T+B)/2-(o.y+o.h/2);else if(how==='b')dy=B-(o.y+o.h);
        msMove(o,Math.round(dx),Math.round(dy),set);
      });
    }
    renderAll();msPaint();commit();
  }
  /* ---- alignment guides: while an item is dragged or resized, its edges and centre snap to those of the other items (and the canvas), and a dashed line shows what it lines up with. Hold Alt to drag freely. ---- */
  var GL={v:null,h:null};
  function guidesOff(){['v','h'].forEach(function(k){if(GL[k])GL[k].style.display='none';});}
  function guideLine(k){
    if(!GL[k]){var d=el_('div','dguide '+k);canvas.insertBefore(d,selBox);GL[k]=d;}
    return GL[k];
  }
  function guideSnap(it,nx,ny,nw,nh,skip,mode){
    var thr=7/scale, tg=[{x:0,y:0,w:D.w,h:D.h}], i, o, t, k, mxs, mys, bx=null, by=null, d, r;
    for(i=0;i<D.items.length;i++){o=D.items[i];if(o.id===it.id||skip[o.id])continue;tg.push({x:o.x,y:o.y,w:o.w,h:o.h});}
    mxs=(mode==='size')?[nx+nw]:[nx,nx+nw/2,nx+nw];
    mys=(mode==='size')?[ny+nh]:[ny,ny+nh/2,ny+nh];
    tg.forEach(function(t){
      [t.x,t.x+t.w/2,t.x+t.w].forEach(function(tx){mxs.forEach(function(mx){d=tx-mx;if(Math.abs(d)<=thr&&(bx===null||Math.abs(d)<Math.abs(bx.d)))bx={d:d,at:tx};});});
      [t.y,t.y+t.h/2,t.y+t.h].forEach(function(ty){mys.forEach(function(my){d=ty-my;if(Math.abs(d)<=thr&&(by===null||Math.abs(d)<Math.abs(by.d)))by={d:d,at:ty};});});
    });
    if(bx){if(mode==='size')nw+=bx.d;else nx+=bx.d;}
    if(by){if(mode==='size')nh+=by.d;else ny+=by.d;}
    var bw=Math.max(1,1/scale), ext;
    if(bx){
      var y0=ny,y1=ny+nh;
      tg.forEach(function(t){if([t.x,t.x+t.w/2,t.x+t.w].some(function(v){return Math.abs(v-bx.at)<0.5;})){y0=Math.min(y0,t.y);y1=Math.max(y1,t.y+t.h);}});
      r=guideLine('v');r.style.display='block';r.style.left=bx.at+'px';r.style.top=y0+'px';r.style.height=(y1-y0)+'px';r.style.borderLeftWidth=bw+'px';
    }else if(GL.v)GL.v.style.display='none';
    if(by){
      var x0=nx,x1=nx+nw;
      tg.forEach(function(t){if([t.y,t.y+t.h/2,t.y+t.h].some(function(v){return Math.abs(v-by.at)<0.5;})){x0=Math.min(x0,t.x);x1=Math.max(x1,t.x+t.w);}});
      r=guideLine('h');r.style.display='block';r.style.top=by.at+'px';r.style.left=x0+'px';r.style.width=(x1-x0)+'px';r.style.borderTopWidth=bw+'px';
    }else if(GL.h)GL.h.style.display='none';
    return {x:nx,y:ny,w:nw,h:nh};
  }
  function reparentTarget(it){
    if(it.type==='frame'&&it.p.group===false&&!it.p.shape)return null;
    var cx=it.x+it.w/2, cy=it.y+it.h/2, best=null, area=1e18;
    for(var i=0;i<D.items.length;i++){
      var f=D.items[i];
      if(!isGroupFrame(f)||f.id===it.id)continue;
      if(isDesc(it.id,f.id))continue;
      if(cx>=f.x&&cx<=f.x+f.w&&cy>=f.y&&cy<=f.y+f.h){
        var a=f.w*f.h;
        if(a<area){area=a;best=f.id;}
      }
    }
    return best;
  }

  var SHADOW={none:'',soft:'0 1px 3px rgba(15,23,42,.12),0 4px 12px rgba(15,23,42,.06)',strong:'0 12px 28px rgba(15,23,42,.28)'};
  var FSTYLES={
    'Light card':{fill:'#FFFFFF',fillA:100,bcolor:'#E2E8F0',bw:1,radius:8,shadow:'soft',tcolor:'#0F172A',group:true},
    'Dark card':{fill:'#1E293B',fillA:100,bcolor:'#334155',bw:0,radius:10,shadow:'soft',tcolor:'#F1F5F9',group:true},
    'Glass':{fill:'#94A3B8',fillA:16,bcolor:'#94A3B8',bw:1,radius:10,shadow:'none',tcolor:'#F8FAFC',group:true},
    'Outline':{fill:'#FFFFFF',fillA:0,bcolor:'#94A3B8',bw:2,radius:8,shadow:'none',tcolor:'#334155',group:true},
    'Accent':{fill:'#007DB8',fillA:100,bcolor:'#007DB8',bw:0,radius:8,shadow:'soft',tcolor:'#FFFFFF',group:true},
    'Background light':{fill:'#F1F5F9',fillA:100,bcolor:'#E2E8F0',bw:0,radius:0,shadow:'none',tcolor:'#0F172A',group:false},
    'Background dark':{fill:'#0F172A',fillA:100,bcolor:'#0F172A',bw:0,radius:0,shadow:'none',tcolor:'#F1F5F9',group:false}
  };
  var TSTYLES={
    'Light tile':{fill:'#FFFFFF',fillA:100,bcolor:'#E2E8F0',bw:1,radius:8,shadow:'soft',ccolor:'#64748B',vcolor:'#0F172A'},
    'Dark tile':{fill:'#243047',fillA:100,bcolor:'#334155',bw:0,radius:10,shadow:'soft',ccolor:'#94A3B8',vcolor:'#F8FAFC'},
    'Accent tile':{fill:'#007DB8',fillA:100,bcolor:'#007DB8',bw:0,radius:8,shadow:'soft',ccolor:'#D6EEF9',vcolor:'#FFFFFF'}
  };
  var BSTYLES={
    'Info':{fill:'#0E7CC2',fillA:100,bcolor:'#0E7CC2',bw:0,radius:6,shadow:'none',tcolor:'#FFFFFF',scolor:'#DCEFFA'},
    'Success':{fill:'#16A34A',fillA:100,bcolor:'#16A34A',bw:0,radius:6,shadow:'none',tcolor:'#FFFFFF',scolor:'#DDF5E5'},
    'Warning':{fill:'#F59E0B',fillA:100,bcolor:'#F59E0B',bw:0,radius:6,shadow:'none',tcolor:'#1F1300',scolor:'#4A3000'},
    'Danger':{fill:'#DC2626',fillA:100,bcolor:'#DC2626',bw:0,radius:6,shadow:'none',tcolor:'#FFFFFF',scolor:'#FBE3E3'},
    'Dark':{fill:'#0F172A',fillA:100,bcolor:'#0F172A',bw:0,radius:6,shadow:'none',tcolor:'#F8FAFC',scolor:'#94A3B8'},
    'Light':{fill:'#F1F5F9',fillA:100,bcolor:'#CBD5E1',bw:1,radius:6,shadow:'none',tcolor:'#0F172A',scolor:'#475569'}
  };
  /* sets of status colors, shared by the Object builder and the Map designer */
  window.PMSSETS={cur:'',over:{},sets:[
    ['prtg','PRTG UI',{up:'#B8C419',warning:'#F5C500',down:'#E30613',unusual:'#F59C00',paused:'#477EC0',unknown:'#878787'}],
    ['fresh','Fresh green',{up:'#2FA84F',warning:'#F0AD22',down:'#D8402F',unusual:'#F08A22',paused:'#8B93A3',unknown:'#9AA0AD'}],
    ['vivid','Vivid',{up:'#22C55E',warning:'#FACC15',down:'#EF4444',unusual:'#F97316',paused:'#3B82F6',unknown:'#94A3B8'}],
    ['safe','Color-blind safe',{up:'#009E73',warning:'#F0E442',down:'#D55E00',unusual:'#CC79A7',paused:'#56B4E9',unknown:'#999999'}],
    ['bright','Bright, for dark cards',{up:'#4ADE80',warning:'#FBBF24',down:'#F87171',unusual:'#FB923C',paused:'#93C5FD',unknown:'#9CA3AF'}]
  ]};
  /* a drop-down list of the color sets that shows each set's six colors, not only its name; opts: get() -> chosen id, pick(id), extra [[id,label],...] rows without colors */
  window.PMSSETS.picker=function(opts){
    var PSx=window.PMSSETS, root=el_('div','csp'+(opts.inline?' csp-inline':'')), btn=el_('button','csp-btn'), pop=el_('div','csp-pop'), KEYS=['up','warning','down','unusual','paused','unknown'];
    btn.type='button';pop.hidden=true;root.appendChild(btn);root.appendChild(pop);
    function sw(set){return '<span class="sw">'+KEYS.map(function(k){return '<i style="background:'+set[k]+'"></i>';}).join('')+'</span>';}
    function row(id,label,set){
      var q=el_('button','csp-row');q.type='button';q.setAttribute('data-set',id);q.innerHTML=(set?sw(set):'')+'<span>'+label+'</span>';
      q.addEventListener('click',function(e){e.stopPropagation();close();opts.pick(id);});pop.appendChild(q);
    }
    (opts.extraFirst||[]).forEach(function(x){row(x[0],x[1],null);});
    PSx.sets.forEach(function(x){row(x[0],x[1],x[2]);});
    (opts.extra||[]).forEach(function(x){row(x[0],x[1],null);});
    function close(){pop.hidden=true;btn.classList.remove('open');document.removeEventListener('mousedown',away,true);}
    function away(e){if(!root.contains(e.target))close();}
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      if(!pop.hidden){close();return;}
      pop.hidden=false;btn.classList.add('open');
      if(opts.inline){document.addEventListener('mousedown',away,true);return;}
      var r=btn.getBoundingClientRect();pop.style.minWidth=Math.max(r.width,230)+'px';
      pop.style.left=Math.max(6,Math.min(r.left,window.innerWidth-pop.offsetWidth-6))+'px';
      var top=r.bottom+4;if(top+pop.offsetHeight>window.innerHeight-6)top=Math.max(6,r.top-pop.offsetHeight-4);pop.style.top=top+'px';
      document.addEventListener('mousedown',away,true);
    });
    root.sync=function(){
      var id=opts.get(), all=(opts.extraFirst||[]).concat(opts.extra||[]), set=null, label='';
      PSx.sets.forEach(function(x){if(x[0]===id){set=x[2];label=x[1];}});
      all.forEach(function(x){if(x[0]===id&&!set)label=x[1];});
      btn.innerHTML=(set?sw(set):'')+'<span>'+(label||'Choose\u2026')+'</span><b>\u25BE</b>';
      [].forEach.call(pop.children,function(q){q.classList.toggle('on',q.getAttribute('data-set')===id);});
    };
    root.sync();return root;
  };
  var CHIPS={success:['#DCFCE7','#166534'],warning:['#FEF3C7','#92400E'],danger:['#FEE2E2','#991B1B'],info:['#DBEAFE','#1E40AF'],neutral:['#E2E8F0','#334155']};

  /* a shape is a frame that draws a form instead of a titled card: box shapes, a line, an arrow, or a flowing arrow whose chevrons blink one after the other in the direction of the flow */
  var SHAPES=[['rect','Rectangle'],['round','Rounded rectangle'],['pill','Pill'],['circle','Circle or ellipse'],['line','Line'],['arrow','Arrow'],['flow','Flowing arrow'],
    ['b_arrow','Block arrow'],['b_dbl','Double block arrow'],['b_pent','Pentagon arrow'],['b_chev','Chevron'],['b_barb','Barbed arrow'],
    ['f_dec','Decision (diamond)'],['f_hex','Hexagon'],['f_doc','Document'],['f_para','Parallelogram'],['f_trap','Trapezoid'],['f_delay','Delay'],['f_merge','Merge (triangle)'],['f_disp','Display'],['f_off','Off-page connector'],
    ['c_rect','Callout'],['c_round','Rounded callout'],['c_pill','Pill callout'],['c_oval','Oval callout'],['c_cloud','Cloud callout']];
  var SHAPENAME={};SHAPES.forEach(function(x){SHAPENAME[x[0]]=x[1];});SHAPENAME.circle='Circle';SHAPENAME.pill='Pill';
  /* what a shape can hold: a line, an arrow and a flowing arrow are only a stroke; every other shape is a filled form that can carry text */
  var DIRKINDS={b_arrow:1,b_dbl:1,b_pent:1,b_chev:1,b_barb:1};
  function isBoxShape(k){return !!k&&k!=='line'&&k!=='arrow'&&k!=='flow';}
  function isPathShape(k){return isBoxShape(k)&&k!=='rect'&&k!=='round'&&k!=='pill'&&k!=='circle';}
  function hasDir(k){return k==='line'||k==='arrow'||k==='flow'||!!DIRKINDS[k];}
  /* the picker in the bar: [kind, direction, name] */
  var SHPCAT=[
    {g:'Lines and arrows',items:[['line','','Line'],['arrow','','Arrow'],['flow','','Flowing arrow'],['line','','Dashed line',{dash:'dashed'}],['line','','Dotted line',{dash:'dotted'}],['line','','Dash and dot line',{dash:'dashdot'}],['arrow','','Double arrow',{ha:'arrow'}],['arrow','','Elbow arrow',{lt:'elbow'}],['arrow','','Curved arrow',{lt:'curve'}],['line','','Line with round ends',{ha:'dot',hb:'dot'}],['arrow','','Open arrow',{hb:'open'}]]},
    {g:'Block arrows',items:[['b_arrow','right','Right arrow'],['b_arrow','left','Left arrow'],['b_arrow','up','Up arrow'],['b_arrow','down','Down arrow'],['b_dbl','right','Left and right arrow'],['b_dbl','down','Up and down arrow'],['b_pent','right','Pentagon arrow'],['b_chev','right','Chevron'],['b_barb','left','Barbed arrow, left'],['b_barb','right','Barbed arrow, right']]},
    {g:'Flowchart',items:[['rect','','Rectangle'],['round','','Rounded rectangle'],['pill','','Pill'],['circle','','Circle or ellipse'],['f_dec','','Decision'],['f_hex','','Hexagon'],['f_doc','','Document'],['f_para','','Parallelogram'],['f_trap','','Trapezoid'],['f_delay','','Delay'],['f_merge','','Merge'],['f_disp','','Display'],['f_off','','Off-page connector']]},
    {g:'Callouts',items:[['c_rect','','Callout'],['c_round','','Rounded callout'],['c_pill','','Pill callout'],['c_oval','','Oval callout'],['c_cloud','','Cloud callout']]}
  ];
  function nf(n){return String(Math.round(n*10)/10);}
  /* a polygon as a path with its corners rounded by r */
  function rpoly(pts,r){
    var n=pts.length, i, a, b, c, v1, v2, l1, l2, rr, d='', q, e;
    for(i=0;i<n;i++){
      a=pts[(i+n-1)%n];b=pts[i];c=pts[(i+1)%n];
      v1=[a[0]-b[0],a[1]-b[1]];v2=[c[0]-b[0],c[1]-b[1]];
      l1=Math.sqrt(v1[0]*v1[0]+v1[1]*v1[1]);l2=Math.sqrt(v2[0]*v2[0]+v2[1]*v2[1]);
      if(l1<0.01||l2<0.01)continue;
      rr=Math.max(0,Math.min(r,l1/2,l2/2));
      q=[b[0]+v1[0]/l1*rr,b[1]+v1[1]/l1*rr];e=[b[0]+v2[0]/l2*rr,b[1]+v2[1]/l2*rr];
      d+=(d?'L':'M')+nf(q[0])+' '+nf(q[1])+'Q'+nf(b[0])+' '+nf(b[1])+' '+nf(e[0])+' '+nf(e[1]);
    }
    return d+'Z';
  }
  /* the points of a block arrow that points right, in a box L long and T thick; the text goes in tb */
  function dirShape(k,L,T){
    var hl, s0, s1;
    if(k==='b_arrow'){hl=Math.min(T*0.6,L*0.5);s0=T*0.25;s1=T*0.75;return {pts:[[0,s0],[L-hl,s0],[L-hl,0],[L,T/2],[L-hl,T],[L-hl,s1],[0,s1]],tb:[6,s0,L-hl*0.55,s1]};}
    if(k==='b_pent'){hl=Math.min(T*0.5,L*0.5);return {pts:[[0,0],[L-hl,0],[L,T/2],[L-hl,T],[0,T]],tb:[6,0,L-hl*0.6,T]};}
    if(k==='b_chev'){hl=Math.min(T*0.5,L*0.45);return {pts:[[0,0],[L-hl,0],[L,T/2],[L-hl,T],[0,T],[hl,T/2]],tb:[hl+4,0,L-hl*0.6,T]};}
    if(k==='b_barb'){hl=Math.min(T*0.75,L*0.45);return {pts:[[0,T*0.38],[L-hl*0.62,T*0.38],[L-hl,0],[L,T/2],[L-hl,T],[L-hl*0.62,T*0.62],[0,T*0.62]],tb:[6,T*0.38,L-hl,T*0.62]};}
    hl=Math.min(T*0.55,L*0.3);s0=T*0.28;s1=T*0.72;   /* b_dbl */
    return {pts:[[0,T/2],[hl,0],[hl,s0],[L-hl,s0],[L-hl,0],[L,T/2],[L-hl,T],[L-hl,s1],[hl,s1],[hl,T]],tb:[hl+4,s0,L-hl-4,s1]};
  }
  /* the outline of a shape in a box w by h: {d: path, tf: optional transform, tb: [left, top, right, bottom] of the room for text} */
  function shapeGeom(k,w,h,p){
    var r=Math.max(0,+p.radius||0), d=p.dir||'right', hz, L, T, g, mp, a, th, bh, x1, x2, rr, cx, cy, rx, ry, y1, y2, xa;
    function map(q){var x=q[0], y=q[1];return d==='left'?[L-x,y]:(d==='down'?[y,x]:(d==='up'?[y,L-x]:[x,y]));}
    if(DIRKINDS[k]){
      hz=(k==='b_dbl')?(d==='right'||d==='left'):(d==='right'||d==='left');
      if(k==='b_dbl'&&(d==='up'))d='down';
      L=hz?w:h;T=hz?h:w;g=dirShape(k,L,T);
      var c1=map([g.tb[0],g.tb[1]]), c2=map([g.tb[2],g.tb[3]]);
      return {d:rpoly(g.pts.map(map),r),tb:[Math.min(c1[0],c2[0]),Math.min(c1[1],c2[1]),Math.max(c1[0],c2[0]),Math.max(c1[1],c2[1])]};
    }
    switch(k){
      case 'f_hex':a=Math.min(h*0.5,w*0.25);return {d:rpoly([[0,h/2],[a,0],[w-a,0],[w,h/2],[w-a,h],[a,h]],r),tb:[a*0.7,0,w-a*0.7,h]};
      case 'f_dec':return {d:rpoly([[w/2,0],[w,h/2],[w/2,h],[0,h/2]],r),tb:[w*0.22,h*0.22,w*0.78,h*0.78]};
      case 'f_para':a=Math.min(w*0.22,h*0.6);return {d:rpoly([[a,0],[w,0],[w-a,h],[0,h]],r),tb:[a,0,w-a,h]};
      case 'f_trap':a=Math.min(w*0.14,h*0.5);return {d:rpoly([[0,0],[w,0],[w-a,h],[a,h]],r),tb:[a,0,w-a,h]};
      case 'f_merge':return {d:rpoly([[0,0],[w,0],[w/2,h]],r),tb:[w*0.25,0,w*0.75,h*0.5]};
      case 'f_off':return {d:rpoly([[0,0],[w,0],[w,h*0.68],[w/2,h],[0,h*0.68]],r),tb:[0,0,w,h*0.68]};
      case 'f_doc':rr=Math.min(r,12,w/2);return {d:'M'+nf(rr)+' 0H'+nf(w-rr)+'Q'+nf(w)+' 0 '+nf(w)+' '+nf(rr)+'V'+nf(h*0.86)+'C'+nf(w*0.78)+' '+nf(h*0.7)+' '+nf(w*0.66)+' '+nf(h*0.7)+' '+nf(w*0.5)+' '+nf(h*0.86)+'S'+nf(w*0.22)+' '+nf(h*1.02)+' 0 '+nf(h*0.86)+'V'+nf(rr)+'Q0 0 '+nf(rr)+' 0Z',tb:[0,0,w,h*0.8]};
      case 'f_delay':rr=Math.min(h/2,w*0.5);return {d:'M0 0H'+nf(w-rr)+'A'+nf(rr)+' '+nf(h/2)+' 0 0 1 '+nf(w-rr)+' '+nf(h)+'H0Z',tb:[0,0,w-rr*0.4,h]};
      case 'f_disp':a=Math.min(h*0.45,w*0.22);rr=Math.min(h/2,w*0.3);return {d:'M'+nf(a)+' 0H'+nf(w-rr)+'A'+nf(rr)+' '+nf(h/2)+' 0 0 1 '+nf(w-rr)+' '+nf(h)+'H'+nf(a)+'L0 '+nf(h/2)+'Z',tb:[a*0.8,0,w-rr*0.4,h]};
      case 'c_rect':case 'c_round':
        th=Math.min(h*0.28,44);bh=h-th;x1=w*0.1;x2=x1+Math.min(w*0.2,50);
        return {d:rpoly([[0,0],[w,0],[w,bh],[x2,bh],[x1,h],[x1,bh],[0,bh]],k==='c_rect'?0:Math.min(r||14,bh/2)),tb:[6,0,w-6,bh]};
      case 'c_pill':
        th=Math.min(h*0.28,44);bh=h-th;rr=bh/2;x1=Math.max(w*0.1,rr+2);x2=Math.min(x1+Math.min(w*0.2,50),w-rr);
        return {d:'M'+nf(rr)+' 0H'+nf(w-rr)+'A'+nf(rr)+' '+nf(rr)+' 0 0 1 '+nf(w-rr)+' '+nf(bh)+'H'+nf(x2)+'L'+nf(x1)+' '+nf(h)+'V'+nf(bh)+'H'+nf(rr)+'A'+nf(rr)+' '+nf(rr)+' 0 0 1 '+nf(rr)+' 0Z',tb:[rr*0.5,0,w-rr*0.5,bh]};
      case 'c_oval':
        th=Math.min(h*0.26,40);bh=h-th;rx=w/2;ry=bh/2;cx=rx;cy=ry;xa=w*0.18;x2=xa+Math.min(w*0.16,46);
        y1=cy+ry*Math.sqrt(Math.max(0,1-Math.pow((xa-cx)/rx,2)));y2=cy+ry*Math.sqrt(Math.max(0,1-Math.pow((x2-cx)/rx,2)));
        return {d:'M'+nf(xa)+' '+nf(y1)+'L'+nf(xa-4)+' '+nf(h)+'L'+nf(x2)+' '+nf(y2)+'A'+nf(rx)+' '+nf(ry)+' 0 1 0 '+nf(xa)+' '+nf(y1)+'Z',tb:[w*0.12,bh*0.14,w*0.88,bh*0.86]};
      case 'c_cloud':
        return {d:'M22 58A14 14 0 0 1 12 34A18 18 0 0 1 36 14A18 18 0 0 1 66 12A16 16 0 0 1 88 26A16 16 0 0 1 88 52A16 16 0 0 1 66 64A16 16 0 0 1 38 64A10 10 0 0 1 22 58ZM20 62L10 90L38 64Z',tf:'scale('+nf(w/100)+' '+nf(h/90)+')',tb:[w*0.16,h*0.2,w*0.86,h*0.66]};
    }
    return {d:'M0 0H'+nf(w)+'V'+nf(h)+'H0Z',tb:[0,0,w,h]};
  }
  var SHF={soft:'drop-shadow(0 2px 5px rgba(15,23,42,.22))',strong:'drop-shadow(0 8px 14px rgba(15,23,42,.38))'};
  /* a filled form with room for text: the outline is an SVG path, the text sits over it */
  function pathShapeHTML(it){
    var p=it.p, w=Math.max(2,Math.round(it.w)), h=Math.max(2,Math.round(it.h)), g=shapeGeom(p.shape,w,h,p), a=(p.fillA==null?100:p.fillA)/100, bw=Math.max(0,+p.bw||0),
        ta=p.talign||'center', va=p.tvalign||'middle', jc=(ta==='left')?'flex-start':(ta==='right'?'flex-end':'center'), ai=(va==='top')?'flex-start':(va==='bottom'?'flex-end':'center'),
        tb=g.tb, pad=Math.max(0,+p.padx||0), x0=tb[0]+Math.min(pad,(tb[2]-tb[0])/3), x1=tb[2]-Math.min(pad,(tb[2]-tb[0])/3), y0=tb[1]+Math.min(+p.pady||0,(tb[3]-tb[1])/4), y1=tb[3]-Math.min(+p.pady||0,(tb[3]-tb[1])/4);
    return '<span style="display:block;position:relative;width:'+w+'px;height:'+h+'px;box-sizing:border-box;font-family:'+familyStack(p.fam)+';">'
      +'<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" style="position:absolute;left:0;top:0;display:block;overflow:visible;'+(SHF[p.shadow]?'filter:'+SHF[p.shadow]+';':'')+'"><path d="'+g.d+'"'+(g.tf?' transform="'+g.tf+'"':'')+' fill="'+(p.fill||'#007DB8')+'" fill-opacity="'+a+'"'+(bw>0?' stroke="'+(p.bcolor||'#007DB8')+'" stroke-width="'+bw+'" stroke-linejoin="round"'+(g.tf?' vector-effect="non-scaling-stroke"':''):'')+'/></svg>'
      +('<span style="position:absolute;left:'+nf(x0)+'px;top:'+nf(y0)+'px;width:'+nf(Math.max(0,x1-x0))+'px;height:'+nf(Math.max(0,y1-y0))+'px;display:flex;align-items:'+ai+';justify-content:'+jc+';text-align:'+ta+';font-size:'+p.tsize+'px;font-weight:'+p.tweight+';color:'+p.tcolor+';line-height:1.25;'+(p.titalic?'font-style:italic;':'')+(p.tunder?'text-decoration:underline;':'')+(p.tupper?'text-transform:uppercase;':'')+'"><span style="display:block;max-width:100%;">'+escMulti(p.title||'')+'</span></span>')
      +'</span>';
  }
  /* turning one kind of shape into another keeps what can be kept: a line becomes a form filled with its color, and the other way round */
  function shapeKindSwitch(p,nk){
    var was=p.shape;
    if(was&&!isBoxShape(was)&&isBoxShape(nk)){p.fill=p.color||'#007DB8';p.fillA=100;p.bcolor=p.fill;p.bw=0;p.tcolor='#FFFFFF';p.shadow='none';if(!(p.radius>0))p.radius=8;p.style='';p.talign=p.talign||'center';}
    else if(was&&isBoxShape(was)&&!isBoxShape(nk)&&/^#[0-9a-f]{6}$/i.test(p.fill||''))p.color=p.fill;
    if(isLineK(nk)&&nk!==was){delete p.lt;delete p.dash;delete p.ha;delete p.hb;delete p.anim;}
    p.shape=nk;
  }
  function newShapeP(kind,dir){
    var p=extend(newFrameP('Light card'),{title:'',shape:kind||'arrow',dir:dir||'right',thick:6,color:'#007DB8',speed:'1.6',group:false});
    if(isPathShape(p.shape)){p.fill='#007DB8';p.fillA=100;p.bcolor='#007DB8';p.bw=0;p.tcolor='#FFFFFF';p.shadow='none';p.radius=8;p.style='';p.talign='center';p.tvalign='middle';}
    return p;
  }
  /* ---------- lines: a line has two free ends, at any angle, and can be straight, an elbow or a curve ---------- */
  function isLineK(k){return k==='line'||k==='arrow'||k==='flow';}
  function isLine(it){return !!it&&it.type==='frame'&&!!it.p&&isLineK(it.p.shape);}
  function lnPad(p){return Math.max(12,Math.ceil(lnOpts(p).t*3)+8);}   /* always from the line's effective thickness, matched or not, so a thick Link style line is never clipped */
  /* what the line looks like; a kind (line, arrow, flowing arrow) only decides the defaults */
  function lnOpts(p){
    var k=p.shape;
    connNorm(p);
    if(p.matchLS!==false&&typeof LKDEF!=='undefined')   /* by default a connector previews the map's shared Link style, so the designer matches the real map */
      return {t:lkNum(LKDEF.width,1,40,5),c:lsColor(),type:lsLnType(LKDEF.line),dash:LKDEF.dash||'solid',
        ha:LKDEF.start||'none',hb:LKDEF.end||'none',anim:!!LKDEF.flow,sp:lsSpeed(),look:p.look||'plain',label:{text:p.labelStyle?(p.label||''):'',size:p.labelSize,style:p.labelStyle,color:p.labelColor,fam:p.labelFont,wt:p.labelWeight,it:!!p.labelItal,un:!!p.labelUnder,up:!!p.labelUpper,al:p.labelAlign}};
    return {t:Math.max(1,parseFloat(p.thick)||6),c:p.isConnector?lnPal(p).up:(p.color||'#007DB8'),type:p.lt||'straight',dash:p.dash||(k==='flow'?'dashed':'solid'),
      ha:p.ha||'none',hb:(p.hb!=null)?p.hb:((k==='arrow'||k==='flow')?'arrow':'none'),anim:(p.anim!=null)?!!p.anim:(k==='flow'),sp:parseFloat(p.speed)||1.6,look:p.look||'plain',label:{text:p.labelStyle?(p.label||''):'',size:p.labelSize,style:p.labelStyle,color:p.labelColor,fam:p.labelFont,wt:p.labelWeight,it:!!p.labelItal,un:!!p.labelUnder,up:!!p.labelUpper,al:p.labelAlign}};
  }
  /* the two ends inside the item's box. Until the ends are dragged they follow the box and its direction. */
  function lnPts(it){
    var p=it.p, w=it.w, h=it.h, d=p.dir||'right', m=2;
    if(p.ln&&isFinite(+p.ax))return {ax:+p.ax,ay:+p.ay,bx:+p.bx,by:+p.by};
    if(d==='left')return {ax:w-m,ay:h/2,bx:m,by:h/2};
    if(d==='down')return {ax:w/2,ay:m,bx:w/2,by:h-m};
    if(d==='up')return {ax:w/2,ay:h-m,bx:w/2,by:m};
    return {ax:m,ay:h/2,bx:w-m,by:h/2};
  }
  function lnAbs(it){var q=lnPts(it);return [[it.x+q.ax,it.y+q.ay],[it.x+q.bx,it.y+q.by]];}
  /* put the ends at these spots on the canvas; the box wraps them */
  function lnSetAbs(it,A,B){
    var pd=lnPad(it.p), x0=Math.min(A[0],B[0])-pd, y0=Math.min(A[1],B[1])-pd, x1=Math.max(A[0],B[0])+pd, y1=Math.max(A[1],B[1])+pd;
    it.x=Math.round(x0);it.y=Math.round(y0);it.w=Math.max(2,Math.round(x1-x0));it.h=Math.max(2,Math.round(y1-y0));
    it.p.ax=Math.round((A[0]-it.x)*10)/10;it.p.ay=Math.round((A[1]-it.y)*10)/10;it.p.bx=Math.round((B[0]-it.x)*10)/10;it.p.by=Math.round((B[1]-it.y)*10)/10;
    it.p.ln=true;
  }
  /* ---------- connectors: glue a line's end to a box so it follows that box ---------- */
  /* a glue is {id, s:'l'|'r'|'t'|'b'|'c', t:0..1}: which side of the target, and how far along it */
  function connAnchorAbs(g){
    var it=byId(g.id);if(!it)return null;
    var hw=it.w/2, hh=it.h/2, lx, ly;
    if(g.s==='l'){lx=-hw;ly=-hh+2*hh*g.t;}
    else if(g.s==='r'){lx=hw;ly=-hh+2*hh*g.t;}
    else if(g.s==='t'){ly=-hh;lx=-hw+2*hw*g.t;}
    else if(g.s==='c'){lx=0;ly=0;}   /* the middle: the line runs in behind the object */
    else{ly=hh;lx=-hw+2*hw*g.t;}
    var rot=(+it.rot||0)*Math.PI/180, co=Math.cos(rot), si=Math.sin(rot), cx=it.x+hw, cy=it.y+hh;
    return [cx+lx*co-ly*si,cy+lx*si+ly*co];
  }
  /* recompute a glued line's box and end points from its target(s); a free end keeps its last absolute spot */
  function connSyncOne(li){
    if(!isLine(li)||!li.p||(!li.p.ga&&!li.p.gb))return;
    var ab=lnAbs(li), A=li.p.ga?connAnchorAbs(li.p.ga):ab[0], B=li.p.gb?connAnchorAbs(li.p.gb):ab[1];
    if(li.p.ga&&!A)delete li.p.ga;if(li.p.gb&&!B)delete li.p.gb;
    if(!A)A=ab[0];if(!B)B=ab[1];
    lnSetAbs(li,A,B);
  }
  function connSyncAll(){D.items.forEach(connSyncOne);}
  /* lines glued to any of these targets need their geometry (and node) refreshed after a move/resize/rotate */
  function glueFollowers(ids){
    D.items.forEach(function(li){
      if(!isLine(li))return;
      if((li.p.ga&&ids[li.p.ga.id])||(li.p.gb&&ids[li.p.gb.id])){connSyncOne(li);refreshItem(li);}
    });
  }
  var CONN_HOV=null, CONN_HID=null;
  /* the five binding points of the object under a dragged line end: four sides and the middle (which sends the line behind it) */
  function connHilite(id,side){
    var key=(id==null)?null:id+'|'+(side||'');
    if(CONN_HOV===key)return;
    if(CONN_HID!=null){var o=nodeOf(CONN_HID);if(o){o.style.outline='';o.style.outlineOffset='';[].forEach.call(o.querySelectorAll('.cpt'),function(d){d.parentNode.removeChild(d);});}}
    CONN_HOV=key;CONN_HID=id;
    if(id!=null){
      var n=nodeOf(id);
      if(n){
        n.style.outline='2px solid #2f80ed';n.style.outlineOffset='2px';
        [['l',0,50],['r',100,50],['t',50,0],['b',50,100],['c',50,50]].forEach(function(q){
          var d=document.createElement('i');d.className='cpt'+(q[0]===side?' on':'');d.style.left=q[1]+'%';d.style.top=q[2]+'%';d.title=q[0]==='c'?'Middle: the line goes behind the object':'';n.appendChild(d);
        });
      }
    }
  }
  /* a line glued to an object's middle goes behind that object, so it seems to come out from under it */
  function connBack(li){
    var m=null;
    ['ga','gb'].forEach(function(k){var g=li.p[k],t=g&&g.s==='c'?byId(g.id):null;if(t){var o=ordOf(t);if(m===null||o<m)m=o;}});
    if(m!==null&&ordOf(li)>=m)li.ord=m-0.5;
  }
  /* what the pointer is over, for gluing a dragged line end: the topmost box item, and the nearest point on its edge */
  function connHit(pt,excludeId){
    var best=null, lx=0, ly=0;
    for(var i=D.items.length-1;i>=0;i--){
      var it=D.items[i];
      if(it.id===excludeId||isLine(it)||!(isBox(it)||it.type==='prtgobj'))continue;   /* a PRTG object drawn as an icon can be joined too */
      if(it.type==='frame'&&it.p&&it.p.group===false&&!it.p.shape)continue;   /* not the full-page background */
      var hw=it.w/2, hh=it.h/2, rot=(+it.rot||0)*Math.PI/180, co=Math.cos(-rot), si=Math.sin(-rot),
          cx=it.x+hw, cy=it.y+hh, dx=pt[0]-cx, dy=pt[1]-cy, tlx=dx*co-dy*si, tly=dx*si+dy*co;
      if(Math.abs(tlx)<=hw+6&&Math.abs(tly)<=hh+6){best=it;lx=tlx;ly=tly;break;}
    }
    if(!best)return null;
    var hw=best.w/2, hh=best.h/2, dl=Math.abs(lx+hw), dr=Math.abs(lx-hw), dt=Math.abs(ly+hh), db=Math.abs(ly-hh), m=Math.min(dl,dr,dt,db), s;
    if(m===dl)s='l';else if(m===dr)s='r';else if(m===dt)s='t';else s='b';
    if(Math.abs(lx)<=Math.max(12,hw*0.3)&&Math.abs(ly)<=Math.max(12,hh*0.3))s='c';   /* right in the middle */
    return {id:best.id,s:s,t:0.5};   /* always the center of that side: four fixed points per object, not a free slide along the edge */
  }
  /* "Branch": a second (or third...) end from the same start, so one source fans out to several targets */
  function branchLine(it){
    if(!isLine(it))return;
    var ab=lnAbs(it), c=clone(it);
    c.id=D.nextId++;c.p=clone(it.p);delete c.p.gb;
    lnSetAbs(c,ab[0],[ab[1][0]+36,ab[1][1]+36]);
    if(it.p.ga)c.p.ga=clone(it.p.ga);
    c.ord=layerOf(c)*100000+(++D.ordSeq);
    D.items.push(c);D.sel=c.id;renderAll();buildForm();commit();
  }
  function lnSvg(o,A,B,w,h,thumb){
    var t=o.t, c=o.c, dx=B[0]-A[0], dy=B[1]-A[1], hz=Math.abs(dx)>=Math.abs(dy), sg=function(v){return v<0?-1:1;}, R=function(n){return Math.round(n*100)/100;},
        L=Math.max(8,t*2.6), HW=Math.max(5,t*1.5), dist=Math.sqrt(dx*dx+dy*dy), tr, pts, i, d, dash='', cap='round', P=0, out='', s, a2=A.slice(), b2=B.slice(), C1, C2;
    var ty=o.type, ts, te, bowC=null, hx=[sg(dx),0], vy=[0,sg(dy)];
    if(ty==='bow'){var bk=dist*0.22*(B[0]<A[0]?-1:1);bowC=[(A[0]+B[0])/2+(dy/(dist||1))*bk,(A[1]+B[1])/2-(dx/(dist||1))*bk];
      var u1=[bowC[0]-A[0],bowC[1]-A[1]], u2=[B[0]-bowC[0],B[1]-bowC[1]], n1=Math.sqrt(u1[0]*u1[0]+u1[1]*u1[1])||1, n2=Math.sqrt(u2[0]*u2[0]+u2[1]*u2[1])||1;ts=[u1[0]/n1,u1[1]/n1];te=[u2[0]/n2,u2[1]/n2];}
    else if(ty==='corner'){ts=hx;te=vy;}
    else if(ty==='cornerv'){ts=vy;te=hx;}
    else if(ty==='zig'){ts=te=hx;}
    else if(ty==='zigv'){ts=te=vy;}
    else if(ty==='elbow'||ty==='sharp'||ty==='curve'){ts=te=hz?hx:vy;}
    else{ts=te=dist<0.01?[1,0]:[dx/dist,dy/dist];}
    tr=te;
    s=Math.min(L*0.9,dist*0.45);
    if(o.ha==='arrow'){a2[0]=A[0]+ts[0]*s;a2[1]=A[1]+ts[1]*s;}
    if(o.hb==='arrow'){b2[0]=B[0]-te[0]*s;b2[1]=B[1]-te[1]*s;}
    if(ty==='elbow'||ty==='sharp'||ty==='corner'||ty==='cornerv'||ty==='zig'||ty==='zigv'){
      if(ty==='corner')pts=[a2,[B[0],A[1]],b2];
      else if(ty==='cornerv')pts=[a2,[A[0],B[1]],b2];
      else if(ty==='zig')pts=[a2,[A[0]+dx*0.3,A[1]],[A[0]+dx*0.7,B[1]],b2];
      else if(ty==='zigv')pts=[a2,[A[0],A[1]+dy*0.3],[B[0],A[1]+dy*0.7],b2];
      else pts=hz?[a2,[(A[0]+B[0])/2,A[1]],[(A[0]+B[0])/2,B[1]],b2]:[a2,[A[0],(A[1]+B[1])/2],[B[0],(A[1]+B[1])/2],b2];
      var q=[pts[0]], rr=(ty==='elbow'||ty==='corner'||ty==='cornerv')?Math.min(14,Math.max(0,Math.min(Math.abs(dx),Math.abs(dy))/2)):0;
      for(i=1;i<pts.length;i++)if(Math.abs(pts[i][0]-q[q.length-1][0])+Math.abs(pts[i][1]-q[q.length-1][1])>0.01)q.push(pts[i]);
      d='M'+R(q[0][0])+' '+R(q[0][1]);
      for(i=1;i<q.length;i++){
        if(i<q.length-1&&rr>0.5){
          var p0=q[i-1], p1=q[i], p2=q[i+1], l1=Math.sqrt(Math.pow(p1[0]-p0[0],2)+Math.pow(p1[1]-p0[1],2)), l2=Math.sqrt(Math.pow(p2[0]-p1[0],2)+Math.pow(p2[1]-p1[1],2)), r1=Math.min(rr,l1/2,l2/2);
          d+='L'+R(p1[0]-(p1[0]-p0[0])/l1*r1)+' '+R(p1[1]-(p1[1]-p0[1])/l1*r1)+'Q'+R(p1[0])+' '+R(p1[1])+' '+R(p1[0]+(p2[0]-p1[0])/l2*r1)+' '+R(p1[1]+(p2[1]-p1[1])/l2*r1);
        }else d+='L'+R(q[i][0])+' '+R(q[i][1]);
      }
    }else if(ty==='bow'){
      d='M'+R(a2[0])+' '+R(a2[1])+'Q'+R(bowC[0])+' '+R(bowC[1])+' '+R(b2[0])+' '+R(b2[1]);
    }else if(ty==='curve'){
      C1=hz?[A[0]+dx/2,A[1]]:[A[0],A[1]+dy/2];C2=hz?[A[0]+dx/2,B[1]]:[B[0],A[1]+dy/2];
      d='M'+R(a2[0])+' '+R(a2[1])+'C'+R(C1[0])+' '+R(C1[1])+' '+R(C2[0])+' '+R(C2[1])+' '+R(b2[0])+' '+R(b2[1]);
    }else d='M'+R(a2[0])+' '+R(a2[1])+'L'+R(b2[0])+' '+R(b2[1]);
    var dsh=o.dash;
    if(dsh==='solid'&&o.anim)dsh='dashed';
    if(dsh==='dashed'){dash=R(t*3)+' '+R(t*2);cap='butt';P=t*5;}
    else if(dsh==='dotted'){dash='0.01 '+R(t*2.2);P=t*2.2+0.01;}
    else if(dsh==='dashdot'){dash=R(t*3)+' '+R(t*1.6)+' 0.01 '+R(t*1.6);cap='butt';P=t*6.2+0.01;}
    out='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" style="display:block;overflow:visible;pointer-events:none;">';
    /* a Connector showing status can carry a different colour at each end; blend them across the middle
       exactly as the pushed live version does, so the canvas and the real map agree */
    var paint=c, c2=o.c2||c;
    if(o.gid&&c2!==c){
      out+='<defs><linearGradient id="'+o.gid+'" gradientUnits="userSpaceOnUse" x1="'+R(A[0])+'" y1="'+R(A[1])+'" x2="'+R(B[0])+'" y2="'+R(B[1])+'">'+
        '<stop offset="0%" stop-color="'+c+'"/><stop offset="48%" stop-color="'+c+'"/>'+
        '<stop offset="52%" stop-color="'+c2+'"/><stop offset="100%" stop-color="'+c2+'"/></linearGradient></defs>';
      paint='url(#'+o.gid+')';
    }
    if(!thumb)out+='<path d="'+d+'" fill="none" stroke="rgba(0,0,0,0)" stroke-width="'+Math.max(t,14)+'" style="pointer-events:stroke;"/>';
    var lk=null, lkOn=!!o.look&&o.look!=='plain';
    if(lkOn||(o.label&&o.label.text&&!thumb))lk=mkLook({look:lkOn?o.look:'plain',d:d,paint:paint,w:t,c1:c,c2:c2,uid:o.uid||('x'+Math.round(A[0]*31+A[1]*17+B[0]*7)),anim:!!o.anim&&!thumb,sp:o.sp,thumb:!!thumb,label:thumb?null:o.label});
    if(lkOn)out+=lk.defs+lk.body;
    else{
    out+='<path d="'+d+'" fill="none" stroke="'+paint+'" stroke-width="'+R(t)+'" stroke-linecap="'+cap+'" stroke-linejoin="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'>';
    if(o.anim&&P&&!thumb)out+='<animate attributeName="stroke-dashoffset" from="'+R(P)+'" to="0" dur="'+R(P/(60*(1.6/o.sp)))+'s" repeatCount="indefinite"/>';
    out+='</path>';
    }
    function head(kind,Pt,ov,hc){
      var n=[-ov[1],ov[0]], bx=Pt[0]-ov[0]*L, by=Pt[1]-ov[1]*L;
      if(kind==='arrow')return '<path d="M'+R(Pt[0])+' '+R(Pt[1])+'L'+R(bx+n[0]*HW)+' '+R(by+n[1]*HW)+'L'+R(bx-n[0]*HW)+' '+R(by-n[1]*HW)+'Z" fill="'+hc+'" stroke="'+hc+'" stroke-width="1" stroke-linejoin="round"/>';
      if(kind==='open'){bx=Pt[0]-ov[0]*L*0.9;by=Pt[1]-ov[1]*L*0.9;return '<path d="M'+R(bx+n[0]*HW)+' '+R(by+n[1]*HW)+'L'+R(Pt[0])+' '+R(Pt[1])+'L'+R(bx-n[0]*HW)+' '+R(by-n[1]*HW)+'" fill="none" stroke="'+hc+'" stroke-width="'+R(t)+'" stroke-linecap="round" stroke-linejoin="round"/>';}
      if(kind==='dot')return '<circle cx="'+R(Pt[0])+'" cy="'+R(Pt[1])+'" r="'+R(Math.max(t*1.2,4))+'" fill="'+hc+'"/>';
      return '';
    }
    out+=head(o.ha,A,[-ts[0],-ts[1]],c)+head(o.hb,B,te,c2)+(lk?(thumb?lk.over:lk.over.replace('<g data-lbl="1">','<g data-lbl="1" style="pointer-events:all;cursor:text">')):'')+'</svg>';
    return out;
  }
  /* Is this line meant to take its colour from what it joins? Matched connectors follow the shared Link
     style's own setting; unmatched ones carry their own. */
  function lnStatusMode(p){
    if(p.isConnector)return true;
    if(p.matchLS!==false&&typeof LKDEF!=='undefined')return LKDEF.colorMode!=='custom';
    return p.colorMode!=='custom';
  }
  /* PRTG's state letters and the palette the live link uses, kept here because this canvas is its own
     closure -- the same pairing the pushed runtime carries, so both ends of the workflow agree */
  var LNSTLET={g:'up',r:'down',y:'warning',o:'unusual',b:'paused',bl:'paused',gr:'unknown'};
  var LNSTCOL={up:'#b4cc38',down:'#d71920',warning:'#ffd400',unusual:'#f5821f',paused:'#3b8dd0',unknown:'#9aa4af'};
  /* the colour one end should take, from whatever state that object reported out of its preview frame */
  function lnEndColor(g,pal){
    if(!g)return null;
    var st=(DASHAPI&&DASHAPI.pvst)?DASHAPI.pvst[String(g.id)]:null;
    var k=st?LNSTLET[st]:null;
    return k?(pal||LNSTCOL)[k]:null;
  }
  function lineHTML(it){
    var q=lnPts(it), o=lnOpts(it.p), p=it.p, ca, cb;
    /* with no live preview loaded, or an end that reports no state, this simply does not apply and the
       line keeps its plain colour -- the canvas never invents a status it has not been told about */
    if(p.isConnector){
      var pal=lnPal(p);
      if(p.ga&&p.gb){ca=lnEndColor(p.ga,pal);cb=lnEndColor(p.gb,pal);}
      o=extend({},o);
      /* until the objects it joins report a state this shows one end up and one end down, as a stand-in */
      if(ca||cb){o.c=ca||cb;o.c2=cb||ca;}else{o.c=pal.up;o.c2=pal.down;}
      o.gid='lng'+it.id;
    }
    o=extend({},o);o.uid='i'+it.id;
    return lnSvg(o,[q.ax,q.ay],[q.bx,q.by],it.w,it.h,false);
  }
  function shapeHTML(it){
    var p=it.p, k=p.shape, w=it.w, h=it.h, c=p.color||'#007DB8', t=Math.max(1,parseInt(p.thick,10)||6), d=p.dir||'right', hz=(d==='right'||d==='left'),
        rad, css, dirs, long, S, tw, n, sp, step, rot, chev='', i, dl, ah, al, head;
    if(isLineK(k))return lineHTML(it);
    if(isPathShape(k))return pathShapeHTML(it);
    if(k==='rect'||k==='round'||k==='pill'||k==='circle'){
      rad=(k==='rect')?'0':(k==='pill'?'9999px':(k==='circle'?'50%':(p.radius+'px')));
      var sta=p.talign||'center', sva=p.tvalign||'middle';
      return '<span style="display:flex;align-items:'+(sva==='top'?'flex-start':(sva==='bottom'?'flex-end':'center'))+';justify-content:'+(sta==='left'?'flex-start':(sta==='right'?'flex-end':'center'))+';text-align:'+sta+';'+cardCss(p,it)+'border-radius:'+rad+';font-size:'+p.tsize+'px;font-weight:'+p.tweight+';color:'+p.tcolor+';line-height:1.25;">'+(p.title?escMulti(p.title):'')+'</span>';
    }
    return '';
  }
  function newFrameP(style){return extend({title:'Title',fam:'Inter',tsize:18,tweight:'600',padx:20,pady:16,style:style},FSTYLES[style]);}
  function newTileP(style){return extend({caption:'Caption',value:'1,234',delta:'+4.2%',dir:'up',dcolor:'',fam:'Inter',csize:14,vsize:40,dsize:14,padx:18,pady:14,style:style},TSTYLES[style]);}
  function newBannerP(style){return extend({title:'Banner headline',sub:'',fam:'Inter',tsize:28,ssize:15,tweight:'700',align:'center',fit:false,padx:24,pady:12,style:style},BSTYLES[style]);}
  function newChipP(){return {text:'Operational',variant:'success',fam:'Inter',size:13};}

  function cardCss(p,it){
    var a=(p.fillA==null?100:p.fillA)/100;
    var s='width:'+it.w+'px;height:'+it.h+'px;box-sizing:border-box;background:'+rgba(p.fill,a)+';';
    if(p.bw>0)s+='border:'+p.bw+'px solid '+p.bcolor+';';
    if(p.radius>0)s+='border-radius:'+p.radius+'px;';
    var sh=SHADOW[p.shadow]||'';
    if(sh)s+='box-shadow:'+sh+';';
    s+='padding:'+p.pady+'px '+p.padx+'px;overflow:hidden;font-family:'+familyStack(p.fam)+';';
    if(p.titalic)s+='font-style:italic;';
    if(p.tunder)s+='text-decoration:underline;';
    if(p.tupper)s+='text-transform:uppercase;';
    return s;
  }
  function frameHTML(it){
    var p=it.p;
    if(p.shape)return shapeHTML(it);
    return '<span style="display:block;'+cardCss(p,it)+'font-size:'+p.tsize+'px;font-weight:'+p.tweight+';color:'+p.tcolor+';line-height:1.25;'+(p.talign&&p.talign!=='left'?'text-align:'+p.talign+';':'')+'">'+(p.title?escMulti(p.title):'')+'</span>';
  }
  function tileHTML(it){
    var p=it.p;
    var dc=p.dcolor||(p.dir==='up'?'#16A34A':(p.dir==='down'?'#DC2626':'#64748B'));
    var arrow=p.dir==='up'?'&#9650; ':(p.dir==='down'?'&#9660; ':'');
    var h='<span style="display:block;'+cardCss(p,it)+'">'
      +'<span style="display:block;font-size:'+p.csize+'px;font-weight:500;color:'+p.ccolor+';line-height:1.2;">'+esc(p.caption||'')+'</span>'
      +'<span style="display:block;font-size:'+p.vsize+'px;font-weight:700;color:'+p.vcolor+';line-height:1.15;margin-top:6px;white-space:nowrap;">'+esc(p.value||'')+'</span>';
    if(p.delta)h+='<span style="display:block;font-size:'+p.dsize+'px;font-weight:600;color:'+dc+';margin-top:4px;">'+arrow+esc(p.delta)+'</span>';
    return h+'</span>';
  }
  /* a banner is one block of text in a box. With Fit on, the text grows and shrinks with the box; otherwise the sizes are the ones typed. */
  function bannerSizes(it){
    var p=it.p, lines=String(p.title||' ').split(/\r?\n/), longest=1, i, t, s, availH, availW, hasSub=!!p.sub, subLines=hasSub?String(p.sub).split(/\r?\n/).length:0;
    if(!p.fit)return {t:Math.max(6,+p.tsize||28),s:Math.max(6,+p.ssize||15)};
    for(i=0;i<lines.length;i++)longest=Math.max(longest,lines[i].length);
    availH=Math.max(10,it.h-2*(+p.pady||0));availW=Math.max(10,it.w-2*(+p.padx||0));
    t=Math.min((availH-(hasSub?6:0))/(lines.length*1.15+(hasSub?subLines*0.55*1.25:0)),availW/(longest*0.56));
    t=Math.max(8,Math.min(Math.floor(t*0.92),400));
    return {t:t,s:Math.max(6,Math.round(t*0.5))};
  }
  function bannerHTML(it){
    var p=it.p, z=bannerSizes(it), left=(p.align==='left'), right=(p.align==='right'), ai=left?'flex-start':(right?'flex-end':'center');
    return '<span style="display:flex;flex-direction:column;justify-content:center;align-items:'+ai+';text-align:'+(p.align||'center')+';'+cardCss(p,it)+'">'
      +'<span style="display:block;font-size:'+z.t+'px;font-weight:'+p.tweight+';color:'+p.tcolor+';line-height:1.15;">'+escMulti(p.title||'')+'</span>'
      +(p.sub?'<span style="display:block;font-size:'+z.s+'px;color:'+(p.scolor||p.tcolor)+';line-height:1.25;margin-top:4px;">'+escMulti(p.sub)+'</span>':'')+'</span>';
  }
  function chipHTML(it){
    var p=it.p, c=CHIPS[p.variant]||CHIPS.neutral;
    return '<span style="display:inline-block;padding:'+Math.round(p.size*0.4)+'px '+Math.round(p.size*0.95)+'px;border-radius:999px;background:'+c[0]+';color:'+c[1]+';font-family:'+familyStack(p.fam)+';font-size:'+p.size+'px;font-weight:600;letter-spacing:.4px;text-transform:'+(p.tupper===false?'none':'uppercase')+';white-space:nowrap;line-height:1.2;'+(p.titalic?'font-style:italic;':'')+(p.tunder?'text-decoration:underline;':'')+'">'+esc(p.text||'')+'</span>';
  }

  function fontsOf(it){if(it.type==='prtgobj')return [];
    if(it.type==='frame')return [[it.p.fam,it.p.tweight||'400']];
    if(it.type==='tile')return [[it.p.fam,'500'],[it.p.fam,'700'],[it.p.fam,'600']];
    if(it.type==='banner')return [[it.p.fam,it.p.tweight||'700'],[it.p.fam,'400']];
    if(it.type==='chip')return [[it.p.fam,'600']];
    return [[it.state.v.fam,it.state.v.weight||'400']];
  }
  function fontMap(){
    var m={};
    for(var i=0;i<D.items.length;i++){
      var f=fontsOf(D.items[i]);
      for(var j=0;j<f.length;j++){
        if(!f[j][0]||isLocalFont(f[j][0]))continue;
        if(!m[f[j][0]])m[f[j][0]]={};
        m[f[j][0]][f[j][1]]=1;
      }
    }
    return m;
  }
  function fontLinks(){
    var m=fontMap(), out=[], fams=Object.keys(m).sort();
    for(var i=0;i<fams.length;i++){
      var ws=Object.keys(m[fams[i]]).map(Number).sort(function(a,b){return a-b;});
      out.push({fam:fams[i],href:'https://fonts.googleapis.com/css2?family='+fams[i].replace(/ /g,'+')+':wght@'+ws.join(';')+'&display=swap'});
    }
    return out;
  }
  /*PURE-END*/

  function el_(tag,cls,html){var n=document.createElement(tag);if(cls)n.className=cls;if(html!=null)n.innerHTML=html;return n;}
  function toast(t){var n=document.getElementById('toast');n.textContent=t;n.classList.add('show');setTimeout(function(){n.classList.remove('show');},1500);}
  function copyText(t){
    var done=function(ok){toast(ok?'Copied':'Copy failed. Select the code and copy it by hand.');};
    try{
      var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');
      ta.style.position='fixed';ta.style.left='-9999px';
      document.body.appendChild(ta);ta.select();
      if(ta.setSelectionRange)ta.setSelectionRange(0,t.length);
      var ok=document.execCommand('copy');
      document.body.removeChild(ta);
      if(ok){done(true);return;}
    }catch(e){}
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(t).then(function(){done(true);},function(){done(false);});
    }else done(false);
  }

  /* ---------- label / button state ---------- */
  function snapshot(){
    var s={v:{},c:{}};
    ids.forEach(function(i){var e=el[i];if(!e)return;if(e.type==='checkbox')s.c[i]=e.checked;else s.v[i]=e.value;});
    return s;
  }
  function applySnap(s){
    ids.forEach(function(i){
      var e=el[i];if(!e)return;
      if(e.type==='checkbox'){
        if(s.c&&(i in s.c))e.checked=!!s.c[i];
        else if(baseSnap&&baseSnap.c&&(i in baseSnap.c))e.checked=!!baseSnap.c[i];
      }else{
        var src=(s.v&&(i in s.v))?s.v:((baseSnap&&baseSnap.v&&(i in baseSnap.v))?baseSnap.v:null);
        if(!src)return;
        var prev=e.value;
        e.value=src[i];
        if(e.tagName==='SELECT'&&e.value===''&&prev!=='')e.value=prev;
      }
    });
  }
  function applyPresetTo(s,v){for(var k in v){if(typeof v[k]==='boolean')s.c[k]=v[k];else s.v[k]=String(v[k]);}}
  function defaultState(type){
    var s=clone(baseSnap);
    applyPresetTo(s,(type==='button'?BTN_PRESETS[0]:LBL_PRESETS[0]).v);
    s.v.txt=(type==='button')?'Button':'Label';
    s.v.link='';s.v.linktype='map';
    s.c.newtab=false;s.c.loadfont=true;s.c.liveedit=true;
    return s;
  }
  function stateHTML(it){
    var keep=snapshot(), keepMode=mode, keepSlug=SLUG_OVERRIDE, code='';
    try{
      mode=(it.type==='button')?'button':'label';
      applySnap(it.state);
      el.loadfont.checked=false;
      SLUG_OVERRIDE='pbd'+it.id;
      code=buildCode();
    }catch(err){code='<span>error</span>';}
    SLUG_OVERRIDE=keepSlug;mode=keepMode;applySnap(keep);
    return code;
  }

  /* ---------- names ---------- */
  var TYPENAME={frame:'Frame',banner:'Banner',tile:'Number tile',label:'Label',button:'Button',chip:'Status chip',prtgobj:'PRTG object'};
  var ICON={frame:'F',banner:'R',tile:'N',label:'T',button:'B',chip:'C',prtgobj:'O'};
  function itemName(it){
    var n='';
    if(it.type==='frame')n=it.p.title||'';
    else if(it.type==='tile')n=it.p.caption||'';
    else if(it.type==='banner')n=it.p.title||'';
    else if(it.type==='chip')n=it.p.text||'';
    else if(it.type==='prtgobj')n=it.p.name||'';
      else n=it.state.v.txt||'';
    n=String(n).split(/\r?\n/)[0];
    if(!n)n=(it.type==='frame'&&it.p.shape)?(it.p.isConnector?'Connector':(SHAPENAME[it.p.shape]||'Shape')):((it.type==='frame'&&it.p.group===false)?'Background':TYPENAME[it.type]);
    return n.length>30?n.substring(0,29)+'\u2026':n;
  }

  /* ---------- rendering ---------- */
  function oe(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
    /* a PRTG object file is drawn by PRTG, so the canvas shows a labelled box of the right size */
    function objHTML(it){
      if(it.p.raw){
        var doc='<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden;font:13px Segoe UI,Arial,sans-serif}</style></head><body>'+String(it.p.before||'')+String(it.p.after||'')+'</body></html>';
        return '<iframe sandbox="" scrolling="no" tabindex="-1" aria-hidden="true" title="Custom HTML" style="display:block;border:0;width:'+Math.round(it.w)+'px;height:'+Math.round(it.h)+'px;pointer-events:none;background:transparent" srcdoc="'+doc.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"></iframe>';
      }
      var t=it.p.target||{}, tn=t.name||(t.id?('ID '+t.id):'no target chosen'), st=(DASHAPI.pv||{})[it.id], line='PRTG draws this object.';
      if(st&&st.state==='ok')return '<span style="display:block;width:'+Math.round(it.w)+'px;height:'+Math.round(it.h)+'px"></span>';   /* the live preview is drawn behind this transparent box, which takes the clicks */
      if(st&&st.state==='loading')line='Loading PRTG\u2019s drawing\u2026';
      else if(st&&st.state==='error')line='No live preview: '+oe(st.msg)+'.';
      return '<span style="display:block;width:'+Math.round(it.w)+'px;height:'+Math.round(it.h)+'px;box-sizing:border-box;border:2px dashed #7b8cc4;border-radius:8px;background:repeating-linear-gradient(135deg,#eef1fb,#eef1fb 10px,#e4e9f8 10px,#e4e9f8 20px);color:#2a3358;font:12px/1.35 Segoe UI,Arial,sans-serif;padding:10px 12px;overflow:hidden"><span style="display:block;font-size:11px;color:#5b6aa6">'+oe(it.p.cat)+'</span><span style="display:block;font-size:15px;font-weight:600">'+oe(it.p.name)+'</span><span style="display:block;margin-top:6px">Shows: '+oe(tn)+'</span><span style="display:block;color:#6b7399;margin-top:2px">'+line+' Size '+Math.round(it.w)+' \u00D7 '+Math.round(it.h)+'</span></span>';
    }
    /* a link on the whole object (frames, banners, tiles, chips): the object is wrapped in an anchor. Labels and buttons carry their own link. */
    function linkWrap(it,h){
      var p=it.p, raw=String((p&&p.link)||'').trim(), href;
      if(!raw||(it.type!=='frame'&&it.type!=='banner'&&it.type!=='tile'&&it.type!=='chip'))return h;
      if((p.linktype||'map')==='map'){var id=raw.replace(/[^0-9]/g,'');href=id?'/map.htm?id='+id:'';}
      else href=/^(https?:\/\/|\/|mailto:|#)/i.test(raw)?esc(raw):esc('https://'+raw);
      if(!href)return h;
      return '<a href="'+href+'"'+(p.newtab?' target="_blank" rel="noopener"':'')+' style="display:'+(it.type==='chip'?'inline-block':'block')+';text-decoration:none;color:inherit;">'+h+'</a>';
    }
    function itemInner(it){
    var h;
    if(it.type==='frame')h=frameHTML(it);
    else if(it.type==='tile')h=tileHTML(it);
    else if(it.type==='banner')h=bannerHTML(it);
    else if(it.type==='chip')h=chipHTML(it);
      else if(it.type==='prtgobj')h=objHTML(it);
    else h=stateHTML(it);
    h=linkWrap(it,h);
    if(+it.rot&&canRotate(it))h='<div data-rotw="1" style="display:block;'+(isBox(it)?'width:'+it.w+'px;height:'+it.h+'px;':'width:max-content;')+'transform:rotate('+(+it.rot)+'deg);transform-origin:50% 50%;">'+h+'</div>';
    htmlCache[it.id]=h;
    return h;
  }
  function makeNode(it,z){
    var d=el_('div','ditem');
    d.setAttribute('data-id',String(it.id));
    d.style.left=it.x+'px';d.style.top=it.y+'px';d.style.zIndex=String(z);
    if(isBox(it)||it.type==='prtgobj'){d.style.width=it.w+'px';d.style.height=it.h+'px';}
    else d.style.width='max-content';
    if(it.type==='prtgobj'&&((DASHAPI.pv||{})[it.id]||{}).state==='ok')d.className+=' pvok';
    if(isLine(it))d.style.pointerEvents='none';   /* only the line itself can be clicked, not the empty corners of its box */
    d.innerHTML=itemInner(it);
    return d;
  }
  function nodeOf(id){return canvas.querySelector('.ditem[data-id="'+id+'"]');}
  function measure(){
    for(var i=0;i<D.items.length;i++){
      var it=D.items[i];
      if(isBox(it)||it.type==='prtgobj')continue;
      var n=nodeOf(it.id);
      if(n){it.w=Math.max(1,Math.ceil(n.offsetWidth));it.h=Math.max(1,Math.ceil(n.offsetHeight));}
    }
  }
  function updateFonts(){
    var links=fontLinks(), sig=links.map(function(l){return l.href;}).join('|');
    if(sig===fontSig)return;
    fontSig=sig;
    var old=document.querySelectorAll('link[data-dfont]');
    for(var i=0;i<old.length;i++)old[i].parentNode.removeChild(old[i]);
    links.forEach(function(l){var n=document.createElement('link');n.rel='stylesheet';n.href=l.href;n.setAttribute('data-dfont','1');document.head.appendChild(n);});
    if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){if(DASHAPI.active){measure();updateSel();buildList();}});}
  }
  function renderAll(){
    connSyncAll();
    var olds=canvas.querySelectorAll('.ditem');for(var oi=0;oi<olds.length;oi++)olds[oi].parentNode.removeChild(olds[oi]);   /* the live preview layer stays put, so previews do not reload on every redraw */
    var ord=order();
    for(var i=0;i<ord.length;i++)canvas.appendChild(makeNode(ord[i],i+1));
    canvas.appendChild(selBox);
    measure();updateSel();buildList();updateFonts();syncCode();msPaint();
    try{document.dispatchEvent(new Event('dashrender'));}catch(e){}
  }
  function refreshItem(it){
    var old=nodeOf(it.id);
    var z=old?old.style.zIndex:'1';
    var n=makeNode(it,parseInt(z,10)||1);
    if(old)old.parentNode.replaceChild(n,old);else canvas.insertBefore(n,selBox);
    measure();updateSel();updateFonts();syncCode();
    try{document.dispatchEvent(new Event('dashrender'));}catch(e){}   /* a different target means a different drawing */
  }
  function place(it){var n=nodeOf(it.id);if(n){n.style.left=it.x+'px';n.style.top=it.y+'px';}if(DASHAPI.onMove)DASHAPI.onMove(it);}
  canvas.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(a&&canvas.contains(a))e.preventDefault();},true);
  function updateSel(){
    var it=byId(D.sel);
    if(!it){selBox.style.display='none';fbarPlace(null);return;}
    selBox.style.display='block';
    selBox.style.left=it.x+'px';selBox.style.top=it.y+'px';
    selBox.style.width=it.w+'px';selBox.style.height=it.h+'px';
    selBox.style.borderWidth=Math.max(1,1.5/scale)+'px';
    var ln=isLine(it), rot=+it.rot||0, sz=canSize(it)&&!ln, sw=it.w*scale, sh=it.h*scale;
    selBox.classList.toggle('isln',ln);
    selBox.style.transform=(rot&&!ln)?'rotate('+rot+'deg)':'';
    selBox.style.setProperty('--rh',(30/scale)+'px');selBox.style.setProperty('--ps',String(1/scale));
    lnA.style.display=lnB.style.display=ln?'block':'none';
    if(ln){var qp=lnPts(it);lnA.style.left=qp.ax+'px';lnA.style.top=qp.ay+'px';lnB.style.left=qp.bx+'px';lnB.style.top=qp.by+'px';lnA.classList.toggle('glued',!!it.p.ga);lnB.classList.toggle('glued',!!it.p.gb);}
    rotH.style.display=canRotate(it)?'block':'none';
    rotH.classList.toggle('dn',rotFlip(it));
    var hpx=Math.max(8,Math.min(13,Math.min(sw,sh)/2.2));   /* smaller handles on a small item, so they do not cover it */
    selBox.style.setProperty('--hs',(hpx/scale)+'px');selBox.style.setProperty('--hb',((hpx>10?2:1.5)/scale)+'px');
    handle.style.display=sz?'block':'none';
    /* the corners always show; the middle of an edge only when the item is big enough for them not to crowd the corners */
    if(HND)Object.keys(HND).forEach(function(k){
      var mid=(k==='n'||k==='s'||k==='e'||k==='w'), ok=sz&&(!mid||((k==='n'||k==='s')?sw>=64:sh>=64));
      HND[k].style.display=ok?'block':'none';
      HND[k].style.cursor=handleCursor(k,rot)+'-resize';
    });
    fbarPlace(it);
  }
  var HND={se:handle}, CUR={nw:'nwse',n:'ns',ne:'nesw',e:'ew',se:'nwse',s:'ns',sw:'nesw',w:'ew'};
  /* the resize arrow turns with a turned item, to the nearest of the four it can show */
  var HANG={e:0,se:45,s:90,sw:135,w:180,nw:225,n:270,ne:315};
  function handleCursor(k,rot){var a=(((HANG[k]+(rot||0))%180)+180)%180, i=Math.round(a/45)%4;return ['ew','nwse','ns','nesw'][i];}
  function canRotate(it){return !!it&&it.type!=='prtgobj'&&!isLine(it);}
  /* the turn handle hangs off the top; when that is off the canvas it goes to the bottom instead */
  function rotFlip(it){var th=(+it.rot||0)*Math.PI/180;return (it.y+it.h/2)-(it.h/2+30/scale)*Math.cos(th)<12/scale;}
  /* the two round ends of a line, and the handle that turns any other item */
  var lnA=el_('div','dh dln'), lnB=el_('div','dh dln'), rotH=el_('div','drot');
  selBox.appendChild(lnA);selBox.appendChild(lnB);selBox.appendChild(rotH);
  rotH.title='Drag to rotate (Shift snaps to 15\u00B0, double-click to reset)';
  function cvPt(e){var r=canvas.getBoundingClientRect();return [(e.clientX-r.left)/scale,(e.clientY-r.top)/scale];}
  function normRot(r){return ((((r+180)%360)+360)%360)-180;}
  [[lnA,'a'],[lnB,'b']].forEach(function(x){
    x[0].addEventListener('mousedown',function(e){
      e.preventDefault();e.stopPropagation();
      var it=byId(D.sel);if(!it)return;
      var ab=lnAbs(it);
      drag={mode:'ln',w:x[1],it:it,sx:e.clientX,sy:e.clientY,A0:ab[0],B0:ab[1]};
    });
  });
  rotH.addEventListener('mousedown',function(e){
    e.preventDefault();e.stopPropagation();
    var it=byId(D.sel);if(!it)return;
    var cx=it.x+it.w/2, cy=it.y+it.h/2, pt=cvPt(e), kids=[];
    if(isGroupFrame(it))descendants(it.id).forEach(function(k){
      var o={k:k,x:k.x,y:k.y,r:+k.rot||0};
      if(isLine(k))o.ab=lnAbs(k);
      kids.push(o);
    });
    drag={mode:'rot',it:it,cx:cx,cy:cy,a0:Math.atan2(pt[1]-cy,pt[0]-cx),r0:+it.rot||0,kids:kids};
  });
  rotH.addEventListener('dblclick',function(e){
    e.stopPropagation();
    var it=byId(D.sel);if(!it||!it.rot)return;
    var cx=it.x+it.w/2, cy=it.y+it.h/2, d=-(+it.rot);
    it.rot=0;
    if(isGroupFrame(it))descendants(it.id).forEach(function(k){rotAround(k,cx,cy,d,{x:k.x,y:k.y,r:+k.rot||0,ab:isLine(k)?lnAbs(k):null});});
    renderAll();buildForm();commit();
  });
  /* turn a kid of a turned group about the group's centre */
  function rotAround(k,cx,cy,deg,o){
    var a=deg*Math.PI/180, co=Math.cos(a), si=Math.sin(a);
    function rp(p){var x=p[0]-cx, y=p[1]-cy;return [cx+x*co-y*si,cy+x*si+y*co];}
    if(o.ab){lnSetAbs(k,rp(o.ab[0]),rp(o.ab[1]));return;}
    var c=rp([o.x+k.w/2,o.y+k.h/2]);
    k.x=Math.round(c[0]-k.w/2);k.y=Math.round(c[1]-k.h/2);k.rot=Math.round(normRot(o.r+deg));
  }
  handle.className='dh';handle.setAttribute('data-ax','se');
  ['nw','n','ne','e','s','sw','w'].forEach(function(k){
    var d=el_('div','dh');d.setAttribute('data-ax',k);HND[k]=d;selBox.appendChild(d);
  });
  Object.keys(HND).forEach(function(k){
    HND[k].style.cursor=CUR[k]+'-resize';
    HND[k].addEventListener('mousedown',function(e){
      e.preventDefault();e.stopPropagation();
      var it=byId(D.sel);if(!it)return;
      drag={mode:'size',ax:k,sx:e.clientX,sy:e.clientY,it:it,ox:it.x,oy:it.y,ow:it.w,oh:it.h};
    });
  });
  /* ---------- a bar over the selected item: font, size, bold, italic, underline, color, alignment, a link for the whole object, duplicate and delete ---------- */
  var fbar=null, fbarKey='', fbarTimer=null, fbarRefs=null;
  function tsGet(it){
    var p=it.p, v;
    if(it.type==='label'||it.type==='button'){v=parseFloat(it.state&&it.state.v&&it.state.v.size);return isNaN(v)?null:v;}
    if(it.type==='frame')return (p.shape&&!isBoxShape(p.shape))?null:(+p.tsize||18);
    if(it.type==='tile')return +p.vsize||40;
    if(it.type==='chip')return +p.size||13;
    if(it.type==='banner')return p.fit?null:(+p.tsize||28);
    return null;
  }
  function tsSet(it,v){
    var p=it.p, old, f;
    v=Math.max(6,Math.min(400,Math.round(v)));
    if(it.type==='label'||it.type==='button')it.state.v.size=String(v);
    else if(it.type==='frame')p.tsize=v;
    else if(it.type==='tile'){old=+p.vsize||40;f=v/old;p.vsize=v;p.csize=Math.max(6,Math.round((+p.csize||14)*f));p.dsize=Math.max(6,Math.round((+p.dsize||14)*f));}
    else if(it.type==='chip')p.size=v;
    else if(it.type==='banner'){old=+p.tsize||28;f=v/old;p.tsize=v;p.ssize=Math.max(6,Math.round((+p.ssize||15)*f));}
  }
  /* what each kind of item lets the bar change: pairs of [get, set], or null when the item has no such thing */
  function fbAcc(it){
    var t=it.type, p=it.p||{}, s=it.state||{v:{},c:{}}, v=s.v, c=s.c, o={}, ck;
    function pp(k,d){return [function(){return p[k]==null?d:p[k];},function(x){p[k]=x;}];}
    function pw(){return [function(){return (+p.tweight||400)>=600;},function(b){p.tweight=b?'700':'400';}];}
    if(t==='label'||t==='button'){
      ck=(t==='button')?'blabel':'color';
      o.fam=[function(){return v.fam;},function(x){v.fam=x;}];
      o.bold=[function(){return (+v.weight||400)>=600;},function(b){v.weight=b?'700':'400';}];
      o.ital=[function(){return !!c.italic;},function(b){c.italic=!!b;}];
      o.und=[function(){return !!c.underline;},function(b){c.underline=!!b;}];
      o.upper=[function(){return !!c.upper;},function(b){c.upper=!!b;}];
      o.color=[function(){return v[ck];},function(x){v[ck]=x;}];
      o.align=[function(){return v.talign||(t==='button'?'center':'left');},function(x){v.talign=x;}];
      o.link={g:function(k){return k==='newtab'?!!c.newtab:(v[k]==null?'':v[k]);},s:function(k,x){if(k==='newtab')c.newtab=!!x;else v[k]=x;}};
      return o;
    }
    if(t==='frame'&&p.shape&&!isBoxShape(p.shape)){
      o.color=pp('color','#007DB8');
    }else if(t==='frame'){
      o.fam=pp('fam','Inter');o.bold=pw();o.ital=pp('titalic',false);o.und=pp('tunder',false);o.upper=pp('tupper',false);o.color=pp('tcolor','#0F172A');
      o.align=pp('talign',p.shape?'center':'left');
      if(p.shape)o.valign=pp('tvalign','middle');
    }else if(t==='banner'){
      o.fam=pp('fam','Inter');o.bold=pw();o.ital=pp('titalic',false);o.und=pp('tunder',false);o.upper=pp('tupper',false);o.color=pp('tcolor','#FFFFFF');o.align=pp('align','center');
    }else if(t==='tile'){
      o.fam=pp('fam','Inter');o.ital=pp('titalic',false);o.und=pp('tunder',false);o.upper=pp('tupper',false);o.color=pp('vcolor','#0F172A');
    }else if(t==='chip'){
      o.fam=pp('fam','Inter');o.ital=pp('titalic',false);o.und=pp('tunder',false);o.upper=[function(){return p.tupper!==false;},function(b){p.tupper=!!b;}];
    }else return o;
    o.link={g:function(k){return k==='newtab'?!!p.newtab:(k==='linktype'?(p.linktype||'map'):(p.link||''));},s:function(k,x){if(k==='newtab')p.newtab=!!x;else p[k]=x;}};
    return o;
  }
  /* fill, border, corner radius and shadow: what the bar's box menu edits, as {l: label, k: kind, a: [get,set]} */
  var LNHEADS=[['none','None'],['arrow','Arrow'],['open','Open arrow'],['dot','Dot']];
  function fbBox(it){
    var t=it.type, p=it.p||{}, st=it.state||{v:{},c:{}}, v=st.v, c=st.c, SH=[['none','None'],['soft','Soft'],['strong','Strong']];
    function P(k,d){return [function(){return p[k]==null?d:p[k];},function(x){p[k]=x;}];}
    function V(k,d){return [function(){return v[k]==null?d:v[k];},function(x){v[k]=String(x);}];}
    if(t==='frame'&&isLineK(p.shape)){
      var lo=lnOpts(p);
      function LP(k,g){return [function(){return lnOpts(p)[g||k];},function(x){p[k]=x;}];}
      var ml=[{l:'Match Link style',k:'chk',a:[function(){return p.matchLS!==false;},function(x){p.matchLS=!!x;}]}];
      if(p.ga&&p.gb)ml.push({l:'Push as a live link in PRTG',k:'chk',a:[function(){return !!p.pushLive;},function(x){p.pushLive=!!x;}]});
      if(p.matchLS===false){
        /* only a Connector can take its colour from what it joins; a plain Shapes line has no ends to read */
        if(p.isConnector)ml.push({l:'Colour',k:'sel',opts:[['status','From each end’s status'],['custom','One colour']],
          a:[function(){return p.colorMode==='custom'?'custom':'status';},function(x){p.colorMode=x;}]});
        return ml.concat([{l:'Thickness',k:'num',min:1,max:40,a:P('thick',6)},
          {l:'Line type',k:'sel',opts:LNTYPES,a:LP('lt','type')},
          {l:'Line style',k:'sel',opts:[['solid','Solid'],['dashed','Dashed'],['dotted','Dotted'],['dashdot','Dash and dot']],a:LP('dash')},
          {l:'Start',k:'sel',opts:LNHEADS,a:LP('ha')},{l:'End',k:'sel',opts:LNHEADS,a:LP('hb')},
          {l:'Animate flow',k:'chk',a:[function(){return lnOpts(p).anim;},function(x){p.anim=!!x;}]},
          {l:'Flow speed',k:'sel',opts:[['3','Slow'],['1.6','Normal'],['0.8','Fast']],a:[function(){return String(p.speed||'1.6');},function(x){p.speed=x;}]}]);
      }
      return ml;   /* matched: the look comes from the Link style object (Object builder), so there is nothing else to set here */
    }
    if(t==='banner'||t==='tile'||(t==='frame'&&!(p.shape&&!isBoxShape(p.shape)))){
      return [{l:'Fill',k:'color',a:P('fill','#FFFFFF')},{l:'Fill opacity %',k:'num',min:0,max:100,a:P('fillA',100)},
        {l:'Border',k:'color',a:P('bcolor','#E2E8F0')},{l:'Border width',k:'num',min:0,max:20,a:P('bw',0)},
        {l:'Corner radius',k:'num',min:0,max:80,a:P('radius',0)},{l:'Shadow',k:'sel',opts:SH,a:P('shadow','none')}];
    }
    if(t==='label'||t==='button'){
      var shw=[['none','None'],['soft','Soft'],['strong','Strong'],['glow','Glow']], out=[];
      if(t==='label'){
        out.push({l:'Show fill',k:'chk',a:[function(){return !!c.usebg;},function(x){c.usebg=!!x;}]});
        out.push({l:'Fill',k:'color',a:[function(){return v.bg||'#FFFFFF';},function(x){v.bg=x;c.usebg=true;}]});
        out.push({l:'Fill opacity %',k:'num',min:0,max:100,a:V('bgalpha',100)});
      }else out.push({l:'Fill',k:'color',a:V('bface','#007DB8')});
      out.push({l:'Border',k:'color',a:V('bcolor','#007DB8')},{l:'Border width',k:'num',min:0,max:8,a:V('bwidth',0)},
        {l:'Corner radius',k:'num',min:0,max:40,a:V('radius',0)},{l:'Shadow',k:'sel',opts:shw,a:V('boxshadow','none')});
      return out;
    }
    return null;
  }
  function swStyle(t){return 'background:'+(t.fill||'#fff')+';color:'+(t.tcolor||t.vcolor||'#0F172A')+';border:1px solid '+(t.bcolor||'#ddd')+';border-radius:'+Math.min(t.radius||4,8)+'px;padding:4px 10px;font-size:12px;font-weight:600;display:inline-block;line-height:1.3;';}
  /* the presets that suit an item, as {n: name, sw: swatch style, g: group, go: function that applies it} */
  function fbPresets(it){
    var t=it.type, out=[], k;
    function tbl(T,skip){Object.keys(T).forEach(function(k){if(skip&&skip.test(k))return;out.push({n:k,sw:swStyle(T[k]),go:function(){extend(it.p,T[k]);it.p.style=k;if(it.p.shape)it.p.group=false;}});});}
    if(t==='label'||t==='button'){
      (t==='button'?BTN_PRESETS:LBL_PRESETS).forEach(function(p){out.push({n:p.n,g:p.g,sw:p.sw,tip:p.tip,go:function(){
        var v=it.state.v, c=it.state.c, keep={txt:v.txt,link:v.link,linktype:v.linktype,newtab:c.newtab};
        applyPresetTo(it.state,p.v);v.txt=keep.txt;v.link=keep.link;v.linktype=keep.linktype;c.newtab=keep.newtab;}});});
    }else if(t==='frame'&&(!it.p.shape||isBoxShape(it.p.shape)))tbl(FSTYLES,/^Background/);
    else if(t==='frame'&&it.p.shape&&it.p.isConnector){
      LNLOOKS.forEach(function(x){out.push({g:'Line look',n:x[1],html:lookThumb(x[0],72,34),on:(it.p.look||'plain')===x[0],go:function(){it.p.look=x[0];}});});
      [['none','No text'],['pill','Pill'],['solid','Filled'],['plain','Text only']].forEach(function(x){
        out.push({g:'Text on the line',n:x[1],html:lblThumb(x[0]),on:(it.p.labelStyle||'none')===x[0],go:function(){
          if(x[0]==='none')it.p.labelStyle='';else{it.p.labelStyle=x[0];if(!it.p.label)it.p.label='Text';}
        }});
      });
    }
    else if(t==='frame'&&it.p.shape){
      [['Slate','#475569'],['Blue','#007DB8'],['Green','#2FA84F'],['Amber','#F0AD22'],['Red','#D8402F'],['White','#FFFFFF']].forEach(function(c){
        out.push({n:c[0],sw:'display:inline-block;width:44px;height:6px;border-radius:3px;color:transparent;background:'+c[1]+';'+(c[1]==='#FFFFFF'?'border:1px solid #CBD2DC;':''),go:function(){it.p.color=c[1];}});
      });
    }
    else if(t==='tile')tbl(TSTYLES);
    else if(t==='banner')tbl(BSTYLES);
    else if(t==='chip')Object.keys(CHIPS).forEach(function(k){out.push({n:k.charAt(0).toUpperCase()+k.slice(1),sw:'background:'+CHIPS[k][0]+';color:'+CHIPS[k][1]+';border-radius:999px;padding:3px 10px;font-size:11px;font-weight:600;display:inline-block;',go:function(){it.p.variant=k;}});});
    return out;
  }
  /* a grid of preset buttons, the same look as the presets of a label or button */
  function fbPresetGrid(it,list,done){
    var g=el_('div','presetgrid'), last=null;
    list.forEach(function(p){
      if(p.g&&p.g!==last){g.appendChild(el_('div','pgroup',p.g));last=p.g;}
      var b=el_('button','presetchip');b.type='button';if(p.tip)b.title=p.tip;
      b.innerHTML='<span class="swatch">'+(p.html?p.html:'<span style="'+p.sw+'">Aa</span>')+'</span><span class="pname"></span>';
      if(p.on)b.className+=' on';
      b.lastChild.textContent=p.n;
      b.addEventListener('click',function(e){e.stopPropagation();fbApply(it,p.go);commit();buildList();if(done)done();});
      g.appendChild(b);
    });
    return g;
  }
  /* the Colors menu of the bar: pick a set, then click one of its status colors to put it on this item as fill or as text/shape color */
  function fbColorsFill(it,pop,A,FD){
    if(it.p&&it.p.isConnector){
      var PSc=window.PMSSETS, pkc;
      pop.appendChild(el_('div','cs-h','Status colors for this line'));
      pkc=PSc.picker({inline:true,extraFirst:[['','Standard status colors']],get:function(){return it.p.colorSet||'';},pick:function(id){fbApply(it,function(){it.p.colorSet=id;});pkc.sync();}});
      fbStop(pkc);pop.appendChild(pkc);
      pop.appendChild(el_('p','note','Each end of the line takes the color its status has in this set, on the canvas and on the live map.'));
      return;
    }
    var PSd=window.PMSSETS, pk, rows=el_('div'), NAMES=[['up','Up'],['warning','Warning'],['down','Down'],['unusual','Unusual'],['paused','Paused'],['unknown','Unknown']];
    pop.appendChild(el_('div','cs-h','Color set'));
    var shown=PSd.cur||PSd.sets[0][0];
    pk=PSd.picker({inline:true,get:function(){return shown;},pick:function(id){shown=id;PSd.cur=id;pk.sync();draw();}});fbStop(pk);
    pop.appendChild(pk);pop.appendChild(rows);
    function setNow(){var r=PSd.sets[0][2];PSd.sets.forEach(function(x){if(x[0]===shown)r=x[2];});return r;}
    function draw(){
      rows.innerHTML='';
      var set=setNow();
      [[FD?'Fill':null,FD?function(c){FD.a[1](c);}:null],[A.color?((FD||it.type!=='frame')?'Text':'Color'):null,A.color?function(c){A.color[1](c);}:null]].forEach(function(r){
        if(!r[0])return;
        var row=el_('div','cs-row');row.appendChild(el_('b',null,r[0]));
        NAMES.forEach(function(n){
          var b=el_('button','cs-sw');b.type='button';b.style.background=set[n[0]];b.title=r[0]+': '+n[1]+' ('+set[n[0]]+')';b.setAttribute('aria-label',b.title);
          b.addEventListener('click',function(e){e.stopPropagation();fbApply(it,function(){r[1](set[n[0]]);});});
          row.appendChild(b);
        });
        rows.appendChild(row);
      });
    }
    draw();
  }
  var fbFlip=false, fbForceAbove=false;
  function fbCloseAll(){if(!fbar)return;if(fbFlip||fbForceAbove){fbFlip=false;fbForceAbove=false;var si=byId(D.sel);if(si)setTimeout(function(){fbarPlace(si);},0);}[].forEach.call(fbar.querySelectorAll('.fb-pop'),function(p){p.hidden=true;});[].forEach.call(fbar.querySelectorAll('.fb.open'),function(b){b.classList.remove('open');});}
  function fbRePlace(){if(fbar&&!fbar.hidden){var si=byId(D.sel);if(si)fbarPlace(si);}}
  window.addEventListener('scroll',fbRePlace,true);window.addEventListener('resize',fbRePlace);
  function fbToggle(pop,btn){
    var open=pop.hidden;fbCloseAll();pop.hidden=!open;if(btn)btn.classList.toggle('open',open);
    /* a menu opens on the side of the bar away from the item, so it never covers what you are editing.
       It takes the side with more room: upward from a bar above the item, or downward from a bar moved under it; a menu taller than the room scrolls */
    pop.classList.remove('up');pop.style.maxHeight='';
    if(!open||!fbar)return;
    var kk=(fbar.offsetHeight?fbar.getBoundingClientRect().height/fbar.offsetHeight:1)||1, need=(pop.offsetHeight+8)*kk, si=byId(D.sel);
    var wasAbove=fbar.getAttribute('data-pos')==='above', fr=fbar.getBoundingClientRect(), bh=fr.height;
    var wh=window.innerHeight;
    var upRoom, downRoom;
    if(wasAbove){upRoom=fr.top-8;downRoom=wh-(itemBottomPx(si)+10+bh)-8;}
    else{downRoom=wh-fr.bottom-8;upRoom=itemTopPx(si)-10-bh-8;}
    var up=(need<=upRoom)||(need>downRoom&&upRoom>=downRoom);
    if(upRoom<=0&&downRoom<=0)up=wasAbove;   /* no room either way: the bar stays where it is */
    if(up&&!wasAbove&&upRoom>0){fbFlip=false;fbForceAbove=true;if(si)fbarPlace(si);}
    else if(!up&&wasAbove){fbFlip=true;if(si)fbarPlace(si);}
    if(up&&fbar.getAttribute('data-pos')==='above')pop.classList.add('up');
    var r2=fbar.getBoundingClientRect(), room=(pop.classList.contains('up')?r2.top-8:wh-r2.bottom-8)/kk-8;
    if(pop.offsetHeight>room){pop.style.maxHeight=Math.max(80,Math.floor(room))+'px';pop.style.overflowY='auto';}
  }
  /* the selected item's top and bottom edge in the window, turn handle included (as fbarPlace measures it) */
  function itemTopPx(it){if(!it)return 0;var wr=wrap.getBoundingClientRect(),bb=itemBox(it);return wr.top+bb.y*scale;}
  function itemBottomPx(it){if(!it)return window.innerHeight;var wr=wrap.getBoundingClientRect(),bb=itemBox(it);return wr.top+(bb.y+bb.h)*scale;}
  function fbFit(pop){   /* a menu that opens downward never runs off the bottom of the window */
    if(pop.hidden||pop.classList.contains('up'))return;
    var av=window.innerHeight-pop.getBoundingClientRect().top-8;
    if(pop.offsetHeight>av){pop.style.maxHeight=Math.max(160,av)+'px';pop.style.overflowY='auto';}
  }
  /* a line that is perfectly flat looks the same whatever its type, so choosing Elbow or Curve moves a free end sideways enough to show the shape */
  function lnShowType(it,v){
    var p=it.p;if(v==='straight'||(p.ga&&p.gb))return;
    var q=lnAbs(it), A=q[0], B=q[1], dx=B[0]-A[0], dy=B[1]-A[1], hz=Math.abs(dx)>=Math.abs(dy), mv=!p.gb, P=mv?B:A, sgn=mv?1:-1, off, o2;
    if(hz?Math.abs(dy)>=6:Math.abs(dx)>=6)return;
    off=Math.max(30,Math.min(70,Math.abs(hz?dx:dy)*0.35));
    o2=hz?[P[0],P[1]+off*sgn]:[P[0]+off*sgn,P[1]];
    if(hz?(o2[1]<0||o2[1]>D.h):(o2[0]<0||o2[0]>D.w))o2=hz?[P[0],P[1]-off*sgn]:[P[0]-off*sgn,P[1]];
    if(mv)lnSetAbs(it,A,o2);else lnSetAbs(it,o2,B);
  }
  document.addEventListener('mousedown',function(e){if(fbar&&!fbar.hidden&&!fbar.contains(e.target))fbCloseAll();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&fbar&&!fbar.hidden)fbCloseAll();});
  function fbApply(it,fn){
    fn();refreshItem(it);
    clearTimeout(fbarTimer);fbarTimer=setTimeout(function(){commit();buildList();if(D.sel===it.id)buildForm();},350);
  }
  var FB_SVG={
    b:'<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>',
    i:'<path d="M10 5h8M6 19h8M15 5l-6 14"/>',
    u:'<path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14"/>',
    a:'<path d="M5 18 12 4l7 14M8 13h8"/>',
    link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    vtop:'<path d="M4 3h16M4 21h16"/><rect x="8" y="6" width="8" height="5" rx="1"/>',vmid:'<path d="M4 3h16M4 21h16"/><rect x="8" y="9.5" width="8" height="5" rx="1"/>',vbot:'<path d="M4 3h16M4 21h16"/><rect x="8" y="13" width="8" height="5" rx="1"/>',
    shape:'<rect x="3" y="11" width="9" height="9" rx="1.5"/><circle cx="16" cy="8" r="5"/>',
    look:'<path d="M3 17c4 0 4-10 9-10s5 10 9 10"/><path d="M3 21h18" opacity=".4"/>',
    lbl:'<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
    fill:'<path d="m5.5 11.5 6-6 7 7-6 6z"/><path d="M20 15.5s1.5 1.7 1.5 2.7a1.5 1.5 0 0 1-3 0c0-1 1.5-2.7 1.5-2.7z"/>',
    left:'<path d="M4 6h16M4 12h10M4 18h14"/>',center:'<path d="M4 6h16M7 12h10M5 18h14"/>',right:'<path d="M4 6h16M10 12h10M6 18h14"/>',
    dup:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    del:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    lnk:'<path d="M5 19C5 9 19 15 19 5"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/>',
    box:'<rect x="4" y="4" width="16" height="16" rx="5"/><path d="M4 12h8V4" opacity=".55"/>',
    layer:'<path d="m12 4 8 4-8 4-8-4z"/><path d="m4 12 8 4 8-4"/><path d="m4 16 8 4 8-4"/>'
  };
  function fbarBtn(cls,tip,svg,fn){
    var b=el_('button','fb '+cls);b.type='button';b.setAttribute('aria-label',tip);b.setAttribute('data-tip',tip);
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+svg+'</svg>';
    b.addEventListener('click',function(e){e.stopPropagation();fn();});return b;
  }
  function fbStop(n){['mousedown','click','keydown','dblclick'].forEach(function(ev){n.addEventListener(ev,function(e){e.stopPropagation();});});}
  /* a small picture of a shape for the picker */
  function shapeThumb(k,d,extra){
    var w=46, h=28, p, g, a='#475569';
    if(isLineK(k)){
      var lo=lnOpts(extend({shape:k,color:a,thick:2.6,matchLS:false},extra||{}));
      lo.anim=false;
      return lnSvg(lo,[7,((extra&&(extra.lt))?21:14)],[39,((extra&&(extra.lt))?7:14)],46,28,true).replace('<svg ','<svg viewBox="0 0 46 28" ');
    }
    if(k==='rect')return '<svg viewBox="0 0 46 28"><rect x="4" y="5" width="38" height="18" fill="'+a+'"/></svg>';
    if(k==='round')return '<svg viewBox="0 0 46 28"><rect x="4" y="5" width="38" height="18" rx="5" fill="'+a+'"/></svg>';
    if(k==='pill')return '<svg viewBox="0 0 46 28"><rect x="4" y="5" width="38" height="18" rx="9" fill="'+a+'"/></svg>';
    if(k==='circle')return '<svg viewBox="0 0 46 28"><ellipse cx="23" cy="14" rx="19" ry="10" fill="'+a+'"/></svg>';
    if(d==='up'||d==='down'){w=28;h=28;}
    p={radius:3,dir:d||'right',shape:k};
    g=shapeGeom(k,w,h,p);
    return '<svg viewBox="0 0 '+w+' '+h+'"><path d="'+g.d+'"'+(g.tf?' transform="'+g.tf+'"':'')+' fill="'+a+'"/></svg>';
  }
  function lnThumb(extra){
    var lo=lnOpts(extend({shape:'line',color:'#475569',thick:2.6,matchLS:false},extra||{}));
    lo.anim=false;
    return lnSvg(lo,[7,(extra&&extra.flat)?14:21],[39,(extra&&extra.flat)?14:7],46,28,true).replace('<svg ','<svg viewBox="0 0 46 28" ');
  }
  /* change what an item draws, keeping its place; a turn between flat and upright swaps width and height */
  function lnSame(p,k,extra){
    /* which shape-grid preset this is: always compares the item's own stored fields, regardless of "Match Link style" */
    var a=lnOpts(extend(extend({},p),{matchLS:false})), b=lnOpts(extend({shape:k,matchLS:false},extra||{}));
    return a.type===b.type&&a.dash===b.dash&&a.ha===b.ha&&a.hb===b.hb&&a.anim===b.anim;
  }
  function setShape(it,k,d,extra){
    var p=it.p, was=(p.dir==='left'||p.dir==='right'||!p.dir), tmp, now;
    shapeKindSwitch(p,k);
    if(isLineK(k)){
      delete p.lt;delete p.dash;delete p.ha;delete p.hb;delete p.anim;if(extra)extend(p,extra);
      if(extra&&(extra.lt||extra.dash||extra.ha||extra.hb))p.matchLS=false;   /* picking a specific look here means they want it, not the shared Link style */
    }
    if(d&&hasDir(k))p.dir=d;
    if(!hasDir(k))p.dir='right';
    now=(p.dir==='left'||p.dir==='right'||!p.dir);
    if(hasDir(k)&&was!==now){tmp=it.w;it.w=it.h;it.h=tmp;}
    if(k==='c_cloud'||k==='c_oval'||k==='f_dec'){if(it.h<it.w*0.35)it.h=Math.round(it.w*0.5);}
    refreshItem(it);buildList();buildForm();commit();
  }
  function fbarBuild(it){
    var A=fbAcc(it), R={}, sz=tsGet(it), sep=function(){fbar.appendChild(el_('span','fb-sep'));}, any=false;
    fbar.innerHTML='';fbarRefs=R;
    if(A.fam){
      var fs=el_('select','fb-s');fs.title='Font';fs.setAttribute('aria-label','Font');
      famOpts().forEach(function(o){var op=el_('option');op.value=o[0];op.textContent=o[1];fs.appendChild(op);});
      fs.addEventListener('change',function(){fbApply(it,function(){A.fam[1](fs.value);});});fbStop(fs);
      fbar.appendChild(fs);R.fam=fs;any=true;
    }
    if(sz!==null){
      var inp=el_('input','fb-n');inp.type='number';inp.min='6';inp.max='400';inp.setAttribute('list','fbsizes');inp.title='Text size in px';inp.setAttribute('aria-label','Text size in px');
      inp.addEventListener('input',function(){var n=parseFloat(inp.value);if(!isNaN(n)&&n>=6)fbApply(it,function(){tsSet(it,n);});});fbStop(inp);
      fbar.appendChild(inp);R.size=inp;any=true;
      if(!document.getElementById('fbsizes')){var dl=el_('datalist');dl.id='fbsizes';[8,9,10,11,12,14,16,18,20,24,28,32,36,48,60,72,96].forEach(function(n){var o=el_('option');o.value=String(n);dl.appendChild(o);});document.body.appendChild(dl);}
    }else if(it.type==='banner'&&it.p.fit){fbar.appendChild(el_('span','fb-note','Text follows the box'));any=true;}
    if(A.bold||A.ital||A.und||A.upper){
      sep();
      [['bold','Bold','b'],['ital','Italic','i'],['und','Underline','u'],['upper','UPPERCASE','aa']].forEach(function(d){
        if(!A[d[0]])return;
        var b=fbarBtn('fb-t',d[1],FB_SVG[d[2]]||'',function(){fbApply(it,function(){A[d[0]][1](!A[d[0]][0]());});});
        if(d[2]==='aa')b.innerHTML='<span class="fb-aa">AA</span>';
        fbar.appendChild(b);R[d[0]]=b;
      });
    }
    var BX0=fbBox(it), FD=null;
    if(BX0)BX0.forEach(function(d){if(d.l==='Fill'&&d.k==='color')FD=d;});
    if(A.color&&!(it.p&&it.p.isConnector)){   /* labels and buttons have no p: reading it.p.isConnector threw and left them without a bar */
      sep();
      var cname=FD?'Text color':(it.type==='frame'&&it.p.shape?'Shape color':'Color');
      var cl=el_('label','fb fb-c');cl.setAttribute('data-tip',cname);cl.setAttribute('aria-label',cname);
      cl.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+FB_SVG.a+'</svg><i class="fb-sw"></i>';
      var ci=el_('input');ci.type='color';
      ci.addEventListener('input',function(){fbApply(it,function(){A.color[1](ci.value);});cl.style.setProperty('--sw',ci.value);});
      ci.addEventListener('change',function(){commit();buildList();});fbStop(ci);fbStop(cl);
      cl.appendChild(ci);fbar.appendChild(cl);R.color=ci;R.colorBox=cl;
    }
    if(FD){
      var fl=el_('label','fb fb-c');fl.setAttribute('data-tip',(it.type==='frame'&&it.p.shape)?'Shape color':'Fill color');fl.setAttribute('aria-label','Fill color');
      fl.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+FB_SVG.fill+'</svg><i class="fb-sw"></i>';
      var fi=el_('input');fi.type='color';
      fi.addEventListener('input',function(){fbApply(it,function(){FD.a[1](fi.value);});fl.style.setProperty('--sw',fi.value);});
      fi.addEventListener('change',function(){commit();buildList();});fbStop(fi);fbStop(fl);
      fl.appendChild(fi);fbar.appendChild(fl);R.fill=fi;R.fillBox=fl;R.fillD=FD;
    }
    if(A.color||FD||(it.p&&it.p.isConnector)){
      sep();
      var pcb=fbarBtn('fb-t','Status colors: apply a color of the chosen set','<circle cx="8" cy="9" r="3.2"/><circle cx="16" cy="9" r="3.2"/><circle cx="12" cy="15.5" r="3.2"/>',function(){fbToggle(pcp,pcb);});
      var pcp=el_('div','fb-pop fb-colors');pcp.hidden=true;fbStop(pcp);
      fbColorsFill(it,pcp,A,FD);
      fbar.appendChild(pcb);fbar.appendChild(pcp);
    }
    if(A.align){
      var order=['left','center','right'];
      var ab=fbarBtn('fb-t','Align text',FB_SVG.left,function(){fbApply(it,function(){var c=A.align[0]();A.align[1](order[(order.indexOf(c)+1)%3]);});});
      fbar.appendChild(ab);R.align=ab;
    }
    if(A.valign){
      var vorder=['top','middle','bottom'];
      var vb=fbarBtn('fb-t','Vertical align',FB_SVG.vmid,function(){fbApply(it,function(){var c=A.valign[0]();A.valign[1](vorder[(vorder.indexOf(c)+1)%3]);});});
      fbar.appendChild(vb);R.valign=vb;
    }
    var PL=fbPresets(it);
    if(PL.length){
      sep();
      var pb=fbarBtn('fb-t','Presets','<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',function(){fbToggle(pp2,pb);});
      var pp2=el_('div','fb-pop fb-presets');pp2.hidden=true;fbStop(pp2);
      pp2.appendChild(fbPresetGrid(it,PL,function(){fbCloseAll();}));
      fbar.appendChild(pb);fbar.appendChild(pp2);R.pre=pb;
    }
    var BX=(it.p&&it.p.isConnector)?null:fbBox(it);
    if(BX){
      var xb=fbarBtn('fb-t',isLine(it)?'Line type, style and ends':'Fill, border, corner radius and shadow',isLine(it)?FB_SVG.lnk:FB_SVG.box,function(){fbToggle(xp,xb);});
      var xp=el_('div','fb-pop fb-box');xp.hidden=true;fbStop(xp);R.bx=[];
      BX.forEach(function(d){
        var row=el_('label','fb-row'), ctl, ev='input';
        row.appendChild(el_('span',null,d.l));
        if(d.k==='sel'){ctl=el_('select');d.opts.forEach(function(o){var op=el_('option');op.value=o[0];op.textContent=o[1];ctl.appendChild(op);});ev='change';}
        else if(d.k==='chk'){ctl=el_('input');ctl.type='checkbox';ev='change';}
        else{ctl=el_('input');ctl.type=(d.k==='color')?'color':'number';if(d.k==='num'){ctl.min=d.min;ctl.max=d.max;}}
        ctl.addEventListener(ev,function(){
          var x;
          if(d.k==='chk')x=ctl.checked;else if(d.k==='num'){x=parseFloat(ctl.value);if(isNaN(x))return;x=Math.max(d.min,Math.min(d.max,x));}else x=ctl.value;
          fbApply(it,function(){d.a[1](x);});
        });
        fbStop(ctl);row.appendChild(ctl);xp.appendChild(row);R.bx.push({d:d,c:ctl});
      });
      fbar.appendChild(xb);fbar.appendChild(xp);R.box=xb;
      if(isLine(it)&&it.p.ga){
        var brb=fbarBtn('fb-t','Branch: add another end from this same start',
          '<circle cx="5" cy="12" r="2.4"/><path d="M7.3 12H13M13 12L19 7M13 12L19 17" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="19.5" cy="7" r="1.8"/><circle cx="19.5" cy="17" r="1.8"/>',
          function(){branchLine(it);});
        fbar.appendChild(brb);R.branch=brb;
      }
    }
    if(it.type==='frame'&&it.p.shape&&!it.p.isConnector){
      var kb=fbarBtn('fb-t','Change shape',FB_SVG.shape,function(){fbToggle(kp,kb);});
      var kp=el_('div','fb-pop fb-shapes');kp.hidden=true;fbStop(kp);
      (it.p.isConnector?SHPCAT.slice(0,1):SHPCAT).forEach(function(g){   /* a Connector stays a line/arrow — it never offers to become a flowchart box or callout */
        kp.appendChild(el_('div','pgroup',g.g));
        var grid=el_('div','shpgrid');
        g.items.forEach(function(x){
          var b=el_('button','shpb'), cur=(it.p.shape===x[0])&&(isLineK(x[0])?lnSame(it.p,x[0],x[3]):true)&&(!x[1]||!hasDir(x[0])||(it.p.dir||'right')===x[1]||(x[0]==='b_dbl'&&((it.p.dir==='left'||it.p.dir==='right')===(x[1]==='right'))));
          b.type='button';b.title=x[2];b.setAttribute('aria-label',x[2]);if(cur)b.className+=' on';
          b.innerHTML=shapeThumb(x[0],x[1],x[3]);
          b.addEventListener('click',function(e){e.stopPropagation();setShape(it,x[0],x[1],x[3]);});
          grid.appendChild(b);
        });
        kp.appendChild(grid);
      });
      fbar.appendChild(kb);fbar.appendChild(kp);R.shp=kb;
    }
    if(it.p&&it.p.isConnector){
      sep();
      var softT=null;
      function soft(fn){fn();refreshItem(it);clearTimeout(softT);softT=setTimeout(function(){commit();},400);}
      /* line settings: thickness, the shape of the line, both ends and the flow */
      var lsb=fbarBtn('fb-t','Line: thickness, type, ends and animation',FB_SVG.lnk,function(){fbToggle(lsp,lsb);});
      var lsp=el_('div','fb-pop fb-line');lsp.hidden=true;fbStop(lsp);
      var lnPick=function(title,items,get,set,thumb){
        lsp.appendChild(el_('div','pgroup',title));
        var grid=el_('div','shpgrid'), btns=[];
        if(items.length>4&&items.length%3===0)grid.style.gridTemplateColumns='repeat(3,1fr)';
        items.forEach(function(x){
          var b=el_('button','shpb'+(get()===x[0]?' on':''));b.type='button';b.title=x[1];b.setAttribute('aria-label',x[1]);
          b.innerHTML=thumb(x[0]);
          b.addEventListener('click',function(e){e.stopPropagation();soft(function(){set(x[0]);});btns.forEach(function(y){y[1].classList.toggle('on',y[0]===x[0]);});});
          btns.push([x[0],b]);grid.appendChild(b);
        });
        lsp.appendChild(grid);
      };
      var thk=el_('label','fb-row');thk.appendChild(el_('span',null,'Thickness'));
      var thi=el_('input');thi.type='number';thi.min='1';thi.max='40';thi.value=it.p.thick||5;fbStop(thi);
      thi.addEventListener('input',function(){var n=parseFloat(thi.value);if(n>=1&&n<=40)soft(function(){it.p.thick=n;});});
      thk.appendChild(thi);lsp.appendChild(thk);
      lnPick('Line type',LNTYPES,function(){return lnOpts(it.p).type;},function(v){it.p.lt=v;lnShowType(it,v);},function(v){return lnThumb({lt:v,hb:'none'});});
      lnPick('Start',LNHEADS,function(){return lnOpts(it.p).ha;},function(v){it.p.ha=v;},function(v){return lnThumb({lt:'straight',ha:v,hb:'none',flat:1});});
      lnPick('End',LNHEADS,function(){return lnOpts(it.p).hb;},function(v){it.p.hb=v;},function(v){return lnThumb({lt:'straight',ha:'none',hb:v,flat:1});});
      var anr=el_('label','fb-row');anr.appendChild(el_('span',null,'Animate the flow'));
      var ani=el_('input');ani.type='checkbox';ani.checked=!!lnOpts(it.p).anim;fbStop(ani);
      ani.addEventListener('change',function(){soft(function(){it.p.anim=ani.checked;});});
      anr.appendChild(ani);lsp.appendChild(anr);
      if(it.p.ga&&it.p.gb){
        var plr=el_('label','fb-row');plr.appendChild(el_('span',null,'Push as a live link in PRTG'));
        var pli=el_('input');pli.type='checkbox';pli.checked=!!it.p.pushLive;fbStop(pli);
        pli.addEventListener('change',function(){soft(function(){it.p.pushLive=pli.checked;});});
        plr.appendChild(pli);lsp.appendChild(plr);
      }
      fbar.appendChild(lsb);fbar.appendChild(lsp);R.lineset=lsb;
      if(it.p.ga){
        var brb=fbarBtn('fb-t','Branch: add another end from this same start',
          '<circle cx="5" cy="12" r="2.4"/><path d="M7.3 12H13M13 12L19 7M13 12L19 17" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="19.5" cy="7" r="1.8"/><circle cx="19.5" cy="17" r="1.8"/>',
          function(){branchLine(it);});
        fbar.appendChild(brb);R.branch=brb;
      }
      /* once a text style is chosen under Presets, the bar offers the text to edit */
      if(it.p.labelStyle){
        var lbb=fbarBtn('fb-t','Text on the line',FB_SVG.lbl,function(){fbToggle(lbp,lbb);});
        var lbp=el_('div','fb-pop fb-lbl');lbp.hidden=true;fbStop(lbp);
        var lbi=el_('input');lbi.type='text';lbi.placeholder='Text on the line, e.g. 1 Gbps';lbi.maxLength=60;lbi.value=it.p.label||'';lbi.setAttribute('aria-label','Text on the line');fbStop(lbi);
        lbi.addEventListener('input',function(){soft(function(){it.p.label=lbi.value;});});
        lbp.appendChild(lbi);
        var lbf=el_('select');lbf.setAttribute('aria-label','Font');fbStop(lbf);
        [['','Default font']].concat(famOpts()).forEach(function(o){var op=el_('option');op.value=o[0];op.textContent=o[1];lbf.appendChild(op);});
        lbf.value=it.p.labelFont||'';
        lbf.addEventListener('change',function(){soft(function(){it.p.labelFont=lbf.value;});});
        lbp.appendChild(lbf);
        var lbr=el_('label','fb-row');lbr.appendChild(el_('span',null,'Size'));
        var lbn=el_('input');lbn.type='number';lbn.min='8';lbn.max='60';lbn.value=it.p.labelSize||14;fbStop(lbn);
        lbn.addEventListener('input',function(){var n=parseFloat(lbn.value);if(n>=8&&n<=60)soft(function(){it.p.labelSize=n;});});
        lbr.appendChild(lbn);lbp.appendChild(lbr);
        var lcr=el_('label','fb-row');lcr.appendChild(el_('span',null,'Text color'));
        var lci=el_('input');lci.type='color';lci.value=it.p.labelColor||(it.p.labelStyle==='solid'?'#ffffff':'#0f172a');fbStop(lci);
        lci.addEventListener('input',function(){soft(function(){it.p.labelColor=lci.value;});});
        lcr.appendChild(lci);lbp.appendChild(lcr);
        /* the same text switches as the rest of the bar, and where along the line the text sits */
        var lst=el_('div','fb-lrow');
        [['labelWeight','Bold','b'],['labelItal','Italic','i'],['labelUnder','Underline','u'],['labelUpper','UPPERCASE','aa']].forEach(function(d){
          var on=function(){return d[0]==='labelWeight'?((+it.p.labelWeight||600)>=600):!!it.p[d[0]];};
          var q=fbarBtn('fb-t',d[1],FB_SVG[d[2]]||'',function(){soft(function(){if(d[0]==='labelWeight')it.p.labelWeight=on()?'400':'700';else it.p[d[0]]=!it.p[d[0]];});q.classList.toggle('on',on());});
          if(d[2]==='aa')q.innerHTML='<span class="fb-aa">AA</span>';
          q.classList.toggle('on',on());lst.appendChild(q);
        });
        [['start','Text near the start of the line','left'],['center','Text in the middle of the line','center'],['end','Text near the end of the line','right']].forEach(function(d){
          var q=fbarBtn('fb-t fb-lal',d[1],FB_SVG[d[2]],function(){soft(function(){it.p.labelAlign=d[0];});[].forEach.call(lst.querySelectorAll('.fb-lal'),function(x){x.classList.toggle('on',x===q);});});
          q.classList.toggle('on',(it.p.labelAlign||'center')===d[0]);lst.appendChild(q);
        });
        lbp.appendChild(lst);
        fbar.appendChild(lbb);fbar.appendChild(lbp);R.lbl=lbb;
      }
    }
    if(A.link){
      sep();
      var lb=fbarBtn('fb-t','Link for the whole object',FB_SVG.link,function(){fbToggle(pop,lb);if(!pop.hidden&&R.ph)R.ph();});
      fbar.appendChild(lb);R.link=lb;
      var pop=el_('div','fb-pop');pop.hidden=true;
      var ts=el_('select');[['map','PRTG map (by id)'],['url','Any URL']].forEach(function(o){var op=el_('option');op.value=o[0];op.textContent=o[1];ts.appendChild(op);});
      var li=el_('input');li.type='text';li.setAttribute('aria-label','Link destination');
      var ms=el_('select');ms.setAttribute('aria-label','Map to open');
      var nt=el_('label','fb-chk');var nc=el_('input');nc.type='checkbox';nt.appendChild(nc);nt.appendChild(document.createTextNode(' Open in a new tab'));
      var rm=el_('button','btn ghost sm','Remove link');rm.type='button';
      function lph(){
        var maps=window.PRTGMAPS||[], useList=(ts.value==='map'&&maps.length>0);
        li.placeholder=(ts.value==='map')?'Map id, for example 3428':'https://example.com';
        ms.hidden=!useList;li.hidden=useList;
        if(useList){
          var cur=String(A.link.g('link')||'').replace(/[^0-9]/g,'');
          ms.innerHTML='';
          var o0=el_('option');o0.value='';o0.textContent='Choose a map\u2026';ms.appendChild(o0);
          maps.forEach(function(m){var o=el_('option');o.value=m.id;o.textContent=m.name+' (id '+m.id+')';ms.appendChild(o);});
          if(cur&&!maps.some(function(m){return m.id===cur;})){var o1=el_('option');o1.value=cur;o1.textContent='Map id '+cur+' (not on this server)';ms.appendChild(o1);}
          ms.value=cur;
        }
      }
      ms.addEventListener('change',function(){fbApply(it,function(){A.link.s('link',ms.value);A.link.s('linktype','map');});fbarSync(it);commit();buildList();});
      ts.addEventListener('change',function(){lph();fbApply(it,function(){A.link.s('linktype',ts.value);});commit();});
      li.addEventListener('input',function(){fbApply(it,function(){A.link.s('link',li.value);A.link.s('linktype',ts.value);});});
      li.addEventListener('change',function(){commit();buildList();});
      nc.addEventListener('change',function(){fbApply(it,function(){A.link.s('newtab',nc.checked);});commit();});
      rm.addEventListener('click',function(e){e.stopPropagation();li.value='';ms.value='';fbApply(it,function(){A.link.s('link','');});fbarSync(it);commit();});
      [pop,ts,li,ms,nc,rm].forEach(fbStop);
      pop.appendChild(ts);pop.appendChild(ms);pop.appendChild(li);pop.appendChild(nt);pop.appendChild(rm);fbar.appendChild(pop);
      R.pop=pop;R.lt=ts;R.li=li;R.ms=ms;R.ln=nc;R.ph=lph;lph();
    }
    /* layer: the same four steps as the Layer row in Selected, as a pop-up so the bar stays short */
    sep();
    var yb=fbarBtn('fb-t','Layer: forward or backward',FB_SVG.layer,function(){fbToggle(yp,yb);fbarSync(it);});
    var yp=el_('div','fb-pop fb-layer');yp.hidden=true;fbStop(yp);
    R.ly={};R.lyTitle=el_('div','fb-lyt','');yp.appendChild(R.lyTitle);
    R.lyBadge=el_('span','fb-badge','');
    [['front','Bring to front',function(){bringToFront(it);}],['fwd','Bring forward',function(){stepLayer(it,1);}],['back','Send backward',function(){stepLayer(it,-1);}],['bottom','Send to back',function(){sendToBack(it);}]].forEach(function(d){
      var b=el_('button','btn ghost',d[1]);b.type='button';
      b.addEventListener('click',function(e){e.stopPropagation();d[2]();fbarSync(it);});
      yp.appendChild(b);R.ly[d[0]]=b;
    });
    yb.appendChild(R.lyBadge);
    fbar.appendChild(yb);fbar.appendChild(yp);R.lyBtn=yb;
    sep();
    fbar.appendChild(fbarBtn('','Duplicate',FB_SVG.dup,function(){dup(it);}));
    fbar.appendChild(fbarBtn('','Delete',FB_SVG.del,function(){del(it);}));
    fbarSync(it);
  }
  /* show the item's current values in the bar's controls, without disturbing one that is being typed in */
  function fbarSync(it){
    var R=fbarRefs, A, s;
    if(!R)return;
    A=fbAcc(it);
    if(R.fam&&A.fam&&document.activeElement!==R.fam){
      s=String(A.fam[0]());
      if(![].some.call(R.fam.options,function(o){return o.value===s;})){var op=el_('option');op.value=s;op.textContent=s;R.fam.appendChild(op);}
      R.fam.value=s;
    }
    if(R.size&&document.activeElement!==R.size){var z=tsGet(it);if(z!==null)R.size.value=String(Math.round(z));}
    ['bold','ital','und','upper'].forEach(function(k){if(R[k]&&A[k])R[k].classList.toggle('on',!!A[k][0]());});
    if(R.bx)R.bx.forEach(function(r){
      var x=r.d.a[0]();if(document.activeElement===r.c)return;
      if(r.d.k==='chk')r.c.checked=!!x;else if(r.d.k==='color'){if(/^#[0-9a-f]{6}$/i.test(String(x)))r.c.value=x;}else r.c.value=String(x);
    });
    if(R.ly){var lq=layerPos(it);R.lyTitle.textContent='Layer '+lq.n+' of '+lq.total+(lq.n===lq.total?' (front)':(lq.n===1?' (back)':''));R.lyBadge.textContent=String(lq.n);R.lyBtn.setAttribute('data-tip','Layer '+lq.n+' of '+lq.total);}
    if(R.ly){var ed=layerEdge(it);R.ly.front.disabled=ed.atTop;R.ly.fwd.disabled=ed.atTop;R.ly.back.disabled=ed.atBottom;R.ly.bottom.disabled=ed.atBottom;}
    if(R.color&&A.color){var cv=String(A.color[0]()||'#000000');if(/^#[0-9a-f]{6}$/i.test(cv)&&document.activeElement!==R.color)R.color.value=cv;R.colorBox.style.setProperty('--sw',cv);}
    if(R.fill&&R.fillD){var fv=String(R.fillD.a[0]()||'#FFFFFF');if(/^#[0-9a-f]{6}$/i.test(fv)){if(document.activeElement!==R.fill)R.fill.value=fv;R.fillBox.style.setProperty('--sw',fv);}}
    if(R.valign&&A.valign){var vl=A.valign[0](), vi={top:FB_SVG.vtop,middle:FB_SVG.vmid,bottom:FB_SVG.vbot}[vl]||FB_SVG.vmid;R.valign.firstChild.innerHTML=vi;R.valign.setAttribute('data-tip','Vertical align: '+vl);}
    if(R.align&&A.align){var al=A.align[0](), ic={left:FB_SVG.left,center:FB_SVG.center,right:FB_SVG.right}[al]||FB_SVG.left;R.align.firstChild.innerHTML=ic;R.align.setAttribute('data-tip','Align text: '+al);}
    if(R.link&&A.link){
      R.link.classList.toggle('on',!!A.link.g('link'));
      if(document.activeElement!==R.li)R.li.value=A.link.g('link');
      R.lt.value=A.link.g('linktype')||'map';R.ln.checked=!!A.link.g('newtab');
      if(R.ph&&document.activeElement!==R.ms)R.ph();
    }
  }
  /* the box that holds an item once it is turned */
  function itemBox(it){
    var r=(+it.rot||0)*Math.PI/180;
    if(!r||!canRotate(it))return {x:it.x,y:it.y,w:it.w,h:it.h};
    var co=Math.abs(Math.cos(r)), si=Math.abs(Math.sin(r)), bw=it.w*co+it.h*si, bh=it.w*si+it.h*co, cx=it.x+it.w/2, cy=it.y+it.h/2;
    return {x:cx-bw/2,y:cy-bh/2,w:bw,h:bh};
  }
  function fbarPlace(it){
    var w, h, x, y, ww;
    if(!fbar){
      fbar=el_('div');fbar.id='dfbar';fbar.hidden=true;fbar.setAttribute('role','toolbar');fbar.setAttribute('aria-label','Selected item');
      ['mousedown','dblclick','click'].forEach(function(ev){fbar.addEventListener(ev,function(e){e.stopPropagation();});});
      document.body.appendChild(fbar);   /* the bar lives on the page, not inside the canvas box, so it is never cut off at the canvas edge */
    }
    if(!it||(drag&&drag.mode!=='size')||editing||!wrap.getClientRects().length){fbar.hidden=true;fbarKey='';return;}   /* it stays while you resize, and goes only while you move */
    var key=it.id+'|'+it.type+'|'+(it.p&&it.p.shape?it.p.shape+(it.p.dir||''):'')+'|'+(it.type==='banner'?(it.p.fit?'f':'m'):'')+((it.p&&it.p.isConnector)?('|c'+(it.p.labelStyle?'t':'')+(it.p.ga?'a':'')+(it.p.gb?'b':'')):'');
    if(key!==fbarKey){fbarBuild(it);fbarKey=key;}else fbarSync(it);
    fbar.hidden=false;
    /* the bar follows the zoom a little, so a small item on a zoomed-out canvas is not dwarfed by it */
    var k=Math.max(0.74,Math.min(1,0.62+scale*0.4)), below, cx;
    fbar.style.transformOrigin='0 0';fbar.style.transform=(k<1)?'scale('+k+')':'';
    h=(fbar.offsetHeight||36)*k;w=(fbar.offsetWidth||200)*k;var wr=wrap.getBoundingClientRect();ww=document.documentElement.clientWidth;
    /* a turned item is measured by the box that holds it, and the turn handle counts as part of it, so the bar never covers either */
    var bb=itemBox(it), topC=bb.y, botC=bb.y+bb.h;
    if(canRotate(it)){
      var th=(+it.rot||0)*Math.PI/180, hd=(it.h/2+30/scale)*(rotFlip(it)?-1:1), hy=(it.y+it.h/2)-hd*Math.cos(th);
      topC=Math.min(topC,hy-8/scale);botC=Math.max(botC,hy+8/scale);
    }
    x=Math.max(2,Math.min(wr.left+bb.x*scale,ww-w-2));
    y=wr.top+topC*scale-h-10;below=fbForceAbove?false:((y<2)||fbFlip);
    if(below)y=wr.top+botC*scale+10;
    cx=Math.max(14,Math.min(w-14,wr.left+(bb.x+bb.w/2)*scale-x));
    fbar.style.setProperty('--cx',(cx/k)+'px');fbar.setAttribute('data-pos',below?'below':'above');
    fbar.style.left=Math.round(x)+'px';fbar.style.top=Math.round(y)+'px';
  }
  function applyScale(){
    var avail=stageEl.clientWidth-4, availH=Math.max(240,window.innerHeight-200);
    if(avail<200)avail=900;
    /* Fit shrinks the canvas, at the chosen resolution, so all of it shows in the window */
    scale=(D.zoom==='fit')?Math.min(1,Math.max(0.1,Math.min(avail/D.w,availH/D.h))):(parseFloat(D.zoom)||1);
    scale=Math.max(0.1,Math.min(4,scale));
    canvas.style.width=D.w+'px';canvas.style.height=D.h+'px';
    try{document.dispatchEvent(new CustomEvent('dsize',{detail:{w:D.w,h:D.h}}));}catch(e){}
    canvas.style.transform='scale('+scale+')';
    wrap.style.width=Math.round(D.w*scale)+'px';wrap.style.height=Math.round(D.h*scale)+'px';
    zoomSync();gridPaint();
    updateSel();
  }
  var gridOv=document.createElement('div');gridOv.id='dgridov';wrap.appendChild(gridOv);
  function gridPaint(){
    var g=D.grid>0?D.grid:10, sp=g*scale, cl, c='rgba(0,125,184,.16)', c2='rgba(0,125,184,.30)', html='', i;
    if(typeof layPaint==='function')layPaint();
    if(!gridOv)return;
    gridOv.innerHTML='';gridOv.style.backgroundImage='';
    gridOv.hidden=!D.showGrid;
    if(!D.showGrid)return;
    if(D.gtype==='cols'&&(cl=colLines())){
      for(i=0;i<cl.N;i++)html+='<i style="left:'+((cl.m+i*(cl.cw+cl.gt))*scale)+'px;width:'+(cl.cw*scale)+'px"></i>';
      gridOv.innerHTML=html;
      if(sp>=4){gridOv.style.backgroundImage='linear-gradient(to bottom,'+c+' 1px,transparent 1px)';gridOv.style.backgroundSize=sp+'px '+sp+'px';}
    }else if(sp>=4){
      gridOv.style.backgroundImage='linear-gradient(to right,'+c2+' 1px,transparent 1px),linear-gradient(to bottom,'+c2+' 1px,transparent 1px),linear-gradient(to right,'+c+' 1px,transparent 1px),linear-gradient(to bottom,'+c+' 1px,transparent 1px)';
      gridOv.style.backgroundSize=(sp*5)+'px '+(sp*5)+'px,'+(sp*5)+'px '+(sp*5)+'px,'+sp+'px '+sp+'px,'+sp+'px '+sp+'px';
    }
  }
  function gridSync(){
    var sel=document.getElementById('dgrid'), i, has=false;
    if(!sel)return;
    for(i=0;i<sel.options.length;i++)if(sel.options[i].value===String(D.grid))has=true;
    if(!has){var o=document.createElement('option');o.value=String(D.grid);o.textContent=D.grid+' px';sel.appendChild(o);}
    sel.value=(D.snap==='off')?'0':String(D.grid);
  }
  /* put every item (or the ones selected with Shift+click) exactly on the grid: position, and the size of a box */
  function gridSnapAll(){
    var ids=msIds(), scopeL=(ids.length>=2)?ids.map(byId):D.items.filter(function(x){return !(x.type==='frame'&&x.p.group===false&&!x.p.shape);}), n=0;
    FREE=false;
    scopeL.forEach(function(it){
      if(!it)return;
      var ox=it.x, oy=it.y, ow=it.w, oh=it.h, r, b;
      it.x=snapAxis(ox,'x','strict');it.y=snapAxis(oy,'y','strict');
      if(isBox(it)){r=snapAxis(ox+ow,'x','strict');b=snapAxis(oy+oh,'y','strict');it.w=Math.max(40,r-it.x);it.h=Math.max(40,b-it.y);}
      if(it.x!==ox||it.y!==oy||it.w!==ow||it.h!==oh)n++;
    });
    renderAll();buildForm();commit();toastDash(n?('Snapped '+n+(n===1?' item':' items')+' to the grid'):'Everything is on the grid already');
  }
  /* lay the items out in rows on the grid, in reading order; on a column grid each item takes a whole number of columns */
  function gridArrange(){
    var ids=msIds(), g=D.grid>0?D.grid:10, cl=(D.gtype==='cols')?colLines():null, scopeL, inS={}, rows=[], flat=[], minX, minY, gap, cx, cy, rowH=0, col=0, startX, limitX;
    FREE=false;
    scopeL=(ids.length>=2)?ids.map(byId).filter(Boolean):D.items.filter(function(x){return x.parent==null&&!(x.type==='frame'&&x.p.group===false&&!x.p.shape);});
    scopeL.forEach(function(x){inS[x.id]=1;});
    scopeL=scopeL.filter(function(x){var a=x.parent, pa;while(a!=null){if(inS[a])return false;pa=byId(a);a=pa?pa.parent:null;}return true;});   /* what is inside a frame moves with it */
    if(scopeL.length<1)return;
    scopeL.sort(function(a,b){return (a.y-b.y)||(a.x-b.x);});
    scopeL.forEach(function(x){var r=rows[rows.length-1];if(r&&Math.abs(x.y-r.y)<=Math.max(r.h*0.6,g*2)){r.items.push(x);r.h=Math.max(r.h,x.h);}else rows.push({y:x.y,h:x.h,items:[x]});});
    rows.forEach(function(r){r.items.sort(function(a,b){return a.x-b.x;});flat=flat.concat(r.items);});
    minX=Math.min.apply(null,flat.map(function(x){return x.x;}));minY=Math.min.apply(null,flat.map(function(x){return x.y;}));
    gap=cl?cl.gt:Math.max(g*2,20);
    startX=cl?cl.m:snapAxis(minX,'x','strict');limitX=D.w-(cl?cl.m:startX);
    cx=startX;cy=snapAxis(minY,'y','strict');
    flat.forEach(function(it){
      var nx, span;
      if(cl){
        span=Math.max(1,Math.min(cl.N,Math.round((it.w+cl.gt)/(cl.cw+cl.gt))));
        if(col>0&&col+span>cl.N){col=0;cy=snapAxis(cy+rowH+gap,'y','strict');rowH=0;}
        nx=Math.round(cl.m+col*(cl.cw+cl.gt));
        if(isBox(it))it.w=Math.round(span*cl.cw+(span-1)*cl.gt);
        col+=span;
      }else{
        if(cx>startX&&cx+it.w>limitX){cx=startX;cy=snapAxis(cy+rowH+gap,'y','strict');rowH=0;}
        nx=cx;cx=snapAxis(cx+it.w+gap,'x','strict');
      }
      msMove(it,nx-it.x,cy-it.y,{});
      rowH=Math.max(rowH,it.h);
    });
    renderAll();buildForm();commit();toastDash('Arranged '+flat.length+(flat.length===1?' item':' items')+' on the grid');
  }
  /* the Grid button next to undo and redo opens this */
  var gridPop=null, gridBtn=document.getElementById('dgridbtn');
  function gridPopBuild(){
    var pop=gridPop, seg, sec, row;
    if(!pop){pop=gridPop=document.createElement('div');pop.id='dgridpop';pop.hidden=true;gridBtn.parentNode.appendChild(pop);
      ['mousedown','click','dblclick','keydown'].forEach(function(ev){pop.addEventListener(ev,function(e){e.stopPropagation();});});}
    pop.innerHTML='';
    function lab(t){var l=document.createElement('div');l.className='gp-l';l.textContent=t;return l;}
    function segment(opts,cur,fn){var d=document.createElement('div');d.className='gp-seg';opts.forEach(function(o){var b=document.createElement('button');b.type='button';b.textContent=o[1];if(o[0]===cur)b.className='on';b.addEventListener('click',function(){fn(o[0]);});d.appendChild(b);});return d;}
    function sel(opts,cur,fn){var s2=document.createElement('select');opts.forEach(function(o){var op=document.createElement('option');op.value=String(o[0]);op.textContent=o[1];s2.appendChild(op);});s2.value=String(cur);s2.addEventListener('change',function(){fn(s2.value);});return s2;}
    function num(cur,mn,mx,fn){var i=document.createElement('input');i.type='number';i.min=mn;i.max=mx;i.value=cur;i.addEventListener('input',function(){var v=parseInt(i.value,10);if(!isNaN(v)){fn(Math.max(mn,Math.min(mx,v)));gridPaint();}});return i;}
    pop.appendChild(lab('Grid'));
    pop.appendChild(segment([['square','Squares'],['cols','Columns']],D.gtype,function(v){D.gtype=v;gridPopBuild();gridPaint();}));
    row=document.createElement('div');row.className='gp-row';
    if(D.gtype==='cols'){
      var a=document.createElement('label');a.textContent='Columns';a.appendChild(sel([[2,'2'],[3,'3'],[4,'4'],[6,'6'],[8,'8'],[12,'12']],D.cols,function(v){D.cols=parseInt(v,10);gridPaint();}));
      var b2=document.createElement('label');b2.textContent='Margin';b2.appendChild(num(D.margin,0,400,function(v){D.margin=v;}));
      var c=document.createElement('label');c.textContent='Gutter';c.appendChild(num(D.gutter,0,200,function(v){D.gutter=v;}));
      row.appendChild(a);row.appendChild(b2);row.appendChild(c);
    }
    var sz=document.createElement('label');sz.textContent=(D.gtype==='cols')?'Row lines':'Square size';
    sz.appendChild(sel([[5,'5 px'],[10,'10 px'],[20,'20 px'],[40,'40 px'],[80,'80 px']],D.grid>0?D.grid:10,function(v){D.grid=parseInt(v,10);if(D.snap==='off')D.snap='magnet';gridSync();gridPaint();}));
    row.appendChild(sz);pop.appendChild(row);
    var sh=document.createElement('label');sh.className='gp-chk';var ck=document.createElement('input');ck.type='checkbox';ck.checked=!!D.showGrid;
    ck.addEventListener('change',function(){D.showGrid=ck.checked;gridPaint();});sh.appendChild(ck);sh.appendChild(document.createTextNode(' Show the grid on the canvas'));pop.appendChild(sh);
    pop.appendChild(lab('Snapping'));
    pop.appendChild(segment([['off','Off'],['magnet','Magnetic'],['strict','Strict']],D.snap,function(v){D.snap=v;gridSync();gridPopBuild();}));
    var hint=document.createElement('p');hint.className='gp-note';hint.textContent='Magnetic pulls an item onto a line only when it is close, so you can still place it anywhere. Hold Alt while dragging to move freely.';pop.appendChild(hint);
    pop.appendChild(lab('Put items on the grid'));
    var ba=document.createElement('button');ba.type='button';ba.className='btn ghost';ba.textContent='Snap items to the grid';ba.addEventListener('click',function(){gridSnapAll();});
    var bb=document.createElement('button');bb.type='button';bb.className='btn ghost';bb.textContent='Arrange items in rows';bb.addEventListener('click',function(){gridArrange();});
    var bw=document.createElement('div');bw.className='gp-btns';bw.appendChild(ba);bw.appendChild(bb);pop.appendChild(bw);
    var nt=document.createElement('p');nt.className='gp-note';nt.textContent='Both work on the items you Shift+click, or on everything when none are selected. Ctrl+Z undoes them.';pop.appendChild(nt);
  }
  if(gridBtn)gridBtn.addEventListener('click',function(e){
    e.stopPropagation();
    if(!gridPop||gridPop.hidden){gridPopBuild();gridPop.hidden=false;gridBtn.classList.add('on');}else{gridPop.hidden=true;gridBtn.classList.remove('on');}
  });
  document.addEventListener('mousedown',function(e){if(gridPop&&!gridPop.hidden&&!gridPop.contains(e.target)&&!(gridBtn&&gridBtn.contains(e.target))){gridPop.hidden=true;if(gridBtn)gridBtn.classList.remove('on');}});
  /* ---- layouts: ready-made ways to divide the canvas into cells. Items fill the cells in reading order and take their shape; dropping an item on a cell puts it there ---- */
  var LAYOUTS=[
    ['One big cell',1,1,[[0,0,1,1]]],
    ['Two columns',2,1,[[0,0,1,1],[1,0,1,1]]],
    ['Two rows',1,2,[[0,0,1,1],[0,1,1,1]]],
    ['Three columns',3,1,[[0,0,1,1],[1,0,1,1],[2,0,1,1]]],
    ['Three rows',1,3,[[0,0,1,1],[0,1,1,1],[0,2,1,1]]],
    ['Four squares',2,2,[[0,0,1,1],[1,0,1,1],[0,1,1,1],[1,1,1,1]]],
    ['Big left, two right',2,2,[[0,0,1,2],[1,0,1,1],[1,1,1,1]]],
    ['Two left, big right',2,2,[[0,0,1,1],[0,1,1,1],[1,0,1,2]]],
    ['Big top, two below',2,2,[[0,0,2,1],[0,1,1,1],[1,1,1,1]]],
    ['Two above, big below',2,2,[[0,0,1,1],[1,0,1,1],[0,1,2,1]]],
    ['Two thirds and one third',3,1,[[0,0,2,1],[2,0,1,1]]],
    ['One third and two thirds',3,1,[[0,0,1,1],[1,0,2,1]]],
    ['Sidebar and content',4,1,[[0,0,1,1],[1,0,3,1]]],
    ['Content and sidebar',4,1,[[0,0,3,1],[3,0,1,1]]],
    ['Header and three columns',3,4,[[0,0,3,1],[0,1,1,3],[1,1,1,3],[2,1,1,3]]],
    ['Header and two columns',2,3,[[0,0,2,1],[0,1,1,2],[1,1,1,2]]],
    ['Banner, two, banner',2,3,[[0,0,2,1],[0,1,1,1],[1,1,1,1],[0,2,2,1]]],
    ['Hero and three below',3,3,[[0,0,3,2],[0,2,1,1],[1,2,1,1],[2,2,1,1]]],
    ['Three stacked and big',3,3,[[0,0,1,1],[0,1,1,1],[0,2,1,1],[1,0,2,3]]],
    ['Big and four small',4,2,[[0,0,2,2],[2,0,1,1],[3,0,1,1],[2,1,1,1],[3,1,1,1]]],
    ['Staggered',3,2,[[0,0,1,2],[1,0,1,1],[2,0,1,2],[1,1,1,1]]],
    ['Pinwheel',3,3,[[0,0,2,1],[2,0,1,2],[1,2,2,1],[0,1,1,2],[1,1,1,1]]],
    ['Six tiles',3,2,[[0,0,1,1],[1,0,1,1],[2,0,1,1],[0,1,1,1],[1,1,1,1],[2,1,1,1]]],
    ['Nine tiles',3,3,[[0,0,1,1],[1,0,1,1],[2,0,1,1],[0,1,1,1],[1,1,1,1],[2,1,1,1],[0,2,1,1],[1,2,1,1],[2,2,1,1]]],
    ['Five columns',5,1,[[0,0,1,1],[1,0,1,1],[2,0,1,1],[3,0,1,1],[4,0,1,1]]],
    ['Four rows',1,4,[[0,0,1,1],[0,1,1,1],[0,2,1,1],[0,3,1,1]]]
  ];
  D.layout=null;D.layShow=true;D.layFrames=false;D.layFrameLook='Light card';
  var layOv=document.createElement('div');layOv.id='dlayov';wrap.appendChild(layOv);
  function layCells(){
    var L=D.layout, T, m, g, W, H, out=[];
    if(!L||!(T=LAYOUTS[L.id]))return out;
    m=L.margin;g=L.gap;W=D.w-2*m;H=D.h-2*m;
    T[3].forEach(function(c){
      var x0=c[0]/T[1], x1=(c[0]+c[2])/T[1], y0=c[1]/T[2], y1=(c[1]+c[3])/T[2];
      var l=Math.round(m+x0*W+(x0>0?g/2:0)), r=Math.round(m+x1*W-(x1<1?g/2:0)), t=Math.round(m+y0*H+(y0>0?g/2:0)), b=Math.round(m+y1*H-(y1<1?g/2:0));
      out.push({x:l,y:t,w:r-l,h:b-t});
    });
    return out;
  }
  function layItems(){return D.items.filter(function(x){return x.parent==null&&!(x.p&&x.p.cellFrame)&&!(x.type==='frame'&&x.p.group===false&&!x.p.shape);});}
  /* a frame in each cell: real frame items (styled, moved and pushed like any frame) that follow the layout's cells */
  function layCellFrames(){return D.items.filter(function(x){return x.type==='frame'&&x.p&&x.p.cellFrame;});}
  function layFrameIn(k){var f=null;layCellFrames().forEach(function(x){if(x.p.cell===k)f=x;});return f;}
  function layInner(c,k){var f=(k>=0)?layFrameIn(k):null, t;if(!f)return c;t=f.p.title?Math.round((f.p.tsize||18)*1.6+(f.p.pady||16)):(f.p.pady||16);return {x:c.x+(f.p.padx||20),y:c.y+t,w:Math.max(20,c.w-2*(f.p.padx||20)),h:Math.max(20,c.h-t-(f.p.pady||16))};}
  function layFramesSync(){
    var cells=layCells(), have=layCellFrames(), keep={}, proto=null;
    have.forEach(function(f){if(!proto)proto=f.p;if(f.p.cell<cells.length&&!keep[f.p.cell]){keep[f.p.cell]=f;}});
    have.forEach(function(f){if(keep[f.p.cell]!==f&&!D.items.some(function(c){return c.parent===f.id;}))D.items=D.items.filter(function(x){return x!==f;});});   /* frames of cells that are gone go, unless something sits inside them */
    cells.forEach(function(c,k){
      var f=keep[k], dx, dy;
      if(!f){
        f={id:D.nextId++,type:'frame',parent:null,x:c.x,y:c.y,w:c.w,h:c.h,state:null,p:proto?JSON.parse(JSON.stringify(proto)):newFrameP(D.layFrameLook||'Light card')};
        if(!proto)f.p.title='';
        f.p.cellFrame=true;f.p.cell=k;f.ord=layerOf(f)*100000+(++D.ordSeq);D.items.push(f);return;
      }
      dx=c.x-f.x;dy=c.y-f.y;if(dx||dy)msMove(f,dx,dy,{});f.w=c.w;f.h=c.h;
    });
  }
  function layFramesRestyle(look){layCellFrames().forEach(function(f){var t=f.p.title, cell=f.p.cell;f.p=newFrameP(look);f.p.title=t;f.p.cellFrame=true;f.p.cell=cell;});}
  function layFramesOff(){var gone=0;layCellFrames().forEach(function(f){if(!D.items.some(function(c){return c.parent===f.id;})){D.items=D.items.filter(function(x){return x!==f;});gone++;}else{delete f.p.cellFrame;delete f.p.cell;}});return gone;}
  function laySize(it){
    var n;
    if(isBox(it))return {w:it.w,h:it.h};
    n=canvas.querySelector('.ditem[data-id="'+it.id+'"]');
    return n?{w:n.offsetWidth,h:n.offsetHeight}:{w:it.w,h:it.h};
  }
  function layFits(it,c){var s=laySize(it);return isBox(it)?(c.w>=40&&c.h>=40):(s.w<=c.w&&s.h<=c.h);}   /* boxes stretch to any cell that is not tiny; labels, buttons and chips keep their size and must fit */
  function layPut(it,c,k){
    var s;
    if(k==null){var cs=layCells(), i;for(i=0;i<cs.length;i++)if(cs[i].x===c.x&&cs[i].y===c.y&&cs[i].w===c.w&&cs[i].h===c.h){k=i;break;}}
    c=layInner(c,k==null?-1:k);
    if(isBox(it)){msMove(it,c.x-it.x,c.y-it.y,{});it.w=c.w;it.h=c.h;}
    else{s=laySize(it);msMove(it,c.x+Math.round((c.w-s.w)/2)-it.x,c.y+Math.round((c.h-s.h)/2)-it.y,{});}
  }
  function layCellAt(cells,x,y){var i;for(i=0;i<cells.length;i++)if(x>=cells[i].x&&x<=cells[i].x+cells[i].w&&y>=cells[i].y&&y<=cells[i].y+cells[i].h)return i;return -1;}
  function layCellOf(cells,it){var s=laySize(it);return layCellAt(cells,it.x+s.w/2,it.y+s.h/2);}
  function layPaint(){
    var cells, occ={}, html='', i;
    if(!layOv)return;
    layOv.hidden=!(D.layout&&D.layShow);
    layOv.innerHTML='';
    if(layOv.hidden)return;
    cells=layCells();
    layItems().forEach(function(x){var k=layCellOf(cells,x);if(k>=0)occ[k]=1;});
    for(i=0;i<cells.length;i++)html+='<i class="'+(occ[i]?'':'empty')+'" style="left:'+(cells[i].x*scale)+'px;top:'+(cells[i].y*scale)+'px;width:'+(cells[i].w*scale)+'px;height:'+(cells[i].h*scale)+'px"></i>';
    layOv.innerHTML=html;
  }
  function layFill(){
    var ids=msIds(), L=(ids.length>=2)?ids.map(byId).filter(Boolean):layItems(), cells=layCells(), used={}, rows=[], flat=[], put=0, skip=0;
    FREE=false;
    L.sort(function(a,b){return (a.y-b.y)||(a.x-b.x);});
    L.forEach(function(x){var r=rows[rows.length-1];if(r&&Math.abs(x.y-r.y)<=Math.max(r.h*0.6,20)){r.items.push(x);r.h=Math.max(r.h,x.h);}else rows.push({y:x.y,h:x.h,items:[x]});});
    rows.forEach(function(r){r.items.sort(function(a,b){return a.x-b.x;});flat=flat.concat(r.items);});
    flat.forEach(function(it){
      var k;for(k=0;k<cells.length;k++)if(!used[k]&&layFits(it,cells[k]))break;
      if(k<cells.length){used[k]=1;layPut(it,cells[k],k);put++;}else skip++;
    });
    renderAll();buildForm();commit();
    toastDash(put?('Put '+put+(put===1?' item':' items')+' in the cells'+(skip?(', '+skip+' did not fit'):'')):(skip?'Nothing fits the cells. Try a bigger layout or smaller items':'Add some items first, then drop them on the cells'));
  }
  function layApply(id){
    var old=D.layout;
    D.layout={id:id,gap:old?old.gap:20,margin:old?old.margin:20};
    if(D.layFrames)layFramesSync();
    layFill();
  }
  function laySpacing(gap,margin){
    var before=layCells(), map=[], after;
    layItems().forEach(function(x){var k=layCellOf(before,x);if(k>=0)map.push([x,k]);});
    D.layout.gap=gap;D.layout.margin=margin;
    if(D.layFrames)layFramesSync();
    after=layCells();
    map.forEach(function(p){if(after[p[1]]&&layFits(p[0],after[p[1]]))layPut(p[0],after[p[1]]);});
    renderAll();buildForm();commit();
  }
  function layRemove(){D.layout=null;layPaint();}
  /* dropping an item on a cell puts it there; Alt places it freely */
  function layDrop(d,wasFree){
    var it=d.it, cells, s, k, k0, occ=null;
    if(!D.layout||wasFree||it.parent!=null)return;
    cells=layCells();k=layCellOf(cells,it);
    if(k<0)return;
    if(!layFits(it,cells[k])){msMove(it,d.ox-it.x,d.oy-it.y,{});toastDash('That cell is too small for this item');return;}
    layItems().forEach(function(x){if(x!==it&&layCellOf(cells,x)===k)occ=x;});
    if(occ){
      s=laySize(it);k0=layCellAt(cells,d.ox+s.w/2,d.oy+s.h/2);
      if(k0>=0&&k0!==k&&layFits(occ,cells[k0]))layPut(occ,cells[k0]);
      else{msMove(it,d.ox-it.x,d.oy-it.y,{});toastDash('That cell already has an item');return;}
    }
    layPut(it,cells[k],k);
  }
  var _raLay=renderAll;renderAll=function(){_raLay.apply(this,arguments);layPaint();};
  var layPop=null, layBtn=document.getElementById('dlaybtn');
  function layThumb(T,on,i){
    var b=document.createElement('button'), vh=Math.round(100*D.h/D.w*10)/10, tones=['#8fbfdc','#bcd9ec','#a9b8e6','#d9e6f2','#c9b8e0','#e9d3a6'], s='';
    b.type='button';b.className='ly-t'+(on?' on':'');b.setAttribute('data-tip',T[0]);b.setAttribute('aria-label',T[0]);
    T[3].forEach(function(c,j){
      var x=4+(c[0]/T[1])*92, w=(c[2]/T[1])*92, y=4+(c[1]/T[2])*(vh-8), h=(c[3]/T[2])*(vh-8);
      s+='<rect x="'+(x+1)+'" y="'+(y+1)+'" width="'+Math.max(1,w-2)+'" height="'+Math.max(1,h-2)+'" rx="2" fill="'+tones[j%tones.length]+'"/>';
    });
    b.innerHTML='<svg viewBox="0 0 100 '+vh+'" aria-hidden="true">'+s+'</svg>';
    b.addEventListener('click',function(){layApply(i);layPopBuild();});
    return b;
  }
  function layPopBuild(){
    var pop=layPop, g, row, a, b2, nt, bw, ba, bb, sh, ck, l, ia, ib;
    if(!pop){pop=layPop=document.createElement('div');pop.id='dlaypop';pop.hidden=true;layBtn.parentNode.appendChild(pop);
      ['mousedown','click','dblclick','keydown'].forEach(function(ev){pop.addEventListener(ev,function(e){e.stopPropagation();});});}
    pop.innerHTML='';
    l=document.createElement('div');l.className='gp-l';l.textContent='Layouts';pop.appendChild(l);
    g=document.createElement('div');g.className='ly-grid';
    LAYOUTS.forEach(function(T,i){g.appendChild(layThumb(T,!!D.layout&&D.layout.id===i,i));});
    pop.appendChild(g);
    nt=document.createElement('p');nt.className='gp-note';nt.textContent='Pick a layout and your items fill its cells in reading order. Drag an item onto a cell to put it there (Alt places it freely).';pop.appendChild(nt);
    if(D.layout){
      row=document.createElement('div');row.className='gp-row';
      a=document.createElement('label');a.textContent='Gap';ia=document.createElement('input');ia.type='number';ia.min=0;ia.max=200;ia.value=D.layout.gap;a.appendChild(ia);
      b2=document.createElement('label');b2.textContent='Margin';ib=document.createElement('input');ib.type='number';ib.min=0;ib.max=400;ib.value=D.layout.margin;b2.appendChild(ib);
      var go=function(){var gv=parseInt(ia.value,10), mv=parseInt(ib.value,10);if(isNaN(gv)||isNaN(mv))return;laySpacing(Math.max(0,Math.min(200,gv)),Math.max(0,Math.min(400,mv)));};
      ia.addEventListener('change',go);ib.addEventListener('change',go);
      row.appendChild(a);row.appendChild(b2);pop.appendChild(row);
      sh=document.createElement('label');sh.className='gp-chk';ck=document.createElement('input');ck.type='checkbox';ck.checked=!!D.layShow;
      ck.addEventListener('change',function(){D.layShow=ck.checked;layPaint();});sh.appendChild(ck);sh.appendChild(document.createTextNode(' Show the cells on the canvas'));pop.appendChild(sh);
      var fr=document.createElement('label');fr.className='gp-chk';var fk=document.createElement('input');fk.type='checkbox';fk.checked=!!D.layFrames;fk.id='dlayframes';
      fk.addEventListener('change',function(){
        D.layFrames=fk.checked;
        if(fk.checked){layFramesSync();renderAll();buildForm();commit();toastDash('A frame in each of the '+layCells().length+' cells');}
        else{var g=layFramesOff();renderAll();buildForm();commit();toastDash(g?('Removed '+g+(g===1?' empty frame':' empty frames')):'Frames with items in them stay as ordinary frames');}
        layPopBuild();
      });
      fr.appendChild(fk);fr.appendChild(document.createTextNode(' Add a frame in each cell'));pop.appendChild(fr);
      if(D.layFrames){
        var lr=document.createElement('div');lr.className='gp-row';var ll=document.createElement('label');ll.textContent='Frame look';var ls=document.createElement('select');ls.id='dlayflook';
        Object.keys(FSTYLES).forEach(function(k){var o=document.createElement('option');o.value=k;o.textContent=k;ls.appendChild(o);});ls.value=D.layFrameLook||'Light card';
        ls.addEventListener('change',function(){D.layFrameLook=ls.value;layFramesRestyle(ls.value);renderAll();buildForm();commit();});
        ll.appendChild(ls);lr.appendChild(ll);pop.appendChild(lr);
      }
      bw=document.createElement('div');bw.className='gp-btns';
      ba=document.createElement('button');ba.type='button';ba.className='btn ghost';ba.textContent='Fill cells with my items';ba.addEventListener('click',function(){layFill();});
      bb=document.createElement('button');bb.type='button';bb.className='btn ghost';bb.textContent='Remove layout';bb.addEventListener('click',function(){layRemove();layPopBuild();});
      bw.appendChild(ba);bw.appendChild(bb);pop.appendChild(bw);
    }
    nt=document.createElement('p');nt.className='gp-note';nt.textContent='Frames, shapes, banners, tiles and objects stretch to fill a cell. Labels, buttons and chips keep their size and sit in the middle, and are left out if the cell is smaller than they are. Ctrl+Z undoes a fill.';pop.appendChild(nt);
  }
  if(layBtn)layBtn.addEventListener('click',function(e){
    e.stopPropagation();
    if(!layPop||layPop.hidden){D.sel=null;msClear();updateSel();buildForm();layPopBuild();layPop.hidden=false;layBtn.classList.add('on');if(gridPop){gridPop.hidden=true;if(gridBtn)gridBtn.classList.remove('on');}}else{layPop.hidden=true;layBtn.classList.remove('on');}
  });
  if(gridBtn)gridBtn.addEventListener('click',function(){if(layPop&&!layPop.hidden){layPop.hidden=true;layBtn.classList.remove('on');}});
  document.addEventListener('mousedown',function(e){if(layPop&&!layPop.hidden&&!layPop.contains(e.target)&&!(layBtn&&layBtn.contains(e.target))){layPop.hidden=true;if(layBtn)layBtn.classList.remove('on');}});
  /* the zoom bar under the canvas, the Zoom list in Canvas size and grid, and the fit button all show the same zoom */
  function zoomSync(){
    var zs=document.getElementById('dzslider'), zl=document.getElementById('dzval'), zsel=document.getElementById('dzoom'), pc=Math.round(scale*100), o, i;
    if(zs){zs.value=String(pc);zs.style.setProperty('--p',((pc-10)/390*100)+'%');}
    if(zl)zl.textContent=pc+'%';
    if(zsel){
      o=null;for(i=0;i<zsel.options.length;i++)if(zsel.options[i].value===String(D.zoom))o=zsel.options[i];
      if(!o){o=zsel.querySelector('option[data-custom]');if(!o){o=document.createElement('option');o.setAttribute('data-custom','1');zsel.appendChild(o);}o.value=String(D.zoom);}
      if(o.hasAttribute('data-custom'))o.textContent=pc+'%';
      zsel.value=String(D.zoom);
    }
  }
  function setZoom(z,ax,ay){   /* z is a number, or 'fit'; ax, ay is a screen point to keep still (the pointer) */
    var r=wrap.getBoundingClientRect(), cx=(ax-r.left)/scale, cy=(ay-r.top)/scale, sc=document.getElementById('dscroll');
    D.zoom=(z==='fit')?'fit':String(Math.round(Math.max(0.1,Math.min(4,z))*1000)/1000);
    applyScale();
    if(ax!=null&&z!=='fit'){
      var r2=wrap.getBoundingClientRect();
      sc.scrollLeft+=(r2.left+cx*scale)-ax;
      var dy=(r2.top+cy*scale)-ay, par=sc.parentNode, done=false;   /* the box scrolls sideways; whatever holds the page scrolls up and down */
      while(par&&par!==document.body&&!done){
        if(par.scrollHeight>par.clientHeight+1&&/(auto|scroll)/.test(getComputedStyle(par).overflowY)){par.scrollTop+=dy;done=true;}
        par=par.parentNode;
      }
      if(!done)window.scrollBy(0,dy);
    }
  }

  function syncCode(){
    if(!codeEl)return;
    var it=byId(D.sel);
    codeEl.value=it?(htmlCache[it.id]||''):'';
  }

  /* ---------- items list ---------- */
  function exApi(){return (typeof window.EXAPI==='object'&&window.EXAPI)?window.EXAPI:null;}
  function buildList(){
    if(window.SECAPI)SECAPI.note('Canvas',D.items.length?(D.items.length+(D.items.length===1?' item':' items')):'none yet');
    listEl.innerHTML='';
    var ord=order(), longest=0, i, ex=exApi(), exItems=(ex&&ex.state&&ex.state.items)||[];
    if(!ord.length&&!exItems.length){listEl.appendChild(el_('p','note pst','Nothing yet. Use Build above.'));}
    ord.forEach(function(it){
      var len=(it.type==='prtgobj')?0:(htmlCache[it.id]||'').length;
      if(len>longest)longest=len;
      var row=el_('div','drow'+(it.id===D.sel?' on':''));
      row.style.paddingLeft=(8+depthOf(it)*14)+'px';
      var lno=el_('span','lno',String(ord.indexOf(it)+1));lno.title='Layer '+(ord.indexOf(it)+1)+' of '+ord.length+' (1 is the back)';row.appendChild(lno);
      row.appendChild(el_('span','ico',ICON[it.type]));
      var nm=el_('span','nm');nm.textContent=itemName(it);row.appendChild(nm);
      var meta=el_('span','meta');meta.textContent=Math.round(it.x)+','+Math.round(it.y)+'  '+Math.round(it.w)+'\u00D7'+Math.round(it.h)+'  '+(it.type==='prtgobj'?'file':len+' ch');
      row.appendChild(meta);
      var edge=layerEdge(it);
      var dn=el_('button','lyr','\u25bc');dn.type='button';dn.title='Send backward';dn.disabled=edge.atBottom;
      dn.addEventListener('click',function(e){e.stopPropagation();stepLayer(it,-1);});
      var up=el_('button','lyr','\u25b2');up.type='button';up.title='Bring forward';up.disabled=edge.atTop;
      up.addEventListener('click',function(e){e.stopPropagation();stepLayer(it,1);});
      row.appendChild(dn);row.appendChild(up);
      var cp=el_('button','cp','Copy');cp.type='button';cp.title='Copy this item\u2019s HTML';
      cp.addEventListener('click',function(e){e.stopPropagation();copyText(htmlCache[it.id]||'');});
      row.appendChild(cp);
      row.addEventListener('click',function(){select(it.id);});
      listEl.appendChild(row);
    });
    if(exItems.length&&ex){
      listEl.appendChild(el_('div','drowhead','Already on this PRTG map'));
      exItems.slice().sort(function(a,b){return (a.z||0)-(b.z||0);}).forEach(function(it){
        var row=el_('div','drow exln'+(ex.edit&&ex.edit.sel===String(it.subid)?' on':''));
        row.title='Already on PRTG, at its own layer ('+(it.z||0)+'). To move it, open Existing PRTG maps and edit it there.';
        row.appendChild(el_('span','ico','\u29c9'));
        var nm=el_('span','nm');nm.textContent=(ex.label?ex.label(it):('#'+it.subid));row.appendChild(nm);
        var meta=el_('span','meta');meta.textContent='layer '+(it.z||0);row.appendChild(meta);
        row.addEventListener('click',function(){
          try{document.dispatchEvent(new CustomEvent('gotodashtab',{detail:'add'}));}catch(e){}
          if(ex.pick)ex.pick(it.subid);
        });
        listEl.appendChild(row);
      });
    }
    document.getElementById('dstats').textContent=D.items.length+(exItems.length?(' + '+exItems.length+' already on the map'):'')+' items. Longest item: '+longest+' characters.';
  }
  document.addEventListener('exchanged',function(){try{buildList();}catch(e){}});

  /* ---------- selection and form ---------- */
  function select(id){D.sel=id;updateSel();buildForm();buildList();}
  function famOpts(){return Array.prototype.map.call(el.fam.options,function(o){return [o.value,o.textContent];});}
  var WEIGHTS=[['400','Regular'],['500','Medium'],['600','Semibold'],['700','Bold']];

  function mk(it,label,key,kind,opts){
    var w=el_('div','dfld'), inp, lab=el_('label',null,label);
    if(kind==='select'){
      inp=el_('select');
      (opts||[]).forEach(function(o){var op=el_('option');op.value=(o instanceof Array)?o[0]:o;op.textContent=(o instanceof Array)?o[1]:o;inp.appendChild(op);});
      inp.value=String(it.p[key]);
    }else if(kind==='textarea'){inp=el_('textarea');inp.rows=2;inp.value=(it.p[key]==null?'':it.p[key]);}
    else if(kind==='check'){inp=el_('input');inp.type='checkbox';inp.checked=(key==='group')?(it.p.group!==false):!!it.p[key];}
    else{
      inp=el_('input');inp.type=(kind==='number')?'number':(kind==='color'?'color':'text');
      inp.value=(it.p[key]==null?'':it.p[key]);
      if(kind==='number'&&opts){if(opts.min!=null)inp.min=opts.min;if(opts.max!=null)inp.max=opts.max;}
    }
    if(kind==='check'){w.className='dfld inline';w.appendChild(inp);w.appendChild(lab);}
    else{w.appendChild(lab);w.appendChild(inp);}
    function apply(){
      var v;
      if(kind==='number'){v=parseFloat(inp.value);if(isNaN(v))v=0;}
      else if(kind==='check')v=inp.checked;
      else v=inp.value;
      it.p[key]=v;
      refreshItem(it);
    }
    inp.addEventListener('input',apply);
    if(kind==='select'||kind==='check')inp.addEventListener('change',apply);
    inp.addEventListener('change',function(){commit();buildList();});
    return w;
  }
  function pair(a,b){var d=el_('div','dpair');d.appendChild(a);d.appendChild(b);return d;}
  function styleSel(it,table){
    var w=el_('div','dfld'), s=el_('select');
    w.appendChild(el_('label',null,'Style preset'));
    var blank=el_('option');blank.value='';blank.textContent='Choose to apply\u2026';s.appendChild(blank);
    Object.keys(table).forEach(function(k){var o=el_('option');o.value=k;o.textContent=k;s.appendChild(o);});
    s.addEventListener('change',function(){
      if(!s.value)return;
      extend(it.p,table[s.value]);it.p.style=s.value;
      if(it.type==='frame'&&table[s.value].group===false){it.parent=null;}
      refreshItem(it);buildForm();buildList();commit();
    });
    w.appendChild(s);return w;
  }
  function geoRow(it){
    var g=el_('div','dgeo');
    ['x','y','w','h'].forEach(function(k){
      var f=el_('div');f.appendChild(el_('label',null,k.toUpperCase()));
      var inp=el_('input');inp.type='number';inp.value=Math.round(it[k]);
      var fixed=(k==='w'||k==='h')&&!canSize(it);
      if(fixed){inp.disabled=true;inp.title='Set by the content';}
      inp.addEventListener('input',function(){
        var v=parseFloat(inp.value);if(isNaN(v))return;
        if(k==='w'||k==='h')v=Math.max(20,v);
        var delta=v-it[k];
        if((k==='w'||k==='h')&&!isBox(it)){setBoxSize(it,k==='w'?v:it.w,k==='h'?v:it.h);renderAll();return;}
        it[k]=v;
        if((k==='x'||k==='y')&&isGroupFrame(it)){descendants(it.id).forEach(function(c){c[k]+=delta;});}
        renderAll();
      });
      inp.addEventListener('change',function(){commit();});
      f.appendChild(inp);g.appendChild(f);
    });
    return g;
  }
  function layerRow(it){
    var w=el_('div','dfld'), row=el_('div','lyrbtns'), e=layerEdge(it);
    var lp=layerPos(it);
    w.appendChild(el_('label',null,'Layer '+lp.n+' of '+lp.total+(lp.n===lp.total?' (front)':(lp.n===1?' (back)':''))));
    var bBot=el_('button','btn ghost','\u2913');bBot.type='button';bBot.title='Send to back';bBot.disabled=e.atBottom;
    var bDn=el_('button','btn ghost','\u25bc');bDn.type='button';bDn.title='Send backward';bDn.disabled=e.atBottom;
    var bUp=el_('button','btn ghost','\u25b2');bUp.type='button';bUp.title='Bring forward';bUp.disabled=e.atTop;
    var bTop=el_('button','btn ghost','\u2912');bTop.type='button';bTop.title='Bring to front';bTop.disabled=e.atTop;
    bBot.addEventListener('click',function(){sendToBack(it);});
    bDn.addEventListener('click',function(){stepLayer(it,-1);});
    bUp.addEventListener('click',function(){stepLayer(it,1);});
    bTop.addEventListener('click',function(){bringToFront(it);});
    row.appendChild(bBot);row.appendChild(bDn);row.appendChild(bUp);row.appendChild(bTop);
    w.appendChild(row);
    return w;
  }
  function parentSel(it){
    var w=el_('div','dfld'), s=el_('select');
    w.appendChild(el_('label',null,'Inside frame'));
    var none=el_('option');none.value='';none.textContent='None (on the canvas)';s.appendChild(none);
    D.items.forEach(function(f){
      if(!isGroupFrame(f)||f.id===it.id||isDesc(it.id,f.id))return;
      var o=el_('option');o.value=String(f.id);o.textContent=itemName(f);s.appendChild(o);
    });
    s.value=(it.parent==null)?'':String(it.parent);
    s.addEventListener('change',function(){it.parent=(s.value==='')?null:parseInt(s.value,10);renderAll();commit();});
    w.appendChild(s);return w;
  }
  /* a folded section in the Selected panel, built like the ones in the Objects tab; it remembers whether you opened it */
  var ACCOPEN={};
  function acc(title,nodes,open){
    var f=el_('fieldset','secfs'), bar=el_('button','advbar'), body=el_('div','secbody'), on=(title in ACCOPEN)?ACCOPEN[title]:!!open;
    bar.type='button';bar.innerHTML='<span class="seccaret">'+(on?'▾':'▸')+'</span> <span class="sectitle"></span>';
    bar.querySelector('.sectitle').textContent=title;
    if(on)bar.className+=' open';
    body.hidden=!on;
    bar.addEventListener('click',function(){
      var o=body.hidden;body.hidden=!o;ACCOPEN[title]=o;
      bar.classList.toggle('open',o);bar.firstChild.textContent=o?'▾':'▸';
    });
    nodes.forEach(function(n){body.appendChild(n);});
    f.appendChild(bar);f.appendChild(body);
    return f;
  }
  /* ---------- the selected item's style, edited in place ----------
     A frame, shape or background is edited with the Objects tab's editor, and a label or button with the original label and button tool.
     Their panels are moved into #inlhost under the selected item, and every change is copied to the item as it happens. */
  var INL={id:null,kind:'',json:'',pre:null,nodes:[],timer:null};
  function inlKey(it){return it.type==='frame'?JSON.stringify([it.p,it.w,it.h]):JSON.stringify(it.state);}
  function frameKind(it){return it.p.shape?'shape':(it.p.group===false?'bg':'frame');}
  function inlHost(){return document.getElementById('inlhost');}
  function inlCommitSoon(){clearTimeout(INL.timer);INL.timer=setTimeout(function(){commit();},500);}
  function syncGeo(it){
    var ins=(STD.geo||formEl).querySelectorAll('.dgeo input');
    if(ins.length===4){['x','y','w','h'].forEach(function(k,i){if(document.activeElement!==ins[i])ins[i].value=Math.round(it[k]);});}
  }
  function legMount(host){
    var panel=document.getElementById('panel'), keep={modebar:1,objpanel:1,dashpanel:1,legtype:1}, box=document.getElementById('legbox'), imp;
    if(!box){box=document.createElement('div');box.id='legbox';}
    host.appendChild(box);
    INL.nodes=[].filter.call(panel.children,function(n){return !keep[n.id];});
    INL.nodes.forEach(function(n){box.appendChild(n);});
    /* Presets and Advanced settings are a bar and a body of their own; give each the same card as the other sections, and put Text first */
    [['prestoggle','preswrap'],['advtoggle','advwrap']].forEach(function(p){
      var b=document.getElementById(p[0]), w=document.getElementById(p[1]), f;
      if(!b||!w||b.parentNode!==box)return;
      f=document.createElement('fieldset');f.className='secfs wrapfs';
      box.insertBefore(f,b);f.appendChild(b);f.appendChild(w);w.classList.add('secbody');
    });
    var tx=document.getElementById('txt'), tfs=tx&&tx.closest('fieldset.secfs'), pf=document.getElementById('prestoggle');pf=pf&&pf.parentNode;
    if(tfs&&pf&&tfs.parentNode===box)box.insertBefore(tfs,pf);
    imp=document.getElementById('imp');imp=imp&&imp.closest('fieldset');
    if(imp)imp.style.display='none';
    var pw=document.getElementById('preswrap');INL.presOpen=!!(pw&&!pw.hidden);
    INL.legOpen=[].map.call(box.querySelectorAll(':scope > fieldset.secfs'),function(f){return f.children[1]?!f.children[1].hidden:false;});
    document.body.classList.add('inlleg');
  }
  function legUnmount(){
    var panel=document.getElementById('panel'), imp=document.getElementById('imp');
    imp=imp&&imp.closest('fieldset');if(imp)imp.style.display='';
    var pw=document.getElementById('preswrap'), pt=document.getElementById('prestoggle'), pc=document.getElementById('prescaret');
    if(pw){pw.hidden=!INL.presOpen;if(pt)pt.classList.toggle('open',!!INL.presOpen);if(pc)pc.innerHTML=INL.presOpen?'\u25BE':'\u25B8';}
    [].forEach.call(document.querySelectorAll('#legbox > fieldset.secfs'),function(f,i){
      var bar=f.children[0], body=f.children[1], o=!!(INL.legOpen&&INL.legOpen[i]);
      if(!bar||!body)return;
      body.hidden=!o;bar.classList.toggle('open',o);bar.setAttribute('aria-expanded',o?'true':'false');if(bar.firstChild)bar.firstChild.textContent=o?'\u25BE':'\u25B8';
    });
    INL.nodes.forEach(function(n){panel.appendChild(n);});
    INL.nodes=[];
    [].forEach.call(document.querySelectorAll('#legbox > .wrapfs'),function(f){if(f.parentNode)f.parentNode.removeChild(f);});
    [].forEach.call(document.querySelectorAll('.geofs'),function(f){if(f.parentNode)f.parentNode.removeChild(f);});
    var aw=document.getElementById('advwrap'), pw2=document.getElementById('preswrap');
    if(aw)aw.classList.remove('secbody');if(pw2)pw2.classList.remove('secbody');
    document.body.classList.remove('inlleg');
  }
  function legFold(){
    [].forEach.call(document.querySelectorAll('#legbox > fieldset.secfs'),function(f){
      var bar=f.children[0], body=f.children[1];
      if(!bar||!body)return;
      body.hidden=true;bar.classList.remove('open');bar.setAttribute('aria-expanded','false');if(bar.firstChild)bar.firstChild.textContent='▸';
    });
    var w=document.getElementById('preswrap'), t=document.getElementById('prestoggle');
    if(w){w.hidden=false;if(t)t.classList.add('open');var c=document.getElementById('prescaret');if(c)c.innerHTML='▾';}
  }
  function legMode(m){var was=DASHAPI.active;DASHAPI.active=false;try{setMode(m);}finally{DASHAPI.active=was;}}   /* setMode would otherwise leave the Dashboard tab */
  /* Size, position and layer of a label or button sits first in its Advanced settings */
  function legGeo(){
    var adv=document.getElementById('advwrap'), old;
    if(!adv||!INL.geo)return;
    old=adv.querySelector(':scope > .geofs');
    if(old&&old!==INL.geo)old.parentNode.removeChild(old);
    if(INL.geo.parentNode!==adv){INL.geo.classList.add('geofs');adv.insertBefore(INL.geo,adv.firstChild);}
  }
  function legBegin(it,fresh){
    if(!INL.pre)INL.pre={snap:snapshot(),mode:mode};
    window.PBD_LEGBUSY=true;
    try{legMode(it.type==='button'?'button':'label');applySnap(it.state);render();}finally{window.PBD_LEGBUSY=false;}
    if(fresh)legFold();
  }
  function legEnd(){
    var pre=INL.pre;
    window.PBD_ONLEG=null;
    legUnmount();
    if(pre){window.PBD_LEGBUSY=true;try{legMode(pre.mode);applySnap(pre.snap);render();}finally{window.PBD_LEGBUSY=false;}}
    INL.pre=null;
  }
  /* ---------- one layout for the Selected panel: Text, Presets, Link, then Advanced (Appearance, Size position and layer, Code) ----------
     The panels of a frame, shape, label and button come from other tools, so their sections are moved into place and put back when the item is deselected. */
  var STD={moved:[],names:[],made:[],geo:null,code:null};
  function stdMove(n){STD.moved.push({n:n,p:n.parentNode,x:n.nextSibling});}
  function stdName(bar,from,to){
    [].forEach.call(bar.childNodes,function(c){if(c.nodeType===3&&c.nodeValue.indexOf(from)>=0){STD.names.push({n:c,v:c.nodeValue});c.nodeValue=c.nodeValue.replace(from,to);}});
  }
  function stdRestore(){
    var i, m;
    for(i=STD.moved.length-1;i>=0;i--){m=STD.moved[i];if(m.p)m.p.insertBefore(m.n,(m.x&&m.x.parentNode===m.p)?m.x:null);}
    STD.moved=[];
    STD.names.forEach(function(r){r.n.nodeValue=r.v;});STD.names=[];
    STD.made.forEach(function(n){if(n.parentNode)n.parentNode.removeChild(n);});STD.made=[];
  }
  function stdTitle(f){var b=f.children&&f.children[0];return (b&&b.tagName==='BUTTON')?b.textContent.replace(/^[^A-Za-z]+/,''):'';}
  /* the Link section for items whose link used to be only in the bar over the item */
  function linkSec(it){
    var A=fbAcc(it).link, maps=window.PRTGMAPS||[], ts=el_('select'), ms=el_('select'), li=el_('input'), nc=el_('input'), wm, wu, wt, rm;
    if(!A)return null;
    function row(label,ctl){var w=el_('div','dfld');w.appendChild(el_('label',null,label));w.appendChild(ctl);return w;}
    [['map','PRTG map (by id)'],['url','Any URL']].forEach(function(o){var op=el_('option');op.value=o[0];op.textContent=o[1];ts.appendChild(op);});
    ts.value=A.g('linktype')||'map';
    li.type='text';li.value=A.g('link')||'';
    nc.type='checkbox';nc.checked=!!A.g('newtab');
    var cur=String(A.g('link')||'').replace(/[^0-9]/g,''), o0=el_('option');
    o0.value='';o0.textContent='Choose a map\u2026';ms.appendChild(o0);
    maps.forEach(function(m){var o=el_('option');o.value=m.id;o.textContent=m.name+' (id '+m.id+')';ms.appendChild(o);});
    if(cur&&!maps.some(function(m){return m.id===cur;})){var o1=el_('option');o1.value=cur;o1.textContent='Map id '+cur+' (not on this server)';ms.appendChild(o1);}
    ms.value=cur;
    wt=row('Opens',ts);wm=row('Map',ms);wu=row('Address or map id',li);
    function ph(){var list=(ts.value==='map'&&maps.length>0);wm.hidden=!list;wu.hidden=list;li.placeholder=(ts.value==='map')?'Map id, for example 3428':'https://example.com';}
    function done(){refreshItem(it);commit();buildList();buildForm();}
    ts.addEventListener('change',function(){A.s('linktype',ts.value);ph();done();});
    ms.addEventListener('change',function(){A.s('link',ms.value);A.s('linktype','map');done();});
    li.addEventListener('input',function(){A.s('link',li.value);A.s('linktype',ts.value);refreshItem(it);});
    li.addEventListener('change',done);
    nc.addEventListener('change',function(){A.s('newtab',nc.checked);done();});
    rm=el_('button','btn ghost sm','Remove link');rm.type='button';
    rm.addEventListener('click',function(){A.s('link','');done();});
    ph();
    var cw=el_('div','dfld inline');cw.appendChild(nc);cw.appendChild(el_('label',null,'Open in a new tab'));
    return acc('Link',[wt,wm,wu,cw,rm,el_('p','note','Makes the whole item a link. Leave it empty for no link.')],!!A.g('link'));
  }
  function stdBuild(it){
    stdRestore();
    var geo=STD.geo, code=STD.code, adv, ap, pr, rs, op, box, aw, i, t, txt, flds, body, tf, lk, app, kids;
    if(INL.kind==='obj'&&it.type==='frame'){
      op=document.getElementById('objpanel');if(!op)return;
      rs=op.querySelector(':scope > .objreset');
      kids=[].slice.call(op.children);
      kids.forEach(function(f){
        t=stdTitle(f);if(f.hidden||!t)return;
        if(/^Appearance/.test(t)&&!ap)ap=f;else if(/^Looks/.test(t)&&!pr)pr=f;
        else if(t==='Shape'&&it.p.isConnector)stdName(f.children[0],'Shape','Connector');
      });
      if(pr)stdName(pr.children[0],'Looks','Presets');
      /* Text: the title fields that sit in Appearance */
      if(ap&&pr&&(!it.p.shape||isBoxShape(it.p.shape))&&!(it.p.group===false&&!it.p.shape)){
        flds={};body=ap.children[1];
        [].forEach.call(body.querySelectorAll('.dfld'),function(d){var l=d.querySelector(':scope > label');if(l)flds[l.textContent.trim()]=d;});
        if(flds['Title']&&flds['Title size']&&flds['Title weight']&&flds['Title color']&&flds['Font']){
          ['Title','Title size','Title weight','Title color','Font'].forEach(function(k){stdMove(flds[k]);});
          tf=acc('Text',[flds['Title'],pair(flds['Title size'],flds['Title weight']),pair(flds['Title color'],flds['Font'])],true);
          op.insertBefore(tf,pr);STD.made.push(tf);
        }
      }
      lk=(it.p.shape&&!isBoxShape(it.p.shape))?null:linkSec(it);
      if(lk){op.insertBefore(lk,rs);STD.made.push(lk);}
      if(ap)stdMove(ap);
      adv=acc('Advanced',[ap,geo,code].filter(Boolean),false);
      op.insertBefore(adv,rs);STD.made.push(adv);
    }else if(INL.kind==='leg'&&(it.type==='label'||it.type==='button')){
      box=document.getElementById('legbox');aw=document.getElementById('advwrap');
      if(!box||!aw)return;
      var parts=[];
      [].forEach.call(box.children,function(f){t=stdTitle(f);if(/^(Font|Color|Button style)/.test(t))parts.push(f);});
      parts.forEach(stdMove);
      app=acc('Appearance',parts,false);
      var g=aw.querySelector(':scope > .geofs'), at=g?g.nextSibling:aw.firstChild;
      aw.insertBefore(app,at);STD.made.push(app);
      if(code){aw.insertBefore(code,app.nextSibling);STD.made.push(code);}
      var ab=document.getElementById('advtoggle');if(ab)stdName(ab,'Advanced settings','Advanced');
    }
  }
  function inlEnd(){
    stdRestore();
    if(INL.kind==='obj'){OBJAPI.inline.end();OBJAPI.inline.unmount();OBJAPI.onInline=null;}
    else if(INL.kind==='leg')legEnd();
    INL.kind='';INL.id=null;INL.json='';
    var h=inlHost();if(h)h.hidden=true;
  }
  function inlFromFrame(){
    var it=byId(INL.id), r=OBJAPI.inline.read(), sized;
    if(!it||!r)return;
    sized=(r.w!==it.w||r.h!==it.h);
    it.p=r.p;it.w=r.w;it.h=r.h;
    if(it.p.group===false&&!it.p.shape)it.parent=null;
    INL.json=inlKey(it);
    refreshItem(it);buildList();inlCommitSoon();
    if(sized)syncGeo(it);
  }
  function inlFromLegacy(){
    var it=byId(INL.id);
    if(!it)return;
    it.state=snapshot();it.type=(mode==='button')?'button':'label';
    INL.json=inlKey(it);
    refreshItem(it);buildList();inlCommitSoon();
    syncGeo(it);
  }
  function inlSync(){
    var it=byId(D.sel), host=inlHost(), fresh, changed;
    if(!host||!DASHAPI.active||editing!==null)return;
    if(it&&it.type==='frame'&&OBJAPI.inline){
      if(INL.kind==='leg')inlEnd();
      fresh=(INL.kind!=='obj');
      if(fresh){OBJAPI.inline.mount(host);INL.kind='obj';OBJAPI.onInline=inlFromFrame;}
      if(fresh||INL.id!==it.id||INL.json!==inlKey(it)){
        INL.id=it.id;INL.json=inlKey(it);
        OBJAPI.inline.begin(frameKind(it),it.p,it.w,it.h,fresh);
      }
      stdBuild(it);
    }else if(it&&(it.type==='label'||it.type==='button')){
      if(INL.kind==='obj')inlEnd();
      fresh=(INL.kind!=='leg');
      if(fresh){legMount(host);INL.kind='leg';window.PBD_ONLEG=inlFromLegacy;}
      if(fresh||INL.id!==it.id||INL.json!==inlKey(it)){
        INL.id=it.id;INL.json=inlKey(it);
        legBegin(it,fresh);
      }
      legGeo();
      stdBuild(it);
    }else{
      inlEnd();
    }
    host.hidden=!INL.kind;
  }
  function buildForm(){
      try{document.dispatchEvent(new Event('dashselect'));}catch(e){}
    stdRestore();
    formEl.innerHTML='';INL.geo=null;STD.geo=null;STD.code=null;
    codeEl=null;
    var it=byId(D.sel);
      if(window.SECAPI)SECAPI.note('Selected',it?itemName(it):'nothing selected');
    if(!it){formEl.appendChild(el_('p','note pst','Click an item on the canvas to change how it looks.'));inlSync();return;}
    formEl.appendChild(el_('h4',null,(it.type==='frame'&&it.p.shape)?(it.p.isConnector?'Connector':'Shape'):((it.type==='frame'&&it.p.group===false)?'Background':TYPENAME[it.type])));
    /* Duplicate and Delete are in the bar over the item; Ctrl+C, Ctrl+V, Ctrl+D and Delete work from the keyboard */
    var geoFs=acc('Size, position and layer',[geoRow(it),layerRow(it),parentSel(it)]), inlineOk=!!(OBJAPI.inline&&DASHAPI.active);
    STD.geo=geoFs;
    if(it.type==='label'||it.type==='button')INL.geo=geoFs;
    else if(it.type==='banner'||it.type==='tile'||it.type==='chip'||it.type==='prtgobj'){}   /* goes under Advanced, below */
    else if(!(it.type==='frame'&&inlineOk))formEl.appendChild(geoFs);
    if(it.type==='prtgobj'){
        var on=el_('p','note pst');on.textContent='Object file: '+it.p.cat+': '+it.p.name;formEl.appendChild(on);
        var tw=el_('div','dfld');tw.appendChild(el_('label',null,'Target (PRTG object ID)'));
        var ti=el_('input');ti.type='number';ti.min='0';ti.value=String((it.p.target&&it.p.target.id)||0);ti.id='dtgtid';
        ti.addEventListener('input',function(){var v=parseInt(ti.value,10)||0;it.p.target={id:v,name:(it.p.target&&v===it.p.target.id)?it.p.target.name:''};it.p.targetDefault=false;refreshItem(it);});
        ti.addEventListener('change',function(){commit();buildForm();});
        tw.appendChild(ti);formEl.appendChild(tw);
        var sw=el_('div','dfld');sw.appendChild(el_('label',null,'Size'));
        var ss=el_('select'), pvs=(DASHAPI.pv||{})[it.id];
        [['','Automatic'+((pvs&&pvs.state==='ok')?(pvs.autoContent?' (as big as PRTG draws it)':' (you set it)'):'')],['box','I set the size'],['content','As big as PRTG draws it']].forEach(function(o){var op=el_('option');op.value=o[0];op.textContent=o[1];ss.appendChild(op);});
        ss.value=it.p.sizing||'';ss.id='dsizemode';
        ss.addEventListener('change',function(){it.p.sizing=ss.value;renderAll();var gf3={};gf3[it.id]=1;glueFollowers(gf3);buildForm();commit();});
        sw.appendChild(ss);formEl.appendChild(sw);
        var tn=el_('p','note pst');tn.id='dtgtname';tn.textContent=((it.p.target&&it.p.target.name)?('Showing: '+it.p.target.name):((it.p.target&&it.p.target.id)?'Showing the PRTG object with this ID.':'No target chosen yet.'))+(it.p.targetDefault?' This is the preview default: choose the real one under Objects already in PRTG.':'')+(it.p.was?' On the copied map it showed: '+it.p.was+'.':'');formEl.appendChild(tn);
        var ts=el_('p','note pst');ts.id='dtgtstat';ts.setAttribute('data-id',String(it.id));ts.style.cssText='word-break:break-all;user-select:text';ts.textContent=DASHAPI.pvstatText?DASHAPI.pvstatText(it.id):'';formEl.appendChild(ts);
        formEl.appendChild(el_('p','note','The object\u2019s look comes from its file in PRTG, so there is nothing to paste. Choose what it shows under Objects already in PRTG, or type its ID. 0 means none.'));
      }else if(it.type==='frame'){
      if(!it.p.shape)formEl.appendChild(mk(it,'Move contents with this frame','group','check'));
    }else if(it.type==='tile'){
      formEl.appendChild(mk(it,'Caption','caption','text'));
      formEl.appendChild(pair(mk(it,'Value','value','text'),mk(it,'Change','delta','text')));
      formEl.appendChild(pair(mk(it,'Direction','dir','select',[['up','Up'],['down','Down'],['none','None']]),mk(it,'Font','fam','select',famOpts())));
      formEl.appendChild(styleSel(it,TSTYLES));
      formEl.appendChild(pair(mk(it,'Caption size','csize','number',{min:8,max:60}),mk(it,'Value size','vsize','number',{min:10,max:160})));
      formEl.appendChild(pair(mk(it,'Caption color','ccolor','color'),mk(it,'Value color','vcolor','color')));
      formEl.appendChild(pair(mk(it,'Fill color','fill','color'),mk(it,'Fill opacity %','fillA','number',{min:0,max:100})));
      formEl.appendChild(pair(mk(it,'Border color','bcolor','color'),mk(it,'Border width','bw','number',{min:0,max:20})));
      formEl.appendChild(pair(mk(it,'Corner radius','radius','number',{min:0,max:80}),mk(it,'Shadow','shadow','select',[['none','None'],['soft','Soft'],['strong','Strong']])));
    }else if(it.type==='banner'){
      var bsz=el_('div');
      bsz.appendChild(pair(mk(it,'Headline size','tsize','number',{min:8,max:300}),mk(it,'Subtitle size','ssize','number',{min:6,max:200})));
      if(it.p.fit){bsz.style.opacity='.5';bsz.title='Fit is on: the sizes follow the box. Turn Fit off to type them.';}
      formEl.appendChild(acc('Text',[
        mk(it,'Headline','title','textarea'),mk(it,'Subtitle (optional)','sub','textarea'),
        mk(it,'Make the text fit the box (it follows when you resize)','fit','check'),bsz,
        pair(mk(it,'Align','align','select',[['left','Left'],['center','Center'],['right','Right']]),mk(it,'Font','fam','select',famOpts())),
        pair(mk(it,'Headline color','tcolor','color'),mk(it,'Subtitle color','scolor','color')),
        mk(it,'Uppercase','tupper','check')],true));
      formEl.appendChild(acc('Presets',[fbPresetGrid(it,fbPresets(it),function(){buildForm();})],true));
      var bl=linkSec(it);if(bl)formEl.appendChild(bl);
      STD.app=acc('Appearance',[
        pair(mk(it,'Fill color','fill','color'),mk(it,'Fill opacity %','fillA','number',{min:0,max:100})),
        pair(mk(it,'Border color','bcolor','color'),mk(it,'Border width','bw','number',{min:0,max:20})),
        pair(mk(it,'Corner radius','radius','number',{min:0,max:80}),mk(it,'Shadow','shadow','select',[['none','None'],['soft','Soft'],['strong','Strong']]))],false);
    }else if(it.type==='chip'){
      formEl.appendChild(mk(it,'Text','text','text'));
      formEl.appendChild(pair(mk(it,'Color','variant','select',[['success','Green'],['warning','Amber'],['danger','Red'],['info','Blue'],['neutral','Grey']]),mk(it,'Size','size','number',{min:8,max:40})));
      formEl.appendChild(mk(it,'Font','fam','select',famOpts()));
    }else{
    }
    if(it.type==='frame')formEl.appendChild(el_('p','note','Deleting a frame also deletes what is inside it. Undo brings it back.'));
      if(it.type==='prtgobj'){formEl.appendChild(acc('Advanced',[geoFs],false));syncCode();inlSync();return;}   /* nothing to paste for an object PRTG draws */
    var cw=el_('div','dfld');
    codeEl=el_('textarea');codeEl.rows=7;codeEl.readOnly=true;codeEl.spellcheck=false;codeEl.id='dcode';
    codeEl.style.fontFamily='Consolas,Monaco,monospace';codeEl.style.fontSize='11px';
    cw.appendChild(codeEl);
    var cb=el_('button','btn ghost','Copy code');cb.type='button';cb.style.marginTop='8px';cb.style.width='100%';
    cb.addEventListener('click',function(){copyText(htmlCache[it.id]||'');});
    cw.appendChild(cb);
    cw.appendChild(el_('p','note','Paste this into HTML Before of a Custom HTML item, and give the item this size and position. PRTG rewrites div as span when you paste, so these pieces are written as spans that declare display:block and keep their size. Web fonts are not included here. Use Copy font links once per dashboard. For a frame that resizes with its item, use Objects, Frame.'));
    var codeFs=acc('Code',[cw]);
    if(it.type==='banner')formEl.appendChild(acc('Advanced',[STD.app,geoFs,codeFs],false));
    else if(it.type==='tile'||it.type==='chip')formEl.appendChild(acc('Advanced',[geoFs,codeFs],false));
    else if((it.type==='frame'&&inlineOk)||it.type==='label'||it.type==='button')STD.code=codeFs;
    else formEl.appendChild(codeFs);
    syncCode();
    inlSync();
  }

  /* ---------- add, duplicate, delete ---------- */
  function addItem(type,extra){
    var sel=byId(D.sel), host=null;
    if(sel)host=isGroupFrame(sel)?sel:(sel.parent!=null?byId(sel.parent):null);
    var it={id:D.nextId++,type:type,parent:host?host.id:null,x:40,y:40,w:100,h:40,p:null,state:null};
    if(type==='bg'){
      it.type='frame';it.parent=null;it.x=0;it.y=0;it.w=D.w;it.h=D.h;
      it.p=newFrameP('Background dark');it.p.title='';
      it.ord=layerOf(it)*100000+(++D.ordSeq);
      D.items.unshift(it);
    }else{
      if(type==='shape'){it.type='frame';it.w=CFG.shape.w;it.h=CFG.shape.h;it.p=newShapeP('b_arrow','right');}
      else if(type==='connector'){it.type='frame';it.w=CFG.shape.w;it.h=CFG.shape.h;it.p=newShapeP('line','right');it.p.isConnector=true;it.p.pushLive=true;it.p.matchLS=false;it.p.lt='curve';it.p.thick=5;it.p.anim=false;it.p.ha='none';it.p.hb='none';it.p.colorMode='status';it.p.cn2=1;}   /* same line/glue machinery as a Shapes line, just born ready to link two objects and push live */
      else if(type==='frame'){it.w=CFG.frame.w;it.h=CFG.frame.h;it.p=newFrameP('Light card');}
      else if(type==='tile'){it.w=230;it.h=112;it.p=newTileP('Light tile');}
      else if(type==='banner'){it.w=640;it.h=90;it.p=newBannerP('Info');}
      else if(type==='chip'){it.p=newChipP();}
        else if(type==='prtgobj'){it.w=(extra&&extra.w)||320;it.h=(extra&&extra.h)||200;it.p={cat:extra.cat,name:extra.name,value:extra.value,target:extra.target?{id:parseInt(extra.target.id,10)||0,name:extra.target.name||''}:{id:0,name:''}};if(extra.target)it.p.targetDefault=true;}   /* a default target, until you choose the real one */
      else{it.state=defaultState(type);}
      var siblings=0;
      D.items.forEach(function(x){if(x.parent===it.parent&&!(x.type==='frame'&&x.p.group===false))siblings++;});
      var off=(siblings%8)*20;
      if(host){it.x=snapX(host.x+20+off);it.y=snapV(host.y+((host.p.title)?58:20)+off);}
      else{it.x=snapX(40+off);it.y=snapV(40+off);}
      if(extra&&extra.at){   /* placed or dropped: where you let go, and inside the smallest frame you let go on */
        it.x=snapX(extra.at.x);it.y=snapV(extra.at.y);
        var bf=null, ba=1e18;
        D.items.forEach(function(f){if(isGroupFrame(f)&&extra.at.x>=f.x&&extra.at.x<=f.x+f.w&&extra.at.y>=f.y&&extra.at.y<=f.y+f.h&&f.w*f.h<ba){ba=f.w*f.h;bf=f.id;}});
        it.parent=bf;
      }
      it.ord=layerOf(it)*100000+(++D.ordSeq);
      D.items.push(it);
      if(type==='connector'&&extra&&extra.at){   /* dropped (or placed) on top of an object: glue the start end to the nearest side right away */
        var hit=connHit([extra.at.x,extra.at.y],it.id);
        if(hit){
          var A=connAnchorAbs(hit), away={l:[-170,0],r:[170,0],t:[0,-170],b:[0,170],c:[170,0]}[hit.s];
          lnSetAbs(it,A,[A[0]+away[0],A[1]+away[1]]);
          it.p.ga={id:hit.id,s:hit.s,t:hit.t};connBack(it);
        }
      }
    }
    D.sel=it.id;renderAll();buildForm();commit();
  }
  function dup(it){
    var src=[it].concat(descendants(it.id).sort(function(a,b){return D.items.indexOf(a)-D.items.indexOf(b);}));
    var map={};
    var clones=src.map(function(o){var c=clone(o);c.id=D.nextId++;map[o.id]=c.id;return c;});
    clones.forEach(function(c,i){
      if(i>0&&c.parent!=null&&map[c.parent]!=null)c.parent=map[c.parent];
      c.x+=20;c.y+=20;
      c.ord=layerOf(c)*100000+(++D.ordSeq);
    });
    D.items=D.items.concat(clones);
    D.sel=clones[0].id;renderAll();buildForm();commit();
  }
  /* copy, cut and paste: one item, or a frame with everything inside it */
  var CLIP=null;
  function copyItem(it,cut){
    var src=[it].concat(descendants(it.id).sort(function(a,b){return D.items.indexOf(a)-D.items.indexOf(b);}));
    CLIP={items:src.map(clone),root:it.id,n:cut?-1:0};
    toastDash(cut?'Cut':'Copied');
    if(cut)del(it);
  }
  function pasteItem(){
    if(!CLIP||!CLIP.items.length)return;
    var sel=byId(D.sel), host=null, map={}, off, root=CLIP.items[0], isBg=(root.type==='frame'&&root.p&&root.p.group===false&&!root.p.shape);
    if(sel&&!isBg)host=isGroupFrame(sel)?sel:(sel.parent!=null?byId(sel.parent):null);
    CLIP.n++;off=CFG.dashboard.pasteOffset*CLIP.n;
    var clones=CLIP.items.map(function(o){var c=clone(o);c.id=D.nextId++;map[o.id]=c.id;return c;});
    clones.forEach(function(c,i){
      if(i===0)c.parent=host?host.id:(isBg?null:(byId(root.parent)?root.parent:null));
      else c.parent=(map[c.parent]!=null)?map[c.parent]:null;
      c.x+=off;c.y+=off;
      c.ord=layerOf(c)*100000+(++D.ordSeq);
    });
    if(isBg)D.items=clones.concat(D.items);else D.items=D.items.concat(clones);
    D.sel=clones[0].id;renderAll();buildForm();commit();
  }
  function toastDash(msg){try{var t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},900);}catch(e){}}
  function del(it){
    var rm=[it.id];
    if(it.type==='frame')descendants(it.id).forEach(function(c){rm.push(c.id);});
    var rmSet={};rm.forEach(function(id){rmSet[id]=1;});
    D.items.forEach(function(x){
      if(!isLine(x)||!x.p)return;
      if(x.p.ga&&rmSet[x.p.ga.id])delete x.p.ga;
      if(x.p.gb&&rmSet[x.p.gb.id])delete x.p.gb;
    });
    D.items=D.items.filter(function(x){return rm.indexOf(x.id)<0;});
    D.sel=null;renderAll();buildForm();commit();
  }

  /* ---------- undo / redo / layout data ---------- */
  function snapModel(){return JSON.stringify({w:D.w,h:D.h,items:D.items,nextId:D.nextId,uid:D.uid,ordSeq:D.ordSeq});}
  function backfillOrd(){   /* an older layout has no it.ord; give it the same stacking it already had (frames, then objects, then labels/shapes) */
    var need=false;
    D.items.forEach(function(it){if(typeof it.ord!=='number')need=true;});
    if(!need)return;
    var arr=D.items.map(function(it,i){return {it:it,i:i,l:layerOf(it),d:depthOf(it)};});
    arr.sort(function(a,b){return (a.l-b.l)||(a.d-b.d)||(a.i-b.i);});
    arr.forEach(function(o){if(typeof o.it.ord!=='number')o.it.ord=o.l*100000+(++D.ordSeq);});
  }
  function updateUndoBtns(){
    document.getElementById('dundo').disabled=!undoStack.length;
    document.getElementById('dredo').disabled=!redoStack.length;
  }
  function commit(){
    var now=snapModel();
    if(now!==committed){
      undoStack.push(committed);if(undoStack.length>60)undoStack.shift();
      committed=now;redoStack=[];updateUndoBtns();
    }
  }
  function restoreModel(str){
    var m=JSON.parse(str);
    D.w=m.w;D.h=m.h;D.items=m.items;D.nextId=m.nextId;D.uid=m.uid||newUid();   /* a layout saved before it had an identity gets a new one, so it does not inherit pushed items */
    D.ordSeq=m.ordSeq||0;backfillOrd();
    if(!byId(D.sel))D.sel=null;
    document.getElementById('dw').value=D.w;document.getElementById('dh').value=D.h;
    htmlCache={};applyScale();renderAll();buildForm();
  }
  function doUndo(){if(!undoStack.length)return;redoStack.push(committed);committed=undoStack.pop();restoreModel(committed);updateUndoBtns();}
  function doRedo(){if(!redoStack.length)return;undoStack.push(committed);committed=redoStack.pop();restoreModel(committed);updateUndoBtns();}
  function validLayout(m){
    if(!m||!(m.items instanceof Array)||!m.w||!m.h)return false;
    for(var i=0;i<m.items.length;i++){
      var it=m.items[i];
      if(!it||typeof it.id!=='number'||!TYPENAME[it.type])return false;
      if((it.type==='label'||it.type==='button')&&!(it.state&&it.state.v&&it.state.c))return false;
      if(it.type!=='label'&&it.type!=='button'&&!it.p)return false;
      if(it.type==='prtgobj'&&!(typeof it.p.value==='string'&&it.p.target&&typeof it.p.target==='object'))return false;
    }
    return true;
  }

  /* ---------- edit a label or button with the full tools ---------- */
  function startEdit(it){
    pre={snap:snapshot(),mode:mode};
    editing=it.id;
    DASHAPI.leave();
    setMode(it.type==='button'?'button':'label');
    document.body.classList.add('editing');
    document.getElementById('mDash').classList.add('on');
    applySnap(it.state);
    render();
    document.getElementById('edittitle').textContent='Editing '+TYPENAME[it.type].toLowerCase()+': '+itemName(it);
    document.getElementById('editbar').hidden=false;
  }
  /* a frame or background is edited in the Objects tab's editor, the way a label or button is edited in its own tool */
  function startFrameEdit(it){
    if(!OBJAPI.frameEdit||editing!==null)return;
    editing=it.id;editFrame=true;
    DASHAPI.leave();
    OBJAPI.frameEdit.begin(it.p.shape?'shape':(it.p.group===false?'bg':'frame'),it.p,it.w,it.h);
    document.body.classList.add('editing');
    document.getElementById('mDash').classList.add('on');
    document.getElementById('edittitle').textContent='Editing '+TYPENAME[it.type].toLowerCase()+': '+itemName(it);
    document.getElementById('editbar').hidden=false;
  }
  function finishFrameEdit(save){
    var it=byId(editing), r=OBJAPI.frameEdit.read();
    OBJAPI.frameEdit.end();
    editing=null;editFrame=false;
    document.getElementById('editbar').hidden=true;
    document.body.classList.remove('editing');
    if(save&&it&&r){
      it.p=r.p;it.w=r.w;it.h=r.h;
      if(it.p.group===false&&!it.p.shape)it.parent=null;   /* a background style stands on its own, as it does when chosen in the Dashboard */
    }
    DASHAPI.enter();
    D.sel=it?it.id:null;
    renderAll();buildForm();
    if(save)commit();
  }
  function finishEdit(save){
    if(editFrame){finishFrameEdit(save);return;}
    var it=byId(editing);
    if(save&&it){it.state=snapshot();it.type=(mode==='button')?'button':'label';}
    editing=null;
    document.getElementById('editbar').hidden=true;
    document.body.classList.remove('editing');
    setMode(pre.mode);applySnap(pre.snap);render();
    DASHAPI.enter();
    D.sel=it?it.id:null;
    renderAll();buildForm();
    if(save)commit();
  }

  /* ---------- pointer and keyboard ---------- */
  canvas.addEventListener('mousedown',function(e){
    if(e.button!==0)return;
    var t=e.target;
    if(t.closest&&t.closest('.dh'))return;
    if(TE&&t.closest&&t.closest('.teedit'))return;   /* the caret goes where it is clicked */
    var n=t.closest?t.closest('.ditem'):null;
    if(!n){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();if(!e.shiftKey){msClear();select(null);}return;}
    e.preventDefault();
    if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
    var it=byId(parseInt(n.getAttribute('data-id'),10));
    if(!it)return;
    if(e.shiftKey){msToggle(it);if(MS[it.id]&&D.sel!==it.id)select(it.id);return;}
    if(Object.keys(MS).length&&!MS[it.id])msClear();
    if(D.sel!==it.id)select(it.id);
    var kids=isGroupFrame(it)?descendants(it.id):[];
    if(MS[it.id]&&msIds().length>1){   /* the whole selection moves together */
      var seenK={};kids.forEach(function(k){seenK[k.id]=1;});
      msIds().forEach(function(id){
        var o=byId(id);if(o.id===it.id||seenK[o.id])return;seenK[o.id]=1;kids.push(o);
        if(isGroupFrame(o))descendants(o.id).forEach(function(c){if(!seenK[c.id]&&c.id!==it.id){seenK[c.id]=1;kids.push(c);}});
      });
    }
    var skip={};kids.forEach(function(k){skip[k.id]=1;});
    drag={mode:'move',sx:e.clientX,sy:e.clientY,it:it,ox:it.x,oy:it.y,moved:false,
      skip:skip,
      kids:kids.map(function(k){return {k:k,x:k.x,y:k.y};})};
  });
  canvas.addEventListener('click',function(e){e.preventDefault();});
  (function(){
    var bar=document.getElementById('dalign');if(!bar)return;
    bar.addEventListener('click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b||b.disabled)return;if(b.id==='dalignclear'){msClear();return;}if(b.getAttribute('data-al'))msAlign(b.getAttribute('data-al'));});
  })();
  /* ---------- typing the text of a label or button on the canvas ----------
     Double-click it, type, and press Esc or click away. The text goes to the label tool's text box, so the item, its code and the undo list follow. */
  var TE=null;
  function teNode(n){
    var k, c;
    for(k=0;k<n.children.length;k++){c=n.children[k];if(c.tagName!=='STYLE'&&c.tagName!=='SCRIPT'&&c.tagName!=='LINK')return (c.getAttribute&&c.getAttribute('data-rotw'))?teNode(c):c;}
    return null;
  }
  function teRead(ed){
    var html=ed.innerHTML.replace(/<div[^>]*>/gi,'\n').replace(/<\/div>/gi,'').replace(/<br\s*\/?>/gi,'\n').replace(/&nbsp;/gi,' ').replace(/<[^>]+>/g,''), t=document.createElement('textarea');
    t.innerHTML=html;
    return t.value.replace(/^\n/,'').replace(/\n$/,'');
  }
  function teEnd(){
    if(!TE)return;
    var t=TE, v=teRead(t.ed), txt=document.getElementById('txt');
    TE=null;
    t.ed.removeEventListener('keydown',teKey);t.ed.removeEventListener('blur',teEnd);
    t.ed.removeAttribute('contenteditable');t.n.classList.remove('teedit');
    if(t.key){   /* a frame, shape, banner or chip: the text is one of the item's own settings */
      if(byId(t.it.id)&&v!==String(t.it.p[t.key]==null?'':t.it.p[t.key])){t.it.p[t.key]=v;refreshItem(t.it);buildForm();buildList();commit();}
      else refreshItem(t.it);
      return;
    }
    if(txt&&INL.kind==='leg'&&INL.id===t.it.id&&v!==txt.value){txt.value=v;txt.dispatchEvent(new Event('input',{bubbles:true}));}
    else refreshItem(t.it);
  }
  /* which element holds the text of an item that keeps it in its settings, and under what name */
  function teTarget(it,n){
    var root=teNode(n), k, ed;
    if(!root||!it.p)return null;
    if(it.type==='chip')return {ed:root,key:'text'};
    if(it.type==='banner')return root.children[0]?{ed:root.children[0],key:'title'}:null;
    if(it.type!=='frame'||(it.p.group===false&&!it.p.shape))return null;
    k=it.p.shape;
    if(k&&!isBoxShape(k))return null;
    if(k&&isPathShape(k)){ed=root.children[1]&&root.children[1].firstElementChild;return ed?{ed:ed,key:'title'}:null;}
    return {ed:root,key:'title'};
  }
  function teStartP(it,n){
    var tg=teTarget(it,n), r, sel;
    if(!tg)return false;
    if(TE)teEnd();
    TE={it:it,n:n,ed:tg.ed,key:tg.key};
    n.classList.add('teedit');
    tg.ed.setAttribute('contenteditable','true');tg.ed.setAttribute('spellcheck','false');
    if(!tg.ed.textContent){tg.ed.style.minWidth='1ch';tg.ed.style.minHeight='1.25em';}
    tg.ed.addEventListener('keydown',teKey);tg.ed.addEventListener('blur',teEnd);
    tg.ed.focus();
    try{r=document.createRange();r.selectNodeContents(tg.ed);sel=window.getSelection();sel.removeAllRanges();sel.addRange(r);}catch(err){}
    return true;
  }
  function teKey(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(TE&&TE.ed.blur)TE.ed.blur();}e.stopPropagation();}
  function teStart(it,n){
    var ed=teNode(n), r, sel;
    if(!ed||INL.kind!=='leg'||INL.id!==it.id)return false;
    if(TE)teEnd();
    TE={it:it,n:n,ed:ed};
    n.classList.add('teedit');
    ed.setAttribute('contenteditable','true');ed.setAttribute('spellcheck','false');
    ed.addEventListener('keydown',teKey);ed.addEventListener('blur',teEnd);
    ed.focus();
    try{r=document.createRange();r.selectNodeContents(ed);sel=window.getSelection();sel.removeAllRanges();sel.addRange(r);}catch(err){}
    return true;
  }
  var LEI=null;
  function lblEdit(it,g){
    if(LEI)LEI.end(false);
    var r=g.getBoundingClientRect(), p=it.p, fs=Math.max(8,Math.min(60,+p.labelSize||14))*scale, inp=document.createElement('input'), w=Math.max(110,r.width+24), h=Math.max(28,r.height+6), done=false;
    inp.type='text';inp.value=p.label||'';inp.maxLength=60;inp.setAttribute('aria-label','Text on the line');
    inp.style.cssText='position:fixed;z-index:100002;box-sizing:border-box;left:'+Math.round(r.left+r.width/2-w/2)+'px;top:'+Math.round(r.top+r.height/2-h/2)+'px;width:'+Math.round(w)+'px;height:'+Math.round(h)+'px;'+
      'font:600 '+Math.max(11,Math.round(fs))+'px/1 '+familyStack(p.labelFont||'Segoe UI')+';text-align:center;color:#0f172a;background:#fff;border:2px solid #2f80ed;border-radius:'+Math.round(h/2)+'px;outline:none;padding:0 12px;box-shadow:0 4px 14px rgba(15,23,42,.25)';
    function end(save){
      if(done)return;done=true;LEI=null;
      var v=inp.value;
      if(inp.parentNode)inp.parentNode.removeChild(inp);
      if(save&&byId(it.id)&&v!==String(p.label||''))fbApply(it,function(){p.label=v;});
    }
    ['mousedown','click','dblclick','keyup'].forEach(function(ev){inp.addEventListener(ev,function(e){e.stopPropagation();});});
    inp.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Enter'){e.preventDefault();end(true);}else if(e.key==='Escape'){e.preventDefault();end(false);}});
    inp.addEventListener('blur',function(){end(true);});
    document.body.appendChild(inp);LEI={end:end};
    inp.focus();inp.select();
  }
  canvas.addEventListener('dblclick',function(e){
    var n=e.target.closest?e.target.closest('.ditem'):null;
    if(!n)return;
    var it=byId(parseInt(n.getAttribute('data-id'),10)), h=inlHost();
    var lg=e.target.closest?e.target.closest('[data-lbl]'):null;
    if(it&&lg&&isLine(it)&&it.p&&it.p.labelStyle){lblEdit(it,lg);e.preventDefault();return;}   /* the text on a Connector is typed right on the line */
    if(it&&(it.type==='label'||it.type==='button')&&teStart(it,n)){e.preventDefault();return;}
    if(it&&teStartP(it,n)){e.preventDefault();return;}
    if(it&&h&&!h.hidden){try{h.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(err){}}   /* its settings are already open under it */
  });
  document.addEventListener('mousemove',function(e){
    if(!drag)return;
    FREE=!!e.altKey;
    var dx=(e.clientX-drag.sx)/scale, dy=(e.clientY-drag.sy)/scale;
    if(drag.mode==='move'){
      if(!drag.moved&&(Math.abs(dx)+Math.abs(dy))<3)return;
      drag.moved=true;
      var nx=snapX(drag.ox+dx), ny=snapV(drag.oy+dy);
      if(e.altKey)guidesOff();else{var gs=guideSnap(drag.it,nx,ny,drag.it.w,drag.it.h,drag.skip||{},'move');nx=gs.x;ny=gs.y;}
      var ddx=nx-drag.ox, ddy=ny-drag.oy;
      drag.it.x=nx;drag.it.y=ny;
      if(isLine(drag.it)&&(drag.it.p.ga||drag.it.p.gb)){connSyncOne(drag.it);refreshItem(drag.it);}else place(drag.it);
      drag.kids.forEach(function(o){o.k.x=o.x+ddx;o.k.y=o.y+ddy;place(o.k);});
      var movedIds={};movedIds[drag.it.id]=1;drag.kids.forEach(function(o){movedIds[o.k.id]=1;});
      glueFollowers(movedIds);
      updateSel();
    }else if(drag.mode==='ln'){
      var mine=(drag.w==='a')?drag.A0:drag.B0, other=(drag.w==='a')?drag.B0:drag.A0, P=[mine[0]+dx,mine[1]+dy], ex, ey, an, dd;
      var hit=connHit(P,drag.it.id);
      if(hit){
        P=connAnchorAbs(hit);
      }else if(e.shiftKey){   /* the angle jumps in steps of 15 degrees */
        ex=P[0]-other[0];ey=P[1]-other[1];dd=Math.sqrt(ex*ex+ey*ey);an=Math.round(Math.atan2(ey,ex)/(Math.PI/12))*(Math.PI/12);
        P=[other[0]+Math.cos(an)*dd,other[1]+Math.sin(an)*dd];
      }else if(!e.altKey){
        P=[snapX(P[0]),snapV(P[1])];
        if(Math.abs(P[1]-other[1])<4/scale)P[1]=other[1];   /* close to level or upright: make it so */
        if(Math.abs(P[0]-other[0])<4/scale)P[0]=other[0];
      }
      drag.hit=hit;connHilite(hit?hit.id:null,hit?hit.s:null);
      if(drag.w==='a')lnSetAbs(drag.it,P,other);else lnSetAbs(drag.it,other,P);
      refreshItem(drag.it);
    }else if(drag.mode==='rot'){
      var pt=cvPt(e), r=drag.r0+(Math.atan2(pt[1]-drag.cy,pt[0]-drag.cx)-drag.a0)*180/Math.PI;
      r=e.shiftKey?Math.round(r/15)*15:Math.round(r);
      var delta=r-drag.r0;
      drag.it.rot=Math.round(normRot(r))||0;
      if(!drag.it.rot)delete drag.it.rot;
      drag.kids.forEach(function(o){rotAround(o.k,drag.cx,drag.cy,delta,o);if(isLine(o.k))refreshItem(o.k);else refreshItem(o.k);});
      refreshItem(drag.it);
      var rotIds={};rotIds[drag.it.id]=1;drag.kids.forEach(function(o){rotIds[o.k.id]=1;});
      glueFollowers(rotIds);
      selBox.setAttribute('data-rot',(drag.it.rot||0)+'\u00B0');selBox.style.setProperty('--rd',(-(drag.it.rot||0))+'deg');
    }else if(drag.mode==='size'){
      var ax=drag.ax||'se', mn=isBox(drag.it)?40:20, nx=drag.ox, ny=drag.oy, nw=drag.ow, nh=drag.oh, gz;
      if(+drag.it.rot){   /* a turned item: the pointer is read along the item's own sides, and the opposite side stays where it is */
        var th=(+drag.it.rot)*Math.PI/180, co=Math.cos(th), si=Math.sin(th), dl=dx*co+dy*si, dv=-dx*si+dy*co;
        if(ax.indexOf('e')>=0)nw=drag.ow+dl;
        if(ax.indexOf('w')>=0)nw=drag.ow-dl;
        if(ax.indexOf('s')>=0)nh=drag.oh+dv;
        if(ax.indexOf('n')>=0)nh=drag.oh-dv;
        nw=Math.max(mn,nw);nh=Math.max(mn,nh);
        var al=ax.indexOf('e')>=0?-drag.ow/2:(ax.indexOf('w')>=0?drag.ow/2:0), at=ax.indexOf('s')>=0?-drag.oh/2:(ax.indexOf('n')>=0?drag.oh/2:0),
            bl=ax.indexOf('e')>=0?-nw/2:(ax.indexOf('w')>=0?nw/2:0), bt=ax.indexOf('s')>=0?-nh/2:(ax.indexOf('n')>=0?nh/2:0),
            c0x=drag.ox+drag.ow/2, c0y=drag.oy+drag.oh/2, wx=c0x+al*co-at*si, wy=c0y+al*si+at*co,
            c1x=wx-(bl*co-bt*si), c1y=wy-(bl*si+bt*co);
        drag.it.x=Math.round(c1x-nw/2);drag.it.y=Math.round(c1y-nh/2);place(drag.it);
        if(isBox(drag.it)){drag.it.w=Math.round(nw);drag.it.h=Math.round(nh);}else setBoxSize(drag.it,Math.round(nw),Math.round(nh));
        refreshItem(drag.it);
        glueFollowers((function(o){o[drag.it.id]=1;return o;})({}));
        return;
      }
      if(ax.indexOf('e')>=0)nw=snapX(drag.ox+drag.ow+dx)-drag.ox;
      if(ax.indexOf('s')>=0)nh=snapV(drag.oy+drag.oh+dy)-drag.oy;
      if(ax.indexOf('w')>=0){nx=snapX(drag.ox+dx);nw=drag.ox+drag.ow-nx;}
      if(ax.indexOf('n')>=0){ny=snapV(drag.oy+dy);nh=drag.oy+drag.oh-ny;}
      if(!e.altKey&&ax.indexOf('w')<0&&ax.indexOf('n')<0){gz=guideSnap(drag.it,nx,ny,nw,nh,{},'size');nw=gz.w;nh=gz.h;}else guidesOff();
      nw=Math.max(mn,nw);nh=Math.max(mn,nh);
      if(ax.indexOf('w')>=0)nx=drag.ox+drag.ow-nw;   /* stops at the smallest size instead of sliding */
      if(ax.indexOf('n')>=0)ny=drag.oy+drag.oh-nh;
      drag.it.x=nx;drag.it.y=ny;place(drag.it);
      if(isBox(drag.it)){drag.it.w=nw;drag.it.h=nh;}
      else setBoxSize(drag.it,nw,nh);
      refreshItem(drag.it);
      glueFollowers((function(o){o[drag.it.id]=1;return o;})({}));
    }
  });
  document.addEventListener('mouseup',function(){
    if(!drag)return;
    var d=drag, wasFree=FREE;drag=null;FREE=false;guidesOff();
    if(d.mode==='move'&&d.moved){d.it.parent=reparentTarget(d.it);layDrop(d,wasFree);renderAll();buildForm();commit();}
    else if(d.mode==='size'||d.mode==='ln'||d.mode==='rot'){
      selBox.removeAttribute('data-rot');
      if(d.mode==='ln'){
        var gk=(d.w==='a')?'ga':'gb';
        if(d.hit)d.it.p[gk]=clone(d.hit);else delete d.it.p[gk];
        connHilite(null);connSyncOne(d.it);
        if(d.hit&&d.hit.s==='c'){connBack(d.it);renderAll();}else refreshItem(d.it);
      }
      if(d.mode==='rot')renderAll();buildForm();buildList();commit();
    }
    updateSel();   /* the bar comes back (or stays) once the drag is over */
  });
  document.addEventListener('keydown',function(e){
    if(!DASHAPI.active)return;
    var t=e.target, tag=t&&t.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable))return;
    if(t&&t.closest&&t.closest('#inlhost'))return;
    var k=(e.key||'').toLowerCase();
    if((e.ctrlKey||e.metaKey)&&k==='z'){e.preventDefault();doUndo();return;}
    if((e.ctrlKey||e.metaKey)&&k==='y'){e.preventDefault();doRedo();return;}
    var it=byId(D.sel);
    if((e.ctrlKey||e.metaKey)&&!e.altKey&&k==='v'){e.preventDefault();pasteItem();return;}
    if(!it)return;
    if((e.ctrlKey||e.metaKey)&&!e.altKey&&(k==='c'||k==='x')){e.preventDefault();copyItem(it,k==='x');return;}
    if((e.ctrlKey||e.metaKey)&&k==='d'){e.preventDefault();dup(it);return;}
    if(k==='delete'||k==='backspace'){e.preventDefault();del(it);return;}
    if((k==='enter'||k==='f2')&&!e.ctrlKey&&!e.metaKey){
      var en=nodeOf(it.id);
      if(en&&((it.type==='label'||it.type==='button')?teStart(it,en):teStartP(it,en))){e.preventDefault();return;}
    }
    var step=e.shiftKey?10:1, dx=0, dy=0;
    if(k==='arrowleft')dx=-step;else if(k==='arrowright')dx=step;else if(k==='arrowup')dy=-step;else if(k==='arrowdown')dy=step;else return;
    e.preventDefault();
    it.x+=dx;it.y+=dy;place(it);
    if(isGroupFrame(it))descendants(it.id).forEach(function(c){c.x+=dx;c.y+=dy;place(c);});
    updateSel();
    clearTimeout(moveTimer);moveTimer=setTimeout(function(){buildForm();buildList();commit();},400);
  });
  window.addEventListener('resize',function(){if(DASHAPI.active)applyScale();});

  /* ---------- panel wiring ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-add]'),function(b){
    b.addEventListener('click',function(){addItem(b.getAttribute('data-add'));});
  });
  document.getElementById('dundo').addEventListener('click',doUndo);
  /* Clean the canvas: every item goes in one step, after a second click; Undo brings them back. Items already pushed stay on the PRTG map until a push is told to remove them. */
  (function(){
    var b=document.getElementById('dclean'), armed=null;
    function disarm(){clearTimeout(armed);armed=null;b.classList.remove('armed');b.setAttribute('data-tip','Clean the canvas: remove every item (Undo brings them back)');}
    b.addEventListener('click',function(){
      var n=D.items.length;
      if(!n){disarm();toast('The canvas is already empty');return;}
      if(!armed){armed=setTimeout(disarm,3500);b.classList.add('armed');b.setAttribute('data-tip','Click again to remove all '+n+(n===1?' item':' items'));toast('Click again to remove all '+n+(n===1?' item':' items')+' from the canvas');return;}
      disarm();
      D.items=[];D.sel=null;if(typeof editing!=='undefined'&&editing!==null){try{finishEdit(false);}catch(e){}}
      renderAll();buildForm();commit();
      toast('Removed '+n+(n===1?' item':' items')+'. Undo brings them back.');
    });
  })();
  document.getElementById('dredo').addEventListener('click',doRedo);
  document.getElementById('dgrid').addEventListener('change',function(){
    var v=parseInt(this.value,10)||0;
    if(v===0)D.snap='off';else{D.grid=v;if(D.snap==='off')D.snap='magnet';}
    gridSync();gridPaint();
  });
  document.getElementById('dzoom').addEventListener('change',function(){D.zoom=this.value;applyScale();});
  document.getElementById('dfit').addEventListener('click',function(){setZoom('fit');});
  document.getElementById('dzslider').addEventListener('input',function(){
    var r=document.getElementById('dscroll').getBoundingClientRect();
    setZoom(parseInt(this.value,10)/100,r.left+r.width/2,Math.max(r.top,0)+Math.min(r.height,window.innerHeight)/2);
  });
  /* the wheel zooms the canvas around the pointer; Ctrl and the trackpad pinch do the same */
  document.getElementById('dscroll').addEventListener('wheel',function(e){
    if(!DASHAPI.active||editing!==null)return;
    e.preventDefault();
    var f=Math.exp(-Math.max(-60,Math.min(60,e.deltaY))*(e.ctrlKey?0.012:0.0022));
    setZoom(scale*f,e.clientX,e.clientY);
  },{passive:false});
  document.getElementById('ddark').addEventListener('change',function(){canvas.classList.toggle('dark',this.checked);});
  function sizeChange(){
    var w=parseInt(document.getElementById('dw').value,10), h=parseInt(document.getElementById('dh').value,10);
    if(!(w>=320&&h>=240))return;
    D.w=w;D.h=h;applyScale();commit();
    try{document.dispatchEvent(new CustomEvent('canvassize',{detail:{w:w,h:h}}));}catch(e){}   /* the Map step sends it to the selected PRTG map */
  }
  document.getElementById('dw').addEventListener('change',sizeChange);
  var resSync=window.PMRES.wire(document.getElementById('dres'),function(w,h){document.getElementById('dw').value=String(w);document.getElementById('dh').value=String(h);sizeChange();});
  document.addEventListener('dsize',function(e){resSync(e.detail.w,e.detail.h);});resSync(D.w,D.h);
  document.getElementById('dh').addEventListener('change',sizeChange);
  document.getElementById('dfontcopy').addEventListener('click',function(){
    var l=fontLinks();
    if(!l.length){toast('No web fonts in use');return;}
    copyText(l.map(function(x){return '<link href="'+x.href+'" rel="stylesheet">';}).join(''));
  });
  document.getElementById('dsave').addEventListener('click',function(){
    var t=snapModel();document.getElementById('dlayout').value=t;copyText(t);savedSnap=t;
  });
  document.getElementById('dload').addEventListener('click',function(){
    var raw=document.getElementById('dlayout').value, m=null;
    try{m=JSON.parse(raw);}catch(err){}
    if(!validLayout(m)){toast('That is not valid layout data');return;}
    restoreModel(raw);commit();savedSnap=snapModel();toast('Layout loaded');
  });
  document.getElementById('editdone').addEventListener('click',function(){finishEdit(true);});
  document.getElementById('editcancel').addEventListener('click',function(){finishEdit(false);});
  DASHAPI.enter=function(){TABS.show('dash');};
  DASHAPI.leave=function(){
    if(!DASHAPI.active)return;
    DASHAPI.active=false;
    document.body.classList.remove('dash');
    document.getElementById('mDash').classList.remove('on');
  };
  DASHAPI.finish=function(){if(editing!==null)finishEdit(true);inlEnd();};
  TABS.register({id:'dash',button:'mDash',api:DASHAPI,
    onClick:function(){if(editing!==null)finishEdit(true);else TABS.show('dash');},   /* clicking the tab while editing a label or button finishes the edit first */
    beforeLeave:function(){DASHAPI.finish();},
    open:function(){DASHAPI.active=true;document.body.classList.add('dash');applyScale();renderAll();buildForm();}});
    DASHAPI.frame={FSTYLES:FSTYLES,SHADOW:SHADOW,WEIGHTS:WEIGHTS,newFrameP:newFrameP,frameHTML:frameHTML,newShapeP:newShapeP,lnOpts:lnOpts,SHAPES:SHAPES,isBox:isBoxShape,hasDir:hasDir,kindSwitch:shapeKindSwitch};
    /* what a push to PRTG needs: every item back to front, its box in canvas pixels, its code, and the web fonts that code uses */
    DASHAPI.uid=function(){return D.uid;};
    DASHAPI.pv=DASHAPI.pv||{};
    DASHAPI.markSaved=function(){savedSnap=snapModel();};
    DASHAPI.isDirty=function(){return D.items.length>0&&snapModel()!==savedSnap;};
    window.addEventListener('beforeunload',function(e){if(DASHAPI.isDirty()){e.preventDefault();e.returnValue='';return '';}});   /* the browser asks before an unsaved layout is lost */
    DASHAPI.addObject=function(entry){addItem('prtgobj',entry);};
    /* items from a copied map: exact place, size and stacking order, no snapping, one undo step */
    DASHAPI.addCopies=function(list){
      var ids=[];
      list.slice().sort(function(a,b){return (a.z||0)-(b.z||0);}).forEach(function(e){
        var it={id:D.nextId++,type:'prtgobj',parent:null,x:Math.max(0,Math.round(e.x||0)),y:Math.max(0,Math.round(e.y||0)),w:Math.max(8,Math.round(e.w||320)),h:Math.max(8,Math.round(e.h||200)),state:null,
          p:{cat:e.cat,name:e.name,value:e.value,target:{id:(e.target&&parseInt(e.target.id,10))||0,name:(e.target&&e.target.name)||''},before:e.before||'',after:e.after||'',elink:e.link||'',was:e.was||'',raw:!!e.raw}};
        if(e.sizing)it.p.sizing=e.sizing;
        it.ord=layerOf(it)*100000+(++D.ordSeq);
        D.items.push(it);ids.push(it.id);
      });
      renderAll();commit();
      return ids;
    };
    DASHAPI.select=function(id){if(!byId(id))return;D.sel=id;updateSel();buildList();buildForm();};
    DASHAPI.deselect=function(){if(D.sel!==null)select(null);};
    DASHAPI.dropObject=function(entry,cx,cy){var r=canvas.getBoundingClientRect(), e={}, k;for(k in entry)e[k]=entry[k];e.at={x:Math.max(0,Math.min(D.w-40,(cx-r.left)/scale)),y:Math.max(0,Math.min(D.h-40,(cy-r.top)/scale))};addItem('prtgobj',e);};
    DASHAPI.add=function(type){addItem(type);};
    DASHAPI.addAt=function(type,cx,cy){var r=canvas.getBoundingClientRect();addItem(type,{at:{x:Math.max(0,Math.min(D.w-40,(cx-r.left)/scale)),y:Math.max(0,Math.min(D.h-40,(cy-r.top)/scale))}});};
    DASHAPI.objectLayout=function(){var ord=order(), out=[];ord.forEach(function(it,i){if(it.type==='prtgobj'&&!it.p.raw)out.push({id:it.id,file:it.p.value,cat:it.p.cat,name:it.p.name,target:(it.p.target&&it.p.target.id)||0,x:it.x,y:it.y,w:it.w,h:it.h,z:i+1,mode:objMode(it)});});return out;};
    DASHAPI.setNatural=function(id,w,h){var it=byId(id);if(!it||it.type!=='prtgobj'||objMode(it)!=='content')return;w=Math.max(1,Math.round(w));h=Math.max(1,Math.round(h));if(it.w===w&&it.h===h)return;it.w=w;it.h=h;var n=nodeOf(id);if(n){n.style.width=w+'px';n.style.height=h+'px';}var gf={};gf[id]=1;glueFollowers(gf);updateSel();buildList();if(D.sel===id)buildForm();};
    DASHAPI.applyInitial=function(id,w,h){var it=byId(id);if(!it||it.type!=='prtgobj'||objMode(it)!=='box'||!(it.w===320&&it.h===200))return false;it.w=w;it.h=h;renderAll();var gf2={};gf2[id]=1;glueFollowers(gf2);return true;};   /* the size the object file itself asks for, if you have not changed the default */
    DASHAPI.rerender=function(){renderAll();};
    DASHAPI.selected=function(){var it=byId(D.sel);return it?{id:it.id,type:it.type,p:it.p}:null;};
    DASHAPI.setTarget=function(id,tgt){var it=byId(id);if(!it||it.type!=='prtgobj')return false;it.p.target={id:parseInt(tgt.id,10)||0,name:tgt.name||''};it.p.targetDefault=false;refreshItem(it);buildForm();commit();return true;};
    DASHAPI.layoutText=function(){return snapModel();};
    /* for the Map step's New map form: the layouts, a picture of one at a given size, and starting a new map's canvas */
    DASHAPI.layouts=function(){return LAYOUTS.map(function(T){return T[0];});};
    DASHAPI.layoutSvg=function(i,w,h){
      var T=LAYOUTS[i], vh=Math.round(100*(h||D.h)/(w||D.w)*10)/10, tones=['#8fbfdc','#bcd9ec','#a9b8e6','#d9e6f2','#c9b8e0','#e9d3a6'], s2='';
      if(!T)return '<svg viewBox="0 0 100 '+vh+'" aria-hidden="true"><rect x="5" y="5" width="90" height="'+Math.max(1,vh-10)+'" rx="3" fill="none" stroke="#b8c2cf" stroke-dasharray="4 3"/></svg>';
      T[3].forEach(function(c,j){var x=4+(c[0]/T[1])*92, ww=(c[2]/T[1])*92, y=4+(c[1]/T[2])*(vh-8), hh=(c[3]/T[2])*(vh-8);s2+='<rect x="'+(x+1)+'" y="'+(y+1)+'" width="'+Math.max(1,ww-2)+'" height="'+Math.max(1,hh-2)+'" rx="2" fill="'+tones[j%tones.length]+'"/>';});
      return '<svg viewBox="0 0 100 '+vh+'" aria-hidden="true">'+s2+'</svg>';
    };
    DASHAPI.setCanvasSize=function(w,h){   /* the selected PRTG map's size: taken, not sent back */
      if(!(w>=320&&h>=240)||(D.w===w&&D.h===h))return false;
      D.w=w;D.h=h;var iw=document.getElementById('dw'),ih=document.getElementById('dh');if(iw)iw.value=String(w);if(ih)ih.value=String(h);
      applyScale();if(D.layout)layPaint();commit();return true;
    };
    DASHAPI.toast=function(m){toastDash(m);};
    DASHAPI.newMapCanvas=function(w,h,lay){
      /* the canvas takes the new map's size; a chosen layout shows its cells (items already on the canvas stay where they are: Canvas, Layouts, Fill cells puts them in) */
      if(w>=320&&h>=240){D.w=w;D.h=h;var iw=document.getElementById('dw'),ih=document.getElementById('dh');if(iw)iw.value=String(w);if(ih)ih.value=String(h);applyScale();}
      D.layout=(lay==null||!LAYOUTS[lay])?null:{id:lay,gap:20,margin:20};D.layShow=true;
      layPaint();commit();
    };
    /* ---------- live link push: a connector can be pushed as its own real, self-updating object on the map,
       instead of only shaping the canvas preview. It finds its two glued objects in the live page by themselves
       (a PRTG object by the objectid PRTG already puts on the item, anything else by a hidden marker this tool
       adds to that item's own pushed HTML), and redraws its own line -- position and, for "Match Link style"'s
       status color, each end's live status color -- whenever either end changes. No server round trip, no PRTG
       API for connections (there isn't one): it is a second, independent line drawn in #mapsvg alongside
       whatever PRTG itself may or may not be showing there. ---------- */
    function connTargetSel(gid,need){
      var g=byId(gid);
      if(!g)return null;
      if(g.type==='prtgobj'&&g.p&&g.p.target&&g.p.target.id)return '.map_object[objectid="'+g.p.target.id+'"]';
      need[gid]=true;
      return '[data-msid="ms'+gid+'"]';
    }
    function connLiveCfg(it){
      var p=connNorm(it.p), matched=(p.matchLS!==false&&typeof LKDEF!=='undefined'&&!p.isConnector), L=matched?LKDEF:null;
      function end(v){return (v==='dot'||v==='arrow')?v:'none';}
      if(matched){
        return {type:(L.line==='elbow'||L.line==='relbow'||L.line==='scurve'||L.line==='arc'||L.line==='straight')?L.line:'curve',
          dash:L.dash||'solid',width:lkNum(L.width,1,40,5),opacity:lkNum(L.opacity,10,100,100),glow:!!L.glow,round:!!L.round,
          colorMode:L.colorMode==='custom'?'custom':'status',
          color:(L.colorMode==='custom'&&/^#[0-9a-fA-F]{6}$/.test(String(L.color)))?L.color:'#111827',
          bend:lkNum(L.bend,4,60,22),radius:lkNum(L.radius,2,80,20),start:end(L.start),end:end(L.end),inset:lkNum(L.inset,0,150,28),
          flow:!!L.flow,flowSec:lkNum(L.flowSec,0.4,20,1.4),
          look:p.look||'plain',label:p.labelStyle?String(p.label||'').slice(0,60):'',labelSize:parseFloat(p.labelSize)||14,labelStyle:p.labelStyle||'',labelColor:p.labelColor||'',labelFont:p.labelFont||'',labelWeight:p.labelWeight||'',labelItal:!!p.labelItal,labelUnder:!!p.labelUnder,labelUpper:!!p.labelUpper,labelAlign:p.labelAlign||''};
      }
      /* A connector that does not follow the shared Link style used to be forced to colorMode:'custom',
         so picking any line style for it -- which is what clears matchLS -- silently made live status
         colouring impossible for good. A live connector exists to show the state of what it joins, so
         status is the default here now; "One colour" under Colour opts back out. */
      return {type:({elbow:'relbow',sharp:'elbow',curve:'scurve',bow:'curve',corner:'corner',cornerv:'cornerv',zig:'zig',zigv:'zigv'})[p.lt]||'straight',dash:p.dash||'solid',width:Math.max(1,parseFloat(p.thick)||6),
        opacity:100,glow:false,round:true,colorMode:'status',pal:lnPal(p),
        color:lnPal(p).unknown,bend:22,radius:14,start:end(p.ha),end:end(p.hb),
        inset:28,flow:!!p.anim,flowSec:parseFloat(p.speed)||1.4,
        look:p.look||'plain',label:p.labelStyle?String(p.label||'').slice(0,60):'',labelSize:parseFloat(p.labelSize)||14,labelStyle:p.labelStyle||'',labelColor:p.labelColor||'',labelFont:p.labelFont||'',labelWeight:p.labelWeight||'',labelItal:!!p.labelItal,labelUnder:!!p.labelUnder,labelUpper:!!p.labelUpper,labelAlign:p.labelAlign||''};
    }
    /* self-contained: sent to the browser as text (via toString()) and run there, inside the live PRTG map page --
       not called from here, so it cannot reach anything else in this file and must carry everything it needs in C. */
    function connLiveRuntime(C){
      var NS='http://www.w3.org/2000/svg', mo1=null, mo2=null, raf=null, gcls='msln-g-'+C.uid;
      function f(n){return Math.round(n*10)/10;}
      function el(n,at){var e=document.createElementNS(NS,n),k;for(k in at)e.setAttribute(k,at[k]);return e;}
      function polyline(P,r){
        var d='M'+f(P[0][0])+' '+f(P[0][1]), i,a,b,c,l1,l2,k1,k2,p,q;
        for(i=1;i<P.length-1;i++){
          a=P[i-1];b=P[i];c=P[i+1];
          l1=Math.sqrt(Math.pow(b[0]-a[0],2)+Math.pow(b[1]-a[1],2));l2=Math.sqrt(Math.pow(c[0]-b[0],2)+Math.pow(c[1]-b[1],2));
          k1=Math.min(r,l1/2);k2=Math.min(r,l2/2);
          if(r<=0||l1<1||l2<1){d+='L'+f(b[0])+' '+f(b[1]);continue;}
          p=[b[0]-(b[0]-a[0])/l1*k1,b[1]-(b[1]-a[1])/l1*k1];q=[b[0]+(c[0]-b[0])/l2*k2,b[1]+(c[1]-b[1])/l2*k2];
          d+='L'+f(p[0])+' '+f(p[1])+'Q'+f(b[0])+' '+f(b[1])+' '+f(q[0])+' '+f(q[1]);
        }
        return d+'L'+f(P[P.length-1][0])+' '+f(P[P.length-1][1]);
      }
      function geo(t,x1,y1,x2,y2){
        var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1,mx=(x1+x2)/2,my=(y1+y2)/2,k,cx,cy,P,R;
        if(t==='curve'){k=len*(C.bend/100);if(x2<x1)k=-k;cx=mx+(dy/len)*k;cy=my-(dx/len)*k;return 'M'+f(x1)+' '+f(y1)+'Q'+f(cx)+' '+f(cy)+' '+f(x2)+' '+f(y2);}
        if(t==='scurve'){if(Math.abs(dx)>=Math.abs(dy))return 'M'+f(x1)+' '+f(y1)+'C'+f(mx)+' '+f(y1)+' '+f(mx)+' '+f(y2)+' '+f(x2)+' '+f(y2);return 'M'+f(x1)+' '+f(y1)+'C'+f(x1)+' '+f(my)+' '+f(x2)+' '+f(my)+' '+f(x2)+' '+f(y2);}
        if(t==='corner')return polyline([[x1,y1],[x2,y1],[x2,y2]],C.radius);
        if(t==='cornerv')return polyline([[x1,y1],[x1,y2],[x2,y2]],C.radius);
        if(t==='zig')return polyline([[x1,y1],[x1+dx*0.3,y1],[x1+dx*0.7,y2],[x2,y2]],0);
        if(t==='zigv')return polyline([[x1,y1],[x1,y1+dy*0.3],[x2,y1+dy*0.7],[x2,y2]],0);
        if(t==='elbow'||t==='relbow'){P=(Math.abs(dx)>=Math.abs(dy))?[[x1,y1],[mx,y1],[mx,y2],[x2,y2]]:[[x1,y1],[x1,my],[x2,my],[x2,y2]];return polyline(P,t==='relbow'?C.radius:0);}
        if(t==='arc'){R=len*0.8;return 'M'+f(x1)+' '+f(y1)+'A'+f(R)+' '+f(R)+' 0 0 '+((x2>=x1)?1:0)+' '+f(x2)+' '+f(y2);}
        return 'M'+f(x1)+' '+f(y1)+'L'+f(x2)+' '+f(y2);
      }
      function dashOf(w){
        if(C.dash==='solid'&&C.flow&&!(C.look&&C.look!=='plain'))return [w*2.6,w*1.8];   /* a plain line that flows shows it as moving dashes */
        if(C.dash==='dashed')return [w*2.6,w*1.8];
        if(C.dash==='dotted')return [0.1,w*2.2];
        if(C.dash==='dashdot')return [w*3,w*1.6,0.1,w*1.6];
        return null;
      }
      function cap(g,kind,x,y,ang,w,paint){
        var r,s,c,sn,h;
        if(kind==='dot'){r=Math.max(w*0.9,3.5);g.appendChild(el('circle',{cx:f(x),cy:f(y),r:f(r),fill:paint}));}
        else if(kind==='arrow'){s=Math.max(w*3,11);c=Math.cos(ang);sn=Math.sin(ang);h=s*0.5;g.appendChild(el('polygon',{points:f(x)+','+f(y)+' '+f(x-s*c-h*sn)+','+f(y-s*sn+h*c)+' '+f(x-s*c+h*sn)+','+f(y-s*sn-h*c),fill:paint}));}
      }
      function capOn(g,p,atEnd,kind,w,paint){
        var L,d,s,a,b,ang;
        if(kind!=='dot'&&kind!=='arrow')return;
        L=p.getTotalLength();d=Math.min(C.inset,L*0.4);s=atEnd?L-d:d;
        a=p.getPointAtLength(s);b=p.getPointAtLength(atEnd?s-1.5:s+1.5);ang=Math.atan2(a.y-b.y,a.x-b.x);
        cap(g,kind,a.x,a.y,ang,w,paint);
      }
      var LST={g:'up',r:'down',y:'warning',o:'unusual',b:'paused',bl:'paused',gr:'unknown'};
      var LCOL=(C.pal&&C.pal.up)?C.pal:{up:'#b4cc38',down:'#d71920',warning:'#ffd400',unusual:'#f5821f',paused:'#3b8dd0',unknown:'#9aa4af'};
      /* PRTG's native rendering of a map item bound to a probe or other container object (aggregating many
         children) signals status with a different scheme: boolean map_iconcolor_has<color>/hasno<color> flag
         classes on a nested label span, rather than a single state class on the item itself. Several can be
         true at once (e.g. "1 down + 4 up"); worst status wins, listed worst-first here. */
      var ICOLORDER=['red','partialred','orange','yellow','ack','black','blue','green'];
      var ICOLMAP={red:LCOL.down,partialred:LCOL.down,orange:LCOL.unusual,yellow:LCOL.warning,ack:LCOL.warning,black:LCOL.unknown,blue:LCOL.paused,green:LCOL.up};
      function statusColor(elx){
        if(!elx)return null;
        /* the live status class PRTG (or our own Icon objects, which ask for it the same way) puts on the bound
           element itself -- this works no matter how that element paints its own status (background-color,
           an inner SVG fill, anything), unlike reading computed style, which only sees a plain status dot */
        var m=/\bmap_objectstate_sens([a-z]+)\b/.exec(elx.className||''), k=m?LST[m[1]]:null;
        if(k)return LCOL[k];
        /* A plain device or sensor icon -- the ordinary thing to glue a connector to -- carries none of the
           classes above. PRTG marks its state with map_iconcolor_sens<letter> on a nested .label span, a
           third scheme distinct from both map_objectstate_sens<letter> and the map_iconcolor_has<colour>
           rollup flags below. Read off a live map: an up sensor has map_iconcolor_sensg, a down one
           map_iconcolor_sensr. Without this a connector between two ordinary icons finds no status at all
           and quietly falls back to its plain colour, which is what made these lines look permanently blue. */
        var sl=elx.querySelector?elx.querySelector('[class*="map_iconcolor_sens"]'):null;
        var sm=sl?/\bmap_iconcolor_sens([a-z]+)\b/.exec(String(sl.className||'')):null;
        if(sm&&LST[sm[1]])return LCOL[LST[sm[1]]];
        var lab=elx.querySelector?elx.querySelector('[class*="map_iconcolor_has"]'):null, cls=(lab&&lab.className)||'', i;
        for(i=0;i<ICOLORDER.length;i++){
          if(new RegExp('\\bmap_iconcolor_has'+ICOLORDER[i]+'\\b').test(cls))return ICOLMAP[ICOLORDER[i]];
        }
        /* last class-based resort: the sensor's own anchor repeats the state letter as a bare class
           (e.g. "sensorid1025 sensg sensormenu"). Matched token by token so "sensor" cannot be mistaken
           for a state letter. */
        var an=elx.querySelector?elx.querySelector('a[class*="sensorid"]'):null;
        var at=an?String(an.className||'').split(/\s+/):[], am;
        for(i=0;i<at.length;i++){
          am=/^sens([a-z]{1,2})$/.exec(at[i]);
          if(am&&LST[am[1]])return LCOL[LST[am[1]]];
        }
        try{var bg=getComputedStyle(elx).backgroundColor;if(bg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')return bg;}catch(e){}
        return null;
      }
      /* the element's own wrapper is often larger than and offset from the actual icon glyph (e.g. PRTG's
         probe icon wrapper also includes a status-label strip below it) -- anchor to the inner <img>, when
         there is one, so the line lands on the glyph rather than the whole padded box */
      function anchorEl(elx){
        if(!elx||!elx.querySelectorAll)return elx;
        if(/\bmap_(table|graph)\b/.test(String(elx.className||'')))return elx;
        var l=elx.querySelectorAll('img'), best=null, ba=0, i, r, ar;
        for(i=0;i<l.length;i++){r=l[i].getBoundingClientRect();ar=r.width*r.height;if(ar>ba){ba=ar;best=l[i];}}
        return best||elx;
      }
      function edgePoint(cx,cy,w,h,tx,ty){
        var dx=tx-cx, dy=ty-cy;
        if(Math.abs(dx)<0.01&&Math.abs(dy)<0.01)return [cx,cy];
        var hw=w/2, hh=h/2, sx=hw>0?Math.abs(dx)/hw:1e9, sy=hh>0?Math.abs(dy)/hh:1e9, s=Math.max(sx,sy)||1;
        return [cx+dx/s,cy+dy/s];
      }
      /* Several map items can share one PRTG object id -- four icons all still bound to the default Local
         Probe is the common case -- and a plain querySelector would then hand both ends of the line the very
         same element, drawing a zero-length line nobody can see. PRTG lays each item out at exactly the
         left/top we pushed for it, so when a selector matches more than one element, keep the one standing
         where this end was glued. */
      function pick(sel,pos){
        var l;try{l=document.querySelectorAll(sel);}catch(e){return null;}
        if(!l||!l.length)return null;
        if(l.length===1||!pos)return l[0];
        var best=l[0],bd=Infinity,i,dx,dy,d;
        for(i=0;i<l.length;i++){
          dx=l[i].offsetLeft-pos[0];dy=l[i].offsetTop-pos[1];d=dx*dx+dy*dy;
          if(d<bd){bd=d;best=l[i];}
        }
        return best;
      }
      /* the item standing exactly where this end was pushed. PRTG lets you drop a device-tree entity onto a map item, which changes the
         item's object id but not where it is; going by position first keeps the line on the right item after that */
      function atPos(pos){
        if(!pos)return null;
        var l=document.querySelectorAll('.map_object'), i, e;
        for(i=0;i<l.length;i++){
          e=l[i];
          if(Math.abs(e.offsetLeft-pos[0])<=2&&Math.abs(e.offsetTop-pos[1])<=2&&!e.querySelector('[id^=mslnhost]'))return e;
        }
        return null;
      }
      function find(){return [atPos(C.posA)||pick(C.selA,C.posA),atPos(C.posB)||pick(C.selB,C.posB)];}
      function draw(){
        var svg=document.getElementById('mapsvg'), els=find(), elA=els[0], elB=els[1], old=svg&&svg.querySelector('g.'+gcls);
        /* while PRTG redraws its items the line stays where it was, rather than vanishing until the next look */
        if(!svg||!elA||!elB||elA===elB||!document.body.contains(elA)||!document.body.contains(elB))return;
        var ctm=svg.getScreenCTM();
        if(!ctm)return;
        var pt=svg.createSVGPoint();
        function toSvg(cx,cy){pt.x=cx;pt.y=cy;var p=pt.matrixTransform(ctm.inverse());return [p.x,p.y];}
        var ra=anchorEl(elA).getBoundingClientRect(), rb=anchorEl(elB).getBoundingClientRect();
        var caV=[ra.left+ra.width/2,ra.top+ra.height/2], cbV=[rb.left+rb.width/2,rb.top+rb.height/2];
        var aV=edgePoint(caV[0],caV[1],ra.width,ra.height,cbV[0],cbV[1]), bV=edgePoint(cbV[0],cbV[1],rb.width,rb.height,caV[0],caV[1]);
        var A=toSvg(aV[0],aV[1]), B=toSvg(bV[0],bV[1]);
        if(old&&old.parentNode)old.parentNode.removeChild(old);
        var w=C.width, d=geo(C.type,A[0],A[1],B[0],B[1]), ds=dashOf(w), round=(C.round||C.dash==='dotted'||C.dash==='dashdot')?'round':'butt';
        var colA=C.colorMode==='status'?(statusColor(elA)||C.color):C.color, colB=C.colorMode==='status'?(statusColor(elB)||C.color):C.color, paint=colA;
        var g=el('g',{'class':gcls,opacity:C.opacity/100});
        if(colA!==colB){
          var gidc='msg_'+C.uid, defs=svg.querySelector('defs');
          if(!defs){defs=el('defs',{});svg.insertBefore(defs,svg.firstChild);}
          var old2=defs.querySelector('#'+gidc);if(old2)old2.parentNode.removeChild(old2);
          var lg=el('linearGradient',{id:gidc,x1:f(A[0]),y1:f(A[1]),x2:f(B[0]),y2:f(B[1]),gradientUnits:'userSpaceOnUse'});
          lg.appendChild(el('stop',{offset:'0%','stop-color':colA}));lg.appendChild(el('stop',{offset:'48%','stop-color':colA}));
          lg.appendChild(el('stop',{offset:'52%','stop-color':colB}));lg.appendChild(el('stop',{offset:'100%','stop-color':colB}));
          defs.appendChild(lg);paint='url(#'+gidc+')';
        }
        svg.appendChild(g);
        var lkSp=C.flowSec>=2.2?3:(C.flowSec<=1?0.8:1.6), lk=null, lkOn=!!C.look&&C.look!=='plain';
        if(lkOn||C.label)lk=mkLook({look:lkOn?C.look:'plain',d:d,paint:paint,w:w,c1:colA,c2:colB,uid:C.uid,anim:!!C.flow,sp:lkSp,label:{text:C.label,size:C.labelSize,style:C.labelStyle,color:C.labelColor,fam:C.labelFont,wt:C.labelWeight,it:C.labelItal,un:C.labelUnder,up:C.labelUpper,al:C.labelAlign}});
        if(lkOn)g.insertAdjacentHTML('beforeend',lk.defs+lk.body);
        if(C.glow&&!lkOn)g.appendChild(el('path',{d:d,fill:'none',stroke:paint,'stroke-width':f(w*2.2),'stroke-linecap':'round',style:'opacity:.22;filter:blur(4px)'}));
        var p2=el('path',{d:d,fill:'none',stroke:paint,'stroke-width':w,'stroke-linecap':round,'stroke-linejoin':'round'});
        if(ds){
          var sum=0,i;for(i=0;i<ds.length;i++)sum+=ds[i];
          p2.setAttribute('stroke-dasharray',ds.map(f).join(' '));
          if(C.flow){var sp=C.flowSec>=2.2?3:(C.flowSec<=1?0.8:1.6);p2.appendChild(el('animate',{attributeName:'stroke-dashoffset',from:f(sum),to:0,dur:(sum/(60*(1.6/sp))).toFixed(2)+'s',repeatCount:'indefinite'}));}
        }
        if(lkOn)p2.setAttribute('stroke','none');
        g.appendChild(p2);
        capOn(g,p2,false,C.start,w,colA);capOn(g,p2,true,C.end,w,colB);
        if(lk&&lk.over)g.insertAdjacentHTML('beforeend',lk.over);
      }
      function schedule(){if(raf)return;raf=requestAnimationFrame(function(){raf=null;draw();});}
      function obs(elx){if(!elx)return null;try{var o=new MutationObserver(schedule);o.observe(elx,{attributes:true,attributeFilter:['style','class'],subtree:true});return o;}catch(e){return null;}}
      function start(){
        var els=find();
        if(mo1)mo1.disconnect();if(mo2)mo2.disconnect();
        mo1=obs(els[0]);mo2=obs(els[1]);
        draw();
      }
      /* PRTG runs this again whenever it redraws the line's own item; the earlier run stops, so there is only ever one */
      var SKEY='__mslnstop_'+C.uid;
      try{if(window[SKEY])window[SKEY]();}catch(e){}
      start();
      var tick=setInterval(start,2000);
      window.addEventListener('resize',schedule);
      window[SKEY]=function(){clearInterval(tick);if(mo1)mo1.disconnect();if(mo2)mo2.disconnect();window.removeEventListener('resize',schedule);if(raf){cancelAnimationFrame(raf);raf=null;}};
    }
    function connLivePushHtml(it,need){
      var selA=it.p.ga?connTargetSel(it.p.ga.id,need):null, selB=it.p.gb?connTargetSel(it.p.gb.id,need):null;
      if(!selA||!selB)return null;
      var C=connLiveCfg(it);C.selA=selA;C.selB=selB;C.uid='c'+it.id;
      /* where each glued end is expected to sit, so the runtime can tell apart several items that share one
         PRTG object id; these are the same coordinates this push sends as the target item's left/top */
      var ta=byId(it.p.ga.id), tb=byId(it.p.gb.id);
      if(ta)C.posA=[Math.round(ta.x),Math.round(ta.y)];
      if(tb)C.posB=[Math.round(tb.x),Math.round(tb.y)];
      var src=String(connLiveRuntime).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\n\s*/g,'\n'), o=[];
      o.push('<div id="mslnhost'+it.id+'" style="position:absolute;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;"></div>');
      /* PRTG strips literal <script>...</script> pairs from a map object's manually-set HTML when it is
         saved server-side, so a plain inline <script> tag never survives to the live page at all (it also
         would not run even if it did: content parsed via innerHTML never executes script elements). Instead,
         bootstrap through an <img> error handler -- attribute-level content like this isn't touched by that
         same tag-stripping pass -- which builds a REAL script element via createElement+appendChild (which
         DOES execute, unlike innerHTML-parsed markup) and runs our runtime from there. */
      /* Carry the runtime as base64 rather than as readable source. PRTG re-serialises a saved object's
         HTML: it rewrites attribute delimiters to single quotes and re-escapes the value. The previous
         build wrote the source in plain, so everything after its first apostrophe (var NS='http://...')
         fell outside data-msln and the page ran a 37-character fragment that did nothing. Base64 has no
         quotes, angle brackets or ampersands, so nothing in it can close an attribute or be touched by
         re-escaping, whichever delimiter PRTG picks. encodeURIComponent keeps non-Latin1 object names
         working, which btoa on its own would throw on. */
      var lkSrc=String(mkLook).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\n\s*/g,'\n');
      var js='var mkLook='+lkSrc+';('+src+')('+JSON.stringify(C)+');';
      var payload=btoa(unescape(encodeURIComponent(js)));
      o.push('<img src="x" alt="" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;" '+
        'data-msln="'+payload+'" onerror="var s=document.createElement(&quot;script&quot;);'+
        's.text=decodeURIComponent(escape(atob(this.getAttribute(&quot;data-msln&quot;))));'+
        'document.head.appendChild(s);this.parentNode&amp;&amp;this.parentNode.removeChild(this);">');
      return o.join('\n');
    }
    DASHAPI.pushItems=function(){
      var out=[], ord=order(), i, j, need={};
      for(i=0;i<ord.length;i++){
        var it=ord[i], h=itemInner(it), fam={}, f=fontsOf(it), links=[];
        for(j=0;j<f.length;j++){if(!f[j][0]||isLocalFont(f[j][0]))continue;(fam[f[j][0]]=fam[f[j][0]]||{})[f[j][1]]=1;}
        Object.keys(fam).forEach(function(k){
          var ws=Object.keys(fam[k]).map(Number).sort(function(a,b){return a-b;});
          links.push('https://fonts.googleapis.com/css2?family='+k.replace(/ /g,'+')+':wght@'+ws.join(';')+'&display=swap');
        });
        var rec={id:it.id,type:it.type,name:itemName(it),left:Math.round(it.x),top:Math.round(it.y),width:Math.round(it.w),height:Math.round(it.h),html:(it.type==='prtgobj'?String(it.p.before||''):h),fonts:links};
        if(it.type==='prtgobj'){rec.after=String(it.p.after||'');rec.link=String(it.p.elink||'');}
        if(it.type==='prtgobj')rec.object={cat:it.p.cat,name:it.p.name,value:it.p.value,targetDefault:!!it.p.targetDefault,target:{id:(it.p.target&&it.p.target.id)||0,name:(it.p.target&&it.p.target.name)||''}};
        if(isLine(it)&&it.p.pushLive&&it.p.ga&&it.p.gb)rec._liveConn=true;
        out.push(rec);
      }
      /* now that every item's id (and so every possible glue target) is known, build each live connector's real
         pushed content, and mark any non-PRTG-object item it targets so that item's own HTML carries a hidden
         handle the connector's script can find it by */
      out.forEach(function(rec){
        if(!rec._liveConn)return;
        var it=byId(rec.id), html=connLivePushHtml(it,need);
        if(html)rec.html=html;else delete rec._liveConn;
      });
      if(Object.keys(need).length)out.forEach(function(rec){
        if(need[rec.id]&&rec.type!=='prtgobj')rec.html='<span data-msid="ms'+rec.id+'" style="display:none"></span>'+(rec.html||'');
      });
      out.forEach(function(rec){delete rec._liveConn;});
      return out;
    };   /* the Objects tab pastes the same frame code */

  baseSnap=snapshot();
  committed=snapModel();
  updateUndoBtns();
  buildForm();
}catch(err){
  if(window.console)console.error('Dashboard failed to start',err);
  var b=document.getElementById('mDash');
  if(b){b.style.display='none';}
}
})();
/* @endregion: dashboard */

/* @region: push */
/* Adds the Dashboard's items to a PRTG map, and on the next push updates the items it added instead of adding new ones.
   It uses the same calls PRTG's own map designer makes:
     GET  api/table.json?content=maps&columns=name,objid     the list of maps
     GET  /api/mapobject.json                                 the catalogue of object files (to find the Custom HTML element by name)
     POST /api/addobjecttomap.htm                             objectid, top, left, id, width, height, mapobject_, noautoposition, result
     POST /api/editmapobject.htm                              subid, id, top, left, width, height, zindex, htmlbefore_, htmlafter_, ElementLink
     GET  /api/deletesubobject.htm                            id, subid
   These are the designer's own calls, not PRTG's documented API, so they are kept together here.
   What was sent for each item is remembered, per server, map and layout, so a later push can tell new, changed, unchanged and removed items apart. */
(function pushModule(){
  var _pq=[140,37,52,63,146,221,107,244];
try{
  var $=function(id){return document.getElementById(id);};
  var KEY=CFG.keys.pushes, SKEY=CFG.keys.sync;
  var S={maps:null,objFile:null,catalog:null,tgt:{},reviewed:null,cls:null,busy:false,forgetArm:null,deleteArm:null};
  var bannerT=null;
  /* a result or an error shows over the Dashboard, whichever sections are open; a new action clears the last one */
  function banner(msg,kind){
    var b=$('prtgmsg');
    clearTimeout(bannerT);
    if(msg&&(kind==='err'||kind==='ok')){
      $('prtgmsgtext').textContent=msg;b.className=kind;b.hidden=false;
      placePop();   /* the login card sits below the message, not over it */
      if(kind==='ok')bannerT=setTimeout(function(){b.hidden=true;$('prtgbar').style.setProperty('--msgH','0px');},12000);
    }else{b.hidden=true;$('prtgbar').style.setProperty('--msgH','0px');}
  }
  /* the login card is fixed to the window under the connection bar, so no panel can cut it off and a short window can scroll it */
  /* the first screen is a full-page "Connect to PRTG" gate (#prtgpop.gate); once
     Connect succeeds for the first time, this swaps it back to the normal small
     floating popup (reused later for session-expiry re-auth) and reveals the
     rest of the tool. Runs only once per load. */
  function openApp(){
    var p=$('prtgpop');
    if(!p.classList.contains('gate'))return;
    p.classList.remove('gate');
    p.hidden=true;
    $('appHeader').hidden=false;
    $('appMain').hidden=false;
  }
  function placePop(){
    var p=$('prtgpop'), bar=$('prtgbar'), msg=$('prtgmsg'), r, top;
    if(!p||p.hidden||p.classList.contains('gate'))return;
    r=bar.getBoundingClientRect();if(!r.height)r=$('modebar').getBoundingClientRect();top=r.bottom+(msg.hidden?0:msg.offsetHeight)+6;
    p.style.left=(r.left+8)+'px';p.style.width=Math.max(260,r.width-16)+'px';p.style.top=top+'px';p.style.maxHeight=Math.max(180,window.innerHeight-top-12)+'px';
  }
  function say(msg,kind){var n=$('pushstatus'), m=$('pushmsg');n.textContent=msg;n.className='note pst'+(kind?' '+kind:'');if(m){m.textContent=msg;m.className='note pst'+(kind?' '+kind:'');}banner(msg,kind);}
  /* PRTG wants a login: say so and open the panel with the fields, ready to type */
  function authNeeded(){
    $('pushauth').hidden=false;S.lastErr='login needed';S.authAsked=true;S.needLogin=true;
    $('prtgpop').hidden=false;swSync();
    try{$('pushuser').focus();}catch(e){}
  }
  /* the page's own address, or null when it was opened from a file */
  function pageOrigin(){try{return (location.protocol==='http:'||location.protocol==='https:')?location.origin:null;}catch(e){return null;}}
  /* only the server part of what is typed is used: a pasted page address such as https://localhost:8443/index.htm still works, and a missing https:// is added */
  function normalize(v){
    v=String(v||'').trim();if(!v)return '';
    try{return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(v)?v:'https://'+v).origin;}catch(e){return v.replace(/\/+$/,'');}
  }
  /* PRTG's new interface (for example https://localhost:1616) is a separate front end. It answers every address it does not know with its own page, and serves the classic server (the one that holds maps, objects and settings) under /api/v1. So on such an address every request goes to /api/v1/ plus the classic path. Found once per address, when connecting. */
  var UIPFX={};
  function rawBase(){return normalize($('pushserver').value);}
  function base(){var o=rawBase();return o?o+(UIPFX[o]||''):'';}
  function newUI(){var o=rawBase();return !!(o&&UIPFX[o]);}
  function detectUI(o){
    if(!o||Object.prototype.hasOwnProperty.call(UIPFX,o))return Promise.resolve();
    return fetchWithTimeout(o+'/',{credentials:'omit'}).then(function(r){return r.text();}).then(function(t){
      UIPFX[o]=/PRTG UI is loading|\/bundle\/main-/.test(t)?'/api/v1':'';
    }).catch(function(){});
  }
  /* this page always runs as a chrome-extension:// page now, never opened from
     PRTG itself, so pageOrigin() is always null here; a server address is
     always required, and the old "copy this file into PRTG's webroot" note
     (#pushhow) no longer applies. */
  function describeWhere(){
    var b=base(), n=$('pushwhere');
    $('pushhow').hidden=true;
    if(b){n.textContent='Will connect to '+rawBase()+(newUI()?' (the new PRTG interface; maps and objects are read through its classic service).':'.');n.className='note pst';}
    else{n.textContent='Enter your PRTG server\u2019s address below.';n.className='note pst';}
  }
  /* browsers deliberately reject every network-level fetch() failure with the
     same generic error, whatever the real cause -- an untrusted certificate,
     DNS failure, connection refused, a firewall -- so a page's own JS (this
     extension included) cannot tell which one happened; that's intentional,
     the same kind of restriction as the CSRF-token redaction seen earlier
     while testing, just enforced by the browser instead of a dev tool. The
     one case that IS genuinely detectable (no network at all) is split out;
     everything else becomes an ordered checklist instead of one paragraph,
     cert-trust first since that's by far the most common cause here (PRTG's
     default self-signed certificate). */
  function cannotReach(b){
    var addr=b||'your PRTG server';
    if(window.navigator&&navigator.onLine===false){
      return 'This device has no network connection right now. Check your connection, then press Connect again.';
    }
    return 'Could not reach '+addr+'.\n'
      +'• First time connecting here? Open '+addr+' in a new tab, click through the certificate warning, then press Connect again.\n'
      +'• Otherwise, check the address/port, that PRTG is running there, and that this extension has permission for that address.';
  }
  /* PRTG's own pages add an anti-CSRF token to every request that is not a GET (it comes from a <meta name="csrf-token"> tag). The loader keeps the token
     before it replaces the page; failing that, it is read from the page, or from a PRTG page fetched once. */
  var tokenPromise=null;
  function csrf(){
    if(tokenPromise)return tokenPromise;
    var t=null;
    try{t=window.__prtgCsrf||((document.querySelector('meta[name="csrf-token"]')||{}).content)||null;}catch(e){}
    if(t){tokenPromise=Promise.resolve(t);return tokenPromise;}
    tokenPromise=fetch(base()+'/index.htm',{credentials:base()?'omit':'same-origin',headers:{'X-Requested-With':'XMLHttpRequest'}}).then(function(r){return r.text();}).then(function(h){
      var m=/<meta[^>]+name=["']csrf-token["'][^>]*content=["']([^"']+)["']/i.exec(h)||/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']csrf-token["']/i.exec(h);
      return m?m[1]:'';
    }).catch(function(){return '';});
    return tokenPromise;
  }
  /* your login, if PRTG asked for one: a username with a passhash, or an API token. Only ever sent, never stored. */
  function authParams(){
    var u=String(($('pushuser')||{}).value||'').trim(), k=String(($('pushsecret')||{}).value||'').trim(), o={};
    if(!k)return o;
    if(u){o.username=u;o.passhash=k;}else if(!CFG.connection.loginRequired){o.apitoken=k;}
    return o;
  }
  function loginFilled(){return !!(String($('pushuser').value||'').trim()&&String($('pushsecret').value||'').trim());}
  /* the card says what is missing, and where */
  function loginMark(userBad,secretBad,userMsg,secretMsg){
    $('lgfuser').classList.toggle('bad',!!userBad);$('lgfsecret').classList.toggle('bad',!!secretBad);
    $('pushusererr').textContent=userBad?(userMsg||''):'';$('pushsecreterr').textContent=secretBad?(secretMsg||''):'';
  }
  function loginMissing(){
    var u=!String($('pushuser').value||'').trim(), k=!String($('pushsecret').value||'').trim();
    loginMark(u,k,'Enter your PRTG username.','Enter your passhash.');
    S.lastErr='sign in first';S.needLogin=true;$('prtgpop').hidden=false;swSync();
    try{(u?$('pushuser'):$('pushsecret')).focus();}catch(e){}
  }
  function withAuth(params){var o={},k,a=authParams();for(k in (params||{}))o[k]=params[k];for(k in a)o[k]=a[k];return o;}
  function qstring(p,raw){return Object.keys(p).map(function(k){var v=encodeURIComponent(p[k]);if(raw)v=v.replace(/%2C/gi,',');return encodeURIComponent(k)+'='+v;}).join('&');}
  /* fetch() rejects with the same generic TypeError for every network-level
     failure -- a bad/untrusted certificate, DNS failure, connection refused,
     a timeout, CORS -- the browser deliberately doesn't expose which one, so
     there is no way to show a cert-specific message vs. a DNS-specific one.
     cannotReach() below covers the realistic causes in one message instead.
     A hard timeout is added here (fetch has none of its own) so a slow or
     stalled connection always surfaces a clear error rather than leaving
     "Connecting..." on screen forever with no feedback. */
  var HTTP_TIMEOUT_MS=20000;
  function fetchWithTimeout(url,init){
    if(!(window.AbortController))return fetch(url,init);
    var ac=new AbortController(), t=setTimeout(function(){ac.abort();},HTTP_TIMEOUT_MS);
    if(document.getElementById('pushconnect')&&document.getElementById('pushconnect').disabled)CONN.acs.push(ac);   /* a request made while connecting can be cancelled */
    init=Object.assign({},init,{signal:ac.signal});
    return fetch(url,init).then(function(r){clearTimeout(t);return r;},function(e){clearTimeout(t);throw e;});
  }
  /* credentials:'omit' (not 'include') for a cross-origin server -- this page
     always runs from chrome-extension://..., so b is always set and this is
     always the live branch. 'include' would send any existing PRTG session
     cookie for that origin (e.g. from the user being logged in via a normal
     browser tab) along with every request, which lets a stale cookie session
     authenticate the request regardless of what's typed in the login card --
     wrong credentials would silently "work". 'omit' makes the typed
     username/passhash (or API token) the only thing that can authenticate a
     request here, matching what the login card already tells the person. */
  function http(method,path,params){
    var b=base(), p=withAuth(params), url=b+path;
    var headers={'X-Requested-With':'XMLHttpRequest','Accept':(method==='GET')?'application/json, text/javascript, */*; q=0.01':'*/*'};
    var go=function(tok){
      var init={method:method,credentials:b?'omit':'same-origin',headers:headers};
      if(method==='POST'){headers['Content-Type']='application/x-www-form-urlencoded; charset=UTF-8';if(tok)headers['anti-csrf-token']=tok;init.body=qstring(p,false);}
      else{var qs=qstring(p,true);if(qs)url+=(url.indexOf('?')>-1?'&':'?')+qs;}
      return fetchWithTimeout(url,init).then(function(r){
        return r.text().then(function(t){
          if(!r.ok){var e=new Error('PRTG answered '+r.status+' for '+path+'.');e.status=r.status;throw e;}
          return t;
        });
      },function(e){throw new Error((e&&e.name==='AbortError')?('Timed out waiting for '+(b||'your PRTG server')+' to answer ('+(HTTP_TIMEOUT_MS/1000)+'s). '+cannotReach(b)):cannotReach(b));});
    };
    return method==='POST'?csrf().then(go):go('');
  }
  function parseJson(t,what){
    try{return JSON.parse(t);}
    catch(e){throw new Error(what+' did not come back as data. Are you logged in to PRTG, and is this page open from your PRTG server?');}
  }
  /* the Custom HTML element is looked up by name in PRTG's own catalogue, as the designer does when you drag one onto a map */
  function findCustomHtml(cat){
    var c, i, e, byName=null;
    for(c in cat){
      if(!Array.isArray(cat[c]))continue;
      for(i=0;i<cat[c].length;i++){
        e=cat[c][i];
        if(!e||typeof e!=='object')continue;
        if(/ownhtmlonly/i.test(String(e.value||'')))return e.value;
        if(e.name==='Custom HTML element'&&!byName)byName=e.value;
      }
    }
    return byName;
  }
  /* the name shown for one of PRTG's own built-in icon files, from its path: "/defaulticons1/A1 pc.svg" -> "A1 pc" */
  function iconName(path){
    var m=/([^\/\\]+)\.(svg|png)$/i.exec(String(path||''));
    return m?m[1].replace(/[_-]+/g,' ').trim():String(path||'');
  }
  /* every object file PRTG lists, as {cat, name, value}; value is what PRTG wants as mapobject_ when the object is placed on a map.
     A plain icon file (PRTG's own built-in device/status pictures, listed as bare paths rather than {name,value}) is included the
     same way: placed and bound to a target exactly like any other object, PRTG colors it by that target's live status itself. */
  function parseCatalog(cat){
    var out=[], c, i, e;
    for(c in cat){
      if(!Array.isArray(cat[c]))continue;
      for(i=0;i<cat[c].length;i++){
        e=cat[c][i];
        if(e&&typeof e==='object'&&typeof e.value==='string'&&/\.htm$/i.test(e.value)&&!/ownhtmlonly/i.test(e.value))out.push({cat:c,name:String(e.name||'').trim(),value:e.value});
        else if(typeof e==='string'&&/\.(svg|png)$/i.test(e))out.push({cat:c,name:iconName(e),value:e,icon:true});
      }
    }
    return out;
  }
  function libLoad(){try{var o=JSON.parse(localStorage.getItem(CFG.keys.library)||'{}');return (o&&typeof o==='object')?o:{};}catch(e){return {};}}
  function keyOf(cat,name){return (String(cat)+'\u0001'+String(name)).toLowerCase();}
  /* ---- what each push did, so it can be undone */
  function loadHist(){try{var a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
  function saveHist(a){try{localStorage.setItem(KEY,JSON.stringify(a.slice(-20)));return true;}catch(e){S.storeFail=true;return false;}}
  /* a record that could not be saved (most likely the browser's storage for this extension is full) is said in the result, not hidden */
  function storeWarn(){return S.storeFail?' Warning: this browser could not save its record of what was done (its storage for this extension may be full). The next push may add these items again instead of updating them, and Undo may not know about this one.':'';}
  function entryAdded(e){return e.added||e.subids||[];}       /* pushes made by earlier versions only recorded what they added */
  function entryCount(e){return entryAdded(e).length+(e.updated||[]).length+(e.removed||[]).length;}
  function undoCount(e){return entryAdded(e).length+(e.updated||[]).filter(function(u){return u.before;}).length;}   /* what Undo can reverse: deleted items cannot be brought back */
  function mapId(){return $('pushmap').value;}
  function mapName(){var o=$('pushmap').options[$('pushmap').selectedIndex];return o?o.textContent:'';}
  function lastPush(){var h=loadHist(),i;for(i=h.length-1;i>=0;i--){if(sameTarget(h[i])&&undoCount(h[i]))return h[i];}return null;}
  function addsOnly(e){return !(e.updated&&e.updated.length)&&!(e.removed&&e.removed.length);}
  /* ---- what was sent for each Dashboard item, per server, map and layout */
  function loadSync(){try{var o=JSON.parse(localStorage.getItem(SKEY)||'{}');return (o&&typeof o==='object')?o:{};}catch(e){return {};}}
  function saveSync(o){
    var ks=Object.keys(o).sort(function(a,b){return (o[b].at||0)-(o[a].at||0);}), n={};
    ks.slice(0,12).forEach(function(k){n[k]=o[k];});
    try{localStorage.setItem(SKEY,JSON.stringify(n));return true;}catch(e){S.storeFail=true;return false;}
  }
  /* the server a push or map edit went to. History entries carry it, so Undo never sends one server's item ids to another server that has a map with the same id.
     Entries saved before 1.5.41 have no server, so they are never offered for Undo. */
  function srvId(){return base()||pageOrigin()||'';}
  function sameTarget(e){return !!e&&typeof e.srv==='string'&&e.srv===srvId()&&String(e.map)===String(mapId());}
  function syncKey(){return srvId()+'|'+mapId()+'|'+DASHAPI.uid();}
  function getRec(){var r=loadSync()[syncKey()];return (r&&r.items)?r:{at:0,items:{}};}
  function putRec(r){var o=loadSync();r.at=Date.now();o[syncKey()]=r;saveSync(o);}
  function dropRec(){var o=loadSync();delete o[syncKey()];saveSync(o);}
  function hasRec(){return Object.keys(getRec().items).length>0;}
  function updateButtons(){
    var ready=!!(S.maps&&S.objFile&&mapId());
    $('pushmap').disabled=!(S.maps&&S.maps.length)||S.busy;
    $('newmapToggle').disabled=!S.maps||S.busy;
    $('deleteMapBtn').disabled=!S.maps||S.busy||!$('pushmap').value;
    $('pushreview').disabled=!ready||S.busy;
    $('objsamples').disabled=!(S.maps&&mapId())||S.busy;
    $('exload').disabled=!(S.maps&&mapId())||S.busy;
    try{mcSync();}catch(e){}
    $('objrefresh').disabled=!(S.maps&&S.objFile)||S.busy;
    updateTarget();
    if(typeof xeButtons==='function')xeButtons();
    if(typeof swSync==='function')swSync();
    var lp=ready?lastPush():null, n=lp?undoCount(lp):0;
    $('pushundo').disabled=!lp||S.busy;
    var undoLabel='Undo last push';
    if(lp){var unit=addsOnly(lp)?(n===1?'item':'items'):(n===1?'change':'changes');undoLabel='Undo last push ('+n+' '+unit+')';}
    $('pushundo').textContent=undoLabel;
    var rec=ready&&hasRec();
    $('pushforget').hidden=!rec;$('pushforgetnote').hidden=!rec;$('pushforget').disabled=S.busy;
    if(!S.forgetArm)$('pushforget').textContent='Forget what was pushed';
    $('pushgo').disabled=S.busy||!S.reviewed;
  }
  function norm(html){var d=document.createElement('div');d.innerHTML=html;return d.innerHTML;}   /* the designer normalises HTML Before through an element before it saves it */
  function plan(){
    var items=DASHAPI.pushItems(), ox=parseInt($('pushoffx').value,10)||0, oy=parseInt($('pushoffy').value,10)||0, z0=parseInt($('pushz').value,10)||0;
    return items.map(function(it,i){
      var links=it.fonts.map(function(h){return '<link href="'+h+'" rel="stylesheet">';}).join('');
      var o={id:it.id,name:it.name,type:it.type,left:it.left+ox,top:it.top+oy,width:it.width,height:it.height,z:z0+i};
      if(it.object){o.kind='object';o.object=it.object;o.html=it.html||'';if(it.after)o.after=it.after;if(it.link)o.link=it.link;}
      else{o.kind='paste';o.html=norm(links+it.html);}
      return o;
    });
  }
  function fullSet(it){var o={left:it.left,top:it.top,width:it.width,height:it.height,z:it.z,html:it.html};if(it.after)o.after=it.after;if(it.link)o.link=it.link;return o;}   /* after and link only when set, so items pushed before keep their record */
  function objIdent(it){return it.kind==='object'?{value:it.object.value,target:it.object.target.id}:undefined;}   /* which file and which target an item was added with: PRTG fixes them when the item is added */
  /* each item is new, changed, unchanged, or (remembered but gone from the Dashboard) removed */
  function classify(p){
    var rec=getRec(), seen={}, out={items:[],removed:[],nNew:0,nChanged:0,nSame:0,nMissing:0,nReplace:0,hadRec:Object.keys(rec.items).length>0};
    p.forEach(function(it){
      var r=rec.items[it.id], why=[];
      seen[it.id]=1;
      if(it.kind==='object'&&S.catalog&&it.object.value!==S.objFile&&!S.catalog.some(function(c){return c.value===it.object.value;})){it.status='missing';out.nMissing++;out.items.push(it);return;}   /* the file is not in PRTG: it cannot be placed */
      if(!r||r.type&&r.type!==it.type){it.status='new';out.nNew++;}
      else{
        it.subid=r.subid;
        if(it.kind==='object'&&(!r.obj||r.obj.value!==it.object.value||String(r.obj.target)!==String(it.object.target.id))){
          it.replace=true;out.nReplace++;
          why.push(r.obj&&r.obj.value!==it.object.value?'different object file':'different target');
        }
        else if(!r.sent)why.push('not finished last time');
        else{
          if(r.sent.html!==it.html||(r.sent.after||'')!==(it.after||'')||(r.sent.link||'')!==(it.link||''))why.push('code');
          if(r.sent.left!==it.left||r.sent.top!==it.top)why.push('moved');
          if(r.sent.width!==it.width||r.sent.height!==it.height)why.push('resized');
          if(r.sent.z!==it.z)why.push('stacking order');
        }
        it.reasons=why;
        if(why.length){it.status='changed';out.nChanged++;}else{it.status='same';out.nSame++;}
      }
      out.items.push(it);
    });
    Object.keys(rec.items).forEach(function(k){
      if(!seen[k]){var r=rec.items[k];out.removed.push({id:k,name:r.name||('Item '+k),subid:r.subid});}
    });
    return out;
  }
  function removeTicked(){var e=$('pushremove');return !!(e&&e.checked);}
  function sig(c,rm){
    return JSON.stringify([mapId(),base(),rm,c.items.map(function(i){return [i.id,i.status,i.left,i.top,i.width,i.height,i.z,i.html,i.object?i.object.value+'|'+i.object.target.id:''];}),c.removed.map(function(r){return r.id;})]);
  }
  function refreshGo(){
    var c=S.cls;if(!c)return;
    var rm=removeTicked()&&c.removed.length, n=c.nNew+c.nChanged+(rm?c.removed.length:0), skip=c.nMissing?(' '+c.nMissing+(c.nMissing===1?' object is':' objects are')+' not in PRTG\u2019s list yet and will be skipped.'):'';
    if(!n){
      $('pushgo').hidden=true;S.reviewed=null;
      if(c.nMissing&&!c.removed.length&&!c.nSame)say('Nothing can be pushed yet.'+skip+' Copy the file into PRTG\u2019s mapobjects folder, then switch PRTG off and on again.','err');
      else say(c.removed.length?('The map matches the Map designer apart from the removed '+(c.removed.length===1?'item. It is':'items. They are')+' still on the map: tick the box below to delete '+(c.removed.length===1?'it':'them')+'.'):(c.nSame?'The map already matches the Dashboard.':'Nothing to push.'),'');
    }else{
      $('pushgo').textContent='Push '+n+((c.nChanged||rm||c.nSame)?(n===1?' change':' changes'):(n===1?' item':' items'))+' to PRTG';
      $('pushgo').hidden=false;S.reviewed=sig(c,!!rm);
      say('Check the list, then push.'+skip,'');
    }
    updateButtons();
  }
  function review(){
    var p=plan(), c=classify(p), box=$('pushlist'), mixed=c.hadRec;
    S.cls=c;
    box.innerHTML='';box.hidden=false;
    function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
    if(!p.length&&!c.removed.length){
      box.appendChild(el('p','psum','Nothing to push. Add items on the canvas first.'));
      S.reviewed=null;$('pushgo').hidden=true;updateButtons();return;
    }
    var sum=el('p','psum');
    var hasObj=p.some(function(i){return i.kind==='object';});
    if(!mixed&&!c.nMissing)sum.textContent=p.length+(p.length===1?' item will be added to ':' items will be added to ')+'\u201C'+mapName()+'\u201D'+(hasObj?', back to front: pasted pieces as Custom HTML elements, PRTG objects by their file.':' as Custom HTML elements, back to front.')+' Items already on the map are not touched.';
    else{
      var parts=[];
      if(c.nNew)parts.push(c.nNew+' new');if(c.nChanged)parts.push(c.nChanged+' changed');if(c.nSame)parts.push(c.nSame+' unchanged');if(c.removed.length)parts.push(c.removed.length+' removed from the Map designer');if(c.nMissing)parts.push(c.nMissing+' not in PRTG\u2019s list yet');
      sum.textContent=(mixed?'Compared with what was pushed to \u201C'+mapName()+'\u201D last time: ':'This push to \u201C'+mapName()+'\u201D: ')+parts.join(', ')+'.'+(mixed?' Unchanged items are not touched. A changed item is rewritten completely (position, size, order and code), so anything you changed on it by hand in PRTG is replaced.':'')+(c.nReplace?' A replaced object is added again and the old one then deleted, because PRTG fixes an item\u2019s file and target when it is added.':'');
    }
    box.appendChild(sum);
    var t=el('table'), h=el('thead'), tb=el('tbody');
    h.innerHTML='<tr><th>Item</th><th>Left</th><th>Top</th><th>Width</th><th>Height</th></tr>';
    function row(it,status,note,cls){
      var r=el('tr',cls), c0=el('td');
      c0.title=it.name;c0.appendChild(el('span','pn',it.name));
      if(it.kind==='object'){var tg=it.object.target;c0.appendChild(el('span','pt'+((tg&&(tg.id||tg.name))?'':' warn'),it.object.cat+' \u2192 '+((tg&&tg.name)||(tg&&tg.id?('ID '+tg.id):'no target chosen'))+(it.object.targetDefault?' (preview default)':'')));}
      if(mixed||status==='removed'||status==='missing'){c0.appendChild(el('span','ps '+status,note));}
      r.appendChild(c0);
      [it.left,it.top,it.width,it.height].forEach(function(v){r.appendChild(el('td','',v===undefined?'':v));});
      tb.appendChild(r);
    }
    c.items.forEach(function(it){
      row(it,it.status,it.status==='new'?'New':(it.status==='same'?'Unchanged':(it.status==='missing'?'Not in PRTG\u2019s list yet: copy the file into the mapobjects folder':(it.replace?'Replace: ':'Changed: ')+it.reasons.join(', '))),it.status);
    });
    c.removed.forEach(function(r){row({name:r.name},'removed','Removed from the Map designer','removed');});
    t.appendChild(h);t.appendChild(tb);box.appendChild(t);
    if(c.removed.length){
      var lab=el('label','prm'), cb=document.createElement('input');
      cb.type='checkbox';cb.id='pushremove';cb.addEventListener('change',refreshGo);
      lab.appendChild(cb);lab.appendChild(el('span','',c.removed.length===1?'Also delete the removed item from the map':'Also delete the '+c.removed.length+' removed items from the map'));
      box.appendChild(lab);
    }
    refreshGo();
  }
  /* the server address is arbitrary and only known once typed, so this extension
     declares no fixed host_permissions; instead it asks Chrome for permission on
     exactly that origin, the first time Connect is pressed for it. */
  function ensureHostPermission(origin){
    if(!origin)return Promise.resolve(true);
    if(!(window.chrome&&chrome.permissions&&chrome.permissions.request)){return Promise.resolve(true);}
    var pattern=origin.replace(/\/+$/,'')+'/*';
    return new Promise(function(resolve){
      chrome.permissions.contains({origins:[pattern]},function(has){
        if(has){resolve(true);return;}
        chrome.permissions.request({origins:[pattern]},function(granted){resolve(!!granted);});
      });
    });
  }
  /* remembers the last-used server address (always), and -- only when the
     "Remember this server, username and passhash" checkbox is on -- the
     username and passhash too, in chrome.storage.local: local to this
     device/browser profile, never synced anywhere. Both are read back on
     load to prefill the login card and, when credentials were remembered,
     to retry connecting automatically instead of always starting from a
     blank login gate. */
  var STORE_KEYS=['pm_lastServer','pm_remember','pm_user','pm_secret'];
  function storageGet(cb){
    if(!(window.chrome&&chrome.storage&&chrome.storage.local)){cb({});return;}
    try{chrome.storage.local.get(STORE_KEYS,function(items){cb(items||{});});}catch(e){cb({});}
  }
  function storageSet(obj){
    if(!(window.chrome&&chrome.storage&&chrome.storage.local))return;
    try{chrome.storage.local.set(obj);}catch(e){}
  }
  function storageRemove(keys){
    if(!(window.chrome&&chrome.storage&&chrome.storage.local))return;
    try{chrome.storage.local.remove(keys);}catch(e){}
  }
  function rememberConnection(){
    var b=rawBase();if(!b)return;
    if($('pushremember').checked){
      storageSet({pm_lastServer:b,pm_remember:true,pm_user:String($('pushuser').value||''),pm_secret:String($('pushsecret').value||'')});
    }else{
      storageSet({pm_lastServer:b,pm_remember:false});
      storageRemove(['pm_user','pm_secret']);
    }
  }
  /* the gauge loader (img/gauge.png with the needle img/gauge-needle.png sweeping over it). gloadShow puts it over a host element after a short wait, so a quick
     answer never flashes it; the same key shows it again with new words; gloadHide removes it. */
  var GLOAD={};
  function gloadShow(host,key,text,small){
    var n=GLOAD[key];
    if(!n){
      n=document.createElement('div');n.setAttribute('role','status');n.setAttribute('aria-live','polite');
      n.innerHTML='<div class="gl-g" aria-hidden="true"><img src="img/gauge.png" alt=""><img class="gl-n" src="img/gauge-needle.png" alt=""></div><span class="gl-t"></span>';
      n.style.display='none';host.appendChild(n);GLOAD[key]=n;
      n._t=setTimeout(function(){n.style.display='';},150);
    }
    n.className='gl-ov'+(small?' gl-sm':'');
    n.querySelector('.gl-t').textContent=text||'Loading\u2026';
  }
  function gloadHide(key){var n=GLOAD[key];if(!n)return;clearTimeout(n._t);if(n.parentNode)n.parentNode.removeChild(n);delete GLOAD[key];}
  /* Cancel on the connecting screen: stops the waiting, aborts the requests still in flight and brings the address back */
  var CONN={gen:0,acs:[]}, CONNCANCEL={cancelled:true};
  function connCancel(){
    var i;
    CONN.gen++;
    for(i=0;i<CONN.acs.length;i++){try{CONN.acs[i].abort();}catch(e){}}
    CONN.acs=[];
    gloadHide('conn');
    $('pushconnect').disabled=false;S.maps=null;S.objFile=null;S.lastErr='cancelled';
    say('Cancelled. Change the address if you need to, then press Connect.','');
    $('prtgpop').hidden=false;swSync();updateButtons();
    try{$('pushserver').focus();$('pushserver').select();}catch(e){}
  }
  function connect(){
    describeWhere();
    if(!pageOrigin()&&!base()){say('Enter your PRTG server\u2019s address below, then press Connect.','err');S.lastErr='enter a server address';$('prtgpop').hidden=false;try{$('pushserver').focus();}catch(e){}swSync();return;}
    if(CFG.connection.loginRequired&&!loginFilled()){loginMissing();return;}
    loginMark(false,false);
    say('Connecting\u2026','');
    gloadShow($('prtgpop').querySelector('.lgcard'),'conn','Connecting to PRTG\u2026');
    var gen=++CONN.gen, gn=GLOAD['conn'];CONN.acs=[];
    if(gn&&!gn.querySelector('.gl-x')){var cb=document.createElement('button');cb.type='button';cb.className='gl-x';cb.textContent='Cancel';cb.addEventListener('click',connCancel);gn.appendChild(cb);}
    $('pushconnect').disabled=true;S.maps=null;S.objFile=null;S.reviewed=null;S.cls=null;$('pushgo').hidden=true;$('pushlist').hidden=true;S.lastErr=null;S.reauth=!$('prtgpop').hidden;S.authAsked=false;swSync();
    ensureHostPermission(rawBase()).then(function(ok){
      if(gen!==CONN.gen)return;
      if(!ok){gloadHide('conn');$('pushconnect').disabled=false;say('This page needs permission to talk to that server. Press Connect again and allow it when Chrome asks.','err');S.lastErr='permission not granted';swSync();return;}
      detectUI(rawBase()).then(function(){if(gen!==CONN.gen)throw CONNCANCEL;describeWhere();gloadShow($('prtgpop').querySelector('.lgcard'),'conn','Reading your maps\u2026');return http('GET','/api/table.json',{content:'maps',columns:'name,objid'});}).then(function(t){
        if(gen!==CONN.gen)throw CONNCANCEL;
        var j=parseJson(t,'The list of maps'), maps=(j&&j.maps)||[], sel=$('pushmap');
        sel.innerHTML='';
        maps.forEach(function(m){var o=document.createElement('option');o.value=String(m.objid);o.textContent=m.name;sel.appendChild(o);});
        S.maps=maps;
        gloadShow($('prtgpop').querySelector('.lgcard'),'conn','Reading the object list\u2026');
        return http('GET','/api/mapobject.json');
      }).then(function(t){
        if(gen!==CONN.gen)throw CONNCANCEL;
        var catj=parseJson(t,'The list of object files');
        S.objFile=findCustomHtml(catj);S.catalog=parseCatalog(catj);pubObjs();S.tgt={};
        openApp();
        rememberConnection();
        if(!S.maps.length)say('Connected, but there are no maps. Create an empty map in PRTG first.','err');
        else if(!S.objFile)say('Connected, but PRTG\u2019s object list has no \u201CCustom HTML element\u201D, so nothing can be pushed.','err');
        else say('Connected. '+S.maps.length+(S.maps.length===1?' map':' maps')+' found.','ok');
      }).catch(function(err){
        if(err===CONNCANCEL||gen!==CONN.gen)return;
        S.maps=null;S.objFile=null;S.catalog=null;S.lastErr=(err&&err.status===401)?'login needed':((err&&err.message)||'could not connect');
        if(err&&err.status===401){
          authNeeded();
          if(CFG.connection.loginRequired){loginMark(true,true,'','PRTG did not accept this username and passhash.');say('PRTG did not accept this username and passhash. Check them and press Connect again.','err');}
          else say('PRTG refused the request (401: not authorised), even though you are logged in here. Enter your username and passhash (or an API token) below, then press Connect again. In PRTG, your passhash is on your My Account page.','err');
        }else say(err.message,'err');
      }).then(function(){
        if(gen!==CONN.gen)return;
        gloadHide('conn');
        $('pushconnect').disabled=false;PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};trReset();updateButtons();renderObjList();pickerSync();pvSync();resolveDefaults();
        $('objnote').textContent=objNoteText();
      });
    });
  }
  function updateTarget(){
    var m=$('pushmap'), t=$('pushtarget');
    if(!t)return;
    var has=!(m.disabled||!m.options.length||m.selectedIndex<0);
    t.textContent=has?'Pushes to the map \u201C'+m.options[m.selectedIndex].text+'\u201D. Change it in the Map step.':'No map chosen yet. Choose one in the Map step.';
    /* the same, shown plainly at the top of the Push step */
    var pt=document.getElementById('pushto'), host=document.getElementById('pushfs')&&document.querySelector('#pushfs .row3');
    if(!pt&&host){pt=document.createElement('div');pt.id='pushto';pt.setAttribute('aria-live','polite');host.parentNode.insertBefore(pt,host);}
    if(pt){
      pt.textContent='';
      var lb=document.createElement('span');lb.className='pt-l';lb.textContent='Pushing to';pt.appendChild(lb);
      var nm=document.createElement('strong');nm.textContent=has?m.options[m.selectedIndex].text:'no map chosen yet';pt.appendChild(nm);
      if(has&&m.value){var idn=document.createElement('small');idn.textContent='map '+m.value;pt.appendChild(idn);}
      pt.classList.toggle('none',!has);
    }
  }
  document.addEventListener('prtgstate',function(){updateTarget();});
  $('pushmap').addEventListener('change',function(){updateTarget();});
  /* PRTG's own "Add Map" dialog (addmap.htm) posts to addmap2.htm with these
     exact field names; mapurl_ is a GUID PRTG's page normally generates
     server-side into a hidden field, so we generate one the same shape here.
     No background-image upload (upfile_) support -- that field is optional
     on PRTG's own form too, and multipart handling isn't worth adding for it. */
  function newMapGuid(){
    if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();
    var s=[], i, c='0123456789abcdef';
    for(i=0;i<36;i++)s.push(c[Math.floor(Math.random()*16)]);
    s[8]=s[13]=s[18]=s[23]='-';
    return s.join('');
  }
  function newMapMsg(text,kind){var n=$('newmapmsg');n.textContent=text||'';n.className='note pst'+(kind?' '+kind:'');}
  /* addmap2.htm's own form (addmap.htm) is enctype="multipart/form-data",
     and PRTG's server-side handler for it does not tolerate being sent
     application/x-www-form-urlencoded instead -- it crashes with an access
     violation (null-pointer read) trying to parse the body as multipart
     regardless. http()'s shared POST path always sends urlencoded, so this
     endpoint needs its own multipart-encoded POST, built with FormData so
     the browser sets the correct multipart boundary automatically. */
  function httpMultipart(path,params){
    var b=base(), p=withAuth(params), url=b+path;
    var fd=new FormData(), k;
    for(k in p)fd.append(k,p[k]);
    var headers={'X-Requested-With':'XMLHttpRequest','Accept':'*/*'};
    return csrf().then(function(tok){
      if(tok)headers['anti-csrf-token']=tok;
      return fetch(url,{method:'POST',credentials:b?'omit':'same-origin',headers:headers,body:fd});
    }).then(function(r){
      return r.text().then(function(t){
        if(!r.ok){var e=new Error('PRTG answered '+r.status+' for '+path+'.');e.status=r.status;throw e;}
        return t;
      });
    },function(){throw new Error(cannotReach(b));});
  }
  function createMap(){
    var name=String($('newmapname').value||'').trim();
    var w=parseInt($('newmapw').value,10)||0, h=parseInt($('newmaph').value,10)||0;
    if(!name){newMapMsg('Enter a name for the map.','err');try{$('newmapname').focus();}catch(e){}return;}
    if(!(w>0)||!(h>0)){newMapMsg('Width and height must be greater than 0.','err');return;}
    $('newmapgo').disabled=true;newMapMsg('Creating\u2026','');
    /* addmap2.htm creates the map then issues a redirect to map.htm?id=...,
       which fetch() follows automatically; whatever that followed response's
       status turns out to be (often not a plain 200 in a bare-fetch context)
       is NOT a reliable signal that the map wasn't created. So a POST error
       here is remembered but not trusted on its own -- the map list is
       re-queried either way, and that's what decides success or failure. */
    var before={}; (S.maps||[]).forEach(function(m){before[m.objid]=true;});
    var postErr=null;
    httpMultipart('/addmap2.htm',{mapurl_:newMapGuid(),name_:name,width_:String(w),height_:String(h),pubaccess_:'0'}).catch(function(e){postErr=e;}).then(function(){
      return http('GET','/api/table.json',{content:'maps',columns:'name,objid'});
    }).then(function(t){
      var j=parseJson(t,'The list of maps'), maps=(j&&j.maps)||[], sel=$('pushmap');
      var newMatch=null, anyMatch=null;
      sel.innerHTML='';
      maps.forEach(function(m){
        var o=document.createElement('option');o.value=String(m.objid);o.textContent=m.name;sel.appendChild(o);
        if(m.name!==name)return;
        if(!before[m.objid]&&(!newMatch||Number(m.objid)>Number(newMatch.objid)))newMatch=m;
        if(!anyMatch||Number(m.objid)>Number(anyMatch.objid))anyMatch=m;
      });
      var match=newMatch||anyMatch;
      S.maps=maps;
      if(!match){throw postErr||new Error('PRTG did not report an error, but the new map could not be found afterward.');}
      sel.value=String(match.objid);
      S.reviewed=null;S.cls=null;$('pushgo').hidden=true;$('pushlist').hidden=true;
      if(typeof exClear==='function')exClear();
      updateTarget();updateButtons();
      $('newmapname').value='';
      try{MAPSZ[match.objid]={w:w,h:h};szLast=String(match.objid);if(window.DASHAPI&&DASHAPI.newMapCanvas)DASHAPI.newMapCanvas(w,h,NEWLAY);}catch(e){}
      newMapMsg('Map successfully added.','ok');
      say('Created \u201C'+name+'\u201D and selected it.','ok');
      setTimeout(function(){mapMode('open');newMapMsg('');try{document.dispatchEvent(new CustomEvent('gotodashtab',{detail:'add'}));}catch(e){}},1200);
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      newMapMsg((err&&err.message)||'Could not create the map.','err');
    }).then(function(){$('newmapgo').disabled=false;});
  }
  /* the Map step has two modes: Open (pick a map, Load it) and New (create one) */
  function mapMode(m){
    var isNew=(m==='new');
    $('mapopen').hidden=isNew;$('newmapForm').hidden=!isNew;
    if(isNew)$('exfs').hidden=true;
    $('newmapToggle').classList.toggle('on',isNew);$('mapopenTab').classList.toggle('on',!isNew);
    $('newmapToggle').setAttribute('aria-selected',isNew?'true':'false');$('mapopenTab').setAttribute('aria-selected',isNew?'false':'true');
    if(isNew)try{$('newmapname').focus();}catch(e){}
  }
  /* a new map starts the size of the canvas it will be designed on, so what you build fits what PRTG made */
  (function(){var c=CFG.canvas||{};if(c.w>0)$('newmapw').value=String(c.w);if(c.h>0)$('newmaph').value=String(c.h);})();
  $('newmapToggle').addEventListener('click',function(){mapMode('new');});
  $('mapopenTab').addEventListener('click',function(){mapMode('open');});
  $('newmapcancel').addEventListener('click',function(){mapMode('open');newMapMsg('');});
  $('newmapgo').addEventListener('click',createMap);
  /* a new map's layout: Blank (choose one later from Canvas, Layouts) or one of the designer's layouts */
  var NEWLAY=null;
  function newLayBuild(){
    var g=$('newmaplayout');if(!g||!window.DASHAPI||!DASHAPI.layouts)return;
    var w=parseInt($('newmapw').value,10)||1920, h=parseInt($('newmaph').value,10)||1080, names=[['Blank: choose a layout later',null]];
    if(w<100||h<100){w=1920;h=1080;}
    DASHAPI.layouts().forEach(function(n,i){names.push([n,i]);});
    g.innerHTML='';
    names.forEach(function(x){
      var b=document.createElement('button');b.type='button';b.className='nml-t'+(NEWLAY===x[1]?' on':'')+(x[1]===null?' blank':'');
      b.setAttribute('data-tip',x[0]);b.setAttribute('aria-label',x[0]);b.setAttribute('aria-pressed',NEWLAY===x[1]?'true':'false');
      b.innerHTML=DASHAPI.layoutSvg(x[1],w,h)+(x[1]===null?'<span>Blank</span>':'');
      b.addEventListener('click',function(){NEWLAY=x[1];newLayBuild();});
      g.appendChild(b);
    });
    var nm=$('newmaplayname');if(nm)nm.textContent=(NEWLAY===null)?'Blank. Choose a layout later from Canvas, Layouts.':DASHAPI.layouts()[NEWLAY];
  }
  $('newmapw').addEventListener('change',newLayBuild);$('newmaph').addEventListener('change',newLayBuild);
  var nmResSync=window.PMRES.wire($('newmapres'),function(w,h){$('newmapw').value=String(w);$('newmaph').value=String(h);newLayBuild();});
  var nmRes=function(){nmResSync(parseInt($('newmapw').value,10),parseInt($('newmaph').value,10));};
  $('newmapw').addEventListener('input',nmRes);$('newmaph').addEventListener('input',nmRes);nmRes();
  try{newLayBuild();}catch(e){}
  $('newmapname').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();createMap();}});
  /* deletes the currently-selected map via PRTG's own deleteobject.htm?id=&approve=1
     (confirmed from PRTG's own deleteobject.htm webroot template -- a plain GET,
     no CSRF token required there, unlike the POST-based add/edit endpoints).
     Armed with a second click within 4s, mirroring the existing "Forget what was
     pushed" confirm pattern (S.forgetArm) rather than a native confirm() dialog. */
  function deleteMapMsg(text,kind){var n=$('deleteMapMsg');n.textContent=text||'';n.className='note pst'+(kind?' '+kind:'');n.hidden=!text;}
  function deleteMap(){
    var sel=$('pushmap'), id=sel.value, name=sel.options.length&&sel.selectedIndex>-1?sel.options[sel.selectedIndex].text:'';
    if(!id)return;
    if(!S.deleteArm){
      S.deleteArm=setTimeout(function(){S.deleteArm=null;$('deleteMapBtn').classList.remove('armed');$('deleteMapBtn').textContent='Delete this map';},4000);
      $('deleteMapBtn').classList.add('armed');$('deleteMapBtn').textContent='Click again to delete “'+name+'”';
      deleteMapMsg('Click the trash icon again to delete “'+name+'”.','warn');
      return;
    }
    clearTimeout(S.deleteArm);S.deleteArm=null;
    $('deleteMapBtn').classList.remove('armed');$('deleteMapBtn').textContent='Delete this map';
    $('deleteMapBtn').disabled=true;deleteMapMsg('Deleting…','');
    http('GET','/deleteobject.htm',{id:id,approve:'1'}).then(function(){
      return http('GET','/api/table.json',{content:'maps',columns:'name,objid'});
    }).then(function(t){
      var j=parseJson(t,'The list of maps'), maps=(j&&j.maps)||[], sel2=$('pushmap');
      sel2.innerHTML='';
      maps.forEach(function(m){var o=document.createElement('option');o.value=String(m.objid);o.textContent=m.name;sel2.appendChild(o);});
      S.maps=maps;
      if(maps.some(function(m){return String(m.objid)===id;})){
        deleteMapMsg('PRTG did not report an error, but “'+name+'” is still in the map list.','err');
      }else{
        S.reviewed=null;S.cls=null;$('pushgo').hidden=true;$('pushlist').hidden=true;
        if(typeof exClear==='function')exClear();
        deleteMapMsg('Deleted “'+name+'”.','ok');
      }
      updateTarget();updateButtons();
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      deleteMapMsg((err&&err.message)||'Could not delete the map.','err');
    }).then(function(){updateButtons();});
  }
  $('deleteMapBtn').addEventListener('click',deleteMap);
  $('pushmap').addEventListener('change',function(){
    if(S.deleteArm){clearTimeout(S.deleteArm);S.deleteArm=null;$('deleteMapBtn').classList.remove('armed');$('deleteMapBtn').textContent='Delete this map';}
    deleteMapMsg('');swSync();
  });
  function objNoteText(){
    return S.catalog?('PRTG lists '+S.catalog.length+(S.catalog.length===1?' object file.':' object files.')+' Pick one and add it to the canvas, then choose what it shows. Files you make in the Object builder appear here once they are in PRTG\u2019s mapobjects folder.'):'Connect to PRTG (step 1) to load the objects PRTG has. Files you make in the Object builder appear here once they are in PRTG\u2019s mapobjects folder.';
  }
  /* read only the list of object files again; the login, the maps and what is selected stay as they are */
  /* objects saved in Your objects that this PRTG server does not list: usually installed on a different PRTG core server */
  function missingMineText(){
    var lib=libLoad(), miss=[], f, k;
    for(f in lib){
      k=keyOf(lib[f].cat,lib[f].name);
      if(!S.catalog.some(function(e){return keyOf(e.cat,e.name)===k;}))miss.push(String(lib[f].name||f));
    }
    if(!miss.length)return '';
    return ' Not found on this PRTG server: '+miss.slice(0,5).join(', ')+(miss.length>5?' and '+(miss.length-5)+' more':'')+'. Were they installed on a different PRTG core server? The install script and ZIP put files on the computer where you run them.';
  }
  function refreshObjects(){
    var b=$('objrefresh'), had=S.catalog?S.catalog.length:0;
    if(!(S.maps&&S.objFile)||b.disabled)return;
    b.disabled=true;$('objnote').textContent='Reading PRTG\u2019s list of object files\u2026';
    http('GET','/api/mapobject.json').then(function(t){
      var catj=parseJson(t,'The list of object files'), now;
      S.objFile=findCustomHtml(catj)||S.objFile;S.catalog=parseCatalog(catj);pubObjs();
      PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};
      renderObjList();pickerSync();pvSync();
      now=S.catalog.length;
      $('objnote').textContent=objNoteText()+(now>had?' '+(now-had)+' new since the last read.':(now<had?' '+(had-now)+' fewer than the last read.':' No change since the last read.'))+missingMineText();
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      $('objnote').textContent='Could not refresh the list: '+((err&&err.message)||'no answer from PRTG')+' The list below is unchanged.';
    }).then(function(){b.disabled=false;updateButtons();});
  }
  $('objrefresh').textContent=CFG.objectList.refreshLabel;$('objrefresh').title=CFG.objectList.refreshHint;
  $('objrefresh').addEventListener('click',refreshObjects);
  function itemId(resp){
    var m=/subid\s*=\s*["']?(\d+)/i.exec(resp)||/mapelement_\d+_(\d+)/i.exec(resp);
    return m?m[1]:null;
  }
  function editCall(id,sub,v){
    return http('POST','/api/editmapobject.htm',{subid:sub,id:id,top:v.top!==undefined?v.top:v.top,left:v.left,width:v.width,height:v.height,zindex:v.z,htmlbefore_:v.html,htmlafter_:v.after||'',ElementLink:v.link||''});
  }
  /* the layout data carries the layout's identity: keep it, and the pushed items can be updated later */
  function offerLayout(){try{$('dlayout').value=DASHAPI.layoutText();DASHAPI.markSaved();}catch(e){}}
  function addParams(it){
    var o={objectid:0,top:it.top,left:it.left,id:mapId(),width:it.width,height:it.height,mapobject_:S.objFile,noautoposition:1,result:'html'};
    if(it.kind==='object'){o.objectid=it.object.target.id;o.mapobject_=it.object.value;}
    return o;
  }
  function push(){
    var p=plan(), c=classify(p), rm=removeTicked()&&c.removed.length>0;
    if(S.reviewed!==sig(c,rm)){review();say('The canvas, offsets or map changed since the review. Here is the new list: check it, then push.','err');return;}
    var id=mapId(), name=mapName(), rec=getRec(), k=0, work=[], counts={added:0,updated:0,replaced:0,removed:0};
    var entry={map:id,srv:srvId(),name:name,at:new Date().toISOString(),added:[],updated:[],removed:[]};
    c.items.forEach(function(it){if(it.status==='new')work.push({kind:'add',it:it});else if(it.status==='changed')work.push({kind:it.replace?'replace':'edit',it:it});});
    if(rm)c.removed.forEach(function(r){work.push({kind:'del',r:r});});
    var allAdds=work.every(function(w){return w.kind==='add';});
    S.busy=true;S.storeFail=false;updateButtons();
    function finish(msg,kind){
      if(entryCount(entry)){var h=loadHist();h.push(entry);saveHist(h);}
      offerLayout();
      if(S.storeFail){msg+=storeWarn();kind='err';}
      S.busy=false;S.reviewed=null;S.cls=null;$('pushgo').hidden=true;say(msg,kind);updateButtons();
    }
    function fail(err){
      if(err&&err.status===401)authNeeded();
      var w=work[k], hint=(w&&w.kind==='edit'&&err&&err.status&&err.status!==401)?' If you deleted this item in PRTG by hand, use \u201CForget what was pushed\u201D and push again.':'';
      finish('Stopped after '+k+' of '+work.length+(allAdds?' items: ':' changes: ')+err.message+(entryCount(entry)?' What was already done is remembered, so Undo last push reverses it.':'')+hint,'err');
    }
    function addOne(it){
      return http('POST','/api/addobjecttomap.htm',addParams(it)).then(function(resp){
        var sub=itemId(resp);
        if(!sub)throw new Error('PRTG added an item but did not say which one, so it cannot be set up.');
        entry.added.push(sub);
        rec.items[it.id]={subid:sub,name:it.name,type:it.type,sent:null,obj:objIdent(it)};putRec(rec);   /* remembered before it is set up, so a failed edit never leads to a second add */
        return editCall(id,sub,fullSet(it));
      }).then(function(){rec.items[it.id].sent=fullSet(it);putRec(rec);});
    }
    /* what is really on the map now: subid -> item, read the way the Map Designer reads it */
    function readMap(){
      return sampleGet({kind:'verify',label:'Items on the map',path:'/api/mapsvg.htm',params:{id:id}}).then(function(o){
        var by={};
        if(o.error||o.status<200||o.status>=300)throw new Error(o.error||('PRTG answered '+o.status));
        exParse(o.body||'').forEach(function(x){by[x.subid]=x;});
        return by;
      });
    }
    function wrongSpot(x,v){return x.left!==v.left||x.top!==v.top||x.width!==v.width||x.height!==v.height;}
    /* every added or replaced item must be on the map where it was put; anything PRTG did not keep is added again, once */
    function checkAdded(done){
      var adds=work.filter(function(w){return w.kind==='add'||w.kind==='replace';}), lost=[], moved=[];
      if(!adds.length){done('');return;}
      say('Checking the map\u2026','');
      readMap().then(function(by){
        adds.forEach(function(w){var r=rec.items[w.it.id], x=r&&by[r.subid];if(!x)lost.push(w);else if(wrongSpot(x,fullSet(w.it)))moved.push(w);});
        if(!lost.length&&!moved.length){done(' Checked on the map: all '+adds.length+(adds.length===1?' item is':' items are')+' there.');return;}
        return moved.reduce(function(p,w){return p.then(function(){return editCall(id,rec.items[w.it.id].subid,fullSet(w.it));});},Promise.resolve()).then(function(){
          return lost.reduce(function(p,w){return p.then(function(){
            var old=rec.items[w.it.id]&&rec.items[w.it.id].subid;
            entry.added=entry.added.filter(function(x){return x!==old;});
            return addOne(w.it);
          });},Promise.resolve());
        }).then(readMap).then(function(by2){
          var still=lost.filter(function(w){var r=rec.items[w.it.id];return !(r&&by2[r.subid]);});
          if(still.length){
            finish('PRTG accepted '+adds.length+' items but kept '+(adds.length-still.length)+'. These are not on the map: '+still.map(function(w){return w.it.name;}).join(', ')+'. They were tried twice. Press Show items under Already on this map to see what PRTG holds.','err');
            return;
          }
          if(!lost.length){done(' Checked on the map: all '+adds.length+(adds.length===1?' item is':' items are')+' there (positions corrected).');return;}
          done(' PRTG had dropped '+lost.length+(lost.length===1?' item':' items')+' after the first try; '+(lost.length===1?'it was':'they were')+' added again and checked.');
        });
      }).catch(function(err){done(' (The map could not be read back to check: '+(err.message||err)+'.)');});
    }
    (function next(){
      if(k>=work.length){
        var msg;
        if(allAdds)msg='Added '+counts.added+(counts.added===1?' item':' items')+' to \u201C'+name+'\u201D. Open the map in PRTG to see them.';
        else{
          var parts=[];
          if(counts.added)parts.push('added '+counts.added);if(counts.updated)parts.push('updated '+counts.updated);if(counts.replaced)parts.push('replaced '+counts.replaced);if(counts.removed)parts.push('deleted '+counts.removed);
          msg='Pushed to \u201C'+name+'\u201D: '+parts.join(', ')+'.'+(c.nSame?' '+c.nSame+(c.nSame===1?' item was':' items were')+' already up to date and not touched.':'')+' Open the map in PRTG to see the changes.';
        }
        if(c.nMissing)msg+=' '+c.nMissing+(c.nMissing===1?' object was':' objects were')+' skipped because PRTG does not list its file yet.';
        checkAdded(function(extra){finish(msg+extra+' The layout box now holds this layout: copy it to keep updating these items later.','ok');});return;
      }
      var w=work[k], it=w.it;
      say((w.kind==='del'?'Deleting ':(w.kind==='edit'?'Updating ':(w.kind==='replace'?'Replacing ':'Adding ')))+(k+1)+' of '+work.length+'\u2026','');
      if(w.kind==='add'){
        addOne(it).then(function(){counts.added++;k++;setTimeout(next,CFG.push.pauseMs);},fail);
      }else if(w.kind==='replace'){
        /* the new item is added first and the old one deleted only once that worked, so a failed add never leaves the map without the item */
        var oldSub=it.subid;
        addOne(it).then(function(){
          return http('GET','/api/deletesubobject.htm',{id:id,subid:oldSub}).then(function(){
            entry.removed.push({id:it.id,subid:oldSub,name:it.name});
          },function(err){
            var e2=new Error('The new \u201C'+it.name+'\u201D was added, but PRTG did not delete the old one (item '+oldSub+'): '+String(err&&err.message||err).replace(/\.$/,'')+'. If it is still on the map, delete it in PRTG.');
            e2.status=err&&err.status;e2.oldLeft=true;throw e2;
          });
        }).then(function(){counts.replaced++;k++;next();},fail);
      }else if(w.kind==='edit'){
        editCall(id,it.subid,fullSet(it)).then(function(){
          entry.updated.push({id:it.id,subid:it.subid,before:rec.items[it.id].sent});
          rec.items[it.id].sent=fullSet(it);rec.items[it.id].name=it.name;putRec(rec);counts.updated++;k++;next();
        },fail);
      }else{
        http('GET','/api/deletesubobject.htm',{id:id,subid:w.r.subid}).then(function(){
          delete rec.items[w.r.id];putRec(rec);entry.removed.push({id:w.r.id,subid:w.r.subid,name:w.r.name});counts.removed++;k++;next();
        },fail);
      }
    })();
  }
  /* undo: updates go back to what was there before, added items are deleted. Items a push deleted cannot be brought back. */
  function undo(){
    var lp=lastPush();if(!lp)return;
    var id=mapId(), rec=getRec(), ups=(lp.updated||[]).filter(function(u){return u.before;}).slice().reverse(), adds=entryAdded(lp).slice().reverse();
    var reverted=0, removed=0, failedUps=[], failedAdds=[], broke=false;
    S.busy=true;S.storeFail=false;updateButtons();
    function finish(){
      var h=loadHist(), k=-1, i;
      for(i=0;i<h.length;i++){if(h[i].at===lp.at&&h[i].srv===lp.srv&&String(h[i].map)===String(lp.map)){k=i;break;}}
      var left=failedUps.length+failedAdds.length;
      if(k>-1){
        if(left){h[k].updated=failedUps;if(h[k].added)h[k].added=failedAdds;else h[k].subids=failedAdds;h[k].removed=[];}
        else h.splice(k,1);
        saveHist(h);
      }
      S.busy=false;
      var msg;
      if(left)msg='Undone '+(reverted+removed)+' of '+(reverted+removed+left)+'. '+left+' could not be undone; try again.';
      else if(addsOnly(lp))msg='Removed '+removed+(removed===1?' item':' items')+' from \u201C'+mapName()+'\u201D.';
      else{
        var parts=[];if(reverted)parts.push('reverted '+reverted+(reverted===1?' update':' updates'));if(removed)parts.push('removed '+removed+(removed===1?' added item':' added items'));
        msg='Undone: '+parts.join(', ')+'.'+((lp.removed||[]).length?' '+(lp.removed.length)+(lp.removed.length===1?' item that push deleted was':' items that push deleted were')+' not restored.':'');
      }
      say(msg+storeWarn(),(left||S.storeFail)?'err':'ok');updateButtons();
    }
    (function next(){
      if(ups.length){
        var u=ups[0], b=u.before;
        editCall(id,u.subid,b).then(function(){
          if(rec.items[u.id]&&rec.items[u.id].subid===u.subid){rec.items[u.id].sent=b;putRec(rec);}
          reverted++;ups.shift();next();
        },function(){failedUps=ups.slice();failedAdds=adds.slice();finish();});
        return;
      }
      if(adds.length){
        var sub=adds[0];
        http('GET','/api/deletesubobject.htm',{id:id,subid:sub}).then(function(){
          var ks=Object.keys(rec.items),i;for(i=0;i<ks.length;i++){if(rec.items[ks[i]].subid===sub){delete rec.items[ks[i]];}}
          putRec(rec);removed++;adds.shift();next();
        },function(){failedAdds=adds.slice();finish();});
        return;
      }
      finish();
    })();
  }
  function forget(){
    if(!S.forgetArm){
      $('pushforget').textContent='Click again to forget';
      S.forgetArm=setTimeout(function(){S.forgetArm=null;updateButtons();},4000);return;
    }
    clearTimeout(S.forgetArm);S.forgetArm=null;
    dropRec();S.reviewed=null;S.cls=null;$('pushgo').hidden=true;$('pushlist').hidden=true;
    say('Forgot what was pushed to \u201C'+mapName()+'\u201D for this layout. The next push adds everything as new.','ok');updateButtons();
  }
  /* ---- the objects PRTG has: pick one to put on the canvas */
  /* ---- samples of how PRTG draws objects. Read only: nothing is changed in PRTG, and nothing is sent anywhere; the result is a file you choose what to do with. */
  function sampleGet(job){
    var b=base(), p=withAuth(job.params), url=b+job.path, qs=qstring(p,true), shown=job.path+(Object.keys(job.params||{}).length?'?'+qstring(job.params,true):'');   /* the saved address never holds login details */
    if(job.rawQuery){qs=job.rawQuery;shown=job.path+'?'+job.rawQuery;}   /* kept exactly as PRTG wrote it; blanked when the file is saved */
    var out={kind:job.kind,label:job.label,request:shown};
    if(job.item)out.item=job.item;
    if(qs)url+=(url.indexOf('?')>-1?'&':'?')+qs;
    return fetch(url,{method:'GET',credentials:b?'omit':'same-origin',headers:{'X-Requested-With':'XMLHttpRequest','Accept':'text/html, */*; q=0.01'}}).then(function(r){
      return r.text().then(function(t){out.status=r.status;out.type=r.headers.get('content-type')||'';out.length=t.length;out.body=t;return out;});
    },function(){out.error=cannotReach(b);return out;});
  }
  function collectSamples(){
    var id=mapId(), note=$('sampmsg'), jobs=[], rec=getRec(), k=0, got=[];
    if(!S.maps||!id)return;
    function sayS(m,kind){note.textContent=m;note.className='note pst'+(kind?' '+kind:'');}
    DASHAPI.pushItems().filter(function(i){return i.object;}).slice(0,12).forEach(function(it){
      jobs.push({kind:'preview',label:it.object.cat+': '+it.object.name,path:'/controls/mapobjectpreview.htm',
        params:{id:id,count:5,dependency_:it.object.target.id,width:it.width,height:it.height,selected:'',mapelements:',*'+it.object.value+'*',maptitles:',*'+it.object.name+'*'},
        item:{name:it.object.name,category:it.object.cat,file:it.object.value,target:it.object.target,width:it.width,height:it.height}});
    });
    Object.keys(rec.items).slice(0,12).forEach(function(key){
      var r=rec.items[key];
      jobs.push({kind:'placed',label:'Pushed item: '+(r.name||key),path:'/controls/mapobjectonly.htm',params:{mode:'edit',subid:r.subid,id:id},item:{name:r.name,type:r.type,subid:r.subid}});
    });
    jobs.push({kind:'tree',label:'Device tree',path:'/api/tree.json',params:{groups:1,devices:1,probes:1,allowroot:1}});
    jobs.push({kind:'sensors-under',label:'Sensors under the Local Probe',path:'/api/table.json',params:{content:'sensors',id:1,columns:'objid,sensor',count:5}});
    jobs.push({kind:'mapview',label:'View Map tab',path:'/controls/mapview.htm',params:{id:id}});
    jobs.push({kind:'mapdesigner',label:'Map Designer tab',path:'/controls/mapdesigner.htm',params:{id:id}});
    jobs.push({kind:'catalogue',label:'List of object files',path:'/api/mapobject.json',params:{}});
    /* the items already on this map, the way the Map Designer loads them (read only) */
    jobs.push({kind:'map-svg',label:'Items on this map (as the designer loads them)',path:'/api/mapsvg.htm',params:{id:id}});
    jobs.push({kind:'map-items',label:'Items on this map (item list)',path:'/api/mapobjects.htm',params:{id:id}});
    jobs.push({kind:'map-connections',label:'Connections between the items',path:'/api/mapobjects.htm',params:{type:'connections',id:id}});
    jobs.push({kind:'map-settings',label:'Map settings',path:'/api/mapsettings.htm',params:{id:id}});
    var itemsFound=false, itemsTotal=0, chartCount=0;
    /* a graph item's markup holds the address of its picture; ask for that picture once, with this tool's own login */
    function addChartJob(o){
      var m=/src="(\/chart\.svg\?[^"]+)"/.exec(o.body);
      if(!m)return;
      chartCount++;
      jobs.push({kind:'chart-svg',label:'Graph picture (chart.svg) for item '+o.item.subid,path:'/chart.svg',params:{},rawQuery:m[1].split('?')[1].replace(/&amp;/g,'&'),item:{subid:o.item.subid}});
    }
    /* from the item list: a few items, one of each look first, each asked for its settings and its markup. The list is parsed as inert text; nothing in it runs. */
    function addItemJobs(html){
      var d=new DOMParser().parseFromString(html,'text/html'), els=d.querySelectorAll('.map_object[subid]'), seen={}, first=[], rest=[], i, el, sub, sig, rec;
      for(i=0;i<els.length;i++){
        el=els[i];sub=el.getAttribute('subid');
        if(!sub||seen['s'+sub])continue;
        seen['s'+sub]=1;
        sig=String(el.className).split(/\s+/).filter(function(c){return c&&c!=='map_object'&&!/^(status-|map_objectstate|ui-)/.test(c);}).sort().join(' ');
        rec={sub:sub,classes:String(el.className)};
        if(!seen['g'+sig]){seen['g'+sig]=1;first.push(rec);}else rest.push(rec);
      }
      itemsTotal=first.length+rest.length;
      if(!itemsTotal)return;
      itemsFound=true;
      first.concat(rest).slice(0,CFG.samples.maxItems).forEach(function(x){
        jobs.push({kind:'map-item-settings',label:'Item '+x.sub+': settings',path:'/api/mapsettings.htm',params:{id:id,subid:x.sub,type:'objectproperties'},item:{subid:x.sub,classes:x.classes}});
        jobs.push({kind:'map-item-markup',label:'Item '+x.sub+': markup',path:'/controls/mapobjectonly.htm',params:{mode:'edit',subid:x.sub,id:id},item:{subid:x.sub,classes:x.classes}});
      });
    }
    $('objsamples').disabled=true;S.busy=true;
    (function next(){
      if(k>=jobs.length){
        var res={tool:STAMP_NAME(),collected:new Date().toISOString(),server:(base()||pageOrigin()||''),map:{id:id,name:mapName(),itemsListed:itemsTotal,itemsRead:Math.min(itemsTotal,CFG.samples.maxItems)},browser:navigator.userAgent,requests:got};
        var blob=new Blob([redactSecrets(JSON.stringify(res,null,1))],{type:'application/json'}), url=URL.createObjectURL(blob), a=document.createElement('a'), size=Math.round(blob.size/1024);
        a.href=url;a.download='prtg-preview-samples.json';document.body.appendChild(a);a.click();document.body.removeChild(a);
        setTimeout(function(){URL.revokeObjectURL(url);},2000);
        var bad=got.filter(function(g){return g.error||g.status<200||g.status>=300;}).length;
        S.busy=false;updateButtons();
        sayS('Saved prtg-preview-samples.json ('+got.length+' requests, '+size+' KB'+(bad?', '+bad+' did not succeed':'')+'). It holds what PRTG answered for this map, including the names and values shown on the objects and the settings of up to '+CFG.samples.maxItems+' items already on it. Login details in the addresses (passhash, username, map id, URL hash) are blanked.',bad&&bad===got.length?'err':'ok');
        return;
      }
      sayS('Collecting '+(k+1)+' of '+jobs.length+': '+jobs[k].label+'\u2026','');
      sampleGet(jobs[k]).then(function(o){
        if(o.status===401){authNeeded();}
        got.push(o);k++;
        if((o.kind==='map-svg'||o.kind==='map-items')&&o.body&&!itemsFound)addItemJobs(o.body);
        if(o.kind==='map-item-markup'&&o.body&&o.item&&chartCount<CFG.samples.maxCharts)addChartJob(o);
        next();
      });
    })();
  }
  /* PRTG writes the logged in user's name and passhash (and the map's public id) into the addresses of the pages it sends, so they are blanked before the file is saved */
  function redactSecrets(t){return t.replace(new RegExp('\\b('+CFG.samples.redactKeys.join('|')+')=[^&"\'<>\\s\\\\]+','gi'),'$1=REDACTED');}
  function STAMP_NAME(){return CFG.name+' v'+CFG.version+_zw();}
  /* ---- the items already on the map, read only. PRTG's own designer loads them from /api/mapsvg.htm; this does the same and draws them behind the canvas. */
  var EX={items:[],mapW:0,mapH:0,map:null,target:{},styles:'',libs:'',libsFor:'',lines:'',bg:'',bgColor:'',bgFor:''};
  function exLayerClass(){return ($('exon').checked?'':'off')+($('exdim').checked?' dim':'');}
  function exLayer(){var c=$('dcanvas'),l=$('dexist');if(!l){l=document.createElement('div');l.id='dexist';l.className=exLayerClass();c.insertBefore(l,c.firstChild);}return l;}
  function exClear(){
    var l=$('dexist'),x=$('exlist');
    exlStop();
    EX.items=[];EX.mapW=0;EX.mapH=0;EX.map=null;EX.target={};EX.lines='';
    if(l&&l.parentNode)l.parentNode.removeChild(l);
    x.hidden=true;x.textContent='';$('exonrow').hidden=true;$('exdimrow').hidden=true;$('exscrrow').hidden=true;$('exsize').hidden=true;$('exmsg').textContent='';
    exUnloadReset();
    if(typeof xeReset0==='function')xeReset0();
    try{document.dispatchEvent(new Event('exchanged'));}catch(e){}
  }
  /* Takes the loaded map back off the canvas, exactly as picking a different map in the list does.
     Purely local: nothing is sent to PRTG and the map's own items are left alone. It does drop any
     edits or deletion marks staged against those items, so when some are waiting it asks for a second
     click first -- the same arming pattern as "Delete this map", rather than a native confirm(). */
  function exUnloadReset(){
    var b=$('exunload');
    if(S.unloadArm){clearTimeout(S.unloadArm);S.unloadArm=null;}
    if(b){b.classList.remove('armed');b.textContent='Clear the canvas';b.hidden=true;}
  }
  function exUnload(){
    var b=$('exunload'), n=0;
    try{n=Object.keys(XE.stage||{}).length;}catch(e){n=0;}
    if(n&&!S.unloadArm){
      S.unloadArm=setTimeout(function(){S.unloadArm=null;b.classList.remove('armed');b.textContent='Clear the canvas';},4000);
      b.classList.add('armed');
      b.textContent='Click again to clear — '+n+(n===1?' pending change':' pending changes')+' will be discarded';
      return;
    }
    exClear();
  }
  /* each item's file announces itself in a first-line comment, <!--Category: Name-->; find the one that sits just before each item */
  function exHeaders(html){
    var tag=/<div\b[^>]*class="[^"]*\bmap_object\b[^"]*"[^>]*\bsubid="(\d+)"[^>]*>/g, hr=/<!--[ \t]*([^:\n<>{}]+?)[ \t]*:[ \t]*([^\n]*?)[ \t]*-->/g, heads=[], out={}, prev=0, m, h, i, last;
    while((h=hr.exec(html)))heads.push({at:h.index,cat:h[1],name:h[2]});
    while((m=tag.exec(html))){
      last=null;
      for(i=0;i<heads.length;i++){if(heads[i].at<m.index&&heads[i].at>=prev)last=heads[i];}
      out[m[1]]=last;prev=m.index;
    }
    return out;
  }
  /* PRTG's status numbers, grouped the way a glance needs them */
  function exTally(words){
    var order=['down','warning','unusual','paused','up','other'], n={}, out=[];
    words.forEach(function(w){n[w]=(n[w]||0)+1;});
    order.forEach(function(k){if(n[k])out.push(n[k]+' '+k);});
    return out.join(', ');
  }
  function exStateWord(num){
    num=parseInt(num,10);
    if(num===3)return 'up';
    if(num===4)return 'warning';
    if(num===5||num===13||num===14)return 'down';
    if(num===10)return 'unusual';
    if(num===7||num===8||num===9||num===12)return 'paused';
    return 'other';
  }
  function exTextWord(t){
    t=String(t||'').toLowerCase();
    if(/down/.test(t))return 'down';
    if(/warn/.test(t))return 'warning';
    if(/unusual/.test(t))return 'unusual';
    if(/paus/.test(t))return 'paused';
    if(/^\s*up\s*$/.test(t))return 'up';
    return 'other';
  }
  /* the Geo Map carries its locations in a data comment; a table carries its rows. Anything else gets no summary. */
  function exSummary(it,root){
    var m, j, L, rows, head, col, i, words=[], cells, th;
    try{
      if(/\bgeomap\b/.test(it.cls)||it.cat==='Geo Maps'){
        m=/<!--\s*(\{[\s\S]*?\})\s*-->/.exec(it.html);
        if(!m)return '';
        j=JSON.parse(m[1]);L=(j.markers&&j.markers.locationlist)||[];
        if(!Array.isArray(L))return '';
        return L.length?(L.length+(L.length===1?' location: ':' locations: ')+exTally(L.map(function(x){return exStateWord(x.state);}))):'no locations';
      }
      if(/\bmap_table\b/.test(it.cls)||it.cat==='Data Tables'){
        rows=root.querySelectorAll('table tbody tr');
        head=root.querySelector('table th.col-status');
        col=-1;
        if(head&&head.parentNode){th=head.parentNode.children;for(i=0;i<th.length;i++){if(th[i]===head)col=i;}}
        for(i=0;i<rows.length;i++){
          cells=rows[i].children;
          if(!cells.length||cells[0].tagName==='TH')continue;
          if(col>=0&&cells[col])words.push(exTextWord(cells[col].textContent));
          else words.push('x');
        }
        if(!words.length)return 'no rows';
        return words.length+(words.length===1?' row':' rows')+((col>=0)?': '+exTally(words):'');
      }
      if(it.target&&it.cat!=='Custom HTML'){
        m=/\bstatus-(up|down|warning|unusual|unknown)\b/.exec(it.cls);
        if(m)return 'currently '+m[1];
      }
    }catch(e){}
    return '';
  }
  function exParse(html){
    var d=new DOMParser().parseFromString(html,'text/html'), els=d.querySelectorAll('.map_object[subid]'), heads=exHeaders(html), out=[], seen={}, i, el, sub, st, hd, it;
    function num(k){var r=new RegExp('(?:^|;)\\s*'+k+'\\s*:\\s*(-?[\\d.]+)').exec(st);return r?parseFloat(r[1]):null;}
    for(i=0;i<els.length;i++){
      el=els[i];sub=el.getAttribute('subid');
      if(!sub||seen[sub])continue;
      seen[sub]=1;st=el.getAttribute('style')||'';hd=heads[sub]||null;
      it={subid:sub,outer:el.outerHTML,target:parseInt(el.getAttribute('objectid'),10)||0,cls:String(el.className),left:num('left'),top:num('top'),width:num('width'),height:num('height'),z:num('z-index'),cat:hd?hd.cat:'',name:hd?hd.name:'',html:el.innerHTML};
      it.summary=exSummary(it,el);
      out.push(it);
    }
    EX.styles=[].filter.call(d.querySelectorAll('style'),function(x){return !(x.closest&&x.closest('.map_object'));}).map(function(x){return x.outerHTML;}).join('').slice(0,60000);
    return out;
  }
  /* The map's own look is not in the item list. PRTG's View Map page asks /controls/mapview.htm for it: the picture and colour behind the items are the style of #mapview, and the links between items are a list of who connects to whom, drawn as curves. */
  function exMapView(id){
    var origin=(base()||pageOrigin()||'');
    function grab1(path,cred){
      var qs=qstring(withAuth({id:id,cachebreaker:String(Date.now())}),true);
      return fetchWithTimeout(origin+path+(qs?'?'+qs:''),{method:'GET',credentials:cred}).then(function(r){
        if(!r.ok)throw new Error('no');
        return r.blob();
      }).then(function(b){if(!b||!b.size||!/^image\//.test(b.type||''))throw new Error('no');return URL.createObjectURL(b);});
    }
    function grab(path){return grab1(path,base()?'omit':'same-origin').then(function(u){return u;},function(){return grab1(path,'include');});}
    return http('GET','/controls/mapview.htm',{id:id}).then(function(t){
      var d=new DOMParser().parseFromString(t,'text/html'), mv=d.querySelector('#mapview'), ms=d.querySelector('#mapshow'), st=(mv&&mv.getAttribute('style'))||'', m=/background-image\s*:\s*url\(\s*["']?([^"')]+)/i.exec(st), c=/background-color\s*:\s*([^;]+)/i.exec(st), conn=null, r={bg:'',color:c?c[1].trim():'',conn:null};
      try{conn=JSON.parse(ms.getAttribute('data-connections')||'null');}catch(e){}
      r.conn=(conn&&typeof conn==='object')?conn:null;
      if(!m)return r;
      var u=m[1].trim(), path;
      try{path=new URL(u,origin+'/').pathname;}catch(e){return r;}
      return grab(path).then(function(o){r.bg=o;return r;},function(){return r;});
    },function(){return {bg:'',color:'',conn:null};});
  }
  var LINKCOL={up:'#b4cc38',down:'#d71920',warning:'#ffd400',unusual:'#f5821f',paused:'#3b8dd0',unknown:'#9aa4af'};
  /* the picture and colour behind the items, drawn at the map's size as the first thing in the layer */
  function exPaintBg(){
    var l=$('dexist'), b;
    if(!l)return;
    b=l.querySelector('.dexbg');
    if(!(EX.bg||EX.bgColor)||!EX.mapW){if(b)b.parentNode.removeChild(b);return;}
    if(!b){b=document.createElement('div');b.className='dexbg';l.insertBefore(b,l.firstChild);}
    b.style.cssText='position:absolute;left:0;top:0;pointer-events:none;width:'+EX.mapW+'px;height:'+EX.mapH+'px;'+(EX.bgColor?'background-color:'+EX.bgColor.replace(/[;"<>]/g,'')+';':'')+(EX.bg?'background-image:url("'+EX.bg+'");background-repeat:no-repeat;background-position:0 0':'');
  }
  /* The map's background colour is a PRTG map setting (Map settings, Background Color). PRTG saves that whole form at once, so this reads the form as it stands, changes the one field and sends it all back. */
  function hex6(c){c=String(c||'').trim();var m=/^#([0-9a-f]{3})$/i.exec(c);if(m)c='#'+m[1].replace(/./g,function(x){return x+x;});return /^#[0-9a-f]{6}$/i.test(c)?c.toLowerCase():'';}
  function mapForm(id,any){
    return http('GET','/controls/objectdata.htm',{objecttype:'map',id:id}).then(function(t){
      var d=new DOMParser().parseFromString(t,'text/html'), f=d.querySelector('form[action="/editsettings"]')||d.querySelector('form'), p={}, ok=false;
      if(!f)throw new Error('PRTG did not send the map settings.');
      [].forEach.call(f.querySelectorAll('input,select,textarea'),function(e){
        var n=e.getAttribute('name'), ty=(e.getAttribute('type')||'').toLowerCase(), o;
        if(!n||e.disabled||ty==='file'||ty==='submit'||ty==='button')return;
        if(ty==='radio'||ty==='checkbox'){if(e.hasAttribute('checked'))p[n]=e.getAttribute('value')==null?'on':e.getAttribute('value');return;}
        if(e.tagName==='SELECT'){o=e.querySelector('option[selected]')||e.options[0];if(o)p[n]=o.getAttribute('value')!=null?o.getAttribute('value'):o.textContent;return;}
        p[n]=(e.tagName==='TEXTAREA')?e.value:(e.getAttribute('value')||'');
      });
      if('bgcolor_' in p||any)ok=true;
      if(!ok)throw new Error('This PRTG version has no background colour setting for maps.');
      p.id=String(id);
      return p;
    });
  }
  function bgMsg(text,kind){var n=$('mapbgmsg');if(!n)return;n.hidden=!text;n.textContent=text||'';n.className='note pst'+(kind?' '+kind:'');}
  function setMapBg(color){
    var id=mapId(), c=hex6(color);
    if(!id||!c)return;
    bgMsg('Changing the background…','');
    $('mapbgcolor').disabled=true;
    mapForm(id).then(function(p){
      p.bgcolor_=c;
      return httpMultipart('/editsettings',p);
    }).then(function(){return mapForm(id);}).then(function(p){
      if(hex6(p.bgcolor_)!==c)throw new Error('PRTG did not keep the new colour.');
      EX.bgColor=c;
      exPaintBg();
      if(!$('dexist')){try{$('dcanvas').style.backgroundColor=c;}catch(e){}}
      bgMsg('Background changed to '+c.toUpperCase()+' on “'+mapName()+'”.','ok');
    }).catch(function(e){
      bgMsg((e&&e.message)||'Could not change the background.','err');
      if(EX.bgColor&&hex6(EX.bgColor))$('mapbgcolor').value=hex6(EX.bgColor);
    }).then(function(){swSync();bgPreSync();});
  }
  $('mapbgcolor').addEventListener('change',function(){setMapBg(this.value);});
  /* ---- the canvas follows the selected map's size, and a size typed for the canvas is sent to that map ----
     The size is read from the map's drawing (<svg width="..px" height="..px">, as Set the canvas to this map's size does).
     A new size goes through the map's settings form like the background colour: the form is read, the width and height fields
     are changed only if they hold the map's current size, it is sent back and read again to make sure PRTG kept it. */
  var MAPSZ={}, szLast='', szTimer=null;
  function szSay(t){try{if(window.DASHAPI&&DASHAPI.toast)DASHAPI.toast(t);}catch(e){}}
  function readMapSize(id){
    return http('GET','/api/mapsvg.htm',{id:id}).then(function(t){
      var m=/<svg\b[^>]*\bwidth="(\d+)px"/i.exec(t||''), n=/<svg\b[^>]*\bheight="(\d+)px"/i.exec(t||'');
      if(!m||!n)throw new Error('PRTG did not say how big the map is.');
      return {w:parseInt(m[1],10),h:parseInt(n[1],10)};
    });
  }
  function adoptMapSize(){
    var id=mapId();
    if(!id||!(S&&S.maps)||String(id)===szLast)return;
    szLast=String(id);
    readMapSize(id).then(function(sz){
      if(String(mapId())!==String(id))return;
      MAPSZ[id]=sz;
      if(window.DASHAPI&&DASHAPI.setCanvasSize&&DASHAPI.setCanvasSize(sz.w,sz.h))szSay('Canvas set to the size of \u201C'+mapName()+'\u201D: '+sz.w+' \u00D7 '+sz.h);
    }).catch(function(e){if(e&&e.status===401)authNeeded();});
  }
  function szField(p,names){for(var i=0;i<names.length;i++)if(names[i] in p)return names[i];return '';}
  function pushMapSize(id,w,h){
    var name=mapName(), known=MAPSZ[id];
    szSay('Changing \u201C'+name+'\u201D to '+w+' \u00D7 '+h+' in PRTG\u2026');
    (known?Promise.resolve(known):readMapSize(id)).then(function(k){
      known=k;MAPSZ[id]=k;
      return mapForm(id,true);
    }).then(function(p){
      var wn=szField(p,['width_','mapwidth_']), hn=szField(p,['height_','mapheight_']);
      if(!wn||!hn)throw new Error('PRTG\u2019s map settings have no width and height Map Studio recognises, so the map was not changed.');
      if(parseInt(p[wn],10)!==known.w||parseInt(p[hn],10)!==known.h)throw new Error('PRTG\u2019s map settings did not match the map\u2019s size ('+known.w+' \u00D7 '+known.h+'), so Map Studio did not change them.');
      p[wn]=String(w);p[hn]=String(h);
      return httpMultipart('/editsettings',p).then(function(){return mapForm(id,true);}).then(function(q){
        if(parseInt(q[wn],10)!==w||parseInt(q[hn],10)!==h)throw new Error('PRTG did not keep the new size.');
        MAPSZ[id]={w:w,h:h};
        szSay('\u201C'+name+'\u201D is now '+w+' \u00D7 '+h+' in PRTG.');
      });
    }).catch(function(e){
      if(e&&e.status===401)authNeeded();
      szSay((e&&e.message)||'Could not change the map size in PRTG.');
    });
  }
  document.addEventListener('canvassize',function(e){
    var id=mapId(), w=e.detail&&e.detail.w, h=e.detail&&e.detail.h, k;
    if(!id||!(S&&S.maps&&S.objFile)||!(w>0&&h>0))return;
    k=MAPSZ[id];if(k&&k.w===w&&k.h===h)return;
    clearTimeout(szTimer);szTimer=setTimeout(function(){if(String(mapId())===String(id))pushMapSize(id,w,h);},700);   /* typing 1, 12, 128, 1280 sends once */
  });
  $('pushmap').addEventListener('change',function(){szLast='';adoptMapSize();});
  document.addEventListener('prtgstate',function(){if(window.PRTGSTATE&&window.PRTGSTATE.map)adoptMapSize();else szLast='';});
  /* background presets: the stage colour each look in the Objects tab was drawn for, plus PRTG's own grey and white */
  var BGPRE=[['PRTG default','#DAD7D7'],['White','#FFFFFF'],['PRTG new UI','#F9F9FA'],['Clean card','#F3F4F6'],['Corporate blue','#F2F4F7'],['Executive dark','#171926'],['Indigo board','#161240'],['Slate fintech','#2B2D3C'],['Neon plum','#2A1838'],['Teal glass','#2A3B4C'],['Wall display','#0B1220'],['Brand navy','#050F34']];
  function bgPreSync(){
    var cur=hex6(EX.bgColor)||hex6($('mapbgcolor').value), on=!$('mapbgcolor').disabled;
    $('mapbgnow').style.background=cur||'';
    [].forEach.call($('bgpresets').children,function(b){b.classList.toggle('on',hex6(b.getAttribute('data-c'))===cur);b.disabled=!on;});
  }
  (function(){
    var box=$('bgpresets');
    BGPRE.forEach(function(p){
      var b=document.createElement('button');b.type='button';b.className='bgchip';b.setAttribute('data-c',p[1]);b.style.background=p[1];b.dataset.tip=p[0]+' · '+p[1];b.setAttribute('aria-label',p[0]);
      b.addEventListener('click',function(){$('mapbgcolor').value=p[1].toLowerCase();setMapBg(p[1]);});
      box.appendChild(b);
    });
  })();
  var LINKST={g:'up',r:'down',y:'warning',o:'unusual',b:'paused',bl:'paused',gr:'unknown'};
  function exLinks(conn){
    var by={}, defs='', body='', n=0;
    EX.items.forEach(function(it){by[it.subid]=it;});
    function ctr(it){return {x:(it.left||0)+(it.width||0)/2,y:(it.top||0)+(it.height||0)/2};}
    function col(it){var m=/\bmap_objectstate_sens([a-z]+)\b/.exec(it.cls||''), c=m?m[1]:'', k=LINKST[c];if(!k){var w=/\bstatus-(up|down|warning|unusual|paused|unknown)\b/.exec(it.cls||'');k=w?w[1]:'unknown';}return LINKCOL[k]||LINKCOL.unknown;}
    Object.keys(conn||{}).forEach(function(a){
      (Array.isArray(conn[a])?conn[a]:[]).forEach(function(bk){
        var A=by[a], B=by[bk], p, q, dx, dy, len, off, cx, cy, gid, d;
        if(!A||!B)return;
        p=ctr(A);q=ctr(B);dx=q.x-p.x;dy=q.y-p.y;len=Math.sqrt(dx*dx+dy*dy);
        if(len<2)return;
        off=len*0.22;if(q.x<p.x)off=-off;
        cx=(p.x+q.x)/2+(dy/len)*off;cy=(p.y+q.y)/2-(dx/len)*off;
        d='M '+p.x+' '+p.y+' Q '+cx+' '+cy+' '+q.x+' '+q.y;
        gid='dexg'+(n++);
        defs+='<linearGradient id="'+gid+'" gradientUnits="userSpaceOnUse" x1="'+p.x+'" y1="'+p.y+'" x2="'+q.x+'" y2="'+q.y+'"><stop offset="0" stop-color="'+col(A)+'"/><stop offset="0.4" stop-color="'+col(A)+'"/><stop offset="0.6" stop-color="'+col(B)+'"/><stop offset="1" stop-color="'+col(B)+'"/></linearGradient>';
        body+='<path d="'+d+'" fill="none" stroke="url(#'+gid+')" stroke-width="11" stroke-linecap="round" opacity="0.22"/><path d="'+d+'" fill="none" stroke="url(#'+gid+')" stroke-width="5" stroke-linecap="round"/>';
      });
    });
    return n?'<svg class="dexlines" width="'+(EX.mapW||1920)+'" height="'+(EX.mapH||1080)+'" style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible"><defs>'+defs+'</defs>'+body+'</svg>':'';
  }
  /* the device tree the target picker uses (loaded once, shared), then a lookup for anything the tree does not hold, such as sensors */
  function exTree(){
    return new Promise(function(done){
      var k=0;
      if(TR.loaded||TR.failed){done();return;}
      if(TR.loading){(function wait(){if(!TR.loading||k++>100){done();return;}setTimeout(wait,150);})();return;}
      TR.loading=true;
      http('GET','/api/tree.json',{groups:1,devices:1,probes:1,allowroot:1}).then(function(t){
        var r=trParse(parseJson(t,'The device tree'));
        if(r){TR.nodes=r.nodes;TR.roots=r.roots;TR.loaded=true;}
        TR.loading=false;try{trRender();}catch(e){}done();
      },function(err){if(err&&err.status===401)authNeeded();TR.loading=false;done();});
    });
  }
  function exWhere(n){
    var out=[], p=(n.parent!=null)?TR.nodes[n.parent]:null, guard=0;
    while(p&&guard++<30){if(p.id!==0)out.unshift(p.name);p=(p.parent!=null)?TR.nodes[p.parent]:null;}
    return out.join(' \u203A ');
  }
  function exNames(){
    var ids={}, pend=[], map=EX.map;
    EX.items.forEach(function(it){if(it.target)ids[it.target]=1;});
    return exTree().then(function(){
      Object.keys(ids).forEach(function(id){
        var n=TR.loaded?TR.nodes[id]:null;
        if(n)EX.target[id]={type:n.type,name:n.name,where:exWhere(n)};
        else pend.push(id);
      });
      return Promise.all(pend.slice(0,12).map(function(id){
        return http('GET','/api/table.json',{content:'sensors',columns:'objid,sensor,device',filter_objid:id,count:1}).then(function(t){
          var a=(parseJson(t,'A sensor').sensors)||[];
          if(a.length&&String(a[0].objid)===String(id))EX.target[id]={type:'sensor',name:a[0].sensor||('Sensor '+id),where:a[0].device||''};
        },function(){});
      }));
    }).then(function(){return map;});
  }
  function exBinding(it){
    var t=it.target?EX.target[it.target]:null;
    if(!it.target)return '';
    if(!t)return 'object '+it.target;
    return t.type+' \u201C'+t.name+'\u201D'+(t.where?' ('+t.where+')':'');
  }
  function exLabel(it){return (it.cat||it.name)?(it.cat+(it.name?': '+it.name:'')):it.cls.replace(/\bmap_object\b/,'').trim()||'Item';}
  /* an item drawn the way PRTG draws it: its own markup on PRTG's stylesheet, in a frame that cannot reach this page */
  /* MV3 forbids inline <script> inside a plain srcdoc iframe on this page.
     preview-sandbox.html is a manifest 'sandbox' page (relaxed CSP) that we
     point these preview iframes at; we hand it the real HTML over postMessage
     and it builds the actual srcdoc iframe itself, with the SAME sandbox=""/
     "allow-scripts" gating the tool always applied, so the Custom-HTML export
     script-blocking behaviour is unchanged. allowSameOrigin is only set for the
     live pv-preview panes, which need to read the rendered content's geometry
     back out (see pvMeasure/pvPaneFit) -- exported/Custom HTML previews never
     set it, matching their original, more isolated sandboxing exactly. */
  /* true when a message came from inside one of this page's own preview frames: the frame that sent it must sit directly in a preview-sandbox frame of this page */
  function fromOwnPreview(src){
    var fs=document.querySelectorAll('iframe'), i;
    try{
      for(i=0;i<fs.length;i++){if(fs[i].contentWindow&&src.parent===fs[i].contentWindow&&src!==fs[i].contentWindow)return true;}
    }catch(e){}
    return false;
  }
  var PVSBX_SEQ=0;
  var PVSBX_URL=(window.chrome&&chrome.runtime&&chrome.runtime.getURL)?chrome.runtime.getURL('preview-sandbox.html'):'preview-sandbox.html';
  function setFramePreview(f,html,opts,onReady){
    opts=opts||{};
    var seq=++PVSBX_SEQ;
    function send(){
      f.contentWindow.postMessage({type:'pv-write',seq:seq,html:html,allowScripts:!!opts.allowScripts,allowSameOrigin:!!opts.allowSameOrigin},'*');
    }
    if(onReady){
      var handler=function(e){
        if(e.source===f.contentWindow&&e.data&&e.data.type==='pv-ready'&&e.data.seq===seq){
          window.removeEventListener('message',handler);
          onReady();
        }
      };
      window.addEventListener('message',handler);
    }
    /* a frame still loading keeps only the latest document and gets it once loaded: an older write must never land after a newer one */
    f._pvLast=send;
    if(f._pvLoaded&&f.getAttribute('src')===PVSBX_URL){send();return;}
    f._pvLatest=send;
    if(!f._pvHooked){f._pvHooked=true;f.addEventListener('load',function(){f._pvLoaded=true;var go=f._pvLatest||f._pvLast;f._pvLatest=null;if(go)go();});}   /* a frame the browser reloaded (moved in the page) gets its last document again */
    if(f.getAttribute('src')!==PVSBX_URL){f._pvLoaded=false;f.setAttribute('src',PVSBX_URL);}
  }
  /* PRTG's stylesheet with its fonts inlined. A preview frame has no origin of its own and PRTG sends no CORS header, so the browser refuses the fonts the stylesheet links to (icons and text then fall back). This page may read them, so it fetches them and puts them in the stylesheet itself. */
  var CSSX={origin:'',style:'',busy:null,busyFor:''};
  function b64(buf){var a=new Uint8Array(buf),s='',i;for(i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s);}
  function prtgCss(){
    var origin=(base()||pageOrigin()||''), cred=base()?'omit':'same-origin';
    if(CSSX.origin===origin&&CSSX.style)return Promise.resolve(CSSX.style);
    if(CSSX.busy&&CSSX.busyFor===origin)return CSSX.busy;
    CSSX.busyFor=origin;
    CSSX.busy=fetchWithTimeout(origin+'/css/prtg0.css',{credentials:cred}).then(function(r){if(!r.ok)throw new Error('css');return r.text();}).then(function(css){
      var jobs=[], mimes={woff2:'font/woff2',woff:'font/woff',ttf:'font/ttf',otf:'font/otf'};
      var out=css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g,function(m,q,u){
        var abs, ext, key;
        if(/^(data:|https?:|\/\/)/i.test(u))return m;
        try{abs=new URL(u,origin+'/css/').href;}catch(e){return m;}
        ext=(/\.([a-z0-9]+)(?:[?#]|$)/i.exec(u)||[])[1];ext=ext&&ext.toLowerCase();
        if(mimes[ext]){key='@@F'+jobs.length+'@@';jobs.push({key:key,url:abs,mime:mimes[ext]});return 'url('+key+')';}
        return 'url("'+abs+'")';
      });
      return Promise.all(jobs.map(function(j){
        return fetchWithTimeout(j.url,{credentials:'omit'}).then(function(r){return r.ok?r.arrayBuffer():null;}).then(function(buf){j.data=buf?('data:'+j.mime+';base64,'+b64(buf)):j.url;},function(){j.data=j.url;});
      })).then(function(){
        jobs.forEach(function(j){out=out.split(j.key).join(j.data);});
        CSSX.origin=origin;CSSX.style='<style>'+out+'</style>';return CSSX.style;
      });
    }).catch(function(){return '';}).then(function(s){CSSX.busy=null;return s;});
    return CSSX.busy;
  }
  function cssHead(origin){return (CSSX.origin===origin&&CSSX.style)||'<link rel="stylesheet" href="/css/prtg0.css">';}
  /* PRTG's own page scripts (the plugins that draw gauges, donuts and status dots) come from PRTG's View Map page. They are read once per server and added to the head of each preview that may run scripts. */
  function exLibs(){
    var origin=(base()||pageOrigin()||'');
    if(EX.libsFor===origin)return Promise.resolve();
    return http('GET','/map.htm',{id:mapId()}).then(function(t){
      var d=new DOMParser().parseFromString(t,'text/html'), out=[];
      [].forEach.call(d.querySelectorAll('script[src]'),function(s){
        var u;try{u=new URL(s.getAttribute('src'),origin+'/').href;}catch(e){return;}
        out.push('<script src="'+u.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"><\/script>');
      });
      EX.libs=out.join('');EX.libsFor=origin;
    },function(){EX.libs='';EX.libsFor=origin;});
  }
  function exWantsScripts(it){return $('exscr').checked&&(!it||it.cat!=='Custom HTML');}
  function exDoc(it,w,h){
    var origin=(base()||pageOrigin()||''), libs=exWantsScripts(it)?EX.libs:'';
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><base href="'+origin+'/">'+cssHead(origin)+''
      +'<style>html,body,#mapshow,#mapshow .view,#mapview{margin:0;padding:0;background:transparent!important;box-shadow:none!important;border:0!important}html,body{overflow:hidden}#mapshow,#mapshow .view,#mapview,#mapview .map_object{overflow:visible!important}'
      +'#mapview{position:relative;width:'+w+'px;height:'+h+'px}#mapview .map_object{position:absolute!important;left:0!important;top:0!important;margin:0!important;width:'+w+'px!important;height:'+h+'px!important}</style>'+EX.styles+libs
      +'</head><body id="mainbody" data-theme="0" class="language_en"><div id="mapshow"><div class="view" style="position:static;overflow:visible"><div id="mapview">'+it.outer+'</div></div></div>'+(libs?pvInitScript('mapview'):'')+'</body></html>';
  }
  /* the gauge loader over the canvas while a map is read: from pressing Load until every item's preview frame has drawn (or 25 seconds have passed) */
  var EXL=null;
  function exlStart(id){
    exlStop();
    EXL={id:id,total:0,done:0,settled:false,timer:setTimeout(exlStop,25000)};
    gloadShow($('dscroll'),'map','Reading the map\u2026',true);
  }
  function exlStop(){
    if(EXL){clearTimeout(EXL.timer);EXL=null;}
    gloadHide('map');
  }
  function exlCheck(){
    if(!EXL||!EXL.settled)return;
    if(EXL.done>=EXL.total){exlStop();return;}
    gloadShow($('dscroll'),'map','Drawing items\u2026 '+EXL.done+' of '+EXL.total,true);
  }
  function exlSettle(id,rendered,named){
    var run=EXL;
    function fin(){if(EXL&&EXL===run){run.settled=true;exlCheck();}}
    Promise.all([rendered.catch(function(){}),named.catch(function(){})]).then(fin);
  }
  function exFrame(it,w,h){
    var f=document.createElement('iframe'), run=EXL;
    f.setAttribute('tabindex','-1');
    if(run)run.total++;
    setFramePreview(f,exDoc(it,w,h),{allowScripts:exWantsScripts(it)},function(){if(run&&run===EXL){run.done++;exlCheck();}});
    return f;
  }
  var EXCOL={up:'#3a9d23',warning:'#f5a623',down:'#d0021b',unusual:'#e8590c',paused:'#8e9bae',other:'#8e9bae'};
  /* the Geo Map's locations, plotted from the coordinates in its own data block. PRTG's map tiles need its scripts and a map service, so they are not drawn. */
  function exGeo(it,w,h){
    var m=/<!--\s*(\{[\s\S]*?\})\s*-->/.exec(it.html), ns='http://www.w3.org/2000/svg', L, pts=[], i, p, x0=1e9, x1=-1e9, y0=1e9, y1=-1e9, kx, sx, sy, sc, pad=Math.max(24,Math.min(w,h)*0.06), ox, oy, svg, e, t, r, cnt={};
    try{L=JSON.parse(m[1]).markers.locationlist;}catch(err){return null;}
    if(!Array.isArray(L))return null;
    L.forEach(function(x){
      var c=x&&x.coordinates, nm='';
      if(!Array.isArray(c)||c.length<2||isNaN(Number(c[0]))||isNaN(Number(c[1])))return;
      try{nm=(new DOMParser().parseFromString(String(x.link||''),'text/html').body.textContent||'').trim();}catch(err){}
      pts.push({x:Number(c[0]),y:Number(c[1]),w:exStateWord(x.state),n:nm||String(x.location||'')});
    });
    if(!pts.length)return null;
    pts.forEach(function(q){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);y0=Math.min(y0,q.y);y1=Math.max(y1,q.y);});
    kx=Math.cos(((y0+y1)/2)*Math.PI/180)||1;
    sx=Math.max((x1-x0)*kx,0.01);sy=Math.max(y1-y0,0.01);
    sc=Math.min((w-2*pad)/sx,(h-2*pad)/sy);
    ox=(w-sx*sc)/2;oy=(h-sy*sc)/2;
    svg=document.createElementNS(ns,'svg');svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('viewBox','0 0 '+w+' '+h);
    r=Math.max(5,Math.min(w,h)/90);
    pts.forEach(function(q){
      e=document.createElementNS(ns,'circle');e.setAttribute('cx',ox+(q.x-x0)*kx*sc);e.setAttribute('cy',oy+(y1-q.y)*sc);e.setAttribute('r',r);
      e.setAttribute('fill',EXCOL[q.w]||EXCOL.other);e.setAttribute('stroke','#fff');e.setAttribute('stroke-width',Math.max(1.5,r/4));
      t=document.createElementNS(ns,'title');t.textContent=q.n+' ('+q.w+')';e.appendChild(t);svg.appendChild(e);
      cnt[q.w]=(cnt[q.w]||0)+1;
      if(pts.length<=14){t=document.createElementNS(ns,'text');t.setAttribute('x',ox+(q.x-x0)*kx*sc+r+4);t.setAttribute('y',oy+(y1-q.y)*sc+r/2);t.setAttribute('font-size',Math.max(11,r*1.6));t.setAttribute('fill','#44505e');t.setAttribute('font-family','Roboto,Arial,sans-serif');t.textContent=q.n;svg.appendChild(t);}
    });
    t=document.createElementNS(ns,'text');t.setAttribute('x',12);t.setAttribute('y',h-12);t.setAttribute('font-size',Math.max(12,r*1.7));t.setAttribute('fill','#6b7a8a');t.setAttribute('font-family','Roboto,Arial,sans-serif');
    t.textContent=pts.length+' locations as PRTG\u2019s Geo Map plots them (map tiles are not drawn here)';svg.appendChild(t);
    return svg;
  }
  function exBox(it,framesLeft){
    var box=document.createElement('div'), w=it.width||100, h=it.height||40, f, g;
    box.className='dexitem';box.setAttribute('data-sub',it.subid);
    box.style.left=(it.left||0)+'px';box.style.top=(it.top||0)+'px';box.style.width=w+'px';box.style.height=h+'px';
    g=(it.cat==='Geo Maps'||/\bgeomap\b/.test(it.cls))?exGeo(it,w,h):null;
    if(g){box.className+=' geo';box.appendChild(g);}
    else if(framesLeft>0){box.appendChild(exFrame(it,w,h));box.setAttribute('data-frame','1');}
    else exPlaceholder(box,it);
    return box;
  }
  function exPlaceholder(box,it){
    var f;
    box.textContent='';box.className='dexitem ph'+(box.className.indexOf(' geo')>-1?' geo':'');
    box.appendChild(document.createTextNode(exLabel(it)));
    f=document.createElement('small');f.textContent='#'+it.subid+(it.target?' \u00B7 shows '+exBinding(it):'');box.appendChild(f);
    if(it.summary){f=document.createElement('small');f.textContent=it.summary;box.appendChild(f);}
  }
  function exRender(keepLayer){
    var layer=exLayer(), list=$('exlist'), mine={}, rec, items=EX.items.slice().sort(function(a,b){return (a.z||0)-(b.z||0);});
    var frames=CFG.preview.maxFrames;
    if(!keepLayer){
      layer.textContent='';
      exPaintBg();
      if(EX.lines)layer.insertAdjacentHTML('beforeend',EX.lines);
    }
    list.textContent='';
    try{rec=getRec();Object.keys(rec.items).forEach(function(k){mine[String(rec.items[k].subid)]=1;});}catch(e){}
    items.forEach(function(it){
      var w=it.width||100, h=it.height||40, row=document.createElement('div'), b=document.createElement('b'), sm=document.createElement('small'), box;
      if(keepLayer){
        box=layer.querySelector('.dexitem[data-sub="'+it.subid+'"]');
        if(box&&box.className.indexOf('ph')>-1)exPlaceholder(box,it);
        if(box&&box.getAttribute('data-frame'))frames--;
      }else{
        box=exBox(it,frames);
        if(box.getAttribute('data-frame'))frames--;
        layer.appendChild(box);
      }
      row.className='exrow';row.setAttribute('data-sub',it.subid);
      b.textContent='#'+it.subid+'  '+exLabel(it);row.appendChild(b);
      sm.textContent=Math.round(w)+' \u00D7 '+Math.round(h)+' at '+Math.round(it.left||0)+', '+Math.round(it.top||0)+' \u00B7 layer '+(it.z||0)+(mine[it.subid]?' \u00B7 pushed from this layout':'');
      row.appendChild(sm);
      if(it.target||it.summary){sm=document.createElement('small');sm.textContent=(it.target?'shows '+exBinding(it):'')+((it.target&&it.summary)?' \u00B7 ':'')+(it.summary||'');row.appendChild(sm);}
      row.addEventListener('click',function(){if(XE.sel===it.subid)exUnpick();else exPick(it.subid);});
      list.appendChild(row);
    });
    list.hidden=!items.length;$('exonrow').hidden=!items.length;$('exdimrow').hidden=!items.length;$('exscrrow').hidden=!items.length;$('exunload').hidden=!items.length;
    xeDecorate();
    try{document.dispatchEvent(new Event('exchanged'));}catch(e){}
  }
  function exLoad(){
    var id=mapId();
    if(!id)return;
    if(typeof xeReset0==='function')xeReset0();
    $('exload').disabled=true;$('exmsg').textContent='Reading the map\u2026';$('exmsg').className='note pst';
    exlStart(id);
    sampleGet({kind:'items',label:'Items on the map',path:'/api/mapsvg.htm',params:{id:id}}).then(function(o){
      var m, n;
      $('exload').disabled=false;updateButtons();
      if(String(mapId())!==String(id)){exlStop();return;}                 /* another map was chosen meanwhile */
      if(o.status===401){authNeeded();}
      if(o.error||o.status<200||o.status>=300){exlStop();$('exmsg').textContent=o.error||('PRTG answered '+o.status+' for the map\u2019s items.');$('exmsg').className='note pst err';return;}
      EX.items=exParse(o.body||'');EX.map=id;EX.bg='';EX.bgColor='';EX.lines='';
      m=/<svg\b[^>]*\bwidth="(\d+)px"/i.exec(o.body||'');n=/<svg\b[^>]*\bheight="(\d+)px"/i.exec(o.body||'');
      EX.mapW=m?parseInt(m[1],10):0;EX.mapH=n?parseInt(n[1],10):0;
      var rendered=Promise.all([prtgCss(),EX.items.length&&$('exscr').checked?exLibs():null,exMapView(id).then(function(v){if(EX.map!==id)return;if(EX.bg&&EX.bg!==v.bg){try{URL.revokeObjectURL(EX.bg);}catch(e){}}EX.bg=v.bg;EX.bgColor=v.color;EX.lines=exLinks(v.conn);if(hex6(v.color))$('mapbgcolor').value=hex6(v.color);bgMsg('','');bgPreSync();},function(){EX.bg='';})]).then(function(){if(EX.map===id)exRender();});
      var named=exNames().then(function(m){if(m===EX.map)exRender(true);});
      exlSettle(id,rendered,named);
      $('exsize').hidden=!(EX.mapW&&EX.mapH);
      $('exmsg').textContent=EX.items.length?(EX.items.length+(EX.items.length===1?' item':' items')+' on \u201C'+mapName()+'\u201D'+(EX.mapW?'. The map is '+EX.mapW+' \u00D7 '+EX.mapH+' px.':'.')+' Click one in the list to find it on the canvas.'):('There is nothing on \u201C'+mapName()+'\u201D yet.');
      $('exmsg').className='note pst ok';
    });
  }
  $('exload').addEventListener('click',function(){
    $('exfs').hidden=false;
    exLoad();
  });
  $('exunload').addEventListener('click',exUnload);
  /* ---- copy a map and paste it on another map, on this server or another one.
     Copy reads every item of the loaded map: which object file it uses (from the <!--Category: Name--> PRTG writes before it),
     where it sits, its own HTML before/after and link, and what it showed. Paste looks for each file on the connected server
     and suggests what to use; the items go onto the canvas, where the targets are chosen and the map is pushed as usual. */
  function mcEl(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
  var MC_KEY='pmMapCopy', MC={rows:[],copy:null};
  function mcValid(o){return !!(o&&o.kind==='pm-map-copy'&&o.items instanceof Array);}
  function mcGet(){try{var o=JSON.parse(localStorage.getItem(MC_KEY)||'null');return mcValid(o)?o:null;}catch(e){return null;}}
  function mcPut(o){try{localStorage.setItem(MC_KEY,JSON.stringify(o));return true;}catch(e){return false;}}
  function mcSame(a,b){return String(a||'').trim().toLowerCase()===String(b||'').trim().toLowerCase();}
  function mcBase(v){return String(v||'').split(/[\\\/]/).pop();}
  function mcHost(){return hostOf(base()||pageOrigin()||'');}
  function mcSay(m,kind){var n=$('mcmsg');n.textContent=m;n.className='note pst'+(kind?' '+kind:'');}
  function mcStat(m,kind){var n=$('mcstat');n.hidden=!m;n.textContent=m||'';n.className='note pst'+(kind?' '+kind:'');}
  function mcKind(cat,name,file,cls){
    if(/ownhtmlonly/i.test(file||'')||/^custom html$/i.test(String(cat||'').trim()))return 'custom';
    if(/\bpgr_/.test(cls||'')||/^map studio/i.test(String(name||'').trim())||/^map-studio/i.test(mcBase(file)))return 'ms';
    return 'prtg';
  }
  function mcCatEntry(cat,name){var l=S.catalog||[], i;for(i=0;i<l.length;i++){if(mcSame(l[i].cat,cat)&&mcSame(l[i].name,name))return l[i];}return null;}
  function mcFileEntry(file){var l=S.catalog||[], b=mcBase(file), i;if(!b)return null;for(i=0;i<l.length;i++){if(mcSame(mcBase(l[i].value),b))return l[i];}return null;}
  function mcWas(r){var t=r.target;if(!t||!t.id)return '';return (t.type?t.type+' ':'')+(t.name?'“'+t.name+'”':'ID '+t.id)+(t.where?' ('+t.where+')':'')+(r.from?' on '+r.from:'');}
  function mcSync(){
    var c=mcGet(), conn=!!(S.maps&&S.objFile);
    $('excopy').disabled=!(EX.items.length&&String(EX.map)===String(mapId()))||!!S.busy;
    $('excopy').dataset.tip=EX.items.length?'Copy the loaded map’s items, to paste them on another map, on this server or another':'Choose a map and press Load first';
    $('mcpaste').hidden=!c;$('mcpaste').disabled=!(conn&&mapId())||!!S.busy;
    $('mcpaste').title=(conn&&mapId())?'':'Connect and choose the map to paste into';
    $('mcsave').hidden=!c;
    if(c&&$('mcstat').getAttribute('data-sticky')!=='1')mcStat('Copy kept: '+c.items.length+(c.items.length===1?' item':' items')+' from “'+c.from.map+'” on '+c.from.host+', '+new Date(c.at).toLocaleString()+'.');
    else if(!c)mcStat('');
  }
  function mcCopy(){
    var items=EX.items.slice(), id=mapId(), done=0;
    if(!items.length||String(EX.map)!==String(id))return;
    $('excopy').disabled=true;$('mcstat').setAttribute('data-sticky','1');mcStat('Reading the settings of '+items.length+' items…');
    var q=items.slice(), lib=libLoad();
    function worker(){var it=q.shift();if(!it)return Promise.resolve();return xeBase(it.subid).then(function(){done++;mcStat('Reading the settings of each item: '+done+' of '+items.length+'…');},function(){done++;}).then(worker);}
    Promise.all([worker(),worker(),worker()]).then(function(){
      if(String(mapId())!==String(id)){$('mcstat').removeAttribute('data-sticky');mcSync();return;}
      var host=mcHost(), n={custom:0,ms:0,prtg:0}, noSet=0, out=items.map(function(it){
        var s=XE.cur[it.subid], e=mcCatEntry(it.cat,it.name), file=e?e.value:(/^custom html$/i.test(String(it.cat||'').trim())?String(S.objFile||''):''), kind=mcKind(it.cat,it.name,file,it.cls), t=it.target?EX.target[it.target]:null, f, r;
        if(!s)noSet++;
        r={cat:it.cat||'',name:it.name||'',file:mcBase(file),kind:kind,left:(s?s.left:it.left)||0,top:(s?s.top:it.top)||0,width:(s?s.width:it.width)||0,height:(s?s.height:it.height)||0,z:(s?s.z:it.z)||0,
          before:s?s.before:'',after:s?s.after:'',link:s?s.link:'',target:it.target?{id:it.target,type:(t&&t.type)||'',name:(t&&t.name)||'',where:(t&&t.where)||''}:null};
        if(kind==='ms')for(f in lib){if(mcSame(lib[f].cat,it.cat)&&mcSame(lib[f].name,it.name)&&lib[f].code){r.libFile=f;r.code=lib[f].code;break;}}
        n[kind]++;
        return r;
      });
      var copy={kind:'pm-map-copy',v:1,at:new Date().toISOString(),from:{host:host,map:mapName(),id:String(id)},w:EX.mapW||0,h:EX.mapH||0,items:out};
      $('mcstat').removeAttribute('data-sticky');
      var kept=mcPut(copy);MC.copy=copy;
      mcSync();
      mcStat('Copied '+out.length+(out.length===1?' item':' items')+' from “'+copy.from.map+'”: '+[n.prtg?n.prtg+' PRTG object'+(n.prtg===1?'':'s'):'',n.ms?n.ms+' Map Studio object'+(n.ms===1?'':'s'):'',n.custom?n.custom+' Custom HTML':''].filter(Boolean).join(', ')+'.'+(noSet?' '+noSet+' could not be read in full (their HTML before/after and link are not in the copy).':'')+(kept?' Connect to the other server (or stay here), choose or create a map, then press Paste copied map.':' It is too big to keep in this browser: use Save the copy as a file.'),noSet||!kept?'err':'ok');
      $('mcsave').hidden=false;
    });
  }
  function mcTok(s){return String(s||'').toLowerCase().replace(/\.htm$/,'').replace(/map[ -]?studio/g,' ').split(/[^a-z0-9]+/).filter(function(w){return w.length>1;});}
  function mcStem(v){return mcBase(v).toLowerCase().replace(/\.htm$/,'').replace(/[\s_-]*(small|large|tiny|xl|\d+)\b/g,'').replace(/[\s_-]+$/,'');}
  function mcSuggest(r){
    var a=mcTok(r.name), icon=/\.(svg|png)$/i.test(r.file||''), sc=[];
    (S.catalog||[]).forEach(function(c){
      if(!!c.icon!==icon||/ownhtmlonly/i.test(c.value))return;
      var b=mcTok(c.name), inter=a.filter(function(w){return b.indexOf(w)>-1;}).length, uni=a.length+b.length-inter, s=0;
      if(mcSame(c.cat,r.cat))s+=3;
      if(uni)s+=5*inter/uni;
      if(r.file&&mcStem(c.value)===mcStem(r.file))s+=2;
      if(s>=2)sc.push({c:c,s:s});
    });
    sc.sort(function(x,y){return y.s-x.s;});
    return sc.slice(0,6).map(function(x){return x.c;});
  }
  function mcOptions(r){
    var out=[], e;
    if(r.kind==='custom'){
      if(S.objFile)out.push({k:'custom',label:'Custom HTML, copied as it is',cat:'Custom HTML',name:'Custom HTML element',value:S.objFile});
    }else{
      e=mcCatEntry(r.cat,r.name)||mcFileEntry(r.file);
      if(e)out.push({k:'same',label:'The same object here: '+e.cat+': '+e.name,cat:e.cat,name:e.name,value:e.value});
      else{
        if(r.kind==='ms'&&r.code){var any=(S.catalog||[]).filter(function(c){return !c.icon;})[0], pre=any?String(any.value).replace(/[^\\\/]*$/,''):'';out.push({k:'install',label:'Install it here from the copy ('+r.libFile+'), then push',cat:r.cat,name:r.name,value:pre+r.libFile});}
        mcSuggest(r).forEach(function(c){out.push({k:'alt',label:'Closest here: '+c.cat+': '+c.name,cat:c.cat,name:c.name,value:c.value});});
      }
    }
    out.push({k:'skip',label:'Leave it out'});
    return out;
  }
  function mcOpen(){
    var c=mcGet();
    if(!c||!(S.maps&&S.objFile&&mapId()))return;
    MC.copy=c;MC.rows=[];
    var same=mcSame(c.from.host,mcHost()), list=$('mclist'), counts={same:0,custom:0,install:0,alt:0,none:0};
    list.textContent='';
    c.items.slice().sort(function(a,b){return (a.z||0)-(b.z||0);}).forEach(function(r){
      var opts=mcOptions(r), row=mcEl('div','mcrow'), sel=document.createElement('select'), first=opts[0].k;
      r.from=same?'':c.from.host;
      counts[first==='skip'?'none':first]++;
      opts.forEach(function(o,i){var op=document.createElement('option');op.value=String(i);op.textContent=o.label;sel.appendChild(op);});
      var badge={same:'Same here',custom:'Custom HTML',install:'Install',alt:'Not here: closest',skip:'Not here'}[first];
      var nm=mcEl('div','mcn');nm.appendChild(mcEl('span','mck',badge));nm.appendChild(document.createTextNode((r.kind==='custom'?'Custom HTML':r.cat+': '+r.name)+(r.kind==='ms'?' (Map Studio)':'')));
      row.appendChild(nm);
      var w=mcWas(r);
      row.appendChild(mcEl('div','mcw',(w?'Showed '+w+'. ':'')+'At '+r.left+', '+r.top+(r.width&&r.height?', '+r.width+' × '+r.height:'')+'.'));
      row.appendChild(sel);
      function tone(){var k=opts[+sel.value].k;row.className='mcrow '+((k==='same'||k==='custom')?'ok':(k==='skip'?'skip':'warn'));}
      sel.addEventListener('change',tone);tone();
      sel.setAttribute('aria-label','What to use for '+(r.kind==='custom'?'Custom HTML':r.name));
      row.setAttribute('role','listitem');
      list.appendChild(row);MC.rows.push({r:r,opts:opts,sel:sel});
    });
    var miss=counts.install+counts.alt+counts.none;
    mcSay(c.items.length+(c.items.length===1?' item':' items')+' from “'+c.from.map+'” on '+c.from.host+' → “'+mapName()+'” on '+mcHost()+'. '+(counts.same+counts.custom)+' can be used as they are'+(miss?'; '+miss+' use'+(miss===1?'s':'')+' a file this server does not have: choose what to use instead, or leave '+(miss===1?'it':'them')+' out':'')+'. '+(same?'Each item keeps its target, since this is the same server.':'Targets are not copied between servers: choose each one on the canvas (Selected, Target). The note there says what it showed before.'),miss?'':'ok');
    var cw=+$('dw').value, ch=+$('dh').value;
    $('mcsizerow').hidden=!(c.w&&c.h&&(c.w!==cw||c.h!==ch));$('mcsize').checked=false;
    $('mcsizel').textContent='Also make the canvas and “'+mapName()+'” '+c.w+' × '+c.h+' like the copied map (changes the map’s size in PRTG now)';
    $('mcbox').hidden=false;
  }
  function mcPlace(){
    var c=MC.copy, same=c&&mcSame(c.from.host,mcHost()), list=[], inst={}, lib, f;
    if(!c)return;
    MC.rows.forEach(function(x){
      var o=x.opts[+x.sel.value], r=x.r;
      if(!o||o.k==='skip')return;
      if(o.k==='install')inst[r.libFile]={cat:r.cat,name:r.name,code:r.code,at:Date.now()};
      list.push({x:r.left,y:r.top,w:r.width,h:r.height,z:r.z,cat:o.cat,name:o.name,value:o.value,target:(same&&r.target)?{id:r.target.id,name:r.target.name}:null,
        before:r.before,after:r.after,link:r.link,was:same?'':mcWas(r),raw:r.kind==='custom',sizing:(r.width>0&&r.height>0)?'box':''});
    });
    if(!list.length){mcSay('Nothing to put on the canvas: every item is set to Leave it out.','err');return;}
    if($('mcsize').checked&&c.w&&c.h){var w=$('dw'),h=$('dh');w.value=c.w;w.dispatchEvent(new Event('change',{bubbles:true}));h.value=c.h;h.dispatchEvent(new Event('change',{bubbles:true}));}
    if(Object.keys(inst).length){lib=libLoad();for(f in inst)lib[f]=inst[f];try{localStorage.setItem(CFG.keys.library,JSON.stringify(lib));}catch(e){}try{document.dispatchEvent(new Event('pmlibchanged'));}catch(e){}}
    DASHAPI.addCopies(list);
    var ni=Object.keys(inst).length;
    mcSay(list.length+(list.length===1?' item is':' items are')+' on the canvas.'+(same?'':' Choose each one’s target (Selected, Target).')+(ni?' '+ni+' Map Studio file'+(ni===1?' was':'s were')+' added to Your objects: install '+(ni===1?'it':'them')+' with the install script (Object builder, Your objects), then press Refresh object list; until then the push lists '+(ni===1?'it':'them')+' as missing.':'')+' Then push as usual: the Review lists everything first.','ok');
    try{if(window.PUSHAPI&&PUSHAPI.renderObjList)PUSHAPI.renderObjList();}catch(e){}
  }
  $('excopy').addEventListener('click',mcCopy);
  $('mcpaste').addEventListener('click',mcOpen);
  $('mcclose').addEventListener('click',function(){$('mcbox').hidden=true;});
  $('mcplace').addEventListener('click',mcPlace);
  $('mcsave').addEventListener('click',function(){
    var c=mcGet()||MC.copy;if(!c)return;
    var url=URL.createObjectURL(new Blob([JSON.stringify(c,null,1)],{type:'application/json'})), a=document.createElement('a');
    a.href=url;a.download='map-copy-'+String(c.from.map||'map').replace(/[^\w.-]+/g,'-').slice(0,60)+'.json';document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(url);},4000);
  });
  $('mcfile').addEventListener('change',function(){
    var fl=this.files&&this.files[0], inp=this;if(!fl)return;
    fl.text().then(function(t){
      var o=null;try{o=JSON.parse(t);}catch(e){}
      inp.value='';
      if(!mcValid(o)){mcStat('That file is not a map copy made by Map Studio.','err');return;}
      MC.copy=o;var kept=mcPut(o);mcSync();
      mcStat('Opened a copy of '+o.items.length+(o.items.length===1?' item':' items')+' from “'+o.from.map+'” on '+o.from.host+'.'+(kept?'':' It is too big to keep in this browser, so open it again after a reload.')+' Choose the map to paste into, then press Paste copied map.','ok');
      $('mcpaste').hidden=false;$('mcsave').hidden=false;
    });
  });
  document.addEventListener('exchanged',mcSync);
  function exLayerSync(){var l=$('dexist');if(l)l.className=exLayerClass();xeDecorate();}
  $('exon').addEventListener('change',exLayerSync);
  $('exdim').addEventListener('change',exLayerSync);
  $('exscr').addEventListener('change',function(){if(!EX.items.length)return;(this.checked?exLibs():Promise.resolve()).then(function(){exRender();});});
  $('exsize').addEventListener('click',function(){
    var w=$('dw'),h=$('dh');
    if(!EX.mapW||!EX.mapH)return;
    w.value=EX.mapW;w.dispatchEvent(new Event('input',{bubbles:true}));w.dispatchEvent(new Event('change',{bubbles:true}));
    h.value=EX.mapH;h.dispatchEvent(new Event('input',{bubbles:true}));h.dispatchEvent(new Event('change',{bubbles:true}));
  });
  $('pushmap').addEventListener('change',exClear);
  $('pushconnect').addEventListener('click',exClear);
  /* ---- acting on the items already on the map: edit, move or delete, with Review first and Undo after. Nothing is written until Apply. ---- */
  var XE={cur:{},stage:{},sel:null,rev:null,busy:false};
  function xeMsg(m,kind){var n=$('xemsg');n.textContent=m;n.className='note pst'+(kind?' '+kind:'');banner(m,kind);}
  function xeItem(sub){var i;for(i=0;i<EX.items.length;i++){if(EX.items[i].subid===String(sub))return EX.items[i];}return null;}
  function xeNorm(j){
    function n(v){var x=parseInt(v,10);return isNaN(x)?0:x;}
    function t(v){return (v==null?'':String(v)).replace(/&apos;/g,'"');}   /* the designer shows the stored text this way before it saves it back */
    return {left:n(j.left),top:n(j.top),width:n(j.width),height:n(j.height),z:n(j.zindex),link:String(j.externallink==null?'':j.externallink),before:t(j.htmlbefore),after:t(j.htmlafter)};
  }
  function xeFetch(sub){return http('GET','/api/mapsettings.htm',{id:mapId(),subid:sub,type:'objectproperties'}).then(function(t){return xeNorm(parseJson(t,'The settings of item '+sub));});}
  function xeBase(sub){return XE.cur[sub]?Promise.resolve(XE.cur[sub]):xeFetch(sub).then(function(b){XE.cur[sub]=b;return b;});}
  function xeSame(a,b){var k;for(k in a){if(a[k]!==b[k])return false;}return true;}
  function xeMerged(sub){var b=XE.cur[sub], s=XE.stage[sub]||{}, o={}, k;for(k in b)o[k]=(k in s)?s[k]:b[k];return o;}
  function xeEditCall(sub,v){return http('POST','/api/editmapobject.htm',{subid:sub,id:mapId(),top:v.top,left:v.left,width:v.width,height:v.height,zindex:v.z,htmlbefore_:v.before,htmlafter_:v.after,ElementLink:v.link});}
  function xeHist(){try{var a=JSON.parse(localStorage.getItem(CFG.keys.mapEdits)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
  function xeSaveHist(a){try{localStorage.setItem(CFG.keys.mapEdits,JSON.stringify(a.slice(-20)));return true;}catch(e){S.storeFail=true;return false;}}
  function xeLast(){var h=xeHist(),i;for(i=h.length-1;i>=0;i--){if(sameTarget(h[i]))return h[i];}return null;}
  function xeReset0(){
    XE.cur={};XE.stage={};XE.sel=null;XE.rev=null;
    if($('dexsel'))$('dexsel').style.display='none';
    $('exedit').hidden=true;$('exchg').hidden=true;$('exrev').hidden=true;$('xeapply').hidden=true;$('xermrow').hidden=true;$('xerm').checked=false;
    xeButtons();
  }
  function xeButtons(){
    var e=xeLast(), n=e?((e.updated||[]).length+(e.removed||[]).length):0, ok=!!(S.maps&&mapId());
    $('xeundo').disabled=!e||!ok||XE.busy;
    $('xeundo').dataset.tip='Undo last change'+(n?' ('+n+(n===1?' item':' items')+')':'');
    $('xereview').disabled=XE.busy||!Object.keys(XE.stage).length||xeInvalid();
    $('xeapply').disabled=XE.busy;
    xeBar();
  }
  var XEF=[['left','xeleft','Left',0],['top','xetop','Top',0],['width','xewidth','Width',1],['height','xeheight','Height',1],['z','xez','Layer',0]];
  function xeInvalid(){
    var bad=false;
    XEF.forEach(function(f){var el=$(f[1]), v=Number(el.value);if(el.value===''||!(v%1===0)||v<f[3]||v>9999){bad=true;}});
    return bad&&!$('exedit').hidden;
  }
  function xeSelect(sub){
    XE.sel=String(sub);
    var it=xeItem(sub);
    $('exedit').hidden=false;$('exedtitle').textContent='#'+sub+'  '+(it?exLabel(it):'');
    $('xenote').textContent='Reading this item\u2019s settings\u2026';$('xenote').className='note pst';
    xeBase(sub).then(function(){if(XE.sel===String(sub)){$('xenote').textContent='';xePopulate();}},function(err){
      if(err&&err.status===401)authNeeded();
      $('xenote').textContent='Could not read this item\u2019s settings ('+(err.message||err)+'). It cannot be edited from here.';$('xenote').className='note pst err';
    });
  }
  function xeDeselect(){XE.sel=null;$('exedit').hidden=true;xeButtons();xeDecorate();}
  function exPick(sub){
    sub=String(sub);
    try{DASHAPI.deselect();}catch(e){}
    xeSelect(sub);xeDecorate();
  }
  function exUnpick(){xeDeselect();}
  function xePopulate(){
    var sub=XE.sel, v=xeMerged(sub), gone=!!(XE.stage[sub]&&XE.stage[sub].del);
    XEF.forEach(function(f){var el=$(f[1]);el.value=v[f[0]];el.className='';el.disabled=gone;});
    $('xelink').value=v.link;$('xebefore').value=v.before;$('xeafter').value=v.after;
    ['xelink','xebefore','xeafter'].forEach(function(id){$(id).disabled=gone;});
    $('xedel').textContent=gone?'Keep this item':'Mark for deletion';
    xeButtons();
  }
  function xeInput(){
    var sub=XE.sel, b=sub&&XE.cur[sub], st={}, bad=false;
    if(!b||XE.busy)return;
    XEF.forEach(function(f){
      var el=$(f[1]), v=Number(el.value), ok=(el.value!==''&&v%1===0&&v>=f[3]&&v<=9999);
      el.className=ok?'':'bad';
      if(!ok){bad=true;return;}
      if(v!==b[f[0]])st[f[0]]=v;
    });
    if($('xelink').value!==b.link)st.link=$('xelink').value;
    if($('xebefore').value!==b.before)st.before=norm($('xebefore').value);
    if($('xeafter').value!==b.after)st.after=norm($('xeafter').value);
    if(XE.stage[sub]&&XE.stage[sub].del)st.del=true;
    if(Object.keys(st).length)XE.stage[sub]=st;else delete XE.stage[sub];
    $('xenote').textContent=bad?'Use whole numbers from 0 to 9999 (width and height at least 1).':'';$('xenote').className='note pst'+(bad?' err':'');
    xeStaged();
  }
  function xeStaged(){
    var n=Object.keys(XE.stage), del=n.filter(function(k){return XE.stage[k].del;}).length, ed=n.length-del;
    XE.rev=null;$('exrev').hidden=true;$('xeapply').hidden=true;$('xermrow').hidden=true;
    $('exchg').hidden=!n.length;
    $('exchgsum').textContent=n.length?((ed?ed+(ed===1?' item':' items')+' changed':'')+((ed&&del)?', ':'')+(del?del+(del===1?' item':' items')+' marked for deletion':'')+'. Nothing has been sent to PRTG.'):'';
    xeDecorate();xeButtons();
  }
  function exSelBox(){
    var c=$('dcanvas'), b=$('dexsel'), h;
    if(!b){b=document.createElement('div');b.id='dexsel';h=document.createElement('div');h.id='dexhandle';b.appendChild(h);c.appendChild(b);h.addEventListener('mousedown',exHandleDown);}
    return b;
  }
  function exScale(){var c=$('dcanvas');return c.offsetWidth?c.getBoundingClientRect().width/c.offsetWidth:1;}
  function exGeom(sub){
    var it=xeItem(sub), v=XE.cur[sub]?xeMerged(sub):null;
    if(v)return {left:v.left,top:v.top,width:v.width,height:v.height,z:v.z};
    return it?{left:it.left||0,top:it.top||0,width:it.width||100,height:it.height||40,z:it.z||0}:null;
  }
  function exSelPos(){
    var b=exSelBox(), g=XE.sel?exGeom(XE.sel):null, st=XE.sel&&XE.stage[XE.sel], sc=exScale(), hs=14/sc, h=$('dexhandle');
    if(!g||!$('dexist')||!$('exon').checked){b.style.display='none';return;}
    b.style.display='block';b.style.left=g.left+'px';b.style.top=g.top+'px';b.style.width=g.width+'px';b.style.height=g.height+'px';
    b.style.borderWidth=Math.max(1,2/sc)+'px';
    h.style.width=hs+'px';h.style.height=hs+'px';h.style.right=(-hs/2)+'px';h.style.bottom=(-hs/2)+'px';
    h.style.display=(st&&st.del)?'none':'block';
  }
  function xeBar(){
    var n=Object.keys(XE.stage).length, a=$('xeapply');
    $('exbar').hidden=!n;
    $('exbartext').textContent=n+(n===1?' change':' changes')+' not sent to PRTG yet';
    $('exbarapply').hidden=a.hidden;$('exbarapply').textContent=a.textContent;$('exbarapply').disabled=a.disabled;
  }
  function xeDecorate(){
    var layer=$('dexist'), rows=$('exlist');
    if(!layer)return;
    [].forEach.call(layer.querySelectorAll('.dexitem'),function(bx){bx.classList.toggle('on',bx.getAttribute('data-sub')===XE.sel);});
    [].forEach.call(rows.querySelectorAll('.exrow'),function(r){r.classList.toggle('on',r.getAttribute('data-sub')===XE.sel);});
    exSelPos();
    [].forEach.call(layer.querySelectorAll('.dexitem'),function(box){
      var sub=box.getAttribute('data-sub'), st=XE.stage[sub], b=XE.cur[sub], it=xeItem(sub), v=(st&&b)?xeMerged(sub):null;
      box.classList.toggle('staged',!!(st&&!st.del));box.classList.toggle('gone',!!(st&&st.del));
      if(v){box.style.left=v.left+'px';box.style.top=v.top+'px';box.style.width=v.width+'px';box.style.height=v.height+'px';}
      else if(it){box.style.left=(it.left||0)+'px';box.style.top=(it.top||0)+'px';box.style.width=(it.width||100)+'px';box.style.height=(it.height||40)+'px';}
    });
    [].forEach.call(rows.querySelectorAll('.exrow'),function(r){
      var st=XE.stage[r.getAttribute('data-sub')];
      if(st)r.setAttribute('data-flag',st.del?'to be deleted':'changed');else r.removeAttribute('data-flag');
    });
  }
  function xeLines(sub){
    var st=XE.stage[sub], b=XE.cur[sub], it=xeItem(sub), out=[];
    if(st.del)return ['will be deleted'];
    if('left' in st||'top' in st)out.push('moved '+b.left+', '+b.top+' \u2192 '+(('left' in st)?st.left:b.left)+', '+(('top' in st)?st.top:b.top));
    if('width' in st||'height' in st)out.push('resized '+b.width+' \u00D7 '+b.height+' \u2192 '+(('width' in st)?st.width:b.width)+' \u00D7 '+(('height' in st)?st.height:b.height));
    if('z' in st)out.push('layer '+b.z+' \u2192 '+st.z);
    if('link' in st)out.push('link changed');
    if('before' in st)out.push('HTML Before changed ('+b.before.length+' \u2192 '+st.before.length+' characters)');
    if('after' in st)out.push('HTML After changed ('+b.after.length+' \u2192 '+st.after.length+' characters)');
    return out;
  }
  function xeSig(){return JSON.stringify([mapId(),base(),XE.stage,!!$('xerm').checked]);}
  function xeReview(){
    var box=$('exrev'), subs=Object.keys(XE.stage), del=subs.filter(function(k){return XE.stage[k].del;}), ed=subs.length-del.length, n;
    if(!subs.length||xeInvalid())return;
    box.textContent='';
    subs.forEach(function(sub){
      var it=xeItem(sub), d=document.createElement('div'), b=document.createElement('b');
      d.className='xl';b.textContent='#'+sub+'  '+(it?exLabel(it):'');d.appendChild(b);
      xeLines(sub).forEach(function(l){var s2=document.createElement('div');s2.textContent=l;d.appendChild(s2);});
      box.appendChild(d);
    });
    box.hidden=false;$('xermrow').hidden=!del.length;
    n=ed+(del.length&&$('xerm').checked?del.length:0);
    $('xeapply').textContent='Apply '+n+(n===1?' change':' changes')+' to PRTG';
    $('xeapply').hidden=!n;XE.rev=xeSig();
    xeMsg(del.length&&!$('xerm').checked?'Items marked for deletion stay on the map unless you tick the box above.':'Check the list, then apply.','');
    xeButtons();
  }
  function xeBackup(items){
    var blob=new Blob([JSON.stringify({tool:STAMP_NAME(),saved:new Date().toISOString(),server:(base()||pageOrigin()||''),map:{id:mapId(),name:mapName()},items:items},null,1)],{type:'application/json'}), url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url;a.download='prtg-removed-items-'+mapId()+'-'+new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)+'.json';
    document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(url);},2000);
  }
  function xeApply(){
    var rm=$('xerm').checked, edits=[], dels=[], entry={map:mapId(),srv:srvId(),name:mapName(),at:new Date().toISOString(),updated:[],removed:[]}, work, k=0;
    if(XE.rev!==xeSig()){xeReview();xeMsg('Something changed since the review. Check the list again, then apply.','err');return;}
    Object.keys(XE.stage).forEach(function(sub){if(XE.stage[sub].del){if(rm)dels.push(sub);}else edits.push(sub);});
    work=edits.map(function(s){return {kind:'edit',sub:s};}).concat(dels.map(function(s){return {kind:'del',sub:s};}));
    if(!work.length)return;
    if(dels.length)xeBackup(dels.map(function(s){var it=xeItem(s);return {subid:s,category:it?it.cat:'',name:it?it.name:'',target:it?it.target:0,classes:it?it.cls:'',settings:XE.cur[s],markup:it?it.html:''};}));
    XE.busy=true;S.storeFail=false;xeButtons();
    function finish(msg,kind){
      if(entry.updated.length||entry.removed.length){var h=xeHist();h.push(entry);xeSaveHist(h);}
      XE.busy=false;XE.stage={};XE.cur={};XE.rev=null;$('exrev').hidden=true;$('xeapply').hidden=true;$('xermrow').hidden=true;$('xerm').checked=false;$('exchg').hidden=true;$('exedit').hidden=true;
      if(S.storeFail){msg+=storeWarn();kind='err';}
      xeMsg(msg,kind);xeButtons();
      if(entry.updated.length||entry.removed.length)exLoad();
    }
    function fail(err){
      if(err&&err.status===401)authNeeded();
      finish('Stopped after '+k+' of '+work.length+': '+(err.message||err)+(entry.updated.length||entry.removed.length?' What was already done is remembered, so Undo last change reverses it.':''),'err');
    }
    (function next(){
      var w;
      if(k>=work.length){finish('Applied '+(entry.updated.length?entry.updated.length+(entry.updated.length===1?' change':' changes'):'')+(entry.updated.length&&entry.removed.length?' and ':'')+(entry.removed.length?'deleted '+entry.removed.length+(entry.removed.length===1?' item':' items'):'')+' on \u201C'+mapName()+'\u201D. Open the map in PRTG to see it.','ok');return;}
      w=work[k];xeMsg((w.kind==='del'?'Deleting ':'Updating ')+(k+1)+' of '+work.length+'\u2026','');
      xeFetch(w.sub).then(function(now){
        if(!xeSame(now,XE.cur[w.sub]))throw new Error('Item '+w.sub+' was changed in PRTG after it was loaded here. Press Show items again and redo the change.');
        if(w.kind==='edit'){
          var after=xeMerged(w.sub);
          return xeEditCall(w.sub,after).then(function(){entry.updated.push({subid:w.sub,before:XE.cur[w.sub],after:after});});
        }
        var it=xeItem(w.sub);
        return http('GET','/api/deletesubobject.htm',{id:mapId(),subid:w.sub}).then(function(){
          entry.removed.push({subid:w.sub,cat:it?it.cat:'',name:it?it.name:'',target:it?it.target:0,before:XE.cur[w.sub]});
        });
      }).then(function(){k++;next();},fail);
    })();
  }
  function xeFile(r){
    var i;
    if(r.cat==='Custom HTML')return S.objFile||null;
    for(i=0;S.catalog&&i<S.catalog.length;i++){if(S.catalog[i].cat===r.cat&&S.catalog[i].name===r.name)return S.catalog[i].value;}
    return null;
  }
  function xeUndo(){
    var e=xeLast(), ups, rems, reverted=0, restored=0, skipped=[], failed=[], k;
    if(!e)return;
    ups=(e.updated||[]).slice().reverse();rems=(e.removed||[]).slice();
    XE.busy=true;S.storeFail=false;xeButtons();
    function finish(){
      var h=xeHist(), i, left=failed.length, msg;
      for(i=0;i<h.length;i++){if(h[i].at===e.at&&h[i].srv===e.srv&&String(h[i].map)===String(e.map)){if(left){h[i].updated=failed.filter(function(f){return f.kind==='up';}).map(function(f){return f.u;});h[i].removed=failed.filter(function(f){return f.kind==='re';}).map(function(f){return f.r;});}else h.splice(i,1);break;}}
      xeSaveHist(h);XE.busy=false;
      msg=(reverted?'Reverted '+reverted+(reverted===1?' change':' changes'):'')+((reverted&&restored)?', ':'')+(restored?'put back '+restored+(restored===1?' deleted item':' deleted items'):'');
      if(!msg)msg='Nothing was undone';
      if(skipped.length)msg+='. '+skipped.length+(skipped.length===1?' item was':' items were')+' changed in PRTG since, so it was left alone';
      if(left)msg+='. '+left+' could not be undone; try again';
      if(restored)msg+='. Put-back items get new ids and lose any connections they had';
      xeMsg(msg+'.'+storeWarn(),(left||S.storeFail)?'err':'ok');xeButtons();
      if(reverted||restored)exLoad();
    }
    (function next(){
      var u, r, file;
      if(ups.length){
        u=ups[0];
        xeFetch(u.subid).then(function(now){
          if(!xeSame(now,u.after)){skipped.push(u.subid);ups.shift();next();return;}
          return xeEditCall(u.subid,u.before).then(function(){reverted++;ups.shift();next();});
        }).catch(function(){failed.push({kind:'up',u:u});ups.shift();next();});
        return;
      }
      if(rems.length){
        r=rems[0];file=xeFile(r);
        if(!file){failed.push({kind:'re',r:r});rems.shift();next();return;}
        http('POST','/api/addobjecttomap.htm',{objectid:r.target||0,top:r.before.top,left:r.before.left,id:mapId(),width:r.before.width,height:r.before.height,mapobject_:file,noautoposition:1,result:'html'}).then(function(resp){
          var sub=itemId(resp);
          if(!sub)throw new Error('no id');
          return xeEditCall(sub,r.before);
        }).then(function(){restored++;rems.shift();next();},function(){failed.push({kind:'re',r:r});rems.shift();next();});
        return;
      }
      finish();
    })();
  }
  ['xeleft','xetop','xewidth','xeheight','xez','xelink','xebefore','xeafter'].forEach(function(id){$(id).addEventListener('input',xeInput);});
  $('xedel').addEventListener('click',function(){
    var sub=XE.sel, st;
    if(!sub||!XE.cur[sub])return;
    st=XE.stage[sub]||{};
    if(st.del){delete st.del;if(Object.keys(st).length)XE.stage[sub]=st;else delete XE.stage[sub];}
    else{st.del=true;XE.stage[sub]=st;}   /* edits already staged are kept, so unmarking brings them back */
    xePopulate();xeStaged();
  });
  $('xereset').addEventListener('click',function(){var sub=XE.sel;if(!sub)return;delete XE.stage[sub];xePopulate();xeStaged();});
  $('xereview').addEventListener('click',xeReview);
  $('xerm').addEventListener('change',function(){if(!$('exrev').hidden)xeReview();});
  $('xeapply').addEventListener('click',xeApply);
  $('xeundo').addEventListener('click',xeUndo);
  /* ---- clicking, dragging and keys on the canvas ---- */
  var XD=null;
  function exSnap(v){var g=parseInt($('dgrid').value,10)||0;return g>0?Math.round(v/g)*g:Math.round(v);}
  function exHit(cx,cy){
    var r=$('dcanvas').getBoundingClientRect(), sc=exScale(), x=(cx-r.left)/sc, y=(cy-r.top)/sc, best=null, bk=-1;
    if(!$('dexist')||!$('exon').checked)return null;
    EX.items.forEach(function(it,i){
      var g=exGeom(it.subid), k;
      if(g&&x>=g.left&&x<=g.left+g.width&&y>=g.top&&y<=g.top+g.height){k=(g.z||0)*100000+i;if(k>=bk){bk=k;best=it.subid;}}
    });
    return best;
  }
  function exGone(sub){return !!(XE.stage[sub]&&XE.stage[sub].del);}
  function exHandleDown(e){
    if(e.button!==0||!XE.sel||exGone(XE.sel))return;
    e.preventDefault();e.stopPropagation();
    XD={mode:'size',sub:XE.sel,sx:e.clientX,sy:e.clientY,g:exGeom(XE.sel),moved:false};
  }
  $('dcanvas').addEventListener('mousedown',function(e){
    var t=e.target, hit;
    if(e.button!==0||!DASHAPI.active)return;
    if(t.id==='dexhandle')return;
    if(t.closest&&t.closest('.ditem')){if(XE.sel)exUnpick();return;}
    hit=exHit(e.clientX,e.clientY);
    if(!hit){if(XE.sel)exUnpick();return;}
    e.preventDefault();
    if(XE.sel!==hit)exPick(hit);
    if(!exGone(hit))XD={mode:'move',sub:hit,sx:e.clientX,sy:e.clientY,g:exGeom(hit),moved:false};
  });
  function exSet(id,v){$(id).value=v;}
  document.addEventListener('mousemove',function(e){
    var sc, dx, dy, g;
    if(!XD){
      if(DASHAPI.active&&e.target&&e.target.closest&&e.target.closest('#dcanvas')&&!e.target.closest('.ditem')&&e.target.id!=='dexhandle'){$('dcanvas').style.cursor=exHit(e.clientX,e.clientY)?'move':'';}
      return;
    }
    if(!XE.cur[XD.sub]||XE.sel!==XD.sub)return;               /* the item's settings are still being read */
    if(!XD.moved&&Math.abs(e.clientX-XD.sx)+Math.abs(e.clientY-XD.sy)<4)return;
    XD.moved=true;
    sc=exScale();dx=(e.clientX-XD.sx)/sc;dy=(e.clientY-XD.sy)/sc;g=XD.g;
    if(XD.mode==='move'){exSet('xeleft',Math.max(0,exSnap(g.left+dx)));exSet('xetop',Math.max(0,exSnap(g.top+dy)));}
    else{exSet('xewidth',Math.max(10,exSnap(g.width+dx)));exSet('xeheight',Math.max(10,exSnap(g.height+dy)));}
    xeInput();
  });
  document.addEventListener('mouseup',function(){XD=null;});
  document.addEventListener('keydown',function(e){
    var t=e.target, tag=t&&t.tagName, k=e.key, st, sub=XE.sel, g;
    if(!sub||!DASHAPI.active||XD)return;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable))return;
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(k==='Delete'||k==='Backspace'){e.preventDefault();if(XE.cur[sub])$('xedel').click();return;}
    if(k==='Escape'){e.preventDefault();exUnpick();return;}
    if(!XE.cur[sub]||exGone(sub))return;
    st=e.shiftKey?10:1;g=exGeom(sub);
    if(k==='ArrowLeft'){e.preventDefault();exSet('xeleft',Math.max(0,g.left-st));}
    else if(k==='ArrowRight'){e.preventDefault();exSet('xeleft',g.left+st);}
    else if(k==='ArrowUp'){e.preventDefault();exSet('xetop',Math.max(0,g.top-st));}
    else if(k==='ArrowDown'){e.preventDefault();exSet('xetop',g.top+st);}
    else return;
    xeInput();
  });
  document.addEventListener('dashselect',function(){try{if(DASHAPI.selected()&&XE.sel)exUnpick();}catch(e){}});
  $('exbarrev').addEventListener('click',function(){
    var bar=[].filter.call(document.querySelectorAll('#dashpanel .advbar'),function(b){return /Existing PRTG maps/.test(b.textContent);})[0];
    if(bar&&!bar.classList.contains('open'))bar.click();
    $('exfs').hidden=false;
    xeReview();
    try{$('exrev').scrollIntoView({block:'nearest'});}catch(e){}
  });
  $('exbarapply').addEventListener('click',function(){$('xeapply').click();});
  $('exbardisc').addEventListener('click',function(){XE.stage={};if(XE.sel&&XE.cur[XE.sel])xePopulate();xeStaged();});
  /* ---- the PRTG switch at the top of the Dashboard tab ---- */
  function hostOf(u){try{return new URL(u).host;}catch(e){return String(u);}}
  /* the object files on the connected server, for the Object builder's name check: window.PRTGOBJS [{cat,name,file}] */
  function pubObjs(){
    var on=!!(S&&S.maps&&S.objFile&&S.catalog);
    window.PRTGOBJS=on?S.catalog.filter(function(c){return !c.icon;}).map(function(c){return {cat:c.cat,name:c.name,file:String(c.value).split(/[\\\/]/).pop()};}):[];
    window.PRTGOBJHOST=on?hostOf(base()||pageOrigin()||'PRTG'):'';
    try{document.dispatchEvent(new CustomEvent('prtgobjs'));}catch(e){}
  }
  function swSync(){
    var connected=!!(S&&S.maps&&S.objFile), busy=!!$('pushconnect').disabled&&!connected, err=S&&S.lastErr;
    $('prtgdot').className='pdot '+(connected?'ok':(busy?'busy':(err?'err':'off')));
    $('prtgtxt').textContent=connected?('Connected to '+hostOf(base()||pageOrigin()||'PRTG')):(busy?'Connecting\u2026':(err?('Not connected \u00B7 '+String(err).slice(0,48)):'Not connected'));
    $('prtgtxt').title=connected?('Connected to '+(base()||pageOrigin()||'PRTG')+' \u00B7 '+S.maps.length+(S.maps.length===1?' map':' maps')):String(err||'Not connected');
    $('prtgswitch').hidden=!connected;$('prtgrefresh').hidden=!connected;$('prtgdisconnect').hidden=!connected;$('prtgcog').hidden=connected;
    if(connected&&CSSX&&CSSX.origin!==(base()||pageOrigin()||''))try{prtgCss();}catch(e){}
    window.PRTGSTATE={connected:connected,map:connected&&!!$('pushmap').value};
    if(!connected||!window.PRTGOBJS||!window.PRTGOBJS.length)pubObjs();
    window.PRTGMAPS=connected?(S.maps||[]).map(function(m){return {id:String(m.objid),name:String(m.name||'')};}):[];
    $('next2').disabled=!window.PRTGSTATE.map;
    $('mapbgcolor').disabled=!window.PRTGSTATE.map;try{bgPreSync();}catch(e){}$('mapbgbtn').disabled=!window.PRTGSTATE.map;$('mapbgbtn').dataset.tip=window.PRTGSTATE.map?'Change the map\u2019s background color':'Connect and choose a map first';
    try{document.dispatchEvent(new CustomEvent('prtgstate',{detail:window.PRTGSTATE}));}catch(e){}
    if(S.needLogin&&!connected&&!busy){$('prtgpop').hidden=false;}
    if(connected)S.needLogin=false;
    if(connected&&!busy&&S.reauth){S.reauth=false;$('prtgpop').hidden=true;}   /* a connect that followed a refused login has worked: the panel has done its job */
  }
  function disconnect(){
    S.maps=null;S.objFile=null;S.catalog=null;S.reviewed=null;S.cls=null;S.lastErr=null;S.tgt={};
    $('pushmap').innerHTML='';$('pushgo').hidden=true;$('pushlist').hidden=true;
    mapMode('open');$('newmapname').value='';$('newmapmsg').textContent='';
    $('exfs').hidden=true;
    if(S.deleteArm){clearTimeout(S.deleteArm);S.deleteArm=null;}
    $('deleteMapBtn').classList.remove('armed');$('deleteMapBtn').textContent='Delete this map';deleteMapMsg('');
    PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};trReset();
    exClear();say('Disconnected.','');updateButtons();renderObjList();pickerSync();pvSync();
  }
  ['pushuser','pushsecret'].forEach(function(id){
    $(id).addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();$('pushconnect').click();}});
    $(id).addEventListener('input',function(){loginMark(false,false);});
  });
  /* a server address that starts with http:// sends the username and passhash across the network unencrypted, so the card says so as soon as one is typed */
  function httpWarn(){
    var on=/^\s*http:\/\//i.test(String($('pushserver').value||''));
    $('httpwarn').textContent=on?'This address starts with http://, so your username and passhash would be sent without encryption. Use https:// if your server supports it.':'';
  }
  $('pushserver').addEventListener('input',httpWarn);
  $('pushserver').addEventListener('change',httpWarn);
  httpWarn();
  $('pushshow').addEventListener('click',function(){var f=$('pushsecret'), on=(f.type==='password');f.type=on?'text':'password';$('pushshow').setAttribute('aria-label',on?'Hide the passhash':'Show the passhash');});
  new MutationObserver(placePop).observe($('prtgpop'),{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(placePop).observe($('prtgmsg'),{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('resize',placePop);
  $('prtgmsgx').addEventListener('click',function(){$('prtgmsg').hidden=true;$('prtgbar').style.setProperty('--msgH','0px');});
  $('prtgcog').addEventListener('click',function(e){e.stopPropagation();$('prtgpop').hidden=!$('prtgpop').hidden;});
  $('prtgswitch').addEventListener('click',function(e){
    e.stopPropagation();
    var willShow=$('prtgpop').hidden;
    $('prtgpop').hidden=!willShow;
    if(willShow){try{$('pushserver').focus();$('pushserver').select();}catch(err){}}
  });
  $('prtgdisconnect').addEventListener('click',function(e){e.stopPropagation();disconnect();});
  /* read the maps and PRTG's object list again, keeping the login, the chosen map and the canvas */
  $('prtgrefresh').addEventListener('click',function(e){
    e.stopPropagation();
    var b=$('prtgrefresh'), keep=$('pushmap').value;
    if(b.classList.contains('busy')||!(S.maps&&S.objFile))return;
    b.classList.add('busy');b.disabled=true;say('Reading your maps and objects\u2026','');
    http('GET','/api/table.json',{content:'maps',columns:'name,objid'}).then(function(t){
      var j=parseJson(t,'The list of maps'), maps=(j&&j.maps)||[], sel=$('pushmap');
      sel.innerHTML='';
      maps.forEach(function(m){var o=document.createElement('option');o.value=String(m.objid);o.textContent=m.name;sel.appendChild(o);});
      if(keep&&maps.some(function(m){return String(m.objid)===keep;}))sel.value=keep;
      S.maps=maps;
      return http('GET','/api/mapobject.json');
    }).then(function(t){
      var catj=parseJson(t,'The list of object files'), had=S.catalog?S.catalog.length:0;
      S.objFile=findCustomHtml(catj)||S.objFile;S.catalog=parseCatalog(catj);pubObjs();
      PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};
      renderObjList();pickerSync();pvSync();
      say('Refreshed. '+S.maps.length+(S.maps.length===1?' map':' maps')+', '+S.catalog.length+(S.catalog.length===1?' object file':' object files')+(S.catalog.length!==had?' ('+(S.catalog.length>had?'+':'')+(S.catalog.length-had)+').':'.'),'ok');
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      say('Could not refresh: '+((err&&err.message)||'no answer from PRTG')+' Nothing was changed.','err');
    }).then(function(){b.classList.remove('busy');b.disabled=false;updateButtons();swSync();});
  });
  document.addEventListener('click',function(e){var p=$('prtgpop');if(!p.hidden&&!p.classList.contains('gate')&&!(e.target.closest&&e.target.closest('#prtgbar, #prtgpop')))p.hidden=true;});
  swSync();
  window.EXAPI={pvx:pvExtract,state:EX,edit:XE,parse:exParse,headers:exHeaders,load:exLoad,clear:exClear,pick:exPick,label:exLabel};
  /* ---- live previews: PRTG's own drawing of each object, with the target's real data.
     The designer asks /controls/mapobjectpreview.htm and shows the answer inside PRTG's own page. Here the answer goes into a small frame that loads PRTG's own stylesheet
     inside the same wrappers PRTG uses for a map (#mapshow > #mapview), because tables take their look from those. The object's own scripts run, as they do in PRTG;
     PRTG's page scripts are not loaded, so charts PRTG draws with its own plugins (the sparklines) stay empty. */
  var PAD=40, PV={cache:{},pending:{},inflight:{},queue:[],running:0,applied:{}};
  function pvKeyOf(o,mode){return [o.file,o.target,mapId(),(mode||o.mode)==='content'?'natural':(o.w+'x'+o.h)].join('|');}
  function pvOn(){return !!($('objlive').checked)&&!!(S.maps&&S.catalog&&mapId());}
  function pvLayer(){var c=$('dcanvas'),l=$('dprev');if(!l){l=document.createElement('div');l.id='dprev';c.insertBefore(l,c.firstChild);}return l;}
  function pvWrap(id){return pvLayer().querySelector('.dprevitem[data-id="'+id+'"]');}
  /* PRTG's Geo Map is drawn by PRTG's own scripts, which do not run in a preview. Its answer still carries every location and its state, so the box shows them on a plain
     stand-in map (no map tiles), with the markers in whatever style the object's own style block gives them. */
  var PVGEOCSS='#pvhost #map-geomap-box{position:absolute!important;left:0;top:0;right:0;bottom:0;height:auto!important;width:auto!important}'
    +'.gmstand{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;background-color:#e8eff6;background-image:linear-gradient(#d7e2ed 1px,transparent 1px),linear-gradient(90deg,#d7e2ed 1px,transparent 1px);background-size:40px 40px}'
    +'.gmstand .gmcap{position:absolute;left:8px;bottom:6px;font:11px/1.2 "Segoe UI",Arial,sans-serif;color:#6b7a8a}'
    +'.gmstand .map-marker{position:absolute;box-sizing:border-box;width:21px;height:25px;background:#fff;border-left:5px solid #fff;box-shadow:0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)}'
    +'.gmstand .map-marker a{position:absolute;left:0;top:0;width:100%;height:100%;background-position:center;background-repeat:no-repeat;background-size:14px 14px}'
    +'.gmstand .map-marker.up{border-color:#B8C419}.gmstand .map-marker.warn{border-color:#F5C500}.gmstand .map-marker.down{border-color:#E30613}.gmstand .map-marker.downack{border-color:#E67278}.gmstand .map-marker.unusual{border-color:#F59C00}.gmstand .map-marker.paused{border-color:#477EC0}.gmstand .map-marker.unknown{border-color:#878787}';
  function pvGeoState(n){
    n=parseInt(n,10);
    if(n===3)return 'up';if(n===4)return 'warn';if(n===14)return 'downack';if(n===5||n===6||n===13)return 'down';
    if(n===10)return 'unusual';if(n===7||n===8||n===9||n===12)return 'paused';return 'unknown';
  }
  function pvGeoStand(d,box){
    var g=d.getElementById('map-geomap-box'), host, w, j, L, pts=[], x0=1e9, x1=-1e9, y0=1e9, y1=-1e9, i, kx, sx, sy, sc, html='', st, c;
    if(!g)return;
    host=g.querySelector('[data-plugin="geomap"]')||g;
    w=d.createTreeWalker(host,128);
    while(w.nextNode()){
      c=w.currentNode.textContent;
      try{j=JSON.parse(c);if(j&&j.markers){L=j.markers.locationlist;break;}}catch(e){}
    }
    if(!Array.isArray(L))return;
    L.forEach(function(x){
      var cc=x&&x.coordinates, a=null, sty='', k;
      if(!Array.isArray(cc)||cc.length<2||isNaN(Number(cc[0]))||isNaN(Number(cc[1])))return;
      try{k=new DOMParser().parseFromString(String(x.link||''),'text/html');a=k.body.querySelector('a');}catch(e){}
      if(a){sty=(a.getAttribute('style')||'').replace(/"/g,"'");}
      pts.push({x:Number(cc[0]),y:Number(cc[1]),s:pvGeoState(x.state),sty:sty});
    });
    pts.forEach(function(q){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);y0=Math.min(y0,q.y);y1=Math.max(y1,q.y);});
    kx=Math.cos(((y0+y1)/2)*Math.PI/180)||1;
    sx=Math.max((x1-x0)*kx,1e-6);sy=Math.max(y1-y0,1e-6);
    for(i=0;i<pts.length;i++){
      var q=pts[i], fx=(pts.length===1||x1===x0)?0.5:0.12+0.76*((q.x-x0)*kx/sx), fy=(pts.length===1||y1===y0)?0.5:0.12+0.76*((y1-q.y)/sy);
      html+='<div class="map-marker '+q.s+'" style="left:calc('+(fx*100).toFixed(2)+'% - 10px);top:calc('+(fy*100).toFixed(2)+'% - 25px)"><a class="mapmarker" style="'+q.sty+'"></a></div>';
    }
    st=d.createElement('style');st.textContent=PVGEOCSS;
    host.innerHTML='<div class="gmstand">'+html+'<div class="gmcap">'+(pts.length?pts.length+(pts.length===1?' location':' locations'):'No locations')+'. PRTG draws the map tiles on the map itself.</div></div>';
    (box.querySelector('.map_object')||box).insertBefore(st,(box.querySelector('.map_object')||box).firstChild);
  }
  function pvExtract(html){
    var d, box, el, cls, iw, ih;
    try{d=new DOMParser().parseFromString(html,'text/html');}catch(e){return null;}
    box=d.querySelector('.map_objectbox')||d.body;el=box&&box.querySelector('.map_object');
    if(!el)return null;
    cls=(el.getAttribute('class')||'').split(/\s+/);iw=parseInt(el.getAttribute('initialwidth'),10)||0;ih=parseInt(el.getAttribute('initialheight'),10)||0;
    pvGeoStand(d,box);
    return {inner:box.innerHTML,content:cls.indexOf('map_icon')>=0,iw:iw,ih:ih};   /* the status icons (class map_icon) take no size from the map: they are as big as they are drawn */
  }
  /* objects that one of PRTG's own plugins draws (gauges, sunbursts, donuts...) need PRTG's page scripts in their preview, read once per server */
  /* PRTG's page starts its plugins (_Prtg.initPlugins) only inside its own page containers; a preview has to start them itself */
  function pvInitScript(hostId){return '<script>(function(){function go(){try{if(window._Prtg&&_Prtg.initPlugins&&window.jQuery)_Prtg.initPlugins(jQuery("#'+hostId+'"));}catch(e){if(window.console)console.error("Map Studio preview: PRTG plugin",e);}}if(document.readyState==="complete")go();else window.addEventListener("load",go);})();<\/script>';}
  /* PRTG's gauge plugin needs PRTG's whole page around it, which a preview frame does not always manage. The sensor data is in the object
     itself, so when no dial has appeared shortly after the preview loads, this draws the same stand-in dial the Object builder shows
     (d3.gauge.js's geometry) in PRTG's own markup; the object's own script then decorates it as it does on the map. */
  function pvGaugeFallback(){
    var svgSrc=window.PMSTOCKSVG?window.PMSTOCKSVG.toString():'';
    if(!svgSrc)return '';
    return '<script>(function(){var stockSvg='+svgSrc+';'
      +'function esc(t){return String(t==null?"":t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}'
      +'var els=[].slice.call(document.querySelectorAll(\'[data-plugin~="channelgauges"]\')), saved=els.map(function(el){var c=null;for(var n=el.firstChild;n;n=n.nextSibling){if(n.nodeType===8){c=n.nodeValue;break;}}return c;});'
      +'function draw(){els.forEach(function(el,i){if(el.querySelector("svg.gauge")||!saved[i])return;var d;try{d=JSON.parse(saved[i]);}catch(e){return;}'
      +'var o=(d&&d.objects)?d.objects:d, dev=(el.getAttribute("data-type")==="sensors"), mv=el.getAttribute("data-mapview")||"", small=/small/.test(mv), only=/primaryonly/.test(mv), list=(dev?o.sensors:o.channels)||[], big=[], rest=[];'
      +'list.forEach(function(r){var inf=r.info&&r.info.data&&r.info.data[0];if(!inf||!inf.name||inf.show===0||(!dev&&r.condition===false))return;var pr=!!inf.primary||(dev&&Number(r.priority)>4);'
      +'var html="<div class=\\"achannel"+(pr&&!small?" primary":"")+" channeledit\\"><span class=\\"channelname\\">"+esc(dev?(r.sensor||inf.name):inf.name)+"</span><span class=\\"channelgauge\\">"+stockSvg(pr&&!small?220:56,inf)+"</span><span class=\\"channelvalue\\">"+esc(inf.lastvalue||r.lastvalue||"")+"</span></div>";'
      +'if(pr&&!small)big.push(html);else if(!only||(pr&&small))rest.push(html);});'
      +'el.innerHTML="<div class=\\"centered\\">"+big.concat(rest).join("")+"<div style=\\"clear:both\\"></div></div>";el.setAttribute("data-ms-standin","1");});}'
      +'var t=null;function soon(){if(t)return;t=setTimeout(function(){t=null;draw();},700);}'
      +'function later(){setTimeout(draw,1500);if(window.MutationObserver)els.forEach(function(el){new MutationObserver(function(){if(!el.querySelector("svg.gauge"))soon();}).observe(el,{childList:true,subtree:true});});setInterval(draw,4000);}'
      +'if(document.readyState==="complete")later();else window.addEventListener("load",later);'
      +'})();<\/script>';
  }
  function pvNeedsLibs(ent){return /data-plugin=/.test((ent&&ent.inner)||'');}
  function pvDoc(ent,o){
    var origin=(base()||pageOrigin()||''), box=(o.mode!=='content'), w=box?o.w:1400, h=box?o.h:900,
      size=box?('width:'+o.w+'px!important;height:'+o.h+'px!important;'):'';
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><base href="'+origin+'/">'+cssHead(origin)+''
      +'<style>html,body,#mapshow,#mapshow .view,#mapview{margin:0;padding:0;background:transparent!important;box-shadow:none!important;border:0!important}html,body{overflow:hidden}'
      +'#pvhost .map_object{position:absolute!important;left:'+PAD+'px!important;top:'+PAD+'px!important;margin:0!important;'+size+'}</style>'
      +(pvNeedsLibs(ent)?(EX.libs||''):'')
      +'</head><body id="mainbody" data-theme="0" class="language_en"><div id="mapshow"><div class="view" style="position:static;overflow:visible"><div id="mapview" style="position:relative;width:'+(w+2*PAD)+'px;height:'+(h+2*PAD)+'px;overflow:visible"><div id="pvhost">'+ent.inner+'</div></div></div></div>'
      +(pvNeedsLibs(ent)?pvGaugeFallback()+pvInitScript('pvhost'):'')+pvStatusScript(o.id)+'</body></html>';
  }
  /* Neither this page nor the sandbox frame can read inside a preview (both are opaque-origin), so the
     preview reports its own state outward instead: this little script reads the status class PRTG put in
     the markup it is already showing and posts the letter up to the app, over the same channel the
     preview graphs already use. That is what lets a Connector on the canvas show its ends' real colours.
     It runs again shortly after load, because some of PRTG's own scripts set these classes late. */
  function pvStatusScript(id){
    return '<script>(function(){'
      +'var OK=/^(g|r|y|o|b|bl|gr)$/;'
      +'var RK=[["red","r"],["partialred","r"],["yellow","y"],["orange","o"],["blue","b"],["green","g"]];'
      +'function look(){var s="",e,m,i,t,p,c;'
      +'e=document.querySelector(\'[class*="map_iconcolor_sens"]\');'
      +'m=e&&/\\bmap_iconcolor_sens([a-z]+)\\b/.exec(String(e.className||""));'
      +'if(m&&OK.test(m[1]))return m[1];'
      +'e=document.querySelector(\'[class*="map_objectstate_sens"]\');'
      +'m=e&&/\\bmap_objectstate_sens([a-z]+)\\b/.exec(String(e.className||""));'
      +'if(m&&OK.test(m[1]))return m[1];'
      +'e=document.querySelector(\'a[class*="sensorid"]\');'
      +'if(e){p=String(e.className||"").split(/\\s+/);'
      +'for(i=0;i<p.length;i++){t=/^sens([a-z]{1,2})$/.exec(p[i]);if(t&&OK.test(t[1]))return t[1];}}'
      +'e=document.querySelector(\'[class*="map_iconcolor_has"]\');'
      +'if(e){c=" "+String(e.className||"").split(/\\s+/).join(" ")+" ";'
      +'for(i=0;i<RK.length;i++){if(c.indexOf(" map_iconcolor_has"+RK[i][0]+" ")>=0)return RK[i][1];}}'
      +'return s;}'
      +'function seen(){var o=[],h=document.getElementById("pvhost"),a=h?h.querySelectorAll("*"):[],i,j,c,t;'
      +'for(i=0;i<a.length&&o.length<60;i++){c=a[i].className;if(typeof c!=="string")continue;c=c.split(/\\s+/);'
      +'for(j=0;j<c.length&&o.length<60;j++){t=c[j];if(t&&t.length<=40&&/^[\\w-]+$/.test(t)&&o.indexOf(t)<0)o.push(t);}}'
      +'return o;}'
      +'function tell(){try{window.top.postMessage({type:"pm-status",id:'+JSON.stringify(String(id))+',status:look(),seen:seen()},"*");}catch(e){}}'
      +'tell();setTimeout(tell,600);setTimeout(tell,2000);'
      +'})();<\/script>';
  }
  /* the state letter each previewed object reports back from inside its own frame (see preview-sandbox.html),
     keyed by canvas item id; a Connector in status mode paints its ends from these */
  DASHAPI.pvst=DASHAPI.pvst||{};   /* on DASHAPI, not a local: the canvas that paints the lines is a separate closure and reaches it through here */
  function pvStatus(id,letter){
    var k=String(id), v=letter||'';
    if(DASHAPI.pvst[k]===v)return;
    if(v)DASHAPI.pvst[k]=v;else delete DASHAPI.pvst[k];
    DASHAPI.rerender();
  }
  function pvSet(id,st){var cur=DASHAPI.pv[id];if(cur&&cur.state===st.state&&cur.msg===st.msg&&cur.autoContent===st.autoContent)return false;DASHAPI.pv[id]=st;return true;}
  function pvMeasure(id,f){
    try{
      var lay=DASHAPI.objectLayout().filter(function(x){return x.id===id;})[0];if(!lay||lay.mode!=='content')return;
      var inner=f.contentDocument&&f.contentDocument.querySelector('iframe');
      var el=inner&&inner.contentDocument&&inner.contentDocument.querySelector('#pvhost .map_object');if(!el)return;
      var r=el.getBoundingClientRect();
      if(r.width>0&&r.height>0){DASHAPI.setNatural(id,Math.ceil(r.width),Math.ceil(r.height));pvSync();}
    }catch(e){}
  }
  /* how many table rows to ask for: 5, as the designer does, except for objects that count sensors, which need every one */
  function pvCountFor(file){
    var e=(S.catalog||[]).filter(function(x){return x.value===file;})[0], text=(e?e.cat+' '+e.name:'')+' '+String(file||'');
    return (new RegExp(CFG.preview.countPattern,'i').test(text))?CFG.preview.countFull:5;
  }
  /* a preview telling the app what state the object it is showing is in, for the Connectors glued to it */
  window.addEventListener('message',function(e){
    var d=e.data;
    if(!d||d.type!=='pm-status'||!e.source)return;
    if(!fromOwnPreview(e.source))return;                     /* only this page's own preview frames may say */
    if(!/^(g|r|y|o|b|bl|gr)?$/.test(String(d.status==null?'':d.status)))return;
    if(!/^\d{1,9}$/.test(String(d.id)))return;
    pvStatus(d.id,String(d.status==null?'':d.status));
    if(Array.isArray(d.seen)){
      DASHAPI.pvseen[String(d.id)]=d.seen.filter(function(t){return typeof t==='string'&&/^[\w-]{1,40}$/.test(t);}).slice(0,60);
      var n=document.getElementById('dtgtstat');
      if(n&&n.getAttribute('data-id')===String(d.id))n.textContent=DASHAPI.pvstatText(d.id);
    }
  });
  /* what the panel says about the status a preview reported, and the class names it was looking through */
  DASHAPI.pvseen=DASHAPI.pvseen||{};
  DASHAPI.pvstatText=function(id){
    var k=String(id), st=DASHAPI.pvst[k], names={g:'up',r:'down',y:'warning',o:'unusual',b:'paused',bl:'paused',gr:'unknown'}, sn=DASHAPI.pvseen[k];
    if(!sn)return 'Status: waiting for the preview to report.';
    return 'Status read from this preview: '+(st?(names[st]||st):'none found (this object\u2019s markup carries no status class the tool knows)')+'. Class names in the preview: '+(sn.length?sn.join(' '):'(none)');
  };
  /* a graph drawn by the tool asks for its history from inside the preview frame; the tool makes the (read-only) request with its own login and answers */
  window.addEventListener('message',function(e){
    var d=e.data, path, p={}, k, src=e.source, ok={id:/^\d{1,9}$/,avg:/^\d{1,6}$/,usecaption:/^[01]$/,sdate:/^[\d-]{10,24}$/,edate:/^[\d-]{10,24}$/,content:/^channels$/,columns:/^[a-z,_]{1,40}$/};
    if(!d||d.type!=='pm-hist'||!src||typeof d.id!=='string'||!d.params)return;
    if(!fromOwnPreview(src))return;   /* only the content of this page's own preview frames may ask */
    path=d.path;
    if(path!=='/api/historicdata.json'&&path!=='/api/table.json')return;
    for(k in d.params){if(!ok[k]||!ok[k].test(String(d.params[k])))return;p[k]=String(d.params[k]);}
    sampleGet({kind:'history',label:'history',path:path,params:p}).then(function(r){
      var j=null;try{j=JSON.parse(r.body);}catch(x){}
      src.postMessage({type:'pm-hist-r',id:d.id,ok:!!(j&&!r.error&&r.status>=200&&r.status<300),json:j},'*');
    }).catch(function(){try{src.postMessage({type:'pm-hist-r',id:d.id,ok:false},'*');}catch(x){}});
  });
  function pvAsk(o){   /* one request for PRTG's drawing of an object, as the designer makes it */
    return sampleGet({kind:'preview',label:'preview',path:'/controls/mapobjectpreview.htm',
      params:{id:mapId(),count:pvCountFor(o.file),dependency_:o.target,width:o.w,height:o.h,selected:'',mapelements:',*'+o.file+'*',maptitles:',*'+o.name+'*'}}).then(function(r){
      var x;
      if(r.error)return {state:'error',msg:r.error};
      if(r.status===401){authNeeded();return {state:'error',msg:'PRTG asked for a login'};}
      if(r.status<200||r.status>=300)return {state:'error',msg:'PRTG answered '+r.status};
      x=pvExtract(r.body);
      return x?{state:'ok',inner:x.inner,content:x.content,iw:x.iw,ih:x.ih}:{state:'error',msg:'PRTG returned no object for this file'};
    });
  }
  function pvGet(o){   /* o: {file,name,target,w,h,mode}. Cached, and a request already on its way is joined rather than repeated. */
    var key=pvKeyOf(o), p;
    if(PV.cache[key])return Promise.resolve(PV.cache[key]);
    if(PV.inflight[key])return PV.inflight[key];
    p=pvAsk({file:o.file,name:o.name,target:o.target,w:o.w,h:o.h}).then(function(ent){
      PV.cache[key]=ent;
      if(ent.state==='ok'&&ent.content)PV.cache[pvKeyOf(o,'content')]=ent;   /* a status icon needs no second request once we know it is one */
      delete PV.inflight[key];return ent;
    });
    PV.inflight[key]=p;return p;
  }
  function pvRun(job){
    PV.running++;
    pvGet(job.o).then(function(){delete PV.pending[job.key];PV.running--;pvPump();pvSync();});
  }
  function pvPump(){while(PV.running<3&&PV.queue.length)pvRun(PV.queue.shift());}
  function pvSync(){
    var lay=DASHAPI.objectLayout(), on=pvOn(), L=pvLayer(), keep={}, changed=false, i, o, key, ent, w, f, st;
    for(i=0;i<lay.length;i++){
      o=lay[i];
      if(!on){if(DASHAPI.pv[o.id]){delete DASHAPI.pv[o.id];delete DASHAPI.pvst[String(o.id)];changed=true;}continue;}
      key=pvKeyOf(o);ent=PV.cache[key];
      if(!ent){
        if(!PV.pending[key]){PV.pending[key]=1;PV.queue.push({o:o,key:key});}
        if(!DASHAPI.pv[o.id]){DASHAPI.pv[o.id]={state:'loading'};changed=true;}   /* what is showing stays until the new answer arrives */
        if(DASHAPI.pv[o.id].state==='ok'&&pvWrap(o.id))keep[o.id]=1;
        continue;
      }
      if(ent.state==='error'){if(pvSet(o.id,{state:'error',msg:ent.msg}))changed=true;continue;}
      if(pvSet(o.id,{state:'ok',autoContent:!!ent.content}))changed=true;
      if(!PV.applied[o.id]&&o.mode==='box'&&ent.iw&&ent.ih){PV.applied[o.id]=1;if(DASHAPI.applyInitial(o.id,ent.iw,ent.ih))return;}   /* the size the file itself asks for */
      PV.applied[o.id]=1;
      keep[o.id]=1;w=pvWrap(o.id);
      if(!w){
        w=document.createElement('div');w.className='dprevitem';w.setAttribute('data-id',String(o.id));
        f=document.createElement('iframe');f.setAttribute('scrolling','no');f.setAttribute('tabindex','-1');f.setAttribute('aria-hidden','true');
        w.appendChild(f);L.appendChild(w);
      }
      f=w.firstChild;
      if(w.getAttribute('data-key')!==key){
        w.setAttribute('data-key',key);
        if(pvNeedsLibs(ent)&&EX.libsFor!==(base()||pageOrigin()||'')&&!PV.libWait){
          PV.libWait=exLibs().then(function(){PV.libWait=null;[].forEach.call(pvLayer().querySelectorAll('.dprevitem'),function(x){x.removeAttribute('data-key');});pvSync();},function(){PV.libWait=null;});
        }
        (function(id,fr,entc,oc){setFramePreview(fr,pvDoc(entc,oc),{allowScripts:true,allowSameOrigin:true},function(){pvMeasure(id,fr);setTimeout(function(){pvMeasure(id,fr);},500);});})(o.id,f,ent,o);
      }
      w.style.left=o.x+'px';w.style.top=o.y+'px';w.style.zIndex=String(o.z);
      f.style.left=(-PAD)+'px';f.style.top=(-PAD)+'px';f.style.width=(o.w+2*PAD)+'px';f.style.height=(o.h+2*PAD)+'px';
    }
    st=L.querySelectorAll('.dprevitem');
    for(i=0;i<st.length;i++){if(!keep[st[i].getAttribute('data-id')]&&!keep[parseInt(st[i].getAttribute('data-id'),10)])st[i].parentNode.removeChild(st[i]);}
    pvPump();
    $('objlivego').disabled=!pvOn();
    if(changed)DASHAPI.rerender();
  }
  /* ---- the object list: grouped by category, with PRTG's drawing of the highlighted entry, and drag and drop ---- */
  var objShown=[], tgtShown=[], OBJSEL='', OBJG={cat:'',ms:false}, PICK={mode:'item',sel:null}, PP={tok:0,timer:null};
  var TILE={el:{},of:{},cats:{},src:null};   /* the list rows: the node and entry for each file, kept so a redraw reuses them */
  var DEF={gUser:null,sUser:null,sAuto:null,dAuto:null,gAuto:null,looking:false}, BUILTIN_G={id:1,name:'Local Probe'};   /* PRTG's Local Probe is always object 1 */
  var SENSOR_FILES=["An Icon A9.htm", "An Icon B1.htm", "An Icon B1_xl.htm", "An Icon C1.htm", "An icon AA.htm", "Gauges Sensor Primary small.htm", "Gauges Sensor Primary.htm", "Gauges Sensor small.htm", "Gauges Sensor.htm", "customStatusDot-SensorLED.htm", "graph large 0.htm", "graph small 0.htm", "graph tiny 0.htm", "graph toplist.htm", "graph without text 0.htm", "messageonly_on_transparent.htm", "messageonly_on_white.htm", "messageonly_related_background.htm", "tablechannels.htm", "tabletoplist.htm", "trafficlight.htm"];   /* the stock object files that only take a sensor, read from PRTG's own mapobjects folder */
  try{var og_=JSON.parse(localStorage.getItem(CFG.keys.objGroups)||'{}')||{};OBJG.cat=typeof og_.cat==='string'?og_.cat:'';OBJG.ms=!!og_.ms;}catch(e){OBJG.cat='';OBJG.ms=false;}
  function objGroupsSave(){try{localStorage.setItem(CFG.keys.objGroups,JSON.stringify({cat:OBJG.cat,ms:OBJG.ms}));}catch(e){}}
  function selEntry(){var i;if(!S.catalog||!OBJSEL)return null;for(i=0;i<S.catalog.length;i++)if(S.catalog[i].value===OBJSEL)return S.catalog[i];return null;}
  /* what an object reads from: a sensor, or a group, device or probe. Your own files say so in their code; PRTG's stock files are known; anything else is tried as a group first. */
  function kindStore(){try{return JSON.parse(localStorage.getItem(CFG.keys.kindOf)||'{}')||{};}catch(e){return {};}}
  function libCodeFor(e){var lib=libLoad(), k=keyOf(e.cat,e.name), f;for(f in lib)if(keyOf(lib[f].cat,lib[f].name)===k)return lib[f].code;return null;}
  /* Which single kind of object a file is best started on: PRTG's own declaration where the file carries
     one, else the known stock lists. PRTG's vocabulary here is probenode, group, device and sensor, and a
     file may name several -- our own generated objects declare "probenode,group,device". A file that
     names several is matched to the most specific of them, device before group before probe, so a tile
     that can read any of the three starts on a real device rather than on the Local Probe. */
  function kindOf(e){
    var ov=kindStore()[e.value], code, m, ts, has;
    if(ov==='p'||ov==='g'||ov==='d'||ov==='s')return ov;
    code=libCodeFor(e);
    if(code){
      m=/<#checkobjecttype[^>]*objecttype="([^"]*)"/.exec(code);
      if(m){
        ts=m[1].toLowerCase().split(/\s*,\s*/);
        has=function(x){return ts.indexOf(x)>=0;};
        if(ts.length===1&&has('sensor'))return 's';   /* only a sensor will do */
        if(has('device'))return 'd';
        if(has('group'))return 'g';
        if(has('probenode'))return 'p';
        if(has('sensor'))return 's';
      }
    }
    if(SENSOR_FILES.indexOf(e.value)>=0)return 's';
    if(/^graphs$/i.test(e.cat))return 's';
    return 'd';   /* the stock files take a probe, group or device; a device is the most specific of those */
  }
  var KINDNAME={p:'probe',g:'group',d:'device',s:'sensor'};
  function defFor(kind){
    if(kind==='s')return DEF.sUser||DEF.sAuto||null;
    if(DEF.gUser)return DEF.gUser;                        /* one chosen default stands in for every non-sensor kind */
    if(kind==='d')return DEF.dAuto||DEF.gAuto||BUILTIN_G;
    if(kind==='g')return DEF.gAuto||BUILTIN_G;
    return BUILTIN_G;                                      /* a probe: PRTG's Local Probe is always there */
  }
  function defKey(){return CFG.keys.previewWith+'|'+(base()||pageOrigin()||'');}
  function defSave(){try{localStorage.setItem(defKey(),JSON.stringify({g:DEF.gUser,s:DEF.sUser}));}catch(e){}}
  function defShow(){
    var on=!!S.catalog, g=defFor('d'), s=defFor('s');
    var gsrc=DEF.gUser?'':((DEF.dAuto||DEF.gAuto)?' (found automatically)':' (built in)');
    $('defgname').textContent=on?((g?g.name:'\u2013')+gsrc):'\u2013';
    $('defsname').textContent=on?(s?(s.name+(DEF.sUser?'':' (found automatically)')):(DEF.looking?'looking\u2026':'none found')):'\u2013';
    ['defgchange','defschange','defreset'].forEach(function(id){$(id).disabled=!on;});
  }
  /* the sensor to preview with: PRTG's own Probe Health or Core Health sensor if there is one, else the first sensor there is */
  function resolveDefaults(){
    var sv={}, tries=['Probe Health','Core Health',''], i=0, pending=0;
    try{sv=JSON.parse(localStorage.getItem(defKey())||'{}')||{};}catch(e){}
    DEF.gUser=sv.g||null;DEF.sUser=sv.s||null;DEF.sAuto=null;DEF.dAuto=null;DEF.gAuto=null;
    if(!S.catalog){DEF.looking=false;defShow();pvPaneShow();return;}
    DEF.looking=true;defShow();
    function done(){if(--pending<=0){DEF.looking=false;defShow();pvPaneShow();}}
    /* the first device and the first group this server has, so an object that reads one of those starts on
       something of its own kind instead of on the Local Probe */
    function firstOf(type,set){
      pending++;
      http('GET','/api/table.json',{content:type,columns:tgtColumns(type),count:1}).then(function(t){
        var j=parseJson(t,'The '+type+' list'), a=(j&&j[type])||[];
        if(a.length)set({id:a[0].objid,name:tgtLabel(type,a[0])});
        done();
      },function(){done();});
    }
    function nextSensor(){
      var nm, p;
      if(i>=tries.length){done();return;}
      nm=tries[i++];p={content:'sensors',columns:tgtColumns('sensors'),count:1};if(nm)p.filter_name='@sub('+nm+')';
      http('GET','/api/table.json',p).then(function(t){
        var j=parseJson(t,'The sensor list'), a=(j&&j.sensors)||[];
        if(a.length){DEF.sAuto={id:a[0].objid,name:tgtLabel('sensors',a[0])};done();}
        else nextSensor();
      },function(){nextSensor();});
    }
    if(!DEF.gUser){firstOf('devices',function(v){DEF.dAuto=v;});firstOf('groups',function(v){DEF.gAuto=v;});}
    if(!DEF.sUser){pending++;nextSensor();}
    if(!pending){DEF.looking=false;defShow();pvPaneShow();}
  }
  function objVisible(){return objShown.filter(function(x){return !x.el.hidden;});}
  function objSelect(value,scroll){
    var els=$('objlist').querySelectorAll('.objrow'), i, el=null, on;
    OBJSEL=value||'';
    for(i=0;i<els.length;i++){on=els[i].getAttribute('data-value')===OBJSEL;els[i].classList.toggle('on',on);els[i].setAttribute('aria-selected',on?'true':'false');if(on)el=els[i];}
    $('objadd').disabled=!(el&&!el.hidden);
    if(el&&scroll)el.scrollIntoView({block:'nearest'});
    pvPaneSchedule();
  }
  /* ---- the object list: a pinned row of category buttons, one open at a time, over a grid of PRTG's own
     drawing of each object. A preview costs one request, so a tile asks for its own only when it scrolls
     into view, and the answers are shared with the big preview below (same size, same cache key). ---- */
  function isMS(c){return /^map-studio[-_]/i.test(String(c.value||''))||/^map\s*studio\b/i.test(String(c.name||''));}
  function objLabel(c){var n=String(c.name||'');return isMS(c)?(n.replace(/^map\s*studio\s*[-–—:]?\s*/i,'')||n):n;}
  function msAny(){return !!(S.catalog&&S.catalog.some(isMS));}
  /* One drawing at a time. Each entry is a plain row; PRTG draws only the object you pick, in the single
     pane below. A drawing is two nested documents that parse PRTG's whole stylesheet and run PRTG's own
     scripts, so a gridful of them held tens of live documents open at once and brought the machine down.
     A row costs nothing, and a built-in icon shows its own picture file, which is one static image. */
  function objRowIcon(el,c){
    var box=el.querySelector('.rthumb'), origin=(base()||pageOrigin()||''), p=String(c.value||''), img;
    if(!box||!p||box.firstChild)return;
    img=document.createElement('img');img.alt='';img.setAttribute('aria-hidden','true');
    img.addEventListener('error',function(){if(img.parentNode)img.parentNode.removeChild(img);});
    box.appendChild(img);
    img.src=origin+(/%[0-9a-f]{2}/i.test(p)?p:encodeURI(p));
  }
  /* a category loads its icon pictures the first time it is opened, not before */
  function objPrime(cat){
    var blk=TILE.cats[cat];
    if(!blk||blk.getAttribute('data-primed'))return;
    blk.setAttribute('data-primed','1');
    [].forEach.call(blk.querySelectorAll('.objrow'),function(el){
      var c=TILE.of[el.getAttribute('data-value')];
      if(c&&c.icon)objRowIcon(el,c);
    });
  }
  function objRow(c,isMine){
    var el=TILE.el[c.value], nm;
    TILE.of[c.value]=c;
    if(el){el.classList.toggle('mine',!!isMine);return el;}
    el=document.createElement('div');
    el.className='objrow'+(isMine?' mine':'')+(c.icon?' hasico':'');
    el.setAttribute('role','option');el.setAttribute('draggable','true');
    el.setAttribute('data-value',c.value);el.setAttribute('data-label',c.cat+': '+c.name);el.setAttribute('data-cat',c.cat);
    el.innerHTML='<span class="rthumb"></span><span class="nm"></span>'+(isMS(c)?'<span class="rms">MS</span>':'')+(isMine?'<span class="yours">(yours)</span>':'');
    nm=el.querySelector('.nm');nm.textContent=objLabel(c);
    el.title=c.cat+': '+c.name+(isMS(c)?' \u2014 built with Map Studio':'')+(isMine?' \u2014 yours':'');
    el.addEventListener('click',function(){objSelect(c.value,false);});
    el.addEventListener('dblclick',objAdd);
    el.addEventListener('dragstart',function(ev){objDragStart(ev,c);});
    TILE.el[c.value]=el;
    return el;
  }
  /* the category buttons stay in view while the panel scrolls, just under the Build tiles that stick above them */
  function chipTop(){
    var b=document.querySelector('#dpane-add > .secfs'), c=$('objchips'), h=0;
    if(!b||!c)return;
    try{if(getComputedStyle(b).position==='sticky')h=b.getBoundingClientRect().height;}catch(e){}
    if(h>0)document.documentElement.style.setProperty('--tbh',Math.round(h)+'px');
    c.style.top='';   /* the offset is in CSS: header height plus tools height */
  }
  window.addEventListener('resize',chipTop);
  document.addEventListener('secopen',chipTop);
  /* after a different category is picked, bring its rows out from under the pinned buttons */
  function objListInView(){
    var c=$('objchips'), l=$('objlist'), p=c&&c.parentNode, cr, lr, d;
    if(!c||!l)return;
    try{
      while(p&&p!==document.body&&!(p.scrollHeight>p.clientHeight+5&&/auto|scroll/.test(getComputedStyle(p).overflowY)))p=p.parentNode;
      if(!p||p===document.body)return;
      cr=c.getBoundingClientRect();lr=l.getBoundingClientRect();
      d=cr.bottom-lr.top;
      if(d>0)p.scrollTop-=d+4;
    }catch(e){}
  }
  /* every category keeps its own block of rows, and a switch only hides and shows them */
  function objCatBlock(cat){
    var b=TILE.cats[cat], cap, grid;
    if(b)return b;
    b=document.createElement('div');b.className='ocat';b.setAttribute('data-cat',cat);
    cap=document.createElement('div');cap.className='ocaption';cap.textContent=cat;cap.hidden=true;b.appendChild(cap);
    grid=document.createElement('div');grid.className='ogrid';b.appendChild(grid);
    TILE.cats[cat]=b;$('ocats').appendChild(b);
    return b;
  }
  function objListFrame(){
    var box=$('objlist'), d;
    if(box.querySelector('#ocats'))return;
    box.innerHTML='';
    d=document.createElement('div');d.id='ocats';box.appendChild(d);
    d=document.createElement('div');d.className='objnone';d.hidden=true;box.appendChild(d);
    d=document.createElement('p');d.className='note ohint';box.appendChild(d);
  }
  function renderObjList(){
    var box=$('objlist'), q=String($('objsearch').value||'').trim().toLowerCase(), lib=libLoad(), mine={}, n=$('objmine'),
        top=box.scrollTop, cats=[], by={}, on=!!S.catalog, chips=$('chiprow'), msb=$('msonly'), msOnly=!!OBJG.ms, missing;
    if(TILE.src!==S.catalog){
      TILE.src=S.catalog;TILE.el={};TILE.of={};TILE.cats={};
      box.innerHTML='';
    }
    objListFrame();
    Object.keys(lib).forEach(function(f){mine[keyOf(lib[f].cat,lib[f].name)]=f;});
    objShown=[];
    $('objsearch').disabled=!on;box.classList.toggle('off',!on);box.setAttribute('aria-disabled',on?'false':'true');$('objadd').disabled=true;
    $('objchips').classList.toggle('off',!on);
    defShow();
    if(!on){n.hidden=true;chips.innerHTML='';msb.hidden=true;pvPaneShow();return;}
    msb.hidden=!msAny();
    if(msb.hidden&&msOnly){msOnly=false;OBJG.ms=false;objGroupsSave();}
    $('objmsonly').checked=msOnly;
    S.catalog.forEach(function(c){
      if(msOnly&&!isMS(c))return;
      if(!by[c.cat]){by[c.cat]=[];cats.push(c.cat);}
      by[c.cat].push(c);
    });
    if(cats.indexOf(OBJG.cat)<0)OBJG.cat=cats[0]||'';      /* the one kept from last time, while it is still here */
    chips.innerHTML='';
    cats.forEach(function(cat){
      var b=document.createElement('button'), open=(cat===OBJG.cat&&!q);
      b.type='button';b.className='ochip'+(open?' on':'');b.setAttribute('data-cat',cat);
      b.setAttribute('role','tab');b.setAttribute('aria-selected',open?'true':'false');
      b.innerHTML='<span class="cn"></span><b></b>';
      b.querySelector('.cn').textContent=cat;b.querySelector('b').textContent=by[cat].length;
      b.title=cat+' — '+by[cat].length+' object'+(by[cat].length===1?'':'s');
      b.addEventListener('click',function(){
        if($('objsearch').value){$('objsearch').value='';}
        OBJG.cat=cat;objGroupsSave();renderObjList();$('objlist').scrollTop=0;objListInView();
      });
      chips.appendChild(b);
    });
    /* each category's rows are made once and then stay put */
    cats.forEach(function(cat){
      var grid=objCatBlock(cat).querySelector('.ogrid');
      by[cat].forEach(function(c){
        var el=objRow(c,!!mine[keyOf(c.cat,c.name)]);
        if(el.parentNode!==grid)grid.appendChild(el);
      });
    });
    Object.keys(TILE.cats).forEach(function(k){TILE.cats[k].hidden=true;});
    cats.forEach(function(cat){
      var blk=TILE.cats[cat], any=false;
      blk.querySelector('.ocaption').hidden=!q;      /* while searching, each group says which category it is */
      [].forEach.call(blk.querySelectorAll('.objrow'),function(el){
        var c=TILE.of[el.getAttribute('data-value')], vis;
        vis=!!c&&(!msOnly||isMS(c))&&(q?((c.cat+': '+c.name).toLowerCase().indexOf(q)>=0):(cat===OBJG.cat));
        el.hidden=!vis;
        if(vis){any=true;objShown.push({c:c,el:el});}
      });
      blk.hidden=!any;
      if(any)objPrime(cat);
    });
    if(OBJSEL&&!objShown.some(function(x){return x.c.value===OBJSEL;}))OBJSEL='';
    box.querySelector('.objnone').textContent=!S.catalog.length?'PRTG lists no object files':(q?'No object matches':(msOnly?'Nothing here was built with Map Studio':'This category is empty'));
    box.querySelector('.objnone').hidden=!!objShown.length;
    box.querySelector('.ohint').textContent=q?(objShown.length+' match'+(objShown.length===1?'':'es')+' in every category.')
      :(objShown.length?(OBJG.cat+' · '+objShown.length+' object'+(objShown.length===1?'':'s')+'.'):'');
    missing=Object.keys(lib).filter(function(f){return !S.catalog.some(function(c){return keyOf(c.cat,c.name)===keyOf(lib[f].cat,lib[f].name);});});
    if(missing.length){
      n.hidden=false;n.className='note pst err';
      n.textContent='Not in PRTG yet: '+missing.map(function(f){return f+' ('+lib[f].cat+': '+lib[f].name+')';}).join(', ')+'. Copy '+(missing.length===1?'the file':'the files')+' into PRTG’s mapobjects folder (Download ZIP in the Object builder tab gives you a zip), then press Connect again.';
    }else if(Object.keys(lib).length){n.hidden=false;n.className='note pst ok';n.textContent='Every object you designed here is in PRTG’s list.';}
    else n.hidden=true;
    box.scrollTop=top;
    chipTop();
    objSelect(OBJSEL,false);
  }
  function objAdd(){
    var c=selEntry(), tg;
    if(!c)return;
    tg=defFor(kindOf(c));
    DASHAPI.addObject({cat:c.cat,name:c.name,value:c.value,target:tg?{id:tg.id,name:tg.name}:null});   /* it starts with the preview default, so it shows data straight away */
  }
  function objDragStart(ev,c){
    var tg=defFor(kindOf(c)), g=document.createElement('div');
    ev.dataTransfer.setData('application/x-prtg-object',JSON.stringify({cat:c.cat,name:c.name,value:c.value,target:tg?{id:tg.id,name:tg.name}:null}));
    ev.dataTransfer.setData('text/plain',c.cat+': '+c.name);ev.dataTransfer.effectAllowed='copy';
    objSelect(c.value,false);
    g.textContent=c.name;g.style.cssText='position:absolute;top:-1000px;left:0;padding:6px 10px;background:#007db8;color:#fff;font:12px sans-serif;border-radius:4px';document.body.appendChild(g);
    try{ev.dataTransfer.setDragImage(g,10,10);}catch(x){}
    setTimeout(function(){if(g.parentNode)g.parentNode.removeChild(g);},0);
  }
  $('objpvbox').setAttribute('draggable','true');$('objpvbox').title='Drag onto the canvas to add it';
  $('objpvbox').addEventListener('dragstart',function(ev){
    var c=(S.catalog||[]).filter(function(e){return e.value===OBJSEL;})[0];
    if(!c){ev.preventDefault();return;}
    objDragStart(ev,c);
  });
  function isObjDrag(e){var t=e.dataTransfer&&e.dataTransfer.types;return !!t&&Array.prototype.indexOf.call(t,'application/x-prtg-object')>=0;}
  /* ---- PRTG's drawing of the highlighted entry, scaled to fit under the list ---- */
  function pvPaneClear(){var f=$('objpvframe');f.removeAttribute('data-fit');PP.last=null;f.removeAttribute('src');}
  function pvPaneSchedule(){clearTimeout(PP.timer);PP.timer=setTimeout(pvPaneShow,200);}
  function pvPaneShow(){
    var e=selEntry(), pane=$('objpv'), msg=$('objpvmsg'), kind, tg, tok;
    if(!e||!S.catalog){pane.hidden=true;return;}
    pane.hidden=false;kind=kindOf(e);tg=defFor(kind);tok=++PP.tok;
    $('objpvkind').value=kind;$('objpvcap').textContent=e.cat+': '+e.name;
    if(!pvOn()){msg.className='note pst';msg.textContent=$('objlive').checked?'Choose a map under Existing PRTG maps (Add tab) to see previews.':'Previews are switched off.';pvPaneClear();return;}
    if(!tg){msg.className='note pst err';msg.textContent='No default sensor was found on this server. Choose one with Change\u2026 above.';pvPaneClear();return;}
    msg.className='note pst';msg.textContent='Loading PRTG\u2019s drawing\u2026';
    pvPaneAsk(e,tg,320,200,tok);
  }
  function pvPaneAsk(e,tg,w,h,tok){
    var o={file:e.value,name:e.name,target:tg.id,w:w,h:h,mode:'box'};   /* the same request the canvas makes, so an object costs one request, not two */
    function go(ent){
      var msg=$('objpvmsg');
      if(tok!==PP.tok)return;
      if(ent.state!=='ok'){msg.className='note pst err';msg.textContent='No preview: '+ent.msg+'.';pvPaneClear();return;}
      if(!ent.content&&ent.iw&&ent.ih&&(ent.iw!==w||ent.ih!==h)){pvPaneAsk(e,tg,ent.iw,ent.ih,tok);return;}   /* the size the file itself asks for */
      msg.className='note pst';msg.textContent='Shown with '+tg.name+(ent.content?'.':(', at '+w+' \u00D7 '+h+'.'));
      pvPaneRender(ent,w,h);
    }
    pvGet(o).then(go);
  }
  function pvPaneRender(ent,w,h){
    var f=$('objpvframe'), o={mode:ent.content?'content':'box',w:w,h:h};
    f.removeAttribute('data-fit');PP.last=o;
    setFramePreview(f,pvDoc(ent,o),{allowScripts:true,allowSameOrigin:true},function(){pvPaneFit(o);setTimeout(function(){pvPaneFit(o);},400);});
  }
  function pvPaneFit(o){
    var f=$('objpvframe'), box=$('objpvbox'), ow=o.w, oh=o.h, el, r, s, bw=box.clientWidth, bh=box.clientHeight, inner;
    try{
      if(o.mode==='content'){inner=f.contentDocument&&f.contentDocument.querySelector('iframe');el=inner&&inner.contentDocument&&inner.contentDocument.querySelector('#pvhost .map_object');if(!el)return;r=el.getBoundingClientRect();if(r.width>0&&r.height>0){ow=Math.ceil(r.width);oh=Math.ceil(r.height);}}
    }catch(e){return;}
    s=Math.min(1,(bw-16)/ow,(bh-16)/oh);if(!(s>0))s=1;
    f.style.width=(ow+2*PAD)+'px';f.style.height=(oh+2*PAD)+'px';f.style.transform='scale('+s+')';
    f.style.left=((bw-ow*s)/2-PAD*s)+'px';f.style.top=((bh-oh*s)/2-PAD*s)+'px';
    f.setAttribute('data-fit',ow+'x'+oh+'@'+s.toFixed(3));
  }
  function tgtLabel(type,r){
    if(type==='devices')return (r.device||('Device '+r.objid))+(r.group?' ('+r.group+')':'');
    if(type==='groups')return (r.group||('Group '+r.objid))+(r.probe?' ('+r.probe+')':'');
    return (r.sensor||('Sensor '+r.objid))+(r.device?' on '+r.device:'');
  }
  function tgtColumns(type){return type==='devices'?'objid,probe,group,device':(type==='groups'?'objid,probe,group':'objid,device,sensor');}
  function tgtRender(){
    var type=$('tgttype').value, a=S.tgt[type]||[], q=String($('tgtsearch').value||'').trim().toLowerCase(), box=$('tgtlist');
    box.innerHTML='';tgtShown=[];
    a.forEach(function(r){
      var l=tgtLabel(type,r);
      if(q&&l.toLowerCase().indexOf(q)<0)return;
      if(tgtShown.length>=300)return;
      var o=document.createElement('option');o.value=String(tgtShown.length);o.textContent=l+'  [ID '+r.objid+']';box.appendChild(o);tgtShown.push({id:r.objid,name:l});
    });
    $('tgtuse').disabled=true;
    var m=$('tgtmsg');m.className='note pst';
    m.textContent=a.length?(tgtShown.length+(tgtShown.length>=300?'+':'')+' shown of '+a.length+'. Pick one and press Use as target.'):'PRTG returned no '+type+'.';
  }
  /* ---- the target picker: PRTG's device tree (or a plain list), and dragging a target onto an object ----
     The tree comes from /api/tree.json, the call the map designer's own device tree makes (probes, groups and devices, with the root).
     PRTG's tree has no sensors, so a device's sensors are fetched when you open it. */
  var TGT={view:'tree'}, TR={nodes:{},roots:[],loaded:false,loading:false,failed:false,err:null,sel:null,q:'',hits:[],hitTok:0,hitTimer:null};
  var TYPEGLYPH={probe:'\u25C9',group:'\u25A3',device:'\u25AD',sensor:'\u25CF'};
  try{if(localStorage.getItem(CFG.keys.pickerView)==='list')TGT.view='list';}catch(e){}
  function trReset(){TR={nodes:{},roots:[],loaded:false,loading:false,failed:false,err:null,sel:null,q:TR.q||'',hits:[],hitTok:0,hitTimer:null};}
  function trStrip(t){return String(t==null?'':t).replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').trim();}
  function trType(raw){var t=String(raw||'').toLowerCase();if(t.indexOf('sensor')>=0)return 'sensor';if(t==='probe'||t==='probenode')return 'probe';if(t.indexOf('device')>=0)return 'device';return 'group';}
  /* the tree as jstree takes it: nodes with data (the title), attr (objid, type) and children */
  function trParse(j){
    var list=Array.isArray(j)?j:((j&&Array.isArray(j.children))?j.children:((j&&Array.isArray(j.nodes))?j.nodes:((j&&Array.isArray(j.tree))?j.tree:null))), nodes={}, count=0, roots;
    if(!list&&j&&typeof j==='object'&&(j.data||j.attr))list=[j];
    if(!list)return null;
    function walk(arr,parent,depth){
      var ids=[];
      arr.forEach(function(n){
        var a=(n&&n.attr)||{}, md=(n&&n.metadata)||{}, raw, id, title, node;
        if(!n)return;
        raw=(a.objid!=null)?a.objid:((md.objid!=null)?md.objid:n.objid);id=parseInt(raw,10);
        if(isNaN(id))return;
        title=(typeof n.data==='string')?n.data:((n.data&&(n.data.title||n.data.name))||n.title||n.name||'');
        node={id:id,type:trType(a.type||a.rel||md.type||n.type),name:trStrip(title)||('Object '+id),parent:parent,children:[],open:(n.state==='open')||depth===0,sensorsLoaded:false};
        nodes[id]=node;count++;ids.push(id);
        if(Array.isArray(n.children)&&n.children.length){node.children=walk(n.children,id,depth+1);if(node.children.some(function(c){return nodes[c]&&nodes[c].type==='sensor';}))node.sensorsLoaded=true;}
      });
      return ids;
    }
    roots=walk(list,null,0);
    return count?{nodes:nodes,roots:roots}:null;
  }
  function trLabel(n){   /* the same words the plain list uses: device (group), sensor on device */
    var p=(n.parent!=null)?TR.nodes[n.parent]:null;
    if(n.label)return n.label;
    if(n.type==='device'&&p&&p.type==='group'&&p.id!==0)return n.name+' ('+p.name+')';
    if(n.type==='sensor'&&p)return n.name+' on '+p.name;
    return n.name;
  }
  function trCanOpen(n){return n.children.length>0||(n.type==='device'&&!n.sensorsLoaded&&!n.hit);}
  function trValid(n){if(PICK.mode==='g')return n.type!=='sensor';if(PICK.mode==='s')return n.type==='sensor';return true;}
  function trMatches(q){var m={}, k, n, c;for(k in TR.nodes){n=TR.nodes[k];if(n.name.toLowerCase().indexOf(q)>=0){c=n;while(c){m[c.id]=1;c=(c.parent!=null)?TR.nodes[c.parent]:null;}}}return m;}
  function trVisible(){
    var out=[], q=TR.q.toLowerCase(), m=q?trMatches(q):null;
    function walk(id,depth){
      var n=TR.nodes[id];
      if(!n||(m&&!m[id]))return;
      out.push({n:n,depth:depth});
      if(m||n.open){
        n.children.forEach(function(c){walk(c,depth+1);});
        if(!m&&n.open&&n.type==='device'){
          if(n.sensorsLoading)out.push({note:'loading sensors\u2026',depth:depth+1});
          else if(n.sensorErr)out.push({note:n.sensorErr,depth:depth+1,err:true});
          else if(n.sensorsLoaded&&!n.children.length)out.push({note:'no sensors',depth:depth+1});
        }
      }
    }
    TR.roots.forEach(function(id){walk(id,0);});
    return out;
  }
  function trNote(text,depth,err){var el=document.createElement('div');el.className='trnote'+(err?' err':'');el.style.paddingLeft=(24+depth*14)+'px';el.textContent=text;return el;}
  /* a very small dot at the start of each row: PRTG's status number, read from the object tables */
  var TRSTATE={3:'up',4:'warn',5:'down',13:'down',14:'down',10:'warn',7:'off',8:'off',9:'off',12:'off'};
  function trDot(st){return (st==null||isNaN(st))?'':' sd-'+(TRSTATE[st]||'un');}
  function trNum(v){var x=parseInt(v,10);return isNaN(x)?null:x;}
  function trLoadStatus(){
    var jobs;
    if(TR.stLoading||!TR.loaded)return;
    TR.stLoading=true;
    jobs=['devices','groups','probenodes'].map(function(c){
      return http('GET','/api/table.json',{content:c,columns:'objid,status_raw',count:100000}).then(function(t){
        var j=parseJson(t,'The status of the '+c), a=j[c], k;
        if(!Array.isArray(a)){for(k in j){if(Array.isArray(j[k])){a=j[k];break;}}}
        (a||[]).forEach(function(r){var n=TR.nodes[parseInt(r.objid,10)];if(n)n.st=trNum(r.status_raw);});
      },function(){});
    });
    Promise.all(jobs).then(function(){
      var parents={}, ps;
      /* sensors that came with the tree itself: one read per device that holds them */
      Object.keys(TR.nodes).forEach(function(k){var n=TR.nodes[k];if(n.type==='sensor'&&n.st==null&&n.parent!=null)parents[n.parent]=1;});
      ps=Object.keys(parents).slice(0,20).map(function(pid){
        return http('GET','/api/table.json',{content:'sensors',id:pid,columns:'objid,status_raw',count:500}).then(function(t){
          ((parseJson(t,'The sensor status').sensors)||[]).forEach(function(r){var n=TR.nodes[parseInt(r.objid,10)];if(n)n.st=trNum(r.status_raw);});
        },function(){});
      });
      return Promise.all(ps);
    }).then(function(){TR.stLoading=false;TR.stAt=Date.now();trRender();});
  }
  function trRow(n,depth){
    var el=document.createElement('div'), open=!!n.open&&!TR.q, can=trCanOpen(n)&&!TR.q;
    el.className='trn'+(TR.sel&&TR.sel.id===n.id?' on':'')+(trValid(n)?'':' bad');el.setAttribute('role','treeitem');el.setAttribute('data-id',String(n.id));el.setAttribute('data-type',n.type);el.setAttribute('draggable','true');
    el.style.paddingLeft=(6+depth*14)+'px';
    el.innerHTML='<span class="sd'+trDot(n.st)+'"></span><span class="tw">'+(can?(open?'\u25BE':'\u25B8'):'')+'</span><span class="ti t-'+n.type+'"></span><span class="tl"></span>';
    el.querySelector('.ti').textContent=TYPEGLYPH[n.type]||'';el.querySelector('.ti').title=n.type;
    el.querySelector('.tl').textContent=n.hit?trLabel(n):n.name;el.title=trLabel(n)+'  ['+n.type+', ID '+n.id+']';
    if(can)el.setAttribute('aria-expanded',open?'true':'false');
    el.querySelector('.tw').addEventListener('click',function(ev){ev.stopPropagation();if(can)trToggle(n);});
    el.addEventListener('click',function(){trSelect(n);});
    el.addEventListener('dblclick',function(){if(can)trToggle(n);else tgtUse();});
    el.addEventListener('dragstart',function(ev){trDragStart(ev,n,el);});
    return el;
  }
  function trRender(){
    var box=$('tgttree'), top=box.scrollTop, vis, h;
    if(TGT.view!=='tree')return;
    box.innerHTML='';
    if(!TR.loaded){box.appendChild(trNote(TR.loading?'Loading the device tree\u2026':'Connect to load the device tree.',0));trUseState();return;}
    vis=trVisible();
    vis.forEach(function(v){box.appendChild(v.note?trNote(v.note,v.depth,v.err):trRow(v.n,v.depth));});
    if(TR.q&&!vis.length&&!TR.hits.length)box.appendChild(trNote('Nothing in the tree matches. Sensors are searched too, as you type.',0));
    if(TR.q&&TR.hits.length){h=document.createElement('div');h.className='trhead';h.textContent='Sensors matching \u201C'+TR.q+'\u201D';box.appendChild(h);TR.hits.forEach(function(n){box.appendChild(trRow(n,0));});}
    box.scrollTop=top;trUseState();
    if(TR.loaded&&!TR.stLoading&&(!TR.stAt||Date.now()-TR.stAt>CFG.tree.statusEvery))trLoadStatus();
  }
  function trUseState(){
    var sel=DASHAPI.selected(), good=!!TR.sel&&trValid(TR.sel)&&(PICK.mode!=='item'||!!(sel&&sel.type==='prtgobj'));
    if(TGT.view==='tree')$('tgtuse').disabled=!good;
  }
  function trSelect(n){TR.sel=n;trRender();}
  function trToggle(n){
    n.open=!n.open;
    if(n.open&&n.type==='device'&&!n.sensorsLoaded)trLoadSensors(n);
    trRender();
  }
  function trLoadSensors(n){
    if(n.sensorsLoading)return;
    n.sensorsLoading=true;n.sensorErr=null;
    http('GET','/api/table.json',{content:'sensors',id:n.id,columns:'objid,sensor,status_raw',count:500}).then(function(t){
      var a=(parseJson(t,'The sensors of '+n.name).sensors)||[];
      n.children=a.map(function(r){var id=parseInt(r.objid,10);TR.nodes[id]={id:id,type:'sensor',name:r.sensor||('Sensor '+id),parent:n.id,children:[],open:false,sensorsLoaded:true,st:trNum(r.status_raw)};return id;});
      n.sensorsLoaded=true;n.sensorsLoading=false;trRender();
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      n.sensorsLoading=false;n.sensorErr='could not load the sensors ('+(err.message||err)+')';trRender();
    });
  }
  function trLoad(){
    if(TR.loaded||TR.loading||TR.failed)return;
    TR.loading=true;TR.err=null;
    http('GET','/api/tree.json',{groups:1,devices:1,probes:1,allowroot:1}).then(function(t){
      var r=trParse(parseJson(t,'The device tree'));
      if(!r)throw new Error('the reply was not a tree this tool can read');
      TR.nodes=r.nodes;TR.roots=r.roots;TR.loaded=true;TR.loading=false;trRender();
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      TR.loading=false;TR.failed=true;TR.err=err.message||String(err);
      TGT.view='list';tgtApplyView();tgtListRefresh();
      var f=$('tgtfailnote');f.hidden=false;f.textContent='The device tree could not be loaded ('+TR.err+'), so this is a plain list.';
    });
  }
  function trSearch(){
    var tok;
    TR.q=String($('tgttreesearch').value||'').trim();TR.hits=[];clearTimeout(TR.hitTimer);tok=++TR.hitTok;
    trRender();
    if(TR.q.length>=2&&TR.loaded){
      TR.hitTimer=setTimeout(function(){
        http('GET','/api/table.json',{content:'sensors',columns:tgtColumns('sensors')+',status_raw',count:50,filter_name:'@sub('+TR.q+')'}).then(function(t){
          if(tok!==TR.hitTok)return;
          TR.hits=((parseJson(t,'The sensor search').sensors)||[]).map(function(r){return {id:parseInt(r.objid,10),type:'sensor',name:r.sensor||('Sensor '+r.objid),label:tgtLabel('sensors',r),parent:null,children:[],hit:true,st:trNum(r.status_raw)};});
          trRender();
        }).catch(function(){});
      },350);
    }
  }
  function trDragStart(ev,n,el){
    var d={id:n.id,type:n.type,name:trLabel(n)}, g=document.createElement('div');
    ev.dataTransfer.setData('application/x-prtg-target',JSON.stringify(d));ev.dataTransfer.setData('text/plain',d.name);ev.dataTransfer.effectAllowed='copy';
    TR.sel=n;[].forEach.call($('tgttree').querySelectorAll('.trn'),function(r){r.classList.toggle('on',r===el);});trUseState();   /* no redraw here: that would end the drag */
    g.textContent=d.name;g.style.cssText='position:absolute;top:-1000px;left:0;padding:6px 10px;background:#2f855a;color:#fff;font:12px sans-serif;border-radius:4px';document.body.appendChild(g);
    try{ev.dataTransfer.setDragImage(g,10,10);}catch(x){}
    setTimeout(function(){if(g.parentNode)g.parentNode.removeChild(g);},0);
  }
  function trKeys(e){
    var rows=[].slice.call($('tgttree').querySelectorAll('.trn')), i=-1, k=e.key, n=TR.sel;
    rows.forEach(function(r,j){if(n&&r.getAttribute('data-id')===String(n.id))i=j;});
    function pick(j){
      var id, nn, r;
      if(j<0||j>=rows.length)return;
      id=parseInt(rows[j].getAttribute('data-id'),10);nn=TR.nodes[id]||TR.hits.filter(function(h){return h.id===id;})[0];
      if(nn){trSelect(nn);r=$('tgttree').querySelector('.trn.on');if(r)r.scrollIntoView({block:'nearest'});}
    }
    if(k==='ArrowDown'){e.preventDefault();pick(i<0?0:i+1);}
    else if(k==='ArrowUp'){e.preventDefault();pick(i<0?0:i-1);}
    else if(k==='ArrowRight'&&n&&trCanOpen(n)&&!n.open&&!TR.q){e.preventDefault();trToggle(n);}
    else if(k==='ArrowLeft'&&n&&!TR.q){e.preventDefault();if(n.open&&trCanOpen(n))trToggle(n);else if(n.parent!=null&&TR.nodes[n.parent])trSelect(TR.nodes[n.parent]);}
    else if(k==='Enter'){e.preventDefault();tgtUse();}
  }
  /* ---- the plain list: the fallback, and a choice ---- */
  function tgtApplyView(){$('tgttreebox').hidden=(TGT.view!=='tree');$('tgtlistbox').hidden=(TGT.view==='tree');}
  function tgtListRefresh(){
    var type=$('tgttype').value;
    if(S.tgt[type]){tgtRender();return;}
    $('tgtmsg').className='note pst';$('tgtmsg').textContent='Loading '+type+'\u2026';
    http('GET','/api/table.json',{content:type,columns:tgtColumns(type),count:5000}).then(function(t){
      var j=parseJson(t,'The list of '+type);S.tgt[type]=(j&&j[type])||[];tgtRender();
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      $('tgtmsg').className='note pst err';$('tgtmsg').textContent=err.message+' You can still type the object\u2019s ID in the selected item\u2019s Target box.';
    });
  }
  function tgtRefresh(){
    tgtApplyView();
    if(TGT.view==='tree'){trLoad();trRender();return;}
    tgtListRefresh();
  }
  function pickHead(){
    var h=$('tgthead'), u=$('tgtuse'), sel=DASHAPI.selected(), has=!!(sel&&sel.type==='prtgobj');
    if(PICK.mode==='g'){h.innerHTML='<strong>Choose what previews and new group or device objects show.</strong> Each object can still be given its own target.';u.textContent='Use as default';}
    else if(PICK.mode==='s'){h.innerHTML='<strong>Choose the sensor that previews and new sensor objects show.</strong>';u.textContent='Use as default';}
    else if(has){h.innerHTML='<strong>What should the selected object show?</strong> Pick a device, group or sensor, or drag one onto any object on the canvas.';u.textContent='Use as target';}
    else{h.innerHTML='<strong>Targets.</strong> Drag a device, group or sensor onto an object on the canvas to make it that object\u2019s target.';u.textContent='Use as target';}
    $('tgttype').disabled=(PICK.mode==='s');
    $('tgtcancel').hidden=(PICK.mode==='item');
  }
  function pickerSync(){
    var sel=DASHAPI.selected(), id=sel?sel.id:null, show=!!(sel&&sel.type==='prtgobj'), on=!!(S.maps&&S.catalog), was=PICK.mode;
    if(PICK.mode!=='item'&&show&&id!==PICK.sel){PICK.mode='item';if(was==='s')$('tgttype').value='devices';}   /* choosing another object takes the picker back to that object */
    if(PICK.mode==='item')PICK.sel=id;
    pickHead();
    $('tgtbox').hidden=!on;
    if(on)tgtRefresh();
  }
  function catEntry(value){var i;for(i=0;S.catalog&&i<S.catalog.length;i++)if(S.catalog[i].value===value)return S.catalog[i];return null;}
  function tgtPicked(){
    var n, r;
    if(TGT.view==='tree'){n=TR.sel;return (n&&trValid(n))?{id:n.id,name:trLabel(n),type:n.type}:null;}
    r=tgtShown[parseInt($('tgtlist').value,10)];return r?{id:r.id,name:r.name}:null;
  }
  function setDefault(kind,r){
    var m=$('tgtmsg');
    if(kind==='g')DEF.gUser={id:r.id,name:r.name};else DEF.sUser={id:r.id,name:r.name};
    defSave();defShow();pvPaneShow();
    if(PICK.mode!=='item'){if(PICK.mode==='s')$('tgttype').value='devices';PICK.mode='item';pickHead();trRender();}   /* done: back to choosing a target */
    m.className='note pst ok';m.textContent='Previews and new objects now use '+r.name+'.';
  }
  /* a target for an object, chosen with the button or dropped on it; a mismatch is allowed but said out loud */
  function applyTarget(itemId,r,dropped){
    var lay=DASHAPI.objectLayout().filter(function(o){return o.id===itemId;})[0], ent=lay?catEntry(lay.file):null, warn='', m=$('tgtmsg'), k;
    if(dropped)DASHAPI.select(itemId);
    DASHAPI.setTarget(itemId,{id:r.id,name:r.name});
    if(ent&&r.type){k=kindOf(ent);
      if(k!=='s'&&r.type==='sensor')warn=' Heads up: '+ent.name+' takes a '+(KINDNAME[k]||'group or device')+', so a sensor may show nothing.';
      else if(k==='s'&&r.type!=='sensor')warn=' Heads up: '+ent.name+' takes a sensor, so this may show nothing.';
    }
    m.className='note pst '+(warn?'warn':'ok');m.textContent='Target of '+(lay?lay.name:'the object')+' set to '+r.name+'.'+warn;
  }
  function tgtUse(){
    var r=tgtPicked(), sel;
    if(!r)return;
    if(PICK.mode==='g'||PICK.mode==='s'){setDefault(PICK.mode,r);return;}
    sel=DASHAPI.selected();
    if(!sel||sel.type!=='prtgobj')return;
    applyTarget(sel.id,r,false);
  }
  function isTgtDrag(e){var t=e.dataTransfer&&e.dataTransfer.types;return !!t&&Array.prototype.indexOf.call(t,'application/x-prtg-target')>=0;}
  function dtClear(){[].forEach.call(document.querySelectorAll('.dtarget'),function(x){x.classList.remove('dtarget');});}
  function itemAtPoint(x,y){
    var el=document.elementFromPoint(x,y), n=(el&&el.closest)?el.closest('#dcanvas .ditem'):null, id, lay;
    if(!n)return null;
    id=parseInt(n.getAttribute('data-id'),10);lay=DASHAPI.objectLayout().filter(function(o){return o.id===id;})[0];
    return lay?{id:id,node:n,lay:lay}:null;
  }
  $('objsamples').addEventListener('click',collectSamples);
  try{$('objlive').checked=(localStorage.getItem(CFG.keys.livePreview)!=='0');}catch(e){}
  $('objlive').addEventListener('change',function(){try{localStorage.setItem(CFG.keys.livePreview,this.checked?'1':'0');}catch(e){}pvSync();pvPaneShow();});
  $('objlivego').addEventListener('click',function(){PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};var ids=Object.keys(DASHAPI.pv);ids.forEach(function(k){if(DASHAPI.pv[k].state!=='ok')delete DASHAPI.pv[k];});pvSync();pvPaneShow();});
  document.addEventListener('dashrender',pvSync);
  DASHAPI.onMove=function(it){var w=pvWrap(it.id);if(w){w.style.left=it.x+'px';w.style.top=it.y+'px';}};
  $('objsearch').addEventListener('input',renderObjList);
  $('objlist').addEventListener('keydown',function(e){
    var vis=objVisible(), i=-1, k=e.key;
    vis.forEach(function(x,n){if(x.c.value===OBJSEL)i=n;});
    if(k==='Enter'){e.preventDefault();objAdd();return;}
    if(k!=='ArrowDown'&&k!=='ArrowUp'&&k!=='Home'&&k!=='End')return;
    if(!vis.length)return;
    e.preventDefault();
    if(i<0)i=0;
    else if(k==='Home')i=0;
    else if(k==='End')i=vis.length-1;
    else if(k==='ArrowDown')i=Math.min(vis.length-1,i+1);
    else i=Math.max(0,i-1);
    objSelect(vis[i].c.value,true);
  });
  $('objmsonly').addEventListener('change',function(){OBJG.ms=!!this.checked;objGroupsSave();renderObjList();$('objlist').scrollTop=0;objListInView();});
  $('objpvkind').addEventListener('change',function(){var e=selEntry(), st;if(!e)return;st=kindStore();st[e.value]=this.value;try{localStorage.setItem(CFG.keys.kindOf,JSON.stringify(st));}catch(x){}pvPaneShow();});
  $('defgchange').addEventListener('click',function(){PICK.mode='g';PICK.sel=(DASHAPI.selected()||{}).id||null;$('tgttype').value='devices';pickerSync();try{$('tgtbox').scrollIntoView({block:'nearest'});}catch(e){}});
  $('defschange').addEventListener('click',function(){PICK.mode='s';PICK.sel=(DASHAPI.selected()||{}).id||null;$('tgttype').value='sensors';pickerSync();try{$('tgtbox').scrollIntoView({block:'nearest'});}catch(e){}});
  $('defreset').addEventListener('click',function(){DEF.gUser=null;DEF.sUser=null;defSave();resolveDefaults();});
  var wrapEl=$('dwrap');
  wrapEl.addEventListener('dragenter',function(e){if(isObjDrag(e)){e.preventDefault();wrapEl.classList.add('dropping');}});
  wrapEl.addEventListener('dragover',function(e){if(isObjDrag(e)){e.preventDefault();try{e.dataTransfer.dropEffect='copy';}catch(x){}wrapEl.classList.add('dropping');}});
  wrapEl.addEventListener('dragleave',function(e){if(!e.relatedTarget||!wrapEl.contains(e.relatedTarget))wrapEl.classList.remove('dropping');});
  wrapEl.addEventListener('drop',function(e){
    var d;
    if(!isObjDrag(e))return;
    e.preventDefault();wrapEl.classList.remove('dropping');
    try{d=JSON.parse(e.dataTransfer.getData('application/x-prtg-object'));}catch(x){return;}
    if(d&&d.value)DASHAPI.dropObject(d,e.clientX,e.clientY);
  });
  $('objadd').addEventListener('click',objAdd);
  $('tgttype').addEventListener('change',tgtRefresh);
  $('tgtsearch').addEventListener('input',tgtRender);
  $('tgtlist').addEventListener('change',function(){$('tgtuse').disabled=!tgtShown[parseInt($('tgtlist').value,10)];});
  $('tgtlist').addEventListener('dblclick',tgtUse);
  $('tgtuse').addEventListener('click',tgtUse);
  document.addEventListener('secopen',function(e){var fs=e.detail&&e.detail.fs;if(fs&&fs.id==='objfs'&&PP.last)pvPaneFit(PP.last);});   /* the pane was fitted to nothing while its section was closed */
  $('tgttreesearch').addEventListener('input',trSearch);
  $('tgtcancel').addEventListener('click',function(){var was=PICK.mode;PICK.mode='item';if(was==='s')$('tgttype').value='devices';pickerSync();});
  $('tgttree').addEventListener('keydown',trKeys);
  $('tgtshowlist').addEventListener('click',function(){TGT.view='list';try{localStorage.setItem(CFG.keys.pickerView,'list');}catch(e){}tgtRefresh();});
  $('tgtshowtree').addEventListener('click',function(){TGT.view='tree';TR.failed=false;try{localStorage.setItem(CFG.keys.pickerView,'tree');}catch(e){}$('tgtfailnote').hidden=true;tgtRefresh();});
  /* dragging a target onto an object on the canvas, or onto a Preview with line */
  wrapEl.addEventListener('dragenter',function(e){if(isTgtDrag(e))e.preventDefault();});
  wrapEl.addEventListener('dragover',function(e){
    var hit;
    if(!isTgtDrag(e))return;
    hit=itemAtPoint(e.clientX,e.clientY);dtClear();
    if(hit){e.preventDefault();try{e.dataTransfer.dropEffect='copy';}catch(x){}hit.node.classList.add('dtarget');}
  });
  wrapEl.addEventListener('dragleave',function(e){if(isTgtDrag(e)&&(!e.relatedTarget||!wrapEl.contains(e.relatedTarget)))dtClear();});
  wrapEl.addEventListener('drop',function(e){
    var d, hit;
    if(!isTgtDrag(e))return;
    dtClear();hit=itemAtPoint(e.clientX,e.clientY);
    if(!hit)return;
    e.preventDefault();
    try{d=JSON.parse(e.dataTransfer.getData('application/x-prtg-target'));}catch(x){return;}
    if(d&&d.id!=null)applyTarget(hit.id,d,true);
  });
  [].forEach.call(document.querySelectorAll('#defbox .defrow'),function(row){
    row.addEventListener('dragenter',function(e){if(isTgtDrag(e))e.preventDefault();});
    row.addEventListener('dragover',function(e){if(isTgtDrag(e)&&S.catalog){e.preventDefault();row.classList.add('dtarget');}});
    row.addEventListener('dragleave',function(){row.classList.remove('dtarget');});
    row.addEventListener('drop',function(e){
      var d, kind=row.getAttribute('data-kind'), m=$('defmsg');
      if(!isTgtDrag(e))return;
      e.preventDefault();row.classList.remove('dtarget');
      try{d=JSON.parse(e.dataTransfer.getData('application/x-prtg-target'));}catch(x){return;}
      m.hidden=false;
      if((kind==='s')!==(d.type==='sensor')){m.className='note pst err';m.textContent=(kind==='s'?'Only a sensor can be the sensor default.':'A sensor cannot be the group or device default: drop it on the sensor line.');return;}
      setDefault(kind,{id:d.id,name:d.name});
      m.className='note pst ok';m.textContent='Now previewing '+(kind==='s'?'sensor':'group and device')+' objects with '+d.name+'.';
    });
  });
  document.addEventListener('dashselect',pickerSync);
  $('pushconnect').addEventListener('click',connect);
  $('pushreview').addEventListener('click',review);
  $('pushgo').addEventListener('click',push);
  $('pushundo').addEventListener('click',undo);
  $('pushforget').addEventListener('click',forget);
  $('pushmap').addEventListener('change',function(){S.reviewed=null;S.cls=null;$('pushgo').hidden=true;$('pushlist').hidden=true;updateButtons();});
  ['pushoffx','pushoffy','pushz','pushserver'].forEach(function(x){$(x).addEventListener('input',function(){S.reviewed=null;$('pushgo').hidden=true;if(x==='pushserver')tokenPromise=null;describeWhere();updateButtons();});});
  describeWhere();
  window.PUSHAPI={state:S,connect:connect,review:review,push:push,undo:undo,normalize:normalize,csrf:csrf,renderObjList:renderObjList};
  updateButtons();
  storageGet(function(items){
    if(items.pm_lastServer){$('pushserver').value=items.pm_lastServer;$('pushserver').dispatchEvent(new Event('input'));}
    if(items.pm_remember){
      $('pushremember').checked=true;
      if(items.pm_user)$('pushuser').value=items.pm_user;
      if(items.pm_secret)$('pushsecret').value=items.pm_secret;
    }
    describeWhere();
    if(items.pm_lastServer&&items.pm_remember&&loginFilled())connect();
  });
}catch(err){if(window.console)console.error('push module',err);}
})();
/* @endregion: push */
