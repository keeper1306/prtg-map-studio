# PRTG Map Studio - notes for Claude

Read this file first in every session. It is short on purpose: Claude Code loads it every time.

## The archive: docs/HISTORY.md

`docs/HISTORY.md` (about 190 KB) holds the long notes: what was measured on the real PRTG, and one
section per release since 1.5.x, newest first, each headed with its version, e.g. `(1.15.7, 2026-11-19)`.
It is not loaded automatically. Don't read it whole: search it (`grep -n`) for a version number, an
object type, a function name or a map number, then read only that section.

Search it **before**:
- changing an object type or a function: what was decided for it, measured, and left unchecked;
- trying something on the real PRTG: it may already have been measured (tags, preview endpoint,
  what PRTG does to HTML Before, the hover preview, the new UI);
- proposing an idea: it may have been tried and undone, or rejected by the owner;
- answering when the owner mentions an earlier version, a map number or "what we did with ...".

If this file and the archive disagree, this file wins: the archive keeps old rules as they were.

After every release, add a short section at the top of the archive's release notes (what changed, what
was checked, what was not checked on the real PRTG). Change this file only when a rule, a decision, a
solved problem or the pending list changes.

Claude commits and pushes every new version to GitHub itself (how: sections 3 and 7). The one limit is
on what goes *inside* the files: **this repository is public**, and its ZIP (the update notice's Download)
is what users get, this file included. So never write server addresses, domain names, host names, IP
addresses, people's names, customer names, passwords or tokens into any file here. Write "the owner's lab PRTG", "the lab VM" or
"a shared lab server" instead, and ask the owner when a real value is needed.

The owner is not technical. Explain things in plain words, give step-by-step instructions when they
must do something themselves, and avoid asking them to run git or copy files.

## 1. What it is and what it is for

PRTG Map Studio is a Chrome extension (Manifest V3) that designs PRTG maps and builds PRTG map objects:
tables, gauges, graphs, donuts, sunbursts, status counts, icons, tiles, Industrial (OT) objects, fence,
line, map directory, link styles, plus layouts, backgrounds, banners, frames and connectors. It connects
to a PRTG server the user is signed in to, pushes the design into a map, and can undo a push.

The owner uses it to build impressive maps for demos with PRTG customers. So what matters most is that
maps look good and work on the real PRTG (classic View Map, Map Designer, hover preview), not only in
the builder.

## 2. How the code is organised

```
extension/            the extension itself; no build step, no dependencies
  manifest.json       version number lives here (and only here)
  background.js       opens app.html when the toolbar icon is clicked
  app.html            the whole page and its CSS; loads js/ in number order with defer
  preview-sandbox.html  manifest "sandbox" page: draws PRTG's preview answers (which carry inline scripts)
  js/01-config.js     CFG, the changelog (CFG.changelog), the refresh bar, the update notice (MSUPD)
  js/02-tabs.js       TABS
  js/03-linkstyle.js  connector line looks (LKDEF)
  js/04-page.js       label/button tool, folding sections, preview; DASHAPI/OBJAPI placeholders
  js/05-info.js       the "i" notes
  js/06-dashboard.js  Map designer: canvas, layouts, backgrounds, connectors; fills DASHAPI
  js/07-push.js       connect, push, Undo, existing maps, background picture, feedback; PUSHAPI
  js/08-library.js    "Your objects", install script, ZIP; LIBAPI
  js/09-objects.js    Object builder: every object type, looks, packs; fills OBJAPI
  js/10-dashtabs.js   Map / Design / Push tabs
  js/11-start.js      buildPresets(); render();  (must stay last)
  icons/, img/        PNGs
tests/                stand-in PRTG server (mock-prtg.py) + Playwright checks (run-tests.js); not shipped logic
dashboards/mockups/   generator for the three "mockup" dashboard objects (node gen.js <out>)
.github/ISSUE_TEMPLATE/  problem.yml and idea.yml (the in-tool Feedback button fills them)
docs/HISTORY.md       long notes, measurements and release details
```

The js files are plain scripts sharing one global scope (no modules). A top-level function can only be
used after its file has run, so keep the load order. `CFG.version` is read from `manifest.json` at startup.

Two kinds of output, and why both exist:
- **Map items** (labels, frames, banners, lines, backgrounds, connectors) are pushed as PRTG Custom HTML
  items. No install needed, but PRTG strips `<script>` from an item's HTML Before (it shows as text).
- **Object files** (`.htm` in PRTG's `webroot\mapobjects`) get PRTG's tags (`<#...>`, `<@...>`), so they
  show live status and can carry scripts. They must be installed on the PRTG server first.

## 3. Installing and testing on the lab PRTG (VM 102)

The lab VM runs PRTG and Chrome. Paths there:
- Extension folder Chrome loads: `C:\Users\Administrator\Desktop\PRTG Map Studio\extension` (not a git repo).
- PRTG: `C:\Program Files (x86)\PRTG Network Monitor` (`webroot\mapobjects` for object files,
  `webroot\images` for pictures, `Custom Sensors\EXE` and `EXEXML` for test sensors, `lookups` read only).
- Claude Code runs on this VM itself, with a real shell: it can run git and the tests here and copy files
  straight into the extension folder and `webroot\mapobjects`.
- The git clone is `C:\Users\Administrator\Documents\prtg-map-studio`, on `connectors` (brought up to date
  on 2026-11-26). Run `git fetch origin` before starting work; another session may have pushed meanwhile.
- The old `app.js` is still in the extension folder, unused. Ask the owner before deleting it.

**Releasing a change to the extension** (done directly, no pull request, no asking first):
1. Bump `"version"` in `extension/manifest.json` (rules in section 7).
2. Add a changelog entry at the start of `CFG.changelog` in `js/01-config.js`: one string, newest first,
   `'1.15.8: What changed. 1.15.7: ...'`. Apostrophes as `\u2019`; write it with Node or an editor
   (GNU `sed` turns `\u2019` into the real character).
3. Run the tests (below). Commit, push `connectors`, then `git push origin connectors:main`.
4. Copy every changed file into the VM's extension folder and confirm each is byte-identical by hash.
   Then tell the owner: **refreshing the Map Studio tab is all they need**. Only a change to
   `background.js` or to the manifest beyond its version needs a reload in `chrome://extensions`; say so.

**Installing object files**: Map Studio's install script (PowerShell, run as administrator on the PRTG
server) or the ZIP copied by hand into `webroot\mapobjects`. Chrome cannot write into Program Files, which
is why it is a script. New and changed files show in the Map Designer without restarting PRTG.
Claude may write object files into `webroot\mapobjects` directly (owner's rule): never delete or replace
anything PRTG itself put there, keep a copy of a Map Studio file before replacing it, and read every
written file back and compare it byte for byte.

**Tests** (needs Node.js 22+, Python 3, Playwright's Chromium; installed on the VM):
```
cd tests
npm install
npx playwright install chromium
node run-tests.js
```
About 5 seconds; every check must say PASS. Run them after any change to push, Undo, storage, the load
order or the files in `extension/js/`. If a port is taken, an old `mock-prtg.py` is still running.
For changes to object builders, also check that every other object file is byte-identical to the
previous version (how: `docs/HISTORY.md`, 1.15.2 section, "How the files were checked").

**On the real PRTG**: the stand-in server proves nothing about PRTG itself. Say plainly what was not
checked on the real PRTG (classic View Map, Map Designer canvas, hover preview, new UI, public map link).
Throwaway test maps on the lab PRTG: 2231 (default table, four items), 2252 (quotes), 2241 (machine state).
Claude never types the owner's PRTG username, passhash or password; use the tab where they are signed in.

## 4. Technical decisions and why

- **No build step, plain scripts, numbered files.** The owner can't maintain a toolchain; `app.js` was
  split into regions at 1.5.44-1.5.53 without changing a character.
- **Status colours are always PRTG's own** (up `#B8C419`, warning `#F5C500`, down `#E30613`, unusual
  `#F59C00`, paused `#477EC0`, unknown `#878787`). A look never changes them; only the Colors menu does.
  New objects start in the Corporate blue look.
- **Object files draw something without a script** (status from PRTG's tags, coloured by CSS from a
  class with Map Studio's own `prefix`), because PRTG's designer and hover preview may not run the
  script fully. View Map then refines the drawing with the script.
- **Every line of an object file stays under 900 characters.** A line of ~5000 makes PRTG fill in
  none of the file's tags.
- **Quotes go to PRTG as `&quot;`** (`qfix` in 07-push.js): PRTG turns every raw `"` in HTML Before into `'`.
- **API calls send `X-Requested-With: XMLHttpRequest`**: without it PRTG answers 401.
- **The hover preview cuts tables to 5 rows** (`count=5`); objects that count sensors fetch the full list
  when inside `.previewloading`.
- **Gauges work only on sensors** (1.8.1): only a sensor has one value against a range. Status counts
  and donuts cover groups and devices.
- **The default table works on probe, group, device and sensor** with CSS only, so it shows in the
  designer too. It is Fixed by default and its height follows the rows; text is never below 12 px.
- **Graphs: one starting point, no template lists** for graphs, gauges, sunbursts, tiles, Industrial:
  the templates only repeated the objects' own choices. The owner wants the tool simple.
- **New versions arrive with a tab refresh**, not a self-reload: an extension that reloads itself never
  came back in testing.
- **Update notice** reads `manifest.json` on `main` from raw.githubusercontent.com and only shows a button
  when the first or middle number goes up.
- **The sync record and push history are keyed by the exact server address.**
- **Line endings are LF**, no `.gitattributes`; git on the VM uses `core.autocrlf=false`, or hashes won't match.

## 5. Problems already solved - don't repeat them

- Two Link style items on one map froze Chrome (observers redrawing each other). Fixed with a `dead`
  flag and ignoring Map Studio's own nodes (1.5.83). Any script that watches `#mapsvg` must do the same.
- PRTG replaces the whole map view about every 30 s, which restarted SMIL animations. One clock on
  `window.top` (`msClock`) keeps them running (1.5.81). Scripts must expect to run again on every refresh.
- PRTG renames `.prtg-plugin` to `.prtg-plugin-initialized`: select `[class*="prtg-plugin"]`.
- PRTG's table cell padding beats the look's rules: the look's padding needs `!important`.
- PRTG's stylesheet already styles classes like `sensg`: put states in Map Studio's own prefixed class.
- The floating bar showed above the Connect window: hidden while `#prtgpop.gate` is open (1.15.5).
- Names froze after "Add to this list": only freeze a name the user really edited (1.5.77).
- Picking the Wall display look (text 18) must scale the object's size too (`lookSet`).
- Writing a file to the VM through the bridge with a reused staged path can write a stale copy:
  stage under a fresh name, then read back and compare.
- Another session may have released meanwhile (1.15.4 was taken twice): `git fetch` before bumping.
- Undone on purpose, don't redo unasked: the Any gauge as default (1.5.111, owner said it "messed up"
  something, never said what - ask first), gauges on probes/groups (1.7.0/1.8.0), forcing the PRTG UI
  colour set, Looks for tiles and traffic lights (mockup rejected), graph toplists (1.8.5).
- Rewriting git history to remove old internal details was offered and declined (it breaks every clone).

## 6. Pending work

Agreed order of the OT plan (ask before starting each):
1. "Last updated" time on other objects (tiles, process value, lamps), reusing the 1.12.0 badge.
2. OT symbols for the Status icon (PLC, RTU, HMI, SCADA server, industrial switch, gateway, robot, CNC,
   cabinet, firewall, engineering workstation; own drawings).
3. Pipe flow direction on Line, instrument symbols on Process value. (Geo map markers: not doable.)

Pictures from `webroot\images` with a server-side script ("option B"): PRTG serves files from
`webroot\images` (seen at `/images/<file>`) but not from `webroot\mapobjects`. Today a map background
picture is uploaded through PRTG's own Map settings (1.5.93). Parked by the owner on 2026-11-26 ("not
needed now"): the Map settings upload is enough. Don't start it unasked.

Self-styling objects (test files in `experiments/self-styling/`, see its README): a table and a graph object with a gear that
opens Map Studio's floating bar on the map itself, saves the look into the item's HTML Before
(`editmapobject`), keeps a per-object choice for public links, and (v4) resizes the item with an
outline and 8 handles. Not checked on the real PRTG. Asked next: the gear in PRTG's Map Designer too
(risk: the designer may send back its old copy of HTML Before), moving the item, Fixed/Flexible for the
table. The copy of the table in `webroot\mapobjects` is older than the one in the repo.

Offered, no answer yet:
- Refuse http:// connections except localhost, drop `http://*/*` from the manifest (needs a reload),
  decide about the camera tile's http:// address.
- Build the six "PRTG update test maps" in PRTG and record a "before" list of files with hashes.
- Machine state in the floating bar; a fault channel on other symbols.
- The bar covering the preview at 1280 x 720 ("not now").
- GitHub Releases with a ZIP (would also count downloads).
- Group status colours on Map directory wall buttons; "add the directory to all maps".
- Brand `.htm` files not yet in the builder (Radial gauge, Section backdrop, Text box, Weather widget;
  the NetFlow, SNMP Trap and Syslog ones hold placeholder credentials and are not ready). Not in the repo.

Known issue (left on purpose): connecting to the same PRTG through two addresses (classic and new UI)
makes Map Studio see two servers; Review shows pushed items as new and Undo is not offered.

## 7. Working rules

- Work on the `connectors` branch. Release by pushing `connectors`, then `git push origin connectors:main`.
  Never merge into an old local `main`. GitHub prints "Bypassed rule violations ... must be made through a
  pull request" for `main`: expected.
- Commit as keeper1306 (`keeper1306@users.noreply.github.com`). End every commit message with
  `Co-Authored-By: Claude <model actually running> <noreply@anthropic.com>`.
- Version numbers: the **last** part for a fix or small touch; the **middle** part (new line at `.0`) for
  something new the owner would tell people about, which is also what makes the update notice appear;
  **2.0** is kept for the first public release.
- Don't guess: check, or say "I have not verified this". Ask for access instead of working around it.
- Measure cost, not only speed (API calls per refresh, file size).
- Ask for every permission the session needs at the start, in one go (folders on the VM, GitHub,
  the browser tab signed in to the lab PRTG), then say in one line what was granted.
- Keep changes small and byte-identical elsewhere: when one object type changes, the other object files
  must not.

## 8. Open questions for the owner

Answered: Claude Code runs on VM 102 itself (section 3); the self-styling sources are in
`experiments/self-styling/`; Chrome loads the extension unpacked from the Desktop folder (checked in
Chrome's profile, 2026-11-26); pictures "option B" is parked (section 6); `CONTRIBUTING.md`'s pull request
rules are for outside contributors only, and this project's own releases stay direct (2026-11-26).
For demos the owner picked all four groups as equally important: tables; gauges and graphs (with donuts
and sunbursts); tiles and status counts; Industrial (OT). No order among them, and no maps named yet.

None open right now. Add new questions here.
