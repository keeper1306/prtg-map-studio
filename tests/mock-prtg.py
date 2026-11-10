"""A stand-in PRTG server for testing PRTG Map Studio without a real PRTG.

It serves the extension's files under /ext/ and answers the PRTG calls the
Map designer's push and Undo make (map list, object catalogue, add, edit and
delete map items, read the map back). It keeps the map's items in memory.

Maps made through /addmap2.htm (the scaled copy, 1.5.92) are added to the map list and keep their own items,
apart from the test map 2001; /controls/objectdata.htm and /editsettings stand in for the map settings form.
1.5.93: that form also has a background picture (a radio group and a file field, with made-up names: the real names are not
known, Map Studio finds them by type and label); /controls/mapview.htm shows the picture as PRTG does (background-image).
/api/mapsvg.htm gives the map's size (1920 x 1080) only when the mode has {"svg":1}, so the older tests are unchanged.
1.5.94: /api/mapsettings.htm?type=objectproperties gives an item's settings (for editing and deleting items already on a map).

Test-only control addresses:
  /__reset?items=<json>&next=<n>   set the items on the map and the next item id
  /__mode?m=<json>                 {"addfail":1} or {"delfail":1} makes that call fail
  /__state                         the items on the map and every PRTG call made
  /__pic?id=<map>                  the picture saved for that map (404 when none)

Usage: python mock-prtg.py <extension folder> <port>
"""
import http.server, json, os, re, sys, threading, urllib.parse

