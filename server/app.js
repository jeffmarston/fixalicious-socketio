'use strict'
/**
 * App.js initializes express and swagger middleware.
 *
 * Basic routing for web server behavior appears below. However, all route mapping will happen directly through
 * configuration of the swagger.yaml
 *
 * TODO: Ask if 'morgan' is needed or used somewhere or just a dead reference.
 * TODO: Find out why ES6 imports do not work.
 */
let cors = require('cors');
let config = require('./config');
let expressMiddleware = require('express');
let swaggerMiddleware = require('swagger-express-mw');


let express = expressMiddleware();
// add cors in development mode
if (express.get('env') === 'development') {
  express.use(cors());
}

express.use('/angular2', expressMiddleware.static('../client'));
express.use('/swagger', expressMiddleware.static('./docs'));
express.get('/', function (req, res) {
  res.send(`<html><body>The droids you are looking for are here:
  <ul>
    <li><a href="/angular2">angular2</a></li>
  </ul>
  </body></html>
  `);
});

// swagger initializers
let swaggerConfig = {
  apiBaseUrl: config.WebApiBaseUrl,
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
  express.use(swagger.middleware());
  // gut check
  console.log('Swagger middleware loaded into Express...');
  // Set headers to no-cache for all responses
  express.use('/', (req, res, next) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });
  // set location for serving up swagger docs
  express.use(swagger.runner.config.swagger.docEndpoints.ui, expressMiddleware.static(__dirname + "/docs"));
  // set the swagger path to render the swagger.yaml to json   
  express.use(swagger.runner.config.swagger.docEndpoints.raw, (req, res) => {
    res.status(200).json(swagger.runner.swagger);
  })
  // general 404 error handling for requests without mapped routes
  express.use((req, res, next) => {
    let err = new Error('Resource Not Found');
    err.status = 404;
    next(err);
  });
  // general HTTP error handler for all bad requests
  express.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      // don't leak a stack trace in production
      message: err.message,
      error: (express.get('env') === 'development') ? err.stack : {}
    });
    if (err) { throw err; }
  });
});
module.exports = express;