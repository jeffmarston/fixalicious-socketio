FIXalicious UI
==============

FIXalicious UI is a front end for Rob Baxter's excellent FIXalicious back end.
It uses Angular2, ag-grid, redis, and socket.io.

## Prerequisites
- node.js [https://nodejs.org](https://nodejs.org)
- redis [https://redis.org](https://redis.io)
- fixalicious [https://github.com/rbaxter1](https://github.com/rbaxter1/fixalicious)


# Design
Fixalcious-ui is a front end to Fixalicious, so it is quite useless by itself. This project has two parts, a node.js server and an Angular client.

The server communicates to Fixalicious using shared keys in Redis for realtime messaging, and HTTP REST calls to send new messages. It also persists configuration for the client, such as quick action templates.

The client calls the server APIs to get data, and subscribes to a socket.io channel for realtime updates of FIX transations and session information.

# Run it!

## Client

The client is written in Typescript and needs to be built before it can be run. 
Change to the client folder, install dependencies, and build it:
```
> cd client
> npm install
> tsc
```

## Server

The server only needs dependencies installed, so change to the server folder, install dependencies, and run the following:
```
> cd server
> npm install
> node ./bin/www --subscriber=ui
```

That's it, you're up and running with the defaults. Navigate to localhost:3000 or go directly to the client.
```
http://localhost:3000
```

## options

Fixalicious can publish on multiple channels. By default, we listen to the channel "ui". This can be changed using the "subscriber" argument.

```
node ./bin/www --subscriber=ui
```