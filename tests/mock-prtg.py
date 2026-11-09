"""A stand-in PRTG server for testing PRTG Map Studio without a real PRTG.

It serves the extension's files under /ext/ and answers the PRTG calls the
Map designer's push and Undo make (map list, object catalogue, add, edit and
delete map items, read the map back). It keeps the map's items in memory.

Maps made through /addmap2.htm (the scaled copy, 1.5.92) are added to the map list and keep their own items,
apart from the test map 2001; /controls/objectdata.htm and /editsettings stand in for the map settings form.

Test-only control addresses:
  /__reset?items=<json>&next=<n>   set the items on the map and the next item id
  /__mode?m=<json>                 {"addfail":1} or {"delfail":1} makes that call fail
  /__state                         the items on the map and every PRTG call made

Usage: python mock-prtg.py <extension folder> <port>
"""
import http.server, json, os, re, sys, threading, urllib.parse

EXT = sys.argv[1]
PORT = int(sys.argv[2])
state = {'items': {}, 'next': 10, 'log': [], 'mode': {}, 'maps': [{'objid': 2001, 'name': 'Test map'}], 'other': {}, 'bg': {}}
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
            body = self.rfile.read(n).decode('utf-8', 'replace')
            if 'multipart/form-data' in (self.headers.get('Content-Type') or ''):   # addmap2.htm and editsettings
                for m in re.finditer(r'name="([^"]+)"\r\n\r\n(.*?)\r\n--', body, re.S):
                    q[m.group(1)] = m.group(2)
            else:
                q.update(dict(urllib.parse.parse_qsl(body)))
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
                return self.send(200, json.dumps({'items': state['items'], 'log': state['log'], 'maps': state['maps'], 'other': state['other'], 'bg': state['bg']}), 'application/json')
            if path == '/__reset':
                state['items'] = json.loads(q.get('items', '{}'))
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
                state['log'].append({'path': path, 'q': {k: v for k, v in q.items() if k not in ('passhash', 'htmlbefore_', 'htmlafter_')}})
            mode = state['mode']
            if path == '/api/table.json' and q.get('content') == 'maps':
                return self.send(200, json.dumps({"maps": state['maps']}), 'application/json')
            if path == '/addmap2.htm':
                oid = 3000 + len(state['maps'])
                state['maps'].append({'objid': oid, 'name': q.get('name_', ''), 'w': q.get('width_'), 'h': q.get('height_')})
                state['other'][str(oid)] = {}
                return self.send(200, '<html>map %d</html>' % oid)
            if path == '/controls/objectdata.htm' and q.get('objecttype') == 'map':
                mid = q.get('id')
                return self.send(200, '<form action="/editsettings"><input name="id" value="%s"><input name="bgcolor_" value="%s"><input name="width_" value="1920"><input name="height_" value="1080"></form>'
                                 % (mid, state['bg'].get(mid, '#123456' if mid == MAIN else '')))
            if path == '/editsettings':
                state['bg'][q.get('id')] = q.get('bgcolor_', '')
                return self.send(200, 'ok')
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
            if path == '/api/mapsvg.htm':
                html = ''.join('<div class="map_object" subid="%s" objectid="%s" style="left:%spx;top:%spx;width:%spx;height:%spx;z-index:1"></div>'
                               % (s, i['target'] or 0, i['left'], i['top'], i['width'], i['height'])
                               for s, i in (state['other'].get(q.get('id'), {}) if q.get('id') not in (None, MAIN) else state['items']).items())
                return self.send(200, '<html><body>' + html + '</body></html>')
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
