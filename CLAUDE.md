# PRTG Map Studio – notes for Claude

A browser extension (Manifest V3) that builds and pushes PRTG map objects and dashboards.
Last updated at version 1.5.60.

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
- PRTG install folder (read only, for reference): `C:\Program Files (x86)\PRTG Network Monitor`
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
8. Never write to PRTG's install folder. It's read only.

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
