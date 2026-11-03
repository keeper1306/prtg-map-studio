# Tests

Automated checks for PRTG Map Studio's push and Undo, run against a stand-in
PRTG server (`mock-prtg.py`) instead of a real one. They change nothing on any
real PRTG, and they use test-only login values.

These files are for testing only. The extension in `../extension` still has no
dependencies and no build step.

## What they check

- A plain push adds an item once, and pushing again does not add it twice.
- Replacing an item adds the new one before deleting the old one, and a failed
  add or delete leaves the map in a safe state (1.5.42).
- Undo is offered only for pushes made to the server you are connected to, and
  not for history saved before 1.5.41 (1.5.41).
- A push record that cannot be saved gives a red warning (1.5.43).
- The page shows no script errors while doing all of this.

## What they cannot check

They do not prove anything about a real PRTG: its exact answers, the classic
versus new interface, real objects and sensors. Test those on a real server.

## Running them

You need Node.js 22 or later and Python 3.

```
cd tests
npm install
npx playwright install chromium
node run-tests.js
```

Each check prints PASS or FAIL, then a summary. The exit code is 0 when all pass.

Options, set as environment variables:

- `PORT` – port for the stand-in server (default 8765).
- `PYTHON` – the Python command (default `python` on Windows, `python3` elsewhere).
- `EXT_DIR` – test another copy of the extension folder, for example an older version.
