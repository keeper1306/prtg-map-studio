# PRTG Map Studio – notes for Claude

A browser extension (Manifest V3) that builds and pushes PRTG map objects and dashboards.
Last updated at version 1.5.73.

The owner is not technical. Explain things in plain words and give step-by-step instructions
when they need to do something themselves.

## Where things live

- GitHub: `keeper1306/prtg-map-studio`. Work on the `connectors` branch, then fast-forward
  `main` to it with `git push origin connectors:main`. Never merge into an old local `main`.
- Repo on the VM: `C:\Users\Administrator\Documents\prtg-map-studio`.
- Extension folder the browser runs: `C:\Users\Administrator\Desktop\PRTG Map Studio\extension`.
  It is not a git repo. Normally `app.html`, `manifest.json` and the files in `js\` change there.
  It still holds the old, unused `app.js` until the owner agrees to delete it.
- The tool always runs as a chrome-extension page (`background.js` opens `app.html`, which is the
  only thing that loads the scripts). The comment at the top of `js/01-config.js` about being
  "loaded into a PRTG tab" is outdated.
- PRTG install folder (Claude may add object files to `webroot\mapobjects`, see rule 8): `C:\Program Files (x86)\PRTG Network Monitor`
  (`webroot`, `themes`, `frontend`, `Custom Sensors`, `lookups`, ...).

## Code layout (app.js was split at 1.5.44 to 1.5.53)

The code is in `extension/js/`, one region per file, loaded by `app.html` with `defer` in the
order of the numbers (no modules, no build step). Plain scripts share one global scope, so the
regions still talk through the same names (`CFG`, `DASHAPI`, `window.PUSHAPI`, ...), page events
and element ids as before. Keep the order: a top-level function is only usable after its file ran.

| File | Region | What it is |
|---|---|---|
| `01-config.js` | (timer stopper) + `config` | `CFG`, the changelog |
| `02-tabs.js` | `tabs` | `TABS` |
| `03-linkstyle.js` | `linkstyle` | Connector line looks, `LKDEF` |
| `04-page.js` | `page` | label and button tool, folding sections, preview; `DASHAPI`/`OBJAPI` placeholders, `SECAPI`, `PMRES` |
| `05-info.js` | `info` | the "i" notes, `INFOAPI` |
| `06-dashboard.js` | `dashboard` | Map designer; fills `DASHAPI`, `PMSSETS` |
| `07-push.js` | `push` | connect, push, Undo, existing maps; `PUSHAPI`, `EXAPI`, `PRTGSTATE` |
| `08-library.js` | `library` | Your objects, install script; `LIBAPI` |
| `09-objects.js` | `objects` | Object builder; fills `OBJAPI` |
| `10-dashtabs.js` | `dashtabs` | Map / Design / Push tabs |
| `11-start.js` | (none) | `buildPresets(); render();` (must stay last) |

Each region was moved without changing a character. Joined in load order, the files equal the
1.5.43 `app.js` apart from the ten new changelog entries and the two `linkstyle` marker lines.
How it was done, stage by stage:

- Stage 1 (1.5.44): timer stopper + `config` → `js/01-config.js`. Done; the owner said to go on.
- Stage 2 (1.5.45): `tabs` → `js/02-tabs.js` (it starts with the blank line that followed
  config). Done; the owner said to go on.
- Stage 3 (1.5.46): `dashtabs` → `js/10-dashtabs.js` and the last two lines → `js/11-start.js`
  (no final line break, as before). Both load after `app.js`. Done; the owner said to go on.
- Stage 4 (1.5.47): the unnamed link-style block → `js/03-linkstyle.js`, now wrapped in
  `@region: linkstyle` / `@endregion: linkstyle` (the only added lines). Done; the owner said to
  go on. All 116 line-look drawings were checked identical to 1.5.46.
- Stage 5 (1.5.48): `page` → `js/04-page.js`. Done; the owner said to go on. The code built
  for every label and button preset (65 outputs) was checked identical to 1.5.47.
- Stage 6 (1.5.49): `info` → `js/05-info.js`. Done; the owner said to go on. The 25 notes
  icons, their texts and a hover were checked identical to 1.5.48.
- Stage 7 (1.5.50): `objects` → `js/09-objects.js` (it starts with the two blank lines that
  followed library), loaded straight after `app.js`. Done; the owner said to go on. The
  object file of each of the 10 object types (default settings) was checked identical to 1.5.49.
- Stage 8 (1.5.51): `library` → `js/08-library.js`, loaded straight after `app.js`. Done; the
  owner said to go on. Save/load (with the 60-file limit), parseHead, the install script and the
  zip's size were checked identical to 1.5.50.
- Stage 9 (1.5.52): `push` → `js/07-push.js`, loaded straight after `app.js`. Done; the owner
  said to go on.
- Stage 10 (1.5.53): what was left of `app.js` (dashboard) renamed to `js/06-dashboard.js`;
  `app.js` is gone. Done; waiting for the owner's test.
- Regions were only taken from the front or the back of what was left, so the order never changed.
- Checks at every stage: (1) join the files in `app.html`'s order and compare with the previous
  version: only the new changelog entry may differ; (2) `tests/run-tests.js`; (3) the list of
  window names the page creates (102 at 1.5.43) and `CFG` must be unchanged; plus a comparison
  with the previous version of the region that moved (looks, presets, notes, object files,
  library).
- Not verified on the real PRTG: every stage was only run against the stand-in server; the owner
  tests each version by hand.

## Rules

1. Don't guess. Check, or say "I have not verified this".
2. Ask for access instead of working around it.
3. Never type the owner's PRTG username, passhash or password.
4. After every change, update both GitHub and the VM extension folder:
   - Bump `"version"` in `extension/manifest.json`.
   - Add a changelog entry at the start of `CFG.changelog` in `extension/js/01-config.js`
     (it was in `app.js` before 1.5.44). It is one
     string, newest first, in the form `'1.5.41: What changed. 1.5.40: ...'`. Write apostrophes
     as `\u2019`, like the existing entries do (GNU `sed` turns `\u2019` into a real \u2019 character,
     so add the entry with Node or an editor, and check it). (`CFG.version` in the config says `1.4.2`, but
     line ~98 of `js/01-config.js` replaces it with the manifest's version at startup, so only the
     manifest needs bumping.)
   - Commit, push `connectors`, then push `connectors:main`. The owner wants this done directly,
     without pull requests or asking first. GitHub prints "Bypassed rule violations ... Changes
     must be made through a pull request" for `main`; that is expected.
   - Copy `manifest.json`, `app.html` and the `js` folder into the
     extension folder, and confirm every copy is byte-identical by hash. This does both and prints
     SAME or DIFFERENT for each file (every line must say SAME):
     ```powershell
     $src = "C:\Users\Administrator\Documents\prtg-map-studio\extension"
     $dst = "C:\Users\Administrator\Desktop\PRTG Map Studio\extension"
     New-Item -ItemType Directory -Force "$dst\js" | Out-Null
     Copy-Item "$src\manifest.json", "$src\app.html" $dst
     Copy-Item "$src\js\*.js" "$dst\js\"
     Get-ChildItem $src -Recurse -File -Include *.js, *.html, *.json | ForEach-Object {
       $rel = $_.FullName.Substring($src.Length)
       $a = (Get-FileHash $_.FullName).Hash
       $b = (Get-FileHash ($dst + $rel) -ErrorAction SilentlyContinue).Hash
       "{0}  {1}" -f $(if ($a -eq $b) { 'SAME     ' } else { 'DIFFERENT' }), $rel
     }
     ```
     The old `app.js` in the VM folder is no longer loaded by anything. Ask the owner before
     deleting it.
5. Commit as keeper1306 (`keeper1306@users.noreply.github.com`). End every commit message with:
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (use the model actually running).
   Add a `Claude-Session: <link>` line only when the session has a claude.ai/code link.
6. Measure cost, not only speed.
7. Report what wasn't verified on the real PRTG.
8. Claude may write files straight into PRTG's install folder (the owner changed this rule on 2026-11-03),
   normally only `webroot\mapobjects` for object files. Never delete or replace anything PRTG itself put
   there. Before replacing a file Map Studio made, keep a copy of the old one. Check every file written by
   reading it back and comparing it byte for byte.

Line endings: every text file in the repo is LF and there is no `.gitattributes`. Git on the VM
was installed with "Checkout as-is, commit as-is" (`core.autocrlf=false`). Keep it that way, or the
hashes against GitHub won't match.

## Tests

`tests/` has a stand-in PRTG server and automated push and Undo checks (see `tests/README.md`).
Run them after any change to push, Undo or storage code, and after any change to the load order
or the files in `extension/js/`. They need Node.js, Python and Playwright's Chromium; they are not part of the extension.
Installed on the VM (2026-11-03, owner approved): Node.js 26.13.0 LTS and Python 3.15.2 (for all
users, on PATH), Playwright 1.63.0 in `tests\node_modules`, its Chromium in
`%LOCALAPPDATA%\ms-playwright`. A shell opened before that install may need Node's folder
(`C:\Program Files\nodejs`) added to PATH. Ask before installing anything else.
A full run takes about 5 seconds (16 seconds the very first time).

## Known issues (not bugs to fix while doing other work)

- The sync record and push history are keyed by the exact server address. Connecting to the same
  PRTG through two addresses (for example the classic address and the new UI at `localhost:1616`)
  makes Map Studio treat them as two servers: Review shows already-pushed items as new, and Undo
  is not offered. Confirmed on the real PRTG at 1.5.43. Workaround: always use the same address.
  The owner chose to leave this until after `app.js` is split (the split is now done, at 1.5.53).

## Status icon toolbar (1.5.56)

- The bar's Icon menu shows the styles as pictures (`fillStyleGallery(el,pfx)`, shared with the
  side panel's gallery; the menu uses prefix `obg` so its gradient ids don't clash with the side
  panel's, which made LED and Soft orb draw blank).
- `obRoot()` for icons is the whole preview strip, so a click on any state's icon opens the bar.
- Looks is shown only when `iHasBg(IC)`, which since 1.5.57 means only when the icon's card
  ("Card behind the icon, from the look", `IC.card`) is on. The owner asked to remove Looks from
  the Tile and the Traffic light too. A tried change (tile on the look's card colour, traffic-light
  housing in the look's title colour) was shown as a mockup and rejected; don't redo it unasked.

- 1.5.58 added 14 styles to `ISTYLES` (new gallery group "Shapes"): square, diamond, hexagon,
  corner, rbar; sign, bars, server, beacon, flag; tlout, tlh, ledstrip, sbar. The three-lamp
  styles share the traffic light's lamp rules through `ITL`; Signal bars use `IBARS`; Status
  bar is HTML like the pill and always shows its word; Beacon's rays blink on alarm states when
  Animate is on. Existing styles were checked pixel-identical to 1.5.57 (traffic, dot, pill,
  tile, badge, LED).

## The look in automatic names (1.5.72)

- The owner asked for the look in the autofilled file name. `amLook(m,x)` puts `m.look.name` after the type in every
  `amName()` result ("Map Studio Gauge - Wall display - flat minimalist, main channel"), Any object names included.
  Skipped where the builder offers no Looks: Geo map, Link style, icons with the stock engine or without their card.
  Names over 64 characters now end on a whole word (`sp>40`) before the "…".
- So every automatic name and file name changed, ring gauges included (1.5.54 had kept those unchanged because such
  files are installed in `mapobjects`): an object made again gets a new file name and does not replace the old file in
  PRTG. Checked: every object file equals 1.5.71 apart from the name (header line and the class names made from it).

## Any object templates and the Wall display fix (1.5.71)

- The owner asked for one extra item per object that works on a probe, group, device and sensor, without removing anything.
  Each type's template list ends with the group "Any object" (option value `any`; Table, Gauge, Graph, Donut, Sunburst,
  Status counts, Icon, Tile, Industrial = `ANYT`, Industrial is the Tile with `fam:'ind'`). `anyStart()` makes a fresh
  model of the type with `any:true` (`anyOn()`), size `ANYSZ` (times the look's text size / 13), Flexible except tables and icons.
  `buildAny()` writes the file: `checkobjecttype` all four, hidden `.aname` / `.astatus` / `.alast` (`objectproperty Name`,
  `objectstatus status` and `lastvalue`), and two JSON comments: `<#table content='sensors'>` and `<#table content='channels'>`.
  `anyRuntime(root,C)` (C.view = the type): channels present and at most one sensor row = a sensor; else the sensors below.
  No API calls. The type's own sections and bar menus hide while `anyOn()` (`ANYSEC`, `data-sec` on sections, `applyVis`);
  the bar shows an "Any object" menu and the side panel an "Any object" section with "Preview it on" (`m.anyPv`, preview only).
