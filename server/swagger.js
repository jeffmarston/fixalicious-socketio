'use strict'
/**
 * swagger.js initializes express and swagger middleware.
 *
 * Basic routing for web server behavior appears below. However, all route mapping will happen directly through
 * configuration of the swagger.yaml
 *
 */
let cors = require('cors');
let swaggerMiddleware = require('swagger-express-mw');
let express = require('express');
let app = express();
let http = require('http').Server(app);

// add cors in development mode
if (app.get('env') === 'development') {
  app.use(cors());
}

app.use('/client', express.static('../client'));
app.get('/', function (req, res) {
  res.send(`
<style>a {color: #112; text-decoration: none;
  font-family: sans-serif;
  background: #abc;padding: 10px;
  border-radius: 8px;margin: 4px;width: 150px;}
a:hover {background: #cde;color: #445;}
h4{font-family: sans-serif;}
</style>
  <h4>Where would you like to go?</h4>
  <a href="/client">Fixalicious Client</a>
  <a href="/angular">Angular 4 Client</a>
  <a href="/api/v1">API Documentation</a>
  `);
});


// swagger initializers
let swaggerConfig = {
  appRoot: __dirname
};
// Initialize and bind swagger and express
swaggerMiddleware.create(swaggerConfig, (err, swagger) => {

  if(err)
  {
    console.log("OMS API Gateway - Fatal error initializing swagger API:");
    console.log(err);
    console.log("Gateway cannot run with invalid swagger configuration.\nReview the /api/swagger/swagger.yaml file for errors.\nTerminating program.");
    process.exit();
  }

  // add the swagger middleware stack to express
  app.use(swagger.middleware());

  // Set headers to no-cache for all responses
  app.use('/', (req, res, next) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });
  // set location for serving up swagger docs
  app.use(swagger.runner.config.swagger.docEndpoints.ui, express.static(__dirname + "/docs"));
  // set the swagger path to render the swagger.yaml to json   
  app.use(swagger.runner.config.swagger.docEndpoints.raw, (req, res) => {
    res.status(200).json(swagger.runner.swagger);
  })
  // general 404 error handling for requests without mapped routes
  app.use((req, res, next) => {
    let err = new Error('Resource Not Found');
    err.status = 404;
    next(err);
  });
  // general HTTP error handler for all bad requests
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      // don't leak a stack trace in production
      message: err.message,
      error: (app.get('env') === 'development') ? err.stack : {}
    });
    if (err) { throw err; }
  });
});
module.exports = app;