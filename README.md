# PRTG Map Studio

An unofficial Chrome extension for building PRTG maps. You design map objects
and whole dashboards on a canvas, then send them to a map on your PRTG server.

- **Object builder** — make your own map objects with live previews: tables,
  gauges, graphs, donuts, sunbursts, status counts, status icons, tiles,
  industrial objects (lamps, tanks, equipment, process values, countdowns),
  geo maps and link styles. Each comes in ready-made looks and colour sets, and
  is saved as a file PRTG can use. **Download a pack** gives you a whole set of
  one object type at once, with an install script.
- **Map designer** — open a map, arrange objects, labels, buttons, banners,
  frames, shapes and connector lines on a canvas, with ready-made layouts and a
  look for the whole map, then push the result to PRTG. You can also change the
  items already on a map, and set the map's background colour or picture.

## Which PRTG versions it works with

PRTG Map Studio was built and tested with **PRTG Network Monitor 26.3.124.1728**.
It works with both the **classic web interface** and the **new PRTG UI**: maps
you build show up in both. Most of the testing was done in the classic
interface.

Map Studio uses parts of PRTG that are not a documented, stable interface: the
map designer's own requests, the map settings form and the files in
`webroot\mapobjects`. Paessler can change these in any update, so **a newer (or
older) PRTG version may break some or all of Map Studio.** If something stops
working after you update PRTG, please press **Feedback** in Map Studio (or
[open an issue](https://github.com/keeper1306/prtg-map-studio/issues)) and say
which PRTG version you have.

Use it at your own risk, and keep a copy of important maps before changing
them. (In PRTG you can clone a map first.)

## How to use

### 1. Install the extension

1. Download or clone this repository.

   > **Only official copy:** `https://github.com/keeper1306/prtg-map-studio`
   > is the only official source of PRTG Map Studio. The extension asks for your
   > PRTG username and passhash, so a modified copy could steal them. Do not
   > install it from anywhere else, and be careful with forks or copies shared
   > by other people.
2. In Chrome, open `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the `extension/` folder.

To update later, replace the files with the new ones and press the round
reload arrow on PRTG Map Studio in `chrome://extensions`.

### 2. Open it

1. Click the PRTG Map Studio icon in the Chrome toolbar (use the puzzle-piece
   menu to pin it if you cannot see it).
2. The app opens in a new tab.

### 3. Connect to PRTG

1. Enter your **PRTG server address**, for example `prtg.example.com` or
   `https://192.168.1.10:8443`. If you leave out `https://`, it is added for you.
   **Use `https://`.** If you type an address that starts with `http://`, the app
   shows a warning, because your username and passhash would then be sent
   without encryption and could be read by anyone on the network.
2. Enter your **username**.
3. Enter your **passhash**. You find it on your **My Account** page in PRTG.
   (It is not your password.)
4. Tick **Remember this server, username and passhash on this device** only if
   you want to skip this screen next time. They are stored in this browser
   profile only and are never synced.
5. Click **Connect**.
6. Chrome asks whether the extension may access that server. Allow it. The
   permission is requested for exactly that server's address, not for all sites.

Always connect with the same address. If you use two addresses for the same
PRTG (for example the classic address and the new UI's address), Map Studio
treats them as two servers and cannot undo a push made through the other one.

### 4. Pick or create a map

1. Open the **Map designer** tab. The **Map** step lists the maps on your
   server. Choose one and click **Load**: the items already on that map appear
   on the canvas.
2. To start from scratch, open the **New** tab, enter a name, width and height,
   and create the map.
3. **Delete this map** removes the chosen map from PRTG, so use it with care.

### 5. Design the map

1. Go to the **Design** step.
2. Under **Build**, add frames, labels, buttons, banners, shapes and
   connectors. **Background** sets the map's own colour in PRTG, or a picture:
   **Choose a picture…** opens an editor where you can cut it, fit or fill the
   map, zoom, move, turn and flip it, and change its colours, before Map Studio
   sends it to PRTG at exactly the map's size.
3. The bar on the right has **Layouts** (divide the map into boxes, with an
   optional title row, dividing lines and a look for the whole map),
   **Background** (a colour or pattern behind everything) and **Grid**.
4. Under **PRTG Server Objects**, search by category or name, select an object
   and click **Add to canvas**. Use **Refresh object list** after you install
   new object files.
5. Drag items to move them, drag the square corner to resize, and
   **Shift+click** to select several and align or distribute them.
6. To make your own objects, use the **Object builder** tab. It produces a
   `.htm` file. Save it in PRTG's `webroot\mapobjects` folder on the PRTG core
   server, or use the install script the tab gives you, then click **Refresh
   object list** in the Map designer.

### 6. Change or delete items already on the map

1. Click an item that was already on the map to change its position, size or
   link, or click **Mark for deletion**.
2. A strip over the canvas shows how many changes are not sent to PRTG yet.
   To really delete the marked items, tick **Also delete the items marked for
   deletion** (in that strip or at the top of the review). A backup file of
   those items is downloaded first.
3. Click **Review changes**, then **Apply**. **Discard all** throws the
   changes away.

### 7. Push your design to PRTG

1. Go to the **Push** step and click **Review** to see what will be added.
2. Click **Push**. Items are added to the chosen map, back to front.
3. Pushing again updates the items added by the previous push, as long as you
   keep the same layout (use **Save and load layout** to keep it).
4. **Undo last push** reverses the most recent push.
5. **Scaled copy for another screen** makes a new map in another size (for
   example for a wall screen) with everything on the canvas resized to fit.

## Troubleshooting

- **"Could not reach …"**
  - Open the server address in a new browser tab and click through any
    certificate warning (common with self-signed certificates), then press
    **Connect** again.
  - Check the address and port, and that PRTG is running.
  - Check your device has a network connection.
- **"This page needs permission to talk to that server"** — You declined the
  Chrome permission prompt. Press **Connect** again and choose **Allow**. You
  can review it at `chrome://extensions` → PRTG Map Studio → Details → Site access.
- **"PRTG did not accept this username and passhash"** — Check both. The
  passhash is on PRTG's **My Account** page.
- **Session expired / a login box appears while you work** — PRTG asked for a
  login again. Enter your username and passhash and press **Connect**. Your
  canvas is kept.
- **A pushed item was deleted in PRTG by hand** — Use **Forget what was pushed**,
  then push again.
- **Your own object does not appear in the list** — Check the file is in
  PRTG's `mapobjects` folder, then click **Refresh object list**.
- **An item marked for deletion is still on the map** — Tick **Also delete the
  items marked for deletion**, then review and apply again.
- **Something stopped working after a PRTG update** — See
  [Which PRTG versions it works with](#which-prtg-versions-it-works-with).

To report a problem or suggest an idea, press **Feedback** at the top right of
Map Studio. It opens a new issue on this page with Map Studio's and PRTG's
versions filled in; you check it and press **Create** on GitHub. Issues are
public, so leave out server addresses, usernames, passhashes and customer names.

## Privacy and security

- The extension talks only to the PRTG server you enter, using your username
  and passhash. It sends no data anywhere else.
- Page fonts are loaded from Google Fonts.
- Credentials are saved only if you tick the Remember box, in this browser's
  local extension storage.
- Anyone who can open the extension on your machine and has remembered
  credentials can use them, so do not tick Remember on a shared computer.

## Repository layout

- `extension/manifest.json` — Manifest V3 manifest. The server address is only
  known once you type it, so access is requested at runtime for that one
  origin (`optional_host_permissions`) rather than for all sites.
- `extension/background.js` — opens the app in a new tab when the toolbar icon
  is clicked.
- `extension/app.html` — the app's page. It loads the scripts in `extension/js/`
  one after another, in the order of their numbers.
- `extension/js/` — the app's code, as plain scripts (no modules, no build step):
  `01-config.js` (settings and changelog), `02-tabs.js`, `03-linkstyle.js`
  (Connector line looks), `04-page.js` (label and button tool, folding sections,
  preview), `05-info.js` (the "i" notes), `06-dashboard.js` (Map designer),
  `07-push.js` (connect, push, Undo, existing maps, background picture),
  `08-library.js` (Your objects, install script), `09-objects.js` (Object
  builder), `10-dashtabs.js` (Map / Design / Push tabs) and `11-start.js`.
- `extension/preview-sandbox.html` — sandboxed page that renders object
  previews.
- `extension/icons/` — toolbar icons. `extension/img/` — pictures the app uses.
- `tests/` — a stand-in PRTG server and automated checks of connecting, pushing,
  Undo and changing existing maps (see `tests/README.md`). Not part of the
  extension.
- `dashboards/mockups/` — three ready-made dashboards (NOC overview, SLOs and
  error budget, WAN and bandwidth) as PRTG object files, and the script that
  makes them. Not part of the extension; they also load fonts from Google Fonts.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE). The software is provided as is, without warranty
of any kind.
