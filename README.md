# PRTG Map Studio

A Chrome extension for building PRTG maps. You design map objects and whole
dashboards on a canvas, then push them to a map on your PRTG server.

- **Object builder** — make your own map objects (gauges, donuts, status
  counts, status icons, graphs, tables) with live previews, and save them as
  files PRTG can use.
- **Map designer** — open a map, arrange objects, labels, buttons, frames and
  shapes on a canvas, then push the result to PRTG.

It works with the classic PRTG interface and with the new PRTG interface
(where the classic service is served under `/api/v1`).

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

### 4. Pick or create a map

1. In the Map designer, the **Map** step lists the maps on your server. Choose
   one and click **Load**.
2. To start from scratch, open the **New** tab, enter a name, width and height,
   and create the map.
3. **Delete this map** removes the chosen map from PRTG, so use it with care.

### 5. Add objects from the catalog

1. Go to the **Design** step.
2. Under **Server objects**, search by category or name, select an
   object and click **Add to canvas**. Use **Refresh object list** after you
   install new object files.
3. Use **Build** to add labels, buttons, frames and shapes.
4. Drag items to move them, drag the square corner to resize, and
   **Shift+click** to select several and align or distribute them.
5. To make your own objects, use the **Object builder** tab. It produces a
   `.htm` file. Save it in PRTG's `webroot\mapobjects` folder on the PRTG core
   server, or use the install script the tab gives you, then click **Refresh
   object list** in the Map designer.

### 6. Push your changes to PRTG

1. Go to the **Push** step and click **Review** to see what will be added.
2. Click **Push**. Items are added to the chosen map, back to front.
3. Pushing again updates the items added by the previous push, as long as you
   keep the same layout (use **Save and load layout** to keep it).
4. **Undo last push** reverses the most recent push.

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
- `extension/app.html`, `extension/app.js` — the app.
- `extension/preview-sandbox.html` — sandboxed page that renders object
  previews.
- `extension/icons/` — toolbar icons.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
