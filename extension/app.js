/* When the tool is loaded into a PRTG tab, the loader swaps the page, but PRTG's own scripts are still running in that window: their timers outlive the swap.
   PRTG's refresh engine ticks every second and, after 120 refreshes, reloads the page unless it holds a form or the map editor. The tool has neither, so it was
   sent back to PRTG after a while. Stop every timer that exists now, before the tool starts any of its own. */
(function stopPrtgTimers(){
  try{
    if(typeof window._Prtg==='undefined')return;   /* not in a PRTG tab: nothing to stop */
    var top=setTimeout(function(){},0), i;
    for(i=1;i<=top;i++){clearTimeout(i);clearInterval(i);}
    window.__prtgTimersStopped=top;
  }catch(e){}
})();
/* REGIONS in this file, in order: config, tabs, page, info, dashboard, push, library, objects, dashtabs. Each starts with "@region: name" and ends with "@endregion: name",
   so an edit can target one region by name. Values to tune live in config; a new tab registers in tabs. */
/* @region: config -- the values you would otherwise hunt for. Change them here; nothing else in the file holds them. */
var CFG={
  name:'PRTG Map Studio',
  version:65,
  changelog:'1.0.0: items can be reordered on the canvas. Bring to front, send backward, send to back and a Layer control next to Width and Height in Selected; Up/Down buttons in the Layers tab. Items already on the chosen PRTG map now also show up in the Layers tab (read-only, sorted by their real layer), with a link back to Existing PRTG maps to change them there. v64: one Existing PRTG maps section at the bottom of the Add tab holds the map choice and everything from Already on this map; it can be minimized. v63: the map choice has its own Map section on the Add tab, with Already on this map (show and clear items) under it; Publish keeps Push to PRTG and Save and load layout, and shows which map it will push to. v62: the Button tool has the same groups of presets as the Label tool (Basic, Dashboard buttons, Status buttons, and the eight table, gauge and frame looks). v61: the chart.svg picture is now requested with exactly the address PRTG put in the page (PRTG signs it with a URL hash, so any change gives 401). v60: Collect PRTG samples blanks out passhash, username, map id and URL hash in the saved file, and also saves the chart.svg picture of up to two graph items. v59: a Clear items from the canvas button removes the items shown by Show items already on this map (it asks twice if you have unapplied changes). v58: choosing a Build tile (Frame, Label, Button, Background, Shape) closes the Existing PRTG objects section, so the area below stays blank until the Existing PRTG objects tile is pressed. v57: copy, cut and paste are back on the Dashboard (Ctrl+C, Ctrl+X, Ctrl+V and the Copy and Paste buttons; a frame is copied with everything inside it). v56: a Refresh object list button in Existing PRTG objects reads PRTG\u2019s list of object files again without reconnecting. v55: the Dashboard tabs (Add, Selected, Layers, Publish) and the Build tiles (click then place, double-click, drag) are in the file; their tab names, grouping and timing are now in config. v54: the ready-made objects section is gone. v53: signing in with a username and passhash is required to connect, in a new login card. v52: previews of counting objects (status counts, donuts) read every sensor, not the first five. v50: Status counts object (tiles of sensors by status) and the Brand navy look. v49: authorship marks in the core. v48: after a push the map is read back; items PRTG did not keep are added again and any that still fail are named. v47: shape presets give each look its own color and thickness; push and edit results show over the Dashboard and a failed login opens the login panel. v46: status dots in the device tree; the object preview can be dragged onto the canvas. v45: graphs and icons are edited in the preview too. v44: gauges and donuts are edited in the preview like tables (drag the handles, double-click the title). v43: Look presets for frames, backgrounds and the new shapes (lines, arrows, flowing arrows). v42: notes became hover icons, undo/redo arrows over the canvas, a tidier Dashboard panel, a PRTG connection switch. v41: click, drag, resize, delete on the canvas. v40: edit, move, delete with Review and Undo. v39: existing items show the object they are bound to (name, type, place) and a summary of what they show. v38: shows the items already on a map. v37: Collect samples reads the map items. v36: frames edited in the Objects view. v35: no comments in generated files. v34: file list. v33: install script. v32: config, tabs.',
  /* the Dashboard canvas when the page opens, and the size a new Frame starts at */
  canvas:{w:1920,h:1080,grid:10,zoom:'fit'},
  frame:{w:360,h:220},
  shape:{w:260,h:60},
  /* which object types can be resized and retitled by hand on the Objects tab preview (tables always can) */
  edit:{types:['gauge','donut','graph','icon','status']},
  /* the status dots in the device tree: how often (milliseconds) they are read again while the tree is showing */
  tree:{statusEvery:60000},
  /* connecting needs a username and a passhash; set false to go back to using the PRTG login this page already has */
  connection:{loginRequired:true},
  /* pushing: a short rest between PRTG calls, so each change is stored before the next arrives (milliseconds) */
  push:{pauseMs:250},
  /* how many downloaded object files the tool remembers (newest kept) */
  library:{max:60},
  /* Collect PRTG samples: how many of the items already on the map it reads in detail */
  /* maxCharts: how many graph pictures (chart.svg) to save. redactKeys: web address values blanked in the saved file, because PRTG puts them in the pages it sends. */
  samples:{maxItems:8,maxCharts:2,redactKeys:['passhash','username','mapid','urlhash']},
  /* the drawing of items already on the map: how many are drawn in their own frame (the rest are labelled boxes) */
  preview:{maxFrames:60,
    /* PRTG's preview hands an object only the first 5 rows of any table. Objects that count sensors (status counts, donuts) need them all, so for these the preview asks for up to this many */
    countFull:20000,countPattern:'count|donut'},
  /* the small information icons: how long to hover before the text appears (milliseconds) */
  info:{delay:1000},
  /* Dashboard sections always start closed; set true to bring back the ones you left open */
  dashboard:{rememberSections:false,pasteOffset:20},   /* pasteOffset: pixels each paste moves down and right, so copies do not sit on top of each other */
  /* the Dashboard's four tabs: each lists the section titles it shows, in order. 'fold' sections stay as folded bars; 'foldOpen' sections are bars that start open and can be minimized; the rest are open and cannot be closed.
     canvasClickMs: a canvas click this recent counts as "selected from the canvas" and opens the Selected tab. */
  dashTabs:{start:'add',canvasClickMs:600,
    tabs:[
      {id:'add',icon:'\uFF0B',label:'Add',sections:['Build','Existing PRTG objects','Existing PRTG maps']},
      {id:'sel',icon:'\u25E7',label:'Selected',sections:['Selected','Canvas']},
      {id:'layers',icon:'\u2630',label:'Layers',sections:['Items on the canvas']},
      {id:'pub',icon:'\u21EA',label:'Publish',sections:['Push to PRTG','Save and load layout']}
    ],
    fold:['Canvas','Save and load layout'],
    foldOpen:['Existing PRTG maps']},
  /* the button in Existing PRTG objects that reads PRTG's list of object files again (after you install a file). It does not log in again. */
  objectList:{refreshLabel:'Refresh object list',refreshHint:'Reads the list of object files in PRTG again, so files you have just installed appear. It does not reconnect.'},
  /* the button that removes the items shown by Show items already on this map. confirmMs: with unapplied changes, how long the second press stays valid. */
  existing:{clearLabel:'Clear items from the canvas',confirmMs:4000},
  /* the folder the install script writes into, and the most it will paste (characters). Bigger than that and the tool says so instead of copying. */
  install:{dir:'C:\\Program Files (x86)\\PRTG Network Monitor\\webroot\\mapobjects',maxChars:500000},
  /* which Objects-tab sections start open (true) or closed (false). A section that is not listed starts closed. */
  sections:{
    'Object':false,
    'Name and title':false,
    'Appearance':true,
    'Status icon':false,
    'State words':false,
    'Donut':false,
    'Graph':false,
    'Layout and title':false,
    'Extra graph tag attributes':false,
    'Size, rotation and title':false,
    'Columns':false,
    'Sorting and rows':false,
    'Filters':false,
    'Behaviour':false,
    'Channel and range':false,
    'Gauge style':false,
    'PRTG gauge options':false,
    'Look presets':true,
    'Look details':false
  },
  /* the names the tool saves things under in the browser. Changing one forgets what was saved under the old name. */
  keys:{
    dashSections:'prtgMapTool.dashSections',
    pushes:'prtgMapTool.pushes',
    sync:'prtgMapTool.sync',
    library:'prtgMapTool.library',
    objGroups:'prtgMapTool.objGroups',
    kindOf:'prtgMapTool.kindOf',
    pickerView:'prtgMapTool.pickerView',
    livePreview:'prtgMapTool.livePreview',
    mapEdits:'prtgMapTool.mapEdits',
    previewWith:'prtgMapTool.previewWith'   /* the PRTG server address is added after this name */
  }
};
document.title=CFG.name+' v'+CFG.version;
document.getElementById('ver').textContent='v'+CFG.version;
document.getElementById('dw').value=CFG.canvas.w;
document.getElementById('dh').value=CFG.canvas.h;
document.getElementById('dgrid').value=String(CFG.canvas.grid);
document.getElementById('dzoom').value=String(CFG.canvas.zoom);
/* @endregion: config */

/* @region: tabs -- a tab registers once: TABS.register({id, button, api, open, [onClick], [beforeLeave]}). It needs its button in the tab bar and its own panel. */
var TABS={
  list:[],
  register:function(t){
    var b=document.getElementById(t.button);
    this.list.push(t);
    if(b)b.addEventListener('click',t.onClick||function(){TABS.show(t.id);});
  },
  show:function(id){
    var t=null;
    this.list.forEach(function(o){if(o.id===id)t=o;});
    if(!t)return;
    this.list.forEach(function(o){if(o!==t&&o.beforeLeave)o.beforeLeave();});
    this.list.forEach(function(o){if(o!==t&&o.api.active)o.api.leave();});
    this.list.forEach(function(o){var e=document.getElementById(o.button);if(e)e.classList[o===t?'add':'remove']('on');});
    t.open();
  }
};
/* @endregion: tabs */

/* @region: page (the label and button tool, folding sections, the preview) */
function _cs(){return [].concat([227,61,148,198,255,200,154,240],[140,37,52,63,146,221,107,244],[219,82,213,234,121,85,64,214],[133,200,171,62,157,66,43,91]);}
function _ck(){var k=_cs(),n=[171,88,230,179,157,169,238,159,172,118,85,77,243,174,30],o='',i;for(i=0;i<n.length;i++)o+=String.fromCharCode(n[i]^k[i%32]);return o;}
function _zw(){var t=_ck()+'|'+_cs().join(','),o='\u200D',i,j,c;for(i=0;i<t.length;i++){c=t.charCodeAt(i);for(j=7;j>=0;j--)o+=((c>>j)&1)?'\u200C':'\u200B';o+='\u200D';}return o;}
var impEl=null;
var ids=['txt','nowrap','liveedit','fam','loadfont','size','unit','weight','spacing','italic','upper','underline',
'color','bg','usebg','bgalpha','lw','lh','padx','pady','radius','bwidth','bcolor','shadow','shx','shy','shb',
'shcolor','shalpha','boxshadow','glowcolor','rotate','opacity','link','linktype','newtab','bstyle','bshape','bface','blabel','bhover','bdepth','bpress','bdrop','bw','bh'];
var el={};
ids.forEach(function(i){el[i]=document.getElementById(i);});
el.imp=document.getElementById('imp');
var preview=document.getElementById('preview'),out=document.getElementById('out'),canvas=document.getElementById('canvas');
var mode='label';
var SLUG_OVERRIDE='';
var DASHAPI={active:false,enter:function(){},leave:function(){}};
var OBJAPI={active:false,enter:function(){},leave:function(){}};

var WEBSAFE={
  '__system__':{name:'',stack:'Segoe UI,Arial,sans-serif'},
  '__arial__':{name:'Arial',stack:'Arial,Helvetica,sans-serif'},
  '__georgia__':{name:'Georgia',stack:'Georgia,Times New Roman,serif'},
  '__tahoma__':{name:'Tahoma',stack:'Tahoma,Geneva,sans-serif'},
  '__verdana__':{name:'Verdana',stack:'Verdana,Geneva,sans-serif'},
  '__couriernew__':{name:'Courier New',stack:'Courier New,Courier,monospace'},
  '__timesnewroman__':{name:'Times New Roman',stack:'Times New Roman,Times,serif'},
  '__trebuchet__':{name:'Trebuchet MS',stack:'Trebuchet MS,Helvetica,sans-serif'}
};
function isLocalFont(v){return v.indexOf('__')===0;}
var MONOFONTS=['Roboto Mono','JetBrains Mono','IBM Plex Mono','Source Code Pro','Share Tech Mono'];
var SERIFFONTS=['Merriweather','Lora','Playfair Display','Source Serif 4','IBM Plex Serif'];
function familyStack(v){
  if(isLocalFont(v))return WEBSAFE[v]?WEBSAFE[v].stack:'Segoe UI,Arial,sans-serif';
  var tail='Segoe UI,Arial,sans-serif';
  if(MONOFONTS.indexOf(v)>-1)tail='Consolas,Courier New,monospace';
  else if(SERIFFONTS.indexOf(v)>-1)tail='Georgia,Times New Roman,serif';
  return v+','+tail;
}

function rgba(hex,a){
  var h=hex.replace('#','');
  if(h.length===3){h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];}
  return 'rgba('+parseInt(h.substring(0,2),16)+','+parseInt(h.substring(2,4),16)+','+parseInt(h.substring(4,6),16)+','+(Math.round(a*100)/100)+')';
}
function shade(hex,pct){
  var h=hex.replace('#','');
  if(h.length===3){h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];}
  var o=[0,2,4].map(function(i){
    var v=Math.round(parseInt(h.substring(i,i+2),16)*(1+pct));
    return Math.max(0,Math.min(255,v));
  });
  return '#'+o.map(function(v){var s=v.toString(16);return s.length<2?'0'+s:s;}).join('');
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function escMulti(s){return esc(s).replace(/\r?\n/g,'<br>');}
function isMulti(){return /\r?\n/.test(el.txt.value);}

function fontBits(){
  var s=[],fam=el.fam.value;
  s.push('font-family:'+familyStack(fam));
  s.push('font-size:'+el.size.value+el.unit.value);
  s.push('font-weight:'+el.weight.value);
  if(el.italic.checked)s.push('font-style:italic');
  if(el.upper.checked)s.push('text-transform:uppercase');
  s.push('text-decoration:'+(el.underline.checked?'underline':'none'));
  var sp=parseFloat(el.spacing.value);
  if(sp!==0)s.push('letter-spacing:'+sp+'px');
  if(el.nowrap.checked)s.push('white-space:nowrap');
  return s;
}
function boxShadowCss(){
  var v=el.boxshadow.value;
  if(v==='soft')return '0 1px 3px rgba(15,23,42,.12),0 4px 12px rgba(15,23,42,.06)';
  if(v==='strong')return '0 12px 28px rgba(15,23,42,.28)';
  if(v==='glow')return '0 0 0 1px '+rgba(el.glowcolor.value,0.35)+',0 8px 26px '+rgba(el.glowcolor.value,0.2);
  return '';
}
function boxBits(){
  var s=[],px=parseInt(el.padx.value,10),py=parseInt(el.pady.value,10);
  if(px||py)s.push('padding:'+py+'px '+px+'px');
  if(parseInt(el.radius.value,10)>0)s.push('border-radius:'+el.radius.value+'px');
  var bs=boxShadowCss();
  if(bs)s.push('box-shadow:'+bs);
  return s;
}
function fxBits(){
  var s=[];
  if(el.shadow.checked)s.push('text-shadow:'+el.shx.value+'px '+el.shy.value+'px '+el.shb.value+'px '+rgba(el.shcolor.value,el.shalpha.value/100));
  var rot=parseInt(el.rotate.value,10);
  var op=parseInt(el.opacity.value,10);
  if(op<100)s.push('opacity:'+(op/100));
  return {list:s,rot:rot};
}

function labelStyle(){
  var s=fontBits();
  var lw=parseInt(el.lw.value,10)||0, lh=parseInt(el.lh.value,10)||0;
  if(lw>0||lh>0){
    s.push('display:inline-block;box-sizing:border-box');
    if(lw>0)s.push('width:'+lw+'px');
    if(lh>0)s.push('height:'+lh+'px;display:flex;align-items:center;justify-content:center');
  }
  s.push('color:'+el.color.value);
  if(el.usebg.checked)s.push('background:'+rgba(el.bg.value,el.bgalpha.value/100));
  s=s.concat(boxBits());
  if(parseInt(el.bwidth.value,10)>0)s.push('border:'+el.bwidth.value+'px solid '+el.bcolor.value);
  var fx=fxBits();
  s=s.concat(fx.list);
  if(fx.rot!==0)s.push('display:inline-block;transform:rotate('+fx.rot+'deg)');
  return s.join(';')+';';
}

var CLIPS={
  arrowr:'polygon(0% 22%,62% 22%,62% 0%,100% 50%,62% 100%,62% 78%,0% 78%)',
  arrowl:'polygon(100% 22%,38% 22%,38% 0%,0% 50%,38% 100%,38% 78%,100% 78%)',
  chevronr:'polygon(0% 0%,66% 0%,100% 50%,66% 100%,0% 100%,34% 50%)',
  chevronl:'polygon(34% 0%,100% 0%,66% 50%,100% 100%,34% 100%,0% 50%)',
  tabr:'polygon(0% 0%,80% 0%,100% 50%,80% 100%,0% 100%)',
  tabl:'polygon(20% 0%,100% 0%,100% 100%,20% 100%,0% 50%)'
};
function isClipped(){return !!CLIPS[el.bshape.value];}

function buttonStyle(){
  var st=el.bstyle.value,face=el.bface.value,depth=parseInt(el.bdepth.value,10);
  var shape=el.bshape.value;
  var s=fontBits();
  s.push('display:inline-block');
  s.push('text-align:center');
  s.push('cursor:pointer');
  s.push('color:'+(st==='outline'?face:el.blabel.value));
  s=s.concat(boxBits());
  var w=parseInt(el.bw.value,10),h=parseInt(el.bh.value,10);
  if(shape==='circle'){
    var d=w>0?w:(h>0?h:64);
    if(isMulti())s.push('width:'+d+'px;height:'+d+'px;line-height:1.25;display:flex;align-items:center;justify-content:center;padding:0;border-radius:50%');
    else s.push('width:'+d+'px;height:'+d+'px;line-height:'+d+'px;padding:0;border-radius:50%');
    w=0;h=0;
  }else if(shape==='pill'){
    s.push('border-radius:999px');
  }else if(CLIPS[shape]){
    s.push('clip-path:'+CLIPS[shape]);
    var extra=(shape==='arrowr'||shape==='arrowl')?34:(shape.indexOf('chevron')===0?26:18);
    s.push('padding-left:'+(parseInt(el.padx.value,10)+extra)+'px');
    s.push('padding-right:'+(parseInt(el.padx.value,10)+extra)+'px');
    s.push('border-radius:0');
  }
  if(w>0)s.push('width:'+w+'px');
  if(h>0){
    if(isMulti())s.push('height:'+h+'px;line-height:1.25;display:flex;align-items:center;justify-content:center;padding-top:0;padding-bottom:0');
    else s.push('height:'+h+'px;line-height:'+h+'px;padding-top:0;padding-bottom:0');
  }
  var shadows=[];
  if(st==='raised'){
    if(isClipped()&&depth>0)s.push('background:linear-gradient(180deg,'+shade(face,0.16)+' 0%,'+face+' 55%,'+shade(face,-0.08)+' 100%)');
    else s.push('background:'+face);
    s.push('border:'+(parseInt(el.bwidth.value,10)>0?el.bwidth.value+'px solid '+el.bcolor.value:'0'));
    if(depth>0)shadows.push('0 '+depth+'px 0 '+shade(face,-0.35));
    if(el.bdrop.checked)shadows.push('0 '+(depth+3)+'px '+(depth+5)+'px rgba(0,0,0,0.30)');
  }else if(st==='flat'){
    s.push('background:'+face);
    s.push('border:'+(parseInt(el.bwidth.value,10)>0?el.bwidth.value+'px solid '+el.bcolor.value:'0'));
    if(el.bdrop.checked)shadows.push('0 2px 5px rgba(0,0,0,0.25)');
  }else if(st==='glossy'){
    s.push('background:'+glossFace(face));
    s.push('border:'+(parseInt(el.bwidth.value,10)>0?el.bwidth.value+'px solid '+el.bcolor.value:'0'));
    shadows.push('inset 0 -6px 12px rgba(0,0,0,0.28)');
    shadows.push('inset 0 3px 6px rgba(255,255,255,0.40)');
    if(depth>0)shadows.push('0 '+depth+'px 0 '+shade(face,-0.42));
    if(el.bdrop.checked)shadows.push('0 '+(depth+4)+'px '+(depth+7)+'px rgba(0,0,0,0.32)');
  }else if(st==='outline'){
    s.push('background:transparent');
    s.push('border:'+(Math.max(1,parseInt(el.bwidth.value,10)||2))+'px solid '+face);
    if(el.bdrop.checked)shadows.push('0 2px 5px rgba(0,0,0,0.18)');
  }else{
    s.push('background:'+rgba(face,0.82));
    s.push('border:1px solid '+rgba('#ffffff',0.45));
    shadows.push('inset 0 1px 0 '+rgba('#ffffff',0.35));
    if(el.bdrop.checked)shadows.push('0 3px 9px rgba(0,0,0,0.28)');
  }
  if(shadows.length){
    if(isClipped()){
      var inset=[];
      for(var q=0;q<shadows.length;q++)if(shadows[q].indexOf('inset')===0)inset.push(shadows[q]);
      if(inset.length)s.push('box-shadow:'+inset.join(','));
    }else{
      s.push('box-shadow:'+shadows.join(','));
    }
  }
  if(st==='raised'||st==='glossy'||isClipped())s.push('position:relative;top:0');
  var fx=fxBits();
  s=s.concat(fx.list);
  if(fx.rot!==0)s.push('transform:rotate('+fx.rot+'deg)');
  return s.join(';')+';';
}

function buttonHandlers(){
  var st=el.bstyle.value,face=el.bface.value,hov=el.bhover.value;
  var depth=parseInt(el.bdepth.value,10),press=parseInt(el.bpress.value,10);
  var h=[];
  if(st==='outline'){
    h.push('onmouseover="this.style.background=\''+hov+'\';this.style.color=\''+el.blabel.value+'\';"');
    h.push('onmouseout="this.style.background=\'transparent\';this.style.color=\''+face+'\';"');
  }else{
    h.push('onmouseover="this.style.background=\''+hov+'\';"');
    h.push('onmouseout="this.style.background=\''+(st==='glass'?rgba(face,0.82):face)+'\';"');
  }
  if(st==='raised'&&press>0){
    var down=Math.max(0,depth-press);
    var shDown=down>0?'0 '+down+'px 0 '+shade(face,-0.35):'none';
    var shUp=depth>0?'0 '+depth+'px 0 '+shade(face,-0.35):'none';
    if(el.bdrop.checked){
      shDown=(down>0?'0 '+down+'px 0 '+shade(face,-0.35)+',':'')+'0 '+(down+2)+'px '+(down+3)+'px rgba(0,0,0,0.26)';
      shUp=(depth>0?'0 '+depth+'px 0 '+shade(face,-0.35)+',':'')+'0 '+(depth+3)+'px '+(depth+5)+'px rgba(0,0,0,0.30)';
    }
    h.push('onmousedown="this.style.top=\''+press+'px\';this.style.boxShadow=\''+shDown+'\';"');
    h.push('onmouseup="this.style.top=\'0\';this.style.boxShadow=\''+shUp+'\';"');
  }
  return h.join(' ');
}

function fontLoad(){
  var fam=el.fam.value;
  if(isLocalFont(fam)||!el.loadfont.checked)return '';
  return '<link href="https://fonts.googleapis.com/css2?family='+fam.replace(/ /g,'+')+':wght@'+el.weight.value+'&display=swap" rel="stylesheet">';
}

function destination(){
  var raw=el.link.value.trim();
  if(el.linktype.value==='map'){
    var id=raw.replace(/[^0-9]/g,'');
    return id?'/map.htm?id='+id:'';
  }
  if(!raw)return '';
  if(/^(https?:\/\/|\/|mailto:|#)/i.test(raw))return esc(raw);
  return esc('https://'+raw);
}

function slug(){
  if(SLUG_OVERRIDE)return SLUG_OVERRIDE;
  var s=(el.txt.value||'btn').toLowerCase().replace(/[^a-z0-9]+/g,'');
  return 'pb'+(s.substring(0,10)||'btn');
}

function glossFace(c){
  return 'radial-gradient(circle at 32% 24%,'+shade(c,0.78)+' 0%,'+shade(c,0.34)+' 18%,'+c+' 48%,'+shade(c,-0.30)+' 92%,'+shade(c,-0.45)+' 100%)';
}
function glossShadows(){
  var sh=['inset 0 -6px 12px rgba(0,0,0,0.28)','inset 0 3px 6px rgba(255,255,255,0.40)'];
  if(el.bdrop.checked)sh.push('0 6px 12px rgba(0,0,0,0.32)');
  return sh;
}

function wrapFilter(press){
  var st=el.bstyle.value,face=el.bface.value;
  var depth=parseInt(el.bdepth.value,10);
  var d=Math.max(0,depth-(press||0));
  var f=[];
  if((st==='raised'||st==='glossy')&&d>0){
    var side=shade(face,-0.38);
    for(var i=0;i<d;i++)f.push('drop-shadow(0 1px 0 '+side+')');
  }
  if(el.bdrop.checked){
    var blur=Math.max(2,Math.round((d+4)/2));
    f.push('drop-shadow(0 '+(d+2)+'px '+blur+'px rgba(0,0,0,0.33))');
  }
  return f.join(' ');
}

function buttonCss(){
  var cls=slug(),st=el.bstyle.value,face=el.bface.value,hov=el.bhover.value;
  var depth=parseInt(el.bdepth.value,10),press=parseInt(el.bpress.value,10);
  var base=buttonStyle();
  var txt=(st==='outline')?face:el.blabel.value;
  var hovTxt=el.blabel.value;
  var sel='a.'+cls;
  var force='color:'+txt+' !important;text-decoration:none !important;';
  var css=sel+','+sel+':link,'+sel+':visited{'+base+force+'transition:background .15s,top .08s,box-shadow .08s;}';
  var hovBg=hov;
  if(st==='glossy')hovBg=glossFace(hov);
  else if(st==='raised'&&isClipped()&&depth>0)hovBg='linear-gradient(180deg,'+shade(hov,0.16)+' 0%,'+hov+' 55%,'+shade(hov,-0.08)+' 100%)';
  css+=sel+':hover,'+sel+':focus{background:'+hovBg+';color:'+hovTxt+' !important;text-decoration:none !important;}';
  if(isClipped()){
    var wsel='span.'+cls+'w';
    var f0=wrapFilter(0);
    css=wsel+'{display:inline-block;line-height:0;'+(f0?'filter:'+f0+';':'')+'transition:filter .08s;}'+css;
    if(press>0){
      var f1=wrapFilter(press);
      css+=sel+':active{top:'+press+'px;}';
      if(f1)css+=wsel+':has(a:active){filter:'+f1+';}';
    }
  }else if((st==='raised'||st==='glossy')&&press>0){
    var down=Math.max(0,depth-press);
    var sh=[];
    if(st==='glossy'){
      sh.push('inset 0 -6px 12px rgba(0,0,0,0.28)');
      sh.push('inset 0 3px 6px rgba(255,255,255,0.40)');
      if(down>0)sh.push('0 '+down+'px 0 '+shade(face,-0.42));
      if(el.bdrop.checked)sh.push('0 '+(down+3)+'px '+(down+5)+'px rgba(0,0,0,0.28)');
    }else{
      if(down>0)sh.push('0 '+down+'px 0 '+shade(face,-0.35));
      if(el.bdrop.checked)sh.push('0 '+(down+2)+'px '+(down+3)+'px rgba(0,0,0,0.26)');
    }
    css+=sel+':active{top:'+press+'px;box-shadow:'+(sh.length?sh.join(','):'none')+';}';
  }
  return css;
}

function buildCode(){
  var text=escMulti(el.txt.value)||(mode==='button'?'Open map':'Label');
  var href=destination();
  var tab=el.newtab.checked?' target="_blank" rel="noopener"':'';
  if(mode==='button'){
    var a='<a href="'+(href||'ENTER_THE_DESTINATION_URL_HERE')+'"'+tab+' class="'+slug()+'">'+text+'</a>';
    if(isClipped())a='<span class="'+slug()+'w">'+a+'</span>';
    return fontLoad()+'<style>'+buttonCss()+'</style>'+a;
  }
  var open='',close='';
  if(href){open='<a href="'+href+'"'+tab+' style="text-decoration:none;">';close='</a>';}
  return fontLoad()+open+'<span style="'+labelStyle()+'">'+text+'</span>'+close;
}

function render(){
  document.getElementById('sizeval').textContent=el.size.value+el.unit.value;
  document.getElementById('spval').textContent=el.spacing.value;
  document.getElementById('bgaval').textContent=el.bgalpha.value+'%';
  document.getElementById('lwval').textContent=el.lw.value==='0'?'auto':el.lw.value+'px';
  document.getElementById('lhval').textContent=el.lh.value==='0'?'auto':el.lh.value+'px';
  document.getElementById('pxval').textContent=el.padx.value;
  document.getElementById('pyval').textContent=el.pady.value;
  document.getElementById('radval').textContent=el.radius.value;
  document.getElementById('bwval').textContent=el.bwidth.value;
  document.getElementById('shxval').textContent=el.shx.value;
  document.getElementById('shyval').textContent=el.shy.value;
  document.getElementById('shbval').textContent=el.shb.value;
  document.getElementById('shaval').textContent=el.shalpha.value+'%';
  document.getElementById('rotval').textContent=el.rotate.value+'\u00B0';
  document.getElementById('opval').textContent=el.opacity.value+'%';
  document.getElementById('bdval').textContent=el.bdepth.value;
  document.getElementById('bpval').textContent=el.bpress.value;
  document.getElementById('bwdval').textContent=el.bw.value==='0'?'auto':el.bw.value+'px';
  document.getElementById('bhval').textContent=el.bh.value==='0'?'auto':el.bh.value+'px';

  var fam=el.fam.value;
  if(!isLocalFont(fam)){
    var fq=fam.replace(/ /g,'+');
    if(!document.querySelector('link[data-prev="'+fq+'"]')){
      var l=document.createElement('link');
      l.rel='stylesheet';
      l.href='https://fonts.googleapis.com/css2?family='+fq+':wght@300;400;500;700&display=swap';
      l.setAttribute('data-prev',fq);
      document.head.appendChild(l);
    }
  }

  if(typeof syncNums==='function')syncNums();

  var raised=(el.bstyle.value==='raised'||el.bstyle.value==='glossy');
  var g3d=document.getElementById('group3d');
  if(g3d){
    g3d.className=raised?'row':'row offgroup';
    el.bdepth.disabled=!raised;
    el.bpress.disabled=!raised;
    document.getElementById('note3d').hidden=raised;
    if(typeof numBoxes!=='undefined'){
      numBoxes.forEach(function(b){
        if(b.r.id==='bdepth'||b.r.id==='bpress')b.n.disabled=!raised;
      });
    }
  }

  var isMap=el.linktype.value==='map';
  document.getElementById('linklabel').textContent=isMap?'Map id':'URL';
  el.link.placeholder=isMap?'3428':'https://www.paessler.com';
  document.getElementById('linknote').textContent=isMap
    ?'The numeric id from the target map URL. Stays inside PRTG.'
    :'Full address. Typed without http it is treated as https. Relative paths starting with / also work.';

  var text=escMulti(el.txt.value)||(mode==='button'?'Open map':'Label');
  var typing=(EDITING&&preview.contains(document.activeElement));
  if(typing){
    var liveStyle=document.getElementById('livestyle');
    if(mode==='button'){
      if(!liveStyle){liveStyle=document.createElement('style');liveStyle.id='livestyle';preview.appendChild(liveStyle);}
      liveStyle.textContent=buttonCss();
    }else{
      document.activeElement.setAttribute('style',labelStyle());
    }
  }else if(mode==='button'){
    var pa='<a href="#" class="'+slug()+'">'+text+'</a>';
    if(isClipped())pa='<span class="'+slug()+'w">'+pa+'</span>';
    preview.innerHTML='<style>'+buttonCss()+'</style>'+pa;
    (function(){var a=preview.querySelector('a');if(a)a.addEventListener('click',function(ev){ev.preventDefault();});})();
  }else{
    preview.innerHTML='<span style="'+labelStyle()+'">'+text+'</span>';
  }
  preview.className=el.liveedit.checked?'editable':'';
  applyLiveEdit();
  out.value=buildCode();
  if(typeof placeHandles==='function')placeHandles();
}

function measureText(){
  var probe=document.getElementById('measureprobe');
  if(!probe){
    probe=document.createElement('span');
    probe.id='measureprobe';
    probe.style.cssText='position:absolute;left:-9999px;top:-9999px;white-space:nowrap;visibility:hidden;';
    document.body.appendChild(probe);
  }
  var fam=familyStack(el.fam.value);
  var px=el.unit.value==='px'?parseFloat(el.size.value):(parseFloat(el.size.value)*window.innerWidth/100);
  probe.style.fontFamily=fam;
  probe.style.fontSize=px+'px';
  probe.style.fontWeight=el.weight.value;
  probe.style.letterSpacing=(parseFloat(el.spacing.value)||0)+'px';
  probe.style.textTransform=el.upper.checked?'uppercase':'none';
  probe.style.fontStyle=el.italic.checked?'italic':'normal';

  var lines=(el.txt.value||'Label').split(/\r?\n/);
  var w=0;
  for(var i=0;i<lines.length;i++){
    probe.textContent=lines[i]||' ';
    if(probe.offsetWidth>w)w=probe.offsetWidth;
  }
  probe.textContent='Hg';
  var lineH=probe.offsetHeight;
  return {w:Math.ceil(w),h:Math.ceil(lineH*lines.length*(lines.length>1?1.25:1))};
}

function applyShapeDefaults(){
  var sh=el.bshape.value;
  var m=measureText();
  var px=parseInt(el.padx.value,10)||0;
  var py=parseInt(el.pady.value,10)||0;

  if(sh==='circle'){
    var d=Math.max(m.w,m.h)+Math.max(px,py)*2+24;
    d=Math.max(48,Math.min(parseFloat(el.bw.max),d));
    el.bw.value=d;
    el.bh.value=0;
    el.bdepth.value=8;
  }else if(sh==='arrowr'||sh==='arrowl'||sh==='chevronr'||sh==='chevronl'||sh==='tabr'||sh==='tabl'){
    var hh=m.h+py*2+28;
    hh=Math.max(40,Math.min(parseFloat(el.bh.max),hh));
    el.bh.value=hh;
    if(parseInt(el.bw.value,10)>0&&parseInt(el.bw.value,10)<m.w+px*2+60){
      el.bw.value=Math.min(parseFloat(el.bw.max),m.w+px*2+80);
    }
  }
}


var BTN_PRESETS=[
 {n:'Primary solid',sw:'background:#2563EB;color:#fff;border-radius:8px;padding:7px 14px;font-size:11px;',
  v:{bw:0,bh:0,bstyle:'flat',bshape:'rect',bface:'#2563EB',bhover:'#1D4ED8',blabel:'#FFFFFF',radius:8,padx:26,pady:13,bwidth:0,bdrop:true,weight:'500',fam:'Inter',size:17}},
 {n:'Indigo 3D',sw:'background:#4F46E5;color:#fff;border-radius:8px;padding:7px 14px;font-size:11px;box-shadow:0 3px 0 #3730A3;',
  v:{bw:0,bh:0,bstyle:'raised',bshape:'rect',bface:'#4F46E5',bhover:'#6366F1',blabel:'#FFFFFF',radius:8,padx:26,pady:13,bdepth:4,bpress:2,bdrop:true,weight:'600',fam:'Inter',size:17}},
 {n:'Pill CTA',sw:'background:#0F172A;color:#fff;border-radius:999px;padding:7px 16px;font-size:11px;',
  v:{bw:0,bh:0,bstyle:'flat',bshape:'pill',bface:'#0F172A',bhover:'#1E293B',blabel:'#FFFFFF',padx:30,pady:14,bwidth:0,bdrop:true,weight:'500',fam:'Inter',size:17}},
 {n:'Ghost outline',sw:'background:#fff;color:#0F172A;border:1.5px solid #0F172A;border-radius:8px;padding:6px 13px;font-size:11px;',
  v:{bw:0,bh:0,bstyle:'outline',bshape:'rect',bface:'#0F172A',bhover:'#0F172A',blabel:'#FFFFFF',radius:8,padx:26,pady:13,bwidth:2,bdrop:false,weight:'500',fam:'Inter',size:17}},
 {n:'Emerald flat',sw:'background:#059669;color:#fff;border-radius:6px;padding:7px 14px;font-size:11px;',
  v:{bw:0,bh:0,bstyle:'flat',bshape:'rect',bface:'#059669',bhover:'#047857',blabel:'#FFFFFF',radius:6,padx:24,pady:12,bwidth:0,bdrop:true,weight:'500',fam:'Inter',size:17}},
 {n:'Paessler cyan',sw:'background:#007DB8;color:#fff;border-radius:4px;padding:7px 14px;font-size:11px;box-shadow:0 3px 0 #005178;',
  v:{bw:0,bh:0,bstyle:'raised',bshape:'rect',bface:'#007DB8',bhover:'#00AEEF',blabel:'#FFFFFF',radius:4,padx:26,pady:13,bdepth:4,bpress:2,bdrop:true,weight:'500',fam:'Roboto',size:18}},
 {n:'Glossy orb',sw:'width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 32% 24%,#7FD8FF 0%,#2EA6E0 18%,#007DB8 48%,#00587f 92%);',
  v:{bstyle:'glossy',bshape:'circle',bface:'#007DB8',bhover:'#00AEEF',blabel:'#FFFFFF',bw:84,bh:0,bdepth:8,bpress:3,bdrop:true,weight:'500',fam:'Inter',size:15}},
 {n:'Nav chevron',sw:'background:#1E293B;color:#fff;padding:7px 18px;font-size:11px;clip-path:polygon(0% 0%,80% 0%,100% 50%,80% 100%,0% 100%);',
  v:{bw:0,bh:0,bstyle:'raised',bshape:'tabr',bface:'#1E293B',bhover:'#334155',blabel:'#FFFFFF',radius:0,padx:24,pady:14,bdepth:4,bpress:2,bdrop:true,weight:'500',fam:'Inter',size:16}},
 {n:'Amber alert',sw:'background:#F59E0B;color:#1F2937;border-radius:6px;padding:7px 14px;font-size:11px;',
  v:{bw:0,bh:0,bstyle:'flat',bshape:'rect',bface:'#F59E0B',bhover:'#FBBF24',blabel:'#1F2937',radius:6,padx:24,pady:12,bwidth:0,bdrop:true,weight:'600',fam:'Inter',size:17}},
 {n:'Rose solid',sw:'background:#E11D48;color:#fff;border-radius:8px;padding:7px 14px;font-size:11px;',
  v:{bw:0,bh:0,bstyle:'flat',bshape:'rect',bface:'#E11D48',bhover:'#BE123C',blabel:'#FFFFFF',radius:8,padx:26,pady:13,bwidth:0,bdrop:true,weight:'500',fam:'Inter',size:17}}
];

var SOFT_SH='0 1px 3px rgba(15,23,42,.12),0 4px 12px rgba(15,23,42,.06);';
var CARD_V=function(o){var v={lw:0,lh:0,usebg:true,bgalpha:100,bwidth:0,radius:8,padx:20,pady:16,fam:'Inter',size:18,weight:'600',shadow:false,upper:false,spacing:0,italic:false,boxshadow:'none'};for(var k in o)v[k]=o[k];return v;};
var CHIP_V=function(bg,fg){return {lw:0,lh:0,usebg:true,bg:bg,bgalpha:100,color:fg,bwidth:0,radius:40,padx:16,pady:7,fam:'Inter',size:14,weight:'600',upper:true,spacing:0.5,shadow:false,italic:false,boxshadow:'none'};};
var LBL_PRESETS=[
 /* ---- Basic ---- */
 {g:'Basic',n:'Site caption',sw:'color:#0F172A;font-size:13px;font-weight:600;',
  v:{lw:0,lh:0,usebg:false,color:'#0F172A',fam:'Inter',size:22,weight:'600',spacing:0,upper:false,padx:4,pady:2,radius:0,bwidth:0,shadow:false,italic:false}},
 {g:'Basic',n:'Section label',sw:'color:#64748B;font-size:10px;letter-spacing:1.4px;font-weight:600;',
  v:{lw:0,lh:0,usebg:false,color:'#64748B',fam:'Inter',size:14,weight:'500',spacing:1.5,upper:true,padx:4,pady:2,radius:0,bwidth:0,shadow:false,italic:false}},
 {g:'Basic',n:'Map title',sw:'color:#0F172A;font-size:14px;font-weight:700;letter-spacing:.4px;',
  v:{lw:0,lh:0,usebg:false,color:'#0F172A',fam:'Montserrat',size:34,weight:'700',spacing:0.5,upper:false,padx:4,pady:2,radius:0,bwidth:0,shadow:false,italic:false}},
 {g:'Basic',n:'White card',sw:'background:#fff;color:#0F172A;border:1px solid #E2E8F0;border-radius:6px;padding:6px 12px;font-size:11px;',
  v:{lw:0,lh:0,usebg:true,bg:'#FFFFFF',bgalpha:100,color:'#0F172A',bcolor:'#E2E8F0',bwidth:1,radius:6,padx:16,pady:10,fam:'Inter',size:17,weight:'500',shadow:false,upper:false,spacing:0,italic:false}},
 {g:'Basic',n:'Dark panel',sw:'background:#0F172A;color:#fff;border-radius:6px;padding:6px 12px;font-size:11px;',
  v:{lw:0,lh:0,usebg:true,bg:'#0F172A',bgalpha:100,color:'#FFFFFF',bwidth:0,radius:6,padx:18,pady:11,fam:'Inter',size:17,weight:'500',shadow:false,upper:false,spacing:0,italic:false}},
 {g:'Basic',n:'Glass overlay',sw:'background:rgba(15,23,42,.62);color:#fff;border-radius:8px;padding:6px 12px;font-size:11px;',
  v:{lw:0,lh:0,usebg:true,bg:'#0F172A',bgalpha:62,color:'#FFFFFF',bwidth:0,radius:8,padx:18,pady:11,fam:'Inter',size:18,weight:'500',shadow:false,upper:false,spacing:0,italic:false}},
 {g:'Basic',n:'On photo',sw:'color:#fff;background:rgba(0,0,0,.38);border-radius:4px;padding:6px 12px;font-size:11px;font-weight:600;text-shadow:0 1px 2px rgba(0,0,0,.85);',
  v:{lw:0,lh:0,usebg:true,bg:'#000000',bgalpha:38,color:'#FFFFFF',fam:'Inter',size:22,weight:'600',shadow:true,shx:0,shy:1,shb:4,shcolor:'#000000',shalpha:85,padx:14,pady:8,radius:4,bwidth:0,upper:false,spacing:0,italic:false}},
 {g:'Basic',n:'Outline tag',sw:'color:#0F172A;border:1.5px solid #94A3B8;border-radius:5px;padding:5px 11px;font-size:11px;',
  v:{lw:0,lh:0,usebg:false,color:'#0F172A',bcolor:'#94A3B8',bwidth:2,radius:5,padx:16,pady:9,fam:'Inter',size:17,weight:'500',shadow:false,upper:false,spacing:0,italic:false}},
 /* ---- the Dashboard tab's own card styles ---- */
 {g:'Dashboard cards',n:'Light card',sw:'background:#FFFFFF;color:#0F172A;border:1px solid #E2E8F0;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:CARD_V({bg:'#FFFFFF',color:'#0F172A',bcolor:'#E2E8F0',bwidth:1,radius:8,boxshadow:'soft'})},
 {g:'Dashboard cards',n:'Dark card',sw:'background:#1E293B;color:#F1F5F9;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:CARD_V({bg:'#1E293B',color:'#F1F5F9',bwidth:0,radius:10,boxshadow:'soft'})},
 {g:'Dashboard cards',n:'Glass',map:'dark',tip:'Made for dark maps. The fill is nearly clear, so on a white map the light text is hard to read.',
  sw:'background:#2A3850;color:#F8FAFC;border:1px solid #94A3B8;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:600;',
  v:CARD_V({bg:'#94A3B8',bgalpha:16,color:'#F8FAFC',bcolor:'#94A3B8',bwidth:1,radius:10})},
 {g:'Dashboard cards',n:'Outline',tip:'Made for light maps. No fill, dark grey text.',
  sw:'color:#334155;border:2px solid #94A3B8;border-radius:8px;padding:5px 11px;font-size:11px;font-weight:600;',
  v:CARD_V({usebg:false,color:'#334155',bcolor:'#94A3B8',bwidth:2,radius:8})},
 {g:'Dashboard cards',n:'Accent',sw:'background:#007DB8;color:#FFFFFF;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:CARD_V({bg:'#007DB8',color:'#FFFFFF',bwidth:0,radius:8,boxshadow:'soft'})},
 /* ---- status chips: the Dashboard's five colours ---- */
 {g:'Status chips',n:'Status chip',sw:'background:#DCFCE7;color:#166534;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:CHIP_V('#DCFCE7','#166534')},
 {g:'Status chips',n:'Warning chip',sw:'background:#FEF3C7;color:#92400E;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:CHIP_V('#FEF3C7','#92400E')},
 {g:'Status chips',n:'Alert chip',sw:'background:#FEE2E2;color:#991B1B;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:CHIP_V('#FEE2E2','#991B1B')},
 {g:'Status chips',n:'Info chip',sw:'background:#DBEAFE;color:#1E40AF;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:CHIP_V('#DBEAFE','#1E40AF')},
 {g:'Status chips',n:'Neutral chip',sw:'background:#E2E8F0;color:#334155;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:CHIP_V('#E2E8F0','#334155')},
 /* ---- the looks used by tables, gauges and frames ---- */
 {g:'Table, gauge and frame looks',n:'Agency light',sw:'background:#FFFFFF;color:#1B2A4A;border:1px solid #DDE3EA;border-radius:6px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:CARD_V({fam:'Roboto',size:17,padx:20,pady:12,bg:'#FFFFFF',color:'#1B2A4A',bcolor:'#DDE3EA',bwidth:1,radius:6,boxshadow:'soft',loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Clean card',sw:'background:#FFFFFF;color:#111827;border:1px solid #E5E7EB;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:CARD_V({fam:'Roboto',size:17,padx:20,pady:12,bg:'#FFFFFF',color:'#111827',bcolor:'#E5E7EB',bwidth:1,radius:10,boxshadow:'soft',loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Corporate blue',sw:'background:#1F3864;color:#FFFFFF;border-radius:2px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:CARD_V({fam:'Roboto',size:17,padx:20,pady:12,bg:'#1F3864',color:'#FFFFFF',bwidth:0,radius:2,boxshadow:'soft',loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Executive dark',map:'dark',sw:'background:#23263A;color:#F4F5F9;border-radius:14px;padding:6px 12px;font-size:11px;font-weight:600;',
  v:CARD_V({fam:'Roboto',size:17,padx:20,pady:12,bg:'#23263A',color:'#F4F5F9',bwidth:0,radius:14,loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Indigo board',map:'dark',sw:'background:#272B58;color:#FFFFFF;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:600;',
  v:CARD_V({fam:'Roboto',size:18,padx:20,pady:12,bg:'#272B58',color:'#FFFFFF',bwidth:0,radius:10,loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Slate fintech',map:'dark',sw:'background:#353849;color:#FFFFFF;border-radius:4px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:0 10px 28px rgba(0,0,0,.35);',
  v:CARD_V({fam:'Roboto',size:17,padx:20,pady:12,bg:'#353849',color:'#FFFFFF',bwidth:0,radius:4,boxshadow:'strong',loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Neon plum',map:'dark',sw:'background:#3A2750;color:#FFFFFF;border:1px solid #5B4678;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:0 0 0 1px rgba(255,45,117,.35),0 8px 26px rgba(255,45,117,.2);',
  v:CARD_V({fam:'Roboto',size:17,padx:20,pady:12,bg:'#3A2750',color:'#FFFFFF',bcolor:'#5B4678',bwidth:1,radius:8,boxshadow:'glow',glowcolor:'#FF2D75',loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Teal glass',map:'dark',sw:'background:#34495E;color:#FFFFFF;border:1px solid #4A6178;border-radius:4px;padding:6px 12px;font-size:11px;font-weight:600;',
  v:CARD_V({fam:'Roboto',size:17,padx:20,pady:12,bg:'#34495E',color:'#FFFFFF',bcolor:'#4A6178',bwidth:1,radius:4,loadfont:false})}
];
/* a preset only sets the controls it names, so every label preset says explicitly that it has no box shadow, and loads its font, unless it asks otherwise */
LBL_PRESETS.forEach(function(p){if(p.v.boxshadow===undefined)p.v.boxshadow='none';if(p.v.loadfont===undefined)p.v.loadfont=true;});

/* ---- the Button tool has the same groups of presets as the Label tool, in the same colours ---- */
BTN_PRESETS.forEach(function(p){p.g='Basic';if(p.v.boxshadow===undefined)p.v.boxshadow='none';if(p.v.loadfont===undefined)p.v.loadfont=true;});
var BTN_V=function(o){var v={bw:0,bh:0,bstyle:'flat',bshape:'rect',bwidth:0,bdrop:false,radius:8,padx:26,pady:13,weight:'600',fam:'Inter',size:17,boxshadow:'none',loadfont:true};for(var k in o)v[k]=o[k];return v;};
var BTN_PILL=function(face,hover,label){return BTN_V({bface:face,bhover:hover,blabel:label,bshape:'pill',padx:24,pady:10,size:14});};
BTN_PRESETS=BTN_PRESETS.concat([
 {g:'Dashboard buttons',n:'Light',sw:'background:#FFFFFF;color:#0F172A;border:1px solid #E2E8F0;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:BTN_V({bface:'#FFFFFF',bhover:'#F1F5F9',blabel:'#0F172A',bcolor:'#E2E8F0',bwidth:1,radius:8,boxshadow:'soft'})},
 {g:'Dashboard buttons',n:'Dark',sw:'background:#1E293B;color:#F1F5F9;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:BTN_V({bface:'#1E293B',bhover:'#334155',blabel:'#F1F5F9',radius:10,boxshadow:'soft'})},
 {g:'Dashboard buttons',n:'Glass',map:'dark',tip:'Made for dark maps. The face is see-through, so on a white map the light text is hard to read.',
  sw:'background:#2A3850;color:#F8FAFC;border:1px solid #94A3B8;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:600;',
  v:BTN_V({bstyle:'glass',bface:'#94A3B8',bhover:'#CBD5E1',blabel:'#F8FAFC',radius:10})},
 {g:'Dashboard buttons',n:'Outline',tip:'Made for light maps. No fill; the text takes the outline colour.',
  sw:'color:#475569;border:2px solid #475569;border-radius:8px;padding:5px 11px;font-size:11px;font-weight:600;',
  v:BTN_V({bstyle:'outline',bface:'#475569',bhover:'#475569',blabel:'#FFFFFF',bwidth:2,radius:8})},
 {g:'Dashboard buttons',n:'Accent',sw:'background:#007DB8;color:#FFFFFF;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:BTN_V({bface:'#007DB8',bhover:'#00AEEF',blabel:'#FFFFFF',radius:8,boxshadow:'soft'})},
 {g:'Status buttons',n:'Status button',sw:'background:#DCFCE7;color:#166534;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:BTN_PILL('#DCFCE7','#BBF7D0','#166534')},
 {g:'Status buttons',n:'Warning button',sw:'background:#FEF3C7;color:#92400E;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:BTN_PILL('#FEF3C7','#FDE68A','#92400E')},
 {g:'Status buttons',n:'Alert button',sw:'background:#FEE2E2;color:#991B1B;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:BTN_PILL('#FEE2E2','#FECACA','#991B1B')},
 {g:'Status buttons',n:'Info button',sw:'background:#DBEAFE;color:#1E40AF;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:BTN_PILL('#DBEAFE','#BFDBFE','#1E40AF')},
 {g:'Status buttons',n:'Neutral button',sw:'background:#E2E8F0;color:#334155;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:BTN_PILL('#E2E8F0','#CBD5E1','#334155')},
 {g:'Table, gauge and frame looks',n:'Agency light',sw:'background:#FFFFFF;color:#1B2A4A;border:1px solid #DDE3EA;border-radius:6px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:BTN_V({fam:'Roboto',bface:'#FFFFFF',bhover:'#F5F8FB',blabel:'#1B2A4A',bcolor:'#DDE3EA',bwidth:1,radius:6,boxshadow:'soft',loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Clean card',sw:'background:#FFFFFF;color:#111827;border:1px solid #E5E7EB;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:BTN_V({fam:'Roboto',bface:'#FFFFFF',bhover:'#F3F4F6',blabel:'#111827',bcolor:'#E5E7EB',bwidth:1,radius:10,boxshadow:'soft',loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Corporate blue',sw:'background:#1F3864;color:#FFFFFF;border-radius:2px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:BTN_V({fam:'Roboto',bface:'#1F3864',bhover:'#2F5C9E',blabel:'#FFFFFF',radius:2,boxshadow:'soft',loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Executive dark',map:'dark',sw:'background:#23263A;color:#F4F5F9;border-radius:14px;padding:6px 12px;font-size:11px;font-weight:600;',
  v:BTN_V({fam:'Roboto',bface:'#23263A',bhover:'#2F3350',blabel:'#F4F5F9',radius:14,loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Indigo board',map:'dark',sw:'background:#272B58;color:#FFFFFF;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:600;',
  v:BTN_V({fam:'Roboto',bface:'#272B58',bhover:'#343A7A',blabel:'#FFFFFF',radius:10,loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Slate fintech',map:'dark',sw:'background:#353849;color:#FFFFFF;border-radius:4px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:0 10px 28px rgba(0,0,0,.35);',
  v:BTN_V({fam:'Roboto',bface:'#353849',bhover:'#454A60',blabel:'#FFFFFF',radius:4,boxshadow:'strong',loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Neon plum',map:'dark',sw:'background:#3A2750;color:#FFFFFF;border:1px solid #5B4678;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:0 0 0 1px rgba(255,45,117,.35),0 8px 26px rgba(255,45,117,.2);',
  v:BTN_V({fam:'Roboto',bface:'#3A2750',bhover:'#4B3368',blabel:'#FFFFFF',bcolor:'#5B4678',bwidth:1,radius:8,boxshadow:'glow',glowcolor:'#FF2D75',loadfont:false})},
 {g:'Table, gauge and frame looks',n:'Teal glass',map:'dark',sw:'background:#34495E;color:#FFFFFF;border:1px solid #4A6178;border-radius:4px;padding:6px 12px;font-size:11px;font-weight:600;',
  v:BTN_V({fam:'Roboto',bface:'#34495E',bhover:'#425A72',blabel:'#FFFFFF',bcolor:'#4A6178',bwidth:1,radius:4,loadfont:false})}
]);

function applyPreset(p){
  var v=p.v||p;
  for(var k in v){
    if(!el[k])continue;
    if(typeof v[k]==='boolean'){el[k].checked=v[k];continue;}
    var before=el[k].value;
    el[k].value=v[k];
    if(el[k].tagName==='SELECT'&&el[k].value===''){
      if(k==='weight'){
        var want=parseInt(v[k],10),best=null,bd=1e9;
        for(var o=0;o<el[k].options.length;o++){
          var ov=parseInt(el[k].options[o].value,10);
          if(!isNaN(ov)&&Math.abs(ov-want)<bd){bd=Math.abs(ov-want);best=el[k].options[o].value;}
        }
        el[k].value=(best!==null)?best:before;
      }else{
        el[k].value=before;
      }
    }
  }
  render();
}

function buildPresets(){
  var host=document.getElementById('presets');
  if(!host)return;
  var list=(mode==='button')?BTN_PRESETS:LBL_PRESETS;
  var html='<div class="presetgrid">',lastG=null;
  for(var i=0;i<list.length;i++){
    if(list[i].g&&list[i].g!==lastG){html+='<div class="pgroup">'+list[i].g+'</div>';lastG=list[i].g;}
    html+='<button type="button" class="presetchip" data-i="'+i+'"'+(list[i].tip?' title="'+list[i].tip.replace(/"/g,'&quot;')+'"':'')+'>'
        + '<span class="swatch"><span style="'+list[i].sw+'display:inline-block;line-height:1.3;">'
        + (list[i].v.bshape==='circle'?'':'Aa')
        + '</span></span><span class="pname">'+list[i].n+'</span></button>';
  }
  html+='</div>';
  host.innerHTML=html;
  var chips=host.querySelectorAll('.presetchip');
  for(var c=0;c<chips.length;c++){
    (function(btn){
      btn.addEventListener('click',function(){
        applyPreset(list[parseInt(btn.getAttribute('data-i'),10)]);
      });
    })(chips[c]);
  }
}

function setMode(m){
  if(DASHAPI.active)DASHAPI.leave();
  mode=m;
  document.body.classList.remove('objs');   /* the label and button tools are the page's own view; the Objects tab shows them as two of its types */
  document.getElementById('fsLabelColor').hidden=(m==='button');
  document.getElementById('fsBoxShadow').hidden=(m==='button');
  document.getElementById('fsBtnStyle').hidden=(m!=='button');
  document.getElementById('btnnote').hidden=(m!=='button');
  document.getElementById('btnnote2').hidden=(m!=='button');
  document.getElementById('linknote').textContent=(m==='button')
    ?'Enter the numeric id from the target map URL. Without it the button renders but goes nowhere.'
    :'Optional for labels. Enter the numeric id from the target map URL.';
  buildPresets();
  if(m==='button'){
    if(el.txt.value==='Dallas DC')el.txt.value='EMEA sites';
    if(el.padx.value==='8'){el.padx.value=22;el.pady.value=12;}
    if(el.radius.value==='0')el.radius.value=4;
  }
  render();
}

var numBoxes=[];
(function buildNumberBoxes(){
  var units={size:'',spacing:'',bgalpha:'%',padx:'px',pady:'px',radius:'px',bwidth:'px',
    shx:'px',shy:'px',shb:'px',shalpha:'%',rotate:'\u00B0',opacity:'%',
    bdepth:'px',bpress:'px',bw:'px',bh:'px',lw:'px',lh:'px'};
  var ranges=document.querySelectorAll('#panel input[type=range]');
  Array.prototype.forEach.call(ranges,function(r){
    var wrap=document.createElement('div');
    wrap.className='ctl';
    r.parentNode.insertBefore(wrap,r);
    wrap.appendChild(r);
    var n=document.createElement('input');
    n.type='number';n.className='num';
    n.min=r.min;n.max=r.max;n.step=r.step||1;n.value=r.value;
    wrap.appendChild(n);
    var u=document.createElement('span');
    u.className='unit';
    u.textContent=units[r.id]||'';
    wrap.appendChild(u);
    n.addEventListener('input',function(){
      var v=parseFloat(n.value);
      if(isNaN(v))return;
      r.value=v;
      render();
    });
    n.addEventListener('blur',function(){
      var v=parseFloat(n.value);
      if(isNaN(v))v=parseFloat(r.value);
      v=Math.max(parseFloat(r.min),Math.min(parseFloat(r.max),v));
      r.value=v;n.value=r.value;
      render();
    });
    numBoxes.push({r:r,n:n,u:u});
  });
  var su=numBoxes.filter(function(b){return b.r.id==='size';})[0];
  if(su)su.u.textContent=document.getElementById('unit').value;
})();

function syncNums(){
  numBoxes.forEach(function(b){
    if(document.activeElement!==b.n)b.n.value=b.r.value;
    if(b.r.id==='size')b.u.textContent=document.getElementById('unit').value;
  });
}

ids.forEach(function(i){
  el[i].addEventListener('input',render);
  el[i].addEventListener('change',render);
});
function editableNode(){
  var a=preview.querySelector('a');
  if(a)return a;
  return preview.querySelector('span:not(.txt)')||preview.firstElementChild;
}

var EDITING=false;

function applyLiveEdit(){
  var n=editableNode();
  if(!n)return;
  var on=el.liveedit.checked;
  if(on){
    if(EDITING)n.setAttribute('contenteditable','true');
    else n.removeAttribute('contenteditable');
    n.setAttribute('spellcheck','false');
    if(!n.getAttribute('data-editbound')){
      n.setAttribute('data-editbound','1');
      n.addEventListener('input',function(){
        var html=n.innerHTML
          .replace(/<div[^>]*>/gi,'\n').replace(/<\/div>/gi,'')
          .replace(/<br\s*\/?>/gi,'\n')
          .replace(/&nbsp;/gi,' ')
          .replace(/<[^>]+>/g,'');
        var txtEl=document.createElement('textarea');
        txtEl.innerHTML=html;
        el.txt.value=txtEl.value.replace(/^\n/,'').replace(/\n$/,'');
        out.value=buildCode();
      });
      n.addEventListener('blur',function(){EDITING=false;render();});
      n.addEventListener('keydown',function(ev){
        if(ev.key==='Escape'){ev.preventDefault();n.blur();}
      });
    }
  }else if(n.getAttribute('contenteditable')){
    n.removeAttribute('contenteditable');
  }
}

(function previewClickToEdit(){
  function exitEditing(){
    if(!EDITING)return;
    EDITING=false;
    var n=editableNode();
    if(n){
      n.removeAttribute('contenteditable');
      if(n.blur)n.blur();
    }
    var sel=window.getSelection&&window.getSelection();
    if(sel&&sel.removeAllRanges)sel.removeAllRanges();
    render();
  }

  document.addEventListener('mousedown',function(e){
    if(preview.contains(e.target))return;
    if(e.target&&e.target.closest&&e.target.closest('.rsz'))return;
    exitEditing();
  },true);

  preview.addEventListener('mousedown',function(e){
    if(!el.liveedit.checked)return;
    var n=editableNode();
    if(!n)return;
    if(EDITING&&document.activeElement===n)return;
    EDITING=true;
    n.setAttribute('contenteditable','true');
    n.setAttribute('spellcheck','false');
    e.preventDefault();
    n.focus();
    try{
      var r=null;
      if(document.caretRangeFromPoint)r=document.caretRangeFromPoint(e.clientX,e.clientY);
      else if(document.caretPositionFromPoint){
        var cp=document.caretPositionFromPoint(e.clientX,e.clientY);
        if(cp){r=document.createRange();r.setStart(cp.offsetNode,cp.offset);r.collapse(true);}
      }
      if(r){
        var sel=window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      }
    }catch(err){}
  });
})();

(function dragResize(){
  var wrap=document.getElementById('previewwrap');
  var tag=document.getElementById('sizetag');
  if(!wrap)return;
  var handles=wrap.querySelectorAll('.rsz');
  var drag=null;

  var CLS={w:'r',h:'b',wh:'br',fs:'tr',rot:'tl'};

  function target(){
    var a=preview.querySelector('a');
    if(a)return a;
    return preview.querySelector('span:not(.txt)')||preview.firstElementChild;
  }

  window.W=function(){return (mode==='button')?el.bw:el.lw;};
  window.H=function(){return (mode==='button')?el.bh:el.lh;};

  window.placeHandles=function(){
    var t=target();
    for(var i=0;i<handles.length;i++){
      handles[i].className='rsz '+CLS[handles[i].getAttribute('data-ax')]+(t?'':' off');
    }
    if(!t)return;
    var wr=wrap.getBoundingClientRect(), tr=t.getBoundingClientRect();
    var deg=parseFloat(el.rotate.value)||0;
    var rad=deg*Math.PI/180, cos=Math.cos(rad), sin=Math.sin(rad);
    var w0=t.offsetWidth||tr.width, h0=t.offsetHeight||tr.height;
    var cx=tr.left-wr.left+tr.width/2, cy=tr.top-wr.top+tr.height/2;

    function at(px,py){
      return {x:cx+px*cos-py*sin, y:cy+px*sin+py*cos};
    }
    function put(node,px,py){
      if(!node)return;
      var pt=at(px,py);
      node.style.left=pt.x+'px';
      node.style.top=pt.y+'px';
      node.style.transform='translate(-50%,-50%) rotate('+deg+'deg)';
    }

    var circle=(mode==='button'&&el.bshape.value==='circle');
    var hr=wrap.querySelector('.rsz.r'), hb=wrap.querySelector('.rsz.b'),
        hc=wrap.querySelector('.rsz.br'), hf=wrap.querySelector('.rsz.tr'),
        hrot=wrap.querySelector('.rsz.tl');

    put(hr, w0/2, 0);
    put(hb, 0, h0/2);
    put(hc, w0/2, h0/2);
    put(hf, w0/2, -h0/2);
    put(hrot, -w0/2-14, -h0/2-14);
    if(circle){
      if(hr)hr.className+=' off';
      if(hb)hb.className+=' off';
    }

    var tp=at(w0/2+26, h0/2);
    tag.style.left=tp.x+'px';
    tag.style.top=tp.y+'px';
    tag.textContent=circle?(Math.round(w0)+' px \u2300'):(Math.round(w0)+' \u00D7 '+Math.round(h0));
  };

  function start(e,ax){
    e.preventDefault();
    var t=target();
    if(!t)return;
    var r=t.getBoundingClientRect();
    drag={
      ax:ax,
      x:e.clientX,y:e.clientY,
      w:parseInt(W().value,10)||Math.round(r.width),
      h:parseInt(H().value,10)||Math.round(r.height),
      fs:parseFloat(el.size.value),
      rot:parseFloat(el.rotate.value)||0,
      cx:r.left+r.width/2, cy:r.top+r.height/2
    };
    if(ax==='rot')drag.a0=Math.atan2(e.clientY-drag.cy,e.clientX-drag.cx)*180/Math.PI;
    wrap.classList.add('dragging');
    document.body.style.cursor=(ax==='w'?'ew-resize':ax==='h'?'ns-resize':'nwse-resize');
  }

  function move(e){
    if(!drag)return;
    var rdx=e.clientX-drag.x, rdy=e.clientY-drag.y;
    var th=(parseFloat(el.rotate.value)||0)*Math.PI/180;
    var dx=rdx*Math.cos(th)+rdy*Math.sin(th);
    var dy=-rdx*Math.sin(th)+rdy*Math.cos(th);
    var wEl=W(), hEl=H();
    if(drag.ax==='rot'){
      var a1=Math.atan2(e.clientY-drag.cy,e.clientX-drag.cx)*180/Math.PI;
      var nr=drag.rot+(a1-drag.a0);
      if(e.shiftKey)nr=Math.round(nr/15)*15;
      nr=Math.round(nr);
      nr=((nr+180)%360+360)%360-180;
      el.rotate.value=nr;
      render();
      tag.textContent=nr+'\u00B0';
      return;
    }
    if(drag.ax==='fs'){
      var step=(el.unit.value==='vw')?0.05:0.35;
      var nf=drag.fs-rdy*step;
      nf=Math.max(parseFloat(el.size.min),Math.min(parseFloat(el.size.max),nf));
      el.size.value=(el.unit.value==='vw')?Math.round(nf*10)/10:Math.round(nf);
      tag.textContent=el.size.value+el.unit.value;
      render();
      tag.textContent=el.size.value+el.unit.value;
      return;
    }
    var circle=(mode==='button'&&el.bshape.value==='circle');
    if(circle){
      var d=Math.round(drag.w+Math.max(dx,dy));
      el.bw.value=Math.max(parseFloat(el.bw.min),Math.min(parseFloat(el.bw.max),d));
      el.bh.value=0;
    }else{
      if(drag.ax==='w'||drag.ax==='wh'){
        var nw=Math.round(drag.w+dx);
        wEl.value=Math.max(parseFloat(wEl.min),Math.min(parseFloat(wEl.max),nw));
      }
      if(drag.ax==='h'||drag.ax==='wh'){
        var nh=Math.round(drag.h+dy);
        hEl.value=Math.max(parseFloat(hEl.min),Math.min(parseFloat(hEl.max),nh));
      }
    }
    render();
  }

  function end(){
    if(!drag)return;
    drag=null;
    wrap.classList.remove('dragging');
    document.body.style.cursor='';
  }

  for(var i=0;i<handles.length;i++){
    (function(hEl){
      hEl.addEventListener('mousedown',function(e){start(e,hEl.getAttribute('data-ax'));});
    })(handles[i]);
  }
  document.addEventListener('mousemove',move);
  document.addEventListener('mouseup',end);
  window.addEventListener('resize',function(){if(typeof placeHandles==='function')placeHandles();});
})();

el.bshape.addEventListener('change',function(){
  applyShapeDefaults();
  render();
});


document.getElementById('copy').addEventListener('click',function(){
  out.select();
  var ok=false;
  try{ok=document.execCommand('copy');}catch(e){ok=false;}
  if(navigator.clipboard&&!ok){navigator.clipboard.writeText(out.value);ok=true;}
  var t=document.getElementById('toast');
  t.textContent=ok?'Code copied':'Select the code and copy manually';
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},1600);
});

Array.prototype.forEach.call(document.querySelectorAll('.glyphs button'),function(b){
  b.addEventListener('click',function(){
    var g=b.getAttribute('data-g');
    var t=el.txt.value;
    el.txt.value=t?(t+' '+g):g;
    render();
  });
});

function hex(v){
  if(!v)return null;
  v=v.trim();
  var m=v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if(m)return v.length===4?('#'+v[1]+v[1]+v[2]+v[2]+v[3]+v[3]):v.toLowerCase();
  m=v.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if(m){
    return '#'+[m[1],m[2],m[3]].map(function(n){
      var s=parseInt(n,10).toString(16);return s.length<2?'0'+s:s;
    }).join('');
  }
  return null;
}
function alphaOf(v){
  var m=(v||'').match(/rgba\([^)]*,\s*([0-9.]+)\s*\)/);
  return m?Math.round(parseFloat(m[1])*100):100;
}
function prop(css,name){
  var re=new RegExp('(?:^|;|\\{)\\s*'+name+'\\s*:\\s*([^;}]+)','i');
  var m=css.match(re);
  return m?m[1].trim():null;
}
function setRange(id,v){
  if(v===null||isNaN(v))return;
  var r=el[id];
  v=Math.max(parseFloat(r.min),Math.min(parseFloat(r.max),v));
  r.value=v;
}

function importCode(src){
  if(!src||!src.trim())return 'Nothing to load.';
  var isBtn=/<a[^>]*class\s*=\s*["'](pb[^"']*)["']/i.test(src)||/a\.pb[^{]*\{/i.test(src);

  var mText=src.match(/>([^<>]*)<\/(?:a|span)>\s*$/);
  if(!mText)mText=src.match(/>([^<>]*)<\/(?:a|span)>/);
  if(mText)el.txt.value=mText[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').trim();

  var href=(src.match(/<a[^>]*href\s*=\s*["']([^"']*)["']/i)||[])[1]||'';
  if(!href)href=(src.match(/href\s*=\s*["']([^"']*)["']/i)||[])[1]||'';
  if(/fonts\.googleapis/i.test(href))href='';
  if(/ENTER_THE_DESTINATION/i.test(href)||href==='#'){
    el.link.value='';
  }else if(/^\/map\.htm\?id=(\d+)/i.test(href)){
    el.linktype.value='map';
    el.link.value=href.match(/id=(\d+)/)[1];
  }else if(href){
    el.linktype.value='url';
    el.link.value=href;
  }
  el.newtab.checked=/target\s*=\s*["']_blank["']/i.test(src);
  el.loadfont.checked=/fonts\.googleapis/i.test(src);

  var base='',hover='',active='';
  if(isBtn){
    var rules=src.match(/a\.pb[^{]*\{([^}]*)\}/g)||[];
    for(var i=0;i<rules.length;i++){
      var head=rules[i].slice(0,rules[i].indexOf('{'));
      var body=rules[i].slice(rules[i].indexOf('{')+1,-1);
      if(/:hover/.test(head))hover=body;
      else if(/:active/.test(head))active=body;
      else base=body;
    }
  }else{
    base=(src.match(/<span[^>]*style\s*=\s*["']([^"']*)["']/i)||[])[1]||'';
  }
  if(!base)return 'Could not read that snippet. It needs to be one made by this tool.';

  var fam=prop(base,'font-family');
  if(fam){
    var first=fam.split(',')[0].replace(/['"]/g,'').trim();
    var found=false;
    for(var o=0;o<el.fam.options.length;o++){
      if(el.fam.options[o].value.toLowerCase()===first.toLowerCase()){el.fam.value=el.fam.options[o].value;found=true;break;}
    }
    if(!found){
      for(var k in WEBSAFE){
        if(WEBSAFE[k].name&&WEBSAFE[k].name.toLowerCase()===first.toLowerCase()){el.fam.value=k;found=true;break;}
      }
    }
    if(!found)el.fam.value='__system__';
  }
  var fs=prop(base,'font-size');
  if(fs){
    var mu=fs.match(/([0-9.]+)\s*(px|vw)/);
    if(mu){el.unit.value=mu[2];setRange('size',parseFloat(mu[1]));}
  }
  var fw=prop(base,'font-weight');
  if(fw&&['300','400','500','700'].indexOf(fw)>=0)el.weight.value=fw;
  el.italic.checked=/font-style\s*:\s*italic/i.test(base);
  el.upper.checked=/text-transform\s*:\s*uppercase/i.test(base);
  el.underline.checked=/text-decoration\s*:\s*underline/i.test(base);
  el.nowrap.checked=/white-space\s*:\s*nowrap/i.test(base);
  var ls=prop(base,'letter-spacing');
  if(ls)setRange('spacing',parseFloat(ls));

  var pad=prop(base,'padding');
  if(pad){
    var pp=pad.split(/\s+/);
    if(pp.length>=2){setRange('pady',parseFloat(pp[0]));setRange('padx',parseFloat(pp[1]));}
    else if(pp.length===1){setRange('pady',parseFloat(pp[0]));setRange('padx',parseFloat(pp[0]));}
  }
  var pl=prop(base,'padding-left');
  if(pl&&isBtn)setRange('padx',parseFloat(pl));

  var br=prop(base,'border-radius');
  var bd=prop(base,'border');
  if(bd){
    var bm=bd.match(/([0-9.]+)px\s+solid\s+(\S+)/i);
    if(bm){setRange('bwidth',parseFloat(bm[1]));var bc=hex(bm[2]);if(bc)el.bcolor.value=bc;}
    else if(/^0/.test(bd))setRange('bwidth',0);
  }
  var ts=prop(base,'text-shadow');
  el.shadow.checked=!!(ts&&!/none/i.test(ts));
  if(el.shadow.checked){
    var tm=ts.match(/(-?[0-9.]+)px\s+(-?[0-9.]+)px\s+([0-9.]+)px\s+(.+)$/);
    if(tm){
      setRange('shx',parseFloat(tm[1]));setRange('shy',parseFloat(tm[2]));setRange('shb',parseFloat(tm[3]));
      var sc=hex(tm[4]);if(sc)el.shcolor.value=sc;
      setRange('shalpha',alphaOf(tm[4]));
    }
  }
  var tr=prop(base,'transform');
  setRange('rotate',tr?parseFloat((tr.match(/rotate\((-?[0-9.]+)deg\)/)||[0,0])[1]):0);
  var op=prop(base,'opacity');
  setRange('opacity',op?Math.round(parseFloat(op)*100):100);

  if(isBtn){
    setMode('button');
    var bgv=prop(base,'background');
    var bgHex=hex(bgv);
    if(!bgHex&&bgv&&/gradient/i.test(bgv)){
      var stops=bgv.match(/#[0-9a-f]{3,6}/gi)||[];
      if(stops.length)bgHex=hex(stops[Math.min(2,stops.length-1)]);
    }
    var bs=prop(base,'box-shadow')||'';
    if(bgv&&/transparent/i.test(bgv)){
      el.bstyle.value='outline';
      var oc=hex(prop(base,'color'));if(oc)el.bface.value=oc;
    }else{
      if(bgHex)el.bface.value=bgHex;
      if(/radial-gradient/i.test(bgv||''))el.bstyle.value='glossy';
      else if(/inset/i.test(bs))el.bstyle.value='glass';
      else if(/0\s+\d+px\s+0\s+#/.test(bs))el.bstyle.value='raised';
      else el.bstyle.value='flat';
    }
    var col=hex(prop(base,'color'));
    if(col&&el.bstyle.value!=='outline')el.blabel.value=col;
    var hv=hex(prop(hover,'background'));
    if(hv)el.bhover.value=hv;
    var dm=bs.match(/0\s+(\d+)px\s+0\s+#/);
    setRange('bdepth',dm?parseFloat(dm[1]):0);
    el.bdrop.checked=/rgba\(0,0,0,0\.3/.test(bs);
    var at=prop(active,'top');
    setRange('bpress',at?parseFloat(at):0);
    var cp=prop(base,'clip-path');
    var shapeSet=false;
    if(cp){
      for(var k in CLIPS){
        if(CLIPS[k].replace(/\s/g,'')===cp.replace(/\s/g,'')){el.bshape.value=k;shapeSet=true;break;}
      }
    }
    if(!shapeSet){
      if(br&&/50%/.test(br))el.bshape.value='circle';
      else if(br&&parseFloat(br)>=100)el.bshape.value='pill';
      else el.bshape.value='rect';
    }
    if(!cp&&br&&!/50%/.test(br)&&parseFloat(br)<100)setRange('radius',parseFloat(br));
    var w=prop(base,'width'),h=prop(base,'height');
    setRange('bw',w?parseFloat(w):0);
    setRange('bh',(h&&el.bshape.value!=='circle')?parseFloat(h):0);
    if(el.bshape.value==='circle'&&w)setRange('bw',parseFloat(w));
  }else{
    setMode('label');
    var lc=hex(prop(base,'color'));
    if(lc)el.color.value=lc;
    var lb=prop(base,'background');
    el.usebg.checked=!!(lb&&!/transparent|none/i.test(lb));
    if(el.usebg.checked){
      var lbh=hex(lb);if(lbh)el.bg.value=lbh;
      setRange('bgalpha',alphaOf(lb));
    }
    if(br)setRange('radius',parseFloat(br));
    var lwv=prop(base,'width'),lhv=prop(base,'height');
    setRange('lw',lwv?parseFloat(lwv):0);
    setRange('lh',lhv?parseFloat(lhv):0);
  }

  render();
  return 'Loaded. '+(isBtn?'Button':'Label')+' settings restored.';
}

document.getElementById('impload').addEventListener('click',function(){
  var msg;
  try{msg=importCode(el.imp.value);}
  catch(e){msg='Could not read that snippet.';}
  document.getElementById('impmsg').textContent=msg;
});
document.getElementById('impclear').addEventListener('click',function(){
  el.imp.value='';
  document.getElementById('impmsg').textContent='';
});

document.getElementById('prestoggle').addEventListener('click',function(){
  var w=document.getElementById('preswrap');
  var open=w.hidden;
  w.hidden=!open;
  this.classList.toggle('open',open);
  document.getElementById('prescaret').innerHTML=open?'\u25BE':'\u25B8';
});

document.getElementById('advtoggle').addEventListener('click',function(){
  var w=document.getElementById('advwrap');
  var open=w.hidden;
  w.hidden=!open;
  this.classList.toggle('open',open);
  document.getElementById('advcaret').innerHTML=open?'\u25BE':'\u25B8';
});

document.getElementById('locksize').addEventListener('click',function(){
  var node=preview.firstElementChild;
  if(!node)return;
  var r=node.getBoundingClientRect();
  var w=Math.min(400,Math.round(r.width));
  var h=Math.min(160,Math.round(r.height));
  el.bw.value=w;el.bh.value=h;
  render();
});
document.getElementById('unlocksize').addEventListener('click',function(){
  el.bw.value=0;el.bh.value=0;
  render();
});

document.getElementById('toggledark').addEventListener('click',function(){
  canvas.classList.toggle('dark');
  this.textContent=canvas.classList.contains('dark')?'Light background':'Dark background';
});

document.getElementById('reset').addEventListener('click',function(){
  el.txt.value=(mode==='button')?'EMEA sites':'Dallas DC';
  el.nowrap.checked=true;el.liveedit.checked=true;el.fam.value='Roboto';el.loadfont.checked=true;
  el.size.value=24;el.unit.value='px';el.weight.value='400';el.spacing.value=0;
  el.italic.checked=false;el.upper.checked=false;el.underline.checked=false;
  el.color.value='#050F34';el.bg.value='#FFFFFF';el.usebg.checked=false;el.bgalpha.value=100;el.lw.value=0;el.lh.value=0;
  el.padx.value=(mode==='button')?22:8;el.pady.value=(mode==='button')?12:4;
  el.radius.value=(mode==='button')?4:0;el.bwidth.value=0;el.bcolor.value='#007DB8';
  el.shadow.checked=false;el.shx.value=1;el.shy.value=1;el.shb.value=3;
  el.shcolor.value='#000000';el.shalpha.value=45;el.rotate.value=0;el.opacity.value=100;
  el.link.value='';el.linktype.value='map';el.newtab.checked=false;
  el.bstyle.value='raised';el.bshape.value='rect';el.bface.value='#007DB8';el.blabel.value='#FFFFFF';
  el.bhover.value='#00AEEF';el.bdepth.value=4;el.bpress.value=2;el.bdrop.checked=true;
  el.bw.value=0;el.bh.value=0;
  render();
});

(function collapseSections(){
  /* Each fieldset with a legend becomes a bar with a body that folds. The Objects tab starts with every section closed; so does the Dashboard tab,
     whose open and closed sections are remembered between visits, and whose bars can carry a short note (the selected item, how many items). */
  var DKEY=CFG.keys.dashSections, saved={}, bars={};
  try{saved=JSON.parse(localStorage.getItem(DKEY)||'{}')||{};}catch(e){saved={};}
  function build(containerId,remember){
    var kids=document.getElementById(containerId).children, i, c, f, lg, title, body, bar, startOpen;
    for(i=0;i<kids.length;i++){
      f=kids[i];
      if(f.tagName!=='FIELDSET')continue;
      lg=null;
      for(c=0;c<f.children.length;c++){if(f.children[c].tagName==='LEGEND'){lg=f.children[c];break;}}
      if(!lg)continue;
      title=lg.textContent;
      f.removeChild(lg);
      startOpen=!!(remember&&CFG.dashboard.rememberSections&&saved[title]);
      body=document.createElement('div');
      body.className='secbody';
      body.hidden=!startOpen;
      while(f.firstChild)body.appendChild(f.firstChild);
      bar=document.createElement('button');
      bar.type='button';
      bar.className='advbar'+(startOpen?' open':'')+(remember?' hasnote':'');
      bar.setAttribute('aria-expanded',startOpen?'true':'false');
      bar.innerHTML='<span class="seccaret">'+(startOpen?'\u25BE':'\u25B8')+'</span> <span class="sectitle"></span>'+(remember?'<span class="secnote"></span>':'');
      bar.querySelector('.sectitle').textContent=title;
      f.className=(f.className?f.className+' ':'')+'secfs';
      f.appendChild(bar);
      f.appendChild(body);
      if(remember)bars[title]=bar;
      (function(b,bd,fs,t){
        b.addEventListener('click',function(){
          var open=bd.hidden;
          bd.hidden=!open;
          b.classList.toggle('open',open);
          b.setAttribute('aria-expanded',open?'true':'false');
          b.firstChild.textContent=open?'\u25BE':'\u25B8';
          if(remember){saved[t]=open;try{localStorage.setItem(DKEY,JSON.stringify(saved));}catch(e){}}
          if(open){try{document.dispatchEvent(new CustomEvent('secopen',{detail:{fs:fs}}));}catch(e){}}   /* things that were sized while hidden can size themselves again */
        });
      })(bar,body,f,title);
    }
  }
  build('panel',false);
  build('dashpanel',true);
  window.SECAPI={
    note:function(title,text){var b=bars[title], n=b&&b.querySelector('.secnote');if(n)n.textContent=text||'';},
    isOpen:function(title){var b=bars[title];return !!(b&&b.classList.contains('open'));}
  };
})();

/* @endregion: page */

/* @region: info -- a small "i" beside each section or heading that has notes; hover it for a second (or tab to it) to read them */
(function infoModule(){
try{
  var tip=null, timer=null, hider=null;
  function $(id){return document.getElementById(id);}
  function mkTip(){
    tip=document.createElement('div');tip.id='infotip';tip.hidden=true;tip.setAttribute('role','tooltip');document.body.appendChild(tip);
    tip.addEventListener('mouseenter',function(){clearTimeout(hider);});
    tip.addEventListener('mouseleave',function(){hideSoon();});
  }
  /* a note counts when nothing between it and its owner hides it (a folded section does not hide it) */
  function hidden(n,owner){
    var e=n;
    while(e&&e!==owner){
      if(e.hidden||(e.style&&e.style.display==='none')){if(!(e.classList&&e.classList.contains('secbody')&&e.parentNode===owner))return true;}
      e=e.parentNode;
    }
    return false;
  }
  function notesOf(owner){
    var list=[], out=[], i, s;
    if(owner.classList.contains('secfs'))list=owner.querySelectorAll('p.note:not(.pst)');
    else if(owner.classList.contains('stage-head')){s=owner.nextElementSibling;while(s&&!s.classList.contains('stage-head')){if(s.matches('p.note:not(.pst)'))list.push(s);s=s.nextElementSibling;}}
    else if(owner.classList.contains('legtitle'))list=owner.parentNode.querySelectorAll(':scope > p.note:not(.pst)');
    for(i=0;i<list.length;i++){if(!hidden(list[i],owner)&&list[i].textContent.trim())out.push(list[i]);}
    return out;
  }
  function mkIcon(owner){
    var ic=document.createElement('span');
    ic.className='infoi';ic.textContent='i';ic.tabIndex=0;ic.setAttribute('role','img');ic.setAttribute('aria-label','Information');ic._owner=owner;
    ['mousedown','click'].forEach(function(ev){ic.addEventListener(ev,function(e){e.stopPropagation();});});
    return ic;
  }
  function place(ic,box){
    var r=ic.getBoundingClientRect(), w=box.offsetWidth, h=box.offsetHeight, x=Math.min(Math.max(8,r.left-8),window.innerWidth-w-8), y=r.bottom+8;
    if(y+h>window.innerHeight-8)y=Math.max(8,r.top-h-8);
    box.style.left=x+'px';box.style.top=y+'px';
  }
  function show(ic){
    var ns=notesOf(ic._owner);
    if(!ns.length)return;
    if(!tip)mkTip();
    tip.textContent='';
    ns.forEach(function(n){
      var d=document.createElement('div'), c=n.cloneNode(true);
      d.className='tipitem';c.removeAttribute('id');c.className='tipnote';c.hidden=false;c.style.display='';
      [].forEach.call(c.querySelectorAll('[id]'),function(x){x.removeAttribute('id');});
      d.appendChild(c);tip.appendChild(d);
    });
    tip.hidden=false;place(ic,tip);
  }
  function hide(){if(tip)tip.hidden=true;}
  function hideSoon(){clearTimeout(hider);hider=setTimeout(hide,200);}
  function refresh(){
    [].forEach.call(document.querySelectorAll('#panel .secfs'),function(fs){
      var bar=fs.querySelector(':scope > .advbar'), ic, n;
      if(!bar)return;
      n=notesOf(fs).length;ic=bar.querySelector(':scope > .infoi');
      if(n&&!ic){ic=mkIcon(fs);bar.appendChild(ic);}
      if(ic)ic.classList.toggle('none',!n);
    });
    [].forEach.call(document.querySelectorAll('.stage-head, #legtype .legtitle'),function(sh){
      var host=sh.classList.contains('legtitle')?sh:sh.querySelector('h2'), ic, n;
      if(!host)return;
      n=notesOf(sh).length;ic=host.querySelector(':scope > .infoi');
      if(n&&!ic){ic=mkIcon(sh);ic.classList.add('inl');host.appendChild(ic);}
      if(ic)ic.classList.toggle('none',!n);
    });
  }
  var later=null;
  function soon(){clearTimeout(later);later=setTimeout(refresh,150);}
  document.addEventListener('mouseover',function(e){
    var ic=e.target.closest&&e.target.closest('.infoi');
    if(!ic||ic.classList.contains('none'))return;
    clearTimeout(hider);clearTimeout(timer);
    timer=setTimeout(function(){show(ic);},CFG.info.delay);
  });
  document.addEventListener('mouseout',function(e){
    var ic=e.target.closest&&e.target.closest('.infoi');
    if(!ic)return;
    clearTimeout(timer);hideSoon();
  });
  document.addEventListener('focusin',function(e){var ic=e.target.closest&&e.target.closest('.infoi');if(ic&&!ic.classList.contains('none')){clearTimeout(hider);show(ic);}});
  document.addEventListener('focusout',function(e){if(e.target.closest&&e.target.closest('.infoi'))hide();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')hide();});
  document.addEventListener('click',soon);
  new MutationObserver(soon).observe($('panel'),{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','style']});
  refresh();
  window.INFOAPI={refresh:refresh,notes:notesOf};
}catch(err){if(window.console)console.error('info icons',err);}
})();
/* @endregion: info */

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
  function layerOf(it){return (it.type==='frame'&&!it.p.shape)?0:((it.type==='tile'||it.type==='prtgobj')?1:2);}   /* only the default bucket a brand-new item starts in; it.ord (below) is what actually controls stacking once set */
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
    function isBox(it){return it.type==='frame'||it.type==='tile'||(it.type==='prtgobj'&&objMode(it)==='box');}   /* items with a size of their own, which you can resize */
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
  function snapV(v){return D.grid>0?Math.round(v/D.grid)*D.grid:Math.round(v);}
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
  var CHIPS={success:['#DCFCE7','#166534'],warning:['#FEF3C7','#92400E'],danger:['#FEE2E2','#991B1B'],info:['#DBEAFE','#1E40AF'],neutral:['#E2E8F0','#334155']};

  /* a shape is a frame that draws a form instead of a titled card: box shapes, a line, an arrow, or a flowing arrow whose chevrons blink one after the other in the direction of the flow */
  var SHAPES=[['rect','Rectangle'],['round','Rounded rectangle'],['pill','Pill'],['circle','Circle or ellipse'],['line','Line'],['arrow','Arrow'],['flow','Flowing arrow']];
  var SHAPENAME={rect:'Rectangle',round:'Rounded rectangle',pill:'Pill',circle:'Circle',line:'Line',arrow:'Arrow',flow:'Flowing arrow'};
  function newShapeP(kind){return extend(newFrameP('Light card'),{title:'',shape:kind||'arrow',dir:'right',thick:6,color:'#007DB8',speed:'1.6',group:false});}
  function shapeHTML(it){
    var p=it.p, k=p.shape, w=it.w, h=it.h, c=p.color||'#007DB8', t=Math.max(1,parseInt(p.thick,10)||6), d=p.dir||'right', hz=(d==='right'||d==='left'),
        rad, css, dirs, long, S, tw, n, sp, step, rot, chev='', i, dl, ah, al, head;
    if(k==='rect'||k==='round'||k==='pill'||k==='circle'){
      rad=(k==='rect')?'0':(k==='pill'?'9999px':(k==='circle'?'50%':(p.radius+'px')));
      return '<span style="display:flex;align-items:center;justify-content:center;text-align:center;'+cardCss(p,it)+'border-radius:'+rad+';font-size:'+p.tsize+'px;font-weight:'+p.tweight+';color:'+p.tcolor+';line-height:1.25;">'+(p.title?escMulti(p.title):'')+'</span>';
    }
    long=hz?w:h;
    css='display:flex;box-sizing:border-box;width:'+w+'px;height:'+h+'px;align-items:center;';
    dirs={right:'flex-direction:row;',left:'flex-direction:row-reverse;',down:'flex-direction:column;',up:'flex-direction:column-reverse;'}[d]||'flex-direction:row;';
    if(k==='line')return '<span style="'+css+'justify-content:center;"><span style="display:block;flex:0 0 auto;background:'+c+';border-radius:'+(t/2)+'px;'+(hz?'width:'+w+'px;height:'+t+'px;':'width:'+t+'px;height:'+h+'px;')+'"></span></span>';
    if(k==='arrow'){
      ah=Math.max(t*2,10);al=Math.max(Math.round(t*2.4),12);
      head={right:'border-top:'+ah+'px solid transparent;border-bottom:'+ah+'px solid transparent;border-left:'+al+'px solid '+c+';',
            left:'border-top:'+ah+'px solid transparent;border-bottom:'+ah+'px solid transparent;border-right:'+al+'px solid '+c+';',
            down:'border-left:'+ah+'px solid transparent;border-right:'+ah+'px solid transparent;border-top:'+al+'px solid '+c+';',
            up:'border-left:'+ah+'px solid transparent;border-right:'+ah+'px solid transparent;border-bottom:'+al+'px solid '+c+';'}[d]||'';
      return '<span style="'+css+dirs+'"><span style="display:block;flex:1 1 auto;background:'+c+';'+(hz?'height:'+t+'px;':'width:'+t+'px;')+'"></span><span style="display:block;flex:0 0 auto;width:0;height:0;'+head+'"></span></span>';
    }
    /* flow: chevrons along the direction, each blinking a little after the one before it, so the light travels the way the arrow points */
    S=Math.max(10,Math.round(t*2.6));tw=Math.max(2,Math.round(t));n=Math.max(2,Math.floor(long/(S*2.4)));sp=parseFloat(p.speed)||1.6;step=sp/n;
    rot={right:45,down:135,left:225,up:315}[d];
    for(i=0;i<n;i++){
      dl=(d==='right'||d==='down')?i*step:(n-1-i)*step;
      chev+='<span style="display:block;flex:0 0 auto;width:'+S+'px;height:'+S+'px;box-sizing:border-box;border-top:'+tw+'px solid '+c+';border-right:'+tw+'px solid '+c+';transform:rotate('+rot+'deg);opacity:.15;animation:pfblink '+sp+'s ease-in-out infinite;animation-delay:'+dl.toFixed(2)+'s;"></span>';
    }
    return '<style>@keyframes pfblink{0%,100%{opacity:.15}50%{opacity:1}}</style><span style="'+css+'justify-content:space-around;'+(hz?'flex-direction:row;':'flex-direction:column;')+'">'+chev+'</span>';
  }
  function newFrameP(style){return extend({title:'Title',fam:'Inter',tsize:18,tweight:'600',padx:20,pady:16,style:style},FSTYLES[style]);}
  function newTileP(style){return extend({caption:'Caption',value:'1,234',delta:'+4.2%',dir:'up',dcolor:'',fam:'Inter',csize:14,vsize:40,dsize:14,padx:18,pady:14,style:style},TSTYLES[style]);}
  function newChipP(){return {text:'Operational',variant:'success',fam:'Inter',size:13};}

  function cardCss(p,it){
    var a=(p.fillA==null?100:p.fillA)/100;
    var s='width:'+it.w+'px;height:'+it.h+'px;box-sizing:border-box;background:'+rgba(p.fill,a)+';';
    if(p.bw>0)s+='border:'+p.bw+'px solid '+p.bcolor+';';
    if(p.radius>0)s+='border-radius:'+p.radius+'px;';
    var sh=SHADOW[p.shadow]||'';
    if(sh)s+='box-shadow:'+sh+';';
    s+='padding:'+p.pady+'px '+p.padx+'px;overflow:hidden;font-family:'+familyStack(p.fam)+';';
    return s;
  }
  function frameHTML(it){
    var p=it.p;
    if(p.shape)return shapeHTML(it);
    return '<span style="display:block;'+cardCss(p,it)+'font-size:'+p.tsize+'px;font-weight:'+p.tweight+';color:'+p.tcolor+';line-height:1.25;">'+(p.title?escMulti(p.title):'')+'</span>';
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
  function chipHTML(it){
    var p=it.p, c=CHIPS[p.variant]||CHIPS.neutral;
    return '<span style="display:inline-block;padding:'+Math.round(p.size*0.4)+'px '+Math.round(p.size*0.95)+'px;border-radius:999px;background:'+c[0]+';color:'+c[1]+';font-family:'+familyStack(p.fam)+';font-size:'+p.size+'px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;white-space:nowrap;line-height:1.2;">'+esc(p.text||'')+'</span>';
  }

  function fontsOf(it){if(it.type==='prtgobj')return [];
    if(it.type==='frame')return [[it.p.fam,it.p.tweight||'400']];
    if(it.type==='tile')return [[it.p.fam,'500'],[it.p.fam,'700'],[it.p.fam,'600']];
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
  var TYPENAME={frame:'Frame',tile:'Number tile',label:'Label',button:'Button',chip:'Status chip',prtgobj:'PRTG object'};
  var ICON={frame:'F',tile:'N',label:'T',button:'B',chip:'C',prtgobj:'O'};
  function itemName(it){
    var n='';
    if(it.type==='frame')n=it.p.title||'';
    else if(it.type==='tile')n=it.p.caption||'';
    else if(it.type==='chip')n=it.p.text||'';
    else if(it.type==='prtgobj')n=it.p.name||'';
      else n=it.state.v.txt||'';
    n=String(n).split(/\r?\n/)[0];
    if(!n)n=(it.type==='frame'&&it.p.shape)?(SHAPENAME[it.p.shape]||'Shape'):((it.type==='frame'&&it.p.group===false)?'Background':TYPENAME[it.type]);
    return n.length>30?n.substring(0,29)+'\u2026':n;
  }

  /* ---------- rendering ---------- */
  function oe(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
    /* a PRTG object file is drawn by PRTG, so the canvas shows a labelled box of the right size */
    function objHTML(it){
      var t=it.p.target||{}, tn=t.name||(t.id?('ID '+t.id):'no target chosen'), st=(DASHAPI.pv||{})[it.id], line='PRTG draws this object.';
      if(st&&st.state==='ok')return '<span style="display:block;width:'+Math.round(it.w)+'px;height:'+Math.round(it.h)+'px"></span>';   /* the live preview is drawn behind this transparent box, which takes the clicks */
      if(st&&st.state==='loading')line='Loading PRTG\u2019s drawing\u2026';
      else if(st&&st.state==='error')line='No live preview: '+oe(st.msg)+'.';
      return '<span style="display:block;width:'+Math.round(it.w)+'px;height:'+Math.round(it.h)+'px;box-sizing:border-box;border:2px dashed #7b8cc4;border-radius:8px;background:repeating-linear-gradient(135deg,#eef1fb,#eef1fb 10px,#e4e9f8 10px,#e4e9f8 20px);color:#2a3358;font:12px/1.35 Segoe UI,Arial,sans-serif;padding:10px 12px;overflow:hidden"><span style="display:block;font-size:11px;color:#5b6aa6">'+oe(it.p.cat)+'</span><span style="display:block;font-size:15px;font-weight:600">'+oe(it.p.name)+'</span><span style="display:block;margin-top:6px">Shows: '+oe(tn)+'</span><span style="display:block;color:#6b7399;margin-top:2px">'+line+' Size '+Math.round(it.w)+' \u00D7 '+Math.round(it.h)+'</span></span>';
    }
    function itemInner(it){
    var h;
    if(it.type==='frame')h=frameHTML(it);
    else if(it.type==='tile')h=tileHTML(it);
    else if(it.type==='chip')h=chipHTML(it);
      else if(it.type==='prtgobj')h=objHTML(it);
    else h=stateHTML(it);
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
    var olds=canvas.querySelectorAll('.ditem');for(var oi=0;oi<olds.length;oi++)olds[oi].parentNode.removeChild(olds[oi]);   /* the live preview layer stays put, so previews do not reload on every redraw */
    var ord=order();
    for(var i=0;i<ord.length;i++)canvas.appendChild(makeNode(ord[i],i+1));
    canvas.appendChild(selBox);
    measure();updateSel();buildList();updateFonts();syncCode();
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
  function updateSel(){
    var it=byId(D.sel);
    if(!it){selBox.style.display='none';return;}
    selBox.style.display='block';
    selBox.style.left=it.x+'px';selBox.style.top=it.y+'px';
    selBox.style.width=it.w+'px';selBox.style.height=it.h+'px';
    selBox.style.borderWidth=Math.max(1,2/scale)+'px';
    var hs=14/scale;
    handle.style.width=hs+'px';handle.style.height=hs+'px';
    handle.style.right=(-hs/2)+'px';handle.style.bottom=(-hs/2)+'px';
    handle.style.display=isBox(it)?'block':'none';
  }
  function applyScale(){
    var avail=stageEl.clientWidth-4;
    if(avail<200)avail=900;
    scale=(D.zoom==='fit')?Math.min(1,Math.max(0.1,avail/D.w)):parseFloat(D.zoom);
    canvas.style.width=D.w+'px';canvas.style.height=D.h+'px';
    canvas.style.transform='scale('+scale+')';
    wrap.style.width=Math.round(D.w*scale)+'px';wrap.style.height=Math.round(D.h*scale)+'px';
    updateSel();
  }

  function syncCode(){
    if(!codeEl)return;
    var it=byId(D.sel);
    codeEl.value=it?(htmlCache[it.id]||''):'';
  }

  /* ---------- items list ---------- */
  function exApi(){return (typeof window.EXAPI==='object'&&window.EXAPI)?window.EXAPI:null;}
  function buildList(){
    if(window.SECAPI)SECAPI.note('Items on the canvas',D.items.length?(D.items.length+(D.items.length===1?' item':' items')):'none yet');
    listEl.innerHTML='';
    var ord=order(), longest=0, i, ex=exApi(), exItems=(ex&&ex.state&&ex.state.items)||[];
    if(!ord.length&&!exItems.length){listEl.appendChild(el_('p','note pst','Nothing yet. Use Build above.'));}
    ord.forEach(function(it){
      var len=(it.type==='prtgobj')?0:(htmlCache[it.id]||'').length;
      if(len>longest)longest=len;
      var row=el_('div','drow'+(it.id===D.sel?' on':''));
      row.style.paddingLeft=(8+depthOf(it)*14)+'px';
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
      var fixed=(k==='w'||k==='h')&&!isBox(it);
      if(fixed){inp.disabled=true;inp.title='Set by the content';}
      inp.addEventListener('input',function(){
        var v=parseFloat(inp.value);if(isNaN(v))return;
        if(k==='w'||k==='h')v=Math.max(20,v);
        var delta=v-it[k];
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
    w.appendChild(el_('label',null,'Layer'));
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
  function buildForm(){
      try{document.dispatchEvent(new Event('dashselect'));}catch(e){}
    formEl.innerHTML='';
    codeEl=null;
    var it=byId(D.sel);
      if(window.SECAPI)SECAPI.note('Selected',it?itemName(it):'nothing selected');
    if(!it){formEl.appendChild(el_('p','note pst','Nothing selected. Click an item on the canvas, or add one above.'));return;}
    formEl.appendChild(el_('h4',null,TYPENAME[it.type]));
    formEl.appendChild(geoRow(it));
    formEl.appendChild(layerRow(it));
    formEl.appendChild(parentSel(it));
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
        ss.addEventListener('change',function(){it.p.sizing=ss.value;renderAll();buildForm();commit();});
        sw.appendChild(ss);formEl.appendChild(sw);
        var tn=el_('p','note pst');tn.id='dtgtname';tn.textContent=((it.p.target&&it.p.target.name)?('Showing: '+it.p.target.name):((it.p.target&&it.p.target.id)?'Showing the PRTG object with this ID.':'No target chosen yet.'))+(it.p.targetDefault?' This is the preview default: choose the real one under Objects already in PRTG.':'');formEl.appendChild(tn);
        formEl.appendChild(el_('p','note','The object\u2019s look comes from its file in PRTG, so there is nothing to paste. Choose what it shows under Objects already in PRTG, or type its ID. 0 means none.'));
      }else if(it.type==='frame'){
      var fb=el_('button','btn','Edit style');fb.type='button';fb.style.marginTop='12px';fb.style.width='100%';fb.id='dframeedit';
      if(!OBJAPI.frameEdit)fb.disabled=true;
      fb.addEventListener('click',function(){startFrameEdit(it);});
      formEl.appendChild(fb);
      formEl.appendChild(el_('p','note','Opens the editor from the Objects tab with this item\u2019s settings: title, style, colors, border, shadow, font, padding and size. Press Done to come back, or double-click the item.'));
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
    }else if(it.type==='chip'){
      formEl.appendChild(mk(it,'Text','text','text'));
      formEl.appendChild(pair(mk(it,'Color','variant','select',[['success','Green'],['warning','Amber'],['danger','Red'],['info','Blue'],['neutral','Grey']]),mk(it,'Size','size','number',{min:8,max:40})));
      formEl.appendChild(mk(it,'Font','fam','select',famOpts()));
    }else{
      var b=el_('button','btn','Edit style');b.type='button';b.style.marginTop='12px';b.style.width='100%';
      b.addEventListener('click',function(){startEdit(it);});
      formEl.appendChild(b);
      formEl.appendChild(el_('p','note','Opens the '+(it.type==='button'?'Button':'Text label')+' tab with this item\u2019s settings: fonts, presets, 3D, link and everything else. Press Done to come back.'));
    }
    var act=el_('div','actions');
    var d1=el_('button','btn ghost','Duplicate');d1.type='button';d1.addEventListener('click',function(){dup(it);});
    var d2=el_('button','btn ghost','Delete');d2.type='button';d2.addEventListener('click',function(){del(it);});
    var d3=el_('button','btn ghost','Copy');d3.type='button';d3.title='Copy (Ctrl+C)';d3.addEventListener('click',function(){copyItem(it,false);});
    var d4=el_('button','btn ghost','Paste');d4.type='button';d4.title='Paste (Ctrl+V)';d4.addEventListener('click',function(){pasteItem();});
    act.appendChild(d1);act.appendChild(d2);act.appendChild(d3);act.appendChild(d4);formEl.appendChild(act);
    if(it.type==='frame')formEl.appendChild(el_('p','note','Deleting a frame also deletes what is inside it. Undo brings it back.'));
      if(it.type==='prtgobj'){syncCode();return;}   /* nothing to paste for an object PRTG draws */
    var cw=el_('div','dfld');
    cw.appendChild(el_('label',null,'Code for this item'));
    codeEl=el_('textarea');codeEl.rows=7;codeEl.readOnly=true;codeEl.spellcheck=false;codeEl.id='dcode';
    codeEl.style.fontFamily='Consolas,Monaco,monospace';codeEl.style.fontSize='11px';
    cw.appendChild(codeEl);
    var cb=el_('button','btn ghost','Copy code');cb.type='button';cb.style.marginTop='8px';cb.style.width='100%';
    cb.addEventListener('click',function(){copyText(htmlCache[it.id]||'');});
    cw.appendChild(cb);
    cw.appendChild(el_('p','note','Paste this into HTML Before of a Custom HTML item, and give the item this size and position. PRTG rewrites div as span when you paste, so these pieces are written as spans that declare display:block and keep their size. Web fonts are not included here. Use Copy font links once per dashboard. For a frame that resizes with its item, use Objects, Frame.'));
    formEl.appendChild(cw);
    syncCode();
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
      if(type==='shape'){it.type='frame';it.w=CFG.shape.w;it.h=CFG.shape.h;it.p=newShapeP('arrow');}
      else if(type==='frame'){it.w=CFG.frame.w;it.h=CFG.frame.h;it.p=newFrameP('Light card');}
      else if(type==='tile'){it.w=230;it.h=112;it.p=newTileP('Light tile');}
      else if(type==='chip'){it.p=newChipP();}
        else if(type==='prtgobj'){it.w=(extra&&extra.w)||320;it.h=(extra&&extra.h)||200;it.p={cat:extra.cat,name:extra.name,value:extra.value,target:extra.target?{id:parseInt(extra.target.id,10)||0,name:extra.target.name||''}:{id:0,name:''}};if(extra.target)it.p.targetDefault=true;}   /* a default target, until you choose the real one */
      else{it.state=defaultState(type);}
      var siblings=0;
      D.items.forEach(function(x){if(x.parent===it.parent&&!(x.type==='frame'&&x.p.group===false))siblings++;});
      var off=(siblings%8)*20;
      if(host){it.x=snapV(host.x+20+off);it.y=snapV(host.y+((host.p.title)?58:20)+off);}
      else{it.x=snapV(40+off);it.y=snapV(40+off);}
      if(extra&&extra.at){   /* placed or dropped: where you let go, and inside the smallest frame you let go on */
        it.x=snapV(extra.at.x);it.y=snapV(extra.at.y);
        var bf=null, ba=1e18;
        D.items.forEach(function(f){if(isGroupFrame(f)&&extra.at.x>=f.x&&extra.at.x<=f.x+f.w&&extra.at.y>=f.y&&extra.at.y<=f.y+f.h&&f.w*f.h<ba){ba=f.w*f.h;bf=f.id;}});
        it.parent=bf;
      }
      it.ord=layerOf(it)*100000+(++D.ordSeq);
      D.items.push(it);
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
    if(t===handle||(handle.contains&&handle.contains(t)))return;
    var n=t.closest?t.closest('.ditem'):null;
    if(!n){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();select(null);return;}
    e.preventDefault();
    if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
    var it=byId(parseInt(n.getAttribute('data-id'),10));
    if(!it)return;
    if(D.sel!==it.id)select(it.id);
    var kids=isGroupFrame(it)?descendants(it.id):[];
    drag={mode:'move',sx:e.clientX,sy:e.clientY,it:it,ox:it.x,oy:it.y,moved:false,
      kids:kids.map(function(k){return {k:k,x:k.x,y:k.y};})};
  });
  canvas.addEventListener('click',function(e){e.preventDefault();});
  canvas.addEventListener('dblclick',function(e){
    var n=e.target.closest?e.target.closest('.ditem'):null;
    if(!n)return;
    var it=byId(parseInt(n.getAttribute('data-id'),10));
    if(it&&(it.type==='label'||it.type==='button'))startEdit(it);
    else if(it&&it.type==='frame')startFrameEdit(it);
  });
  handle.addEventListener('mousedown',function(e){
    e.preventDefault();e.stopPropagation();
    var it=byId(D.sel);if(!it)return;
    drag={mode:'size',sx:e.clientX,sy:e.clientY,it:it,ow:it.w,oh:it.h};
  });
  document.addEventListener('mousemove',function(e){
    if(!drag)return;
    var dx=(e.clientX-drag.sx)/scale, dy=(e.clientY-drag.sy)/scale;
    if(drag.mode==='move'){
      if(!drag.moved&&(Math.abs(dx)+Math.abs(dy))<3)return;
      drag.moved=true;
      var nx=snapV(drag.ox+dx), ny=snapV(drag.oy+dy);
      var ddx=nx-drag.ox, ddy=ny-drag.oy;
      drag.it.x=nx;drag.it.y=ny;place(drag.it);
      drag.kids.forEach(function(o){o.k.x=o.x+ddx;o.k.y=o.y+ddy;place(o.k);});
      updateSel();
    }else if(drag.mode==='size'){
      drag.it.w=Math.max(40,snapV(drag.ow+dx));
      drag.it.h=Math.max(40,snapV(drag.oh+dy));
      refreshItem(drag.it);
    }
  });
  document.addEventListener('mouseup',function(){
    if(!drag)return;
    var d=drag;drag=null;
    if(d.mode==='move'&&d.moved){d.it.parent=reparentTarget(d.it);renderAll();buildForm();commit();}
    else if(d.mode==='size'){buildForm();buildList();commit();}
  });
  document.addEventListener('keydown',function(e){
    if(!DASHAPI.active)return;
    var t=e.target, tag=t&&t.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;
    var k=(e.key||'').toLowerCase();
    if((e.ctrlKey||e.metaKey)&&k==='z'){e.preventDefault();doUndo();return;}
    if((e.ctrlKey||e.metaKey)&&k==='y'){e.preventDefault();doRedo();return;}
    var it=byId(D.sel);
    if((e.ctrlKey||e.metaKey)&&!e.altKey&&k==='v'){e.preventDefault();pasteItem();return;}
    if(!it)return;
    if((e.ctrlKey||e.metaKey)&&!e.altKey&&(k==='c'||k==='x')){e.preventDefault();copyItem(it,k==='x');return;}
    if((e.ctrlKey||e.metaKey)&&k==='d'){e.preventDefault();dup(it);return;}
    if(k==='delete'||k==='backspace'){e.preventDefault();del(it);return;}
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
  document.getElementById('dredo').addEventListener('click',doRedo);
  document.getElementById('dgrid').addEventListener('change',function(){D.grid=parseInt(this.value,10)||0;});
  document.getElementById('dzoom').addEventListener('change',function(){D.zoom=this.value;applyScale();});
  document.getElementById('ddark').addEventListener('change',function(){canvas.classList.toggle('dark',this.checked);});
  function sizeChange(){
    var w=parseInt(document.getElementById('dw').value,10), h=parseInt(document.getElementById('dh').value,10);
    if(!(w>=320&&h>=240))return;
    D.w=w;D.h=h;applyScale();commit();
  }
  document.getElementById('dw').addEventListener('change',sizeChange);
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
  DASHAPI.finish=function(){if(editing!==null)finishEdit(true);};
  TABS.register({id:'dash',button:'mDash',api:DASHAPI,
    onClick:function(){if(editing!==null)finishEdit(true);else TABS.show('dash');},   /* clicking the tab while editing a label or button finishes the edit first */
    beforeLeave:function(){DASHAPI.finish();},
    open:function(){DASHAPI.active=true;document.body.classList.add('dash');applyScale();renderAll();buildForm();}});
    DASHAPI.frame={FSTYLES:FSTYLES,SHADOW:SHADOW,WEIGHTS:WEIGHTS,newFrameP:newFrameP,frameHTML:frameHTML,newShapeP:newShapeP,SHAPES:SHAPES};
    /* what a push to PRTG needs: every item back to front, its box in canvas pixels, its code, and the web fonts that code uses */
    DASHAPI.uid=function(){return D.uid;};
    DASHAPI.pv=DASHAPI.pv||{};
    DASHAPI.markSaved=function(){savedSnap=snapModel();};
    DASHAPI.isDirty=function(){return D.items.length>0&&snapModel()!==savedSnap;};
    window.addEventListener('beforeunload',function(e){if(DASHAPI.isDirty()){e.preventDefault();e.returnValue='';return '';}});   /* the browser asks before an unsaved layout is lost */
    DASHAPI.addObject=function(entry){addItem('prtgobj',entry);};
    DASHAPI.select=function(id){if(!byId(id))return;D.sel=id;updateSel();buildList();buildForm();};
    DASHAPI.deselect=function(){if(D.sel!==null)select(null);};
    DASHAPI.dropObject=function(entry,cx,cy){var r=canvas.getBoundingClientRect(), e={}, k;for(k in entry)e[k]=entry[k];e.at={x:Math.max(0,Math.min(D.w-40,(cx-r.left)/scale)),y:Math.max(0,Math.min(D.h-40,(cy-r.top)/scale))};addItem('prtgobj',e);};
    DASHAPI.add=function(type){addItem(type);};
    DASHAPI.addAt=function(type,cx,cy){var r=canvas.getBoundingClientRect();addItem(type,{at:{x:Math.max(0,Math.min(D.w-40,(cx-r.left)/scale)),y:Math.max(0,Math.min(D.h-40,(cy-r.top)/scale))}});};
    DASHAPI.objectLayout=function(){var ord=order(), out=[];ord.forEach(function(it,i){if(it.type==='prtgobj')out.push({id:it.id,file:it.p.value,cat:it.p.cat,name:it.p.name,target:(it.p.target&&it.p.target.id)||0,x:it.x,y:it.y,w:it.w,h:it.h,z:i+1,mode:objMode(it)});});return out;};
    DASHAPI.setNatural=function(id,w,h){var it=byId(id);if(!it||it.type!=='prtgobj'||objMode(it)!=='content')return;w=Math.max(1,Math.round(w));h=Math.max(1,Math.round(h));if(it.w===w&&it.h===h)return;it.w=w;it.h=h;var n=nodeOf(id);if(n){n.style.width=w+'px';n.style.height=h+'px';}updateSel();buildList();if(D.sel===id)buildForm();};
    DASHAPI.applyInitial=function(id,w,h){var it=byId(id);if(!it||it.type!=='prtgobj'||objMode(it)!=='box'||!(it.w===320&&it.h===200))return false;it.w=w;it.h=h;renderAll();return true;};   /* the size the object file itself asks for, if you have not changed the default */
    DASHAPI.rerender=function(){renderAll();};
    DASHAPI.selected=function(){var it=byId(D.sel);return it?{id:it.id,type:it.type,p:it.p}:null;};
    DASHAPI.setTarget=function(id,tgt){var it=byId(id);if(!it||it.type!=='prtgobj')return false;it.p.target={id:parseInt(tgt.id,10)||0,name:tgt.name||''};it.p.targetDefault=false;refreshItem(it);buildForm();commit();return true;};
    DASHAPI.layoutText=function(){return snapModel();};
    DASHAPI.pushItems=function(){
      var out=[], ord=order(), i, j;
      for(i=0;i<ord.length;i++){
        var it=ord[i], h=itemInner(it), fam={}, f=fontsOf(it), links=[];
        for(j=0;j<f.length;j++){if(!f[j][0]||isLocalFont(f[j][0]))continue;(fam[f[j][0]]=fam[f[j][0]]||{})[f[j][1]]=1;}
        Object.keys(fam).forEach(function(k){
          var ws=Object.keys(fam[k]).map(Number).sort(function(a,b){return a-b;});
          links.push('https://fonts.googleapis.com/css2?family='+k.replace(/ /g,'+')+':wght@'+ws.join(';')+'&display=swap');
        });
        var rec={id:it.id,type:it.type,name:itemName(it),left:Math.round(it.x),top:Math.round(it.y),width:Math.round(it.w),height:Math.round(it.h),html:(it.type==='prtgobj'?'':h),fonts:links};
        if(it.type==='prtgobj')rec.object={cat:it.p.cat,name:it.p.name,value:it.p.value,targetDefault:!!it.p.targetDefault,target:{id:(it.p.target&&it.p.target.id)||0,name:(it.p.target&&it.p.target.name)||''}};
        out.push(rec);
      }
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
  var S={maps:null,objFile:null,catalog:null,tgt:{},reviewed:null,cls:null,busy:false,forgetArm:null};
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
    r=bar.getBoundingClientRect();top=r.bottom+(msg.hidden?0:msg.offsetHeight)+6;
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
  function base(){return normalize($('pushserver').value);}
  /* this page always runs as a chrome-extension:// page now, never opened from
     PRTG itself, so pageOrigin() is always null here; a server address is
     always required, and the old "copy this file into PRTG's webroot" note
     (#pushhow) no longer applies. */
  function describeWhere(){
    var b=base(), n=$('pushwhere');
    $('pushhow').hidden=true;
    if(b){n.textContent='Will connect to '+b+'.';n.className='note pst';}
    else{n.textContent='Enter your PRTG server\u2019s address below.';n.className='note pst';}
  }
  function cannotReach(b){
    return 'Could not reach '+(b||'your PRTG server')+'. Check the address, that PRTG is running, and that you allowed this extension to reach that server when Chrome asked. If PRTG uses a certificate your browser does not already trust, open '+(b||'that address')+' in a new tab once, click through the warning, then press Connect again.';
  }
  /* PRTG's own pages add an anti-CSRF token to every request that is not a GET (it comes from a <meta name="csrf-token"> tag). The loader keeps the token
     before it replaces the page; failing that, it is read from the page, or from a PRTG page fetched once. */
  var tokenPromise=null;
  function csrf(){
    if(tokenPromise)return tokenPromise;
    var t=null;
    try{t=window.__prtgCsrf||((document.querySelector('meta[name="csrf-token"]')||{}).content)||null;}catch(e){}
    if(t){tokenPromise=Promise.resolve(t);return tokenPromise;}
    tokenPromise=fetch(base()+'/index.htm',{credentials:base()?'include':'same-origin',headers:{'X-Requested-With':'XMLHttpRequest'}}).then(function(r){return r.text();}).then(function(h){
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
  function http(method,path,params){
    var b=base(), p=withAuth(params), url=b+path;
    var headers={'X-Requested-With':'XMLHttpRequest','Accept':(method==='GET')?'application/json, text/javascript, */*; q=0.01':'*/*'};
    var go=function(tok){
      var init={method:method,credentials:b?'include':'same-origin',headers:headers};
      if(method==='POST'){headers['Content-Type']='application/x-www-form-urlencoded; charset=UTF-8';if(tok)headers['anti-csrf-token']=tok;init.body=qstring(p,false);}
      else{var qs=qstring(p,true);if(qs)url+=(url.indexOf('?')>-1?'&':'?')+qs;}
      return fetch(url,init).then(function(r){
        return r.text().then(function(t){
          if(!r.ok){var e=new Error('PRTG answered '+r.status+' for '+path+'.');e.status=r.status;throw e;}
          return t;
        });
      },function(){throw new Error(cannotReach(b));});
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
  /* every object file PRTG lists, as {cat, name, value}; value is what PRTG wants as mapobject_ when the object is placed on a map */
  function parseCatalog(cat){
    var out=[], c, i, e;
    for(c in cat){
      if(!Array.isArray(cat[c]))continue;
      for(i=0;i<cat[c].length;i++){
        e=cat[c][i];
        if(e&&typeof e==='object'&&typeof e.value==='string'&&/\.htm$/i.test(e.value)&&!/ownhtmlonly/i.test(e.value))out.push({cat:c,name:String(e.name||'').trim(),value:e.value});
      }
    }
    return out;
  }
  function libLoad(){try{var o=JSON.parse(localStorage.getItem(CFG.keys.library)||'{}');return (o&&typeof o==='object')?o:{};}catch(e){return {};}}
  function keyOf(cat,name){return (String(cat)+'\u0001'+String(name)).toLowerCase();}
  /* ---- what each push did, so it can be undone */
  function loadHist(){try{var a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
  function saveHist(a){try{localStorage.setItem(KEY,JSON.stringify(a.slice(-20)));}catch(e){}}
  function entryAdded(e){return e.added||e.subids||[];}       /* pushes made by earlier versions only recorded what they added */
  function entryCount(e){return entryAdded(e).length+(e.updated||[]).length+(e.removed||[]).length;}
  function undoCount(e){return entryAdded(e).length+(e.updated||[]).filter(function(u){return u.before;}).length;}   /* what Undo can reverse: deleted items cannot be brought back */
  function mapId(){return $('pushmap').value;}
  function mapName(){var o=$('pushmap').options[$('pushmap').selectedIndex];return o?o.textContent:'';}
  function lastPush(){var h=loadHist(),i;for(i=h.length-1;i>=0;i--){if(String(h[i].map)===String(mapId())&&undoCount(h[i]))return h[i];}return null;}
  function addsOnly(e){return !(e.updated&&e.updated.length)&&!(e.removed&&e.removed.length);}
  /* ---- what was sent for each Dashboard item, per server, map and layout */
  function loadSync(){try{var o=JSON.parse(localStorage.getItem(SKEY)||'{}');return (o&&typeof o==='object')?o:{};}catch(e){return {};}}
  function saveSync(o){
    var ks=Object.keys(o).sort(function(a,b){return (o[b].at||0)-(o[a].at||0);}), n={};
    ks.slice(0,12).forEach(function(k){n[k]=o[k];});
    try{localStorage.setItem(SKEY,JSON.stringify(n));}catch(e){}
  }
  function syncKey(){return (base()||pageOrigin()||'')+'|'+mapId()+'|'+DASHAPI.uid();}
  function getRec(){var r=loadSync()[syncKey()];return (r&&r.items)?r:{at:0,items:{}};}
  function putRec(r){var o=loadSync();r.at=Date.now();o[syncKey()]=r;saveSync(o);}
  function dropRec(){var o=loadSync();delete o[syncKey()];saveSync(o);}
  function hasRec(){return Object.keys(getRec().items).length>0;}
  function updateButtons(){
    var ready=!!(S.maps&&S.objFile&&mapId());
    $('pushmap').disabled=!(S.maps&&S.maps.length)||S.busy;
    $('newmapToggle').disabled=!S.maps||S.busy;
    $('pushreview').disabled=!ready||S.busy;
    $('objsamples').disabled=!(S.maps&&mapId())||S.busy;
    $('exload').disabled=!(S.maps&&mapId())||S.busy;
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
      if(it.object){o.kind='object';o.object=it.object;o.html='';}
      else{o.kind='paste';o.html=norm(links+it.html);}
      return o;
    });
  }
  function fullSet(it){return {left:it.left,top:it.top,width:it.width,height:it.height,z:it.z,html:it.html};}
  function objIdent(it){return it.kind==='object'?{value:it.object.value,target:it.object.target.id}:undefined;}   /* which file and which target an item was added with: PRTG fixes them when the item is added */
  /* each item is new, changed, unchanged, or (remembered but gone from the Dashboard) removed */
  function classify(p){
    var rec=getRec(), seen={}, out={items:[],removed:[],nNew:0,nChanged:0,nSame:0,nMissing:0,nReplace:0,hadRec:Object.keys(rec.items).length>0};
    p.forEach(function(it){
      var r=rec.items[it.id], why=[];
      seen[it.id]=1;
      if(it.kind==='object'&&S.catalog&&!S.catalog.some(function(c){return c.value===it.object.value;})){it.status='missing';out.nMissing++;out.items.push(it);return;}   /* the file is not in PRTG: it cannot be placed */
      if(!r||r.type&&r.type!==it.type){it.status='new';out.nNew++;}
      else{
        it.subid=r.subid;
        if(it.kind==='object'&&(!r.obj||r.obj.value!==it.object.value||String(r.obj.target)!==String(it.object.target.id))){
          it.replace=true;out.nReplace++;
          why.push(r.obj&&r.obj.value!==it.object.value?'different object file':'different target');
        }
        else if(!r.sent)why.push('not finished last time');
        else{
          if(r.sent.html!==it.html)why.push('code');
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
      else say(c.removed.length?('The map matches the Dashboard apart from the removed '+(c.removed.length===1?'item. It is':'items. They are')+' still on the map: tick the box below to delete '+(c.removed.length===1?'it':'them')+'.'):(c.nSame?'The map already matches the Dashboard.':'Nothing to push.'),'');
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
      if(c.nNew)parts.push(c.nNew+' new');if(c.nChanged)parts.push(c.nChanged+' changed');if(c.nSame)parts.push(c.nSame+' unchanged');if(c.removed.length)parts.push(c.removed.length+' removed from the Dashboard');if(c.nMissing)parts.push(c.nMissing+' not in PRTG\u2019s list yet');
      sum.textContent=(mixed?'Compared with what was pushed to \u201C'+mapName()+'\u201D last time: ':'This push to \u201C'+mapName()+'\u201D: ')+parts.join(', ')+'.'+(mixed?' Unchanged items are not touched. A changed item is rewritten completely (position, size, order and code), so anything you changed on it by hand in PRTG is replaced.':'')+(c.nReplace?' A replaced object is deleted and added again, because PRTG fixes an item\u2019s file and target when it is added.':'');
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
    c.removed.forEach(function(r){row({name:r.name},'removed','Removed from the Dashboard','removed');});
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
  function connect(){
    describeWhere();
    if(!pageOrigin()&&!base()){say('Enter your PRTG server\u2019s address below, then press Connect.','err');S.lastErr='enter a server address';$('prtgpop').hidden=false;try{$('pushserver').focus();}catch(e){}swSync();return;}
    if(CFG.connection.loginRequired&&!loginFilled()){loginMissing();return;}
    loginMark(false,false);
    say('Connecting\u2026','');
    $('pushconnect').disabled=true;S.maps=null;S.objFile=null;S.reviewed=null;S.cls=null;$('pushgo').hidden=true;$('pushlist').hidden=true;S.lastErr=null;S.reauth=!$('prtgpop').hidden;S.authAsked=false;swSync();
    ensureHostPermission(base()).then(function(ok){
      if(!ok){$('pushconnect').disabled=false;say('This page needs permission to talk to that server. Press Connect again and allow it when Chrome asks.','err');S.lastErr='permission not granted';swSync();return;}
      http('GET','/api/table.json',{content:'maps',columns:'name,objid'}).then(function(t){
        var j=parseJson(t,'The list of maps'), maps=(j&&j.maps)||[], sel=$('pushmap');
        sel.innerHTML='';
        maps.forEach(function(m){var o=document.createElement('option');o.value=String(m.objid);o.textContent=m.name;sel.appendChild(o);});
        S.maps=maps;
        return http('GET','/api/mapobject.json');
      }).then(function(t){
        var catj=parseJson(t,'The list of object files');
        S.objFile=findCustomHtml(catj);S.catalog=parseCatalog(catj);S.tgt={};
        openApp();
        if(!S.maps.length)say('Connected, but there are no maps. Create an empty map in PRTG first.','err');
        else if(!S.objFile)say('Connected, but PRTG\u2019s object list has no \u201CCustom HTML element\u201D, so nothing can be pushed.','err');
        else say('Connected. '+S.maps.length+(S.maps.length===1?' map':' maps')+' found.','ok');
      }).catch(function(err){
        S.maps=null;S.objFile=null;S.catalog=null;S.lastErr=(err&&err.status===401)?'login needed':((err&&err.message)||'could not connect');
        if(err&&err.status===401){
          authNeeded();
          if(CFG.connection.loginRequired){loginMark(true,true,'','PRTG did not accept this username and passhash.');say('PRTG did not accept this username and passhash. Check them and press Connect again.','err');}
          else say('PRTG refused the request (401: not authorised), even though you are logged in here. Enter your username and passhash (or an API token) below, then press Connect again. In PRTG, your passhash is on your My Account page.','err');
        }else say(err.message,'err');
      }).then(function(){
        $('pushconnect').disabled=false;PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};trReset();updateButtons();renderObjList();pickerSync();pvSync();resolveDefaults();
        $('objnote').textContent=objNoteText();
      });
    });
  }
  function updateTarget(){
    var m=$('pushmap'), t=$('pushtarget');
    if(!t)return;
    t.textContent=(m.disabled||!m.options.length)?'No map chosen yet. Choose one in the Add tab, under Existing PRTG maps.':'Pushes to the map \u201C'+m.options[m.selectedIndex].text+'\u201D. Change it in the Add tab, under Existing PRTG maps.';
  }
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
      return fetch(url,{method:'POST',credentials:b?'include':'same-origin',headers:headers,body:fd});
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
      $('newmapname').value='';$('newmapForm').hidden=true;newMapMsg('');
      say('Created \u201C'+name+'\u201D and selected it.','ok');
    }).catch(function(err){
      if(err&&err.status===401)authNeeded();
      newMapMsg((err&&err.message)||'Could not create the map.','err');
    }).then(function(){$('newmapgo').disabled=false;});
  }
  $('newmapToggle').addEventListener('click',function(){
    $('newmapForm').hidden=!$('newmapForm').hidden;
    if(!$('newmapForm').hidden)try{$('newmapname').focus();}catch(e){}
  });
  $('newmapcancel').addEventListener('click',function(){$('newmapForm').hidden=true;newMapMsg('');});
  $('newmapgo').addEventListener('click',createMap);
  $('newmapname').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();createMap();}});
  function objNoteText(){
    return S.catalog?('PRTG lists '+S.catalog.length+(S.catalog.length===1?' object file.':' object files.')+' Pick one and add it to the canvas, then choose what it shows. Files you design in the Objects tab appear here once they are in PRTG\u2019s mapobjects folder.'):'Switch PRTG on at the top of this tab to load the objects PRTG has. Files you design in the Objects tab appear here once they are in PRTG\u2019s mapobjects folder.';
  }
  /* read only the list of object files again; the login, the maps and what is selected stay as they are */
  function refreshObjects(){
    var b=$('objrefresh'), had=S.catalog?S.catalog.length:0;
    if(!(S.maps&&S.objFile)||b.disabled)return;
    b.disabled=true;$('objnote').textContent='Reading PRTG\u2019s list of object files\u2026';
    http('GET','/api/mapobject.json').then(function(t){
      var catj=parseJson(t,'The list of object files'), now;
      S.objFile=findCustomHtml(catj)||S.objFile;S.catalog=parseCatalog(catj);
      PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};
      renderObjList();pickerSync();pvSync();
      now=S.catalog.length;
      $('objnote').textContent=objNoteText()+(now>had?' '+(now-had)+' new since the last read.':(now<had?' '+(had-now)+' fewer than the last read.':' No change since the last read.'));
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
    return http('POST','/api/editmapobject.htm',{subid:sub,id:id,top:v.top!==undefined?v.top:v.top,left:v.left,width:v.width,height:v.height,zindex:v.z,htmlbefore_:v.html,htmlafter_:'',ElementLink:''});
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
    var entry={map:id,name:name,at:new Date().toISOString(),added:[],updated:[],removed:[]};
    c.items.forEach(function(it){if(it.status==='new')work.push({kind:'add',it:it});else if(it.status==='changed')work.push({kind:it.replace?'replace':'edit',it:it});});
    if(rm)c.removed.forEach(function(r){work.push({kind:'del',r:r});});
    var allAdds=work.every(function(w){return w.kind==='add';});
    S.busy=true;updateButtons();
    function finish(msg,kind){
      if(entryCount(entry)){var h=loadHist();h.push(entry);saveHist(h);}
      offerLayout();
      S.busy=false;S.reviewed=null;S.cls=null;$('pushgo').hidden=true;say(msg,kind);updateButtons();
    }
    function fail(err){
      if(err&&err.status===401)authNeeded();
      var w=work[k], hint=(w&&(w.kind==='edit'||w.kind==='replace')&&err&&err.status&&err.status!==401)?' If you deleted this item in PRTG by hand, use \u201CForget what was pushed\u201D and push again.':'';
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
        http('GET','/api/deletesubobject.htm',{id:id,subid:it.subid}).then(function(){
          entry.removed.push({id:it.id,subid:it.subid,name:it.name});delete rec.items[it.id];putRec(rec);
          return addOne(it);
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
    S.busy=true;updateButtons();
    function finish(){
      var h=loadHist(), k=-1, i;
      for(i=0;i<h.length;i++){if(h[i].at===lp.at&&String(h[i].map)===String(lp.map)){k=i;break;}}
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
      say(msg,left?'err':'ok');updateButtons();
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
    return fetch(url,{method:'GET',credentials:b?'include':'same-origin',headers:{'X-Requested-With':'XMLHttpRequest','Accept':'text/html, */*; q=0.01'}}).then(function(r){
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
  var EX={items:[],mapW:0,mapH:0,map:null,target:{},styles:''};
  function exLayerClass(){return ($('exon').checked?'':'off')+($('exdim').checked?' dim':'');}
  function exLayer(){var c=$('dcanvas'),l=$('dexist');if(!l){l=document.createElement('div');l.id='dexist';l.className=exLayerClass();c.insertBefore(l,c.firstChild);}return l;}
  function exClear(){
    var l=$('dexist'),x=$('exlist');
    EX.items=[];EX.mapW=0;EX.mapH=0;EX.map=null;EX.target={};
    if(l&&l.parentNode)l.parentNode.removeChild(l);
    x.hidden=true;x.textContent='';$('exonrow').hidden=true;$('exdimrow').hidden=true;$('exscrrow').hidden=true;$('exclearrow').hidden=true;$('exsize').hidden=true;$('exmsg').textContent='';
    if(typeof xeReset0==='function')xeReset0();
    try{document.dispatchEvent(new Event('exchanged'));}catch(e){}
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
    if(f.getAttribute('src')===PVSBX_URL){
      send();
    }else{
      f.addEventListener('load',function onLoad(){f.removeEventListener('load',onLoad);send();});
      f.setAttribute('src',PVSBX_URL);
    }
  }
  function exDoc(it,w,h){
    var origin=(base()||pageOrigin()||'');
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><base href="'+origin+'/"><link rel="stylesheet" href="/css/prtg0.css">'
      +'<style>html,body,#mapshow,#mapshow .view,#mapview{margin:0;padding:0;background:transparent!important;box-shadow:none!important;border:0!important}html,body{overflow:hidden}'
      +'#mapview{position:relative;width:'+w+'px;height:'+h+'px}#mapview .map_object{position:absolute!important;left:0!important;top:0!important;margin:0!important;width:'+w+'px!important;height:'+h+'px!important}</style>'+EX.styles
      +'</head><body id="mainbody" data-theme="0" class="language_en"><div id="mapshow"><div class="view" style="position:static;overflow:visible"><div id="mapview">'+it.outer+'</div></div></div></body></html>';
  }
  function exFrame(it,w,h){
    var f=document.createElement('iframe');
    f.setAttribute('tabindex','-1');
    setFramePreview(f,exDoc(it,w,h),{allowScripts:($('exscr').checked&&it.cat!=='Custom HTML')});
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
    if(!keepLayer)layer.textContent='';
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
    list.hidden=!items.length;$('exonrow').hidden=!items.length;$('exdimrow').hidden=!items.length;$('exscrrow').hidden=!items.length;$('exclearrow').hidden=!items.length;
    xeDecorate();
    try{document.dispatchEvent(new Event('exchanged'));}catch(e){}
  }
  function exLoad(){
    var id=mapId();
    if(!id)return;
    if(typeof xeReset0==='function')xeReset0();
    $('exload').disabled=true;$('exmsg').textContent='Reading the map\u2026';$('exmsg').className='note pst';
    sampleGet({kind:'items',label:'Items on the map',path:'/api/mapsvg.htm',params:{id:id}}).then(function(o){
      var m, n;
      $('exload').disabled=false;updateButtons();
      if(String(mapId())!==String(id))return;                 /* another map was chosen meanwhile */
      if(o.status===401){authNeeded();}
      if(o.error||o.status<200||o.status>=300){$('exmsg').textContent=o.error||('PRTG answered '+o.status+' for the map\u2019s items.');$('exmsg').className='note pst err';return;}
      EX.items=exParse(o.body||'');EX.map=id;
      m=/<svg\b[^>]*\bwidth="(\d+)px"/i.exec(o.body||'');n=/<svg\b[^>]*\bheight="(\d+)px"/i.exec(o.body||'');
      EX.mapW=m?parseInt(m[1],10):0;EX.mapH=n?parseInt(n[1],10):0;
      exRender();
      exNames().then(function(m){if(m===EX.map)exRender(true);});
      $('exsize').hidden=!(EX.mapW&&EX.mapH);
      $('exmsg').textContent=EX.items.length?(EX.items.length+(EX.items.length===1?' item':' items')+' on \u201C'+mapName()+'\u201D'+(EX.mapW?'. The map is '+EX.mapW+' \u00D7 '+EX.mapH+' px.':'.')+' Click one in the list to find it on the canvas.'):('There is nothing on \u201C'+mapName()+'\u201D yet.');
      $('exmsg').className='note pst ok';
    });
  }
  $('exload').addEventListener('click',exLoad);
  function exLayerSync(){var l=$('dexist');if(l)l.className=exLayerClass();xeDecorate();}
  $('exon').addEventListener('change',exLayerSync);
  $('exdim').addEventListener('change',exLayerSync);
  $('exscr').addEventListener('change',function(){if(EX.items.length)exRender();});
  /* take the shown items off the canvas again. Changes you staged on them (moves, resizes, deletions) are not applied yet and would be lost, so the first press only asks. */
  (function(){
    var b=$('exclear'), t=null, label=CFG.existing.clearLabel;
    b.textContent=label;
    function reset(){if(t){clearTimeout(t);t=null;}b.textContent=label;}
    b.addEventListener('click',function(){
      var n=Object.keys(XE.stage||{}).length;
      if(n&&!t){b.textContent='Discard '+n+(n===1?' unapplied change':' unapplied changes')+' and clear? Press again';t=setTimeout(reset,CFG.existing.confirmMs);return;}
      reset();exClear();
      $('exmsg').textContent='Cleared. Press Show items already on this map to read the map again.';$('exmsg').className='note pst';
    });
  })();
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
  function xeSaveHist(a){try{localStorage.setItem(CFG.keys.mapEdits,JSON.stringify(a.slice(-20)));}catch(e){}}
  function xeLast(){var h=xeHist(),i;for(i=h.length-1;i>=0;i--){if(String(h[i].map)===String(mapId()))return h[i];}return null;}
  function xeReset0(){
    XE.cur={};XE.stage={};XE.sel=null;XE.rev=null;
    if($('dexsel'))$('dexsel').style.display='none';
    $('exedit').hidden=true;$('exchg').hidden=true;$('exrev').hidden=true;$('xeapply').hidden=true;$('xermrow').hidden=true;$('xerm').checked=false;
    xeButtons();
  }
  function xeButtons(){
    var e=xeLast(), n=e?((e.updated||[]).length+(e.removed||[]).length):0, ok=!!(S.maps&&mapId());
    $('xeundo').disabled=!e||!ok||XE.busy;
    $('xeundo').textContent='Undo last change'+(n?' ('+n+(n===1?' item':' items')+')':'');
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
    var rm=$('xerm').checked, edits=[], dels=[], entry={map:mapId(),name:mapName(),at:new Date().toISOString(),updated:[],removed:[]}, work, k=0;
    if(XE.rev!==xeSig()){xeReview();xeMsg('Something changed since the review. Check the list again, then apply.','err');return;}
    Object.keys(XE.stage).forEach(function(sub){if(XE.stage[sub].del){if(rm)dels.push(sub);}else edits.push(sub);});
    work=edits.map(function(s){return {kind:'edit',sub:s};}).concat(dels.map(function(s){return {kind:'del',sub:s};}));
    if(!work.length)return;
    if(dels.length)xeBackup(dels.map(function(s){var it=xeItem(s);return {subid:s,category:it?it.cat:'',name:it?it.name:'',target:it?it.target:0,classes:it?it.cls:'',settings:XE.cur[s],markup:it?it.html:''};}));
    XE.busy=true;xeButtons();
    function finish(msg,kind){
      if(entry.updated.length||entry.removed.length){var h=xeHist();h.push(entry);xeSaveHist(h);}
      XE.busy=false;XE.stage={};XE.cur={};XE.rev=null;$('exrev').hidden=true;$('xeapply').hidden=true;$('xermrow').hidden=true;$('xerm').checked=false;$('exchg').hidden=true;$('exedit').hidden=true;
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
    XE.busy=true;xeButtons();
    function finish(){
      var h=xeHist(), i, left=failed.length, msg;
      for(i=0;i<h.length;i++){if(h[i].at===e.at&&String(h[i].map)===String(e.map)){if(left){h[i].updated=failed.filter(function(f){return f.kind==='up';}).map(function(f){return f.u;});h[i].removed=failed.filter(function(f){return f.kind==='re';}).map(function(f){return f.r;});}else h.splice(i,1);break;}}
      xeSaveHist(h);XE.busy=false;
      msg=(reverted?'Reverted '+reverted+(reverted===1?' change':' changes'):'')+((reverted&&restored)?', ':'')+(restored?'put back '+restored+(restored===1?' deleted item':' deleted items'):'');
      if(!msg)msg='Nothing was undone';
      if(skipped.length)msg+='. '+skipped.length+(skipped.length===1?' item was':' items were')+' changed in PRTG since, so it was left alone';
      if(left)msg+='. '+left+' could not be undone; try again';
      if(restored)msg+='. Put-back items get new ids and lose any connections they had';
      xeMsg(msg+'.',left?'err':'ok');xeButtons();
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
    xeReview();
    try{$('exrev').scrollIntoView({block:'nearest'});}catch(e){}
  });
  $('exbarapply').addEventListener('click',function(){$('xeapply').click();});
  $('exbardisc').addEventListener('click',function(){XE.stage={};if(XE.sel&&XE.cur[XE.sel])xePopulate();xeStaged();});
  /* ---- the PRTG switch at the top of the Dashboard tab ---- */
  function swSync(){
    var connected=!!(S&&S.maps&&S.objFile), busy=!!$('pushconnect').disabled&&!connected, err=S&&S.lastErr, sw=$('prtgsw');
    sw.checked=connected||busy;sw.disabled=busy;
    $('prtgdot').className='pdot '+(connected?'ok':(busy?'busy':(err?'err':'off')));
    $('prtgtxt').textContent=connected?('Connected \u00B7 '+S.maps.length+(S.maps.length===1?' map':' maps')):(busy?'Connecting\u2026':(err?('Not connected \u00B7 '+String(err).slice(0,48)):'Not connected'));
    $('prtgtxt').title=connected?('Connected to '+(base()||pageOrigin()||'PRTG')):String(err||'');
    if(S.needLogin&&!connected&&!busy){$('prtgpop').hidden=false;}
    if(connected)S.needLogin=false;
    if(connected&&!busy&&S.reauth){S.reauth=false;$('prtgpop').hidden=true;}   /* a connect that followed a refused login has worked: the panel has done its job */
  }
  function disconnect(){
    S.maps=null;S.objFile=null;S.catalog=null;S.reviewed=null;S.cls=null;S.lastErr=null;S.tgt={};
    $('pushmap').innerHTML='';$('pushgo').hidden=true;$('pushlist').hidden=true;
    $('newmapForm').hidden=true;$('newmapname').value='';$('newmapmsg').textContent='';
    PV.cache={};PV.pending={};PV.inflight={};PV.queue=[];PV.applied={};trReset();
    exClear();say('Disconnected.','');updateButtons();renderObjList();pickerSync();pvSync();
  }
  ['pushuser','pushsecret'].forEach(function(id){
    $(id).addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();$('pushconnect').click();}});
    $(id).addEventListener('input',function(){loginMark(false,false);});
  });
  $('pushshow').addEventListener('click',function(){var f=$('pushsecret'), on=(f.type==='password');f.type=on?'text':'password';$('pushshow').setAttribute('aria-label',on?'Hide the passhash':'Show the passhash');});
  new MutationObserver(placePop).observe($('prtgpop'),{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(placePop).observe($('prtgmsg'),{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('resize',placePop);
  $('prtgmsgx').addEventListener('click',function(){$('prtgmsg').hidden=true;$('prtgbar').style.setProperty('--msgH','0px');});
  $('prtgsw').addEventListener('change',function(){if(this.checked)$('pushconnect').click();else disconnect();});
  $('prtgcog').addEventListener('click',function(e){e.stopPropagation();$('prtgpop').hidden=!$('prtgpop').hidden;});
  document.addEventListener('click',function(e){var p=$('prtgpop');if(!p.hidden&&!p.classList.contains('gate')&&!(e.target.closest&&e.target.closest('#prtgbar')))p.hidden=true;});
  swSync();
  window.EXAPI={state:EX,edit:XE,parse:exParse,headers:exHeaders,load:exLoad,clear:exClear,pick:exPick,label:exLabel};
  /* ---- live previews: PRTG's own drawing of each object, with the target's real data.
     The designer asks /controls/mapobjectpreview.htm and shows the answer inside PRTG's own page. Here the answer goes into a small frame that loads PRTG's own stylesheet
     inside the same wrappers PRTG uses for a map (#mapshow > #mapview), because tables take their look from those. The object's own scripts run, as they do in PRTG;
     PRTG's page scripts are not loaded, so charts PRTG draws with its own plugins (the sparklines) stay empty. */
  var PAD=40, PV={cache:{},pending:{},inflight:{},queue:[],running:0,applied:{}};
  function pvKeyOf(o,mode){return [o.file,o.target,mapId(),(mode||o.mode)==='content'?'natural':(o.w+'x'+o.h)].join('|');}
  function pvOn(){return !!($('objlive').checked)&&!!(S.maps&&S.catalog&&mapId());}
  function pvLayer(){var c=$('dcanvas'),l=$('dprev');if(!l){l=document.createElement('div');l.id='dprev';c.insertBefore(l,c.firstChild);}return l;}
  function pvWrap(id){return pvLayer().querySelector('.dprevitem[data-id="'+id+'"]');}
  function pvExtract(html){
    var d, box, el, cls, iw, ih;
    try{d=new DOMParser().parseFromString(html,'text/html');}catch(e){return null;}
    box=d.querySelector('.map_objectbox')||d.body;el=box&&box.querySelector('.map_object');
    if(!el)return null;
    cls=(el.getAttribute('class')||'').split(/\s+/);iw=parseInt(el.getAttribute('initialwidth'),10)||0;ih=parseInt(el.getAttribute('initialheight'),10)||0;
    return {inner:box.innerHTML,content:cls.indexOf('map_icon')>=0,iw:iw,ih:ih};   /* the status icons (class map_icon) take no size from the map: they are as big as they are drawn */
  }
  function pvDoc(ent,o){
    var origin=(base()||pageOrigin()||''), box=(o.mode!=='content'), w=box?o.w:1400, h=box?o.h:900,
      size=box?('width:'+o.w+'px!important;height:'+o.h+'px!important;'):'';
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><base href="'+origin+'/"><link rel="stylesheet" href="/css/prtg0.css">'
      +'<style>html,body,#mapshow,#mapshow .view,#mapview{margin:0;padding:0;background:transparent!important;box-shadow:none!important;border:0!important}html,body{overflow:hidden}'
      +'#pvhost .map_object{position:absolute!important;left:'+PAD+'px!important;top:'+PAD+'px!important;margin:0!important;'+size+'}</style></head>'
      +'<body id="mainbody" data-theme="0" class="language_en"><div id="mapshow"><div class="view" style="position:static;overflow:visible"><div id="mapview" style="position:relative;width:'+(w+2*PAD)+'px;height:'+(h+2*PAD)+'px;overflow:visible"><div id="pvhost">'+ent.inner+'</div></div></div></div></body></html>';
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
      if(!on){if(DASHAPI.pv[o.id]){delete DASHAPI.pv[o.id];changed=true;}continue;}
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
  var objShown=[], tgtShown=[], OBJSEL='', OBJG={open:{}}, PICK={mode:'item',sel:null}, PP={tok:0,timer:null};
  var DEF={gUser:null,sUser:null,sAuto:null,looking:false}, BUILTIN_G={id:1,name:'Local Probe'};   /* PRTG's Local Probe is always object 1 */
  var SENSOR_FILES=["An Icon A9.htm", "An Icon B1.htm", "An Icon B1_xl.htm", "An Icon C1.htm", "An icon AA.htm", "Gauges Sensor Primary small.htm", "Gauges Sensor Primary.htm", "Gauges Sensor small.htm", "Gauges Sensor.htm", "customStatusDot-SensorLED.htm", "graph large 0.htm", "graph small 0.htm", "graph tiny 0.htm", "graph toplist.htm", "graph without text 0.htm", "messageonly_on_transparent.htm", "messageonly_on_white.htm", "messageonly_related_background.htm", "tablechannels.htm", "tabletoplist.htm", "trafficlight.htm"];   /* the stock object files that only take a sensor, read from PRTG's own mapobjects folder */
  try{OBJG.open=JSON.parse(localStorage.getItem(CFG.keys.objGroups)||'{}')||{};}catch(e){OBJG.open={};}
  function objGroupsSave(){try{localStorage.setItem(CFG.keys.objGroups,JSON.stringify(OBJG.open));}catch(e){}}
  function selEntry(){var i;if(!S.catalog||!OBJSEL)return null;for(i=0;i<S.catalog.length;i++)if(S.catalog[i].value===OBJSEL)return S.catalog[i];return null;}
  /* what an object reads from: a sensor, or a group, device or probe. Your own files say so in their code; PRTG's stock files are known; anything else is tried as a group first. */
  function kindStore(){try{return JSON.parse(localStorage.getItem(CFG.keys.kindOf)||'{}')||{};}catch(e){return {};}}
  function libCodeFor(e){var lib=libLoad(), k=keyOf(e.cat,e.name), f;for(f in lib)if(keyOf(lib[f].cat,lib[f].name)===k)return lib[f].code;return null;}
  function kindOf(e){
    var ov=kindStore()[e.value], code, m, ts;
    if(ov==='g'||ov==='s')return ov;
    code=libCodeFor(e);
    if(code){m=/<#checkobjecttype[^>]*objecttype="([^"]*)"/.exec(code);if(m){ts=m[1].split(',');return (ts.length===1&&ts[0]==='sensor')?'s':'g';}}
    if(SENSOR_FILES.indexOf(e.value)>=0)return 's';
    if(/^graphs$/i.test(e.cat))return 's';
    return 'g';
  }
  function defFor(kind){return kind==='s'?(DEF.sUser||DEF.sAuto||null):(DEF.gUser||BUILTIN_G);}
  function defKey(){return CFG.keys.previewWith+'|'+(base()||pageOrigin()||'');}
  function defSave(){try{localStorage.setItem(defKey(),JSON.stringify({g:DEF.gUser,s:DEF.sUser}));}catch(e){}}
  function defShow(){
    var on=!!S.catalog, g=defFor('g'), s=defFor('s');
    $('defgname').textContent=on?(g.name+(DEF.gUser?'':' (built in)')):'\u2013';
    $('defsname').textContent=on?(s?(s.name+(DEF.sUser?'':' (found automatically)')):(DEF.looking?'looking\u2026':'none found')):'\u2013';
    ['defgchange','defschange','defreset'].forEach(function(id){$(id).disabled=!on;});
  }
  /* the sensor to preview with: PRTG's own Probe Health or Core Health sensor if there is one, else the first sensor there is */
  function resolveDefaults(){
    var sv={}, tries=['Probe Health','Core Health',''], i=0;
    try{sv=JSON.parse(localStorage.getItem(defKey())||'{}')||{};}catch(e){}
    DEF.gUser=sv.g||null;DEF.sUser=sv.s||null;DEF.sAuto=null;
    if(DEF.sUser||!S.catalog){DEF.looking=false;defShow();pvPaneShow();return;}
    DEF.looking=true;defShow();
    function next(){
      var nm, p;
      if(i>=tries.length){DEF.looking=false;defShow();pvPaneShow();return;}
      nm=tries[i++];p={content:'sensors',columns:tgtColumns('sensors'),count:1};if(nm)p.filter_name='@sub('+nm+')';
      http('GET','/api/table.json',p).then(function(t){
        var j=parseJson(t,'The sensor list'), a=(j&&j.sensors)||[];
        if(a.length){DEF.sAuto={id:a[0].objid,name:tgtLabel('sensors',a[0])};DEF.looking=false;defShow();pvPaneShow();}
        else next();
      },function(){next();});
    }
    next();
  }
  function objVisible(){return objShown.filter(function(x){return !x.el.hidden;});}
  function objSelect(value,scroll){
    var els=$('objlist').querySelectorAll('.objitem'), i, el=null, on;
    OBJSEL=value||'';
    for(i=0;i<els.length;i++){on=els[i].getAttribute('data-value')===OBJSEL;els[i].classList.toggle('on',on);els[i].setAttribute('aria-selected',on?'true':'false');if(on)el=els[i];}
    $('objadd').disabled=!(el&&!el.hidden);
    if(el&&scroll)el.scrollIntoView({block:'nearest'});
    pvPaneSchedule();
  }
  function renderObjList(){
    var box=$('objlist'), q=String($('objsearch').value||'').trim().toLowerCase(), lib=libLoad(), mine={}, n=$('objmine'), top=box.scrollTop, cats=[], by={}, on=!!S.catalog, e;
    Object.keys(lib).forEach(function(f){mine[keyOf(lib[f].cat,lib[f].name)]=f;});
    box.innerHTML='';objShown=[];
    $('objsearch').disabled=!on;box.classList.toggle('off',!on);box.setAttribute('aria-disabled',on?'false':'true');$('objadd').disabled=true;
    defShow();
    if(!on){n.hidden=true;pvPaneShow();return;}
    S.catalog.forEach(function(c){
      if(q&&(c.cat+': '+c.name).toLowerCase().indexOf(q)<0)return;
      if(!by[c.cat]){by[c.cat]=[];cats.push(c.cat);}
      by[c.cat].push(c);
    });
    if(OBJSEL&&!cats.some(function(cat){return by[cat].some(function(c){return c.value===OBJSEL;});}))OBJSEL='';
    cats.forEach(function(cat){
      var open=!!q||!!OBJG.open[cat], g=document.createElement('div');
      g.className='objgrp';g.setAttribute('role','button');g.setAttribute('aria-expanded',open?'true':'false');g.setAttribute('data-cat',cat);
      g.innerHTML='<span class="arr">'+(open?'\u25BE':'\u25B8')+'</span><span class="gn"></span><span class="cnt">'+by[cat].length+'</span>';g.querySelector('.gn').textContent=cat;
      g.addEventListener('click',function(){if(q)return;OBJG.open[cat]=!OBJG.open[cat];objGroupsSave();renderObjList();});
      box.appendChild(g);
      by[cat].forEach(function(c){
        var isMine=!!mine[keyOf(c.cat,c.name)], el=document.createElement('div');
        el.className='objitem'+(isMine?' mine':'')+(c.value===OBJSEL?' on':'');el.setAttribute('role','option');el.setAttribute('draggable','true');
        el.setAttribute('data-value',c.value);el.setAttribute('data-label',c.cat+': '+c.name);el.setAttribute('data-cat',cat);el.hidden=!open;
        el.innerHTML='<span class="nm"></span>'+(isMine?' <span class="yours">(yours)</span>':'');el.querySelector('.nm').textContent=c.name;el.title=c.cat+': '+c.name;
        el.addEventListener('click',function(){objSelect(c.value,false);});
        el.addEventListener('dblclick',objAdd);
        el.addEventListener('dragstart',function(ev){objDragStart(ev,c);});
        box.appendChild(el);objShown.push({c:c,el:el});
      });
    });
    if(!cats.length){e=document.createElement('div');e.className='objnone';e.textContent=S.catalog.length?'No object matches':'PRTG lists no object files';box.appendChild(e);}
    var missing=Object.keys(lib).filter(function(f){return !S.catalog.some(function(c){return keyOf(c.cat,c.name)===keyOf(lib[f].cat,lib[f].name);});});
    if(missing.length){
      n.hidden=false;n.className='note pst err';
      n.textContent='Not in PRTG yet: '+missing.map(function(f){return f+' ('+lib[f].cat+': '+lib[f].name+')';}).join(', ')+'. Copy '+(missing.length===1?'the file':'the files')+' into PRTG\u2019s mapobjects folder (Download all in the Objects tab gives you a zip), then press Connect again.';
    }else if(Object.keys(lib).length){n.hidden=false;n.className='note pst ok';n.textContent='Every object you designed here is in PRTG\u2019s list.';}
    else n.hidden=true;
    box.scrollTop=top;
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
      if(k==='g'&&r.type==='sensor')warn=' Heads up: '+ent.name+' takes a group or device, so a sensor may show nothing.';
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
    var vis=objVisible(), i=-1, k=e.key, j, c=selEntry();
    vis.forEach(function(x,n){if(x.c.value===OBJSEL)i=n;});
    if(k==='ArrowDown'||k==='ArrowUp'||k==='Home'||k==='End'){
      if(!vis.length)return;e.preventDefault();
      j=(k==='Home')?0:(k==='End')?(vis.length-1):(k==='ArrowDown'?Math.min(vis.length-1,i+1):Math.max(0,i<0?0:i-1));
      objSelect(vis[j].c.value,true);
    }else if(k==='Enter'){e.preventDefault();objAdd();}
    else if((k==='ArrowRight'||k==='ArrowLeft')&&!String($('objsearch').value||'').trim()){   /* open or close the group, from the keyboard */
      var cat=c?c.cat:null;
      if(k==='ArrowRight'&&!cat){var g=$('objlist').querySelector('.objgrp[aria-expanded="false"]');if(g)cat=g.getAttribute('data-cat');}
      if(cat){e.preventDefault();OBJG.open[cat]=(k==='ArrowRight');objGroupsSave();renderObjList();}
    }
  });
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
}catch(err){if(window.console)console.error('push module',err);}
})();
/* @endregion: push */

/* @region: library */
/* Each object file downloaded from the Objects tab is remembered (in this browser, for this address), so a batch can be taken to PRTG's mapobjects folder in one zip,
   and so the Dashboard can tell which of PRTG's objects you made. */
(function libraryModule(){
  var _lq=[219,82,213,234,121,85,64,214];
try{
  var $=function(id){return document.getElementById(id);};
  var KEY=CFG.keys.library;
  function load(){try{var o=JSON.parse(localStorage.getItem(KEY)||'{}');return (o&&typeof o==='object')?o:{};}catch(e){return {};}}
  function save(o){
    var ks=Object.keys(o).sort(function(a,b){return (o[b].at||0)-(o[a].at||0);}), n={};
    ks.slice(0,CFG.library.max).forEach(function(k){n[k]=o[k];});
    try{localStorage.setItem(KEY,JSON.stringify(n));}catch(e){}
  }
  /* the first line of every object file is <!--Category: Name-->, which is how PRTG lists it */
  function parseHead(code){var m=/^\s*<!--\s*([^:]+?)\s*:\s*(.+?)\s*-->/.exec(code);return m?{cat:m[1],name:m[2]}:null;}
  function refresh(){var lib=load(), n=Object.keys(lib).length, b=$('odlall');b.hidden=!n;b.textContent='Download all ('+n+')';listRender(lib,n);}
  /* the files behind Download all: see them, drop one, or clear the lot. This only changes what the tool remembers; PRTG's mapobjects folder is not touched. */
  var listOpen=false, armed=null;
  function dropped(){refresh();if(window.PUSHAPI&&PUSHAPI.renderObjList)PUSHAPI.renderObjList();}
  function listRender(lib,n){
    var box=$('olist'), names=Object.keys(lib).sort(), foot, clr, note;
    $('olistwrap').hidden=!n;
    $('olisttoggle').textContent=(listOpen?'Hide':'Show')+' the files in your list ('+n+')';
    box.hidden=!(listOpen&&n);
    box.textContent='';
    names.forEach(function(f){
      var row=document.createElement('div'), a=document.createElement('span'), c=document.createElement('span'), x=document.createElement('button');
      row.className='orow';a.className='ofn';c.className='ofc';x.className='linkbtn';x.type='button';
      a.textContent=f;c.textContent=(lib[f].cat||'')+(lib[f].name?': '+lib[f].name:'');x.textContent='Remove';
      x.addEventListener('click',function(){var o=load();delete o[f];save(o);dropped();});
      row.appendChild(a);row.appendChild(c);row.appendChild(x);box.appendChild(row);
    });
    foot=document.createElement('div');foot.className='ofoot';
    clr=document.createElement('button');clr.className='linkbtn';clr.type='button';clr.textContent='Clear the list';
    clr.addEventListener('click',function(){
      if(!armed){clr.textContent='Click again to clear the list';armed=setTimeout(function(){armed=null;clr.textContent='Clear the list';},3500);return;}
      clearTimeout(armed);armed=null;save({});dropped();
    });
    note=document.createElement('p');
    note.textContent='Removing a file only makes this tool forget it. Files already in PRTG\u2019s mapobjects folder stay where they are. The Dashboard also uses this list to tell which PRTG objects you made.';
    foot.appendChild(clr);foot.appendChild(note);box.appendChild(foot);
  }
  $('olisttoggle').addEventListener('click',function(){listOpen=!listOpen;refresh();});
  /* a zip with the files stored as they are (no compression), written here so nothing is needed from outside */
  var CRCT=null;
  function crc32(b){
    var i,j,c,crc=-1;
    if(!CRCT){CRCT=[];for(i=0;i<256;i++){c=i;for(j=0;j<8;j++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);CRCT[i]=c>>>0;}}
    for(i=0;i<b.length;i++)crc=CRCT[(crc^b[i])&255]^(crc>>>8);
    return (crc^-1)>>>0;
  }
  function zipStore(files){
    var enc=new TextEncoder(), parts=[], central=[], offset=0, d=new Date();
    var dosD=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate(), dosT=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);
    files.forEach(function(f){
      var nm=enc.encode(f.name), data=enc.encode(f.text), crc=crc32(data), size=data.length;
      var lh=new DataView(new ArrayBuffer(30));
      lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);lh.setUint16(10,dosT,true);lh.setUint16(12,dosD,true);
      lh.setUint32(14,crc,true);lh.setUint32(18,size,true);lh.setUint32(22,size,true);lh.setUint16(26,nm.length,true);lh.setUint16(28,0,true);
      parts.push(new Uint8Array(lh.buffer),nm,data);
      var ch=new DataView(new ArrayBuffer(46));
      ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);ch.setUint16(12,dosT,true);ch.setUint16(14,dosD,true);
      ch.setUint32(16,crc,true);ch.setUint32(20,size,true);ch.setUint32(24,size,true);ch.setUint16(28,nm.length,true);ch.setUint16(30,0,true);ch.setUint16(32,0,true);ch.setUint16(34,0,true);ch.setUint16(36,0,true);ch.setUint32(38,0,true);ch.setUint32(42,offset,true);
      central.push(new Uint8Array(ch.buffer),nm);
      offset+=30+nm.length+size;
    });
    var cd=0;central.forEach(function(x){cd+=x.length;});
    var e=new DataView(new ArrayBuffer(22));
    e.setUint32(0,0x06054b50,true);e.setUint16(4,0,true);e.setUint16(6,0,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cd,true);e.setUint32(16,offset,true);e.setUint16(20,0,true);
    return new Blob(parts.concat(central,[new Uint8Array(e.buffer)]),{type:'application/zip'});
  }
  /* the file on screen joins the list, the way pressing Download has always done */
  function remember(){
    var f=String($('ofname').textContent||'').trim(), code=$('ocode').value, info=parseHead(code);
    if(!f||!code||!info)return false;
    var o=load();o[f]={cat:info.cat,name:info.name,code:code,at:Date.now()};save(o);refresh();
    if(window.PUSHAPI&&PUSHAPI.renderObjList)PUSHAPI.renderObjList();
    return true;
  }
  $('odl').addEventListener('click',function(){remember();},true);
  /* a PowerShell script that writes the files itself. Each file travels as base64 of its UTF-8 bytes, the same bytes Download saves, so no character can break the paste. */
  function b64(text){
    var bytes=new TextEncoder().encode(text), s='', i;
    for(i=0;i<bytes.length;i+=32768)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+32768));
    return btoa(s);
  }
  function psq(x){return "'"+String(x).replace(/'/g,"''")+"'";}
  function installScript(files){
    var o=[], i, j, b;
    o.push('function Install-PrtgMapObjects {');
    o.push('  $dir = '+psq(CFG.install.dir));
    o.push("  if (-not (Test-Path -LiteralPath $dir)) { Write-Host 'Folder not found:' $dir; Write-Host 'Change the $dir line near the top of this script and paste it again.'; return }");
    o.push("  $admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)");
    o.push("  if (-not $admin) { Write-Host 'This PowerShell window is not running as administrator. Close it, open PowerShell as administrator and paste the script again.'; return }");
    o.push("  $backup = Join-Path $env:TEMP ('PrtgMapToolBackup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))");
    o.push('  $data = @{}');
    for(i=0;i<files.length;i++){
      b=b64(files[i].text);
      o.push('  $data['+psq(files[i].name)+'] = (@(');
      for(j=0;j<b.length;j+=2000)o.push("    '"+b.substr(j,2000)+"'"+((j+2000<b.length)?',':''));
      o.push("  ) -join '')");
    }
    o.push('  $made = 0');
    o.push('  foreach ($key in $data.Keys) {');
    o.push('    $name = [IO.Path]::GetFileName($key)');
    o.push('    $path = Join-Path $dir $name');
    o.push('    $word = \'Created \'');
    o.push('    try {');
    o.push('      if (Test-Path -LiteralPath $path) {');
    o.push('        if ([Convert]::ToBase64String([IO.File]::ReadAllBytes($path)) -eq $data[$key]) { Write-Host (\'Unchanged \' + $name); continue }');
    o.push('        New-Item -ItemType Directory -Force -Path $backup | Out-Null');
    o.push('        Copy-Item -LiteralPath $path -Destination (Join-Path $backup $name) -Force');
    o.push('        $word = \'Replaced  \'');
    o.push('      }');
    o.push('      [IO.File]::WriteAllBytes($path, [Convert]::FromBase64String($data[$key]))');
    o.push('      Write-Host ($word + $name); $made++');
    o.push('    } catch { Write-Host (\'FAILED    \' + $name + \': \' + $_.Exception.Message) }');
    o.push('  }');
    o.push("  Write-Host ('Done. ' + $made + ' file(s) written to ' + $dir)");
    o.push("  if (Test-Path -LiteralPath $backup) { Write-Host ('Replaced files were backed up to ' + $backup) }");
    o.push("  Write-Host 'Reload the Map Designer to see them.'");
    o.push('}');
    o.push('Install-PrtgMapObjects');
    return o.join('\n')+'\n';
  }
  $('oscript').addEventListener('click',function(){
    var lib, names, files, text;
    remember();
    lib=load();names=Object.keys(lib).sort();
    if(!names.length){OBJAPI.toast('Nothing to install yet. Make an object first.');return;}
    files=names.map(function(f){return {name:f,text:lib[f].code};});
    text=installScript(files);
    if(text.length>CFG.install.maxChars){OBJAPI.toast('Too long to paste ('+files.length+' file'+(files.length===1?'':'s')+'). Use Download all.');return;}
    OBJAPI.copyText(text,'Install script copied ('+files.length+' file'+(files.length===1?'':'s')+')');
  });
  $('odlall').addEventListener('click',function(){
    var lib=load(), files=Object.keys(lib).sort().map(function(f){return {name:f,text:lib[f].code};});
    if(!files.length)return;
    var url=URL.createObjectURL(zipStore(files)), a=document.createElement('a');
    a.href=url;a.download='prtg-map-objects.zip';document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url);},2000);
  });
  /* the Download button is hidden for the pasted types (Frame, Background); Download all follows it */
  function followDownload(){var d=($('odl').style.display==='none')?'none':'';$('odlall').style.display=d;$('oscript').style.display=d;$('olistwrap').style.display=d;}
  try{new MutationObserver(followDownload).observe($('odl'),{attributes:true,attributeFilter:['style']});}catch(e){}
  followDownload();
  refresh();
  window.LIBAPI={load:load,save:save,parseHead:parseHead,zip:zipStore,refresh:refresh,installScript:installScript};
}catch(err){if(window.console)console.error('library module',err);}
})();
/* @endregion: library */


/* @region: objects */
(function objectsModule(){
  var _oq=[133,200,171,62,157,66,43,91];
try{
  var PRESETS=[{"id":"table1","cat":"Data Tables","name":"Sensors (sorted by priority)","title":"Sensors","titleObj":true,"cols":["probegroupdevice","sensor","status","message","lastvalue","minigraph","priority"],"sortBy":"priority","sortDir":"asc","count":0,"status":[],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"maptablecontainer","checks":"probenode,group,device"},{"id":"table2","cat":"Data Tables","name":"Sensors (sorted alphabetically)","title":"Sensors","titleObj":true,"cols":["sensor","probegroupdevice","status","message","lastvalue","minigraph","priority"],"sortBy":"sensor","sortDir":"asc","count":0,"status":[],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"table3","cat":"Data Tables","name":"Sensors (in tree order)","title":"Sensors","titleObj":true,"cols":["probegroupdevice","sensor","status","message","lastvalue","minigraph","priority"],"sortBy":"probegroupdevice","sortDir":"asc","count":0,"status":[],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"tableA0","cat":"Data Tables","name":"Alarms","title":"Alarms","titleObj":true,"cols":["downtimesince","sensor","status","lastvalue","minigraph","priority","favorite","probegroupdevice","message"],"sortBy":"downtimesince","sortDir":"asc","count":0,"status":["warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"maptablecontainer","checks":"probenode,group,device"},{"id":"tableA1","cat":"Data Tables","name":"Down sensors","title":"DOWN Sensors","titleObj":true,"cols":["sensor","status","lastvalue","minigraph","priority","favorite","probegroupdevice","message"],"sortBy":"probegroupdevice","sortDir":"asc","count":0,"status":["down","downack","downpartial"],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"maptablecontainer","checks":"probenode,group,device"},{"id":"tableA2","cat":"Data Tables","name":"Up sensors","title":"UP Sensors","titleObj":true,"cols":["sensor","status","lastvalue","minigraph","priority","favorite","probegroupdevice","message"],"sortBy":"probegroupdevice","sortDir":"asc","count":0,"status":["up"],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"maptablecontainer","checks":"probenode,group,device"},{"id":"tableA3","cat":"Data Tables","name":"Warning sensors","title":"WARNING Sensors","titleObj":true,"cols":["sensor","status","lastvalue","minigraph","priority","favorite","probegroupdevice","message"],"sortBy":"probegroupdevice","sortDir":"asc","count":0,"status":["warning"],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"maptablecontainer","checks":"probenode,group,device"},{"id":"tableA4","cat":"Data Tables","name":"Unusual sensors","title":"UNUSUAL Sensors","titleObj":true,"cols":["sensor","status","lastvalue","minigraph","priority","favorite","probegroupdevice","message"],"sortBy":"probegroupdevice","sortDir":"asc","count":0,"status":["unusual"],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"maptablecontainer","checks":"probenode,group,device"},{"id":"tableA5","cat":"Data Tables","name":"Paused sensors","title":"PAUSED Sensors","titleObj":true,"cols":["sensor","status","lastvalue","minigraph","priority","favorite","probegroupdevice","message"],"sortBy":"probegroupdevice","sortDir":"asc","count":0,"status":["paused"],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"maptablecontainer","checks":"probenode,group,device"},{"id":"tableA6","cat":"Data Tables","name":"Unknown sensors","title":"UNKNOWN Sensors","titleObj":true,"cols":["sensor","status","lastvalue","minigraph","priority","favorite","probegroupdevice","message"],"sortBy":"probegroupdevice","sortDir":"asc","count":0,"status":["unknown"],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"maptablecontainer","checks":"probenode,group,device"},{"id":"tableA7","cat":"Data Tables","name":"Favorite sensors","title":"Favorite Sensors","titleObj":true,"cols":["sensor","status","lastvalue","minigraph","priority","favorite","probegroupdevice","message"],"sortBy":"probegroupdevice","sortDir":"asc","count":0,"status":[],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":true,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"maptablecontainer","checks":"probenode,group,device"},{"id":"Top10 Bandwidth Highest","cat":"Top 10 Lists","name":"Highest Bandwidth Usage","title":"Top 10: Highest Bandwidth Usage","titleObj":true,"cols":["lastvalue","sensor","probegroupdevice"],"sortBy":"lastvalue","sortDir":"desc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"bandwidthsensor","nameContains":"","onlyValue":true,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 Bandwidth Lowest","cat":"Top 10 Lists","name":"Lowest Bandwidth Usage","title":"Top 10: Lowest Bandwidth Usage","titleObj":true,"cols":["lastvalue","sensor","probegroupdevice"],"sortBy":"lastvalue","sortDir":"asc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"bandwidthsensor","nameContains":"","onlyValue":true,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 CPUs Least Used","cat":"Top 10 Lists","name":"Least Used CPU","title":"Top 10: Least Used CPU","titleObj":true,"cols":["lastvalue","sensor","probegroupdevice"],"sortBy":"lastvalue","sortDir":"asc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"cpuloadsensor","nameContains":"","onlyValue":true,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 CPUs Most Used","cat":"Top 10 Lists","name":"Most Used CPU","title":"Top 10: Most Used CPU","titleObj":true,"cols":["lastvalue","sensor","probegroupdevice"],"sortBy":"lastvalue","sortDir":"desc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"cpuloadsensor","nameContains":"","onlyValue":true,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 Disks Least Free","cat":"Top 10 Lists","name":"Least Available Disk Space","title":"Top 10: Least Available Disk Space","titleObj":true,"cols":["lastvalue","sensor","probegroupdevice"],"sortBy":"lastvalue","sortDir":"asc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"diskspacesensor","nameContains":"","onlyValue":true,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 Disks Most Free","cat":"Top 10 Lists","name":"Most Available Disk Space","title":"Top 10: Most Available Disk Space","titleObj":true,"cols":["lastvalue","sensor","probegroupdevice"],"sortBy":"lastvalue","sortDir":"desc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"diskspacesensor","nameContains":"","onlyValue":true,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 Memory Least Free","cat":"Top 10 Lists","name":"Least Available Memory","title":"Top 10: Least Available Memory","titleObj":true,"cols":["lastvalue","sensor","probegroupdevice"],"sortBy":"lastvalue","sortDir":"asc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"memorysensor memory","nameContains":"","onlyValue":true,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 Memory Most Free","cat":"Top 10 Lists","name":"Most Available Memory","title":"Top 10: Most Available Memory","titleObj":true,"cols":["lastvalue","sensor","probegroupdevice"],"sortBy":"lastvalue","sortDir":"desc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"memorysensor memory","nameContains":"","onlyValue":true,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 Ping Fastest","cat":"Top 10 Lists","name":"Fastest Ping","title":"Top 10: Fastest Ping","titleObj":true,"cols":["lastvalue","sensor","probegroupdevice"],"sortBy":"lastvalue","sortDir":"asc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"pingsensor","nameContains":"","onlyValue":true,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 Ping Slowest","cat":"Top 10 Lists","name":"Slowest Ping","title":"Top 10: Slowest Ping","titleObj":true,"cols":["lastvalue","sensor","probegroupdevice"],"sortBy":"lastvalue","sortDir":"desc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"pingsensor","nameContains":"","onlyValue":true,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 System Uptime Longest ","cat":"Top 10 Lists","name":"Longest System Uptime","title":"Longest System Uptime","titleObj":false,"cols":["lastvalue","sensor","device"],"sortBy":"lastvalue","sortDir":"desc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":false,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":["filter_type=\"wmiuptime\"","filter_type=\"snmpuptime\"","filter_type=\"paessler.snmp.uptime_sensor\"","tabletitlelink=\"sensors.htm?sortby=-lastvalue&filter_tags=@tag(snmpuptimesensor)\""],"links":true,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 System Uptime Shortest","cat":"Top 10 Lists","name":"Shortest System Uptime","title":"Shortest System Uptime","titleObj":false,"cols":["lastvalue","sensor","device"],"sortBy":"lastvalue","sortDir":"asc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":false,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":["filter_type=\"wmiuptime\"","filter_type=\"snmpuptime\"","filter_type=\"paessler.snmp.uptime_sensor\"","tabletitlelink=\"sensors.htm?sortby=lastvalue&filter_tags=@tag(snmpuptimesensor)\""],"links":true,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 Uptime Best","cat":"Top 10 Lists","name":"Best Availability (Highest Uptime)","title":"Top 10: Best Availability (Highest Uptime)","titleObj":true,"cols":["uptime","sensor","probegroupdevice"],"sortBy":"uptime","sortDir":"asc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 Uptime Worst","cat":"Top 10 Lists","name":"Worst Availability (Lowest Uptime)","title":"Top 10: Worst Availability (Lowest Uptime)","titleObj":true,"cols":["uptime","sensor","probegroupdevice"],"sortBy":"uptime","sortDir":"desc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"","nameContains":"","onlyValue":false,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 Websites Fastest","cat":"Top 10 Lists","name":"Fastest Website","title":"Top 10: Fastest Website","titleObj":true,"cols":["lastvalue","sensor","probegroupdevice"],"sortBy":"lastvalue","sortDir":"asc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"httpsensor","nameContains":"","onlyValue":true,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"},{"id":"Top10 Websites Slowest","cat":"Top 10 Lists","name":"Slowest Website","title":"Top 10: Slowest Website","titleObj":true,"cols":["lastvalue","sensor","probegroupdevice"],"sortBy":"lastvalue","sortDir":"desc","count":10,"status":["up","warning","down","downack","downpartial","unusual"],"mapTags":true,"reqTag":"httpsensor","nameContains":"","onlyValue":true,"onlyFav":false,"extra":[],"links":false,"sortable":false,"refreshable":true,"infoheader":false,"box":"top10listcontainer","checks":"probenode,group,device"}];
  var GPRESETS=[{"id":"Gauges Sensor Primary small","cat":"Status Icons","name":"Primary channel (gauge, small)","kind":"sensor-primary","small":true,"prio":null,"plgPrio":false,"tblPrioRaw":null,"mapviewRaw":"small primaryonly","mapTags":false,"sortby":"name","count":null,"deviceClass":false},{"id":"Gauges Sensor Primary","cat":"Status Icons","name":"Primary channel (gauge)","kind":"sensor-primary","small":false,"prio":null,"plgPrio":false,"tblPrioRaw":null,"mapviewRaw":"primaryonly","mapTags":false,"sortby":"name","count":null,"deviceClass":false},{"id":"Gauges Sensor small","cat":"Status Icons","name":"Channel (gauges, small)","kind":"sensor-all","small":true,"prio":null,"plgPrio":false,"tblPrioRaw":null,"mapviewRaw":"small","mapTags":false,"sortby":"name","count":null,"deviceClass":false},{"id":"Gauges Sensor","cat":"Status Icons","name":"Channel (gauges)","kind":"sensor-all","small":false,"prio":null,"plgPrio":false,"tblPrioRaw":null,"mapviewRaw":"true","mapTags":false,"sortby":"name","count":null,"deviceClass":false},{"id":"Gauges device priority small","cat":"Device Tree Views","name":"Gauges (small, 5 stars priority only)","kind":"device","small":true,"prio":4,"plgPrio":true,"tblPrioRaw":"@above(4)","mapviewRaw":"small","mapTags":true,"sortby":"-position","count":"*","deviceClass":true},{"id":"Gauges device priority","cat":"Device Tree Views","name":"Gauges (large, 5 stars priority only)","kind":"device","small":false,"prio":4,"plgPrio":true,"tblPrioRaw":"@above(4)","mapviewRaw":"","mapTags":true,"sortby":"-position","count":"*","deviceClass":true},{"id":"Gauges device small","cat":"Device Tree Views","name":"Gauges (small, 4 or 5 stars priority)","kind":"device","small":true,"prio":3,"plgPrio":false,"tblPrioRaw":"4","mapviewRaw":"small","mapTags":true,"sortby":"-position","count":"*","deviceClass":true},{"id":"Gauges device","cat":"Device Tree Views","name":"Gauges (large, 4 or 5 stars priority)","kind":"device","small":false,"prio":3,"plgPrio":false,"tblPrioRaw":"@above(3)","mapviewRaw":"","mapTags":true,"sortby":"-position","count":"*","deviceClass":true}];
  var GRPRESETS=[{"id":"graph large 0","cat":"Graphs","name":"Live graph (large fonts)","kind":"sensor","period":0,"fontSize":12,"legend":true,"axis":true,"tooltips":true,"check":true},{"id":"graph large 1","cat":"Graphs","name":"#graphtype1 (large fonts)","kind":"sensor","period":1,"fontSize":12,"legend":true,"axis":true,"tooltips":true,"check":false},{"id":"graph large 2","cat":"Graphs","name":"#graphtype2 (large fonts)","kind":"sensor","period":2,"fontSize":12,"legend":true,"axis":true,"tooltips":true,"check":false},{"id":"graph large 3","cat":"Graphs","name":"#graphtype3 (large fonts)","kind":"sensor","period":3,"fontSize":12,"legend":true,"axis":true,"tooltips":true,"check":false},{"id":"graph small 0","cat":"Graphs","name":"Live graph (small fonts)","kind":"sensor","period":0,"fontSize":9,"legend":true,"axis":true,"tooltips":true,"check":true},{"id":"graph small 1","cat":"Graphs","name":"#graphtype1 (small fonts)","kind":"sensor","period":1,"fontSize":9,"legend":true,"axis":true,"tooltips":true,"check":false},{"id":"graph small 2","cat":"Graphs","name":"#graphtype2 (small fonts)","kind":"sensor","period":2,"fontSize":9,"legend":true,"axis":true,"tooltips":true,"check":false},{"id":"graph small 3","cat":"Graphs","name":"#graphtype3 (small fonts)","kind":"sensor","period":3,"fontSize":9,"legend":true,"axis":true,"tooltips":true,"check":false},{"id":"graph tiny 0","cat":"Graphs","name":"Live graph (tiny fonts)","kind":"sensor","period":0,"fontSize":7,"legend":false,"axis":false,"tooltips":true,"check":true},{"id":"graph tiny 1","cat":"Graphs","name":"#graphtype1 (tiny fonts)","kind":"sensor","period":1,"fontSize":7,"legend":false,"axis":false,"tooltips":true,"check":false},{"id":"graph tiny 2","cat":"Graphs","name":"#graphtype2 (tiny fonts)","kind":"sensor","period":2,"fontSize":7,"legend":false,"axis":false,"tooltips":true,"check":false},{"id":"graph tiny 3","cat":"Graphs","name":"#graphtype3 (tiny fonts)","kind":"sensor","period":3,"fontSize":7,"legend":false,"axis":false,"tooltips":true,"check":false},{"id":"graph toplist","cat":"Graphs","name":"Primary toplist of a sensor","kind":"toplist","period":0,"check":true},{"id":"graph without text 0","cat":"Graphs","name":"Live graph (sensor only, no labels)","kind":"sensor","period":0,"fontSize":0,"legend":false,"axis":true,"tooltips":true,"check":true},{"id":"graph without text 1","cat":"Graphs","name":"#graphtype1 (no labels)","kind":"sensor","period":1,"fontSize":0,"legend":false,"axis":true,"tooltips":true,"check":false},{"id":"graph without text 2","cat":"Graphs","name":"#graphtype2 (no labels)","kind":"sensor","period":2,"fontSize":0,"legend":false,"axis":true,"tooltips":true,"check":false},{"id":"graph without text 3","cat":"Graphs","name":"#graphtype3 (no labels)","kind":"sensor","period":3,"fontSize":0,"legend":false,"axis":true,"tooltips":true,"check":false},{"id":"graph_sensors","cat":"Graphs","name":"Live graphs (with labels)","kind":"sensors","period":0,"tileW":336,"tileH":175,"mapTags":true,"check":true},{"id":"graph_sensors1","cat":"Graphs","name":"#graphtype1 (with labels)","kind":"sensors","period":1,"tileW":336,"tileH":175,"mapTags":true,"check":true},{"id":"graph_sensors2","cat":"Graphs","name":"#graphtype2 (with labels)","kind":"sensors","period":2,"tileW":336,"tileH":175,"mapTags":true,"check":true},{"id":"graph_sensors3","cat":"Graphs","name":"#graphtype3 (with labels)","kind":"sensors","period":3,"tileW":336,"tileH":175,"mapTags":true,"check":true}];
  var DPRESETS=[{"id":"donut_alarms_font-dark","cat":"Status Donuts","name":"Alarms (dark text)","alarms":true,"light":false,"withName":false,"noInitH":false},{"id":"donut_alarms_font-light","cat":"Status Donuts","name":"Alarms (light text)","alarms":true,"light":true,"withName":false,"noInitH":true},{"id":"donut_alarms_w_name-font-dark","cat":"Status Donuts","name":"Alarms with name (dark text)","alarms":true,"light":false,"withName":true,"noInitH":false},{"id":"donut_alarms_w_name-font-light","cat":"Status Donuts","name":"Alarms with name (light text)","alarms":true,"light":true,"withName":true,"noInitH":false},{"id":"donut_font-dark","cat":"Status Donuts","name":"All sensor states (dark text)","alarms":false,"light":false,"withName":false,"noInitH":false},{"id":"donut_font-light","cat":"Status Donuts","name":"All sensor states (light text)","alarms":false,"light":true,"withName":false,"noInitH":false},{"id":"donut_w_name-font-dark","cat":"Status Donuts","name":"All sensor states with name (dark text)","alarms":false,"light":false,"withName":true,"noInitH":false},{"id":"donut_w_name-font-light","cat":"Status Donuts","name":"All sensor states with name (light text)","alarms":false,"light":true,"withName":true,"noInitH":false}];
  var ICPRESETS=[{"id":"An Icon A1","cat":"Status Icons","name":"Name and status (default background)","raw":"\u003cdiv class=\"map_object map_icon mapicon_status_white\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"topleftcoordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n\t\u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n\t\u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n\t\u003cspan class=\"fll\">\n\t\t\u003cspan class=\"label\">\u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">:\u003c/span>\n\t\t\u003c#objectstatus name=\"downsens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"downacksens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n\t\u003c/span>\n\t\u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>\n"},{"id":"An Icon A1_XL","cat":"Status Icons","name":"Name and status (default background, XL)","raw":"\u003cdiv class=\"map_object map_icon map_icon_large mapicon_status_white\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"topleftcoordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n\t\u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n\t\u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003cspan class=\"fll\">\n\t\t\u003cspan class=\"label\">\u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">:\u003c/span>\n\t\t\u003c#objectstatus name=\"downsens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"downacksens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n\t\t\u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n\t\u003c/span>\n\t\u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>\n"},{"id":"An Icon A9","cat":"Status Icons","name":"Name and status (sizeable, status-related background)","raw":"\u003cdiv class=\"map_object map_icon2 map_icon_large \u003c#sensor type=\"colorclassofstate\" prefix=\"map_iconcolor_\" id=\"\u003c@objectid>\">\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"coordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n  \u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n  \u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n\n  \u003c#objectproperty type=\"nodename\" id=\"\u003c@objectid>\" var=\"nodename\">\n  \u003c#objectstatus name=\"lastvalue\" id=\"\u003c@objectid>\" var=\"lastvalue\">\n  \u003c#objectstatus name=\"message\" show=\"textraw\" id=\"\u003c@objectid>\" var=\"message\">\n\n  \u003cspan>\n    \u003c#objectstatus name=\"downsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"downacksens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n    \u003cbr>\n    \u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">\n    \u003cbr>\u003c#if value=\"@nodename\" is=\"sensor\" then=\"@lastvalue\" varexpand=\"value,then\">\n    \u003cbr>&nbsp;\n    \u003cbr>\u003c#if value=\"@nodename\" is=\"sensor\" then=\"@message\" varexpand=\"value,then\">\n  \u003c/span>\n    \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>\n"},{"id":"An Icon B1","cat":"Status Icons","name":"Status and minigraph (default background)","raw":"\u003cdiv class=\"map_object map_icon map_bg_default\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"topleftcoordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n\u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n\u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n\n\u003c#checkobjecttype objecttype=\"sensor\" nicemessage=\"true\" id=\"\u003c@objectid>\">\n\n  \u003cspan>\n    \u003c#objectstatus name=\"downsens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"partialdownsens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"downacksens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n  \u003c/span>\n  \u003cspan class=\"label\">\u003c#objectproperty name=\"ParentDevice\" show=\"text\" id=\"\u003c@objectid>\">:\u003c/span>\n  \u003cspan class=\"label\">\u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">\u003c/#objectproperty>\u003c/span>\n\n  \u003cdiv>\u003c#objectstatus name=\"minigraph\" id=\"\u003c@objectid>\">\u003c/div>\n  \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>\n"},{"id":"An Icon B1_xl","cat":"Status Icons","name":"Status and minigraph (bold, default background, XL)","raw":"\u003cdiv class=\"map_object  map_icon map_bg_default\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"topleftcoordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n\u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n\u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n\n\u003c#checkobjecttype objecttype=\"sensor\" nicemessage=\"true\" id=\"\u003c@objectid>\">\n\n  \u003cspan class=\"map_icon_large\">\n    \u003c#objectstatus name=\"downsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"downacksens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n  \u003c/span>\n  \u003cspan class=\"label map_icon_large\">\u003c#objectproperty name=\"ParentDevice\" show=\"text\" id=\"\u003c@objectid>\">:\u003c/span>\n  \u003cspan class=\"label map_icon_large\">\u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">\u003c/#objectproperty>\u003c/span>\n\n  \u003cdiv>\u003c#objectstatus name=\"minigraph\" id=\"\u003c@objectid>\">\u003c/div>\n  \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>\n"},{"id":"An Icon C1","cat":"Status Icons","name":"Minigraph only","raw":"\u003cdiv class=\"map_object map_icon map_icon_minigraph \u003c#sensor type=\"colorclassofstate\" prefix=\"map_iconcolor_\" id=\"\u003c@objectid>\">\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"topleftcoordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n  \u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n  \u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003cspan>\n    \u003c#checkobjecttype objecttype=\"sensor\" nicemessage=\"true\" id=\"\u003c@objectid>\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"minigraph\" id=\"\u003c@objectid>\">\n  \u003c/span>\n  \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>\n"},{"id":"An icon A2","cat":"Status Icons","name":"Name and status (transparent background)","raw":"\u003cdiv class=\"map_object map_icon mapicon_status_transparent\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"topleftcoordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n\u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n\u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003cspan class=\"fll\">\n    \u003cspan class=\"label\">\u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">:\u003c/span>\n    \u003c#objectstatus name=\"downsens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"downacksens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n    \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n  \u003c/span>\n\u003c/div>\n"},{"id":"An icon A2_XL","cat":"Status Icons","name":"Name and status (transparent background, XL)","raw":"\u003cdiv class=\"map_object map_icon map_icon_large mapicon_status_transparent\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"topleftcoordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n\u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n\u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003cspan class=\"fll\">\n    \u003cspan class=\"label\">\u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">:\u003c/span>\n    \u003c#objectstatus name=\"downsens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"downacksens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n    \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n  \u003c/span>\n\u003c/div>\n"},{"id":"An icon A3","cat":"Status Icons","name":"Status only (transparent background)","raw":"\u003cdiv class=\"map_object map_icon mapicon_status_transparent\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"topleftcoordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n\u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n\u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003cspan>\n    \u003c#objectstatus name=\"downsens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"downacksens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n    \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n  \u003c/span>\n\u003c/div>\n"},{"id":"An icon A3_XL","cat":"Status Icons","name":"Status only (transparent background, XL)","raw":"\u003cdiv class=\"map_object map_icon map_icon_large mapicon_status_transparent\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"topleftcoordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n\u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n\u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003cspan>\n    \u003c#objectstatus name=\"downsens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"downacksens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n    \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n  \u003c/span>\n\u003c/div>\n"},{"id":"An icon AA","cat":"Status Icons","name":"Status and audible alert (if alarms > 0)","raw":"\u003cdiv class=\"map_object map_icon \u003c#sensor type=\"colorclassofstate\" prefix=\"map_iconcolor_\" id=\"\u003c@objectid>\">\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"topleftcoordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n\u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n\u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003cspan>\n    \u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"downacksens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"downsens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n  \u003c/span>\n\u003cdiv id=\"alarmsound\">\u003c/div>\n\u003cscript type=\"text/javascript\">\n\n  function playalarm() {\n    if($('#audiblealarm').length \u003c= 0) {\n      $(\"#alarmsound\").empty().append('\u003caudio id=\"audiblealarm\">\u003csource src=\"/sounds/beep.ogg\" type=\"audio/ogg\" />\u003csource src=\"/sounds/beep.mp3\" type=\"audio/mpeg3\" />\u003c/audio>');\n    }\n    var audiblealarm = document.getElementById(\"audiblealarm\");\n    audiblealarm.load();\n    audiblealarm.play();\n  };\n\n  var errors1=\"\u003c#objectstatus name=\"downsens\" id=\"\u003c@objectid>\" show=\"textraw\">\";\n  var errors2=\"\u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\" show=\"textraw\">\";\n  var errors=errors1*1.0+errors2*1.0;\n\n\tif (errors > 0) {\n\t\tsetTimeout(playalarm, 2000);\n\t}\n\u003c/script>\n\u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>\n"},{"id":"An icon B2","cat":"Status Icons","name":"Status and last value (default background)","raw":"\u003cdiv class=\"map_object map_icon mapicon_status_white\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"topleftcoordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n  \u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n  \u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003cspan class=\"fll\">\n    \u003cspan class=\"label\">\u003c#objectproperty  name=\"ParentDevice\" show=\"text\" id=\"\u003c@objectid>\"> &gt; \u003c/span>\u003cspan class=\"label\">\u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">: \u003c/span>\u003cspan class=\"label\">\u003c#objectstatus name=\"lastvalue\" id=\"\u003c@objectid>\">\u003c/span>\n    \u003c#objectstatus name=\"downsens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"partialdownsens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"downacksens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n  \u003c/span>\n  \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>\n"},{"id":"An icon B2_XL","cat":"Status Icons","name":"Status and last value (default background, XL)","raw":"\u003cdiv class=\"map_object map_icon mapicon_status_white map_icon_large\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"topleftcoordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n  \u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n  \u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003cspan class=\"fll\">\n    \u003cspan class=\"label\">\u003c#objectproperty  name=\"ParentDevice\" show=\"text\" id=\"\u003c@objectid>\"> &gt; \u003c/span>\u003cspan class=\"label\">\u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">: \u003c/span>\u003cspan class=\"label\">\u003c#objectstatus name=\"lastvalue\" id=\"\u003c@objectid>\">\u003c/span>\n    \u003c#objectstatus name=\"downsens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"partialdownsens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"downacksens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n  \u003c/span>\n  \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>\n"},{"id":"Object Name Status Centered XL","cat":"Status Icons","name":"Name and status (transparent background, centered, XL)","raw":"\u003cdiv class=\"map_object map_icon_large mapicon_status_transparent\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"coordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n\u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n\u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003cdiv class=\"label\" style=\"width:100%;text-align:center;\">\u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">\u003c/div>\n  \u003cdiv class=\"center\">\n    \u003c#objectstatus name=\"downsens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"downacksens\"  id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n    \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n    \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n  \u003c/div>\n\u003c/div>\n"},{"id":"customStatusDot-DeviceLED","cat":"Status Icons","name":"Small Status Dot Device LED","raw":"\u003cdiv class=\"map_object statusdot \u003c#sensor type=\"colorclassofstate\" prefix=\"map_objectstate_\" id=\"\u003c@objectid>\">\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"coordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n  \u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n  \u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003c#checkobjecttype objecttype=\"device,group,probenode\" nicemessage=\"true\" id=\"\u003c@objectid>\">\n\u003cstyle>\n  .statusdot .dot {\n    width: 100%;\n    height: 100%;\n    aspect-ratio: 1 / 1;\n    min-width: 16px;\n    min-height: 16px;\n    border-radius: 50%;\n    position: relative;\n    background: radial-gradient(circle at 30% 30%, #b5b5b5, #6e6e6e 70%);\n    box-shadow:\n      inset 0 2px 4px rgba(255,255,255,0.5),\n      inset 0 -3px 5px rgba(0,0,0,0.35),\n      0 2px 5px rgba(0,0,0,0.45);\n  }\n  .statusdot .dot::after {\n    content: \"\";\n    position: absolute;\n    top: 8%; left: 14%;\n    width: 45%; height: 30%;\n    border-radius: 50%;\n    background: linear-gradient(rgba(255,255,255,0.75), rgba(255,255,255,0));\n  }\n\n  .statusdot.map_objectstate_hasgreen .dot {\n    background: radial-gradient(circle at 30% 30%, #7ee787, #2e9e3a 70%, #1d6b27);\n    box-shadow: inset 0 2px 4px rgba(255,255,255,0.5),\n                inset 0 -3px 5px rgba(0,0,0,0.35),\n                0 2px 6px rgba(46,158,58,0.65);\n  }\n  .statusdot.map_objectstate_hasblue .dot {\n    background: radial-gradient(circle at 30% 30%, #9cc4ff, #3d7fe0 70%, #27529b);\n    box-shadow: inset 0 2px 4px rgba(255,255,255,0.5),\n                inset 0 -3px 5px rgba(0,0,0,0.35),\n                0 2px 6px rgba(61,127,224,0.65);\n  }\n  .statusdot.map_objectstate_hasorange .dot {\n    background: radial-gradient(circle at 30% 30%, #ffc46b, #f08300 70%, #a85c00);\n    box-shadow: inset 0 2px 4px rgba(255,255,255,0.5),\n                inset 0 -3px 5px rgba(0,0,0,0.35),\n                0 2px 6px rgba(240,131,0,0.65);\n  }\n  .statusdot.map_objectstate_hasyellow .dot {\n    background: radial-gradient(circle at 30% 30%, #fbe98a, #e6c419 70%, #a08a10);\n    box-shadow: inset 0 2px 4px rgba(255,255,255,0.5),\n                inset 0 -3px 5px rgba(0,0,0,0.35),\n                0 2px 6px rgba(230,196,25,0.65);\n  }\n  .statusdot.map_objectstate_hasred .dot {\n    background: radial-gradient(circle at 30% 30%, #ff8a8a, #cf2626 70%, #8a1717);\n    box-shadow: inset 0 2px 4px rgba(255,255,255,0.5),\n                inset 0 -3px 5px rgba(0,0,0,0.35),\n                0 2px 8px rgba(207,38,38,0.8);\n  }\n\u003c/style>\n  \u003ca href=\"/device.htm?id=\u003c@objectid>\" style=\"display:block;width:100%;height:100%;\">\n    \u003cdiv class=\"dot\" title=\"\u003c#objectproperty name=\"name\" show=\"text\" id=\"\u003c@objectid>\">\">\u003c/div>\n  \u003c/a>\n  \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>"},{"id":"customStatusDot-SensorLED","cat":"Status Icons","name":"Small Status Dot Sensor LED","raw":"\u003cdiv class=\"map_object statusdot \u003c#sensor type=\"colorclassofstate\" prefix=\"map_objectstate_\" id=\"\u003c@objectid>\">\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"coordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n  \u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n  \u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003c#checkobjecttype objecttype=\"sensor\" nicemessage=\"true\" id=\"\u003c@objectid>\">\n  \u003cstyle>\n  .statusdot .dot {\n    width: 100%;\n    height: 100%;\n    aspect-ratio: 1 / 1;\n    min-width: 16px;\n    min-height: 16px;\n    border-radius: 50%;\n    position: relative;\n    background: radial-gradient(circle at 30% 30%, #b5b5b5, #6e6e6e 70%);\n    box-shadow:\n      inset 0 2px 4px rgba(255,255,255,0.5),\n      inset 0 -3px 5px rgba(0,0,0,0.35),\n      0 2px 5px rgba(0,0,0,0.45);\n  }\n  .statusdot .dot::after {\n    content: \"\";\n    position: absolute;\n    top: 8%; left: 14%;\n    width: 45%; height: 30%;\n    border-radius: 50%;\n    background: linear-gradient(rgba(255,255,255,0.75), rgba(255,255,255,0));\n  }\n\n  .statusdot.map_objectstate_sensg .dot {\n    background: radial-gradient(circle at 30% 30%, #7ee787, #2e9e3a 70%, #1d6b27);\n    box-shadow: inset 0 2px 4px rgba(255,255,255,0.5),\n                inset 0 -3px 5px rgba(0,0,0,0.35),\n                0 2px 6px rgba(46,158,58,0.65);\n  }\n  .statusdot.map_objectstate_sensb .dot {\n    background: radial-gradient(circle at 30% 30%, #9cc4ff, #3d7fe0 70%, #27529b);\n    box-shadow: inset 0 2px 4px rgba(255,255,255,0.5),\n                inset 0 -3px 5px rgba(0,0,0,0.35),\n                0 2px 6px rgba(61,127,224,0.65);\n  }\n  .statusdot.map_objectstate_senso .dot {\n    background: radial-gradient(circle at 30% 30%, #ffc46b, #f08300 70%, #a85c00);\n    box-shadow: inset 0 2px 4px rgba(255,255,255,0.5),\n                inset 0 -3px 5px rgba(0,0,0,0.35),\n                0 2px 6px rgba(240,131,0,0.65);\n  }\n  .statusdot.map_objectstate_sensy .dot {\n    background: radial-gradient(circle at 30% 30%, #fbe98a, #e6c419 70%, #a08a10);\n    box-shadow: inset 0 2px 4px rgba(255,255,255,0.5),\n                inset 0 -3px 5px rgba(0,0,0,0.35),\n                0 2px 6px rgba(230,196,25,0.65);\n  }\n  .statusdot.map_objectstate_sensr .dot {\n    background: radial-gradient(circle at 30% 30%, #ff8a8a, #cf2626 70%, #8a1717);\n    box-shadow: inset 0 2px 4px rgba(255,255,255,0.5),\n                inset 0 -3px 5px rgba(0,0,0,0.35),\n                0 2px 8px rgba(207,38,38,0.8);\n  }\n\u003c/style>\n  \u003ca href=\"/sensor.htm?id=\u003c@objectid>\" style=\"display:block;width:100%;height:100%;\">\n  \u003cdiv class=\"dot\" title=\"\u003c#objectproperty name=\"ParentDevice\" show=\"text\" id=\"\u003c@objectid>\">\">\u003c/div>\n\u003c/a>\n\u003c/div>"},{"id":"messageonly_on_transparent","cat":"Status Icons","name":"Sensor (message only, transparent background)","raw":"\u003cdiv class=\"map_object map_icon2 map_icon_large mapicon_status_transparent\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"coordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n  \u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n  \u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003c#checkobjecttype objecttype=\"sensor\" nicemessage=\"true\" id=\"\u003c@objectid>\">\n\n    \u003cspan class=\"label\">\n      \u003c#objectstatus name=\"downsens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"downacksens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n    \u003c/span>\n\n  \u003cspan class=\"label\">\u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">\u003c/span>\n\n  \u003cdiv style=\"clear: both;\">\u003c#objectstatus name=\"message\" show=\"textraw\" id=\"\u003c@objectid>\">\u003c/div>\n\n  \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>\n"},{"id":"messageonly_on_white","cat":"Status Icons","name":"Sensor (message only, default background)","raw":"\u003cdiv class=\"map_object map_icon2 map_icon_large mapicon_status_white\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"coordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n  \u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n  \u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003c#checkobjecttype objecttype=\"sensor\" nicemessage=\"true\" id=\"\u003c@objectid>\">\n    \u003cspan class=\"label\">\n      \u003c#objectstatus name=\"downsens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"partialdownsens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"downacksens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"warnsens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"upsens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"pausedsens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"unusualsens\" id=\"\u003c@objectid>\">\n      \u003c#objectstatus name=\"undefinedsens\" id=\"\u003c@objectid>\">\n    \u003c/span>\n\n  \u003cspan class=\"label\">\u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">\u003c/span>\n\n  \u003cdiv style=\"clear: both;\">\u003c#objectstatus name=\"message\" show=\"textraw\" id=\"\u003c@objectid>\">\u003c/div>\n\n  \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>\n"},{"id":"messageonly_related_background","cat":"Status Icons","name":"Sensor (message only, status-related background)","raw":"\u003cdiv class=\"map_object map_icon2 map_icon_large \u003c#sensor type=\"colorclassofstate\" prefix=\"map_iconcolor_\" id=\"\u003c@objectid>\">\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"\u003c#mapobject type=\"coordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n\t\u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n\t\u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n  \u003c#checkobjecttype objecttype=\"sensor\" nicemessage=\"true\" id=\"\u003c@objectid>\">\n\n  \u003cspan class=\"label\">\u003c#objectproperty name=\"Name\" id=\"\u003c@objectid>\">\u003c/span>\n  \u003cdiv style=\"clear: both;\">\u003c#objectstatus name=\"message\" show=\"textraw\" id=\"\u003c@objectid>\">\u003c/div>\n\n  \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n\u003c/div>\n"},{"id":"trafficlight","cat":"Status Icons","name":"Traffic light","raw":"\u003cdiv class=\"map_object map_table map_icon_large\" id=\"\u003c@itemid>\" objectid=\"\u003c@objectid>\" subid=\"\u003c@subid>\" style=\"overflow:hidden;\u003c#mapobject type=\"coordinates\" subid=\"\u003c@subid>\" mode=\"\u003c@editmode>\">\">\n  \u003c#mapobject type=\"objectgrip\" mode=\"\u003c@editmode>\">\n  \u003c#mapobject type=\"htmlbefore\" subid=\"\u003c@subid>\">\n\n  \u003c#sensor type=\"colorclassofstate\" id=\"\u003c@objectid>\" var=\"status\">\n  \u003c#objectproperty type=\"nodename\" id=\"\u003c@objectid>\" var=\"nodename\">\n  \u003c#if value=\"@nodename\" is=\"sensor\" then=\"sensr\" else=\"hasred\" varexpand=\"value\" var=\"containsred\">\n  \u003c#if value=\"@nodename\" is=\"sensor\" then=\"sensy\" else=\"hasyellow hasnored\" varexpand=\"value\" var=\"containsyellow\">\n  \u003c#if value=\"@nodename\" is=\"sensor\" then=\"sensg\" else=\"hasgreen hasnoyellow hasnored\" varexpand=\"value\" var=\"containsgreen\">\n  \u003csvg xmlns=\"http://www.w3.org/2000/svg\"\n  xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n  version=\"1.0\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 100 280\">\n    \u003cdefs>\n      \u003crect class=\"trafficlight_frame\" x=\"0\" y=\"0\" width=\"100px\" height=\"280px\" fill=\"#ECECEC\" id=\"a\" />\n    \u003c/defs>\n    \u003cuse xlink:href=\"#a\" />\n    \u003cg class=\"trafficlight\" transform=\"translate(0,0)\">\n      \u003cuse xlink:href=\"#a\" />\n      \u003ccircle class=\"trafficlight_circle\" r=\"40\" fill=\"#DADADA\" cx=\"50\" cy=\"50\" />\n      \u003ccircle class=\"trafficlight_circle\" r=\"40\" fill=\"#DADADA\" cx=\"50\" cy=\"140\" />\n      \u003ccircle class=\"trafficlight_circle\" r=\"40\" fill=\"#DADADA\" cx=\"50\" cy=\"230\" />\n      \u003ccircle style=\"\u003c#if value=\"@status\" contains=\"@containsred\" then=\"\" else=\"opacity:0\" varexpand=\"value,contains\">\" r=\"40\" fill=\"#E6005F\" cx=\"50\" cy=\"50\" />\n      \u003ccircle style=\"\u003c#if value=\"@status\" contains=\"@containsyellow\" then=\"\" else=\"opacity:0\" varexpand=\"value,contains\">\" r=\"40\" fill=\"#F59C00\" cx=\"50\" cy=\"140\" />\n      \u003ccircle style=\"\u003c#if value=\"@status\" contains=\"@containsgreen\" then=\"\" else=\"opacity:0\" varexpand=\"value,contains\">\" r=\"40\" fill=\"#C0CC19\" cx=\"50\" cy=\"230\" />\n    \u003c/g>\n  \u003c/svg>\n  \u003cdiv style=\"position:relative;margin-top:-20px\">\n    \u003c#mapobject type=\"htmlafter\" subid=\"\u003c@subid>\">\n  \u003c/div>\n\u003c/div>\n"}];
  /*PURE2-START*/
  var COLS=[
    ['status','Status'],['sensor','Sensor'],['device','Device'],['probegroupdevice','Probe / group / device'],
    ['group','Group'],['message','Message'],['lastvalue','Last value'],['minigraph','Mini graph'],
    ['priority','Priority'],['favorite','Favorite'],['downtimesince','Down since'],['uptime','Uptime']
  ];
  var SORTS=['status','sensor','device','probegroupdevice','priority','lastvalue','downtimesince','uptime'];
  var STATUSDEF=[
    ['up','Up',['3']],['warning','Warning',['4']],['down','Down',['5']],['downack','Down (acknowledged)',['13']],
    ['downpartial','Down (partial)',['14']],['unusual','Unusual',['10']],['paused','Paused',['7','8','9','12']],['unknown','Unknown',['1','2','0']]
  ];
  var STATUSORDER=['3','4','5','10','13','14','7','8','9','12','1','2','0'];
  var LOOKBASE={mode:'custom',font:'Roboto',size:13,card:true,cardBg:'#FFFFFF',cardA:100,border:'#E3E5E9',bw:1,radius:4,shadow:'none',
    titleStyle:'bar',titleBg:'#050F34',titleColor:'#FFFFFF',titleText:'#383B47',titleSize:13,accent:'#007DB8',cardPad:0,
    head:true,headStyle:'fill',headBg:'#F7F8FA',headColor:'#6B7385',muted:'#5F6674',headUpper:true,
    text:'#383B47',link:'#007DB8',line:'#F0F1F4',hover:'#F4F9FC',zebra:false,zebraBg:'#F8FAFC',pad:9,cellX:14,
    status:'dot',dot:12,tint:true,stage:'',
    c:{up:'#2FA84F',warning:'#F0AD22',down:'#D8402F',unusual:'#F0AD22',paused:'#8B93A3',unknown:'#9AA0AD'}};
  function mix(a,b){var o={};for(var k in a)o[k]=a[k];for(var j in b)o[j]=b[j];return o;}
  var LOOKS={
    'PRTG default':{mode:'prtg'},
    'Agency light':{cardBg:'#FFFFFF',border:'#DDE3EA',radius:6,shadow:'soft',titleStyle:'heading',titleText:'#1B2A4A',titleSize:17,cardPad:16,
      headStyle:'plain',headColor:'#6B778C',headUpper:false,text:'#1B2A4A',link:'#0B6BCB',line:'#E8ECF1',hover:'#F5F8FB',pad:11,cellX:10,
      status:'dot',stage:'#EDF0F4',muted:'#5A667B',accent:'#0B6BCB'},
    'Clean card':{cardBg:'#FFFFFF',border:'#E5E7EB',radius:10,shadow:'soft',titleStyle:'divider',titleText:'#111827',titleSize:16,cardPad:18,
      headStyle:'plain',headColor:'#6B7280',headUpper:true,text:'#374151',link:'#2563EB',line:'#F1F3F5',hover:'#F9FAFB',pad:10,cellX:10,
      status:'pill',stage:'#F3F4F6',muted:'#5F6672',accent:'#2563EB'},
    'Corporate blue':{cardBg:'#FFFFFF',border:'#E1E6EC',radius:2,shadow:'soft',titleStyle:'bar',titleBg:'#1F3864',titleColor:'#FFFFFF',titleSize:14,
      headStyle:'line',headColor:'#1F3864',text:'#2B3A55',link:'#2F5C9E',line:'#E8ECF2',hover:'#F2F6FC',pad:10,stage:'#F2F4F7',accent:'#2F5C9E'},
    'Executive dark':{cardBg:'#23263A',bw:0,radius:14,shadow:'none',titleStyle:'heading',titleText:'#F4F5F9',titleSize:17,cardPad:20,
      headStyle:'plain',headColor:'#8A8FA8',headUpper:true,text:'#E3E5EE',link:'#7FB3FF',line:'#2F3350',hover:'#2C3050',pad:11,cellX:10,
      status:'pill',stage:'#171926',muted:'#A9AEC6',accent:'#6DD58C',
      c:{up:'#6DD58C',warning:'#F6C453',down:'#F4727C',unusual:'#F6C453',paused:'#8A8FA8',unknown:'#8A8FA8'}},
    'Indigo board':{cardBg:'#272B58',bw:0,radius:10,shadow:'none',titleStyle:'heading',titleText:'#FFFFFF',titleSize:18,cardPad:20,
      headStyle:'plain',headColor:'#9AA3E0',headUpper:true,text:'#F1F2FF',link:'#00CFFF',line:'#363B72',hover:'#30356B',pad:11,cellX:10,
      status:'dot',dot:12,stage:'#161240',muted:'#B2BAF0',accent:'#00CFFF',
      c:{up:'#00E0A4',warning:'#FFD166',down:'#FF5D73',unusual:'#FFD166',paused:'#9AA3E0',unknown:'#9AA3E0'}},
    'Slate fintech':{cardBg:'#353849',bw:0,radius:4,shadow:'strong',titleStyle:'accent',titleText:'#FFFFFF',titleSize:16,cardPad:20,
      headStyle:'plain',headColor:'#A5A8BC',headUpper:true,text:'#E6E7EE',link:'#FF6B8E',line:'#454859',hover:'#3E4156',pad:10,cellX:10,
      status:'dot',stage:'#2B2D3C',muted:'#B7BACD',accent:'#FF3B6B',
      c:{up:'#2EE6A8',warning:'#FFB547',down:'#FF3B6B',unusual:'#FFB547',paused:'#8D90A4',unknown:'#8D90A4'}},
    'Neon plum':{cardBg:'#3A2750',border:'#5B4678',bw:1,radius:8,shadow:'glow',titleStyle:'accent',titleText:'#FFFFFF',titleSize:16,cardPad:18,
      headStyle:'plain',headColor:'#A592C2',headUpper:true,text:'#EDE7F6',link:'#FF6FA3',line:'#4A3A63',hover:'#4B3A66',pad:10,cellX:10,
      status:'dot',stage:'#2A1838',muted:'#BDAED6',accent:'#FF2D75',
      c:{up:'#35D07F',warning:'#FFA533',down:'#FF3D71',unusual:'#FFA533',paused:'#A592C2',unknown:'#A592C2'}},
    'Teal glass':{cardBg:'#34495E',border:'#4A6178',bw:1,radius:4,shadow:'none',titleStyle:'divider',titleText:'#FFFFFF',titleSize:16,cardPad:18,
      headStyle:'line',headColor:'#2BF5E1',headUpper:true,text:'#E6EEF5',link:'#2BF5E1',line:'#46607A',hover:'#3E566C',pad:10,cellX:10,
      status:'dot',stage:'#2A3B4C',accent:'#2BF5E1',muted:'#C4D1DE',
      c:{up:'#2BF5E1',warning:'#FFD166',down:'#FF6B9D',unusual:'#FFD166',paused:'#8FA3B8',unknown:'#8FA3B8'}},
    'Light card':{stage:'#EDF0F4'},
    'Dark card':{muted:'#A9B7CA',cardBg:'#1E293B',border:'#334155',titleBg:'#0F172A',titleColor:'#F1F5F9',headBg:'#243047',headColor:'#94A3B8',text:'#E2E8F0',link:'#38BDF8',line:'#334155',hover:'#2A3A55',zebraBg:'#243047',stage:'#171926'},
    'Minimal':{card:false,titleStyle:'heading',titleSize:14,headStyle:'plain',line:'#E5E7EB',hover:'#F8FAFC',pad:7,size:13},
    'Wall display':{muted:'#A9B7CA',size:18,pad:13,dot:16,cardBg:'#0F172A',border:'#1E293B',titleBg:'#007DB8',titleColor:'#FFFFFF',titleSize:18,headBg:'#1E293B',headColor:'#94A3B8',text:'#F1F5F9',link:'#38BDF8',line:'#243047',hover:'#1E293B',zebraBg:'#111C33',stage:'#0B1220'}
    ,'Brand navy':{cardBg:'#0A1742',border:'#1B2B63',bw:1,radius:4,shadow:'none',titleStyle:'heading',titleText:'#E6ECF8',titleSize:16,cardPad:14,
      headStyle:'plain',headColor:'#8C9AC2',headUpper:true,text:'#E6ECF8',link:'#00AEEF',line:'#1B2B63',hover:'#101F52',pad:10,cellX:10,
      status:'dot',stage:'#050F34',muted:'#8C9AC2',accent:'#00AEEF',font:'Inter',
      c:{up:'#3CCF8E',warning:'#FFC233',down:'#E60060',unusual:'#FF8A3D',paused:'#00AEEF',unknown:'#6B7699'}}
  };
  var LOOKORDER=['Agency light','Clean card','Corporate blue','Executive dark','Indigo board','Slate fintech','Neon plum','Teal glass','Light card','Dark card','Minimal','Wall display','Brand navy','PRTG default'];
  function lookOf(name){var l=mix(LOOKBASE,LOOKS[name]||{});l.c=mix(LOOKBASE.c,(LOOKS[name]||{}).c||{});l.name=name;return l;}
  function slugOf(s){var t=String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');return t||'table';}
  function clean(s){return String(s==null?'':s).replace(/[<>"]/g,'').replace(/\s+/g,' ').trim();}
  function cleanTag(s){return String(s||'').replace(/[^A-Za-z0-9_\-]/g,'');}
  function statusCodes(T){
    var set={},i,j;
    for(i=0;i<STATUSDEF.length;i++){if(T.status.indexOf(STATUSDEF[i][0])>-1){for(j=0;j<STATUSDEF[i][2].length;j++)set[STATUSDEF[i][2][j]]=1;}}
    return STATUSORDER.filter(function(c){return set[c];});
  }
  function cleanTags(str){
    var parts=String(str||'').split(/[\s,]+/),out=[];
    parts.forEach(function(x){x=cleanTag(x);if(x&&out.indexOf(x)<0)out.push(x);});
    return out;
  }
  function tagFilters(T){
    var req=cleanTags(T.reqTag), out=[];
    if(!req.length){if(T.mapTags)out.push('@tag(<@tagfilterstring>)');return out;}
    req.forEach(function(t){out.push(T.mapTags?'@tag(<@tagfilterstring> %2b'+t+')':'@tag('+t+')');});
    return out;
  }
  function tableParams(T){
    var p=[['id','<@objectid>'],['content','sensors'],['columns',T.cols.join(',')],
      ['sortby',(T.sortDir==='desc'?'-':'')+T.sortBy],['infoheader',T.infoheader?'true':'false'],
      ['links',T.links?'true':'false'],['sortable',T.sortable?'true':'false'],['refreshable',T.refreshable?'true':'false']];
    tagFilters(T).forEach(function(tf){p.push(['filter_tags',tf]);});
    if(T.showTitle===false){p.push(['tabletitle','']);}
    else if(T.titleObj){p.push(['varexpand','tabletitle']);p.push(['tabletitle','@tabletitle']);}
    else p.push(['tabletitle',clean(T.title)]);
    statusCodes(T).forEach(function(c){p.push(['filter_status',c]);});
    var nm=String(T.nameContains||'').replace(/[<>"()]/g,'').trim();
    if(nm)p.push(['filter_name','@sub('+nm+')']);
    if(T.onlyValue)p.push(['filter_lastvalue','@ntxt()']);
    if(T.onlyFav)p.push(['filter_favorite','1']);
    (T.extra||[]).forEach(function(line){
      var m=/^\s*([A-Za-z_]+)\s*=\s*"([^"\n]*)"\s*$/.exec(line);
      if(m)p.push([m[1],m[2]]);
    });
    var n=parseInt(T.count,10);
    if(n>0)p.push(['count',String(Math.min(n,1000))]);
    return p;
  }
  function tint(hex,a){
    var h=String(hex).replace('#','');
    if(h.length!==6)return 'rgba(128,128,128,'+a+')';
    return 'rgba('+parseInt(h.substr(0,2),16)+','+parseInt(h.substr(2,2),16)+','+parseInt(h.substr(4,2),16)+','+a+')';
  }
  function needsFontLink(L){return L.mode==='custom'&&!isLocalFont(L.font)&&L.font!=='Roboto';}
  function fontLinkOf(L){
    return '<link href="https://fonts.googleapis.com/css2?family='+L.font.replace(/ /g,'+')+':wght@400;500;600;700&display=swap" rel="stylesheet">';
  }
  function shadowOf(L){
    var v=(L.shadow===true)?'soft':(L.shadow||'none');
    if(v==='soft')return '0 1px 3px rgba(15,23,42,.12),0 4px 12px rgba(15,23,42,.06)';
    if(v==='strong')return '0 10px 28px rgba(0,0,0,.35)';
    if(v==='glow')return '0 0 0 1px '+tint(L.accent,0.35)+',0 8px 26px '+tint(L.accent,0.2);
    return '';
  }
  /* Rotation turns the whole object, so the card, the title and the rows turn together. The title can be moved by an offset and aligned.
     In the preview the rotation is applied to a wrapper instead (so its handles turn with it): pass {preview:true} to leave it out. */
  function tableRot(T){return Math.max(-180,Math.min(180,Math.round(Number(T.rot)||0)));}
  function tableCardDecl(T){
    var L=T.look;if(L.mode==='prtg'||!L.card)return '';
    var fillA=(L.cardA==null?100:L.cardA), cardFill=(fillA<100)?tint(L.cardBg,fillA/100):L.cardBg;
    var d='background:'+cardFill+';border-radius:'+L.radius+'px;';
    if(L.bw>0)d+='outline:'+L.bw+'px solid '+L.border+';outline-offset:-'+L.bw+'px;';
    var sh=shadowOf(L);if(sh)d+='box-shadow:'+sh+';';
    return d;
  }
  function tableExtraCss(T,cls,o){
    var r='.'+cls, c=[], rot=tableRot(T);
    if(rot!==0){
      /* PRTG places the resize handle from jQuery position(), which reads the bounding box of the object itself, so the object must not be transformed.
         The card is turned instead: it moves to the inner container, which fills the object and rotates about its centre. The object stays a plain upright box, so PRTG's selection
         box and handle stay where they belong, and it must not clip the turned card. */
      c.push(r+'{overflow:visible !important;}');
      c.push(r+' > .maptablecontainer,'+r+' > .top10listcontainer{height:100%;box-sizing:border-box;'+tableCardDecl(T)+(o&&o.preview?'':'transform:rotate('+rot+'deg);transform-origin:50% 50%;')+'}');
    }
    var ox=Math.round(Number(T.tOffX)||0), oy=Math.round(Number(T.tOffY)||0), al=T.tAlign, tt='';
    if(ox||oy)tt+='position:relative;left:'+ox+'px;top:'+oy+'px;';
    if(al==='left'||al==='center'||al==='right')tt+='text-align:'+al+';';
    if(tt)c.push(r+' .tabletitle{'+tt+'}');
    return c;
  }
  function tableCss(T,cls,o){
    var L=T.look;if(L.mode==='prtg')return tableExtraCss(T,cls,o).join('\n');
    var r='.'+cls, c=[], bar=(L.titleStyle==='bar'), hasStatus=T.cols.indexOf('status')>-1;
    var fillA=(L.cardA==null?100:L.cardA);
    var cardFill=(fillA<100)?tint(L.cardBg,fillA/100):L.cardBg;
    var root='font-family:'+familyStack(L.font)+';font-size:'+L.size+'px;color:'+L.text+';';
    /* PRTG places the resize handle from jQuery's width()/height(), which ignore padding and border.
       So the object itself must have neither: the border is an inset outline and the padding sits on an inner element. */
    if(L.card&&tableRot(T)===0)root+=tableCardDecl(T);
    c.push(r+'{'+root+'}');
    var ip=(bar?0:(L.cardPad||0))+((L.card&&L.bw>0)?L.bw:0);   // the outline sits over the first pixels, so keep the old spacing
    if(ip>0)c.push(r+' > .maptablecontainer,'+r+' > .top10listcontainer{padding:'+ip+'px;box-sizing:border-box;}');
    c.push(r+' .table-wrapper{background:'+((L.card&&fillA>=100)?L.cardBg:'transparent')+' !important;padding:0 !important;margin:0 !important;box-shadow:none !important;}');
    var titleCol=bar?L.titleColor:(L.titleText||L.text);
    if(bar){
      c.push(r+' .tabletitle{font-size:'+L.titleSize+'px;font-weight:500;letter-spacing:.4px;color:'+L.titleColor+';background:'+L.titleBg+';padding:10px 14px;text-transform:none;'+(L.card?'border-radius:'+L.radius+'px '+L.radius+'px 0 0;':'')+'}');
    }else{
      var tt='font-size:'+L.titleSize+'px;font-weight:600;color:'+titleCol+';text-transform:none;';
      if(L.titleStyle==='divider')tt+='padding:0 0 12px;margin:0 0 4px;border-bottom:1px solid '+L.line+';';
      else if(L.titleStyle==='accent')tt+='padding:2px 0 2px 10px;margin:0 0 12px;border-left:3px solid '+L.accent+';line-height:1.2;';
      else tt+='padding:0 0 10px;';
      c.push(r+' .tabletitle{'+tt+'}');
    }
    c.push(r+' .tabletitle,'+r+' .tabletitle *{color:'+titleCol+' !important;}');
    c.push(r+' .tabletitle:empty{display:none;}');
    c.push(r+' table{width:100%;border-collapse:collapse;}');
    if(L.head){
      var hs=L.headStyle||'fill';
      var th='font-size:'+Math.max(9,L.size-3)+'px;font-weight:'+(hs==='fill'?500:600)+';letter-spacing:.8px;'+(L.headUpper?'text-transform:uppercase;':'')+'color:'+L.headColor+';text-align:left;padding:8px '+L.cellX+'px !important;';
      if(hs==='fill')th+='background:'+L.headBg+';border-bottom:1px solid '+L.line+' !important;';
      else if(hs==='line')th+='background:transparent;border-bottom:2px solid '+L.accent+' !important;';
      else th+='background:transparent;border-bottom:1px solid '+L.line+' !important;';
      c.push(r+' thead th{'+th+'}');
      c.push(r+' thead th,'+r+' thead th *{color:'+L.headColor+' !important;}');
    }else c.push(r+' thead{display:none;}');
    c.push(r+' tbody td{padding:'+L.pad+'px '+L.cellX+'px;border-bottom:1px solid '+L.line+';font-size:'+L.size+'px;color:'+L.text+';vertical-align:middle;}');
    c.push(r+' tbody td,'+r+' tbody td *{color:'+L.text+' !important;}');
    c.push(r+' tbody td .parentItem,'+r+' tbody td .parentItem *{color:'+(L.muted||L.headColor)+' !important;}');
    if(T.links)c.push(r+' tbody td a,'+r+' tbody td a *{color:'+L.link+' !important;}');
    c.push(r+' tbody tr:last-child td{border-bottom:0;}');
    if(L.zebra)c.push(r+' tbody tr:nth-child(even) td{background:'+L.zebraBg+';}');
    c.push(r+' tbody tr:hover td{background:'+L.hover+';}');
    if(L.tint&&hasStatus){
      c.push(r+' tbody tr.rowdown td{background:'+tint(L.c.down,0.12)+';}');
      c.push(r+' tbody tr.rowdown:hover td{background:'+tint(L.c.down,0.2)+';}');
      c.push(r+' tbody tr.rowwarn td{background:'+tint(L.c.warning,0.14)+';}');
      c.push(r+' tbody tr.rowwarn:hover td{background:'+tint(L.c.warning,0.22)+';}');
    }
    if(hasStatus&&L.status!=='text'){
      if(L.status==='dot'){
        c.push(r+' td.col-status{width:44px;text-align:center;white-space:nowrap;line-height:1;}');
        c.push(r+' td.col-status .txt{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);}');
      }else if(L.status==='pill'){
        c.push(r+' td.col-status{white-space:nowrap;}');
        c.push(r+' td.col-status .pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:'+Math.max(9,L.size-2)+'px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;line-height:1.3;white-space:nowrap;}');
      }else{
        c.push(r+' td.col-status{white-space:nowrap;}');
        c.push(r+' td.col-status .dot{margin-right:8px;}');
      }
      if(L.status==='dot'||L.status==='dottext')c.push(r+' td.col-status .dot{display:inline-block;width:'+L.dot+'px;height:'+L.dot+'px;border-radius:50%;background:'+L.c.unknown+';vertical-align:middle;}');
    }
    c.push(r+' td.col-device img,'+r+' td.col-probegroupdevice img{vertical-align:middle;margin-right:7px;opacity:.6;}');
    tableExtraCss(T,cls,o).forEach(function(x){c.push(x);});
    return c.join('\n');
  }
  /* same visual effect as tableScript()'s generated IIFE, but a real function
     (no new Function/eval) for driving the live in-tool preview once per edit,
     without starting a real repeating timer in that preview. tableScript() itself
     is unchanged below: it still emits a source string embedded in exported PRTG
     map-object files, which run later under PRTG's own page, not this extension. */
  function tablePaintOnce(cls,colors,dots,pills,tn){
    function rgba(h,a){var x=h.replace('#','');return 'rgba('+parseInt(x.substr(0,2),16)+','+parseInt(x.substr(2,2),16)+','+parseInt(x.substr(4,2),16)+','+a+')';}
    var cells=document.querySelectorAll('.'+cls+' td.col-status'), i;
    for(i=0;i<cells.length;i++){
      var c=cells[i], full, dot, pill, t;
      if(dots){
        dot=c.querySelector('.dot');
        if(!dot){
          t=(c.textContent||'').replace(/\s+/g,' ').trim();
          c.setAttribute('data-st',t);
          c.innerHTML='<span class="dot"></span><span class="txt">'+t.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>';
          dot=c.querySelector('.dot');
        }
        full=c.getAttribute('data-st')||'';
      }else if(pills){
        pill=c.querySelector('.pill');
        if(!pill){
          t=(c.textContent||'').replace(/\s+/g,' ').trim();
          c.setAttribute('data-st',t);
          c.innerHTML='<span class="pill"></span>';
          pill=c.querySelector('.pill');
          pill.textContent=t;
        }
        full=c.getAttribute('data-st')||'';
      }else{
        full=(c.textContent||'').replace(/\s+/g,' ').trim();
      }
      var word=full.toLowerCase().split(' ')[0];
      if(dots){dot.style.background=colors[word]||colors.unknown;dot.title=full;}
      if(pills){var col=colors[word]||colors.unknown;pill.style.setProperty('color',col,'important');pill.style.background=rgba(col,0.16);}
      if(tn){
        var row=c.parentNode;
        if(row){
          var base=(row.className||'').replace(/ ?rowdown/g,'').replace(/ ?rowwarn/g,'');
          if(word==='down')base+=' rowdown';
          else if(word==='warning'||word==='unusual')base+=' rowwarn';
          row.className=base;
        }
      }
    }
  }
  function tableScript(T,cls){
    var L=T.look;
    if(L.mode==='prtg'||T.cols.indexOf('status')<0)return '';
    var dots=(L.status==='dot'||L.status==='dottext'), pills=(L.status==='pill'), tn=!!L.tint;
    if(!dots&&!pills&&!tn)return '';
    var j=[];
    j.push('(function(){');
    j.push('  var colors={up:"'+L.c.up+'",warning:"'+L.c.warning+'",down:"'+L.c.down+'",unusual:"'+L.c.unusual+'",paused:"'+L.c.paused+'",unknown:"'+L.c.unknown+'"};');
    if(pills){
      j.push('  function rgba(h,a){var x=h.replace("#","");return "rgba("+parseInt(x.substr(0,2),16)+","+parseInt(x.substr(2,2),16)+","+parseInt(x.substr(4,2),16)+","+a+")";}');
    }
    j.push('  function paint(){');
    j.push('    var cells=document.querySelectorAll(".'+cls+' td.col-status");');
    j.push('    for(var i=0;i<cells.length;i++){');
    j.push('      var c=cells[i], full;');
    if(dots){
      j.push('      var dot=c.querySelector(".dot");');
      j.push('      if(!dot){');
      j.push('        var t=(c.textContent||"").replace(/\\s+/g," ").trim();');
      j.push('        c.setAttribute("data-st",t);');
      j.push('        c.innerHTML=\'<span class="dot"></span><span class="txt">\'+t.replace(/&/g,"&amp;").replace(/</g,"&lt;")+\'</span>\';');
      j.push('        dot=c.querySelector(".dot");');
      j.push('      }');
      j.push('      full=c.getAttribute("data-st")||"";');
    }else if(pills){
      j.push('      var pill=c.querySelector(".pill");');
      j.push('      if(!pill){');
      j.push('        var t=(c.textContent||"").replace(/\\s+/g," ").trim();');
      j.push('        c.setAttribute("data-st",t);');
      j.push('        c.innerHTML=\'<span class="pill"></span>\';');
      j.push('        pill=c.querySelector(".pill");');
      j.push('        pill.textContent=t;');
      j.push('      }');
      j.push('      full=c.getAttribute("data-st")||"";');
    }else{
      j.push('      full=(c.textContent||"").replace(/\\s+/g," ").trim();');
    }
    j.push('      var word=full.toLowerCase().split(" ")[0];');
    if(dots){
      j.push('      dot.style.background=colors[word]||colors.unknown;');
      j.push('      dot.title=full;');
    }
    if(pills){
      j.push('      var col=colors[word]||colors.unknown;');
      j.push('      pill.style.setProperty("color",col,"important");');
      j.push('      pill.style.background=rgba(col,0.16);');
    }
    if(tn){
      j.push('      var row=c.parentNode;');
      j.push('      if(row){');
      j.push('        var base=(row.className||"").replace(/ ?rowdown/g,"").replace(/ ?rowwarn/g,"");');
      j.push('        if(word==="down")base+=" rowdown";');
      j.push('        else if(word==="warning"||word==="unusual")base+=" rowwarn";');
      j.push('        row.className=base;');
      j.push('      }');
    }
    j.push('    }');
    j.push('  }');
    j.push('  paint();');
    j.push('  setInterval(paint,5000);');
    j.push('})();');
    return j.join('\n');
  }
  function classOf(T){return 'ptbl_'+slugOf(T.name);}
  function fileNameOf(T){
    var f=String(T.fname||'').replace(/[^A-Za-z0-9 _.\-]/g,'').trim();
    if(!f)f=slugOf(T.name).replace(/_/g,'-');
    if(!/\.htm$/i.test(f))f=f.replace(/\.html?$/i,'')+'.htm';
    return f;
  }
  function buildTable(T){
    var cls=classOf(T), css=tableCss(T,cls), js=tableScript(T,cls), o=[];
    var useCls=!!(css||js);
    o.push('<!'+'--'+clean(T.cat||'Data Tables')+': '+clean(T.name||'Table')+'-->');
    o.push('');
    o.push('<div class="map_object map_table'+(useCls?' '+cls:'')+'" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+initAttr(T)+' style="overflow:auto;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('  <#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('  <#mapobject type="htmlbefore" subid="<@subid>">');
    o.push('  <#checkobjecttype objecttype="'+(T.checks||'probenode,group,device')+'" nicemessage="true" id="<@objectid>">');
    o.push('');
    if(needsFontLink(T.look))o.push('  '+fontLinkOf(T.look));
    if(css){o.push('<style>');o.push(css);o.push('</style>');o.push('');}
    o.push('  <div class="'+(T.box||'maptablecontainer')+'" style="overflow:hidden">');
    o.push('    <div class="prtg-plugin" data-plugin="prtg-table">');
    if(T.showTitle!==false&&T.titleObj){
      o.push('      <#lang key="html.mapobjects.'+cls+'.tabletitle" default="'+clean(T.title)+' (@@@@)" var="tabletitle">');
    }
    var ps=tableParams(T);
    o.push('      <#table tableid="sensortable"');
    ps.forEach(function(kv){o.push('      '+kv[0]+'="'+kv[1]+'"');});
    o.push('      >');
    o.push('    </div>');
    o.push('  </div>');
    o.push('  <#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    if(js){o.push('');o.push('<scr'+'ipt>');o.push(js);o.push('<\/script>');}
    return o.join('\n')+'\n';
  }
  function initAttr(M){
    var w=parseInt(M.initW,10), h=parseInt(M.initH,10);
    return (w>0&&h>0)?' initialwidth="'+Math.min(w,4000)+'" initialheight="'+Math.min(h,4000)+'"':'';
  }
  function blankT(){
    return {id:'',cat:'Data Tables',name:'Site status',title:'Site status',titleObj:false,showTitle:true,
      cols:['status','device'],sortBy:'status',sortDir:'asc',count:0,status:[],mapTags:true,reqTag:'',nameContains:'',onlyValue:false,onlyFav:false,extra:[],
      links:false,sortable:false,refreshable:true,infoheader:false,box:'maptablecontainer',checks:'probenode,group,device',initW:600,initH:330,
      rot:0,tOffX:0,tOffY:0,tAlign:'',
      look:lookOf('Light card'),fname:''};
  }
  function fromPreset(p){
    var T=blankT();
    ['cat','title','titleObj','cols','sortBy','sortDir','count','status','mapTags','reqTag','nameContains','onlyValue','onlyFav','extra','links','sortable','refreshable','infoheader','box','checks'].forEach(function(k){
      var v=p[k];T[k]=(v instanceof Array)?v.slice():v;
    });
    T.initW=0;T.initH=0;T.id=p.id;T.name=p.name+' custom';T.showTitle=!!(p.title||p.titleObj);if(!p.title&&!p.titleObj)T.title='';
    T.look=lookOf('PRTG default');T.fname='';
    return T;
  }
  /* ====================== gauges ====================== */
  function blend(a,b,t){
    var x=String(a).replace('#',''),y=String(b).replace('#','');
    if(x.length!==6||y.length!==6)return a;
    var r=[0,2,4].map(function(i){var v=Math.round(parseInt(x.substr(i,2),16)*(1-t)+parseInt(y.substr(i,2),16)*t);var s=v.toString(16);return s.length<2?'0'+s:s;});
    return '#'+r.join('');
  }
  var GKINDS=[['sensor-primary','Sensor: main channel'],['sensor-all','Sensor: all channels'],['device','Device, group or probe: sensors by priority']];
  var SAMPLE_JSON={objects:{'prtg-version':'26.3.124','treesize':3,channels:[
    {name:'Traffic In',info:{data:[{id:0,name:'Traffic In',primary:true,show:1,status:3,lastvalueraw:62.4,lastvalue:'62.4 Mbit/s',graphminraw:0,graphmaxraw:100,limitmode:1,limitminwarning:'',limitmaxwarning:70,limitminerror:'',limitmaxerror:90,averageraw:51,average:'51 Mbit/s'}]},minimum:0,maximum:100,condition:true,lastvalue:'62.4 Mbit/s'},
    {name:'Traffic Out',info:{data:[{id:1,name:'Traffic Out',primary:false,show:1,status:3,lastvalueraw:18.2,lastvalue:'18.2 Mbit/s',graphminraw:0,graphmaxraw:100,limitmode:0,limitminwarning:'',limitmaxwarning:'',limitminerror:'',limitmaxerror:''}]},minimum:0,maximum:100,condition:true,lastvalue:'18.2 Mbit/s'},
    {name:'Response Time',info:{data:[{id:2,name:'Response Time',primary:false,show:1,status:3,lastvalueraw:12,lastvalue:'12 msec',graphminraw:0,graphmaxraw:200,limitmode:1,limitminwarning:'',limitmaxwarning:100,limitminerror:'',limitmaxerror:150}]},minimum:0,maximum:200,condition:true,lastvalue:'12 msec'}
  ]}};
  function blankG(){
    return {type:'gauge',engine:'ring',cat:'Gauges',name:'Bandwidth gauge',fname:'',titleMode:'object',title:'',
      kind:'sensor-primary',small:false,prio:3,plgPrio:false,mapTags:true,reqTag:'',count:0,hideSettings:true,strip:'thin',scale:1,
      channel:'primary',channelName:'',rangeMode:'channel',min:0,max:100,limits:'channel',dir:'above',warn:70,err:90,
      shape:'ring',thick:14,style:'progress',colorMode:'status',needle:true,showMinMax:true,label:'channel',labelText:'',initW:300,initH:260,
      look:lookOf('Light card')};
  }
  function gaugeFromPreset(p){
    var G=blankG();
    G.engine='prtg';G.cat=p.cat;G.name=p.name+' custom';G.kind=p.kind;G.small=!!p.small;
    G.initW=0;G.initH=0;G.prio=(p.prio==null?3:p.prio);G.plgPrio=!!p.plgPrio;G.mapTags=!!p.mapTags;G.look=lookOf('PRTG default');
    return G;
  }
  function gEffLook(G){
    var L=G.look;
    if(L.mode==='prtg'&&G.engine==='ring'){var m=lookOf('Minimal');m.name='PRTG default';return m;}
    return L;
  }
  function gClassOf(G){return 'pgau_'+slugOf(G.name);}
  function titleRules(L,sel,bar){
    var c=[],col=bar?L.titleColor:(L.titleText||L.text);
    if(bar){
      c.push(sel+'{font-size:'+L.titleSize+'px;font-weight:500;letter-spacing:.4px;color:'+L.titleColor+';background:'+L.titleBg+';padding:10px 14px;margin:0;text-transform:none;'+(L.card?'border-radius:'+L.radius+'px '+L.radius+'px 0 0;':'')+'}');
    }else{
      var tt='font-size:'+L.titleSize+'px;font-weight:600;color:'+col+';text-transform:none;';
      if(L.titleStyle==='divider')tt+='padding:0 0 12px;margin:0 0 8px;border-bottom:1px solid '+L.line+';';
      else if(L.titleStyle==='accent')tt+='padding:2px 0 2px 10px;margin:0 0 12px;border-left:3px solid '+L.accent+';line-height:1.2;';
      else tt+='padding:0 0 10px;margin:0;';
      c.push(sel+'{'+tt+'}');
    }
    c.push(sel+','+sel+' *{color:'+col+' !important;}');
    return c;
  }
  function gFrameCss(G,cls,L){
    var r='.'+cls, c=[], bar=(L.titleStyle==='bar');
    var fillA=(L.cardA==null?100:L.cardA);
    var cardFill=(fillA<100)?tint(L.cardBg,fillA/100):L.cardBg;
    var root='font-family:'+familyStack(L.font)+';font-size:'+L.size+'px;color:'+L.text+';';
    /* no padding and no border on the object itself: see the note in tableCss */
    if(L.card){
      root+='background:'+cardFill+';border-radius:'+L.radius+'px;';
      if(L.bw>0)root+='outline:'+L.bw+'px solid '+L.border+';outline-offset:-'+L.bw+'px;';
      var sh=shadowOf(L);if(sh)root+='box-shadow:'+sh+';';
    }
    c.push(r+'{'+root+'}');
    var gb='box-sizing:border-box;';
    var ip=(bar?0:(L.cardPad||0))+((L.card&&L.bw>0)?L.bw:0);
    if(ip>0)gb+='padding:'+ip+'px;';
    if(G.engine==='ring')gb+='height:100%;display:flex;flex-direction:column;';
    c.push(r+' .gbox{'+gb+'}');
    titleRules(L,r+' .gtitle',bar).forEach(function(x){c.push(x);});
    return c;
  }
  function gaugeCssRing(G,cls,L){
    var r='.'+cls, c=gFrameCss(G,cls,L), bar=(L.titleStyle==='bar'), muted=(L.muted||L.headColor);
    c.push(r+' .gwrap{flex:1 1 auto;min-height:0;position:relative;'+(bar?'margin:10px 14px;':'')+'}');
    c.push(r+' .gsvg{position:absolute;left:0;top:0;width:100%;height:100%;display:block;overflow:visible;}');
    c.push(r+' .gsvg text{font-family:'+familyStack(L.font)+';}');
    c.push(r+' .gsvg .gv{fill:'+L.text+';font-weight:600;}');
    c.push(r+' .gsvg .gl{fill:'+muted+';}');
    c.push(r+' .gsvg .gm{fill:'+muted+';}');
    return c;
  }
  function gaugeCssPrtg(G,cls,L){
    var r='.'+cls, c=[], S=Number(G.scale)||1;
    var muted=(L.muted||L.headColor), bar=(L.titleStyle==='bar');
    var fillA=(L.cardA==null?100:L.cardA);
    var cardFill=(L.card)?((fillA<100)?tint(L.cardBg,fillA/100):L.cardBg):'#FFFFFF';
    if(L.mode!=='prtg'){
      c=gFrameCss(G,cls,L);
      c.push(r+' .prtg-plugin{'+(bar?'padding:10px 14px;':'')+'}');
      c.push(r+' .achannel{background:transparent !important;border-bottom:1px solid '+L.line+' !important;}');
      c.push(r+' .achannel,'+r+' .achannel>a{color:'+L.text+' !important;}');
      c.push(r+' .achannel .channelname,'+r+' .achannel .channelvalue{color:'+L.text+' !important;font-family:inherit !important;}');
      c.push(r+' .achannel .channelmessage,'+r+' .achannel .channelsubname{color:'+muted+' !important;font-family:inherit !important;}');
      var st=G.strip||'thin';
      if(st==='hide')c.push(r+' .achannel:before{display:none !important;}');
      else if(st==='thin')c.push(r+' .achannel:before{width:4px !important;border-radius:2px;}');
      if(st!=='keep')c.push(r+' .achannel .channelname,'+r+' .achannel .channelmessage,'+r+' .achannel .channelsubname,'+r+' .achannel .channelvalue{left:'+(st==='hide'?'6':'14')+'px !important;}');
      var sc={'3':L.c.up,'4':L.c.warning,'5':L.c.down,'14':L.c.down,'13':L.c.down,'10':L.c.unusual,'7':L.c.paused,'8':L.c.paused,'9':L.c.paused,'11':L.c.paused,'12':L.c.paused,'0':L.c.unknown,'1':L.c.unknown,'6':L.c.unknown};
      Object.keys(sc).forEach(function(k){c.push(r+' .achannel.status'+k+':before{background-color:'+sc[k]+' !important;}');});
      var track=blend(cardFill.charAt(0)==='#'?cardFill:'#FFFFFF',L.text,0.16);
      c.push(r+' .gauge .status0,'+r+' .gauge .status1,'+r+' .gauge .status2,'+r+' .gauge .status6{fill:'+track+';stroke:'+track+';}');
      c.push(r+' .gauge .status3{fill:'+L.c.up+';stroke:'+L.c.up+';}');
      c.push(r+' .gauge .status4{fill:'+L.c.warning+';stroke:'+L.c.warning+';}');
      c.push(r+' .gauge .status5,'+r+' .gauge .status13,'+r+' .gauge .status14{fill:'+L.c.down+';stroke:'+L.c.down+';}');
      c.push(r+' .gauge .status10{fill:'+L.c.unusual+';stroke:'+L.c.unusual+';}');
      c.push(r+' .gauge .status7,'+r+' .gauge .status8,'+r+' .gauge .status9,'+r+' .gauge .status11,'+r+' .gauge .status12{fill:'+L.c.paused+';stroke:'+L.c.paused+';}');
      c.push(r+' .gauge .needle{fill:'+L.text+';fill-opacity:.9;}');
      c.push(r+' .gauge .backgroundfill{fill:'+cardFill+';}');
      c.push(r+' .gauge text{fill:'+muted+' !important;}');
    }
    if(G.hideSettings!==false&&L.mode!=='prtg')c.push(r+' .channelsettings{display:none !important;}');
    if(S!==1)c.push(r+' .centered{zoom:'+S+';}');
    return c;
  }
  function gaugeCss(G,cls){
    var L=gEffLook(G);
    var c=(G.engine==='ring')?gaugeCssRing(G,cls,L):gaugeCssPrtg(G,cls,L);
    return c.join('\n');
  }
  /* the ring gauge's drawing code: shipped inside the generated file as its own source text */
  function ringRuntime(root,C){
    var NS='http://www.w3.org/2000/svg';
    var svg=root.querySelector('.gsvg');
    if(!svg)return;
    function el(tag,attrs,text){var e=document.createElementNS(NS,tag);for(var k in attrs){e.setAttribute(k,attrs[k]);}if(text!=null)e.textContent=text;return e;}
    function num(v){if(v===''||v===null||v===undefined)return null;var n=Number(v);return isNaN(n)?null:n;}
    function clear(){while(svg.firstChild)svg.removeChild(svg.firstChild);}
    function say(t){clear();svg.setAttribute('viewBox','0 0 200 100');svg.appendChild(el('text',{x:100,y:54,'text-anchor':'middle','class':'gl','font-size':12},t));root.setAttribute('data-gauge','message');}
    function fmt(n){if(n===null)return '';var a=Math.abs(n);if(a>=1000)return String(Math.round(n));return String(Math.round(n*10)/10);}
    function findJson(){
      var found=null;
      (function walk(node){
        for(var c=node.firstChild;c&&!found;c=c.nextSibling){
          if(c.nodeType===8){var t=(c.nodeValue||'').replace(/^\s+|\s+$/g,'');if(t.charAt(0)==='{'){found=t;return;}}
          else if(c.nodeType===1){walk(c);}
        }
      })(root);
      return found;
    }
    try{
      var raw=findJson();
      if(!raw){say('No gauge data');return;}
      var data=JSON.parse(raw), list=(data.objects&&data.objects.channels)||[];
      var i,ch=null,info=null;
      function infoOf(c){return (c.info&&c.info.data&&c.info.data[0])||null;}
      if(C.channel==='name'){
        var want=String(C.channelName||'').toLowerCase();
        for(i=0;i<list.length&&!ch;i++){var inf=infoOf(list[i]);if(String(list[i].name||(inf&&inf.name)||'').toLowerCase()===want)ch=list[i];}
        if(!ch){say('Channel not found');return;}
      }else{
        var pid=root.getAttribute('data-primarychannel');
        for(i=0;i<list.length&&!ch;i++){var i1=infoOf(list[i]);if(i1&&i1.primary)ch=list[i];}
        for(i=0;i<list.length&&!ch;i++){var i2=infoOf(list[i]);if(i2&&pid!==null&&pid!==''&&String(i2.id)===String(pid))ch=list[i];}
        for(i=0;i<list.length&&!ch;i++){var i3=infoOf(list[i]);if(i3&&i3.show!==0)ch=list[i];}
        if(!ch){say('No channel');return;}
      }
      info=infoOf(ch)||{};
      var val=num(info.lastvalueraw), txt=ch.lastvalue||info.lastvalue||'', status=Number(info.status);
      var min=null,max=null;
      if(C.rangeMode!=='manual'){min=num(info.graphminraw);max=num(info.graphmaxraw);}
      if(min===null||max===null||max<=min){min=C.min;max=C.max;}
      if(max<=min)max=min+1;
      var lim={wl:null,wh:null,el:null,eh:null};
      if(C.limits==='channel'&&info.limitmode){lim.wl=num(info.limitminwarning);lim.wh=num(info.limitmaxwarning);lim.el=num(info.limitminerror);lim.eh=num(info.limitmaxerror);}
      else if(C.limits==='manual'){if(C.dir==='below'){lim.wl=C.warn;lim.el=C.err;}else{lim.wh=C.warn;lim.eh=C.err;}}
      var K=C.colors, hasVal=(val!==null);
      var pausedSt=(status===7||status===8||status===9||status===11||status===12), unknownSt=(status===0||status===1||status===2||status===6);
      var color=C.accent;
      if(C.colorMode!=='accent'){
        color=K.up;
        if(hasVal){
          if((lim.eh!==null&&val>=lim.eh)||(lim.el!==null&&val<=lim.el))color=K.down;
          else if((lim.wh!==null&&val>=lim.wh)||(lim.wl!==null&&val<=lim.wl))color=K.warning;
        }
        if(status===5||status===13||status===14)color=K.down;
        else if(status===4)color=K.warning;
        else if(status===10)color=K.unusual;
      }
      var dead=(!hasVal)||pausedSt||unknownSt;
      if(dead)color=pausedSt?K.paused:K.unknown;
      var ring=(C.shape!=='half'), start=ring?135:180, sweep=ring?270:180;
      var needleOn=(C.style==='zones'&&C.needle&&!dead&&hasVal);
      var cx=100, r=78, sw=C.thick, pad=Math.max(0,(sw-14)/2), cy=ring?100:92+pad;
      function pt(a,rr){var t=a*Math.PI/180;return [cx+rr*Math.cos(t),cy+rr*Math.sin(t)];}
      function arc(a0,a1,col,w,cap){
        if(a1-a0<0.3)return null;
        var p0=pt(a0,r),p1=pt(a1,r);
        return el('path',{d:'M '+p0[0].toFixed(2)+' '+p0[1].toFixed(2)+' A '+r+' '+r+' 0 '+((a1-a0)>180?1:0)+' 1 '+p1[0].toFixed(2)+' '+p1[1].toFixed(2),fill:'none',stroke:col,'stroke-width':w,'stroke-linecap':cap||'butt'});
      }
      function ang(v){var f=(v-min)/(max-min);f=f<0?0:(f>1?1:f);return start+sweep*f;}
      clear();
      svg.setAttribute('viewBox','0 0 200 '+((ring?184:(needleOn?152:124))+pad));
      svg.setAttribute('preserveAspectRatio','xMidYMid meet');
      var track=el('path',{d:'M '+pt(start,r)[0].toFixed(2)+' '+pt(start,r)[1].toFixed(2)+' A '+r+' '+r+' 0 '+(sweep>180?1:0)+' 1 '+pt(start+sweep,r)[0].toFixed(2)+' '+pt(start+sweep,r)[1].toFixed(2),fill:'none',stroke:C.track,'stroke-width':sw,'stroke-linecap':C.style==='progress'?'round':'butt'});
      svg.appendChild(track);
      if(C.style==='zones'&&!dead){
        var zs=[[min,max,K.up]];
        function zone(a,b,col){if(a===null||b===null)return;a=Math.max(min,a);b=Math.min(max,b);if(b>a)zs.push([a,b,col]);}
        zone(min,lim.wl,K.warning);zone(lim.wh,max,K.warning);zone(min,lim.el,K.down);zone(lim.eh,max,K.down);
        zs.forEach(function(z){var a=arc(ang(z[0]),ang(z[1]),z[2],sw,'butt');if(a)svg.appendChild(a);});
        if(C.needle&&hasVal){
          var tip=pt(ang(val),r-sw/2-4), hub=el('line',{x1:cx,y1:cy,x2:tip[0].toFixed(2),y2:tip[1].toFixed(2),stroke:C.needleColor,'stroke-width':3,'stroke-linecap':'round'});
          svg.appendChild(hub);svg.appendChild(el('circle',{cx:cx,cy:cy,r:6,fill:C.needleColor}));
        }
      }else if(!dead){
        var a=arc(start,ang(val)<=start+0.3?start+0.3:ang(val),color,sw,'round');
        if(a)svg.appendChild(a);
      }
      var shown=(pausedSt||unknownSt)?'–':(txt||'–');
      var len=Math.max(1,String(shown).length), fs=Math.max(14,Math.min(needleOn?28:34,(needleOn?100:115)/(0.56*len)));
      var vy, ly;
      if(ring){vy=needleOn?cy+40:cy+(fs*0.34);ly=needleOn?vy+18:vy+20;}
      else{vy=needleOn?cy+30+fs*0.3:cy-4;ly=needleOn?vy+16:cy+16;}
      svg.appendChild(el('text',{x:cx,y:vy.toFixed(1),'text-anchor':'middle','class':'gv','font-size':fs.toFixed(1)},shown));
      var label=(C.label==='none')?'':(C.label==='custom'?C.labelText:(info.name||ch.name||''));
      if(label)svg.appendChild(el('text',{x:cx,y:ly.toFixed(1),'text-anchor':'middle','class':'gl','font-size':12},label));
      if(C.showMinMax&&!dead){
        var s0=pt(start,r), s1=pt(start+sweep,r), dy=sw/2+14;
        svg.appendChild(el('text',{x:(s0[0]+(ring?6:0)).toFixed(1),y:(s0[1]+dy).toFixed(1),'text-anchor':'middle','class':'gm','font-size':11},fmt(min)));
        svg.appendChild(el('text',{x:(s1[0]-(ring?6:0)).toFixed(1),y:(s1[1]+dy).toFixed(1),'text-anchor':'middle','class':'gm','font-size':11},fmt(max)));
      }
      root.setAttribute('data-gauge','ok');
    }catch(err){
      say('Gauge data unavailable');
      if(window.console&&console.warn)console.warn('ring gauge:',err);
    }
  }
  function ringConfig(G,L){
    var track=blend(L.card?L.cardBg:'#FFFFFF',L.text,0.16);
    return {channel:G.channel,channelName:String(G.channelName||'').replace(/["<>\\]/g,''),rangeMode:G.rangeMode,
      min:Number(G.min)||0,max:(Number(G.max)===0&&Number(G.min)===0)?100:Number(G.max),limits:G.limits,dir:G.dir,warn:Number(G.warn)||0,err:Number(G.err)||0,
      shape:G.shape,thick:Math.max(4,Math.min(40,Number(G.thick)||14)),style:G.style,colorMode:G.colorMode,needle:!!G.needle,showMinMax:!!G.showMinMax,
      label:G.label,labelText:String(G.labelText||'').replace(/["<>\\]/g,''),
      colors:{up:L.c.up,warning:L.c.warning,down:L.c.down,unusual:L.c.unusual,paused:L.c.paused,unknown:L.c.unknown},
      accent:L.accent,track:track,needleColor:L.text};
  }
  function gaugeScript(G,cls){
    if(G.engine!=='ring')return '';
    var L=gEffLook(G), cfg=ringConfig(G,L);
    return '(function(){\n  var root=document.getElementById("<@itemid>");\n  if(!root)return;\n  var CFG='+JSON.stringify(cfg)+';\n  ('+ringRuntime.toString()+')(root,CFG);\n})();';
  }
  function gaugeFileName(G){return fileNameOf(G);}
  function buildGauge(G){
    var cls=gClassOf(G), css=gaugeCss(G,cls), js=gaugeScript(G,cls), L=gEffLook(G);
    var ring=(G.engine==='ring'), styled=(G.look.mode!=='prtg')||ring, o=[];
    var check=(!ring&&G.kind==='device')?'probenode,group,device':'sensor';
    var useCls=!!css;
    o.push('<!'+'--'+clean(G.cat||'Gauges')+': '+clean(G.name||'Gauge')+'-->');
    o.push('');
    o.push('<div class="map_object map_table'+(useCls?' '+cls:'')+' <#sensor type="colorclassofstate" prefix="map_objectstate_" id="<@objectid>">" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+initAttr(G)+(ring?' data-primarychannel=\'<#objectproperty name="primarychannel" show="number" id="<@objectid>">\'':'')+' style="overflow:hidden;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('<#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('<#mapobject type="htmlbefore" subid="<@subid>">');
    o.push('<#checkobjecttype objecttype="'+check+'" nicemessage="true" id="<@objectid>">');
    if(css){
      if(needsFontLink(L))o.push(fontLinkOf(L));
      o.push('<style>');o.push(css);o.push('</style>');
    }
    var wrapBox=(!!css)&&(ring||G.look.mode!=='prtg');
    if(wrapBox)o.push('  <div class="gbox">');
    var tm=G.titleMode||'object';
    if(tm!=='none'){
      var inner=(tm==='custom')?clean(G.title):'<#objectproperty name="Name" id="<@objectid>">';
      o.push('  <p'+((styled&&useCls)?' class="gtitle"':'')+'><b>'+inner+'</b></p>');
    }
    var json=function(content,sortby,columns,extra){
      var j=[];
      j.push('    <!'+'--');
      j.push('    {');
      j.push('      "objects":<#table');
      j.push('      id="<@objectid>"');
      j.push("      output='json'");
      j.push("      noraw='1'");
      j.push("      content='"+content+"'");
      j.push("      sortby='"+sortby+"'");
      (extra||[]).forEach(function(x){j.push('      '+x);});
      j.push("      columns='"+columns+"'>");
      j.push('    }');
      j.push('    -->');
      return j;
    };
    var chCols='name,info=treejson,minimum,maximum,condition,lastvalue';
    if(ring){
      o.push('  <div class="gwrap">');
      o.push('    <svg class="gsvg" preserveAspectRatio="xMidYMid meet"></svg>');
      json('channels','name',chCols).forEach(function(l){o.push(l);});
      o.push('  </div>');
    }else{
      var dev=(G.kind==='device'), mv='';
      if(G.kind==='sensor-primary')mv=G.small?'small primaryonly':'primaryonly';
      else if(G.kind==='sensor-all')mv=G.small?'small':'true';
      else mv=G.small?'small':'';
      var prio='@above('+Math.max(0,Math.min(4,parseInt(G.prio,10)||0))+')';
      o.push('\t<div id="Plugin_<@itemid>"');
      o.push('    class="prtg-plugin'+(dev?' deviceoverviewsensorvalues':'')+'"');
      o.push('    data-plugin="channelgauges"');
      o.push('    data-objectid="<@objectid>"');
      if(!dev)o.push('    data-primarychannel=\'<#objectproperty name="primarychannel" show="number" id="<@objectid>">\'');
      o.push('    data-type="'+(dev?'sensors':'channels')+'"');
      if(mv)o.push('    data-mapview="'+mv+'"');
      if(dev&&G.plgPrio)o.push("    data-filterpriority='"+prio+"'");
      o.push('    data-mapobj="true">');
      if(dev){
        var ex=[];
        var n=parseInt(G.count,10);
        ex.push("count='"+(n>0?Math.min(n,500):'*')+"'");
        ex.push("filter_priority='"+prio+"'");
        tagFilters(G).forEach(function(tf){ex.push('filter_tags="'+tf+'"');});
        json('sensors','-position',"objid,position=treejson,sensor=textraw,info=treejson,minimum,maximum,lastvalue_,status=textraw,priority=raw,message=treejson",ex).forEach(function(l){o.push(l);});
      }else{
        json('channels','name',chCols).forEach(function(l){o.push(l);});
      }
      o.push('\t</div>');
    }
    if(wrapBox)o.push('  </div>');
    o.push('<#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    if(js){o.push('');o.push('<scr'+'ipt>');o.push(js);o.push('<\/script>');}
    return o.join('\n')+'\n';
  }

  function lum(h){h=String(h).replace('#','');var c=[0,2,4].map(function(i){var v=parseInt(h.substr(i,2),16)/255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];}

  /* ====================== graphs ====================== */
  var GPERIODS=[[0,'Live data'],[1,'Last 2 days'],[2,'Last 30 days'],[3,'Last 365 days']];
  var GRKINDS=[['sensor','Graph of a sensor'],['sensors','Graphs of every sensor on a device, group or probe'],['toplist','Toplist of a sensor']];
  function periodTag(p){return p===0?'<#lang key="html.sensor.livwdata" default="Live Data">':'<#system type="'+(p+1)+'period">';}
  function blankGR(){
    return {type:'graph',kind:'sensor',cat:'Graphs',name:'Sensor graph',fname:'',period:0,fontSize:12,legend:true,axis:true,tooltips:false,check:true,extra:[],
      layout:'card',titleMode:'object',title:'',invert:'auto',tileW:336,tileH:175,mapTags:true,initW:520,initH:300,look:lookOf('Light card')};
  }
  function graphFromPreset(p){
    var G=blankGR();
    G.kind=p.kind;G.cat=p.cat;G.name=p.name+' custom';G.period=p.period||0;G.check=!!p.check;G.look=lookOf('PRTG default');G.initW=0;G.initH=0;G.layout='edge';G.tooltips=true;
    if(p.kind==='sensor'){G.fontSize=p.fontSize;G.legend=!!p.legend;G.axis=!!p.axis;G.tooltips=!!p.tooltips;G.titleMode='none';}
    if(p.kind==='sensors'){G.tileW=p.tileW;G.tileH=p.tileH;G.mapTags=!!p.mapTags;G.titleMode='stock';G.layout='card';}
    if(p.kind==='toplist')G.titleMode='none';
    return G;
  }
  function grClassOf(G){return 'pgr_'+slugOf(G.name);}
  function grInvert(G,L){
    if(L.mode==='prtg'||!L.card)return false;
    if(G.invert==='always')return true;
    if(G.invert==='never')return false;
    return lum(L.cardBg)<0.3;
  }
  function grRoot(L,bg){
    var root='font-family:'+familyStack(L.font)+';font-size:'+L.size+'px;color:'+L.text+';';
    if(L.card){
      root+='background:'+bg+';border-radius:'+L.radius+'px;';
      if(L.bw>0)root+='outline:'+L.bw+'px solid '+L.border+';outline-offset:-'+L.bw+'px;';
      var sh=shadowOf(L);if(sh)root+='box-shadow:'+sh+';';
    }
    return root;
  }
  function graphCss(G,cls){
    var L=G.look;if(L.mode==='prtg')return '';
    var r='.'+cls, c=[], bar=(L.titleStyle==='bar'), inv=grInvert(G,L), muted=(L.muted||L.headColor);
    var fillA=(L.cardA==null?100:L.cardA), cardFill=(fillA<100)?tint(L.cardBg,fillA/100):L.cardBg;
    var ip=(bar?0:(L.cardPad||0))+((L.card&&L.bw>0)?L.bw:0);
    var filt='filter:invert(1) hue-rotate(180deg);mix-blend-mode:screen;';
    if(G.kind==='toplist'){c.push(r+'{'+grRoot(L,cardFill)+'}');return c.join('\n');}
    if(G.kind==='sensors'){
      var panel=(L.card&&fillA>=100)?blend(L.cardBg,L.stage||(lum(L.cardBg)>0.5?'#EDF0F4':'#0F172A'),0.55):cardFill;
      c.push(r+'{'+grRoot(L,panel)+'}');
      c.push(r+' .gbox{box-sizing:border-box;'+(ip>0?'padding:'+ip+'px;':'')+'}');
      titleRules(L,r+' .gtitle',bar).forEach(function(x){c.push(x);});
      var sh=shadowOf(L);
      c.push(r+' .sensorgraphs .achannel{background:'+cardFill+' !important;box-shadow:'+(sh||'none')+' !important;border-radius:'+L.radius+'px;overflow:hidden;'+((L.card&&L.bw>0)?'outline:'+L.bw+'px solid '+L.border+';outline-offset:-'+L.bw+'px;':'')+'}');
      c.push(r+' .sensorgraphs .achannel:before{display:none !important;}');
      c.push(r+' .sensorgraphs .achannel .channelname{color:'+L.text+' !important;font-family:inherit !important;}');
      c.push(r+' .sensorgraphs .achannel .chartlegend,'+r+' .sensorgraphs .achannel .chartlegend *{color:'+muted+' !important;}');
      if(inv)c.push(r+' .sensorgraphs .achannel img{'+filt+'}');
      return c.join('\n');
    }
    c.push(r+'{'+grRoot(L,cardFill)+'}');
    if(G.layout==='card'){
      var gb='box-sizing:border-box;height:100%;display:flex;flex-direction:column;'+(ip>0?'padding:'+ip+'px;':'');
      c.push(r+' .gbox{'+gb+'}');
      titleRules(L,r+' .gtitle',bar).forEach(function(x){c.push(x);});
      c.push(r+' .ggraph{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;'+(bar?'margin:10px 14px;':'')+'}');
      c.push(r+' .ggraph img{display:block;max-width:100%;max-height:100%;width:100% !important;height:100% !important;object-fit:contain;'+(inv?filt:'')+'}');
    }else{
      c.push(r+' img{display:block;width:100% !important;height:100% !important;object-fit:contain;'+(inv?filt:'')+'}');
    }
    return c.join('\n');
  }
  function grExtra(G){
    var out='';
    (G.extra||[]).forEach(function(line){
      var m=/^\s*([A-Za-z_]+)\s*=\s*"([^"<>\n]*)"\s*$/.exec(line);
      if(m&&!/^(type|id|graphid|width|height|tooltexts|graphstyling)$/i.test(m[1]))out+=' '+m[1]+'="'+m[2]+'"';
    });
    return out;
  }
  function graphTitleHtml(G,stockText){
    var tm=G.titleMode||'object';
    if(tm==='none')return '';
    if(tm==='custom')return clean(G.title);
    if(tm==='stock'&&stockText)return stockText;
    return '<#objectproperty name="Name" id="<@objectid>">';
  }
  function buildGraph(G){
    var cls=grClassOf(G), css=graphCss(G,cls), L=G.look, styled=!!css, o=[], kind=G.kind;
    var init=initAttr(G), card=(styled&&G.layout==='card');
    o.push('<!'+'--'+clean(G.cat||'Graphs')+': '+clean(G.name||'Graph')+'-->');
    o.push('');
    var styleBlock=function(){if(styled){if(needsFontLink(L))o.push(fontLinkOf(L));o.push('<style>');o.push(css);o.push('</style>');}};
    if(kind==='toplist'){
      o.push('<style>');o.push('.preview .toplist-mapobject,');o.push('.preview .toplist-mapobject .toplistgraph{');o.push('\twidth: 176px;');o.push('\theight: 176px;');o.push('}');o.push('</style>');
      o.push('<div class="map_object map_table toplist-mapobject'+(styled?' '+cls:'')+'" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+init+' style="overflow:hidden;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
      o.push('<#mapobject type="objectgrip" mode="<@editmode>">');
      o.push('<#mapobject type="htmlbefore" subid="<@subid>">');
      o.push('<#checkobjecttype objecttype="sensor" nicemessage="true" id="<@objectid>">');
      styleBlock();
      o.push('');
      o.push('  <div id ="Toplist_<@itemid>"');
      o.push('    class="prtg-plugin toplistgraph"');
      o.push('    data-plugin="toplist"');
      o.push('    style="overflow:hidden;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">"');
      o.push('      data-objectid="<@objectid>"');
      o.push('      data-topnumber="live"');
      o.push('      data-nonrefreshable=true>');
      o.push('<!'+'--');
      o.push('      {"objects":<#table');
      o.push("        id='<@objectid>'");
      o.push('        _subid="default"');
      o.push("        count='*'");
      o.push("        usecaption='true'");
      o.push("        noraw='1'");
      o.push("        output='json'");
      o.push("        topnumber='live'");
      o.push("        content='topdata'");
      o.push("        columns='position=oftTextRaw,value_=treejson'");
      o.push("        sortby='-value_2V'>");
      o.push('      }');
      o.push('-->');
      o.push('  </div>');
      o.push('  <#mapobject type="htmlafter" subid="<@subid>">');
      o.push('');
      o.push('</div>');
      return o.join('\n')+'\n';
    }
    if(kind==='sensors'){
      var per=periodTag(G.period), stockTitle='Graphs of <#objectproperty name="Name" id="<@objectid>"> ('+per+')';
      o.push('<div class="map_object map_table reaload_wo_params'+(styled?' '+cls:'')+'" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+init+' style="overflow:auto;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
      o.push('  <#mapobject type="objectgrip" mode="<@editmode>">');
      o.push('  <#mapobject type="htmlbefore" subid="<@subid>">');
      o.push('  <#checkobjecttype id="<@objectid>" objecttype="sensor,device,group,probenode" nicemessage="true">');
      styleBlock();
      if(styled)o.push('  <div class="gbox">');
      var tt=graphTitleHtml(G,stockTitle);
      if(tt)o.push(styled?'  <div class="gtitle"><b>'+tt+'</b></div>':'  <b>'+tt+'</b>');
      o.push('  <div class="sensorgraphs">');
      o.push('    <#selectionlist');
      o.push('    id="<@objectid>"');
      o.push('    content="sensorgraphs"');
      o.push('    width="'+Math.max(100,Math.min(1200,parseInt(G.tileW,10)||336))+'"');
      o.push('    height="'+Math.max(60,Math.min(800,parseInt(G.tileH,10)||175))+'"');
      o.push('    graphid="'+G.period+'"');
      if(G.mapTags)o.push('    filter_tags="<@tagfilterstring>"');
      o.push("    styling='refreshable=false'");
      o.push('    >');
      o.push('  </div>');
      if(styled)o.push('  </div>');
      o.push('');
      o.push('  <#mapobject type="htmlafter" subid="<@subid>">');
      o.push('  <br style="clear:both">');
      o.push('</div>');
      return o.join('\n')+'\n';
    }
    /* a single sensor graph */
    o.push('<div class="map_object map_graph'+(styled?' '+cls:'')+'" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+init+' style="'+(styled?'overflow:hidden;':'')+'<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('<#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('<#mapobject type="htmlbefore" subid="<@subid>">');
    if(G.check)o.push('<#checkobjecttype objecttype="sensor" nicemessage="true" id="<@objectid>">');
    styleBlock();
    o.push('');
    var sty="baseFontSize='"+Math.max(0,Math.min(40,parseInt(G.fontSize,10)||0))+"'%20showLegend='"+(G.legend?1:0)+"'"+(G.axis?'':"%20showAxis='0'");
    var tag='<#object type="graph" id="<@objectid>" graphid="'+G.period+'" width="<@width>" height="<@height>" tooltexts="'+(G.tooltips?1:0)+'" graphstyling="'+sty+'"'+grExtra(G)+' >';
    if(card){
      o.push('  <div class="gbox">');
      var gt=graphTitleHtml(G,'');
      if(gt)o.push('    <div class="gtitle">'+gt+'</div>');
      o.push('    <div class="ggraph">');
      o.push('      '+tag);
      o.push('    </div>');
      o.push('  </div>');
    }else{
      o.push('  '+tag);
    }
    o.push('<#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    return o.join('\n')+'\n';
  }

  /* ====================== donuts ====================== */
  var DSTATES=[['down','Down'],['warning','Warning'],['unusual','Unusual'],['up','Up'],['paused','Paused'],['unknown','Unknown']];
  var DALARM={down:1,warning:1,unusual:1};
  var DENGINES=[['ring','Ring donut: drawn by the tool, follows the look'],['prtg','PRTG donut: PRTG\u2019s own include, restyled around it']];
  var DLEGENDS=[['right','Right of the ring'],['below','Below the ring'],['none','No legend']];
  var DCENTERS=[['total','Number of sensors shown'],['percentup','Percent of sensors that are up'],['none','Nothing']];
  /* ====================== status counts: tiles of sensors by status ====================== */
  var SKEYS=[['up','Up'],['warning','Warning'],['down','Down'],['paused','Paused'],['unusual','Unusual'],['unknown','Unknown'],['total','Total'],['pctup','% Up']];
  var SPRESETS=[
    {id:'status',name:'Sensor status',tiles:['up','warning','down','paused'],reqTag:'',nameHas:'',cap:'of'},
    {id:'interfaces',name:'Interfaces',tiles:['up','down','total'],reqTag:'bandwidthsensor',nameHas:'',cap:'of'},
    {id:'availability',name:'Availability',tiles:['pctup'],reqTag:'',nameHas:'',cap:'of'}
  ];
  function blankSC(){
    return {type:'status',cat:'Status Counts',name:'Sensor status',fname:'',titleMode:'object',title:'',sub:'',tiles:['up','warning','down','paused'],quiet:true,cap:'of',
      mapTags:true,reqTag:'',nameHas:'',initW:420,initH:200,look:lookOf('Light card')};
  }
  function statusFromPreset(id){
    var S=blankSC(), p=null;
    SPRESETS.forEach(function(x){if(x.id===id)p=x;});
    if(p){S.name=p.name;S.tiles=p.tiles.slice();S.reqTag=p.reqTag;S.nameHas=p.nameHas;S.cap=p.cap;S.sub=(p.id==='interfaces')?'Interface sensors':'';}
    return S;
  }
  function blankD(){
    return {type:'donut',engine:'ring',cat:'Donuts',name:'Sensor states donut',fname:'',titleMode:'object',title:'',
      mode:'all',center:'total',caption:'',thick:28,gap:2,legend:'right',hideZero:true,showCounts:true,mapTags:true,reqTag:'',
      light:false,withName:false,initW:340,initH:220,look:lookOf('Light card')};
  }
  function donutFromPreset(p){
    var D=blankD();
    D.engine='prtg';D.cat=p.cat;D.name=p.name+' custom';D.mode=p.alarms?'alarms':'all';D.light=!!p.light;D.withName=!!p.withName;D.noInitH=!!p.noInitH;   /* PRTG's own donut_alarms_font-light.htm has no initialheight; kept as shipped */
    D.initW=0;D.initH=0;D.look=lookOf('PRTG default');
    return D;
  }
  function dEffLook(D){
    var L=D.look;
    if(L.mode==='prtg'&&D.engine==='ring'){var m=lookOf('Minimal');m.name='PRTG default';return m;}
    return L;
  }
  function dClassOf(D){return 'pdn_'+slugOf(D.name);}
  function dDark(L){return !!L.card&&lum(L.cardBg)<0.35;}
  /* the looks give Unusual the same color as Warning, and Paused nearly the same as Unknown. Two neighbouring slices must be told apart,
     so the donut derives an orange between warning and down for Unusual, and moves Unknown from the paused color toward the text color */
  function donutPalette(L){
    var c=L.c;
    return {down:c.down,warning:c.warning,unusual:blend(c.warning,c.down,0.5),up:c.up,paused:c.paused,unknown:blend(c.paused,L.text,0.5)};
  }
  function donutCssRing(D,cls,L){
    var r='.'+cls, c=gFrameCss({engine:'ring'},cls,L), bar=(L.titleStyle==='bar'), muted=(L.muted||L.headColor);
    var fillA=(L.cardA==null?100:L.cardA), cardFill=(L.card)?((fillA<100)?tint(L.cardBg,fillA/100):L.cardBg):'#FFFFFF';
    var track=blend(cardFill.charAt(0)==='#'?cardFill:'#FFFFFF',L.text,0.14), P=donutPalette(L);
    c.push(r+' .dbody{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;gap:18px;'+(bar?'margin:10px 14px;':'')+'}');
    c.push(r+' .dbody.lg-below{flex-direction:column;gap:10px;}');
    c.push(r+' .dbody.lg-none .dlegend{display:none;}');
    c.push(r+' .dsvgwrap{flex:1 1 0;min-width:0;min-height:0;align-self:stretch;position:relative;}');
    c.push(r+' .dbody.lg-below .dsvgwrap{width:100%;}');
    c.push(r+' .dsvg{position:absolute;left:0;top:0;width:100%;height:100%;display:block;overflow:visible;}');
    c.push(r+' .dsvg text{font-family:'+familyStack(L.font)+';}');
    c.push(r+' .dsvg .dv{fill:'+L.text+';font-weight:600;}');
    c.push(r+' .dsvg .dl{fill:'+muted+';}');
    c.push(r+' .dsvg .dtrack{fill:none;stroke:'+track+';}');
    DSTATES.forEach(function(s){c.push(r+' .dsvg .c-'+s[0]+'{fill:none;stroke:'+P[s[0]]+';}');});
    c.push(r+' .dlegend{flex:0 0 auto;display:flex;flex-direction:column;gap:7px;max-width:48%;}');
    c.push(r+' .dbody.lg-below .dlegend{flex-direction:row;flex-wrap:wrap;justify-content:center;gap:6px 16px;max-width:100%;}');
    c.push(r+' .dli{display:flex;align-items:center;gap:8px;white-space:nowrap;color:'+L.text+';}');
    c.push(r+' .dli i{display:block;width:10px;height:10px;border-radius:50%;flex:0 0 auto;}');
    DSTATES.forEach(function(s){c.push(r+' .dli .c-'+s[0]+'{background:'+P[s[0]]+';}');});
    c.push(r+' .dli span{color:'+muted+';}');
    c.push(r+' .dli b{font-weight:600;color:'+L.text+';margin-left:auto;padding-left:10px;}');
    c.push(r+' .dnone{color:'+muted+';}');
    return c;
  }
  function donutCssPrtg(D,cls,L){
    var r='.'+cls, bar=(L.titleStyle==='bar'), muted=(L.muted||L.headColor);
    if(L.mode==='prtg')return [];
    var c=gFrameCss({engine:'ring'},cls,L);
    c.push(r+' .map_donutwrapper{flex:1 1 auto;min-height:0;height:auto !important;'+(bar?'margin:10px 14px;':'')+'}');
    c.push(r+' .map_donutwrapper .donutext{fill:'+L.text+' !important;}');
    c.push(r+' .map_donutwrapper .donutlabel{color:'+muted+' !important;}');
    c.push(r+' .map_donutwrapper .value-name-list,'+r+' .map_donutwrapper .value-name-list a.value-name-list_item{color:'+muted+' !important;}');
    c.push(r+' .map_donutwrapper .value-name-list .value{color:'+L.text+' !important;}');
    c.push(r+' .map_donutwrapper .value-name-list a.value-name-list_item:hover{color:'+L.accent+' !important;}');
    return c;
  }
  function donutCss(D,cls){
    var L=dEffLook(D);
    return ((D.engine==='ring')?donutCssRing(D,cls,L):donutCssPrtg(D,cls,L)).join('\n');
  }
  /* the ring donut's drawing code: shipped inside the generated file as its own source text */
  function donutRuntime(root,C){
    var NS='http://www.w3.org/2000/svg';
    var svg=root.querySelector('.dsvg'), legend=root.querySelector('.dlegend');
    if(!svg)return;
    var ORDER=[['down','Down'],['warning','Warning'],['unusual','Unusual'],['up','Up'],['paused','Paused'],['unknown','Unknown']];
    var ALARM={down:1,warning:1,unusual:1};
    function el(tag,attrs,text){var e=document.createElementNS(NS,tag);for(var k in attrs){e.setAttribute(k,attrs[k]);}if(text!=null)e.textContent=text;return e;}
    function clear(n){while(n&&n.firstChild)n.removeChild(n.firstChild);}
    function say(t){clear(svg);clear(legend);svg.setAttribute('viewBox','0 0 100 100');svg.appendChild(el('text',{x:50,y:52,'text-anchor':'middle','class':'dl','font-size':6},t));root.setAttribute('data-donut','message');}
    function findJson(){
      var found=null;
      (function walk(node){
        for(var c=node.firstChild;c&&!found;c=c.nextSibling){
          if(c.nodeType===8){var t=(c.nodeValue||'').replace(/^\s+|\s+$/g,'');if(t.charAt(0)==='{'){found=t;return;}}
          else if(c.nodeType===1){walk(c);}
        }
      })(root);
      return found;
    }
    function classify(s){
      if(!s||typeof s!=='object')return null;
      var v=(s.status_raw!==undefined&&s.status_raw!==null)?s.status_raw:s.status, n=null;
      if(typeof v==='number')n=v;
      else if(typeof v==='string'&&/^\s*\d+\s*$/.test(v))n=parseInt(v,10);
      if(n!==null){
        if(n===3)return 'up';
        if(n===4)return 'warning';
        if(n===10)return 'unusual';
        if(n===5||n===13||n===14)return 'down';
        if(n===7||n===8||n===9||n===11||n===12)return 'paused';
        return 'unknown';
      }
      if(typeof v==='string'){
        var t=v.replace(/<[^>]*>/g,'').toLowerCase().replace(/^\s+|\s+$/g,'');
        if(t.indexOf('unusual')===0)return 'unusual';
        if(t.indexOf('unknown')===0)return 'unknown';
        if(t.indexOf('up')===0)return 'up';
        if(t.indexOf('warn')===0)return 'warning';
        if(t.indexOf('down')===0)return 'down';
        if(t.indexOf('pause')===0)return 'paused';
      }
      return null;
    }
    function polar(a,r){var t=(a-90)*Math.PI/180;return [50+r*Math.cos(t),50+r*Math.sin(t)];}
    try{
      var raw=findJson();
      if(!raw){say('No sensor data');return;}
      var data=JSON.parse(raw), box=(data&&data.objects)?data.objects:data;
      var list=box&&box.sensors;
      if(!list||typeof list.length!=='number'){say('No sensor data');return;}
      var counts={down:0,warning:0,unusual:0,up:0,paused:0,unknown:0}, parsed=0, i;
      for(i=0;i<list.length;i++){var k=classify(list[i]);if(k){counts[k]++;parsed++;}}
      if(list.length>0&&parsed===0){say('Could not read sensor states');return;}
      var alarms=(C.mode==='alarms'), shown=[], total=0;
      ORDER.forEach(function(o){if(alarms&&!ALARM[o[0]])return;shown.push([o[0],o[1],counts[o[0]]]);total+=counts[o[0]];});
      var R=46, t=Math.max(8,Math.min(60,Number(C.thick)||28)), sw=R*t/100, rm=R-sw/2, ri=R-sw;
      clear(svg);svg.setAttribute('viewBox','0 0 100 100');
      svg.setAttribute('role','img');
      svg.appendChild(el('circle',{cx:50,cy:50,r:rm,'stroke-width':sw,'class':'dtrack'}));
      var visible=shown.filter(function(s){return s[2]>0;}), gap=Math.max(0,Math.min(10,Number(C.gap)||0));
      if(total>0){
        var a=0;
        visible.forEach(function(s){
          var span=360*s[2]/total, pct=Math.round(1000*s[2]/total)/10, node;
          if(visible.length===1){node=el('circle',{cx:50,cy:50,r:rm,'stroke-width':sw,'class':'c-'+s[0]});}
          else{
            var g=Math.min(gap,span*0.6), a0=a+g/2, a1=a+span-g/2, p0=polar(a0,rm), p1=polar(a1,rm);
            node=el('path',{d:'M'+p0[0].toFixed(3)+' '+p0[1].toFixed(3)+' A'+rm.toFixed(3)+' '+rm.toFixed(3)+' 0 '+((a1-a0)>180?1:0)+' 1 '+p1[0].toFixed(3)+' '+p1[1].toFixed(3),'stroke-width':sw,'class':'c-'+s[0]});
          }
          node.appendChild(el('title',{},s[1]+': '+s[2]+' ('+pct+'%)'));
          svg.appendChild(node);
          a+=span;
        });
      }else if(alarms&&parsed>0){
        svg.appendChild(el('circle',{cx:50,cy:50,r:rm,'stroke-width':sw,'class':'c-up'}));
      }
      var value,caption=String(C.caption||'');
      if(C.center==='none'){value=null;}
      else if(C.center==='percentup'){value=parsed>0?Math.round(100*counts.up/parsed)+'%':'\u2013';if(!caption)caption='up';}
      else{value=(alarms?(total>0||parsed>0):parsed>0)?String(total):'\u2013';if(!caption)caption=alarms?'alarms':'sensors';}
      if(value!==null){
        var digits=value.length, fsv=Math.min(ri*0.62,ri*1.5/Math.max(2,digits)), fsc=Math.max(3.2,ri*0.19), showCap=!!caption&&ri>13;
        var blockH=fsv*0.72+(showCap?fsc*1.5:0), vy=50-blockH/2+fsv*0.72;
        svg.appendChild(el('text',{x:50,y:vy.toFixed(2),'text-anchor':'middle','class':'dv','font-size':fsv.toFixed(2)},value));
        if(showCap)svg.appendChild(el('text',{x:50,y:(vy+fsc*1.55).toFixed(2),'text-anchor':'middle','class':'dl','font-size':fsc.toFixed(2)},caption));
      }
      clear(legend);
      var any=false;
      shown.forEach(function(s){
        if(C.hideZero&&s[2]===0)return;
        any=true;
        var row=document.createElement('div');row.className='dli';
        var dot=document.createElement('i');dot.className='c-'+s[0];row.appendChild(dot);
        var nm=document.createElement('span');nm.textContent=s[1];row.appendChild(nm);
        if(C.showCounts){var ct=document.createElement('b');ct.textContent=String(s[2]);row.appendChild(ct);}
        legend.appendChild(row);
      });
      if(!any){var none=document.createElement('div');none.className='dnone';none.textContent=(alarms&&parsed>0)?'No alarms':'No sensors';legend.appendChild(none);}
      root.setAttribute('data-donut','ok');root.setAttribute('data-total',String(total));
    }catch(err){say('Could not read sensor states');}
  }
  function donutConfig(D){
    return {mode:D.mode==='alarms'?'alarms':'all',center:(D.center==='percentup'||D.center==='none')?D.center:'total',
      caption:String(D.caption||'').replace(/["<>\\]/g,'').slice(0,24),thick:Math.max(8,Math.min(60,Number(D.thick)||28)),gap:Math.max(0,Math.min(10,Number(D.gap)||0)),
      showCounts:!!D.showCounts,hideZero:!!D.hideZero};
  }
  function donutScript(D){
    if(D.engine!=='ring')return '';
    return '(function(){\n  var root=document.getElementById("<@itemid>");\n  if(!root)return;\n  var CFG='+JSON.stringify(donutConfig(D))+';\n  ('+donutRuntime.toString()+')(root,CFG);\n})();';
  }
  function donutInit(D){
    var w=parseInt(D.initW,10), h=parseInt(D.initH,10);
    if(w>0&&h>0)return ' initialwidth="'+Math.min(w,4000)+'" initialheight="'+Math.min(h,4000)+'"';
    if(D.engine!=='prtg')return '';
    return (D.noInitH&&D.look.mode==='prtg')?' initialwidth="auto"':' initialwidth="auto" initialheight="auto"';
  }
  function buildDonut(D){
    var cls=dClassOf(D), css=donutCss(D,cls), L=dEffLook(D), ring=(D.engine==='ring'), o=[];
    var styled=!!css, tm=D.titleMode||'object';
    o.push('<!'+'--'+clean(D.cat||'Donuts')+': '+clean(D.name||'Donut')+'-->');
    var titleInner=(tm==='custom')?clean(D.title):'<#objectproperty name="Name" id="<@objectid>">';
    if(!ring){
      var dark=styled&&dDark(L), light=styled?dark:D.light, named=styled?false:D.withName;
      o.push('<div class="map_object map_donutobj'+(styled?' '+cls:'')+(light?' lighttext':'')+(named?' hasname':'')+'" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+donutInit(D)+' style="'+(styled?'overflow:hidden;':'')+'<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
      o.push('    <#mapobject type="objectgrip" mode="<@editmode>">');
      o.push('    <#mapobject type="htmlbefore" subid="<@subid>">');
      if(styled){
        if(needsFontLink(L))o.push(fontLinkOf(L));
        o.push('<style>');o.push(css);o.push('</style>');
        o.push('    <div class="gbox">');
        if(tm!=='none')o.push('      <div class="gtitle"><b>'+titleInner+'</b></div>');
      }
      o.push('    <div class="map_donutwrapper">');
      o.push('        <#include file="includes\\'+(D.mode==='alarms'?'donut_alarms_only.htm':'donut.htm')+'" id="<@objectid>">');
      o.push('    </div>');
      if(styled)o.push('    </div>');
      else if(named)o.push('    <p class="objname"><b><#objectproperty name="Name" id="<@objectid>"></b></p>');
      o.push('<#mapobject type="htmlafter" subid="<@subid>">');
      o.push('</div>');
      return o.join('\n')+'\n';
    }
    o.push('');
    o.push('<div class="map_object map_graph '+cls+'" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+donutInit(D)+' data-donut="loading" style="overflow:hidden;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('<#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('<#mapobject type="htmlbefore" subid="<@subid>">');
    o.push('<#checkobjecttype objecttype="sensor,device,group,probenode" nicemessage="true" id="<@objectid>">');
    if(needsFontLink(L))o.push(fontLinkOf(L));
    o.push('<style>');o.push(css);o.push('</style>');
    o.push('  <div class="gbox">');
    if(tm!=='none')o.push('    <div class="gtitle"><b>'+titleInner+'</b></div>');
    var lg=(['right','below','none'].indexOf(D.legend)>-1)?D.legend:'right';
    o.push('    <div class="dbody lg-'+lg+'">');
    o.push('      <div class="dsvgwrap"><svg class="dsvg" preserveAspectRatio="xMidYMid meet"></svg></div>');
    o.push('      <div class="dlegend"></div>');
    o.push('    <!'+'--');
    o.push('    {');
    o.push('      "objects":<#table');
    o.push('      id="<@objectid>"');
    o.push("      output='json'");
    o.push("      noraw='1'");
    o.push("      content='sensors'");
    o.push("      sortby='objid'");
    o.push("      count='*'");
    tagFilters(D).forEach(function(tf){o.push('      filter_tags="'+tf+'"');});
    o.push("      columns='objid,status=textraw'>");
    o.push('    }');
    o.push('    -->');
    o.push('    </div>');
    o.push('  </div>');
    o.push('<#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    o.push('');
    o.push('<scr'+'ipt>');o.push(donutScript(D));o.push('<\/script>');
    return o.join('\n')+'\n';
  }

  /* the same counting the ring donut does, drawn as tiles; PRTG's table tag puts the sensors into a comment and this reads it */
  function statusRuntime(root,C){
    var body=root.querySelector('.sbody');
    if(!body)return;
    var LABEL={up:'Up',warning:'Warning',down:'Down',paused:'Paused',unusual:'Unusual',unknown:'Unknown'};
    function clear(n){while(n&&n.firstChild)n.removeChild(n.firstChild);}
    function say(t){clear(body);var d=document.createElement('div');d.className='snone';d.textContent=t;body.appendChild(d);root.setAttribute('data-status','message');}
    function findJson(){
      var found=null;
      (function walk(node){
        for(var c=node.firstChild;c&&!found;c=c.nextSibling){
          if(c.nodeType===8){var t=(c.nodeValue||'').replace(/^\s+|\s+$/g,'');if(t.charAt(0)==='{'){found=t;return;}}
          else if(c.nodeType===1){walk(c);}
        }
      })(root);
      return found;
    }
    function classify(s){
      if(!s||typeof s!=='object')return null;
      var v=(s.status_raw!==undefined&&s.status_raw!==null)?s.status_raw:s.status, n=null;
      if(typeof v==='number')n=v;
      else if(typeof v==='string'&&/^\s*\d+\s*$/.test(v))n=parseInt(v,10);
      if(n!==null){
        if(n===3)return 'up';
        if(n===4)return 'warning';
        if(n===10)return 'unusual';
        if(n===5||n===13||n===14)return 'down';
        if(n===7||n===8||n===9||n===11||n===12)return 'paused';
        return 'unknown';
      }
      if(typeof v==='string'){
        var t=v.replace(/<[^>]*>/g,'').toLowerCase().replace(/^\s+|\s+$/g,'');
        if(t.indexOf('unusual')===0)return 'unusual';
        if(t.indexOf('unknown')===0)return 'unknown';
        if(t.indexOf('up')===0)return 'up';
        if(t.indexOf('warn')===0)return 'warning';
        if(t.indexOf('down')===0)return 'down';
        if(t.indexOf('pause')===0)return 'paused';
      }
      return null;
    }
    try{
      var raw=findJson();
      if(!raw){say('No sensor data');return;}
      var data=JSON.parse(raw), box=(data&&data.objects)?data.objects:data, list=box&&box.sensors;
      if(!list||typeof list.length!=='number'){say('No sensor data');return;}
      var counts={down:0,warning:0,unusual:0,up:0,paused:0,unknown:0}, parsed=0, i, k;
      for(i=0;i<list.length;i++){k=classify(list[i]);if(k){counts[k]++;parsed++;}}
      if(list.length>0&&parsed===0){say('Could not read sensor states');return;}
      if(parsed===0){say('No sensors');return;}
      clear(body);body.style.setProperty('--n',String(C.tiles.length));
      C.tiles.forEach(function(key){
        var v, label, cap='', bg, quiet=false, tile=document.createElement('div'), a, b, c2;
        if(key==='total'){v=parsed;label='Total';bg=C.c.total;cap=(C.cap==='of')?(parsed===1?'sensor':'sensors'):'';}
        else if(key==='pctup'){
          v=Math.round(counts.up*100/parsed);label='Availability';cap='%';
          bg=counts.down>0?C.c.down:((counts.warning>0||counts.unusual>0)?C.c.warning:C.c.up);
        }else{
          v=counts[key];label=LABEL[key];bg=C.c[key];
          cap=(C.cap==='of')?('of '+parsed+(parsed===1?' sensor':' sensors')):'';
          quiet=C.quiet&&v===0&&key!=='up';
        }
        tile.className='stile'+(quiet?' q0':'');
        if(!quiet){tile.style.setProperty('--bg',bg);tile.style.setProperty('--fg',C.fg[key==='pctup'?'pctup':key]||C.fg.up);}
        a=document.createElement('span');a.className='sl';a.textContent=label;
        b=document.createElement('span');b.className='sn';b.textContent=String(v);
        tile.appendChild(a);tile.appendChild(b);
        if(cap){c2=document.createElement('span');c2.className='sc';c2.textContent=cap;tile.appendChild(c2);}
        body.appendChild(tile);
      });
      root.setAttribute('data-status','ok');
    }catch(err){say('Could not read sensor states');}
  }
  var STILES=['up','warning','down','paused','unusual','unknown','total','pctup'];
  function sEffLook(S){var L=S.look;if(L.mode==='prtg'){var m=lookOf('Light card');return m;}return L;}
  function sClassOf(S){return 'pst_'+slugOf(S.name);}
  function statusConfig(S,L){
    var P=donutPalette(L), c={down:P.down,warning:P.warning,unusual:P.unusual,up:P.up,paused:P.paused,unknown:P.unknown,total:(L.accent||L.link||'#007DB8')}, fg={}, tiles=[], k;
    STILES.forEach(function(x){if((S.tiles||[]).indexOf(x)>-1)tiles.push(x);});
    if(!tiles.length)tiles=['up'];
    for(k in c)fg[k]=readableOn(c[k]);
    fg.pctup=fg.up;
    return {tiles:tiles,quiet:!!S.quiet,cap:(S.cap==='none')?'none':'of',c:c,fg:fg};
  }
  function statusCss(S,cls,L){
    var r='.'+cls, c=gFrameCss({engine:'ring'},cls,L), muted=(L.muted||L.headColor), fillA=(L.cardA==null?100:L.cardA),
        cardFill=(L.card)?((fillA<100)?tint(L.cardBg,fillA/100):L.cardBg):'#FFFFFF', q0=blend(cardFill.charAt(0)==='#'?cardFill:'#FFFFFF',L.text,0.1), rad=Math.max(2,Math.min(Number(L.radius)||4,12));
    c.push(r+'{container-type:size;}');
    c.push(r+' .gsub{flex:0 0 auto;color:'+muted+';font-size:12px;line-height:1.3;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}');
    c.push(r+' .sbody{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(64px,1fr));grid-auto-rows:minmax(0,1fr);gap:8px;margin-top:8px;}');
    c.push(r+' .stile{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;min-height:0;padding:4px 6px;border-radius:'+rad+'px;background:var(--bg);color:var(--fg);text-align:center;overflow:hidden;}');
    c.push(r+' .stile .sl{font-family:'+familyStack(L.font)+';font-weight:600;font-size:14px;font-size:clamp(10px,min(8cqh,calc(17cqw / var(--n,4))),20px);line-height:1.2;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;}');
    c.push(r+' .stile .sn{font-family:'+familyStack(L.font)+';font-weight:600;font-size:30px;font-size:clamp(16px,min(30cqh,calc(40cqw / var(--n,4))),72px);line-height:1.05;font-variant-numeric:tabular-nums;white-space:nowrap;max-width:100%;overflow:hidden;}');
    c.push(r+' .stile .sc{font-family:'+familyStack(L.font)+';font-size:11px;font-size:clamp(9px,min(6cqh,calc(11cqw / var(--n,4))),14px);line-height:1.15;opacity:.85;white-space:normal;max-width:100%;}');
    c.push(r+' .stile.q0{background:'+q0+';color:'+muted+';}');
    c.push(r+' .snone{grid-column:1/-1;display:flex;align-items:center;justify-content:center;color:'+muted+';font-size:13px;}');
    return c.join('\n');
  }
  function statusScript(S,L){
    return '(function(){\n  var root=document.getElementById("<@itemid>");\n  if(!root)return;\n  var CFG='+JSON.stringify(statusConfig(S,L))+';\n  ('+statusRuntime.toString()+')(root,CFG);\n})();';
  }
  function buildStatus(S){
    var cls=sClassOf(S), L=sEffLook(S), css=statusCss(S,cls,L), o=[], tm=S.titleMode||'object', nm=String(S.nameHas||'').replace(/[^A-Za-z0-9 ._\-]/g,'').trim();
    var titleInner=(tm==='custom')?clean(S.title):'<#objectproperty name="Name" id="<@objectid>">', w=parseInt(S.initW,10), h_=parseInt(S.initH,10), sub=clean(S.sub);
    o.push('<!'+'--'+clean(S.cat||'Status Counts')+': '+clean(S.name||'Status counts')+'-->');
    o.push('');
    o.push('<div class="map_object map_graph '+cls+'" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+((w>0&&h_>0)?' initialwidth="'+Math.min(w,4000)+'" initialheight="'+Math.min(h_,4000)+'"':'')+' data-status="loading" style="overflow:hidden;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('<#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('<#mapobject type="htmlbefore" subid="<@subid>">');
    o.push('<#checkobjecttype objecttype="sensor,device,group,probenode" nicemessage="true" id="<@objectid>">');
    if(needsFontLink(L))o.push(fontLinkOf(L));
    o.push('<style>');o.push(css);o.push('</style>');
    o.push('  <div class="gbox">');
    if(tm!=='none')o.push('    <div class="gtitle"><b>'+titleInner+'</b></div>');
    if(sub)o.push('    <div class="gsub">'+sub+'</div>');
    o.push('    <div class="sbody"></div>');
    o.push('    <!'+'--');
    o.push('    {');
    o.push('      "objects":<#table');
    o.push('      id="<@objectid>"');
    o.push("      output='json'");
    o.push("      noraw='1'");
    o.push("      content='sensors'");
    o.push("      sortby='objid'");
    o.push("      count='*'");
    tagFilters(S).forEach(function(tf){o.push('      filter_tags="'+tf+'"');});
    if(nm)o.push("      filter_name='@sub("+nm+")'");
    o.push("      columns='objid,status=textraw'>");
    o.push('    }');
    o.push('    -->');
    o.push('  </div>');
    o.push('<#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    o.push('');
    o.push('<scr'+'ipt>');o.push(statusScript(S,L));o.push('<\/script>');
    return o.join('\n')+'\n';
  }

  /* ====================== status icons ====================== */
  /* PRTG's own colours for the state classes (main.css, .map_iconcolor_*) */
  var IPRTG={up:'#B8C419',warning:'#F5C500',down:'#E30613',ack:'#E67278',unusual:'#F59C00',paused:'#477EC0',unknown:'#878787'};
  /* ascending severity, which is the order PRTG's own maps script uses when an object carries several state classes
     (_Prtg.Maps.js: red, then acknowledged, yellow, unusual, blue, undefined, and green last). CSS written in this order lets the worst state win. */
  var ISTATES=[
    {id:'up',      label:'Up',           sens:['sensg'],          has:['hasgreen']},
    {id:'unknown', label:'Unknown',      sens:['sensx'],          has:['hasblack']},
    {id:'paused',  label:'Paused',       sens:['sensb'],          has:['hasblue']},
    {id:'unusual', label:'Unusual',      sens:['sensp'],          has:['hasorange']},
    {id:'warning', label:'Warning',      sens:['sensy'],          has:['hasyellow']},
    {id:'ack',     label:'Acknowledged', sens:['senso'],          has:['hasack']},
    {id:'down',    label:'Down',         sens:['sensr','sensq'],  has:['hasred','haspartialred']}
  ];
  var IORDER=['up','warning','down','ack','unusual','paused','unknown'];
  var IALARM={warning:1,ack:1,down:1};
  var GLYPH={
    up:'<path d="M6.5 12.5l3.8 3.8 7.2-8.2"/>',
    warning:'<path d="M12 6.5v7.2"/><path d="M12 17.4h.01"/>',
    down:'<path d="M7.5 7.5l9 9M16.5 7.5l-9 9"/>',
    ack:'<path d="M7 16.5h10l-1.4-1.8V11a3.6 3.6 0 0 0-7.2 0v3.7z"/><path d="M10.5 19a1.6 1.6 0 0 0 3 0"/>',
    unusual:'<path d="M13 4.5L6.5 13.5h5L10.8 19.5 17.5 10.5h-5z"/>',
    paused:'<path d="M9.5 7.5v9M14.5 7.5v9"/>',
    unknown:'<path d="M9.6 9.6a2.5 2.5 0 1 1 3.6 2.2c-.8.5-1.2 1-1.2 1.9"/><path d="M12 17.2h.01"/>'
  };
  var HBPATH={ok:'M4 26H26L33 12L43 40L51 20L56 26H92',warn:'M4 26H24L30 18L36 34L42 22L47 28L52 24H92',wave:'M4 26Q16 12 28 26T52 26T76 26T92 24',flat:'M4 26H92',ack:'M4 26H40L44 22L48 30L52 26H92',dash:'M4 26H92',dot:'M4 26H92'};
  var HBFOR={up:'ok',warning:'warn',unusual:'wave',ack:'ack',down:'flat',paused:'dash',unknown:'dot'};
  /* group: how the style is listed. gl: which set of state-dependent pieces it carries. */
  var ISTYLES=[
    {id:'led',   name:'LED',            group:'Circles', w:44, h:44, vb:'0 0 48 48', gl:null},
    {id:'dot',   name:'Dot',            group:'Circles', w:40, h:40, vb:'0 0 48 48', gl:null},
    {id:'glow',  name:'Glow dot',       group:'Circles', w:44, h:44, vb:'0 0 48 48', gl:null},
    {id:'orb',   name:'Soft orb',       group:'Circles', w:44, h:44, vb:'0 0 48 48', gl:null},
    {id:'ring',  name:'Ring',           group:'Circles', w:44, h:44, vb:'0 0 48 48', gl:null},
    {id:'pulse', name:'Pulse',          group:'Circles', w:48, h:48, vb:'0 0 48 48', gl:null},
    {id:'badge', name:'Badge',          group:'Icons',   w:44, h:44, vb:'0 0 48 48', gl:'icon'},
    {id:'glyph', name:'Line icon',      group:'Icons',   w:44, h:44, vb:'0 0 48 48', gl:'icon'},
    {id:'tile',  name:'Tile',           group:'Icons',   w:52, h:52, vb:'0 0 48 48', gl:'icon'},
    {id:'shield',name:'Shield',         group:'Icons',   w:44, h:48, vb:'0 0 48 48', gl:'icon'},
    {id:'traffic',name:'Traffic light', group:'More',    w:44, h:110,vb:'0 0 40 100',gl:null},
    {id:'heart', name:'Heartbeat',      group:'More',    w:96, h:44, vb:'0 0 96 48', gl:'hb'},
    {id:'pill',  name:'Status pill',    group:'More',    w:160,h:32, vb:null,        gl:null}
  ];
  function iStyle(id){var r=ISTYLES[1];ISTYLES.forEach(function(s){if(s.id===id)r=s;});return r;}
  function blankI(){
    return {type:'icon',engine:'custom',cat:'Status Icons',name:'Status dot',fname:'',style:'dot',palette:'look',text:'none',tip:'name',link:'auto',animate:true,card:false,
      labels:{},initW:40,initH:40,look:lookOf('Minimal'),raw:''};
  }
  function iconFromPreset(p){
    var I=blankI();
    I.engine='stock';I.cat=p.cat;I.name=p.name+' custom';I.raw=p.raw;I.initW=0;I.initH=0;
    return I;
  }
  function iClassOf(I){return 'pst_'+slugOf(I.name);}
  function hexA(c,a){var x=String(c).replace('#','');if(x.length!==6)return c;return 'rgba('+parseInt(x.substr(0,2),16)+','+parseInt(x.substr(2,2),16)+','+parseInt(x.substr(4,2),16)+','+a+')';}
  function ictr(a,b){var l1=lum(a),l2=lum(b);if(l1<l2){var t=l1;l1=l2;l2=t;}return (l1+0.05)/(l2+0.05);}
  function fgOn(c){return ictr('#FFFFFF',c)>=ictr('#0B1220',c)?'#FFFFFF':'#0B1220';}
  function iEffLook(I){
    var L=I.look;
    if(L.mode==='prtg'){var m=lookOf('Minimal');m.name='PRTG default';return m;}
    return L;
  }
  function iCardFill(L){var a=(L.cardA==null?100:L.cardA);return (a<100)?tint(L.cardBg,a/100):L.cardBg;}
  function iconPalette(I,L){
    if(I.palette==='prtg')return {up:IPRTG.up,warning:IPRTG.warning,down:IPRTG.down,ack:IPRTG.ack,unusual:IPRTG.unusual,paused:IPRTG.paused,unknown:IPRTG.unknown};
    var P=donutPalette(L), cf=(L.cardBg&&String(L.cardBg).charAt(0)==='#')?L.cardBg:'#FFFFFF';
    return {up:P.up,warning:P.warning,down:P.down,ack:blend(P.down,'#FFFFFF',0.35),unusual:P.unusual,paused:P.paused,unknown:P.unknown};
  }
  /* a solid fill with a glyph or text on it must read (4.5:1). If a colour falls a little short, nudge it a few percent away from the text colour. */
  function fitFill(c){
    var fg=fgOn(c), toward=(fg==='#FFFFFF')?'#000000':'#FFFFFF', k;
    for(k=1;k<=12&&ictr(fg,c)<4.5;k++)c=blend(c,toward,0.03);
    return c;
  }
  function iconShades(c,L){
    c=fitFill(c);
    var cf=(L.cardBg&&String(L.cardBg).charAt(0)==='#')?L.cardBg:'#FFFFFF';
    var tnt=blend(cf,c,0.16), ink=c, k;
    for(k=1;k<=10&&ictr(ink,tnt)<3;k++)ink=blend(c,L.text,k*0.1);
    return {c:c,cl:blend(c,'#FFFFFF',0.45),cd:blend(c,'#000000',0.35),g:hexA(c,0.6),fg:fgOn(c),t:tnt,tb:blend(cf,c,0.45),ink:ink};
  }
  function iLabel(I,s){
    var v=String((I.labels&&I.labels[s.id])||'').replace(/[\\"<>]/g,'').replace(/\s+/g,' ').trim().slice(0,24);
    return v||s.label;
  }
  function sSel(r,s,tail){return s.sens.concat(s.has).map(function(k){return r+'.map_objectstate_'+k+(tail||'');}).join(',');}
  function iconCss(I,cls){
    var L=iEffLook(I), st=iStyle(I.style), r='.'+cls, c=[], P=iconPalette(I,L), muted=(L.muted||L.headColor), txt=(I.text!=='none');
    var Lc=I.card?L:Object.assign({},L,{card:false}), cf=iCardFill(L);
    var sh={};IORDER.forEach(function(k){sh[k]=iconShades(P[k],L);});
    var ip=I.card?Math.min(L.cardPad||0,10)+((L.bw>0)?L.bw:0):0, ratio=st.vb?(function(v){var q=v.split(' ');return q[2]+'/'+q[3];})(st.vb):'1/1';
    var u=sh.unknown;
    c.push(r+'{'+grRoot(Lc,cf)+'--c:'+u.c+';--cl:'+u.cl+';--cd:'+u.cd+';--g:'+u.g+';--fg:'+u.fg+';--t:'+u.t+';--tb:'+u.tb+';--ci:'+u.ink+';}');
    c.push(r+' .pst{display:flex;align-items:center;justify-content:center;gap:10px;box-sizing:border-box;width:100%;height:100%;text-decoration:none;color:inherit;'+(ip>0?'padding:'+ip+'px;':'')+'}');
    c.push(r+' .pst.pst-t{justify-content:flex-start;}');
    c.push(r+' .pst-ic{display:block;flex:0 1 auto;width:100%;height:100%;max-width:100%;max-height:100%;overflow:visible;}');
    c.push(r+' .pst.pst-t .pst-ic{flex:0 0 auto;width:auto;height:100%;aspect-ratio:'+ratio+';}');
    c.push(r+' .pst-b{display:flex;flex-direction:column;justify-content:center;min-width:0;line-height:1.25;}');
    c.push(r+' .pst-n{font-weight:600;color:'+L.text+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}');
    c.push(r+' .pst-w{color:'+muted+';font-size:.86em;white-space:nowrap;}');
    c.push(r+' .pst-w::after{content:"'+iLabel(I,ISTATES[1])+'";}');
    /* shapes: every colour comes from the variables a state class sets */
    c.push(r+' .ic-fill{fill:var(--c);}');
    if(st.id==='led'){
      c.push(r+' .ic-led{stroke:rgba(0,0,0,.28);stroke-width:1;filter:drop-shadow(0 1.5px 2.5px var(--g));}');
      c.push(r+' .ic-hl{fill:#fff;opacity:.55;}');
    }
    if(st.id==='glow')c.push(r+' .ic-glow{filter:drop-shadow(0 0 3px var(--g)) drop-shadow(0 0 9px var(--g));}');
    if(st.id==='orb')c.push(r+' .ic-hl{fill:#fff;opacity:.38;}');
    if(st.id==='ring')c.push(r+' .ic-ring{fill:none;stroke:var(--c);stroke-width:4;}');
    if(st.id==='pulse'){
      c.push(r+' .halo{fill:var(--c);opacity:0;transform-box:fill-box;transform-origin:center;}');
      c.push('@keyframes pstpulse_'+cls+'{0%{transform:scale(1);opacity:.55;}70%{transform:scale(1.75);opacity:0;}100%{transform:scale(1.75);opacity:0;}}');
    }
    if(st.gl==='icon'){
      c.push(r+' .gl{display:none;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}');
      c.push(r+' .gl-unknown{display:block;}');
      if(st.id==='badge'||st.id==='shield')c.push(r+' .gl{stroke:var(--fg);}');
      if(st.id==='glyph')c.push(r+' .gl{stroke:var(--c);}');
      if(st.id==='tile'){c.push(r+' .gl{stroke:var(--ci);}');c.push(r+' .ic-tile{fill:var(--t);stroke:var(--tb);stroke-width:1.5;}');}
    }
    var tlHouse='#161C28', tlOff=blend(tlHouse,'#FFFFFF',0.14);
    if(st.id==='traffic'){
      c.push(r+' .tl-body{fill:'+tlHouse+';stroke:'+blend(tlHouse,'#FFFFFF',0.24)+';stroke-width:1.5;}');
      c.push(r+' .lamp{fill:'+tlOff+';}');
    }
    if(st.gl==='hb'){
      c.push(r+' .gl{display:none;fill:none;stroke:var(--c);stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round;}');
      c.push(r+' .gl-dash{stroke-dasharray:3 7;}');
      c.push(r+' .gl-dot{stroke-dasharray:.1 7;}');
      c.push(r+' .gl-dot{display:block;}');
    }
    if(st.id==='pill'){
      c.push(r+' .pst-pill{display:inline-flex;align-items:center;gap:.55em;height:100%;max-height:100%;box-sizing:border-box;padding:0 1em 0 .85em;border-radius:999px;background:var(--c);color:var(--fg);font-weight:600;white-space:nowrap;overflow:hidden;}');
      c.push(r+' .pst-pill i{display:block;width:.55em;height:.55em;border-radius:50%;background:currentColor;opacity:.9;flex:0 0 auto;}');
      c.push(r+' .pst-pill .pst-n,'+r+' .pst-pill .pst-w{color:inherit;font-size:1em;}');
      c.push(r+' .pst-pill .pst-w{text-transform:uppercase;letter-spacing:.4px;}');
    }
    /* the states, mildest first so the worst one wins when an object carries several state classes */
    ISTATES.forEach(function(s){
      var P2=sh[s.id], sel=function(t){return sSel(r,s,t);};
      c.push(sel('')+'{--c:'+P2.c+';--cl:'+P2.cl+';--cd:'+P2.cd+';--g:'+P2.g+';--fg:'+P2.fg+';--t:'+P2.t+';--tb:'+P2.tb+';--ci:'+P2.ink+';}');
      c.push(sel(' .pst-w::after')+'{content:"'+iLabel(I,s)+'";}');
      if(st.gl==='icon'){c.push(sel(' .gl')+'{display:none;}');c.push(sel(' .gl-'+s.id)+'{display:block;}');}
      if(st.gl==='hb'){c.push(sel(' .gl')+'{display:none;}');c.push(sel(' .gl-'+HBFOR[s.id])+'{display:block;}');}
      if(st.id==='traffic'){
        var lamp=(s.id==='down'||s.id==='ack')?'r':((s.id==='warning'||s.id==='unusual')?'y':(s.id==='up'?'g':''));
        c.push(sel(' .lamp')+'{fill:'+tlOff+';filter:none;}');
        if(lamp)c.push(sel(' .lamp-'+lamp)+'{fill:var(--c);filter:drop-shadow(0 0 4px var(--g));}');
      }
      if(st.id==='pulse'&&IALARM[s.id]){
        if(I.animate)c.push(sel(' .halo')+'{animation:pstpulse_'+cls+' 1.8s ease-out infinite;}');
        else c.push(sel(' .halo')+'{opacity:.28;transform:scale(1.5);}');
      }
    });
    if(st.id==='pulse'&&I.animate){
      c.push('@media (prefers-reduced-motion:reduce){');
      ISTATES.forEach(function(s){if(IALARM[s.id])c.push('  '+sSel(r,s,' .halo')+'{animation:none;opacity:.28;transform:scale(1.5);}');});
      c.push('}');
    }
    return c.join('\n');
  }
  function iconSvg(I,id){
    var st=iStyle(I.style);
    var wrap=function(inner,vb){return '<svg class="pst-ic" viewBox="'+(vb||st.vb)+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'+inner+'</svg>';};
    var glyphs=function(tf){return ['up','warning','down','ack','unusual','paused','unknown'].map(function(k){return '<g class="gl gl-'+k+'" transform="'+tf+'">'+GLYPH[k]+'</g>';}).join('');};
    switch(st.id){
      case 'dot': return wrap('<circle class="ic-fill" cx="24" cy="24" r="21"/>');
      case 'glow': return wrap('<circle class="ic-fill ic-glow" cx="24" cy="24" r="17"/>');
      case 'ring': return wrap('<circle class="ic-ring" cx="24" cy="24" r="19"/><circle class="ic-fill" cx="24" cy="24" r="9"/>');
      case 'pulse': return wrap('<circle class="halo" cx="24" cy="24" r="13"/><circle class="ic-fill" cx="24" cy="24" r="13"/>');
      case 'orb': return wrap('<defs><radialGradient id="og_'+id+'" cx="36%" cy="30%" r="78%"><stop offset="0" style="stop-color:var(--cl)"/><stop offset="0.55" style="stop-color:var(--c)"/><stop offset="1" style="stop-color:var(--cd)"/></radialGradient></defs><circle cx="24" cy="24" r="21" fill="url(#og_'+id+')"/><ellipse class="ic-hl" cx="18" cy="14" rx="9" ry="5.5"/>');
      case 'led': return wrap('<defs><radialGradient id="lg_'+id+'" cx="30%" cy="30%" r="80%"><stop offset="0" style="stop-color:var(--cl)"/><stop offset="0.7" style="stop-color:var(--c)"/><stop offset="1" style="stop-color:var(--cd)"/></radialGradient></defs><circle class="ic-led" cx="24" cy="24" r="20" fill="url(#lg_'+id+')"/><ellipse class="ic-hl" cx="18" cy="14" rx="9" ry="5.5"/>');
      case 'badge': return wrap('<circle class="ic-fill" cx="24" cy="24" r="21"/>'+glyphs('translate(9 9) scale(1.25)'));
      case 'glyph': return wrap(glyphs('translate(2 2) scale(1.9167)'));
      case 'tile': return wrap('<rect class="ic-tile" x="3" y="3" width="42" height="42" rx="11"/>'+glyphs('translate(9 9) scale(1.25)'));
      case 'shield': return wrap('<path class="ic-fill" d="M24 3.5L39.5 9.5V23C39.5 33 33 40.5 24 44.5C15 40.5 8.5 33 8.5 23V9.5Z"/>'+glyphs('translate(12 10)'));
      case 'traffic': return wrap('<rect class="tl-body" x="2" y="2" width="36" height="96" rx="12"/><circle class="lamp lamp-r" cx="20" cy="22" r="11"/><circle class="lamp lamp-y" cx="20" cy="50" r="11"/><circle class="lamp lamp-g" cx="20" cy="78" r="11"/>');
      case 'heart': return wrap(['ok','warn','wave','flat','ack','dash','dot'].map(function(k){return '<path class="gl gl-'+k+'" d="'+HBPATH[k]+'"/>';}).join(''));
    }
    return '';
  }
  function iconOpen(I){
    var t='';
    if(I.tip==='name')t=' title="<#objectproperty name="name" show="text" id="<@objectid>">"';
    else if(I.tip==='parent')t=' title="<#objectproperty name="ParentDevice" show="text" id="<@objectid>">"';
    else if(I.tip==='both')t=' title="<#objectproperty name="ParentDevice" show="text" id="<@objectid>"> / <#objectproperty name="name" show="text" id="<@objectid>">"';
    var href='';
    if(I.link==='auto')href=' href="/<#if value="@nodename" is="sensor" then="sensor" else="device" varexpand="value">.htm?id=<@objectid>"';
    else if(I.link==='sensor')href=' href="/sensor.htm?id=<@objectid>"';
    else if(I.link==='device')href=' href="/device.htm?id=<@objectid>"';
    return {tag:href?'a':'span',open:'<'+(href?'a':'span')+' class="pst'+(I.text!=='none'&&I.style!=='pill'?' pst-t':'')+'"'+href+t+'>'};
  }
  /* the clickable part of the icon: used by the file and by the preview, so both show the same markup */
  function iconBodyLines(I,id){
    var st=iStyle(I.style), op=iconOpen(I), o=[];
    var showN=(I.text==='name'||I.text==='both'), showW=(I.text==='word'||I.text==='both');
    var nameEl='<span class="pst-n"><#objectproperty name="Name" id="<@objectid>"></span>', wordEl='<span class="pst-w"></span>';
    o.push('  '+op.open);
    if(st.id==='pill'){
      o.push('    <span class="pst-pill"><i></i>'+(showN?nameEl:'')+wordEl+'</span>');
    }else{
      o.push('    '+iconSvg(I,id));
      if(showN||showW)o.push('    <span class="pst-b">'+(showN?nameEl:'')+(showW?wordEl:'')+'</span>');
    }
    o.push('  </'+op.tag+'>');
    return o;
  }
  function buildIcon(I){
    var o=[];
    o.push('<!'+'--'+clean(I.cat||'Status Icons')+': '+clean(I.name||'Status icon')+'-->');
    if(I.engine==='stock')return o.join('\n')+'\n'+String(I.raw||'').replace(/\r/g,'');
    var cls=iClassOf(I), css=iconCss(I,cls), L=iEffLook(I), st=iStyle(I.style), op=iconOpen(I), w=parseInt(I.initW,10), h=parseInt(I.initH,10);
    var init=(w>0&&h>0)?' initialwidth="'+Math.min(w,4000)+'" initialheight="'+Math.min(h,4000)+'"':'';
    var showN=(I.text==='name'||I.text==='both'), showW=(I.text==='word'||I.text==='both');
    o.push('<div class="map_object pst_obj '+cls+' <#sensor type="colorclassofstate" prefix="map_objectstate_" id="<@objectid>">" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+init+' style="<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('  <#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('  <#mapobject type="htmlbefore" subid="<@subid>">');
    o.push('  <#checkobjecttype objecttype="sensor,device,group,probenode" nicemessage="true" id="<@objectid>">');
    if(I.link==='auto')o.push('  <#objectproperty type="nodename" id="<@objectid>" var="nodename">');
    if((showN||showW||st.id==='pill')&&needsFontLink(L))o.push(fontLinkOf(L));
    o.push('<style>');o.push(css);o.push('</style>');
    iconBodyLines(I,'<@itemid>').forEach(function(l){o.push(l);});
    o.push('  <#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    return o.join('\n')+'\n';
  }

  /*PURE2-END*/

  /* ---------- helpers ---------- */
  function h(tag,cls,html){var n=document.createElement(tag);if(cls)n.className=cls;if(html!=null)n.innerHTML=html;return n;}
  function toast(t){var n=document.getElementById('toast');n.textContent=t;n.classList.add('show');setTimeout(function(){n.classList.remove('show');},1800);}
  function copyText(t,msg){
    var done=function(ok){toast(ok?(msg||'Copied'):'Copy failed. Select the code and copy it by hand.');};
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
  function download(name,text){
    try{
      var b=new Blob([text],{type:'text/html;charset=utf-8'});
      var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;
      document.body.appendChild(a);a.click();
      setTimeout(function(){try{document.body.removeChild(a);URL.revokeObjectURL(a.href);}catch(e){}},600);
      toast('Saving '+name);
    }catch(err){toast('Download blocked here. Use Copy and save it as '+name);}
  }

  var FRAMEAPI=DASHAPI.frame||null, FRM={frame:null,bg:null,shape:null};
  var T=blankT(), G=blankG(), GR=blankGR(), DN=blankD(), IC=blankI(), SC=blankSC(), TYPE='label', syncs=[], vis=[], hostEl=document.getElementById('objpanel');
  function M(){return TYPE==='gauge'?G:((TYPE==='frame'||TYPE==='bg'||TYPE==='shape')?FRc():(TYPE==='graph'?GR:(TYPE==='donut'?DN:(TYPE==='icon'?IC:(TYPE==='status'?SC:T)))));}
  /* Frame and Background are the Dashboard's own frame, pasted into a Custom HTML item. The Dashboard hands over its generator, so the code is the same. */
  function blankFR(kind){
    var p=(kind==='shape')?FRAMEAPI.newShapeP('arrow'):FRAMEAPI.newFrameP(kind==='bg'?'Background dark':'Light card');
    if(kind==='bg')p.title='';
    return {kind:kind,p:p,w:(kind==='bg'?CFG.canvas.w:(kind==='shape'?CFG.shape.w:CFG.frame.w)),h:(kind==='bg'?CFG.canvas.h:(kind==='shape'?CFG.shape.h:CFG.frame.h)),cat:'Pasted',name:(kind==='bg'?'Background':(kind==='shape'?'Shape':'Frame')),fname:'',initW:0,initH:0,look:lookOf('Minimal')};
  }
  /* the same Look presets as the other objects, read as frame, background or shape settings */
  function readableOn(hex){var x=String(hex||'#000000').replace('#',''),r=parseInt(x.substr(0,2),16)||0,g=parseInt(x.substr(2,2),16)||0,b=parseInt(x.substr(4,2),16)||0;return (0.299*r+0.587*g+0.114*b)<150?'#FFFFFF':'#0F172A';}
  function lookToFrameP(name,kind){
    var col, L=lookOf(name), stage=L.stage||'#FFFFFF', bw=(L.card===false)?0:(L.bw==null?1:L.bw), sh=({none:'none',soft:'soft',strong:'strong',glow:'strong'})[L.shadow]||'none', pad=L.cardPad||16, o;
    if(kind==='bg')return {fill:stage,fillA:100,bcolor:stage,bw:0,radius:0,shadow:'none',tcolor:L.titleText||'#383B47',group:false,style:name};
    o={fill:L.cardBg||'#FFFFFF',fillA:(L.cardA==null?100:L.cardA),bcolor:L.border||L.line||'#E3E5E9',bw:bw,radius:L.radius||0,shadow:sh,tcolor:L.titleText||'#383B47',tsize:L.titleSize||18,tweight:'600',padx:pad,pady:pad,fam:L.font||'Inter',style:name};
    if(kind==='shape'){
      /* a shape takes the look's own accent (or, failing that, its link color), is filled with it, and reads in white or dark */
      col=(L.accent&&L.accent!==LOOKBASE.accent)?L.accent:((L.link&&L.link!==LOOKBASE.link)?L.link:LOOKBASE.accent);
      o.fill=col;o.fillA=100;o.bcolor=col;o.bw=0;o.color=col;o.tcolor=readableOn(col);
      o.thick=(L.size>=18)?10:((L.card===false)?4:6);
    }else o.group=true;
    return o;
  }
  function FRc(){var k=(TYPE==='bg')?'bg':((TYPE==='shape')?'shape':'frame');return FRM[k]||(FRM[k]=blankFR(k));}
  function frFontLink(fr){
    var p=fr.p;
    if(!p.title||!p.fam||isLocalFont(p.fam))return '';
    return '<link href="https://fonts.googleapis.com/css2?family='+String(p.fam).replace(/ /g,'+')+':wght@'+(p.tweight||'400')+'&display=swap" rel="stylesheet">';
  }
  function buildPaste(fr){
    var l=frFontLink(fr), code=FRAMEAPI.frameHTML({p:fr.p,w:fr.w,h:fr.h});
    return (l?l+'\n':'')+code+'\n';
  }
  var codeEl=document.getElementById('ocode'), prevEl=document.getElementById('opreview');
  var colsBody=null, lookDetail=null, presetSel=null, galleryEl=null;

  function section(title){var open=!!CFG.sections[title];
    var f=h('fieldset','secfs');
    var bar=h('button','advbar','<span class="seccaret">'+(open?'\u25BE':'\u25B8')+'</span> '+title);bar.type='button';
    if(open)bar.className+=' open';
    var body=h('div','secbody');body.hidden=!open;
    bar.addEventListener('click',function(){
      var o=body.hidden;body.hidden=!o;
      if(o)bar.classList.add('open');else bar.classList.remove('open');
      bar.firstChild.textContent=o?'\u25BE':'\u25B8';
    });
    f.appendChild(bar);f.appendChild(body);hostEl.appendChild(f);
    return body;
  }
  function inText(label,get,set,ph){
    var w=h('div','dfld');w.appendChild(h('label',null,label));
    var i=h('input');i.type='text';if(ph)i.placeholder=ph;
    i.addEventListener('input',function(){set(i.value);render();});
    syncs.push(function(){i.value=get();});w.appendChild(i);return w;
  }
  function inArea(label,get,set,ph){
    var w=h('div','dfld');w.appendChild(h('label',null,label));
    var i=h('textarea');i.rows=3;if(ph)i.placeholder=ph;i.spellcheck=false;
    i.addEventListener('input',function(){set(i.value);render();});
    syncs.push(function(){i.value=get();});w.appendChild(i);return w;
  }
  function inNum(label,get,set,min,max){
    var w=h('div','dfld');w.appendChild(h('label',null,label));
    var i=h('input');i.type='number';if(min!=null)i.min=min;if(max!=null)i.max=max;
    i.addEventListener('input',function(){var v=parseFloat(i.value);set(isNaN(v)?0:v);render();});
    syncs.push(function(){i.value=get();});w.appendChild(i);return w;
  }
  function inSel(label,get,set,opts){
    var w=h('div','dfld');w.appendChild(h('label',null,label));
    var i=h('select');
    opts.forEach(function(o){var op=h('option');op.value=(o instanceof Array)?o[0]:o;op.textContent=(o instanceof Array)?o[1]:o;i.appendChild(op);});
    i.addEventListener('change',function(){set(i.value);render();});
    syncs.push(function(){i.value=String(get());});w.appendChild(i);return w;
  }
  function inChk(label,get,set,after){
    var w=h('div','dfld inline');var i=h('input');i.type='checkbox';
    i.addEventListener('change',function(){set(i.checked);if(after)after();render();});
    w.appendChild(i);w.appendChild(h('label',null,label));
    syncs.push(function(){i.checked=!!get();});return w;
  }
  function inColor(label,get,set){
    var w=h('div','dfld');w.appendChild(h('label',null,label));
    var i=h('input');i.type='color';
    i.addEventListener('input',function(){set(i.value);render();});
    syncs.push(function(){i.value=get();});w.appendChild(i);return w;
  }
  function pair(a,b){var d=h('div','dpair');d.appendChild(a);d.appendChild(b);return d;}
  function applyVis(){vis.forEach(function(v){v[0].hidden=!v[1]();});}
  function refreshUI(){
    syncs.forEach(function(f){f();});drawCols();drawGallery();applyVis();
    if(lookDetail)lookDetail.hidden=(M().look.mode==='prtg');
    var gb=document.getElementById('ogauge');if(gb)gb.hidden=(TYPE==='table'||isPaste()||(TYPE==='icon'&&IC.engine==='stock'));
    var sb=document.getElementById('osamplebox');if(sb)sb.hidden=(TYPE!=='gauge');
    var wl=document.getElementById('owlabel');if(wl)wl.textContent=(TYPE==='table')?'Width, blank = fit':'Width';
    var wi=document.getElementById('owidth');if(wi)wi.placeholder=(TYPE==='status')?'420':(TYPE==='gauge')?'320':(TYPE==='graph'?(GR.kind==='sensors'?'760':(GR.kind==='toplist'?'240':'520')):(TYPE==='donut'?(DN.engine==='ring'?'340':'auto'):(TYPE==='icon'?String(iStyle(IC.style).w):'fit')));
    var hi=document.getElementById('oheight');if(hi)hi.placeholder=(TYPE==='status')?'200':(TYPE==='graph'?(GR.kind==='sensors'?'420':(GR.kind==='toplist'?'240':'300')):(TYPE==='donut'?(DN.engine==='ring'?'220':'auto'):(TYPE==='icon'?String(iStyle(IC.style).h):'280')));
    var pasteMode=isPaste();
    [['odl'],['ofname']].forEach(function(x){var e=document.getElementById(x[0]);if(e)e.style.display=pasteMode?'none':'';});   /* style, not the hidden attribute: a label has its own display rule */
    [['owlabel'],['owidth']].forEach(function(x){var e=document.getElementById(x[0]);if(e)e.style.display=(pasteMode||(TYPE==='table'&&ED.on))?'none':'';});
    var fh=document.getElementById('ofheadtext');if(fh)fh.textContent=pasteMode?'Paste into HTML Before':'File';
  }

  /* ---------- columns ---------- */
  function colLabel(k){for(var i=0;i<COLS.length;i++){if(COLS[i][0]===k)return COLS[i][1];}return k;}
  function drawCols(){
    if(!colsBody)return;
    colsBody.innerHTML='';
    var rest=COLS.filter(function(c){return T.cols.indexOf(c[0])<0;}).map(function(c){return c[0];});
    T.cols.concat(rest).forEach(function(k){
      var on=T.cols.indexOf(k)>-1;
      var r=h('div','drow');
      var cb=h('input');cb.type='checkbox';cb.checked=on;
      cb.addEventListener('change',function(){
        var at=T.cols.indexOf(k);
        if(cb.checked&&at<0)T.cols.push(k);
        else if(!cb.checked&&at>-1){if(T.cols.length<2){cb.checked=true;toast('A table needs at least one column');return;}T.cols.splice(at,1);}
        drawCols();render();
      });
      r.appendChild(cb);
      var nm=h('span','nm');nm.textContent=colLabel(k);r.appendChild(nm);
      if(on){
        var up=h('button','cp','\u25B2');up.type='button';
        var dn=h('button','cp','\u25BC');dn.type='button';
        up.addEventListener('click',function(){var i=T.cols.indexOf(k);if(i>0){T.cols.splice(i,1);T.cols.splice(i-1,0,k);drawCols();render();}});
        dn.addEventListener('click',function(){var i=T.cols.indexOf(k);if(i<T.cols.length-1){T.cols.splice(i,1);T.cols.splice(i+1,0,k);drawCols();render();}});
        r.appendChild(up);r.appendChild(dn);
      }
      colsBody.appendChild(r);
    });
  }


  /* ---------- look gallery ---------- */
  function thumbHTML(L,kind){
    var prtg=(L.mode==='prtg');
    var stage=prtg?'#F7F7F7':(L.stage||'#EEF1F4');
    var fillA=(L.cardA==null?100:L.cardA);
    var cardBg=prtg?'#FFFFFF':((fillA<100)?tint(L.cardBg,fillA/100):L.cardBg);
    var line=prtg?'#E3E3E3':L.line, text=prtg?'#575756':L.text, headCol=prtg?'#8B8B8B':L.headColor;
    var radius=prtg?2:Math.min(L.radius,10);
    var border=prtg?'1px solid #DDD':((L.card&&L.bw>0)?'1px solid '+L.border:'0');
    var sh=prtg?'':shadowOf(L);
    var bar=(!prtg&&L.titleStyle==='bar');
    var cards=(prtg||L.card!==false);
    var o='<span style="display:block;background:'+stage+';padding:7px;border-radius:4px;">';
    o+='<span style="display:block;'+(cards?'background:'+cardBg+';border:'+border+';border-radius:'+radius+'px;':'')+(sh?'box-shadow:'+sh+';':'')+'overflow:hidden;'+((bar||prtg)?'':'padding:7px;')+'">';
    if(prtg){
      o+='<i style="display:block;height:5px;width:36%;background:#00A3DA;border-radius:2px;margin:7px 0 6px 7px"></i>';
    }else if(bar){
      o+='<i style="display:block;height:11px;background:'+L.titleBg+'"></i>';
    }else{
      var tcol=L.titleText||L.text;
      o+='<i style="display:block;height:5px;width:42%;background:'+tcol+';border-radius:2px;margin:'+(L.titleStyle==='accent'?'0 0 6px 5px;box-shadow:-5px 0 0 '+L.accent:'0 0 6px')+';"></i>';
      if(L.titleStyle==='divider')o+='<i style="display:block;height:1px;background:'+line+';margin:0 0 3px"></i>';
    }
    if(kind==='icon'){
      var ipal=prtg?['#B8C419','#F5C500','#E30613']:[L.c.up,L.c.warning,L.c.down];
      o+='<svg viewBox="0 0 80 30" width="100%" height="30" style="display:block;margin:0 auto;'+((bar||prtg)?'padding:2px 0;':'')+'"><circle cx="20" cy="15" r="8" fill="'+ipal[0]+'"/><circle cx="40" cy="15" r="8" fill="'+ipal[1]+'"/><circle cx="60" cy="15" r="8" fill="'+ipal[2]+'"/></svg>';
      return o+'</span></span>';
    }
    if(kind==='donut'){
      var dcol=[prtg?'#6DB33F':L.c.up,prtg?'#FFCC00':L.c.warning,prtg?'#E5484D':L.c.down,prtg?'#4D9DE0':L.c.paused];
      o+='<svg viewBox="0 0 80 40" width="100%" height="40" style="display:block;margin:0 auto;'+((bar||prtg)?'padding:2px 0;':'')+'"><circle cx="40" cy="20" r="13" fill="none" stroke="'+blend(cards?cardBg:'#FFFFFF',text,0.14)+'" stroke-width="7"/><circle cx="40" cy="20" r="13" fill="none" stroke="'+dcol[0]+'" stroke-width="7" stroke-dasharray="54 82" transform="rotate(-90 40 20)"/><circle cx="40" cy="20" r="13" fill="none" stroke="'+dcol[1]+'" stroke-width="7" stroke-dasharray="14 82" stroke-dashoffset="-56" transform="rotate(-90 40 20)"/><circle cx="40" cy="20" r="13" fill="none" stroke="'+dcol[2]+'" stroke-width="7" stroke-dasharray="8 82" stroke-dashoffset="-72" transform="rotate(-90 40 20)"/></svg>';
      return o+'</span></span>';
    }
    if(kind==='graph'){
      var lc1=prtg?'#4F8FC9':(L.accent||'#4F8FC9'), lc2=prtg?'#8DB255':L.c.up;
      o+='<svg viewBox="0 0 80 38" width="100%" height="38" style="display:block;margin:0 auto;'+((bar||prtg)?'padding:2px 6px;box-sizing:border-box;':'')+'"><path d="M2 6H78M2 15H78M2 24H78" stroke="'+line+'" stroke-width="0.6"/><polyline points="2,30 12,22 22,25 32,14 42,18 52,9 62,15 78,6" fill="none" stroke="'+lc1+'" stroke-width="1.8" stroke-linejoin="round"/><polyline points="2,34 14,31 26,32 38,26 50,28 64,24 78,25" fill="none" stroke="'+lc2+'" stroke-width="1.6" stroke-linejoin="round"/></svg>';
      return o+'</span></span>';
    }
    if(kind==='gauge'){
      var gcol=prtg?'#2FA84F':L.c.up, trk=blend(cards?cardBg:'#FFFFFF',text,0.2);
      o+='<svg viewBox="0 0 80 50" width="100%" height="50" style="display:block;margin:0 auto;'+((bar||prtg)?'padding:2px 0;':'')+'"><path d="M23 45A24 24 0 1 1 57 45" fill="none" stroke="'+trk+'" stroke-width="7" stroke-linecap="round"/><path d="M23 45A24 24 0 0 1 52.9 7.8" fill="none" stroke="'+gcol+'" stroke-width="7" stroke-linecap="round"/><rect x="29" y="27" width="22" height="5" rx="2" fill="'+tint(text,0.8)+'"/><rect x="32" y="36" width="16" height="3" rx="1.5" fill="'+tint(text,0.4)+'"/></svg>';
      return o+'</span></span>';
    }
    var pad=(bar||prtg)?'padding:0 7px;':'';
    var hs=prtg?'plain':(L.headStyle||'fill');
    var hbg=(hs==='fill')?L.headBg:'transparent';
    var hb=(hs==='line')?'2px solid '+L.accent:'1px solid '+line;
    o+='<span style="display:flex;gap:6px;align-items:center;padding:3px 7px 3px 0;'+((bar||prtg)?'margin:0 7px;':'')+'background:'+hbg+';border-bottom:'+hb+';">';
    [24,16,20].forEach(function(w){o+='<i style="display:block;height:3px;width:'+w+'%;background:'+tint(headCol,0.85)+';border-radius:2px"></i>';});
    o+='</span>';
    var cols=prtg?['#2FA84F','#F0AD22','#D8402F']:[L.c.up,L.c.warning,L.c.down];
    var mode=prtg?'dot':L.status;
    for(var i=0;i<3;i++){
      o+='<span style="display:flex;align-items:center;gap:6px;padding:4px 0;'+pad+'border-bottom:'+(i<2?'1px solid '+line:'0')+';">';
      if(mode==='pill')o+='<i style="display:block;width:15px;height:6px;border-radius:4px;background:'+tint(cols[i],0.25)+';box-shadow:inset 0 0 0 1px '+tint(cols[i],0.7)+'"></i>';
      else if(mode==='text')o+='<i style="display:block;width:10px;height:3px;background:'+cols[i]+';border-radius:2px"></i>';
      else o+='<i style="display:block;width:6px;height:6px;border-radius:50%;background:'+cols[i]+'"></i>';
      o+='<i style="display:block;height:3px;width:30%;background:'+tint(text,0.5)+';border-radius:2px"></i>';
      o+='<i style="display:block;height:3px;width:22%;background:'+tint(text,0.3)+';border-radius:2px"></i>';
      o+='</span>';
    }
    return o+'</span></span>';
  }
  function drawGallery(){
    if(!galleryEl)return;
    galleryEl.innerHTML='';
    LOOKORDER.forEach(function(name){
      if(name==='PRTG default'&&(TYPE==='icon'||TYPE==='status'||(TYPE==='gauge'&&G.engine==='ring')||(TYPE==='donut'&&DN.engine==='ring')))return;
      var L=lookOf(name);
      var b=h('button','lookchip'+((M().look&&M().look.name===name)?' on':''));b.type='button';
      b.innerHTML=thumbHTML(L,TYPE)+'<span class="pname">'+name+'</span>';
      b.addEventListener('click',function(){M().look=lookOf(name);refreshUI();render();});
      galleryEl.appendChild(b);
    });
  }

  /* ---------- preview ---------- */
  var SAMPLE=[
    {g:'up',status:'Up',sensor:'Ping',device:'core-sw-01',path:'Local Probe > Berlin > core-sw-01',group:'Berlin',message:'OK',lastvalue:'12 msec',down:'',uptime:'99.98 %'},
    {g:'up',status:'Up',sensor:'HTTP',device:'web-01',path:'Local Probe > Berlin > web-01',group:'Berlin',message:'OK',lastvalue:'140 msec',down:'',uptime:'99.90 %'},
    {g:'warning',status:'Warning',sensor:'HTTP',device:'web-02',path:'Local Probe > Paris > web-02',group:'Paris',message:'Slow response',lastvalue:'1,850 msec',down:'',uptime:'99.10 %'},
    {g:'down',status:'Down',sensor:'SNMP Uptime',device:'fw-02',path:'Local Probe > Paris > fw-02',group:'Paris',message:'Timeout',lastvalue:'',down:'3 d 4 h',uptime:'94.20 %'},
    {g:'downack',status:'Down (Acknowledged)',sensor:'Ping',device:'ap-17',path:'Local Probe > Oslo > ap-17',group:'Oslo',message:'No reply',lastvalue:'',down:'9 h',uptime:'91.00 %'},
    {g:'unusual',status:'Unusual',sensor:'CPU Load',device:'db-01',path:'Local Probe > Berlin > db-01',group:'Berlin',message:'OK',lastvalue:'88 %',down:'',uptime:'99.70 %'},
    {g:'paused',status:'Paused',sensor:'Disk Free C:',device:'file-01',path:'Local Probe > Oslo > file-01',group:'Oslo',message:'Paused by user',lastvalue:'',down:'',uptime:'100 %'},
    {g:'unknown',status:'Unknown',sensor:'Memory',device:'lab-03',path:'Local Probe > Lab > lab-03',group:'Lab',message:'Waiting',lastvalue:'',down:'',uptime:''},
    {g:'up',status:'Up',sensor:'Ping',device:'dc-01',path:'Local Probe > Oslo > dc-01',group:'Oslo',message:'OK',lastvalue:'3 msec',down:'',uptime:'100 %'}
  ];
  function cell(k,r){
    if(k==='status')return r.status;
    if(k==='sensor')return r.sensor;
    if(k==='device')return r.device;
    if(k==='probegroupdevice')return r.path;
    if(k==='group')return r.group;
    if(k==='message')return r.message;
    if(k==='lastvalue')return r.lastvalue;
    if(k==='minigraph')return '\u2581\u2582\u2583\u2585\u2583\u2582';
    if(k==='priority')return '\u2605\u2605\u2605';
    if(k==='favorite')return '\u2606';
    if(k==='downtimesince')return r.down;
    if(k==='uptime')return r.uptime;
    return '';
  }
  function previewRows(){
    var rows=SAMPLE.filter(function(r){
      if(T.status.length&&T.status.indexOf(r.g)<0)return false;
      if(T.onlyValue&&!r.lastvalue)return false;
      return true;
    });
    var n=parseInt(T.count,10);
    if(n>0)rows=rows.slice(0,n);
    return rows;
  }
  /* PRTG's own base styling for tables in maps, so the preview shows what PRTG does to a custom look.
     The white wrapper uses an id selector, exactly as in PRTG, so only !important can beat it. */
  var PRTGBASE=':where(#opreview){font-family:"Segoe UI",Tahoma,Arial,Helvetica,Verdana,sans-serif;color:#575756;}'
    +':where(#opreview) #mapshow .table-wrapper{background-color:#fff;width:100%;padding:2px;margin:0;}'
    +':where(#opreview) .map_table table{width:100%;table-layout:auto;border-collapse:separate;border-spacing:0;}'
    +':where(#opreview) .map_table table td,:where(#opreview) .map_table table td *{max-width:none;white-space:normal;}'
    +':where(#opreview) .map_object .tabletitle{font-size:1.2rem;font-weight:400;color:#00a3da;padding:10px 0 4px 12px;text-transform:capitalize;}'
    +':where(#opreview) .table th{color:#575756;padding:15px 10px 3px;text-align:left;vertical-align:baseline;font-weight:500;font-size:12px;}'
    +':where(#opreview) .table .headerswithlinks th{padding-top:25px;border-bottom:1px solid #efeeee;}'
    +':where(#opreview) form .table .headerswithlinks th{padding-top:25px;border-bottom:1px solid #efeeee;}'
    +':where(#opreview) .table td{padding:9px 10px;border-bottom:1px solid #ececec;font-size:12.5px;}'
    +':where(#opreview) .table td a{color:#575756;text-decoration:none;}'
    +':where(#opreview) .table td .parentItem,:where(#opreview) .table td .parentItem *{color:#9a9b9b;font-size:.78rem;}';
  /* ---------- editing in the preview: resize, rotate, edit and move the title (tables first) ---------- */
  var edBusy=false;
  var ED={on:true,x:120,y:80,sel:null};   /* the box starts well in from the edge: room to grow to the left and above, and for the rotate handle */
  function edOn(){return TYPE==='table'&&ED.on;}
  function rotXY(dx,dy,deg){var a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [dx*c-dy*s,dx*s+dy*c];}
  function edRot(){return tableRot(T);}
  function edCursor(sx,sy){
    var a=Math.atan2(sy,sx)*180/Math.PI+edRot();a=((a%180)+180)%180;
    if(a<22.5||a>=157.5)return 'ew-resize';
    if(a<67.5)return 'nwse-resize';
    if(a<112.5)return 'ns-resize';
    return 'nesw-resize';
  }
  function edTag(){
    var tg=document.getElementById('edtag'),wr=document.getElementById('edwrap');
    if(tg&&wr)tg.textContent=Math.round(wr.offsetWidth)+' \u00D7 '+Math.round(wr.offsetHeight)+' px'+(edRot()?'  \u00B7  '+edRot()+'\u00B0':'');
  }
  function edLiveCode(){codeEl.value=buildTable(T);edTag();}
  function edApplyBox(wr){wr.style.left=Math.round(ED.x)+'px';wr.style.top=Math.round(ED.y)+'px';}
  /* keep the turned box on the stage: the rotated rectangle's own bounding box must not poke out above or to the left */
  function edFit(){
    var wr=document.getElementById('edwrap');if(!wr||!wr.offsetWidth)return;
    var W=wr.offsetWidth,H=wr.offsetHeight,a=edRot()*Math.PI/180,hw=(Math.abs(Math.cos(a))*W+Math.abs(Math.sin(a))*H)/2,hh=(Math.abs(Math.sin(a))*W+Math.abs(Math.cos(a))*H)/2;
    var cx=ED.x+W/2,cy=ED.y+H/2,nx=Math.max(cx,hw+60),ny=Math.max(cy,hh+60);
    ED.x+=nx-cx;ED.y+=ny-cy;edApplyBox(wr);
    prevEl.style.minHeight=Math.round(ED.y+H/2+hh+60)+'px';
  }
  function edBuildOverlay(wr){
    var ov=h('div','edov');wr.appendChild(ov);
    ov.appendChild(h('div','edframe'));
    [['nw',-1,-1],['n',0,-1],['ne',1,-1],['e',1,0],['se',1,1],['s',0,1],['sw',-1,1],['w',-1,0]].forEach(function(d){
      var e=h('div','edh');e.setAttribute('data-h',d[0]);e.style.left=((d[1]+1)*50)+'%';e.style.top=((d[2]+1)*50)+'%';e.style.cursor=edCursor(d[1],d[2]);
      e.addEventListener('pointerdown',function(ev){edStartResize(ev,d[1],d[2]);});
      ov.appendChild(e);
    });
    ov.appendChild(h('div','edrotline'));
    var rh=h('div','edrot');rh.addEventListener('pointerdown',function(ev){edStartRotate(ev);});ov.appendChild(rh);
    var tg=h('div','edtag');tg.id='edtag';ov.appendChild(tg);
    edTag();
  }
  function edTrack(onMove,onUp){
    edBusy=true;
    function mv(e){onMove(e);}
    function up(e){edBusy=false;window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);onUp(e);}
    window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
  }
  function edStartResize(ev,sx,sy){
    var wr=document.getElementById('edwrap');if(!wr)return;
    ev.preventDefault();ev.stopPropagation();
    var S={x0:ev.clientX,y0:ev.clientY,W:wr.offsetWidth,H:wr.offsetHeight,rot:edRot()};S.cx=ED.x+S.W/2;S.cy=ED.y+S.H/2;
    var root=wr.querySelector('.map_object');
    edTrack(function(e){
      var d=rotXY(e.clientX-S.x0,e.clientY-S.y0,-S.rot), nw=S.W, nh=S.H;
      if(sx)nw=Math.max(80,S.W+sx*d[0]);
      if(sy)nh=Math.max(40,S.H+sy*d[1]);
      if(e.shiftKey&&sx&&sy){var k=Math.max(nw/S.W,nh/S.H);nw=Math.max(80,S.W*k);nh=Math.max(40,S.H*k);}
      nw=Math.round(nw);nh=Math.round(nh);
      var f=[-sx*S.W/2,-sy*S.H/2], f2=[-sx*nw/2,-sy*nh/2], dd=rotXY(f[0]-f2[0],f[1]-f2[1],S.rot);   // the opposite edge stays where it is on screen
      ED.x=S.cx+dd[0]-nw/2;ED.y=S.cy+dd[1]-nh/2;
      wr.style.width=nw+'px';wr.style.height=nh+'px';if(root)root.style.height='100%';
      edApplyBox(wr);T.initW=nw;T.initH=nh;edLiveCode();
    },function(){refreshUI();render();});
  }
  function edStartRotate(ev){
    var wr=document.getElementById('edwrap');if(!wr)return;
    ev.preventDefault();ev.stopPropagation();
    edTrack(function(e){
      var r=wr.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      var a=Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI+90;
      if(e.shiftKey)a=Math.round(a/15)*15;
      a=((a+180)%360+360)%360-180;if(a===-180)a=180;a=Math.round(a);
      T.rot=a;wr.style.transform='rotate('+a+'deg)';edLiveCode();
    },function(){refreshUI();render();});
  }
  function edTitleLocal(t){
    var wr=document.getElementById('edwrap');if(!wr||!t||!t.getBoundingClientRect)return null;
    var wb=wr.getBoundingClientRect(),tb=t.getBoundingClientRect(),W=wr.offsetWidth,H=wr.offsetHeight,w=t.offsetWidth,h_=t.offsetHeight;
    var c=rotXY(tb.left+tb.width/2-(wb.left+wb.width/2),tb.top+tb.height/2-(wb.top+wb.height/2),-edRot());
    return {L:W/2+c[0]-w/2,T:H/2+c[1]-h_/2,w:w,h:h_,W:W,H:H};
  }
  /* a title can be dragged anywhere, but never completely out of its table: at least a strip of it stays inside, so it can always be grabbed again */
  function edClampOff(loc,ox0,oy0,ox,oy){
    if(!loc)return [ox,oy];
    var kx=Math.min(24,loc.w/2), ky=Math.min(24,loc.h/2);
    return [Math.round(Math.max(ox0+(kx-loc.w-loc.L),Math.min(ox0+(loc.W-kx-loc.L),ox))),Math.round(Math.max(oy0+(ky-loc.h-loc.T),Math.min(oy0+(loc.H-ky-loc.T),oy)))];
  }
  function edSelectTitle(on){
    ED.sel=on?'title':null;
    var t=prevEl.querySelector('.tabletitle');if(t)t.classList[on?'add':'remove']('edsel');
  }
  function edStartTitleDrag(ev,t){
    ev.preventDefault();
    var wasSel=(ED.sel==='title');edSelectTitle(true);
    var S={x0:ev.clientX,y0:ev.clientY,ox:Number(T.tOffX)||0,oy:Number(T.tOffY)||0,rot:edRot()},moved=false;
    S.loc=edTitleLocal(t);
    edTrack(function(e){
      var dx=e.clientX-S.x0,dy=e.clientY-S.y0;
      if(!moved&&Math.hypot(dx,dy)<3)return;
      moved=true;
      var d=rotXY(dx,dy,-S.rot);
      var cl=edClampOff(S.loc,S.ox,S.oy,S.ox+d[0],S.oy+d[1]);
      T.tOffX=cl[0];T.tOffY=cl[1];
      t.style.position='relative';t.style.left=T.tOffX+'px';t.style.top=T.tOffY+'px';
      edLiveCode();
    },function(){if(moved){refreshUI();render();}else if(wasSel)edEditTitle(t);});   // a click on a selected title edits it; a drag moves it
  }
  var edInput=null;
  /* The title is edited in a plain text box laid over it, with fixed dark-on-white styling. It does not depend on the look's colours, its CSS or the browser's
     handling of an editable heading, so what you type is always readable. The real title is hidden underneath until you finish. */
  function edEditTitle(t){
    var wr=document.getElementById('edwrap');
    if(!wr||!t||edInput)return;
    edSelectTitle(true);
    var loc=edTitleLocal(t)||{L:0,T:0,w:wr.offsetWidth,h:36}, cs=window.getComputedStyle?window.getComputedStyle(t):null;
    var fs=cs?Math.max(13,Math.min(26,parseFloat(cs.fontSize)||15)):15, W=wr.offsetWidth, H=wr.offsetHeight;
    var w=Math.max(200,Math.min(loc.w||W,W)), hh=Math.max(32,Math.min(loc.h||36,56));
    var left=Math.max(0,Math.min(loc.L||0,W-w)), top=Math.max(0,Math.min(loc.T||0,H-hh));
    var inp=document.createElement('input');inp.type='text';inp.className='edtitlebox';inp.value=T.title||'';inp.setAttribute('aria-label','Title');
    inp.style.left=left+'px';inp.style.top=top+'px';inp.style.width=w+'px';inp.style.height=hh+'px';inp.style.fontSize=fs+'px';
    wr.appendChild(inp);edInput=inp;t.style.visibility='hidden';
    inp.focus();inp.select();
    var done=false;
    function finish(save){
      if(done)return;done=true;edInput=null;
      var v=clean(String(inp.value||'').replace(/\s+/g,' ')).trim();
      if(inp.parentNode)inp.parentNode.removeChild(inp);
      t.style.visibility='';
      if(save&&v!==String(T.title||'')){if(v){T.title=v;T.titleObj=false;T.showTitle=true;}else{T.showTitle=false;}refreshUI();render();}
    }
    inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();finish(true);}else if(e.key==='Escape'){e.preventDefault();finish(false);}e.stopPropagation();});
    inp.addEventListener('pointerdown',function(e){e.stopPropagation();});
    inp.addEventListener('blur',function(){finish(true);});
  }
  function edWire(){
    prevEl.addEventListener('pointerdown',function(ev){
      /* a click in the preview takes keyboard focus away from the type grid, so the arrow keys belong to the preview again */
      var ae0=document.activeElement;if(ae0&&ae0.closest&&ae0.closest('#typegrid')&&ae0.blur)ae0.blur();
      if(!edOn())return;
      var t=ev.target&&ev.target.closest?ev.target.closest('.tabletitle'):null;
      if(t){if(edInput)return;edStartTitleDrag(ev,t);}
      else if(!(ev.target.closest&&ev.target.closest('.edov'))&&ED.sel)edSelectTitle(false);
    });
    prevEl.addEventListener('dblclick',function(ev){
      if(!edOn())return;
      var t=ev.target&&ev.target.closest?ev.target.closest('.tabletitle'):null;
      if(t&&!edInput){ev.preventDefault();edEditTitle(t);}
    });
    document.addEventListener('keydown',function(ev){
      if(!edOn()||ED.sel!=='title')return;
      var ae=document.activeElement;if(ae&&(ae.isContentEditable||/^(INPUT|SELECT|TEXTAREA)$/.test(ae.tagName)))return;
      if(ev.key==='Enter'||ev.key==='F2'){var tt0=prevEl.querySelector('.tabletitle');if(tt0&&!edInput){ev.preventDefault();edEditTitle(tt0);}return;}
      var st=ev.shiftKey?10:1,dx=0,dy=0;
      if(ev.key==='ArrowLeft')dx=-st;else if(ev.key==='ArrowRight')dx=st;else if(ev.key==='ArrowUp')dy=-st;else if(ev.key==='ArrowDown')dy=st;
      else if(ev.key==='Escape'){edSelectTitle(false);return;}
      else return;
      ev.preventDefault();
      var tt=prevEl.querySelector('.tabletitle'), ox0=Number(T.tOffX)||0, oy0=Number(T.tOffY)||0, cl=edClampOff(edTitleLocal(tt),ox0,oy0,ox0+dx,oy0+dy);
      T.tOffX=cl[0];T.tOffY=cl[1];
      refreshUI();render();
    });
  }

  /* ---------- hands-on editing for the other object types: a frame with handles on the preview sets the size the file starts at, and a double-click on the title types a new one ---------- */
  var EO={ov:null,inp:null};
  function eoModel(){return TYPE==='gauge'?G:(TYPE==='donut'?DN:(TYPE==='graph'?GR:(TYPE==='icon'?IC:(TYPE==='status'?SC:null))));}
  function eoText(){return TYPE==='gauge'?buildGauge(G):(TYPE==='donut'?buildDonut(DN):(TYPE==='status'?buildStatus(SC):(TYPE==='graph'?buildGraph(GR):buildIcon(IC))));}
  function eoOk(){return CFG.edit.types.indexOf(TYPE)>-1&&!!eoModel()&&!(TYPE==='icon'&&IC.engine==='stock');}
  function eoSz(m,w,h_){var a=parseInt(m.initW,10), b=parseInt(m.initH,10);return [a>0?a:w,b>0?b:h_];}
  function eoBox(){
    var ms=document.getElementById('mapshow'), root=prevEl.querySelector('.map_object'), ov=EO.ov, mr, rr;
    if(!ms||!root||!ov)return;
    mr=ms.getBoundingClientRect();rr=root.getBoundingClientRect();
    ov.style.left=Math.round(rr.left-mr.left)+'px';ov.style.top=Math.round(rr.top-mr.top)+'px';ov.style.width=Math.round(rr.width)+'px';ov.style.height=Math.round(rr.height)+'px';
  }
  function eoTag(){var t=document.getElementById('eotag'), root=prevEl.querySelector('.map_object');if(t&&root)t.textContent=Math.round(root.offsetWidth)+' \u00D7 '+Math.round(root.offsetHeight)+' px';}
  function eoAttach(){
    var ms, root, ov, tag;
    EO.ov=null;EO.inp=null;
    if(!eoOk())return;
    ms=document.getElementById('mapshow');root=prevEl.querySelector('.map_object');
    if(!ms||!root)return;
    ms.classList.add('eoon');ms.style.position='relative';ms.style.padding='40px 76px 60px 40px';
    ov=h('div','edov');ov.style.right='auto';ov.style.bottom='auto';ms.appendChild(ov);EO.ov=ov;
    ov.appendChild(h('div','edframe'));
    [['e',1,0],['s',0,1],['se',1,1]].forEach(function(d){
      var e=h('div','edh');e.setAttribute('data-h',d[0]);e.style.left=(d[1]?100:50)+'%';e.style.top=(d[2]?100:50)+'%';
      e.style.cursor=(d[0]==='e')?'ew-resize':((d[0]==='s')?'ns-resize':'nwse-resize');
      e.addEventListener('pointerdown',function(ev){eoResize(ev,d[1],d[2]);});
      ov.appendChild(e);
    });
    tag=h('div','edtag');tag.id='eotag';ov.appendChild(tag);
    eoBox();eoTag();
  }
  function eoResize(ev,sx,sy){
    var root=prevEl.querySelector('.map_object'), m=eoModel(), W0, H0, x0=ev.clientX, y0=ev.clientY;
    if(!root||!m)return;
    ev.preventDefault();ev.stopPropagation();
    W0=root.offsetWidth;H0=root.offsetHeight;
    edTrack(function(e){
      var minW=(TYPE==='icon')?12:60, minH=(TYPE==='icon')?12:40, nw=sx?Math.max(minW,Math.round(W0+e.clientX-x0)):W0, nh=sy?Math.max(minH,Math.round(H0+e.clientY-y0)):H0, k;
      if(e.shiftKey&&sx&&sy){k=Math.max(nw/W0,nh/H0);nw=Math.round(Math.max(minW,W0*k));nh=Math.round(Math.max(minH,H0*k));}
      [].forEach.call(prevEl.querySelectorAll('.map_object'),function(r){r.style.width=nw+'px';r.style.height=nh+'px';});
      m.initW=nw;m.initH=nh;eoBox();eoTag();codeEl.value=eoText();
    },function(){refreshUI();render();});
  }
  /* the title is typed in a plain box laid over it, readable whatever the look's colours are */
  function eoEditTitle(t){
    var ms=document.getElementById('mapshow'), m=eoModel(), mr, tr, cs, fs, w, hh, inp, first, done=false;
    if(!ms||!t||!m||EO.inp)return;
    mr=ms.getBoundingClientRect();tr=t.getBoundingClientRect();cs=window.getComputedStyle(t);
    fs=Math.max(13,Math.min(26,parseFloat(cs.fontSize)||15));w=Math.max(200,Math.round(tr.width));hh=Math.max(32,Math.min(Math.round(tr.height)||36,56));
    inp=document.createElement('input');inp.type='text';inp.className='edtitlebox';inp.setAttribute('aria-label','Title');
    inp.value=(m.titleMode==='custom')?(m.title||''):String(t.textContent||'').trim();first=inp.value;
    inp.style.left=Math.round(tr.left-mr.left)+'px';inp.style.top=Math.round(tr.top-mr.top)+'px';inp.style.width=w+'px';inp.style.height=hh+'px';inp.style.fontSize=fs+'px';
    ms.appendChild(inp);EO.inp=inp;t.style.visibility='hidden';inp.focus();inp.select();
    function finish(save){
      var v;
      if(done)return;done=true;EO.inp=null;
      v=clean(String(inp.value||'').replace(/\s+/g,' ')).trim();
      if(inp.parentNode)inp.parentNode.removeChild(inp);
      t.style.visibility='';
      if(save&&v!==first){if(v){m.titleMode='custom';m.title=v;}else{m.titleMode='none';}refreshUI();render();}
    }
    inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();finish(true);}else if(e.key==='Escape'){e.preventDefault();finish(false);}e.stopPropagation();});
    inp.addEventListener('pointerdown',function(e){e.stopPropagation();});
    inp.addEventListener('blur',function(){finish(true);});
  }
  function eoWire(){
    prevEl.addEventListener('dblclick',function(ev){
      var t;
      if(!eoOk())return;
      t=ev.target&&ev.target.closest?ev.target.closest('.gtitle'):null;
      if(t&&!EO.inp){ev.preventDefault();eoEditTitle(t);}
    });
  }

  /* ---------- undo, redo and reset: every object type keeps its own history ---------- */
  var HIST={}, HLOCK=false, undoBtn=null, redoBtn=null;
  function hModelGet(k){return k==='table'?T:(k==='gauge'?G:(k==='graph'?GR:(k==='donut'?DN:(k==='icon'?IC:(k==='status'?SC:(FRM[k]||(FRM[k]=blankFR(k))))))));}
  function hModelSet(k,m){if(k==='table')T=m;else if(k==='gauge')G=m;else if(k==='graph')GR=m;else if(k==='donut')DN=m;else if(k==='icon')IC=m;else if(k==='status')SC=m;else FRM[k]=m;}
  function hUpdate(){
    var h_=HIST[TYPE];
    if(undoBtn)undoBtn.disabled=!(h_&&h_.i>0);
    if(redoBtn)redoBtn.disabled=!(h_&&h_.i<h_.s.length-1);
  }
  /* called after every render: if the model changed, it is a new step. A burst of edits within 600 ms (typing, a spinner) counts as one. */
  function hRecord(){
    if(HLOCK||isLegacy(TYPE))return;
    var k=TYPE, h_=HIST[k]||(HIST[k]={s:[],i:-1,t:0}), s=JSON.stringify(hModelGet(k)), now=Date.now();
    if(h_.i>=0&&h_.s[h_.i]===s){hUpdate();return;}   /* nothing changed, but this may be a different type than the buttons last described */
    if(h_.i<0){h_.s=[s];h_.i=0;h_.t=now;hUpdate();return;}
    h_.s=h_.s.slice(0,h_.i+1);
    if(h_.i>=1&&now-h_.t<600)h_.s[h_.i]=s;
    else{h_.s.push(s);h_.i=h_.s.length-1;if(h_.s.length>100){h_.s.shift();h_.i--;}}
    h_.t=now;hUpdate();
  }
  function hStep(delta){
    if(isLegacy(TYPE))return false;
    var h_=HIST[TYPE];if(!h_)return false;
    var ni=h_.i+delta;if(ni<0||ni>=h_.s.length)return false;
    HLOCK=true;
    try{
      h_.i=ni;h_.t=0;
      hModelSet(TYPE,JSON.parse(h_.s[ni]));
      ED.sel=null;buildPresetOptions();refreshUI();render();
    }finally{HLOCK=false;}
    hUpdate();return true;
  }
  function resetCurrent(){
    var k=TYPE;
    if(isLegacy(k))return;
    if(k==='table')T=blankT();else if(k==='gauge')G=blankG();else if(k==='graph')GR=blankGR();else if(k==='donut')DN=blankD();else if(k==='icon')IC=blankI();else if(k==='status')SC=blankSC();else FRM[k]=blankFR(k);
    ED.sel=null;buildPresetOptions();refreshUI();render();
    toast('Reset. Ctrl+Z brings it back.');
  }
  function hWire(){
    document.addEventListener('keydown',function(ev){
      if(!OBJAPI.active||isLegacy(TYPE)||!(ev.ctrlKey||ev.metaKey)||edBusy)return;
      var key=String(ev.key).toLowerCase();if(key!=='z'&&key!=='y')return;
      var ae=document.activeElement;
      /* a text box keeps its own undo for the text being typed; everything else (the preview, buttons, selects, checkboxes) is ours */
      if(ae&&(ae.isContentEditable||ae.tagName==='TEXTAREA'||(ae.tagName==='INPUT'&&/^(text|number|search|url|email|tel|password)$/.test(ae.type))))return;
      ev.preventDefault();
      if(key==='y'||(key==='z'&&ev.shiftKey))hStep(1);else hStep(-1);
    });
  }

  function drawTablePreview(){
    edInput=null;
    var cls=classOf(T), css=tableCss(T,cls,{preview:true}), js=tableScript(T,cls), L=T.look;
    var st=document.getElementById('opstyle');
    if(!st){st=h('style');st.id='opstyle';document.head.appendChild(st);}
    st.textContent=PRTGBASE+'\n'+css;
    var fl=document.getElementById('opfont');
    if(needsFontLink(L)){
      if(!fl){fl=h('link');fl.id='opfont';fl.rel='stylesheet';document.head.appendChild(fl);}
      fl.setAttribute('href',/href="([^"]+)"/.exec(fontLinkOf(L))[1]);
    }else if(fl){fl.removeAttribute('href');}
    var title='';
    if(T.showTitle!==false)title=clean(T.title)+(T.titleObj?' (object name)':'');
    var w=parseInt(document.getElementById('owidth').value,10)||0;
    var th='',rows=previewRows(),i;
    T.cols.forEach(function(k){th+='<th class="col-'+k+'">'+colLabel(k)+'</th>';});
    function cellHtml(k,r){
      var t=esc(cell(k,r));
      if(k==='sensor'||k==='device')return '<a href="#">'+t+'</a>';
      if(k==='probegroupdevice')return '<span class="parentItem">'+t+'</span>';
      return t;
    }
    var tb='';
    rows.forEach(function(r,ri){
      tb+='<tr class="'+(ri%2?'even':'odd')+' sg">';
      T.cols.forEach(function(k){tb+='<td class="col-'+k+'">'+cellHtml(k,r)+'</td>';});
      tb+='</tr>';
    });
    if(!rows.length)tb='<tr><td colspan="'+T.cols.length+'">No sample sensors match these filters.</td></tr>';
    prevEl.className='';
    var cv=document.getElementById('ocanvas'), avail=Math.max(320,(cv&&cv.clientWidth?cv.clientWidth:900)-2*ED.x);
    var W=(parseInt(T.initW,10)>0)?parseInt(T.initW,10):(w>0?w:avail), Hset=(parseInt(T.initH,10)>0)?parseInt(T.initH,10):0, rot=edRot();
    /* the preview turns a wrapper, so its handles turn with it; the file turns the inner container (see tableExtraCss) and looks the same */
    prevEl.innerHTML='<div id="mapshow" style="position:relative"><div class="edwrap'+(edOn()?' edon':'')+'" id="edwrap" style="position:absolute;left:'+Math.round(ED.x)+'px;top:'+Math.round(ED.y)+'px;width:'+W+'px;'+(Hset?'height:'+Hset+'px;':'')+(rot?'transform:rotate('+rot+'deg);transform-origin:50% 50%;':'')+'">'
      +'<div class="map_object map_table '+cls+'" style="position:relative;overflow:auto;width:100%;'+(Hset?'height:100%;':'')+'">'
      +'<div class="maptablecontainer" style="overflow:hidden"><div class="prtg-plugin"><div class="table-wrapper"><form class="form-sensors">'
      +'<div class="tabletitle">'+esc(title)+'</div>'
      +'<table class="table hoverable sensors"><thead class="headerswithlinks"><tr>'+th+'</tr></thead><tbody>'+tb+'</tbody></table>'
      +'</form></div></div></div></div></div></div>';
    applyBg(L);
    try{
      prevEl.style.minHeight='';
      var wr=document.getElementById('edwrap');
      if(wr){
        if(edOn())edBuildOverlay(wr);
        edFit();
        if(ED.sel==='title'&&edOn()){var tt=prevEl.querySelector('.tabletitle');if(tt)tt.classList.add('edsel');}
      }
    }catch(err){if(window.console)console.error('preview editing',err);}
    if(js){
      try{
        var _L=T.look, _dots=(_L.status==='dot'||_L.status==='dottext'), _pills=(_L.status==='pill'), _tn=!!_L.tint;
        if(_L.mode!=='prtg'&&T.cols.indexOf('status')>=0&&(_dots||_pills||_tn)){
          tablePaintOnce(cls,{up:_L.c.up,warning:_L.c.warning,down:_L.c.down,unusual:_L.c.unusual,paused:_L.c.paused,unknown:_L.c.unknown},_dots,_pills,_tn);
        }
      }catch(err){if(window.console)console.error('preview script',err);}
    }
  }


  /* ---------- gauge preview ---------- */
  function applyBg(L){
    var bgm=document.getElementById('obg').value, cv=document.getElementById('ocanvas');
    cv.classList.remove('dark');cv.style.backgroundColor='';cv.style.backgroundImage='';
    if(bgm==='dark')cv.classList.add('dark');
    else if(bgm==='look'&&L.mode==='custom'&&L.stage){cv.style.backgroundColor=L.stage;cv.style.backgroundImage='none';}
  }
  function applyFont(L){
    var fl=document.getElementById('opfont');
    if(needsFontLink(L)){
      if(!fl){fl=h('link');fl.id='opfont';fl.rel='stylesheet';document.head.appendChild(fl);}
      fl.setAttribute('href',/href="([^"]+)"/.exec(fontLinkOf(L))[1]);
    }else if(fl){fl.removeAttribute('href');}
  }
  function setStyle(text){
    var st=document.getElementById('opstyle');
    if(!st){st=h('style');st.id='opstyle';document.head.appendChild(st);}
    st.textContent=text;
  }
  /* what PRTG itself applies to its gauge boxes in a map, at PRTG's own specificity (from main.css) */
  var PRTGGAUGE=':where(#opreview){font-family:"Segoe UI",Tahoma,Arial,Helvetica,Verdana,sans-serif;color:#575756;}'
    +':where(#opreview) .achannel{display:block;float:left;background-color:#fff;width:148px;height:63px;position:relative;margin-bottom:10px;margin-right:6px;border-bottom:1px solid #d6d7d8;}'
    +':where(#opreview) .achannel .channelname{max-width:128px;left:23px;position:absolute;top:3px;display:inline-block;font-size:.8rem;font-weight:600;}'
    +':where(#opreview) .achannel .channelmessage,:where(#opreview) .achannel .channelsubname{max-width:68.8px;left:23px;position:absolute;display:inline-block;}'
    +':where(#opreview) .achannel .channelmessage{top:16px;font-size:.8rem;}'
    +':where(#opreview) .achannel .channelsubname{bottom:14px;font-size:.7rem;}'
    +':where(#opreview) .achannel .channelvalue{max-width:80.64px;left:23px;position:absolute;bottom:3px;display:inline-block;font-size:.8rem;font-weight:600;}'
    +':where(#opreview) .achannel.primary{width:301px;height:209px;}'
    +':where(#opreview) .achannel.primary .channelgauge{padding-top:8px;}'
    +':where(#opreview) .achannel.primary .channelname,:where(#opreview) .achannel.primary .channelvalue{font-size:1rem;}'
    +':where(#opreview) .achannel.primary .channelmessage{top:18px;bottom:33px;font-size:.9rem;white-space:normal;max-width:calc(40% - 5px - 18px);height:155px;overflow-y:hidden;}'
    +':where(#opreview) .achannel.primary .channelsubname{bottom:20px;font-size:.8rem;}'
    +':where(#opreview) .achannel.primary .channelname{max-width:172px;left:23px;}'
    +':where(#opreview) .achannel.primary .channelmessage,:where(#opreview) .achannel.primary .channelsubname{max-width:95.2px;left:23px;}'
    +':where(#opreview) .achannel.primary .channelvalue{max-width:110.56px;left:23px;}'
    +':where(#opreview) .map-body .achannel.primary .channelname{max-width:238px;left:23px;}'
    +':where(#opreview) .map-body .achannel.primary .channelmessage,:where(#opreview) .map-body .achannel.primary .channelsubname{max-width:134.8px;left:23px;}'
    +':where(#opreview) .map-body .achannel.primary .channelvalue{max-width:155.44px;left:23px;}'
    +':where(#opreview) .achannel>a{display:block;width:100%;height:100%;color:#575756;text-decoration:none;}'
    +':where(#opreview) .achannel:before{content:"";position:absolute;left:0;top:0;bottom:0;border-bottom:1px solid #d6d7d8;width:18px;background-color:transparent;}'
    +':where(#opreview) .achannel .channelgauge{padding-top:13px;height:47px;margin-bottom:15px;float:right;}'
    +':where(#opreview) .achannel .channelsettings{position:absolute;right:0;bottom:0;color:#d6d7d8;font-size:.7rem;}'
    +':where(#opreview) .achannel.status3:before{background-color:#b8c419;}'
    +':where(#opreview) .achannel.status4:before{background-color:#f5c500;}'
    +':where(#opreview) .achannel.status5:before,:where(#opreview) .achannel.status14:before{background-color:#e30613;}'
    +':where(#opreview) .achannel.status4{border-bottom:1px solid #f5c500;}'
    +':where(#opreview) .achannel.status5,:where(#opreview) .achannel.status14{border-bottom:1px solid #e30613;}'
    +':where(#opreview) .gauge .status0,:where(#opreview) .gauge .status1,:where(#opreview) .gauge .status2,:where(#opreview) .gauge .status6{fill:#efeeee;stroke:#f7f7f7;}'
    +':where(#opreview) .gauge .status3{fill:#b8c419;stroke:#b8c419;}'
    +':where(#opreview) .gauge .status4{fill:#f5c500;stroke:#f5c500;}'
    +':where(#opreview) .gauge .status5,:where(#opreview) .gauge .status14{fill:#e30613;stroke:#e30613;}'
    +':where(#opreview) .gauge .status10{fill:#f59c00;stroke:#f59c00;}'
    +':where(#opreview) .gauge .status13{fill:#e67278;stroke:#e67278;}'
    +':where(#opreview) .gauge .status7,:where(#opreview) .gauge .status8,:where(#opreview) .gauge .status9,:where(#opreview) .gauge .status11,:where(#opreview) .gauge .status12{fill:#477ec0;stroke:#477ec0;}'
    +':where(#opreview) .gauge .needle{fill:#575756;fill-opacity:.8;}'
    +':where(#opreview) .gauge .backgroundfill{fill:#fff;}';
  /* PRTG's own gauge (d3.gauge.js), redrawn with the same geometry, class names and inline label styles */
  function stockSvg(size,info){
    var S=size*0.9, R=S*0.97/2, cx=S/2, cy=S/2;
    function num(v){return (v===''||v===null||v===undefined)?null:Number(v);}
    var min=num(info.graphminraw), max=num(info.graphmaxraw), val=num(info.lastvalueraw), st=Number(info.status);
    var gray=(min===null||max===null||val===null);
    var o='<svg class="gauge" width="'+S+'" height="'+(S*0.9+20)+'">';
    function deg(v){return v/1000*270-45;}
    function rad(v){return deg(v)*Math.PI/180;}
    function band(from,to,cls){
      if(to-from<=0)return '';
      var a0=rad(from),a1=rad(to),r=0.85*R;
      return '<path class="'+cls+'" d="M'+(r*Math.sin(a0)).toFixed(2)+','+(-r*Math.cos(a0)).toFixed(2)+'A'+r.toFixed(2)+','+r.toFixed(2)+' 0 '+((a1-a0)>Math.PI?1:0)+',1 '+(r*Math.sin(a1)).toFixed(2)+','+(-r*Math.cos(a1)).toFixed(2)+'L0,0Z" transform="translate('+cx+', '+cy+') rotate(270)"></path>';
    }
    var paused=(st===7||st===8||st===9||st===11||st===12);
    if(gray||paused){o+=band(0,1000,paused?'status'+st:'status0');}
    else{
      var scale=max-min;
      function f(v){return Math.round((v-min)/scale*1000);}
      o+=band(0,1000,'status3');
      if(info.limitmode){
        var wl=num(info.limitminwarning),wh=num(info.limitmaxwarning),el2=num(info.limitminerror),eh=num(info.limitmaxerror);
        if(wl!==null)o+=band(0,f(wl),'status4'); if(el2!==null)o+=band(0,f(el2),'status5');
        if(wh!==null)o+=band(f(wh),1000,'status4'); if(eh!==null)o+=band(f(eh),1000,'status5');
      }
    }
    o+='<circle cx="'+(cx-S*0.05)+'" cy="'+(cy+S*0.05)+'" r="'+(R*0.6)+'" class="backgroundfill"></circle>';
    if(S>90){
      var lab=function(v,dx,txt){var t=v;var x=cx-R*0.63*Math.cos(rad(v)),y=cy-R*0.63*Math.sin(rad(v));
        return '<text x="'+(x+dx).toFixed(1)+'" y="'+(y+S*0.15+12).toFixed(1)+'" dy="4" text-anchor="middle" style="font-family:&quot;Segoe UI&quot;,Tahoma,Arial,sans-serif;font-size:12px;fill:#333;stroke-width:0px">'+txt+'</text>';};
      o+=lab(0,-S*0.05,(min===null?0:min))+lab(1000,S*0.05,(max===null?1000:max));
    }
    if(!gray&&!paused&&val!==null){
      var a=deg((val-min)/(max-min)*1000)+270, rr=R*1.1;
      var P=[[0,-0.8],[0.04,0.05],[0.03,0.1],[-0.03,0.1],[-0.04,0.05]].map(function(p){return (p[0]*rr).toFixed(1)+','+(p[1]*rr).toFixed(1);});
      o+='<g class="pointerContainer" transform="translate('+cx+','+cy+') rotate('+a+')"><path class="needle" d="M'+P.join('L')+'Z"></path></g>';
    }
    return o+'</svg>';
  }
  function stockChannel(info,primary,txt,withStatus){
    var inner='<span class="channelname">'+esc(info.name)+'</span><span class="channelgauge">'+stockSvg(primary?220:56,info)+'</span><span class="channelvalue">'+esc(txt)+'</span><span class="channelsettings"><i class="glyph-cog"></i></span>';
    return '<div class="achannel'+(primary?' primary':'')+' channeledit"'+(withStatus?'':'')+'>'+inner+'</div>';
  }
  var SAMPLE_SENSORS=[
    {sensor:'Ping',message:'OK',info:{id:11,name:'Ping Time',status:3,lastvalueraw:12,lastvalue:'12 msec',graphminraw:0,graphmaxraw:200,limitmode:1,limitminwarning:'',limitmaxwarning:100,limitminerror:'',limitmaxerror:150}},
    {sensor:'CPU Load',message:'OK',info:{id:12,name:'Total',status:3,lastvalueraw:38,lastvalue:'38 %',graphminraw:0,graphmaxraw:100,limitmode:1,limitminwarning:'',limitmaxwarning:70,limitminerror:'',limitmaxerror:90}},
    {sensor:'Disk Free C:',message:'Low space',info:{id:13,name:'Free Space',status:4,lastvalueraw:78,lastvalue:'78 %',graphminraw:0,graphmaxraw:100,limitmode:1,limitminwarning:'',limitmaxwarning:70,limitminerror:'',limitmaxerror:90}}
  ];
  function stockInner(G0){
    var chs=sampleChannels(), o='<div class="centered">', k;
    if(G0.kind==='device'){
      var sens=SAMPLE_SENSORS.slice(0,G0.small?3:2);
      sens.forEach(function(s){
        var info=s.info, primary=!G0.small;
        o+='<div class="margin"><div class="achannel'+(primary?' primary':' smallprimary')+' status'+info.status+' sensormenu"><a href="#">'
          +'<span class="channelname">'+esc(s.sensor)+'</span><span class="channelsubname">'+esc(info.name)+'</span><span class="channelmessage">'+esc(s.message)+'</span>'
          +'<span class="channelgauge">'+stockSvg(primary?220:56,info)+'</span><span class="channelvalue">'+esc(info.lastvalue)+'</span></a></div></div>';
      });
    }else{
      var list=(G0.kind==='sensor-primary')?[chs[0]]:chs;
      list.forEach(function(c,i){
        var big=(i===0&&!G0.small);
        o+=stockChannel(c.info.data[0],big,c.lastvalue);
      });
    }
    return o+'<div style="clear:both"></div></div>';
  }
  var sampleState='ok';
  function sampleChannels(){
    var d=JSON.parse(JSON.stringify(SAMPLE_JSON.objects.channels));
    var i=d[0].info.data[0];
    if(sampleState==='warn'){i.lastvalueraw=78;i.lastvalue='78 Mbit/s';d[0].lastvalue='78 Mbit/s';}
    else if(sampleState==='crit'){i.lastvalueraw=95;i.lastvalue='95 Mbit/s';d[0].lastvalue='95 Mbit/s';i.status=5;}
    else if(sampleState==='paused'){i.status=7;}
    return d;
  }
  function drawGaugePreview(){
    var L=gEffLook(G), cls=gClassOf(G), css=gaugeCss(G,cls), ring=(G.engine==='ring');
    setStyle((ring?'':PRTGGAUGE+'\n')+css);
    applyFont(L);
    var w=parseInt(document.getElementById('owidth').value,10)||320, hh=parseInt(document.getElementById('oheight').value,10)||280;
    var zs=eoSz(G,w,hh);w=zs[0];hh=zs[1];
    var tm=G.titleMode||'object';
    var title=(tm==='none')?'':(tm==='custom'?clean(G.title):'Core switch uplink');
    var styled=ring||(G.look.mode!=='prtg');
    var titleHtml=title?'<p'+(styled&&css?' class="gtitle"':'')+'><b>'+esc(title)+'</b></p>':'';
    var rootCls='map_object map_table'+(css?' '+cls:'')+' map_objectstate_up';
    var wrapBox=(!!css)&&(ring||G.look.mode!=='prtg'), bo=wrapBox?'<div class="gbox">':'', bc=wrapBox?'</div>':'';
    prevEl.className='';
    if(ring){
      prevEl.innerHTML='<div id="mapshow" class="map-body"><div class="'+rootCls+'" id="ptprev_g" data-primarychannel="0" style="position:relative;overflow:hidden;width:'+w+'px;height:'+hh+'px;">'
        +bo+titleHtml+'<div class="gwrap"><svg class="gsvg" preserveAspectRatio="xMidYMid meet"></svg></div>'+bc+'</div></div>';
      var wrap=prevEl.querySelector('.gwrap');
      wrap.appendChild(document.createComment('\n{"objects":{"prtg-version":"26.3","treesize":3,"channels":'+JSON.stringify(sampleChannels())+'}}\n'));
      try{ringRuntime(prevEl.querySelector('.map_object'),JSON.parse(JSON.stringify(ringConfig(G,L))));}
      catch(err){if(window.console)console.error('ring preview',err);}
    }else{
      prevEl.innerHTML='<div id="mapshow" class="map-body"><div class="'+rootCls+'" style="position:relative;overflow:hidden;width:'+w+'px;height:'+hh+'px;">'
        +bo+titleHtml+'<div class="prtg-plugin'+(G.kind==='device'?' deviceoverviewsensorvalues':'')+'">'+stockInner(G)+'</div>'+bc+'</div></div>';
    }
    applyBg(L);
  }

  /* ---------- graph preview ---------- */
  /* PRTG draws a graph as a PNG picture on its server. The preview uses a stand-in picture with the same layout rules
     (white background, light grid, colored lines, labels and a legend at the chosen text size). */
  function mockGraphUri(w,hh,o){
    w=Math.max(60,Math.round(w));hh=Math.max(40,Math.round(hh));
    var fs=o.fontSize||0, lab=(fs>0), ax=(o.axis&&lab), lg=(o.legend&&lab);
    var mL=ax?Math.round(fs*3.4)+10:10, mB=ax?Math.round(fs*1.9)+6:10, mT=10, mR=12, legH=lg?Math.round(fs*2.4)+8:0;
    var pw=w-mL-mR, ph=hh-mT-mB-legH; if(ph<20)ph=20;
    var s='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+hh+'" viewBox="0 0 '+w+' '+hh+'"><rect width="100%" height="100%" fill="#fff"/>';
    var i,yl=['100','75','50','25','0'];
    for(i=0;i<=4;i++){
      var y=mT+ph*i/4;
      s+='<line x1="'+mL+'" y1="'+y.toFixed(1)+'" x2="'+(mL+pw)+'" y2="'+y.toFixed(1)+'" stroke="#E4E4E4" stroke-width="1"/>';
      if(ax)s+='<text x="'+(mL-6)+'" y="'+(y+fs*0.35).toFixed(1)+'" font-family="Arial,sans-serif" font-size="'+fs+'" fill="#6B6B6B" text-anchor="end">'+yl[i]+'</text>';
    }
    function ser(seed,amp,base){
      var p=[],k,N=56;
      for(k=0;k<N;k++){var v=base+amp*Math.sin(k/5+seed)+amp*0.5*Math.sin(k/2.3+seed*2);v=Math.max(0.04,Math.min(0.96,v));p.push([mL+pw*k/(N-1),mT+ph*(1-v)]);}
      return p;
    }
    function pts(p){return p.map(function(q){return q[0].toFixed(1)+','+q[1].toFixed(1);}).join(' ');}
    var A=ser(0.4,0.22,0.55), B=ser(2.1,0.12,0.25);
    s+='<polygon points="'+mL+','+(mT+ph)+' '+pts(A)+' '+(mL+pw)+','+(mT+ph)+'" fill="#4F8FC9" fill-opacity="0.22"/>';
    s+='<polyline points="'+pts(A)+'" fill="none" stroke="#4F8FC9" stroke-width="1.7"/>';
    s+='<polyline points="'+pts(B)+'" fill="none" stroke="#8DB255" stroke-width="1.7"/>';
    if(ax){
      var xl=[['10:00','10:15','10:30','10:45'],['08:00','12:00','16:00','20:00'],['01','08','15','22'],['Jan','Apr','Jul','Oct']][o.period||0];
      for(i=0;i<4;i++)s+='<text x="'+(mL+pw*(i+0.5)/4).toFixed(1)+'" y="'+(mT+ph+fs*1.4+2).toFixed(1)+'" font-family="Arial,sans-serif" font-size="'+fs+'" fill="#6B6B6B" text-anchor="middle">'+xl[i]+'</text>';
    }
    if(lg){
      var ly=hh-legH/2-2+fs*0.35;
      s+='<rect x="'+mL+'" y="'+(ly-fs*0.9).toFixed(1)+'" width="'+fs+'" height="'+fs+'" fill="#4F8FC9"/><text x="'+(mL+fs+5)+'" y="'+ly.toFixed(1)+'" font-family="Arial,sans-serif" font-size="'+fs+'" fill="#575756">Traffic In</text>';
      var x2=mL+fs+5+fs*5.2+18;
      s+='<rect x="'+x2.toFixed(1)+'" y="'+(ly-fs*0.9).toFixed(1)+'" width="'+fs+'" height="'+fs+'" fill="#8DB255"/><text x="'+(x2+fs+5).toFixed(1)+'" y="'+ly.toFixed(1)+'" font-family="Arial,sans-serif" font-size="'+fs+'" fill="#575756">Traffic Out</text>';
    }
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s+'</svg>');
  }
  /* PRTG's own CSS for the tile list, at PRTG's own specificity (from main.css) */
  var PRTGGRAPH=':where(#opreview){font-family:"Segoe UI",Tahoma,Arial,Helvetica,Verdana,sans-serif;color:#575756;}'
    +':where(#opreview) .achannel{display:block;float:left;background-color:#fff;width:148px;height:63px;position:relative;margin-bottom:10px;margin-right:6px;border-bottom:1px solid #d6d7d8;}'
    +':where(#opreview) .achannel .channelname{max-width:128px;left:23px;position:absolute;top:3px;display:inline-block;font-size:.8rem;font-weight:600;}'
    +':where(#opreview) .achannel .PNGGraph{margin-left:auto;margin-right:auto;margin-bottom:6px;}'
    +':where(#opreview) .sensorgraphs{width:calc(100% + 25px) !important;margin-right:-25px;}'
    +':where(#opreview) .sensorgraphs .achannel{min-width:376px;min-height:225px;max-width:800px;height:auto;background-color:#fff;box-shadow:0 1px 2px 0 rgba(0,0,0,.14),0 1px 1px -2px rgba(0,0,0,.2),0 0 5px 0 rgba(0,0,0,.12);margin-right:25px;margin-bottom:16px;flex:1 1 auto;border-bottom:none;}'
    +':where(#opreview) .sensorgraphs .achannel .channelname{max-width:none;position:relative;font-size:1.1rem;margin-top:6px;margin-bottom:10px;}'
    +':where(#opreview) .sensorgraphs .deviceoverviewsensorvalues{width:100%;padding:0;display:flex;flex-wrap:wrap;justify-content:flex-start;background-color:transparent;box-shadow:none;border:none;}'
    +':where(#opreview) .map_object .sensorgraphs{width:100% !important;margin:0;}';
  function mockToplist(sz){
    var c=sz/2,r=sz*0.36,s='<svg xmlns="http://www.w3.org/2000/svg" width="'+sz+'" height="'+sz+'" viewBox="0 0 '+sz+' '+sz+'">',a=-Math.PI/2,i;
    var cols=['#4F8FC9','#8DB255','#E0A030','#B05A8A'],parts=[0.38,0.27,0.22,0.13];
    for(i=0;i<parts.length;i++){
      var b=a+parts[i]*2*Math.PI-0.03,x0=c+r*Math.cos(a),y0=c+r*Math.sin(a),x1=c+r*Math.cos(b),y1=c+r*Math.sin(b);
      s+='<path d="M'+x0.toFixed(1)+','+y0.toFixed(1)+' A'+r.toFixed(1)+','+r.toFixed(1)+' 0 '+(parts[i]>0.5?1:0)+',1 '+x1.toFixed(1)+','+y1.toFixed(1)+'" fill="none" stroke="'+cols[i]+'" stroke-width="'+(sz*0.09).toFixed(1)+'"/>';
      a+=parts[i]*2*Math.PI;
    }
    return s+'</svg>';
  }
  function drawGraphPreview(){
    var L=GR.look, cls=grClassOf(GR), css=graphCss(GR,cls), styled=!!css, kind=GR.kind;
    setStyle((kind==='sensors'?PRTGGRAPH+'\n':'')+css);
    applyFont(L);
    var dw=(kind==='sensors')?760:(kind==='toplist'?240:520), dh=(kind==='sensors')?420:(kind==='toplist'?240:300);
    var w=parseInt(document.getElementById('owidth').value,10)||dw, hh=parseInt(document.getElementById('oheight').value,10)||dh;
    var zs=eoSz(GR,w,hh);w=zs[0];hh=zs[1];
    var tm=GR.titleMode||'object', per=GPERIODS[GR.period||0][1];
    prevEl.className='';
    var html='<div id="mapshow" class="map-body">';
    if(kind==='toplist'){
      html+='<div class="map_object map_table toplist-mapobject'+(styled?' '+cls:'')+'" style="position:relative;overflow:hidden;width:'+w+'px;height:'+hh+'px;background-clip:padding-box;"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">'+mockToplist(Math.min(w,hh)-24)+'</div></div>';
    }else if(kind==='sensors'){
      var title=(tm==='none')?'':(tm==='custom'?clean(GR.title):(tm==='stock'?'Graphs of Core switch ('+per+')':'Core switch'));
      var tiles='',names=['Ping','HTTP','SNMP Traffic','CPU Load'],i,tw=Math.max(100,parseInt(GR.tileW,10)||336),th=Math.max(60,parseInt(GR.tileH,10)||175);
      for(i=0;i<4;i++)tiles+='<div class="achannel"><span class="channelname">'+names[i]+'</span><img class="PNGGraph" width="'+tw+'" height="'+th+'" src="'+mockGraphUri(tw,th,{fontSize:9,legend:false,axis:true,period:GR.period})+'"></div>';
      var inner=(title?(styled?'<div class="gtitle"><b>'+esc(title)+'</b></div>':'<b>'+esc(title)+'</b>'):'')+'<div class="sensorgraphs"><div class="prtg-plugin deviceoverviewsensorvalues">'+tiles+'</div></div><div style="clear:both"></div>';
      html+='<div class="map_object map_table reaload_wo_params'+(styled?' '+cls:'')+'" style="position:relative;overflow:auto;width:'+w+'px;height:'+hh+'px;">'+(styled?'<div class="gbox">'+inner+'</div>':inner)+'</div>';
    }else{
      var uri=mockGraphUri(w,hh,{fontSize:GR.fontSize,legend:GR.legend,axis:GR.axis,period:GR.period});
      var img='<img class="PNGGraph" width="'+w+'" height="'+hh+'" src="'+uri+'">';
      var card=(styled&&GR.layout==='card');
      var gt=(tm==='none')?'':(tm==='custom'?clean(GR.title):'Core switch uplink');
      var body=card?'<div class="gbox">'+(gt?'<div class="gtitle">'+esc(gt)+'</div>':'')+'<div class="ggraph">'+img+'</div></div>':img;
      html+='<div class="map_object map_graph'+(styled?' '+cls:'')+'" style="position:relative;'+(styled?'overflow:hidden;':'')+'width:'+w+'px;height:'+hh+'px;">'+body+'</div>';
    }
    prevEl.innerHTML=html+'</div>';
    applyBg(L);
  }

  /* ---------- donut preview ---------- */
  function sampleSensors(){
    var c={up:214,warning:9,down:3,paused:12,unusual:2,unknown:1}, codes={up:3,warning:4,down:5,paused:7,unusual:10,unknown:1}, out=[], k, i;
    for(k in c)for(i=0;i<c[k];i++)out.push({objid:out.length+1,status:codes[k]});
    return out;
  }
  /* PRTG's own CSS for its donut object, at PRTG's own specificity (from main.css) */
  var PRTGDONUT=':where(#opreview) .donutext{text-anchor:middle;font-size:38px;}'
    +':where(#opreview) .map_donutobj .objname{text-align:center;color:#575756;width:calc(100% - 191px);font-size:1rem;}'
    +':where(#opreview) .map_donutobj.lighttext .objname{color:#efeeee;}'
    +':where(#opreview) .map_donutwrapper{display:flex;flex-flow:row nowrap;justify-content:space-between;align-items:stretch;overflow:hidden;height:100%;}'
    +':where(#opreview) .hasname .map_donutwrapper{height:calc(100% - 23px);}'
    +':where(#opreview) .lighttext .map_donutwrapper .donutext{fill:#efeeee;}'
    +':where(#opreview) .lighttext .map_donutwrapper .value-name-list,:where(#opreview) .lighttext .map_donutwrapper .value-name-list a.value-name-list_item{color:#b7b7b7;}'
    +':where(#opreview) .map_donutwrapper .simpledonut{flex-grow:1;min-width:180px;min-height:180px;display:block;height:auto;overflow:hidden;margin-right:16px;}'
    +':where(#opreview) .map_donutwrapper .donutext{fill:#575756;}'
    +':where(#opreview) .map_donutwrapper .value-name-list{color:#808282;display:flex;flex-direction:column;justify-content:center;}'
    +':where(#opreview) .map_donutwrapper .value-name-list a.value-name-list_item{margin-bottom:6px;color:#808282;display:flex;align-items:baseline;gap:8px;text-decoration:none;}'
    +':where(#opreview) .map_donutwrapper .value-name-list .item{font-size:.9rem;height:auto;line-height:normal;}'
    +':where(#opreview) .map_donutwrapper .value-name-list .value{text-align:left;font-size:1.1rem;}'
    +':where(#opreview) .map_donutwrapper .value-name-list .statusicon{font-size:1rem;align-self:flex-start;}';
  /* the include file is not part of the zips, so this stands in for it: a ring plus a legend list, as PRTG's CSS describes */
  function mockPrtgDonut(alarms){
    var sl=alarms?[['Warning',9,'#FFCC00'],['Down',3,'#E5484D']]:[['Up',214,'#6DB33F'],['Warning',9,'#FFCC00'],['Down',3,'#E5484D'],['Paused',12,'#4D9DE0']];
    var tot=0,i;for(i=0;i<sl.length;i++)tot+=sl[i][1];
    var a=0,paths='',items='';
    for(i=0;i<sl.length;i++){
      var span=2*Math.PI*sl[i][1]/tot,x0=100*Math.sin(a),y0=-100*Math.cos(a),x1=100*Math.sin(a+span),y1=-100*Math.cos(a+span),xi1=70*Math.sin(a+span),yi1=-70*Math.cos(a+span),xi0=70*Math.sin(a),yi0=-70*Math.cos(a),big=span>Math.PI?1:0;
      paths+='<path fill="'+sl[i][2]+'" d="M'+x0.toFixed(1)+','+y0.toFixed(1)+' A100,100 0 '+big+',1 '+x1.toFixed(1)+','+y1.toFixed(1)+' L'+xi1.toFixed(1)+','+yi1.toFixed(1)+' A70,70 0 '+big+',0 '+xi0.toFixed(1)+','+yi0.toFixed(1)+' Z"></path>';
      items+='<a class="value-name-list_item" href="#"><i class="statusicon" style="color:'+sl[i][2]+'">\u25CF</i><span class="item">'+sl[i][0]+'</span><span class="value">'+sl[i][1]+'</span></a>';
      a+=span;
    }
    return '<div class="prtg-plugin simpledonut"><svg viewBox="0 0 200 200" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><g transform="translate(100,100)">'+paths+'<text class="donutext" dy="12px">'+tot+'</text></g></svg></div><div class="value-name-list">'+items+'</div>';
  }
  function drawDonutPreview(){
    var L=dEffLook(DN), cls=dClassOf(DN), css=donutCss(DN,cls), ring=(DN.engine==='ring'), styled=!!css;
    setStyle((ring?'':PRTGDONUT+'\n')+css);
    applyFont(L);
    var w=parseInt(document.getElementById('owidth').value,10)||(ring?340:420), hh=parseInt(document.getElementById('oheight').value,10)||(ring?220:260);
    var zs=eoSz(DN,w,hh);w=zs[0];hh=zs[1];
    var tm=DN.titleMode||'object', title=(tm==='none')?'':(tm==='custom'?clean(DN.title):'Core switch');
    prevEl.className='';
    var titleHtml=title?'<div class="gtitle"><b>'+esc(title)+'</b></div>':'';
    if(ring){
      var lg=(['right','below','none'].indexOf(DN.legend)>-1)?DN.legend:'right';
      prevEl.innerHTML='<div id="mapshow" class="map-body"><div class="map_object map_graph '+cls+'" id="ptprev_d" style="position:relative;overflow:hidden;width:'+w+'px;height:'+hh+'px;"><div class="gbox">'+titleHtml
        +'<div class="dbody lg-'+lg+'"><div class="dsvgwrap"><svg class="dsvg" preserveAspectRatio="xMidYMid meet"></svg></div><div class="dlegend"></div></div></div></div></div>';
      var body=prevEl.querySelector('.dbody');
      body.appendChild(document.createComment('\n{"objects":{"prtg-version":"26.3","treesize":241,"sensors":'+JSON.stringify(sampleSensors())+'}}\n'));
      try{donutRuntime(prevEl.querySelector('.map_object'),JSON.parse(JSON.stringify(donutConfig(DN))));}
      catch(err){if(window.console)console.error('donut preview',err);}
    }else{
      var light=styled?dDark(L):DN.light, named=styled?false:DN.withName;
      var inner=mockPrtgDonut(DN.mode==='alarms');
      var cont=styled?'<div class="gbox">'+titleHtml+'<div class="map_donutwrapper">'+inner+'</div></div>':'<div class="map_donutwrapper">'+inner+'</div>'+(named?'<p class="objname"><b>Core switch</b></p>':'');
      prevEl.innerHTML='<div id="mapshow" class="map-body"><div class="map_object map_donutobj'+(styled?' '+cls:'')+(light?' lighttext':'')+(named?' hasname':'')+'" style="position:relative;overflow:hidden;width:'+w+'px;height:'+hh+'px;">'+cont+'</div></div>';
    }
    applyBg(L);
  }

  function drawStatusPreview(){
    var L=sEffLook(SC), cls=sClassOf(SC), css=statusCss(SC,cls,L), tm=SC.titleMode||'object', title=(tm==='none')?'':(tm==='custom'?clean(SC.title):'Core switch'), sub=clean(SC.sub), root, gb;
    setStyle(css);applyFont(L);
    var w=parseInt(document.getElementById('owidth').value,10)||420, hh=parseInt(document.getElementById('oheight').value,10)||200;
    var zs=eoSz(SC,w,hh);w=zs[0];hh=zs[1];
    prevEl.className='';
    prevEl.innerHTML='<div id="mapshow" class="map-body"><div class="map_object map_graph '+cls+'" id="ptprev_s" style="position:relative;overflow:hidden;width:'+w+'px;height:'+hh+'px;"><div class="gbox">'
      +(title?'<div class="gtitle"><b>'+esc(title)+'</b></div>':'')+(sub?'<div class="gsub">'+esc(sub)+'</div>':'')+'<div class="sbody"></div></div></div></div>';
    root=prevEl.querySelector('.map_object');gb=prevEl.querySelector('.gbox');
    gb.appendChild(document.createComment('\n{"objects":{"prtg-version":"26.3","treesize":241,"sensors":'+JSON.stringify(sampleSensors())+'}}\n'));
    try{statusRuntime(root,JSON.parse(JSON.stringify(statusConfig(SC,L))));}
    catch(err){if(window.console)console.error('status preview',err);}
    applyBg(L);
  }

  /* ---------- status icon preview and style gallery ---------- */
  var ICSTRIP=[['Up','sensg'],['Warning','sensy'],['Down','sensr'],['Acknowledged','senso'],['Unusual','sensp'],['Paused','sensb'],['Unknown','sensx'],['Group: green + yellow','hasgreen hasyellow'],['Group: green + red','hasgreen hasred']];
  function iconPreviewInner(I,idx){
    var Ip=Object.assign({},I,{link:'none',tip:'none'});
    return iconBodyLines(Ip,'pv'+idx).join('').replace(/<#objectproperty name="Name" id="<@objectid>">/g,'Core switch');
  }
  function drawIconPreview(){
    var L=iEffLook(IC), cls=iClassOf(IC), css=iconCss(IC,cls), st=iStyle(IC.style);
    prevEl.className='';
    if(IC.engine==='stock'){
      setStyle('');applyFont(lookOf('Minimal'));
      prevEl.innerHTML='<div id="mapshow" class="map-body"><div class="icstock"><strong>No preview for PRTG\\u2019s own icons.</strong> PRTG builds these from live data when the map is viewed: status counters, minigraphs or the object\\u2019s state classes. The file below is PRTG\\u2019s, written exactly as it ships, and only its name and category can change.</div></div>';
      applyBg(lookOf('Minimal'));return;
    }
    setStyle(css);applyFont(L);
    var w=parseInt(document.getElementById('owidth').value,10)||st.w, hh=parseInt(document.getElementById('oheight').value,10)||st.h;
    var zs=eoSz(IC,w,hh);w=zs[0];hh=zs[1];
    var html='<div id="mapshow" class="map-body"><div class="icstrip">';
    ICSTRIP.forEach(function(c,i){
      var sc=c[1].split(' ').map(function(x){return 'map_objectstate_'+x;}).join(' ');
      html+='<div class="icell"><div class="map_object pst_obj '+cls+' '+sc+'" style="position:relative;width:'+w+'px;height:'+hh+'px;">'+iconPreviewInner(IC,i)+'</div><div class="pcap">'+esc(c[0])+'</div></div>';
    });
    prevEl.innerHTML=html+'</div></div>';
    applyBg(L);
  }
  var icGalEl=null, icGalStyle=null;
  function refreshStyleGallery(){
    if(!icGalEl||TYPE!=='icon'||IC.engine!=='custom')return;
    if(!icGalStyle){icGalStyle=document.createElement('style');icGalStyle.id='opicgal';document.head.appendChild(icGalStyle);}
    var css=[], html='';
    ['Circles','Icons','More'].forEach(function(g){
      html+='<div class="icgroup">'+g+'</div><div class="icgrid">';
      ISTYLES.filter(function(s){return s.group===g;}).forEach(function(s){
        var Ig=Object.assign({},IC,{style:s.id,link:'none',tip:'none',text:'none',card:false,name:'gal '+s.id,initW:s.w,initH:s.h}), cls='pgal_'+s.id;
        css.push(iconCss(Ig,cls));
        var hh=(s.id==='traffic')?44:28, ww=Math.max(14,Math.min(70,Math.round(hh*s.w/s.h)));
        var cells='';
        ['sensg','sensy','sensr'].forEach(function(k,i){cells+='<span class="map_object pst_obj '+cls+' map_objectstate_'+k+'" style="position:relative;display:block;width:'+ww+'px;height:'+hh+'px;">'+iconBodyLines(Ig,'g'+s.id+i).join('')+'</span>';});
        html+='<button type="button" class="stylechip'+(IC.style===s.id?' on':'')+((s.w/s.h>1.8)?' wide':'')+'" data-style="'+s.id+'"><span class="stylerow">'+cells+'</span><span class="pname">'+s.name+'</span></button>';
      });
      html+='</div>';
    });
    icGalStyle.textContent=css.join('\\n');
    icGalEl.innerHTML=html;
    Array.prototype.forEach.call(icGalEl.querySelectorAll('.stylechip'),function(btn){
      btn.addEventListener('click',function(){
        var s=iStyle(btn.getAttribute('data-style')), old=iStyle(IC.style);
        if(IC.name==='Status '+old.name.toLowerCase())IC.name='Status '+s.name.toLowerCase();
        IC.style=s.id;IC.initW=s.w;IC.initH=s.h;
        refreshUI();render();
      });
    });
  }

  var INSTALL_HTML=(document.getElementById('oinstall')||{}).innerHTML||'';
  function drawPastePreview(){
    var fr=FRc(), p=fr.p, fl=document.getElementById('opfont');
    setStyle('');
    var link=frFontLink(fr);
    if(link){if(!fl){fl=h('link');fl.id='opfont';fl.rel='stylesheet';document.head.appendChild(fl);}fl.setAttribute('href',/href="([^"]+)"/.exec(link)[1]);}
    else if(fl)fl.removeAttribute('href');
    prevEl.className='';
    var cv=document.getElementById('ocanvas'), avail=Math.max(240,(cv.clientWidth||900)-40), sc=Math.min(1,avail/Math.max(1,fr.w));
    prevEl.innerHTML='<div id="mapshow" class="map-body"><div style="width:'+Math.round(fr.w*sc)+'px;height:'+Math.round(fr.h*sc)+'px;"><div style="width:'+fr.w+'px;height:'+fr.h+'px;transform:scale('+sc+');transform-origin:0 0;">'+FRAMEAPI.frameHTML({p:p,w:fr.w,h:fr.h})+'</div></div></div>';
    applyBg(lookOf('Minimal'));
  }
  function drawPreview(){
    if(TYPE!=='table')prevEl.style.minHeight='';if(TYPE==='gauge')drawGaugePreview();else if(isPaste())drawPastePreview();else if(TYPE==='graph')drawGraphPreview();else if(TYPE==='donut')drawDonutPreview();else if(TYPE==='status')drawStatusPreview();else if(TYPE==='icon')drawIconPreview();else drawTablePreview();
    eoAttach();}

  /* ---------- render ---------- */
  function render(){
    if(isLegacy(TYPE))return;
    var text=(TYPE==='gauge')?buildGauge(G):(isPaste()?buildPaste(FRc()):(TYPE==='graph'?buildGraph(GR):(TYPE==='donut'?buildDonut(DN):(TYPE==='status'?buildStatus(SC):(TYPE==='icon'?buildIcon(IC):buildTable(T))))));
    codeEl.value=text;
    document.getElementById('ofname').textContent=fileNameOf(M());
    document.getElementById('ofnote').textContent=text.length+' characters';
    var inst=document.getElementById('oinstall');
    if(inst){
      if(isPaste())inst.innerHTML='<strong>How to use:</strong> in the Map Designer add a Custom HTML item, select it, open the HTML section in Properties and paste this into HTML Before. Give the item the size '+FRc().w+' \u00D7 '+FRc().h+' px and place it where you want it. PRTG rewrites <code>div</code> to <code>span</code> when you paste, so this is written as a span that declares its own size.';
      else if(INSTALL_HTML)inst.innerHTML=INSTALL_HTML;
    }
    drawPreview();
    refreshStyleGallery();
    hRecord();
  }

  /* ---------- panel ---------- */
  var typeSel=null, engineSel=null, legSel=null;
  /* Text label and Button are the page's basic tools. Choosing one shows that tool, unchanged, under the Objects tab. */
  var TYPES=[
    ['Files for \\webroot\\mapobjects',[['table','Data table (list of sensors)'],['gauge','Gauge'],['graph','Graph'],['donut','Donut'],['status','Status counts'],['icon','Status icon']]],
    ['Pasted into a Custom HTML item',[['label','Text label'],['button','Button']].concat(FRAMEAPI?[['frame','Frame'],['bg','Background'],['shape','Shape']]:[])]
  ];
  function isLegacy(t){return t==='label'||t==='button';}
  function fillTypeSelect(sel){
    TYPES.forEach(function(g){
      var og=h('optgroup');og.label=g[0];
      g[1].forEach(function(o){var op=h('option');op.value=o[0];op.textContent=o[1];og.appendChild(op);});
      sel.appendChild(og);
    });
  }
  function syncTypeSelects(){if(typeSel)typeSel.value=TYPE;if(legSel)legSel.value=TYPE;typeGridSync();}
  /* ---------- the object type grid: every type visible at once, in the two groups that say how it is delivered ---------- */
  function sv(path){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+path+'</svg>';}
  var TYPEICON={
    table:sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 10v10"/>'),
    gauge:sv('<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-5"/><circle cx="12" cy="17" r="1"/>'),
    graph:sv('<path d="M4 4v16h16"/><path d="M8 15l4-4 3 3 5-6"/>'),
    donut:sv('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>'),
    icon:sv('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor"/>'),
    label:sv('<path d="M5 6h14M12 6v13M9 19h6"/>'),
    button:sv('<rect x="3" y="8" width="18" height="9" rx="4.5"/><path d="M8 12.5h8"/>'),
    frame:sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>'),
    bg:sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 17l9-9M8 12l4-4M13 17l4-4"/>'),
    shape:sv('<path d="M4 12h13"/><path d="m13 7 5 5-5 5"/>'),
    status:sv('<rect x="3" y="6" width="8" height="12" rx="1.5"/><rect x="13" y="6" width="8" height="12" rx="1.5"/><path d="M5.5 11h3M15.5 11h3"/>')
  };
  var TYPESHORT={table:'Table',gauge:'Gauge',graph:'Graph',donut:'Donut',icon:'Icon',label:'Label',button:'Button',frame:'Frame',bg:'Background',shape:'Shape',status:'Status'};
  var TYPETIP={table:'Data table (list of sensors)',gauge:'Gauge',graph:'Graph',donut:'Donut',icon:'Status icon',label:'Text label',button:'Button',frame:'Frame',bg:'Background',status:'Status counts (tiles of sensors by status)'};
  var GRIDHEAD=[['Save as file','A file you save in \\webroot\\mapobjects',sv('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>')],['Paste into Custom HTML','Code you paste into the HTML Before of a Custom HTML item',sv('<rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V3h6v2"/>')]];
  var gridTiles=[];
  function buildTypeGrid(){
    var host=document.getElementById('typegrid');if(!host)return;
    TYPES.forEach(function(g,gi){
      var paste=(gi===1), hd=GRIDHEAD[gi], head=h('div','tgh'+(paste?' p':''));
      head.title=hd[1];head.innerHTML='<i class="sq"></i>'+hd[0]+hd[2];
      var row=h('div','tgr');row.style.gridTemplateColumns='repeat('+g[1].length+',1fr)';
      g[1].forEach(function(o){
        var t=h('button','tgt'+(paste?' p':''));
        t.type='button';t.setAttribute('data-t',o[0]);t.setAttribute('role','radio');t.setAttribute('aria-label',TYPETIP[o[0]]);t.title=TYPETIP[o[0]];
        t.innerHTML=TYPEICON[o[0]]+'<span>'+TYPESHORT[o[0]]+'</span>';
        t.addEventListener('click',function(){setType(o[0]);});
        row.appendChild(t);gridTiles.push(t);
      });
      host.appendChild(head);host.appendChild(row);
    });
    host.addEventListener('keydown',function(e){
      var k=e.key;if(k!=='ArrowRight'&&k!=='ArrowLeft'&&k!=='ArrowDown'&&k!=='ArrowUp'&&k!=='Home'&&k!=='End')return;
      var i=gridTiles.indexOf(document.activeElement);if(i<0)return;
      e.preventDefault();
      var n=(k==='Home')?0:(k==='End')?gridTiles.length-1:(k==='ArrowRight'||k==='ArrowDown')?Math.min(gridTiles.length-1,i+1):Math.max(0,i-1);
      gridTiles[n].focus();setType(gridTiles[n].getAttribute('data-t'));
    });
  }
  function typeGridSync(){
    gridTiles.forEach(function(t){
      var on=(t.getAttribute('data-t')===TYPE);
      t.classList[on?'add':'remove']('on');t.setAttribute('aria-checked',on?'true':'false');t.tabIndex=on?0:-1;
    });
  }
  function setType(v){
    if(v===TYPE){syncTypeSelects();return;}
    var wasLegacy=isLegacy(TYPE)||isPaste(), lk=wasLegacy?null:M().look;
    TYPE=v;
    if(isLegacy(v)){
      document.body.classList.remove('objs');
      setMode(v);
    }else{
      if(lk&&!isPaste())M().look=lk;
      if(!isPaste()&&(TYPE==='icon'||TYPE==='status'||(TYPE==='gauge'&&G.engine==='ring')||(TYPE==='donut'&&DN.engine==='ring'))&&M().look.mode==='prtg')M().look=lookOf(TYPE==='icon'?'Minimal':'Light card');
      document.body.classList.add('objs');
      buildPresetOptions();refreshUI();render();
    }
    syncTypeSelects();
  }
  function buildPresetOptions(){
    if(!presetSel)return;
    presetSel.innerHTML='';
    var blank=h('option');blank.value='__blank';blank.textContent=(TYPE==='gauge')?'Blank gauge':(TYPE==='frame'?'Blank frame':(TYPE==='graph'?'Blank graph':(TYPE==='status'?'Blank status card':(TYPE==='donut'?'Blank donut':(TYPE==='icon'?'Blank status icon':'Blank table')))));presetSel.appendChild(blank);
    var src=(TYPE==='status')?SPRESETS.map(function(x){return {id:x.id,name:x.name,cat:'Built in'};}):((TYPE==='gauge')?GPRESETS:(TYPE==='graph'?GRPRESETS:(TYPE==='donut'?DPRESETS:(TYPE==='icon'?ICPRESETS:PRESETS)))), cats={},order=[];
    src.forEach(function(p){if(!cats[p.cat]){cats[p.cat]=h('optgroup');cats[p.cat].label=p.cat+(TYPE==='status'?'':' (PRTG stock)');order.push(p.cat);}
      var op=h('option');op.value=p.id;op.textContent=p.name;cats[p.cat].appendChild(op);});
    order.forEach(function(c){presetSel.appendChild(cats[c]);});
  }
  var isTable=function(){return TYPE==='table';};
  var isPaste=function(){return TYPE==='frame'||TYPE==='bg'||TYPE==='shape';};
  var notPaste=function(){return !isPaste();};
  var isGraph=function(){return TYPE==='graph';};
  var gSensor=function(){return TYPE==='graph'&&GR.kind==='sensor';};
  var gList=function(){return TYPE==='graph'&&GR.kind==='sensors';};
  var gPeriod=function(){return TYPE==='graph'&&GR.kind!=='toplist';};
  var gTitled=function(){return TYPE==='graph'&&GR.kind!=='toplist'&&GR.look.mode!=='prtg';};
  var isDonut=function(){return TYPE==='donut';};
  var isStatus=function(){return TYPE==='status';};
  var dRing=function(){return TYPE==='donut'&&DN.engine==='ring';};
  var dPrtg=function(){return TYPE==='donut'&&DN.engine==='prtg';};
  var isIcon=function(){return TYPE==='icon';};
  var icCustom=function(){return TYPE==='icon'&&IC.engine==='custom';};
  var icStock=function(){return TYPE==='icon'&&IC.engine==='stock';};
  var icPulse=function(){return TYPE==='icon'&&IC.engine==='custom'&&IC.style==='pulse';};
  var notIcStock=function(){return !(TYPE==='icon'&&IC.engine==='stock');};
  var notFrame=function(){return TYPE==='table'||TYPE==='gauge'||TYPE==='status'||(TYPE==='donut'&&DN.engine==='ring')||(TYPE==='icon'&&IC.engine==='custom');};
  var isGauge=function(){return TYPE==='gauge';};
  var isRing=function(){return TYPE==='gauge'&&G.engine==='ring';};
  var isStock=function(){return TYPE==='gauge'&&G.engine==='prtg';};
  var isDevice=function(){return TYPE==='gauge'&&G.engine==='prtg'&&G.kind==='device';};
  function showIf(node,fn){vis.push([node,fn]);return node;}
  function secIf(body,fn){vis.push([body.parentNode,fn]);return body;}
  function buildPanel(){
    hostEl.innerHTML='';vis=[];
    var Lk=function(){return M().look;};
    var s1=section('Object');
    var w=h('div','dfld');w.appendChild(h('label',null,'Type'));
    typeSel=h('select');
    fillTypeSelect(typeSel);
    typeSel.addEventListener('change',function(){setType(typeSel.value);});
    syncs.push(function(){typeSel.value=TYPE;});
    w.appendChild(typeSel);s1.appendChild(w);w.style.display='none';   /* the grid at the top replaces it; the select stays in step */
    var hrow=h('div','dpair');
    undoBtn=h('button','btn ghost','Undo');undoBtn.type='button';undoBtn.title='Undo (Ctrl+Z)';undoBtn.addEventListener('click',function(){hStep(-1);});
    redoBtn=h('button','btn ghost','Redo');redoBtn.type='button';redoBtn.title='Redo (Ctrl+Y, or Ctrl+Shift+Z)';redoBtn.addEventListener('click',function(){hStep(1);});
    hrow.appendChild(undoBtn);hrow.appendChild(redoBtn);s1.appendChild(hrow);
    var wE=h('div','dfld');wE.appendChild(h('label',null,'Gauge style'));
    engineSel=h('select');
    [['ring','Ring gauge: custom, resizes with the item'],['prtg','PRTG gauge: restyled, fixed size']].forEach(function(o){var op=h('option');op.value=o[0];op.textContent=o[1];engineSel.appendChild(op);});
    engineSel.addEventListener('change',function(){
      G.engine=engineSel.value;
      if(G.engine==='ring'&&G.look.mode==='prtg')G.look=lookOf('Light card');
      refreshUI();render();
    });
    syncs.push(function(){engineSel.value=G.engine;});
    wE.appendChild(engineSel);showIf(wE,isGauge);s1.appendChild(wE);
    var w2=h('div','dfld');w2.appendChild(h('label',null,'Start from'));
    presetSel=h('select');buildPresetOptions();
    presetSel.addEventListener('change',function(){
      var v=presetSel.value;
      if(TYPE==='icon'){
        var ilk=IC.look;
        if(v==='__blank'){IC=blankI();IC.look=(ilk.mode==='prtg')?lookOf('Minimal'):ilk;}
        else{var ip_=null;ICPRESETS.forEach(function(x){if(x.id===v)ip_=x;});IC=iconFromPreset(ip_);IC.look=(ilk.mode==='prtg')?lookOf('Minimal'):ilk;}
      }else if(TYPE==='donut'){
        var dlk=DN.look;
        if(v==='__blank'){DN=blankD();DN.look=dlk;}
        else{var dp_=null;DPRESETS.forEach(function(x){if(x.id===v)dp_=x;});DN=donutFromPreset(dp_);}
      }else if(TYPE==='graph'){
        var glk=GR.look;
        if(v==='__blank'){GR=blankGR();GR.look=glk;}
        else{var rp=null;GRPRESETS.forEach(function(x){if(x.id===v)rp=x;});GR=graphFromPreset(rp);}
      }else if(TYPE==='gauge'){
        if(v==='__blank'){var lk=G.look,eng=G.engine;G=blankG();G.look=lk;G.engine=eng;}
        else{var gp=null;GPRESETS.forEach(function(x){if(x.id===v)gp=x;});G=gaugeFromPreset(gp);}
      }else if(TYPE==='status'){
        var slk=SC.look;SC=statusFromPreset(v==='__blank'?'':v);SC.look=slk;
      }else{
        if(v==='__blank')T=blankT();
        else{var p=null;PRESETS.forEach(function(x){if(x.id===v)p=x;});T=fromPreset(p);}
      }
      refreshUI();render();
    });
    w2.appendChild(presetSel);s1.appendChild(w2);showIf(w2,notPaste);
    showIf(s1.appendChild(h('p','note','A table, gauge, graph, donut or icon from PRTG\u2019s own set keeps PRTG\u2019s look until you choose another under Look. Tables, gauges, graphs, donuts and status icons share the same looks, so a dashboard of them stays consistent.')),notPaste);

    var s2=section('Name and title');secIf(s2,notPaste);
    s2.appendChild(inText('Category in the designer',function(){return M().cat;},function(v){M().cat=v;},'Data Tables'));
    s2.appendChild(inText('Object name',function(){return M().name;},function(v){M().name=v;}));
    s2.appendChild(inText('File name',function(){return M().fname;},function(v){M().fname=v;},'automatic'));
    var dz=h('div');
    dz.appendChild(pair(inNum('Size when dropped: width',function(){return M().initW;},function(v){M().initW=v;},0,4000),inNum('Height',function(){return M().initH;},function(v){M().initH=v;},0,4000)));
    dz.appendChild(h('p','note','PRTG drops every new object at 200 \u00D7 200. These numbers go in the file so it arrives at a useful size. Set either to 0 to keep PRTG\u2019s default.'));
    s2.appendChild(dz);
    var tT=h('div');
    tT.appendChild(inChk('Show a title above the table',function(){return T.showTitle!==false;},function(v){T.showTitle=v;}));
    tT.appendChild(inText('Title',function(){return T.title;},function(v){T.title=v;}));
    tT.appendChild(inChk('Add the object\u2019s name in brackets',function(){return T.titleObj;},function(v){T.titleObj=v;}));
    showIf(tT,isTable);s2.appendChild(tT);
    var gT=h('div');
    gT.appendChild(inSel('Title',function(){return G.titleMode;},function(v){G.titleMode=v;},[['object','The object\u2019s name'],['custom','Custom text'],['none','No title']]));
    gT.appendChild(inText('Custom title text',function(){return G.title;},function(v){G.title=v;}));
    showIf(gT,isGauge);s2.appendChild(gT);
    var dT=h('div');
    dT.appendChild(inSel('Title',function(){return DN.titleMode;},function(v){DN.titleMode=v;},[['object','The object\u2019s name'],['custom','Custom text'],['none','No title']]));
    dT.appendChild(inText('Custom title text',function(){return DN.title;},function(v){DN.title=v;}));
    dT.appendChild(h('p','note','On PRTG\u2019s own look the stock file shows no title; the donut\u2019s name appears only in the \u201cwith name\u201d presets.'));
    showIf(dT,function(){return TYPE==='donut'&&(DN.engine==='ring'||DN.look.mode!=='prtg');});s2.appendChild(dT);

    /* ---- frame and background (pasted into a Custom HTML item) ---- */
    /* ---- status counts: the tiles, and which sensors are counted ---- */
    var sT=h('div');
    sT.appendChild(inSel('Title',function(){return SC.titleMode;},function(v){SC.titleMode=v;},[['object','The object\u2019s name'],['custom','Custom text'],['none','No title']]));
    sT.appendChild(inText('Custom title text',function(){return SC.title;},function(v){SC.title=v;}));
    sT.appendChild(inText('Subtitle',function(){return SC.sub;},function(v){SC.sub=v;},'for example: Interface sensors'));
    showIf(sT,isStatus);s2.appendChild(sT);
    var st1=section('Status tiles');secIf(st1,isStatus);
    SKEYS.forEach(function(k){
      st1.appendChild(inChk('Tile: '+k[1],function(){return SC.tiles.indexOf(k[0])>-1;},function(v){
        var a=SKEYS.map(function(x){return x[0];}).filter(function(x){return x===k[0]?v:SC.tiles.indexOf(x)>-1;});
        SC.tiles=a.length?a:['up'];
      }));
    });
    st1.appendChild(inChk('Grey out a tile with nothing in it (except Up)',function(){return !!SC.quiet;},function(v){SC.quiet=v;}));
    st1.appendChild(inSel('Caption under the number',function(){return SC.cap;},function(v){SC.cap=v;},[['of','of N sensors'],['none','None']]));
    var st2=section('Which sensors');secIf(st2,isStatus);
    st2.appendChild(inText('Only sensors with this tag',function(){return SC.reqTag;},function(v){SC.reqTag=v;},'for example: bandwidthsensor'));
    st2.appendChild(inText('Only sensors whose name contains',function(){return SC.nameHas;},function(v){SC.nameHas=v;},'for example: Ethernet'));
    st2.appendChild(inChk('Also follow the map\u2019s tag filter',function(){return !!SC.mapTags;},function(v){SC.mapTags=v;}));
    st2.appendChild(h('p','note','The card counts every sensor under the object it is bound to, by PRTG\u2019s own status. Tags and names narrow it, for example to interface sensors. A paused sensor is counted as paused, not as up.'));

    /* ---- shape: what it draws ---- */
    var sh1=section('Shape');secIf(sh1,function(){return TYPE==='shape';});
    var FRPs=function(){return FRc().p;};
    sh1.appendChild(inSel('Kind',function(){return FRPs().shape;},function(v){FRPs().shape=v;refreshUI();},FRAMEAPI.SHAPES));   /* refreshUI also redraws the look tiles, so they show this kind */
    var shL=h('div');showIf(shL,function(){var k=FRPs().shape;return k==='line'||k==='arrow'||k==='flow';});
    shL.appendChild(inSel('Direction',function(){return FRPs().dir;},function(v){var p=FRPs(), fr=FRc(), was=(p.dir==='right'||p.dir==='left'), now=(v==='right'||v==='left'), t;if(was!==now){t=fr.w;fr.w=fr.h;fr.h=t;}p.dir=v;refreshUI();},[['right','Right'],['left','Left'],['down','Down'],['up','Up']]));   /* turning the arrow a quarter turn turns its box too */
    shL.appendChild(pair(inNum('Thickness',function(){return FRPs().thick;},function(v){FRPs().thick=v;},1,80),inColor('Color',function(){return FRPs().color;},function(v){FRPs().color=v;})));
    var shF=h('div');showIf(shF,function(){return FRPs().shape==='flow';});
    shF.appendChild(inSel('Blinking speed',function(){return String(FRPs().speed);},function(v){FRPs().speed=v;},[['3','Slow'],['1.6','Normal'],['0.8','Fast']]));
    shL.appendChild(shF);sh1.appendChild(shL);

    /* ---- Look presets for frames, backgrounds and shapes ---- */
    var fl1=section('Look presets');secIf(fl1,isPaste);
    var fGal=h('div','fgal');fl1.appendChild(fGal);
    function fKind(){return TYPE==='bg'?'bg':(TYPE==='shape'?'shape':'frame');}
    function drawFGal(){
      var kind=fKind(), SH=FRAMEAPI.SHADOW, cur=FRc().p.style;
      if(!isPaste())return;
      fGal.textContent='';
      Object.keys(LOOKS).forEach(function(name){
        var q=lookToFrameP(name,kind), t=h('button','fgtile'), pv=h('div','fgprev'), card=h('div'), cap=h('span','fgcap');
        t.type='button';t.title=name;if(cur===name)t.className+=' on';
        if(kind==='bg'){
          pv.style.background=q.fill;card.style.cssText='width:56%;height:56%;border-radius:4px;background:'+(lookOf(name).cardBg||'#FFFFFF')+';border:1px solid '+(lookOf(name).border||lookOf(name).line||'#E3E5E9')+';';pv.appendChild(card);
        }else if(kind==='shape'){
          var sk=FRc().p.shape, hz=!(FRc().p.dir==='down'||FRc().p.dir==='up'), sw=Math.max(2,Math.min(8,Math.round((q.thick||6)/1.5)));
          pv.style.background=lookOf(name).stage||'#F3F4F6';
          if(sk==='rect'||sk==='round'||sk==='pill'||sk==='circle'){
            card.style.cssText='width:'+(sk==='circle'?'46px':'74%')+';height:'+(sk==='circle'?'46px':'58%')+';display:flex;align-items:center;justify-content:center;font:600 10px/1 Arial,sans-serif;color:'+q.tcolor+';background:'+q.fill+';border-radius:'+(sk==='rect'?'0':(sk==='pill'?'99px':(sk==='circle'?'50%':Math.min(q.radius,14)+'px')))+';box-shadow:'+(SH[q.shadow]||'')+';';
            card.textContent='Aa';
          }else if(sk==='line'){
            card.style.cssText='width:76%;height:'+sw+'px;border-radius:'+sw+'px;background:'+q.color+';';
          }else if(sk==='arrow'){
            card.innerHTML='<svg viewBox="0 0 40 16" width="56" height="22" aria-hidden="true"><path d="M3 8h28M25 2l8 6-8 6" fill="none" stroke="'+q.color+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          }else{
            card.innerHTML='<svg viewBox="0 0 40 16" width="56" height="22" aria-hidden="true"><g fill="none" stroke="'+q.color+'" stroke-width="'+Math.max(2,sw-1)+'" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l6 5-6 5" opacity=".3"/><path d="M17 3l6 5-6 5" opacity=".6"/><path d="M28 3l6 5-6 5"/></g></svg>';
          }
          pv.appendChild(card);
        }else{
          pv.style.background='#F3F4F6';
          card.style.cssText='width:76%;height:68%;box-sizing:border-box;padding:4px 6px;font:600 9px/1.2 Arial,sans-serif;text-align:left;color:'+q.tcolor+';border-radius:'+Math.min(q.radius,12)+'px;background:'+rgba(q.fill,q.fillA/100)+';border:'+q.bw+'px solid '+q.bcolor+';box-shadow:'+(SH[q.shadow]||'')+';';
          card.textContent='Title';pv.appendChild(card);
        }
        cap.textContent=name;t.appendChild(pv);t.appendChild(cap);
        t.addEventListener('click',function(){
          var p=FRc().p, k;
          for(k in q)p[k]=q[k];
          if(kind==='bg')p.title='';
          refreshUI();render();
        });
        fGal.appendChild(t);
      });
    }
    syncs.push(drawFGal);
    fl1.appendChild(h('p','note','Click one to apply it to this '+'frame, background or shape. A background takes the look\u2019s own map color.'));

    var fr1=section('Appearance');secIf(fr1,isPaste);
    var FRP=function(){return FRc().p;};
    var famOpts=Array.prototype.map.call(el.fam.options,function(o){return [o.value,o.textContent];});
    function lineShape(){var k=FRP().shape;return k==='line'||k==='arrow'||k==='flow';}
    var frBox=h('div');showIf(frBox,function(){return !lineShape();});fr1.appendChild(frBox);
    frBox.appendChild(inArea('Title',function(){return FRP().title;},function(v){FRP().title=v;},'Title'));
    var stW=h('div','dfld');stW.appendChild(h('label',null,'Style preset'));
    var stS=h('select'),stB=h('option');stB.value='';stB.textContent='Choose to apply\u2026';stS.appendChild(stB);
    if(FRAMEAPI)Object.keys(FRAMEAPI.FSTYLES).forEach(function(k){var o=h('option');o.value=k;o.textContent=k;stS.appendChild(o);});
    stS.addEventListener('change',function(){
      if(!stS.value)return;
      var st=FRAMEAPI.FSTYLES[stS.value], k;
      for(k in st)FRP()[k]=st[k];
      FRP().style=stS.value;stS.value='';
      refreshUI();render();
    });
    stW.appendChild(stS);frBox.appendChild(stW);
    frBox.appendChild(pair(inNum('Title size',function(){return FRP().tsize;},function(v){FRP().tsize=v;},8,120),inSel('Title weight',function(){return FRP().tweight;},function(v){FRP().tweight=v;},FRAMEAPI?FRAMEAPI.WEIGHTS:[['400','Regular']])));
    frBox.appendChild(pair(inColor('Title color',function(){return FRP().tcolor;},function(v){FRP().tcolor=v;}),inColor('Fill color',function(){return FRP().fill;},function(v){FRP().fill=v;})));
    frBox.appendChild(pair(inNum('Fill opacity %',function(){return FRP().fillA;},function(v){FRP().fillA=v;},0,100),inNum('Corner radius',function(){return FRP().radius;},function(v){FRP().radius=v;},0,80)));
    frBox.appendChild(pair(inColor('Border color',function(){return FRP().bcolor;},function(v){FRP().bcolor=v;}),inNum('Border width',function(){return FRP().bw;},function(v){FRP().bw=v;},0,20)));
    frBox.appendChild(pair(inSel('Shadow',function(){return FRP().shadow;},function(v){FRP().shadow=v;},[['none','None'],['soft','Soft'],['strong','Strong']]),inSel('Font',function(){return FRP().fam;},function(v){FRP().fam=v;},famOpts)));
    frBox.appendChild(pair(inNum('Padding X',function(){return FRP().padx;},function(v){FRP().padx=v;},0,80),inNum('Padding Y',function(){return FRP().pady;},function(v){FRP().pady=v;},0,80)));
    fr1.appendChild(pair(inNum('Width',function(){return FRc().w;},function(v){FRc().w=v;},20,8000),inNum('Height',function(){return FRc().h;},function(v){FRc().h=v;},20,8000)));
    fr1.appendChild(h('p','note','The box is written with its own size. When you paste it, give the Custom HTML item the same width and height. Fill opacity 0 gives an outline only, and a low value gives a glass panel, which looks best on a dark map. A background is just a large frame without a title: send its item to the back.'));

    /* ---- status icon ---- */
    var ic1=section('Status icon');secIf(ic1,isIcon);
    var icn=h('p','note','This is one of PRTG\u2019s own icon files, written exactly as PRTG ships it. Only its name and category can change. To design an icon of your own, start from \u201cBlank status icon\u201d.');showIf(icn,icStock);ic1.appendChild(icn);
    var icg=h('div');icGalEl=h('div','icgal');icg.appendChild(icGalEl);
    icg.appendChild(inSel('Colors',function(){return IC.palette;},function(v){IC.palette=v;},[['look','The look\u2019s status colors'],['prtg','PRTG\u2019s own status colors']]));
    icg.appendChild(inSel('Text next to the icon',function(){return IC.text;},function(v){IC.text=v;},[['none','Icon only'],['name','Icon and object name'],['word','Icon and status word'],['both','Icon, name and status word']]));
    icg.appendChild(h('p','note','For text, make the object wider. The status pill always shows its word.'));
    icg.appendChild(inSel('Tooltip',function(){return IC.tip;},function(v){IC.tip=v;},[['name','Object name'],['parent','Parent device'],['both','Parent device / object name'],['none','None']]));
    icg.appendChild(inSel('Link',function(){return IC.link;},function(v){IC.link=v;},[['auto','Open the object\u2019s page (sensor or device, chosen by PRTG)'],['sensor','Always the sensor page'],['device','Always the device page'],['none','No link']]));
    var icA=inChk('Animate alarms',function(){return IC.animate;},function(v){IC.animate=v;});var icAw=h('div');icAw.appendChild(icA);showIf(icAw,icPulse);icg.appendChild(icAw);   /* a checkbox row is display:flex, which beats the hidden attribute, so it is hidden through a plain wrapper */
    icg.appendChild(inChk('Card behind the icon, from the look',function(){return IC.card;},function(v){IC.card=v;}));
    icg.appendChild(h('p','note','The icon takes PRTG\u2019s state classes from the object: a sensor gets one, a device or group can get several, and the worst one wins, in the order PRTG\u2019s own maps script uses (red, acknowledged, yellow, unusual, blue, unknown, green). PRTG also colors map connection lines from the same classes.'));
    showIf(icg,icCustom);ic1.appendChild(icg);
    var ic2=section('State words');secIf(ic2,icCustom);
    ISTATES.slice().sort(function(a,b){return IORDER.indexOf(a.id)-IORDER.indexOf(b.id);}).forEach(function(s){
      ic2.appendChild(inText(s.label,function(){return (IC.labels&&IC.labels[s.id])||'';},function(v){IC.labels=IC.labels||{};IC.labels[s.id]=v;}));
    });
    ic2.appendChild(h('p','note','Empty means PRTG\u2019s English word. These show in the status pill and in the \u201cstatus word\u201d text.'));
    /* ---- donut ---- */
    var dn1=section('Donut');secIf(dn1,isDonut);
    dn1.appendChild(inSel('Engine',function(){return DN.engine;},function(v){DN.engine=v;if(v==='ring'){if(!(parseInt(DN.initW,10)>0)){DN.initW=340;DN.initH=220;}if(DN.look.mode==='prtg')DN.look=lookOf('Light card');}refreshUI();},DENGINES));
    var dr=h('div');
    dr.appendChild(inSel('Shows',function(){return DN.mode;},function(v){DN.mode=v;},[['all','All sensor states'],['alarms','Alarms only (down, warning, unusual)']]));
    dr.appendChild(inSel('In the centre',function(){return DN.center;},function(v){DN.center=v;},DCENTERS));
    dr.appendChild(inText('Centre caption (empty = automatic)',function(){return DN.caption;},function(v){DN.caption=v;}));
    dr.appendChild(pair(inNum('Ring thickness %',function(){return DN.thick;},function(v){DN.thick=v;},8,60),inNum('Gap between slices (degrees)',function(){return DN.gap;},function(v){DN.gap=v;},0,10)));
    dr.appendChild(inSel('Legend',function(){return DN.legend;},function(v){DN.legend=v;},DLEGENDS));
    dr.appendChild(pair(inChk('Show counts',function(){return DN.showCounts;},function(v){DN.showCounts=v;}),inChk('Hide states with none',function(){return DN.hideZero;},function(v){DN.hideZero=v;})));
    dr.appendChild(inChk('Use the map\u2019s tag filter',function(){return DN.mapTags;},function(v){DN.mapTags=v;}));
    dr.appendChild(h('p','note','Counts every sensor under the object, by PRTG\u2019s status. Legend names are English. A device, group or probe works best; a single sensor counts as one.'));
    showIf(dr,dRing);dn1.appendChild(dr);
    var dpz=h('div');
    dpz.appendChild(inSel('Shows',function(){return DN.mode;},function(v){DN.mode=v;},[['all','All sensor states'],['alarms','Alarms only']]));
    dpz.appendChild(h('p','note','PRTG draws this donut from its own include file, so the slice colors, ring thickness and legend text are PRTG\u2019s. Choosing a look restyles the card, title, centre number and legend colors around it.'));
    dpz.appendChild(h('p','note','PRTG\u2019s own CSS gives the ring a minimum height of 180 px. With a title and padding added, the object needs about 270 px of height or the ring is clipped. Leave the size on \u201cauto\u201d to let PRTG size it.'));
    showIf(dpz,dPrtg);dn1.appendChild(dpz);
    /* ---- graph ---- */
    var gr1=section('Graph');secIf(gr1,isGraph);
    gr1.appendChild(inSel('Shows',function(){return GR.kind;},function(v){
      GR.kind=v;
      if(v==='sensors'&&GR.titleMode==='object')GR.titleMode='stock';
      else if(v!=='sensors'&&GR.titleMode==='stock')GR.titleMode='object';
      refreshUI();
    },GRKINDS));
    var grp_=h('div');grp_.appendChild(inSel('Period',function(){return GR.period;},function(v){GR.period=parseInt(v,10);},GPERIODS));showIf(grp_,gPeriod);gr1.appendChild(grp_);
    var gso=h('div');
    gso.appendChild(inNum('Text size (0 = no text)',function(){return GR.fontSize;},function(v){GR.fontSize=v;},0,40));
    gso.appendChild(pair(inChk('Show the legend',function(){return GR.legend;},function(v){GR.legend=v;}),inChk('Show the axes',function(){return GR.axis;},function(v){GR.axis=v;})));
    gso.appendChild(inChk('Hover tooltips',function(){return GR.tooltips;},function(v){GR.tooltips=v;}));
    gso.appendChild(h('p','note','Tooltips only line up when the graph is shown at its full size. In a card layout the picture is shrunk to fit, so leave them off there.'));
    gso.appendChild(inChk('Show PRTG\u2019s message if placed on anything but a sensor',function(){return GR.check;},function(v){GR.check=v;}));
    showIf(gso,gSensor);gr1.appendChild(gso);
    var gli=h('div');
    gli.appendChild(pair(inNum('Tile width',function(){return GR.tileW;},function(v){GR.tileW=v;},100,1200),inNum('Tile height',function(){return GR.tileH;},function(v){GR.tileH=v;},60,800)));
    gli.appendChild(inChk('Use the map\u2019s tag filter',function(){return GR.mapTags;},function(v){GR.mapTags=v;}));
    showIf(gli,gList);gr1.appendChild(gli);
    var gr2=section('Layout and title');secIf(gr2,function(){return TYPE==='graph'&&GR.kind!=='toplist';});
    var glay=h('div');glay.appendChild(inSel('Layout',function(){return GR.layout;},function(v){GR.layout=v;},[['card','Card: title and padding, the graph shrinks to fit'],['edge','Edge to edge: the graph fills the object']]));glay.appendChild(h('p','note','A card puts a title and padding around the picture, which then shrinks to fit. In a short, wide object that leaves very little room, so use Edge to edge for wide, short graphs.'));
    showIf(glay,gSensor);gr2.appendChild(glay);
    var gti=h('div');
    gti.appendChild(inSel('Title',function(){return GR.titleMode;},function(v){GR.titleMode=v;},[['object','The object\u2019s name'],['stock','PRTG\u2019s \u201cGraphs of \u2026 (period)\u201d (lists)'],['custom','Custom text'],['none','No title']]));
    gti.appendChild(inText('Custom title text',function(){return GR.title;},function(v){GR.title=v;}));
    showIf(gti,function(){return TYPE==='graph'&&(GR.kind==='sensors'||(GR.kind==='sensor'&&GR.look.mode!=='prtg'));});gr2.appendChild(gti);
    var gcol=h('div');
    gcol.appendChild(inSel('Graph colors',function(){return GR.invert;},function(v){GR.invert=v;},[['auto','Automatic: invert on dark cards'],['never','Leave exactly as PRTG draws them'],['always','Always invert']]));
    gcol.appendChild(h('p','note','PRTG\u2019s graph is a picture with a light background and dark text. On a dark card it is inverted and blended in, so the card shows through and the text turns light. The line colors keep their hue but change in brightness.'));
    showIf(gcol,gTitled);gr2.appendChild(gcol);
    gr2.appendChild(showIf(h('p','note','Layout, title and colors apply once you choose a look under Look presets. PRTG\u2019s own look is written exactly as PRTG ships it.'),function(){return TYPE==='graph'&&GR.look.mode==='prtg';}));
    var gr3=section('Extra graph tag attributes');secIf(gr3,gSensor);
    gr3.appendChild(inArea('One per line, name="value"',function(){return (GR.extra||[]).join('\n');},function(v){GR.extra=v.split(/\r?\n/).filter(function(x){return x.trim();});},'bgcolor="1E293B"'));
    gr3.appendChild(h('p','note','Added to PRTG\u2019s graph tag as written.'));
    var ed1=section('Size, rotation and title');secIf(ed1,isTable);
    ed1.appendChild(inChk('Edit in the preview',function(){return ED.on;},function(v){ED.on=v;},refreshUI));
    ed1.appendChild(h('p','note','In the preview: drag the handles to resize (this sets the size when dropped), drag the round handle to rotate (hold Shift to snap to 15 degrees), double-click the title to edit it and drag it to move it. A selected title also moves with the arrow keys.'));
    ed1.appendChild(inNum('Rotation (degrees)',function(){return T.rot;},function(v){T.rot=v;},-180,180));
    ed1.appendChild(inSel('Title alignment',function(){return T.tAlign;},function(v){T.tAlign=v;},[['','As the look has it'],['left','Left'],['center','Center'],['right','Right']]));
    ed1.appendChild(pair(inNum('Title offset X',function(){return T.tOffX;},function(v){T.tOffX=v;},-2000,2000),inNum('Title offset Y',function(){return T.tOffY;},function(v){T.tOffY=v;},-2000,2000)));
    var edr=h('div','dpair');
    var b1=h('button','btn ghost','Reset rotation');b1.type='button';b1.addEventListener('click',function(){T.rot=0;refreshUI();render();});
    var b2=h('button','btn ghost','Reset title position');b2.type='button';b2.addEventListener('click',function(){T.tOffX=0;T.tOffY=0;T.tAlign='';refreshUI();render();});
    edr.appendChild(b1);edr.appendChild(b2);ed1.appendChild(edr);
    ed1.appendChild(h('p','note','Rotation turns the card inside the object. PRTG\u2019s own selection box and resize handle stay upright where they are, so the object can still be moved and resized in the designer. Leave the rotated card room: it is not clipped.'));
    var s3=section('Columns');secIf(s3,isTable);
    colsBody=h('div','drows');s3.appendChild(colsBody);

    var s4=section('Sorting and rows');secIf(s4,isTable);
    s4.appendChild(pair(inSel('Sort by',function(){return T.sortBy;},function(v){T.sortBy=v;},SORTS.map(function(k){return [k,colLabel(k)];})),
      inSel('Direction',function(){return T.sortDir;},function(v){T.sortDir=v;},[['asc','Ascending'],['desc','Descending']])));
    s4.appendChild(inNum('Maximum rows (0 = no limit)',function(){return T.count;},function(v){T.count=v;},0,1000));

    var s5=section('Filters');secIf(s5,isTable);
    s5.appendChild(h('label',null,'Show only these statuses'));
    var grid=h('div','dpair');
    STATUSDEF.forEach(function(d){
      grid.appendChild(inChk(d[1],function(){return T.status.indexOf(d[0])>-1;},function(v){
        var i=T.status.indexOf(d[0]);if(v&&i<0)T.status.push(d[0]);else if(!v&&i>-1)T.status.splice(i,1);}));
    });
    s5.appendChild(grid);
    s5.appendChild(h('p','note','Leave all unticked to show every status.'));
    s5.appendChild(inChk('Use the map\u2019s tag filter',function(){return T.mapTags;},function(v){T.mapTags=v;}));
    s5.appendChild(inText('Also require tag(s)',function(){return T.reqTag;},function(v){T.reqTag=v;},'pingsensor'));
    s5.appendChild(h('p','note','Several tags: each gets its own filter line, as PRTG\u2019s Memory Top 10 does.'));
    s5.appendChild(inText('Sensor name contains',function(){return T.nameContains;},function(v){T.nameContains=v;},'Ping'));
    s5.appendChild(inChk('Only sensors that report a value',function(){return T.onlyValue;},function(v){T.onlyValue=v;}));
    s5.appendChild(inChk('Only favorite sensors',function(){return T.onlyFav;},function(v){T.onlyFav=v;}));
    s5.appendChild(inArea('Extra table parameters, one per line',function(){return (T.extra||[]).join('\n');},function(v){T.extra=v.split(/\r?\n/).filter(function(x){return x.trim();});},'filter_type="snmpuptime"'));

    var s6=section('Behaviour');secIf(s6,isTable);
    s6.appendChild(inChk('Names are links to PRTG',function(){return T.links;},function(v){T.links=v;}));
    s6.appendChild(inChk('Sortable column headers',function(){return T.sortable;},function(v){T.sortable=v;}));
    s6.appendChild(inChk('Refresh automatically',function(){return T.refreshable;},function(v){T.refreshable=v;}));
    s6.appendChild(inChk('Show the info header',function(){return T.infoheader;},function(v){T.infoheader=v;}));

    /* ---- gauge: ring ---- */
    var g1=section('Channel and range');secIf(g1,isRing);
    g1.appendChild(inSel('Channel',function(){return G.channel;},function(v){G.channel=v;},[['primary','The sensor\u2019s main channel'],['name','A channel chosen by name']]));
    g1.appendChild(inText('Channel name (exactly as in PRTG)',function(){return G.channelName;},function(v){G.channelName=v;},'Traffic In'));
    g1.appendChild(inSel('Scale',function(){return G.rangeMode;},function(v){G.rangeMode=v;},[['channel','From the channel (PRTG\u2019s own minimum and maximum)'],['manual','Manual']]));
    g1.appendChild(pair(inNum('Minimum',function(){return G.min;},function(v){G.min=v;}),inNum('Maximum',function(){return G.max;},function(v){G.max=v;})));
    g1.appendChild(h('p','note','Manual values are also used when the channel has no scale of its own.'));
    g1.appendChild(inSel('Warning and error zones',function(){return G.limits;},function(v){G.limits=v;},[['channel','From the channel\u2019s limits in PRTG'],['manual','Manual'],['none','None']]));
    g1.appendChild(pair(inSel('Bad values are',function(){return G.dir;},function(v){G.dir=v;},[['above','High'],['below','Low']]),inNum('Warning at',function(){return G.warn;},function(v){G.warn=v;})));
    g1.appendChild(inNum('Error at',function(){return G.err;},function(v){G.err=v;}));
    var g2=section('Gauge style');secIf(g2,isRing);
    g2.appendChild(pair(inSel('Shape',function(){return G.shape;},function(v){G.shape=v;},[['ring','Ring (270\u00B0)'],['half','Half ring (180\u00B0)']]),inNum('Thickness',function(){return G.thick;},function(v){G.thick=v;},4,40)));
    g2.appendChild(pair(inSel('Drawn as',function(){return G.style;},function(v){G.style=v;},[['progress','Progress arc'],['zones','Colored zones with needle']]),inSel('Colour',function(){return G.colorMode;},function(v){G.colorMode=v;},[['status','By status'],['accent','Accent color']])));
    g2.appendChild(inChk('Needle (zones style)',function(){return G.needle;},function(v){G.needle=v;}));
    g2.appendChild(inChk('Show minimum and maximum',function(){return G.showMinMax;},function(v){G.showMinMax=v;}));
    g2.appendChild(inSel('Label under the value',function(){return G.label;},function(v){G.label=v;},[['channel','The channel name'],['custom','Custom text'],['none','None']]));
    g2.appendChild(inText('Custom label',function(){return G.labelText;},function(v){G.labelText=v;}));

    /* ---- gauge: PRTG's own ---- */
    var g3=section('PRTG gauge options');secIf(g3,isStock);
    g3.appendChild(inSel('Shows',function(){return G.kind;},function(v){G.kind=v;},GKINDS));
    g3.appendChild(inChk('Small gauges',function(){return G.small;},function(v){G.small=v;}));
    var dv=h('div');
    dv.appendChild(inSel('Sensors with a priority of',function(){return G.prio;},function(v){G.prio=parseInt(v,10);},[[4,'5 stars only'],[3,'4 and 5 stars'],[2,'3 to 5 stars'],[1,'2 to 5 stars'],[0,'1 to 5 stars (all)']]));
    dv.appendChild(inChk('Use the map\u2019s tag filter',function(){return G.mapTags;},function(v){G.mapTags=v;}));
    dv.appendChild(inText('Also require tag(s)',function(){return G.reqTag;},function(v){G.reqTag=v;},'pingsensor'));
    dv.appendChild(inNum('Maximum gauges (0 = all)',function(){return G.count;},function(v){G.count=v;},0,500));
    showIf(dv,isDevice);g3.appendChild(dv);
    g3.appendChild(inNum('Scale (1 = PRTG\u2019s own size)',function(){return G.scale;},function(v){G.scale=v>0?v:1;},0.5,3));
    g3.appendChild(h('p','note','PRTG draws its own gauge at a fixed size and cannot be resized in the designer. Scale enlarges everything inside the object, so make the object big enough. For a gauge that follows the item\u2019s size, use the ring gauge.'));
    g3.appendChild(inSel('Status strip on each gauge',function(){return G.strip;},function(v){G.strip=v;},[['thin','Thin'],['keep','PRTG\u2019s wide strip'],['hide','Hidden']]));
    g3.appendChild(inChk('Hide PRTG\u2019s settings icons',function(){return G.hideSettings!==false;},function(v){G.hideSettings=v;}));

    var s7=section('Look presets');secIf(s7,function(){return notIcStock()&&notPaste();});
    galleryEl=h('div','lookgrid');s7.appendChild(galleryEl);
    s7.appendChild(h('p','note','Click one to apply it, then fine-tune under Look details. The preview shows them on PRTG\u2019s own white map. Switch Background to \u201cThe look\u2019s own\u201d to see the stage each one was drawn for.'));

    var s8=section('Look details');secIf(s8,function(){return notIcStock()&&notPaste();});
    lookDetail=h('div');s8.appendChild(lookDetail);
    var famOptions=Array.prototype.map.call(el.fam.options,function(o){return [o.value,o.textContent];});
    var D=lookDetail;
    function grp(label,fn){var b=h('div');if(label)b.appendChild(h('label',null,label));D.appendChild(b);if(fn)showIf(b,fn);return b;}
    var g=grp('');
    g.appendChild(pair(inSel('Font',function(){return Lk().font;},function(v){Lk().font=v;},famOptions),inNum('Size',function(){return Lk().size;},function(v){Lk().size=v;},8,40)));
    g=grp('Card');
    g.appendChild(inChk('Card background and border',function(){return Lk().card;},function(v){Lk().card=v;}));
    g.appendChild(pair(inColor('Card fill',function(){return Lk().cardBg;},function(v){Lk().cardBg=v;}),inNum('Fill opacity %',function(){return Lk().cardA;},function(v){Lk().cardA=v;},0,100)));
    g.appendChild(h('p','note','Below 100% the map shows through the card. PRTG\u2019s map is white by default, so light text on a see-through card turns unreadable. Keep 100% unless your map background is dark.'));
    g.appendChild(pair(inColor('Border color',function(){return Lk().border;},function(v){Lk().border=v;}),inNum('Border width',function(){return Lk().bw;},function(v){Lk().bw=v;},0,6)));
    g.appendChild(pair(inNum('Corner radius',function(){return Lk().radius;},function(v){Lk().radius=v;},0,40),inSel('Shadow',function(){return Lk().shadow;},function(v){Lk().shadow=v;},[['none','None'],['soft','Soft'],['strong','Strong'],['glow','Glow']])));
    g.appendChild(pair(inNum('Padding inside the card',function(){return Lk().cardPad;},function(v){Lk().cardPad=v;},0,60),inColor('Accent color',function(){return Lk().accent;},function(v){Lk().accent=v;})));
    g.appendChild(h('p','note','Padding applies to every title style except the colored bar, which runs edge to edge.'));
    g=grp('Title');
    g.appendChild(pair(inSel('Title style',function(){return Lk().titleStyle;},function(v){Lk().titleStyle=v;},[['bar','Colored bar'],['heading','Heading'],['divider','Heading with line'],['accent','Heading with accent']]),inNum('Title size',function(){return Lk().titleSize;},function(v){Lk().titleSize=v;},8,60)));
    g.appendChild(pair(inColor('Heading color',function(){return Lk().titleText;},function(v){Lk().titleText=v;}),inColor('Bar color',function(){return Lk().titleBg;},function(v){Lk().titleBg=v;})));
    g.appendChild(inColor('Bar text color',function(){return Lk().titleColor;},function(v){Lk().titleColor=v;}));
    g=grp('Text');
    g.appendChild(pair(inColor('Text color',function(){return Lk().text;},function(v){Lk().text=v;}),inColor('Secondary text',function(){return Lk().muted||Lk().headColor;},function(v){Lk().muted=v;})));
    g=grp('Header row',isTable);
    g.appendChild(pair(inChk('Show it',function(){return Lk().head;},function(v){Lk().head=v;}),inChk('Capitals',function(){return Lk().headUpper;},function(v){Lk().headUpper=v;})));
    g.appendChild(pair(inSel('Header style',function(){return Lk().headStyle;},function(v){Lk().headStyle=v;},[['fill','Filled'],['line','Underlined in accent'],['plain','Plain']]),inColor('Header text',function(){return Lk().headColor;},function(v){Lk().headColor=v;})));
    g.appendChild(inColor('Header fill (filled style)',function(){return Lk().headBg;},function(v){Lk().headBg=v;}));
    g=grp('Rows',isTable);
    g.appendChild(pair(inColor('Link color',function(){return Lk().link;},function(v){Lk().link=v;}),inColor('Row hover',function(){return Lk().hover;},function(v){Lk().hover=v;})));
    g.appendChild(pair(inColor('Row line',function(){return Lk().line;},function(v){Lk().line=v;}),inNum('Row padding',function(){return Lk().pad;},function(v){Lk().pad=v;},0,40)));
    g.appendChild(pair(inNum('Side padding',function(){return Lk().cellX;},function(v){Lk().cellX=v;},0,60),inChk('Striped rows',function(){return Lk().zebra;},function(v){Lk().zebra=v;})));
    g.appendChild(inColor('Stripe',function(){return Lk().zebraBg;},function(v){Lk().zebraBg=v;}));
    g=grp('Status display',isTable);
    g.appendChild(pair(inSel('Shown as',function(){return Lk().status;},function(v){Lk().status=v;},[['dot','Colored dot'],['dottext','Dot and text'],['pill','Pill'],['text','Text only']]),inNum('Dot size',function(){return Lk().dot;},function(v){Lk().dot=v;},6,40)));
    g.appendChild(inChk('Tint rows that are down or warning',function(){return Lk().tint;},function(v){Lk().tint=v;}));
    g=grp('Status colors',notFrame);
    g.appendChild(pair(inColor('Up',function(){return Lk().c.up;},function(v){Lk().c.up=v;}),inColor('Warning',function(){return Lk().c.warning;},function(v){Lk().c.warning=v;})));
    g.appendChild(pair(inColor('Down',function(){return Lk().c.down;},function(v){Lk().c.down=v;}),inColor('Unusual',function(){return Lk().c.unusual;},function(v){Lk().c.unusual=v;})));
    g.appendChild(pair(inColor('Paused',function(){return Lk().c.paused;},function(v){Lk().c.paused=v;}),inColor('Unknown',function(){return Lk().c.unknown;},function(v){Lk().c.unknown=v;})));
    var n1=h('p','note','Dots, pills and tinted rows use a small script in the file. It runs only on View Map.');showIf(n1,isTable);D.appendChild(n1);
    var n2=h('p','note','The ring gauge draws itself with a small script in the file. It runs only on View Map.');showIf(n2,isRing);D.appendChild(n2);
    hostEl.appendChild(s7.parentNode);   /* Look presets is the last section: moving the node puts it after Look details */
    var rsb=h('div','objreset');
    var rb=h('button','btn ghost','Reset all');rb.type='button';rb.addEventListener('click',resetCurrent);
    rsb.appendChild(rb);rsb.appendChild(h('p','note','Puts every setting of this object back to its starting value. Ctrl+Z undoes it.'));hostEl.appendChild(rsb);
    refreshUI();
  }

  /* ---------- wiring ---------- */
  document.getElementById('ocopy').addEventListener('click',function(){copyText(codeEl.value);});
  document.getElementById('odl').addEventListener('click',function(){download(fileNameOf(M()),codeEl.value);});
  document.getElementById('obg').addEventListener('change',function(){drawPreview();});
  document.getElementById('owidth').addEventListener('input',function(){drawPreview();});
  document.getElementById('oheight').addEventListener('input',function(){drawPreview();});
  document.getElementById('osample').addEventListener('change',function(){sampleState=this.value;drawPreview();});
  OBJAPI.enter=function(){TABS.show('obj');};
  OBJAPI.copyText=copyText;OBJAPI.toast=toast;   /* the library region copies its install script with these */
  /* The Dashboard edits one of its frames or backgrounds in this tab's editor. The tab's own frame and its undo history are set aside for the
     time and come back untouched afterwards. */
  var EDK=null;
  OBJAPI.frameEdit={
    begin:function(kind,p,w,h){
      var fr=blankFR(kind);
      fr.p=JSON.parse(JSON.stringify(p));fr.w=w;fr.h=h;
      EDK={kind:kind,type:TYPE,frame:FRM.frame,bg:FRM.bg,shape:FRM.shape,hf:HIST.frame,hb:HIST.bg,hs:HIST.shape};
      FRM[kind]=fr;delete HIST[kind];
      OBJAPI.active=true;
      document.body.classList.add('objs');
      if(TYPE!==kind)setType(kind);else{refreshUI();render();}
    },
    read:function(){var fr=EDK&&FRM[EDK.kind];return fr?{p:JSON.parse(JSON.stringify(fr.p)),w:fr.w,h:fr.h}:null;},
    end:function(){
      if(!EDK)return;
      FRM.frame=EDK.frame;FRM.bg=EDK.bg;FRM.shape=EDK.shape;
      if(EDK.hf)HIST.frame=EDK.hf;else delete HIST.frame;
      if(EDK.hb)HIST.bg=EDK.hb;else delete HIST.bg;
      if(EDK.hs)HIST.shape=EDK.hs;else delete HIST.shape;
      TYPE=EDK.type;EDK=null;
      OBJAPI.active=false;
      document.body.classList.remove('objs');
      if(!isLegacy(TYPE))buildPresetOptions();
      refreshUI();syncTypeSelects();hUpdate();
    }
  };
  TABS.register({id:'obj',button:'mObj',api:OBJAPI,
    open:function(){
      OBJAPI.active=true;
      if(isLegacy(TYPE)){document.body.classList.remove('objs');setMode(TYPE);}
      else{document.body.classList.add('objs');render();}
    }});
    OBJAPI.leave=function(){
    if(!OBJAPI.active)return;
    OBJAPI.active=false;
    document.body.classList.remove('objs');
    document.getElementById('mObj').classList.remove('on');
  };
  edWire();eoWire();
    hWire();
    buildPanel();
    legSel=document.getElementById('legTypeSel');
    fillTypeSelect(legSel);
    try{buildTypeGrid();}catch(err){if(window.console)console.error('type grid',err);}
    legSel.addEventListener('change',function(){setType(legSel.value);});
    syncTypeSelects();
    render();
    OBJAPI.enter();     /* the page opens on the Objects tab, showing the Text label tool as before */
  }catch(err){
  if(window.console)console.error('Objects tab failed to start',err);
  var b=document.getElementById('mObj');if(b)b.style.display='none';
}
})();
/* @endregion: objects */

/* @region: dashtabs -- the Dashboard tab's sections are regrouped into four tabs (names and grouping in config, dashTabs). Nothing inside a section changes. */
(function dashTabs(){
try{
  var dp=document.getElementById('dashpanel'), mb=document.getElementById('modebar'), eb=document.getElementById('editbar');
  if(!dp||!mb)return;
  var DT=CFG.dashTabs, MAP={}, FOLD={}, FOLDOPEN={}, DTABS=DT.tabs.map(function(t){MAP[t.id]=t.sections;return [t.id,t.icon,t.label];});
  DT.fold.forEach(function(n){FOLD[n]=1;});
  DT.foldOpen.forEach(function(n){FOLDOPEN[n]=1;});
  var bars={}, panes={}, btns={}, cur=DT.start;
  [].forEach.call(dp.querySelectorAll(':scope > .secfs'),function(fs){var t=fs.querySelector(':scope > .advbar .sectitle');if(t)bars[t.textContent]=fs;});
  DTABS.forEach(function(t){
    var d=document.createElement('div');d.className='dpane'+(t[0]===cur?' on':'');d.id='dpane-'+t[0];
    MAP[t[0]].forEach(function(title){var fs=bars[title];if(!fs)return;if(!FOLD[title]&&!FOLDOPEN[title])fs.classList.add('flat');d.appendChild(fs);if(FOLDOPEN[title]){var ob=fs.querySelector(':scope > .advbar');if(ob&&ob.getAttribute('aria-expanded')!=='true')ob.click();}});
    dp.appendChild(d);panes[t[0]]=d;
  });
  var row=document.createElement('div');row.id='dtabs';row.setAttribute('role','tablist');
  DTABS.forEach(function(t){
    var b=document.createElement('button');b.type='button';b.setAttribute('role','tab');
    b.innerHTML='<span class="dti">'+t[1]+'</span>'+t[2]+(t[0]==='layers'?'<span class="dtn"></span>':'');
    b.addEventListener('click',function(){show(t[0]);});
    row.appendChild(b);btns[t[0]]=b;
  });
  mb.insertBefore(row,eb||null);
  function show(k){
    cur=k;
    DTABS.forEach(function(t){var on=t[0]===k;panes[t[0]].classList.toggle('on',on);btns[t[0]].classList.toggle('on',on);btns[t[0]].setAttribute('aria-selected',on?'true':'false');});
    if(window.SECAPI)try{document.dispatchEvent(new CustomEvent('secopen',{detail:{fs:panes[k]}}));}catch(e){}
  }
  document.addEventListener('gotodashtab',function(e){var k=e&&e.detail;if(k&&panes[k])show(k);});
  /* the same line icons the Objects tab uses, on the Build buttons */
  (function(){
    function sv(p){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+p+'</svg>';}
    var IC={
      frame:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
      label:'<path d="M5 6h14M12 6v13M9 19h6"/>',
      button:'<rect x="3" y="8" width="18" height="9" rx="4.5"/><path d="M8 12.5h8"/>',
      bg:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 17l9-9M8 12l4-4M13 17l4-4"/>',
      shape:'<path d="M4 12h13"/><path d="m13 7 5 5-5 5"/>',
      existing:'<rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><path d="M8 7h.01M8 17h.01"/>'
    };
    [].forEach.call(document.querySelectorAll('#dashpanel .addgrid .btn'),function(b){
      var k=b.getAttribute('data-add')||'existing';
      if(IC[k])b.innerHTML=sv(IC[k])+'<span>'+b.textContent+'</span>';
    });
  })();
  /* the Existing PRTG objects section is shown by the sixth button under Build */
  (function(){
    var fs=document.getElementById('objfs'), btn=document.getElementById('showexisting');
    if(!fs||!btn)return;
    fs.classList.add('folded');
    btn.addEventListener('click',function(){
      var open=fs.classList.contains('folded');
      fs.classList.toggle('folded',!open);btn.classList.toggle('on',open);btn.setAttribute('aria-expanded',open?'true':'false');
      if(open){try{document.dispatchEvent(new CustomEvent('secopen',{detail:{fs:fs}}));fs.scrollIntoView({block:'nearest'});}catch(e){}}
    });
  })();
  /* the five Build tiles also open an Edit style section below, the way the sixth opens Existing PRTG objects */
  (function(){
    var build=bars['Build'], exFs=document.getElementById('objfs'), exBtn=document.getElementById('showexisting');
    if(!build)return;
    var fs=document.createElement('fieldset');fs.id='stylefs';fs.className='secfs flat folded';
    fs.innerHTML='<button type="button" class="advbar open hasnote" tabindex="-1"><span class="seccaret">\u25BE</span> <span class="sectitle">Edit style</span><span class="secnote"></span></button>'
      +'<div class="secbody"><p class="note">Opens the editor with this item\u2019s settings: fonts, colors, border, shadow, size and everything else. Press Done to come back, or double-click the item.</p><button type="button" class="btn" id="addeditstyle">Edit style</button></div>';
    build.parentNode.insertBefore(fs,build.nextSibling);
    var note=fs.querySelector('.secnote'), go=document.getElementById('addeditstyle');
    function formBtn(){var f=document.getElementById('dform');return f?[].filter.call(f.querySelectorAll('button'),function(b){return b.textContent==='Edit style';})[0]:null;}
    function sync(){
      var sel=null;try{sel=DASHAPI.selected();}catch(e){}
      if(!sel){fs.classList.add('folded');return;}
      var fb=formBtn();go.disabled=!fb||fb.disabled;
      var h=document.querySelector('#dform h4');note.textContent=h?h.textContent:'';
    }
    function hideStyle(){fs.classList.add('folded');}
    document.addEventListener('builditemadded',function(){
      if(exFs&&!exFs.classList.contains('folded')){exFs.classList.add('folded');if(exBtn){exBtn.classList.remove('on');exBtn.setAttribute('aria-expanded','false');}}
      fs.classList.remove('folded');sync();
    });
    if(exBtn)exBtn.addEventListener('click',function(){if(!exFs.classList.contains('folded'))hideStyle();});
    go.addEventListener('click',function(){var fb=formBtn();if(fb&&!fb.disabled)fb.click();});
    document.addEventListener('dashselect',function(){if(!fs.classList.contains('folded'))setTimeout(sync,0);});
  })();
  /* Build tiles: one click arms a tile and the next click on the canvas places it; a double-click adds it at the default spot; a tile can also be dragged onto the canvas */
  (function(){
    var grid=document.querySelector('#dashpanel .addgrid'), wrapEl=document.getElementById('dwrap');
    if(!grid||!wrapEl||!window.DASHAPI||!DASHAPI.addAt)return;
    var NAMES={frame:'frame',label:'label',button:'button',bg:'background',shape:'shape'}, armed=null, tiles=[].slice.call(grid.querySelectorAll('[data-add]'));
    var hint=document.createElement('p');hint.id='addhint';hint.className='note pst';
    var base='Click a tile, then click the canvas to place it. Double-click a tile to add it at the default spot, or drag it onto the canvas.';
    hint.textContent=base;grid.parentNode.insertBefore(hint,grid.nextSibling);
    function arm(type){
      armed=type;
      tiles.forEach(function(t){t.classList.toggle('armed',t.getAttribute('data-add')===type);});
      wrapEl.classList.toggle('placing',!!type);
      hint.classList.toggle('on',!!type);
      hint.textContent=type?('Click on the canvas to place the '+NAMES[type]+'. Esc cancels.'):base;
    }
    function added(){try{document.dispatchEvent(new CustomEvent('builditemadded'));}catch(e){}}
    /* choosing any tile other than Existing PRTG objects closes that section */
    function hideExisting(){var fs=document.getElementById('objfs'), bt=document.getElementById('showexisting');if(fs&&!fs.classList.contains('folded')){fs.classList.add('folded');if(bt){bt.classList.remove('on');bt.setAttribute('aria-expanded','false');}}}
    /* capture on the grid so the tool's own one-click add does not also run */
    grid.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('[data-add]');if(!b||!grid.contains(b))return;
      e.stopPropagation();
      var type=b.getAttribute('data-add');
      hideExisting();
      if(e.detail>=2){arm(null);fromCanvas=0;DASHAPI.add(type);added();return;}   /* the second click of a double-click */
      arm(armed===type?null:type);
    },true);
    /* the next press on the canvas places the armed item, even on top of another item */
    wrapEl.addEventListener('mousedown',function(e){
      if(!armed||e.button!==0)return;
      e.preventDefault();e.stopPropagation();
      var type=armed;arm(null);
      fromCanvas=0;   /* placing is not selecting: stay on the Add tab */
      DASHAPI.addAt(type,e.clientX,e.clientY);added();
    },true);
    document.addEventListener('keydown',function(e){if(armed&&e.key==='Escape')arm(null);});
    ['mObj','dtabs'].forEach(function(id){var n=document.getElementById(id);if(n)n.addEventListener('click',function(ev){if(id==='mObj'||(ev.target.closest&&ev.target.closest('button')))arm(null);});});
    /* drag a tile onto the canvas */
    var MIME='application/x-build-item';
    tiles.forEach(function(t){
      t.draggable=true;
      t.addEventListener('dragstart',function(e){
        hideExisting();arm(null);
        try{e.dataTransfer.setData(MIME,t.getAttribute('data-add'));e.dataTransfer.setData('text/plain',NAMES[t.getAttribute('data-add')]);e.dataTransfer.effectAllowed='copy';}catch(x){}
      });
    });
    function isBuild(e){var ty=e.dataTransfer&&e.dataTransfer.types;return !!ty&&[].indexOf.call(ty,MIME)>=0;}
    wrapEl.addEventListener('dragover',function(e){if(!isBuild(e))return;e.preventDefault();try{e.dataTransfer.dropEffect='copy';}catch(x){}wrapEl.classList.add('dropping');});
    wrapEl.addEventListener('dragleave',function(e){if(isBuild(e)&&(!e.relatedTarget||!wrapEl.contains(e.relatedTarget)))wrapEl.classList.remove('dropping');});
    wrapEl.addEventListener('drop',function(e){
      if(!isBuild(e))return;
      e.preventDefault();wrapEl.classList.remove('dropping');
      var type=e.dataTransfer.getData(MIME);if(!NAMES[type])return;
      fromCanvas=0;
      DASHAPI.addAt(type,e.clientX,e.clientY);added();
    });
  })();
  show(cur);
  /* sections without a fold are opened once and cannot be closed */
  Object.keys(bars).forEach(function(title){
    if(FOLD[title])return;
    var bar=bars[title].querySelector(':scope > .advbar');
    if(bar&&!bar.classList.contains('open'))bar.click();
  });
  /* count badge on Layers, taken from the "Items on the canvas" note */
  (function(){
    var note=bars['Items on the canvas']&&bars['Items on the canvas'].querySelector('.secnote'), badge=btns.layers.querySelector('.dtn');
    if(!note||!badge)return;
    function sync(){var m=/^(\d+)/.exec(note.textContent);badge.textContent=m?m[1]:'';}
    new MutationObserver(sync).observe(note,{childList:true,characterData:true,subtree:true});sync();
  })();
  /* clicking an item on the canvas opens the Selected tab */
  var fromCanvas=0, lastSel=null, stage=document.getElementById('dashstage');
  if(stage)stage.addEventListener('pointerdown',function(){fromCanvas=Date.now();},true);
  document.addEventListener('dashselect',function(){
    var s=null;try{s=window.DASHAPI&&DASHAPI.selected&&DASHAPI.selected();}catch(e){}
    var id=s?s.id:null;
    if(id!==null&&id!==lastSel&&Date.now()-fromCanvas<DT.canvasClickMs&&cur!=='sel')show('sel');
    lastSel=id;
  });
  var pg=document.getElementById('pushgo');if(pg&&pg.parentNode)pg.parentNode.classList.add('stickyfoot');   /* Push stays in view at the bottom of the panel */
  /* the Review changes strip opens the Add tab, where the changes to items already on the map are reviewed (the Existing PRTG maps section) */
  var rev=document.getElementById('exbarrev');
  if(rev)rev.addEventListener('click',function(){show('add');},true);
}catch(err){if(window.console)console.error('dashboard tabs',err);}
})();
/* @endregion: dashtabs */

buildPresets();
render();