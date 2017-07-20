
FIXalicious UI
==============

FIXalicious UI is a front end for Rob Baxter's excellent FIXalicious back end.
It uses Angular2, ag-grid, redis, and socket.io.

## Prerequisites
- node.js
- redis
- fixalicious


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
x `Ability to delete template keys`
x `Get sessions from redis, update status when they change`

x `Scenarios!`
    x `save sessions in scenarios (not vice versa)`
    x `handle deleting scenarios (foreign key)`
    x `call quickActions (Ack, Partial) - or get resulting object back`

x `Repeating Groups!`
- `Parse Fix XML in Node and expose via REST API`
    - `Template keys use <select>`
- `Angular router, url matching session`
- `Indicate activity on non-visible pages`
- `Modal popup to show FIX message received detail`
