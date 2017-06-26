
FIXalicious UI
==============

FIXalicious UI is a front end for Rob Baxter's excellent FIXalicious back end.
It uses Angular2, ag-grid, and socket.io.

Building
==============

To build:
- `npm install`
- `npm run tsc`

TODO
==============
x `Create all actions from metadata, even Ack, Fill, Reject`
    x `Simple variable replacement` 
    x `Random id() function`
x `Persist action templates via REST API, redis`
- `Improve seeding to not require 2 refreshes`
- `Parse Fix XML in Node and expose via REST API`
- `Get sessions from redis, update status when they change`
- `Angular router, url matching session`
- `Indicate activity on Non visible pages`
- `Modal popup to show... FIX message received detail?`