- Geo map (PRTG's own `locationlist` drawing) and Link style (not attached to an object) have no Any object template.
- 1.5.73: the owner found the floating bar missing on the Any object table: `obRoot()` returned `#edwrap` (the table's
  column editor) for every table. Now `anyOn()` is checked there and in `edOn()`, `eoModel()`/`eoOk()` (drag-resize in the
  preview), the Width/Height inputs (`ogauge`, `owlabel`), the Flexible buttons (hidden for the Any table: `buildAny` has no
  table fit), the table's Header/Stripes/Title buttons and the gauge's Needle/Min/max (hidden), and the align buttons
  (`L().align`, not `T.tAlign`). Checked: the bar shows for all nine Any templates; other object files unchanged.
- Wall display is the only look with text size 18 (all others 13); the owner calls it the big screen preset. Fixes:
  `lookSet(m,look)` scales `initW/initH/fitW/fitH` by the size ratio when a look is picked or carried over by a type switch
  (tables had shrunk their text back by the Flexible fit, donut legends overflowed over the title and lost rows);
  `lookTs(L)`/`tsCss()` scale the fixed font sizes in `tileCss` and `indCss`, and graphs get `C.ts` (the drawing is
  enlarged like Flexible). For size 13 the files are unchanged. The donut legend now clips with … (all ring donuts' CSS changed).
- Checked: 12 tests; object files identical to 1.5.70 except graphs (one runtime line) and ring donuts (three legend rules);
  the any files run against simulated PRTG output (sensor with and without itself in the sensors table, device whose channels
  table errors, empty group). Not verified on the real PRTG (signed out in Chrome): what `<#table content='sensors'>` and
  `content='channels'` return for a sensor and for a device, and whether `<#objectstatus name="status">` and `lastvalue` work
  on probes, groups and devices.

## Right-side bar: layouts, background, grid (1.5.70)

- R1 from the "Map Studio backgrounds and layouts" mockups (claude.ai artifact): `#drail` is a third column of `main`
  (60px, only in `body.dash`) with Layouts, Background and Grid (`data-rail`). `#drpanel` slides out to its left over the
  canvas; it starts under the canvas toolbar (`railTop()`, `--drtop`) so Undo and the toolbar stay in reach, and stays open
  while you work (× or Esc). `railOpen(k,keep)`, `railClose()`, `railPaint()`. The old `#dlaypop` and `#dgridpop` are built
  inside `#drbody`; the toolbar's Layouts and Grid buttons open the same panel. Shapes stayed under Build (not in the bar).
- Layouts: `LYGROUPS` (names; anything not listed goes under Other), search (`LY.q`), names under the pictures, the current
  layout's settings in `.ly-cur`. Build my own: `LY.b={cols,rows,cells,sel,name,gap,margin}`, `lbEven(n)` (rows from the
  canvas shape, the last row's boxes share its width), `lbGrid`, `lbJoin` (picked boxes must cover a rectangle),
  `lbSplit` (doubles the grid when a box is one unit), `lbNorm` (smallest grid, reading order). My layouts:
  `CFG.keys.myLayouts` in localStorage, up to 40, newest first. A custom layout on the canvas is
  `D.layout={id:-1,custom:[name,cols,rows,cells],gap,margin}`; `layCells()` uses `custom` before `LAYOUTS[id]`.
- Background: one frame item with `p.mapBg` (and `group:false`, so it never holds items), `p.bg={id,mode,pat|grad,base,pc,
  size,str,g2,g3}`. `bgCss()` builds the CSS `background` value (gradients; honeycomb and circuit are SVG data URIs);
  `frameHTML` → `bgHTML`. `bgFix()` (before every `renderAll`, and on `dsize`) keeps it at 0,0, the canvas size and the
  lowest `ord`. Clicks pass through it (`pointer-events:none`). Presets `BGPRE`, solid colours `BGSOLID`. The map's own PRTG
  colour (`setMapBg`, Build › Background) is unchanged and separate.
- Checked against the stand-in server: push sends the background first at 0,0 with the canvas size; all 20 choices draw;
  undo; canvas resize; every object file identical to 1.5.69 (22 compared). Not verified on the real PRTG: whether PRTG keeps
  the CSS gradients and the SVG data URIs in HTML Before, and how a full-map item behaves in PRTG's map designer (clicks on
  empty map areas may select it there).

## Graph choices as pictures, sunburst resize (1.5.69)

- The owner found the graph's options (Shows, Bars show, ...) not intuitive. `GRPICK` (kind, bsrc, bdir, bcolor, draw: value,
  short name, tooltip) and `grPic(group,value)` draw a 64x44 picture per choice; `grPicGrid(group,get,set,keep,done)` makes
  the grid (`.grpick`, same chips as the Tile's Kind pictures). Used in the bar's Graph menu (`obPick`, with the scope filter as
  `keep`; Drawing added there too) and the side panel (replacing the selects). Chart style already had pictures (`GRSHOT`).
- The sunburst could not be resized in the preview only because `CFG.edit.types` (set before sunbursts existed) did not list
  it; `drawSunburstPreview` already used `eoSz`. Now listed: dragging changes `initialwidth`/`initialheight` (checked 420x440 ->
  340x380). Every object file is byte-identical to 1.5.68 (22 compared).
- Not verified on the real PRTG (builder only).

## Industrial object (1.5.68)

- The owner chose one "Industrial" object for six OT kinds (mockups: claude.ai artifact "Map Studio OT objects"); the
  "control room look" (mockup 7) is to be a Look and color set later, not part of this object.
- Underneath it is a Tile: `TYPE==='tile'` with `TL.fam==='ind'` (`tlFam()`). Its own type-grid button `ind`
  (`setType('ind')`), and `TLKEEP` keeps the Tile and the Industrial object apart when switching. `blankInd()`,
  `indFromPreset()`, templates in `TLPRESETS` with `fam:'ind'` (`ind_lamps`, `ind_onoff`, `ind_tank`, `ind_silo`,
  `ind_equip`, `ind_pv`, `ind_count`), kinds `IKINDS` (pictures `iKindSvg`), category `Industrial`, names "Map Studio
  Industrial - ...". Own config, CSS and runtime (`indConfig`, `indCss`, `indRuntime`, `indScript`) so Tile files stay
  byte-identical (checked for every type, Flexible and Fixed). `obKey()` includes the family so the bar rebuilds.
- Kinds: `lamps` (a lamp lights when a channel value says its word, or a channel named with the word is on; colour = that
  channel's state), `onoff` (`onW`/`offW`/`onIf`/`bad`, styles lamp/switch/word), `tank` (`shape` tank/silo, `fill`,
  `chan2`, lines at the channel's min/max limits, HIGH/LOW badge), `equip` (`eq`, `eLay`, `upW`; colour = sensor state),
  `pv` (limit zones, setpoint `sp`, trend from `/api/historicdata.json` with `X-Requested-With`, last hour at avg 60:
  one small call per object each time PRTG refreshes the map, about every 30 s), `count` (days left; warning/alarm from
  the fields, else the channel's low limits, else 30/7; ring or pill; 0 or less = Expired).
- PRTG's API answers 401 without the `X-Requested-With: XMLHttpRequest` header (that was the earlier "Unauthorized").
- Checked in the builder preview with sample channels only. Not verified on the real PRTG: no OT sensors exist there, so
  the lookup words (S7 CPU status, LEDs), the history column names and the colours on live values are untested.

## Device tree: Root and the new UI look (1.5.67)

- Root was missing: `trParse()` took a single top item's `children` and dropped the item itself. PRTG's classic designer tree
  (`#objectpanel_tree`, from the same `/api/tree.json?groups=1&devices=1&probes=1&allowroot=1`) has exactly one top item,
  Root (objid 0, type group). The raw answer could not be read from the page (401 without the designer's sign-in data), so the
  single-item shape is inferred, not seen. `trParse()` now wraps a single item with children in a list.
- The rows look like the new UI's tree (`localhost:1616`, measured there): 24px indent with 1px #DBDCDF guide lines,
  chevrons, own line icons (group, probe, device; not PRTG's artwork, the repo is public), bold 12px names, selected row
  #E7F0FF with the name in #0F67FF, sensors with a status square. Under each probe, group and device: status-count boxes
  (`trChips`; down #E3063D, warning #F2BE25, paused #478EFF, up #B4BF17), from `upsens`, `downsens`, ... added to the
  status call in `trLoadStatus()`. The tree box is now up to 360px tall.
- `tests/mock-prtg.py` now serves a tree (Root as one item, as above), counts for devices/groups/probenodes and two sensors.
- Checked against the stand-in server only (screenshot before/after). Not verified on the real PRTG: the counts columns and Root.

## Flexible limits follow the scale (1.5.66)

- Found on the real PRTG (map 2197): a Flexible Status counts at 300x170 (scale 0.714) wrapped its 4 boxes onto two rows,
  because `.sbody` had `minmax(64px,1fr)`, `gap:8px` and the boxes `padding:4px 6px` in fixed px; and the box texts use
  `clamp(Apx, cq units, Bpx)`, whose px floor and ceiling don't scale. Tiles have the same clamps.
- Fix: `flexCss()` now runs `flexClamp()`, which turns a clamp's px floor and ceiling into `calc(Npx * var(--mss,1))`;
  `statusCss()` writes the grid minimum, gap, margin and box padding with `fpx()`. Only Flexible tile and status files
  change (checked: every type's file, Flexible and Fixed, identical to 1.5.65 except those two).

## Checked on the real PRTG (1.5.65, 2026-11-03)

- Nine 1.5.65 files written straight into `mapobjects`; the classic map designer listed them at once (no restart).
- In the designer, dropping a look onto an existing item replaces that item's look (it keeps position, size, object and link).
  A drop onto a place that seems empty can still land on the selected item, so drop onto an existing item on purpose.
  The list's hover previews shift the entries; find an entry by its `data-url` (file name) right before dragging.
  A double-click on a device-tree node adds it to the map at 0,0. Object scripts don't run in the designer, only on View Map.
- Results on View Map (classic UI): table 300x170 after dragging its corner -> 0.47, rows fit; gauge 320x280 -> 1.0, then
  190x170 after a corner drag -> 0.594 (title 16 -> 9.5px); graph on 190x170 -> 0.365; tile on 190x170 -> 0.731; donut on
  300x170 -> 0.773, slices in PRTG UI Up green #B8C419 (only Up sensors exist); status counts 300x170 -> 0.714 but wrapped
  (fixed in 1.5.66). Hexagon, beacon and status bar icons draw on a live map and keep the item's External Link.
- Not checked: the new UI (`localhost:1616`) for these files; donut colors with other looks or non-Up states.

## Status counts name and donut category (1.5.65)

- The owner chose to keep Status counts its own object (not a Tile kind): a tile follows one sensor, Status counts
  a group or device. Only the type button's short name changed (`TYPESHORT.status`, 'Status' -> 'Status counts'),
  plus its tooltip (`TYPETIP.status`). It fits the grid button (checked in the builder preview).
- The owner chose one category for donuts: `donutFromPreset()` now sets `D.cat='Donuts'` (was the preset's
  'Status Donuts'), as sunbursts got 'Sunbursts' at 1.5.60. `DPRESETS` still say 'Status Donuts', which only groups
  the template list. Donuts saved before keep their saved category (the field is editable under Name and title).
  Checked: a donut from `donut_alarms_font-dark` now starts `<!--Donuts: ...-->`; a blank donut is unchanged.
- Not verified on the real PRTG.

## Checked on the real PRTG (1.5.64)

- Test map 2197 has PRTG's `table1.htm` (sub 4, device 1028) and the installed `map-studio-sunburst-solid-by-sensors.htm`
  (sub 5, Root). The scaling code was run in the map page (classic UI and the new UI, whose map view is the classic
  `controls/mapview.htm` in an iframe): tables scale (600x330 -> 0.93, 800x440 -> 1.24, 300x165 -> 0.46) and the
  sunburst's title and legend follow `--mss` (210x220 -> title 8px, 800x500 -> 18px).
- Found and fixed: PRTG renames `.prtg-plugin` to `.prtg-plugin-initialized`; `tableFitRuntime` now uses `[class*="prtg-plugin"]`.
- PRTG strips `<script>` from an item's HTML Before (it shows as text), so scripts can only come from object files.
- PRTG's map refresh (every 30 s) replaces the items, so the file's script runs again each time.
- A Chrome window behind others gets about 1 frame per second, so resizes there apply late; not a bug.
- External Link works in the new UI too: clicking the item on map 2197 opened `/maps/2126/overview`.
- 2026-11-03: Claude wrote nine 1.5.65 test files straight into `mapobjects` (Flexible table, gauge, graph, donut,
  tile, status counts; icons hexagon, beacon, status bar), all checked byte-identical.

## Flexible or Fixed for every object with a box (1.5.63)

- `FLEXT` lists the types (table, gauge, graph, donut, sunburst, tile, status). `m.fit` is the switch (Fixed = PRTG's
  standard), `m.fitW`/`m.fitH` the normal size. `setFlex()` gives an object without a size the preview's size.
- Tables: `tableFitRuntime` (1.5.62). The others: `flexRuntime` sets `--mss` on the root to min(width/fitW, height/fitH);
  `fpx()` writes the title, root font, padding sizes as `calc(Npx * var(--mss,1))` and `flexCss()` does the same to every
  `font-size:Npx` in the object's own CSS (preview via `setStyle`, file via `flexAppend`). The graph's own drawing
  (`graphRuntime` drawInner) draws at the normal scale and enlarges (`C.flex`, `grCfg`). Drawings that already fill their
  box (donut, sunburst, dial, tile values) keep doing so.
- With Fixed the files equal 1.5.62's, except graphs (the runtime text changed, not what it draws).
- The bar's style group has Title size (`L.titleSize`) and Text size (`L.size`) and the Flexible | Fixed buttons (`obFlex`).
- Not verified on the real PRTG.

## Tables that scale with the object (1.5.62)

- `T.fit` (on in `blankT`, off for templates and for tables saved before) and `T.fitW` (the normal width, 600).
  `tableFitRuntime(root,C)` lays `.prtg-plugin` out at width box/scale and scales it with a transform: the largest scale
  that fits the box's height, never above box width / normal width. It refits on resize (ResizeObserver) and when
  PRTG refreshes the rows (MutationObserver). The file carries the function's own source (`tableFitScript`) and the root
  gets `overflow:hidden`. Only for tables with a size (initW and initH > 0). With fit off the file is unchanged.
- Not verified on the real PRTG (PRTG was signed out in Chrome when this was made): only the builder preview.

## Object links and donut colors (1.5.61)

- Checked on the real PRTG (test map 2197 "Map Studio link test", made for this): a map item's External Link
  (`ElementLink` in `editmapobject.htm`, `externallink` in `mapsettings.htm?type=objectproperties`) makes PRTG add
  `map_linkedobject`, `data-link` and `title` to the item's first div. `_Prtg.Maps.js` then opens it on a click: an address
  with `://` in a new window, anything else with `window.location` (so `map.htm?id=2126` opens that map). PRTG's own
  picker writes `map.htm?id=N`. Clicking a PRTG icon and a Map Studio icon with the link both opened map 2126 in the
  classic UI. Not checked in the new UI (`localhost:1616`).
- Canvas: `objLink(p)` in `js/06-dashboard.js` keeps an object item's link in `p.elink` (pushed as `rec.link`) and the
  kind in `p.elinkT`; the bar's link menu and `linkSec()` use it, without the new-tab box.
- Donuts: the slices use `DN.look.c`, which a look never replaces (`dnKeepC()` around every look change, `dnLook()` for
  new donuts with the `prtg` color set). The header Colors picker shows the donut's set (`csetOf`) and hides
  "The look's own" for donuts. PRTG-drawn donuts (`engine:'prtg'`) are still drawn by PRTG in its own colors.

## Sunburst category (1.5.60)

- Every sunburst Map Studio builds (own faces and PRTG-drawn) gets the category `Sunbursts`
  (the `<!--Category: Name-->` first line PRTG's map designer groups by), like gauges get `Gauges`.
  PRTG's own sunburst templates stay under `Device Tree Views`. Only that line changed (checked for all faces).

## Tile kinds (1.5.59)

- The Kind is a grid of pictures (`tKindSvg(k)`, `tKindGrid()`), in the bar's Tile menu and the side panel.
  Both use `setTileKind(v)`: name and size follow the new kind only while they were still the old kind's.
  The files made were checked identical to 1.5.58 for all six kinds.

## Gauges on PRTG's dial and lookup channels (1.5.55)

- Checked on the real PRTG (sensor pages 1004 and 1027, map 2126): PRTG's number dial has its
  cut-out (`circle.backgroundfill`) at (89.1, 108.9) in a 198 px svg, with the needle at (99, 99);
  Map Studio's faces move the needle to the cut-out on purpose. A **lookup** channel's dial has no
  cut-out: four `g.arc.lookups` quarter arcs round (99, 99), no min/max text. Lookup channels also
  carry `info.lookups` and a meaningless graph range (0 to about 72 million on sensor 1027).
- `nativeRuntime()` now detects `g.lookups`: centre (99, 99), no scale, no value line, no
  25/50/75 or ticks, decorations round the whole circle (`A0=-332`), text inside the ring.
  `rangeOf()` returns no range for a channel with `lookups`. `ringRuntime()` never draws a
  lookup channel on a number range. Scale numbers of 10,000 and up are written with k, M or G.
  `fit()` may now scale PRTG's dial up to 4 times (was 1.6).
- Number dials were compared old against new on PRTG's real markup for all six faces: the same
  except for anti-aliasing noise (0 to 2 pixels).
- An object file carries its own copy of this code, so files installed before 1.5.55 (for
  example `bandwidth-gauge.htm` on map 2126) keep the old drawing until made again and installed.

## Object names (1.5.54)

- The owner wants every Object builder object named "Map Studio ..." automatically (until they
  type their own). `amName()` in `js/09-objects.js` builds it. Since 1.5.54 it also names gauges
  on PRTG's dial, PRTG-drawn donuts, sunbursts and graphs, and PRTG's stock icons; template-based
  names add what tells them apart. Ring-gauge names were deliberately left unchanged, because
  files named that way are already installed in `mapobjects`.
- Still the same name for different templates (already so before 1.5.54): the graph templates
  that only differ in font size or labels, and four table templates cut off at 64 characters.

## Done recently (1.5.41 to 1.5.43)

- 1.5.41: Undo (push and map edits) only uses history recorded for the current server.
  History saved before 1.5.41 has no server and is not offered for Undo.
- 1.5.42: Replacing an item adds the new one first and deletes the old one after.
- 1.5.43: A push, Undo or map-edit record that can't be saved gives a red warning.
- Tested by the owner on the real PRTG and by `tests/run-tests.js`.

## Done earlier (1.5.37 to 1.5.40)

- Gauges on PRTG's own dial (PRTG classic, Neon glass, Flat minimalist, Cyber tech, Ambient glow,
  Clean) have three options:
  - Scale numbers: outside or inside, from the sensor's real min/max.
  - Value line: complete or up to the value.
  - Zone colours: PRTG's, or cyan `#01AEF0` / navy `#050F33` / pink `#E70062`.
- Glass & metallic was removed from the choices; objects already saved with it still draw.
- Face order: classic first, then the modern styles. The face pictures are on white.
- Defaults: Flat minimalist, Cyber tech and Clean start with the complete line and the scale
  inside. A new gauge starts as Flat minimalist on white.

## Not verified on the real PRTG

- The scale's numbers with live sensors.
- The Map designer stand-in dial.
- Whether the navy zone is readable on dark backgrounds.

## Brand .htm files (not in the repo; ask the owner for them)

- Already Tile kinds in the builder: Stat tile, String tile, Bar gauge, Interface tile,
  Channel chips, Channel chips (auto-fit).
- Ready but not in the builder: Radial gauge, Section backdrop, Text box, Weather widget.
  - Radial gauge: its maximum doubles when an error limit exists (90 becomes 200), and the
    value overlaps the ring.
  - Weather widget: defaults to Benjamin's widget and New York, and needs weatherwidget.org
    reachable.
- Not ready: both NetFlow panels, SNMP Trap and Syslog. They contain `YOUR_READONLY_USER` /
  `YOUR_READONLY_PASSWORD` placeholders, and the NetFlow ones need the toplist ID in HTML Before.
