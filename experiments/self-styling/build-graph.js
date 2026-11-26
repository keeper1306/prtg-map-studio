const fs=require('fs');
const b=fs.readFileSync('build.js','utf8');
// reuse the table build's looks, gear and bar CSS
const looks=JSON.parse(fs.readFileSync('/tmp/looks.json','utf8'));
const order=['Corporate blue','PRTG new UI','Clean card','Light card','Minimal','Executive dark','Indigo board','Slate fintech','Neon plum','Teal glass','Dark card','Wall display','Brand navy'];
const lookTxt='{\n'+order.map(n=>'    '+JSON.stringify(n)+':'+JSON.stringify(looks[n])).join(',\n')+'\n  }';
const GEAR=/const GEAR=(JSON\.stringify\('[^\n]*'\));/.exec(b)[1];
const PC=b.slice(b.indexOf('const PCSS=['),b.indexOf('];',b.indexOf('const PCSS=['))+2);
eval('var G='+GEAR+';'+PC.replace('const PCSS','var PCSS'));
const extra=['.seg2{display:inline-flex;gap:2px}','.s.short{width:92px}',
 '.shots{display:grid;grid-template-columns:repeat(4,116px);gap:6px}',
 '.shot{display:flex;flex-direction:column;align-items:stretch;gap:4px;padding:4px;border:1px solid #DDE1E8;border-radius:7px;background:#fff;color:#1d2433;font:inherit;font-size:11px;line-height:1.2;text-align:center;cursor:pointer}',
 '.shot i{display:block;height:42px;border-radius:4px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}',
 '.shot i svg{display:block}','.t.shotsw~.pop{width:max-content}',
 '.shot:hover{border-color:#9FB3C8}',
 '.shot.on{border-color:#007DB8;background:#E6F3FA;box-shadow:0 0 0 1px #007DB8}'];
const bcss='[\n'+PCSS.concat(extra).map(x=>'    '+JSON.stringify(x)).join(',\n')+'\n  ].join("\\n")';
let js=fs.readFileSync('g-head.js','utf8').replace('__GRAPHRUNTIME__',fs.readFileSync('graphRuntime.js','utf8'))
  +fs.readFileSync('save.js','utf8')+'\n'+fs.readFileSync('g-ui.js','utf8')+fs.readFileSync('g-tail.js','utf8');
js=js.replace('__LOOKS__',lookTxt).replace('__LOOKNAMES__',JSON.stringify(order)).replace('__GEAR__',()=>G).replace('__BCSS__',bcss);
if(/<[#@]/.test(js))throw new Error('script contains a PRTG tag');
js=js.replace('__ITEMID__','<@itemid>');
js=js.replace(/[^\x00-\x7f]/g,ch=>'\\u'+ch.charCodeAt(0).toString(16).padStart(4,'0'));
const css=fs.readFileSync('g-style.css','utf8');
const file=`<!--Map Studio Tests: Map Studio Graph - restyle it on the map (test)-->

<div class="map_object map_graph msgr mst-t-bar" id="<@itemid>" objectid="<@objectid>" subid="<@subid>" initialwidth="520" initialheight="300" style="overflow:hidden;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">
<#mapobject type="objectgrip" mode="<@editmode>">
<#mapobject type="htmlbefore" subid="<@subid>">
<#checkobjecttype objecttype="sensor" nicemessage="true" id="<@objectid>">
<style>
${css}</style>

  <div class="gbox">
    <div class="gtitle"><#objectproperty name="Name" id="<@objectid>"></div>
    <div class="ggraph">
      <div class="gown" data-g="loading"></div>
      <template class="gfall"><#object type="graph" id="<@objectid>" graphid="0" width="<@width>" height="<@height>" tooltexts="0" graphstyling="baseFontSize='12'%20showLegend='1'" ></template>
    </div>
  </div>
<#mapobject type="htmlafter" subid="<@subid>">
<script>
${js}</script>
</div>
`;
if(/[^\x00-\x7f]/.test(file))throw new Error('non-ASCII left');
fs.writeFileSync('map-studio-zz-graph-self-styling.htm',file);
console.log('bytes',file.length,'longest',Math.max(...file.split('\n').map(l=>l.length)));