EXT = sys.argv[1]
PORT = int(sys.argv[2])
state = {'items': {}, 'next': 10, 'log': [], 'mode': {}, 'maps': [{'objid': 2001, 'name': 'Test map'}], 'other': {}, 'bg': {}, 'pic': {}}
MAIN = '2001'   # the map the push tests use; maps made with addmap2.htm keep their items in state['other'][id]
lock = threading.Lock()
CATALOGUE = {
    "Gauges": [{"name": "Gauge A", "value": "a.htm"}, {"name": "Gauge B", "value": "b.htm"}],
    "Custom HTML": [{"name": "Custom HTML element", "value": "x_ownhtmlonly.htm"}],
}
TYPES = {'.html': 'text/html', '.js': 'application/javascript', '.png': 'image/png', '.json': 'application/json'}


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def send(self, code, body, ctype='text/html'):
        b = body.encode() if isinstance(body, str) else body
        try:
            self.send_response(code)
            self.send_header('Content-Type', ctype)
            self.send_header('Content-Length', str(len(b)))
            self.end_headers()
            self.wfile.write(b)
        except (BrokenPipeError, ConnectionResetError):
            pass  # the page navigated away before the answer arrived

    def params(self):
        u = urllib.parse.urlparse(self.path)
        q = dict(urllib.parse.parse_qsl(u.query))
        if self.command == 'POST':
            n = int(self.headers.get('Content-Length') or 0)
            raw = self.rfile.read(n)
            ct = self.headers.get('Content-Type') or ''
            if 'multipart/form-data' in ct:   # addmap2.htm and editsettings; a file part keeps its bytes
                bnd = re.search(r'boundary=("?)([^";]+)\1', ct).group(2).encode()
                for part in raw.split(b'--' + bnd)[1:]:
                    if part.startswith(b'--'):
                        break
                    head, _, data = part.partition(b'\r\n\r\n')
                    data = data[:-2] if data.endswith(b'\r\n') else data
                    h = head.decode('utf-8', 'replace')
                    nm = re.search(r'name="([^"]*)"', h)
                    if not nm:
                        continue
                    fn = re.search(r'filename="([^"]*)"', h)
                    if fn:
                        t = re.search(r'Content-Type:\s*(\S+)', h, re.I)
                        q.setdefault('__files', {})[nm.group(1)] = (fn.group(1), data, t.group(1) if t else 'application/octet-stream')
                    else:
                        q[nm.group(1)] = data.decode('utf-8', 'replace')
            else:
                q.update(dict(urllib.parse.parse_qsl(raw.decode('utf-8', 'replace'))))
        return u.path, q

    def do_GET(self):
        self.handle_any()

    def do_POST(self):
        self.handle_any()

    def handle_any(self):
        path, q = self.params()
        with lock:
            if path == '/__mode':
                state['mode'] = json.loads(q.get('m', '{}'))
                return self.send(200, 'ok')
            if path == '/__state':
                return self.send(200, json.dumps({'items': state['items'], 'log': state['log'], 'maps': state['maps'], 'other': state['other'], 'bg': state['bg'],
                                                  'pic': {k: {'name': v[0], 'size': len(v[1]), 'type': v[2]} for k, v in state['pic'].items()}}), 'application/json')
            if path == '/__pic' or path.startswith('/mapbackground/'):
                mid = q.get('id') or os.path.splitext(path.split('/')[-1])[0]
                if mid not in state['pic']:
                    return self.send(404, 'no picture')
                return self.send(200, state['pic'][mid][1], state['pic'][mid][2])
            if path == '/__reset':
                state['items'] = json.loads(q.get('items', '{}'))
                state['pic'] = {}
                state['log'] = []
                state['next'] = int(q.get('next', '10'))
                return self.send(200, 'ok')
            if path.startswith('/ext/'):
                f = os.path.join(EXT, *path[5:].split('/'))
                if os.path.isfile(f):
                    with open(f, 'rb') as fh:
                        return self.send(200, fh.read(), TYPES.get(os.path.splitext(f)[1], 'application/octet-stream'))
                return self.send(404, 'not found')
            if path.startswith('/api/') or path.startswith('/controls/'):
                state['log'].append({'path': path, 'q': {k: v for k, v in q.items() if k not in ('passhash', 'htmlbefore_', 'htmlafter_', '__files')}})
            mode = state['mode']
            if path == '/api/table.json' and q.get('content') == 'maps':
                return self.send(200, json.dumps({'prtg-version': '26.3.124.1728', 'treesize': len(state['maps']), 'maps': state['maps']}), 'application/json')   # 1.5.95: the version, as PRTG sends it
            if path == '/addmap2.htm':
                oid = 3000 + len(state['maps'])
                state['maps'].append({'objid': oid, 'name': q.get('name_', ''), 'w': q.get('width_'), 'h': q.get('height_')})
                state['other'][str(oid)] = {}
                return self.send(200, '<html>map %d</html>' % oid)
            if path == '/controls/objectdata.htm' and q.get('objecttype') == 'map':
                mid = q.get('id')
                has = mid in state['pic']
                return self.send(200, '<form action="/editsettings"><input name="id" value="%s"><input name="bgcolor_" value="%s"><input name="width_" value="1920"><input name="height_" value="1080">'
                                 '<div class="control-group"><label class="control-label">Background Image</label>'
                                 '<input type="radio" name="mapbgpic_" id="pic1" value="1"%s><label for="pic1">Use a custom background image, for example, your company logo</label>'
                                 '<input type="radio" name="mapbgpic_" id="pic0" value="0"%s><label for="pic0">Do not use a background image</label>'
                                 '<input type="file" name="mapbgfile_"></div></form>'
                                 % (mid, state['bg'].get(mid, '#123456' if mid == MAIN else ''), ' checked' if has else '', '' if has else ' checked'))
            if path == '/editsettings':
                mid = q.get('id')
                state['bg'][mid] = q.get('bgcolor_', '')
                f = q.get('__files', {}).get('mapbgfile_')
                if q.get('mapbgpic_') == '0':
                    state['pic'].pop(mid, None)
                elif q.get('mapbgpic_') == '1' and f and f[1]:
                    state['pic'][mid] = f
                return self.send(200, 'ok')
            if path == '/controls/mapview.htm':
                mid = q.get('id')
                bgi = ';background-image:url(/mapbackground/%s.img)' % mid if mid in state['pic'] else ''
                return self.send(200, '<div id="mapview" style="background-color:%s%s"><div id="mapshow" data-connections="[]"></div></div>' % (state['bg'].get(mid, '#123456'), bgi))
            if path == '/api/tree.json':   # PRTG sends the Root group as one item with its children
                return self.send(200, json.dumps(TREE), 'application/json')
            if path == '/api/table.json' and q.get('content') in ('devices', 'groups', 'probenodes'):
                c = q.get('content')
                return self.send(200, json.dumps({c: [r for r in COUNTS if r['kind'] == c]}), 'application/json')
            if path == '/api/table.json' and q.get('content') == 'sensors' and q.get('id'):
                return self.send(200, json.dumps({'sensors': SENSORS.get(q.get('id'), [])}), 'application/json')
            if path == '/api/mapobject.json':
                return self.send(200, json.dumps(CATALOGUE), 'application/json')
            if path == '/index.htm':
                return self.send(200, '<meta name="csrf-token" content="test-token">')
            if path == '/api/addobjecttomap.htm':
                if mode.get('addfail'):
                    return self.send(500, 'add failed')
                sub = str(state['next'])
                state['next'] += 1
                store = state['other'].setdefault(q.get('id'), {}) if q.get('id') not in (None, MAIN) else state['items']
                store[sub] = {'file': q.get('mapobject_'), 'target': q.get('objectid'), 'left': q.get('left'),
                                       'top': q.get('top'), 'width': q.get('width'), 'height': q.get('height')}
                return self.send(200, '<div class="map_object" subid="%s"></div>' % sub)
            if path == '/api/editmapobject.htm':
                sub = q.get('subid')
                store = state['other'].get(q.get('id'), {}) if q.get('id') not in (None, MAIN) else state['items']
                if sub not in store:
                    return self.send(404, 'no such item')
                for k in ('left', 'top', 'width', 'height'):
                    store[sub][k] = q.get(k)
                if store is not state['items']:
                    store[sub]['html'] = q.get('htmlbefore_', '')
                return self.send(200, 'ok')
            if path == '/api/deletesubobject.htm':
                if mode.get('delfail'):
                    return self.send(500, 'delete failed')
                (state['other'].get(q.get('id'), {}) if q.get('id') not in (None, MAIN) else state['items']).pop(q.get('subid'), None)
                return self.send(200, 'ok')
            if path == '/api/mapsettings.htm' and q.get('type') == 'objectproperties':   # 1.5.94: an item's settings, as PRTG sends them
                store = state['other'].get(q.get('id'), {}) if q.get('id') not in (None, MAIN) else state['items']
                it = store.get(q.get('subid'))
                if it is None:
                    return self.send(404, 'no such item')
                return self.send(200, json.dumps({'top': str(it['top']), 'left': str(it['left']), 'width': str(it['width']), 'height': str(it['height']),
                                                  'zindex': '1', 'externallink': '', 'htmlbefore': it.get('html', ''), 'htmlafter': ''}), 'application/json')
            if path == '/api/mapsvg.htm':
                html = ''.join('<div class="map_object" subid="%s" objectid="%s" style="left:%spx;top:%spx;width:%spx;height:%spx;z-index:1"></div>'
                               % (s, i['target'] or 0, i['left'], i['top'], i['width'], i['height'])
                               for s, i in (state['other'].get(q.get('id'), {}) if q.get('id') not in (None, MAIN) else state['items']).items())
                svg = '<svg width="1920px" height="1080px"></svg>' if mode.get('svg') else ''
                return self.send(200, '<html><body>' + svg + html + '</body></html>')
            if path.endswith('.json'):
                return self.send(200, '{}', 'application/json')
            return self.send(200, '<html></html>')


