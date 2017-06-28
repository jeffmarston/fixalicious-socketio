let app = require('./swagger');
let redisWatcher = require('./models/redis-watcher');
let debug = require('debug')('swagger-gwy:server');

// configuration and commandline args
global.argv = require('yargs')
  .option('port', { alias: 'p', default: '4400', describe: 'Port to serve HTTP content' })
	.option('subscriber', { alias: 's', default: 'ui', describe: 'FIXalicious channel' })
	.option('redis_host', { default: 'localhost', describe: 'Redis server hostname' })
	.option('redis_port', { default: '6379', describe: 'Redis server port' })
	.help().alias('help', '?')
	.argv;
 
let port = global.argv.port;
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
