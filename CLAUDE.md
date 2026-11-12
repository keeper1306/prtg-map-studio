# PRTG Map Studio – notes for Claude

A browser extension (Manifest V3) that builds and pushes PRTG map objects and dashboards.
Last updated at version 1.5.105.

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
   - Bump `"version"` in `extension/manifest.json`. Which part (the owner set this rule on 2026-11-12, after asking what
     1.5.104 meant): the **last** part for a fix or a small touch; the **middle** part, starting a new line at `.0`, for
     something new the owner would tell someone about (a new object type, a new way of working) - this is what the project did
     at 1.1.0 "new Link style object" and 1.2.0 "lines are now connectors", and then stopped doing, which is how the 1.5 line
     came to hold 105 entries including the Industrial object, packs, the background picture editor and the `app.js` split;
     **2.0** is saved for the first public release. Nothing technical forces this: Chrome allows up to 65535 per part.
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

## A shrunk table can be scrolled sideways (1.5.105)

- The owner, with a screenshot of a narrow table cut off at the Group column: "I cannot move to the right if the table is shrunk".
  A Fixed table's root is `overflow:auto`, but `buildTable` wrote the box inside it (`maptablecontainer` / `top10listcontainer`) as
  `overflow:hidden`. That box is as wide as the root, so it clipped the table at its own width and the root never saw anything wider
  than itself: the vertical bar appeared, the horizontal one never did, and the right-hand columns were unreachable.
- Now that box is `overflow:visible` for a Fixed table, so the root takes both bars. It stays `hidden` for a Flexible table
  (`tableFitRuntime` sets its overflow itself at runtime) and for a turned card (the card moves onto that box in `tableExtraCss` and
  has to clip its rounded corners). `drawTablePreview` writes the same rule, so the builder behaves like PRTG.
- Checked on the real PRTG (map 2231, classic View Map, the default table): at 430 x 300 the content is 795 px wide, it scrolls to the
  end and the last column is reachable; at 700 x 400 it scrolls 105 px; from 1000 px up nothing to scroll. 16 tests.
  27 table files change by exactly one attribute (`overflow:hidden` -> `overflow:visible`, nothing else); the 14 non-table object
  files are untouched.
- Watch out: `device_commit_files` wrote a stale copy again when the same `stagedPath` was reused (the file on disk kept the old
  byte count). Staging under a fresh name fixed it. Always read the file back and compare before trusting a write.

## The owner's own default table, five more status shapes (1.5.104)

- The owner asked for Corporate blue as the default look of a new table, for the nine columns of their own table to be the default, and
  for more status shapes in the bar's Status menu. They confirmed "a la tabla" when asked whether Corporate blue meant the table or the
  graph (the screenshot showed a table but the message said graph).
- `blankT`: `look` Corporate blue, `cols` status, device, sensor, group, message, lastvalue, minigraph, downtimesince, uptime,
  `initW`/`fitW` 1400. Width measured on the real PRTG (map 2231, four items): at 900 px the group and message columns wrap and rows go
  to 60 to 81 px; at 1100 px three of the four objects settle at 44 px; at 1400 px all four do, including Local Probe with its 71 sensors.
  Narrower than that is not wrong, it just scrolls, as before.
- `tableNeedH`: the row's content is `max(1.4 x size + links, 1.8 x size when the Mini graph column is shown)` - PRTG draws that column
  as its own block (`div.sensorgraph` with a sparkline canvas and two labels), which makes a 41.4 px row 44 px. Row heights still depend
  on the data: a long message in a narrow table wraps and the box scrolls.
- Five shapes added to `GRPICK.tstatus` (after the four that were there, so nothing moved): square, diamond, ring, bar, and
  `rowbar` "Stripe on the row". `TSHAPES`, `stDot`, `stShape(L,how)`, `stProp(how)` (a ring is drawn by its border, the rest by their
  fill) and `stStripe(L)` give both paths the same geometry: `anyTabCss` colours from PRTG's row classes with no script (the default
  table), `tableCss` plus `tableScript`/`tablePaintOnce` for the others. The script now also sets `dot.style.color`, which is where a
  ring's border takes its colour from. The stripe reads the row's class, so it is emitted before the "is there a status column" gate and
  works with the column dropped; on the default table it is scoped to `.ms-sens`, because a channels table's rows carry no state.
- Checked on the real PRTG (map 2231, classic View Map): all nine columns arrive; at 1400 x 598 every one of the four objects has content
  exactly 598 and no scrollbar, rows 44 px, dots in the look's green; the row stripe takes PRTG's own row classes (sg green, sy, sr).
  16 tests; the 41 object files still identical; pictures of all nine shapes and of the Status menu.
- Not checked on the real PRTG: square, diamond, ring and bar there (the stripe and the dot were, and all nine in the preview); the new UI;
  the public page; a table whose look is not Corporate blue at the new default size.

## Row padding for every table, paging in the look's colours (1.5.103)

- The owner asked to fix the row padding for the other tables too, and for the paging parts to be readable and pleasant (a look may be
  redesigned if needed; none was).
- Row padding: the `!important` rule moved out of `anyTabCss` into `tableCss`, so every table in a Map Studio look gets the look's padding,
  middle alignment and line height 1.4. Tables in PRTG's own look (`L.mode==='prtg'`, which `tableCss` returns early for) are untouched, so
  all 41 compared object files and the three PRTG-look table templates stay byte-identical; 12 template-plus-Map-Studio-look files gain
  10 lines and lose none.
- `pagingCss(T,cls)`, next to `pgPx`/`pgHeadH`/`pgFootH`: PRTG paints its "Items" line and page arrows #575756 with #EFEEEE spent arrows,
  at 11 px, whatever the look. Now, for a Map Studio look: text in `muted`, page sizes and live arrows in `link`, the current size in
  `text` bold, spent arrows `tint(muted,0.55)`, hover `text` (the accent is only 3.2 to 3.9 against the card on four dark looks), a
  `line` hairline over the arrows row, and the look's horizontal padding so both line up with the columns. The arrows are glyphs from
  PRTG's own `prtg-icons` font in `::before`, which take the `color`, so only colours are set, never the glyphs. Contrast against the card
  for all 13 Map Studio looks: muted 5.3 to 8.8, link 4.3 to 8.3, text 7.9 to 16.3; the lowest is Slate fintech's link at 4.27.
- Sizes follow the look: `pgPx` = max(11, size x 11/13), `pgHeadH` = pgPx + 5 (12 px of space above), `pgFootH` = pgPx x 2 + 26 (48 at 11,
  as PRTG lays it out). `tableNeedH` uses the same three, dropping its old 12/15/47 constants, and ends with +4 px of slack (the parts
  round differently per look; 1 px over would put a scrollbar there).
- Preview: the paging parts now show for every table with a row limit, not only the default one, and the "Items" line floats right and
  shows only the current size, as PRTG does. `PRTGBASE` paints them in PRTG's own greys, so the preview shows what a look has to beat.
