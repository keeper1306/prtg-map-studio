
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
    setTimeout(function(){try{document.dispatchEvent(new Event('pmlibchanged'));}catch(e){}},0);   /* the name check follows the list */
  }
  /* the first line of every object file is <!--Category: Name-->, which is how PRTG lists it */
  function parseHead(code){var m=/^\s*<!--\s*([^:]+?)\s*:\s*(.+?)\s*-->/.exec(code);return m?{cat:m[1],name:m[2]}:null;}
  function refresh(){var lib=load(), n=Object.keys(lib).length;listRender(lib,n);syncInstall();}
  document.addEventListener('pmlibchanged',refresh);   /* a pasted map added files to the list */
  /* the files behind the install step: see them, drop one, or clear the lot. This only changes what the tool remembers; PRTG's mapobjects folder is not touched. */
  var armed=null;
  function dropped(){refresh();if(window.PUSHAPI&&PUSHAPI.renderObjList)PUSHAPI.renderObjList();}
  function listRender(lib,n){
    var box=$('olist'), names=Object.keys(lib).sort(), clr=$('oclear');
    $('ocount').textContent=n;$('ocount').hidden=!n;clr.hidden=!n;
    box.textContent='';
    if(!n){var em=document.createElement('div');em.className='oempty';em.textContent='Nothing here yet. Make an object, then press “Add to this list”.';box.appendChild(em);return;}
    names.forEach(function(f){
      var row=document.createElement('div'), a=document.createElement('span'), c=document.createElement('span'), x=document.createElement('button');
      row.className='orow';a.className='ofn';c.className='ofc';x.className='linkbtn';x.type='button';
      a.textContent=f;c.textContent=(lib[f].cat||'')+(lib[f].name?': '+lib[f].name:'');x.textContent='Remove';
      x.addEventListener('click',function(){var o=load();delete o[f];save(o);dropped();});
      row.appendChild(a);row.appendChild(c);row.appendChild(x);box.appendChild(row);
    });
  }
  $('oclear').addEventListener('click',function(){
    var clr=$('oclear');
    if(!armed){clr.textContent='Click again to clear the list';armed=setTimeout(function(){armed=null;clr.textContent='Clear the list';},3500);return;}
    clearTimeout(armed);armed=null;clr.textContent='Clear the list';save({});dropped();
  });
  /* where PRTG is installed: remembered, and turned into the mapobjects folder */
  var FKEY='pm_prtgdir', DEFBASE=CFG.install.dir.replace(/[\\\/]+webroot[\\\/]+mapobjects[\\\/]*$/i,'');
  function baseGet(){var v='';try{v=localStorage.getItem(FKEY)||'';}catch(e){}return v||DEFBASE;}
  function mapDir(){
    var v=String($('ofolder').value||'').trim().replace(/[\\\/]+webroot[\\\/]+mapobjects[\\\/]*$/i,'').replace(/[\\\/]+$/,'');
    return (v||DEFBASE)+'\\webroot\\mapobjects';
  }
  function syncInstall(){
    var n=Object.keys(load()).length;
    $('opath').textContent=mapDir();
    $('oscript').disabled=!n;$('oscriptdl').disabled=!n;$('odlall').disabled=!n;$('oremotecopy').disabled=!n;$('oscriptdl').title=n?'':'Add an object to your list first';
    $('oscript').title=n?'':'Add an object to your list first';$('odlall').title=n?'':'Add an object to your list first';
  }
  $('ofolder').value=baseGet();
  $('ofolder').addEventListener('input',function(){try{localStorage.setItem(FKEY,String($('ofolder').value||'').trim());}catch(e){}syncInstall();});
  /* the code stays out of the way until asked for */
  $('oshowcode').addEventListener('click',function(){var box=$('ocodebox'), on=box.hidden;box.hidden=!on;this.textContent=on?'Hide code':'Show code';this.setAttribute('aria-expanded',on?'true':'false');});
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
  $('oadd').addEventListener('click',function(){if(remember())OBJAPI.toast('Added to Your objects');else OBJAPI.toast('Nothing to add yet.');});
  /* a PowerShell script that writes the files itself. Each file travels as base64 of its UTF-8 bytes, the same bytes Download saves, so no character can break the paste. */
  function b64(text){
    var bytes=new TextEncoder().encode(text), s='', i;
    for(i=0;i<bytes.length;i+=32768)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+32768));
    return btoa(s);
  }
  function psq(x){return "'"+String(x).replace(/'/g,"''")+"'";}
  function installScript(files,dir){
    var o=[], i, j, b;
    o.push('# PRTG Map Studio: puts the map object files into PRTG\'s webroot\\mapobjects folder on this computer.');
    o.push('# Run it on the PRTG server: paste it into PowerShell opened as administrator, or right-click the saved .ps1 and choose Run with PowerShell.');
    o.push('$msFile = $PSCommandPath');
    o.push('$script:msRelaunched = $false');
    o.push('function Install-PrtgMapObjects {');
    o.push('  $dir = $null');
    o.push("  try { $svc = Get-CimInstance Win32_Service -Filter \"Name='PRTGCoreService'\" -ErrorAction Stop; if ($svc.PathName -match '^\"?([^\"]+\\.exe)') { $cand = Join-Path (Split-Path -Parent $Matches[1]) 'webroot\\mapobjects'; if (Test-Path -LiteralPath $cand) { $dir = $cand; Write-Host ('Found PRTG here: ' + $dir) } } } catch { }");
    o.push('  if (-not $dir) { $dir = '+psq(dir||CFG.install.dir)+'; Write-Host (\'PRTG was not found as a service on this computer. Using the folder you typed: \' + $dir) }');
    o.push("  if (-not (Test-Path -LiteralPath $dir)) { Write-Host ('Folder not found: ' + $dir); Write-Host 'Fix the folder in step 1 of the tool, copy the script again and paste it.'; return }");
    o.push("  $admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)");
    o.push("  if (-not $admin) {");
    o.push("    if ($msFile) {");
    o.push("      Write-Host 'This needs administrator rights. Windows will ask for them in a new window.'");
    o.push("      try { Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -File \"' + $msFile + '\"') -ErrorAction Stop; $script:msRelaunched = $true }");
    o.push("      catch { Write-Host 'Administrator rights were not given, so nothing was installed.' }");
    o.push("      return");
    o.push("    }");
    o.push("    Write-Host 'This PowerShell window is not running as administrator. Close it, open PowerShell as administrator and paste the script again.'; return");
    o.push("  }");
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
    o.push("  Write-Host ('Done. ' + $made + ' file(s) written to ' + $dir + ' on the computer ' + $env:COMPUTERNAME)");
    o.push("  Write-Host 'They will only appear in a PRTG core server that runs on this computer. If the Map designer is connected to another PRTG server, install them there.'");
    o.push("  if (Test-Path -LiteralPath $backup) { Write-Host ('Replaced files were backed up to ' + $backup) }");
    o.push("  Write-Host 'Reload the Map Designer to see them.'");
    o.push('}');
    o.push('Install-PrtgMapObjects');
    o.push("if ($msFile -and -not $script:msRelaunched) { Read-Host 'Press Enter to close' | Out-Null }");
    return o.join('\n')+'\n';
  }
  $('oscript').addEventListener('click',function(){
    var lib, names, files, text;
    lib=load();names=Object.keys(lib).sort();
    if(!names.length){OBJAPI.toast('Nothing to install yet. Add an object to your list first.');return;}
    files=names.map(function(f){return {name:f,text:lib[f].code};});
    text=installScript(files,mapDir());
    if(text.length>CFG.install.maxChars){OBJAPI.toast('Too long to paste ('+files.length+' file'+(files.length===1?'':'s')+'). Use Download ZIP.');return;}
    OBJAPI.copyText(text,'Install script copied ('+files.length+' file'+(files.length===1?'':'s')+')');
  });
  $('oscriptdl').addEventListener('click',function(){
    var lib=load(), names=Object.keys(lib).sort();
    if(!names.length){OBJAPI.toast('Nothing to install yet. Add an object to your list first.');return;}
    var text=installScript(names.map(function(f){return {name:f,text:lib[f].code};}),mapDir()).replace(/\n/g,'\r\n');
    try{
      var url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'})), a=document.createElement('a');
      a.href=url;a.download='Install-PrtgMapObjects.ps1';document.body.appendChild(a);a.click();document.body.removeChild(a);
      setTimeout(function(){URL.revokeObjectURL(url);},2000);
      OBJAPI.toast('Saving Install-PrtgMapObjects.ps1 ('+names.length+' file'+(names.length===1?'':'s')+')');
    }catch(e){OBJAPI.toast('Download blocked here. Use Copy install script and save it as a .ps1 file.');}
  });
  /* a script for another computer: it runs here, asks for an administrator account on the server and copies the files over the network */
  function remoteScript(files,server,mode,dir){
    var o=[], i, j, b, m=/^([A-Za-z]):\\(.*)$/.exec(dir), drive=m?m[1]:'C', rest=m?m[2]:dir;
    o.push('function Send-PrtgMapObjects {');
    o.push('  $server = '+psq(server));
    o.push('  $data = @{}');
    for(i=0;i<files.length;i++){
      b=b64(files[i].text);
      o.push('  $data['+psq(files[i].name)+'] = (@(');
      for(j=0;j<b.length;j+=2000)o.push("    '"+b.substr(j,2000)+"'"+((j+2000<b.length)?',':''));
      o.push("  ) -join '')");
    }
    o.push("  $cred = Get-Credential -Message ('A Windows administrator account on ' + $server + ' (for a local account: ' + $server + '\\Administrator)')");
    o.push("  if (-not $cred) { return }");
    o.push("  $backup = Join-Path $env:TEMP ('PrtgMapToolBackup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))");
    if(mode==='winrm'){
      o.push('  $dir = '+psq(dir));
      o.push('  $s = $null');
      o.push("  try { $s = New-PSSession -ComputerName $server -Credential $cred -ErrorAction Stop } catch { Write-Host ('Could not connect: ' + $_.Exception.Message); Write-Host ('If it mentions TrustedHosts, run as administrator: Set-Item WSMan:\\localhost\\Client\\TrustedHosts -Value ' + $server + ' -Concatenate -Force'); return }");
      o.push("  try {");
      o.push("    $r = Invoke-Command -Session $s -ArgumentList $dir, $data -ScriptBlock {");
      o.push("      param($dir, $data)");
      o.push("      if (-not (Test-Path -LiteralPath $dir)) { return @('Folder not found: ' + $dir) }");
      o.push("      $out = @(); $bak = Join-Path $env:TEMP ('PrtgMapToolBackup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))");
      o.push("      foreach ($key in $data.Keys) {");
      o.push("        $name = [IO.Path]::GetFileName($key); $path = Join-Path $dir $name; $word = 'Created '");
      o.push("        try {");
      o.push("          if (Test-Path -LiteralPath $path) {");
      o.push("            if ([Convert]::ToBase64String([IO.File]::ReadAllBytes($path)) -eq $data[$key]) { $out += ('Unchanged ' + $name); continue }");
      o.push("            New-Item -ItemType Directory -Force -Path $bak | Out-Null; Copy-Item -LiteralPath $path -Destination (Join-Path $bak $name) -Force; $word = 'Replaced  '");
      o.push("          }");
      o.push("          [IO.File]::WriteAllBytes($path, [Convert]::FromBase64String($data[$key])); $out += ($word + $name)");
      o.push("        } catch { $out += ('FAILED    ' + $name + ': ' + $_.Exception.Message) }");
      o.push("      }");
      o.push("      if (Test-Path -LiteralPath $bak) { $out += ('Replaced files were backed up on the server in ' + $bak) }");
      o.push("      $out");
      o.push("    }");
      o.push("    $r | ForEach-Object { Write-Host $_ }");
      o.push("    Write-Host ('Done. Files sent to ' + $server + ' (' + $dir + ')')");
      o.push("  } catch { Write-Host ('FAILED: ' + $_.Exception.Message) } finally { if ($s) { Remove-PSSession $s } }");
    }else{
      o.push("  $drive = 'PRTGREMOTE'");
      o.push("  try {");
      o.push("    New-PSDrive -Name $drive -PSProvider FileSystem -Root ('\\\\' + $server + '\\"+drive.toLowerCase()+"$') -Credential $cred -ErrorAction Stop | Out-Null");
      o.push("    $dir = $drive + ':\\' + "+psq(rest));
      o.push("    if (-not (Test-Path -LiteralPath $dir)) { Write-Host ('Folder not found on ' + $server + ': "+drive.toUpperCase()+":\\' + "+psq(rest)+"); return }");
      o.push("    $made = 0");
      o.push("    foreach ($key in $data.Keys) {");
      o.push("      $name = [IO.Path]::GetFileName($key); $path = Join-Path $dir $name; $word = 'Created '");
      o.push("      try {");
      o.push("        if (Test-Path -LiteralPath $path) {");
      o.push("          if ([Convert]::ToBase64String([IO.File]::ReadAllBytes($path)) -eq $data[$key]) { Write-Host ('Unchanged ' + $name); continue }");
      o.push("          New-Item -ItemType Directory -Force -Path $backup | Out-Null; Copy-Item -LiteralPath $path -Destination (Join-Path $backup $name) -Force; $word = 'Replaced  '");
      o.push("        }");
      o.push("        [IO.File]::WriteAllBytes($path, [Convert]::FromBase64String($data[$key])); Write-Host ($word + $name); $made++");
      o.push("      } catch { Write-Host ('FAILED    ' + $name + ': ' + $_.Exception.Message) }");
      o.push("    }");
      o.push("    Write-Host ('Done. ' + $made + ' file(s) sent to ' + $server)");
      o.push("    if (Test-Path -LiteralPath $backup) { Write-Host ('Replaced files were backed up to ' + $backup) }");
      o.push("  } catch { Write-Host ('FAILED: ' + $_.Exception.Message) } finally { Remove-PSDrive -Name $drive -ErrorAction SilentlyContinue }");
    }
    o.push("  Write-Host 'Now click Refresh object list in the Map designer while connected to that server.'");
    o.push('}');
    o.push('Send-PrtgMapObjects');
    return o.join('\n')+'\n';
  }
  $('oremotecopy').addEventListener('click',function(){
    var lib=load(), names=Object.keys(lib).sort(), server=String($('oremote').value||'').trim(), files, text;
    if(!names.length){OBJAPI.toast('Nothing to install yet. Add an object to your list first.');return;}
    if(!/^[A-Za-z0-9._\-]+$/.test(server)){OBJAPI.toast('Type the server name or IP address first (letters, numbers, dots and dashes).');$('oremote').focus();return;}
    files=names.map(function(f){return {name:f,text:lib[f].code};});
    text=remoteScript(files,server,$('oremotemode').value,mapDir());
    if(text.length>CFG.install.maxChars){OBJAPI.toast('Too long to paste. Use Download ZIP.');return;}
    OBJAPI.copyText(text,'Remote script copied ('+files.length+' file'+(files.length===1?'':'s')+')');
  });
  $('odlall').addEventListener('click',function(){
    var lib=load(), files=Object.keys(lib).sort().map(function(f){return {name:f,text:lib[f].code};});
    if(!files.length)return;
    var url=URL.createObjectURL(zipStore(files)), a=document.createElement('a');
    a.href=url;a.download='prtg-map-objects.zip';document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url);},2000);
  });
  function followDownload(){var d=($('odl').style.display==='none')?'none':'';$('oadd').style.display=d;}
  try{new MutationObserver(followDownload).observe($('odl'),{attributes:true,attributeFilter:['style']});}catch(e){}
  followDownload();
  refresh();
  window.LIBAPI={load:load,save:save,parseHead:parseHead,zip:zipStore,refresh:refresh,installScript:installScript};
}catch(err){if(window.console)console.error('library module',err);}
})();
/* @endregion: library */
