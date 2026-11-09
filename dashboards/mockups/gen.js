/* Makes the three PRTG object files for the mockup dashboards 01-03. Run: node gen.js <outdir> */
const fs=require('fs'), path=require('path');
const D=__dirname, out=process.argv[2]||path.join(D,'out');
fs.mkdirSync(out,{recursive:true});
const runtime=fs.readFileSync(path.join(D,'runtime.js'),'utf8').replace(/^\/\*[\s\S]*?\*\/\n/,'');
const MAPS=[
  {n:'01',slug:'noc-overview',title:'NOC overview',draw:'draw01',cfg:{title:'NOC overview',kicker:'IT operations · NOC wall display',ttl:30,traffic:2106,trafficTitle:'Core bandwidth',alarmRows:7,sites:8,latencyScale:200,latencyWarn:150}},
  {n:'02',slug:'slos-and-error-budget',title:'SLOs & error budget',draw:'draw02',cfg:{title:'SLOs & error budget',ttl:300,days:30,
    services:[{id:2149,name:'devicesetup.net · HTTP',goal:99.95},{id:2162,name:'192.168.0.208 · Ping',goal:99.9},{id:2163,name:'Printer · Ping',goal:99.9},{id:2132,name:'devicesetup.net · Ping',goal:99.9}],
    latencyId:2169,latencyName:'Printer HTTP latency',latencySlo:300,mix:[]}},
  {n:'03',slug:'wan-and-bandwidth',title:'WAN & bandwidth',draw:'draw03',cfg:{title:'WAN & bandwidth',kicker:'Network engineering',ttl:60,limit:0.8,
    links:[{id:2106,name:'Proxmox · nic0',cap:1e9},{id:2110,name:'Proxmox · vmbr0',cap:1e9},{id:2165,name:'Printer · LAN',cap:1e8},{id:1005,name:'Probe · VirtIO NIC',cap:1e9}]}}
];
for(const m of MAPS){
  const draw=fs.readFileSync(path.join(D,m.draw+'.js'),'utf8');
  const cls='msmk_'+m.n;
  const name='Map Studio Mockup '+m.n+' - '+m.title;
  const cfg=JSON.stringify(m.cfg).replace(/</g,'\\u003c');
  const html=`<!--Map Studio Dashboards: ${name}-->

<div class="map_object msmk ${cls}" id="<@itemid>" objectid="<@objectid>" subid="<@subid>" initialwidth="1280" initialheight="900" style="overflow:hidden;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">
<#mapobject type="objectgrip" mode="<@editmode>">
<#mapobject type="htmlbefore" subid="<@subid>">
<div class="msmk-host" style="position:absolute;left:0;top:0;right:0;bottom:0;background:#0E1218;color:#A0A9B8;font:14px Inter,Segoe UI,Arial,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;border-radius:2px">${m.n} · ${m.title.replace(/&/g,'&amp;')}<br>(the dashboard draws itself on View Map)</div>
<#mapobject type="htmlafter" subid="<@subid>">
</div>

<script>
(function(){
  var root=document.getElementById("<@itemid>");
  if(!root)return;
  var C=${cfg};
${draw.replace(/^/gm,'  ')}
  C.draw=${m.draw};
${runtime.replace(/^/gm,'  ')}
  msmkRuntime(root,C);
})();
</script>
`;
  const f='map-studio-mockup-'+m.n+'-'+m.slug+'.htm';
  fs.writeFileSync(path.join(out,f),html);
  console.log(f,html.length);
}
