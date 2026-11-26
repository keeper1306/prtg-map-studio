# Self-styling objects (experiment)

Test objects, **not part of Map Studio**. The extension does not load or build anything from this folder.

Each one is a PRTG map object file (`map-studio-zz-<type>-self-styling.htm`, category "Map Studio Tests" in PRTG's Map Designer)
with a small gear on the map. The gear opens a floating bar like Map Studio's, right on the map:

- **Save for everyone** writes the choices into the map item's HTML Before (`<i class="mst-cfg" data-c="...">`, through PRTG's
  own `editmapobject` call); **Only on this browser** keeps them in this browser.
- Every saved choice is checked against the known values before it is used; anything else is ignored.
- **Public links** get the gear only when the shared setting allows it, and then can change only their own screen.
- **The size outline** (8 handles) changes the item's size, which is saved with Save for everyone.
- **Fixed | Flexible:** Flexible grows and shrinks with the box, and the title keeps its size.
- **No gear in the Map Designer** or its hover preview.
- **Without a script**, PRTG still draws the object (its default look).
- Every line is under 900 characters, and the files are ASCII only.

## What is where

- `types/table`, `types/graph`: the first two objects, written by hand (CSS variables). The table has Fixed | Flexible as Map
  Studio's tables do: text, row spacing and dots follow the box, the title keeps its size, the text never goes under 12 px.
- `types/<other>`: the objects made from Map Studio's own builders. `type.js` names the builder and the options (with the
  values they may take); `menus.js` is the object's own menu in the bar.
- `common/`: what every object shares:
  - `core.js`: which item it is, saved settings, checks;
  - `save.js`: Save for everyone;
  - `sizer.js`: the size outline;
  - `bar.js`: the bar, the Save menu and Fixed | Flexible;
  - `tail.js`: start and gear;
  - `kit.js` and `kitbar.js`: running Map Studio's builder on the map, and the Looks, Colors and Title menus.
- `tools/`:
  - `build.js` builds the files: `node tools/build.js [table graph gauge ...]`.
  - `extract.js` and `kitrun.js` copy Map Studio's code out of `extension/js/09-objects.js`. They take the region marked PURE2
    plus a few helpers, with everything those use.
  - `compare.js` checks that the copied code builds byte for byte the files Map Studio itself builds. It uses the real
    extension in a test browser.
  - `harness.js` is the stand-in check: a fake PRTG map page with sample data.
  - `install.ps1` copies built files into `webroot\mapobjects` on the lab VM, keeping a copy of what it replaces and comparing
    the written file byte for byte.

How a Map Studio type works on the map: the object file is Map Studio's own file for the default settings. A change in the bar
builds the file again with Map Studio's own code, inside the page. From that build it takes what can change on a map without
PRTG: the CSS, the classes, the title, and the settings its drawing code runs with. Then it runs that drawing code again, after
switching off the watchers the last run started.

## Checking

```
node tools/compare.js            # copied code = Map Studio's own files (every type x 15 looks)
node tools/build.js
node tools/harness.js table      # one type at a time
```

What was checked on the real lab PRTG is noted per object in `docs/HISTORY.md` (search "self-styling").
