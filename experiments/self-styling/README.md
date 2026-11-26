# Self-styling objects (experiment)

Test objects, **not part of Map Studio**. The extension does not load or build anything from this folder.

They are two PRTG map object files, a table and a graph. Each has a small gear on the map. The gear opens
Map Studio's floating bar right on the map, and saving writes the chosen look into the item's
HTML Before (`editmapobject`). A per-object setting covers public map links, and the item can be
resized with an outline and 8 handles (v4).

**Not checked on the real PRTG yet.** They were only tried against stand-in pages in a test browser.
Classic View Map, the Map Designer, the hover preview, the new UI and public map links are all unverified.
The copy of the table installed on the lab PRTG is older than the one here.

## Files

- `map-studio-zz-table-self-styling.htm`, `map-studio-zz-graph-self-styling.htm`: the finished object
  files, as they would go into PRTG's `webroot\mapobjects`.
- Table: `build.js` makes the table file from `runtime.js` and `style.css`. `runtime.js` already holds
  `head.js`, `save.js`, `sizer.js`, `ui.js`, `g-menus.js` and `tail.js`, pasted in by hand. Those
  pieces are kept as separate files, but the build does not read them.
- Graph: `build-graph.js` makes the graph file from `g-head.js`, `graphRuntime.js`, `save.js`,
  `g-ui.js`, `g-tail.js` and `g-style.css`, and reuses parts of `build.js`. `g-ui.js` already holds
  `sizer.js`, `ui.js`, `g-menus.js` and `g-row2.js`.
- `checks/`: Playwright scripts that load an object file into a fake PRTG page and take screenshots.

## Known gaps

- `build.js` and `build-graph.js` read the looks from `/tmp/looks.json`, which is not in this folder.
  It was exported from the extension's looks when the files were made. Recreate it before rebuilding.
- The scripts in `checks/` load Playwright from a fixed path on the machine where they were written.
  Point that `require` at `tests/node_modules/playwright` before running them.