TREE = {'data': 'Root', 'attr': {'objid': '0', 'type': 'group'}, 'state': 'open', 'children': [
    {'data': 'Local Probe', 'attr': {'objid': '1', 'type': 'probe'}, 'children': [
        {'data': 'Probe Device', 'attr': {'objid': '40', 'type': 'device'}},
        {'data': '1st group', 'attr': {'objid': '2041', 'type': 'group'}, 'children': [
            {'data': 'devicesetup.net', 'attr': {'objid': '2050', 'type': 'device'}}]}]},
    {'data': 'PRTG Core Server', 'attr': {'objid': '1028', 'type': 'device'}}]}
def _c(kind, objid, st, up=0, down=0, warn=0, paused=0):
    return {'kind': kind, 'objid': objid, 'status_raw': st, 'upsens': up, 'downsens': down, 'partialdownsens': 0, 'downacksens': 0,
            'warnsens': warn, 'unusualsens': 0, 'pausedsens': paused, 'undefinedsens': 0}
COUNTS = [_c('groups', 0, 5, 57, 12, 3, 2), _c('probenodes', 1, 5, 54, 12, 3, 2), _c('devices', 40, 5, 4, 1),
          _c('groups', 2041, 5, 50, 11, 3, 2), _c('devices', 2050, 5, 4, 1, 1), _c('devices', 1028, 3, 3)]
SENSORS = {'1028': [{'objid': 1025, 'sensor': 'Core Health (Autonomous)', 'status_raw': 3},
                    {'objid': 1026, 'sensor': 'Application Server', 'status_raw': 3}]}

http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
