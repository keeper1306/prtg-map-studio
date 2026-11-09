# Mockup dashboards 01 to 03

Object files that draw the owner's dashboard mockups 01 (NOC overview), 02 (SLOs & error budget) and
03 (WAN & bandwidth) as one PRTG map object each, with live PRTG data. Not part of the extension.

- `runtime.js`: shared code (shadow root, scaling to the item's box, PRTG API calls with a cache, drawing helpers).
- `draw01.js`, `draw02.js`, `draw03.js`: one dashboard each.
- `gen.js`: the sensor choices for this PRTG and the file wrapper. `node gen.js <outdir>` writes
  `map-studio-mockup-01-noc-overview.htm`, `-02-slos-and-error-budget.htm` and `-03-wan-and-bandwidth.htm`.

Install: copy the files into PRTG's `webroot\mapobjects`, then put one on a 1280 x 900 map at 0,0 on Local Probe (id 1).
