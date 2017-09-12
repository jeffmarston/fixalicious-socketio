let app = require('./swagger');
let redisWatcher = require('./models/redis-watcher');
let debug = require('debug')('swagger-gwy:server');
let config = require('./config');


let port = config.port;
app.set("port", port);
let server = app.listen(port);

// setup socket.io
global.io = require('socket.io').listen(server);

// setup redis watchers
redisWatcher.subscribeAll();

server.on('error', onError);
server.on('listening', onListening);
console.log("Up and Running on Port: " + port);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
