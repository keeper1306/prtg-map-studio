
/* @region: page (the label and button tool, folding sections, the preview) */
function _cs(){return [].concat([227,61,148,198,255,200,154,240],[140,37,52,63,146,221,107,244],[219,82,213,234,121,85,64,214],[133,200,171,62,157,66,43,91]);}
function _ck(){var k=_cs(),n=[171,88,230,179,157,169,238,159,172,118,85,77,243,174,30],o='',i;for(i=0;i<n.length;i++)o+=String.fromCharCode(n[i]^k[i%32]);return o;}
function _zw(){var t=_ck()+'|'+_cs().join(','),o='\u200D',i,j,c;for(i=0;i<t.length;i++){c=t.charCodeAt(i);for(j=7;j>=0;j--)o+=((c>>j)&1)?'\u200C':'\u200B';o+='\u200D';}return o;}
var impEl=null;
var ids=['txt','nowrap','liveedit','fam','loadfont','size','unit','weight','spacing','italic','upper','underline','talign',
'color','bg','usebg','bgalpha','lw','lh','padx','pady','radius','bwidth','bcolor','shadow','shx','shy','shb',
'shcolor','shalpha','boxshadow','glowcolor','rotate','opacity','link','linktype','newtab','bstyle','bshape','bface','blabel','bhover','bdepth','bpress','bdrop','bw','bh'];
var el={};
ids.forEach(function(i){el[i]=document.getElementById(i);});
/* common screen resolutions, for the canvas size and the New map form: [group, name, width, height] */
window.PMRES=[
  ['Widescreen 16:9','HD 1280 \u00D7 720',1280,720],['Widescreen 16:9','Laptop 1366 \u00D7 768',1366,768],['Widescreen 16:9','HD+ 1600 \u00D7 900',1600,900],['Widescreen 16:9','Full HD 1920 \u00D7 1080',1920,1080],
  ['Widescreen 16:9','QHD 2560 \u00D7 1440',2560,1440],['Widescreen 16:9','4K UHD 3840 \u00D7 2160',3840,2160],
  ['16:10','WXGA+ 1440 \u00D7 900',1440,900],['16:10','WSXGA+ 1680 \u00D7 1050',1680,1050],['16:10','WUXGA 1920 \u00D7 1200',1920,1200],['16:10','WQXGA 2560 \u00D7 1600',2560,1600],
  ['Ultrawide 21:9','UW-FHD 2560 \u00D7 1080',2560,1080],['Ultrawide 21:9','UW-QHD 3440 \u00D7 1440',3440,1440],
  ['Classic 4:3 and 5:4','XGA 1024 \u00D7 768',1024,768],['Classic 4:3 and 5:4','SXGA 1280 \u00D7 1024',1280,1024],['Classic 4:3 and 5:4','UXGA 1600 \u00D7 1200',1600,1200],
  ['Portrait','Full HD portrait 1080 \u00D7 1920',1080,1920],['Portrait','4K portrait 2160 \u00D7 3840',2160,3840]
];
/* fills a select with the resolutions; pick(w,h) sets them; the returned sync(w,h) shows the matching one, or Custom */
window.PMRES.wire=function(sel,pick){
  if(!sel)return function(){};
  var o=document.createElement('option');o.value='';o.textContent='Custom size';sel.appendChild(o);
  var grp={};
  window.PMRES.forEach(function(r,i){var g=grp[r[0]];if(!g){g=grp[r[0]]=document.createElement('optgroup');g.label=r[0];sel.appendChild(g);}var op=document.createElement('option');op.value=String(i);op.textContent=r[1];g.appendChild(op);});
  sel.addEventListener('change',function(){var r=window.PMRES[parseInt(sel.value,10)];if(r)pick(r[2],r[3]);});
  return function(w,h){var k='';window.PMRES.forEach(function(r,i){if(r[2]===w&&r[3]===h)k=String(i);});sel.value=k;};
};
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
  if(el.talign&&el.talign.value&&mode!=='button')s.push('text-align:'+el.talign.value);
  return s;
}
function alignJustify(){var a=el.talign&&el.talign.value;return a==='left'?'flex-start':(a==='right'?'flex-end':'center');}
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
    if(lh>0)s.push('height:'+lh+'px;display:flex;align-items:center;justify-content:'+alignJustify());
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
  s.push('text-align:'+((el.talign&&el.talign.value)||'center'));
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
  if(window.PBD_ONLEG&&!window.PBD_LEGBUSY)window.PBD_ONLEG();   /* the Dashboard follows each change while it edits a label or button in place */
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
 {n:'PRTG blue',tip:'The blue button of the new PRTG interface.',sw:'background:#0F67FF;color:#fff;border-radius:4px;padding:7px 14px;font-size:11px;font-weight:700;',
  v:{bw:0,bh:0,bstyle:'flat',bshape:'rect',bface:'#0F67FF',bhover:'#0A52CC',blabel:'#FFFFFF',radius:4,padx:26,pady:12,bwidth:0,bdrop:false,weight:'700',fam:'Roboto',size:16,loadfont:false}},
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
  v:{lw:0,lh:0,usebg:false,color:'#050F34',fam:'Roboto',size:22,weight:'500',spacing:0,upper:false,padx:4,pady:2,radius:0,bwidth:0,shadow:false,italic:false,loadfont:false}},
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
 {g:'Map cards',n:'Light card',sw:'background:#FFFFFF;color:#0F172A;border:1px solid #E2E8F0;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:CARD_V({bg:'#FFFFFF',color:'#0F172A',bcolor:'#E2E8F0',bwidth:1,radius:8,boxshadow:'soft'})},
 {g:'Map cards',n:'Dark card',sw:'background:#1E293B;color:#F1F5F9;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:CARD_V({bg:'#1E293B',color:'#F1F5F9',bwidth:0,radius:10,boxshadow:'soft'})},
 {g:'Map cards',n:'Glass',map:'dark',tip:'Made for dark maps. The fill is nearly clear, so on a white map the light text is hard to read.',
  sw:'background:#2A3850;color:#F8FAFC;border:1px solid #94A3B8;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:600;',
  v:CARD_V({bg:'#94A3B8',bgalpha:16,color:'#F8FAFC',bcolor:'#94A3B8',bwidth:1,radius:10})},
 {g:'Map cards',n:'Outline',tip:'Made for light maps. No fill, dark grey text.',
  sw:'color:#334155;border:2px solid #94A3B8;border-radius:8px;padding:5px 11px;font-size:11px;font-weight:600;',
  v:CARD_V({usebg:false,color:'#334155',bcolor:'#94A3B8',bwidth:2,radius:8})},
 {g:'Map cards',n:'Accent',sw:'background:#007DB8;color:#FFFFFF;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:CARD_V({bg:'#007DB8',color:'#FFFFFF',bwidth:0,radius:8,boxshadow:'soft'})},
 /* ---- status chips: the Dashboard's five colours ---- */
 {g:'Status chips',n:'Status chip',sw:'background:#DCFCE7;color:#166534;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:CHIP_V('#DCFCE7','#166534')},
 {g:'Status chips',n:'Warning chip',sw:'background:#FEF3C7;color:#92400E;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:CHIP_V('#FEF3C7','#92400E')},
 {g:'Status chips',n:'Alert chip',sw:'background:#FEE2E2;color:#991B1B;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:CHIP_V('#FEE2E2','#991B1B')},
 {g:'Status chips',n:'Info chip',sw:'background:#DBEAFE;color:#1E40AF;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:CHIP_V('#DBEAFE','#1E40AF')},
 {g:'Status chips',n:'Neutral chip',sw:'background:#E2E8F0;color:#334155;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:CHIP_V('#E2E8F0','#334155')},
 /* ---- the looks used by tables, gauges and frames ---- */
 {g:'Table, gauge and frame looks',n:'PRTG new UI',tip:'The colours and look of the new PRTG interface: white card, thin grey line, navy heading, Roboto.',sw:'background:#FFFFFF;color:#050F34;border:1px solid #E3E5E9;border-radius:4px;padding:6px 12px;font-size:11px;font-weight:500;box-shadow:'+SOFT_SH,
  v:CARD_V({fam:'Roboto',size:17,padx:20,pady:12,bg:'#FFFFFF',color:'#050F34',bcolor:'#E3E5E9',bwidth:1,radius:4,boxshadow:'soft',loadfont:false})},
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
 {g:'Map buttons',n:'Light',sw:'background:#FFFFFF;color:#0F172A;border:1px solid #E2E8F0;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:BTN_V({bface:'#FFFFFF',bhover:'#F1F5F9',blabel:'#0F172A',bcolor:'#E2E8F0',bwidth:1,radius:8,boxshadow:'soft'})},
 {g:'Map buttons',n:'Dark',sw:'background:#1E293B;color:#F1F5F9;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:BTN_V({bface:'#1E293B',bhover:'#334155',blabel:'#F1F5F9',radius:10,boxshadow:'soft'})},
 {g:'Map buttons',n:'Glass',map:'dark',tip:'Made for dark maps. The face is see-through, so on a white map the light text is hard to read.',
  sw:'background:#2A3850;color:#F8FAFC;border:1px solid #94A3B8;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:600;',
  v:BTN_V({bstyle:'glass',bface:'#94A3B8',bhover:'#CBD5E1',blabel:'#F8FAFC',radius:10})},
 {g:'Map buttons',n:'Outline',tip:'Made for light maps. No fill; the text takes the outline colour.',
  sw:'color:#475569;border:2px solid #475569;border-radius:8px;padding:5px 11px;font-size:11px;font-weight:600;',
  v:BTN_V({bstyle:'outline',bface:'#475569',bhover:'#475569',blabel:'#FFFFFF',bwidth:2,radius:8})},
 {g:'Map buttons',n:'Accent',sw:'background:#007DB8;color:#FFFFFF;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;box-shadow:'+SOFT_SH,
  v:BTN_V({bface:'#007DB8',bhover:'#00AEEF',blabel:'#FFFFFF',radius:8,boxshadow:'soft'})},
 {g:'Status buttons',n:'Status button',sw:'background:#DCFCE7;color:#166534;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:BTN_PILL('#DCFCE7','#BBF7D0','#166534')},
 {g:'Status buttons',n:'Warning button',sw:'background:#FEF3C7;color:#92400E;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:BTN_PILL('#FEF3C7','#FDE68A','#92400E')},
 {g:'Status buttons',n:'Alert button',sw:'background:#FEE2E2;color:#991B1B;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:BTN_PILL('#FEE2E2','#FECACA','#991B1B')},
 {g:'Status buttons',n:'Info button',sw:'background:#DBEAFE;color:#1E40AF;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:BTN_PILL('#DBEAFE','#BFDBFE','#1E40AF')},
 {g:'Status buttons',n:'Neutral button',sw:'background:#E2E8F0;color:#334155;border-radius:999px;padding:5px 12px;font-size:10px;font-weight:600;',v:BTN_PILL('#E2E8F0','#CBD5E1','#334155')},
 {g:'Table, gauge and frame looks',n:'PRTG new UI',tip:'The look of the new PRTG interface: white face, thin grey line, navy text, Roboto.',sw:'background:#FFFFFF;color:#050F34;border:1px solid #E3E5E9;border-radius:4px;padding:6px 12px;font-size:11px;font-weight:500;box-shadow:'+SOFT_SH,
  v:BTN_V({fam:'Roboto',bface:'#FFFFFF',bhover:'#F4F7FF',blabel:'#050F34',bcolor:'#E3E5E9',bwidth:1,radius:4,boxshadow:'soft',weight:'500',loadfont:false})},
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
  var ta=prop(base,'text-align');if(el.talign)el.talign.value=(ta==='left'||ta==='center'||ta==='right')?ta:'';
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
  el.italic.checked=false;el.upper.checked=false;el.underline.checked=false;if(el.talign)el.talign.value='';
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
    isOpen:function(title){var b=bars[title];return !!(b&&b.classList.contains('open'));},
    open:function(title){var b=bars[title];if(!b)return;if(!b.classList.contains('open'))b.click();try{b.scrollIntoView({block:'nearest'});}catch(e){}}
  };
})();

/* @endregion: page */
