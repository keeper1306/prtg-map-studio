

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
    status:'dot',dot:12,tint:true,stage:'',align:'',
    c:{up:'#2FA84F',warning:'#F0AD22',down:'#D8402F',unusual:'#F0AD22',paused:'#8B93A3',unknown:'#9AA0AD'}};
  function mix(a,b){var o={};for(var k in a)o[k]=a[k];for(var j in b)o[j]=b[j];return o;}
  var LOOKS={
    'PRTG default':{mode:'prtg'},
    'PRTG new UI':{font:'Roboto',cardBg:'#FFFFFF',border:'#E3E5E9',radius:4,shadow:'soft',titleStyle:'heading',titleText:'#050F34',titleSize:16,cardPad:16,
      headStyle:'plain',headColor:'#686B76',headUpper:false,text:'#31343F',link:'#0F67FF',line:'#EFEEEE',hover:'#F4F7FF',pad:10,cellX:10,
      status:'dot',stage:'#F9F9FA',muted:'#686B76',accent:'#0F67FF',
      c:{up:'#B4BC14',warning:'#F2BE25',down:'#E3063D',unusual:'#F07000',paused:'#448CFC',unknown:'#A4A6AF',ack:'#F37176'}},
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
  var LOOKORDER=['PRTG new UI','Clean card','Corporate blue','Executive dark','Indigo board','Slate fintech','Neon plum','Teal glass','Light card','Dark card','Minimal','Wall display','Brand navy','PRTG default'];
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
  /* "Scale everything with the object's size": the whole table (title, header, rows) is drawn at a normal width (C.w, the object's
     width at which the look's text sizes apply) and scaled to the object's box. It is laid out as wide as the box allows, never
     narrower than the normal width, and shrunk until every row fits the box's height. Shipped inside the file as its own source text. */
  function tableFitRuntime(root,C){
    var cont=root.querySelector('.maptablecontainer,.top10listcontainer');
    if(!cont||root.__msfit)return;
    root.__msfit=1;
    function px(v){return parseFloat(v)||0;}
    function fit(){
      var pl=cont.querySelector('[class*="prtg-plugin"]');   /* PRTG renames prtg-plugin to prtg-plugin-initialized once its table script ran */
      if(!pl||!root.clientWidth||!root.clientHeight)return;
      var cs=window.getComputedStyle(cont), pw=px(cs.paddingLeft)+px(cs.paddingRight), ph=px(cs.paddingTop)+px(cs.paddingBottom);
      cont.style.height='100%';cont.style.boxSizing='border-box';cont.style.overflow='hidden';
      root.style.overflow='hidden';
      var aw=root.clientWidth-pw, ah=root.clientHeight-ph;
      if(aw<10||ah<10)return;
      var base=Math.max(40,(Number(C.w)||600)-pw), hi=aw/base, lo=0.08, s=hi, i, m;
      pl.style.transformOrigin='0 0';pl.style.boxSizing='border-box';
      function tall(k){pl.style.width=(aw/k)+'px';return pl.offsetHeight*k;}   /* offsetHeight is the height before the scale */
      if(tall(hi)>ah+0.5){
        if(tall(lo)>ah)s=lo;
        else{for(i=0;i<14;i++){m=(lo+hi)/2;if(tall(m)<=ah+0.5)lo=m;else hi=m;}s=lo;}
        tall(s);
      }
      pl.style.transform='scale('+s.toFixed(4)+')';
      root.setAttribute('data-scale',s.toFixed(3));
    }
    var queued=false;
    function later(){if(queued)return;queued=true;(window.requestAnimationFrame||setTimeout)(function(){queued=false;if(!document.documentElement.contains(root)){if(ro)ro.disconnect();if(mo)mo.disconnect();return;}fit();});}
    var ro=window.ResizeObserver?new window.ResizeObserver(later):null, mo=window.MutationObserver?new window.MutationObserver(later):null;
    if(ro)ro.observe(root);
    if(mo)mo.observe(cont,{childList:true,subtree:true,characterData:true});   /* PRTG refreshes the rows: fit again */
    fit();
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(later);
  }
  function tableFits(T){return !!T.fit&&parseInt(T.initW,10)>0&&parseInt(T.initH,10)>0;}
  function tableFitScript(T,cls){
    if(!tableFits(T))return '';
    return '(function(){\n  var F='+tableFitRuntime.toString()+';\n  var C={w:'+Math.max(40,parseInt(T.fitW,10)||parseInt(T.initW,10)||600)+'};\n'
      +'  function all(){[].forEach.call(document.querySelectorAll(".'+cls+'"),function(r){F(r,C);});}\n'
      +'  all();setTimeout(all,400);setTimeout(all,2000);\n})();';
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
  /* is this object's file name, or its name in its category, already on the connected PRTG server? */
  /* is this name taken? On the connected PRTG server (its files, and the names in its object list, in any category)
     and in Your objects (the files this browser keeps for the install script). When it is, the first free number is suggested. */
  function libObjs(){var o={};try{o=JSON.parse(localStorage.getItem(CFG.keys.library)||'{}')||{};}catch(e){}return Object.keys(o).map(function(f){return {file:f,cat:o[f].cat||'',name:o[f].name||''};});}
  function lc(x){return String(x||'').trim().toLowerCase();}
  function nameClash(m){
    var list=window.PRTGOBJS||[], lib=libObjs(), f=lc(fileNameOf(m)), cat=lc(m.cat), nm=lc(m.name), r={file:null,name:null,sameCat:false,libFile:null,libName:null};
    list.forEach(function(o){
      if(!r.file&&lc(o.file)===f)r.file=o;
      else if(lc(o.name)===nm&&(!r.name||(!r.sameCat&&lc(o.cat)===cat))){r.name=o;r.sameCat=(lc(o.cat)===cat);}
    });
    lib.forEach(function(o){if(!r.libFile&&lc(o.file)===f)r.libFile=o;else if(!r.libName&&lc(o.name)===nm)r.libName=o;});
    return r;
  }
  function nameSuggest(m){
    var list=(window.PRTGOBJS||[]).concat(libObjs()), files={}, names={};
    list.forEach(function(o){files[lc(o.file)]=1;names[lc(o.name)]=1;});
    var nb=String(m.name||'Object').trim().replace(/\s*\d+$/,'')||'Object', fb=fileNameOf(m).replace(/\.htm$/i,'').replace(/[\s_-]*\d+$/,'')||'object', sep=/[ ]/.test(fb)?' ':'-', n;
    for(n=2;n<1000;n++){var nn=nb+' '+n, ff=fb+sep+n;if(!names[lc(nn)]&&!files[lc(ff+'.htm')])return {name:nn,fname:ff};}
    return null;
  }
  function nameCheckText(m){
    var host=window.PRTGOBJHOST, on=!!(window.PRTGSTATE&&window.PRTGSTATE.connected&&host);
    var c=nameClash(m), f=fileNameOf(m), msgs=[];
    if(on&&c.file)msgs.push(host+' already has a file named '+f+' ('+c.file.cat+': '+c.file.name+'). Saving this one to mapobjects replaces it.');
    if(c.libFile&&!(on&&c.file))msgs.push('Your objects already has a file named '+f+' ('+c.libFile.cat+': '+c.libFile.name+'). Adding this one replaces it in the list.');
    if(on&&c.name)msgs.push(host+' already lists an object named \u201C'+c.name.name+'\u201D'+(c.sameCat?' in '+c.name.cat:' (in '+c.name.cat+')')+', file '+c.name.file+'. Two objects with one name are hard to tell apart in PRTG\u2019s list.');
    else if(c.libName)msgs.push('Your objects already has an object named \u201C'+c.libName.name+'\u201D (file '+c.libName.file+').');
    if(msgs.length){var sg=nameSuggest(m);return {k:'warn',t:msgs.join(' ')+(sg?' Suggested: \u201C'+sg.name+'\u201D, file '+sg.fname+'.htm.':''),sug:sg,fileHit:!!(c.file||c.libFile)};}
    if(!on)return {k:'off',t:'Not in Your objects. Connect to PRTG to check the names on the server too.'};
    return {k:'ok',t:'No file or object with this name on '+host+' or in Your objects.'};
  }
  /* writes the result into a .nclash line, with a button that takes the suggested numbered name */
  function nameCheckPaint(el,r,use){
    el.className='nclash nc-'+r.k;el.textContent=(r.k==='warn'?'\u26A0 ':(r.k==='ok'?'\u2713 ':''))+r.t;
    if(r.sug&&use){var b=h('button','ncuse','Use \u201C'+r.sug.name+'\u201D');b.type='button';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();use(r.sug);});el.appendChild(document.createTextNode(' '));el.appendChild(b);}
  }
  function nameCheckShow(){
    var nf=(TYPE&&!isLegacy(TYPE)&&!isPaste()), r=nf?nameCheckText(M()):null;
    [].forEach.call(document.querySelectorAll('.nclash:not([data-own])'),function(el){
      el.hidden=!r;if(!r)return;
      nameCheckPaint(el,r,function(sg){var m=M();m.name=sg.name;m.nameUser=true;m.fname=sg.fname;refreshUI();render();});
    });
  }
  document.addEventListener('pmlibchanged',function(){try{nameCheckShow();}catch(e){}});
  document.addEventListener('prtgobjs',function(){try{nameCheckShow();}catch(e){}});
  document.addEventListener('prtgstate',function(){try{nameCheckShow();}catch(e){}});
  function fileNameOf(T){
    var f=String(T.fname||'').replace(/[^A-Za-z0-9 _.\-]/g,'').trim();
    if(!f)f=slugOf(T.name).replace(/_/g,'-');
    if(!/\.htm$/i.test(f))f=f.replace(/\.html?$/i,'')+'.htm';
    return f;
  }
  function buildTable(T){
    var cls=classOf(T), css=tableCss(T,cls), js=tableScript(T,cls), fjs=tableFitScript(T,cls), o=[];
    if(fjs)js=js?js+'\n'+fjs:fjs;
    var useCls=!!(css||js);
    o.push('<!'+'--'+clean(T.cat||'Data Tables')+': '+clean(T.name||'Table')+'-->');
    o.push('');
    o.push('<div class="map_object map_table'+(useCls?' '+cls:'')+'" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+initAttr(T)+' style="overflow:'+(fjs?'hidden':'auto')+';<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
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
      rot:0,tOffX:0,tOffY:0,tAlign:'',fit:true,fitW:600,
      look:lookOf('PRTG new UI'),fname:''};
  }
  function fromPreset(p){
    var T=blankT();
    ['cat','title','titleObj','cols','sortBy','sortDir','count','status','mapTags','reqTag','nameContains','onlyValue','onlyFav','extra','links','sortable','refreshable','infoheader','box','checks'].forEach(function(k){
      var v=p[k];T[k]=(v instanceof Array)?v.slice():v;
    });
    T.initW=0;T.initH=0;T.fit=false;T.id=p.id;T.name=p.name+' custom';T.showTitle=!!(p.title||p.titleObj);if(!p.title&&!p.titleObj)T.title='';
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
  /* how a gauge is drawn. PRTG classic is PRTG's own dial (its script draws it, so only colours can change);
     every other face is drawn by Map Studio from the same data, so the look can change everything */
  var GFACES=[['classic','PRTG classic'],['n-neon','Neon glass'],['n-flat','Flat minimalist'],['n-cyber','Cyber tech'],['n-amb','Ambient glow'],['n-clean','Clean'],['progress','Progress arc'],['zones','Zones and needle'],['threshold','Threshold arc'],['gradient','Gradient arc'],['led','Segmented LED'],['solid','Solid arc'],['speedo','Speedometer']];   /* Glass & metallic is no longer offered; objects saved with it still draw */
  var NFACE_DEF={flat:{nline:'full',nscale:'inside'},cyber:{nline:'full',nscale:'inside'},clean:{nline:'full',nscale:'inside'}};   /* these start with the complete value line and the numbers inside */
  function gFace(){return G.engine==='prtg'?(G.nstyle?'n-'+G.nstyle:'classic'):(G.style||'progress');}
  function setFace(k){
    if(k==='classic'||k.indexOf('n-')===0){var was=gFace();G.engine='prtg';G.nstyle=(k==='classic')?'':k.slice(2);if(!G.nbg)G.nbg='light';G.initW=0;G.initH=0;
      if(was!==k){var d=NFACE_DEF[G.nstyle]||{};G.nline=d.nline||'off';G.nscale=d.nscale||'off';}   /* each face starts from its own value line and scale */
      return;}   /* PRTG's own dial, plain or with a modern style */
    G.engine='ring';G.style=k;G.nstyle='';
    if(!(parseInt(G.initW,10)>0&&parseInt(G.initH,10)>0)){
      var sz=(G.kind==='device')?[560,340]:(G.kind==='sensor-all'?[520,300]:[300,260]);G.initW=sz[0];G.initH=sz[1];
    }
  }
  function gFaceSvg(k){
    var G1='#B8C419',Y='#F5C500',R='#E30613',N='#CBD2DC',D='#5F6674',o='';
    function a(r,a0,a1){var p=function(d){var t=d*Math.PI/180;return (32+r*Math.cos(t)).toFixed(1)+' '+(26+r*Math.sin(t)).toFixed(1);};return 'M'+p(a0)+'A'+r+' '+r+' 0 '+((a1-a0)>180?1:0)+' 1 '+p(a1);}
    function s(d,c,w,cap){return '<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="'+(cap||'butt')+'"/>';}
    if(k.indexOf('n-')===0){
      var dk=false, bgc=dk?'#141a26':'#ffffff', cut=dk?'#0f1522':'#ffffff', ink=dk?'#ffffff':'#1d2433', ns=k.slice(2), fl='';
      if(ns==='neon'||ns==='amb')fl=' style="filter:drop-shadow(0 0 '+(ns==='amb'?3:1.6)+'px currentColor)"';
      o='<rect x="1" y="1" width="62" height="42" rx="7" fill="'+bgc+'" stroke="'+(dk?'#2a3242':'#dfe3ea')+'"/>';
      o+='<g'+fl+' color="'+G1+'"><path d="'+a(17,135,315)+'L32 26Z" fill="'+G1+'"/></g><g'+fl+' color="'+Y+'"><path d="'+a(17,315,360)+'L32 26Z" fill="'+Y+'"/></g><g'+fl+' color="'+R+'"><path d="'+a(17,360,405)+'L32 26Z" fill="'+R+'"/></g>';
      if(ns==='cyber')for(var cs=135;cs<405;cs+=13)o+='<path d="M32 26L'+(32+19*Math.cos(cs*Math.PI/180)).toFixed(1)+' '+(26+19*Math.sin(cs*Math.PI/180)).toFixed(1)+'" stroke="'+bgc+'" stroke-width="1.6"/>';
      if(ns==='glass')o+=s(a(18.2,135,405),'#b8c0cc',2.2);
      o+='<circle cx="31" cy="27" r="10" fill="'+cut+'"'+(ns==='glass'?' stroke="#b8c0cc" stroke-width="1.6"':'')+'/>';
      if(ns==='flat'&&!NFACE_DEF.flat)o+=s(a(7,135,405).replace(/32 /g,'31 '),dk?'rgba(255,255,255,.5)':'rgba(29,36,51,.4)',0.9);
      var ex=NFACE_DEF[ns];
      if(ex){o+=s(a(20.5,135,315),G1,2.2)+s(a(20.5,317,360),Y,.8)+s(a(20.5,360,405),R,.8)+'<circle cx="'+(32+20.5*Math.cos(315*Math.PI/180)).toFixed(1)+'" cy="'+(26+20.5*Math.sin(315*Math.PI/180)).toFixed(1)+'" r="1.6" fill="#fff" stroke="'+G1+'" stroke-width=".9"/>';   /* the complete value line */
        for(var sk=0;sk<=10;sk++){var sa=(135+sk*27)*Math.PI/180, sm=(sk%2===0);o+='<path d="M'+(31+8.8*Math.cos(sa)).toFixed(1)+' '+(27+8.8*Math.sin(sa)).toFixed(1)+'L'+(31+(sm?6.4:7.4)*Math.cos(sa)).toFixed(1)+' '+(27+(sm?6.4:7.4)*Math.sin(sa)).toFixed(1)+'" stroke="'+(sk>=9?R:(sk>=7?Y:'#8a93a6'))+'" stroke-width="'+(sm?.9:.6)+'"/>';}}   /* the scale inside */
      if(!ex&&(ns==='clean'||ns==='neon')){for(var tk=0;tk<=8;tk++){var ta=(135+tk*33.75)*Math.PI/180;o+='<path d="M'+(31+8.6*Math.cos(ta)).toFixed(1)+' '+(27+8.6*Math.sin(ta)).toFixed(1)+'L'+(31+7*Math.cos(ta)).toFixed(1)+' '+(27+7*Math.sin(ta)).toFixed(1)+'" stroke="'+(ns==='neon'?Y:'#9aa3b4')+'" stroke-width=".8"/>';}}
      o+='<path d="M31 27l5.5-5.5" stroke="'+(ns==='cyber'?'#1b9fd6':ink)+'" stroke-width="1.3" stroke-linecap="round"/><circle cx="31" cy="27" r="'+(ns==='glass'?2.6:1.6)+'" fill="'+(ns==='glass'?'#c9ced8':ink)+'"/>';
    }
    else if(k==='classic'){o='<path d="'+a(17,135,405)+'L32 26Z" fill="'+G1+'"/><path d="'+a(17,315,360)+'L32 26Z" fill="'+Y+'"/><path d="'+a(17,360,405)+'L32 26Z" fill="'+R+'"/><circle cx="31" cy="27" r="10" fill="#fff"/><path d="M32 26l9-9" stroke="'+D+'" stroke-width="2.4" stroke-linecap="round"/>';}
    else if(k==='progress')o=s(a(15,135,405),N,5,'round')+s(a(15,135,300),G1,5,'round');
    else if(k==='zones')o=s(a(15,135,320),G1,5)+s(a(15,320,370),Y,5)+s(a(15,370,405),R,5)+'<path d="M32 26l-8-8" stroke="'+D+'" stroke-width="2.2" stroke-linecap="round"/><circle cx="32" cy="26" r="2.6" fill="'+D+'"/>';
    else if(k==='threshold')o=s(a(13,135,405),N,6,'round')+s(a(13,135,290),Y,6,'round')+s(a(18.5,135,320),G1,1.6)+s(a(18.5,322,370),Y,1.6)+s(a(18.5,372,405),R,1.6);
    else if(k==='gradient')o='<defs><linearGradient id="gfgr" x1="0" x2="1"><stop offset="0" stop-color="'+G1+'"/><stop offset=".5" stop-color="'+Y+'"/><stop offset="1" stop-color="'+R+'"/></linearGradient></defs>'+s(a(13,135,405),N,6)+s(a(13,135,330),'url(#gfgr)',6)+s(a(18.5,135,405),'url(#gfgr)',1.6);
    else if(k==='led'){for(var i=0;i<15;i++){var a0=135+i*18;o+=s(a(15,a0+2,a0+16),i<10?(i<7?G1:Y):N,6);}}
    else if(k==='solid')o=s(a(14,135,405),'#E3EDB6',9,'round')+s(a(14,135,320),G1,9,'round');
    else if(k==='speedo'){o=s(a(18,135,405),N,1.5);for(var j=0;j<=10;j++){var t=(135+27*j)*Math.PI/180;o+='<path d="M'+(32+17*Math.cos(t)).toFixed(1)+' '+(26+17*Math.sin(t)).toFixed(1)+'L'+(32+13*Math.cos(t)).toFixed(1)+' '+(26+13*Math.sin(t)).toFixed(1)+'" stroke="'+D+'" stroke-width="1.2"/>';}o+=s(a(20.5,135,330),'#2f6fed',2,'round')+'<path d="M32 26l9-8" stroke="#2f6fed" stroke-width="2.4" stroke-linecap="round"/><circle cx="32" cy="26" r="3" fill="'+D+'"/>';}
    return '<svg viewBox="0 0 64 44" width="64" height="44" aria-hidden="true">'+o+'</svg>';
  }
  /* a grid of face pictures; one click changes how the gauge is drawn */
  function gFaceGrid(after){
    var g=h('div','presetgrid');
    GFACES.forEach(function(x){
      var q=h('button','lookchip');q.type='button';q.setAttribute('data-face',x[0]);q.title=x[1];
      q.innerHTML=gFaceSvg(x[0])+'<span class="pname">'+x[1]+'</span>';
      q.addEventListener('click',function(){setFace(x[0]);if(after)after();refreshUI();render();});g.appendChild(q);
    });
    g.syncFace=function(){var f=gFace();[].forEach.call(g.children,function(q){q.classList.toggle('on',q.getAttribute('data-face')===f);});};
    return g;
  }
  var SAMPLE_JSON={objects:{'prtg-version':'26.3.124','treesize':3,channels:[
    {name:'Traffic In',info:{data:[{id:0,name:'Traffic In',primary:true,show:1,status:3,lastvalueraw:62.4,lastvalue:'62.4 Mbit/s',graphminraw:0,graphmaxraw:100,limitmode:1,limitminwarning:'',limitmaxwarning:70,limitminerror:'',limitmaxerror:90,averageraw:51,average:'51 Mbit/s'}]},minimum:0,maximum:100,condition:true,lastvalue:'62.4 Mbit/s'},
    {name:'Traffic Out',info:{data:[{id:1,name:'Traffic Out',primary:false,show:1,status:3,lastvalueraw:18.2,lastvalue:'18.2 Mbit/s',graphminraw:0,graphmaxraw:100,limitmode:0,limitminwarning:'',limitmaxwarning:'',limitminerror:'',limitmaxerror:''}]},minimum:0,maximum:100,condition:true,lastvalue:'18.2 Mbit/s'},
    {name:'Response Time',info:{data:[{id:2,name:'Response Time',primary:false,show:1,status:3,lastvalueraw:12,lastvalue:'12 msec',graphminraw:0,graphmaxraw:200,limitmode:1,limitminwarning:'',limitmaxwarning:100,limitminerror:'',limitmaxerror:150}]},minimum:0,maximum:200,condition:true,lastvalue:'12 msec'}
  ]}};
  function blankG(){
    return {type:'gauge',engine:'prtg',nstyle:'flat',nbg:'light',nline:'full',nscale:'inside',cat:'Gauges',name:'Bandwidth gauge',fname:'',titleMode:'object',title:'',
      kind:'sensor-primary',small:false,prio:3,plgPrio:false,mapTags:true,reqTag:'',count:0,hideSettings:true,strip:'thin',scale:1,
      channel:'primary',channelName:'',rangeMode:'channel',min:0,max:100,limits:'channel',dir:'above',warn:70,err:90,
      shape:'ring',thick:14,style:'progress',colorMode:'status',needle:true,showMinMax:true,glow:false,label:'channel',labelText:'',initW:0,initH:0,
      look:lookOf('PRTG new UI')};   /* a new gauge starts as Flat minimalist on white, with the complete value line and the numbers inside */
  }
  function gaugeFromPreset(p){
    var G=blankG();
    /* PRTG files its own gauge templates under Status Icons and Device Tree Views; every gauge Map Studio builds goes under Gauges */
    G.engine='prtg';G.nstyle='';G.nline='off';G.nscale='off';G.cat='Gauges';G.name=p.name+' custom';G.kind=p.kind;G.small=!!p.small;
    G.initW=0;G.initH=0;G.prio=(p.prio==null?3:p.prio);G.plgPrio=!!p.plgPrio;G.mapTags=!!p.mapTags;G.look=lookOf('PRTG default');
    return G;
  }
  function gEffLook(G){
    var L=G.look;
    if(L.mode==='prtg'&&G.engine==='ring'){var m=lookOf('Minimal');m.name='PRTG default';return m;}
    return L;
  }
  function gClassOf(G){return 'pgau_'+slugOf(G.name);}
  /* Flexible or Fixed. Fixed is PRTG\u2019s standard: the text keeps its size and only the box changes. Flexible: the text, the title
     and the spacing follow the object\u2019s size. A table is scaled as one piece (tableFitRuntime); the other objects keep drawing
     to fill their box and their text sizes are multiplied by --mss, which flexRuntime sets from the object\u2019s size against its normal size. */
  var FLEXT={table:1,gauge:1,graph:1,donut:1,sunburst:1,tile:1,status:1};
  function hasSize(m){return parseInt(m.initW,10)>0&&parseInt(m.initH,10)>0;}
  function isFlex(m){return !!(m&&m.fit)&&hasSize(m);}
  function flexOn(){return !!FLEXT[TYPE]&&TYPE!=='table'&&!isPaste()&&isFlex(M());}
  function fpx(n){return flexOn()?'calc('+n+'px * var(--mss,1))':n+'px';}
  function flexNorm(m){return {w:Math.max(40,parseInt(m.fitW,10)||parseInt(m.initW,10)||300),h:Math.max(30,parseInt(m.fitH,10)||parseInt(m.initH,10)||200)};}
  function flexRuntime(root,C){
    if(!root||root.__msflex)return;
    root.__msflex=1;
    function fit(){
      var w=root.clientWidth, h=root.clientHeight;
      if(!w||!h)return;
      var s=Math.max(0.2,Math.min(6,Math.min(w/C.w,h/C.h)));
      root.style.setProperty('--mss',s.toFixed(4));root.setAttribute('data-scale',s.toFixed(3));
    }
    var queued=false;
    function later(){if(queued)return;queued=true;(window.requestAnimationFrame||setTimeout)(function(){queued=false;if(!document.documentElement.contains(root)){if(ro)ro.disconnect();return;}fit();});}
    var ro=window.ResizeObserver?new window.ResizeObserver(later):null;
    if(ro)ro.observe(root);
    fit();
  }
  function flexClass(){return TYPE==='gauge'?gClassOf(G):TYPE==='graph'?grClassOf(GR):TYPE==='donut'?dClassOf(DN):TYPE==='sunburst'?sbClassOf(SB):TYPE==='tile'?tClassOf(TL):TYPE==='status'?sClassOf(SC):'';}
  /* Flexible: every fixed text size in the object's own CSS follows --mss too (legends, labels, numbers) */
  function flexCss(css){return flexClamp(String(css).replace(/font-size:\s*(\d+(?:\.\d+)?)px/g,'font-size:calc($1px * var(--mss,1))'));}
  /* 1.5.66: a clamp(min, size, max) keeps a fixed px floor and ceiling, which stopped Flexible tiles and status counts from shrinking or growing past them; the px floor and ceiling follow --mss too */
  function flexClamp(css){
    var out='', i=0, j, d, a, k, parts;
    while((j=css.indexOf('clamp(',i))>-1){
      out+=css.slice(i,j+6);d=1;a=j+6;parts=[];
      for(k=a;k<css.length&&d>0;k++){var ch=css.charAt(k);if(ch==='(')d++;else if(ch===')'){d--;if(!d)break;}else if(ch===','&&d===1){parts.push(css.slice(a,k));a=k+1;}}
      if(d){out+=css.slice(j+6);return out;}
      parts.push(css.slice(a,k));
      out+=parts.map(function(p,n){var t=p.trim();return ((n===0||n===parts.length-1)&&/^\d+(?:\.\d+)?px$/.test(t))?'calc('+t+' * var(--mss,1))':p;}).join(',')+')';
      i=k+1;
    }
    return out+css.slice(i);
  }
  /* the file gets the script that sets --mss, when the object is Flexible and its root carries the class the CSS is written for */
  function flexAppend(text){
    if(!flexOn())return text;
    var cls=flexClass();
    if(!cls||!new RegExp('class="map_object[^"]*\\b'+cls+'\\b').test(text))return text;
    var C=flexNorm(M());
    text=text.replace(/(<style>)([\s\S]*?)(<\/style>)/g,function(a,o,css,c){return o+flexCss(css)+c;});
    return text+'\n<scr'+'ipt>\n(function(){\n  var F='+flexRuntime.toString()+';\n  var C={w:'+C.w+',h:'+C.h+'};\n'
      +'  function all(){[].forEach.call(document.querySelectorAll(".'+cls+'"),function(r){F(r,C);});}\n'
      +'  all();setTimeout(all,400);setTimeout(all,2000);\n})();\n<\/script>\n';
  }
  /* turning Flexible on needs a box: the size the preview shows now, which also becomes the normal size */
  function setFlex(v){
    var m=M();m.fit=!!v;
    if(v&&!hasSize(m)){var r=prevEl.querySelector('.map_object'), wr=document.getElementById('edwrap');m.initW=Math.round(((TYPE==='table'?wr:r)||{}).offsetWidth||(TYPE==='table'?600:300));m.initH=Math.round(((TYPE==='table'?wr:r)||{}).offsetHeight||(TYPE==='table'?330:200));}
    if(v&&!(parseInt(m.fitW,10)>0))m.fitW=parseInt(m.initW,10);
    if(v&&TYPE!=='table'&&!(parseInt(m.fitH,10)>0))m.fitH=parseInt(m.initH,10);
  }
  function titleRules(L,sel,bar){
    var c=[],col=bar?L.titleColor:(L.titleText||L.text);
    if(bar){
      c.push(sel+'{font-size:'+fpx(L.titleSize)+';font-weight:500;letter-spacing:.4px;color:'+L.titleColor+';background:'+L.titleBg+';padding:'+fpx(10)+' '+fpx(14)+';margin:0;text-transform:none;'+(L.card?'border-radius:'+L.radius+'px '+L.radius+'px 0 0;':'')+'}');
    }else{
      var tt='font-size:'+fpx(L.titleSize)+';font-weight:600;color:'+col+';text-transform:none;';
      if(L.titleStyle==='divider')tt+='padding:0 0 '+fpx(12)+';margin:0 0 '+fpx(8)+';border-bottom:1px solid '+L.line+';';
      else if(L.titleStyle==='accent')tt+='padding:'+fpx(2)+' 0 '+fpx(2)+' '+fpx(10)+';margin:0 0 '+fpx(12)+';border-left:3px solid '+L.accent+';line-height:1.2;';
      else tt+='padding:0 0 '+fpx(10)+';margin:0;';
      c.push(sel+'{'+tt+'}');
    }
    if(L.align)c.push(sel+'{text-align:'+L.align+';}');
    c.push(sel+','+sel+' *{color:'+col+' !important;}');
    return c;
  }
  function gFrameCss(G,cls,L){
    var r='.'+cls, c=[], bar=(L.titleStyle==='bar');
    var fillA=(L.cardA==null?100:L.cardA);
    var cardFill=(fillA<100)?tint(L.cardBg,fillA/100):L.cardBg;
    var root='font-family:'+familyStack(L.font)+';font-size:'+fpx(L.size)+';color:'+L.text+';';
    /* no padding and no border on the object itself: see the note in tableCss */
    if(L.card){
      root+='background:'+cardFill+';border-radius:'+L.radius+'px;';
      if(L.bw>0)root+='outline:'+L.bw+'px solid '+L.border+';outline-offset:-'+L.bw+'px;';
      var sh=shadowOf(L);if(sh)root+='box-shadow:'+sh+';';
    }
    c.push(r+'{'+root+'}');
    var gb='box-sizing:border-box;';
    var ip=(bar?0:(L.cardPad||0))+((L.card&&L.bw>0)?L.bw:0);
    if(ip>0)gb+='padding:'+fpx(ip)+';';
    if(G.engine==='ring')gb+='height:100%;display:flex;flex-direction:column;';
    if(L.align)gb+='text-align:'+L.align+';';
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
    /* several gauges (all channels, or a device's sensors): one small svg per gauge in a grid */
    c.push(r+' .gcells{position:absolute;left:0;top:0;right:0;bottom:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax('+(G.small?100:170)+'px,1fr));gap:6px 10px;align-content:start;}');
    c.push(r+' .gcell{justify-self:center;width:100%;max-width:'+(G.small?160:260)+'px;}');
    c.push(r+' .gcsvg{display:block;width:100%;height:auto;overflow:visible;}');
    c.push(r+' .gcsvg text{font-family:'+familyStack(L.font)+';}');
    c.push(r+' .gcsvg .gv{fill:'+L.text+';font-weight:600;}');
    c.push(r+' .gcsvg .gl{fill:'+muted+';}');
    c.push(r+' .gcsvg .gm{fill:'+muted+';}');
    c.push(r+' .gdig{font-family:Consolas,"Lucida Console","Courier New",monospace !important;letter-spacing:1px;}');
    return c;
  }
  function gaugeCssPrtg(G,cls,L){
    var r='.'+cls, c=[], S=Number(G.scale)||1;
    var muted=(L.muted||L.headColor), bar=(L.titleStyle==='bar');
    var fillA=(L.cardA==null?100:L.cardA);
    var cardFill=(L.card)?((fillA<100)?tint(L.cardBg,fillA/100):L.cardBg):'#FFFFFF';
    if(L.mode!=='prtg'){
      c=gFrameCss(G,cls,L);
      c.push(r+' [class*="prtg-plugin"]{'+(bar?'padding:10px 14px;':'')+'}');
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
    if(G.engine==='prtg'&&G.nstyle)c=c.concat(nativeCss(G,cls));
    else if(G.engine==='prtg'&&G.fit!==false)c=c.concat(fitCss('.'+cls));   /* PRTG classic: PRTG's own look, scaled to fit the object */
    if(G.engine==='prtg'&&!G.nstyle&&nativeExtras(G))c.push('.'+cls+' .gauge{overflow:visible;}');   /* the scale and the value line go round the dial */
    c=c.concat(nativePalCss(G,cls,L));
    return c.join('\n');
  }
  /* modern styles on PRTG's own dial. PRTG still draws the gauge (d3.gauge.js); this decorates each dial PRTG draws:
     the needle turns around the centre of the cut-out, and glow, glass, rims, segments, ticks, a hub and the value are added.
     The zone colours are read from the dial itself, so PRTG's colours or the Colors set show through. PRTG redraws its
     gauges on every refresh, so a watcher decorates each new dial once. */
  var NSTYLES=[['neon','Neon glass'],['flat','Flat minimalist'],['cyber','Cyber tech'],['amb','Ambient glow'],['clean','Clean']];   /* glass stays drawable below for objects saved with it */
  var NBG={
    dark:{neon:'radial-gradient(ellipse at 50% 30%,#141c30,#080c16)',flat:'#141a26',cyber:'linear-gradient(rgba(64,170,255,.07) 1px,transparent 1px) 0 0/26px 26px,linear-gradient(90deg,rgba(64,170,255,.07) 1px,transparent 1px) 0 0/26px 26px,#06101c',glass:'radial-gradient(ellipse at 50% 20%,#2a3346,#11161f)',amb:'#0f141e',clean:'#111827'},
    light:{neon:'radial-gradient(ellipse at 50% 30%,#ffffff,#eef2f8)',flat:'#ffffff',cyber:'linear-gradient(rgba(30,120,220,.08) 1px,transparent 1px) 0 0/26px 26px,linear-gradient(90deg,rgba(30,120,220,.08) 1px,transparent 1px) 0 0/26px 26px,#f4f9ff',glass:'radial-gradient(ellipse at 50% 20%,#ffffff,#e3e7ee)',amb:'#ffffff',clean:'#ffffff'}};
  var NCUT={dark:{neon:'#0b1120',flat:'#141a26',cyber:'#06101c',glass:'#161c28',amb:'#0f141e',clean:'#1a2233'},light:{neon:'#ffffff',flat:'#ffffff',cyber:'#f4f9ff',glass:'#f7f8fb',amb:'#ffffff',clean:'#ffffff'}};
  function nativeCfg(G){
    var s=G.nstyle, m=G.nbg||'dark', L=gEffLook(G);
    if(m==='look'){
      if(L.mode==='prtg')return {style:s,bg:'light',cut:'#ffffff',ink:'#1d2433',mut:'#6b7487',look:true};
      var fa=(L.cardA==null?100:L.cardA), card=L.card?((fa<100)?tint(L.cardBg,fa/100):L.cardBg):null, solid=(L.card&&String(L.cardBg).charAt(0)==='#')?L.cardBg:(lum(String(L.text).charAt(0)==='#'?L.text:'#1d2433')>0.5?'#111827':'#ffffff');
      var dk=lum(solid)<0.4;
      return {style:s,bg:dk?'dark':'light',cut:solid,ink:L.text||(dk?'#ffffff':'#1d2433'),mut:(L.muted||L.headColor||(dk?'#9aa6c2':'#6b7487')),look:true};
    }
    var bg=(m==='light')?'light':'dark';
    return {style:s,bg:bg,cut:NCUT[bg][s]||'#ffffff'};
  }
  function nativeCfgAll(G){var c=nativeCfg(G);c.scale=(G.nscale==='outside'||G.nscale==='inside')?G.nscale:'off';c.line=(G.nline==='full'||G.nline==='value')?G.nline:'off';c.fit=G.nstyle?true:(G.fit!==false);return c;}
  function nativeExtras(G){return G.engine==='prtg'&&((G.nscale==='outside'||G.nscale==='inside')||(G.nline==='full'||G.nline==='value'));}
  /* the cyan, navy and pink set for PRTG's dial: PRTG's zone classes recoloured, so the dial, the value line and the ticks all follow */
  var NPAL={cnp:{up:'#01AEF0',warn:'#050F33',down:'#E70062',needle:'#050F33'}};
  function nativePalCss(G,cls,L){
    var P=NPAL[G.npal];if(G.engine!=='prtg'||!P)return [];
    var r='.'+cls, c=[];
    c.push(r+' .gauge .status3{fill:'+P.up+' !important;stroke:'+P.up+' !important;}');
    c.push(r+' .gauge .status4,'+r+' .gauge .status10{fill:'+P.warn+' !important;stroke:'+P.warn+' !important;}');
    c.push(r+' .gauge .status5,'+r+' .gauge .status13,'+r+' .gauge .status14{fill:'+P.down+' !important;stroke:'+P.down+' !important;}');
    if(!G.nstyle){
      [['3',P.up],['4',P.warn],['10',P.warn],['5',P.down],['13',P.down],['14',P.down]].forEach(function(x){c.push(r+' .achannel.status'+x[0]+':before{background-color:'+x[1]+' !important;}');});
      var fa=(L.cardA==null?100:L.cardA), card=(L.mode!=='prtg'&&L.card)?((fa<100)?tint(L.cardBg,fa/100):L.cardBg):'#FFFFFF';
      if(String(card).charAt(0)!=='#'||lum(card)>=0.4)c.push(r+' .gauge .needle{fill:'+P.needle+' !important;}');   /* the navy needle, on a light dial only */
    }
    return c;
  }
  /* PRTG's gauge boxes centred and wrapped in the object; the script scales them to fit (PRTG renames the plugin's class once it starts) */
  function fitCss(r){
    return [r+' [class*="prtg-plugin"]{position:relative;overflow:hidden !important;}',
      r+' [class*="prtg-plugin"] .centered{display:flex !important;flex-wrap:wrap;justify-content:center;align-content:flex-start;gap:6px 10px;max-width:none;margin:0 !important;}',
      r+' [class*="prtg-plugin"] .centered>div[style*="clear"]{display:none;}',
      r+' .achannel,'+r+' .achannel>a{float:none !important;margin:0 !important;position:relative !important;overflow:visible !important;}'];
  }
  function nativeCss(G,cls){
    var C=nativeCfg(G), r='.'+cls, ink=C.ink||(C.bg==='dark'?'#ffffff':'#1d2433'), c=[];
    if(!C.look)c.push(r+'{background:'+NBG[C.bg][C.style]+' !important;color:'+ink+' !important;}');   /* From the look: the look's own card stays */
    else c.push(r+'{color:'+ink+' !important;}');
    /* the gauges centred in the object; the script scales them to fit its size */
    c.push(r+' [class*="prtg-plugin"]{position:relative;overflow:hidden !important;}');   /* PRTG renames the class to prtg-plugin-initialized once its plugin starts */
    c.push(r+' [class*="prtg-plugin"] .centered{display:flex !important;flex-wrap:wrap;justify-content:center;align-content:flex-start;gap:6px 10px;max-width:none;margin:0 !important;}');   /* the fitting sets its width to fill the box, then scales it from its corner */
    c.push(r+' [class*="prtg-plugin"] .centered>div[style*="clear"]{display:none;}');
    c.push(r+' .achannel{float:none !important;margin:0 !important;position:relative !important;}');
    c.push(r+' .achannel.primary{width:214px !important;height:206px !important;}');
    if(!C.look)c.push(r+' .gtitle,'+r+' .gtitle b,'+r+'>p b,'+r+' .gbox>p b{color:'+ink+' !important;}');   /* with a look, the look styles its own title */
    c.push(r+' .achannel{background:transparent !important;border-bottom:0 !important;color:'+ink+' !important;}');
    c.push(r+' .achannel:before{display:none !important;}');
    c.push(r+' .achannel .channelname,'+r+' .achannel .channelvalue,'+r+' .achannel .channelmessage,'+r+' .achannel .channelsubname,'+r+' .achannel>a{color:'+ink+' !important;}');
    c.push(r+' .achannel.primary .channelname,'+r+' .achannel.primary .channelvalue,'+r+' .achannel.primary .channelmessage,'+r+' .achannel.primary .channelsubname{display:none !important;}');
    c.push(r+' .achannel.primary .channelgauge{float:none !important;position:absolute !important;left:50%;top:2px;transform:translateX(-50%);padding:0 !important;margin:0 !important;height:auto !important;}');
    c.push(r+' .gauge{overflow:visible;}');
    c.push(r+' .gauge .backgroundfill{fill:'+C.cut+' !important;}');
    c.push(r+' .channelsettings{display:none !important;}');
    return c;
  }
  function nativeRuntime(root,C){
    var NS='http://www.w3.org/2000/svg', dark=(C.bg==='dark'), st=C.style, seq=0;
    var INK=C.ink||(dark?'#ffffff':'#1d2433'), MUT=C.mut||(dark?'#9aa6c2':'#6b7487'), CUT=C.cut;
    function el(tag,a,par,before){var e=document.createElementNS(NS,tag),k;for(k in a){if(a[k]!==undefined&&a[k]!==null)e.setAttribute(k,a[k]);}if(par){if(before)par.insertBefore(e,before);else par.appendChild(e);}return e;}
    function rgb(c){var m=/rgba?\(([^)]+)\)/.exec(String(c||'')),x;if(m){var p=m[1].split(',');return [+p[0],+p[1],+p[2]];}x=String(c||'').replace('#','');if(x.length===3)x=x.charAt(0)+x.charAt(0)+x.charAt(1)+x.charAt(1)+x.charAt(2)+x.charAt(2);if(x.length!==6)return [128,128,128];return [parseInt(x.substr(0,2),16),parseInt(x.substr(2,2),16),parseInt(x.substr(4,2),16)];}
    function hex(a){return '#'+a.map(function(v){v=Math.max(0,Math.min(255,Math.round(v)));return (v<16?'0':'')+v.toString(16);}).join('');}
    function mix(c,d,t){var a=rgb(c),b=rgb(d);return hex([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]);}
    function lum(c){var a=rgb(c);return (0.2126*a[0]+0.7152*a[1]+0.0722*a[2])/255;}
    function rad(v){return (v/1000*270-45)*Math.PI/180;}
    function nums(d){return (String(d).match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[]).map(Number);}
    function valAt(x,y){var deg=Math.atan2(x,-y)*180/Math.PI;if(deg<-46)deg+=360;return (deg+45)/270*1000;}
    /* the sensor data in the object, kept before PRTG's plugin takes it: each channel's real minimum and maximum for the scale */
    var DATA=null;
    (function(){var pl=root.querySelector('[data-plugin~="channelgauges"]');if(!pl)return;for(var n=pl.firstChild;n;n=n.nextSibling){if(n.nodeType===8){try{var d=JSON.parse(n.nodeValue);DATA=(d&&d.objects)?d.objects:d;}catch(e){}return;}}})();
    function nval(v){if(v===''||v==null)return null;var n=Number(v);return isNaN(n)?null:n;}
    function labNum(t){if(!t)return null;var x=(/-?[\d.,]+/.exec(String(t.textContent||'').replace(/\s/g,''))||[''])[0];if(!x)return null;
      if(/[.,]\d{3}(?!\d)/.test(x)&&!/[.,]\d{1,2}$/.test(x))x=x.replace(/[.,](?=\d{3}(?!\d))/g,'');x=x.replace(',','.');var n=parseFloat(x);return isNaN(n)?null:n;}
    function rangeOf(svg,labs){
      var box=svg.closest?svg.closest('.achannel'):null, sid=box&&box.getAttribute('data-id'), cid=box&&box.getAttribute('data-channel'), inf=null, i, l;
      if(cid==null&&svg.parentNode&&/^channelgauge/.test(svg.parentNode.id||''))cid=svg.parentNode.id.replace('channelgauge','');
      if(DATA&&sid!=null&&DATA.sensors){l=DATA.sensors;for(i=0;i<l.length&&!inf;i++){if(String(l[i].objid)===String(sid))inf=l[i].info&&l[i].info.data&&l[i].info.data[0];}}
      if(DATA&&!inf&&cid!=null&&DATA.channels){l=DATA.channels;for(i=0;i<l.length&&!inf;i++){var d=l[i].info&&l[i].info.data&&l[i].info.data[0];if(d&&String(d.id)===String(cid))inf=d;}}
      var jq=window.jQuery, gd=(jq&&box)?jq(box).data('gauge'):null;
      if(gd&&gd.info){var s0=Number(gd.info.status);if(gd.info.graphmaxraw===null||gd.info.graphminraw===null||[0,1,6,7,8,9,11,12].indexOf(s0)>=0)return null;inf=gd.info;}
      if(inf&&inf.lookups)return null;   /* a lookup channel shows states, not numbers: its graph range means nothing on a dial */   /* PRTG's own record of this gauge, kept on its box; PRTG greys the dial and hides its labels for these */
      var lo=null,hi=null;
      if(inf){lo=nval(inf.graphminraw);hi=nval(inf.graphmaxraw);}
      if((lo===null||hi===null)&&labs.length===2&&labs.every(function(t){return getComputedStyle(t).display!=='none';})){var t0=String(labs[0].textContent).trim(),t1=String(labs[1].textContent).trim();
        if(!(t0==='0'&&t1==='1000')){lo=labNum(labs[0]);hi=labNum(labs[1]);}}   /* else the minimum and maximum PRTG writes on its dial (plain 0 and 1000 are PRTG's own 0-1000 scale, not the sensor's) */
      return (lo!==null&&hi!==null&&hi>lo)?{lo:lo,hi:hi}:null;
    }
    function nice(raw){var p=Math.pow(10,Math.floor(Math.log(raw)/Math.LN10)),n=raw/p;return (n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*p;}
    function fmtN(x,step){var dec=step<1?Math.min(3,Math.ceil(-Math.log(step)/Math.LN10+0.001)):0;return String(Number(x.toFixed(dec)));}
    function unitOf(lo,hi){var m=Math.max(Math.abs(lo),Math.abs(hi));return m>=1e9?[1e9,'G']:(m>=1e6?[1e6,'M']:(m>=1e4?[1e3,'k']:[1,'']));}   /* 72000000 is written 72M, so the numbers fit */
    function decorate(svg){
      if(svg.getAttribute('data-ms')==='1')return;
      svg.setAttribute('data-ms','1');
      var S=parseFloat(svg.getAttribute('width'))||198, R=S*0.97/2, cx=S/2, cy=S/2, ccx=cx-S*0.05, ccy=cy+S*0.05, cr=R*0.6, big=S>90;
      var id='ms'+(++seq)+Math.floor(Math.random()*1e6).toString(36);
      svg.style.overflow='visible';
      var bands=[].slice.call(svg.querySelectorAll('path')).filter(function(p){return /\bstatus\d+\b/.test(p.getAttribute('class')||'');});
      var bg=svg.querySelector('.backgroundfill'), needleG=null, needle=null;
      var lookup=!!svg.querySelector('g.lookups');   /* PRTG's dial for a lookup channel: four state arcs round the centre, no off-centre cut-out, no numbers */
      if(lookup){ccx=cx;ccy=cy;cr=R*0.56;}
      var A0=lookup?-332:0;   /* where the decorations start: a lookup dial is a whole circle (1332 of PRTG's 270-degree units, just short of 360 so the arc still draws), a number dial three quarters */
      [].forEach.call(svg.querySelectorAll('g.pointerContainer'),function(g){if(g.querySelector('.needle'))needleG=g;});
      if(needleG)needle=needleG.querySelector('.needle');
      var noNeedle=!needleG||needleG.style.display==='none';
      var zones=bands.map(function(p){var n=nums(p.getAttribute('d'));return {p:p,v0:valAt(n[0],n[1]),v1:valAt(n[7],n[8]),col:getComputedStyle(p).fill};});
      var rot=null;if(needleG){var m=/rotate\(\s*(-?[\d.]+)/.exec(needleG.getAttribute('transform')||'');if(m)rot=+m[1];}
      var VAL=(rot===null||noNeedle)?null:(rot-225)/270*1000;
      function zcol(v){var c=null;zones.forEach(function(z){if(v>=z.v0-0.5&&v<=z.v1+0.5)c=z.col;});return c||INK;}
      var cur=(VAL===null)?(zones.length?zones[zones.length-1].col:INK):zcol(VAL);
      var labs=[].slice.call(svg.querySelectorAll('text')).slice(0,2), rng=(big&&!lookup)?rangeOf(svg,labs):null, labCol=labs[0]?getComputedStyle(labs[0]).fill:'#55607a';
      if(!st){extras(true);return;}   /* PRTG classic: PRTG's dial as it is, with the scale and the value line when chosen */
      [].forEach.call(svg.querySelectorAll('text'),function(t){t.style.display='none';});
      var defs=el('defs',{},svg,svg.firstChild), clip=el('clipPath',{id:'c'+id},defs);
      bands.forEach(function(b){el('path',{d:b.getAttribute('d'),transform:b.getAttribute('transform')||''},clip);});
      function under(tag,a){return el(tag,a,svg,bg||null);}
      function over(tag,a){return el(tag,a,svg,needleG||null);}
      function pt(v,r,ox,oy){var a=rad(v);return [(ox-r*Math.cos(a)).toFixed(2),(oy-r*Math.sin(a)).toFixed(2)];}
      function ring(v0,v1,ri,ro,ox,oy){ox=(ox==null)?cx:ox;oy=(oy==null)?cy:oy;var L=((v1-v0)*0.27>180)?1:0,a=pt(v0,ro,ox,oy),b=pt(v1,ro,ox,oy),c=pt(v1,ri,ox,oy),d=pt(v0,ri,ox,oy);return 'M'+a+'A'+ro+','+ro+' 0 '+L+',1 '+b+'L'+c+(ri>0?'A'+ri+','+ri+' 0 '+L+',0 '+d:'')+'Z';}
      function line(v0,v1,r,ox,oy){var L=((v1-v0)*0.27>180)?1:0,a=pt(v0,r,ox,oy),b=pt(v1,r,ox,oy);return 'M'+a+'A'+r+','+r+' 0 '+L+',1 '+b;}
      function cpt(v,f){return pt(v,R*f,ccx,ccy);}
      function css(e,s){e.setAttribute('style',(e.getAttribute('style')||'')+';'+s);}
      function glowOf(c){return (lum(c)<0.12)?mix(c,'#4f7dff',0.55):c;}
      function ticks(f0,f1,colFn){for(var t=0;t<=40;t++){var v=t*25,maj=(t%10===0),p1=cpt(v,maj?f0-0.04:f0),p2=cpt(v,f1);over('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],stroke:colFn(v),'stroke-width':maj?1.8:1,opacity:maj?1:0.7});}}
      function hub(r,fill,stroke,flt){el('circle',{cx:ccx,cy:ccy,r:r,fill:fill,stroke:stroke||'none','stroke-width':Math.max(1,r/4),style:flt?'filter:'+flt:null},svg);}
      function text(x,y,t,size,fill,extra){var e=el('text',{x:x,y:y,'text-anchor':'middle','class':'msn',style:'display:block !important;font-size:'+size+'px;fill:'+fill+' !important;'+(extra||'')},svg);e.textContent=t;return e;}
      function vblock(nameCol,valCol,o){
        o=o||{};var box=svg.closest?svg.closest('.achannel'):null, nm=box&&box.querySelector('.channelname'), vv=box&&box.querySelector('.channelvalue');
        var label=String(nm?nm.textContent:'').replace(/\s+/g,' ').trim().toUpperCase(), vt=String(vv?vv.textContent:'').replace(/\s+/g,' ').trim();
        var lmax=lookup?14:18;if(label.length>lmax)label=label.slice(0,lmax-1)+'…';   /* inside a lookup dial's closed ring there is less room */
        var ins=(C.scale==='inside'&&!!rng), y=ccy+cr*(lookup?0.34:(ins?0.84:0.56)),   /* a lookup dial's ring closes underneath, so its value sits higher, inside it */ m=/^(-?[\d.,]+\s?%?)\s*(.*)$/.exec(vt), num=m?m[1].replace(/\s/g,''):vt, unit=m?m[2]:'';
        if(label)text(ccx,y+(lookup?11:(ins?cr*0.36:14)),label,(lookup||ins)?7:8,nameCol,'letter-spacing:1.2px;');
        if(vt){var v=el('text',{x:ccx,y:y,'text-anchor':'middle','class':'msn',style:'display:block !important;fill:'+valCol+' !important;font-size:'+(num.length>6?(ins?14:16):(ins?17:21))+'px;font-weight:'+(o.w||400)+';'+(o.mono?'font-family:Consolas,monospace;':'')+(o.glow?'filter:'+o.glow+';':'')},svg);
          var a=el('tspan',{},v);a.textContent=num;if(unit){var b=el('tspan',{dx:3,style:'font-size:10px;font-weight:400;'},v);b.textContent=unit.length>10?unit.slice(0,10):unit;}}
      }
      /* the clock turns around the cut-out's centre, with a slightly shorter needle */
      function needleStyle(sx,fill,flt){if(!needle)return;needleG.setAttribute('transform',(needleG.getAttribute('transform')||'').replace(/translate\([^)]*\)/,'translate('+ccx.toFixed(2)+','+ccy.toFixed(2)+')'));css(needle,'fill:'+fill+';transform:scale('+sx+',0.72);'+(flt?'filter:'+flt+';':''));}
      if(dark)zones.forEach(function(z){if(lum(z.col)<0.12)css(z.p,'stroke:rgba(255,255,255,.45);stroke-width:1.2;');});   /* a very dark zone keeps its colour and gets a thin light rim */
      if(bg)css(bg,'fill:'+CUT+';');
      if(!big){   /* the small dials: the colours, a centred needle and a small hub */
        needleStyle(0.5,INK);
        if(st==='neon'||st==='amb'||st==='cyber')zones.forEach(function(z){css(z.p,'filter:drop-shadow(0 0 2px '+glowOf(z.col)+');');});
        if(st==='glass'&&bg)css(bg,'stroke:#aeb6c4;stroke-width:1.5;');
        if(!noNeedle)hub(2.4,INK);
        return;
      }
      if(st==='neon'){
        zones.forEach(function(z){css(z.p,'fill:'+mix(z.col,'#000000',0.12)+';filter:drop-shadow(0 0 '+(dark?7:4)+'px '+glowOf(z.col)+');');});
        var gl=el('linearGradient',{id:'gl'+id,x1:0,y1:0,x2:0,y2:1},defs);el('stop',{offset:0,'stop-color':'#fff','stop-opacity':0.45},gl);el('stop',{offset:0.6,'stop-color':'#fff','stop-opacity':0.05},gl);
        under('path',{d:ring(A0,1000,0.62*R,0.83*R),'clip-path':'url(#c'+id+')',fill:'url(#gl'+id+')'});
        under('path',{d:ring(A0,1000,0.82*R,0.85*R),'clip-path':'url(#c'+id+')',fill:'rgba(255,255,255,.55)'});
        if(bg)css(bg,'stroke:'+(dark?'rgba(255,255,255,.35)':'rgba(29,36,51,.18)')+';stroke-width:1.5;');
        if(C.scale!=='inside'&&!lookup)ticks(0.44,0.5,zcol);if(!lookup&&!(C.scale!=='off'&&rng))[250,500,750].forEach(function(v){var p=cpt(v,0.35);text(p[0],+p[1]+3,String(v/10),8.5,zcol(v));});   /* its own percentages give way to the real scale */
        needleStyle(0.32,dark?'#d9f6ff':'#1d2433',dark?'drop-shadow(0 0 4px #7fdcff)':'drop-shadow(0 0 3px rgba(60,170,255,.6))');
        if(!noNeedle){hub(8,CUT,dark?'#9adfff':'#2f9bd6',dark?'drop-shadow(0 0 5px #7fdcff)':null);hub(3,dark?'#d9f6ff':'#1d2433');}
        vblock(dark?'#cfe8ff':MUT,INK,{w:600});
      }else if(st==='flat'){
        if(bg)css(bg,'stroke:rgba(0,0,0,'+(dark?0.35:0.12)+');stroke-width:10;');
        over('path',{d:line(A0,1000,0.5*R,ccx,ccy),fill:'none',stroke:dark?'rgba(255,255,255,.4)':'rgba(29,36,51,.35)','stroke-width':1.5,'stroke-dasharray':'1 5','stroke-linecap':'round'});
        var nc=(lum(cur)<0.12)?mix(cur,'#4f7dff',0.6):cur;
        needleStyle(0.35,nc);if(!noNeedle)hub(6,CUT,nc);
        vblock(MUT,INK,{w:300});
      }else if(st==='cyber'){
        for(var a=A0;a<1000;a+=1000/54)under('path',{d:ring(a,a+3.5,0.3*R,0.9*R),fill:CUT});
        zones.forEach(function(z){css(z.p,'filter:drop-shadow(0 0 4px '+glowOf(z.col)+');');});
        under('path',{d:ring(A0,1000,0.9*R,0.915*R),fill:dark?'rgba(90,190,255,.7)':'rgba(30,120,220,.6)'});
        over('circle',{cx:ccx,cy:ccy,r:cr-6,fill:'none',stroke:dark?'rgba(90,190,255,.35)':'rgba(30,120,220,.35)','stroke-width':1});
        var cy2=dark?'#7ee0ff':'#0b6fc2';
        needleStyle(0.3,cy2,'drop-shadow(0 0 5px '+(dark?'#3fc4ff':'rgba(30,120,220,.6)')+')');if(!noNeedle)hub(6,CUT,cy2);
        vblock(dark?'#6cc8ff':'#2f6fa8',cy2,{w:700,mono:1,glow:dark?'drop-shadow(0 0 4px #3fc4ff)':null});
      }else if(st==='glass'){
        var mg=el('linearGradient',{id:'mg'+id,x1:0,y1:0,x2:1,y2:1},defs);[['0','#f4f6fa'],['.35','#8a93a3'],['.55','#e9edf3'],['1','#5d6675']].forEach(function(s){el('stop',{offset:s[0],'stop-color':s[1]},mg);});
        var sh=el('linearGradient',{id:'sh'+id,x1:0,y1:0,x2:0,y2:1},defs);[[0,'#fff',0.55],[0.5,'#fff',0.08],[0.5,'#000',0.05],[1,'#000',0.2]].forEach(function(s){el('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},sh);});
        under('rect',{x:0,y:0,width:S,height:S,'clip-path':'url(#c'+id+')',fill:'url(#sh'+id+')'});
        under('path',{d:ring(A0,1000,0.85*R,0.92*R),fill:'url(#mg'+id+')',style:'filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))'});
        if(bg)css(bg,'stroke:url(#mg'+id+');stroke-width:5;');
        needleStyle(0.4,dark?'#e6f4ff':'#2b3445','drop-shadow(1px 2px 2px rgba(0,0,0,.45))');
        if(!noNeedle){var kn=el('radialGradient',{id:'kn'+id,cx:'.35',cy:'.3'},defs);el('stop',{offset:0,'stop-color':'#fff'},kn);el('stop',{offset:0.6,'stop-color':'#9aa3b2'},kn);el('stop',{offset:1,'stop-color':'#4a5160'},kn);hub(13,'url(#kn'+id+')','#2b303a','drop-shadow(0 3px 4px rgba(0,0,0,.5))');}
        vblock(dark?'#c9d0dc':MUT,INK,{w:300});
      }else if(st==='amb'){
        zones.forEach(function(z){var g=glowOf(z.col);css(z.p,'filter:drop-shadow(0 0 '+(dark?10:6)+'px '+g+') drop-shadow(0 0 '+(dark?22:12)+'px '+g+');');});
        if(bg)css(bg,'stroke:'+(dark?'rgba(255,255,255,.08)':'rgba(29,36,51,.06)')+';stroke-width:6;');
        needleStyle(0.28,dark?'#f1f4ff':'#1d2433',dark?'drop-shadow(0 0 5px #c9d4ff)':'drop-shadow(0 0 3px rgba(29,36,51,.35))');
        vblock(MUT,INK,{w:300,glow:dark?'drop-shadow(0 0 6px rgba(255,255,255,.5))':null});
      }else{   /* clean */
        css(svg,'filter:drop-shadow(0 6px 10px rgba(20,30,60,'+(dark?0.45:0.18)+'))');
        if(C.scale!=='inside'&&!lookup)ticks(0.46,0.5,function(){return dark?'#7d879c':'#9aa3b4';});
        needleStyle(0.35,INK);if(!noNeedle){hub(5,INK);hub(2,CUT);}
        vblock(MUT,INK,{w:700,valueFirst:1});
      }
      extras(false);
      /* the scale numbers and the value line, on PRTG classic and on every style */
      function extras(classic){
        if(!big)return;
        var lineOn=(C.line==='full'||C.line==='value')&&!lookup, scaleOn=((C.scale==='outside'||C.scale==='inside')&&!!rng);
        var padOut=(scaleOn&&C.scale==='outside')?R*0.34:(lineOn?R*0.07:0);
        if(padOut){var H=parseFloat(svg.getAttribute('height'))||S;svg.setAttribute('viewBox',(-padOut).toFixed(1)+' '+(-padOut).toFixed(1)+' '+(S+2*padOut).toFixed(1)+' '+(H+2*padOut).toFixed(1));}   /* room for what goes outside the zones */
        var gl=(st==='neon'||st==='amb'||st==='cyber');
        if(lineOn){
          var lr=R*0.93, bs=[0,1000], V=(VAL===null)?null:Math.max(0,Math.min(1000,VAL)), i;
          zones.forEach(function(z){[z.v0,z.v1].forEach(function(b){b=Math.max(0,Math.min(1000,Math.round(b)));if(bs.indexOf(b)<0)bs.push(b);});});
          bs.sort(function(a,b){return a-b;});
          for(i=0;i<bs.length-1;i++){
            var a=bs[i], b=bs[i+1], col=zcol((a+b)/2);if(b-a<1)continue;
            if(V!==null&&V>a){var e=Math.min(b,V);if(e-a>0.5)over('path',{d:line(a,e,lr,cx,cy),fill:'none',stroke:col,'stroke-width':(R*0.045).toFixed(2),style:gl?'filter:drop-shadow(0 0 3px '+glowOf(col)+') drop-shadow(0 0 6px '+glowOf(col)+')':null});}
            if(C.line==='full'&&(V===null||V<b)){var s0=(V===null)?a:Math.max(a,V+3);if(b-s0>0.5)over('path',{d:line(s0,b,lr,cx,cy),fill:'none',stroke:col,'stroke-width':(R*0.016).toFixed(2)});}
          }
          if(V!==null){var tp=pt(V,lr,cx,cy);over('circle',{cx:tp[0],cy:tp[1],r:(R*0.04).toFixed(2),fill:'#ffffff',stroke:zcol(V),'stroke-width':(R*0.022).toFixed(2)});}
        }
        if(scaleOn){
          var inside=(C.scale==='inside'), ox=inside?ccx:cx, oy=inside?ccy:cy, span=rng.hi-rng.lo, step=nice(span/(inside?5:10)), ms=step/5, norm=zones.length?zones[0].col:null, un=unitOf(rng.lo,rng.hi);
          var tickMute=classic?'#7a8296':(dark?'#7d879c':'#8a93a6'), numCol=classic?labCol:MUT;
          for(var x=Math.ceil(rng.lo/ms-1e-9)*ms;x<=rng.hi+ms*1e-6;x+=ms){
            var v=(x-rng.lo)/span*1000, maj=Math.abs(x/step-Math.round(x/step))<1e-6, zc=zcol(v), tc=(st==='neon')?zc:((norm&&zc!==norm)?zc:tickMute);
            var r0=inside?R*(maj?0.41:0.45):R*1.0, r1=inside?R*0.5:R*(maj?1.09:1.045), p0=pt(v,r0,ox,oy), p1=pt(v,r1,ox,oy);
            over('line',{x1:p0[0],y1:p0[1],x2:p1[0],y2:p1[1],stroke:tc,'stroke-width':maj?(R*0.016).toFixed(2):(R*0.008).toFixed(2),opacity:maj?1:0.75});
            if(maj){var q=pt(v,inside?R*0.31:R*1.2,ox,oy);text(q[0],+q[1]+R*0.035,fmtN(x/un[0],step/un[0])+un[1],(R*(inside?0.085:0.095)).toFixed(1),st==='neon'?zc:numCol);}
          }
          if(classic){labs.forEach(function(t){t.style.display='none';});   /* the numbers replace PRTG's min and max */
            if(inside&&needle){var nf=getComputedStyle(needle).fill, hf=bg?getComputedStyle(bg).fill:'#ffffff';needleStyle(0.35,nf);if(!noNeedle){hub(R*0.05,nf);hub(R*0.02,hf);}}}
        }
      }
    }
    /* PRTG lays its gauge boxes out at fixed sizes; scale them so they all fit the object, centred */
    function fit(){
      var c=root.querySelector('[class*="prtg-plugin"] .centered'), pl=root.querySelector('[class*="prtg-plugin"]');if(!c||!pl)return;
      var rr=root.getBoundingClientRect(), pr=pl.getBoundingClientRect(), cs=getComputedStyle(root);
      var aw=pl.clientWidth||pr.width, ah=rr.bottom-pr.top-(parseFloat(cs.borderBottomWidth)||0)-4, par=pl.parentNode;
      if(par&&par!==root){var ps=getComputedStyle(par);ah-=(parseFloat(ps.paddingBottom)||0);}
      var pp=getComputedStyle(pl), padV=(parseFloat(pp.paddingTop)||0)+(parseFloat(pp.paddingBottom)||0), padH=(parseFloat(pp.paddingLeft)||0)+(parseFloat(pp.paddingRight)||0);
      if(aw<40||ah<40)return;
      pl.style.boxSizing='border-box';pl.style.height=Math.floor(ah)+'px';
      aw-=padH;ah-=padV;   /* the box's own padding (a look with a title bar adds some) is not room for the gauges */
      /* the largest scale at which the boxes, wrapped to the width they get, still fit the height. A transform is measured the same
         way by every browser (layout sizes ignore it), unlike CSS zoom, which older and newer Chrome report differently */
      c.style.zoom='';c.style.transformOrigin='0 0';c.style.transform='none';c.style.marginTop='0px';
      function tall(z){c.style.width=Math.floor(aw/z)+'px';return Math.max(c.offsetHeight,c.scrollHeight)*z;}   /* PRTG's boxes are shorter than what they hold: measure the content */
      var lo=0.2, hi=4, i, best=lo;   /* the dial is drawn as vectors, so it stays sharp when it grows to fill a large object */
      for(i=0;i<10;i++){var m=(lo+hi)/2;if(tall(m)<=ah){best=m;lo=m;}else hi=m;}
      var widest=0;[].forEach.call(c.children,function(k){var w=Math.max(k.offsetWidth,k.scrollWidth);if(w>widest)widest=w;});
      if(widest*best>aw)best=aw/widest;
      best=Math.floor(best*1000)/1000;
      var used=tall(best), dy=Math.max(0,Math.floor((ah-used)/2));
      c.style.transform='translate(0,'+dy+'px) scale('+best+')';   /* centred in the height too */
    }
    function run(){[].forEach.call(root.querySelectorAll('svg.gauge'),decorate);if(C.fit!==false)fit();}
    run();
    if(window.MutationObserver){var pend=false;new MutationObserver(function(){if(pend)return;pend=true;(window.requestAnimationFrame||setTimeout)(function(){pend=false;run();});}).observe(root,{childList:true,subtree:true});}
    if(window.ResizeObserver&&C.fit!==false){var lastW=0,lastH=0;new ResizeObserver(function(){var w=root.clientWidth,h=root.clientHeight;if(w===lastW&&h===lastH)return;lastW=w;lastH=h;fit();}).observe(root);}
  }
  /* the ring gauge's drawing code: shipped inside the generated file as its own source text */
  function ringRuntime(root,C){
    var NS='http://www.w3.org/2000/svg';
    var wrap=root.querySelector('.gwrap'), svg0=root.querySelector('.gsvg');
    if(!wrap||!svg0)return;
    var uid='g'+Math.floor(Math.random()*1e9).toString(36), seq=0;
    function el(tag,attrs,text){var e=document.createElementNS(NS,tag);for(var k in attrs){e.setAttribute(k,attrs[k]);}if(text!=null)e.textContent=text;return e;}
    function num(v){if(v===''||v===null||v===undefined)return null;var n=Number(v);return isNaN(n)?null:n;}
    function fmt(n){if(n===null)return '';var a=Math.abs(n);if(a>=1e4){var d=a>=1e9?1e9:(a>=1e6?1e6:1e3);return String(Math.round(n/d*10)/10)+(d===1e9?'G':(d===1e6?'M':'k'));}if(a>=1000)return String(Math.round(n));return String(Math.round(n*10)/10);}
    function hx(c){c=String(c||'').replace('#','');if(c.length===3)c=c.charAt(0)+c.charAt(0)+c.charAt(1)+c.charAt(1)+c.charAt(2)+c.charAt(2);return c.length===6?c:null;}
    function mix(a,b,t){var x=hx(a),y=hx(b),o='#',i,v;if(!x||!y)return a;for(i=0;i<6;i+=2){v=Math.round(parseInt(x.substr(i,2),16)*(1-t)+parseInt(y.substr(i,2),16)*t);o+=(v<16?'0':'')+v.toString(16);}return o;}
    function strip(s){return String(s==null?'':s).replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/^\s+|\s+$/g,'');}
    function clearAll(){var old=wrap.querySelector('.gcells');if(old)wrap.removeChild(old);while(svg0.firstChild)svg0.removeChild(svg0.firstChild);svg0.style.display='';}
    function say(t){clearAll();svg0.setAttribute('viewBox','0 0 200 100');svg0.appendChild(el('text',{x:100,y:54,'text-anchor':'middle','class':'gl','font-size':12},t));root.setAttribute('data-gauge','message');}
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
    /* PRTG keeps a channel's or a sensor's values in info.data[0], as its own gauge script reads them */
    function infoOf(c){return (c&&c.info&&c.info.data&&c.info.data[0])||null;}
    function pick(data){
      var out=[],i,c,inf,list;
      if(C.kind==='device'){
        list=(data.objects&&data.objects.sensors)||[];
        for(i=0;i<list.length;i++){c=list[i];inf=infoOf(c);if(!inf||!inf.name||inf.show===0)continue;
          out.push({info:inf,label:strip(c.sensor)||inf.name,sub:inf.name,txt:inf.lastvalue||c.lastvalue||c.lastvalue_||'',big:!C.small&&(!!inf.primary||Number(c.priority)>4)});}
        out.sort(function(a,b){return (b.big?1:0)-(a.big?1:0);});
        return out;
      }
      list=(data.objects&&data.objects.channels)||[];
      if(C.kind==='sensor-all'){
        for(i=0;i<list.length;i++){c=list[i];inf=infoOf(c);if(!inf||!inf.name||inf.show===0||!c.condition)continue;
          out.push({info:inf,label:inf.name,sub:'',txt:c.lastvalue||inf.lastvalue||'',big:!C.small&&!!inf.primary});}
        out.sort(function(a,b){return (b.big?1:0)-(a.big?1:0);});
        return out;
      }
      var ch=null;
      if(C.channel==='name'){
        var want=String(C.channelName||'').toLowerCase();
        for(i=0;i<list.length&&!ch;i++){inf=infoOf(list[i]);if(String(list[i].name||(inf&&inf.name)||'').toLowerCase()===want)ch=list[i];}
        if(!ch)return 'Channel not found';
      }else{
        var pid=root.getAttribute('data-primarychannel');
        for(i=0;i<list.length&&!ch;i++){inf=infoOf(list[i]);if(inf&&inf.primary)ch=list[i];}
        for(i=0;i<list.length&&!ch;i++){inf=infoOf(list[i]);if(inf&&pid!==null&&pid!==''&&String(inf.id)===String(pid))ch=list[i];}
        for(i=0;i<list.length&&!ch;i++){inf=infoOf(list[i]);if(inf&&inf.show!==0)ch=list[i];}
        if(!ch)return 'No channel';
      }
      inf=infoOf(ch)||{};
      out.push({info:inf,label:(C.label==='custom'?C.labelText:(inf.name||ch.name||'')),sub:'',txt:ch.lastvalue||inf.lastvalue||'',big:true,single:true});
      return out;
    }
    /* one gauge, drawn into its own svg */
    function draw(svg,it){
      var info=it.info, val=num(info.lastvalueraw), txt=it.txt, status=Number(info.status), F=C.style||'progress';
      var min=null,max=null,ranged=true;
      if(C.rangeMode!=='manual'){min=num(info.graphminraw);max=num(info.graphmaxraw);}
      if(min===null||max===null||max<=min){if(info.lookups&&C.rangeMode!=='manual')ranged=false;min=C.min;max=C.max;}
      if(info.lookups&&C.rangeMode!=='manual')ranged=false;   /* PRTG gives lookup channels a graph range too, but it means nothing */
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
      if(!ranged&&!dead){hasVal=false;}
      function zoneAt(v){
        if((lim.eh!==null&&v>=lim.eh)||(lim.el!==null&&v<=lim.el))return K.down;
        if((lim.wh!==null&&v>=lim.wh)||(lim.wl!==null&&v<=lim.wl))return K.warning;
        return K.up;
      }
      var ring=(C.shape!=='half'), start=ring?135:180, sweep=ring?270:180;
      var needleOn=(((F==='zones'&&C.needle)||F==='speedo')&&!dead&&hasVal);
      var banded=(F==='threshold'||F==='gradient');
      var sw=C.thick;
      if(F==='solid')sw=Math.max(sw,22);
      else if(F==='led')sw=Math.max(sw,16);
      else if(F==='speedo')sw=3;
      var r=banded?74:(F==='speedo'?82:78);
      var cx=100, pad=Math.max(0,(sw-14)/2), cy=ring?100:92+pad;
      var glow=null;
      if(C.glow&&!dead&&(F==='led'||F==='gradient'||F==='speedo'||F==='threshold'||F==='solid')){
        var fid=uid+'f'+(seq++), defs=el('defs',{}), f=el('filter',{id:fid,filterUnits:'userSpaceOnUse',x:-20,y:-20,width:240,height:260});
        f.appendChild(el('feGaussianBlur',{'in':'SourceGraphic',stdDeviation:'3',result:'b'}));
        var m=el('feMerge',{});m.appendChild(el('feMergeNode',{'in':'b'}));m.appendChild(el('feMergeNode',{'in':'SourceGraphic'}));f.appendChild(m);
        defs.appendChild(f);svg.appendChild(defs);glow='url(#'+fid+')';
      }
      function pt(a,rr){var t=a*Math.PI/180;return [cx+rr*Math.cos(t),cy+rr*Math.sin(t)];}
      function arcR(a0,a1,rr,col,w,cap){
        if(a1-a0<0.3)return null;
        var p0=pt(a0,rr),p1=pt(a1,rr);
        return el('path',{d:'M '+p0[0].toFixed(2)+' '+p0[1].toFixed(2)+' A '+rr+' '+rr+' 0 '+((a1-a0)>180?1:0)+' 1 '+p1[0].toFixed(2)+' '+p1[1].toFixed(2),fill:'none',stroke:col,'stroke-width':w,'stroke-linecap':cap||'butt'});
      }
      function arc(a0,a1,col,w,cap){return arcR(a0,a1,r,col,w,cap);}
      function ang(v){var q=(v-min)/(max-min);q=q<0?0:(q>1?1:q);return start+sweep*q;}
      /* everything that glows shares one filtered group per gauge: one blur pass, not one per segment */
      var litG=null;
      function put(node,lit){if(!node)return;if(lit&&glow){if(!litG){litG=el('g',{filter:glow});svg.appendChild(litG);}litG.appendChild(node);}else svg.appendChild(node);}
      function zones(){
        var zs=[[min,max,K.up]];
        function zone(a,b,col){if(a===null||b===null)return;a=Math.max(min,a);b=Math.min(max,b);if(b>a)zs.push([a,b,col]);}
        zone(min,lim.wl,K.warning);zone(lim.wh,max,K.warning);zone(min,lim.el,K.down);zone(lim.eh,max,K.down);
        return zs;
      }
      var vEnd=hasVal?Math.max(start+0.4,ang(val)):start;
      svg.setAttribute('preserveAspectRatio','xMidYMid meet');
      if(F==='led'){
        var N=ring?27:20, step=sweep/N, gap=Math.min(2.4,step*0.28), k;
        for(k=0;k<N;k++){
          var a0=start+step*k, a1=a0+step, lit=(!dead&&hasVal&&(a0+step*0.5)<=ang(val));
          var col=lit?(C.colorMode==='accent'?C.accent:zoneAt(min+(max-min)*(k+0.5)/N)):C.track;
          put(arc(a0+gap/2,a1-gap/2,col,sw,'butt'),lit);
        }
      }else if(F==='gradient'){
        var gid=uid+'g'+(seq++), lowBad=((lim.el!==null||lim.wl!==null)&&lim.eh===null&&lim.wh===null);
        var stops=(C.colorMode==='accent')?[mix(C.accent,C.track,0.65),C.accent]:[K.up,K.warning,K.down];
        if(lowBad)stops.reverse();
        var defs2=el('defs',{}), lg=el('linearGradient',{id:gid,gradientUnits:'userSpaceOnUse',x1:cx-r-sw,y1:0,x2:cx+r+sw,y2:0});
        stops.forEach(function(s,i){lg.appendChild(el('stop',{offset:(stops.length>1?i/(stops.length-1):0),'stop-color':s}));});
        defs2.appendChild(lg);svg.appendChild(defs2);
        svg.appendChild(arc(start,start+sweep,C.track,sw,'butt'));
        put(arcR(start,start+sweep,r+sw/2+5,dead?C.track:'url(#'+gid+')',3,'butt'),false);
        if(!dead&&hasVal)put(arc(start,vEnd,'url(#'+gid+')',sw,'butt'),true);
      }else if(F==='speedo'){
        svg.appendChild(arcR(start,start+sweep,r,C.track,3,'butt'));
        if(!dead&&hasVal)zones().forEach(function(z){var a=arcR(ang(z[0]),ang(z[1]),r,z[2],3,'butt');if(a)svg.appendChild(a);});
        var ticks=50, j;
        for(j=0;j<=ticks;j++){
          var aa=start+sweep*j/ticks, maj=(j%5===0), q0=pt(aa,r-3), q1=pt(aa,r-(maj?12:7));
          svg.appendChild(el('line',{x1:q0[0].toFixed(2),y1:q0[1].toFixed(2),x2:q1[0].toFixed(2),y2:q1[1].toFixed(2),stroke:C.tickColor,'stroke-width':maj?2:1,'stroke-linecap':'round','stroke-opacity':maj?0.9:0.55}));
          if(maj){var tq=pt(aa,r-21);svg.appendChild(el('text',{x:tq[0].toFixed(1),y:(tq[1]+3).toFixed(1),'text-anchor':'middle','class':'gm','font-size':8.5},fmt(min+(max-min)*j/ticks)));}
        }
        if(!dead&&hasVal)put(arcR(start,vEnd,r+6,color,3,'round'),true);
      }else{
        svg.appendChild(el('path',{d:'M '+pt(start,r)[0].toFixed(2)+' '+pt(start,r)[1].toFixed(2)+' A '+r+' '+r+' 0 '+(sweep>180?1:0)+' 1 '+pt(start+sweep,r)[0].toFixed(2)+' '+pt(start+sweep,r)[1].toFixed(2),fill:'none',
          stroke:(F==='solid'&&!dead)?mix(color,C.track,0.78):C.track,'stroke-width':sw,'stroke-linecap':(F==='progress'||F==='solid'||F==='threshold')?'round':'butt'}));
        if(F==='threshold'){
          var zz=dead?[[min,max,C.track]]:zones(), br=r+sw/2+5;
          zz.forEach(function(z,i){var a=arcR(ang(z[0])+(i?0.8:0),ang(z[1]),br,z[2],3,'butt');if(a)svg.appendChild(a);});
        }
        if(F==='zones'&&!dead){
          zones().forEach(function(z){var a=arc(ang(z[0]),ang(z[1]),z[2],sw,'butt');if(a)svg.appendChild(a);});
        }else if(!dead&&hasVal){
          put(arc(start,vEnd,color,sw,'round'),F!=='progress');
          if(F==='threshold'){var dp=pt(vEnd,r);svg.appendChild(el('circle',{cx:dp[0].toFixed(2),cy:dp[1].toFixed(2),r:Math.max(2,sw*0.2).toFixed(1),fill:mix(color,'#000000',0.4)}));}
        }else if(!dead&&!ranged){
          svg.appendChild(arc(start,start+sweep,color,sw,'round'));
        }
      }
      if(needleOn){
        var na=ang(val), nt=na*Math.PI/180, nl=(F==='speedo')?r-15:r-sw/2-4, cs=Math.cos(nt), sn=Math.sin(nt);
        if(F==='speedo'){
          var w2=3.4, tip=[cx+nl*cs,cy+nl*sn], tail=[cx-13*cs,cy-13*sn];
          var poly=[tip,[cx-w2*sn,cy+w2*cs],tail,[cx+w2*sn,cy-w2*cs]].map(function(p){return p[0].toFixed(2)+','+p[1].toFixed(2);}).join(' ');
          put(el('polygon',{points:poly,fill:color}),true);
          svg.appendChild(el('circle',{cx:cx,cy:cy,r:7,fill:C.needleColor}));
          svg.appendChild(el('circle',{cx:cx,cy:cy,r:2.6,fill:C.track}));
        }else{
          svg.appendChild(el('line',{x1:cx,y1:cy,x2:(cx+nl*cs).toFixed(2),y2:(cy+nl*sn).toFixed(2),stroke:C.needleColor,'stroke-width':3,'stroke-linecap':'round'}));
          svg.appendChild(el('circle',{cx:cx,cy:cy,r:6,fill:C.needleColor}));
        }
      }
      var shown=(pausedSt||unknownSt)?'–':(txt||'–');
      var len=Math.max(1,String(shown).length), big=(F==='solid'), spd=(ring&&F==='speedo'&&needleOn);
      /* the digital font is wider, and the speedometer's value sits below its scale numbers */
      var cw=(F==='led')?0.66:0.56, room=spd?78:(needleOn?100:(big?125:(F==='led'?104:115)));
      var fs=Math.max(12,Math.min(spd?22:(needleOn?26:(big?40:34)),room/(cw*len)));
      var vy, ly;
      if(spd){vy=cy+62;ly=vy+15;}
      else if(ring){vy=needleOn?cy+40:cy+(fs*0.34);ly=needleOn?vy+18:vy+20;}
      else{vy=needleOn?cy+30+fs*0.3:cy-4;ly=needleOn?vy+16:cy+16;}
      var vt=el('text',{x:cx,y:vy.toFixed(1),'text-anchor':'middle','class':'gv'+(F==='led'?' gdig':''),'font-size':fs.toFixed(1)},shown);
      if(F==='led'&&!dead)vt.setAttribute('style','fill:'+color);
      svg.appendChild(vt);
      var label=(C.label==='none')?'':(it.label||''), bottom=ly;
      if(label){svg.appendChild(el('text',{x:cx,y:ly.toFixed(1),'text-anchor':'middle','class':'gl','font-size':12},label));}
      if(label&&it.sub&&it.sub!==label){bottom=ly+14;svg.appendChild(el('text',{x:cx,y:bottom.toFixed(1),'text-anchor':'middle','class':'gm','font-size':10},it.sub));}
      if(C.showMinMax&&!dead&&F!=='speedo'&&ranged){
        var s0=pt(start,r), s1=pt(start+sweep,r), dy=sw/2+14;
        svg.appendChild(el('text',{x:(s0[0]+(ring?6:0)).toFixed(1),y:(s0[1]+dy).toFixed(1),'text-anchor':'middle','class':'gm','font-size':11},fmt(min)));
        svg.appendChild(el('text',{x:(s1[0]-(ring?6:0)).toFixed(1),y:(s1[1]+dy).toFixed(1),'text-anchor':'middle','class':'gm','font-size':11},fmt(max)));
      }
      var H=ring?184:(needleOn?152:124);
      H=Math.max(H,Math.ceil(bottom+8));
      svg.setAttribute('viewBox','0 0 200 '+(H+pad));
    }
    try{
      var raw=findJson();
      if(!raw){say('No gauge data');return;}
      var items=pick(JSON.parse(raw));
      if(typeof items==='string'){say(items);return;}
      if(!items.length){say(C.kind==='device'?'No sensors to show':'No channels to show');return;}
      clearAll();
      if(items.length===1&&items[0].single){draw(svg0,items[0]);}
      else{
        svg0.style.display='none';
        var box=document.createElement('div');box.className='gcells';
        for(var n=0;n<items.length;n++){
          var cell=document.createElement('div');cell.className='gcell'+(items[n].big?' big':'');
          var s=el('svg',{'class':'gcsvg'});cell.appendChild(s);box.appendChild(cell);draw(s,items[n]);
        }
        wrap.appendChild(box);
      }
      root.setAttribute('data-gauge','ok');
    }catch(err){
      say('Gauge data unavailable');
      if(window.console&&console.warn)console.warn('ring gauge:',err);
    }
  }
  function ringConfig(G,L){
    var track=blend(L.card?L.cardBg:'#FFFFFF',L.text,0.16);
    return {kind:G.kind||'sensor-primary',small:!!G.small,channel:G.channel,channelName:String(G.channelName||'').replace(/["<>\\]/g,''),rangeMode:G.rangeMode,
      min:Number(G.min)||0,max:(Number(G.max)===0&&Number(G.min)===0)?100:Number(G.max),limits:G.limits,dir:G.dir,warn:Number(G.warn)||0,err:Number(G.err)||0,
      shape:G.shape,thick:Math.max(4,Math.min(40,Number(G.thick)||14)),style:G.style,colorMode:G.colorMode,needle:!!G.needle,showMinMax:!!G.showMinMax,glow:!!G.glow,
      label:G.label,labelText:String(G.labelText||'').replace(/["<>\\]/g,''),
      colors:{up:L.c.up,warning:L.c.warning,down:L.c.down,unusual:L.c.unusual,paused:L.c.paused,unknown:L.c.unknown},
      accent:L.accent,track:track,needleColor:L.text,tickColor:(L.muted||L.headColor||L.text)};
  }
  function gaugeScript(G,cls){
    if(G.engine==='prtg'&&(G.nstyle||G.fit!==false||nativeExtras(G)))return '(function(){\n  var root=document.getElementById("<@itemid>");\n  if(!root)return;\n  var CFG='+JSON.stringify(nativeCfgAll(G))+';\n  ('+nativeRuntime.toString()+')(root,CFG);\n})();';
    if(G.engine!=='ring')return '';
    var L=gEffLook(G), cfg=ringConfig(G,L);
    return '(function(){\n  var root=document.getElementById("<@itemid>");\n  if(!root)return;\n  var CFG='+JSON.stringify(cfg)+';\n  ('+ringRuntime.toString()+')(root,CFG);\n})();';
  }
  function gaugeFileName(G){return fileNameOf(G);}
  /* the sensor list PRTG's own device gauge templates ask for (Gauges device*.htm) */
  var DEVCOLS='objid,position=treejson,sensor=textraw,info=treejson,minimum,maximum,lastvalue_,status=textraw,priority=raw,message=treejson';
  function devExtra(G){
    var ex=[], n=parseInt(G.count,10), prio='@above('+Math.max(0,Math.min(4,parseInt(G.prio,10)||0))+')';
    ex.push("count='"+(n>0?Math.min(n,500):'*')+"'");
    ex.push("filter_priority='"+prio+"'");
    tagFilters(G).forEach(function(tf){ex.push('filter_tags="'+tf+'"');});
    return ex;
  }
  function buildGauge(G){
    var cls=gClassOf(G), css=gaugeCss(G,cls), js=gaugeScript(G,cls), L=gEffLook(G);
    var ring=(G.engine==='ring'), styled=(G.look.mode!=='prtg')||ring, o=[];
    var check=(G.kind==='device')?'probenode,group,device':'sensor';
    var useCls=!!css;
    o.push('<!'+'--'+clean(G.cat||'Gauges')+': '+clean(G.name||'Gauge')+'-->');
    o.push('');
    o.push('<div class="map_object map_table'+(useCls?' '+cls:'')+' <#sensor type="colorclassofstate" prefix="map_objectstate_" id="<@objectid>">" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+initAttr(G)+((ring&&G.kind!=='device')?' data-primarychannel=\'<#objectproperty name="primarychannel" show="number" id="<@objectid>">\'':'')+' style="overflow:hidden;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
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
      if(G.kind==='device')json('sensors','-position',DEVCOLS,devExtra(G)).forEach(function(l){o.push(l);});
      else json('channels','name',chCols).forEach(function(l){o.push(l);});
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
        json('sensors','-position',DEVCOLS,devExtra(G)).forEach(function(l){o.push(l);});
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
  function grKindSize(v){   /* the usual size of each kind, unless the size was changed by hand */
    var big=(GR.initW===760&&GR.initH===420), small=(GR.initW===520&&GR.initH===300);
    if(v==='sensors'&&small){GR.initW=760;GR.initH=420;}else if(v!=='sensors'&&big){GR.initW=520;GR.initH=300;}
  }
  var GRSTYLES=[['area','Line, soft fill'],['smooth','Smooth, soft fill'],['line','Line only'],['bars','Bars'],['stacked','Stacked bars'],['overlap','Overlapping areas'],['stackarea','Stacked area'],['mirror','Mirrored (in / out)'],['threshold','Threshold colors'],['glow','Glow gradient'],['step','Stepped line'],['spark','Sparkline with value'],['combo','Bars + line'],['heatmap','Heatmap: hour by day'],['band','Min / max band'],['dots','Dots'],['ring','24-hour ring']];
  /* the Graph menu's pictures, drawn by the graph engine itself with the sample data and this graph's look, colours, line and fill,
     so each one shows what choosing it gives. Drawn off screen without a resize watcher, cached until one of those settings changes. */
  var GRSHOT={key:'',svg:{}};
  function grShotKey(){var L=grLook(GR);return JSON.stringify([(window.PMSSETS&&window.PMSSETS.cur)||'',L.name,L.c,L.accent,L.link,L.card,L.cardBg,L.text,L.muted,GR.lw,GR.fillA,GR.dots,GR.gridOn,GR.bradius,GR.maxCh]);}
  function grShots(){
    var key=grShotKey();if(GRSHOT.key===key)return GRSHOT.svg;
    var out={}, L=grLook(GR), host=document.createElement('div'), RO=window.ResizeObserver;
    host.style.cssText='position:fixed;left:-10000px;top:0;width:210px;height:82px;visibility:hidden;';   /* the shape of the picture box, so text is not stretched */
    document.body.appendChild(host);
    try{
      window.ResizeObserver=undefined;   /* a picture is drawn once: no watcher is left behind */
      GRSTYLES.forEach(function(x){
        var g=JSON.parse(JSON.stringify(GR));g.cstyle=x[0];g.axis=false;g.legend=false;
        var c=graphConfig(g,L);c.sample=true;c.sampleN=(x[0]==='heatmap'||x[0]==='ring'||x[0]==='band')?0:18;c.tips=false;c.refresh=0;c.legendValues=false;
        host.innerHTML='<div class="map_graph"><div class="gown" style="width:210px;height:82px"></div></div>';
        try{graphRuntime(host.firstChild,c);var sv=host.querySelector('svg');
          out[x[0]]=sv?'<span class="grshot" style="background:'+c.card+'">'+sv.outerHTML.replace(/ width="[^"]*" height="[^"]*"/,' width="100%" height="100%"')+'</span>':null;}catch(e){out[x[0]]=null;}
      });
    }finally{window.ResizeObserver=RO;if(host.parentNode)host.parentNode.removeChild(host);}
    GRSHOT={key:key,svg:out};return out;
  }
  function grStyleSvg(k){   /* a small picture of each chart style, for the bar */
    var B='#2f6fed', A='#f2b01e', o='<svg viewBox="0 0 64 40" width="64" height="40" aria-hidden="true"><path d="M4 36.5H60" stroke="#c9cdd6" stroke-width="1"/>';
    if(k==='area')o+='<path d="M4 30L14 20L24 24L34 12L44 18L60 8V36H4Z" fill="'+B+'" fill-opacity=".2"/><path d="M4 30L14 20L24 24L34 12L44 18L60 8" fill="none" stroke="'+B+'" stroke-width="2" stroke-linejoin="round"/>';
    else if(k==='smooth')o+='<path d="M4 30C10 18 16 18 22 22S34 8 42 15S54 8 60 7V36H4Z" fill="'+B+'" fill-opacity=".2"/><path d="M4 30C10 18 16 18 22 22S34 8 42 15S54 8 60 7" fill="none" stroke="'+B+'" stroke-width="2" stroke-linecap="round"/>';
    else if(k==='line')o+='<path d="M4 30L14 20L24 24L34 12L44 18L60 8" fill="none" stroke="'+B+'" stroke-width="2" stroke-linejoin="round"/><path d="M4 33L14 29L24 31L34 22L44 27L60 20" fill="none" stroke="'+A+'" stroke-width="2" stroke-linejoin="round"/>';
    else if(k==='bars'){[[7,24,14],[17,16,8],[27,28,12],[37,10,6],[47,20,10]].forEach(function(b){o+='<rect x="'+b[0]+'" y="'+b[1]+'" width="4.5" height="'+(36-b[1])+'" rx="1.2" fill="'+B+'"/><rect x="'+(b[0]+5)+'" y="'+(36-b[2])+'" width="4.5" height="'+b[2]+'" rx="1.2" fill="'+A+'"/>';});}
    else if(k==='overlap')o+='<path d="M4 26L14 14L24 22L34 10L44 20L60 12V36H4Z" fill="'+B+'" fill-opacity=".5" stroke="'+B+'" stroke-width="1.2"/><path d="M4 30L14 24L24 16L34 26L44 14L60 22V36H4Z" fill="#8fae1b" fill-opacity=".5" stroke="#8fae1b" stroke-width="1.2"/>';
    else if(k==='stackarea')o+='<path d="M4 14L16 10L28 16L40 8L52 13L60 10V36H4Z" fill="#20a39e"/><path d="M4 22L16 18L28 24L40 16L52 21L60 18V36H4Z" fill="'+B+'"/><path d="M4 29L16 26L28 30L40 24L52 28L60 26V36H4Z" fill="#8fae1b"/>';
    else if(k==='mirror')o+='<path d="M4 20H60" stroke="#9aa3b5"/><path d="M4 20L4 13L14 9L24 14L34 6L44 12L60 8V20Z" fill="#8fae1b" fill-opacity=".75"/><path d="M4 20L4 26L14 30L24 25L34 32L44 27L60 31V20Z" fill="'+B+'" fill-opacity=".75"/>';
    else if(k==='threshold')o+='<path d="M4 12H60" stroke="#E30613" stroke-dasharray="3 2"/><path d="M4 18H60" stroke="#F5C500" stroke-dasharray="3 2"/><path d="M4 30L14 24L22 16L28 9L34 20L44 26L52 15L60 22" fill="none" stroke="#8fae1b" stroke-width="2"/><path d="M20.5 18L22 16L25 12.5" fill="none" stroke="#F5C500" stroke-width="2.2"/><path d="M25 12.5L28 9L29.5 12" fill="none" stroke="#E30613" stroke-width="2.2"/>';
    else if(k==='glow')o='<svg viewBox="0 0 64 40" width="64" height="40" aria-hidden="true"><rect width="64" height="40" rx="4" fill="#1d2130"/><defs><linearGradient id="grglt" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4ade80" stop-opacity=".55"/><stop offset="1" stop-color="#4ade80" stop-opacity="0"/></linearGradient></defs><path d="M4 30C10 18 16 18 22 22S34 8 42 15S54 8 60 7V36H4Z" fill="url(#grglt)"/><path d="M4 30C10 18 16 18 22 22S34 8 42 15S54 8 60 7" fill="none" stroke="#4ade80" stroke-width="3" stroke-opacity=".35"/><path d="M4 30C10 18 16 18 22 22S34 8 42 15S54 8 60 7" fill="none" stroke="#4ade80" stroke-width="1.6"/>';
    else{[[6,12,10],[17,20,8],[28,8,14],[39,16,10],[50,22,6]].forEach(function(b){o+='<rect x="'+b[0]+'" y="'+(36-b[1]-b[2])+'" width="8" height="'+b[2]+'" rx="1.2" fill="'+A+'"/><rect x="'+b[0]+'" y="'+(36-b[1])+'" width="8" height="'+b[1]+'" rx="1.2" fill="'+B+'"/>';});}
    return o+'</svg>';
  }

  /* 1.5.69: the graph's choices as pictures, so each one shows what it gives (the bar's Graph menu and the side panel) */
  var GRPICK={
    kind:[['sensor','Sensor graph','Graph of a sensor: its channels over time. Put it on a sensor.'],['bars','Bars','Bars of live values or sensor states, now. Put it on a sensor, device or group.'],['sensors','Every sensor','A small graph of every sensor on a device, group or probe.'],['toplist','Toplist','A sensor’s toplist, for example the top talkers of a flow sensor.']],
    bsrc:[['status','Sensor states','The share of sensors in each state. Put it on a device, group or probe.'],['channels','Channels','The channels of one sensor, one bar each. Put it on a sensor.'],['sensors','Sensors by value','The sensors on a device or group, one bar each, by their value.']],
    bdir:[['row','Horizontal','Bars from left to right'],['col','Vertical','Bars from the bottom up']],
    bcolor:[['status','By state','Each bar in the colour of its sensor’s state'],['cat','One per bar','A different colour for each bar'],['one','All the same','Every bar in one colour']],
    draw:[['own','Modern chart','Drawn by Map Studio from the history; follows the look and the chart styles'],['pic','PRTG’s picture','PRTG’s own graph picture, as on a sensor page']]
  };
  function grPic(g,v){
    var G1='#B8C419',Y='#F5C500',R='#E30613',A='#1f6fe5',P='#8b5cf6',O='#f59e0b',T='#14b8a6',M='#9aa0ad',D='#1d2433',N='#E3E6EC',o='<rect x="1" y="1" width="62" height="42" rx="5" fill="#fff" stroke="#dfe3ea"/>';
    function bar(x,y,w,hh,c){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+hh+'" rx="1.2" fill="'+c+'"/>';}
    function lab(x,y,w){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="1.8" rx=".8" fill="'+M+'"/>';}
    if(g==='kind'){
      if(v==='sensor')o+=lab(6,6,20)+'<path d="M6 34 L14 27 L22 30 L30 20 L38 24 L46 14 L58 18 V38 H6 Z" fill="'+A+'" opacity=".16"/><path d="M6 34 L14 27 L22 30 L30 20 L38 24 L46 14 L58 18" fill="none" stroke="'+A+'" stroke-width="1.6" stroke-linejoin="round"/>';
      else if(v==='bars')o+=lab(6,6,20)+bar(6,13,44,5,G1)+bar(6,21,26,5,Y)+bar(6,29,12,5,R)+lab(53,15,6)+lab(36,23,6)+lab(22,31,6);
      else if(v==='sensors'){var i;for(i=0;i<4;i++){var x=5+(i%2)*28,y=5+Math.floor(i/2)*18;o+='<rect x="'+x+'" y="'+y+'" width="26" height="16" rx="2" fill="#f4f5f7"/><path d="M'+(x+2)+' '+(y+12)+' l5 -4 l5 2 l5 -5 l7 3" fill="none" stroke="'+[A,G1,O,T][i]+'" stroke-width="1.3"/>';}}
      else if(v==='toplist')o+=[0,1,2,3].map(function(i){return '<text x="7" y="'+(13+i*8)+'" font-size="6" font-weight="700" fill="'+D+'" font-family="Inter,Segoe UI,Arial,sans-serif">'+(i+1)+'</text>'+bar(13,9+i*8,[44,32,22,14][i],4.5,A)+lab(13+[44,32,22,14][i]+2,10.5+i*8,4);}).join('');
    }else if(g==='bsrc'){
      if(v==='status')o+=bar(6,8,52,6,N)+bar(6,8,36,6,G1)+bar(42,8,8,6,Y)+bar(50,8,8,6,R)+'<circle cx="8" cy="23" r="1.8" fill="'+G1+'"/>'+lab(12,22,10)+'<circle cx="27" cy="23" r="1.8" fill="'+Y+'"/>'+lab(31,22,7)+'<circle cx="43" cy="23" r="1.8" fill="'+R+'"/>'+lab(47,22,7)+bar(6,30,40,4,G1)+bar(6,36,14,3,Y);
      else if(v==='channels')o+=lab(6,7,16)+lab(6,17,10)+bar(18,15,36,5,A)+lab(6,25,10)+bar(18,23,22,5,A)+lab(6,33,10)+bar(18,31,30,5,A);
      else o+=lab(6,7,16)+lab(6,17,10)+bar(18,15,38,5,G1)+lab(6,25,10)+bar(18,23,27,5,G1)+lab(6,33,10)+bar(18,31,16,5,Y);
    }else if(g==='bdir'){
      if(v==='row')o+=bar(8,9,46,6,A)+bar(8,19,32,6,A)+bar(8,29,20,6,A);
      else o+=bar(13,10,8,28,A)+bar(28,18,8,20,A)+bar(43,26,8,12,A)+'<rect x="8" y="38" width="48" height="1" fill="'+M+'"/>';
    }else if(g==='bcolor'){
      var cs=(v==='status')?[G1,G1,Y,R]:(v==='cat')?[A,P,O,T]:[A,A,A,A];
      o+=cs.map(function(c,i){return bar(8,7+i*8,[46,38,26,16][i],5,c);}).join('');
    }else if(g==='draw'){
      if(v==='own')o+='<path d="M6 32 C14 22 20 28 28 20 S44 12 58 16 V38 H6 Z" fill="'+A+'" opacity=".18"/><path d="M6 32 C14 22 20 28 28 20 S44 12 58 16" fill="none" stroke="'+A+'" stroke-width="1.8"/><circle cx="58" cy="16" r="2" fill="'+A+'"/>';
      else o+='<rect x="6" y="6" width="52" height="28" fill="#fafafa" stroke="#c8cbd0" stroke-width=".6"/>'+[12,18,24,30].map(function(y){return '<line x1="6" y1="'+y+'" x2="58" y2="'+y+'" stroke="#e1e3e6" stroke-width=".5"/>';}).join('')
        +'<polyline points="6,28 13,24 20,26 27,17 34,20 41,12 48,15 58,11" fill="none" stroke="#0f9d58" stroke-width="1"/><polyline points="6,31 13,29 20,30 27,27 34,28 41,25 48,27 58,24" fill="none" stroke="#db4437" stroke-width="1"/>'
        +'<rect x="6" y="36" width="5" height="3" fill="#0f9d58"/>'+lab(12,36.6,10)+'<rect x="26" y="36" width="5" height="3" fill="#db4437"/>'+lab(32,36.6,10);
    }
    return '<svg viewBox="0 0 64 44" width="64" height="44" aria-hidden="true">'+o+'</svg>';
  }
  /* a grid of pictures for one choice; set is called with the value, done() after (refresh) */
  function grPicGrid(g,get,set,keep,done){
    var w=h('div','presetgrid tkindgrid grpick');
    GRPICK[g].forEach(function(x){
      if(keep&&!keep(x[0]))return;
      var q=h('button','lookchip');q.type='button';q.setAttribute('data-v',x[0]);q.title=x[2];q.setAttribute('aria-label',x[1]+': '+x[2]);
      q.innerHTML=grPic(g,x[0])+'<span class="pname">'+x[1]+'</span>';
      q.addEventListener('click',function(){done(function(){set(x[0]);});});
      w.appendChild(q);
    });
    w.syncPick=function(){var cur=String(get());[].forEach.call(w.children,function(q){var on=q.getAttribute('data-v')===cur;q.classList.toggle('on',on);q.setAttribute('aria-pressed',on?'true':'false');});};
    return w;
  }
  var GRKINDS=[['sensor','Graph of a sensor'],['bars','Bars: live values or sensor states'],['sensors','Graphs of every sensor on a device, group or probe'],['toplist','Toplist of a sensor']];
  function periodTag(p){return p===0?'<#lang key="html.sensor.livwdata" default="Live Data">':'<#system type="'+(p+1)+'period">';}
  function blankGR(){
    return {type:'graph',kind:'sensor',cat:'Graphs',name:'Sensor graph',fname:'',period:0,fontSize:12,legend:true,axis:true,tooltips:false,check:true,extra:[],
      layout:'card',titleMode:'object',title:'',invert:'auto',tileW:336,tileH:175,mapTags:true,initW:520,initH:300,fit:true,fitW:520,fitH:300,draw:'own',cstyle:'area',dots:false,maxCh:3,chNames:'',bsrc:'status',bdir:'row',bcolor:'status',bmax:8,lmax:12,lw:2,fillA:28,gridOn:true,bradius:3,look:lookOf('PRTG new UI')};
  }
  function graphFromPreset(p){
    var G=blankGR();
    G.draw=(p.kind==='toplist')?'pic':'own';G.kind=p.kind;G.cat=p.cat;G.name=p.name+' custom';G.period=p.period||0;G.check=!!p.check;G.look=lookOf(p.kind==='toplist'?'PRTG default':'PRTG new UI');G.initW=(p.kind==='sensor')?520:(p.kind==='sensors'?760:0);G.initH=(p.kind==='sensor')?300:(p.kind==='sensors'?420:0);G.layout=(p.kind==='toplist')?'edge':'card';G.tooltips=true;
    if(p.kind==='sensor'){G.fontSize=p.fontSize;G.legend=!!p.legend;G.axis=!!p.axis;G.tooltips=!!p.tooltips;G.titleMode='object';}
    if(p.kind==='sensors'){G.tileW=p.tileW;G.tileH=p.tileH;G.mapTags=!!p.mapTags;G.titleMode='stock';G.layout='card';}
    if(p.kind==='toplist')G.titleMode='none';
    G.fitW=parseInt(G.initW,10)||0;G.fitH=parseInt(G.initH,10)||0;if(!hasSize(G))G.fit=false;
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
    var root='font-family:'+familyStack(L.font)+';font-size:'+fpx(L.size)+';color:'+L.text+';';
    if(L.card){
      root+='background:'+bg+';border-radius:'+L.radius+'px;';
      if(L.bw>0)root+='outline:'+L.bw+'px solid '+L.border+';outline-offset:-'+L.bw+'px;';
      var sh=shadowOf(L);if(sh)root+='box-shadow:'+sh+';';
    }
    return root;
  }
  function graphCss(G,cls){
    var L=grLook(G);if(grOwn(G))return graphOwnCss(G,cls,L);
    if(L.mode==='prtg')return '';
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
      var gb='box-sizing:border-box;height:100%;display:flex;flex-direction:column;'+(ip>0?'padding:'+ip+'px;':'')+(L.align?'text-align:'+L.align+';':'');
      c.push(r+' .gbox{'+gb+'}');
      titleRules(L,r+' .gtitle',bar).forEach(function(x){c.push(x);});
      c.push(r+' .ggraph{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;'+(bar?'margin:10px 14px;':'')+'}');
      c.push(r+' .ggraph img{display:block;max-width:100%;max-height:100%;width:100% !important;height:100% !important;object-fit:contain;'+(inv?filt:'')+'}');
    }else{
      c.push(r+' img{display:block;width:100% !important;height:100% !important;object-fit:contain;'+(inv?filt:'')+'}');
    }
    return c.join('\n');
  }
  /* ---- the graph drawn here (instead of PRTG's picture). It runs inside the map item: it asks PRTG for the sensor's history with the viewer's own session and draws a line chart; if that is refused it puts PRTG's own picture back. ---- */
  function graphRuntime(root,C){
    var NS='http://www.w3.org/2000/svg', box=root.querySelector('.gown'), wrap, svg, leg, tip, ro=null, timer=null, D=null, lastv={}, off={}, ALLS=null, lims={}, HV=null;
    if(!box)return;
    function el(n,a,p){var e=document.createElementNS(NS,n),k;for(k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
    function dv(c,p){var e=document.createElement('div');e.className=c;if(p)p.appendChild(e);return e;}
    function clear(n){while(n.firstChild)n.removeChild(n.firstChild);}
    function stop(){if(timer){clearInterval(timer);timer=null;}if(ro){try{ro.disconnect();}catch(e){}ro=null;}}
    function fall(){
      var t=root.querySelector('template.gfall');
      stop();
      if(t&&t.innerHTML){box.innerHTML=t.innerHTML;box.setAttribute('data-g','fallback');}
      else say('No data');
    }
    function say(t){clear(box);var d=dv('gmsg',box);d.textContent=t;box.setAttribute('data-g','message');}
    function p2(n){return (n<10?'0':'')+n;}
    function ds(d){return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())+'-'+p2(d.getHours())+'-'+p2(d.getMinutes())+'-'+p2(d.getSeconds());}
    function fmt(v){
      var a=Math.abs(v),s;
      if(a>=1e12)return +(v/1e12).toFixed(1)+'T';
      if(a>=1e9)return +(v/1e9).toFixed(1)+'G';
      if(a>=1e6)return +(v/1e6).toFixed(1)+'M';
      if(a>=1e4)return +(v/1e3).toFixed(1)+'k';
      if(a>=100)return String(Math.round(v));
      if(a>=1)return String(+v.toFixed(1));
      if(a===0)return '0';
      return String(+v.toFixed(2));
    }
    function nice(min,max,n){
      var span=(max-min)||1, raw=span/n, mag=Math.pow(10,Math.floor(Math.log(raw)/Math.LN10)), r=raw/mag, st=(r<1.5?1:(r<3?2:(r<7?5:10)))*mag, a=Math.floor(min/st)*st, b=Math.ceil(max/st)*st, t=[], x;
      for(x=a;x<=b+st/2;x+=st)t.push(+x.toFixed(10));
      return t;
    }
    function lin(r){return r.map(function(p,i){return (i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1);}).join('');}
    function curve(r){
      var d,i,p0,p1,p2,p3,a,b;
      if(r.length<3)return lin(r);
      d='M'+r[0][0].toFixed(1)+' '+r[0][1].toFixed(1);
      for(i=0;i<r.length-1;i++){
        p0=r[i-1]||r[i];p1=r[i];p2=r[i+1];p3=r[i+2]||p2;
        a=Math.max(Math.min(p1[1],p2[1]),Math.min(Math.max(p1[1],p2[1]),p1[1]+(p2[1]-p0[1])/6));   /* the curve never goes past its neighbours, so a smooth line cannot swing below zero */
        b=Math.max(Math.min(p1[1],p2[1]),Math.min(Math.max(p1[1],p2[1]),p2[1]-(p3[1]-p1[1])/6));
        d+='C'+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+' '+a.toFixed(1)+' '+(p2[0]-(p3[0]-p1[0])/6).toFixed(1)+' '+b.toFixed(1)+' '+p2[0].toFixed(1)+' '+p2[1].toFixed(1);
      }
      return d;
    }
    function num(v){if(typeof v==='number')return isFinite(v)?v:null;if(typeof v==='string'&&v!==''){var f=parseFloat(v.replace(/,/g,''));return isFinite(f)?f:null;}return null;}
    function sample(){
      var rows=[],i,n=C.sampleN||72,f=72/n;
      if(C.heat||C.ring){
        n=C.heat?168:96;var st=(C.heat?3600:900)*1000, end=Date.now();
        for(i=0;i<n;i++){var tt=new Date(end-(n-1-i)*st), hh=tt.getHours()+tt.getMinutes()/60, wk=(tt.getDay()===0||tt.getDay()===6)?0.45:1;
          rows.push({datetime:'Sample '+(i+1),'Traffic In':8+wk*48*Math.max(0,Math.sin((hh-6)/24*Math.PI*2))+6*Math.sin(i*1.7)*Math.sin(i/3),'Traffic Out':4+wk*18*Math.max(0,Math.sin((hh-7)/24*Math.PI*2))});}
        return rows;
      }
      if(C.band)n=Math.max(n,144);
      for(i=0;i<n;i++){var u=i*72/n, jit=C.band?Math.abs(Math.sin(i*12.9898)*43758.5453%1)*14:0;rows.push({datetime:'Sample '+(i+1),'Traffic In':38+22*Math.sin(u/7)+9*Math.sin(u/2.3)+u*0.2+jit,'Traffic Out':16+9*Math.sin(u/9+1)+4*Math.sin(u/3.1)+jit*0.4});}
      return rows;
    }
    function build(rows){
      var skip={datetime:1,coverage:1,Downtime:1,datetime_raw:1}, names=[], k, i, want=[], s=[], tot=0;
      if(!rows.length)return null;
      if((C.bars||C.combo)&&rows.length>36){   /* one bar per stretch of time, so the bars stay readable */
        var step=Math.ceil(rows.length/36), out=[];
        for(i=0;i<rows.length;i+=step){
          var grp=rows.slice(i,i+step), o={datetime:grp[0].datetime}, kk;
          for(kk in rows[0]){
            if(kk==='datetime')continue;
            var sm=0,cn=0;grp.forEach(function(r){var x=num(r[kk]);if(x!==null){sm+=x;cn++;}});
            o[kk]=cn?sm/cn:'';
          }
          out.push(o);
        }
        rows=out;
      }
      for(k in rows[0])if(!skip[k]&&k.indexOf('_raw')<0)names.push(k);
      if(C.names){C.names.split(',').forEach(function(x){x=x.replace(/^\s+|\s+$/g,'').toLowerCase();if(x)want.push(x);});}
      names.forEach(function(nm){
        var vals=rows.map(function(r){return num(r[nm]);}), any=vals.some(function(v){return v!==null;}), ok=!want.length||want.some(function(w){return nm.toLowerCase().indexOf(w)>-1;});
        if(any&&ok)s.push({name:nm,v:vals});
      });
      if(!want.length){
        s.forEach(function(q){var lo=null,hi=null;q.v.forEach(function(x){if(x===null)return;if(lo===null||x<lo)lo=x;if(hi===null||x>hi)hi=x;});q.flat=(lo===hi);});
        s=s.filter(function(q){return !q.flat;}).concat(s.filter(function(q){return q.flat;})).slice(0,C.max||3);   /* channels that actually move come first */
      }
      if(!s.length)return null;
      s.forEach(function(q){var m=0;q.v.forEach(function(x){if(x!==null&&Math.abs(x)>m)m=Math.abs(x);});q.max=m;});
      /* two scales at most, as PRTG does: the first channel and the ones of a similar size share the left axis, the rest the right axis. Without a list of names, a third scale is left out rather than drawn as a squashed line. */
      var r0=s[0].max||1, r1=0, keep=[];
      s.forEach(function(q){
        var m=q.max||1, near0=(m/r0<=20&&r0/m<=20);
        if(C.combo){q.g=(q===s[0])?0:1;keep.push(q);}
        else if(C.stack||C.stackA||C.mirror||C.band){q.g=0;keep.push(q);}
        else if(near0){q.g=0;keep.push(q);}
        else if(!r1||(m/r1<=20&&r1/m<=20)){if(!r1)r1=m;q.g=1;keep.push(q);}
        else if(want.length){q.g=1;keep.push(q);}
      });
      s=keep;
      return {rows:rows,s:s};
    }
    function ask(path,params){   /* in the designer's preview the item sits in a sandboxed frame with no PRTG session, so the tool fetches for it and sends the answer back */
      return new Promise(function(res,rej){
        var id='h'+Math.random().toString(36).slice(2);
        function on(e){var d=e.data;if(!d||d.type!=='pm-hist-r'||d.id!==id)return;window.removeEventListener('message',on);if(d.ok)res(d.json);else rej(new Error('x'));}
        window.addEventListener('message',on);
        window.top.postMessage({type:'pm-hist',id:id,path:path,params:params},'*');
        setTimeout(function(){window.removeEventListener('message',on);rej(new Error('t'));},20000);
      });
    }
    function getJ(path,params){
      var q=[],k,pre;
      if(location.protocol==='about:')return ask(path,params);
      for(k in params)q.push(k+'='+encodeURIComponent(params[k]));
      pre=/^\/api\/v1\//.test(location.pathname)?'/api/v1':'';
      return fetch(pre+path+'?'+q.join('&'),{credentials:'include',headers:{'X-Requested-With':'XMLHttpRequest'}}).then(function(r){if(!r.ok)throw new Error('http');return r.json();});
    }
    function load(){
      if(C.sample){if(C.threshold||C.needLims)lims={'Traffic In':{wh:60,eh:72,wl:null,el:null}};D=build(sample());draw();return;}
      var id=root.getAttribute('objectid'), now=new Date(), pad=14*3600000, rng=C.range*1000;
      getJ('/api/historicdata.json',{id:id,avg:C.avg,sdate:ds(new Date(now.getTime()-rng-pad)),edate:ds(new Date(now.getTime()+pad)),usecaption:1}).then(function(j){
        var rows=j&&(j.histdata||j.values), last=-1, i, n, keep;
        if(!rows)throw new Error('none');
        for(i=rows.length-1;i>=0;i--){var r=rows[i],k,has=false;for(k in r){if(k!=='datetime'&&k!=='coverage'&&r[k]!==''&&r[k]!==null){has=true;break;}}if(has){last=i;break;}}
        if(last<0){D=null;say('No data yet');return;}
        n=C.points;keep=rows.slice(Math.max(0,last-n+1),last+1);
        D=build(keep);
        if(!D){say('No data yet');return;}
        draw();
        if(C.legendValues||C.threshold||C.needLims)return getJ('/api/table.json',{content:'channels',columns:(C.threshold||C.needLims)?'name,lastvalue,info=treejson':'name,lastvalue',id:id}).then(function(t){
          if(t&&t.channels){lastv={};t.channels.forEach(function(c){
            lastv[c.name]=c.lastvalue;
            var f=c.info&&c.info.data&&c.info.data[0];
            if((C.threshold||C.needLims)&&f&&f.limitmode){var nb=function(v){return (v===''||v==null||isNaN(+v))?null:+v;};lims[c.name]={wh:nb(f.limitmaxwarning),eh:nb(f.limitmaxerror),wl:nb(f.limitminwarning),el:nb(f.limitminerror)};}
          });draw();}
        }).catch(function(){});
      }).catch(function(){fall();});
    }
    function stCol(tl,v,base){if(!tl||v===null)return base;if((tl.eh!==null&&v>=tl.eh)||(tl.el!==null&&v<=tl.el))return C.down;if((tl.wh!==null&&v>=tl.wh)||(tl.wl!==null&&v<=tl.wl))return C.warn;return base;}
    function mixc(a,b,t){var x=String(a).replace('#',''),y=String(b).replace('#',''),o='#',i,v;if(x.length!==6||y.length!==6)return b;for(i=0;i<6;i+=2){v=Math.round(parseInt(x.substr(i,2),16)*(1-t)+parseInt(y.substr(i,2),16)*t);o+=(v<16?'0':'')+v.toString(16);}return o;}
    function stepd(r){return r.map(function(p,i){return i?('H'+p[0].toFixed(1)+'V'+p[1].toFixed(1)):('M'+p[0].toFixed(1)+' '+p[1].toFixed(1));}).join('');}
    function shp(r){return C.step?stepd(r):(C.smooth?curve(r):lin(r));}
    function limOf(nm){var k;if(lims[nm])return lims[nm];for(k in lims){if(nm.indexOf(k+' (')===0)return lims[k];}return null;}
    function draw(){
      if(!D)return;
      var all=D.s, vis=all.filter(function(q){return !off[q.name];});
      all.forEach(function(q,i){q.col0=C.colors[i%C.colors.length];});
      ALLS=all;
      function cp(q){var o={},k;for(k in q)o[k]=q[k];return o;}
      if(C.mirror)vis=vis.slice(0,2).map(function(q,i){if(i!==1)return q;var o=cp(q);o.raw=q.v;o.v=q.v.map(function(x){return x===null?null:-Math.abs(x);});o.g=0;return o;});
      else if(C.band&&D.rows.length>20){
        var kb=Math.max(2,Math.round(D.rows.length/40)), rows2=[], j0;
        for(j0=0;j0<D.rows.length;j0+=kb)rows2.push(D.rows[j0]);
        vis=vis.map(function(q){var o=cp(q),mv=[],lo=[],hi=[],j,k;
          for(j=0;j<D.rows.length;j+=kb){var sm=0,cn=0,mn=null,mx=null;for(k=j;k<Math.min(D.rows.length,j+kb);k++){var x=q.v[k];if(x===null)continue;sm+=x;cn++;if(mn===null||x<mn)mn=x;if(mx===null||x>mx)mx=x;}mv.push(cn?sm/cn:null);lo.push(mn);hi.push(mx);}
          o.v=mv;o.lo=lo;o.hi=hi;return o;});
        var rows0=D.rows;D.rows=rows2;D.s=vis;
        try{drawInner();}finally{D.s=all;D.rows=rows0;}
        return;
      }
      else if(C.stackA){var acc=[];vis=vis.map(function(q){var o=cp(q);o.raw=q.v;o.g=0;o.v=q.v.map(function(x,j){var b=acc[j]||0, t=b+(x===null?0:Math.max(0,x));acc[j]=t;return (x===null&&!b)?null:t;});return o;}).reverse();}
      D.s=vis;
      try{drawInner();}finally{D.s=all;}
    }
    function special(W,H){
      var q=D.s[0], col=q.col0||C.colors[0], n=q.v.length, i, cur=null, first=null, lo=null, hi=null, tl=limOf(q.name);
      for(i=0;i<n;i++){var x=q.v[i];if(x===null)continue;if(first===null)first=x;cur=x;if(lo===null||x<lo)lo=x;if(hi===null||x>hi)hi=x;}
      if(cur===null)return;
      function tx(x,y,t,a){var e=el('text',a||{},svg);e.setAttribute('x',x);e.setAttribute('y',y);e.textContent=t;return e;}
      function ttl(e,t){var tt=el('title',{},e);tt.textContent=t;}
      if(C.spark){
        var big=lastv[q.name]!=null?String(lastv[q.name]).replace(/<[^>]*>/g,''):fmt(cur), fs=Math.max(14,Math.min(H*0.3,W/(0.6*Math.max(3,big.length)))), d=cur-first;
        tx(12,12+fs*0.85,big,{fill:C.text,'font-size':fs.toFixed(1),'font-weight':600});
        tx(13,12+fs*0.85+16,q.name+' \u00B7 '+(['last 2 hours','last 2 days','last 30 days','last 365 days'][C.period]||''),{fill:C.muted,'font-size':11});
        if(first!==null&&d!==0)tx(W-12,12+fs*0.45,(d>0?'\u25B2 ':'\u25BC ')+fmt(Math.abs(d)),{fill:stCol(tl,cur,C.muted),'font-size':12,'text-anchor':'end'});
        var top=Math.min(H-24,12+fs*0.85+26), bot=H-6, pts=[], span=(hi-lo)||1;
        for(i=0;i<n;i++)if(q.v[i]!==null)pts.push([8+(W-16)*i/Math.max(1,n-1),bot-(bot-top)*(q.v[i]-lo)/span]);
        if(pts.length){var ln=lin(pts);el('path',{d:ln+'L'+pts[pts.length-1][0].toFixed(1)+' '+bot+'L'+pts[0][0].toFixed(1)+' '+bot+'Z',fill:col,'fill-opacity':0.14},svg);el('path',{d:ln,fill:'none',stroke:col,'stroke-width':C.lw,'stroke-linejoin':'round'},svg);var lp2=pts[pts.length-1];el('circle',{cx:lp2[0],cy:lp2[1],r:3,fill:stCol(tl,cur,col)},svg);}
        return;
      }
      var stp=(C.avg||(C.heat?3600:900))*1000, end=Date.now(), DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      function tAt(k){return new Date(end-(n-1-k)*stp);}   /* the steps are regular, the last one is the latest */
      if(C.heat){
        var sm=[],cn=[],d1,h1,k;for(d1=0;d1<7;d1++){sm.push([]);cn.push([]);for(h1=0;h1<24;h1++){sm[d1].push(0);cn[d1].push(0);}}
        for(k=0;k<n;k++){var v=q.v[k];if(v===null)continue;var t=tAt(k),dd=(t.getDay()+6)%7,hh=t.getHours();sm[dd][hh]+=v;cn[dd][hh]++;}
        var mn=null,mx2=null;for(d1=0;d1<7;d1++)for(h1=0;h1<24;h1++)if(cn[d1][h1]){var a1=sm[d1][h1]/cn[d1][h1];if(mn===null||a1<mn)mn=a1;if(mx2===null||a1>mx2)mx2=a1;}
        var lw=30, bh=14, cw=(W-lw-4)/24, ch=(H-bh-4)/7, sp=(mx2-mn)||1;
        for(d1=0;d1<7;d1++){
          tx(lw-5,4+d1*ch+ch/2+3.5,DAYS[d1],{fill:C.muted,'font-size':Math.min(10,ch*0.8),'text-anchor':'end'});
          for(h1=0;h1<24;h1++){
            var has=cn[d1][h1]>0, av=has?sm[d1][h1]/cn[d1][h1]:null, f=has?(av-mn)/sp:0;
            var cell=el('rect',{x:(lw+h1*cw).toFixed(1),y:(4+d1*ch).toFixed(1),width:Math.max(1,cw-1.5).toFixed(1),height:Math.max(1,ch-1.5).toFixed(1),rx:Math.min(3,cw/4),fill:has?(tl?stCol(tl,av,mixc(C.card,col,0.15+0.85*f)):mixc(C.card,col,0.12+0.88*f)):mixc(C.card,C.muted,0.08)},svg);
            ttl(cell,DAYS[d1]+' '+h1+':00 \u2013 '+(has?fmt(av):'no data'));
          }
        }
        for(h1=0;h1<24;h1+=6)tx(lw+h1*cw,H-3,h1+':00',{fill:C.muted,'font-size':10});
        return;
      }
      if(C.ring){
        var cx=W/2, cy=H/2, Rr=Math.max(20,Math.min(W,H)/2-16), r0=Rr*0.46, span2=(hi-Math.min(0,lo))||1, base0=Math.min(0,lo), wa=Math.PI*2*stp/86400000*0.86;
        el('circle',{cx:cx,cy:cy,r:r0,fill:'none',stroke:C.grid},svg);el('circle',{cx:cx,cy:cy,r:Rr,fill:'none',stroke:C.grid,'stroke-dasharray':'2 4'},svg);
        for(k=0;k<n;k++){
          var v2=q.v[k];if(v2===null)continue;
          var t2=tAt(k), fr=(t2.getHours()+t2.getMinutes()/60)/24, a0=fr*Math.PI*2-Math.PI/2, a2=a0+wa, rr2=r0+(Rr-r0)*Math.max(0.04,(v2-base0)/span2);
          var P0=[cx+r0*Math.cos(a0),cy+r0*Math.sin(a0)],P1=[cx+rr2*Math.cos(a0),cy+rr2*Math.sin(a0)],P2=[cx+rr2*Math.cos(a2),cy+rr2*Math.sin(a2)],P3=[cx+r0*Math.cos(a2),cy+r0*Math.sin(a2)];
          var wd=el('path',{d:'M'+P0.map(function(z){return z.toFixed(1);}).join(' ')+'L'+P1.map(function(z){return z.toFixed(1);}).join(' ')+'L'+P2.map(function(z){return z.toFixed(1);}).join(' ')+'L'+P3.map(function(z){return z.toFixed(1);}).join(' ')+'Z',fill:stCol(tl,v2,col),'fill-opacity':(k>=n-4)?1:0.85},svg);
          ttl(wd,t2.getHours()+':'+(t2.getMinutes()<10?'0':'')+t2.getMinutes()+' \u2013 '+fmt(v2));
        }
        [['0',0],['6',0.25],['12',0.5],['18',0.75]].forEach(function(z){var a3=z[1]*Math.PI*2-Math.PI/2;tx(cx+(Rr+9)*Math.cos(a3),cy+(Rr+9)*Math.sin(a3)+3.5,z[0],{fill:C.muted,'font-size':10,'text-anchor':'middle'});});
        tx(cx,cy+2,fmt(cur),{fill:C.text,'font-size':Math.max(11,Math.min(22,r0*0.55)).toFixed(1),'font-weight':600,'text-anchor':'middle'});
        tx(cx,cy+Math.max(11,Math.min(22,r0*0.55))*0.75+4,'24 h',{fill:C.muted,'font-size':10,'text-anchor':'middle'});
      }
    }
    function drawInner(){
      var W,H,pl,pr=10,pt=8,pb,iw,ih,min,max,i,j,t,ticks,gx,xs,s,path,area,defs,gid,hx,hit,dots,guide,w0,pts,glowId=null;
      if(!D)return;
      if(box.getAttribute('data-g')!=='ok'){clear(box);wrap=dv('gwrap',box);svg=el('svg',{'class':'gsvg',preserveAspectRatio:'none'});wrap.appendChild(svg);tip=dv('gtip',wrap);tip.style.display='none';leg=dv('glegend',box);box.setAttribute('data-g','ok');}
      var KK=(C.flex&&root.clientWidth&&root.clientHeight)?Math.max(0.2,Math.min(6,Math.min(root.clientWidth/C.flex.w,root.clientHeight/C.flex.h))):1;   /* Flexible: the drawing grows with the object */
      W=Math.max(60,wrap.clientWidth/KK);H=Math.max(50,wrap.clientHeight/KK);
      svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.setAttribute('width',W*KK);svg.setAttribute('height',H*KK);clear(svg);
      if((C.spark||C.heat||C.ring)&&D.s.length){special(W,H);legend();return;}
      pl=C.axis?44:10;pb=C.axis?22:8;iw=W-pl-pr;ih=H-pt-pb;
      var has1=D.s.some(function(q){return q.g===1;}), max1=0, tk1=[], min1=0, ns, st1, rw1, mg1;
      if(has1)pr=44;iw=W-pl-pr;
      min=0;max=0;
      D.s.forEach(function(q){if(q.g===1){q.v.forEach(function(x){if(x!==null&&x>max1)max1=x;});}else{q.v.forEach(function(x){if(x===null)return;if(x>max)max=x;if(x<min)min=x;});if(q.hi)q.hi.forEach(function(x,k){if(x!==null&&x>max)max=x;var y=q.lo[k];if(y!==null&&y<min)min=y;});}});
      if(C.stack){max=0;D.rows.forEach(function(r0,ri){var t0=0;D.s.forEach(function(q){var x=q.v[ri];if(x!==null&&x>0)t0+=x;});if(t0>max)max=t0;});}
      if(max<=min)max=min+1;
      if(C.mirror){var m2=Math.max(Math.abs(min),Math.abs(max));min=-m2;max=m2;}
      ticks=nice(min,max,Math.max(2,Math.min(5,Math.floor(ih/38))));min=ticks[0];max=ticks[ticks.length-1];
      if(has1){
        ns=ticks.length-1;if(max1<=0)max1=1;rw1=max1/ns;mg1=Math.pow(10,Math.floor(Math.log(rw1)/Math.LN10));rw1/=mg1;st1=(rw1<=1?1:(rw1<=2?2:(rw1<=2.5?2.5:(rw1<=5?5:10))))*mg1;
        for(i=0;i<=ns;i++)tk1.push(+(i*st1).toFixed(10));max1=st1*ns;
      }
      function X(i2){if(C.bars||C.combo)return pl+iw/D.rows.length*(i2+0.5);return pl+(D.rows.length>1?i2*iw/(D.rows.length-1):iw/2);}
      function Y(y,g){return g===1?(pt+ih-(y-min1)/(max1-min1)*ih):(pt+ih-(y-min)/(max-min)*ih);}
      function V(q,x){return Y(x,q.g);}
      defs=el('defs',{},svg);
      ticks.forEach(function(tv){
        var y=Y(tv);
        if(C.gridOn!==false||tv===0)el('line',{x1:pl,x2:W-pr,y1:y,y2:y,stroke:C.grid,'stroke-width':1,'stroke-dasharray':tv===0?'':'3 4'},svg);
        if(C.axis){var tx=el('text',{x:pl-8,y:y+4,'text-anchor':'end',fill:C.muted,'font-size':11},svg);tx.textContent=fmt(C.mirror?Math.abs(tv):tv);}
      });
      if(C.axis&&has1){
        var c1=D.s.filter(function(q){return q.g===1;})[0].col||C.colors[1];
        tk1.forEach(function(tv,ti){var t1=el('text',{x:W-pr+8,y:Y(tv,1)+4,'text-anchor':'start',fill:C.muted,'font-size':11},svg);t1.textContent=fmt(tv);});
      }
      if(C.axis){
        var cnt=Math.max(2,Math.min(5,Math.floor(iw/90)));
        for(i=0;i<cnt;i++){
          j=Math.round(i*(D.rows.length-1)/(cnt-1));
          var lab=String(D.rows[j].datetime||'').split(' - ')[0].replace(/^\d+\/\d+\/\d+\s+/,'').replace(/:\d\d(\s*[AP]M)?$/,'$1').replace(/:00(\s*[AP]M)/,'$1');
          if(C.period>=2)lab=String(D.rows[j].datetime||'').split(' - ')[0].replace(/\s+.*$/,'').replace(/\/\d{4}$/,'');
          var xt=el('text',{x:X(j),y:H-5,'text-anchor':i===0?'start':(i===cnt-1?'end':'middle'),fill:C.muted,'font-size':11},svg);xt.textContent=lab;
        }
      }
      var base=[];
      D.s.forEach(function(q,si){
        var col=q.col0||C.colors[si%C.colors.length], seg='', first=null, lastx=null, runs=[], cur0=null;
        q.col=col;
        if(C.bars||(C.combo&&si===0)){
          var nb=D.rows.length, slot=iw/nb, bw=(C.stack||C.combo)?Math.max(2,slot*0.72):Math.max(2,slot*0.76/D.s.length);
          q.v.forEach(function(x,k2){
            if(x===null)return;
            var cx=pl+slot*(k2+0.5), x0=(C.stack||C.combo)?cx-bw/2:cx-slot*0.38+bw*si, y0, y1, b0;
            if(C.stack){b0=base[k2]||0;y0=Y(b0);y1=Y(b0+Math.max(0,x));base[k2]=b0+Math.max(0,x);}else{y0=Y(0,q.g);y1=Y(x,q.g);}
            el('rect',{x:x0.toFixed(1),y:Math.min(y0,y1).toFixed(1),width:Math.max(1,bw-(bw>6?1.5:0)).toFixed(1),height:Math.max(1,Math.abs(y0-y1)).toFixed(1),rx:Math.min(C.br==null?3:C.br,bw/3),fill:col,'fill-opacity':C.combo?0.6:1},svg);
          });
          return;
        }
        if(C.dotsOnly){var tlD=limOf(q.name);q.v.forEach(function(x,k2){if(x===null)return;el('circle',{cx:X(k2).toFixed(1),cy:Y(x,q.g).toFixed(1),r:D.rows.length>150?2:3,fill:stCol(tlD,x,col),'fill-opacity':0.9},svg);});return;}
        q.v.forEach(function(x,k2){
          if(x===null){cur0=null;return;}
          var pt=[X(k2),Y(x,q.g)];
          if(!cur0){cur0=[];runs.push(cur0);}
          cur0.push(pt);
          if(first===null)first=pt[0];lastx=pt[0];
        });
        seg=runs.map(shp).join('');
        if(q.lo){   /* min / max band */
          var bd='',bu=[],bl=[];q.v.forEach(function(x,k2){if(q.hi[k2]===null)return;bu.push([X(k2),Y(q.hi[k2],q.g)]);bl.unshift([X(k2),Y(q.lo[k2],q.g)]);});
          if(bu.length)el('path',{d:lin(bu)+bl.map(function(p){return 'L'+p[0].toFixed(1)+' '+p[1].toFixed(1);}).join('')+'Z',fill:col,'fill-opacity':0.18,stroke:'none'},svg);
        }
        if(!seg)return;
        /* threshold colours: the line and its fill turn yellow and red past the channel's own limits (a hard-edged vertical gradient) */
        var paint=col, tl=C.threshold?limOf(q.name):null;
        if(tl){
          var tid='gt'+si+'_'+Math.floor(Math.random()*1e6), tg=el('linearGradient',{id:tid,gradientUnits:'userSpaceOnUse',x1:0,x2:0,y1:pt,y2:pt+ih},defs);
          var lo=(q.g===1?min1:min), hi=(q.g===1?max1:max), cut=[tl.eh,tl.wh,tl.wl,tl.el].filter(function(v){return v!==null&&v>lo&&v<hi;}).sort(function(a2,b2){return b2-a2;});
          var cAt=function(v){if((tl.eh!==null&&v>=tl.eh)||(tl.el!==null&&v<=tl.el))return C.down;if((tl.wh!==null&&v>=tl.wh)||(tl.wl!==null&&v<=tl.wl))return C.warn;return col;};
          var edges=[hi].concat(cut).concat([lo]), ofs=function(v){return Math.max(0,Math.min(1,(Y(v,q.g)-pt)/ih));};
          for(var e2=0;e2<edges.length-1;e2++){var cc=cAt((edges[e2]+edges[e2+1])/2);el('stop',{offset:ofs(edges[e2]),'stop-color':cc},tg);el('stop',{offset:ofs(edges[e2+1]),'stop-color':cc},tg);}
          paint='url(#'+tid+')';
          if(si===0)cut.forEach(function(v){var yy=Y(v,q.g);el('line',{x1:pl,x2:W-pr,y1:yy,y2:yy,stroke:cAt(v),'stroke-width':1.6,'stroke-dasharray':'6 4'},svg);});
        }
        if(C.area&&(C.fillAll||si===0||D.s.length<3)){
          var ar='', yb=Y(Math.max(min,0)).toFixed(1);
          runs.forEach(function(r){ar+=shp(r)+'L'+r[r.length-1][0].toFixed(1)+' '+yb+'L'+r[0][0].toFixed(1)+' '+yb+'Z';});
          if(C.solid)el('path',{d:ar,fill:col,'fill-opacity':C.sfo,stroke:'none'},svg);
          else if(tl)el('path',{d:ar,fill:paint,'fill-opacity':Math.max(0.12,C.fa*0.8),stroke:'none'},svg);
          else{
            gid='ga'+si+'_'+Math.floor(Math.random()*1e6);
            var lg=el('linearGradient',{id:gid,x1:0,y1:0,x2:0,y2:1},defs), fo=C.glow?Math.min(0.7,Math.max(0.35,C.fa*1.8)):(si===0?C.fa:C.fa*0.43);
            el('stop',{offset:'0%','stop-color':col,'stop-opacity':fo},lg);el('stop',{offset:'100%','stop-color':col,'stop-opacity':0},lg);
            el('path',{d:ar,fill:'url(#'+gid+')',stroke:'none'},svg);
          }
        }
        if(C.glow&&!glowId){glowId='gg'+Math.floor(Math.random()*1e6);var gf=el('filter',{id:glowId,x:'-10%',y:'-30%',width:'120%',height:'160%'},defs);el('feGaussianBlur',{'in':'SourceGraphic',stdDeviation:2.6,result:'b'},gf);var gm=el('feMerge',{},gf);el('feMergeNode',{'in':'b'},gm);el('feMergeNode',{'in':'SourceGraphic'},gm);}
        var lp={d:seg,fill:'none',stroke:paint,'stroke-width':C.solid?Math.max(1,C.lw*0.65):C.lw,'stroke-linejoin':'round','stroke-linecap':'round'};
        if(C.glow)lp.filter='url(#'+glowId+')';
        el('path',lp,svg);
        if(C.dots&&D.rows.length<=40)runs.forEach(function(r){r.forEach(function(p){el('circle',{cx:p[0],cy:p[1],r:3,fill:C.card,stroke:col,'stroke-width':2},svg);});});
        var li=q.v.length-1;while(li>=0&&q.v[li]===null)li--;
        if(li>=0&&!C.stackA){var ly=Y(q.v[li],q.g), ld={cx:X(li),cy:ly,r:3,fill:col};if(C.glow)ld.filter='url(#'+glowId+')';el('circle',{cx:X(li),cy:ly,r:6,fill:col,'fill-opacity':0.18},svg);el('circle',ld,svg);}
      });
      HV={X:X,Y:Y};
      legend();
      if(C.tips)hover();
    }
    function legend(){
      clear(leg);
      (ALLS||D.s).forEach(function(q){
        var it=dv('gli'+(off[q.name]?' goff':''),leg), sw=dv('gsw',it), nm=dv('gnm',it), vl=dv('gvl',it), cur=null, k3;
        sw.style.background=q.col0||q.col;nm.textContent=q.name;
        if((ALLS||D.s).length>1){
          it.style.cursor='pointer';it.title=off[q.name]?'Show this channel':'Hide this channel';
          it.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();var shown=(ALLS||[]).filter(function(x){return !off[x.name];}).length;if(!off[q.name]&&shown<=1)return;off[q.name]=!off[q.name];draw();});
        }
        for(k3=q.v.length-1;k3>=0;k3--)if(q.v[k3]!==null){cur=q.v[k3];break;}
        vl.textContent=lastv[q.name]!=null?String(lastv[q.name]).replace(/<[^>]*>/g,''):(cur===null?'':fmt(cur));
      });
      if(C.legend===false)leg.style.display='none';
    }
    function hover(){
      var W=parseFloat(svg.getAttribute('width')), H=parseFloat(svg.getAttribute('height')), pl=C.axis?44:10, pr=D.s.some(function(q){return q.g===1;})?44:10, pt=8, pb=C.axis?22:8, iw=W-pl-pr, ih=H-pt-pb, guide, dots, hit;
      var X=HV.X, Y=HV.Y, SS=D.s, RW=D.rows;   /* what was drawn, kept for the mouse: the full list is put back after drawing */
      {
        guide=el('line',{y1:pt,y2:pt+ih,stroke:C.muted,'stroke-width':1,'stroke-opacity':0.5,visibility:'hidden'},svg);
        dots=SS.map(function(q){return el('circle',{r:C.bars?0:4,fill:q.col,stroke:C.card,'stroke-width':2,visibility:'hidden'},svg);});
        hit=el('rect',{x:pl,y:pt,width:iw,height:ih,fill:'transparent'},svg);
        hit.addEventListener('mousemove',function(e){
          var r=svg.getBoundingClientRect(), mxp=(e.clientX-r.left)*(W/r.width), k4=Math.max(0,Math.min(RW.length-1,(C.bars||C.combo)?Math.floor((mxp-pl)/iw*RW.length):Math.round((mxp-pl)/iw*(RW.length-1)))), html='<b>'+String(RW[k4].datetime||'').split(' - ')[0]+'</b>', any=false;
          guide.setAttribute('x1',X(k4));guide.setAttribute('x2',X(k4));guide.setAttribute('visibility','visible');
          SS.forEach(function(q,qi){
            var x=q.v[k4];
            if(x===null){dots[qi].setAttribute('visibility','hidden');return;}
            any=true;dots[qi].setAttribute('cx',X(k4));dots[qi].setAttribute('cy',Y(x,q.g));dots[qi].setAttribute('visibility','visible');
            html+='<div><i style="background:'+q.col+'"></i>'+q.name.replace(/</g,'&lt;')+' <b>'+fmt(q.raw?q.raw[k4]:x)+'</b></div>';
          });
          if(!any){tip.style.display='none';return;}
          tip.innerHTML=html;tip.style.display='block';
          var tw=tip.offsetWidth, tl=X(k4)+12;if(tl+tw>W)tl=X(k4)-tw-12;
          tip.style.left=Math.max(0,tl)+'px';tip.style.top=(pt+6)+'px';
        });
        hit.addEventListener('mouseleave',function(){guide.setAttribute('visibility','hidden');dots.forEach(function(d){d.setAttribute('visibility','hidden');});tip.style.display='none';});
      }
    }
    box.setAttribute('data-g','loading');
    if(typeof ResizeObserver!=='undefined'){
      ro=new ResizeObserver(function(){if(!document.body.contains(box)){stop();return;}if(D&&box.getAttribute('data-g')==='ok')draw();});
      ro.observe(box);
    }
    load();
    if(!C.sample&&C.refresh>0)timer=setInterval(function(){if(!document.body.contains(box)){stop();return;}load();},C.refresh*1000);
  }
  function grCfg(G,L){var c=graphConfig(G,L);if(TYPE==='graph'&&isFlex(G))c.flex=flexNorm(G);return c;}
  function graphConfig(G,L){
    var P=donutPalette(L), per=G.period||0, spec=[{range:7200,avg:0,points:120,refresh:60},{range:172800,avg:300,points:576,refresh:300},{range:2592000,avg:3600,points:720,refresh:900},{range:31536000,avg:86400,points:365,refresh:3600}][per]||{range:7200,avg:0,points:120,refresh:60},
        cardBg=(L.card===false)?'#FFFFFF':L.cardBg, acc=(L.accent&&L.accent!==LOOKBASE.accent)?L.accent:((L.link&&L.link!==LOOKBASE.link)?L.link:(L.accent||'#4F8FC9'));
    if(G.cstyle==='heatmap')spec=(per>=2)?{range:2592000,avg:3600,points:720,refresh:900}:{range:604800,avg:3600,points:168,refresh:900};
    else if(G.cstyle==='ring')spec={range:86400,avg:900,points:96,refresh:300};
    var cs=G.cstyle;
    return {range:spec.range,avg:spec.avg,points:spec.points,refresh:spec.refresh,period:per,text:L.text,step:cs==='step',spark:cs==='spark',combo:cs==='combo',heat:cs==='heatmap',band:cs==='band',dotsOnly:cs==='dots',ring:cs==='ring',needLims:(cs==='dots'||cs==='ring'||cs==='heatmap'||cs==='spark'),axis:!!G.axis,legend:!!G.legend,tips:!(G.cstyle==='spark'||G.cstyle==='heatmap'||G.cstyle==='ring'),area:(G.cstyle==null||G.cstyle==='area'||G.cstyle==='smooth'||G.cstyle==='step'||G.cstyle==='overlap'||G.cstyle==='stackarea'||G.cstyle==='mirror'||G.cstyle==='threshold'||G.cstyle==='glow'),smooth:(G.cstyle==='smooth'||G.cstyle==='glow'),fillAll:(G.cstyle==='overlap'||G.cstyle==='stackarea'||G.cstyle==='mirror'),solid:(G.cstyle==='overlap'||G.cstyle==='stackarea'||G.cstyle==='mirror'),sfo:(G.cstyle==='stackarea'?0.88:(G.cstyle==='mirror'?0.62:0.5)),stackA:(G.cstyle==='stackarea'),mirror:(G.cstyle==='mirror'),threshold:(G.cstyle==='threshold'),glow:(G.cstyle==='glow'),warn:P.warning,down:P.down,bars:(G.cstyle==='bars'||G.cstyle==='stacked'),stack:(G.cstyle==='stacked'),dots:!!G.dots,lw:Math.max(1,Math.min(6,parseFloat(G.lw)||2)),fa:Math.max(0,Math.min(80,G.fillA==null?28:parseFloat(G.fillA)||0))/100,gridOn:G.gridOn!==false,br:Math.max(0,Math.min(12,G.bradius==null?3:parseFloat(G.bradius)||0)),max:Math.max(1,parseInt(G.maxCh,10)||3),names:clean(G.chNames||''),legendValues:true,
      grid:blend(cardBg.charAt(0)==='#'?cardBg:'#FFFFFF',L.text,0.16),muted:(L.muted||L.headColor||blend(cardBg.charAt(0)==='#'?cardBg:'#FFFFFF',L.text,0.6)),card:cardBg.charAt(0)==='#'?cardBg:'#FFFFFF',
      colors:(function(){var cs0=(window.PMSSETS&&window.PMSSETS.cur)?csetGet(window.PMSSETS.cur):null;   /* a chosen colour set colours the series and bars too */
        return cs0?[cs0.paused,cs0.up,cs0.warning,cs0.unusual,cs0.down,cs0.unknown]:grColors(acc,[P.warning,'#8B5CF6','#EC4899',P.up,'#06B6D4']);})()};
  }
  function grColors(first,more){
    var out=[first];
    function rgb(h){h=String(h).replace('#','');return [parseInt(h.substr(0,2),16)||0,parseInt(h.substr(2,2),16)||0,parseInt(h.substr(4,2),16)||0];}
    more.forEach(function(c){
      var a=rgb(c), ok=out.every(function(o){var b=rgb(o);return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])>150;});
      if(ok)out.push(c);
    });
    return out;
  }
  function graphScript(G,L){
    return '(function(){\n  var root=document.getElementById("<@itemid>");\n  if(!root)return;\n  var CFG='+JSON.stringify(grCfg(G,L))+';\n  ('+graphRuntime.toString()+')(root,CFG);\n})();';
  }
  /* ---- Graphs of every sensor on a device, group or probe, drawn by the tool: one small chart per sensor, with the same engine as the single graph ---- */
  function listRuntime(root,C,draw){
    var box=root.querySelector('.gown'), tags='<@tagfilterstring>';
    if(!box)return;
    function dv(c,p,t){var e=document.createElement('div');e.className=c;if(t!=null)e.textContent=t;if(p)p.appendChild(e);return e;}
    function clear(n){while(n.firstChild)n.removeChild(n.firstChild);}
    function say(t){clear(box);dv('gmsg',box,t);box.setAttribute('data-g','message');}
    function strip(t){return String(t==null?'':t).replace(/<[^>]*>/g,'').replace(/^\s+|\s+$/g,'');}
    function ask(path,params){
      return new Promise(function(res,rej){
        var id='h'+Math.random().toString(36).slice(2);
        function on(e){var d=e.data;if(!d||d.type!=='pm-hist-r'||d.id!==id)return;window.removeEventListener('message',on);if(d.ok)res(d.json);else rej(new Error('x'));}
        window.addEventListener('message',on);
        window.top.postMessage({type:'pm-hist',id:id,path:path,params:params},'*');
        setTimeout(function(){window.removeEventListener('message',on);rej(new Error('t'));},20000);
      });
    }
    function getJ(path,params){
      var q=[],k,pre;
      if(location.protocol==='about:')return ask(path,params);
      for(k in params)q.push(k+'='+encodeURIComponent(params[k]));
      pre=/^\/api\/v1\//.test(location.pathname)?'/api/v1':'';
      return fetch(pre+path+'?'+q.join('&'),{credentials:'include',headers:{'X-Requested-With':'XMLHttpRequest'}}).then(function(r){if(!r.ok)throw new Error('http');return r.json();});
    }
    function show(list){
      var wrap;
      if(!list.length){say('No sensors here');return;}
      clear(box);box.setAttribute('data-g','ok');
      wrap=dv('gtiles',box);
      list.forEach(function(s){
        var t=dv('gtile',wrap), g, cfg={}, k;
        dv('gtname',t,s.name).title=s.name;
        g=dv('gown',dv('gtchart',t));
        t.style.width=C.tw+'px';t.style.height=C.th+'px';
        t.setAttribute('objectid',s.id);
        for(k in C)cfg[k]=C[k];
        try{draw(t,cfg);}catch(e){}
      });
    }
    function load(){
      var p;
      if(C.sample){show([{id:1,name:'Ping'},{id:2,name:'HTTP'},{id:3,name:'SNMP Traffic'},{id:4,name:'CPU Load'}].slice(0,C.lmax));return;}
      p={content:'sensors',columns:'objid,sensor,priority',count:C.lmax,id:root.getAttribute('objectid'),sortby:'priority'};
      if(C.tags&&tags&&tags.indexOf('<@')<0)p.filter_tags=tags;
      getJ('/api/table.json',p).then(function(j){
        var l=[];((j&&j.sensors)||[]).forEach(function(r){l.push({id:r.objid,name:strip(r.sensor)});});
        show(l);
      }).catch(function(){say('No data');});
    }
    box.setAttribute('data-g','loading');
    load();
  }
  function listConfig(G,L){
    var c=graphConfig(G,L);
    c.tw=Math.max(100,Math.min(1200,parseInt(G.tileW,10)||336));
    c.th=Math.max(60,Math.min(800,parseInt(G.tileH,10)||175));
    c.lmax=Math.max(1,Math.min(60,parseInt(G.lmax,10)||12));
    c.tags=!!G.mapTags;
    return c;
  }
  function listScript(G,L){
    return '(function(){\n  var root=document.getElementById("<@itemid>");\n  if(!root)return;\n  var CFG='+JSON.stringify(listConfig(G,L))+';\n  ('+listRuntime.toString()+')(root,CFG,'+graphRuntime.toString()+');\n})();';
  }
  function buildGraphList(G,cls,css,L){
    var o=[], init=initAttr(G), per=periodTag(G.period), gt=graphTitleHtml(G,'Graphs of <#objectproperty name="Name" id="<@objectid>"> ('+per+')');
    o.push('<!'+'--'+clean(G.cat||'Graphs')+': '+clean(G.name||'Graphs of sensors')+'-->');
    o.push('');
    o.push('<div class="map_object map_graph '+cls+'" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+init+' style="overflow:auto;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('<#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('<#mapobject type="htmlbefore" subid="<@subid>">');
    o.push('<#checkobjecttype objecttype="sensor,device,group,probenode" nicemessage="true" id="<@objectid>">');
    if(needsFontLink(L))o.push(fontLinkOf(L));
    o.push('<style>');o.push(css);o.push('</style>');
    o.push('');
    o.push('  <div class="gbox">');
    if(gt)o.push('    <div class="gtitle">'+gt+'</div>');
    o.push('    <div class="ggraph">');
    o.push('      <div class="gown" data-g="loading"></div>');
    o.push('    </div>');
    o.push('  </div>');
    o.push('<#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    o.push('');
    o.push('<scr'+'ipt>');o.push(listScript(G,L));o.push('<\/script>');
    return o.join('\n')+'\n';
  }
  /* ---- the Bars kind: bars of live values, or the share of sensors in each state. Runs in the item, with the viewer's own PRTG login. ---- */
  function barsRuntime(root,C){
    var box=root.querySelector('.gown'), timer=null, data=null, SN={up:'Up',warning:'Warning',down:'Down',unusual:'Unusual',paused:'Paused',unknown:'Unknown'}, KEYS=['up','warning','down','unusual','paused','unknown'];
    if(!box)return;
    function dv(c,p,t){var e=document.createElement('div');e.className=c;if(t!=null)e.textContent=t;if(p)p.appendChild(e);return e;}
    function clear(n){while(n.firstChild)n.removeChild(n.firstChild);}
    function say(t){clear(box);dv('gmsg',box,t);box.setAttribute('data-g','message');}
    function num(v){if(typeof v==='number')return isFinite(v)?v:null;if(typeof v==='string'&&v!==''){var f=parseFloat(v.replace(/,/g,''));return isFinite(f)?f:null;}return null;}
    function strip(t){return String(t==null?'':t).replace(/<[^>]*>/g,'').replace(/^\s+|\s+$/g,'');}
    function stKey(c){c=parseInt(c,10);return c===3?'up':(c===4?'warning':((c===5||c===13||c===14)?'down':(c===10?'unusual':(((c>=7&&c<=9)||c===11||c===12)?'paused':'unknown'))));}
    function ask(path,params){
      return new Promise(function(res,rej){
        var id='h'+Math.random().toString(36).slice(2);
        function on(e){var d=e.data;if(!d||d.type!=='pm-hist-r'||d.id!==id)return;window.removeEventListener('message',on);if(d.ok)res(d.json);else rej(new Error('x'));}
        window.addEventListener('message',on);
        window.top.postMessage({type:'pm-hist',id:id,path:path,params:params},'*');
        setTimeout(function(){window.removeEventListener('message',on);rej(new Error('t'));},20000);
      });
    }
    function getJ(path,params){
      var q=[],k,pre;
      if(location.protocol==='about:')return ask(path,params);
      for(k in params)q.push(k+'='+encodeURIComponent(params[k]));
      pre=/^\/api\/v1\//.test(location.pathname)?'/api/v1':'';
      return fetch(pre+path+'?'+q.join('&'),{credentials:'include',headers:{'X-Requested-With':'XMLHttpRequest'}}).then(function(r){if(!r.ok)throw new Error('http');return r.json();});
    }
    function want(){var w=[];if(C.names)C.names.split(',').forEach(function(x){x=x.replace(/^\s+|\s+$/g,'').toLowerCase();if(x)w.push(x);});return w;}
    function pass(nm,w){nm=nm.toLowerCase();return !w.length||w.some(function(x){return nm.indexOf(x)>-1;});}
    function sample(){
      var st={up:214,warning:9,down:3,unusual:2,paused:12,unknown:1};
      if(C.src==='status')return {kind:'status',counts:st};
      if(C.src==='sensors')return {kind:'items',items:[['Ping core-sw-01',12,'12 ms','up'],['Ping web-01',18,'18 ms','up'],['Ping fw-02',96,'96 ms','warning'],['Ping ap-17',140,'140 ms','down'],['Ping db-01',22,'22 ms','up']].map(function(a){return {name:a[0],v:a[1],text:a[2],st:a[3]};})};
      return {kind:'items',items:[['Traffic In',72,'72 Mbit/s'],['Traffic Out',31,'31 Mbit/s'],['Errors in',4,'4 #'],['Errors out',9,'9 #'],['Discards',2,'2 #']].map(function(a){return {name:a[0],v:a[1],text:a[2]};})};
    }
    function load(){
      var id=root.getAttribute('objectid'), p, w=want();
      if(C.sample){data=sample();draw();return;}
      if(C.src==='status')p=getJ('/api/table.json',{content:'sensors',columns:'objid,status_raw',count:'*',id:id}).then(function(j){var c={up:0,warning:0,down:0,unusual:0,paused:0,unknown:0};((j&&j.sensors)||[]).forEach(function(r){c[stKey(r.status_raw)]++;});return {kind:'status',counts:c};});
      else if(C.src==='channels')p=getJ('/api/table.json',{content:'channels',columns:'name,lastvalue,lastvalue_raw',id:id}).then(function(j){
        var it=[];((j&&j.channels)||[]).forEach(function(r){var v=num(r.lastvalue_raw),nm=strip(r.name);if(v===null||nm==='Downtime'||!pass(nm,w))return;it.push({name:nm,v:Math.abs(v),text:strip(r.lastvalue)||String(v)});});
        return {kind:'items',items:it.slice(0,C.max)};});
      else p=getJ('/api/table.json',{content:'sensors',columns:'objid,sensor,lastvalue,lastvalue_raw,status_raw',count:'*',id:id}).then(function(j){
        var it=[];((j&&j.sensors)||[]).forEach(function(r){var v=num(r.lastvalue_raw),nm=strip(r.sensor);if(v===null||!pass(nm,w))return;it.push({name:nm,v:Math.abs(v),text:strip(r.lastvalue)||String(v),st:stKey(r.status_raw)});});
        it.sort(function(a,b){return b.v-a.v;});return {kind:'items',items:it.slice(0,C.max)};});
      p.then(function(d){data=d;draw();}).catch(function(){say('No data');});
    }
    function colorOf(it,i){return (C.cm==='status'&&it.st)?C.P[it.st]:(C.cm==='one'?C.colors[0]:C.colors[i%C.colors.length]);}
    function draw(){
      var w,tot=0,max=0,items;
      if(!data)return;
      clear(box);box.setAttribute('data-g','ok');w=dv('bwrap',box);
      if(data.kind==='status'){
        KEYS.forEach(function(k){tot+=data.counts[k]||0;});
        if(!tot){say('No sensors here');return;}
        var bar=dv('bstack '+(C.dir==='col'?'bcol':'brow'),w);
        KEYS.forEach(function(k){var n=data.counts[k];if(!n)return;var sg=dv('bseg',bar);sg.style.flex=n+' 1 0';sg.style.background=C.P[k];sg.title=SN[k]+': '+n;});
        var lg=dv('blegend',w);
        KEYS.forEach(function(k){var n=data.counts[k];if(!n)return;var li=dv('bli',lg),sw=dv('bsw',li);sw.style.background=C.P[k];dv('bnm',li,SN[k]);dv('bvl',li,n+' ('+Math.round(n*100/tot)+'%)');});
        return;
      }
      items=data.items;
      if(!items.length){say('No data');return;}
      items.forEach(function(it){if(it.v>max)max=it.v;});if(!max)max=1;
      if(C.dir==='col'){
        var cs=dv('bcols',w);
        items.forEach(function(it,k){var c=dv('bcol1',cs);dv('bval',c,it.text);var tr=dv('btrk',c),b=dv('bfill',tr);b.style.height=Math.max(1,it.v/max*100)+'%';b.style.background=colorOf(it,k);dv('blab',c,it.name).title=it.name;});
      }else{
        items.forEach(function(it,k){var r=dv('brow1',w);dv('blab',r,it.name).title=it.name;var tr=dv('btrk',r),b=dv('bfill',tr);b.style.width=Math.max(0.5,it.v/max*100)+'%';b.style.background=colorOf(it,k);dv('bval',r,it.text);});
      }
    }
    box.setAttribute('data-g','loading');
    load();
    if(!C.sample)timer=setInterval(function(){if(!document.body.contains(box)){clearInterval(timer);return;}load();},30000);
  }
  function barsConfig(G,L){
    var c=graphConfig(G,L), P=donutPalette(L);
    return {src:G.bsrc||'status',dir:G.bdir||'row',cm:G.bcolor||'status',max:Math.max(1,Math.min(40,parseInt(G.bmax,10)||8)),names:clean(G.chNames||''),colors:c.colors,P:{up:P.up,warning:P.warning,down:P.down,unusual:P.unusual,paused:P.paused,unknown:P.unknown}};
  }
  function barsScript(G,L){
    return '(function(){\n  var root=document.getElementById("<@itemid>");\n  if(!root)return;\n  var CFG='+JSON.stringify(barsConfig(G,L))+';\n  ('+barsRuntime.toString()+')(root,CFG);\n})();';
  }
  function buildBars(G,cls,css,L){
    var o=[], init=initAttr(G), gt=graphTitleHtml(G,'');
    o.push('<!'+'--'+clean(G.cat||'Graphs')+': '+clean(G.name||'Bars')+'-->');
    o.push('');
    o.push('<div class="map_object map_graph '+cls+'" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+init+' style="overflow:hidden;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('<#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('<#mapobject type="htmlbefore" subid="<@subid>">');
    o.push('<#checkobjecttype objecttype="'+(G.bsrc==='channels'?'sensor':'sensor,device,group,probenode')+'" nicemessage="true" id="<@objectid>">');
    if(needsFontLink(L))o.push(fontLinkOf(L));
    o.push('<style>');o.push(css);o.push('</style>');
    o.push('');
    o.push('  <div class="gbox">');
    if(gt)o.push('    <div class="gtitle">'+gt+'</div>');
    o.push('    <div class="ggraph">');
    o.push('      <div class="gown" data-g="loading"></div>');
    o.push('    </div>');
    o.push('  </div>');
    o.push('<#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    o.push('');
    o.push('<scr'+'ipt>');o.push(barsScript(G,L));o.push('<\/script>');
    return o.join('\n')+'\n';
  }
  function grOwn(G){return ((G.kind==='sensor'||G.kind==='sensors')&&G.draw!=='pic')||G.kind==='bars';}
  function grLook(G){var L=G.look;return (grOwn(G)&&L.mode==='prtg')?lookOf('Light card'):L;}
  function graphOwnCss(G,cls,L){
    var r='.'+cls, c=[], bar=(L.titleStyle==='bar'), muted=(L.muted||L.headColor||L.text), fillA=(L.cardA==null?100:L.cardA), cardFill=(fillA<100)?tint(L.cardBg,fillA/100):L.cardBg, ip=(bar?0:(L.cardPad||0))+((L.card&&L.bw>0)?L.bw:0), gb='box-sizing:border-box;height:100%;display:flex;flex-direction:column;'+(ip>0?'padding:'+ip+'px;':'')+(L.align?'text-align:'+L.align+';':'');
    c.push(r+'{'+grRoot(L,cardFill)+'}');
    c.push(r+' .gbox{'+gb+'}');
    titleRules(L,r+' .gtitle',bar).forEach(function(x){c.push(x);});
    c.push(r+' .ggraph{flex:1 1 auto;min-height:0;display:flex;'+(bar?'margin:10px 14px;':'')+'}');
    c.push(r+' .gown{flex:1 1 auto;min-width:0;min-height:0;display:flex;flex-direction:column;}');
    c.push(r+' .gown img{display:block;width:100% !important;height:100% !important;object-fit:contain;}');
    if(G.kind==='sensor'&&grInvert(G,L))c.push(r+' .gown[data-g="fallback"] img{filter:invert(1) hue-rotate(180deg);mix-blend-mode:screen;}');   /* PRTG's picture has dark text on a light plot: on a dark card it is inverted so it can be read */
    c.push(r+' .gwrap{position:relative;flex:1 1 auto;min-height:0;}');
    c.push(r+' .gsvg{position:absolute;left:0;top:0;width:100%;height:100%;display:block;overflow:visible;font-family:inherit;}');
    c.push(r+' .glegend{flex:0 0 auto;display:flex;flex-wrap:wrap;gap:4px 16px;padding-top:6px;font-size:12px;color:'+muted+';}');
    c.push(r+' .glegend .gli{display:flex;align-items:center;gap:6px;min-width:0;}');
    c.push(r+' .glegend .gli.goff{opacity:.38;}');
    c.push(r+' .glegend .gli.goff .gnm{text-decoration:line-through;}');
    c.push(r+' .glegend .gsw{width:10px;height:3px;border-radius:2px;flex:0 0 auto;}');
    c.push(r+' .glegend .gnm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}');
    c.push(r+' .glegend .gvl{color:'+L.text+';font-weight:600;white-space:nowrap;}');
    c.push(r+' .gmsg{flex:1 1 auto;display:flex;align-items:center;justify-content:center;color:'+muted+';font-size:13px;}');
    c.push(r+' .gtip{position:absolute;pointer-events:none;z-index:2;background:'+cardFill+';color:'+L.text+';border:1px solid '+blend(cardFill.charAt(0)==='#'?cardFill:'#FFFFFF',L.text,0.2)+';border-radius:6px;padding:6px 9px;font-size:12px;line-height:1.5;box-shadow:0 4px 14px rgba(0,0,0,.18);white-space:nowrap;}');
    c.push(r+' .gtip i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;}');
    /* the Bars kind */
    var trk='rgba(128,128,128,.18)';
    c.push(r+' .bwrap{display:flex;flex-direction:column;gap:10px;height:100%;min-height:0;box-sizing:border-box;overflow:auto;}');
    c.push(r+' .bstack{display:flex;gap:2px;border-radius:8px;overflow:hidden;}');
    c.push(r+' .bstack.brow{height:34px;flex:0 0 auto;}');
    c.push(r+' .bstack.bcol{flex:1 1 auto;flex-direction:column;min-height:80px;width:90px;margin:0 auto;}');
    c.push(r+' .bseg{min-width:2px;min-height:2px;}');
    c.push(r+' .blegend{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:12px;color:'+muted+';}');
    c.push(r+' .bli{display:flex;align-items:center;gap:6px;}');
    c.push(r+' .bsw{width:10px;height:10px;border-radius:3px;flex:0 0 auto;}');
    c.push(r+' .bvl{color:'+L.text+';font-weight:600;white-space:nowrap;}');
    c.push(r+' .brow1{display:flex;align-items:center;gap:10px;font-size:12px;}');
    c.push(r+' .brow1 .blab{flex:0 0 28%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:'+muted+';}');
    c.push(r+' .brow1 .btrk{flex:1 1 auto;height:14px;background:'+trk+';border-radius:7px;overflow:hidden;}');
    c.push(r+' .brow1 .bfill{height:100%;}');
    c.push(r+' .brow1 .bval{flex:0 0 auto;min-width:56px;text-align:right;font-weight:600;color:'+L.text+';}');
    c.push(r+' .bfill{border-radius:7px;min-width:2px;min-height:2px;}');
    c.push(r+' .bcols{display:flex;gap:10px;align-items:stretch;flex:1 1 auto;min-height:0;}');
    c.push(r+' .bcol1{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:4px;}');
    c.push(r+' .bcol1 .btrk{flex:1 1 auto;display:flex;align-items:flex-end;background:'+trk+';border-radius:7px;overflow:hidden;}');
    c.push(r+' .bcol1 .bfill{width:100%;}');
    c.push(r+' .bcol1 .blab{text-align:center;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:'+muted+';}');
    c.push(r+' .bcol1 .bval{text-align:center;font-size:12px;font-weight:600;color:'+L.text+';white-space:nowrap;}');
    /* graphs of every sensor, drawn by the tool */
    var tileBg=blend(cardFill.charAt(0)==='#'?cardFill:'#FFFFFF',L.text,0.05);
    c.push(r+' .gtiles{display:flex;flex-wrap:wrap;gap:12px;align-content:flex-start;width:100%;box-sizing:border-box;overflow:auto;}');
    c.push(r+' .gtile{display:flex;flex-direction:column;box-sizing:border-box;padding:8px 10px;border-radius:'+Math.max(0,(L.radius||0))+'px;background:'+tileBg+';}');
    c.push(r+' .gtname{font-size:12px;font-weight:600;color:'+L.text+';margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}');
    c.push(r+' .gtchart{flex:1 1 auto;min-height:0;display:flex;}');
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
    var cls=grClassOf(G), css=graphCss(G,cls), L=grLook(G), styled=!!css, o=[], kind=G.kind;
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
    if(kind==='sensors'&&grOwn(G))return buildGraphList(G,cls,css,L);
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
    if(kind==='bars')return buildBars(G,cls,css,L);
    /* a single sensor graph */
    o.push('<div class="map_object map_graph'+(styled?' '+cls:'')+'" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+init+' style="'+(styled?'overflow:hidden;':'')+'<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('<#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('<#mapobject type="htmlbefore" subid="<@subid>">');
    if(G.check)o.push('<#checkobjecttype objecttype="sensor" nicemessage="true" id="<@objectid>">');
    styleBlock();
    o.push('');
    var sty="baseFontSize='"+Math.max(0,Math.min(40,parseInt(G.fontSize,10)||0))+"'%20showLegend='"+(G.legend?1:0)+"'"+(G.axis?'':"%20showAxis='0'");
    var tag='<#object type="graph" id="<@objectid>" graphid="'+G.period+'" width="<@width>" height="<@height>" tooltexts="'+(G.tooltips?1:0)+'" graphstyling="'+sty+'"'+grExtra(G)+' >';
    if(grOwn(G)){
      var gt0=graphTitleHtml(G,'');
      o.push('  <div class="gbox">');
      if(gt0)o.push('    <div class="gtitle">'+gt0+'</div>');
      o.push('    <div class="ggraph">');
      o.push('      <div class="gown" data-g="loading"></div>');
      o.push('      <template class="gfall">'+tag+'</template>');
      o.push('    </div>');
      o.push('  </div>');
      o.push('<#mapobject type="htmlafter" subid="<@subid>">');
      o.push('</div>');
      o.push('');
      o.push('<scr'+'ipt>');o.push(graphScript(G,L));o.push('<\/script>');
      return o.join('\n')+'\n';
    }
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
  var DSTATES=[['down','Down'],['ack','Down (Acknowledged)'],['warning','Warning'],['unusual','Unusual'],['up','Up'],['paused','Paused'],['unknown','Unknown']];
  var DALARM={down:1,ack:1,warning:1,unusual:1};
  var DENGINES=[['ring','Ring donut: drawn by the tool, follows the look'],['prtg','PRTG donut: PRTG\u2019s own include, restyled around it']];
  var DLEGENDS=[['right','Right of the ring'],['below','Below the ring'],['none','No legend']];
  var DCENTERS=[['total','Number of sensors shown'],['percentup','Percent of sensors that are up'],['none','Nothing']];
  /* ====================== status counts: tiles of sensors by status ====================== */
  var SKEYS=[['up','Up'],['warning','Warning'],['down','Down'],['ack','Down (Acknowledged)'],['paused','Paused'],['unusual','Unusual'],['unknown','Unknown'],['total','Total'],['pctup','% Up']];
  var SPRESETS=[
    {id:'status',name:'Sensor status',tiles:['up','warning','down','paused'],reqTag:'',nameHas:'',cap:'of'},
    {id:'interfaces',name:'Interfaces',tiles:['up','down','total'],reqTag:'bandwidthsensor',nameHas:'',cap:'of'},
    {id:'availability',name:'Availability',tiles:['pctup'],reqTag:'',nameHas:'',cap:'of'}
  ];
  function blankSC(){
    return {type:'status',cat:'Status Counts',name:'Sensor status',fname:'',titleMode:'object',title:'',sub:'',tiles:['up','warning','down','paused'],quiet:true,cap:'of',
      mapTags:true,reqTag:'',nameHas:'',initW:420,initH:200,fit:true,fitW:420,fitH:200,look:lookOf('PRTG new UI')};
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
      light:false,withName:false,initW:340,initH:220,fit:true,fitW:340,fitH:220,look:dnLook('PRTG new UI')};
  }
  /* a donut's slices take the Colors choice, never the look's: a look only changes the box around the donut. A new donut starts on PRTG\u2019s colors */
  function dnPrtgC(){var r={};window.PMSSETS.sets.forEach(function(x){if(x[0]==='prtg')r=x[2];});return Object.assign({},r);}
  function dnLook(name,c){var l=lookOf(name);l.c=Object.assign({},c||dnPrtgC());return l;}
  /* runs fn, which may give the donut another look, and keeps the donut's own colors */
  function dnKeepC(fn){
    if(TYPE!=='donut'){fn();return;}
    var c=Object.assign({},(DN.look&&DN.look.c)||dnPrtgC());
    fn();
    DN.look=Object.assign({},DN.look);DN.look.c=c;
  }
  function donutFromPreset(p){
    var D=blankD();
    D.engine='prtg';D.cat='Donuts';   /* 1.5.65: every donut Map Studio builds goes under Donuts (PRTG files its own under Status Donuts) */
    D.name=p.name+' custom';D.mode=p.alarms?'alarms':'all';D.light=!!p.light;D.withName=!!p.withName;D.noInitH=!!p.noInitH;   /* PRTG's own donut_alarms_font-light.htm has no initialheight; kept as shipped */
    D.initW=0;D.initH=0;D.fit=false;D.look=dnLook('PRTG default');
    return D;
  }
  function dEffLook(D){
    var L=D.look;
    if(L.mode==='prtg'&&D.engine==='ring'){var m=lookOf('Minimal');m.name='PRTG default';if(L.c)m.c=Object.assign({},L.c);return m;}
    return L;
  }
  function dClassOf(D){return 'pdn_'+slugOf(D.name);}
  function dDark(L){return !!L.card&&lum(L.cardBg)<0.35;}
  /* the looks give Unusual the same color as Warning, and Paused nearly the same as Unknown. Two neighbouring slices must be told apart,
     so the donut derives an orange between warning and down for Unusual, and moves Unknown from the paused color toward the text color */
  function donutPalette(L){
    var c=L.c;
    return {down:c.down,warning:c.warning,unusual:(c.unusual&&c.unusual!==c.warning)?c.unusual:blend(c.warning,c.down,0.5),up:c.up,paused:c.paused,unknown:(c.unknown&&c.unknown!==c.paused&&String(c.unknown).toUpperCase()!==String(c.paused).toUpperCase())?c.unknown:blend(c.paused,L.text,0.5),ack:c.ack||blend(c.down,'#FFFFFF',0.35)};
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
    var ORDER=[['down','Down'],['ack','Down (Acknowledged)'],['warning','Warning'],['unusual','Unusual'],['up','Up'],['paused','Paused'],['unknown','Unknown']];
    var ALARM={down:1,ack:1,warning:1,unusual:1};
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
        if(n===13)return 'ack';
        if(n===5||n===14)return 'down';
        if(n===7||n===8||n===9||n===11||n===12)return 'paused';
        return 'unknown';
      }
      if(typeof v==='string'){
        var t=v.replace(/<[^>]*>/g,'').toLowerCase().replace(/^\s+|\s+$/g,'');
        if(t.indexOf('unusual')===0)return 'unusual';
        if(t.indexOf('unknown')===0)return 'unknown';
        if(t.indexOf('up')===0)return 'up';
        if(t.indexOf('warn')===0)return 'warning';
        if(t.indexOf('down')===0)return /acknowledg|\back\b/.test(t)?'ack':'down';
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
      var counts={down:0,ack:0,warning:0,unusual:0,up:0,paused:0,unknown:0}, parsed=0, i;
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

  /* ====================== sunburst: a group's or probe's device tree as rings ====================== */
  /* PRTG's own five sunburst files differ only in their sizing flags and in hiding paused devices */
  var SBPRESETS=[
    {id:'devices sunburst',cat:'Device Tree Views',name:'Sunburst',sizeSensors:false,sizePriority:false,hidePaused:false},
    {id:'devices sunburst sensors',cat:'Device Tree Views',name:'Sunburst (sized by sensors)',sizeSensors:true,sizePriority:false,hidePaused:false},
    {id:'devices sunburst priority',cat:'Device Tree Views',name:'Sunburst (sized by priority)',sizeSensors:false,sizePriority:true,hidePaused:false},
    {id:'devices sunburst sensors priority',cat:'Device Tree Views',name:'Sunburst (sized by sensors and priority)',sizeSensors:true,sizePriority:true,hidePaused:false},
    {id:'devices sunburst no paused',cat:'Device Tree Views',name:'Sunburst (hide paused devices)',sizeSensors:false,sizePriority:false,hidePaused:true}
  ];
  /* how it is drawn: PRTG's own sunburst (restyled), or drawn by Map Studio from the same PRTG data */
  var SBFACES=[['prtg','PRTG classic'],['solid','Solid'],['gaps','Separated'],['glow','Glow'],['pastel','Soft pastel']];
  var SBCENTERS=[['total','Number of sensors'],['pctup','Percent of sensors up'],['name','The object’s name'],['none','Nothing']];
  var SBKEYS=['down','partialdown','downack','warn','unusual','up','paused','undefined'];   /* PRTG's own order (_Prtg.Core sensorTypes): a slice takes the first state it has sensors in */
  var SBCOLS='objid,name,probegroupdevice=treejson,basetype,priority,status=textraw,totalsens=textraw,upsens=textraw,downsens=textraw,partialdownsens=textraw,warnsens=textraw,pausedsens=textraw,unusualsens=textraw,undefinedsens=textraw,downacksens=textraw';
  var SBSTOCKCOLS='objid,name,access=treejson,probegroupdevice=treejson,basetype,icon=treejson,favorite,fold,devicenum=textraw,groupnum=textraw,totalsens=textraw,upsens=textraw,downsens=textraw,partialdownsens=textraw,warnsens=textraw,pausedsens=textraw,unusualsens=textraw,undefinedsens=textraw,downacksens=textraw,condition,status=textraw,message,info,priority';
  function blankSB(){
    return {type:'sunburst',engine:'ring',face:'gaps',cat:'Sunbursts',name:'Device tree sunburst',fname:'',titleMode:'object',title:'',
      sizeSensors:true,sizePriority:false,hidePaused:false,labels:true,center:'total',hole:26,depth:0,legend:'below',links:true,mapTags:true,
      initW:420,initH:440,fit:true,fitW:420,fitH:440,look:lookOf('Light card')};
  }
  function sbFromPreset(p){
    var S=blankSB();
    S.engine='prtg';S.face='prtg';S.cat='Sunbursts';   /* PRTG files its own sunbursts under Device Tree Views; every sunburst Map Studio builds goes under Sunbursts, as gauges go under Gauges */
    S.name=p.name+' custom';S.sizeSensors=!!p.sizeSensors;S.sizePriority=!!p.sizePriority;S.hidePaused=!!p.hidePaused;
    S.initW=0;S.initH=0;S.fit=false;S.look=lookOf('PRTG default');
    return S;
  }
  function sbFace(){return SB.engine==='prtg'?'prtg':(SB.face||'gaps');}
  function sbSetFace(k){
    if(k==='prtg'){SB.engine='prtg';return;}
    SB.engine='ring';SB.face=k;
    if(!(parseInt(SB.initW,10)>0&&parseInt(SB.initH,10)>0)){SB.initW=420;SB.initH=440;}
    if(SB.look.mode==='prtg')SB.look=lookOf('Light card');
  }
  function sbEffLook(S){var L=S.look;if(L.mode==='prtg'&&S.engine==='ring'){var m=lookOf('Minimal');m.name='PRTG default';return m;}return L;}
  function sbClassOf(S){return 'psb_'+slugOf(S.name);}
  function sbPalette(L){
    var c=L.c;
    return {down:c.down,partialdown:blend(c.down,'#FFFFFF',0.3),downack:blend(c.down,'#FFFFFF',0.5),warn:c.warning,unusual:(c.unusual&&c.unusual!==c.warning)?c.unusual:blend(c.warning,c.down,0.5),up:c.up,paused:c.paused,undefined:c.unknown,none:blend(c.unknown,'#FFFFFF',0.5)};
  }
  function sunburstCss(S,cls){
    var L=sbEffLook(S), r='.'+cls, bar=(L.titleStyle==='bar'), muted=(L.muted||L.headColor), P=sbPalette(L), c;
    var fillA=(L.cardA==null?100:L.cardA), cardFill=(L.card)?((fillA<100)?tint(L.cardBg,fillA/100):L.cardBg):'#FFFFFF';
    if(S.engine==='prtg'){
      if(L.mode==='prtg')return '';
      c=gFrameCss({engine:'ring'},cls,L);
      c.push(r+' .sensorTree{flex:1 1 auto;min-height:0;position:relative;'+(bar?'margin:10px 14px;':'')+'}');
      SBKEYS.forEach(function(k){c.push(r+' .sensorTree g.'+k+' path.arc{fill:'+P[k]+';}');});
      c.push(r+' .sensorTree path.arc{stroke:'+cardFill+';}');
      c.push(r+' .sensorTree svg text{fill:'+L.text+';font-family:'+familyStack(L.font)+';}');
      return c.join('\n');
    }
    c=gFrameCss({engine:'ring'},cls,L);
    c.push(r+' .sbbody{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;gap:14px;'+(bar?'margin:10px 14px;':'')+'}');
    c.push(r+' .sbbody.lg-below{flex-direction:column;gap:8px;}');
    c.push(r+' .sbbody.lg-none .sblegend{display:none;}');
    c.push(r+' .sbwrap{flex:1 1 0;min-width:0;min-height:0;align-self:stretch;position:relative;}');
    c.push(r+' .sbbody.lg-below .sbwrap{width:100%;}');
    c.push(r+' .sbsvg{position:absolute;left:0;top:0;width:100%;height:100%;display:block;overflow:visible;}');
    c.push(r+' .sbsvg text{font-family:'+familyStack(L.font)+';}');
    c.push(r+' .sbsvg .sbv{fill:'+L.text+';font-weight:600;}');
    c.push(r+' .sbsvg .sbl{fill:'+muted+';}');
    c.push(r+' .sbsvg .sbt{fill:'+L.text+';pointer-events:none;}');
    c.push(r+' .sblegend{flex:0 0 auto;display:flex;flex-wrap:wrap;justify-content:center;gap:5px 14px;max-width:100%;}');
    c.push(r+' .sbbody.lg-right .sblegend{flex-direction:column;flex-wrap:nowrap;max-width:46%;}');
    c.push(r+' .sbli{display:flex;align-items:center;gap:7px;white-space:nowrap;color:'+muted+';}');
    c.push(r+' .sbli i{display:block;width:10px;height:10px;border-radius:50%;flex:0 0 auto;}');
    c.push(r+' .sbli b{font-weight:600;color:'+L.text+';margin-left:4px;}');
    c.push(r+' .sbnone{color:'+muted+';}');
    return c.join('\n');
  }
  function sbConfig(S){
    var L=sbEffLook(S), fillA=(L.cardA==null?100:L.cardA), cardFill=(L.card)?((fillA<100)?tint(L.cardBg,fillA/100):L.cardBg):'#FFFFFF';
    return {face:S.engine==='prtg'?'prtg':(S.face||'gaps'),sizeSensors:!!S.sizeSensors,sizePriority:!!S.sizePriority,hidePaused:!!S.hidePaused,labels:!!S.labels,
      center:(['total','pctup','name','none'].indexOf(S.center)>-1)?S.center:'total',hole:Math.max(0,Math.min(70,Number(S.hole)||0)),depth:Math.max(0,Math.min(8,parseInt(S.depth,10)||0)),
      links:!!S.links,colors:sbPalette(L),card:(String(cardFill).charAt(0)==='#'?cardFill:'#FFFFFF'),text:L.text,muted:(L.muted||L.headColor||L.text)};
  }
  /* the sunburst's drawing code: shipped inside the generated file as its own source text. It reads the device tree PRTG puts in the page
     (the same sensorxref table PRTG's own sunburst reads) and rebuilds the tree the way PRTG does: rows come in tree order, each with its path */
  function sbRuntime(root,C){
    var NS='http://www.w3.org/2000/svg', svg=root.querySelector('.sbsvg'), legend=root.querySelector('.sblegend');
    if(!svg)return;
    var KEYS=['down','partialdown','downack','warn','unusual','up','paused','undefined'];
    var LABEL={down:'Down',partialdown:'Partial down',downack:'Down (ack.)',warn:'Warning',unusual:'Unusual',up:'Up',paused:'Paused',undefined:'Unknown'};
    function el(tag,a,par){var e=document.createElementNS(NS,tag),k;for(k in a){if(a[k]!==undefined&&a[k]!==null)e.setAttribute(k,a[k]);}if(par)par.appendChild(e);return e;}
    function clear(n){while(n&&n.firstChild)n.removeChild(n.firstChild);}
    function say(t){clear(svg);clear(legend);svg.setAttribute('viewBox','0 0 200 200');el('text',{x:100,y:104,'text-anchor':'middle','class':'sbl','font-size':11},svg).textContent=t;root.setAttribute('data-sunburst','message');}
    function num(v){var n=parseFloat(String(v==null?'':v).replace(/[^\d.\-]/g,''));return isNaN(n)?0:n;}
    function hx(c){c=String(c||'').replace('#','');if(c.length===3)c=c.charAt(0)+c.charAt(0)+c.charAt(1)+c.charAt(1)+c.charAt(2)+c.charAt(2);return c.length===6?c:'888888';}
    function mix(a,b,t){var x=hx(a),y=hx(b),o='#',i,v;for(i=0;i<6;i+=2){v=Math.round(parseInt(x.substr(i,2),16)*(1-t)+parseInt(y.substr(i,2),16)*t);o+=(v<16?'0':'')+v.toString(16);}return o;}
    function findJson(){var found=null;(function walk(node){for(var c=node.firstChild;c&&!found;c=c.nextSibling){if(c.nodeType===8){var t=(c.nodeValue||'').replace(/^\s+|\s+$/g,'');if(t.charAt(0)==='{'){found=t;return;}}else if(c.nodeType===1)walk(c);}})(root);return found;}
    function pathOf(r){var p=r.probegroupdevice;if(typeof p==='string'){try{p=JSON.parse(p);}catch(e){p=null;}}return (p&&typeof p.length==='number')?p:null;}
    function stateOf(n){var i;for(i=0;i<KEYS.length;i++){if(n.c[KEYS[i]]>0)return KEYS[i];}return 'none';}
    try{
      var raw=findJson();if(!raw){say('No device tree data');return;}
      var data=JSON.parse(raw), box=(data&&data.objects)?data.objects:data, rows=null, k;
      if(box&&box.sensorxref)rows=box.sensorxref;else for(k in box){if(box[k]&&typeof box[k].length==='number'&&typeof box[k]!=='string'){rows=box[k];break;}}
      if(!rows||!rows.length){say('No devices');return;}
      /* the tree, the way PRTG builds it: each row's level is the length of its path; a deeper row is a child of the row before it */
      var stack=[], tops=[], nodes=[];
      rows.forEach(function(r,i){
        var p=pathOf(r), lev=p?p.length:({probe:1,probenode:1,group:2,device:3}[r.basetype]||3), n={id:r.objid,name:String(r.name||'').replace(/<[^>]*>/g,''),type:r.basetype||'',prio:num(r.priority)||3,status:num(r.status),lev:lev,kids:[],c:{}};
        KEYS.forEach(function(k2){n.c[k2]=num(r[k2+'sens']);});n.total=num(r.totalsens);
        while(stack.length&&stack[stack.length-1].lev>=lev)stack.pop();
        if(stack.length)stack[stack.length-1].kids.push(n);else tops.push(n);
        stack.push(n);nodes.push(n);
      });
      var top=(tops.length===1)?tops[0]:{name:'',type:'root',kids:tops,c:{},total:0,lev:0};
      if(tops.length!==1){KEYS.forEach(function(k2){top.c[k2]=0;tops.forEach(function(t){top.c[k2]+=t.c[k2];});});tops.forEach(function(t){top.total+=t.total;});}
      function paused(n){return n.type==='device'&&((n.status>=7&&n.status<=9)||n.status===11||n.status===12||(n.total>0&&n.c.paused>=n.total));}
      /* sizes: PRTG's own formula for a device; a group is the sum of what is in it, or 1 when it is empty */
      function size(n){
        n.kids=n.kids.filter(function(x){return !(C.hidePaused&&paused(x));});
        if(n.type==='device'||!n.kids.length){n.v=(n.type==='device')?Math.pow(Math.log(C.sizeSensors?n.total+2:4)/Math.LN2,C.sizePriority?n.prio:1):1;n.kids.forEach(size);return n.v;}
        n.v=0;n.kids.forEach(function(x){n.v+=size(x);});return n.v;
      }
      size(top);
      var maxD=0;(function depth(n,d){if(d>maxD)maxD=d;n.kids.forEach(function(x){depth(x,d+1);});})(top,0);
      if(C.depth>0)maxD=Math.min(maxD,C.depth);
      clear(svg);svg.setAttribute('viewBox','0 0 200 200');svg.setAttribute('role','img');
      var R=96, r0=(C.face==='prtg')?R*0.18:R*C.hole/100, ring=maxD>0?(R-r0)/maxD:R, ANG=Math.PI*2, gap=(C.face==='gaps')?0.012:(C.face==='glow'?0.008:0);
      var defs=el('defs',{},svg);
      function pt(a,r){return [(100+r*Math.sin(a)).toFixed(2),(100-r*Math.cos(a)).toFixed(2)];}
      function arcD(a0,a1,ri,ro){
        if(a1-a0>=ANG-1e-6){return 'M100,'+(100-ro)+'A'+ro+','+ro+' 0 1,1 99.99,'+(100-ro)+'Z'+(ri>0?'M100,'+(100-ri)+'A'+ri+','+ri+' 0 1,0 100.01,'+(100-ri)+'Z':'');}
        var L=(a1-a0>Math.PI)?1:0, p0=pt(a0,ro), p1=pt(a1,ro), p2=pt(a1,ri), p3=pt(a0,ri);
        return 'M'+p0+'A'+ro+','+ro+' 0 '+L+',1 '+p1+'L'+p2+(ri>0?'A'+ri+','+ri+' 0 '+L+',0 '+p3:'')+'Z';
      }
      var CARD=C.card||'#ffffff', worst={down:1,partialdown:1,downack:1,warn:1,unusual:1};
      function fillOf(st){var c=C.colors[st]||C.colors.none;if(C.face==='pastel'&&!worst[st])c=mix(c,CARD,0.55);return c;}
      if(C.face==='glow'){var f=el('filter',{id:'sbg'+Math.floor(Math.random()*1e6),x:'-20%',y:'-20%',width:'140%',height:'140%'},defs);el('feGaussianBlur',{'in':'SourceGraphic',stdDeviation:2.2,result:'b'},f);var mg=el('feMerge',{},f);el('feMergeNode',{'in':'b'},mg);el('feMergeNode',{'in':'SourceGraphic'},mg);C._glow=f.getAttribute('id');}
      var gAll=el('g',{},svg), labels=[];
      function lay(n,a0,a1,d){
        var whole=a1-a0;
        n.kids.slice().sort(function(a,b){return a.name>b.name?1:(a.name<b.name?-1:0);}).forEach(function(x){
          var span=(n.v>0)?whole*x.v/n.v:0, b0=a0, b1=a0+span, st=stateOf(x), ri=r0+(d)*ring, ro=r0+(d+1)*ring;
          a0=b1;
          if(d>=maxD||span<=0)return;
          var g=el('g',{'class':x.type+' '+st},gAll), hold=g;
          if(C.links&&x.id&&(x.type==='device'||x.type==='group'||x.type==='probe'||x.type==='probenode')){hold=el('a',{href:'/'+(x.type==='device'?'device':(x.type==='group'?'group':'probenode'))+'.htm?id='+x.id,target:'_top'},g);}
          var g0=b0+(span>gap*3?gap:0), g1=b1-(span>gap*3?gap:0);
          var pth=el('path',{d:arcD(g0,g1,ri+(gap?0.8:0),ro-(gap?0.8:0)),'class':'arc',fill:fillOf(st),stroke:(C.face==='prtg'||C.face==='solid')?CARD:'none','stroke-width':(C.face==='prtg'?0.8:(C.face==='solid'?1.2:0)),'stroke-linejoin':'round'},hold);
          if(C.face==='glow'&&worst[st])pth.setAttribute('filter','url(#'+C._glow+')');
          var t='';KEYS.forEach(function(k2){if(x.c[k2]>0)t+=', '+x.c[k2]+' '+LABEL[k2].toLowerCase();});
          el('title',{},pth).textContent=x.name+(x.total?(' – '+x.total+' sensors'+t):'');
          if(C.labels&&x.name){var mid=(b0+b1)/2, rm=(ri+ro)/2, len=span*rm, fs=Math.min(9,ring*0.42);if(len>fs*2.2&&ring>9)labels.push({a:mid,r:rm,len:len,fs:fs,name:x.name,st:st,ring:ring});}
          lay(x,b0,b1,d+1);
        });
      }
      lay(top,0,ANG,0);
      /* names along each slice where they fit; the text turns so it is never upside down */
      labels.forEach(function(l){
        var deg=l.a*180/Math.PI, p=pt(l.a,l.r), radial=(l.len<l.ring*1.4), rot=radial?(deg-90):deg, maxc=Math.floor((radial?l.ring*0.92:l.len*0.92)/(l.fs*0.56)), s=l.name;
        if(radial){if(deg>180)rot+=180;}else if(deg>90&&deg<270)rot+=180;
        if(maxc<3)return;if(s.length>maxc)s=s.slice(0,maxc-1)+'…';
        var dark=(l.st==='down'||l.st==='paused'||l.st==='downack'||C.face==='glow'), tx=el('text',{x:p[0],y:p[1],'text-anchor':'middle','dominant-baseline':'central','class':'sbt','font-size':l.fs.toFixed(2),transform:'rotate('+rot.toFixed(1)+' '+p[0]+' '+p[1]+')'},gAll);
        if(C.face==='prtg'||C.face==='solid'||C.face==='gaps')tx.setAttribute('style','fill:'+(dark?'#ffffff':'#1d2433'));
        tx.textContent=s;
      });
      /* the middle: the object itself */
      var tot=top.total||0, up=top.c.up||0, val=null, cap='';
      if(C.center==='total'){val=String(tot);cap='sensors';}
      else if(C.center==='pctup'){val=tot?Math.round(100*up/tot)+'%':'–';cap='up';}
      else if(C.center==='name'){val=null;cap=top.name;}
      if(r0>14&&(val!==null||cap)){
        var fsv=Math.min(r0*0.62,r0*1.5/Math.max(2,(val||'').length)), fsc=Math.max(5,Math.min(r0*0.24,9));
        if(val!==null){el('text',{x:100,y:(100+fsv*0.3-(cap?fsc*0.6:0)).toFixed(2),'text-anchor':'middle','class':'sbv','font-size':fsv.toFixed(2)},svg).textContent=val;}
        if(cap){var cs=cap.length>18?cap.slice(0,17)+'…':cap;el('text',{x:100,y:(val!==null?(100+fsv*0.3+fsc*1.1):100+fsc*0.35).toFixed(2),'text-anchor':'middle','class':val!==null?'sbl':'sbv','font-size':(val!==null?fsc:Math.min(fsc*1.4,r0*1.7/Math.max(4,cs.length)*1.6)).toFixed(2)},svg).textContent=cs;}
      }
      /* the legend: how many sensors are in each state */
      clear(legend);var any=false;
      KEYS.forEach(function(k2){if(!(top.c[k2]>0))return;any=true;var row=document.createElement('div');row.className='sbli';var dot=document.createElement('i');dot.style.background=fillOf(k2);row.appendChild(dot);row.appendChild(document.createTextNode(LABEL[k2]));var b=document.createElement('b');b.textContent=String(top.c[k2]);row.appendChild(b);legend.appendChild(row);});
      if(!any){var none=document.createElement('div');none.className='sbnone';none.textContent='No sensors';legend.appendChild(none);}
      root.setAttribute('data-sunburst','ok');root.setAttribute('data-nodes',String(nodes.length));
    }catch(err){say('Could not read the device tree');}
  }
  function sbScript(S){
    if(S.engine!=='ring')return '';
    return '(function(){\n  var root=document.getElementById("<@itemid>");\n  if(!root)return;\n  var CFG='+JSON.stringify(sbConfig(S))+';\n  ('+sbRuntime.toString()+')(root,CFG);\n})();';
  }
  function sbInit(S){var w=parseInt(S.initW,10), h=parseInt(S.initH,10);return (w>0&&h>0)?' initialwidth="'+Math.min(w,4000)+'" initialheight="'+Math.min(h,4000)+'"':'';}
  function buildSunburst(S){
    var cls=sbClassOf(S), css=sunburstCss(S,cls), L=sbEffLook(S), ring=(S.engine==='ring'), styled=!!css, o=[], tm=S.titleMode||'object';
    var titleInner=(tm==='custom')?clean(S.title):'<#objectproperty name="Name" id="<@objectid>">';
    o.push('<!'+'--'+clean(S.cat||'Sunbursts')+': '+clean(S.name||'Sunburst')+'-->');
    o.push('');
    o.push('<div class="map_object map_table'+(styled?' '+cls:'')+' <#sensor type="colorclassofstate" prefix="map_objectstate_" id="<@objectid>">" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+sbInit(S)+(ring?' data-sunburst="loading"':'')+' style="overflow:hidden;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('\t<#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('\t<#mapobject type="htmlbefore" subid="<@subid>">');
    o.push('\t<#checkobjecttype objecttype="probenode,group" nicemessage="true" id="<@objectid>">');
    if(styled){if(needsFontLink(L))o.push(fontLinkOf(L));o.push('<style>');o.push(css);o.push('</style>');o.push('  <div class="gbox">');if(tm!=='none')o.push('    <div class="gtitle"><b>'+titleInner+'</b></div>');}
    var tbl=function(cols){
      var j=['    <!'+'--','      {','       "objects":<#table',"        id='<@objectid>'","        output='json'","        count='*'","        content='sensorxref'","        noraw='1'","        subcheck='1'","        filter_basetype='probe'","        filter_basetype='group'","        filter_basetype='device'"];
      if(S.mapTags!==false)j.push('        filter_tags="@tag(<@tagfilterstring>)"');
      j.push("        sortby='probegroupdevice'");j.push("        columns='"+cols+"'>");j.push('      }');j.push('    -->');return j;
    };
    if(!ring){
      var opts={sunburstSizePriority:!!S.sizePriority,sunburstSizeSensors:!!S.sizeSensors,treeMapSizePriority:false,treeMapSizeSensors:false,hideControls:true};
      if(S.hidePaused)opts.filter=['paused'];
      o.push('\t<div id ="Plugin_<@itemid>"');
      o.push('\t\tclass="sensorTree prtg-plugin"');
      o.push('\t\tdata-layout="none"');
      o.push('\t\tdata-no-full-size="false"');
      o.push('\t\tdata-plugin="sunburst"');
      o.push('\t\tdata-root-id="<#objectid>"');
      o.push('\t\tdata-objectid="<#objectid>"');
      o.push('\t\tdata-view-type="sunburst"');
      o.push('\t\tdata-display-mode="<#displaymode>"');
      o.push('\t\tdata-show-top-panel="false"');
      o.push('\t\tdata-border-bottom-width="0"');
      o.push("\t\tdata-options='"+JSON.stringify(opts)+"'>");
      tbl(SBSTOCKCOLS).forEach(function(l){o.push(l);});
      o.push('\t\t<div id="viewport"></div>');
      o.push('\t</div>');
    }else{
      var lg=(['right','below','none'].indexOf(S.legend)>-1)?S.legend:'below';
      o.push('    <div class="sbbody lg-'+lg+'">');
      o.push('      <div class="sbwrap"><svg class="sbsvg" preserveAspectRatio="xMidYMid meet"></svg></div>');
      o.push('      <div class="sblegend"></div>');
      tbl(SBCOLS).forEach(function(l){o.push(l);});
      o.push('    </div>');
    }
    if(styled)o.push('  </div>');
    o.push('\t<#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    var js=sbScript(S);
    if(js){o.push('');o.push('<scr'+'ipt>');o.push(js);o.push('<\/script>');}
    return o.join('\n')+'\n';
  }
  /* a sample device tree in the shape PRTG sends it, for the preview */
  function sbSample(){
    var rows=[], id=2000;
    function row(path,name,type,c,prio,status){var o={objid:path[path.length-1],name:name,probegroupdevice:path,basetype:type,priority:prio||3,status:status||3,totalsens:0};SBKEYS.forEach(function(k){o[k+'sens']=c[k]||0;o.totalsens+=c[k]||0;});rows.push(o);return o;}
    function sum(list){var t={};list.forEach(function(x){SBKEYS.forEach(function(k){t[k]=(t[k]||0)+(x[k+'sens']||0);});});return t;}
    var tree=[['Core network',[['Core switch',{up:42,warn:2}],['Edge router',{up:18,down:1}],['Firewall',{up:24}],['WAN link',{up:6,unusual:1}]]],
      ['Servers',[['DC01',{up:31}],['DC02',{up:29,warn:1}],['SQL01',{up:22,down:2,warn:1}],['File server',{up:16}],['Backup',{paused:9}]]],
      ['Branch offices',[['Branch A',{up:12}],['Branch B',{up:9,warn:3}],['Branch C',{up:7,downack:1}]]],
      ['Wireless',[['AP floor 1',{up:5}],['AP floor 2',{up:5}],['Controller',{up:11,undefined:1}]]]];
    var gr=[], dv;
    tree.forEach(function(g,i){var gid=1100+i, devs=g[1].map(function(d,j){return {path:[0,1,gid,id+i*10+j],name:d[0],c:d[1]};});gr.push({gid:gid,name:g[0],devs:devs});});
    var all=[];gr.forEach(function(g){g.devs.forEach(function(d){var o={};SBKEYS.forEach(function(k){o[k+'sens']=d.c[k]||0;});all.push(o);});});
    row([0,1],'Local probe','probe',sum(all));
    gr.forEach(function(g){var ss=g.devs.map(function(d){var o={};SBKEYS.forEach(function(k){o[k+'sens']=d.c[k]||0;});return o;});row([0,1,g.gid],g.name,'group',sum(ss));g.devs.forEach(function(d){row(d.path,d.name,'device',d.c,d.name==='Core switch'?5:3,d.c.paused?7:3);});});
    return rows;
  }
  function sbFaceSvg(k){
    var G1='#B8C419',Y='#F5C500',R='#E30613',P='#477EC0',N='#CBD2DC',o='', i;
    var seg=[[0,1.6,G1],[1.6,2.4,Y],[2.4,3.3,G1],[3.3,4.1,R],[4.1,5.2,G1],[5.2,6.283,P]];
    function a(a0,a1,ri,ro){var p=function(t,r){return (32+r*Math.sin(t)).toFixed(1)+' '+(22-r*Math.cos(t)).toFixed(1);};return 'M'+p(a0,ro)+'A'+ro+' '+ro+' 0 '+((a1-a0)>Math.PI?1:0)+' 1 '+p(a1,ro)+'L'+p(a1,ri)+'A'+ri+' '+ri+' 0 '+((a1-a0)>Math.PI?1:0)+' 0 '+p(a0,ri)+'Z';}
    var gap=(k==='gaps')?0.07:(k==='glow'?0.05:0), st=(k==='prtg'||k==='solid')?' stroke="#fff" stroke-width="0.8"':'';
    for(i=0;i<seg.length;i++){var c=seg[i][2];if(k==='pastel'&&c!==R&&c!==Y)c=c===G1?'#E3EDB6':'#D1DDF0';o+='<path d="'+a(seg[i][0]+gap,seg[i][1]-gap,(k==='prtg'?4:7)+0.5,13)+'" fill="'+c+'"'+st+(k==='glow'&&c===R?' style="filter:drop-shadow(0 0 2px '+R+')"':'')+'/>';
      var m=(seg[i][0]+seg[i][1])/2, w=(seg[i][1]-seg[i][0])/2;o+='<path d="'+a(m-w+gap,m+gap*0.1,13.5,19)+'" fill="'+c+'" opacity=".85"'+st+'/><path d="'+a(m+gap,m+w-gap,13.5,19)+'" fill="'+c+'" opacity=".7"'+st+'/>';}
    if(k==='prtg')o+='<circle cx="32" cy="22" r="4" fill="#fff"/>';
    return '<svg viewBox="0 0 64 44" width="64" height="44" aria-hidden="true">'+(k==='glow'?'<rect x="1" y="1" width="62" height="42" rx="7" fill="#141a26"/>':'')+o+'</svg>';
  }
  function sbFaceGrid(after){
    var g=h('div','presetgrid');
    SBFACES.forEach(function(x){
      var q=h('button','lookchip');q.type='button';q.setAttribute('data-sbface',x[0]);q.title=x[1];
      q.innerHTML=sbFaceSvg(x[0])+'<span class="pname">'+x[1]+'</span>';
      q.addEventListener('click',function(){sbSetFace(x[0]);if(after)after();refreshUI();render();});g.appendChild(q);
    });
    g.syncFace=function(){var f=sbFace();[].forEach.call(g.children,function(q){q.classList.toggle('on',q.getAttribute('data-sbface')===f);});};
    return g;
  }

  /* the same counting the ring donut does, drawn as tiles; PRTG's table tag puts the sensors into a comment and this reads it */
  function statusRuntime(root,C){
    var body=root.querySelector('.sbody');
    if(!body)return;
    var LABEL={up:'Up',warning:'Warning',down:'Down',ack:'Ack',paused:'Paused',unusual:'Unusual',unknown:'Unknown'};
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
        if(n===13)return 'ack';
        if(n===5||n===14)return 'down';
        if(n===7||n===8||n===9||n===11||n===12)return 'paused';
        return 'unknown';
      }
      if(typeof v==='string'){
        var t=v.replace(/<[^>]*>/g,'').toLowerCase().replace(/^\s+|\s+$/g,'');
        if(t.indexOf('unusual')===0)return 'unusual';
        if(t.indexOf('unknown')===0)return 'unknown';
        if(t.indexOf('up')===0)return 'up';
        if(t.indexOf('warn')===0)return 'warning';
        if(t.indexOf('down')===0)return /acknowledg|\back\b/.test(t)?'ack':'down';
        if(t.indexOf('pause')===0)return 'paused';
      }
      return null;
    }
    try{
      var raw=findJson();
      if(!raw){say('No sensor data');return;}
      var data=JSON.parse(raw), box=(data&&data.objects)?data.objects:data, list=box&&box.sensors;
      if(!list||typeof list.length!=='number'){say('No sensor data');return;}
      var counts={down:0,ack:0,warning:0,unusual:0,up:0,paused:0,unknown:0}, parsed=0, i, k;
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
  var STILES=['up','warning','down','ack','paused','unusual','unknown','total','pctup'];
  function sEffLook(S){var L=S.look;if(L.mode==='prtg'){var m=lookOf('Light card');return m;}return L;}
  function sClassOf(S){return 'pst_'+slugOf(S.name);}
  function statusConfig(S,L){
    var P=donutPalette(L), c={down:P.down,ack:P.ack,warning:P.warning,unusual:P.unusual,up:P.up,paused:P.paused,unknown:P.unknown,total:(L.accent||L.link||'#007DB8')}, fg={}, tiles=[], k;
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
    c.push(r+' .sbody{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:repeat(auto-fit,minmax('+fpx(64)+',1fr));grid-auto-rows:minmax(0,1fr);gap:'+fpx(8)+';margin-top:'+fpx(8)+';}');   /* 1.5.66: Flexible boxes keep one row as they shrink */
    c.push(r+' .stile{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;min-height:0;padding:'+fpx(4)+' '+fpx(6)+';border-radius:'+rad+'px;background:var(--bg);color:var(--fg);text-align:center;overflow:hidden;}');
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

  /* ====================== tiles ====================== */
  /* One object type with six kinds: a stat tile, a string tile, a bar gauge, an interface (traffic) tile, channel chips and channel chips that fit their box.
     All of them read one sensor: its channels (PRTG renders them into an HTML comment) and its state (a class PRTG puts on the item), and draw in the chosen Look. */
  function tileRuntime(root,C){
    var body=root.querySelector('.tbody');
    if(!body)return;
    var K=C.kind;
    function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
    function num(v){if(v===''||v===undefined||v===null)return null;var x=+v;return isFinite(x)?x:null;}
    function say(t){body.innerHTML='<div class="tnone">'+esc(t)+'</div>';root.setAttribute('data-status','message');}
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
    function shown(x){var m=String(x==null?'':x).replace(/,/g,'').match(/^\s*(-?\d+(\.\d+)?)/);return m?+m[1]:null;}
    var chans=[];
    try{
      var raw=findJson();
      if(raw){var data=JSON.parse(raw), box=(data&&data.objects)?data.objects:data;chans=(box&&box.channels)||[];}
    }catch(e0){chans=[];}
    /* PRTG keeps raw values and limits in the device's scale (2894 for 28.94 when the channel divides by 100): work out the factor from the displayed values and convert to display units */
    chans=chans.map(function(c){
      var d=(c.info&&c.info.data&&c.info.data[0])||{};
      d.name=c.name||d.name;
      if(d.lastvalue===undefined||d.lastvalue==='')d.lastvalue=c.lastvalue;
      var k=null, gm=shown(d.graphmax), lv=shown(d.lastvalue);
      if(gm&&+d.graphmaxraw)k=gm/+d.graphmaxraw;
      else if(lv&&+d.lastvalueraw&&!/^\s*</.test(String(d.lastvalue)))k=lv/+d.lastvalueraw;
      if(k&&isFinite(k)&&Math.abs(k-1)>1e-9){
        ['lastvalueraw','graphmaxraw','graphminraw','limitminwarning','limitmaxwarning','limitminerror','limitmaxerror'].forEach(function(f){
          if(d[f]!==''&&d[f]!==undefined&&d[f]!==null&&isFinite(+d[f]))d[f]=+d[f]*k;
        });
      }
      return d;
    });
    /* the sensor's own state, from the class PRTG puts on the item (tlst-sensg, tlst-sensy, ...) */
    var m=(root.className.match(/tlst-sens(\w*)/)||[])[1]||'';
    var sensorState={g:'up',y:'warning',r:'down',q:'down',o:'ack',b:'paused',p:'unusual'}[m.charAt(0)]||(m?'unknown':'up');
    if(/^(dr|ra|rp|gr)/.test(m))sensorState='down';
    function chanState(ch){
      if(sensorState==='paused'||sensorState==='unknown')return sensorState;
      var s=+ch.status;
      if(s===3)return 'up';
      if(s===4)return 'warning';
      if(s===13)return 'ack';
      if(s===5||s===14)return 'down';
      if(s===10)return 'unusual';
      if(s===7||s===8||s===9||s===11||s===12)return 'paused';
      return sensorState;
    }
    function split(v){
      var s=String(v==null?'':v).trim(), mm=s.match(/^([<>]?\s*-?[\d.,]+)\s*(.*)$/);
      return mm?{n:mm[1],u:mm[2]}:{n:s||'\u2013',u:''};
    }
    function valHtml(sv){return esc(sv.n)+(sv.u?'<small>'+esc(sv.u)+'</small>':'');}
    function pick(sel){
      var list=chans.filter(function(c){return +c.id!==-4;});
      if(sel){
        var s=String(sel).toLowerCase();
        var hit=list.filter(function(c){return String(c.id)===s||String(c.name).toLowerCase()===s;})[0]||list.filter(function(c){return String(c.name).toLowerCase().indexOf(s)>=0;})[0];
        if(hit)return hit;
      }
      return list.filter(function(c){return c.primary;})[0]||list[0]||null;
    }
    function nice(x){if(!(x>0))return 1;var p=Math.pow(10,Math.floor(Math.log(x)/Math.LN10)),f=x/p;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p;}
    function range(ch){
      var unit=split(ch.lastvalue).u, min=num(C.min), max=num(C.max);
      if(min===null)min=0;
      if(max===null&&(ch.ispercent||unit==='%'))max=100;
      if(max===null&&num(ch.limitmaxerror)!==null)max=nice(num(ch.limitmaxerror)*1.25);
      if(max===null&&num(ch.limitmaxwarning)!==null)max=nice(num(ch.limitmaxwarning)*1.5);
      if(max===null)max=nice(Math.max(num(ch.graphmaxraw)||0,num(ch.lastvalueraw)||0));
      if(max<=min)max=min+1;
      return {min:min,max:max};
    }
    function limits(ch){
      var L={};
      if(+ch.limitmode===1)['limitminerror','limitminwarning','limitmaxwarning','limitmaxerror'].forEach(function(k){L[k]=num(ch[k]);});
      if(num(C.warn)!==null)L.limitmaxwarning=num(C.warn);
      if(num(C.error)!==null)L.limitmaxerror=num(C.error);
      return L;
    }
    function fmt(x){return Math.abs(x)>=1000?Math.round(x).toLocaleString():String(+x.toFixed(2));}
    function observe(fn){
      var t, last='';
      if(window.ResizeObserver){
        new ResizeObserver(function(){
          var k=root.clientWidth+'x'+root.clientHeight;
          if(k===last)return;
          last=k;clearTimeout(t);t=setTimeout(fn,30);
        }).observe(root);
      }
    }
    var ch, st, sv;
    /* ----- stat tile ----- */
    if(K==='stat'){
      ch=pick(C.channel);if(!ch){say('No channel data');return;}
      st=chanState(ch);sv=split(ch.lastvalue);
      body.innerHTML='<div class="tl-stat" style="color:'+C.c[st]+'">'+valHtml(sv)+'</div><div class="tl-cap"><i class="tl-dot" style="background:'+C.c[st]+'"></i>'+esc(ch.name)+'</div>';
    }
    /* ----- bar gauge ----- */
    else if(K==='bar'){
      ch=pick(C.channel);if(!ch){say('No channel data');return;}
      var r2=range(ch), v2=num(ch.lastvalueraw), L2=limits(ch), ticks='';
      st=chanState(ch);
      var pct=function(x){return (100*Math.max(0,Math.min(1,(x-r2.min)/(r2.max-r2.min)))).toFixed(2)+'%';};
      ['limitminerror','limitminwarning','limitmaxwarning','limitmaxerror'].forEach(function(k){
        if(L2[k]!==null&&L2[k]!==undefined)ticks+='<i class="tl-tick" style="left:'+pct(L2[k])+';background:'+(/error/.test(k)?C.c.down:C.c.warning)+'"></i>';
      });
      body.innerHTML='<div class="tl-row"><div class="tl-cap tl-grow"><i class="tl-dot" style="background:'+C.c[st]+'"></i>'+esc(ch.name)+'</div><div class="tl-big" style="color:'+C.c[st]+'">'+valHtml(split(ch.lastvalue))+'</div></div>'
        +'<div class="tl-track"><div style="width:'+(v2!==null?pct(v2):'0%')+';background:'+C.c[st]+'"></div>'+ticks+'</div>'
        +'<div class="tl-scale"><span>'+fmt(r2.min)+'</span><span>'+fmt(r2.max)+'</span></div>';
    }
    /* ----- string tile: the sensor's message ----- */
    else if(K==='string'){
      var me=root.querySelector('.tmsg'), msg=me?(me.textContent||'').replace(/\s+/g,' ').trim():'';
      if(C.strip){try{msg=msg.replace(new RegExp(C.strip,'i'),'').trim();}catch(e1){}}
      var lc=msg.toLowerCase(), stS=sensorState;
      var hit=function(list){return String(list||'').toLowerCase().split(',').map(function(x){return x.replace(/^\s+|\s+$/g,'');}).filter(Boolean).some(function(w){return lc.indexOf(w)>=0;});};
      if(hit(C.okW))stS='up';
      if(hit(C.infoW))stS='paused';
      if(hit(C.warnW))stS='warning';
      if(hit(C.errW))stS='down';
      body.innerHTML='<div class="tl-strbox"><div class="tl-str" style="color:'+C.c[stS]+'">'+esc(msg||'\u2013')+'</div></div>';
      var sbox=body.querySelector('.tl-strbox'), stxt=body.querySelector('.tl-str');
      var fitStr=function(){
        if(!sbox.clientWidth||!sbox.clientHeight)return;
        var lo=10, hi=160, best=10, mid;
        while(lo<=hi){
          mid=(lo+hi)>>1;stxt.style.fontSize=mid+'px';
          if(stxt.scrollHeight<=sbox.clientHeight+1&&stxt.scrollWidth<=sbox.clientWidth+1){best=mid;lo=mid+1;}else{hi=mid-1;}
        }
        stxt.style.fontSize=best+'px';
      };
      fitStr();observe(fitStr);
    }
    /* ----- interface tile: traffic in and out ----- */
    else if(K==='interface'){
      var byId=function(id,re){return chans.filter(function(c){return +c.id===id;})[0]||chans.filter(function(c){return re.test(c.name);})[0];};
      var cin=byId(0,/traffic in|bytes in/i), cout=byId(1,/traffic out|bytes out/i), ctot=byId(-1,/total/i);
      if(!cin&&!cout){say('No traffic channels');return;}
      var toMbit=function(s){
        var mm=String(s||'').replace(/,/g,'').match(/([\d.]+)\s*([kMGT]?)bit\/s/i);
        return mm?+mm[1]*({'':1e-6,k:1e-3,m:1,g:1e3,t:1e6}[mm[2].toLowerCase()]):null;
      };
      var cap=num(C.cap);
      var util=function(c){
        if(!c)return 0;
        if(cap){var mb=toMbit(c.lastvalue);if(mb!==null)return Math.min(1,mb/cap);}
        var a=num(c.lastvalueraw), b=num(c.graphmaxraw);
        return a!==null&&b?Math.min(1,a/b):0;
      };
      var line=function(arrow,col,c){
        var vc=c&&chanState(c)!=='up'?C.c[chanState(c)]:C.text;
        return '<span class="tl-arr" style="color:'+col+'">'+arrow+'</span><div class="tl-mini"><div style="width:'+Math.max(1,100*util(c)).toFixed(1)+'%;background:'+col+'"></div></div><span class="tl-num" style="color:'+vc+'">'+valHtml(split(c?c.lastvalue:''))+'</span>';
      };
      var foot=cap?'Link '+(cap>=1000?fmt(cap/1000)+' Gbit/s':fmt(cap)+' Mbit/s'):'vs. peak';
      body.innerHTML='<div class="tl-lines">'+line('\u2193',C.c.up,cin)+line('\u2191',C.accent,cout)+'</div><div class="tl-foot"><span>'+(ctot?'Total '+esc(ctot.lastvalue):'')+'</span><span>'+esc(foot)+'</span></div>';
    }
    /* ----- channel chips ----- */
    else if(K==='chips'||K==='chipsfit'){
      var hide=String(C.hide==null?'Downtime':C.hide).toLowerCase().split(',').map(function(s){return s.replace(/^\s+|\s+$/g,'');}).filter(Boolean);
      var only=C.only?String(C.only).toLowerCase().split(',').map(function(s){return s.replace(/^\s+|\s+$/g,'');}):null;
      var list=chans.filter(function(c){
        var nm=String(c.name).toLowerCase();
        if(only)return only.indexOf(nm)>=0;
        return hide.indexOf(nm)<0&&+c.id!==-4;
      });
      if(only)list.sort(function(a,b){return only.indexOf(String(a.name).toLowerCase())-only.indexOf(String(b.name).toLowerCase());});
      if(!list.length){say('No channels');return;}
      var chipHtml=list.map(function(c){
        var s=chanState(c);
        return '<div class="tl-chip" style="--cc:'+C.c[s]+'"><div class="tl-cn">'+esc(c.name)+'</div><div class="tl-cv">'+valHtml(split(c.lastvalue))+'</div></div>';
      }).join('');
      if(K==='chips'){
        body.innerHTML='<div class="tl-chips" style="grid-template-columns:repeat(auto-fill,minmax('+(num(C.chipw)||120)+'px,1fr))">'+chipHtml+'</div>';
      }else{
        body.innerHTML='<div class="tl-chips tl-fit">'+chipHtml+'</div>';
        var grid=body.querySelector('.tl-fit'), GAP=6, ratio=num(C.ratio)||2.4, fixedCols=num(C.cols);
        var longest=list.reduce(function(mx,c){var s2=split(c.lastvalue);return {n:Math.max(mx.n,String(c.name).length),v:Math.max(mx.v,(s2.n+' '+s2.u).length)};},{n:4,v:4});
        var layout=function(){
          var W=grid.clientWidth, H=grid.clientHeight, N=list.length, best=null, cols, rows, cw, chh, hh, score;
          if(!W||!H)return;
          for(cols=1;cols<=N;cols++){
            if(fixedCols&&cols!==fixedCols)continue;
            rows=Math.ceil(N/cols);cw=(W-GAP*(cols-1))/cols;chh=(H-GAP*(rows-1))/rows;
            if(cw<=0||chh<=0)continue;
            hh=Math.min(chh,cw/ratio);score=hh-(rows*cols-N)*0.01;
            if(!best||score>best.score)best={cols:cols,rows:rows,cw:cw,ch:chh,score:score};
          }
          if(!best)return;
          grid.style.gridTemplateColumns='repeat('+best.cols+', minmax(0, 1fr))';
          grid.style.gridAutoRows=Math.floor(best.ch)+'px';
          var inner=best.cw-14, vf=Math.max(11,Math.min(best.ch*0.40,inner/(longest.v*0.58),96)), nf=Math.max(9,Math.min(best.ch*0.22,inner/(longest.n*0.55),vf*0.6,40));
          grid.style.setProperty('--tl-vf',vf.toFixed(1)+'px');
          grid.style.setProperty('--tl-nf',nf.toFixed(1)+'px');
          grid.style.setProperty('--tl-pad',Math.max(4,Math.min(best.ch*0.1,14)).toFixed(1)+'px');
        };
        layout();observe(layout);
      }
    }
    root.setAttribute('data-status','ok');
  }
  var TKINDS=[['stat','Stat tile'],['string','String tile'],['bar','Bar gauge'],['interface','Interface traffic tile'],['chips','Channel chips'],['chipsfit','Channel chips (fit the box)']];
  /* a small picture of each tile kind, for the Kind pictures */
  function tKindSvg(k){
    var G1='#B8C419',Y='#F5C500',R='#E30613',N='#E3E6EC',D='#1d2433',M='#9aa0ad',B='#1f6fe5',o='<rect x="1" y="1" width="62" height="42" rx="5" fill="#fff" stroke="#dfe3ea"/>';
    o+='<rect x="6" y="6" width="22" height="3.4" rx="1.2" fill="'+D+'"/>';
    function t(x,y,sz,c,txt,a){return '<text x="'+x+'" y="'+y+'" font-size="'+sz+'" font-weight="600" fill="'+c+'" font-family="Inter,Segoe UI,Arial,sans-serif"'+(a?' text-anchor="'+a+'"':'')+'>'+txt+'</text>';}
    function chip(x,y,w,hh,c,big){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+hh+'" rx="1.2" fill="#f1f2f4"/><rect x="'+x+'" y="'+y+'" width="1.4" height="'+hh+'" fill="'+c+'"/><rect x="'+(x+3)+'" y="'+(y+2.2)+'" width="'+(w*0.5).toFixed(1)+'" height="1.6" rx=".6" fill="'+M+'"/><rect x="'+(x+3)+'" y="'+(y+(big?5.6:5))+'" width="'+(w*(big?0.38:0.3)).toFixed(1)+'" height="'+(big?3.6:2.6)+'" rx=".8" fill="'+c+'"/>';}
    if(k==='stat')o+=t(6,32,19,G1,'23')+t(29,32,8,G1,'%')+'<circle cx="7.5" cy="37.5" r="1.6" fill="'+G1+'"/><rect x="11" y="36.6" width="16" height="1.8" rx=".8" fill="'+M+'"/>';
    else if(k==='string')o+=t(6,28,12.5,G1,'Running');
    else if(k==='bar')o+='<circle cx="7.5" cy="17.5" r="1.6" fill="'+Y+'"/><rect x="11" y="16.6" width="14" height="1.8" rx=".8" fill="'+M+'"/>'+t(58,21,9,Y,'72','end')
      +'<rect x="6" y="25" width="52" height="4.5" rx="1.5" fill="'+N+'"/><rect x="6" y="25" width="37" height="4.5" rx="1.5" fill="'+Y+'"/><rect x="48" y="23.2" width="1.3" height="8" fill="'+R+'"/>'
      +'<rect x="6" y="34" width="3" height="1.6" fill="'+M+'"/><rect x="53" y="34" width="5" height="1.6" fill="'+M+'"/>';
    else if(k==='interface'){
      o+='<path d="M8 15.5v5.5M5.8 18.8L8 21l2.2-2.2" fill="none" stroke="'+G1+'" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>';
      o+='<rect x="13" y="17.4" width="28" height="2.2" rx="1" fill="'+N+'"/><rect x="13" y="17.4" width="12" height="2.2" rx="1" fill="'+G1+'"/><rect x="45" y="16.4" width="13" height="4" rx="1" fill="'+D+'"/>';
      o+='<path d="M8 32.5V27M5.8 29.2L8 27l2.2 2.2" fill="none" stroke="'+B+'" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>';
      o+='<rect x="13" y="28.4" width="28" height="2.2" rx="1" fill="'+N+'"/><rect x="13" y="28.4" width="4" height="2.2" rx="1" fill="'+B+'"/><rect x="47" y="27.4" width="11" height="4" rx="1" fill="'+D+'"/>';
      o+='<rect x="6" y="37" width="16" height="1.6" rx=".6" fill="'+M+'"/>';
    }
    else if(k==='chips'){var cc=[G1,G1,Y,G1,R],i;for(i=0;i<5;i++)o+=chip(6+(i%3)*14,13+Math.floor(i/3)*10,12.5,8.5,cc[i]);}
    else if(k==='chipsfit'){var cf=[G1,G1,Y,G1,R],j;for(j=0;j<5;j++)o+=chip(5+(j%3)*18.2,12+Math.floor(j/3)*15,17,13.5,cf[j],true);}
    return '<svg viewBox="0 0 64 44" width="64" height="44" aria-hidden="true">'+o+'</svg>';
  }
  /* changing the kind: the name and the size follow when they were still the old kind's */
  function setTileKind(v){
    var old=null,nu=null;
    TLPRESETS.forEach(function(x){if((x.fam||'tile')!==(TL.fam||'tile')||x.set)return;if(x.kind===TL.kind)old=x;if(x.kind===v)nu=x;});
    if(old&&nu){if(TL.name===old.name)TL.name=nu.name;if(+TL.initW===old.w&&+TL.initH===old.h){TL.initW=nu.w;TL.initH=nu.h;}if(+TL.fitW===old.w&&+TL.fitH===old.h){TL.fitW=nu.w;TL.fitH=nu.h;}}
    TL.kind=v;
  }
  /* a grid of kind pictures; one click changes the kind */
  function tKindGrid(fam){
    var g=h('div','presetgrid tkindgrid');
    (fam==='ind'?IKINDS:TKINDS).forEach(function(x){
      var q=h('button','lookchip');q.type='button';q.setAttribute('data-kind',x[0]);q.title=x[1];
      q.innerHTML=(fam==='ind'?iKindSvg(x[0]):tKindSvg(x[0]))+'<span class="pname">'+x[1]+'</span>';
      q.addEventListener('click',function(){setTileKind(x[0]);refreshUI();render();});g.appendChild(q);
    });
    g.syncKind=function(){[].forEach.call(g.children,function(q){q.classList.toggle('on',q.getAttribute('data-kind')===TL.kind);});};
    return g;
  }
  var TLPRESETS=[
    {id:'stat',cat:'Built in',name:'Stat tile',kind:'stat',w:260,h:170,sub:''},
    {id:'string',cat:'Built in',name:'String tile',kind:'string',w:300,h:120,sub:''},
    {id:'bar',cat:'Built in',name:'Bar gauge',kind:'bar',w:340,h:140,sub:''},
    {id:'interface',cat:'Built in',name:'Interface traffic tile',kind:'interface',w:360,h:170,sub:'',cap:''},
    {id:'chips',cat:'Built in',name:'Channel chips',kind:'chips',w:420,h:210,sub:''},
    {id:'chipsfit',cat:'Built in',name:'Channel chips (fit)',kind:'chipsfit',w:420,h:210,sub:''},
    {id:'ind_lamps',fam:'ind',cat:'Built in',name:'State lamps',kind:'lamps',w:280,h:230},
    {id:'ind_onoff',fam:'ind',cat:'Built in',name:'On/Off indicator',kind:'onoff',w:260,h:110},
    {id:'ind_tank',fam:'ind',cat:'Built in',name:'Tank level',kind:'tank',w:260,h:320},
    {id:'ind_silo',fam:'ind',cat:'Built in',name:'Silo level',kind:'tank',w:260,h:320,set:{shape:'silo'}},
    {id:'ind_equip',fam:'ind',cat:'Built in',name:'Equipment symbol',kind:'equip',w:160,h:170},
    {id:'ind_pv',fam:'ind',cat:'Built in',name:'Process value',kind:'pv',w:380,h:250},
    {id:'ind_count',fam:'ind',cat:'Built in',name:'Countdown',kind:'count',w:200,h:230}
  ];
  function blankTL(){
    return {type:'tile',kind:'stat',cat:'Tiles',name:'Stat tile',fname:'',titleMode:'object',title:'',sub:'',
      channel:'',min:'',max:'',warn:'',error:'',cap:'',hide:'Downtime',only:'',cols:'',ratio:'',chipw:120,strip:'',okW:'',infoW:'',warnW:'',errW:'',
      initW:260,initH:170,fit:true,fitW:260,fitH:170,look:lookOf('PRTG new UI')};
  }
  function tileFromPreset(id){
    var T_=blankTL(), p=null;
    TLPRESETS.forEach(function(x){if(x.id===id)p=x;});
    if(p){T_.kind=p.kind;T_.name=p.name;T_.initW=p.w;T_.initH=p.h;T_.fitW=p.w;T_.fitH=p.h;T_.sub=p.sub||'';}
    return T_;
  }
  function tEffLook(S){var L=S.look;if(L.mode==='prtg'){return lookOf('Light card');}return L;}
  function tClassOf(S){return 'ptl_'+slugOf(S.name);}
  function tileConfig(S,L){
    var P=donutPalette(L), cardFill=(L.card)?(((L.cardA==null?100:L.cardA)<100)?tint(L.cardBg,(L.cardA==null?100:L.cardA)/100):L.cardBg):'#FFFFFF';
    return {kind:S.kind,channel:clean(S.channel),min:clean(S.min),max:clean(S.max),warn:clean(S.warn),error:clean(S.error),cap:clean(S.cap),
      hide:clean(S.hide),only:clean(S.only),cols:clean(S.cols),ratio:clean(S.ratio),chipw:Number(S.chipw)||120,strip:String(S.strip||'').replace(/[<>"]/g,'').slice(0,80),
      okW:clean(S.okW),infoW:clean(S.infoW),warnW:clean(S.warnW),errW:clean(S.errW),
      c:{up:P.up,warning:P.warning,down:P.down,ack:P.ack,unusual:P.unusual,paused:P.paused,unknown:P.unknown},
      text:L.text||'#0F172A',accent:(L.accent||L.link||'#007DB8')};
  }
  function tileCss(S,cls,L){
    var r='.'+cls, c=gFrameCss({engine:'ring'},cls,L), muted=(L.muted||L.headColor||'#6B7280'), fillA=(L.cardA==null?100:L.cardA),
        cardFill=(L.card)?((fillA<100)?tint(L.cardBg,fillA/100):L.cardBg):'#FFFFFF', base=(cardFill.charAt(0)==='#'?cardFill:'#FFFFFF'),
        track=blend(base,L.text,0.12), chipBg=blend(base,L.text,0.05), line=blend(base,L.text,0.14), rad=Math.max(2,Math.min(Number(L.radius)||4,12)), fam=familyStack(L.font);
    c.push(r+'{container-type:size;}');
    c.push(r+' .gsub{flex:0 0 auto;color:'+muted+';font-size:12px;line-height:1.3;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}');
    c.push(r+' .tbody{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;justify-content:center;margin-top:6px;position:relative;font-family:'+fam+';color:'+L.text+';}');
    c.push(r+' .tbody small{font-size:.5em;font-weight:500;margin-left:3px;opacity:.85;}');
    c.push(r+' .tnone{display:flex;align-items:center;justify-content:center;flex:1;color:'+muted+';font-size:13px;}');
    c.push(r+' .tl-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;vertical-align:middle;}');
    c.push(r+' .tl-cap{color:'+muted+';font-size:13px;font-size:clamp(11px,7cqh,15px);line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}');
    c.push(r+' .tl-grow{flex:1 1 auto;}');
    c.push(r+' .tl-stat{font-weight:600;font-size:34px;font-size:clamp(22px,38cqh,96px);line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap;margin-bottom:6px;}');
    c.push(r+' .tl-row{display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:0;margin-bottom:8px;}');
    c.push(r+' .tl-big{font-weight:600;font-size:26px;font-size:clamp(18px,22cqh,48px);line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap;}');
    c.push(r+' .tl-track{position:relative;height:12px;height:clamp(8px,9cqh,16px);background:'+track+';border-radius:'+rad+'px;flex:none;}');
    c.push(r+' .tl-track>div{height:100%;border-radius:'+rad+'px;}');
    c.push(r+' .tl-tick{position:absolute;top:-3px;bottom:-3px;width:2px;margin-left:-1px;}');
    c.push(r+' .tl-scale{display:flex;justify-content:space-between;color:'+muted+';font-size:11px;margin-top:4px;}');
    c.push(r+' .tl-strbox{flex:1;min-height:0;display:flex;align-items:center;overflow:hidden;}');
    c.push(r+' .tl-str{width:100%;font-weight:600;line-height:1.15;overflow-wrap:break-word;}');
    c.push(r+' .tl-lines{flex:1;display:grid;grid-template-columns:auto 1fr auto;align-content:center;gap:8px 10px;align-items:center;}');
    c.push(r+' .tl-arr{font-size:20px;font-size:clamp(13px,12cqh,24px);line-height:1;}');
    c.push(r+' .tl-mini{height:6px;background:'+track+';border-radius:'+rad+'px;overflow:hidden;}');
    c.push(r+' .tl-mini>div{height:100%;}');
    c.push(r+' .tl-num{font-weight:600;font-size:20px;font-size:clamp(15px,13cqh,30px);text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;}');
    c.push(r+' .tl-foot{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:'+muted+';white-space:nowrap;flex:none;margin-top:6px;}');
    c.push(r+' .tl-chips{display:grid;gap:6px;overflow:auto;align-content:start;flex:1;min-height:0;}');
    c.push(r+' .tl-chip{background:'+chipBg+';border:1px solid '+line+';border-left:3px solid var(--cc);border-radius:'+rad+'px;padding:5px 8px;min-width:0;}');
    c.push(r+' .tl-cn{font-size:11px;color:'+muted+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}');
    c.push(r+' .tl-cv{font-size:15px;font-weight:600;color:var(--cc);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}');
    c.push(r+' .tl-fit{overflow:hidden;}');
    c.push(r+' .tl-fit .tl-chip{display:flex;flex-direction:column;justify-content:center;padding:0 var(--tl-pad,8px);overflow:hidden;}');
    c.push(r+' .tl-fit .tl-cn{font-size:var(--tl-nf,11px);line-height:1.2;}');
    c.push(r+' .tl-fit .tl-cv{font-size:var(--tl-vf,15px);line-height:1.15;}');
    return c.join('\n');
  }
  function tileScript(S,L){
    return '(function(){\n  var root=document.getElementById("<@itemid>");\n  if(!root)return;\n  var CFG='+JSON.stringify(tileConfig(S,L))+';\n  ('+tileRuntime.toString()+')(root,CFG);\n})();';
  }
  function buildTile(S){
    var ind=(S.fam==='ind'), cls=tClassOf(S), L=tEffLook(S), css=tileCss(S,cls,L)+(ind?'\n'+indCss(S,cls,L):''), o=[], tm=S.titleMode||'object';
    var titleInner=(tm==='custom')?clean(S.title):'<#objectproperty name="Name" id="<@objectid>">', w=parseInt(S.initW,10), h_=parseInt(S.initH,10), sub=clean(S.sub);
    o.push('<!'+'--'+clean(S.cat||'Tiles')+': '+clean(S.name||'Tile')+'-->');
    o.push('');
    o.push('<div class="map_object map_graph '+cls+' <#sensor type="colorclassofstate" prefix="tlst-" id="<@objectid>">" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+((w>0&&h_>0)?' initialwidth="'+Math.min(w,4000)+'" initialheight="'+Math.min(h_,4000)+'"':'')+' data-status="loading" style="overflow:hidden;<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('<#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('<#mapobject type="htmlbefore" subid="<@subid>">');
    o.push('<#checkobjecttype objecttype="sensor" nicemessage="true" id="<@objectid>">');
    if(needsFontLink(L))o.push(fontLinkOf(L));
    o.push('<style>');o.push(css);o.push('</style>');
    o.push('  <div class="gbox">');
    if(tm!=='none')o.push('    <div class="gtitle"><b>'+titleInner+'</b></div>');
    if(sub)o.push('    <div class="gsub">'+sub+'</div>');
    o.push('    <div class="tbody"></div>');
    if(S.kind==='string')o.push('    <div class="tmsg" style="display:none"><#objectstatus name="message" id="<@objectid>"></div>');
    o.push('    <!'+'--');
    o.push('    {');
    o.push('      "objects":<#table');
    o.push('      id="<@objectid>"');
    o.push("      output='json'");
    o.push("      noraw='1'");
    o.push("      content='channels'");
    o.push("      sortby='name'");
    o.push("      count='*'");
    o.push("      columns='name=textraw,info=treejson,lastvalue'>");
    o.push('    }');
    o.push('    -->');
    o.push('  </div>');
    o.push('<#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    o.push('');
    o.push('<scr'+'ipt>');o.push(ind?indScript(S,L):tileScript(S,L));o.push('<\/script>');
    return o.join('\n')+'\n';
  }
  /* sample channels for the preview, one set per kind */
  function tileSample(S){
    function ch(id,name,val,raw,st,extra){var d={id:id,name:name,lastvalue:val,lastvalueraw:raw,status:st,primary:id===0};if(extra)for(var k in extra)d[k]=extra[k];return {name:name,lastvalue:val,info:{data:[d]}};}
    var k=S.kind;
    if(k==='bar')return {cls:'sensy',chans:[ch(0,'CPU Load','72 %',72,4,{ispercent:true,limitmode:1,limitmaxwarning:70,limitmaxerror:90})],msg:''};
    if(k==='string')return {cls:'sensg',chans:[],msg:'Running'};
    if(k==='interface')return {cls:'sensg',chans:[ch(0,'Traffic In','412 Mbit/s',51500000,3,{graphmaxraw:125000000}),ch(1,'Traffic Out','96 Mbit/s',12000000,3,{graphmaxraw:125000000}),ch(-1,'Traffic Total','508 Mbit/s',63500000,3)],msg:''};
    if(k==='chips'||k==='chipsfit')return {cls:'sensg',chans:[ch(0,'Ping','12 ms',12,3),ch(1,'Minimum','9 ms',9,3),ch(2,'Maximum','41 ms',41,4),ch(3,'Packet Loss','0 %',0,3),ch(4,'Jitter','18 ms',18,5),ch(5,'Downtime','0 %',0,3)],msg:''};
    return {cls:'sensg',chans:[ch(0,'CPU Load','23 %',23,3)],msg:''};
  }
  function drawTilePreview(){
    var ind=(TL.fam==='ind'), L=tEffLook(TL), cls=tClassOf(TL), css=tileCss(TL,cls,L)+(ind?'\n'+indCss(TL,cls,L):''), tm=TL.titleMode||'object', title=(tm==='none')?'':(tm==='custom'?clean(TL.title):(ind?'Line 3':'Core switch')), sub=clean(TL.sub), root, gb, smp=ind?indSample(TL):tileSample(TL);
    setStyle(css);applyFont(L);
    var w=parseInt(document.getElementById('owidth').value,10)||300, hh=parseInt(document.getElementById('oheight').value,10)||150;
    var zs=eoSz(TL,w,hh);w=zs[0];hh=zs[1];
    prevEl.className='';
    prevEl.innerHTML='<div id="mapshow" class="map-body"><div class="map_object map_graph '+cls+' tlst-'+smp.cls+'" id="ptprev_t" style="position:relative;overflow:hidden;width:'+w+'px;height:'+hh+'px;"><div class="gbox">'
      +(title?'<div class="gtitle"><b>'+esc(title)+'</b></div>':'')+(sub?'<div class="gsub">'+esc(sub)+'</div>':'')+'<div class="tbody"></div>'+(TL.kind==='string'?'<div class="tmsg" style="display:none">'+esc(smp.msg)+'</div>':'')+'</div></div></div>';
    root=prevEl.querySelector('.map_object');gb=prevEl.querySelector('.gbox');
    gb.appendChild(document.createComment('\n{"objects":{"prtg-version":"26.3","channels":'+JSON.stringify(smp.chans)+'}}\n'));
    try{if(ind){var icf=JSON.parse(JSON.stringify(indConfig(TL,L)));icf.sample=true;indRuntime(root,icf);}else tileRuntime(root,JSON.parse(JSON.stringify(tileConfig(TL,L))));}
    catch(err){if(window.console)console.error('tile preview',err);}
    applyBg(L);
  }

  /* ====================== industrial (OT) objects, 1.5.68 ======================
     An Industrial object is a Tile underneath (TYPE 'tile', TL.fam 'ind'): the same file shape, channels, looks and Flexible.
     It has its own kinds, its own drawing code (indRuntime, so Tile files stay as they were) and the category Industrial. */
  var IKINDS=[['lamps','State lamps'],['onoff','On/Off'],['tank','Tank / level'],['equip','Equipment'],['pv','Process value'],['count','Countdown']];
  var IEQ=[['pump','Pump'],['motor','Motor'],['valve','Valve'],['fan','Fan'],['conveyor','Conveyor']];
  function tlFam(){return (TYPE==='tile'&&TL&&TL.fam==='ind')?'ind':'tile';}
  function blankInd(){
    var T_=blankTL();
    T_.fam='ind';T_.kind='lamps';T_.cat='Industrial';T_.name='State lamps';T_.hide='';
    T_.lamps='RUN, STOP, ERROR, MAINT';T_.rows='';T_.onW='On';T_.offW='Off';T_.onIf='';T_.bad='none';T_.oStyle='lamp';
    T_.shape='tank';T_.fill='#4F8DDB';T_.chan2='';T_.eq='pump';T_.eLay='stack';T_.upW='';T_.sp='';T_.trend=true;T_.cStyle='ring';
    T_.initW=280;T_.initH=230;T_.fitW=280;T_.fitH=230;
    return T_;
  }
  function indFromPreset(id){
    var T_=blankInd(), p=null;
    TLPRESETS.forEach(function(x){if(x.id===id&&x.fam==='ind')p=x;});
    if(p){T_.kind=p.kind;T_.name=p.name;T_.initW=p.w;T_.initH=p.h;T_.fitW=p.w;T_.fitH=p.h;if(p.set)for(var k in p.set)T_[k]=p.set[k];}
    return T_;
  }
  /* a small picture of each industrial kind, for the Kind pictures */
  function iKindSvg(k){
    var G1='#B8C419',Y='#F5C500',R='#E30613',N='#E3E6EC',D='#1d2433',M='#9aa0ad',B='#4F8DDB',o='<rect x="1" y="1" width="62" height="42" rx="5" fill="#fff" stroke="#dfe3ea"/>';
    if(k==='lamps'){var lc=[G1,N,N,N],i;for(i=0;i<4;i++)o+='<rect x="'+(6+(i%2)*27)+'" y="'+(8+Math.floor(i/2)*15)+'" width="24" height="11" rx="2" fill="#f1f2f4"/><circle cx="'+(11+(i%2)*27)+'" cy="'+(13.5+Math.floor(i/2)*15)+'" r="3" fill="'+lc[i]+'"/><rect x="'+(16+(i%2)*27)+'" y="'+(12.6+Math.floor(i/2)*15)+'" width="10" height="1.8" rx=".8" fill="'+M+'"/>';}
    else if(k==='onoff')o+='<circle cx="17" cy="22" r="9" fill="'+G1+'"/><rect x="31" y="17" width="22" height="3.4" rx="1.2" fill="'+D+'"/><rect x="31" y="24" width="14" height="2.4" rx="1" fill="'+M+'"/>';
    else if(k==='tank')o+='<rect x="10" y="6" width="18" height="32" rx="4" fill="#f7f8fa" stroke="'+M+'"/><rect x="10.5" y="18" width="17" height="19.5" rx="3.5" fill="'+B+'"/><rect x="10" y="12" width="18" height="1" fill="'+Y+'"/><rect x="34" y="24" width="18" height="5" rx="1.5" fill="'+D+'"/>';
    else if(k==='equip')o+='<circle cx="32" cy="23" r="13" fill="#F2F6DA" stroke="#9AA514" stroke-width="2"/><path d="M32 10H47V16" fill="none" stroke="#9AA514" stroke-width="2"/><path d="M28 17L38 23L28 29Z" fill="#9AA514"/>';
    else if(k==='pv')o+='<rect x="6" y="7" width="20" height="7" rx="1.5" fill="'+D+'"/><rect x="6" y="22" width="10" height="4" fill="#F7B4B7"/><rect x="16" y="22" width="6" height="4" fill="#FCE599"/><rect x="22" y="22" width="20" height="4" fill="#E4EABA"/><rect x="42" y="22" width="6" height="4" fill="#FCE599"/><rect x="48" y="22" width="10" height="4" fill="#F7B4B7"/><path d="M28 30l2.5 3.5h-5z" fill="'+D+'"/><path d="M6 38l8-2 8 1 8-3 8 1 8-2 8 1" fill="none" stroke="'+B+'" stroke-width="1.3"/>';
    else if(k==='count')o+='<circle cx="32" cy="22" r="13" fill="none" stroke="'+N+'" stroke-width="4"/><path d="M32 9a13 13 0 0 1 9.2 3.8" fill="none" stroke="'+Y+'" stroke-width="4" stroke-linecap="round"/><text x="32" y="25.5" font-size="9" font-weight="700" text-anchor="middle" fill="'+D+'" font-family="Inter,Segoe UI,Arial,sans-serif">23</text>';
    return '<svg viewBox="0 0 64 44" width="64" height="44" aria-hidden="true">'+o+'</svg>';
  }
  function indConfig(S,L){
    var P=donutPalette(L), fillA=(L.cardA==null?100:L.cardA), cardFill=(L.card)?((fillA<100)?tint(L.cardBg,fillA/100):L.cardBg):'#FFFFFF', base=(cardFill.charAt(0)==='#'?cardFill:'#FFFFFF');
    var w=function(v){return clean(v).slice(0,200);};
    return {kind:S.kind,channel:clean(S.channel),chan2:clean(S.chan2),min:clean(S.min),max:clean(S.max),warn:clean(S.warn),error:clean(S.error),
      lamps:w(S.lamps),rows:w(S.rows),only:w(S.only),onW:w(S.onW),offW:w(S.offW),onIf:w(S.onIf),bad:(S.bad==='on'||S.bad==='off')?S.bad:'none',
      oStyle:(S.oStyle==='switch'||S.oStyle==='word')?S.oStyle:'lamp',shape:(S.shape==='silo')?'silo':'tank',fill:/^#[0-9a-fA-F]{6}$/.test(S.fill||'')?S.fill:'#4F8DDB',
      eq:IEQ.some(function(x){return x[0]===S.eq;})?S.eq:'pump',eLay:(S.eLay==='row')?'row':'stack',upW:w(S.upW),sp:clean(S.sp),trend:S.trend!==false,cStyle:(S.cStyle==='pill')?'pill':'ring',
      c:{up:P.up,warning:P.warning,down:P.down,ack:P.ack,unusual:P.unusual,paused:P.paused,unknown:P.unknown},
      text:L.text||'#0F172A',muted:(L.muted||L.headColor||'#6B7280'),base:base,off:blend(base,L.text||'#0F172A',0.2)};
  }
  function indCss(S,cls,L){
    var r='.'+cls, muted=(L.muted||L.headColor||'#6B7280'), fillA=(L.cardA==null?100:L.cardA),
        cardFill=(L.card)?((fillA<100)?tint(L.cardBg,fillA/100):L.cardBg):'#FFFFFF', base=(cardFill.charAt(0)==='#'?cardFill:'#FFFFFF'),
        soft=blend(base,L.text,0.05), line=blend(base,L.text,0.14), edge=blend(base,L.text,0.42), rad=Math.max(2,Math.min(Number(L.radius)||4,12)), c=[];
    c.push(r+' .in-lamps{display:grid;grid-template-columns:repeat(auto-fit,minmax('+fpx(76)+',1fr));gap:'+fpx(8)+';align-content:start;}');
    c.push(r+' .in-lamp{display:flex;align-items:center;gap:'+fpx(8)+';padding:'+fpx(8)+' '+fpx(10)+';border-radius:'+rad+'px;background:'+soft+';font-size:12px;font-weight:700;letter-spacing:.6px;color:'+muted+';white-space:nowrap;overflow:hidden;}');
    c.push(r+' .in-lamp i{flex:none;width:'+fpx(14)+';height:'+fpx(14)+';border-radius:50%;background:'+blend(base,L.text,0.18)+';}');
    c.push(r+' .in-lamp.on{color:'+L.text+';}');
    c.push(r+' .in-rows{display:flex;flex-direction:column;gap:'+fpx(5)+';margin-top:'+fpx(10)+';padding-top:'+fpx(8)+';border-top:1px solid '+line+';font-size:12px;}');
    c.push(r+' .in-r{display:flex;justify-content:space-between;gap:8px;min-width:0;}');
    c.push(r+' .in-r span{color:'+muted+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}');
    c.push(r+' .in-r b{font-weight:700;white-space:nowrap;}');
    c.push(r+' .in-oo{display:flex;align-items:center;gap:'+fpx(12)+';flex:1;min-height:0;}');
    c.push(r+' .in-oo-lamp>i{flex:none;width:'+fpx(40)+';height:'+fpx(40)+';border-radius:50%;box-shadow:inset 0 -4px 8px rgba(0,0,0,.15);}');
    c.push(r+' .in-oo-w{font-size:18px;font-weight:600;line-height:1.15;min-width:0;overflow:hidden;text-overflow:ellipsis;}');
    c.push(r+' .in-oo-sw{justify-content:space-between;}');
    c.push(r+' .in-sw{flex:none;width:'+fpx(56)+';height:'+fpx(30)+';border-radius:'+fpx(15)+';display:flex;align-items:center;justify-content:flex-start;padding:'+fpx(3)+';box-sizing:border-box;}');
    c.push(r+' .in-sw.on{justify-content:flex-end;}');
    c.push(r+' .in-sw>i{width:'+fpx(24)+';height:'+fpx(24)+';border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);}');
    c.push(r+' .in-badge{display:inline-block;font-size:13px;font-weight:700;letter-spacing:1px;border-radius:'+Math.min(rad,4)+'px;padding:'+fpx(5)+' '+fpx(11)+';white-space:nowrap;}');
    c.push(r+' .in-tankrow{display:flex;gap:'+fpx(14)+';align-items:stretch;flex:1;min-height:0;}');
    c.push(r+' .in-vessel{position:relative;flex:none;width:40%;max-width:'+fpx(120)+';min-height:'+fpx(60)+';}');
    c.push(r+' .in-tank{position:absolute;top:0;left:0;right:0;bottom:0;border:2px solid '+edge+';border-radius:'+fpx(12)+';overflow:hidden;background:'+soft+';box-sizing:border-box;}');
    c.push(r+' .in-fill{position:absolute;left:0;right:0;bottom:0;}');
    c.push(r+' .in-lim{position:absolute;left:0;right:0;height:0;border-top:2px dashed;}');
    c.push(r+' .in-lim.e{border-top-style:solid;}');
    c.push(r+' .in-vessel svg{position:absolute;top:0;left:0;width:100%;height:100%;}');
    c.push(r+' .in-tv{display:flex;flex-direction:column;justify-content:flex-end;gap:'+fpx(4)+';min-width:0;}');
    c.push(r+' .in-tvn{font-size:30px;font-weight:700;line-height:1;white-space:nowrap;font-variant-numeric:tabular-nums;}');
    c.push(r+' .in-tv2{font-size:13px;color:'+muted+';white-space:nowrap;}');
    c.push(r+' .in-tv .in-badge{align-self:flex-start;font-size:11px;letter-spacing:.6px;padding:'+fpx(3)+' '+fpx(7)+';margin-top:'+fpx(4)+';}');
    c.push(r+' .in-eq{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:'+fpx(6)+';}');
    c.push(r+' .in-eq.row{flex-direction:row;justify-content:flex-start;gap:'+fpx(10)+';}');
    c.push(r+' .in-eq svg{flex:1 1 auto;min-height:0;width:100%;}');
    c.push(r+' .in-eq.row svg{flex:none;width:auto;height:100%;max-width:45%;}');
    c.push(r+' .in-eqv{font-size:14px;font-weight:600;white-space:nowrap;display:flex;align-items:center;gap:6px;}');
    c.push(r+' .in-eq.row .in-eqv{font-size:18px;}');
    c.push(r+' .in-eqv i{width:'+fpx(8)+';height:'+fpx(8)+';border-radius:50%;}');
    c.push(r+' .in-pvh{display:flex;align-items:baseline;gap:'+fpx(8)+';flex-wrap:wrap;}');
    c.push(r+' .in-pvn{font-size:40px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap;}');
    c.push(r+' .in-pvx{margin-left:auto;font-size:12px;color:'+muted+';white-space:nowrap;}');
    c.push(r+' .in-pvx b{color:'+L.text+';}');
    c.push(r+' .in-zw{position:relative;margin-top:'+fpx(12)+';}');
    c.push(r+' .in-zone{height:'+fpx(12)+';border-radius:3px;overflow:hidden;display:flex;}');
    c.push(r+' .in-zone>span{height:100%;}');
    c.push(r+' .in-spk{position:absolute;top:50%;width:2px;height:'+fpx(22)+';transform:translate(-50%,-50%);background:'+L.text+';opacity:.55;}');
    c.push(r+' .in-mk{position:relative;height:'+fpx(10)+';}');
    c.push(r+' .in-mk>i{position:absolute;top:0;transform:translateX(-50%);width:0;height:0;border-left:'+fpx(7)+' solid transparent;border-right:'+fpx(7)+' solid transparent;border-bottom:'+fpx(9)+' solid '+L.text+';}');
    c.push(r+' .in-sc{position:relative;height:'+fpx(14)+';font-size:11px;color:'+muted+';margin-top:'+fpx(2)+';}');
    c.push(r+' .in-sc>span{position:absolute;top:0;transform:translateX(-50%);white-space:nowrap;}');
    c.push(r+' .in-sc>span.l{transform:none;}');
    c.push(r+' .in-sc>span.r{transform:translateX(-100%);}');
    c.push(r+' .in-spark{display:block;width:100%;height:'+fpx(44)+';margin-top:'+fpx(8)+';}');
    c.push(r+' .in-spl{font-size:11px;color:'+muted+';}');
    c.push(r+' .in-cd{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;}');
    c.push(r+' .in-cd svg{height:100%;max-width:100%;}');
    c.push(r+' .in-pill{align-self:flex-start;display:inline-flex;align-items:center;gap:'+fpx(8)+';border:1px solid;border-radius:999px;padding:'+fpx(5)+' '+fpx(12)+';font-size:13px;white-space:nowrap;}');
    c.push(r+' .in-pill>i{width:'+fpx(8)+';height:'+fpx(8)+';border-radius:50%;}');
    return c.join('\n');
  }
  /* the drawing code of an industrial object: shipped inside the generated file as its own source text (self-contained, like tileRuntime) */
  function indRuntime(root,C){
    var body=root.querySelector('.tbody');
    if(!body)return;
    var K=C.kind;
    function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
    function num(v){if(v===''||v===undefined||v===null)return null;var x=+v;return isFinite(x)?x:null;}
    function say(t){body.innerHTML='<div class="tnone">'+esc(t)+'</div>';root.setAttribute('data-status','message');}
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
    function shown(x){var m=String(x==null?'':x).replace(/,/g,'').match(/^\s*(-?\d+(\.\d+)?)/);return m?+m[1]:null;}
    function hx(c){var x=String(c||'#000000').replace('#','');return [parseInt(x.substr(0,2),16)||0,parseInt(x.substr(2,2),16)||0,parseInt(x.substr(4,2),16)||0];}
    function mix(a,b,t){var A=hx(a),B=hx(b),i,o='#';for(i=0;i<3;i++){var v=Math.round(A[i]*(1-t)+B[i]*t);o+=(v<16?'0':'')+v.toString(16);}return o;}
    function lum(c){var A=hx(c);return (0.299*A[0]+0.587*A[1]+0.114*A[2])/255;}
    function ink(c){return lum(c)>0.62?'#1B1E24':'#FFFFFF';}
    function deep(c){return lum(c)>0.62?mix(c,'#000000',0.3):c;}
    var chans=[];
    try{
      var raw=findJson();
      if(raw){var data=JSON.parse(raw), box=(data&&data.objects)?data.objects:data;chans=(box&&box.channels)||[];}
    }catch(e0){chans=[];}
    chans=chans.map(function(c){
      var d=(c.info&&c.info.data&&c.info.data[0])||{};
      d.name=c.name||d.name;
      if(d.lastvalue===undefined||d.lastvalue==='')d.lastvalue=c.lastvalue;
      var k=null, gm=shown(d.graphmax), lv=shown(d.lastvalue);
      if(gm&&+d.graphmaxraw)k=gm/+d.graphmaxraw;
      else if(lv&&+d.lastvalueraw&&!/^\s*</.test(String(d.lastvalue)))k=lv/+d.lastvalueraw;
      if(k&&isFinite(k)&&Math.abs(k-1)>1e-9){
        ['lastvalueraw','graphmaxraw','graphminraw','limitminwarning','limitmaxwarning','limitminerror','limitmaxerror'].forEach(function(f){
          if(d[f]!==''&&d[f]!==undefined&&d[f]!==null&&isFinite(+d[f]))d[f]=+d[f]*k;
        });
      }
      return d;
    }).filter(function(c){return +c.id!==-4;});
    var m=(root.className.match(/tlst-sens(\w*)/)||[])[1]||'';
    var sensorState={g:'up',y:'warning',r:'down',q:'down',o:'ack',b:'paused',p:'unusual'}[m.charAt(0)]||(m?'unknown':'up');
    if(/^(dr|ra|rp|gr)/.test(m))sensorState='down';
    var SW={up:'Up',warning:'Warning',down:'Down',ack:'Down (acknowledged)',unusual:'Unusual',paused:'Paused',unknown:'Unknown'};
    function chanState(ch){
      if(sensorState==='paused'||sensorState==='unknown')return sensorState;
      var s=+ch.status;
      if(s===3)return 'up';if(s===4)return 'warning';if(s===13)return 'ack';if(s===5||s===14)return 'down';if(s===10)return 'unusual';
      if(s===7||s===8||s===9||s===11||s===12)return 'paused';
      return sensorState;
    }
    function trim(s){return String(s).replace(/^\s+|\s+$/g,'');}
    function words(s){return String(s||'').split(',').map(trim).filter(Boolean);}
    function wre(w){return new RegExp('(^|[^a-z0-9])'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'($|[^a-z0-9])','i');}
    function onish(v){var s=trim(v==null?'':v).toLowerCase(), n;if(s==='')return false;n=parseFloat(s.replace(/,/g,''));if(/^-?[\d.,]+/.test(s)&&isFinite(n))return n!==0;return /^(on|yes|true|open|opened|running|run|active|enabled|lit|flashing|high|started)\b/.test(s);}
    function split(v){var s=trim(v==null?'':v), mm=s.match(/^([<>]?\s*-?[\d.,]+)\s*(.*)$/);return mm?{n:mm[1],u:mm[2]}:{n:s||'–',u:''};}
    function valHtml(sv){return esc(sv.n)+(sv.u?'<small>'+esc(sv.u)+'</small>':'');}
    function find(sel){var s=String(sel).toLowerCase();return chans.filter(function(c){return String(c.id)===s||String(c.name).toLowerCase()===s;})[0]||chans.filter(function(c){return String(c.name).toLowerCase().indexOf(s)>=0;})[0]||null;}
    function pick(sel){if(sel){var hit=find(sel);if(hit)return hit;}return chans.filter(function(c){return c.primary;})[0]||chans[0]||null;}
    function nice(x){if(!(x>0))return 1;var p=Math.pow(10,Math.floor(Math.log(x)/Math.LN10)),f=x/p;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p;}
    function range(ch){
      var unit=split(ch.lastvalue).u, min=num(C.min), max=num(C.max);
      if(min===null)min=0;
      if(max===null&&(ch.ispercent||unit==='%'))max=100;
      if(max===null&&num(ch.limitmaxerror)!==null)max=nice(num(ch.limitmaxerror)*1.25);
      if(max===null&&num(ch.limitmaxwarning)!==null)max=nice(num(ch.limitmaxwarning)*1.5);
      if(max===null)max=nice(Math.max(num(ch.graphmaxraw)||0,num(ch.lastvalueraw)||0));
      if(max<=min)max=min+1;
      return {min:min,max:max};
    }
    function limits(ch){
      var L={};
      if(+ch.limitmode===1)['limitminerror','limitminwarning','limitmaxwarning','limitmaxerror'].forEach(function(k){L[k]=num(ch[k]);});
      if(num(C.warn)!==null)L.limitmaxwarning=num(C.warn);
      if(num(C.error)!==null)L.limitmaxerror=num(C.error);
      return L;
    }
    function val(ch){var v=num(ch.lastvalueraw);return v!==null?v:shown(ch.lastvalue);}
    function fmt(x){return Math.abs(x)>=1000?Math.round(x).toLocaleString():String(+x.toFixed(2));}
    function badge(word,col){return '<span class="in-badge" style="background:'+col+';color:'+ink(col)+'">'+esc(word)+'</span>';}
    /* which limit the value is past, if any: the word and the state it gives */
    function past(v,L){
      if(v===null)return null;
      if(L.limitmaxerror!=null&&v>=L.limitmaxerror)return {w:'HIGH',s:'down'};
      if(L.limitminerror!=null&&v<=L.limitminerror)return {w:'LOW',s:'down'};
      if(L.limitmaxwarning!=null&&v>=L.limitmaxwarning)return {w:'HIGH',s:'warning'};
      if(L.limitminwarning!=null&&v<=L.limitminwarning)return {w:'LOW',s:'warning'};
      return null;
    }
    var ch, st, v, r, L, pct;
    function at(x){return (100*Math.max(0,Math.min(1,(x-r.min)/(r.max-r.min)))).toFixed(2)+'%';}
    /* ----- state lamps: each word lights when a channel says it ----- */
    if(K==='lamps'){
      var only=words(C.only).map(function(s){return s.toLowerCase();}), list=only.length?chans.filter(function(c){return only.indexOf(String(c.name).toLowerCase())>-1;}):chans;
      var lw=words(C.lamps);if(!lw.length)lw=['RUN','STOP','ERROR','MAINT'];
      if(!chans.length){say('No channel data');return;}
      var ncol=lw.length<=2?lw.length:(lw.length<=4?2:3);   /* 4 lamps as 2 x 2, more as rows of 3 */
      var html='<div class="in-lamps" style="grid-template-columns:repeat('+ncol+',minmax(0,1fr))">'+lw.map(function(w){
        var re=wre(w), hit=null;
        list.forEach(function(c){
          if(hit)return;
          var t=trim(c.lastvalue==null?'':c.lastvalue);
          if(re.test(t)&&!/^(no|not|none)\b/i.test(t))hit=c;
          else if(re.test(String(c.name))&&onish(t))hit=c;
        });
        if(!hit)return '<div class="in-lamp"><i></i><span>'+esc(w.toUpperCase())+'</span></div>';
        var col=C.c[chanState(hit)];
        return '<div class="in-lamp on" style="background:'+mix(C.base,col,0.16)+'"><i style="background:'+col+';box-shadow:0 0 0 3px '+mix(C.base,col,0.35)+'"></i><span>'+esc(w.toUpperCase())+'</span></div>';
      }).join('')+'</div>';
      var rw=words(C.rows);
      if(rw.length){
        var rows=rw.map(function(n){var c=find(n);return c?'<div class="in-r"><span>'+esc(c.name)+'</span><b>'+esc(c.lastvalue)+'</b></div>':'';}).join('');
        if(rows)html+='<div class="in-rows">'+rows+'</div>';
      }
      body.style.justifyContent='flex-start';
      body.innerHTML=html;
    }
    /* ----- on/off: one yes/no channel ----- */
    else if(K==='onoff'){
      ch=pick(C.channel);if(!ch){say('No channel data');return;}
      var t2=trim(ch.lastvalue==null?'':ch.lastvalue), on=words(C.onIf).length?words(C.onIf).some(function(w){return wre(w).test(t2);}):onish(t2);
      st=chanState(ch);
      var bad=(C.bad==='on'&&on)||(C.bad==='off'&&!on);
      var col=bad?C.c.down:((st==='warning'||st==='down'||st==='ack'||st==='unusual')?C.c[st]:(on?C.c.up:C.off));
      var word=on?(C.onW||'On'):(C.offW||'Off'), wcol=(on||bad||st!=='up')?deep(col):C.muted;
      if(C.oStyle==='switch')body.innerHTML='<div class="in-oo in-oo-sw"><div class="in-oo-w" style="color:'+wcol+'">'+esc(word)+'</div><span class="in-sw'+(on?' on':'')+'" style="background:'+col+'"><i></i></span></div>';
      else if(C.oStyle==='word')body.innerHTML='<div class="in-oo">'+badge(word,col)+'</div>';
      else body.innerHTML='<div class="in-oo in-oo-lamp"><i style="background:'+col+(on||bad?';box-shadow:0 0 0 5px '+mix(C.base,col,0.3)+', inset 0 -4px 8px rgba(0,0,0,.18)':'')+'"></i><div class="in-oo-w" style="color:'+wcol+'">'+esc(word)+'</div></div>';
    }
    /* ----- tank / level ----- */
    else if(K==='tank'){
      ch=pick(C.channel);if(!ch){say('No channel data');return;}
      r=range(ch);v=val(ch);L=limits(ch);st=chanState(ch);
      var ps=past(v,L), lvl=v===null?0:Math.max(0,Math.min(1,(v-r.min)/(r.max-r.min))), lines='';
      ['limitminerror','limitminwarning','limitmaxwarning','limitmaxerror'].forEach(function(k){
        if(L[k]!=null&&L[k]>r.min&&L[k]<r.max)lines+='<i class="in-lim'+(/error/.test(k)?' e':'')+'" style="bottom:'+at(L[k])+';border-color:'+(/error/.test(k)?C.c.down:C.c.warning)+'"></i>';
      });
      var vessel;
      if(C.shape==='silo'){
        var yTop=4, yBot=232, fy=(yBot-(yBot-yTop)*lvl).toFixed(1), ln='';
        ['limitminerror','limitminwarning','limitmaxwarning','limitmaxerror'].forEach(function(k){
          if(L[k]!=null&&L[k]>r.min&&L[k]<r.max){var y=(yBot-(yBot-yTop)*((L[k]-r.min)/(r.max-r.min))).toFixed(1);ln+='<line x1="0" y1="'+y+'" x2="96" y2="'+y+'" stroke="'+(/error/.test(k)?C.c.down:C.c.warning)+'" stroke-width="2"'+(/error/.test(k)?'':' stroke-dasharray="5 4"')+' clip-path="url(#sc'+root.id+')"/>';}
        });
        var sp='M6 12 Q6 4 14 4 H82 Q90 4 90 12 V160 L48 232 L6 160 Z';
        vessel='<div class="in-vessel"><svg viewBox="0 0 96 236" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><clipPath id="sc'+root.id+'"><path d="'+sp+'"/></clipPath></defs>'
          +'<rect x="0" y="0" width="96" height="236" fill="'+mix(C.base,C.text,0.05)+'" clip-path="url(#sc'+root.id+')"/>'
          +'<rect x="0" y="'+fy+'" width="96" height="236" fill="'+C.fill+'" clip-path="url(#sc'+root.id+')"/>'+ln
          +'<path d="'+sp+'" fill="none" stroke="'+mix(C.base,C.text,0.42)+'" stroke-width="2"/></svg></div>';
      }else vessel='<div class="in-vessel"><div class="in-tank"><div class="in-fill" style="height:'+(100*lvl).toFixed(2)+'%;background:'+C.fill+'"></div>'+lines+'</div></div>';
      var c2=C.chan2?find(C.chan2):null, bs=ps?ps.s:st;
      body.innerHTML='<div class="in-tankrow">'+vessel+'<div class="in-tv"><div class="in-tvn">'+valHtml(split(ch.lastvalue))+'</div>'+(c2?'<div class="in-tv2">'+esc(c2.lastvalue)+'</div>':'')
        +(ps?badge(ps.w,C.c[ps.s]):(bs!=='up'?badge(String(SW[bs]||bs).toUpperCase(),C.c[bs]):''))+'</div></div>';
    }
    /* ----- equipment: a symbol in the sensor's state colour ----- */
    else if(K==='equip'){
      st=sensorState;
      var ec=C.c[st]||C.c.unknown, es=deep(ec), et=mix(C.base,ec,0.16), s='stroke="'+es+'" stroke-width="3"', inner;
      if(C.eq==='motor')inner='<circle cx="42" cy="42" r="28" fill="'+et+'" '+s+'/><path d="M29 54 V31 L42 46 L55 31 V54" fill="none" '+s+' stroke-linejoin="round" stroke-linecap="round"/>';
      else if(C.eq==='valve')inner='<path d="M12 36 L42 52 L12 68 Z M72 36 L42 52 L72 68 Z" fill="'+et+'" '+s+' stroke-linejoin="round"/><path d="M42 52 V24 M30 20 H54" fill="none" '+s+' stroke-linecap="round"/>';
      else if(C.eq==='fan')inner='<circle cx="42" cy="42" r="28" fill="'+et+'" '+s+'/><path d="M42 42 C38 30 44 22 50 24 C52 32 48 38 42 42 Z M42 42 C54 40 60 46 57 52 C49 53 45 48 42 42 Z M42 42 C34 51 26 50 25 43 C31 38 37 39 42 42 Z" fill="'+es+'"/>';
      else if(C.eq==='conveyor')inner='<rect x="6" y="32" width="72" height="22" rx="11" fill="'+et+'" '+s+'/><circle cx="17" cy="43" r="5" fill="'+es+'"/><circle cx="67" cy="43" r="5" fill="'+es+'"/><path d="M32 43 H50 M45 38 L51 43 L45 48" fill="none" stroke="'+es+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
      else inner='<circle cx="42" cy="46" r="28" fill="'+et+'" '+s+'/><path d="M42 18 H76 V30" fill="none" '+s+'/><path d="M33 34 L57 46 L33 58 Z" fill="'+es+'"/>';
      var vc=C.channel?find(C.channel):null, lab=vc?esc(vc.lastvalue):esc(st==='up'?(C.upW||SW.up):SW[st]);
      body.innerHTML='<div class="in-eq'+(C.eLay==='row'?' row':'')+'"><svg viewBox="0 0 84 84" preserveAspectRatio="xMidYMid meet" role="img" aria-label="'+esc(C.eq+', '+SW[st])+'">'+inner+'</svg><div class="in-eqv"><i style="background:'+ec+'"></i><span'+(vc?'':' style="color:'+deep(ec)+'"')+'>'+lab+'</span></div></div>';
    }
    /* ----- process value: the number, its limits as zones, a setpoint mark and the last hour ----- */
    else if(K==='pv'){
      ch=pick(C.channel);if(!ch){say('No channel data');return;}
      r=range(ch);v=val(ch);L=limits(ch);st=chanState(ch);
      var ps2=past(v,L), z=[], cuts=[[r.min,null]], k2;
      var tintOf=function(s){return mix(C.base,C.c[s],s==='up'?0.28:0.38);};
      var lo2=L.limitminerror, lo1=L.limitminwarning, hi1=L.limitmaxwarning, hi2=L.limitmaxerror, any=[lo2,lo1,hi1,hi2].some(function(x){return x!=null;});
      if(any){
        var marks=[];
        if(lo2!=null)marks.push([lo2,'down']);
        if(lo1!=null)marks.push([lo1,'warning']);
        var bands=[], x0=r.min;
        if(lo2!=null){bands.push([x0,lo2,'down']);x0=lo2;}
        if(lo1!=null){bands.push([x0,lo1,lo2!=null?'warning':'warning']);x0=lo1;}
        var mid=(hi1!=null)?hi1:((hi2!=null)?hi2:r.max);
        bands.push([x0,mid,'up']);x0=mid;
        if(hi1!=null){bands.push([x0,(hi2!=null)?hi2:r.max,'warning']);x0=(hi2!=null)?hi2:r.max;}
        if(hi2!=null)bands.push([x0,r.max,'down']);
        bands.forEach(function(b){var a=Math.max(r.min,Math.min(r.max,b[0])),e=Math.max(r.min,Math.min(r.max,b[1]));if(e>a)z.push('<span style="width:'+(100*(e-a)/(r.max-r.min)).toFixed(2)+'%;background:'+tintOf(b[2])+'"></span>');});
      }else z.push('<span style="width:100%;background:'+mix(C.base,C.text,0.1)+'"></span>');
      var sp2=num(C.sp), info=sp2!==null?'Setpoint <b>'+esc(fmt(sp2))+'</b>':((hi1!=null||hi2!=null)?((hi1!=null?'Warning <b>'+esc(fmt(hi1))+'</b>':'')+(hi1!=null&&hi2!=null?' · ':'')+(hi2!=null?'Alarm <b>'+esc(fmt(hi2))+'</b>':'')):'');
      var ticks=[[r.min,'l']];[lo2,lo1,hi1,hi2].forEach(function(x){if(x!=null&&x>r.min&&x<r.max)ticks.push([x,'']);});ticks.push([r.max,'r']);
      var vcol=ps2?deep(C.c[ps2.s]):(st!=='up'?deep(C.c[st]):C.text);
      body.style.justifyContent='flex-start';
      body.innerHTML='<div class="in-pvh"><span class="in-pvn" style="color:'+vcol+'">'+valHtml(split(ch.lastvalue))+'</span>'+(ps2?badge(ps2.w,C.c[ps2.s]):'')+(info?'<span class="in-pvx">'+info+'</span>':'')+'</div>'
        +'<div class="in-zw"><div class="in-zone">'+z.join('')+'</div>'+(sp2!==null&&sp2>=r.min&&sp2<=r.max?'<i class="in-spk" style="left:'+at(sp2)+'"></i>':'')+'</div>'
        +'<div class="in-mk">'+(v!==null?'<i style="left:'+at(v)+'"></i>':'')+'</div>'
        +'<div class="in-sc">'+ticks.map(function(t){return '<span class="'+t[1]+'" style="left:'+at(t[0])+'">'+esc(fmt(t[0]))+'</span>';}).join('')+'</div>'
        +(C.trend?'<svg class="in-spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"></svg><div class="in-spl">Last hour</div>':'');
      if(C.trend){
        var svgT=body.querySelector('.in-spark'), lbl=body.querySelector('.in-spl');
        var drawT=function(vals){
          vals=vals.filter(function(x){return x!==null&&isFinite(x);});
          if(vals.length<2){svgT.style.display='none';lbl.style.display='none';return;}
          var lo=Math.min.apply(null,vals), hi=Math.max.apply(null,vals);if(sp2!==null){lo=Math.min(lo,sp2);hi=Math.max(hi,sp2);}
          if(hi-lo<1e-9){hi=lo+1;}var pad=(hi-lo)*0.15;lo-=pad;hi+=pad;
          var y=function(x){return (30-30*(x-lo)/(hi-lo)).toFixed(2);};
          var pts=vals.map(function(x,i){return (100*i/(vals.length-1)).toFixed(2)+','+y(x);}).join(' ');
          svgT.innerHTML=(sp2!==null?'<line x1="0" y1="'+y(sp2)+'" x2="100" y2="'+y(sp2)+'" stroke="'+C.muted+'" stroke-width="1" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>':'')
            +'<polyline points="'+pts+'" fill="none" stroke="'+(ps2?deep(C.c[ps2.s]):C.fill)+'" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>';
        };
        if(C.sample){var sv=[],q;for(q=0;q<30;q++)sv.push((v||0)*(1+0.04*Math.sin(q/3)+0.02*Math.cos(q*1.7)));drawT(sv);}
        else{
          var p2=function(n){return (n<10?'0':'')+n;}, ds=function(d){return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())+'-'+p2(d.getHours())+'-'+p2(d.getMinutes())+'-'+p2(d.getSeconds());};
          var now=new Date(), q2=['id='+encodeURIComponent(root.getAttribute('objectid')),'avg=60','usecaption=1','sdate='+ds(new Date(now.getTime()-3600000)),'edate='+ds(now)].join('&');
          var pre=/^\/api\/v1\//.test(location.pathname)?'/api/v1':'';
          if(location.protocol==='about:'||!window.fetch){drawT([]);}
          else fetch(pre+'/api/historicdata.json?'+q2,{credentials:'include',headers:{'X-Requested-With':'XMLHttpRequest'}}).then(function(res){if(!res.ok)throw new Error('http');return res.json();}).then(function(j){
            var rows=(j&&(j.histdata||j.values))||[], key=null, nm=String(ch.name).toLowerCase();
            if(rows.length){var ks=Object.keys(rows[0]).filter(function(x){return x!=='datetime'&&x!=='coverage';});
              key=ks.filter(function(x){return x.toLowerCase()===nm;})[0]||ks.filter(function(x){return x.toLowerCase().indexOf(nm)===0;})[0]||null;}
            drawT(key?rows.map(function(rw){var x=rw[key];return typeof x==='number'?x:shown(x);}):[]);
          }).catch(function(){drawT([]);});
        }
      }
    }
    /* ----- countdown: days left, for example until a certificate expires ----- */
    else if(K==='count'){
      ch=pick(C.channel);if(!ch){say('No channel data');return;}
      v=val(ch);L=limits(ch);
      var wd=num(C.warn), ed=num(C.error), full=num(C.max)||365;
      if(wd===null)wd=(+ch.limitmode===1&&num(ch.limitminwarning)!==null)?num(ch.limitminwarning):30;
      if(ed===null)ed=(+ch.limitmode===1&&num(ch.limitminerror)!==null)?num(ch.limitminerror):7;
      var exp=(v!==null&&v<=0), cs=exp||(v!==null&&v<=ed)?'down':((v!==null&&v<=wd)?'warning':'up'), cc=C.c[cs], unit=split(ch.lastvalue).u||'days';
      var dn=v===null?'–':String(Math.round(v));
      if(C.cStyle==='pill'){
        body.innerHTML=exp?'<span class="in-pill" style="background:'+cc+';border-color:'+cc+';color:'+ink(cc)+'"><b>Expired</b></span>'
          :'<span class="in-pill" style="border-color:'+cc+'"><i style="background:'+cc+'"></i><b>'+esc(dn)+'</b>'+esc(unit)+' left</span>';
      }else{
        var R2=40, CIRC=2*Math.PI*R2, fr=exp?0:Math.max(0.012,Math.min(1,(v||0)/full));
        body.innerHTML='<div class="in-cd"><svg viewBox="0 0 100 100" role="img" aria-label="'+esc(exp?'Expired':dn+' '+unit+' left')+'">'
          +(exp?'<circle cx="50" cy="50" r="'+R2+'" fill="none" stroke="'+cc+'" stroke-width="3" stroke-dasharray="6 6"/><text x="50" y="55" text-anchor="middle" font-size="14" font-weight="700" fill="'+deep(cc)+'">EXPIRED</text>'
            :'<circle cx="50" cy="50" r="'+R2+'" fill="none" stroke="'+mix(C.base,C.text,0.1)+'" stroke-width="9"/><circle cx="50" cy="50" r="'+R2+'" fill="none" stroke="'+cc+'" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+(CIRC*fr).toFixed(1)+' '+CIRC.toFixed(1)+'" transform="rotate(-90 50 50)"/>'
            +'<text x="50" y="53" text-anchor="middle" font-size="24" font-weight="700" fill="'+C.text+'">'+esc(dn)+'</text><text x="50" y="68" text-anchor="middle" font-size="10" fill="'+C.muted+'">'+esc(unit)+' left</text>')
          +'</svg></div>';
      }
    }
    root.setAttribute('data-status','ok');
  }
  function indScript(S,L){
    return '(function(){\n  var root=document.getElementById("<@itemid>");\n  if(!root)return;\n  var CFG='+JSON.stringify(indConfig(S,L))+';\n  ('+indRuntime.toString()+')(root,CFG);\n})();';
  }
  /* sample channels for the preview */
  function indSample(S){
    function ch(id,name,val,raw,st,extra){var d={id:id,name:name,lastvalue:val,lastvalueraw:raw,status:st,primary:id===0};if(extra)for(var k in extra)d[k]=extra[k];return {name:name,lastvalue:val,info:{data:[d]}};}
    var k=S.kind;
    if(k==='lamps')return {cls:'sensg',chans:[ch(0,'CPU Status','Run',0,3),ch(1,'Operating Mode','Run',0,3),ch(2,'Mode Selector','Run',0,3),ch(3,'Cycle Time','4 ms',4,3),ch(4,'Error LED','Off',0,3),ch(5,'Maintenance LED','Off',0,3)]};
    if(k==='onoff')return {cls:'sensg',chans:[ch(0,'Pump running','On',1,3)]};
    if(k==='tank')return {cls:'sensg',chans:[ch(0,'Level','68 %',68,3,{ispercent:true,limitmode:1,limitmaxwarning:85,limitmaxerror:95}),ch(1,'Volume','6.8 m³',6.8,3)]};
    if(k==='equip')return {cls:'sensg',chans:[ch(0,'Speed','1480 rpm',1480,3)]};
    if(k==='pv')return {cls:'sensg',chans:[ch(0,'Pressure','4.82 bar',4.82,3,{limitmode:1,limitminerror:2,limitminwarning:3,limitmaxwarning:7,limitmaxerror:8,graphmaxraw:10})]};
    if(k==='count')return {cls:'sensy',chans:[ch(0,'Days to Expiration','23 days',23,4,{limitmode:1,limitminwarning:30,limitminerror:7})]};
    return {cls:'sensg',chans:[]};
  }

  /* ====================== status icons ====================== */
  /* PRTG's own colours for the state classes (main.css, .map_iconcolor_*) */
  var IPRTG={up:'#B4BC14',warning:'#F2BE25',down:'#E3063D',ack:'#F37176',unusual:'#F07000',paused:'#448CFC',unknown:'#A4A6AF'};
  /* ascending severity, which is the order PRTG's own maps script uses when an object carries several state classes
     (_Prtg.Maps.js: red, then acknowledged, yellow, unusual, blue, undefined, and green last). CSS written in this order lets the worst state win. */
  var ISTATES=[
    {id:'up',      label:'Up',           sens:['sensg'],          has:['hasgreen']},
    {id:'unknown', label:'Unknown',      sens:['sensx'],          has:['hasblack']},
    {id:'paused',  label:'Paused',       sens:['sensb'],          has:['hasblue']},
    {id:'unusual', label:'Unusual',      sens:['sensp'],          has:['hasorange']},
    {id:'warning', label:'Warning',      sens:['sensy'],          has:['hasyellow']},
    {id:'ack',     label:'Down (Acknowledged)', sens:['senso'],          has:['hasack']},
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
    {id:'square', name:'Square',        group:'Shapes',  w:40, h:40, vb:'0 0 48 48', gl:null},
    {id:'diamond',name:'Diamond',       group:'Shapes',  w:44, h:44, vb:'0 0 48 48', gl:null},
    {id:'hexagon',name:'Hexagon',       group:'Shapes',  w:44, h:44, vb:'0 0 48 48', gl:null},
    {id:'corner', name:'Corner tab',    group:'Shapes',  w:44, h:44, vb:'0 0 48 48', gl:null},
    {id:'rbar',   name:'Rounded bar',   group:'Shapes',  w:96, h:34, vb:'0 0 96 34', gl:'icon'},
    {id:'sign',   name:'Warning sign',  group:'Icons',   w:44, h:44, vb:'0 0 48 48', gl:'icon'},
    {id:'bars',   name:'Signal bars',   group:'Icons',   w:44, h:44, vb:'0 0 48 48', gl:null},
    {id:'server', name:'Server',        group:'Icons',   w:44, h:44, vb:'0 0 48 48', gl:null},
    {id:'beacon', name:'Beacon',        group:'Icons',   w:44, h:44, vb:'0 0 48 48', gl:null},
    {id:'flag',   name:'Flag',          group:'Icons',   w:44, h:44, vb:'0 0 48 48', gl:null},
    {id:'traffic',name:'Traffic light', group:'More',    w:44, h:110,vb:'0 0 40 100',gl:null},
    {id:'tlout',  name:'Outlined traffic light', group:'More', w:44, h:110, vb:'0 0 40 100', gl:null},
    {id:'tlh',    name:'Horizontal traffic light', group:'More', w:110, h:44, vb:'0 0 100 40', gl:null},
    {id:'ledstrip',name:'LED strip',    group:'More',    w:96, h:34, vb:'0 0 96 34', gl:null},
    {id:'sbar',   name:'Status bar',    group:'More',    w:160,h:32, vb:null,        gl:null},
    {id:'heart', name:'Heartbeat',      group:'More',    w:96, h:44, vb:'0 0 96 48', gl:'hb'},
    {id:'pill',  name:'Status pill',    group:'More',    w:160,h:32, vb:null,        gl:null}
  ];
  function iStyle(id){var r=ISTYLES[1];ISTYLES.forEach(function(s){if(s.id===id)r=s;});return r;}
  function iHasBg(I){return !!I.card;}
  var ITL={traffic:1,tlout:1,tlh:1,ledstrip:1};   /* the styles with three lamps, one lit by the state */
  var IBARS={up:3,warning:2,unusual:2,ack:1,down:1,paused:0,unknown:0};   /* Signal bars: how many are lit in each state */   /* Looks is offered only for an icon with its card on: the look then sets the card behind it */
  function blankI(){
    return {type:'icon',engine:'custom',cat:'Status Icons',name:'Status dot',fname:'',style:'dot',palette:'look',text:'none',tip:'name',link:'auto',animate:true,card:false,
      labels:{},initW:40,initH:40,look:lookOf('Minimal'),raw:''};
  }
  function iconFromPreset(p){
    var I=blankI();
    I.engine='stock';I.cat=p.cat;I.name=p.name+' custom';I.pname=p.name;I.raw=p.raw;I.initW=0;I.initH=0;
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
    return {up:P.up,warning:P.warning,down:P.down,ack:P.ack,unusual:P.unusual,paused:P.paused,unknown:P.unknown};
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
      if(st.id==='badge'||st.id==='shield'||st.id==='sign'||st.id==='rbar')c.push(r+' .gl{stroke:var(--fg);}');
      if(st.id==='glyph')c.push(r+' .gl{stroke:var(--c);}');
      if(st.id==='tile'){c.push(r+' .gl{stroke:var(--ci);}');c.push(r+' .ic-tile{fill:var(--t);stroke:var(--tb);stroke-width:1.5;}');}
    }
    var tlHouse='#161C28', tlOff=blend(tlHouse,'#FFFFFF',0.14), ink=L.text||'#1d2433', soft=blend(ink,'#FFFFFF',0.55);
    if(st.id==='tlout'){tlOff='#FFFFFF';}   /* the outlined light: a white housing and empty lamps, drawn in the text colour */
    if(ITL[st.id]){
      if(st.id==='tlout')c.push(r+' .tl-body{fill:#FFFFFF;stroke:'+ink+';stroke-width:3;}');
      else c.push(r+' .tl-body{fill:'+tlHouse+';stroke:'+blend(tlHouse,'#FFFFFF',0.24)+';stroke-width:1.5;}');
      c.push(r+' .lamp{fill:'+tlOff+';'+(st.id==='tlout'?'stroke:'+ink+';stroke-width:2.2;':'')+'}');
    }
    if(st.id==='diamond'||st.id==='hexagon'||st.id==='sign')c.push(r+' .ic-round{stroke:var(--c);stroke-width:3;stroke-linejoin:round;}');
    if(st.id==='corner')c.push(r+' .ct-card{fill:'+(cf&&String(cf).charAt(0)==='#'?cf:'#FFFFFF')+';stroke:'+soft+';stroke-width:1.5;}');
    if(st.id==='bars')c.push(r+' .sb{fill:'+blend(soft,'#FFFFFF',0.45)+';}');
    if(st.id==='server'){c.push(r+' .sv-box{fill:'+(cf&&String(cf).charAt(0)==='#'?cf:'#FFFFFF')+';stroke:'+soft+';stroke-width:2;}');c.push(r+' .sv-line{fill:none;stroke:'+soft+';stroke-width:2.2;stroke-linecap:round;}');}
    if(st.id==='beacon'){c.push(r+' .bc-base{fill:'+blend(ink,'#FFFFFF',0.25)+';}');c.push(r+' .bc-ray{fill:none;stroke:var(--c);stroke-width:3;stroke-linecap:round;}');
      if(I.animate)c.push('@keyframes pstblink_'+cls+'{0%,100%{opacity:1;}50%{opacity:.15;}}');}
    if(st.id==='flag')c.push(r+' .fl-pole{fill:none;stroke:'+soft+';stroke-width:3;stroke-linecap:round;}');
    if(st.id==='sbar'){
      c.push(r+' .pst-sbar{display:inline-flex;align-items:center;gap:.5em;height:100%;max-height:100%;box-sizing:border-box;padding:0 1em 0 .8em;border:1px solid '+blend(soft,'#FFFFFF',0.4)+';border-left:6px solid var(--c);border-radius:4px;background:'+(cf&&String(cf).charAt(0)==='#'?cf:'#FFFFFF')+';color:'+ink+';font-weight:600;white-space:nowrap;overflow:hidden;}');
      c.push(r+' .pst-sbar .pst-n,'+r+' .pst-sbar .pst-w{color:inherit;font-size:1em;}');
      c.push(r+' .pst-sbar .pst-n{font-weight:400;}');
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
      if(ITL[st.id]){
        var lamp=(s.id==='down'||s.id==='ack')?'r':((s.id==='warning'||s.id==='unusual')?'y':(s.id==='up'?'g':''));
        c.push(sel(' .lamp')+'{fill:'+tlOff+';filter:none;'+(st.id==='tlout'?'stroke:'+ink+';':'')+'}');
        if(lamp)c.push(sel(' .lamp-'+lamp)+'{fill:var(--c);'+(st.id==='tlout'?'stroke:var(--c);filter:none;':'filter:drop-shadow(0 0 4px var(--g));')+'}');
      }
      if(st.id==='bars'){var nb=IBARS[s.id]||0;c.push(sel(' .sb')+'{fill:'+blend(soft,'#FFFFFF',0.45)+';}');for(var bi=1;bi<=nb;bi++)c.push(sel(' .sb'+bi)+'{fill:var(--c);}');}
      if(st.id==='beacon'){
        if(IALARM[s.id]&&I.animate)c.push(sel(' .bc-ray')+'{animation:pstblink_'+cls+' 1s ease-in-out infinite;}');
        else c.push(sel(' .bc-ray')+'{animation:none;}');
      }
      if(st.id==='pulse'&&IALARM[s.id]){
        if(I.animate)c.push(sel(' .halo')+'{animation:pstpulse_'+cls+' 1.8s ease-out infinite;}');
        else c.push(sel(' .halo')+'{opacity:.28;transform:scale(1.5);}');
      }
    });
    if(st.id==='beacon'&&I.animate)c.push('@media (prefers-reduced-motion:reduce){'+r+' .bc-ray{animation:none !important;}}');
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
      case 'tlout': return wrap('<rect class="tl-body" x="2.5" y="2.5" width="35" height="95" rx="12"/><circle class="lamp lamp-r" cx="20" cy="22" r="10.5"/><circle class="lamp lamp-y" cx="20" cy="50" r="10.5"/><circle class="lamp lamp-g" cx="20" cy="78" r="10.5"/>');
      case 'tlh': return wrap('<rect class="tl-body" x="2" y="2" width="96" height="36" rx="12"/><circle class="lamp lamp-g" cx="22" cy="20" r="11"/><circle class="lamp lamp-y" cx="50" cy="20" r="11"/><circle class="lamp lamp-r" cx="78" cy="20" r="11"/>');
      case 'ledstrip': return wrap('<rect class="tl-body" x="1" y="1" width="94" height="32" rx="6"/><rect class="lamp lamp-g" x="7" y="6" width="24" height="22" rx="3"/><rect class="lamp lamp-y" x="36" y="6" width="24" height="22" rx="3"/><rect class="lamp lamp-r" x="65" y="6" width="24" height="22" rx="3"/>');
      case 'square': return wrap('<rect class="ic-fill" x="4" y="4" width="40" height="40" rx="7"/>');
      case 'diamond': return wrap('<path class="ic-fill ic-round" d="M24 3L45 24L24 45L3 24Z"/>');
      case 'hexagon': return wrap('<path class="ic-fill ic-round" d="M24 3L42.2 13.5V34.5L24 45L5.8 34.5V13.5Z"/>');
      case 'corner': return wrap('<rect class="ct-card" x="4" y="4" width="40" height="40" rx="6"/><path class="ic-fill" d="M26 4H38A6 6 0 0 1 44 10V22Z"/>');
      case 'rbar': return wrap('<rect class="ic-fill" x="1" y="1" width="94" height="32" rx="9"/>'+glyphs('translate(36 5)'));
      case 'sign': return wrap('<path class="ic-fill ic-round" d="M24 5L44 41H4Z"/>'+glyphs('translate(13 16.5) scale(0.92)'));
      case 'bars': return wrap('<rect class="sb sb1" x="6" y="30" width="9" height="14" rx="2"/><rect class="sb sb2" x="19.5" y="19" width="9" height="25" rx="2"/><rect class="sb sb3" x="33" y="7" width="9" height="37" rx="2"/>');
      case 'server': return wrap('<rect class="sv-box" x="5" y="7" width="38" height="15" rx="3"/><rect class="sv-box" x="5" y="26" width="38" height="15" rx="3"/><path class="sv-line" d="M10 14.5H24M10 33.5H24"/><circle class="ic-fill" cx="36" cy="14.5" r="3.4"/><circle class="ic-fill" cx="36" cy="33.5" r="3.4"/>');
      case 'beacon': return wrap('<path class="bc-ray" d="M24 3V9M9.5 9L13.5 13M38.5 9L34.5 13"/><path class="ic-fill" d="M12 34A12 12 0 0 1 36 34Z"/><rect class="bc-base" x="8" y="34" width="32" height="9" rx="2.5"/>');
      case 'flag': return wrap('<path class="fl-pole" d="M12 5V44"/><path class="ic-fill" d="M13.5 7H40L33 16.5L40 26H13.5Z"/>');
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
    return {tag:href?'a':'span',open:'<'+(href?'a':'span')+' class="pst'+(I.text!=='none'&&I.style!=='pill'&&I.style!=='sbar'?' pst-t':'')+'"'+href+t+'>'};
  }
  /* the clickable part of the icon: used by the file and by the preview, so both show the same markup */
  function iconBodyLines(I,id){
    var st=iStyle(I.style), op=iconOpen(I), o=[];
    var showN=(I.text==='name'||I.text==='both'), showW=(I.text==='word'||I.text==='both');
    var nameEl='<span class="pst-n"><#objectproperty name="Name" id="<@objectid>"></span>', wordEl='<span class="pst-w"></span>';
    o.push('  '+op.open);
    if(st.id==='pill'){
      o.push('    <span class="pst-pill"><i></i>'+(showN?nameEl:'')+wordEl+'</span>');
    }else if(st.id==='sbar'){
      o.push('    <span class="pst-sbar">'+(showN?nameEl:'')+wordEl+'</span>');
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
    if((showN||showW||st.id==='pill'||st.id==='sbar')&&needsFontLink(L))o.push(fontLinkOf(L));
    o.push('<style>');o.push(css);o.push('</style>');
    iconBodyLines(I,'<@itemid>').forEach(function(l){o.push(l);});
    o.push('  <#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    return o.join('\n')+'\n';
  }

  /* ====================== geo map ====================== */
  /* PRTG draws the Geo Map itself: the template only holds one tag (locationlist) that PRTG expands into the map and its markers.
     What this object can change is the look of those markers, through the object's own style block. */
  var GMSTATES=[
    {id:'up',      label:'Up',                  col:'#B8C419', g:'up'},
    {id:'warn',    label:'Warning',             col:'#F5C500', g:'warning'},
    {id:'down',    label:'Down',                col:'#E30613', g:'down'},
    {id:'downack', label:'Down (Acknowledged)', col:'#E67278', g:'ack'},
    {id:'unusual', label:'Unusual',             col:'#F59C00', g:'unusual'},
    {id:'paused',  label:'Paused',              col:'#477EC0', g:'paused'},
    {id:'unknown', label:'Unknown',             col:'#878787', g:'unknown'}
  ];
  /* line symbols on a 24 grid, drawn with a 2 px round stroke */
  var GMSYMS=[
    ['pin','Pin','<path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>'],
    ['server','Server','<rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><path d="M8 7h.01M8 17h.01"/>'],
    ['router','Router','<rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 17h.01M11 17h.01M8 14l-2-4M16 14l2-4"/>'],
    ['network','Network','<circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v5M12 12l-6 5M12 12l6 5"/>'],
    ['database','Database','<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>'],
    ['cloud','Cloud','<path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 9.5a4.2 4.2 0 0 1 0 8.5z"/>'],
    ['wifi','Wi-Fi','<path d="M3 9a14 14 0 0 1 18 0M6 12.5a9.5 9.5 0 0 1 12 0M9 16a5 5 0 0 1 6 0"/><path d="M12 19.5h.01"/>'],
    ['antenna','Antenna','<path d="M12 12v9M8 21h8"/><circle cx="12" cy="10" r="2"/><path d="M7.5 5.5a6.4 6.4 0 0 0 0 9M16.5 5.5a6.4 6.4 0 0 1 0 9"/>'],
    ['building','Building','<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>'],
    ['home','Home','<path d="M4 11l8-7 8 7M6 10v10h12V10"/>'],
    ['globe','Globe','<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'],
    ['laptop','Laptop','<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 19h18"/>'],
    ['phone','Phone','<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>'],
    ['printer','Printer','<path d="M7 9V4h10v5M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="6"/>'],
    ['camera','Camera','<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'],
    ['thermo','Thermometer','<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/>'],
    ['shield','Shield','<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>'],
    ['lock','Lock','<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'],
    ['flag','Flag','<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>'],
    ['star','Star','<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z"/>'],
    ['bolt','Bolt','<path d="M13 4.5L6.5 13.5h5L10.8 19.5 17.5 10.5h-5z"/>'],
    ['heart','Heart','<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>']
  ];
  function gmSym(id){var r=GMSYMS[0];GMSYMS.forEach(function(s){if(s[0]===id)r=s;});return r;}
  function blankGM(){
    var cols={};GMSTATES.forEach(function(s){cols[s.id]=s.col;});
    return {type:'geomap',cat:'Geo Maps',name:'Map Studio Geo map',fname:'',initW:0,initH:0,look:(function(){var l=lookOf('Minimal');l.card=false;return l;})(),
      shape:'card',size:100,icon:'device',sym:'pin',palette:'prtg',cols:cols,shadow:true,legend:50};
  }
  function gmClass(G){return 'pgm_'+slugOf(G.name);}
  function gmColor(G,id){
    var r='#888888';
    GMSTATES.forEach(function(s){if(s.id===id)r=(G.palette==='custom'&&G.cols&&G.cols[id])?G.cols[id]:s.col;});
    return r;
  }
  function gmSvgUrl(path,col){
    var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="'+col+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';
    return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
  }
  /* the marker shapes: PRTG's own card, a badge, a circle, a ring, a map pin (white disc, or the symbol straight on the color) and a pulsing dot */
  var GMSHAPES=[['card','Card'],['badge','Badge'],['circle','Circle'],['ring','Ring'],['pin','Pin'],['pinfill','Filled pin'],['pulse','Pulse']];
  function gmPinUrl(col,hole){
    var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36"><path d="M14 0C6.3 0 0 6.1 0 13.6c0 9.6 12.4 20.7 13.1 21.3.5.5 1.3.5 1.8 0C15.6 34.3 28 23.2 28 13.6 28 6.1 21.7 0 14 0z" fill="'+col+'"/>'+(hole?'<circle cx="14" cy="13.6" r="8" fill="#FFFFFF"/>':'')+'</svg>';
    return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
  }
  function gmCss(G,cls){
    var c=[], shp=G.shape, sc=Math.max(0.5,Math.min(2,(parseFloat(G.size)||100)/100)), mk='.'+cls+' .map-marker', pin=(shp==='pin'||shp==='pinfill'), pulse=(shp==='pulse');
    var solid=(shp==='badge'||shp==='circle'||pulse||shp==='pinfill'), sz=(shp==='card')?14:(pin?Math.round(12*sc):(pulse?Math.round(12*sc):Math.round(16*sc)));
    var D=Math.round(24*sc), PW=Math.round(28*sc), PH=Math.round(36*sc), PD=Math.round(22*sc), IM='!important';
    if(pin){
      c.push(mk+'{width:'+PW+'px '+IM+';height:'+PH+'px '+IM+';margin:'+(-PH)+'px 0 0 '+(-Math.round(PW/2))+'px '+IM+';box-sizing:border-box '+IM+';border:0 '+IM+';border-radius:0 '+IM+';background-color:transparent '+IM+';background-size:100% 100% '+IM+';background-repeat:no-repeat '+IM+';box-shadow:none '+IM+';'+(G.shadow?'filter:drop-shadow(0 2px 2px rgba(0,0,0,.35));':'filter:none;')+'}');
    }else if(pulse){
      c.push(mk+'{width:'+PD+'px '+IM+';height:'+PD+'px '+IM+';margin:'+(-Math.round(PD/2))+'px 0 0 '+(-Math.round(PD/2))+'px '+IM+';box-sizing:border-box '+IM+';border:0 '+IM+';border-radius:50% '+IM+';}');
    }else if(shp!=='card'){
      c.push(mk+'{width:'+D+'px '+IM+';height:'+D+'px '+IM+';box-sizing:border-box '+IM+';'+(shp==='badge'?'border-radius:7px':'border-radius:50%')+' '+IM+';'+(solid?'border:0 '+IM+';':'border-style:solid '+IM+';border-width:3px '+IM+';')+'}');
    }
    if(!G.shadow&&!pin)c.push(mk+'{box-shadow:none '+IM+';}');
    if(pin&&G.icon==='device')c.push(mk+' a{width:'+Math.round(16*sc)+'px '+IM+';height:'+Math.round(16*sc)+'px '+IM+';left:'+Math.round(6*sc)+'px '+IM+';top:'+Math.round(5.6*sc)+'px '+IM+';background-size:'+Math.round(13*sc)+'px '+Math.round(13*sc)+'px '+IM+';background-repeat:no-repeat '+IM+';background-position:center '+IM+';}');
    if(pulse&&G.icon==='device')c.push(mk+' a{left:3px '+IM+';top:3px '+IM+';width:'+(PD-6)+'px '+IM+';height:'+(PD-6)+'px '+IM+';border-radius:50% '+IM+';background-color:#FFFFFF '+IM+';background-size:'+Math.round(12*sc)+'px '+Math.round(12*sc)+'px '+IM+';background-repeat:no-repeat '+IM+';background-position:center '+IM+';}');
    GMSTATES.forEach(function(s){
      var col=gmColor(G,s.id), ink=(solid)?fgOn(col):(shp==='pin'?blend(col,'#000000',0.25):col), r=[];
      if(shp==='card')r.push('border-color:'+col+' '+IM);
      else if(pin)r.push('background-image:'+gmPinUrl(col,shp==='pin')+' '+IM);
      else if(pulse)r.push('background:'+col+' '+IM,'box-shadow:0 0 0 '+Math.round(6*sc)+'px '+hexA(col,0.32)+',0 0 0 '+Math.round(12*sc)+'px '+hexA(col,0.14)+' '+IM);
      else if(solid)r.push('background:'+col+' '+IM);
      else r.push('border-color:'+col+' '+IM);
      c.push(mk+'.'+s.id+'{'+r.join(';')+';}');
      if(G.icon!=='device'){
        var path=(G.icon==='status')?GLYPH[s.g]:gmSym(G.sym)[2], pos=pin?('center '+Math.round(7.5*sc)+'px'):'center';
        c.push(mk+'.'+s.id+' a{background-image:'+gmSvgUrl(path,ink)+' '+IM+';background-size:'+sz+'px '+sz+'px '+IM+';background-repeat:no-repeat '+IM+';background-position:'+pos+' '+IM+';}');
      }
    });
    return c.join('\n');
  }
  /* the shared Appearance card for the Geo Map: fill, border, corners and shadow go on the box PRTG draws the map in */
  function gmCardCss(G,sel){
    var L=G.look||{};
    if(!L.card)return '';
    var a=(L.cardA==null?100:L.cardA), fill=(a<100)?tint(L.cardBg,a/100):L.cardBg, d='background:'+fill+' !important;border-radius:'+(L.radius||0)+'px !important;overflow:hidden !important;';
    if(L.bw>0)d+='outline:'+L.bw+'px solid '+L.border+' !important;outline-offset:-'+L.bw+'px !important;';
    var sh=shadowOf(L);if(sh)d+='box-shadow:'+sh+' !important;';
    return sel+'{'+d+'}';
  }
  function buildGeoMap(G){
    var o=[], cls=gmClass(G), w=parseInt(G.initW,10), h=parseInt(G.initH,10), n=parseInt(G.legend,10);
    var init=(w>0&&h>0)?' initialwidth="'+Math.min(w,4000)+'" initialheight="'+Math.min(h,4000)+'"':'';
    if(isNaN(n)||n<0)n=50;
    o.push('<!'+'--'+clean(G.cat||'Geo Maps')+': '+clean(G.name||'Geo map')+'-->');
    o.push('<style>');
    o.push('.onepreview .geomap-preview{');o.push('\theight: 176px;');o.push('}');
    o.push(gmCss(G,cls));
    o.push(gmCardCss(G,'.'+cls));
    o.push('</style>');
    o.push('<div class="map_object map_graph geomap-preview '+cls+'" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+init+' style="<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('<#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('<#mapobject type="htmlbefore" subid="<@subid>">');
    o.push('<#checkobjecttype objecttype="probenode,group,device" nicemessage="true" id="<@objectid>">');
    o.push('');
    o.push('\t  <div id="map-geomap-box" class="geomap  <#selectionlist content="geomapprovider">">');
    o.push('\t\t\t<#selectionlist content="locationlist" id="<@objectid>" domobjectid="map-geomap-box" width="<@width>" height="<@height>" maxlegenditems="'+n+'">');
    o.push('\t\t</div>');
    o.push('');
    o.push('  <#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    return o.join('\n')+'\n';
  }

  /* ---------- Link style: restyles the lines PRTG draws between map objects ----------
     PRTG builds those lines with its own script after the page loads and rebuilds them on every refresh.
     This object hides PRTG's lines by CSS (so they are never seen), draws its own paths from the same coordinates and colors,
     and draws them again whenever PRTG rebuilds the lines. If anything fails, PRTG's lines come back. */
  function mlsRuntime(C){
    var NS='http://www.w3.org/2000/svg', PI=Math.PI, pend=false, mo=null, tick=0;
    if(window.__mls&&window.__mls.stop)window.__mls.stop();
    function f(n){return Math.round(n*10)/10;}
    function polyline(P,r){
      var d='M'+f(P[0][0])+' '+f(P[0][1]), i, a, b, c, l1, l2, k1, k2, p, q;
      for(i=1;i<P.length-1;i++){
        a=P[i-1];b=P[i];c=P[i+1];
        l1=Math.sqrt(Math.pow(b[0]-a[0],2)+Math.pow(b[1]-a[1],2));
        l2=Math.sqrt(Math.pow(c[0]-b[0],2)+Math.pow(c[1]-b[1],2));
        k1=Math.min(r,l1/2);k2=Math.min(r,l2/2);
        if(r<=0||l1<1||l2<1){d+='L'+f(b[0])+' '+f(b[1]);continue;}
        p=[b[0]-(b[0]-a[0])/l1*k1,b[1]-(b[1]-a[1])/l1*k1];
        q=[b[0]+(c[0]-b[0])/l2*k2,b[1]+(c[1]-b[1])/l2*k2];
        d+='L'+f(p[0])+' '+f(p[1])+'Q'+f(b[0])+' '+f(b[1])+' '+f(q[0])+' '+f(q[1]);
      }
      return d+'L'+f(P[P.length-1][0])+' '+f(P[P.length-1][1]);
    }
    /* the path for one link, from (x1,y1) to (x2,y2) */
    function geo(t,x1,y1,x2,y2){
      var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1,mx=(x1+x2)/2,my=(y1+y2)/2,k,cx,cy,P,R;
      if(t==='curve'){
        k=len*(C.bend/100);if(x2<x1)k=-k;
        cx=mx+(dy/len)*k;cy=my-(dx/len)*k;
        return 'M'+f(x1)+' '+f(y1)+'Q'+f(cx)+' '+f(cy)+' '+f(x2)+' '+f(y2);
      }
      if(t==='scurve'){
        if(Math.abs(dx)>=Math.abs(dy))return 'M'+f(x1)+' '+f(y1)+'C'+f(mx)+' '+f(y1)+' '+f(mx)+' '+f(y2)+' '+f(x2)+' '+f(y2);
        return 'M'+f(x1)+' '+f(y1)+'C'+f(x1)+' '+f(my)+' '+f(x2)+' '+f(my)+' '+f(x2)+' '+f(y2);
      }
      if(t==='elbow'||t==='relbow'){
        P=(Math.abs(dx)>=Math.abs(dy))?[[x1,y1],[mx,y1],[mx,y2],[x2,y2]]:[[x1,y1],[x1,my],[x2,my],[x2,y2]];
        return polyline(P,t==='relbow'?C.radius:0);
      }
      if(t==='arc'){
        R=len*0.8;
        return 'M'+f(x1)+' '+f(y1)+'A'+f(R)+' '+f(R)+' 0 0 '+((x2>=x1)?1:0)+' '+f(x2)+' '+f(y2);
      }
      return 'M'+f(x1)+' '+f(y1)+'L'+f(x2)+' '+f(y2);
    }
    function el(n,at){var e=document.createElementNS(NS,n),k;for(k in at)e.setAttribute(k,at[k]);return e;}
    /* a marker sits a little way in from the line's end, because PRTG ends every line at the device's centre, under its icon */
    function capOn(g,p,atEnd,kind,w,paint){
      var L, d, s, a, b, ang;
      if(kind!=='dot'&&kind!=='arrow')return;
      L=p.getTotalLength();d=Math.min(C.inset,L*0.4);s=atEnd?L-d:d;
      a=p.getPointAtLength(s);b=p.getPointAtLength(atEnd?s-1.5:s+1.5);
      ang=Math.atan2(a.y-b.y,a.x-b.x);
      cap(g,kind,a.x,a.y,ang,w,paint);
    }
    function cap(g,kind,x,y,ang,w,paint){
      var r,s,c,sn,h;
      if(kind==='dot'){
        r=Math.max(w*0.9,3.5);
        g.appendChild(el('circle',{cx:f(x),cy:f(y),r:f(r),fill:paint}));
      }else if(kind==='arrow'){
        s=Math.max(w*3,11);c=Math.cos(ang);sn=Math.sin(ang);h=s*0.5;
        g.appendChild(el('polygon',{points:f(x)+','+f(y)+' '+f(x-s*c-h*sn)+','+f(y-s*sn+h*c)+' '+f(x-s*c+h*sn)+','+f(y-s*sn-h*c),fill:paint}));
      }
    }
    function dashOf(w){
      if(C.dash==='dashed')return [w*2.6,w*1.8];
      if(C.dash==='dotted')return [0.1,w*2.2];
      if(C.dash==='dashdot')return [w*3,w*1.6,0.1,w*1.6];
      return null;
    }
    function draw(){
      var svg=document.getElementById('mapsvg'), lines, g, old, i, l, x1, y1, x2, y2, paint, o, w=C.width, ds, sum, p, round;
      if(!svg)return;
      if(svg.closest&&svg.closest('#mapeditor'))return; /* the editor keeps PRTG's own lines, so a link can still be removed */
      if(mo)mo.disconnect();
      try{
        old=svg.querySelector('g.mls-g');if(old)old.parentNode.removeChild(old);
        lines=svg.querySelectorAll('line.connectionline');
        g=el('g',{'class':'mls-g',opacity:C.opacity/100});
        svg.appendChild(g); /* in the page before the markers are placed, so the path can be measured */
        ds=dashOf(w);sum=0;if(ds)for(i=0;i<ds.length;i++)sum+=ds[i];
        round=(C.round||C.dash==='dotted'||C.dash==='dashdot')?'round':'butt';
        for(i=0;i<lines.length;i++){
          l=lines[i];
          x1=parseFloat(l.getAttribute('x1'));y1=parseFloat(l.getAttribute('y1'));x2=parseFloat(l.getAttribute('x2'));y2=parseFloat(l.getAttribute('y2'));
          if(isNaN(x1+y1+x2+y2)||(x1===x2&&y1===y2))continue;
          paint=C.color||l.getAttribute('stroke')||'#9aa4af';
          o=geo(C.type,x1,y1,x2,y2);
          if(C.glow)g.appendChild(el('path',{d:o,fill:'none',stroke:paint,'stroke-width':f(w*2.2),'stroke-linecap':'round','class':'mls-glow'}));
          p=el('path',{d:o,fill:'none',stroke:paint,'stroke-width':w,'stroke-linecap':round,'stroke-linejoin':'round','class':'mls-line'+((C.flow&&ds)?' mls-flow':'')});
          if(ds){p.setAttribute('stroke-dasharray',ds.map(f).join(' '));p.style.setProperty('--mls-p',f(sum)+'px');}
          g.appendChild(p);
          capOn(g,p,false,C.start,w,paint);
          capOn(g,p,true,C.end,w,paint);
        }
        svg.setAttribute('class',(svg.getAttribute('class')||'').replace(/\bmls-(on|off)\b/g,'').trim()+' mls-on');
      }catch(e){
        svg.setAttribute('class',(svg.getAttribute('class')||'').replace(/\bmls-(on|off)\b/g,'').trim()+' mls-off'); /* show PRTG's lines again if anything goes wrong */
      }
      if(mo)watch();
    }
    function schedule(){if(pend)return;pend=true;Promise.resolve().then(function(){pend=false;draw();});}
    function inSvg(n){return n&&n.nodeType===1&&(n.id==='mapsvg'||(n.closest&&n.closest('#mapsvg')));}
    function hasSvg(n){return n&&n.nodeType===1&&(n.id==='mapsvg'||(n.querySelector&&n.querySelector('#mapsvg')));}
    function watch(){
      mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['x1','y1','x2','y2','stroke']});
    }
    mo=new MutationObserver(function(recs){
      var i, j, r, need=false;
      for(i=0;i<recs.length&&!need;i++){
        r=recs[i];
        if(r.target.closest&&r.target.closest('g.mls-g'))continue;
        if(inSvg(r.target)){need=true;break;}
        if(r.type==='childList'){
          for(j=0;j<r.addedNodes.length;j++)if(hasSvg(r.addedNodes[j])){need=true;break;}
        }
      }
      if(need)schedule();
    });
    watch();
    tick=setInterval(function(){
      var svg=document.getElementById('mapsvg');
      if(svg&&!/\bmls-(on|off)\b/.test(svg.getAttribute('class')||''))schedule();
    },1500);
    window.__mls={stop:function(){if(mo)mo.disconnect();clearInterval(tick);var g=document.querySelector('#mapsvg g.mls-g');if(g)g.parentNode.removeChild(g);}};
    schedule();
  }
  var LKTYPES=[['straight','Straight (PRTG’s own shape)'],['curve','Curve'],['scurve','S-curve'],['elbow','Elbow (right angles)'],['relbow','Rounded elbow'],['arc','Arc']];
  var LKDASH=[['solid','Solid'],['dashed','Dashed'],['dotted','Dotted'],['dashdot','Dash and dot']];
  var LKENDS=[['none','None'],['dot','Dot'],['arrow','Arrow']];
  function blankLK(){
    return {type:'links',cat:'Links',name:'Map Studio Link style',fname:'',initW:48,initH:48,look:lookOf('Minimal'),
      line:'curve',dash:'solid',width:5,opacity:100,glow:true,round:true,colorMode:'status',color:'#2f80ed',bend:22,radius:20,
      start:'none',end:'none',inset:28,flow:false,flowSec:1.4,calm:false,wait:4};
  }
  function lkNum(v,lo,hi,d){v=parseFloat(v);if(isNaN(v))v=d;return Math.max(lo,Math.min(hi,v));}
  function lkCfg(L){
    var line=LKTYPES.some(function(x){return x[0]===L.line;})?L.line:'curve', dash=LKDASH.some(function(x){return x[0]===L.dash;})?L.dash:'solid';
    function end(v){return (v==='dot'||v==='arrow')?v:'none';}
    return {type:line,dash:dash,width:lkNum(L.width,1,16,5),opacity:lkNum(L.opacity,10,100,100),glow:!!L.glow,round:!!L.round,
      color:(L.colorMode==='custom'&&/^#[0-9a-fA-F]{6}$/.test(String(L.color)))?String(L.color):'',
      bend:lkNum(L.bend,4,60,22),radius:lkNum(L.radius,2,80,20),start:end(L.start),end:end(L.end),inset:lkNum(L.inset,0,150,28),flow:!!L.flow};
  }
  function linksCss(L){
    var wait=lkNum(L.wait,1,10,4), sec=lkNum(L.flowSec,0.4,20,1.4);
    return [
      '#mapsvg line.connectionline{visibility:hidden;animation:mlsShow 0s linear '+wait+'s forwards}',
      '@keyframes mlsShow{to{visibility:visible}}',
      '#mapsvg.mls-on line.connectionline{animation:none;visibility:hidden}',
      '#mapsvg.mls-off line.connectionline,#mapeditor #mapsvg line.connectionline{animation:none;visibility:visible}',
      '.mls-g{pointer-events:none}',
      '.mls-glow{opacity:.22;filter:blur(4px)}',
      '@keyframes mlsFlow{to{stroke-dashoffset:calc(var(--mls-p) * -1)}}',
      '.mls-flow{animation:mlsFlow '+sec+'s linear infinite}',
      (L.calm?'@media (prefers-reduced-motion:reduce){.mls-flow{animation:none}}':''),
      '.map_links .mls-chip{display:none}',
      '#mapeditor .map_links .mls-chip{display:block;font:11px/1.2 Roboto,"Segoe UI",Arial,sans-serif;color:#6b7280;background:#fff;border:1px dashed #9aa4af;border-radius:4px;padding:2px 6px;white-space:nowrap}'
    ].filter(Boolean).join('\n');
  }
  function lkScript(cfg){
    return '('+String(mlsRuntime).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\n\s*/g,'\n')+')('+JSON.stringify(cfg)+');';
  }
  function buildLinks(L){
    var o=[], w=parseInt(L.initW,10), hh=parseInt(L.initH,10);
    var init=(w>0&&hh>0)?' initialwidth="'+Math.min(w,4000)+'" initialheight="'+Math.min(hh,4000)+'"':'';
    o.push('<!'+'--'+clean(L.cat||'Links')+': '+clean(L.name||'Link style')+'-->');
    o.push('<style>');o.push(linksCss(L));o.push('</style>');
    o.push('<div class="map_object map_links" id="<@itemid>" objectid="<@objectid>" subid="<@subid>"'+init+' style="<#mapobject type="coordinates" subid="<@subid>" mode="<@editmode>">">');
    o.push('<#mapobject type="objectgrip" mode="<@editmode>">');
    o.push('<#mapobject type="htmlbefore" subid="<@subid>">');
    o.push('<span class="mls-chip">Link style</span>');
    o.push('<#mapobject type="htmlafter" subid="<@subid>">');
    o.push('</div>');
    o.push('');
    o.push('<scr'+'ipt>');o.push(lkScript(lkCfg(L)));o.push('<\/script>');
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
  var T=blankT(), G=blankG(), GR=blankGR(), DN=blankD(), SB=blankSB(), IC=blankI(), SC=blankSC(), TL=blankTL(), GM=blankGM(), LK=Object.assign(blankLK(),LKDEF), TYPE='label', syncs=[], vis=[], hostEl=document.getElementById('objpanel');
  function M(){return TYPE==='gauge'?G:((TYPE==='frame'||TYPE==='bg'||TYPE==='shape')?FRc():(TYPE==='graph'?GR:(TYPE==='donut'?DN:(TYPE==='sunburst'?SB:(TYPE==='icon'?IC:(TYPE==='status'?SC:(TYPE==='tile'?TL:(TYPE==='geomap'?GM:(TYPE==='links'?LK:T)))))))));}
  /* Frame and Background are the Dashboard's own frame, pasted into a Custom HTML item. The Dashboard hands over its generator, so the code is the same. */
  function blankFR(kind){
    var p=(kind==='shape')?FRAMEAPI.newShapeP('b_arrow','right'):FRAMEAPI.newFrameP(kind==='bg'?'Background dark':'Light card');
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
    var wi=document.getElementById('owidth');if(wi)wi.placeholder=(TYPE==='sunburst')?(SB.engine==='ring'?'420':'auto'):(TYPE==='status')?'420':(TYPE==='tile')?'300':(TYPE==='gauge')?'320':(TYPE==='graph'?(GR.kind==='sensors'?'760':(GR.kind==='toplist'?'240':'520')):(TYPE==='donut'?(DN.engine==='ring'?'340':'auto'):(TYPE==='icon'?String(iStyle(IC.style).w):'fit')));
    var hi=document.getElementById('oheight');if(hi)hi.placeholder=(TYPE==='sunburst')?(SB.engine==='ring'?'440':'auto'):(TYPE==='status')?'200':(TYPE==='tile')?'150':(TYPE==='graph'?(GR.kind==='sensors'?'420':(GR.kind==='toplist'?'240':'300')):(TYPE==='donut'?(DN.engine==='ring'?'220':'auto'):(TYPE==='icon'?String(iStyle(IC.style).h):'280')));
    var pasteMode=isPaste();
    var csb=document.getElementById('ocsetw');if(csb){csb.style.display=pasteMode?'none':'';if(window.PMSHDR)window.PMSHDR.sync();}
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
      if(name==='PRTG default'&&(TYPE==='icon'||TYPE==='status'||TYPE==='tile'||(TYPE==='gauge'&&G.engine==='ring')||(TYPE==='donut'&&DN.engine==='ring')||(TYPE==='sunburst'&&SB.engine==='ring')))return;
      var L=lookOf(name);
      var b=h('button','lookchip'+((M().look&&M().look.name===name)?' on':''));b.type='button';
      b.innerHTML=thumbHTML(L,TYPE)+'<span class="pname">'+name+'</span>';
      b.addEventListener('click',function(){dnKeepC(function(){M().look=lookOf(name);if(TYPE==='gauge'&&G.nstyle)G.nbg='look';if(PS.cur&&!isPaste())csetPaint(PS.cur);});refreshUI();render();});
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
    edBusy=true;if(OB.el)OB.el.style.visibility='hidden';
    function mv(e){onMove(e);}
    function up(e){edBusy=false;if(OB.el)OB.el.style.visibility='';window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);onUp(e);}
    window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
  }
  function edStartResize(ev,sx,sy){
    var wr=document.getElementById('edwrap');if(!wr)return;
    ev.preventDefault();ev.stopPropagation();
    var S={x0:ev.clientX,y0:ev.clientY,W:wr.offsetWidth,H:wr.offsetHeight,rot:edRot()};S.cx=ED.x+S.W/2;S.cy=ED.y+S.H/2;
    var root=wr.querySelector('.map_object');
    edTrack(function(e){
      var d=rotXY((e.clientX-S.x0)/OZ(),(e.clientY-S.y0)/OZ(),-S.rot), nw=S.W, nh=S.H;
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
    var zz=OZ(), c=rotXY((tb.left+tb.width/2-(wb.left+wb.width/2))/zz,(tb.top+tb.height/2-(wb.top+wb.height/2))/zz,-edRot());
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
      var dx=(e.clientX-S.x0)/OZ(),dy=(e.clientY-S.y0)/OZ();
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
      if(ED.sel)edSelectTitle(false);   /* the title is part of the table: it is not picked up or moved on its own; double-click still edits its text */
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
  function eoModel(){return TYPE==='gauge'?G:(TYPE==='sunburst'?SB:(TYPE==='donut'?DN:(TYPE==='graph'?GR:(TYPE==='icon'?IC:(TYPE==='status'?SC:(TYPE==='tile'?TL:null))))));}
  function eoText(){return flexAppend(TYPE==='gauge'?buildGauge(G):(TYPE==='sunburst'?buildSunburst(SB):(TYPE==='donut'?buildDonut(DN):(TYPE==='tile'?buildTile(TL):(TYPE==='status'?buildStatus(SC):(TYPE==='graph'?buildGraph(GR):buildIcon(IC)))))));}
  function eoOk(){return CFG.edit.types.indexOf(TYPE)>-1&&!!eoModel()&&!(TYPE==='icon'&&IC.engine==='stock');}
  function eoSz(m,w,h_){var a=parseInt(m.initW,10), b=parseInt(m.initH,10);return [a>0?a:w,b>0?b:h_];}
  function eoBox(){
    var ms=document.getElementById('mapshow'), root=prevEl.querySelector('.map_object'), ov=EO.ov, mr, rr, z=OZ();
    if(!ms||!root||!ov)return;
    mr=ms.getBoundingClientRect();rr=root.getBoundingClientRect();
    ov.style.left=Math.round((rr.left-mr.left)/z)+'px';ov.style.top=Math.round((rr.top-mr.top)/z)+'px';ov.style.width=Math.round(rr.width/z)+'px';ov.style.height=Math.round(rr.height/z)+'px';
  }
  function eoTag(){var t=document.getElementById('eotag'), root=prevEl.querySelector('.map_object');if(t&&root)t.textContent=Math.round(root.offsetWidth)+' × '+Math.round(root.offsetHeight)+' px';}
  var EOPAD={x:70,y:70,t:''};   /* room left of and above the object, so it can grow in those directions; the file only keeps the size */
  function eoAttach(){
    var ms, root, ov, tag;
    EO.ov=null;EO.inp=null;
    if(EOPAD.t!==TYPE){EOPAD.t=TYPE;EOPAD.x=70;EOPAD.y=70;}
    if(!eoOk())return;
    ms=document.getElementById('mapshow');root=prevEl.querySelector('.map_object');
    if(!ms||!root)return;
    ms.classList.add('eoon');ms.style.position='relative';ms.style.padding=EOPAD.y+'px 76px 60px '+EOPAD.x+'px';
    ov=h('div','edov');ov.style.right='auto';ov.style.bottom='auto';ms.appendChild(ov);EO.ov=ov;
    ov.appendChild(h('div','edframe'));
    [['nw',-1,-1],['n',0,-1],['ne',1,-1],['e',1,0],['se',1,1],['s',0,1],['sw',-1,1],['w',-1,0]].forEach(function(d){
      var e=h('div','edh');e.setAttribute('data-h',d[0]);e.style.left=((d[1]+1)*50)+'%';e.style.top=((d[2]+1)*50)+'%';
      e.style.cursor=(d[1]&&d[2])?((d[1]*d[2]>0)?'nwse-resize':'nesw-resize'):(d[1]?'ew-resize':'ns-resize');
      e.addEventListener('pointerdown',function(ev){eoResize(ev,d[1],d[2]);});
      ov.appendChild(e);
    });
    tag=h('div','edtag');tag.id='eotag';ov.appendChild(tag);
    eoBox();eoTag();
  }
  function eoResize(ev,sx,sy){
    var root=prevEl.querySelector('.map_object'), ms=document.getElementById('mapshow'), m=eoModel(), W0, H0, x0=ev.clientX, y0=ev.clientY, z=OZ(), px0=EOPAD.x, py0=EOPAD.y;
    if(!root||!m||!ms)return;
    ev.preventDefault();ev.stopPropagation();
    W0=root.offsetWidth;H0=root.offsetHeight;
    edTrack(function(e){
      var dx=(e.clientX-x0)/z, dy=(e.clientY-y0)/z, minW=(TYPE==='icon')?12:60, minH=(TYPE==='icon')?12:40, nw=sx?Math.max(minW,Math.round(W0+sx*dx)):W0, nh=sy?Math.max(minH,Math.round(H0+sy*dy)):H0, k;
      if(e.shiftKey&&sx&&sy){k=Math.max(nw/W0,nh/H0);nw=Math.round(Math.max(minW,W0*k));nh=Math.round(Math.max(minH,H0*k));}
      if(sx<0)nw=Math.min(nw,W0+px0-8);   /* the left and top edges stop at the edge of the stage */
      if(sy<0)nh=Math.min(nh,H0+py0-8);
      EOPAD.x=sx<0?px0+(W0-nw):px0;EOPAD.y=sy<0?py0+(H0-nh):py0;
      ms.style.padding=EOPAD.y+'px 76px 60px '+EOPAD.x+'px';
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



  /* ---------- names: every object starts with "Map Studio" and says what is in it, until you type your own ---------- */
  function amLab(list,v){var r=v;list.forEach(function(o){if(o[0]===v)r=o[1];});return r;}
  function amLow(v){return String(v).toLowerCase().replace(/\bprtg\b/g,'PRTG');}   /* lower case, but PRTG stays PRTG */
  function amName(m){
    var t=TYPE, p='Map Studio ', x='', n;
    if(t==='table'){
      n=m.cols.length;x='Table - '+m.cols.slice(0,3).map(colLabel).join(', ')+(n>3?' +'+(n-3):'');
      if(m.status&&m.status.length)x+=' - '+m.status.join(' + ')+' only';
      if(parseInt(m.count,10)>0)x+=' - top '+parseInt(m.count,10);
    }else if(t==='gauge'){
      var gk=(m.engine==='prtg')?(m.nstyle?'n-'+m.nstyle:'classic'):(m.style||'progress');   /* PRTG's own dial (classic or a modern style) has no ring shape */
      x='Gauge - '+amLow(amLab(GFACES.concat([['n-glass','Glass & metallic']]),gk))+(m.engine==='prtg'?(m.small?', small':''):', '+(m.shape==='half'?'half ring':'ring'))+', '+({'sensor-primary':'main channel','sensor-all':'all channels',device:'device sensors'}[m.kind]||m.kind);
      if(m.engine==='prtg'&&m.kind==='device')x+=', '+({4:'5 stars only',3:'4 and 5 stars',2:'3 to 5 stars',1:'2 to 5 stars',0:'all priorities'}[parseInt(m.prio,10)]||'priority '+m.prio);   /* PRTG's dial only: ring names stay as they were */
    }else if(t==='graph'){
      x=(m.kind==='bars')?('Bars - '+({status:'sensor states',channels:'channels',sensors:'sensors'}[m.bsrc||'status'])+', '+(m.bdir==='col'?'vertical':'horizontal')):('Graph - '+({sensor:'sensor',sensors:'sensor list',toplist:'toplist'}[m.kind]||m.kind)+', '+String(amLab(GPERIODS,m.period)).toLowerCase()+((m.kind==='sensor'&&m.draw!=='pic'&&m.cstyle&&m.cstyle!=='area')?', '+m.cstyle:''));
      if(m.draw==='pic'&&m.kind!=='bars')x+=', PRTG picture';   /* PRTG draws this graph as a picture */
    }else if(t==='sunburst'){
      x='Sunburst - '+amLow(amLab(SBFACES,m.engine==='prtg'?'prtg':(m.face||'gaps')))+(m.sizeSensors?', by sensors':'')+(m.sizePriority?', by priority':'')+(m.engine==='prtg'&&m.hidePaused?', no paused devices':'');
    }else if(t==='donut'){
      x='Donut - '+(m.engine==='prtg'?'PRTG classic, ':'')+(m.mode==='alarms'?'alarms only':'all states')+(m.engine==='prtg'?(m.withName?', with name':'')+(m.light?', light text':', dark text'):(m.legend==='none'?', no legend':', legend '+m.legend));
    }else if(t==='status'){
      x='Status counts - '+(m.tiles||[]).join(', ');
    }else if(t==='tile'&&m.fam==='ind'){
      x='Industrial - '+({lamps:'state lamps',onoff:'on/off, '+(m.oStyle||'lamp'),tank:(m.shape==='silo'?'silo':'tank')+' level',equip:String(amLab(IEQ,m.eq||'pump')).toLowerCase(),pv:'process value',count:'countdown, '+(m.cStyle||'ring')}[m.kind]||String(amLab(IKINDS,m.kind)).toLowerCase());
    }else if(t==='tile'){
      x='Tile - '+String(amLab(TKINDS,m.kind)).toLowerCase();
    }else if(t==='icon'){
      if(m.engine!=='custom'){x='Icon - PRTG '+amLow(m.pname||'stock icon').replace(/\bxl\b/g,'XL').replace(/ background/g,'');   /* short enough to stay whole, so the XL ones keep their own names */}
      else x='Icon - '+iStyle(m.style).name.toLowerCase()+(m.text&&m.text!=='none'?', with '+m.text:'');
    }else if(t==='geomap'){
      x='Geo map - '+String(amLab(GMSHAPES,m.shape)).toLowerCase()+' markers'+(m.icon==='device'?'':', '+m.icon+' icon');
    }else if(t==='links'){
      x='Link style - '+String(amLab(LKTYPES,m.line)).replace(/ \(.*$/,'').toLowerCase()+(m.dash==='solid'?'':', '+String(amLab(LKDASH,m.dash)).toLowerCase());
    }else return null;
    x=p+x;
    return x.length>64?x.slice(0,63).replace(/[ ,+\-]+$/,'')+'…':x;
  }
  function obAutoName(){
    var m=M();
    if(!m||isLegacy(TYPE)||isPaste()||m.nameUser)return;
    var n=amName(m);if(n&&n!==m.name)m.name=n;
  }
  /* Add to this list asks for the two names, filled in, so you see exactly what you are naming */
  var ASK={on:false};
  function askNames(done){
    var m=M(), ov=h('div','nmov'), box=h('div','nmbox');
    ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Name this object');
    box.appendChild(h('h3',null,'Name this object'));
    var f1=h('div','dfld'), i1=h('input'), f2=h('div','dfld'), i2=h('input');
    i1.type='text';i1.value=m.name||'';i2.type='text';i2.value=fileNameOf(m).replace(/\.htm$/i,'');
    f1.appendChild(h('label',null,'Object name'));f1.appendChild(i1);
    f1.appendChild(h('p','note','What you see in the Map designer’s list of objects.'));
    f2.appendChild(h('label',null,'File name'));f2.appendChild(i2);
    f2.appendChild(h('p','note','The .htm file in \\\\webroot\\\\mapobjects. Letters, numbers, spaces, dots, dashes and underscores only.'));
    box.appendChild(f1);box.appendChild(f2);
    /* the same check as under the file name: is this name already on the connected PRTG server? It follows what is typed here */
    var nc=h('p','nclash');nc.setAttribute('data-own','1');nc.setAttribute('role','status');nc.setAttribute('aria-live','polite');box.appendChild(nc);
    function ncSync(){
      var t={cat:m.cat,name:clean(i1.value).trim()||m.name,fname:i2.value.replace(/[^A-Za-z0-9 _.\-]/g,'').trim()};
      var r=nameCheckText(t), c=nameClash(t);
      nameCheckPaint(nc,r,function(sg){i1.value=sg.name;i2.value=sg.fname;ncSync();});
      i2.classList.toggle('nc-bad',r.k==='warn'&&!!(c.file||c.libFile));i1.classList.toggle('nc-bad',r.k==='warn'&&!!(c.name||c.libName));
    }
    i1.addEventListener('input',ncSync);i2.addEventListener('input',ncSync);ncSync();
    var ncEv=function(){if(ov.parentNode)ncSync();};document.addEventListener('prtgobjs',ncEv);
    var row=h('div','nmbtns'), no=h('button','btn ghost','Cancel'), yes=h('button','btn primary','Add to this list');
    no.type='button';yes.type='button';row.appendChild(no);row.appendChild(yes);box.appendChild(row);ov.appendChild(box);document.body.appendChild(ov);
    function close(){if(ov.parentNode)ov.parentNode.removeChild(ov);document.removeEventListener('keydown',kd,true);document.removeEventListener('prtgobjs',ncEv);}
    function kd(e){if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Enter'&&e.target&&e.target.tagName==='INPUT'){e.preventDefault();go();}}
    function go(){
      var nm=clean(i1.value).trim(), fn=i2.value.replace(/[^A-Za-z0-9 _.\-]/g,'').trim().replace(/\.html?$/i,'');
      close();
      if(nm){m.name=nm;m.nameUser=true;}
      m.fname=fn;refreshUI();render();done();
    }
    no.addEventListener('click',close);yes.addEventListener('click',go);
    ov.addEventListener('pointerdown',function(e){if(e.target===ov)close();});
    document.addEventListener('keydown',kd,true);
    i1.focus();i1.select();
  }
  (function(){
    var b=document.getElementById('oadd');
    if(!b)return;
    b.addEventListener('click',function(ev){
      if(ASK.on||isLegacy(TYPE)||isPaste())return;
      ev.stopImmediatePropagation();ev.preventDefault();
      askNames(function(){ASK.on=true;try{b.click();}finally{ASK.on=false;}});
    },true);
  })();

  /* ---------- zoom, pixel grid and the options bar over the preview ---------- */
  var OB={el:null,key:'',syncs:[],sel:true,sty:null,presetSel:null};
  function OZ(){
    var ms=document.getElementById('mapshow'), w;
    if(!ms||!ms.offsetWidth)return 1;
    w=ms.getBoundingClientRect().width/ms.offsetWidth;
    return (w>0.05&&w<20)?w:1;
  }
  function obZoom(){
    var sel=document.getElementById('ozoom'), cv=document.getElementById('ocanvas'), grid=document.getElementById('ogridchk'), v=sel?sel.value:'1', z=1, nat, av;
    prevEl.style.zoom='';
    if(v==='fit'){nat=prevEl.scrollWidth;av=cv.clientWidth-48;z=(nat>av&&av>100)?Math.max(0.25,Math.floor(av/nat*100)/100):1;}
    else z=parseFloat(v)||1;
    if(z!==1)prevEl.style.zoom=String(z);
    cv.classList.toggle('pxgrid',!!(grid&&grid.checked));
    cv.style.backgroundSize=(grid&&grid.checked)?(Math.max(2,10*z)+'px '+Math.max(2,10*z)+'px'):'';
  }
  /* sets of status colors: PRTG's own, and others with a clearer green or friendlier to color blindness */
  var PS=window.PMSSETS, CSETS=PS.sets;   /* the color sets are shared with the Map designer's bar; PS.cur is the one chosen */
  function obOk(){return !isLegacy(TYPE)&&!isPaste()&&TYPE!=='links'&&!(TYPE==='icon'&&IC.engine==='stock')&&!!M()&&!!M().look;}
  function obRoot(){return TYPE==='table'?document.getElementById('edwrap'):((TYPE==='geomap'||TYPE==='icon')?(prevEl.querySelector('.icstrip')||prevEl.querySelector('.map_object')):prevEl.querySelector('.map_object'));}   /* the icon preview shows one icon per state: any of them opens the bar */
  function obSet(fn){var m=M(), l=m.look;if(l.mode==='prtg')l.mode='custom';fn(l,m);refreshUI();render();}
  function obBtn(label,title,get,set){
    var b=h('button','fb-t',label);b.type='button';b.title=title;
    b.addEventListener('click',function(){set(!get());});
    OB.syncs.push(function(){b.classList.toggle('on',!!get());});return b;
  }
  function obNum(title,get,set,min,max){
    var i=h('input','fb-n');i.type='number';i.title=title;i.min=min;i.max=max;i.setAttribute('aria-label',title);
    i.addEventListener('input',function(){var v=parseFloat(i.value);if(!isNaN(v))set(Math.max(min,Math.min(max,v)));});
    OB.syncs.push(function(){if(document.activeElement!==i)i.value=get();});return i;
  }
  function obColor(title,get,set){
    var i=h('input','fb-c');i.type='color';i.title=title;i.setAttribute('aria-label',title);
    i.addEventListener('input',function(){set(i.value);});
    OB.syncs.push(function(){var v=get();if(/^#[0-9a-f]{6}$/i.test(v))i.value=v;});return i;
  }
  function obSep(){return h('i','fb-sep');}
  function obLab(t,ctl){var w=h('span','fb-lab');w.appendChild(h('b',null,t));w.appendChild(ctl);return w;}
  /* Flexible | Fixed, as two buttons side by side */
  function obFlex(){
    var w=h('span','fb-seg');w.title='Flexible: everything grows and shrinks with the object. Fixed: PRTG\u2019s standard, the text keeps its size.';
    [['flex','Flexible'],['fixed','Fixed']].forEach(function(x){
      var b=h('button','fb-t',x[1]);b.type='button';
      b.addEventListener('click',function(){obDo(function(){setFlex(x[0]==='flex');});});
      OB.syncs.push(function(){b.classList.toggle('on',(x[0]==='flex')===!!M().fit);});
      w.appendChild(b);
    });
    return w;
  }
  /* menus in the bar: a button that opens a small panel under it */
  function obCloseMenus(){
    if(!OB.el)return;
    if(OB.flip!=null&&OB.flip!==undefined){OB.flip=null;setTimeout(obPlaceIf,0);}
    [].forEach.call(OB.el.querySelectorAll('.fb-pop'),function(q){q.hidden=true;});
    [].forEach.call(OB.el.querySelectorAll('.fb-m > .fb-t'),function(q){q.classList.remove('on');});
  }
  function obMenu(label,title,fill,onOpen){
    var w=h('span','fb-m'), btn=h('button','fb-t',label+' ▾'), pop=h('div','fb-pop');
    btn.type='button';btn.title=title;pop.hidden=true;
    btn.addEventListener('click',function(e){
      e.stopPropagation();var open=pop.hidden;obCloseMenus();
      if(open){if(onOpen)onOpen(pop);pop.hidden=false;btn.classList.add('on');obOpenAway(pop);}
    });
    pop.addEventListener('pointerdown',function(e){e.stopPropagation();});
    fill(pop);w.appendChild(btn);w.appendChild(pop);return w;
  }
  /* a menu opens on the side of the bar away from the object, so it never covers what you are changing:
     upward when the bar is above the object; when there is no room above, the bar moves under the object and the menu opens downward */
  function obOpenAway(pop){
    var b=OB.el, cv=document.getElementById('ocanvas'), root=obRoot(), wh=window.innerHeight, ww=document.documentElement.clientWidth;
    pop.classList.remove('up');pop.style.maxHeight='';pop.style.left='';
    var need=pop.offsetHeight, bh=b.offsetHeight, rr=root?root.getBoundingClientRect():b.getBoundingClientRect();
    /* room for the menu above a bar that sits above the object, and below a bar that sits under it */
    var upRoom=rr.top-10-bh-6-8, downRoom=wh-(rr.bottom+10+bh+6)-8;
    var up=(need<=upRoom)||(need>downRoom&&upRoom>=downRoom);
    if(upRoom<=0&&downRoom<=0)up=(b.getAttribute('data-pos')==='above');   /* no room either way: the bar stays where it is */
    if(up!==(b.getAttribute('data-pos')==='above')){OB.flip=!up;obPlace();}
    if(up)pop.classList.add('up');
    var room=up?(b.getBoundingClientRect().top-6-8):(wh-b.getBoundingClientRect().bottom-6-8);
    if(need>room)pop.style.maxHeight=Math.max(80,Math.floor(room))+'px';
    var r=pop.getBoundingClientRect();
    if(r.right>ww-8)pop.style.left=Math.round(Math.max(8-b.getBoundingClientRect().left,(pop.offsetLeft||0)-(r.right-(ww-8))))+'px';
  }
  function obDo(fn){fn();refreshUI();render();}
  /* the look's bold, italic, underline and UPPERCASE switches, as CSS for the object's class; icons also take their alignment here */
  function txtCss(L,cls,icon){
    if(!L||!cls)return '';
    var r='.'+cls, c=[];
    if(L.tBold)c.push(r+','+r+' *{font-weight:700 !important;}');
    if(L.tItal)c.push(r+','+r+' *{font-style:italic !important;}');
    if(L.tUnder)c.push(r+' *{text-decoration:underline !important;}');
    if(L.tUpper)c.push(r+','+r+' *{text-transform:uppercase !important;}');
    if(icon&&L.align){c.push(r+' .pst.pst-t{justify-content:'+({left:'flex-start',center:'center',right:'flex-end'}[L.align]||'flex-start')+';}');c.push(r+' .pst-b{text-align:'+L.align+';}');}
    return c.length?'\n'+c.join('\n'):'';
  }
  function txtWrap(fn,icon){return function(m,cls,x){var css=fn.apply(this,arguments), L=(x&&x.c)?x:(m&&m.look);return css?css+txtCss(L,cls,icon):css;};}
  tableCss=txtWrap(tableCss);gaugeCss=txtWrap(gaugeCss);graphCss=txtWrap(graphCss);donutCss=txtWrap(donutCss);sunburstCss=txtWrap(sunburstCss);statusCss=txtWrap(statusCss);tileCss=txtWrap(tileCss);iconCss=txtWrap(iconCss,true);
  function pfSel(pop,label,get,set,opts){
    var w=h('div','pf'), sl=h('select');w.appendChild(h('label',null,label));
    opts.forEach(function(o){var op=h('option');op.value=o[0];op.textContent=o[1];sl.appendChild(op);});
    sl.addEventListener('change',function(){obDo(function(){set(sl.value);});});
    OB.syncs.push(function(){sl.value=String(get());});w.appendChild(sl);pop.appendChild(w);return sl;
  }
  function pfNum(pop,label,get,set,min,max){
    var w=h('div','pf'), i=h('input');i.type='number';i.min=min;i.max=max;w.appendChild(h('label',null,label));
    i.addEventListener('input',function(){var v=parseFloat(i.value);if(!isNaN(v))obDo(function(){set(Math.max(min,Math.min(max,v)));});});
    OB.syncs.push(function(){if(document.activeElement!==i)i.value=get();});w.appendChild(i);pop.appendChild(w);
  }
  function pfChk(pop,label,get,set){
    var w=h('label','pf pf-c'), i=h('input');i.type='checkbox';
    i.addEventListener('change',function(){obDo(function(){set(i.checked);});});
    w.appendChild(i);w.appendChild(h('span',null,label));
    OB.syncs.push(function(){i.checked=!!get();});pop.appendChild(w);
  }
  /* a list of things to switch on and off; ordered lists get up and down buttons */
  function pfList(pop,head,all,has,toggle,move){
    var box=h('div','pf-list');
    if(head)pop.appendChild(h('div','pf-h',head));
    pop.appendChild(box);
    function redraw(){
      box.innerHTML='';
      all().forEach(function(it){
        var r=h('div','pf-r'), lb=h('label'), cb=h('input'), on=has(it[0]);
        cb.type='checkbox';cb.checked=on;cb.addEventListener('change',function(){obDo(function(){toggle(it[0],cb.checked);});});
        lb.appendChild(cb);lb.appendChild(h('span',null,it[1]));r.appendChild(lb);
        if(move&&on){
          var u=h('button','cp','▲'), d=h('button','cp','▼');u.type='button';d.type='button';
          u.addEventListener('click',function(){obDo(function(){move(it[0],-1);});});d.addEventListener('click',function(){obDo(function(){move(it[0],1);});});
          r.appendChild(u);r.appendChild(d);
        }
        box.appendChild(r);
      });
    }
    OB.syncs.push(redraw);
  }
  function csetOf(l){
    var r='custom';
    CSETS.forEach(function(x){var ok=true;for(var k in x[2]){if(String((l.c||{})[k]||'').toLowerCase()!==x[2][k].toLowerCase())ok=false;}if(ok)r=x[0];});
    return r;
  }
  function csetGet(id){var r=null;CSETS.forEach(function(x){if(x[0]===id)r=x[2];});return r;}
  /* paint the current object with the chosen set; it is done again on every render, so choosing a look or a preset afterwards keeps the colors */
  function csetPaint(id){
    var set=csetGet(id);
    if(!set)return;
    if(TYPE==='geomap'){
      GM.palette='custom';GM.cols=GM.cols||{};
      GMSTATES.forEach(function(st){GM.cols[st.id]=(st.id==='downack')?blend(set.down,'#FFFFFF',0.45):set[st.id==='warn'?'warning':st.id];if(PS.over[st.id])GM.cols[st.id]=PS.over[st.id];});
    }else{var l=M().look;if(l&&l.mode==='prtg')l.mode='custom';   /* the chosen set wins over a template's PRTG look too */
      if(l){l.c=Object.assign({},set);Object.keys(PS.over).forEach(function(k){if(set[k]!==undefined)l.c[k]=PS.over[k];});}}
  }
  function csetApply(id){
    PS.cur=id;PS.over={};   /* a new set replaces the colors changed by hand */
    if(TYPE!=='geomap'&&M().look.mode==='prtg')M().look.mode='custom';
    csetPaint(id);
  }
  /* small pictures of what each ready-made object looks like, for the Presets menu in the bar */
  function presetObj(v){
    var src=(TYPE==='tile')?TLPRESETS:(TYPE==='status')?SPRESETS:(TYPE==='gauge')?GPRESETS:(TYPE==='graph')?GRPRESETS:(TYPE==='donut')?DPRESETS:(TYPE==='sunburst')?SBPRESETS:(TYPE==='icon')?ICPRESETS:PRESETS, r=null;
    src.forEach(function(x){if(x.id===v)r=x;});return r;
  }
  function pvThumb(type,p){
    var G1='#B8C419',Y='#F5C500',R='#E30613',B='#007DB8',N='#CBD2DC',D='#5F6674', o='', i, n, k=p&&p.kind;
    function svg(inner){return '<svg viewBox="0 0 64 38" width="64" height="38" aria-hidden="true">'+inner+'</svg>';}
    if(type==='table'){
      n=Math.max(1,Math.min(5,(p&&p.cols)?p.cols.length:2));
      o='<rect x="3" y="3" width="58" height="6" rx="1.5" fill="'+N+'"/>';
      for(i=0;i<3;i++){o+='<rect x="3" y="'+(13+i*8)+'" width="58" height="1.5" fill="#E5E8EE"/>';for(var c=0;c<n;c++)o+='<rect x="'+(5+c*(54/n))+'" y="'+(10.5+i*8)+'" width="'+Math.max(4,54/n-6)+'" height="3" rx="1" fill="'+(c===0?[G1,Y,R][i]:D)+'" opacity="'+(c===0?1:.55)+'"/>';}
      return svg(o);
    }
    if(type==='gauge'){
      if(k==='device')return svg('<rect x="4" y="8" width="56" height="4" rx="2" fill="'+N+'"/><rect x="4" y="8" width="34" height="4" rx="2" fill="'+G1+'"/><rect x="4" y="17" width="56" height="4" rx="2" fill="'+N+'"/><rect x="4" y="17" width="46" height="4" rx="2" fill="'+Y+'"/><rect x="4" y="26" width="56" height="4" rx="2" fill="'+N+'"/><rect x="4" y="26" width="18" height="4" rx="2" fill="'+R+'"/>');
      return svg('<path d="M16 32a16 16 0 1 1 32 0" fill="none" stroke="'+N+'" stroke-width="5" stroke-linecap="round"/><path d="M16 32a16 16 0 0 1 20-15.5" fill="none" stroke="'+G1+'" stroke-width="5" stroke-linecap="round"/><path d="M32 30l7-9" stroke="'+D+'" stroke-width="2" stroke-linecap="round"/>');
    }
    if(type==='graph'){
      if(k==='sensors')return svg([0,1,2,3].map(function(q){return '<rect x="'+(3+(q%2)*30)+'" y="'+(3+Math.floor(q/2)*17)+'" width="28" height="15" rx="2" fill="#F1F3F7" stroke="#E0E4EA"/><path d="M'+(6+(q%2)*30)+' '+(14+Math.floor(q/2)*17)+'l6-5 5 3 6-6" fill="none" stroke="'+B+'" stroke-width="1.5"/>';}).join(''));
      if(k==='toplist')return svg([0,1,2,3].map(function(q){return '<rect x="4" y="'+(4+q*8)+'" width="'+(54-q*10)+'" height="5" rx="2" fill="'+(q?N:B)+'"/>';}).join(''));
      return svg('<path d="M3 33h58M3 5v28" stroke="#E0E4EA"/><path d="M5 28l12-10 10 6 14-14 18 6" fill="none" stroke="'+B+'" stroke-width="2"/><path d="M5 30l14-6 12 2 12-8 16 4" fill="none" stroke="'+G1+'" stroke-width="2"/>');
    }
    if(type==='donut'){
      var al=!!(p&&p.alarms);
      return svg('<circle cx="32" cy="19" r="13" fill="none" stroke="'+(al?R:G1)+'" stroke-width="7" stroke-dasharray="'+(al?'28 54':'52 30')+'"/><circle cx="32" cy="19" r="13" fill="none" stroke="'+(al?Y:Y)+'" stroke-width="7" stroke-dasharray="'+(al?'18 64':'14 68')+'" stroke-dashoffset="'+(al?'-28':'-52')+'"/><circle cx="32" cy="19" r="13" fill="none" stroke="'+(al?N:R)+'" stroke-width="7" stroke-dasharray="'+(al?'0 82':'10 72')+'" stroke-dashoffset="'+(al?'0':'-66')+'"/>');
    }
    if(type==='status'){
      n=Math.max(1,Math.min(4,(p&&p.tiles)?p.tiles.length:3));var cl=[G1,Y,R,N];
      for(i=0;i<n;i++)o+='<rect x="'+(3+i*(58/n))+'" y="6" width="'+(58/n-3)+'" height="26" rx="3" fill="'+cl[i]+'" opacity=".9"/><rect x="'+(6+i*(58/n))+'" y="12" width="'+Math.max(6,58/n-9)+'" height="7" rx="1.5" fill="#fff" opacity=".9"/>';
      return svg(o);
    }
    if(type==='tile'&&(p?p.fam==='ind':tlFam()==='ind'))return iKindSvg(k||'lamps').replace('width="64" height="44"','width="64" height="38"');
    if(type==='tile'){
      if(k==='bar')return svg('<rect x="4" y="6" width="30" height="5" rx="2" fill="'+D+'" opacity=".6"/><rect x="4" y="20" width="56" height="8" rx="4" fill="'+N+'"/><rect x="4" y="20" width="36" height="8" rx="4" fill="'+G1+'"/>');
      if(k==='string')return svg('<rect x="4" y="8" width="40" height="5" rx="2" fill="'+D+'" opacity=".6"/><rect x="4" y="20" width="26" height="9" rx="2" fill="'+G1+'"/>');
      if(k==='interface')return svg('<path d="M10 28V10M10 10l-4 5M10 10l4 5" stroke="'+B+'" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M30 10v18M30 28l-4-5M30 28l4-5" stroke="'+G1+'" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="42" y="12" width="18" height="5" rx="2" fill="'+N+'"/><rect x="42" y="22" width="14" height="5" rx="2" fill="'+N+'"/>');
      if(k==='chips'||k==='chipsfit')return svg([0,1,2,3,4,5].map(function(q){return '<rect x="'+(4+(q%3)*19)+'" y="'+(6+Math.floor(q/3)*15)+'" width="17" height="12" rx="6" fill="'+[G1,G1,Y,G1,R,N][q]+'"/>';}).join(''));
      return svg('<rect x="4" y="5" width="28" height="4" rx="2" fill="'+D+'" opacity=".6"/><rect x="4" y="14" width="34" height="14" rx="2" fill="'+G1+'"/><rect x="42" y="20" width="14" height="5" rx="2" fill="'+N+'"/>');
    }
    if(type==='icon')return svg('<circle cx="14" cy="19" r="8" fill="'+G1+'"/><circle cx="32" cy="19" r="8" fill="'+Y+'"/><circle cx="50" cy="19" r="8" fill="'+R+'"/>');
    return svg('<rect x="6" y="8" width="52" height="22" rx="3" fill="'+N+'"/>');
  }
  /* What the object will be attached to on the map: Group, Device, Sensor, or All (no filter). The bar then offers only what works there. */
  var SCOPES=[['group','Group'],['device','Device'],['sensor','Sensor'],['all','All']];
  var SCOPE='all';try{SCOPE=localStorage.getItem('pmScope')||'all';}catch(e){}
  if(!SCOPES.some(function(x){return x[0]===SCOPE;}))SCOPE='all';
  var GD=['group','device'], SN=['sensor'], AL=['group','device','sensor'];
  function typeScopes(t){return ({table:GD,donut:GD,status:GD,geomap:GD,tile:SN,ind:SN,icon:AL,sunburst:['group']})[t]||AL;}
  function gaugeKindScopes(k){return k==='device'?GD:SN;}
  function graphScopes(kind,bsrc){if(kind==='sensor'||kind==='toplist')return SN;if(kind==='sensors')return GD;if(kind==='bars')return bsrc==='channels'?SN:GD;return AL;}
  function fitsScope(list){return SCOPE==='all'||list.indexOf(SCOPE)>-1;}
  function modelScopes(){return TYPE==='gauge'?gaugeKindScopes(G.kind):(TYPE==='graph'?graphScopes(GR.kind,GR.bsrc||'status'):typeScopes(TYPE));}
  function presetScopes(p){if(!p)return AL;if(TYPE==='gauge')return gaugeKindScopes(p.kind);if(TYPE==='graph')return graphScopes(p.kind,'status');return typeScopes(TYPE);}
  function setGrKind(v){GR.kind=v;grKindSize(v);if(v==='sensors'&&GR.titleMode==='object')GR.titleMode='stock';else if(v!=='sensors'&&GR.titleMode==='stock')GR.titleMode='object';}
  /* after a new choice, an option that does not work there is moved to the nearest one that does */
  function scopeFix(){
    if(SCOPE==='all')return;
    var sen=(SCOPE==='sensor');
    if(TYPE==='gauge'&&!fitsScope(gaugeKindScopes(G.kind)))G.kind=sen?'sensor-primary':'device';
    if(TYPE==='graph'&&!fitsScope(graphScopes(GR.kind,GR.bsrc||'status'))){
      if(GR.kind==='bars')GR.bsrc=sen?'channels':'sensors';
      else setGrKind(sen?'sensor':'sensors');
    }
  }
  function scopeWord(list){return list.length===3?'a group, device or sensor':(list===SN?'a sensor':((list.length===1&&list[0]==='group')?'a group or probe':'a group or device'));}
  function setScope(v){
    SCOPE=v;try{localStorage.setItem('pmScope',v);}catch(e){}
    scopeFix();OB.key='';scopeGrid();refreshUI();render();
  }
  /* the object types at the top: the ones that do not work on the choice are dimmed */
  function scopeGrid(){
    (gridTiles||[]).forEach(function(t){var ty=t.getAttribute('data-t'), ok=(ty==='links')||fitsScope(ty==='gauge'||ty==='graph'?AL:typeScopes(ty));t.classList.toggle('na',!ok);});
  }
  function obScope(b){
    var w=h('span','fb-scope');w.setAttribute('role','radiogroup');w.setAttribute('aria-label','Attached to');
    SCOPES.forEach(function(x){
      var q=h('button','fb-t',x[1]);q.type='button';q.setAttribute('role','radio');
      q.title=x[0]==='all'?'Show every option':('Show only what works on '+(x[0]==='sensor'?'a sensor':'a '+x[0]));
      q.addEventListener('click',function(){setScope(x[0]);});
      OB.syncs.push(function(){var on=(SCOPE===x[0]);q.classList.toggle('on',on);q.setAttribute('aria-checked',on?'true':'false');});
      w.appendChild(q);
    });
    b.appendChild(w);
    var ok=fitsScope(modelScopes());
    if(!ok){var nt=h('span','fb-scopenote','Works on '+scopeWord(modelScopes()));nt.title='This object is made for '+scopeWord(modelScopes())+'. Pick another object type, or All.';b.appendChild(nt);}
    b.appendChild(obSep());
  }
  function pfText(pop,label,get,set,ph){
    var w=h('div','pf'), i=h('input');i.type='text';if(ph)i.placeholder=ph;w.appendChild(h('label',null,label));
    i.addEventListener('change',function(){obDo(function(){set(i.value);});});
    OB.syncs.push(function(){if(document.activeElement!==i)i.value=get()||'';});w.appendChild(i);pop.appendChild(w);
  }
  function obPresetGrid(pop){
    pop.innerHTML='';
    pop.appendChild(h('div','pf-h','Replaces the settings of this object'));
    var g=h('div','presetgrid');pop.appendChild(g);
    function add(o){
      var b=h('button','presetchip');b.type='button';
      b.innerHTML='<span class="swatch">'+pvThumb(TYPE,o.value==='__blank'?null:presetObj(o.value))+'</span><span class="pname"></span>';
      b.lastChild.textContent=o.textContent;
      b.addEventListener('click',function(){presetSel.value=o.value;presetSel.dispatchEvent(new Event('change'));obCloseMenus();});
      g.appendChild(b);
    }
    [].forEach.call(presetSel.children,function(c){
      var fit=function(o){return o.value==='__blank'||o.value===''||fitsScope(presetScopes(presetObj(o.value)));};
      if(c.tagName==='OPTGROUP'){var kids=[].filter.call(c.children,fit);if(kids.length){g.appendChild(h('div','pgroup',c.label));kids.forEach(add);}}else if(fit(c))add(c);
    });
    if(SCOPE!=='all')pop.appendChild(h('div','pf-h','Showing what works on '+(SCOPE==='sensor'?'a sensor':'a '+SCOPE)+'. Choose All for every template.'));
  }
  function obBuild(){
    if(TYPE==='geomap')return obBuildGeo();
    var b=OB.el, m=M(), L=function(){return M().look;};
    if(!b){b=h('div');b.id='obar';b.setAttribute('role','toolbar');b.setAttribute('aria-label','Options for this object');document.body.appendChild(b);OB.el=b;}
    b.innerHTML='';OB.syncs=[];
    var sty=h('span','fb-g');OB.sty=sty;
    var fs=h('select','fb-s');fs.title='Font';fs.setAttribute('aria-label','Font');
    Array.prototype.forEach.call(el.fam.options,function(o){var op=h('option');op.value=o.value;op.textContent=o.textContent;fs.appendChild(op);});
    fs.addEventListener('change',function(){obSet(function(l){l.font=fs.value;});});
    OB.syncs.push(function(){fs.value=L().font;});
    /* presets and looks first: they change the most */
    obScope(b);
    b.appendChild(obMenu('Templates','Start from a ready-made '+({table:'table',gauge:'gauge',graph:'graph',donut:'donut',sunburst:'sunburst',status:'status counts',icon:'icon',tile:(tlFam()==='ind'?'industrial object':'tile')}[TYPE]||'object'),function(pop){pop.className+=' fb-wide';},function(pop){obPresetGrid(pop);}));
    var mLooks=(obMenu('Looks','Change the whole look',function(pop){
      pop.className+=' fb-wide';
      var g=h('div','presetgrid');pop.appendChild(g);
      LOOKORDER.forEach(function(name){
        if(name==='PRTG default'&&(TYPE==='icon'||TYPE==='status'||TYPE==='tile'||(TYPE==='gauge'&&G.engine==='ring')||(TYPE==='donut'&&DN.engine==='ring')||(TYPE==='sunburst'&&SB.engine==='ring')))return;
        var q=h('button','lookchip');q.type='button';q.setAttribute('data-look',name);
        q.innerHTML=thumbHTML(lookOf(name),TYPE)+'<span class="pname">'+name+'</span>';
        q.addEventListener('click',function(){obDo(function(){dnKeepC(function(){M().look=lookOf(name);if(TYPE==='gauge'&&G.nstyle)G.nbg='look';if(PS.cur&&!isPaste())csetPaint(PS.cur);});});});g.appendChild(q);
      });
      OB.syncs.push(function(){[].forEach.call(g.children,function(q){q.classList.toggle('on',L().name===q.getAttribute('data-look'));});});
    }));
    var mColors=(obMenu('Colors','Colors: a set that overrides the look and the template',function(pop){
      pop.appendChild(h('div','pf-h','Status colors for up, warning, down, unusual, paused, unknown'));
      var g=h('div','pf-sets');pop.appendChild(g);
      CSETS.forEach(function(x){
        var q=h('button','pf-set');q.type='button';q.setAttribute('data-set',x[0]);
        q.innerHTML='<span class="sw">'+['up','warning','down','unusual','paused','unknown'].map(function(k){return '<i style="background:'+x[2][k]+'"></i>';}).join('')+'</span><span>'+x[1]+'</span>';
        q.addEventListener('click',function(){obDo(function(){csetApply(x[0]);});});g.appendChild(q);
      });
      OB.syncs.push(function(){var cur=csetOf(L());[].forEach.call(g.children,function(q){q.classList.toggle('on',q.getAttribute('data-set')===cur);});});
    }));
    /* what is specific to each kind of object */
    if(TYPE==='table'){
      b.appendChild(obMenu('Columns','Which columns the table shows, and in what order',function(pop){
        pfList(pop,'Columns shown',function(){var rest=COLS.filter(function(c){return M().cols.indexOf(c[0])<0;}).map(function(c){return c[0];});return M().cols.concat(rest).map(function(k){return [k,colLabel(k)];});},
          function(k){return M().cols.indexOf(k)>-1;},
          function(k,on){var c=M().cols,at=c.indexOf(k);if(on&&at<0)c.push(k);else if(!on&&at>-1){if(c.length<2){toast('A table needs at least one column');return;}c.splice(at,1);}},
          function(k,d){var c=M().cols,i=c.indexOf(k),n=i+d;if(i<0||n<0||n>=c.length)return;c.splice(i,1);c.splice(n,0,k);});
      }));
      b.appendChild(obMenu('Rows','Which rows, how many, and in what order',function(pop){
        pfNum(pop,'Most rows (0 = all)',function(){return M().count;},function(v){M().count=v;},0,200);
        pfSel(pop,'Sort by',function(){return M().sortBy;},function(v){M().sortBy=v;},SORTS.map(function(k){return [k,colLabel(k)];}));
        pfSel(pop,'Order',function(){return M().sortDir;},function(v){M().sortDir=v;},[['asc','Ascending'],['desc','Descending']]);
        pfList(pop,'Only these states (none ticked = all)',function(){return STATUSDEF.map(function(d){return [d[0],d[1]];});},
          function(k){return M().status.indexOf(k)>-1;},
          function(k,on){var st=M().status,at=st.indexOf(k);if(on&&at<0)st.push(k);else if(!on&&at>-1)st.splice(at,1);});
      }));
    }else if(TYPE==='gauge'){
      b.appendChild(obMenu('Gauge','Face, shape and what it shows',function(pop){
        pop.className+=' fb-wide';
        pop.appendChild(h('div','pf-h','Face'));
        var fg=gFaceGrid();pop.appendChild(fg);OB.syncs.push(function(){fg.syncFace();});
        pfSel(pop,'Shows',function(){return G.kind;},function(v){G.kind=v;},GKINDS.filter(function(x){return fitsScope(gaugeKindScopes(x[0]));}));
        if(G.engine==='prtg'&&!G.nstyle)pfChk(pop,'Fit the gauges to the object\u2019s size',function(){return G.fit!==false;},function(v){G.fit=v;});
        if(G.engine==='prtg'&&G.nstyle)pfSel(pop,'Background',function(){return G.nbg||'dark';},function(v){G.nbg=v;},[['look','From the look'],['dark','Dark'],['light','Light']]);
        if(G.engine==='prtg'){pfSel(pop,'Scale numbers',function(){return G.nscale||'off';},function(v){G.nscale=v;},[['off','Off'],['outside','Outside the dial'],['inside','Inside, round the needle']]);
          pfSel(pop,'Value line',function(){return G.nline||'off';},function(v){G.nline=v;},[['off','Off'],['full','Complete (thick to the value, thin after)'],['value','Up to the value only']]);
          pfSel(pop,'Zone colours',function(){return G.npal||'prtg';},function(v){G.npal=v;},[['prtg','PRTG\u2019s (or the look\u2019s)'],['cnp','Cyan, navy and pink']]);}
        if(G.engine==='ring'){
          pfSel(pop,'Shape',function(){return G.shape;},function(v){G.shape=v;},[['ring','Ring (270°)'],['half','Half ring (180°)']]);
          pfNum(pop,'Thickness',function(){return G.thick;},function(v){G.thick=v;},4,40);
          pfChk(pop,'Needle',function(){return G.needle;},function(v){G.needle=v;});
          pfChk(pop,'Minimum and maximum',function(){return G.showMinMax;},function(v){G.showMinMax=v;});
          pfChk(pop,'Glow',function(){return !!G.glow;},function(v){G.glow=v;});
        }
      }));
    }else if(TYPE==='graph'){
      b.appendChild(obMenu('Graph','What the graph shows and over what period',function(pop){
        var obPick=function(label,g,get,set,keep){pop.appendChild(h('div','pf-h',label));var pg=grPicGrid(g,get,set,keep,obDo);pop.appendChild(pg);OB.syncs.push(function(){pg.syncPick();});};
        obPick('Shows','kind',function(){return GR.kind;},function(v){setGrKind(v);},function(k){return k==='bars'?(fitsScope(graphScopes('bars','status'))||fitsScope(graphScopes('bars','channels'))):fitsScope(graphScopes(k));});
        if(GR.kind==='bars'){
          obPick('Bars show','bsrc',function(){return GR.bsrc||'status';},function(v){GR.bsrc=v;if(v==='status'&&GR.bcolor==='cat')GR.bcolor='status';},function(k){return fitsScope(graphScopes('bars',k));});
          obPick('Direction','bdir',function(){return GR.bdir||'row';},function(v){GR.bdir=v;});
          if(GR.bsrc!=='status'){
            obPick('Bar colors','bcolor',function(){return GR.bcolor||'status';},function(v){GR.bcolor=v;});
            pfNum(pop,'Most bars shown',function(){return GR.bmax||8;},function(v){GR.bmax=v;},1,40);
            pfText(pop,'Only names containing (comma separated)',function(){return GR.chNames;},function(v){GR.chNames=v;},GR.bsrc==='sensors'?'Ping':'Traffic');
          }
        }else{
          pfSel(pop,'Period',function(){return GR.period;},function(v){GR.period=parseInt(v,10);},GPERIODS);
          if(GR.kind==='sensor'||GR.kind==='sensors')obPick('Drawing','draw',function(){return GR.draw||'own';},function(v){GR.draw=v;});
          if((GR.kind==='sensor'||GR.kind==='sensors')&&GR.draw!=='pic'){
          pop.appendChild(h('div','pf-h','Chart style'));
          var gsg=h('div','presetgrid');pop.appendChild(gsg);
          GRSTYLES.forEach(function(x){var q=h('button','lookchip');q.type='button';q.setAttribute('data-cs',x[0]);q.title=x[1];q.innerHTML='<span class="grpic"></span><span class="pname">'+x[1]+'</span>';q.addEventListener('click',function(){obDo(function(){GR.cstyle=x[0];});});gsg.appendChild(q);});
          var shotKey='';
          OB.syncs.push(function(){
            [].forEach.call(gsg.children,function(q){q.classList.toggle('on',(GR.cstyle||'area')===q.getAttribute('data-cs'));});
            var k=grShotKey();if(k===shotKey)return;shotKey=k;
            var sh=grShots();
            [].forEach.call(gsg.children,function(q){var k2=q.getAttribute('data-cs');q.querySelector('.grpic').innerHTML=sh[k2]||grStyleSvg(k2);});
          });
          pfChk(pop,'Dots',function(){return GR.dots;},function(v){GR.dots=v;});
        }
          pfChk(pop,'Legend',function(){return GR.legend;},function(v){GR.legend=v;});
          pfChk(pop,'Axis',function(){return GR.axis;},function(v){GR.axis=v;});
          pfChk(pop,'Tooltips',function(){return GR.tooltips;},function(v){GR.tooltips=v;});
        }
      }));
    }else if(TYPE==='sunburst'){
      b.appendChild(obMenu('Sunburst','Style, sizes and what is shown',function(pop){
        pop.className+=' fb-wide';
        pop.appendChild(h('div','pf-h','Style'));
        var sfg=sbFaceGrid();pop.appendChild(sfg);OB.syncs.push(function(){sfg.syncFace();});
        pfChk(pop,'Size by number of sensors',function(){return SB.sizeSensors;},function(v){SB.sizeSensors=v;});
        pfChk(pop,'Size by priority',function(){return SB.sizePriority;},function(v){SB.sizePriority=v;});
        pfChk(pop,'Hide paused devices',function(){return SB.hidePaused;},function(v){SB.hidePaused=v;});
        if(SB.engine==='ring'){
          pfSel(pop,'In the middle',function(){return SB.center;},function(v){SB.center=v;},SBCENTERS);
          pfSel(pop,'Legend',function(){return SB.legend;},function(v){SB.legend=v;},DLEGENDS);
          pfNum(pop,'Hole in the middle %',function(){return SB.hole;},function(v){SB.hole=v;},0,70);
          pfNum(pop,'Rings shown (0 = all)',function(){return SB.depth;},function(v){SB.depth=v;},0,8);
          pfChk(pop,'Names on the slices',function(){return SB.labels;},function(v){SB.labels=v;});
          pfChk(pop,'Slices are links to PRTG',function(){return SB.links;},function(v){SB.links=v;});
        }
      }));
    }else if(TYPE==='donut'&&DN.engine==='ring'){
      b.appendChild(obMenu('Donut','What the donut counts and how it is laid out',function(pop){
        pfSel(pop,'Shows',function(){return DN.mode;},function(v){DN.mode=v;},[['all','All sensor states'],['alarms','Alarms only']]);
        pfSel(pop,'Legend',function(){return DN.legend;},function(v){DN.legend=v;},DLEGENDS);
        pfNum(pop,'Ring thickness',function(){return DN.thick;},function(v){DN.thick=v;},6,60);
        pfChk(pop,'Hide states with zero',function(){return DN.hideZero;},function(v){DN.hideZero=v;});
        pfChk(pop,'Show the counts',function(){return DN.showCounts;},function(v){DN.showCounts=v;});
      }));
    }else if(TYPE==='status'){
      b.appendChild(obMenu('Tiles','Which counts to show',function(pop){
        var SL={up:'Up',warning:'Warning',down:'Down',ack:'Down (acknowledged)',paused:'Paused',unusual:'Unusual',unknown:'Unknown',total:'Total',pctup:'Percent up'};
        pfList(pop,'Tiles shown',function(){return STILES.map(function(k){return [k,SL[k]||k];});},
          function(k){return (SC.tiles||[]).indexOf(k)>-1;},
          function(k,on){var t=SC.tiles=SC.tiles||[],at=t.indexOf(k);if(on&&at<0)t.push(k);else if(!on&&at>-1){if(t.length<2){toast('Keep at least one tile');return;}t.splice(at,1);}});
      }));
    }else if(TYPE==='tile'){
      var fam_=tlFam();
      b.appendChild(obMenu(fam_==='ind'?'Industrial':'Tile',fam_==='ind'?'What kind of industrial object this is':'What kind of tile this is',function(pop){
        pop.appendChild(h('div','pf-h','Kind'));
        var kg=tKindGrid(fam_);pop.appendChild(kg);OB.syncs.push(function(){kg.syncKind();});
      }));
    }else if(TYPE==='icon'&&IC.engine==='custom'){
      b.appendChild(obMenu('Icon','The icon style and the text next to it',function(pop){
        pop.classList.add('fb-icpop');
        var gw=h('div','pf');gw.appendChild(h('label',null,'Style'));
        var gal=h('div','icgal fb-icgal');gw.appendChild(gal);pop.appendChild(gw);
        OB.icGal=gal;   /* filled each time the menu opens, so the pictures use the current colours */
        pfSel(pop,'Text next to it',function(){return IC.text;},function(v){IC.text=v;},[['none','Icon only'],['name','Icon and object name'],['word','Icon and status word'],['both','Icon, name and status word']]);
        pfChk(pop,'Animate',function(){return IC.animate;},function(v){IC.animate=v;});
      },function(){if(OB.icGal)fillStyleGallery(OB.icGal,'obg');}));
    }
    if(!(TYPE==='icon'&&!iHasBg(IC)))b.appendChild(mLooks);   /* on an icon without a background a look would only change the status colours, which Colors does */
    b.appendChild(mColors);
    b.appendChild(obSep());
    if(FLEXT[TYPE]&&!isPaste()){b.appendChild(obFlex());b.appendChild(obSep());}
    /* fonts, colours and corners */
    sty.appendChild(fs);
    /* two sizes: the title's and the text inside the object */
    if(TYPE==='table'||('titleMode' in M()))sty.appendChild(obLab('Title',obNum('Title size',function(){return L().titleSize;},function(v){obSet(function(l){l.titleSize=v;});},8,60)));
    sty.appendChild(obLab('Text',obNum('Text size',function(){return L().size;},function(v){obSet(function(l){l.size=v;});},8,40)));
    sty.appendChild(obSep());
    /* bold, italic, underline and UPPERCASE for the object's text, the same four as the Map designer's bar */
    [['tBold','Bold','<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>'],['tItal','Italic','<path d="M10 5h8M6 19h8M15 5l-6 14"/>'],['tUnder','Underline','<path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14"/>'],['tUpper','UPPERCASE','']].forEach(function(d){
      var q=h('button','fb-t fb-i',d[2]?'<svg viewBox="0 0 24 24" aria-hidden="true">'+d[2]+'</svg>':'<span class="fb-aa">AA</span>');q.type='button';q.title=d[1];q.setAttribute('aria-label',d[1]);
      q.addEventListener('click',function(){obSet(function(l){l[d[0]]=!l[d[0]];});});
      OB.syncs.push(function(){q.classList.toggle('on',!!L()[d[0]]);});
      sty.appendChild(q);
    });
    sty.appendChild(obSep());
    sty.appendChild(obColor('Text color',function(){return L().text;},function(v){obSet(function(l){l.text=v;});}));
    sty.appendChild(obColor('Fill color',function(){return L().cardBg;},function(v){obSet(function(l){l.card=true;l.cardBg=v;});}));
    sty.appendChild(obColor('Border color',function(){return L().border;},function(v){obSet(function(l){l.card=true;l.border=v;if(!(l.bw>0))l.bw=1;});}));
    sty.appendChild(obNum('Corner radius',function(){return L().radius;},function(v){obSet(function(l){l.card=true;l.radius=v;});},0,40));
    b.appendChild(sty);
    var sp=h('span','fb-g');b.appendChild(sp);
    if(TYPE==='table'){
      sp.appendChild(obSep());
      sp.appendChild(obBtn('Header','Show the header row',function(){return L().head;},function(v){obSet(function(l){l.head=v;});}));
      sp.appendChild(obBtn('Stripes','Striped rows',function(){return L().zebra;},function(v){obSet(function(l){l.zebra=v;});}));
      sp.appendChild(obBtn('Title','Show the title',function(){return M().showTitle!==false;},function(v){M().showTitle=v;refreshUI();render();}));
    }else{
      if(TYPE==='gauge'){
        sp.appendChild(obSep());
        sp.appendChild(obBtn('Needle','Show the needle',function(){return G.needle;},function(v){G.needle=v;refreshUI();render();}));
        sp.appendChild(obBtn('Min/max','Show the minimum and maximum',function(){return G.showMinMax;},function(v){G.showMinMax=v;refreshUI();render();}));
      }
      if('titleMode' in m){
        sp.appendChild(obSep());
        sp.appendChild(obBtn('Title','Show the title',function(){return M().titleMode!=='none';},function(v){M().titleMode=v?'object':'none';refreshUI();render();}));
      }
    }
    {
      var al=h('span','fb-al');
      [['left','Align left','<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>'],['center','Center','<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>'],['right','Align right','<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>']].forEach(function(a){
        var q=h('button','fb-t fb-i','<svg viewBox="0 0 24 24" aria-hidden="true">'+a[2]+'</svg>');q.type='button';q.title=(TYPE==='table'?'Title: ':'')+a[1];q.setAttribute('aria-label',a[1]);
        q.addEventListener('click',function(){if(TYPE==='table'){obDo(function(){T.tAlign=(T.tAlign===a[0])?'':a[0];});}else obSet(function(l){l.align=(l.align===a[0])?'':a[0];});});
        OB.syncs.push(function(){q.classList.toggle('on',(TYPE==='table'?T.tAlign:L().align)===a[0]);});
        al.appendChild(q);
      });
      sp.appendChild(obSep());sp.appendChild(al);
    }
    if(eoOk()){
      sp.appendChild(obSep());
      var rs=h('button','fb-t','Auto size');rs.type='button';rs.title='Let PRTG decide the size again';
      rs.addEventListener('click',function(){M().initW=0;M().initH=0;EOPAD.x=70;EOPAD.y=70;refreshUI();render();});
      sp.appendChild(rs);
    }
    OB.key=obKey();
  }
    /* the Geo map's bar: pick a marker shape by its picture, then the icon, colors and the other marker settings */
  function gmShapeSvg(id,col){
    var P={
      card:'<rect x="6" y="5" width="12" height="14" rx="1" fill="#FFFFFF" stroke="#BFC5D0"/><rect x="4.5" y="5" width="3" height="14" rx="1" fill="'+col+'"/>',
      badge:'<rect x="4" y="4" width="16" height="16" rx="5" fill="'+col+'"/><circle cx="12" cy="12" r="3" fill="#FFFFFF"/>',
      circle:'<circle cx="12" cy="12" r="8" fill="'+col+'"/><circle cx="12" cy="12" r="3" fill="#FFFFFF"/>',
      ring:'<circle cx="12" cy="12" r="7" fill="#FFFFFF" stroke="'+col+'" stroke-width="3"/>',
      pin:'<path d="M12 2C7.6 2 4.5 5.2 4.5 9.2c0 5.4 6.6 11.7 7 12.1.3.3.7.3 1 0 .4-.4 7-6.7 7-12.1C19.5 5.2 16.4 2 12 2z" fill="'+col+'"/><circle cx="12" cy="9.2" r="3.8" fill="#FFFFFF"/>',
      pinfill:'<path d="M12 2C7.6 2 4.5 5.2 4.5 9.2c0 5.4 6.6 11.7 7 12.1.3.3.7.3 1 0 .4-.4 7-6.7 7-12.1C19.5 5.2 16.4 2 12 2z" fill="'+col+'"/><circle cx="12" cy="9.2" r="2.2" fill="#FFFFFF"/>',
      pulse:'<circle cx="12" cy="12" r="11" fill="'+col+'" opacity=".16"/><circle cx="12" cy="12" r="7.6" fill="'+col+'" opacity=".32"/><circle cx="12" cy="12" r="4.6" fill="'+col+'"/><circle cx="12" cy="12" r="1.8" fill="#FFFFFF"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:24px;height:24px">'+P[id]+'</svg>';
  }
  function gmSetOf(){
    var r='custom';
    CSETS.forEach(function(x){var ok=true;GMSTATES.forEach(function(st){if(st.id!=='downack'&&String(gmColor(GM,st.id)).toLowerCase()!==x[2][st.id==='warn'?'warning':st.id].toLowerCase())ok=false;});if(ok)r=x[0];});
    return r;
  }
  function obBuildGeo(){
    var b=OB.el;
    if(!b){b=h('div');b.id='obar';b.setAttribute('role','toolbar');b.setAttribute('aria-label','Options for this object');document.body.appendChild(b);OB.el=b;}
    b.innerHTML='';OB.syncs=[];OB.sty=null;
    obScope(b);
    var shp=h('span','fb-shapes');
    GMSHAPES.forEach(function(x){
      var q=h('button','fb-t fb-sh');q.type='button';q.title=x[1]+' markers';q.setAttribute('aria-label',x[1]+' markers');
      q.addEventListener('click',function(){obDo(function(){GM.shape=x[0];});});
      OB.syncs.push(function(){q.innerHTML=gmShapeSvg(x[0],gmColor(GM,'up'));q.classList.toggle('on',GM.shape===x[0]);});
      shp.appendChild(q);
    });
    b.appendChild(shp);b.appendChild(obSep());
    b.appendChild(obMenu('Icon','What is drawn inside each marker',function(pop){
      pfSel(pop,'Icon',function(){return GM.icon;},function(v){GM.icon=v;},[['device','The device’s own PRTG icon'],['status','A status icon that follows the state'],['symbol','One symbol for every state']]);
      var g=h('div','pf-syms');pop.appendChild(h('div','pf-h','Symbol (when one symbol is chosen)'));pop.appendChild(g);
      GMSYMS.forEach(function(sy){
        var q=h('button','pf-sym','<svg viewBox="0 0 24 24" aria-hidden="true">'+sy[2]+'</svg>');q.type='button';q.title=sy[1];q.setAttribute('aria-label',sy[1]);
        q.addEventListener('click',function(){obDo(function(){GM.icon='symbol';GM.sym=sy[0];});});g.appendChild(q);
      });
      OB.syncs.push(function(){[].forEach.call(g.children,function(q,i){q.classList.toggle('on',GM.icon==='symbol'&&GM.sym===GMSYMS[i][0]);});});
    }));
    b.appendChild(obMenu('Markers','Size, shadow, legend and the size the object is dropped at',function(pop){
      pfNum(pop,'Marker size %',function(){return GM.size||100;},function(v){GM.size=v;},50,200);
      pfChk(pop,'Shadow under each marker',function(){return GM.shadow;},function(v){GM.shadow=v;});
      pfNum(pop,'Most locations in the legend',function(){return GM.legend;},function(v){GM.legend=v;},0,500);
      pfNum(pop,'Width when dropped (0 = PRTG’s default)',function(){return GM.initW;},function(v){GM.initW=v;},0,4000);
      pfNum(pop,'Height when dropped',function(){return GM.initH;},function(v){GM.initH=v;},0,4000);
    }));
    b.appendChild(obMenu('Colors','Status colors',function(pop){
      pop.appendChild(h('div','pf-h','Status colors'));
      var g=h('div','pf-sets');pop.appendChild(g);
      CSETS.forEach(function(x){
        var q=h('button','pf-set');q.type='button';q.setAttribute('data-set',x[0]);
        q.innerHTML='<span class="sw">'+['up','warning','down','unusual','paused','unknown'].map(function(k){return '<i style="background:'+x[2][k]+'"></i>';}).join('')+'</span><span>'+x[1]+'</span>';
        q.addEventListener('click',function(){obDo(function(){csetApply(x[0]);});});g.appendChild(q);
      });
      OB.syncs.push(function(){var cur=gmSetOf();[].forEach.call(g.children,function(q){q.classList.toggle('on',q.getAttribute('data-set')===cur);});});
      pop.appendChild(h('div','pf-h','Or pick each one'));
      GMSTATES.forEach(function(st){
        var w=h('div','pf pf-col'), i=h('input');i.type='color';w.appendChild(h('label',null,st.label));
        i.addEventListener('input',function(){GM.palette='custom';GM.cols=GM.cols||{};GM.cols[st.id]=i.value;PS.over[st.id]=i.value;refreshUI();render();});
        OB.syncs.push(function(){if(document.activeElement!==i)i.value=gmColor(GM,st.id);});w.appendChild(i);pop.appendChild(w);
      });
    }));
    b.appendChild(obSep());
    b.appendChild(obBtn('Card','A card around the map: fill, border, rounded corners and shadow (details under Appearance)',function(){return GM.look.card;},function(v){GM.look.card=v;refreshUI();render();}));
    OB.key=obKey();
  }
  function obKey(){return SCOPE+TYPE+(TYPE==='tile'?tlFam():'')+(TYPE==='icon'?IC.engine+(iHasBg(IC)?'b':''):(TYPE==='gauge'?G.engine+(G.nstyle?'n':''):(TYPE==='donut'?DN.engine:TYPE==='sunburst'?SB.engine+SB.face:(TYPE==='graph'?GR.draw+GR.kind+(GR.kind==='bars'?GR.bsrc:''):''))));}
  /* the bar sits on the page (position:fixed), above the object, or under it when there is no room above or a menu needs the room.
     It is kept inside the window, never inside the canvas, so neither the canvas nor the preview edge covers it. */
  function obPlace(){
    var b=OB.el, cv=document.getElementById('ocanvas'), root, cr, rr, bh, bw, left, top, ww, wh, below;
    if(!b)return;
    root=obRoot();
    if(!obOk()||!root||!cv.getClientRects().length){b.hidden=true;return;}
    b.hidden=false;b.classList.toggle('nosel',!OB.sel);
    cr=cv.getBoundingClientRect();rr=root.getBoundingClientRect();ww=document.documentElement.clientWidth;wh=window.innerHeight;
    /* the object scrolled out of the preview: no bar for it */
    if(rr.bottom<cr.top||rr.top>cr.bottom||rr.right<cr.left||rr.left>cr.right){b.style.visibility='hidden';return;}
    b.style.visibility='';
    b.style.maxWidth=Math.max(260,Math.min(ww-16,Math.max(cv.clientWidth,rr.width)+40))+'px';
    bh=b.offsetHeight;bw=b.offsetWidth;
    top=rr.top-bh-10;below=(OB.flip===false)?false:((top<4)||OB.flip);
    if(below)top=Math.min(rr.bottom+10,wh-bh-4);
    left=Math.max(8,Math.min(rr.left,ww-bw-8));
    b.setAttribute('data-pos',below?'below':'above');
    b.style.left=Math.round(left)+'px';b.style.top=Math.round(top)+'px';
  }
  function obPlaceIf(){if(OB.el&&!OB.el.hidden)obPlace();}
  window.addEventListener('scroll',obPlaceIf,true);window.addEventListener('resize',obPlaceIf);
  function obRefresh(){
    var cv=document.getElementById('ocanvas');
    if(!obOk()){if(OB.el)OB.el.hidden=true;cv.classList.remove('nosel');return;}
    if(!OB.el||OB.key!==obKey()){obBuild();OB.sel=true;}
    OB.syncs.forEach(function(f){f();});
    if(OB.sty)OB.sty.hidden=(M().look.mode==='prtg');   /* PRTG's own look is not restyled from here: choose a look first */
    cv.classList.toggle('nosel',!OB.sel);
    obPlace();
  }
  /* a click on the object selects it; a click anywhere else in the preview lets go of it, so it can be seen as it will look */
  function obWire(){
    var cv=document.getElementById('ocanvas');
    cv.addEventListener('pointerdown',function(ev){
      var t=ev.target, root=obRoot();
      if(!obOk()||edBusy)return;
      if(t.closest&&(t.closest('#obar')||t.closest('.edh')))return;
      var onObj=!!(root&&(root===t||root.contains(t)));
      if(onObj&&!OB.sel){OB.sel=true;cv.classList.remove('nosel');obPlace();}
      else if(!onObj&&OB.sel){OB.sel=false;obCloseMenus();cv.classList.add('nosel');if(OB.el)OB.el.classList.add('nosel');}
    },true);
    document.addEventListener('pointerdown',function(ev){if(OB.el&&!(ev.target.closest&&ev.target.closest('#obar')))obCloseMenus();});
  }

  /* ---------- undo, redo and reset: every object type keeps its own history ---------- */
  var HIST={}, HLOCK=false, undoBtn=null, redoBtn=null;
  function hModelGet(k){return k==='table'?T:(k==='gauge'?G:(k==='graph'?GR:(k==='donut'?DN:(k==='icon'?IC:(k==='status'?SC:(k==='tile'?TL:(k==='geomap'?GM:(k==='links'?LK:(FRM[k]||(FRM[k]=blankFR(k)))))))))));}
  function hModelSet(k,m){if(k==='table')T=m;else if(k==='gauge')G=m;else if(k==='graph')GR=m;else if(k==='donut')DN=m;else if(k==='icon')IC=m;else if(k==='status')SC=m;else if(k==='tile')TL=m;else if(k==='geomap')GM=m;else if(k==='links')LK=m;else FRM[k]=m;}
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
    if(k==='table')T=blankT();else if(k==='gauge')G=blankG();else if(k==='graph')GR=blankGR();else if(k==='donut')DN=blankD();else if(k==='sunburst')SB=blankSB();else if(k==='icon')IC=blankI();else if(k==='status')SC=blankSC();else if(k==='tile')TL=blankTL();else if(k==='geomap')GM=blankGM();else if(k==='links')LK=Object.assign(blankLK(),LKDEF);else FRM[k]=blankFR(k);
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
    if(tableFits(T)){
      try{var _fr=prevEl.querySelector('.map_object');if(_fr)tableFitRuntime(_fr,{w:Math.max(40,parseInt(T.fitW,10)||parseInt(T.initW,10)||600)});}
      catch(err){if(window.console)console.error('table scale',err);}
    }
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
    if(flexOn())text=flexCss(text);
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
  window.PMSTOCKSVG=stockSvg;   /* the designer's previews draw the same stand-in when PRTG's own gauge plugin does not run there */
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
  /* sample sensors as PRTG sends them to a device gauge: the values sit in info.data[0] (see PRTG's Device.Gauge template) */
  function sampleSensorRows(){
    var ch=sampleChannels()[0].info.data[0];
    var rows=[{objid:10,sensor:'Uplink traffic',message:'OK',priority:5,info:{data:[ch]},lastvalue:ch.lastvalue}];
    SAMPLE_SENSORS.forEach(function(x,i){var inf=JSON.parse(JSON.stringify(x.info));inf.primary=true;inf.show=1;rows.push({objid:11+i,sensor:x.sensor,message:x.message,priority:3,info:{data:[inf]},lastvalue:inf.lastvalue});});
    return rows;
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
      var sj=(G.kind==='device')?'"sensors":'+JSON.stringify(sampleSensorRows()):'"channels":'+JSON.stringify(sampleChannels());
      wrap.appendChild(document.createComment('\n{"objects":{"prtg-version":"26.3","treesize":3,'+sj+'}}\n'));
      try{ringRuntime(prevEl.querySelector('.map_object'),JSON.parse(JSON.stringify(ringConfig(G,L))));}
      catch(err){if(window.console)console.error('ring preview',err);}
    }else{
      prevEl.innerHTML='<div id="mapshow" class="map-body"><div class="'+rootCls+'" style="position:relative;overflow:hidden;width:'+w+'px;height:'+hh+'px;">'
        +bo+titleHtml+'<div class="prtg-plugin'+(G.kind==='device'?' deviceoverviewsensorvalues':'')+'">'+stockInner(G)+'</div>'+bc+'</div></div>';
      if(G.nstyle||G.fit!==false||nativeExtras(G)){try{nativeRuntime(prevEl.querySelector('.map_object'),nativeCfgAll(G));}catch(err){if(window.console)console.error('native gauge preview',err);}}
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
    var L=grLook(GR), cls=grClassOf(GR), css=graphCss(GR,cls), styled=!!css, kind=GR.kind;
    setStyle((kind==='sensors'&&!grOwn(GR)?PRTGGRAPH+'\n':'')+css);
    applyFont(L);
    var dw=(kind==='sensors')?760:(kind==='toplist'?240:520), dh=(kind==='sensors')?420:(kind==='toplist'?240:300);
    var w=parseInt(document.getElementById('owidth').value,10)||dw, hh=parseInt(document.getElementById('oheight').value,10)||dh;
    var zs=eoSz(GR,w,hh);w=zs[0];hh=zs[1];
    var tm=GR.titleMode||'object', per=GPERIODS[GR.period||0][1];
    prevEl.className='';
    var html='<div id="mapshow" class="map-body">';
    if(kind==='toplist'){
      html+='<div class="map_object map_table toplist-mapobject'+(styled?' '+cls:'')+'" style="position:relative;overflow:hidden;width:'+w+'px;height:'+hh+'px;background-clip:padding-box;"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">'+mockToplist(Math.min(w,hh)-24)+'</div></div>';
    }else if(kind==='sensors'&&grOwn(GR)){
      var tl2=(tm==='none')?'':(tm==='custom'?clean(GR.title):(tm==='stock'?'Graphs of Core switch ('+per+')':'Core switch'));
      html+='<div class="map_object map_graph '+cls+'" style="position:relative;overflow:auto;width:'+w+'px;height:'+hh+'px;"><div class="gbox">'+(tl2?'<div class="gtitle">'+esc(tl2)+'</div>':'')+'<div class="ggraph"><div class="gown" data-g="loading"></div></div></div></div>';
      prevEl.innerHTML=html+'</div>';
      applyBg(L);
      try{var lcfg=listConfig(GR,L);lcfg.sample=true;listRuntime(prevEl.querySelector('.map_graph'),lcfg,graphRuntime);}catch(le){}
      return;
    }else if(kind==='sensors'){
      var title=(tm==='none')?'':(tm==='custom'?clean(GR.title):(tm==='stock'?'Graphs of Core switch ('+per+')':'Core switch'));
      var tiles='',names=['Ping','HTTP','SNMP Traffic','CPU Load'],i,tw=Math.max(100,parseInt(GR.tileW,10)||336),th=Math.max(60,parseInt(GR.tileH,10)||175);
      for(i=0;i<4;i++)tiles+='<div class="achannel"><span class="channelname">'+names[i]+'</span><img class="PNGGraph" width="'+tw+'" height="'+th+'" src="'+mockGraphUri(tw,th,{fontSize:9,legend:false,axis:true,period:GR.period})+'"></div>';
      var inner=(title?(styled?'<div class="gtitle"><b>'+esc(title)+'</b></div>':'<b>'+esc(title)+'</b>'):'')+'<div class="sensorgraphs"><div class="prtg-plugin deviceoverviewsensorvalues">'+tiles+'</div></div><div style="clear:both"></div>';
      html+='<div class="map_object map_table reaload_wo_params'+(styled?' '+cls:'')+'" style="position:relative;overflow:auto;width:'+w+'px;height:'+hh+'px;">'+(styled?'<div class="gbox">'+inner+'</div>':inner)+'</div>';
    }else if(kind==='bars'){
      var gtb=(tm==='none')?'':(tm==='custom'?clean(GR.title):(GR.bsrc==='status'?'Sensor states':'Core switch'));
      html+='<div class="map_object map_graph '+cls+'" style="position:relative;overflow:hidden;width:'+w+'px;height:'+hh+'px;"><div class="gbox">'+(gtb?'<div class="gtitle">'+esc(gtb)+'</div>':'')+'<div class="ggraph"><div class="gown" data-g="loading"></div></div></div></div>';
      prevEl.innerHTML=html+'</div>';
      applyBg(L);
      try{var bcfg=barsConfig(GR,L);bcfg.sample=true;barsRuntime(prevEl.querySelector('.map_graph'),bcfg);}catch(be){}
      return;
    }else{
      if(grOwn(GR)){
        var gt1=(tm==='none')?'':(tm==='custom'?clean(GR.title):'Core switch uplink');
        html+='<div class="map_object map_graph '+cls+'" style="position:relative;overflow:hidden;width:'+w+'px;height:'+hh+'px;"><div class="gbox">'+(gt1?'<div class="gtitle">'+esc(gt1)+'</div>':'')+'<div class="ggraph"><div class="gown"></div></div></div></div>';
        prevEl.innerHTML=html+'</div>';
        applyBg(L);
        try{var gcfg=grCfg(GR,grLook(GR));gcfg.sample=true;graphRuntime(prevEl.querySelector('.map_graph'),gcfg);}catch(ge){}
        return;
      }
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
    var c={up:214,warning:9,down:3,ack:2,paused:12,unusual:2,unknown:1}, codes={up:3,warning:4,down:5,ack:13,paused:7,unusual:10,unknown:1}, out=[], k, i;
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

  function drawSunburstPreview(){
    var L=sbEffLook(SB), cls=sbClassOf(SB), css=sunburstCss(SB,cls), ring=(SB.engine==='ring'), styled=!!css;
    setStyle(css);applyFont(L);
    var w=parseInt(document.getElementById('owidth').value,10)||420, hh=parseInt(document.getElementById('oheight').value,10)||440;
    var zs=eoSz(SB,w,hh);w=zs[0];hh=zs[1];
    var tm=SB.titleMode||'object', title=(tm==='none')?'':(tm==='custom'?clean(SB.title):'Local probe');
    var titleHtml=(styled&&title)?'<div class="gtitle"><b>'+esc(title)+'</b></div>':'';
    var lg=ring?((['right','below','none'].indexOf(SB.legend)>-1)?SB.legend:'below'):'none';
    var body='<div class="sbbody lg-'+lg+'"'+(ring?'':' style="position:absolute;inset:0;display:flex"')+'><div class="sbwrap"'+(ring?'':' style="position:relative;flex:1"')+'><svg class="sbsvg" preserveAspectRatio="xMidYMid meet"'+(ring?'':' style="position:absolute;left:0;top:0;width:100%;height:100%"')+'></svg></div><div class="sblegend"'+(ring?'':' style="display:none"')+'></div></div>';
    var inner=ring?body:'<div class="sensorTree prtg-plugin" style="position:relative;'+(styled?'':'height:100%;')+'">'+body+'</div>';
    prevEl.className='';
    prevEl.innerHTML='<div id="mapshow" class="map-body"><div class="map_object map_table'+(styled?' '+cls:'')+'" id="ptprev_sb" style="position:relative;overflow:hidden;width:'+w+'px;height:'+hh+'px;background:'+(styled?'':'#fff')+'">'+(styled?'<div class="gbox">'+titleHtml+inner+'</div>':inner)+'</div></div>';
    var host=prevEl.querySelector('.sbbody');
    host.appendChild(document.createComment('\n{"objects":{"prtg-version":"26.3","treesize":19,"sensorxref":'+JSON.stringify(sbSample())+'}}\n'));
    try{sbRuntime(prevEl.querySelector('.map_object'),JSON.parse(JSON.stringify(sbConfig(SB))));}catch(err){if(window.console)console.error('sunburst preview',err);}
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
  var ICSTRIP=[['Up','sensg'],['Warning','sensy'],['Down','sensr'],['Down (Acknowledged)','senso'],['Unusual','sensp'],['Paused','sensb'],['Unknown','sensx'],['Group: green + yellow','hasgreen hasyellow'],['Group: green + red','hasgreen hasred']];
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

  /* the Geo Map preview: the seven marker states, drawn with PRTG's own marker rules underneath the object's style block */
  var GMBASE='.map-marker{position:relative;width:21px;height:25px;box-sizing:border-box;background:#fff;border-left:5px solid #fff;box-shadow:0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -4px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12)}'
    +'.map-marker a{left:0;top:0;padding:0;margin:0;position:absolute !important;width:100% !important;height:100% !important;background-position:center center;background-size:14px 14px;background-repeat:no-repeat}'
    +GMSTATES.map(function(x){return '.map-marker.'+x.id+'{border-color:'+x.col+'}';}).join('');
  function drawGeoPreview(){
    var cls=gmClass(GM), css=gmCss(GM,cls), L=lookOf('Minimal'), html='<div id="mapshow" class="map-body" style="padding-top:64px"><div class="icstrip pvgmcard">', dev=gmSvgUrl(gmSym('server')[2],'#6b7280');
    prevEl.className='';prevEl.style.minHeight='400px';
    setStyle(GMBASE+css+gmCardCss(GM,'.pvgmcard'));applyFont(L);
    GMSTATES.forEach(function(x){
      html+='<div class="icell"><div class="'+cls+'" style="position:relative;width:60px;height:62px;"><div class="map-marker '+x.id+'" style="position:absolute;left:30px;top:34px;margin:-12.5px 0 0 -10.5px;"><a class="mapmarker" style="background-image:'+dev+'"></a></div></div><div class="pcap">'+esc(x.label)+'</div></div>';
    });
    prevEl.innerHTML=html+'</div><p class="pcap" style="padding:0 14px 12px;max-width:none">'+(GM.icon==='device'?'The icon in each marker is the device’s own PRTG icon (a server is shown here as an example).':'PRTG draws the map and the markers; this is how the markers look on it.')+'</p></div>';
    applyBg(L);
  }
  /* the Link style preview: a small map with PRTG's own straight lines, restyled by the very script the map will run */
  var LKCOL={up:'#b4cc38',warning:'#ffd400',down:'#d71920'};
  function drawLinksPreview(){
    /* PRTG links are always point to point (one line, two devices) — so the preview shows exactly that, not a branching demo graph */
    var W=620, HH=220, L=lookOf('Minimal'), N=[[130,110,'up'],[490,110,'down']], E=[[0,1]], defs='', lines='', devs='';
    E.forEach(function(e,i){
      var a=N[e[0]], b=N[e[1]];
      defs+='<linearGradient id="lkg'+i+'" gradientUnits="userSpaceOnUse" x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'"><stop offset="40%" stop-color="'+LKCOL[a[2]]+'"/><stop offset="60%" stop-color="'+LKCOL[b[2]]+'"/></linearGradient>';
      lines+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" class="elmfrom'+e[0]+' elmto'+e[1]+' connectionline" stroke="url(#lkg'+i+')" stroke-width="2"/>';
    });
    N.forEach(function(n){devs+='<div style="position:absolute;left:'+(n[0]-22)+'px;top:'+(n[1]-22)+'px;width:44px;height:44px;box-sizing:border-box;border-radius:10px;background:#f3f4f6;border:3px solid '+LKCOL[n[2]]+'"></div>';});
    prevEl.className='';prevEl.style.minHeight='300px';
    setStyle(linksCss(LK));applyFont(L);
    prevEl.innerHTML='<div id="mapshow" class="map-body" style="padding-top:24px"><div style="position:relative;width:'+W+'px;height:'+HH+'px;margin:0 auto;background:#fff;border-radius:8px"><svg id="mapsvg" width="'+W+'" height="'+HH+'" style="position:absolute;left:0;top:0">'+'<defs>'+defs+'</defs>'+lines+'</svg>'+devs+'</div><p class="pcap" style="padding:10px 14px 12px;max-width:none">PRTG draws a link like this straight, one line between two devices. This is how it looks once this object is on the map.</p></div>';
    applyBg(L);
    mlsRuntime(lkCfg(LK));
  }
  var icGalEl=null, icGalStyle=null;
  /* the icon styles as small pictures (each in the up, warning and down colours), filled into el; a click picks that style */
  function fillStyleGallery(el,pfx){   /* pfx keeps the pictures' gradient ids apart when two galleries are on the page */
    pfx=pfx||'g';
    if(!icGalStyle){icGalStyle=document.createElement('style');icGalStyle.id='opicgal';document.head.appendChild(icGalStyle);}
    var css=[], html='';
    ['Circles','Shapes','Icons','More'].forEach(function(g){
      html+='<div class="icgroup">'+g+'</div><div class="icgrid">';
      ISTYLES.filter(function(s){return s.group===g;}).forEach(function(s){
        var Ig=Object.assign({},IC,{style:s.id,link:'none',tip:'none',text:'none',card:false,name:'gal '+s.id,initW:s.w,initH:s.h}), cls='pgal_'+s.id;
        css.push(iconCss(Ig,cls));
        var hh=(s.id==='traffic'||s.id==='tlout')?44:28, ww=Math.max(14,Math.min(70,Math.round(hh*s.w/s.h)));
        var cells='';
        ['sensg','sensy','sensr'].forEach(function(k,i){cells+='<span class="map_object pst_obj '+cls+' map_objectstate_'+k+'" style="position:relative;display:block;width:'+ww+'px;height:'+hh+'px;">'+iconBodyLines(Ig,pfx+s.id+i).join('')+'</span>';});
        html+='<button type="button" class="stylechip'+(IC.style===s.id?' on':'')+((s.w/s.h>1.8)?' wide':'')+'" data-style="'+s.id+'"><span class="stylerow">'+cells+'</span><span class="pname">'+s.name+'</span></button>';
      });
      html+='</div>';
    });
    icGalStyle.textContent=css.join('\\n');
    el.innerHTML=html;
    Array.prototype.forEach.call(el.querySelectorAll('.stylechip'),function(btn){
      btn.addEventListener('click',function(){
        var s=iStyle(btn.getAttribute('data-style')), old=iStyle(IC.style);
        if(IC.name==='Status '+old.name.toLowerCase())IC.name='Status '+s.name.toLowerCase();
        IC.style=s.id;IC.initW=s.w;IC.initH=s.h;
        refreshUI();render();
        [].forEach.call(el.querySelectorAll('.stylechip'),function(b2){b2.classList.toggle('on',b2===btn);});   /* the menu may stay open: show the new choice */
      });
    });
  }
  function refreshStyleGallery(){
    if(!icGalEl||TYPE!=='icon'||IC.engine!=='custom')return;
    fillStyleGallery(icGalEl);
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
    if(TYPE!=='table')prevEl.style.minHeight='';if(TYPE==='gauge')drawGaugePreview();else if(isPaste())drawPastePreview();else if(TYPE==='graph')drawGraphPreview();else if(TYPE==='donut')drawDonutPreview();else if(TYPE==='sunburst')drawSunburstPreview();else if(TYPE==='tile')drawTilePreview();else if(TYPE==='status')drawStatusPreview();else if(TYPE==='icon')drawIconPreview();else if(TYPE==='geomap')drawGeoPreview();else if(TYPE==='links')drawLinksPreview();else drawTablePreview();
    if(TYPE!=='links'&&window.__mls&&window.__mls.stop)window.__mls.stop();   /* the Link style preview runs the same script as the map; stop it when another type is shown */
    if(flexOn()){try{var _fc=flexClass(), _fr=(_fc&&prevEl.querySelector('.'+_fc))||prevEl.querySelector('.map_object');flexRuntime(_fr,flexNorm(M()));}catch(err){if(window.console)console.error('flexible',err);}}
    obZoom();eoAttach();obRefresh();}

  /* ---------- render ---------- */
  function render(){
    if(isLegacy(TYPE))return;
    if(PS.cur&&!isPaste())csetPaint(PS.cur);
    if(TYPE==='table'){T.tOffX=0;T.tOffY=0;}
    if(TYPE==='links')lkDefSync(LK);   /* the Link style object IS the shared map link style; Map designer connectors read it live */
    obAutoName();
    var text=(TYPE==='gauge')?buildGauge(G):(isPaste()?buildPaste(FRc()):(TYPE==='graph'?buildGraph(GR):(TYPE==='donut'?buildDonut(DN):(TYPE==='sunburst'?buildSunburst(SB):(TYPE==='tile'?buildTile(TL):(TYPE==='status'?buildStatus(SC):(TYPE==='icon'?buildIcon(IC):(TYPE==='geomap'?buildGeoMap(GM):(TYPE==='links'?buildLinks(LK):buildTable(T))))))))));
    text=flexAppend(text);
    codeEl.value=text;
    document.getElementById('ofname').textContent=fileNameOf(M());
    nameCheckShow();
    document.getElementById('ofnote').textContent=text.length+' characters';
    var inst=document.getElementById('oinstall');
    if(inst){
      if(isPaste())inst.innerHTML='<strong>How to use:</strong> in the Map Designer add a Custom HTML item, select it, open the HTML section in Properties and paste this into HTML Before. Give the item the size '+FRc().w+' \u00D7 '+FRc().h+' px and place it where you want it. PRTG rewrites <code>div</code> to <code>span</code> when you paste, so this is written as a span that declares its own size.';
      else if(INSTALL_HTML)inst.innerHTML=INSTALL_HTML;
    }
    drawPreview();
    refreshStyleGallery();
    hRecord();
    if(INLK&&!INLBUSY&&OBJAPI.onInline)OBJAPI.onInline();   /* the Dashboard follows each change while it edits a frame in place */
  }

  /* ---------- panel ---------- */
  var typeSel=null, engineSel=null, legSel=null;
  /* Text label and Button are the page's basic tools. Choosing one shows that tool, unchanged, under the Objects tab. */
  var TYPES=[
    ['Files for \\webroot\\mapobjects',[['table','Data table (list of sensors)'],['gauge','Gauge'],['graph','Graph'],['donut','Donut'],['sunburst','Sunburst'],['status','Status counts'],['icon','Status icon'],['tile','Tile'],['ind','Industrial'],['geomap','Geo map'],['links','Link style']]],
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
    sunburst:sv('<circle cx="12" cy="12" r="3"/><path d="M12 6a6 6 0 0 1 6 6M18 12a6 6 0 0 1-6 6M12 18a6 6 0 0 1-6-6M6 12a6 6 0 0 1 6-6"/><path d="M12 2.5a9.5 9.5 0 0 1 8.2 4.7M21.5 12a9.5 9.5 0 0 1-4.7 8.2M12 21.5a9.5 9.5 0 0 1-8.2-4.7M2.5 12a9.5 9.5 0 0 1 4.7-8.2"/>'),
    icon:sv('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor"/>'),
    label:sv('<path d="M5 6h14M12 6v13M9 19h6"/>'),
    button:sv('<rect x="3" y="8" width="18" height="9" rx="4.5"/><path d="M8 12.5h8"/>'),
    frame:sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>'),
    bg:sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 17l9-9M8 12l4-4M13 17l4-4"/>'),
    shape:sv('<path d="M4 12h13"/><path d="m13 7 5 5-5 5"/>'),
    tile:sv('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 14h10"/><path d="M7 10h4"/>'),
    ind:sv('<path d="M3 21V11l5 3V11l5 3V7l5 3V4h3v17z"/><path d="M7 18h2M12 18h2M17 18h2"/>'),
    geomap:sv('<path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>'),
    status:sv('<rect x="3" y="6" width="8" height="12" rx="1.5"/><rect x="13" y="6" width="8" height="12" rx="1.5"/><path d="M5.5 11h3M15.5 11h3"/>'),
    links:sv('<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18c8 0 2-12 10-12"/>')
  };
  var TYPESHORT={table:'Table',gauge:'Gauge',graph:'Graph',donut:'Donut',sunburst:'Sunburst',icon:'Icon',tile:'Tile',ind:'Industrial',label:'Label',button:'Button',frame:'Frame',bg:'Background',shape:'Shape',status:'Status counts',geomap:'Geo map',links:'Links'};
  var TYPETIP={table:'Data table (list of sensors)',gauge:'Gauge',graph:'Graph',donut:'Donut',sunburst:'Sunburst (a group\u2019s or probe\u2019s device tree as rings)',icon:'Status icon',tile:'Tile (stat, string, bar, interface, channel chips)',ind:'Industrial (state lamps, on/off, tank level, equipment, process value, countdown)',label:'Text label',button:'Button',frame:'Frame',bg:'Background',status:'Status counts (how many sensors of a group or device are in each status)',geomap:'Geo map (restyle the markers on PRTG\u2019s map)',links:'Link style (curved, elbow and dashed lines between the items on a map)'};
  var GRIDHEAD=[['Save as file','A file you save in \\webroot\\mapobjects',sv('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>')],['Paste into Custom HTML','Code you paste into the HTML Before of a Custom HTML item',sv('<rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V3h6v2"/>')]];
  var gridTiles=[];
  function buildTypeGrid(){
    var host=document.getElementById('typegrid');if(!host)return;
    TYPES.forEach(function(g,gi){
      if(gi===1)return;   /* labels, buttons, frames, backgrounds and shapes are built on the Dashboard tab */
      var paste=(gi===1), hd=GRIDHEAD[gi], head=h('div','tgh'+(paste?' p':''));
      head.title=hd[1];head.innerHTML='<i class="sq"></i>'+hd[0]+hd[2];
      var row=h('div','tgr');row.style.gridTemplateColumns='repeat('+Math.min(g[1].length,4)+',1fr)';   /* four to a row, so eight types make two tidy rows */
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
      var on=(t.getAttribute('data-t')===((TYPE==='tile'&&tlFam()==='ind')?'ind':TYPE));
      t.classList[on?'add':'remove']('on');t.setAttribute('aria-checked',on?'true':'false');t.tabIndex=on?0:-1;
    });
  }
  var TLKEEP={tile:null,ind:null};
  function setType(v){
    if(v==='ind'||v==='tile'){
      var want=(v==='ind')?'ind':'tile', have=(TL&&TL.fam==='ind')?'ind':'tile';
      if(want!==have){TLKEEP[have]=TL;TL=TLKEEP[want]||(want==='ind'?blankInd():blankTL());}
      v='tile';
      if(TYPE==='tile'){if(want!==have){buildPresetOptions();refreshUI();render();}syncTypeSelects();return;}
    }
    if(v===TYPE){syncTypeSelects();return;}
    var wasLegacy=isLegacy(TYPE)||isPaste(), lk=wasLegacy?null:M().look;
    TYPE=v;
    if(isLegacy(v)){
      document.body.classList.remove('objs');
      setMode(v);
    }else{
      if(lk&&!isPaste()&&TYPE!=='links')dnKeepC(function(){M().look=lk;});
      if(!isPaste()&&(TYPE==='icon'||TYPE==='status'||TYPE==='tile'||(TYPE==='gauge'&&G.engine==='ring')||(TYPE==='donut'&&DN.engine==='ring')||(TYPE==='sunburst'&&SB.engine==='ring'))&&M().look.mode==='prtg')dnKeepC(function(){M().look=lookOf(TYPE==='icon'?'Minimal':'Light card');});
      document.body.classList.add('objs');
      buildPresetOptions();refreshUI();render();
    }
    syncTypeSelects();
  }
  function buildPresetOptions(){
    if(!presetSel)return;
    presetSel.innerHTML='';
    var blank=h('option');blank.value='__blank';blank.textContent=(TYPE==='gauge')?'Blank gauge':(TYPE==='frame'?'Blank frame':(TYPE==='graph'?'Blank graph':(TYPE==='tile'?(tlFam()==='ind'?'Blank industrial object':'Blank tile'):(TYPE==='status'?'Blank status card':(TYPE==='sunburst'?'Blank sunburst':(TYPE==='donut'?'Blank donut':(TYPE==='icon'?'Blank status icon':'Blank table')))))));presetSel.appendChild(blank);
    var src=(TYPE==='tile')?TLPRESETS.filter(function(p){return (p.fam||'tile')===tlFam();}):(TYPE==='status')?SPRESETS.map(function(x){return {id:x.id,name:x.name,cat:'Built in'};}):((TYPE==='gauge')?GPRESETS:(TYPE==='graph'?GRPRESETS:(TYPE==='donut'?DPRESETS:(TYPE==='sunburst'?SBPRESETS:(TYPE==='icon'?ICPRESETS:PRESETS))))), cats={},order=[];
    src.forEach(function(p){if(!cats[p.cat]){cats[p.cat]=h('optgroup');cats[p.cat].label=p.cat+((TYPE==='status'||TYPE==='tile')?'':' (PRTG stock)');order.push(p.cat);}
      var op=h('option');op.value=p.id;op.textContent=p.name;cats[p.cat].appendChild(op);});
    order.forEach(function(c){presetSel.appendChild(cats[c]);});
  }
  var isTable=function(){return TYPE==='table';};
  var isPaste=function(){return TYPE==='frame'||TYPE==='bg'||TYPE==='shape';};
  var notPaste=function(){return !isPaste();};
  var isGraph=function(){return TYPE==='graph';};
  var gSensor=function(){return TYPE==='graph'&&GR.kind==='sensor';};
  var gList=function(){return TYPE==='graph'&&GR.kind==='sensors';};
  var gPeriod=function(){return TYPE==='graph'&&GR.kind!=='toplist'&&GR.kind!=='bars';};
  var gBars=function(){return TYPE==='graph'&&GR.kind==='bars';};
  var gTitled=function(){return TYPE==='graph'&&GR.kind!=='toplist'&&GR.look.mode!=='prtg';};
  var isDonut=function(){return TYPE==='donut';};
  var isStatus=function(){return TYPE==='status';};
  var isTile=function(){return TYPE==='tile';};
  var isTileT=function(){return TYPE==='tile'&&TL.fam!=='ind';}, isInd=function(){return TYPE==='tile'&&TL.fam==='ind';};
  var inKind=function(){var a=arguments,i;if(!isInd())return false;for(i=0;i<a.length;i++)if(TL.kind===a[i])return true;return false;};
  var tlKind=function(){var a=arguments,i;if(TYPE!=='tile')return false;for(i=0;i<a.length;i++)if(TL.kind===a[i])return true;return false;};
  var dRing=function(){return TYPE==='donut'&&DN.engine==='ring';};
  var dPrtg=function(){return TYPE==='donut'&&DN.engine==='prtg';};
  var isIcon=function(){return TYPE==='icon';};
  var icCustom=function(){return TYPE==='icon'&&IC.engine==='custom';};
  var icStock=function(){return TYPE==='icon'&&IC.engine==='stock';};
  var icPulse=function(){return TYPE==='icon'&&IC.engine==='custom'&&IC.style==='pulse';};
  var notIcStock=function(){return !(TYPE==='icon'&&IC.engine==='stock');};
  var notFrame=function(){return TYPE==='table'||TYPE==='gauge'||TYPE==='status'||TYPE==='tile'||(TYPE==='donut'&&DN.engine==='ring')||(TYPE==='icon'&&IC.engine==='custom');};
  var isGauge=function(){return TYPE==='gauge';};
  var isRing=function(){return TYPE==='gauge'&&G.engine==='ring';};
  var isStock=function(){return TYPE==='gauge'&&G.engine==='prtg';};
  var isSingle=function(){return TYPE==='gauge'&&G.kind==='sensor-primary';}, isDevice=function(){return TYPE==='gauge'&&G.kind==='device';};
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
    var w2=h('div','dfld');w2.appendChild(h('label',null,'Start from a template'));
    presetSel=h('select');buildPresetOptions();
    presetSel.addEventListener('change',function(){
      var v=presetSel.value;
      if(TYPE==='icon'){
        var ilk=IC.look;
        if(v==='__blank'){IC=blankI();IC.look=(ilk.mode==='prtg')?lookOf('Minimal'):ilk;}
        else{var ip_=null;ICPRESETS.forEach(function(x){if(x.id===v)ip_=x;});IC=iconFromPreset(ip_);IC.look=(ilk.mode==='prtg')?lookOf('Minimal'):ilk;}
      }else if(TYPE==='sunburst'){
        var slk=SB.look;
        if(v==='__blank'){SB=blankSB();SB.look=(slk.mode==='prtg')?lookOf('Light card'):slk;}
        else{var sp_=null;SBPRESETS.forEach(function(x){if(x.id===v)sp_=x;});SB=sbFromPreset(sp_);}
      }else if(TYPE==='donut'){
        var dlk=DN.look;
        if(v==='__blank'){DN=blankD();DN.look=dlk;}
        else{var dp_=null;DPRESETS.forEach(function(x){if(x.id===v)dp_=x;});DN=donutFromPreset(dp_);}
      }else if(TYPE==='graph'){
        var glk=GR.look;
        if(v!=='__blank'&&v!==''&&((GR.cstyle&&GR.cstyle!=='area')||PS.cur||GR.kind==='bars')&&!window.confirm('Starting from a template replaces the chart style, the look and the status colors you chose. Continue?')){presetSel.value='';return;}
        if(v==='__blank'){GR=blankGR();GR.look=glk;}
        else{var rp=null;GRPRESETS.forEach(function(x){if(x.id===v)rp=x;});GR=graphFromPreset(rp);}
      }else if(TYPE==='gauge'){
        if(v==='__blank'){var lk=G.look,eng=G.engine;G=blankG();G.look=lk;G.engine=eng;}
        else{var gp=null;GPRESETS.forEach(function(x){if(x.id===v)gp=x;});G=gaugeFromPreset(gp);}
      }else if(TYPE==='tile'){
        var tlk=TL.look;TL=(TL.fam==='ind')?indFromPreset(v==='__blank'?'':v):tileFromPreset(v==='__blank'?'':v);TL.look=tlk;
      }else if(TYPE==='status'){
        var slk=SC.look;SC=statusFromPreset(v==='__blank'?'':v);SC.look=slk;
      }else{
        if(v==='__blank')T=blankT();
        else{var p=null;PRESETS.forEach(function(x){if(x.id===v)p=x;});T=fromPreset(p);}
      }
      refreshUI();render();
    });
    w2.appendChild(presetSel);s1.appendChild(w2);showIf(w2,function(){return notPaste()&&TYPE!=='geomap'&&TYPE!=='links';});
    showIf(s1.appendChild(h('p','note','A table, gauge, graph, donut or icon from PRTG\u2019s own set keeps PRTG\u2019s look until you choose another under Looks. Tables, gauges, graphs, donuts and status icons share the same looks, so a dashboard of them stays consistent.')),function(){return notPaste()&&TYPE!=='links';});

    var s2=section('Name and title');secIf(s2,notPaste);
    s2.appendChild(inText('Category in the designer',function(){return M().cat;},function(v){M().cat=v;},'Data Tables'));
    s2.appendChild(inText('Object name',function(){return M().name;},function(v){M().name=v;M().nameUser=(String(v).trim()!=='');}));
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

    /* ---- tiles: which kind, which channel, and the numbers that go with it ---- */
    var tlT=h('div');
    tlT.appendChild(inSel('Title',function(){return TL.titleMode;},function(v){TL.titleMode=v;},[['object','The object\u2019s name'],['custom','Custom text'],['none','No title']]));
    tlT.appendChild(inText('Custom title text',function(){return TL.title;},function(v){TL.title=v;}));
    tlT.appendChild(inText('Subtitle',function(){return TL.sub;},function(v){TL.sub=v;},'for example: Uplink to the data center'));
    showIf(tlT,isTile);s2.appendChild(tlT);
    var tl1=section('Tile');secIf(tl1,isTileT);
    var tkg=tKindGrid('tile');tl1.appendChild(tkg);syncs.push(function(){tkg.syncKind();});
    tl1.appendChild(h('p','note','A tile is bound to one sensor and shows what that sensor reports, in the colour of its state. It follows the Look you choose, like the other objects.'));
    var tlc=h('div');
    tlc.appendChild(inText('Channel',function(){return TL.channel;},function(v){TL.channel=v;},'blank = the sensor\u2019s main channel'));
    tlc.appendChild(h('p','note','A channel\u2019s name or number, for example Traffic Total or 0. Part of a name is enough.'));
    showIf(tlc,function(){return tlKind('stat','bar');});tl1.appendChild(tlc);
    var tlb=h('div');
    tlb.appendChild(pair(inText('Scale from',function(){return TL.min;},function(v){TL.min=v;},'0'),inText('to',function(){return TL.max;},function(v){TL.max=v;},'automatic')));
    tlb.appendChild(pair(inText('Warning from',function(){return TL.warn;},function(v){TL.warn=v;},'the channel\u2019s limit'),inText('Error from',function(){return TL.error;},function(v){TL.error=v;},'the channel\u2019s limit')));
    tlb.appendChild(h('p','note','Leave a number blank to use the channel\u2019s own limits and range. Warning and error show as marks on the bar.'));
    showIf(tlb,function(){return tlKind('bar');});tl1.appendChild(tlb);
    var tli=h('div');
    tli.appendChild(inText('Link speed in Mbit/s',function(){return TL.cap;},function(v){TL.cap=v;},'blank = compare with the peak'));
    tli.appendChild(h('p','note','Reads the sensor\u2019s Traffic In, Traffic Out and Traffic Total channels. With a link speed, the bars show how full the link is.'));
    showIf(tli,function(){return tlKind('interface');});tl1.appendChild(tli);
    var tls=h('div');
    tls.appendChild(h('p','note','Shows the sensor\u2019s message, for example \u201COK\u201D or \u201CRunning\u201D. The text shrinks or grows to fill the tile.'));
    tls.appendChild(inText('Remove this text first',function(){return TL.strip;},function(v){TL.strip=v;},'for example: ^Status:\\s*'));
    tls.appendChild(inText('Green when the message contains',function(){return TL.okW;},function(v){TL.okW=v;},'for example: OK, Running'));
    tls.appendChild(inText('Blue when it contains',function(){return TL.infoW;},function(v){TL.infoW=v;},'for example: Idle'));
    tls.appendChild(inText('Amber when it contains',function(){return TL.warnW;},function(v){TL.warnW=v;},'for example: Slow'));
    tls.appendChild(inText('Red when it contains',function(){return TL.errW;},function(v){TL.errW=v;},'for example: Failed, Timeout'));
    tls.appendChild(h('p','note','Separate words with commas. Without any, the tile takes the colour of the sensor\u2019s state.'));
    showIf(tls,function(){return tlKind('string');});tl1.appendChild(tls);
    var tlh=h('div');
    tlh.appendChild(inText('Hide channels',function(){return TL.hide;},function(v){TL.hide=v;},'Downtime'));
    tlh.appendChild(inText('Show only these channels',function(){return TL.only;},function(v){TL.only=v;},'blank = all, in this order if filled'));
    var tlw=h('div');tlw.appendChild(inNum('Chip width in px',function(){return TL.chipw;},function(v){TL.chipw=v;},60,400));showIf(tlw,function(){return tlKind('chips');});tlh.appendChild(tlw);
    var tlf=h('div');tlf.appendChild(pair(inText('Columns',function(){return TL.cols;},function(v){TL.cols=v;},'automatic'),inText('Chip shape (wide : high)',function(){return TL.ratio;},function(v){TL.ratio=v;},'2.4')));showIf(tlf,function(){return tlKind('chipsfit');});tlh.appendChild(tlf);
    showIf(tlh,function(){return tlKind('chips','chipsfit');});tl1.appendChild(tlh);

    /* ---- industrial: which kind, which channel, and what goes with it ---- */
    var in1=section('Industrial');secIf(in1,isInd);
    var ikg=tKindGrid('ind');in1.appendChild(ikg);syncs.push(function(){ikg.syncKind();});
    in1.appendChild(h('p','note','An industrial object is bound to one sensor, for example a Modbus, OPC UA, MQTT or Siemens S7 sensor, and shows what its channels report. It follows the Look you choose, like the other objects.'));
    var inC=h('div');
    inC.appendChild(inText('Channel',function(){return TL.channel;},function(v){TL.channel=v;},'blank = the sensor\u2019s main channel'));
    inC.appendChild(h('p','note','A channel\u2019s name or number. Part of a name is enough.'));
    showIf(inC,function(){return inKind('onoff','tank','pv','count');});in1.appendChild(inC);
    var inL=h('div');
    inL.appendChild(inText('Lamps',function(){return TL.lamps;},function(v){TL.lamps=v;},'RUN, STOP, ERROR, MAINT'));
    inL.appendChild(h('p','note','Words separated by commas. A lamp lights when a channel\u2019s value says that word (for example CPU status \u201CRun\u201D), or when a channel with that word in its name is on (for example \u201CError LED: On\u201D). It lights in the colour of that channel\u2019s state.'));
    inL.appendChild(inText('Read only these channels',function(){return TL.only;},function(v){TL.only=v;},'blank = all channels'));
    inL.appendChild(inText('Rows under the lamps',function(){return TL.rows;},function(v){TL.rows=v;},'for example: Operating Mode, Cycle Time'));
    showIf(inL,function(){return inKind('lamps');});in1.appendChild(inL);
    var inO=h('div');
    inO.appendChild(inSel('Style',function(){return TL.oStyle;},function(v){TL.oStyle=v;},[['lamp','Lamp'],['switch','Switch'],['word','Word']]));
    inO.appendChild(pair(inText('Word when on',function(){return TL.onW;},function(v){TL.onW=v;},'On'),inText('Word when off',function(){return TL.offW;},function(v){TL.offW=v;},'Off')));
    inO.appendChild(inText('On when the value contains',function(){return TL.onIf;},function(v){TL.onIf=v;},'blank = On, Yes, True, Open, Running or a number above 0'));
    inO.appendChild(inSel('Which side is a problem',function(){return TL.bad;},function(v){TL.bad=v;},[['none','Neither'],['on','On is a problem (red)'],['off','Off is a problem (red)']]));
    showIf(inO,function(){return inKind('onoff');});in1.appendChild(inO);
    var inS=h('div');
    inS.appendChild(pair(inText('Scale from',function(){return TL.min;},function(v){TL.min=v;},'0'),inText('to',function(){return TL.max;},function(v){TL.max=v;},'automatic')));
    inS.appendChild(pair(inText('Warning from',function(){return TL.warn;},function(v){TL.warn=v;},'the channel\u2019s limit'),inText('Alarm from',function(){return TL.error;},function(v){TL.error=v;},'the channel\u2019s limit')));
    inS.appendChild(h('p','note','Leave a number blank to use the channel\u2019s own limits and range. Low limits set in PRTG count too.'));
    showIf(inS,function(){return inKind('tank','pv');});in1.appendChild(inS);
    var inT=h('div');
    inT.appendChild(inSel('Shape',function(){return TL.shape;},function(v){TL.shape=v;},[['tank','Tank'],['silo','Silo']]));
    inT.appendChild(inColor('Fill colour',function(){return TL.fill||'#4F8DDB';},function(v){TL.fill=v;}));
    inT.appendChild(inText('Second value under the level',function(){return TL.chan2;},function(v){TL.chan2=v;},'a channel, for example Volume'));
    showIf(inT,function(){return inKind('tank');});in1.appendChild(inT);
    var inE=h('div');
    inE.appendChild(inSel('Equipment',function(){return TL.eq;},function(v){TL.eq=v;},IEQ));
    inE.appendChild(inSel('Layout',function(){return TL.eLay;},function(v){TL.eLay=v;},[['stack','Symbol above the text'],['row','Symbol beside the text']]));
    inE.appendChild(inText('Show the value of',function(){return TL.channel;},function(v){TL.channel=v;},'blank = the status word'));
    inE.appendChild(inText('Word when up',function(){return TL.upW;},function(v){TL.upW=v;},'Up, or for example Running'));
    inE.appendChild(h('p','note','The symbol takes the colour of the sensor\u2019s state.'));
    showIf(inE,function(){return inKind('equip');});in1.appendChild(inE);
    var inP=h('div');
    inP.appendChild(inText('Setpoint',function(){return TL.sp;},function(v){TL.sp=v;},'blank = none'));
    inP.appendChild(inChk('Trend line of the last hour',function(){return TL.trend!==false;},function(v){TL.trend=v;}));
    inP.appendChild(inColor('Trend colour',function(){return TL.fill||'#4F8DDB';},function(v){TL.fill=v;}));
    showIf(inP,function(){return inKind('pv');});in1.appendChild(inP);
    var inD=h('div');
    inD.appendChild(inSel('Style',function(){return TL.cStyle;},function(v){TL.cStyle=v;},[['ring','Ring'],['pill','Small pill']]));
    inD.appendChild(pair(inText('Warning at (days left)',function(){return TL.warn;},function(v){TL.warn=v;},'the channel\u2019s limit, else 30'),inText('Alarm at',function(){return TL.error;},function(v){TL.error=v;},'the channel\u2019s limit, else 7')));
    inD.appendChild(inText('Full ring at',function(){return TL.max;},function(v){TL.max=v;},'365'));
    inD.appendChild(h('p','note','For example the Days to Expiration channel of an OPC UA Certificate sensor. 0 or less shows Expired.'));
    showIf(inD,function(){return inKind('count');});in1.appendChild(inD);

    /* ---- shape: what it draws ---- */
    var sh1=section('Shape');secIf(sh1,function(){return TYPE==='shape'&&!(FRc()&&FRc().p&&FRc().p.isConnector);});
    var FRPs=function(){return FRc().p;};
    var LINEKINDS=['line','arrow','flow'];
    var shKindW=h('div','dfld');shKindW.appendChild(h('label',null,'Kind'));
    var shKindSel=h('select');
    shKindSel.addEventListener('change',function(){FRAMEAPI.kindSwitch(FRPs(),shKindSel.value);refreshUI();});
    syncs.push(function(){   /* rebuilt each refresh: a Connector only ever offers Line, Arrow and Flowing arrow -- it never becomes a flowchart box or callout */
      var isConn=!!FRPs().isConnector, cur=String(FRPs().shape);
      shKindSel.innerHTML='';
      FRAMEAPI.SHAPES.forEach(function(o){
        var k=(o instanceof Array)?o[0]:o;
        if(isConn&&LINEKINDS.indexOf(k)<0)return;
        var op=h('option');op.value=k;op.textContent=(o instanceof Array)?o[1]:o;shKindSel.appendChild(op);
      });
      shKindSel.value=cur;
    });
    shKindW.appendChild(shKindSel);sh1.appendChild(shKindW);   /* refreshUI also redraws the look tiles, so they show this kind */
    var shD=h('div');showIf(shD,function(){var q=FRPs();return FRAMEAPI.hasDir(q.shape)&&!(q.ln&&(q.shape==='line'||q.shape==='arrow'||q.shape==='flow'));});   /* a line with free ends has no direction of its own */
    var shL=h('div');showIf(shL,function(){var k=FRPs().shape;return k==='line'||k==='arrow'||k==='flow';});
    shD.appendChild(inSel('Direction',function(){return FRPs().dir;},function(v){var p=FRPs(), fr=FRc(), was=(p.dir==='right'||p.dir==='left'), now=(v==='right'||v==='left'), t;if(was!==now){t=fr.w;fr.w=fr.h;fr.h=t;}p.dir=v;refreshUI();},[['right','Right'],['left','Left'],['down','Down'],['up','Up']]));   /* turning the arrow a quarter turn turns its box too */
    shL.appendChild(pair(inNum('Thickness',function(){return FRPs().thick;},function(v){FRPs().thick=v;},1,80),inColor('Color',function(){return FRPs().color;},function(v){FRPs().color=v;})));
    var LNO=function(){return FRAMEAPI.lnOpts(FRPs());}, LNH=[['none','None'],['arrow','Arrow'],['open','Open arrow'],['dot','Dot']];
    shL.appendChild(pair(inSel('Line type',function(){return LNO().type;},function(v){FRPs().lt=v;},LNTYPES),inSel('Line style',function(){return LNO().dash;},function(v){FRPs().dash=v;},[['solid','Solid'],['dashed','Dashed'],['dotted','Dotted'],['dashdot','Dash and dot']])));
    shL.appendChild(pair(inSel('Start',function(){return LNO().ha;},function(v){FRPs().ha=v;},LNH),inSel('End',function(){return LNO().hb;},function(v){FRPs().hb=v;},LNH)));
    shL.appendChild(inChk('Animate the flow',function(){return LNO().anim;},function(v){FRPs().anim=!!v;},function(){refreshUI();}));
    var shF=h('div');showIf(shF,function(){return LNO().anim;});
    shF.appendChild(inSel('Flow speed',function(){return String(FRPs().speed||'1.6');},function(v){FRPs().speed=v;},[['3','Slow'],['1.6','Normal'],['0.8','Fast']]));
    shL.appendChild(shF);sh1.appendChild(shD);sh1.appendChild(shL);

    /* ---- Look presets for frames, backgrounds and shapes ---- */
    var fl1=section('Looks');secIf(fl1,isPaste);
    var fGal=h('div','fgal');fl1.appendChild(fGal);
    function fKind(){return TYPE==='bg'?'bg':(TYPE==='shape'?'shape':'frame');}
    function drawFGal(){
      var kind=fKind(), SH=FRAMEAPI.SHADOW, cur=FRc().p.style;
      if(!isPaste())return;
      fGal.textContent='';
      if(kind==='shape'&&FRc().p.isConnector){   /* a Connector's presets are its line looks and its text styles, shown as pictures */
        var cp=FRc().p, lcur=cp.look||'plain', tcur=cp.labelStyle||'none';
        function grp(title){var g=h('div','pgroup');g.textContent=title;g.style.cssText='grid-column:1/-1;margin:6px 0 0;font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:#8b90a0';fGal.appendChild(g);}
        function tile(x,html,on,go){
          var t=h('button','fgtile'+(on?' on':'')), pv=h('div','fgprev'), cap=h('span','fgcap');
          t.type='button';t.title=x[1];pv.style.background='#F3F4F6';pv.innerHTML=html;cap.textContent=x[1];
          t.appendChild(pv);t.appendChild(cap);t.addEventListener('click',function(){go();refreshUI();render();});fGal.appendChild(t);
        }
        grp('Line look');
        LNLOOKS.forEach(function(x){tile(x,lookThumb(x[0],72,34),lcur===x[0],function(){FRc().p.look=x[0];});});
        grp('Text on the line');
        [['none','No text'],['pill','Pill'],['solid','Filled'],['plain','Text only']].forEach(function(x){
          tile(x,lblThumb(x[0]),tcur===x[0],function(){var q=FRc().p;if(x[0]==='none')q.labelStyle='';else{q.labelStyle=x[0];if(!q.label)q.label='Text';}});
        });
        return;
      }
      Object.keys(LOOKS).forEach(function(name){
        var q=lookToFrameP(name,kind), t=h('button','fgtile'), pv=h('div','fgprev'), card=h('div'), cap=h('span','fgcap');
        t.type='button';t.title=name;if(cur===name)t.className+=' on';
        if(kind==='bg'){
          pv.style.background=q.fill;card.style.cssText='width:56%;height:56%;border-radius:4px;background:'+(lookOf(name).cardBg||'#FFFFFF')+';border:1px solid '+(lookOf(name).border||lookOf(name).line||'#E3E5E9')+';';pv.appendChild(card);
        }else if(kind==='shape'){
          var sk=FRc().p.shape, hz=!(FRc().p.dir==='down'||FRc().p.dir==='up'), sw=Math.max(2,Math.min(8,Math.round((q.thick||6)/1.5)));
          pv.style.background='#F3F4F6';   /* a shape has no background of its own, so every preview sits on the same plain ground; a light shape gets a thin dark edge to stay visible */
          if(FRAMEAPI.isBox(sk)){
            card.style.cssText='width:'+(sk==='circle'?'46px':'74%')+';height:'+(sk==='circle'?'46px':'58%')+';display:flex;align-items:center;justify-content:center;font:600 10px/1 Arial,sans-serif;color:'+q.tcolor+';background:'+q.fill+';border-radius:'+(sk==='rect'?'0':(sk==='pill'?'99px':(sk==='circle'?'50%':Math.min(q.radius,14)+'px')))+';box-shadow:'+(SH[q.shadow]||'')+';';
            card.textContent='Aa';
          }else if(sk==='line'){
            card.style.cssText='width:76%;height:'+sw+'px;border-radius:'+sw+'px;background:'+q.color+';';
          }else if(sk==='arrow'){
            card.innerHTML='<svg viewBox="0 0 40 16" width="56" height="22" aria-hidden="true"><path d="M3 8h28M25 2l8 6-8 6" fill="none" stroke="'+q.color+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          }else{
            card.innerHTML='<svg viewBox="0 0 40 16" width="56" height="22" aria-hidden="true"><g fill="none" stroke="'+q.color+'" stroke-width="'+Math.max(2,sw-1)+'" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l6 5-6 5" opacity=".3"/><path d="M17 3l6 5-6 5" opacity=".6"/><path d="M28 3l6 5-6 5"/></g></svg>';
          }
          if(/^#?f/i.test(String(readableOn(q.fill||q.color||'#000000')).replace('#','')))card.style.filter='none';else card.style.filter='drop-shadow(0 0 1px rgba(0,0,0,.6))';
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
    fl1.appendChild(h('p','note','Click one to apply it to this '+'frame, background or shape. A background takes the look\u2019s own map color. For a Connector these are the line look and the text on the line; edit the text, the thickness and the ends from the floating bar.'));

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
    icg.appendChild(inSel('Colors',function(){return IC.palette;},function(v){IC.palette=v;},[['look','The look\u2019s status colors'],['prtg','PRTG UI status colors']]));
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

    /* ---- geo map ---- */
    var gm1=section('Geo map markers');secIf(gm1,function(){return TYPE==='geomap';});
    gm1.appendChild(h('p','note','PRTG draws the map and decides where each marker goes and what state it has. This object restyles the markers. Put it on a map and the locations come from the devices PRTG knows.'));
    gm1.appendChild(inSel('Marker shape',function(){return GM.shape;},function(v){GM.shape=v;},[['card','Card with a colored edge (PRTG’s look)'],['badge','Rounded badge, filled'],['circle','Circle, filled'],['ring','Ring'],['pin','Map pin with a white center'],['pinfill','Map pin, filled'],['pulse','Pulsing dot']]));
    gm1.appendChild(inNum('Marker size %',function(){return GM.size||100;},function(v){GM.size=v;},50,200));
    gm1.appendChild(inSel('Icon in the marker',function(){return GM.icon;},function(v){GM.icon=v;refreshUI();},[['device','The device’s own PRTG icon (unchanged)'],['status','A status icon that changes with the state'],['symbol','One symbol for every state']]));
    var gmS=h('div'),gmG=h('div','gmsym');
    GMSYMS.forEach(function(sy){
      var b=h('button','gmsym-b','<svg viewBox="0 0 24 24" aria-hidden="true">'+sy[2]+'</svg>');b.type='button';b.title=sy[1];b.setAttribute('aria-label',sy[1]);
      b.addEventListener('click',function(){GM.sym=sy[0];refreshUI();render();});
      syncs.push(function(){b.classList.toggle('on',GM.sym===sy[0]);});
      gmG.appendChild(b);
    });
    gmS.appendChild(h('label',null,'Symbol'));gmS.appendChild(gmG);showIf(gmS,function(){return TYPE==='geomap'&&GM.icon==='symbol';});gm1.appendChild(gmS);
    gm1.appendChild(inSel('Colors',function(){return GM.palette;},function(v){GM.palette=v;PS.cur='';PS.over={};refreshUI();},[['prtg','PRTG UI status colors'],['custom','My own colors']]));
    var gmC=h('div');
    GMSTATES.forEach(function(st){gmC.appendChild(inColor(st.label,function(){return gmColor(GM,st.id);},function(v){GM.cols=GM.cols||{};GM.cols[st.id]=v;PS.over[st.id]=v;}));});
    showIf(gmC,function(){return TYPE==='geomap'&&GM.palette==='custom';});gm1.appendChild(gmC);
    var gmW=h('div');gmW.appendChild(inChk('Shadow under each marker',function(){return GM.shadow;},function(v){GM.shadow=v;}));gm1.appendChild(gmW);
    gm1.appendChild(inNum('Most locations in the legend',function(){return GM.legend;},function(v){GM.legend=v;},0,500));
    /* ---- link style ---- */
    var lkOn=function(){return TYPE==='links';};
    var lk1=section('Link style');secIf(lk1,lkOn);
    lk1.appendChild(h('p','note','PRTG draws the lines between the items on a map. Put this object on a map and it restyles every line on that map. PRTG’s own lines are hidden from the first moment, so you never see them change. In the Map Designer PRTG’s lines stay as they are, so a link can still be removed there; the new style shows when you view the map.'));
    lk1.appendChild(inSel('Line type',function(){return LK.line;},function(v){LK.line=v;refreshUI();},LKTYPES));
    var lkB=h('div');lkB.appendChild(inNum('Curve strength %',function(){return LK.bend;},function(v){LK.bend=v;},4,60));showIf(lkB,function(){return TYPE==='links'&&LK.line==='curve';});lk1.appendChild(lkB);
    var lkR=h('div');lkR.appendChild(inNum('Corner radius (px)',function(){return LK.radius;},function(v){LK.radius=v;},2,80));showIf(lkR,function(){return TYPE==='links'&&LK.line==='relbow';});lk1.appendChild(lkR);
    lk1.appendChild(inSel('Line style',function(){return LK.dash;},function(v){LK.dash=v;refreshUI();},LKDASH));
    lk1.appendChild(pair(inNum('Width (px)',function(){return LK.width;},function(v){LK.width=v;},1,16),inNum('Opacity %',function(){return LK.opacity;},function(v){LK.opacity=v;},10,100)));
    lk1.appendChild(pair(inChk('Soft glow',function(){return LK.glow;},function(v){LK.glow=v;}),inChk('Round line ends',function(){return LK.round;},function(v){LK.round=v;})));
    lk1.appendChild(inSel('Color',function(){return LK.colorMode;},function(v){LK.colorMode=v;refreshUI();},[['status','From the two items’ status (like PRTG)'],['custom','One color for every line']]));
    var lkC=h('div');lkC.appendChild(inColor('Line color',function(){return LK.color;},function(v){LK.color=v;}));showIf(lkC,function(){return TYPE==='links'&&LK.colorMode==='custom';});lk1.appendChild(lkC);
    lk1.appendChild(pair(inSel('Start marker',function(){return LK.start;},function(v){LK.start=v;refreshUI();},LKENDS),inSel('End marker',function(){return LK.end;},function(v){LK.end=v;refreshUI();},LKENDS)));
    var lkI=h('div');lkI.appendChild(inNum('Marker distance from the item centre (px)',function(){return LK.inset;},function(v){LK.inset=v;},0,150));
    lkI.appendChild(h('p','note','PRTG ends every line at the centre of an item, under its icon, so a marker sits this far in from the end to stay visible.'));
    showIf(lkI,function(){return TYPE==='links'&&(LK.start!=='none'||LK.end!=='none');});lk1.appendChild(lkI);
    var lkF=h('div');lkF.appendChild(inChk('Animate: dashes flow along the line',function(){return LK.flow;},function(v){LK.flow=v;},refreshUI));
    var lkS=h('div');lkS.appendChild(inNum('Seconds per loop',function(){return LK.flowSec;},function(v){LK.flowSec=v;},0.4,20));showIf(lkS,function(){return TYPE==='links'&&LK.flow;});lkF.appendChild(lkS);
    var lkQ=h('div');lkQ.appendChild(inChk('Pause it when the system asks for reduced motion',function(){return LK.calm;},function(v){LK.calm=v;}));lkQ.appendChild(h('p','note','Off by default: you chose to animate, so it runs. Many servers and remote desktops have reduced motion switched on, which would otherwise stop it.'));showIf(lkQ,function(){return TYPE==='links'&&LK.flow;});lkF.appendChild(lkQ);
    showIf(lkF,function(){return TYPE==='links'&&LK.dash!=='solid';});lk1.appendChild(lkF);
    lk1.appendChild(inNum('Show PRTG’s own lines if this has not run after (seconds)',function(){return LK.wait;},function(v){LK.wait=v;},1,10));
    /* ---- donut ---- */
    var dn1=section('Donut');secIf(dn1,isDonut);
    dn1.appendChild(inSel('Engine',function(){return DN.engine;},function(v){DN.engine=v;if(v==='ring'){if(!(parseInt(DN.initW,10)>0)){DN.initW=340;DN.initH=220;}if(DN.look.mode==='prtg')DN.look=dnLook('Light card',DN.look.c);}refreshUI();},DENGINES));
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
    /* ---- sunburst ---- */
    var isSb=function(){return TYPE==='sunburst';}, sbRing=function(){return TYPE==='sunburst'&&SB.engine==='ring';}, sbPrtg=function(){return TYPE==='sunburst'&&SB.engine==='prtg';};
    var sb1=section('Sunburst');secIf(sb1,isSb);
    var sbg=sbFaceGrid();sb1.appendChild(sbg);syncs.push(function(){sbg.syncFace();});
    sb1.appendChild(pair(inChk('Size by number of sensors',function(){return SB.sizeSensors;},function(v){SB.sizeSensors=v;}),inChk('Size by priority',function(){return SB.sizePriority;},function(v){SB.sizePriority=v;})));
    sb1.appendChild(inChk('Hide paused devices',function(){return SB.hidePaused;},function(v){SB.hidePaused=v;}));
    var sbr=h('div');
    sbr.appendChild(pair(inSel('In the middle',function(){return SB.center;},function(v){SB.center=v;},SBCENTERS),inSel('Legend',function(){return SB.legend;},function(v){SB.legend=v;},DLEGENDS)));
    sbr.appendChild(pair(inNum('Hole in the middle %',function(){return SB.hole;},function(v){SB.hole=v;},0,70),inNum('Rings shown (0 = all)',function(){return SB.depth;},function(v){SB.depth=v;},0,8)));
    sbr.appendChild(pair(inChk('Names on the slices',function(){return SB.labels;},function(v){SB.labels=v;}),inChk('Slices are links to PRTG',function(){return SB.links;},function(v){SB.links=v;})));
    sbr.appendChild(inChk('Use the map\u2019s tag filter',function(){return SB.mapTags!==false;},function(v){SB.mapTags=v;}));
    sbr.appendChild(h('p','note','Drawn by Map Studio from the device tree PRTG puts in the page (the same data PRTG\u2019s own sunburst reads): the object in the middle, its groups and devices in rings outwards, each slice in the colour of the worst state it has sensors in. The look, the Colors and the text options change everything.'));
    showIf(sbr,sbRing);sb1.appendChild(sbr);
    var sbp=h('div');
    sbp.appendChild(inChk('Use the map\u2019s tag filter',function(){return SB.mapTags!==false;},function(v){SB.mapTags=v;}));
    sbp.appendChild(h('p','note','PRTG classic is PRTG\u2019s own sunburst: PRTG draws it, so the sizes and hiding paused devices are PRTG\u2019s options. A look adds a card and a title around it and restyles the slice colours (from Colors), the lines between slices and the names.'));
    showIf(sbp,sbPrtg);sb1.appendChild(sbp);
    /* ---- graph ---- */
    var gr1=section('Graph');secIf(gr1,isGraph);
    gr1.appendChild(h('label',null,'Shows'));
    gr1.appendChild((function(){var pg=grPicGrid('kind',function(){return GR.kind;},function(v){setGrKind(v);},null,function(fn){fn();refreshUI();render();});syncs.push(function(){pg.syncPick();});return pg;})());
    var grp_=h('div');grp_.appendChild(inSel('Period',function(){return GR.period;},function(v){GR.period=parseInt(v,10);},GPERIODS));showIf(grp_,gPeriod);gr1.appendChild(grp_);
    var gbr=h('div');
    gbr.appendChild(h('label',null,'Bars show'));
    gbr.appendChild((function(){var pg=grPicGrid('bsrc',function(){return GR.bsrc||'status';},function(v){GR.bsrc=v;if(v==='status'&&GR.bcolor==='cat')GR.bcolor='status';},null,function(fn){fn();refreshUI();render();});syncs.push(function(){pg.syncPick();});return pg;})());
    gbr.appendChild(h('label',null,'Direction'));
    gbr.appendChild((function(){var pg=grPicGrid('bdir',function(){return GR.bdir||'row';},function(v){GR.bdir=v;},null,function(fn){fn();refreshUI();render();});syncs.push(function(){pg.syncPick();});return pg;})());
    var gbc=h('div');gbc.appendChild(h('label',null,'Bar colors'));gbc.appendChild((function(){var pg=grPicGrid('bcolor',function(){return GR.bcolor||'status';},function(v){GR.bcolor=v;},null,function(fn){fn();refreshUI();render();});syncs.push(function(){pg.syncPick();});return pg;})());
    showIf(gbc,function(){return GR.bsrc!=='status';});gbr.appendChild(gbc);
    var gbn=h('div');
    gbn.appendChild(inNum('Most bars shown',function(){return GR.bmax;},function(v){GR.bmax=v;},1,40));
    gbn.appendChild(inText('Only names containing (comma separated)',function(){return GR.chNames||'';},function(v){GR.chNames=v;}));
    showIf(gbn,function(){return GR.bsrc!=='status';});gbr.appendChild(gbn);
    gbr.appendChild(h('p','note','The bars are drawn from the live values, using the viewer’s own PRTG login. Bars of different units in one object only make sense when you filter to one kind of value, for example “Ping”. “By the state” only applies to sensors; channels use one color per bar.'));
    showIf(gbr,gBars);gr1.appendChild(gbr);
    var gdw=h('div');
    gdw.appendChild(h('label',null,'Drawing'));
    gdw.appendChild((function(){var pg=grPicGrid('draw',function(){return GR.draw||'own';},function(v){GR.draw=v;},null,function(fn){fn();refreshUI();render();});syncs.push(function(){pg.syncPick();});return pg;})());
    showIf(gdw,function(){return gSensor()||gList();});gr1.appendChild(gdw);
    var gow=h('div');
    gow.appendChild(inSel('Chart style',function(){return GR.cstyle||'area';},function(v){GR.cstyle=v;},[['area','Line with a soft fill'],['smooth','Smooth line with a soft fill'],['line','Line only'],['bars','Bars, one per channel'],['stacked','Stacked bars'],['overlap','Overlapping areas, every channel filled'],['stackarea','Stacked area, the top edge is the total'],['mirror','Mirrored: first channel up, second down'],['threshold','Threshold colors from the channel\u2019s limits'],['glow','Glow gradient, for dark looks'],['step','Stepped line, holds each value'],['spark','Sparkline with the current value'],['combo','Bars + line: first channel as bars, the others as lines'],['heatmap','Heatmap: hour by day (last 7 or 30 days)'],['band','Min / max band around the average'],['dots','Dots, coloured by the channel\u2019s limits'],['ring','24-hour ring (last 24 hours)']]));
    gow.appendChild(inChk('Dots on the data points',function(){return GR.dots;},function(v){GR.dots=v;}));
    gow.appendChild(pair(inNum('Channels shown',function(){return GR.maxCh;},function(v){GR.maxCh=v;},1,8),inChk('Show the legend',function(){return GR.legend;},function(v){GR.legend=v;})));
    gow.appendChild(inText('Only these channels (names, comma separated)',function(){return GR.chNames||'';},function(v){GR.chNames=v;}));
    gow.appendChild(inChk('Show the axes',function(){return GR.axis;},function(v){GR.axis=v;}));
    gow.appendChild(h('p','note','The chart is drawn from the sensor\u2019s history, using the viewer\u2019s own PRTG login, so nothing secret is stored in the item. If PRTG refuses the history, the item falls back to PRTG\u2019s own picture. The left axis is for the first channel and others of a similar size; channels of a very different size go on the right axis, as in PRTG.'));
    showIf(gow,function(){return (gSensor()||gList())&&(GR.draw||'own')!=='pic';});gr1.appendChild(gow);
    var gso=h('div');
    gso.appendChild(inNum('Text size (0 = no text)',function(){return GR.fontSize;},function(v){GR.fontSize=v;},0,40));
    gso.appendChild(pair(inChk('Show the legend',function(){return GR.legend;},function(v){GR.legend=v;}),inChk('Show the axes',function(){return GR.axis;},function(v){GR.axis=v;})));
    gso.appendChild(inChk('Hover tooltips',function(){return GR.tooltips;},function(v){GR.tooltips=v;}));
    gso.appendChild(h('p','note','Tooltips only line up when the graph is shown at its full size. In a card layout the picture is shrunk to fit, so leave them off there.'));
    gso.appendChild(inChk('Show PRTG\u2019s message if placed on anything but a sensor',function(){return GR.check;},function(v){GR.check=v;}));
    showIf(gso,function(){return gSensor()&&GR.draw==='pic';});gr1.appendChild(gso);
    var gli=h('div');
    gli.appendChild(pair(inNum('Tile width',function(){return GR.tileW;},function(v){GR.tileW=v;},100,1200),inNum('Tile height',function(){return GR.tileH;},function(v){GR.tileH=v;},60,800)));
    var gln=h('div');gln.appendChild(inNum('Most sensors shown',function(){return GR.lmax;},function(v){GR.lmax=v;},1,60));showIf(gln,function(){return (GR.draw||'own')!=='pic';});gli.appendChild(gln);
    gli.appendChild(inChk('Use the map\u2019s tag filter',function(){return GR.mapTags;},function(v){GR.mapTags=v;}));
    showIf(gli,gList);gr1.appendChild(gli);
    var gr2=section('Layout and title');secIf(gr2,function(){return TYPE==='graph'&&GR.kind!=='toplist';});
    var glay=h('div');glay.appendChild(inSel('Layout',function(){return GR.layout;},function(v){GR.layout=v;},[['card','Card: title and padding, the graph shrinks to fit'],['edge','Edge to edge: the graph fills the object']]));glay.appendChild(h('p','note','A card puts a title and padding around the picture, which then shrinks to fit. In a short, wide object that leaves very little room, so use Edge to edge for wide, short graphs.'));
    showIf(glay,gSensor);gr2.appendChild(glay);
    var gti=h('div');
    gti.appendChild(inSel('Title',function(){return GR.titleMode;},function(v){GR.titleMode=v;},[['object','The object\u2019s name'],['stock','PRTG\u2019s \u201cGraphs of \u2026 (period)\u201d (lists)'],['custom','Custom text'],['none','No title']]));
    gti.appendChild(inText('Custom title text',function(){return GR.title;},function(v){GR.title=v;}));
    showIf(gti,function(){return TYPE==='graph'&&(GR.kind==='sensors'||GR.kind==='bars'||(GR.kind==='sensor'&&GR.look.mode!=='prtg'));});gr2.appendChild(gti);
    var gcol=h('div');
    gcol.appendChild(inSel('Graph colors',function(){return GR.invert;},function(v){GR.invert=v;},[['auto','Automatic: invert on dark cards'],['never','Leave exactly as PRTG draws them'],['always','Always invert']]));
    gcol.appendChild(h('p','note','PRTG\u2019s graph is a picture with a light background and dark text. On a dark card it is inverted and blended in, so the card shows through and the text turns light. The line colors keep their hue but change in brightness.'));
    showIf(gcol,gTitled);gr2.appendChild(gcol);
    gr2.appendChild(showIf(h('p','note','Layout, title and colors apply once you choose a look under Looks. PRTG\u2019s own look is written exactly as PRTG ships it.'),function(){return TYPE==='graph'&&GR.look.mode==='prtg';}));
    var gr3=section('Extra graph tag attributes');secIf(gr3,gSensor);
    gr3.appendChild(inArea('One per line, name="value"',function(){return (GR.extra||[]).join('\n');},function(v){GR.extra=v.split(/\r?\n/).filter(function(x){return x.trim();});},'bgcolor="1E293B"'));
    gr3.appendChild(h('p','note','Added to PRTG\u2019s graph tag as written.'));
    var ed1=section('Size, rotation and title');secIf(ed1,isTable);
    ed1.appendChild(inChk('Edit in the preview',function(){return ED.on;},function(v){ED.on=v;},refreshUI));
    ed1.appendChild(h('p','note','In the preview: drag the handles to resize (this sets the size when dropped), drag the round handle to rotate (hold Shift to snap to 15 degrees), double-click the title to edit it. The title is part of the table and does not move on its own. A selected title also moves with the arrow keys.'));
    ed1.appendChild(inSel('Size',function(){return T.fit?'flex':'fixed';},function(v){setFlex(v==='flex');},[['flex','Flexible: everything grows and shrinks with the object'],['fixed','Fixed: PRTG\u2019s standard, the text keeps its size']]));
    var fitw=h('div');
    fitw.appendChild(inNum('Normal width (px)',function(){return T.fitW;},function(v){T.fitW=v;},100,4000));
    var fb=h('button','btn ghost','Make the current width normal');fb.type='button';
    fb.addEventListener('click',function(){T.fitW=parseInt(T.initW,10)||T.fitW;refreshUI();render();});
    fitw.appendChild(fb);
    fitw.appendChild(h('p','note','At the normal width the text has the look\u2019s sizes. Make the object wider or narrower, here or on the PRTG map, and the title, the header and the rows all grow or shrink with it. When there are more rows than the box can hold, everything shrinks until they all fit.'));
    showIf(fitw,function(){return !!T.fit;});ed1.appendChild(fitw);
    ed1.appendChild(inNum('Rotation (degrees)',function(){return T.rot;},function(v){T.rot=v;},-180,180));
    ed1.appendChild(inSel('Title alignment',function(){return T.tAlign;},function(v){T.tAlign=v;},[['','As the look has it'],['left','Left'],['center','Center'],['right','Right']]));
    var edr=h('div','dpair');
    var b1=h('button','btn ghost','Reset rotation');b1.type='button';b1.addEventListener('click',function(){T.rot=0;refreshUI();render();});
    edr.appendChild(b1);ed1.appendChild(edr);
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

    /* ---- gauge ---- */
    var g2=section('Gauge style');secIf(g2,isGauge);
    var gfg=gFaceGrid();g2.appendChild(gfg);syncs.push(function(){gfg.syncFace();});
    g2.appendChild(h('p','note','PRTG classic is PRTG\u2019s own dial: PRTG draws it, so a look can only change its colors. Neon glass, Flat minimalist, Cyber tech, Glass & metallic, Ambient glow and Clean are PRTG\u2019s own dial too, with its shape and zone colours, and Map Studio adds the rest (the needle turns around the middle of the cut-out). The other faces are drawn by Map Studio from the same PRTG data, so the look changes everything.'));
    var g2f=h('div');showIf(g2f,function(){return isStock()&&!G.nstyle;});g2.appendChild(g2f);
    g2f.appendChild(inChk('Fit the gauges to the object\u2019s size (PRTG lays its gauge boxes out at fixed sizes)',function(){return G.fit!==false;},function(v){G.fit=v;}));
    var g2n=h('div');showIf(g2n,function(){return isStock()&&!!G.nstyle;});g2.appendChild(g2n);
    g2n.appendChild(inSel('Background',function(){return G.nbg||'dark';},function(v){G.nbg=v;},[['look','From the look (the look\u2019s card colour)'],['dark','Dark'],['light','Light']]));
    var g2x=h('div');showIf(g2x,isStock);g2.appendChild(g2x);
    g2x.appendChild(inSel('Scale numbers (the sensor\u2019s real minimum and maximum; big dials only)',function(){return G.nscale||'off';},function(v){G.nscale=v;},[['off','Off'],['outside','Outside the dial'],['inside','Inside, round the needle']]));
    g2x.appendChild(inSel('Value line (outside the zones, in the zone colours)',function(){return G.nline||'off';},function(v){G.nline=v;},[['off','Off'],['full','Complete (thick to the value, thin after)'],['value','Up to the value only']]));
    g2x.appendChild(inSel('Zone colours',function(){return G.npal||'prtg';},function(v){G.npal=v;},[['prtg','PRTG\u2019s (or the look\u2019s)'],['cnp','Cyan, navy and pink']]));
    var g2r=h('div');showIf(g2r,isRing);g2.appendChild(g2r);
    g2r.appendChild(pair(inSel('Shape',function(){return G.shape;},function(v){G.shape=v;},[['ring','Ring (270\u00B0)'],['half','Half ring (180\u00B0)']]),inNum('Thickness',function(){return G.thick;},function(v){G.thick=v;},4,40)));
    g2r.appendChild(inSel('Colour',function(){return G.colorMode;},function(v){G.colorMode=v;},[['status','By status'],['accent','Accent color']]));
    g2r.appendChild(inChk('Needle (zones style)',function(){return G.needle;},function(v){G.needle=v;}));
    g2r.appendChild(inChk('Glow (LED, gradient, threshold, solid and speedometer)',function(){return !!G.glow;},function(v){G.glow=v;}));
    g2r.appendChild(inChk('Show minimum and maximum',function(){return G.showMinMax;},function(v){G.showMinMax=v;}));
    g2r.appendChild(inSel('Label under the value',function(){return G.label;},function(v){G.label=v;},[['channel','The channel name'],['custom','Custom text'],['none','None']]));
    g2r.appendChild(inText('Custom label',function(){return G.labelText;},function(v){G.labelText=v;}));

    var g3=section('Which gauges');secIf(g3,isGauge);
    g3.appendChild(inSel('Shows',function(){return G.kind;},function(v){G.kind=v;},GKINDS));
    g3.appendChild(h('p','note','All channels and a device\u2019s sensors show one gauge each, in the face you choose.'));
    g3.appendChild(inChk('Small gauges',function(){return G.small;},function(v){G.small=v;}));
    var dv=h('div');
    dv.appendChild(inSel('Sensors with a priority of',function(){return G.prio;},function(v){G.prio=parseInt(v,10);},[[4,'5 stars only'],[3,'4 and 5 stars'],[2,'3 to 5 stars'],[1,'2 to 5 stars'],[0,'1 to 5 stars (all)']]));
    dv.appendChild(inChk('Use the map\u2019s tag filter',function(){return G.mapTags;},function(v){G.mapTags=v;}));
    dv.appendChild(inText('Also require tag(s)',function(){return G.reqTag;},function(v){G.reqTag=v;},'pingsensor'));
    dv.appendChild(inNum('Maximum gauges (0 = all)',function(){return G.count;},function(v){G.count=v;},0,500));
    showIf(dv,isDevice);g3.appendChild(dv);
    var g3s=h('div');showIf(g3s,isStock);g3.appendChild(g3s);
    g3s.appendChild(inNum('Scale (1 = PRTG\u2019s own size)',function(){return G.scale;},function(v){G.scale=v>0?v:1;},0.5,3));
    g3s.appendChild(h('p','note','PRTG draws its own gauge at a fixed size and cannot be resized in the designer. Scale enlarges everything inside the object, so make the object big enough. For a gauge that follows the item\u2019s size, use the ring gauge.'));
    g3s.appendChild(inSel('Status strip on each gauge',function(){return G.strip;},function(v){G.strip=v;},[['thin','Thin'],['keep','PRTG\u2019s wide strip'],['hide','Hidden']]));
    g3s.appendChild(inChk('Hide PRTG\u2019s settings icons',function(){return G.hideSettings!==false;},function(v){G.hideSettings=v;}));

    var g1=section('Channel and range');secIf(g1,isRing);
    showIf(g1.appendChild(inSel('Channel',function(){return G.channel;},function(v){G.channel=v;},[['primary','The sensor\u2019s main channel'],['name','A channel chosen by name']])),isSingle);
    showIf(g1.appendChild(inText('Channel name (exactly as in PRTG)',function(){return G.channelName;},function(v){G.channelName=v;},'Traffic In')),isSingle);
    g1.appendChild(inSel('Scale',function(){return G.rangeMode;},function(v){G.rangeMode=v;},[['channel','From the channel (PRTG\u2019s own minimum and maximum)'],['manual','Manual']]));
    g1.appendChild(pair(inNum('Minimum',function(){return G.min;},function(v){G.min=v;}),inNum('Maximum',function(){return G.max;},function(v){G.max=v;})));
    g1.appendChild(h('p','note','Manual values are also used when the channel has no scale of its own.'));
    g1.appendChild(inSel('Warning and error zones',function(){return G.limits;},function(v){G.limits=v;},[['channel','From the channel\u2019s limits in PRTG'],['manual','Manual'],['none','None']]));
    g1.appendChild(pair(inSel('Bad values are',function(){return G.dir;},function(v){G.dir=v;},[['above','High'],['below','Low']]),inNum('Warning at',function(){return G.warn;},function(v){G.warn=v;})));
    g1.appendChild(inNum('Error at',function(){return G.err;},function(v){G.err=v;}));

    var s7=section('Looks');secIf(s7,function(){return notIcStock()&&notPaste()&&TYPE!=='geomap'&&TYPE!=='links';});
    galleryEl=h('div','lookgrid');s7.appendChild(galleryEl);
    s7.appendChild(h('p','note','Click one to apply it, then fine-tune under Look details. The preview shows them on PRTG\u2019s own white map. Switch Background to \u201cThe look\u2019s own\u201d to see the stage each one was drawn for.'));

    var sfx=section('Flexible or fixed');secIf(sfx,function(){return !!FLEXT[TYPE]&&TYPE!=='table'&&notPaste();});
    sfx.appendChild(inSel('Size',function(){return M().fit?'flex':'fixed';},function(v){setFlex(v==='flex');},[['flex','Flexible: everything grows and shrinks with the object'],['fixed','Fixed: PRTG\u2019s standard, the text keeps its size']]));
    var sfn=h('div');
    sfn.appendChild(pair(inNum('Normal width (px)',function(){return M().fitW;},function(v){M().fitW=v;},40,4000),inNum('Normal height (px)',function(){return M().fitH;},function(v){M().fitH=v;},30,4000)));
    var sfb=h('button','btn ghost','Make the current size normal');sfb.type='button';
    sfb.addEventListener('click',function(){var m=M();m.fitW=parseInt(m.initW,10)||m.fitW;m.fitH=parseInt(m.initH,10)||m.fitH;refreshUI();render();});
    sfn.appendChild(sfb);
    sfn.appendChild(h('p','note','At the normal size the title and the text have the look\u2019s sizes. Make the object bigger or smaller, here or on the PRTG map, and they grow or shrink with it, together with the drawing.'));
    showIf(sfn,function(){return !!M().fit;});sfx.appendChild(sfn);
    sfx.appendChild(h('p','note','Fixed is how PRTG\u2019s own objects behave: only the box and the drawing change size, the text stays as it is.'));

    var s8a=section('Appearance');secIf(s8a,function(){return notIcStock()&&notPaste()&&TYPE!=='links';});
    (function(){
      var w=h('div','dfld');w.appendChild(h('label',null,'Status colors'));
      var cur=function(){return (TYPE==='geomap')?(function(){var r='custom';CSETS.forEach(function(x){var ok=true;GMSTATES.forEach(function(st){if(st.id!=='downack'&&String(gmColor(GM,st.id)).toLowerCase()!==x[2][st.id==='warn'?'warning':st.id].toLowerCase())ok=false;});if(ok)r=x[0];});return r;})():csetOf(M().look);};
      var pk=PS.picker({get:cur,pick:function(v){if(v==='custom'){PS.cur='';PS.over={};}else csetApply(v);refreshUI();render();},extra:[['custom','My own mix']]});
      syncs.push(function(){pk.sync();});w.appendChild(pk);s8a.appendChild(w);
    })();
    var g=h('div');s8a.appendChild(g);
    g.appendChild(inChk('Card background and border',function(){return Lk().card;},function(v){Lk().card=v;}));
    g.appendChild(pair(inColor('Card fill',function(){return Lk().cardBg;},function(v){Lk().cardBg=v;}),inNum('Fill opacity %',function(){return Lk().cardA;},function(v){Lk().cardA=v;},0,100)));
    g.appendChild(h('p','note','Below 100% the map shows through the card. PRTG\u2019s map is white by default, so light text on a see-through card turns unreadable. Keep 100% unless your map background is dark.'));
    g.appendChild(pair(inColor('Border color',function(){return Lk().border;},function(v){Lk().border=v;}),inNum('Border width',function(){return Lk().bw;},function(v){Lk().bw=v;},0,6)));
    g.appendChild(pair(inNum('Corner radius',function(){return Lk().radius;},function(v){Lk().radius=v;},0,40),inSel('Shadow',function(){return Lk().shadow;},function(v){Lk().shadow=v;},[['none','None'],['soft','Soft'],['strong','Strong'],['glow','Glow']])));
    g=h('div');showIf(g,function(){return TYPE!=='geomap';});s8a.appendChild(g);
    g.appendChild(pair(inNum('Padding inside the card',function(){return Lk().cardPad;},function(v){Lk().cardPad=v;},0,60),inColor('Accent color',function(){return Lk().accent;},function(v){Lk().accent=v;})));
    g.appendChild(h('p','note','Padding applies to every title style except the colored bar, which runs edge to edge.'));
    var s8=section('Look details');secIf(s8,function(){return notIcStock()&&notPaste()&&TYPE!=='geomap'&&TYPE!=='links';});
    lookDetail=h('div');s8.appendChild(lookDetail);
    var famOptions=Array.prototype.map.call(el.fam.options,function(o){return [o.value,o.textContent];});
    var D=lookDetail;
    function grp(label,fn){var b=h('div');if(label)b.appendChild(h('label',null,label));D.appendChild(b);if(fn)showIf(b,fn);return b;}
    var g=grp('');
    g.appendChild(pair(inSel('Font',function(){return Lk().font;},function(v){Lk().font=v;},famOptions),inNum('Size',function(){return Lk().size;},function(v){Lk().size=v;},8,40)));
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
    g=grp('Chart',function(){return TYPE==='graph'&&(GR.kind==='sensor'||GR.kind==='sensors')&&GR.draw!=='pic';});
    g.appendChild(pair(inNum('Line width',function(){return GR.lw;},function(v){GR.lw=v;},1,6),inNum('Fill strength %',function(){return GR.fillA;},function(v){GR.fillA=v;},0,80)));
    g.appendChild(pair(inChk('Grid lines',function(){return GR.gridOn!==false;},function(v){GR.gridOn=v;}),inNum('Bar corner radius',function(){return GR.bradius;},function(v){GR.bradius=v;},0,12)));
    g=grp('Status colors',notFrame);
    g.appendChild(pair(inColor('Up',function(){return Lk().c.up;},function(v){Lk().c.up=v;PS.over.up=v;}),inColor('Warning',function(){return Lk().c.warning;},function(v){Lk().c.warning=v;PS.over.warning=v;})));
    g.appendChild(pair(inColor('Down',function(){return Lk().c.down;},function(v){Lk().c.down=v;PS.over.down=v;}),inColor('Unusual',function(){return Lk().c.unusual;},function(v){Lk().c.unusual=v;PS.over.unusual=v;})));
    g.appendChild(pair(inColor('Paused',function(){return Lk().c.paused;},function(v){Lk().c.paused=v;PS.over.paused=v;}),inColor('Unknown',function(){return Lk().c.unknown;},function(v){Lk().c.unknown=v;PS.over.unknown=v;})));
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
  (function(){
    var host=document.getElementById('ocset');
    if(!host)return;
    var pk=PS.picker({get:function(){return PS.cur||(TYPE==='donut'?csetOf(DN.look):'');},pick:function(id){if(!id){PS.cur='';PS.over={};refreshUI();render();return;}obDo(function(){csetApply(id);});},extraFirst:[['','The look\u2019s own']],extra:[['custom','My own mix']]});
    host.appendChild(pk);window.PMSHDR=pk;
    var psync=pk.sync;pk.sync=function(){[].forEach.call(pk.querySelectorAll('.csp-row'),function(q){var id=q.getAttribute('data-set');if(id==='')q.hidden=(TYPE==='donut');if(id==='custom')q.hidden=true;});psync();};pk.sync();
  })();
  document.getElementById('ozoom').addEventListener('change',function(){drawPreview();});
  obWire();
  document.getElementById('ogridchk').addEventListener('change',function(){obZoom();obPlace();});
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
  /* The same editor, shown inside the Dashboard's own panel under the selected item. The Dashboard moves the editor's panel into its own,
     and each change is passed back through OBJAPI.onInline. The tab's own frame and history are set aside as in frameEdit. */
  var INLK=null, INLBUSY=false, INLCUR='frame', INLOPEN=null;
  function inlFold(){
    [].forEach.call(hostEl.children,function(f){
      var bar=f.children[0], body=f.children[1], open;
      if(!bar||!body||bar.tagName!=='BUTTON'||!bar.classList.contains('advbar'))return;
      open=/Looks/.test(bar.textContent);
      body.hidden=!open;bar.classList.toggle('open',open);
      if(bar.firstChild)bar.firstChild.textContent=open?'\u25BE':'\u25B8';
    });
  }
  OBJAPI.inline={
    mount:function(host){
      INLOPEN=[].map.call(hostEl.children,function(f){return f.children[1]?!f.children[1].hidden:false;});
      host.appendChild(hostEl);document.body.classList.add('inlobj');
    },
    unmount:function(){
      var pn=document.getElementById('panel');
      document.body.classList.remove('inlobj');
      [].forEach.call(hostEl.children,function(f,i){
        var bar=f.children[0], body=f.children[1], o=!!(INLOPEN&&INLOPEN[i]);
        if(!bar||!body||bar.tagName!=='BUTTON'||!bar.classList.contains('advbar'))return;
        body.hidden=!o;bar.classList.toggle('open',o);if(bar.firstChild)bar.firstChild.textContent=o?'\u25BE':'\u25B8';
      });
      if(hostEl.parentNode!==pn)pn.insertBefore(hostEl,document.getElementById('dashpanel'));
    },
    begin:function(kind,p,w,h,fresh){
      var fr=blankFR(kind);
      fr.p=JSON.parse(JSON.stringify(p));fr.w=w;fr.h=h;
      if(!INLK&&!EDK)INLK={type:TYPE,frame:FRM.frame,bg:FRM.bg,shape:FRM.shape,hf:HIST.frame,hb:HIST.bg,hs:HIST.shape};
      FRM[kind]=fr;delete HIST[kind];INLCUR=kind;
      INLBUSY=true;
      try{if(TYPE!==kind)setType(kind);else{refreshUI();render();}}finally{INLBUSY=false;}
      document.body.classList.remove('objs');OBJAPI.active=false;
      if(fresh)inlFold();
    },
    read:function(){var fr=INLK&&FRM[INLCUR];return fr?{p:JSON.parse(JSON.stringify(fr.p)),w:fr.w,h:fr.h}:null;},
    end:function(){
      if(!INLK)return;
      FRM.frame=INLK.frame;FRM.bg=INLK.bg;FRM.shape=INLK.shape;
      if(INLK.hf)HIST.frame=INLK.hf;else delete HIST.frame;
      if(INLK.hb)HIST.bg=INLK.hb;else delete HIST.bg;
      if(INLK.hs)HIST.shape=INLK.hs;else delete HIST.shape;
      TYPE=INLK.type;INLK=null;
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
    try{buildTypeGrid();scopeGrid();}catch(err){if(window.console)console.error('type grid',err);}
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