- Checked on the real PRTG (map 2231, classic View Map and the new UI at :1616, the owner signed in): PRTG new UI look, content 587 in a
  588 px box (and 544 with the slack) with no scrollbar; Dark card, content 541, all four items fit 544 with no scrollbar; the colours
  land (muted #A9B7CA, link #38BDF8, spent arrows at 55 %), row padding 9px 14px, text 13 px. 16 tests; 41 files identical.
- Not checked: the other 11 looks on the real PRTG (formula and contrast only), the public page, PRTG's own page-size flyout once opened.

## Default table: preview with PRTG's paging parts, real row height (1.5.102)

- The owner asked about the empty space at the bottom of the default table's preview. It was the room `tableNeedH` keeps for the two parts PRTG
  adds to a group with more sensors than the table shows, which the preview did not draw. Seen on the real PRTG (map 2231, file
  `map-studio-zz-test.htm`): the `div.pagenavigation.pagenavigation-header` "Items: 50 100" line (12 px margin above, 16 px) shows on Local Probe
  and group 50 but not on device 2095 (empty, 0 px; rule not checked, perhaps more than 50 sensors), and `tfoot.pagenavigation` (48 px,
  "1 to 10 of 71" and four arrows) shows when there are more rows than the limit; a sensor's channels table (4 rows) has neither.
- Preview (`drawTablePreview`, default table on a group, no status/value filters): fills the rows up to the limit (`host-NN`), draws that line
  (when `T.infoheader`) and the page arrows with PRTG's class names; `PRTGBASE` styles them as measured, and now has PRTG's `line-height:normal`
  and PRTG's link box (`.table tbody tr td a`: inline-block, 1 px above and below, bottom) for every table preview.
- Found: PRTG's `.table tbody tr td, form .table tbody tr td` (padding 12px 10px 3px, baseline) beats the look's `.ptbl_x tbody td` rule, so Row padding
  did nothing in PRTG. `anyTabCss` (default table only) now forces the look's padding, middle alignment, line height 1.4 on cells and the title.
  Other tables still have this (not changed: their files stay identical).
- `tableNeedH` row = 2 x pad + 1.4 x size + 1.25, + 2 when name links are shown (sensor, device or group column; PRTG's links are inline blocks).
  Real: rows 41.4 (39.5 without links), content 584 px; formula 586. Preview content ends about 3 px above real.
- Checked: 16 tests; 41 other files identical; preview pictures. Not checked: other looks on the real PRTG (Wall display 699 from the formula),
  the group column's links, Links off, the new UI. PRTG's paging text is grey (#575756, arrows #EFEEEE/#575756) on every look, so it is hard
  to read on dark looks; the preview shows that as PRTG does (not styled by Map Studio).

## Bar menus over a tall object (1.5.101)

- The owner saw the table's Looks menu squeezed into a thin strip over the page header. Cause: `obOpenAway` opens a menu on the side of the
  bar away from the object; the 1.5.99/1.5.100 default table (600 x 541) fills the preview, so above it there was about 150 px and every
  table menu opened upward at that height (reproduced at 1918 x 950: Looks 156 px of 920). Now, when the menu fits neither above nor below
  the object, the bar stays where it is and the menu opens over the object on the side of the bar with the most room (`stay`).
- Checked against the stand-in server: all nine table menus open downward at their normal height; gauge, graph, tile and donut menus
  placed exactly as in 1.5.100; 16 tests. Not checked in the owner's Chrome.

## Fixed tables by default, titles in proportion (1.5.100)

- The owner: tables Fixed by default; titles must grow in proportion to the rest. `blankT` `fit:false` (Flexible is the bar's button);
  `tableAutoH` no longer needs Flexible, so a Fixed default table still arrives at the height its rows need (541 for ten rows in
  PRTG new UI). A Fixed file has no script; the root's `overflow:auto` makes a too-small box scroll.
- `thPx(T)`: the default table's header labels are 10/13 of the text size (10 px at 13, 13.8 at 18); other tables keep size - 3.
  `anyTabCss` also forces that size on `thead th` (`!important`, PRTG's 90 %). `tableTitleFollows(l,v)`: changing the text size of a
  table (bar's Text size, side panel's Size) scales the title size by the same ratio (13 -> 18 takes 16 -> 22).
- Checked: 16 tests; 41 other files identical; the default file 600 x 541, `overflow:auto`, no script, header 10 px. Not checked on the
  real PRTG yet: Chrome's PRTG session had ended (login page), and Claude does not sign in.

## Readable tables: height from the rows, text never under 12 px (1.5.99)

- The owner: tables must be readable; at least a 12 px font. Before, a Flexible table shrank everything until all rows fitted the box
  (the 1.5.96 default, 10 rows in 600 x 330, came out at scale 0.605, about 7 px).
- Measured on the real PRTG (map 2231, PRTG new UI look, 600 px wide): title 33, "Items" line (info header) 15, header 29, rows 35.4
  (36.7 once the text is really 13 px), page arrows (tfoot) 47, spaces 12, card padding 17 + 17. PRTG's stylesheet sets table cells to
  90 %: the look's 13 px came out as 11.7 px. `anyTabCss` now adds `tbody td{font-size:<size>px !important}` (default table only).
- `tableNeedH(T)` (formula from those parts and the look: pad, size, titleSize, head, infoheader, count; count 0 counts ten rows),
  `tableAutoH(T)` (default table with `T.autoH` and Flexible: `initH` = the need; run in `buildTable` and `drawTablePreview`). A height
  set by hand (dragging the bottom/top edge, or the Height box) turns `autoH` off; "Height follows the number of rows" in Sorting and
  rows and in the bar's Rows menu, with a note of the height needed.
- `tableFitRuntime`: `C.min` = `tableMinScale(T)` = min(1, 12 / text size) (`TABLE_MIN_PX`). Below it the scale stays at the minimum,
  the container scrolls (`overflowY:auto`) and the plugin gets a negative bottom margin so the scroll ends where the scaled table ends.
  This runtime is in every Flexible table file (templates are Fixed, so unchanged).
- Checked: 16 tests; the 41 other files identical; on the real PRTG (test file `map-studio-zz-test.htm`, map 2231): 600 x 531 -> scale
  0.989 (so the formula went to 541), 600 x 330 -> scale 0.923, text 12.0 px, scrolls (498 / 330); device and sensor tables at 1.0,
  13 px. Not checked: other looks' heights (formula only), the header labels (look size - 3, so 10 px), the new UI for the scroll.

## Map designer zoom bar (1.5.98)

- The owner asked for the zoom bar's number to be editable and the zoom to be less abrupt. `#dzval` is now a label holding `#dzin`
  (text input, 10 to 400; Enter or leaving applies, Esc restores, Up/Down step to the next multiple of 5) and a "%".
- `#dzslider` runs 0 to 1000 (`step="any"`) on a log scale: `zoomToPos(z)` / `posToZoom(p)` = 10 % x 40^(p/1000), so each pixel
  changes the zoom by the same share (~1.5 %); it snaps to 100 % within 3 %; arrow keys x/÷ 1.1. Before it was linear 10..400
  (1.6 points per pixel, very jumpy at small zooms). `zoomMid(z)` zooms around the middle of the visible canvas.
- Wheel: lines/pages turned into pixels (`deltaMode`); plain wheel `exp(-clamp(d,±100)*0.0005)` (about 5 % per notch), Ctrl or pinch
  `exp(-clamp(d,±25)*0.004)` (about 10 % per notch; a pinch sends many small deltas). Before: up to 12 % per notch, and Ctrl up to x2.
- Checked against the stand-in server (Playwright): typed 150 / 1000 (-> 400) / 37 (leave), arrow, one notch 100 -> 105, Ctrl notch
  105 -> 116, slider ends 10 % and 400 %, 620 -> 100 %; 16 tests. Not verified by the owner's hand on a real mouse or trackpad.

## Behaviour on by default, Look details in the bar (1.5.97)

- The owner asked for every Behaviour option on by default and every Look details setting in the floating bar "in an intuitive way"
  (the header fill was missing). `blankT`: `links`, `sortable`, `refreshable`, `infoheader` all true (templates keep their own).
  Seen on the real PRTG (test map 2231): links in the link colour, sort arrows that re-sort, and the info header is PRTG's
  "Items: 50" page-size picker over tables with many rows.
- Bar (js/09-objects.js): `pfColor(pop,label,get,set)` (a colour row in a menu, the existing `.pf-col` style; `.pf-cols` lays them out
  two per row) and `lkEd(fn)` (switches PRTG's own look to custom first, like `obSet`). New: "Title style" menu next to the title size
  (`GRPICK.ttl` pictures: bar, heading, divider, accent; Heading colour, or Bar and Bar text colours for the bar style); a Secondary text
  colour swatch after Text colour; for tables a "Header" menu (show, capitals, style pictures moved here from Status, Header text, Header
  fill, which also switches the style to Filled) and a "Row style" menu (stripes, stripe, row line, row hover, links, row and side padding);
  Colors gets "Or each color on its own" (six colours, `PS.over` as the side panel); the Graph menu gets Line width, Fill strength, Grid
  lines, Bar corner radius. The Status menu keeps Shown as, Dot size and Tint.
- Checked against the stand-in server: 16 tests; the 41 other files still identical to 1.5.95; a Header fill pick lands in the file
  (`background:#123456`, style Filled, look custom); pictures of the menus looked at. Not verified on the real PRTG: the bar itself
  (it is the builder); the default file's new Behaviour lines were checked there as above.

## The default Table works on all four object types (1.5.96)

- The owner asked for the Any object table to be the default when the Table button is clicked, to support probe, group, device and
  sensor, to have exactly the other tables' options, and to show fully in PRTG (the 1.5.71 Any table is drawn by a script, so PRTG's
  Map Designer and the object list's hover preview showed nothing). Server: `https://prtg.whatthehelbert.com` (valid certificate).
- Seen on the real PRTG with test files through `/controls/mapobjectpreview.htm` (map 2229, `dependency_` = object): `<#checkobjecttype>`
  aborts the whole item on any other type ("The selected object cannot be used here."), so it can't be used to branch; `<#sensor
  type="colorclassofstate">` and `<#objectproperty name="primarychannel">` abort on non-sensors too. `content="sensors"` on a sensor gives one
  row of "-"; `content="channels"` on a probe, group or device gives one row of "-" (no abort). Data rows: sensors `odd|even` + `sg` up,
  `sy` warning, `sr` down (also "Down (simulated error)"), `sb` paused (unusual `so` not seen); channels `odd|even`. `<#objectstatus
  name="type">` gives Group/Probe/Device/the sensor type, `name="sensor"` the sensor's name or nothing (not used).
- Model: `T.anyType` (true in `blankT`, false in `fromPreset`), `T.pvOn` (preview only), `blankT` count 10 (a table on Root with all 71
  sensors shrank to unreadable with Flexible). `buildTable` with `anyType`: checks all four types; `.ms-box-prtg-plugin` (has "prtg-plugin"
  in its class, so `tableFitRuntime` scales it) holding `.ms-sens` (PRTG's sensors table, all the usual parameters) and `.ms-ch` (channels
  table, `chanParams`: `name,lastvalue_` as PRTG's own Channels template, sort by name or by value when Sort by is Last value, count,
  title, links/sortable/refreshable). Each table has its own `.prtg-plugin`: with both in one plugin, PRTG's refresh put the sensors rows
  into the channels table (seen in the designer after a hover).
- `anyTabCss`: `.ms-ch` hidden unless `:has(.ms-ch tbody tr.odd)`, which hides `.ms-sens`. Status dots and row tint from the row classes
  with CSS only (no script), so they show in the designer too; pills still need `tableScript` (View Map only), the CSS only colours
  their text. `tableScript` returns '' for `anyType` unless pills.
- Builder: the template list's first entry is "Works on a probe, group, device or sensor" (`__blank`); no separate Any group for tables;
  `anyStart()` for a table gives the same table. Columns section and bar: a note and "Preview it on" (sample channels `SAMPLE_CHANS`);
  the column editor is off while previewing a sensor. Old Any tables (`m.any`) still load and build as before.
- Checked: 16 tests; 41 other files identical to 1.5.95 (every other type's default, every PRTG table template, four Any objects) and the
  table with `anyType` off and count 0 identical to the old blank table. On the real PRTG (test map 2231 "Map Studio test - default
  table", items on Local Probe 1, group 50, device 2095, sensor 2106, file `map-studio-zz-test.htm`, category "Map Studio Tests"): right
  table on all four in `mapobjectpreview`, in the Map Designer, in the object list's hover preview and in classic View Map; unchanged after
  PRTG's refresh (40 s); paging one table leaves the others alone; the new UI (`https://prtg.whatthehelbert.com:1616`, the owner
  signed in) View Map and Map Designer the same. Not checked: the public page.
  The test map and the test file are still there (no delete through the bridge).

## SolarWinds-style maps 2229 and 2230 (2026-11-11, no extension change)

- The owner sent two SolarWinds Orion screenshots ("Current Servers": RDS session counts, two server tables, graphs; "East/West Network":
  utilisation and traffic numbers, peak numbers, line charts) and asked for two maps as close as possible using only Map Studio and PRTG's own
  objects. Maps: 2229 "Map Studio - Current Servers" (1600 x 1250) and 2230 "Map Studio - East/West Network" (1600 x 1080), background #EFEFEF,
  "scale to fit" on. Tabs at the top are frames with map links to each other.
- 10 object files made by the Object builder's own code (a copy of the extension with `window.__OBX=function(s){return eval(s)}` added to the
  objects module, driven by Playwright: set the model, `codeNow()`, `fileNameOf()`), installed in `mapobjects`, byte-checked. Look PRTG new UI with
  Open Sans; status counts with the Color-blind safe set. Five were made again after looking at the map (ping table `count` 10, HTTP graphs only
  `Loading Time`, sparkline titles say bytes/s); the first versions are in `Desktop\PRTG Map Studio\mapobjects-backup-2026-11-11\`.
- The canvas (frames, banners, objects) was built with `DASHAPI.add`/`addObject` plus the layout data, pushed to a copy of `mock-prtg.py` that also
  lists the new files and logs every parameter, and the logged addobjecttomap/editmapobject calls were replayed on the real PRTG from a signed-in
  tab (Custom HTML element there is `x_ownhtmlonly.htm`).
- Copies of the files, both layouts, pictures and a Spanish LEEME: `Desktop\Map Studio - Current Servers and East-West maps\`.
- Limits (no data in this lab): no RDS/CPU/memory per server, no utilisation % (a bar against 1 Gbit/s instead), no peak number (sparkline with the
  latest value), graph periods only 2 h / 2 d / 30 d / 365 d, graph values are raw bytes/s without a unit.
- Bug seen, not fixed: a graph legend shows a value beginning with "<" as `&lt;` (e.g. "Bytes Received &lt; 0.01 MB").
- Seen: `mapobjects` no longer holds the earlier kit files or the three mockup dashboard files listed below (cause not checked).
- Checked in classic View Map (`mapshow.htm`). Not checked: the new UI (`localhost:1616` showed Chrome's certificate warning), the public page.

## Feedback (1.5.95)

- The owner chose option 1 of four (GitHub issue, form, e-mail, posting to a service): a "Feedback" button in the header (`#fbopen`)
  opens a window (`fbOpen` in js/07-push.js, before `window.PUSHAPI`): Report a problem / Suggest an idea, a text box (the owner asked
  for it), "Filled in for you" (Map Studio version, PRTG version from the `prtg-version` of the map list read at connect, `S.prtgVersion`,
  Classic or New PRTG UI, browser from the user agent) and, for a problem, a ticked box with the error message on screen (`fbError`: visible
  `.pst.err` / `.note.err`, the server's host replaced by `<server>`, other addresses and IPs by `<address>`, at most 1500 characters).
  "Continue on GitHub" opens `https://github.com/keeper1306/prtg-map-studio/issues/new?template=problem.yml|idea.yml&...` in a new tab;
  Map Studio sends nothing itself (the README's privacy promise holds). The text goes to `what` (problem) or `idea`.
- Issue forms: `.github/ISSUE_TEMPLATE/problem.yml` (label bug) and `idea.yml` (label enhancement), text fields with the ids used in the
  address (`what`, `expected`, `steps`, `error`, `ms-version`, `prtg-version`, `prtg-ui`, `browser`; `idea`, `why`). GitHub fills
  issue-form text fields from query parameters named after the ids (seen in github/docs#22835, not in GitHub's own docs).
- `tests/mock-prtg.py` sends `prtg-version` with the map list; check 16 (`window.open` caught: the address, the text, the version, no
  server address). Checked: 16 tests; on github.com (signed in as keeper1306, 2026-11-10) the problem form opened with the text and all four
  version fields filled in (closed without creating). Not checked from inside the extension in Chrome, nor the idea form on github.com.

## Delete box in sight, and choices as pictures in the bars (1.5.94)

- The owner could not delete a map's background item (an item already on the map, at 0,0 1920 x 1080): marking it for deletion staged it
  ("1 change not sent to PRTG yet"), but nothing could be applied, because the box "Also delete the items marked for deletion" (`#xerm`)
  only appeared under the list after Review changes in the side panel, and without it a deletion counts for nothing. Now `#xermrow` sits at
  the top of the review section and shows as soon as an item is marked (`xeStaged`), and the strip over the canvas (`#exbar`) has the same box
  (`#exbarrmrow`, `#exbarrm`), kept in step by `xeBar` and both change handlers.
- The owner asked for the table's "Shown as" (status display) in the floating bar with pictures, and the same for similar settings of other
  objects. `GRPICK` got `tstatus`, `thead`, `scap`, `gcolor`, `ionoff`, `itank`, `ieq`, `icount` and `grPic` their drawings. Bars: the table has a
  new Status menu (Shown as, Dot size, Tint rows, Header style); Status counts' Tiles menu has the caption; the ring gauge's Gauge menu the
  colour; the Industrial menu the style of the kind on screen (`obKey` now includes `TL.kind`). Side panel: `inPick(label,g,get,set)` replaces
  the lists for the same eight choices. Title style and other look settings were left as lists (not asked).
- `tests/mock-prtg.py` serves `/api/mapsettings.htm?type=objectproperties`; new check 15 (mark, tick in the strip, Review, Apply: the item is
  gone). Checked: 15 tests; every type's default file byte-identical to 1.5.93 (11 types); Pill chosen in the bar gives the same file as Pill
  chosen from the 1.5.93 list. Not verified on the real PRTG.

## Background picture (1.5.93)

- The owner asked for a way to upload a background image that the tool adds to the map, with editing options (cut, center,
  expand and others). Build › Background (the panel with the colours) has a "Picture" part: Choose a picture… (`#mapbgipick`,
  hidden `#mapbgifile`), Edit the current one (`#mapbgiedit`, re-opens the picture PRTG shows), Remove (`#mapbgidel`), a thumbnail
  (`#mapbginow`) and `#mapbgimsg`. All the code is in js/07-push.js after `bgPreSync` (`BGI`, `bgi*`, `bgeOpen`).
- PRTG's manual: Map settings › Background Image is a choice "Use a custom background image" / "Do not use a background image"
  plus a file (JPG, PNG or GIF, under 20 MB); PRTG draws it at its own size from the map's top-left (Paessler's KB says the same;
  `exPaintBg` draws it that way). So the editor (`bgeOpen`) always makes a picture of exactly the map's size (`readMapSize`).
- `bgiForm(id)` reads `/controls/objectdata.htm` and finds the field names instead of guessing them: the form's file input, and
  the radio group whose labels mention an image with and without "do not". `bgiSend` sends the whole form (`mapForm`) with that
  radio on "use" and the file (a `File` in `httpMultipart`'s FormData), then reads the map back (`exMapView`) and checks the
  picture's size. Remove sets the radio to "do not use" and checks that no picture is left.
- Editor: Cut (aspect Free / Map shape / Square / 16:9 / 4:3, box with 8 handles), Place (Fill, Fit, Stretch, Original size, Tile),
  Zoom (slider and mouse wheel), position (drag, arrow keys, 3 x 3 buttons, Center), turn left/right, flip across/up-down,
  Brightness, Contrast, Colour, Black and white, Blur, Picture strength, Tint (colour and strength, presets Darker / Lighter /
  Map colour), empty-area colour (the map's own PRTG colour by default), JPG (quality) or PNG (empty areas see-through),
  Start over, Download, and a picture dropped on the preview replaces the one in the editor. Drawn with canvas `filter`.
- `tests/mock-prtg.py` got a made-up radio group (`mapbgpic_`) and file field (`mapbgfile_`), real multipart parsing, the picture in
  `/controls/mapview.htm`, and `/api/mapsvg.htm` gives a size only with mode `{"svg":1}`. Two new checks (14 in all): a 1200x600
  picture, cut square and fitted, arrives as 1920x1080 with the right colours left, right and in the empty area; Remove removes it.
- Not verified on the real PRTG: the real names and labels of the Background Image fields (found by type and label, see above),
  that PRTG accepts the upload this way, how it stores the file, and that the picture appears in the classic and new UI.

## Mockup dashboards 01 to 03 (2026-11-09, no extension change)

- The owner asked why the maps did not have the mockups' elements and to make maps 01 to 03 look like them. Each map is now one
  object that draws the whole mockup (1280 x 900) with live data: `map-studio-mockup-01-noc-overview.htm`, `-02-slos-and-error-budget.htm`,
  `-03-wan-and-bandwidth.htm` in `webroot\mapobjects` (new files, category "Map Studio Dashboards", byte-checked). Source and sensor choices:
  `dashboards/mockups/` (`node gen.js <out>` rebuilds the installed files exactly). The drawing is in a shadow root (PRTG's CSS can't touch it),
  scaled to the item's box; data from `/api/table.json` and `/api/historicdata.json` (with `X-Requested-With`), cached on `window.top`
  (30 s / 5 min / 60 s), so it needs a signed-in PRTG session (the public map page will say "Sign in"). In View Map the map's frame page
  takes the dashboard colour.
- Maps 2204, 2205, 2206: width 1280, height 900, "Scale map view to fit browser size" on, background #0E1218, old items removed, one item
  each (on Local Probe, id 1, at 0,0, 1280 x 900). Backups first: PRTG clones 2224, 2225, 2226 "... (backup before mockup)" with all 17/12/12
  items (`POST /api/duplicateobject.htm` with id, name, targetid=0 and the anti-csrf-token header; GET answered 400).
- Real PRTG facts seen: sensors table columns `status_raw`, `lastvalue_raw`, `message_raw`, `downtimesince_raw` (seconds), `tags` (space or
  comma separated); historic data keys `Traffic In (Speed)` (bytes/s), `Downtime` (per cent per row), `Response Time` (ping, raw ms),
  `Loading Time` (HTTP v2); most sensors have ~6 days of history. Map settings form: `width_`, `height_`, `mapautoscale_`, `bgcolor_`,
  `usebgimage_` (1 "Use a background image" / 0 "Do not use a background image") and the file field `upfile_` (1.5.93 finds these by label).
- What the data can't fill (shown as a note in the mockup's own card): 02 HTTP status mix (no sensor counts status codes), 03 Top talkers
  (no NetFlow sensor: shows the busiest interfaces instead, labelled) and Interface errors (the SNMP Traffic sensors have no Errors/Discards
  channels). 02's SLO goals and 03's link capacities (1 Gbit/s, printer 100 Mbit/s) are set in `gen.js`, not read from PRTG.
- Checked on the real PRTG: all three in classic View Map (`mapshow.htm`). Not checked: the new UI, the public page, a real wall screen.

## After 1.5.92 (no code changes; done 2026-11-09)

- 20 dashboard kits from the owner's 20 mockups (claude.ai Design artifact "20 PRTG Dashboard Mockups", 1280 x 900 boards):
  `Install-NN-*.ps1` and a README in `C:\Users\Administrator\Desktop\Map-Studio-dashboard-kits\`. The generators (`kitspec.js`,
  `kitgen.js`, `design.js`, `inpage.js`) were lost with that session. The kits map each mockup panel to the nearest Map Studio object in a
  Map Studio look (01 Wall display, 02 to 07 Dark card, ...), not the mockups' own colours, fonts, sizes or positions.
- 61 object files installed in `webroot\mapobjects`, hash-checked; three replaced, with copies in
  `Desktop\PRTG Map Studio\mapobjects-backup-1.5.92\` (status-counts-wall-display-up-warning-down, industrial-light-card-state-lamps,
  tile-light-card-stat-tile).
- 20 maps in PRTG, ids 2204 to 2223, "Map Studio NN - Title". Targets: group objects Local Probe 1; ping 2096; status bars the pings
  2096, 2132, 2136, 2137, 2138, 2144; traffic and toplist 2097; CPU and multichannel System Health 1001; memory 2166; disk 1004; SSL
  countdown 2140. Every item checked on its map; View Map only looked at for maps 01, 04, 09, 18 and 19.
- Running the scripts: `powershell -ExecutionPolicy Bypass -File "<path>"`; each ends with "Press Enter to close" (run them one by one or
  with `ForEach-Object`). On this server they say "Unchanged / 0 written".
- Lab PRTG limits seen (not bugs): Top 10 CPU table empty, no NetFlow data in the toplist, the On/off object shows "Off", status bars
  are small and show no names.
- Offered, no answer yet: dark looks give frame titles dark on dark (fixed by hand with #A9B7CA in specs 01 to 07, not in the tool);
  names on status bars; a double-click `.cmd` launcher in packs and kits; the scripts said "PRTG was not found as a service"
  (`Get-CimInstance` for `PRTGCoreService`) although PRTG is installed (they fell back to the right default folder; cause not checked).
- Maps 01 to 03 were rebuilt to look like the mockups on 2026-11-09 (see "Mockup dashboards 01 to 03" below).

## Scaled copy for another screen (1.5.92)

- The owner asked, at push time, for a new map that is a scaled copy of the same map in another size. Owner's choice for a
  different shape: "spread to fill" (spaces stretch, items keep their shape).
- `DASHAPI.scaledItems(W,H)` (js/06-dashboard.js, next to `pushItems`): sx=W/D.w, sy=H/D.h, k=min. The map background (`p.mapBg`)
  fills W x H; frames (not path shapes) and banners stretch (x*sx, y*sy, w*sx, h*sy); everything else keeps its shape (w*k, h*k),
  centred where it was (centre moves by sx, sy). Lines: ends mapped (a glued end keeps its spot on its item, a free end x*sx, y*sy),
  then `lnSetAbs` in design units; live connectors only get thickness and label size x k. Pasted pieces are drawn at their size in
  design units (final / k) and wrapped as `<div style="zoom:k;width;height;position:relative">`, so fonts, borders and padding
  scale; PRTG objects only get the new box (Flexible files rescale themselves). Every item is restored in place afterwards (JSON per
  item), and `itemInner` rebuilds the code panel's HTML.
- js/07-push.js: box `#scbox` at the end of the Push step (`SCSIZES`, `#scsize`, `#scw/#sch` for Another size, `#scname` default
  "<map> WxH", `#scgo`, `#scmsg`); after a successful push it gets class `ask` and asks. `scMake()`: `scCreate` (addmap2.htm like
  `createMap`, keeps the selected map), copies the PRTG map's `bgcolor_` from the pushed-to map (`mapForm` + `/editsettings`),
  adds every item with addobjecttomap + `editCall` (objects whose file PRTG does not list are left out), reads the map back to
  count, and saves a push-history entry for the new map (Undo last push there removes it). No sync record: not kept in step.
- Not copied: the PRTG map's own background picture (a PRTG map setting with an uploaded file) and PRTG map items that are not on
  the canvas (Load and Copy/Paste them onto the canvas first).
- `tests/mock-prtg.py`: addmap2.htm makes maps (ids 3000+) with their own items, `/controls/objectdata.htm` + `/editsettings`.
- Checked against the stand-in server: Title and five columns + lines + Neon plum + tiles, label and a gauge, copied to 1280x1024 and
  3840x2160 (17 items each, background colour copied), drawn and compared by eye; canvas and the pushed map unchanged; 12 tests;
  22 object files unchanged. Not verified on the real PRTG, including whether PRTG keeps the CSS `zoom` in HTML Before.

## Animated or still in packs and names (1.5.91)

- The owner asked for Link styles animated by default, or the pack to ask (animated, still or both), and the same for every object
  that moves. Only two things move: Link styles with `lkAnimOk` (plain dashed, Beads, Chevron, Dash sweep; switch `LK.flow`) and
  the Beacon and Pulse icons (`ICANIM`, switch `IC.animate`). The builder's own default (`blankLK` flow off) was left unchanged.
- Pack dialog: "Animation" buttons Animated (default) / Still / Both (`.pkanim`, `data-anim`), shown only when the pack has
  something that moves; `pkBuild(anim)` makes one file per item, or two for Both (`pkCanAnim`, `pkAnimSet`). Pulse joined the icon pack.
- Names: a Link style with flow on that can move is "Link style - animated <look>, ..."; a Beacon or Pulse with Animate off is
  "Icon - beacon, still". Link style words were shortened so all 1080 combinations stay unique within 64 characters (4 trimmed,
  none alike): plain dashed lines are named by the dash (dashed, dotted, dashdot), Dash sweep = "sweep", Rounded elbow = "round
  elbow", ends "arrows"/"dots" (both), "arrow start", "dot end", "dot-arrow". Before, 19 combinations with end markers shared a name.
- Checked against the stand-in server: Animated/Still/Both give 8/8/13 Link style files (5 with flow) and 10/10/12 icon files
  (beacon/pulse animated or not), all names unique; the builder's Animate switches change the names; pack files equal the
  builder's own; 22 object files identical to 1.5.90 (defaults are not animated); 12 tests. Not verified on the real PRTG.

## Packs (1.5.90)

- The owner asked for predefined objects per object type, in one look/colour set (e.g. PRTG's UI), downloadable together as a script.
  "Download a pack" (`#opack`, next to Add to this list; hidden for Geo map) opens a dialog (`pkOpen`, `.pkbox`) with the pack's files
  (checkboxes), and buttons Download install script (`LIBAPI.installScript` + `LIBAPI.mapDir`, new export), Download ZIP (`LIBAPI.zip`)
  and Add to Your objects (warns when the 60-file list drops old ones). `PACKS` in js/09-objects.js: table 5, gauge 6, graph 8, donut 3,
  sunburst 3, status 3, icon 8, tile 6, ind 7 (key `ind` = Tile with fam ind), links 8; plus the type's Any object (`anyStart`).
- `pkBuild()`: per item, start from a copy of the object on screen, make the item's model (blank/template + field changes, with the
  builder's own helpers: `setFace`, `setGrKind`, `iStyle`, `tileFromPreset`, ...), `lookSet` with the screen's look, the dial background
  (`nbg`) as on screen, `csetPaint(PS.cur)`, automatic name (`obAutoName`; pack tables get short names of their own because PRTG's
  templates give names that collide when cut at 64), text from `codeNow()` (render's dispatch, moved into a function; files unchanged).
  The screen's model is put back afterwards (`pkSet`); render/history are not touched.
- Icons without a card and Link styles have no look in their names, so icon packs in other status colours give the same file names
  (the install script backs up a replaced file). Zip/script names: `<pack>-<look>` (icons: colour set; links: none).
- Checked against the stand-in server: the pack's first item equals the builder's own file for 10 types in PRTG new UI, and for
  7 types in Neon plum and Corporate blue, and the Wall display gauge with Vivid colours; the object on screen unchanged; names unique;
  the 22 object files identical to 1.5.89; 12 tests. Not verified on the real PRTG (no pack installed there yet).

## Plain tile presets (1.5.89)

- The owner removed Light tile and Dark tile from the Map designer's plain Tile (`TSTYLES` in js/06-dashboard.js): they were almost
  the same as the Clean card and Dark card looks. `TSTYLES` keeps only Accent tile; a new tile starts from `TILE0` (the old Light tile
  values, not offered as a preset), so a new tile is unchanged. Tiles saved with those styles keep their colours (`p.style` is only a name).
- Checked against the stand-in server: a new tile's pushed HTML and an Accent tile's are identical to 1.5.88; the Presets menu shows
  only Accent tile; 12 tests. Not verified on the real PRTG.

## Names follow every picture choice (1.5.88)

- The owner asked that every object name its files the way icons and Link styles do (a new choice gives a new name).
  Checked in the builder (every visible picture group of every type clicked through): only three choices did not change the name.
  `amName` now: a sensor graph (not a picture) is "Graph - <chart style>, <period>" (was "sensor, <period>", the style only when
  not area); Bars add their colour mode ("by state", "colourful", "one colour"); a Link style adds "<marker> start" / "<marker> end".
- Every look x period x chart style and every Bars combination fits in 64 characters (no cut, no two choices with one name).
- Object files equal 1.5.87 apart from the name (graphs: header line and the class names made from it); 22 compared; 12 tests.
  So those objects get new file names when made again; files already in `mapobjects` are not replaced. Not verified on the real PRTG.

## Outlined whole-map looks (1.5.87)

- The owner asked for more of the whole-map looks with the columns fully surrounded by lines. `OBJAPI.mapLooks()` now also
  returns an outlined copy of each look (`name` "<look> outlined", `label` the look's name, `outline:true`, `border` = accent,
  frame `bcolor` accent, `bw` 2, no shadow; banner `bcolor` accent, `bw` 2). The picker shows them as a second group
  "Columns outlined in the accent colour" (`.ly-looks-out`); thumbnails draw the outlines thicker.
- Checked against the stand-in server: Neon plum, Executive dark and Clean card outlined drawn; 22 object files unchanged; 12 tests.

## Which dividing lines (1.5.86)

- The owner asked for only vertical lines, or one horizontal on top plus the verticals (columns with several boxes stacked).
  `D.layLineMode`: `all` (default), `vt` (verticals plus the topmost horizontal boundary, i.e. under the title row), `v` (verticals
  only). In `vt`/`v`, `layLineSegs` makes each vertical boundary one line from its first to its last segment. Picker "Which
  lines" (`.ly-lmodes`, `data-mode`, `layModeThumb`) under the line colour/thickness. Not in the saved model.
- Checked against the stand-in server: Title and six tiles gives 4 / 3 / 2 lines for all / vt / v; 12 tests.

## A look for the whole map (1.5.85)

- The owner asked for combinations with predefined backgrounds in the layouts, in the objects' Looks (Neon, Indigo, ...).
- `OBJAPI.mapLooks()` (js/09-objects.js): every look in `LOOKORDER` except PRTG default, as {name, dark, accent, card, border,
  bg, frame, banner}: `bg` is a glow gradient (`base` = the look's `stage`, `g2`/`g3` = accent and link, `str` 40) for dark
  stages (`readableOn`), a plain colour otherwise; `frame` = `lookToFrameP(n,'frame')`; `banner` = `OBJAPI.bannerLooks()`.
- In js/06-dashboard.js: `D.layLook`, `mapLookOf(n)`, `layLookApply(n)` (sets the map background with `bgSet`, turns the cell
  frames on and restyles them, styles the title banner, recolours the dividing lines to the accent), `layLookThumb(ML)`,
  picker "Look for the whole map" (`.ly-looks`, `data-look`) in the "On the canvas" box. A new title banner takes `D.layLook`.
  Picking a frame look from the old list clears `D.layLook`. `layFramesSync` skips cell 0 of a title layout (no frame
  around the banner).
- Checked against the stand-in server: Neon plum, Indigo board, Light card drawn; switching to another title layout keeps the
  look; push of Title and four columns + lines + Neon plum added 12 items (background, banner, 5 frames, 5 lines); 22 object
  files unchanged; 12 tests. Not verified on the real PRTG.

## Title banner layouts and dividing lines (1.5.84)

- The owner (screenshot of an "MSP Customer Status" wall map with blue lines between the columns) asked for dividing lines as a
  layout option, more layouts with a title space on top, and the banner put in automatically for editing.
- `LAYOUTS` got ten entries appended (indexes of the old ones unchanged: the New map form keeps them by number) with a fifth
  element `{banner:true}`; the first cell is the title row (1/9 or 1/10 of the height). `layT()`, `layHasBanner(T)`. Group
  "With a title banner" first in `LYGROUPS`. Thumbnails draw the title cell dark with a white bar (`layTitleCell`).
- `layBannerEnsure()` makes one banner item (`p.layBanner`, style Dark, "Dashboard title") if there is none; `layApply` selects a new
  one and `layFill` puts it in cell 0 before the other items. `DASHAPI.newMapCanvas` does the same for the New map form.
  `LAYBMADE` holds "just made" so nothing extra is saved on the item.
- Dividing lines: `D.layLines`, `D.layLineColor` (#3B82F6), `D.layLineW` (3). `layLineSegs()` finds the shared edges of the cells
  (grid units, merged per x or y), in the middle of the gap; `layLinesSync()` replaces the `p.layLine` line items (straight
  `frame` shape lines, `matchLS:false`); `layApply`/`laySpacing` resync them; `layItems()` leaves them out. Checkbox and colour/
  thickness in the "On the canvas" box (`#dlaylines`, `#dlaylinecol`, `#dlaylinew`). Not in the saved model: the box ticks itself
  when the canvas has such lines.
- Checked against the stand-in server: five columns + title = 5 lines (one under the title, four between columns), switching to
  three columns 3, gap 60 kept them, Two columns 1, off 0; one banner throughout; push added all 6 items; 12 tests.
  Not verified on the real PRTG.

## Two Link styles on one map (1.5.83)

- The owner: two Link style items on a map crash everything. Reproduced on map 2203 (a second item, subid 15, added through the
  designer's own `addToMap` + `InitMapObject`, without its size save): the designer was fine, opening View Map froze Chrome (the
  Claude extension and the device bridge dropped). Reproduced in Playwright: two Link style scripts run in one go crash the page.
- Cause: the second script calls `window.__mls.stop()` on the first, but the first one's draw was already queued as a microtask; it
  ran afterwards, re-attached its MutationObserver (`if(mo)watch()`), and the two observers redrew each other forever.
- Fix in `mlsRuntime`: `dead` flag set by `stop()` (draw and schedule return), and the observer ignores childList records whose
  added/removed nodes are all `g.mls-g` or `linearGradient` (`mlsNode`). Last one to run wins.
- An old file plus a new one still loops (the old copy has no `dead`), so all six installed `map-studio-link-style-*.htm` were
  patched in place on 2026-11-08: only the runtime text replaced, config and everything else byte-identical; originals kept in
  `Desktop\PRTG Map Studio\link-style-backup-1.5.82\`; all checked byte for byte. Playwright with the patched files: no crash,
  one `g.mls-g`, clock continuous over three refreshes.
- Then checked on the real PRTG (map 2203 with both items, classic View Map in a fresh Chrome tab): one `g.mls-g`, alive across a
  refresh, clock continuous (14.7 -> 46.8 s); the public page too. A tab that froze earlier stays frozen (close it, don't reuse).
  The test item (subid 15) was removed again with the designer's own `DeleteMapObject`; the map has its one Link style (subid 14).

## Link style choices as pictures (1.5.82)

- The owner asked for pictures instead of words in the Link style's Line type list. `lkPic(kind,v)` (kind `line`, `dash`,
  `start`, `end`; 64x44, two item boxes for line types) and `lkPicGrid(kind,list,get,set,done)` (same chips as `grPicGrid`,
  `.grpick`, `syncPick`) replace the selects for Line type, Line style and the two markers in the side panel and the bar
  (Shape, Line and Ends menus are now `fb-wide`). Files unchanged (default Link style file identical to 1.5.81; 22 others too).

## Animations keep running across PRTG's refresh (1.5.81)

- Seen on the real PRTG (map 2203, classic View Map, Link style with chevrons): every ~30 s PRTG replaces the whole map view,
  `#mapsvg` included (`document.getElementById('mapsvg')` is a new element, `getCurrentTime()` back to 0). SMIL times count
  from the outermost `<svg>`'s own clock, so every animated line (Link style and Connectors) snapped back to its start.
- `msClock(svg)` in `mlsRuntime` and `connLiveRuntime`: one clock `__msClock` (Date.now at first run) on `window.top` when
  reachable (the public page reloads its iframe, the top page stays), and each new `#mapsvg` gets `setCurrentTime(now-clock)` once
  (`svg.__msClk`). Checked on the real map by setting it from the console: across a refresh the first chevron went
  911 -> 993 -> 1072 px instead of restarting. Playwright: a replaced svg went on at 3.33 s (1.5.80: 0.30 s).
- Installed Link style files and pushed Connectors carry their own copy of the code: make/install and push again.

## Stock icons and Link style names and box (1.5.80)

- The owner: picking a PRTG stock icon template left no preview ("No preview for PRTG\u2019s own icons", with the escape shown
  as text) and no floating bar, so there was no way back to another template; the Templates menu showed the same three dots
  for every stock icon. Now: `stkHTML(raw)` fills the template's own markup with sample values in the shapes PRTG outputs
  (checked on PRTG 26.3 through `/controls/mapobjectpreview.htm`: a count is `<a class="sensorlink(red|warn|green|paused)">
  <div class="sens(r|y|g|b)">N</div></a>`, zero counts left out, `colorclassofstate` gives `map_iconcolor_has...` on a group),
  drawn with Map Studio's own CSS `STKCSS` (`.stkv`; own glyphs, not PRTG's `prtg-icons` font, the repo is public). Used for the
  preview and the Templates pictures (`stkThumb`, from `pvThumb`). `<@...>` must be removed before the `<#...>` tags.
- When connected, `stkLive()` shows PRTG's own drawing under it through `PUSHAPI.livePreview(frame,file,{w,h,kind,name})` in
  `js/07-push.js` (the designer's request, on the map chosen under Existing PRTG maps or the first map, and the default
  target; `pvDoc` content mode, `prtgCss`). `customStatusDot-*.htm` are not on every server ("File ... not found!" is reported).
- `obBuildStock()`: the bar for a stock icon is the scope buttons and Templates only; `obOk()` no longer excludes stock icons.
- Link style: `amName` puts the line look first ("Link style - beads, curve"; dash only for plain). `lkChipSvg(L)` draws the
  line in its look (96x24) inside `.mls-chip`; `linksCss` shows the chip in `#mapeditor`, `.mapobjectpreviewcontainer` (the
  wrapper of PRTG's preview answer) and `#pvhost` (Map Studio's preview frames), hidden elsewhere. Not verified on the real PRTG:
  that PRTG's designer list keeps `.mapobjectpreviewcontainer` around the hover preview.
- Checked: 12 tests; the 22 other object files identical to 1.5.79; stock icon files unchanged (PRTG's raw file).
- The "weird" View Map animation was found and fixed in 1.5.81 (below).

## Link style on the public map page (1.5.79)

- Seen on the real PRTG (map 2203 "Global", public link `/public/mapshow.htm?id=2203&mapid=...`): the Link style's script
  ran (`window.__mls`, `#mapsvg.mls-on`) but restyled nothing. The public page is `webroot\public\mapshow.htm`, which loads
  `mapshow_simple.htm` in an iframe and refreshes by loading a new iframe; its own `createLine()` gives the lines the class
  `connectionlineGradient` (the classic View Map uses `connectionline`, `_Prtg.Maps.js` `calcNewConnection`). Gradients carry
  `connectionlineGradient` too, so the runtime selects `line.connectionline,line.connectionlineGradient` and `linksCss` hides both.
- Checked on that public page in Chrome by running the patched script in the page (not saved): six beads lines, curved.
- SMIL check (Playwright): an `<animate>` inserted later keeps the same phase as one that was there from the start, so a
  redraw does not restart the beads.

## Link style looks, preview and bar (1.5.78)

- The owner asked for the Object builder's Links to have exactly the Connector looks, a preview that shows the object as in
  PRTG and just says "Drop anywhere on the map", and a floating bar.
- `LK.lnlook` (also in `LK_VKEYS`/`LK_DEFAULTS`, default `plain`; `LK.look` stays the object's Map Studio look). `lkLook(L)`,
  `lkAnimOk(L)`. `lkCfg` adds `look` and `sp` (speed from `flowSec`, as `lsSpeed`) only for a look other than plain, and
  `lkScript` then wraps the file's script as `(function(){var mkLook=...;(mlsRuntime)(cfg);})();` so `mkLook` stays out of
  the page's globals. In `mlsRuntime` a look draws through `mkLook`; `ends(paint)` takes the two end colours from the first and
  last stop of the PRTG line's gradient (or its one colour). Markers use those colours. Dash, glow and round ends are hidden
  with a look (as for Connectors); Animate shows for dashed plain lines, Beads, Chevron and Dash sweep.
- The file's `.mls-chip` (seen only in PRTG's map designer) now says "Drop anywhere on the map" (was "Link style"). The preview
  draws that chip over the sample map; the sample map is `.map_object.lk-demo`, which `obRoot()` uses for the bar.
- `obBuildLinks()`: Look (picture grid, `fgal`/`fgtile`, `lookThumb`), Shape, Width, Line, Color, Ends, Motion (hidden when
  nothing can move). `obOk()` no longer excludes links. CSS `#obar .pf[hidden],#obar .fb-m[hidden]{display:none}`.
- Checked against the stand-in server: plain files differ from 1.5.77 only in the chip text and the runtime's new (unused for
  plain) code; the scripts for six looks ran on a PRTG-like `#mapsvg` (a gradient line and a one-colour line) without errors;
  the 22 other object files are identical to 1.5.77; 12 tests pass. Not verified on the real PRTG: the looks on a live map,
  whether PRTG's lines use a gradient there, and the chip in the map designer.

## Names stay automatic after Add (1.5.77)

- The owner found an icon's file name (as used in the install script) not following a changed icon. Cause: `askNames()` (the
  "Name this object" dialog behind Add to this list) set `m.nameUser=true` and `m.fname` on every Add, so `obAutoName()` and
  `fileNameOf()` were frozen from then on (checked: shield, then flag and hexagon all stayed `map-studio-icon-shield.htm`).
  Now `go()` sets `nameUser` only when the name differs from what was offered, and stores `fname` only when it was edited or
  was already set. Applies to every object type. Objects frozen before keep their names until both fields are emptied.
- Checked in the builder against the stand-in server: shield, Add, flag, Add, hexagon gave three file names; a typed name stays.

## Connector colours on Map Studio icons (1.5.76)

- Seen on the real PRTG (amer.prtglab.com, map 4823 "Global Status", shield icons on groups/devices, three connectors with
  `colorMode:'status'`, look `beads`): every line drew in the fallback grey `#9aa4af`. A Map Studio icon on a probe, group or
  device carries PRTG's rollup flags on the item itself (`map_objectstate_hasred ... map_objectstate_hasgreen`, `hasno...`
  for the rest) and no inner label, and `statusColor()` in `connLiveRuntime` only read `map_objectstate_sens*` on the item and
  `map_iconcolor_has*` on an inner label. It now also reads `map_objectstate_has<colour>` on the item (worst first, `ICOLORDER`).
- Checked on that map by running the new runtime in the page (not saved): two lines red, one half green half red, as the
  shields are. A connector's code is in its pushed HTML, so lines already on a map change only after the map is pushed again.
- How the lines were read: `/controls/mapview.htm?id=N` still has each connector's `data-msln` (base64 of the runtime and its
  JSON config); the live page drops the `<img>` once it has run.

## Banner looks (1.5.75)

- The owner found the Map designer's banners missing the Looks every other object has. `OBJAPI.bannerLooks()` (in
  `js/09-objects.js`, read at click time from `fbPresets()` in `js/06-dashboard.js`) maps each look in `LOOKORDER` to banner
  settings: looks with `titleStyle:'bar'` (PRTG default, Corporate blue, Light card, Dark card, Wall display) give the bar
  colours (`titleBg`/`titleColor`); the others the card fill, border, shadow, `titleText` and `muted`; plus `font`.
  The banner's Presets show "Colours" (`BSTYLES`, unchanged) and "Looks"; `p.style` is set to the look's name.
  Frames, backgrounds and shapes already had the Looks through the Object builder (`lookToFrameP`); tiles still have only
  `TSTYLES` (not asked). Checked on the stand-in server only: five looks applied and pushed; object files unchanged.

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
- 1.5.74, seen by the owner on the real PRTG (maps "WallDisplay", "WallDisplay Device", "WallDisplay Sensor", 2202):
  on View Map all six Any objects were right on Root, a device (Proxmox) and a sensor, so the files work. The Map designer
  canvas was wrong for the gauge, graph, icon and tile on Root and the device ("4 of 5 sensors up"): its preview asks
  `/controls/mapobjectpreview.htm` with `count=5` (`pvCountFor`, as PRTG's designer does), which cuts the sensors table to 5
  rows, except for names matching `CFG.preview.countPattern`. That was 'count|donut' (so status counts and donuts were right);
  now 'count|donut|sunburst|any.object' (category "Any object", name or file "any object"). Sunbursts had the same cut.
  The fix itself was not re-checked on the real PRTG.
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
