"""A stand-in PRTG server for testing PRTG Map Studio without a real PRTG.

It serves the extension's files under /ext/ and answers the PRTG calls the
Map designer's push and Undo make (map list, object catalogue, add, edit and
delete map items, read the map back). It keeps the map's items in memory.

Test-only control addresses:
  /__reset?items=<json>&next=<n>   set the items on the map and the next item id
  /__mode?m=<json>                 {"addfail":1} or {"delfail":1} makes that call fail
  /__state                         the items on the map and every PRTG call made

Usage: python mock-prtg.py <extension folder> <port>
"""
import http.server, json, os, sys, threading, urllib.parse

EXT = sys.argv[1]
PORT = int(sys.argv[2])
state = {'items': {}, 'next': 10, 'log': [], 'mode': {}}
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
            q.update(dict(urllib.parse.parse_qsl(self.rfile.read(n).decode())))
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
                return self.send(200, json.dumps({'items': state['items'], 'log': state['log']}), 'application/json')
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
                return self.send(200, json.dumps({"maps": [{"objid": 2001, "name": "Test map"}]}), 'application/json')
            if path == '/api/mapobject.json':
                return self.send(200, json.dumps(CATALOGUE), 'application/json')
            if path == '/index.htm':
                return self.send(200, '<meta name="csrf-token" content="test-token">')
            if path == '/api/addobjecttomap.htm':
                if mode.get('addfail'):
                    return self.send(500, 'add failed')
                sub = str(state['next'])
                state['next'] += 1
                state['items'][sub] = {'file': q.get('mapobject_'), 'target': q.get('objectid'), 'left': q.get('left'),
                                       'top': q.get('top'), 'width': q.get('width'), 'height': q.get('height')}
                return self.send(200, '<div class="map_object" subid="%s"></div>' % sub)
            if path == '/api/editmapobject.htm':
                sub = q.get('subid')
                if sub not in state['items']:
                    return self.send(404, 'no such item')
                for k in ('left', 'top', 'width', 'height'):
                    state['items'][sub][k] = q.get(k)
                return self.send(200, 'ok')
            if path == '/api/deletesubobject.htm':
                if mode.get('delfail'):
                    return self.send(500, 'delete failed')
                state['items'].pop(q.get('subid'), None)
                return self.send(200, 'ok')
            if path == '/api/mapsvg.htm':
                html = ''.join('<div class="map_object" subid="%s" objectid="%s" style="left:%spx;top:%spx;width:%spx;height:%spx;z-index:1"></div>'
                               % (s, i['target'] or 0, i['left'], i['top'], i['width'], i['height']) for s, i in state['items'].items())
                return self.send(200, '<html><body>' + html + '</body></html>')
            if path.endswith('.json'):
                return self.send(200, '{}', 'application/json')
            return self.send(200, '<html></html>')


http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
