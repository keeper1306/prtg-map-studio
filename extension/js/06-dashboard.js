
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
    if(p.mapBg)return bgHTML(it);
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
    if(isLine(it)||(it.type==='frame'&&it.p.mapBg))d.style.pointerEvents='none';   /* the map background lets clicks through to the canvas */   /* only the line itself can be clicked, not the empty corners of its box */
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
  /* an object file's link is PRTG's own External Link of the map item (sent as ElementLink when it is pushed), stored the way PRTG's
     designer writes it: map.htm?id=123 for a map. PRTG opens a PRTG page in the same tab and an address with :// in a new one, so there is no new-tab choice. */
  function objLink(p){
    function kind(){var e=String(p.elink||'');return p.elinkT||((e&&!/^\/?map\.htm\?id=\d+$/i.test(e))?'url':'map');}
    function g(k){
      var e=String(p.elink||''), m=/^\/?map\.htm\?id=(\d+)$/i.exec(e);
      if(k==='newtab')return false;
      if(k==='linktype')return kind();
      return (m&&kind()==='map')?m[1]:e;
    }
    function set(x){
      x=String(x==null?'':x).trim();
      if(!x){p.elink='';return;}
      if(kind()==='map'){var id=x.replace(/[^0-9]/g,'');p.elink=id?'map.htm?id='+id:'';return;}
      p.elink=/^([a-z][a-z0-9+.-]*:|\/|#|[\w-]+\.htm(\?|#|$))/i.test(x)?x:'https://'+x;   /* a PRTG page such as sensor.htm?id=1001 stays as it is */
    }
    return {prtg:true,g:g,s:function(k,x){
      if(k==='newtab')return;
      if(k==='linktype'){var e=String(p.elink||'');p.elinkT=x;if(x==='map'&&!/^\/?map\.htm\?id=\d+$/i.test(e))p.elink='';return;}   /* a map link stays valid as an address */
      set(x);
    }};
  }
  function fbAcc(it){
    var t=it.type, p=it.p||{}, s=it.state||{v:{},c:{}}, v=s.v, c=s.c, o={}, ck;
    function pp(k,d){return [function(){return p[k]==null?d:p[k];},function(x){p[k]=x;}];}
    function pw(){return [function(){return (+p.tweight||400)>=600;},function(b){p.tweight=b?'700':'400';}];}
    if(t==='prtgobj'){o.link=objLink(p);return o;}
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
    function tbl(T,skip,g){Object.keys(T).forEach(function(k){if(skip&&skip.test(k))return;out.push({n:k,g:g,sw:swStyle(T[k]),go:function(){extend(it.p,T[k]);it.p.style=k;if(it.p.shape)it.p.group=false;}});});}
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
    else if(t==='banner'){   /* the banner's own colours, then the same Looks as the Object builder's objects */
      tbl(BSTYLES,null,'Colours');
      ((window.OBJAPI&&OBJAPI.bannerLooks)?OBJAPI.bannerLooks():[]).forEach(function(x){out.push({g:'Looks',n:x[0],sw:swStyle(x[1]),on:it.p.style===x[0],go:function(){extend(it.p,x[1]);it.p.style=x[0];}});});
    }
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
      if(A.link.prtg){nt.hidden=true;var lh=el_('p','fb-note','PRTG opens a map or PRTG page in the same tab and any other website in a new tab.');pop.appendChild(ts);pop.appendChild(ms);pop.appendChild(li);pop.appendChild(lh);}
      else{pop.appendChild(ts);pop.appendChild(ms);pop.appendChild(li);pop.appendChild(nt);}
      pop.appendChild(rm);fbar.appendChild(pop);
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
    if(!pop){pop=gridPop=document.createElement('div');pop.id='dgridpop';pop.hidden=true;(document.getElementById('drbody')||gridBtn.parentNode).appendChild(pop);
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
  /* 1.5.70: the Grid button and the Grid icon on the bar at the right open this in the bar's panel (see railOpen) */
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
    ['Four rows',1,4,[[0,0,1,1],[0,1,1,1],[0,2,1,1],[0,3,1,1]]],
    /* 1.5.84: a slim row on top for the title banner (the first cell); picking one of these puts a banner there to edit */
    ['Title and two columns',2,10,[[0,0,2,1],[0,1,1,9],[1,1,1,9]],{banner:true}],
    ['Title and three columns',3,10,[[0,0,3,1],[0,1,1,9],[1,1,1,9],[2,1,1,9]],{banner:true}],
    ['Title and four columns',4,10,[[0,0,4,1],[0,1,1,9],[1,1,1,9],[2,1,1,9],[3,1,1,9]],{banner:true}],
    ['Title and five columns',5,10,[[0,0,5,1],[0,1,1,9],[1,1,1,9],[2,1,1,9],[3,1,1,9],[4,1,1,9]],{banner:true}],
    ['Title and four squares',2,9,[[0,0,2,1],[0,1,1,4],[1,1,1,4],[0,5,1,4],[1,5,1,4]],{banner:true}],
    ['Title and six tiles',3,9,[[0,0,3,1],[0,1,1,4],[1,1,1,4],[2,1,1,4],[0,5,1,4],[1,5,1,4],[2,5,1,4]],{banner:true}],
    ['Title and nine tiles',3,10,[[0,0,3,1],[0,1,1,3],[1,1,1,3],[2,1,1,3],[0,4,1,3],[1,4,1,3],[2,4,1,3],[0,7,1,3],[1,7,1,3],[2,7,1,3]],{banner:true}],
    ['Title, big left, two right',2,9,[[0,0,2,1],[0,1,1,8],[1,1,1,4],[1,5,1,4]],{banner:true}],
    ['Title, sidebar and content',4,10,[[0,0,4,1],[0,1,1,9],[1,1,3,9]],{banner:true}],
    ['Title, hero and three below',3,9,[[0,0,3,1],[0,1,3,4],[0,5,1,4],[1,5,1,4],[2,5,1,4]],{banner:true}]
  ];
  function layT(){var L=D.layout;return L?(L.custom||LAYOUTS[L.id]||null):null;}
  function layHasBanner(T){return !!(T&&T[4]&&T[4].banner);}
  D.layout=null;D.layShow=true;D.layFrames=false;D.layFrameLook='Light card';D.layLook='';D.layLines=false;D.layLineColor='#3B82F6';D.layLineW=3;
  var layOv=document.createElement('div');layOv.id='dlayov';wrap.appendChild(layOv);
  function layCells(){
    var L=D.layout, T, m, g, W, H, out=[];
    if(!L||!(T=(L.custom||LAYOUTS[L.id])))return out;
    m=L.margin;g=L.gap;W=D.w-2*m;H=D.h-2*m;
    T[3].forEach(function(c){
      var x0=c[0]/T[1], x1=(c[0]+c[2])/T[1], y0=c[1]/T[2], y1=(c[1]+c[3])/T[2];
      var l=Math.round(m+x0*W+(x0>0?g/2:0)), r=Math.round(m+x1*W-(x1<1?g/2:0)), t=Math.round(m+y0*H+(y0>0?g/2:0)), b=Math.round(m+y1*H-(y1<1?g/2:0));
      out.push({x:l,y:t,w:r-l,h:b-t});
    });
    return out;
  }
  function layItems(){return D.items.filter(function(x){return x.parent==null&&!(x.p&&(x.p.cellFrame||x.p.layLine))&&!(x.type==='frame'&&x.p.group===false&&!x.p.shape);});}
  /* the title banner a layout with a title row puts in its first cell (p.layBanner), so it can be edited right away */
  function layBanner(){var b=null;D.items.forEach(function(x){if(!b&&x.type==='banner'&&x.p&&x.p.layBanner)b=x;});return b;}
  var LAYBMADE=false;   /* set when layBannerEnsure() had to make the banner (not kept on the item, which is saved) */
  function layBannerEnsure(){
    var b=layBanner(), made=false;LAYBMADE=false;
    if(!layHasBanner(layT()))return null;
    if(!b){
      b={id:D.nextId++,type:'banner',parent:null,x:20,y:20,w:640,h:90,state:null,p:newBannerP('Dark')};
      b.p.title='Dashboard title';b.p.layBanner=true;b.ord=layerOf(b)*100000+(++D.ordSeq);D.items.push(b);made=true;
      if(D.layLook){var MLb=mapLookOf(D.layLook);if(MLb)layLookBanner(b,MLb);}
    }
    LAYBMADE=made;return b;
  }
  /* dividing lines between the cells (p.layLine), in the middle of the gaps, like the lines between the columns of a wall dashboard */
  function layLineItems(){return D.items.filter(function(x){return x.type==='frame'&&x.p&&x.p.layLine;});}
  function layLineSegs(){
    var T=layT(), L=D.layout, out=[], m, W, H, cs, vx={}, hy={};
    if(!T)return out;
    m=L.margin;W=D.w-2*m;H=D.h-2*m;cs=T[3];
    function add(map,k,a,b){(map[k]=map[k]||[]).push([a,b]);}
    cs.forEach(function(c){cs.forEach(function(d){
      var a, b;
      if(c[0]+c[2]===d[0]){a=Math.max(c[1],d[1]);b=Math.min(c[1]+c[3],d[1]+d[3]);if(b>a)add(vx,c[0]+c[2],a,b);}   /* d is right of c */
      if(c[1]+c[3]===d[1]){a=Math.max(c[0],d[0]);b=Math.min(c[0]+c[2],d[0]+d[2]);if(b>a)add(hy,c[1]+c[3],a,b);}   /* d is below c */
    });});
    function merge(list){list.sort(function(p,q){return p[0]-q[0];});var r=[];list.forEach(function(s2){var l=r[r.length-1];if(l&&s2[0]<=l[1])l[1]=Math.max(l[1],s2[1]);else r.push(s2.slice());});return r;}
    Object.keys(vx).forEach(function(k){var x=Math.round(m+(k/T[1])*W);merge(vx[k]).forEach(function(s2){out.push([[x,Math.round(m+(s2[0]/T[2])*H)],[x,Math.round(m+(s2[1]/T[2])*H)]]);});});
    Object.keys(hy).forEach(function(k){var y=Math.round(m+(k/T[2])*H);merge(hy[k]).forEach(function(s2){out.push([[Math.round(m+(s2[0]/T[1])*W),y],[Math.round(m+(s2[1]/T[1])*W),y]]);});});
    return out;
  }
  function layLinesOff(){var n=layLineItems().length;D.items=D.items.filter(function(x){return !(x.type==='frame'&&x.p&&x.p.layLine);});return n;}
  /* 1.5.85: one look for the whole map (background, cell frames, title banner, dividing lines), from OBJAPI.mapLooks() */
  function mapLookOf(n){var a=(window.OBJAPI&&OBJAPI.mapLooks)?OBJAPI.mapLooks():[], r=null;a.forEach(function(x){if(x.name===n)r=x;});return r;}
  function layLookFrame(f,ML){var t=f.p.title, cell=f.p.cell;f.p=extend(newFrameP('Light card'),ML.frame);f.p.title=t;f.p.cellFrame=true;f.p.cell=cell;f.p.group=true;}
  function layLookBanner(b,ML){if(b&&ML.banner){extend(b.p,ML.banner);b.p.style=ML.name;}}
  function layLookApply(n){
    var ML=mapLookOf(n);if(!ML)return;
    D.layLook=n;
    bgSet(JSON.parse(JSON.stringify(ML.bg)),true);
    D.layFrames=true;if(D.layout)layFramesSync();
    layCellFrames().forEach(function(f){layLookFrame(f,ML);});
    layLookBanner(layBanner(),ML);
    D.layLineColor=ML.accent;layLineItems().forEach(function(x){x.p.color=ML.accent;});
    renderAll();buildForm();commit();
    toastDash(n+': background, frames'+(layBanner()?', title banner':'')+(layLineItems().length?' and lines':'')+' in this look');
  }
  function layLookThumb(ML){
    var bg=ML.bg.base, s='<svg viewBox="0 0 100 62" aria-hidden="true"><rect width="100" height="62" rx="3" fill="'+bg+'"/>';
    if(ML.bg.mode==='gradient')s+='<circle cx="25" cy="20" r="26" fill="'+ML.accent+'" fill-opacity=".22"/>';
    s+='<rect x="5" y="5" width="90" height="9" rx="1.5" fill="'+(ML.banner&&ML.banner.fill||ML.card)+'" stroke="'+ML.border+'" stroke-width=".6"/>';
    s+='<rect x="38" y="8.6" width="24" height="1.8" rx=".9" fill="'+(ML.banner&&ML.banner.tcolor||'#FFFFFF')+'"/>';
    [5,36.5,68].forEach(function(x){s+='<rect x="'+x+'" y="19" width="27" height="38" rx="2" fill="'+ML.card+'" stroke="'+ML.border+'" stroke-width=".6"/>';});
    s+='<path d="M34.3 18.5V57.5M65.8 18.5V57.5M5 16.4H95" stroke="'+ML.accent+'" stroke-width="1"/>';
    return s+'</svg>';
  }
  function layLinesSync(){
    layLinesOff();
    layLineSegs().forEach(function(sg){
      var it={id:D.nextId++,type:'frame',parent:null,x:0,y:0,w:10,h:10,state:null,p:newShapeP('line','right')};
      it.p.color=D.layLineColor||'#3B82F6';it.p.thick=Math.max(1,Math.min(20,+D.layLineW||3));it.p.lt='straight';it.p.ha='none';it.p.hb='none';it.p.anim=false;it.p.matchLS=false;it.p.layLine=true;
      lnSetAbs(it,sg[0],sg[1]);it.ord=layerOf(it)*100000+(++D.ordSeq);D.items.push(it);
    });
  }
  /* a frame in each cell: real frame items (styled, moved and pushed like any frame) that follow the layout's cells */
  function layCellFrames(){return D.items.filter(function(x){return x.type==='frame'&&x.p&&x.p.cellFrame;});}
  function layFrameIn(k){var f=null;layCellFrames().forEach(function(x){if(x.p.cell===k)f=x;});return f;}
  function layInner(c,k){var f=(k>=0)?layFrameIn(k):null, t;if(!f)return c;t=f.p.title?Math.round((f.p.tsize||18)*1.6+(f.p.pady||16)):(f.p.pady||16);return {x:c.x+(f.p.padx||20),y:c.y+t,w:Math.max(20,c.w-2*(f.p.padx||20)),h:Math.max(20,c.h-t-(f.p.pady||16))};}
  function layFramesSync(){
    var cells=layCells(), have=layCellFrames(), keep={}, proto=null, skip0=layHasBanner(layT());   /* the title row holds the banner, not a frame */
    have.forEach(function(f){if(!proto)proto=f.p;if(f.p.cell<cells.length&&!keep[f.p.cell]&&!(skip0&&f.p.cell===0)){keep[f.p.cell]=f;}});
    have.forEach(function(f){if(keep[f.p.cell]!==f&&!D.items.some(function(c){return c.parent===f.id;}))D.items=D.items.filter(function(x){return x!==f;});});   /* frames of cells that are gone go, unless something sits inside them */
    cells.forEach(function(c,k){
      var f=keep[k], dx, dy;
      if(skip0&&k===0)return;
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
    var ids=msIds(), L=(ids.length>=2)?ids.map(byId).filter(Boolean):layItems(), cells=layCells(), used={}, rows=[], flat=[], put=0, skip=0, bn=layHasBanner(layT())?layBanner():null;
    FREE=false;
    if(bn&&cells.length){layPut(bn,cells[0],0);used[0]=1;L=L.filter(function(x){return x!==bn;});}
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
  function layApply(id,custom,gap,margin){   /* custom: a layout of your own, [name,cols,rows,cells] like LAYOUTS (id is then -1) */
    var old=D.layout;
    D.layout={id:id,gap:gap!=null?gap:(old?old.gap:20),margin:margin!=null?margin:(old?old.margin:20),custom:custom||null};
    if(D.layFrames)layFramesSync();
    if(D.layLines||layLineItems().length)layLinesSync();
    var bn=layBannerEnsure(), made=LAYBMADE;
    if(bn&&made)D.sel=bn.id;   /* selected before the fill saves, so the panel opens on it */
    layFill();
    if(bn&&made)toastDash('A title banner is in the top row, ready to edit: double-click its text');
  }
  function laySpacing(gap,margin){
    var before=layCells(), map=[], after;
    layItems().forEach(function(x){var k=layCellOf(before,x);if(k>=0)map.push([x,k]);});
    D.layout.gap=gap;D.layout.margin=margin;
    if(D.layFrames)layFramesSync();
    if(D.layLines||layLineItems().length)layLinesSync();
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
  /* ---- 1.5.70: the layouts panel. Layouts are grouped (My layouts first), can be searched, and "Build my own" makes a new one:
     a number of boxes, columns and rows, joined and split, saved by name in this browser ---- */
  var LYGROUPS=[
    ['With a title banner',['Title and two columns','Title and three columns','Title and four columns','Title and five columns','Title and four squares','Title and six tiles','Title and nine tiles','Title, big left, two right','Title, sidebar and content','Title, hero and three below']],
    ['Simple',['One big cell','Two columns','Two rows','Three columns','Three rows','Four squares','Six tiles','Nine tiles','Five columns','Four rows']],
    ['One big, several small',['Big left, two right','Two left, big right','Big top, two below','Two above, big below','Hero and three below','Three stacked and big','Big and four small']],
    ['Header or sidebar',['Header and three columns','Header and two columns','Banner, two, banner','Sidebar and content','Content and sidebar','Two thirds and one third','One third and two thirds']]
  ];
  var LY={view:'list',q:'',b:null};
  function lyValid(o){return !!o&&typeof o.name==='string'&&o.name.length>0&&o.cols>=1&&o.cols<=24&&o.rows>=1&&o.rows<=24&&Array.isArray(o.cells)&&o.cells.length>=1&&o.cells.every(function(c){return Array.isArray(c)&&c.length===4&&c.every(function(v){return typeof v==='number'&&v>=0;});});}
  function myLays(){try{var a=JSON.parse(localStorage.getItem(CFG.keys.myLayouts)||'[]');return Array.isArray(a)?a.filter(lyValid):[];}catch(e){return [];}}
  function myLaysSave(a){try{localStorage.setItem(CFG.keys.myLayouts,JSON.stringify(a));return true;}catch(e){return false;}}
  function lyT(o){return [o.name,o.cols,o.rows,o.cells.map(function(c){return c.slice();})];}
  function layName(){var L=D.layout, T=L&&(L.custom||LAYOUTS[L.id]);return T?T[0]:'';}
  function layThumbSvg(T,mine){
    var vh=Math.round(100*D.h/D.w*10)/10, tones=mine?['#E7C36A','#F0D58F','#DDB75A','#F5E2AE']:['#8fbfdc','#bcd9ec','#a9b8e6','#d9e6f2','#c9b8e0','#e9d3a6'], s='';
    T[3].forEach(function(c,j){
      var x=4+(c[0]/T[1])*92, w=(c[2]/T[1])*92, y=4+(c[1]/T[2])*(vh-8), h=(c[3]/T[2])*(vh-8);
      if(j===0&&layHasBanner(T)){s+=layTitleCell(x,y,w,h);return;}
      s+='<rect x="'+(x+1)+'" y="'+(y+1)+'" width="'+Math.max(1,w-2)+'" height="'+Math.max(1,h-2)+'" rx="2" fill="'+tones[j%tones.length]+'"/>';
    });
    return '<svg viewBox="0 0 100 '+vh+'" aria-hidden="true">'+s+'</svg>';
  }
  function layTitleCell(x,y,w,h){return '<rect x="'+(x+1)+'" y="'+(y+1)+'" width="'+Math.max(1,w-2)+'" height="'+Math.max(1,h-2)+'" rx="2" fill="#33475E"/><rect x="'+(x+w/2-14)+'" y="'+(y+h/2-1.2)+'" width="28" height="2.4" rx="1.2" fill="#FFFFFF"/>';}
  function lyCard(T,on,fn,mine,del){
    var w=el_('div','ly-c'), b=document.createElement('button'), n=el_('span','ly-n'), x;
    b.type='button';b.className='ly-t'+(on?' on':'');b.setAttribute('aria-label',T[0]+(on?' (on the canvas)':''));b.setAttribute('data-tip',T[0]);b.innerHTML=layThumbSvg(T,mine);
    b.addEventListener('click',fn);
    n.textContent=T[0];w.appendChild(b);w.appendChild(n);
    if(del){x=document.createElement('button');x.type='button';x.className='ly-x';x.setAttribute('aria-label','Remove '+T[0]+' from My layouts');x.setAttribute('data-tip','Remove from My layouts');x.textContent='×';
      x.addEventListener('click',function(e){e.stopPropagation();del();});w.appendChild(x);}
    return w;
  }
  function layPopBuild(){
    var pop=layPop, l, nt, q, lists;
    if(!pop){pop=layPop=document.createElement('div');pop.id='dlaypop';pop.hidden=true;(railBody||layBtn.parentNode).appendChild(pop);
      ['mousedown','click','dblclick','keydown'].forEach(function(ev){pop.addEventListener(ev,function(e){e.stopPropagation();});});}
    pop.innerHTML='';
    if(LY.view==='build'){lbBuild(pop);return;}
    if(D.layout)pop.appendChild(layCurBox());
    var nb=document.createElement('button');nb.type='button';nb.className='ly-new';nb.textContent='+ Build my own layout';
    nb.addEventListener('click',function(){LY.view='build';LY.b=lbFromCurrent();layPopBuild();});
    pop.appendChild(nb);
    q=document.createElement('input');q.type='search';q.className='ly-q';q.placeholder='Search layouts';q.setAttribute('aria-label','Search layouts');q.value=LY.q;q.spellcheck=false;
    pop.appendChild(q);
    lists=el_('div','ly-lists');pop.appendChild(lists);
    q.addEventListener('input',function(){LY.q=q.value;lyLists(lists);});
    lyLists(lists);
    nt=document.createElement('p');nt.className='gp-note';nt.textContent='Pick a layout and your items fill its cells in reading order. Drag an item onto a cell to put it there (Alt places it freely). Frames, shapes, banners, tiles and objects stretch to fill a cell; labels, buttons and chips keep their size. Ctrl+Z undoes a fill.';pop.appendChild(nt);
  }
  function lyLists(box){
    var q=String(LY.q||'').trim().toLowerCase(), hit=function(n){return !q||n.toLowerCase().indexOf(q)>=0;}, used={}, any=false, L=D.layout, mine=myLays();
    box.innerHTML='';
    function group(title,cards,empty){
      if(!cards.length&&!empty)return;
      var g=el_('div','ly-g'), t=el_('div','gp-l'), grid=el_('div','ly-grid');
      t.textContent=title;g.appendChild(t);
      if(cards.length){cards.forEach(function(c){grid.appendChild(c);});g.appendChild(grid);any=true;}
      else{var e=el_('p','gp-note');e.textContent=empty;g.appendChild(e);}
      box.appendChild(g);
    }
    group('My layouts',mine.filter(function(o){return hit(o.name);}).map(function(o){
      var T=lyT(o), on=!!(L&&L.custom&&L.custom[0]===o.name);
      return lyCard(T,on,function(){layApply(-1,lyT(o));layPopBuild();},true,function(){
        var a=myLays().filter(function(x){return x.name!==o.name;});
        if(myLaysSave(a))toastDash('Removed “'+o.name+'” from My layouts');else toastDash('Could not change My layouts in this browser');
        layPopBuild();
      });
    }),q?'':'Layouts you build and save appear here.');
    LYGROUPS.forEach(function(G){
      var cards=[];
      G[1].forEach(function(n){var i;for(i=0;i<LAYOUTS.length;i++)if(LAYOUTS[i][0]===n)break;if(i>=LAYOUTS.length)return;used[i]=1;if(!hit(n))return;cards.push(lyCard(LAYOUTS[i],!!(L&&!L.custom&&L.id===i),(function(k){return function(){layApply(k);layPopBuild();};})(i)));});
      group(G[0],cards);
    });
    var rest=[];LAYOUTS.forEach(function(T,i){if(used[i]||!hit(T[0]))return;rest.push(lyCard(T,!!(L&&!L.custom&&L.id===i),function(){layApply(i);layPopBuild();}));});
    group('Other',rest);
    if(q&&!any){var e=el_('p','gp-note');e.textContent='No layout has “'+LY.q.trim()+'” in its name.';box.appendChild(e);}
  }
  /* the layout on the canvas: its spacing, cells, frames and buttons (these were in the old Layouts pop-up) */
  function layCurBox(){
    var box=el_('div','ly-cur'), l=el_('div','gp-l'), row, a, b2, ia, ib, sh, ck, bw, ba, bb;
    l.textContent='On the canvas: '+layName();box.appendChild(l);
    row=document.createElement('div');row.className='gp-row';
    a=document.createElement('label');a.textContent='Gap';ia=document.createElement('input');ia.type='number';ia.min=0;ia.max=200;ia.value=D.layout.gap;a.appendChild(ia);
    b2=document.createElement('label');b2.textContent='Margin';ib=document.createElement('input');ib.type='number';ib.min=0;ib.max=400;ib.value=D.layout.margin;b2.appendChild(ib);
    var go=function(){var gv=parseInt(ia.value,10), mv=parseInt(ib.value,10);if(isNaN(gv)||isNaN(mv))return;laySpacing(Math.max(0,Math.min(200,gv)),Math.max(0,Math.min(400,mv)));};
    ia.addEventListener('change',go);ib.addEventListener('change',go);
    row.appendChild(a);row.appendChild(b2);box.appendChild(row);
    sh=document.createElement('label');sh.className='gp-chk';ck=document.createElement('input');ck.type='checkbox';ck.checked=!!D.layShow;
    ck.addEventListener('change',function(){D.layShow=ck.checked;layPaint();});sh.appendChild(ck);sh.appendChild(document.createTextNode(' Show the cells on the canvas'));box.appendChild(sh);
    var mlh=el_('div','gp-l');mlh.textContent='Look for the whole map';box.appendChild(mlh);
    var mlg=el_('div','ly-grid ly-looks');
    ((window.OBJAPI&&OBJAPI.mapLooks)?OBJAPI.mapLooks():[]).forEach(function(ML){
      var w=el_('div','ly-c'), bt=document.createElement('button'), nm=el_('span','ly-n');
      bt.type='button';bt.className='ly-t'+(D.layLook===ML.name?' on':'');bt.setAttribute('data-look',ML.name);bt.setAttribute('aria-label',ML.name+': background, frames, title banner and lines in this look');bt.setAttribute('data-tip',ML.name);
      bt.innerHTML=layLookThumb(ML);bt.addEventListener('click',function(){layLookApply(ML.name);layPopBuild();});
      nm.textContent=ML.name;w.appendChild(bt);w.appendChild(nm);mlg.appendChild(w);
    });
    box.appendChild(mlg);
    var fr=document.createElement('label');fr.className='gp-chk';var fk=document.createElement('input');fk.type='checkbox';fk.checked=!!D.layFrames;fk.id='dlayframes';
    fk.addEventListener('change',function(){
      D.layFrames=fk.checked;
      if(fk.checked){layFramesSync();renderAll();buildForm();commit();toastDash('A frame in each of the '+layCells().length+' cells');}
      else{var g=layFramesOff();renderAll();buildForm();commit();toastDash(g?('Removed '+g+(g===1?' empty frame':' empty frames')):'Frames with items in them stay as ordinary frames');}
      layPopBuild();
    });
    fr.appendChild(fk);fr.appendChild(document.createTextNode(' Add a frame in each cell'));box.appendChild(fr);
    if(D.layFrames){
      var lr=document.createElement('div');lr.className='gp-row';var ll=document.createElement('label');ll.textContent='Frame look';var ls=document.createElement('select');ls.id='dlayflook';
      Object.keys(FSTYLES).forEach(function(k){var o=document.createElement('option');o.value=k;o.textContent=k;ls.appendChild(o);});ls.value=D.layFrameLook||'Light card';
      ls.addEventListener('change',function(){D.layFrameLook=ls.value;D.layLook='';layFramesRestyle(ls.value);renderAll();buildForm();commit();});
      ll.appendChild(ls);lr.appendChild(ll);box.appendChild(lr);
    }
    var lnOn=D.layLines||layLineItems().length>0, lr2=document.createElement('label');lr2.className='gp-chk';var lk2=document.createElement('input');lk2.type='checkbox';lk2.checked=lnOn;lk2.id='dlaylines';
    lk2.addEventListener('change',function(){
      D.layLines=lk2.checked;
      if(lk2.checked){layLinesSync();renderAll();buildForm();commit();toastDash(layLineItems().length?('Added '+layLineItems().length+' dividing lines'):'This layout has no cells side by side to divide');}
      else{var n=layLinesOff();renderAll();buildForm();commit();toastDash('Removed '+n+(n===1?' line':' lines'));}
      layPopBuild();
    });
    lr2.appendChild(lk2);lr2.appendChild(document.createTextNode(' Add dividing lines between the cells'));box.appendChild(lr2);
    if(lnOn){
      var lrow=document.createElement('div');lrow.className='gp-row';
      var lc=document.createElement('label');lc.textContent='Line color';var lci=document.createElement('input');lci.type='color';lci.id='dlaylinecol';lci.value=/^#[0-9a-f]{6}$/i.test(D.layLineColor)?D.layLineColor:'#3B82F6';lc.appendChild(lci);
      var lw=document.createElement('label');lw.textContent='Thickness';var lwi=document.createElement('input');lwi.type='number';lwi.min=1;lwi.max=20;lwi.id='dlaylinew';lwi.value=D.layLineW||3;lw.appendChild(lwi);
      lci.addEventListener('input',function(){D.layLineColor=lci.value;layLineItems().forEach(function(x){x.p.color=lci.value;});renderAll();});
      lci.addEventListener('change',function(){commit();});
      lwi.addEventListener('change',function(){var v=parseInt(lwi.value,10);if(isNaN(v))return;D.layLineW=Math.max(1,Math.min(20,v));D.layLines=true;layLinesSync();renderAll();buildForm();commit();});
      lrow.appendChild(lc);lrow.appendChild(lw);box.appendChild(lrow);
    }
    bw=document.createElement('div');bw.className='gp-btns';
    ba=document.createElement('button');ba.type='button';ba.className='btn ghost';ba.textContent='Fill cells with my items';ba.addEventListener('click',function(){layFill();});
    bb=document.createElement('button');bb.type='button';bb.className='btn ghost';bb.textContent='Remove layout';bb.addEventListener('click',function(){layRemove();layPopBuild();});
    bw.appendChild(ba);bw.appendChild(bb);box.appendChild(bw);
    return box;
  }
  /* ---- Build my own: cells on a grid of columns and rows, [x,y,w,h] like LAYOUTS ---- */
  var LBMAX=24;
  function lbEven(n,gap,margin){
    var rows=Math.max(1,Math.min(n,Math.round(Math.sqrt(n*D.h/D.w)))), cols=Math.ceil(n/rows), cells=[], r, c, k, base, extra, x, w;
    rows=Math.ceil(n/cols);
    for(r=0;r<rows-1;r++)for(c=0;c<cols;c++)cells.push([c,r,1,1]);
    k=n-(rows-1)*cols;base=Math.floor(cols/k);extra=cols%k;x=0;
    for(c=0;c<k;c++){w=base+(c<extra?1:0);cells.push([x,rows-1,w,1]);x+=w;}
    return {cols:cols,rows:rows,cells:cells,sel:[],name:'',gap:gap,margin:margin};
  }
  function lbGrid(cols,rows,gap,margin){var cells=[], r, c;for(r=0;r<rows;r++)for(c=0;c<cols;c++)cells.push([c,r,1,1]);return {cols:cols,rows:rows,cells:cells,sel:[],name:'',gap:gap,margin:margin};}
  function lbFromCurrent(){
    var L=D.layout, T=L&&(L.custom||LAYOUTS[L.id]), b;
    if(!T)return lbEven(4,20,20);
    b={cols:T[1],rows:T[2],cells:T[3].map(function(c){return c.slice();}),sel:[],name:L.custom?T[0]:'',gap:L.gap,margin:L.margin};
    return b;
  }
  function gcd(a,b){while(b){var t=a%b;a=b;b=t;}return a;}
  function lbNorm(b){   /* the smallest grid that still holds every cell, so Columns and Rows show what you see */
    var gx=b.cols, gy=b.rows;
    b.cells.forEach(function(c){gx=gcd(gx,gcd(c[0],c[2]));gy=gcd(gy,gcd(c[1],c[3]));});
    if(gx>1){b.cols/=gx;b.cells.forEach(function(c){c[0]/=gx;c[2]/=gx;});}
    if(gy>1){b.rows/=gy;b.cells.forEach(function(c){c[1]/=gy;c[3]/=gy;});}
    b.cells.sort(function(p,q){return (p[1]-q[1])||(p[0]-q[0]);});   /* reading order: items fill the cells in this order */
  }
  function lbJoinable(b){
    if(b.sel.length<2)return null;
    var x0=1e9,y0=1e9,x1=-1,y1=-1,area=0;
    b.sel.forEach(function(i){var c=b.cells[i];x0=Math.min(x0,c[0]);y0=Math.min(y0,c[1]);x1=Math.max(x1,c[0]+c[2]);y1=Math.max(y1,c[1]+c[3]);area+=c[2]*c[3];});
    return (area===(x1-x0)*(y1-y0))?[x0,y0,x1-x0,y1-y0]:null;   /* the picked boxes cover a rectangle exactly */
  }
  function lbJoin(b){
    var r=lbJoinable(b);if(!r)return;
    var keep=b.cells.filter(function(c,i){return b.sel.indexOf(i)<0;});keep.push(r);b.cells=keep;b.sel=[];lbNorm(b);
  }
  function lbSplit(b,across){   /* across: side by side; otherwise top and bottom */
    if(b.sel.length!==1)return;
    if(b.cells.length>=LBMAX){toastDash('A layout can have up to '+LBMAX+' boxes');return;}
    var i=b.sel[0], c=b.cells[i], a=across?0:1, s=across?2:3;
    if(c[s]<2){
      if((across?b.cols:b.rows)*2>LBMAX){toastDash('That box is as narrow as a layout allows');return;}
      if(across)b.cols*=2;else b.rows*=2;
      b.cells.forEach(function(x){x[a]*=2;x[s]*=2;});
    }
    var h=Math.floor(c[s]/2), n=c.slice();
    n[a]=c[a]+h;n[s]=c[s]-h;c[s]=h;
    b.cells.splice(i+1,0,n);b.sel=[];lbNorm(b);
  }
  function lbStepper(label,val,min,max,fn,tip){
    var w=el_('div','lb-f'), st=el_('span','lb-step'), m=document.createElement('button'), v=el_('b'), p=document.createElement('button');
    w.appendChild(document.createTextNode(label));
    m.type='button';m.textContent='−';m.setAttribute('aria-label',label+': fewer');m.disabled=val<=min;m.addEventListener('click',function(){fn(val-1);});
    p.type='button';p.textContent='+';p.setAttribute('aria-label',label+': more');p.disabled=val>=max;p.addEventListener('click',function(){fn(val+1);});
    v.textContent=String(val);if(tip)w.setAttribute('data-tip',tip);
    st.appendChild(m);st.appendChild(v);st.appendChild(p);w.appendChild(st);
    return w;
  }
  function lbBuild(pop){
    var b=LY.b||(LY.b=lbEven(4,20,20)), back, t, row, pv, nt, bw, bj, bs, bt, row2, nm, bw2, bsave, buse;
    back=document.createElement('button');back.type='button';back.className='linkbtn ly-back';back.textContent='‹ All layouts';
    back.addEventListener('click',function(){LY.view='list';layPopBuild();});pop.appendChild(back);
    t=el_('div','gp-l');t.textContent='Build my own layout';pop.appendChild(t);
    row=el_('div','lb-row');
    row.appendChild(lbStepper('Boxes',b.cells.length,1,12,function(v){var k=LY.b;LY.b=lbEven(v,k.gap,k.margin);LY.b.name=k.name;layPopBuild();},'Start again with this many boxes, spread evenly'));
    row.appendChild(lbStepper('Columns',b.cols,1,12,function(v){var k=LY.b;LY.b=lbGrid(v,k.rows,k.gap,k.margin);LY.b.name=k.name;layPopBuild();},'Start again with a plain grid'));
    row.appendChild(lbStepper('Rows',b.rows,1,12,function(v){var k=LY.b;LY.b=lbGrid(k.cols,v,k.gap,k.margin);LY.b.name=k.name;layPopBuild();},'Start again with a plain grid'));
    pop.appendChild(row);
    pv=el_('div','lb-pv');pv.style.aspectRatio=D.w+' / '+D.h;pv.setAttribute('role','group');pv.setAttribute('aria-label','The boxes of your layout. Click boxes to pick them.');
    b.cells.forEach(function(c,i){
      var on=b.sel.indexOf(i)>=0, x=document.createElement('button');
      x.type='button';x.className=on?'on':'';x.textContent=String(i+1);x.setAttribute('aria-pressed',on?'true':'false');x.setAttribute('aria-label','Box '+(i+1));
      x.style.left='calc('+(100*c[0]/b.cols)+'% + 3px)';x.style.top='calc('+(100*c[1]/b.rows)+'% + 3px)';
      x.style.width='calc('+(100*c[2]/b.cols)+'% - 6px)';x.style.height='calc('+(100*c[3]/b.rows)+'% - 6px)';
      x.addEventListener('click',function(){var k=b.sel.indexOf(i);if(k>=0)b.sel.splice(k,1);else b.sel.push(i);layPopBuild();});
      pv.appendChild(x);
    });
    pop.appendChild(pv);
    nt=el_('p','gp-note');nt.textContent=b.sel.length?(b.sel.length+(b.sel.length===1?' box picked.':' boxes picked.')+' Join makes picked boxes one box; Split cuts one picked box in two.'):'Click boxes to pick them, then join or split them. The numbers are the order your items fill them in.';pop.appendChild(nt);
    bw=el_('div','gp-btns');
    bj=document.createElement('button');bj.type='button';bj.className='btn ghost';bj.textContent='Join';bj.disabled=!lbJoinable(b);
    bj.setAttribute('data-tip',b.sel.length<2?'Pick two or more boxes next to each other':(lbJoinable(b)?'Make the picked boxes one box':'The picked boxes must form a rectangle'));
    bj.addEventListener('click',function(){lbJoin(b);layPopBuild();});
    bs=document.createElement('button');bs.type='button';bs.className='btn ghost';bs.textContent='Split ↔';bs.disabled=b.sel.length!==1;bs.setAttribute('data-tip','Cut the picked box into two, side by side');bs.setAttribute('aria-label','Split side by side');
    bs.addEventListener('click',function(){lbSplit(b,true);layPopBuild();});
    bt=document.createElement('button');bt.type='button';bt.className='btn ghost';bt.textContent='Split ↕';bt.disabled=b.sel.length!==1;bt.setAttribute('data-tip','Cut the picked box into two, one above the other');bt.setAttribute('aria-label','Split top and bottom');
    bt.addEventListener('click',function(){lbSplit(b,false);layPopBuild();});
    bw.appendChild(bj);bw.appendChild(bs);bw.appendChild(bt);pop.appendChild(bw);
    row2=el_('div','gp-row');
    [['Gap','gap',200],['Margin','margin',400]].forEach(function(f){
      var l=document.createElement('label'), i=document.createElement('input');l.textContent=f[0];i.type='number';i.min=0;i.max=f[2];i.value=b[f[1]];
      i.addEventListener('change',function(){var v=parseInt(i.value,10);if(!isNaN(v))b[f[1]]=Math.max(0,Math.min(f[2],v));});
      l.appendChild(i);row2.appendChild(l);
    });
    pop.appendChild(row2);
    nm=document.createElement('label');nm.className='lb-name';nm.textContent='Name';
    var ni=document.createElement('input');ni.type='text';ni.maxLength=40;ni.placeholder='For example Plant overview';ni.value=b.name||'';ni.spellcheck=false;nm.appendChild(ni);pop.appendChild(nm);
    bw2=el_('div','gp-btns');
    bsave=document.createElement('button');bsave.type='button';bsave.className='btn ghost';bsave.textContent='Save to My layouts';bsave.disabled=!String(b.name||'').trim();
    buse=document.createElement('button');buse.type='button';buse.className='btn';buse.textContent='Use on the canvas';
    ni.addEventListener('input',function(){b.name=ni.value;bsave.disabled=!ni.value.trim();});
    bsave.addEventListener('click',function(){
      var name=String(b.name||'').trim(), a, i, was=false;if(!name)return;
      a=myLays();for(i=0;i<a.length;i++)if(a[i].name.toLowerCase()===name.toLowerCase()){a.splice(i,1);was=true;break;}
      a.unshift({name:name,cols:b.cols,rows:b.rows,cells:b.cells.map(function(c){return c.slice();})});
      if(!myLaysSave(a.slice(0,40))){toastDash('Could not save in this browser');return;}
      toastDash((was?'Updated “':'Saved “')+name+'” in My layouts');
      LY.view='list';LY.q='';layPopBuild();
    });
    buse.addEventListener('click',function(){
      var name=String(b.name||'').trim()||'My layout';
      layApply(-1,[name,b.cols,b.rows,b.cells.map(function(c){return c.slice();})],b.gap,b.margin);
      LY.view='list';layPopBuild();
    });
    bw2.appendChild(bsave);bw2.appendChild(buse);pop.appendChild(bw2);
    var n2=el_('p','gp-note');n2.textContent='My layouts are kept in this browser, for every map you design here.';pop.appendChild(n2);
  }
  /* ---- 1.5.70: the map background. One item at the very back that covers the whole canvas: a colour, a pattern or a gradient.
     It is a frame that does not hold other items (group:false, as the Background style), marked mapBg, drawn with CSS only,
     so it is pushed to PRTG like any other item ---- */
  var BGPRE=[
    {id:'solid',name:'Solid navy',mode:'color',base:'#14163A'},
    {id:'dots',name:'Dots',mode:'pattern',pat:'dots',base:'#161942',pc:'#969FE6',str:40,size:14},
    {id:'blueprint',name:'Blueprint grid',mode:'pattern',pat:'grid',base:'#123461',pc:'#FFFFFF',str:13,size:48},
    {id:'diag',name:'Diagonal lines',mode:'pattern',pat:'diag',base:'#1A1D48',pc:'#FFFFFF',str:6,size:12},
    {id:'stripes',name:'Safety stripes',mode:'pattern',pat:'stripes',base:'#1B1C22',pc:'#F5C500',str:18,size:20},
    {id:'honey',name:'Honeycomb',mode:'pattern',pat:'honey',base:'#151840',pc:'#96A0EB',str:28,size:28},
    {id:'circuit',name:'Circuit',mode:'pattern',pat:'circuit',base:'#0F1D2E',pc:'#3CCDB9',str:30,size:60},
    {id:'carbon',name:'Carbon fibre',mode:'pattern',pat:'carbon',base:'#1D1D1D',pc:'#000000',str:45,size:12},
    {id:'ldots',name:'Light dots',mode:'pattern',pat:'dots',base:'#EEF1F5',pc:'#8E98AE',str:45,size:14},
    {id:'glow',name:'Soft glow',mode:'gradient',grad:'glow',base:'#0F1233',g2:'#506EFF',g3:'#14C8B4',str:100},
    {id:'fade',name:'Navy fade',mode:'gradient',grad:'diag',base:'#050F34',g2:'#1B3A8A'},
    {id:'dusk',name:'Top to bottom',mode:'gradient',grad:'down',base:'#0F1233',g2:'#2A1838'}
  ];
  var BGSOLID=[['Navy','#14163A'],['Brand navy','#050F34'],['Wall display','#0B1220'],['Executive dark','#171926'],['Slate','#2B2D3C'],['Teal glass','#2A3B4C'],['Light grey','#F3F4F6'],['White','#FFFFFF'],['PRTG default','#DAD7D7']];
  var BGTAB={tab:'pattern'};
  function bgHex(v,d){return /^#[0-9a-fA-F]{6}$/.test(String(v||''))?String(v).toUpperCase():d;}
  function bgN(v,mn,mx,d){v=+v;return isNaN(v)?d:Math.max(mn,Math.min(mx,v));}
  function bgUri(svg){return "url('data:image/svg+xml,"+encodeURIComponent(svg).replace(/'/g,'%27').replace(/\(/g,'%28').replace(/\)/g,'%29')+"')";}
  function bgCss(b){   /* the value of the CSS background shorthand for a background setting */
    var base=bgHex(b.base,'#14163A'), pc=bgHex(b.pc,'#FFFFFF'), S=Math.round(bgN(b.size,6,160,14)), a=Math.round(bgN(b.str,0,100,40))/100, A=rgba(pc,a), q, r, w, h, f, s, st, k;
    if(b.mode==='color')return base;
    if(b.mode==='gradient'){
      var g2=bgHex(b.g2,'#506EFF'), g3=bgHex(b.g3,'#14C8B4'), m=bgN(b.str==null?100:b.str,0,100,100)/100;
      if(b.grad==='glow')return 'radial-gradient(circle at 25% 30%, '+rgba(g2,Math.round(55*m)/100)+', transparent 55%), radial-gradient(circle at 80% 75%, '+rgba(g3,Math.round(35*m)/100)+', transparent 50%), '+base;
      if(b.grad==='down')return 'linear-gradient(180deg, '+base+', '+g2+')';
      return 'linear-gradient(135deg, '+base+', '+g2+')';
    }
    f=function(x){return Math.round(x*100)/100;};
    switch(b.pat){
      case 'dots':r=Math.max(1,f(S*0.085));return 'radial-gradient(circle, '+A+' '+r+'px, transparent '+f(r+0.6)+'px) 0 0/'+S+'px '+S+'px, '+base;
      case 'grid':q=Math.max(4,Math.round(S/4));
        return 'linear-gradient('+A+' 1px, transparent 1px) 0 0/'+S+'px '+S+'px, linear-gradient(90deg, '+A+' 1px, transparent 1px) 0 0/'+S+'px '+S+'px, '
          +'linear-gradient('+rgba(pc,f(a*0.4))+' 1px, transparent 1px) 0 0/'+q+'px '+q+'px, linear-gradient(90deg, '+rgba(pc,f(a*0.4))+' 1px, transparent 1px) 0 0/'+q+'px '+q+'px, '+base;
      case 'diag':w=Math.max(1,Math.round(S/6));return 'repeating-linear-gradient(45deg, '+A+' 0 '+w+'px, transparent '+w+'px '+S+'px), '+base;
      case 'stripes':h=f(S/2);return 'repeating-linear-gradient(-45deg, '+A+' 0 '+h+'px, transparent '+h+'px '+S+'px), '+base;
      case 'carbon':q=f(S/4);h=f(S/2);s=rgba(pc,a);st=rgba('#FFFFFF',f(a*0.12));
        return 'linear-gradient(27deg, '+s+' '+q+'px, transparent '+q+'px) 0 '+q+'px/'+S+'px '+S+'px, linear-gradient(207deg, '+s+' '+q+'px, transparent '+q+'px) '+h+'px 0/'+S+'px '+S+'px, '
          +'linear-gradient(27deg, '+st+' '+q+'px, transparent '+q+'px) 0 '+h+'px/'+S+'px '+S+'px, linear-gradient(207deg, '+st+' '+q+'px, transparent '+q+'px) '+h+'px '+q+'px/'+S+'px '+S+'px, '+base;
      case 'honey':
        r=S/2;w=f(Math.sqrt(3)*r);h=f(3*r);k='';
        [[0,0],[w,0],[w/2,1.5*r],[0,3*r],[w,3*r]].forEach(function(c){var pts=[], i, an;for(i=0;i<6;i++){an=Math.PI/180*(60*i-90);pts.push(f(c[0]+r*Math.cos(an))+','+f(c[1]+r*Math.sin(an)));}k+='<polygon points="'+pts.join(' ')+'"/>';});
        return bgUri('<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><g fill="none" stroke="'+pc+'" stroke-opacity="'+a+'" stroke-width="1.2">'+k+'</g></svg>')+' 0 0/'+w+'px '+h+'px, '+base;
      case 'circuit':
        k=function(x){return f(x*S);};
        return bgUri('<svg xmlns="http://www.w3.org/2000/svg" width="'+S+'" height="'+S+'"><g fill="none" stroke="'+pc+'" stroke-opacity="'+a+'" stroke-width="1.4" stroke-linecap="round">'
          +'<path d="M0 '+k(.25)+'H'+k(.3)+'L'+k(.45)+' '+k(.4)+'V'+k(.62)+'"/><path d="M'+k(.6)+' 0V'+k(.1)+'L'+k(.75)+' '+k(.25)+'H'+S+'"/><path d="M'+k(.6)+' '+S+'V'+k(.85)+'L'+k(.5)+' '+k(.75)+'"/><path d="M'+k(.12)+' '+k(.62)+'V'+k(.9)+'H'+k(.3)+'"/><path d="M'+k(.78)+' '+k(.5)+'H'+k(.92)+'"/>'
          +'</g><g fill="'+pc+'" fill-opacity="'+a+'"><circle cx="'+k(.45)+'" cy="'+k(.67)+'" r="'+f(Math.max(1.5,S*.035))+'"/><circle cx="'+k(.12)+'" cy="'+k(.58)+'" r="'+f(Math.max(1.5,S*.03))+'"/><circle cx="'+k(.74)+'" cy="'+k(.5)+'" r="'+f(Math.max(1.5,S*.03))+'"/><rect x="'+k(.3)+'" y="'+k(.86)+'" width="'+k(.08)+'" height="'+k(.08)+'"/></g></svg>')+' 0 0/'+S+'px '+S+'px, '+base;
    }
    return base;
  }
  function bgHTML(it){return '<span style="display:block;width:'+it.w+'px;height:'+it.h+'px;background:'+bgCss(it.p.bg||{mode:'color'})+';"></span>';}
  function bgItem(){for(var i=0;i<D.items.length;i++){var x=D.items[i];if(x.type==='frame'&&x.p&&x.p.mapBg)return x;}return null;}
  function bgFix(){   /* the background always covers the whole canvas and stays at the very back */
    var b=bgItem(), m=null;if(!b)return;
    b.x=0;b.y=0;b.w=D.w;b.h=D.h;b.parent=null;b.rot=0;
    D.items.forEach(function(x){if(x!==b){var o=ordOf(x);if(m===null||o<m)m=o;}});
    if(m!==null&&ordOf(b)>=m)b.ord=m-1;
  }
  function bgSet(v,live){
    var it=bgItem();
    if(!v){if(it){D.items=D.items.filter(function(x){return x!==it;});if(D.sel===it.id)D.sel=null;renderAll();buildForm();commit();}return;}
    if(!it){
      it={id:D.nextId++,type:'frame',parent:null,x:0,y:0,w:D.w,h:D.h,state:null,p:extend(newFrameP('Light card'),{title:'',fam:'',group:false,mapBg:true,bw:0,radius:0,shadow:'none',padx:0,pady:0})};
      it.ord=minOrd()-1;D.items.push(it);it.p.bg=v;renderAll();if(!live)commit();return;
    }
    it.p.bg=v;refreshItem(it);if(!live)commit();
  }
  var bgPop=null;
  function bgPopBuild(){
    var pop=bgPop, cur=(bgItem()||{p:{}}).p.bg||null, seg, grid, nt, list;
    if(!pop){pop=bgPop=document.createElement('div');pop.id='dbgpop';pop.hidden=true;(railBody||canvas.parentNode).appendChild(pop);
      ['mousedown','click','dblclick','keydown'].forEach(function(ev){pop.addEventListener(ev,function(e){e.stopPropagation();});});}
    pop.innerHTML='';
    nt=el_('p','gp-note');nt.textContent='A layer at the very back of the map that fills the gaps between your boxes. It is sent to PRTG with your other items.';pop.appendChild(nt);
    seg=el_('div','gp-seg');
    [['color','Colour'],['pattern','Pattern'],['gradient','Gradient']].forEach(function(o){var b=document.createElement('button');b.type='button';b.textContent=o[1];b.setAttribute('aria-pressed',BGTAB.tab===o[0]?'true':'false');if(BGTAB.tab===o[0])b.className='on';b.addEventListener('click',function(){BGTAB.tab=o[0];bgPopBuild();});seg.appendChild(b);});
    pop.appendChild(seg);
    grid=el_('div','bg-grid');
    list=(BGTAB.tab==='color')?BGSOLID.map(function(s){return {id:'c'+s[1],name:s[0],mode:'color',base:s[1]};}):BGPRE.filter(function(p){return p.mode===BGTAB.tab;});
    list.forEach(function(p){
      var on=!!cur&&(BGTAB.tab==='color'?(cur.mode==='color'&&bgHex(cur.base,'')===p.base):cur.id===p.id), b=document.createElement('button');
      b.type='button';b.className='bg-t'+(on?' on':'');b.setAttribute('aria-label',p.name+(on?' (chosen)':''));b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('data-tip',p.name);
      b.style.background=bgCss(p);
      b.addEventListener('click',function(){var v=JSON.parse(JSON.stringify(p));bgSet(v);bgPopBuild();});
      grid.appendChild(b);
    });
    pop.appendChild(grid);
    if(BGTAB.tab==='color'){
      var cl=el_('label','bg-f'), ci=document.createElement('input');ci.type='color';ci.value=(cur&&cur.mode==='color'?bgHex(cur.base,'#14163A'):'#14163A').toLowerCase();
      cl.appendChild(ci);cl.appendChild(document.createTextNode(' Pick any colour'));
      ci.addEventListener('input',function(){bgSet({id:'custom',mode:'color',base:ci.value.toUpperCase()},true);});
      ci.addEventListener('change',function(){bgSet({id:'custom',mode:'color',base:ci.value.toUpperCase()});bgPopBuild();});
      pop.appendChild(cl);
    }
    if(cur&&cur.mode!=='color'&&cur.mode===BGTAB.tab){
      var box=el_('div','bg-set'), t=el_('div','gp-l');t.textContent='Change '+(BGPRE.filter(function(p){return p.id===cur.id;})[0]||{name:'it'}).name.toLowerCase();box.appendChild(t);
      var fields=(cur.mode==='pattern')?[['base','Background','c'],['pc','Pattern colour','c'],['size','Pattern size','r',6,160],['str','Strength','r',0,100]]
        :[['base','Colour 1','c'],['g2','Colour 2','c']].concat(cur.grad==='glow'?[['g3','Colour 3','c'],['str','Strength','r',0,100]]:[]);
      fields.forEach(function(f){
        var l=el_('label','bg-f'+(f[2]==='r'?' bg-r':'')), i=document.createElement('input'), v=el_('span','bg-v');
        if(f[2]==='c'){i.type='color';i.value=bgHex(cur[f[0]],'#000000').toLowerCase();}
        else{i.type='range';i.min=f[3];i.max=f[4];i.step=1;i.value=String(cur[f[0]]==null?(f[0]==='str'?100:14):cur[f[0]]);v.textContent=(f[0]==='str')?(i.value+'%'):(i.value+' px');}
        var put=function(fin){var n=JSON.parse(JSON.stringify(cur));n[f[0]]=(f[2]==='c')?i.value.toUpperCase():parseInt(i.value,10);cur=n;if(f[2]==='r')v.textContent=(f[0]==='str')?(i.value+'%'):(i.value+' px');bgSet(n,!fin);};
        i.addEventListener('input',function(){put(false);});i.addEventListener('change',function(){put(true);});
        i.setAttribute('aria-label',f[1]);
        if(f[2]==='c'){l.appendChild(i);l.appendChild(document.createTextNode(' '+f[1]));}
        else{var top=el_('span','bg-rt');top.appendChild(document.createTextNode(f[1]));top.appendChild(v);l.appendChild(top);l.appendChild(i);}
        box.appendChild(l);
      });
      pop.appendChild(box);
    }
    if(cur){
      var bw=el_('div','gp-btns'), bn=document.createElement('button');bn.type='button';bn.className='btn ghost';bn.textContent='No background';
      bn.addEventListener('click',function(){bgSet(null);bgPopBuild();toastDash('Background removed');});bw.appendChild(bn);pop.appendChild(bw);
    }
    var n2=el_('p','gp-note');n2.textContent='The map’s own colour in PRTG is set with Background under Build. Patterns use only CSS; honeycomb and circuit are small SVG pictures inside that CSS.';pop.appendChild(n2);
    if(railBtns.bg){railBtns.bg.style.setProperty('--bgnow',cur?bgCss(cur):'transparent');railBtns.bg.classList.toggle('hasbg',!!cur);}
  }
  var _raBg=renderAll;renderAll=function(){bgFix();_raBg.apply(this,arguments);bgNow();};
  function bgNow(){   /* after undo, redo or a load: the swatch on the bar, and the panel if it is open and not being used */
    var b=bgItem(), c=b&&b.p.bg;
    if(railBtns&&railBtns.bg){railBtns.bg.style.setProperty('--bgnow',c?bgCss(c):'transparent');railBtns.bg.classList.toggle('hasbg',!!c);}
    if(RAIL&&RAIL.on==='bg'&&bgPop&&!bgPop.contains(document.activeElement))bgPopBuild();
  }
  document.addEventListener('dsize',function(){var b=bgItem();if(b&&(b.w!==D.w||b.h!==D.h)){bgFix();refreshItem(b);}});
  /* ---- 1.5.70: the slim bar on the right of the canvas. Its panel slides out over the canvas and stays open while you work ---- */
  var railEl=document.getElementById('drail'), railPanel=document.getElementById('drpanel'), railBody=document.getElementById('drbody'), railTitle=document.getElementById('drtitle'), railBtns={}, RAIL={on:null};
  var RAILT={layouts:'Layouts',bg:'Background',grid:'Grid and snapping'};
  if(railEl)[].forEach.call(railEl.querySelectorAll('[data-rail]'),function(b){railBtns[b.getAttribute('data-rail')]=b;b.addEventListener('click',function(e){e.stopPropagation();railOpen(b.getAttribute('data-rail'));});});
  function railOpen(k,keep){
    if(!railPanel)return;
    if(RAIL.on===k&&!keep){railClose();return;}
    RAIL.on=k;
    if(k==='layouts'){D.sel=null;msClear();updateSel();buildForm();}
    railPaint();
    try{railPanel.querySelector('#drclose').focus({preventScroll:true});}catch(e){}
  }
  function railClose(){RAIL.on=null;railPaint();}
  function railTop(){   /* the panel starts under the canvas toolbar, so Undo, Redo and the other buttons stay in reach */
    if(!railEl||!RAIL.on)return;
    var hd=document.querySelector('#dashstage .stage-head'), top=10, r, m;
    if(hd&&hd.offsetParent){r=hd.getBoundingClientRect();m=railEl.getBoundingClientRect();top=Math.max(10,Math.round(r.bottom-m.top+8));}
    railEl.style.setProperty('--drtop',top+'px');
  }
  (function(){var st=document.getElementById('stage');if(st)st.addEventListener('scroll',railTop,{passive:true});window.addEventListener('resize',railTop);})();
  function railPaint(){
    var k=RAIL.on;
    if(k==='layouts')layPopBuild();else if(k==='grid')gridPopBuild();else if(k==='bg')bgPopBuild();
    if(layPop)layPop.hidden=k!=='layouts';
    if(gridPop)gridPop.hidden=k!=='grid';
    if(bgPop)bgPop.hidden=k!=='bg';
    railTop();railPanel.classList.toggle('open',!!k);railPanel.setAttribute('aria-hidden',k?'false':'true');
    if('inert' in railPanel)railPanel.inert=!k;
    if(railTitle)railTitle.textContent=k?RAILT[k]:'';
    Object.keys(railBtns).forEach(function(n){railBtns[n].setAttribute('aria-pressed',n===k?'true':'false');});
    if(layBtn)layBtn.classList.toggle('on',k==='layouts');
    if(gridBtn)gridBtn.classList.toggle('on',k==='grid');
  }
  if(railPanel){
    ['mousedown','click','dblclick','keydown'].forEach(function(ev){railPanel.addEventListener(ev,function(e){if(ev==='keydown'&&e.key==='Escape'){railClose();try{railBtns[Object.keys(railBtns)[0]].focus();}catch(x){}}e.stopPropagation();});});
    var rc=document.getElementById('drclose');if(rc)rc.addEventListener('click',function(){railClose();});
  }
  if(layBtn)layBtn.addEventListener('click',function(e){e.stopPropagation();railOpen('layouts');});
  if(gridBtn)gridBtn.addEventListener('click',function(e){e.stopPropagation();railOpen('grid');});
  bgPopBuild();
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
    if(A.prtg)return acc('Link',[wt,wm,wu,rm,el_('p','note','PRTG\u2019s External Link for this item: clicking it on the map opens the map or address. A map or another PRTG page opens in the same tab, any other website in a new tab. Leave it empty for no link.')],!!A.g('link'));
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
    if(it.type==='frame'&&it.p.mapBg){
      formEl.appendChild(el_('h4',null,'Map background'));
      formEl.appendChild(el_('p','note pst','The colour or pattern behind the whole map. Change it with Background, on the bar at the right of the canvas.'));
      var bgo=el_('button','btn ghost','Open Background');bgo.type='button';bgo.addEventListener('click',function(){railOpen('bg',true);});formEl.appendChild(bgo);
      inlSync();return;
    }
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
      if(it.type==='prtgobj'){var olk=linkSec(it);if(olk)formEl.appendChild(olk);formEl.appendChild(acc('Advanced',[geoFs],false));syncCode();inlSync();return;}   /* nothing to paste for an object PRTG draws */
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
      T[3].forEach(function(c,j){var x=4+(c[0]/T[1])*92, ww=(c[2]/T[1])*92, y=4+(c[1]/T[2])*(vh-8), hh=(c[3]/T[2])*(vh-8);if(j===0&&layHasBanner(T)){s2+=layTitleCell(x,y,ww,hh);return;}s2+='<rect x="'+(x+1)+'" y="'+(y+1)+'" width="'+Math.max(1,ww-2)+'" height="'+Math.max(1,hh-2)+'" rx="2" fill="'+tones[j%tones.length]+'"/>';});
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
      var nb=layBannerEnsure();if(nb){var c0=layCells()[0];if(c0)layPut(nb,c0,0);D.sel=nb.id;renderAll();buildForm();}
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
        /* 1.5.76: a Map Studio icon on a probe, group or device gets PRTG's rollup flags on the element itself
           ("map_objectstate_hasred ... map_objectstate_hasgreen", with "hasno..." for the others), not on an inner
           label. Seen on map 4823 (amer.prtglab.com): every line between such icons stayed grey. Worst state wins. */
        var oc=String(elx.className||''), oi;
        for(oi=0;oi<ICOLORDER.length;oi++){
          if(new RegExp('\\bmap_objectstate_has'+ICOLORDER[oi]+'\\b').test(oc))return ICOLMAP[ICOLORDER[oi]];
        }
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
      /* PRTG replaces the whole map, #mapsvg included, on every refresh (about every 30 s), and a new <svg> starts its animation clock at 0, so every moving line jumped back to its start. Each new #mapsvg is set to one clock kept on the top page (the public page reloads its frame), so the movement carries on. */
      function msClock(svg){try{var w=window,c;try{if(window.top&&window.top.document)w=window.top;}catch(x){}c=w.__msClock||(w.__msClock=Date.now());if(svg&&svg.setCurrentTime&&!svg.__msClk){svg.__msClk=1;svg.setCurrentTime((Date.now()-c)/1000);}}catch(e){}}
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
        msClock(svg);
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
