// Base Dependencies
var http = require('http');
var path = require('path');
var express = require('express');
var app = express();

// Environment Modules
var languages = require('./modules/languages');
var environments = require('./modules/environments');
var env = environments.get();

// Current Environment
environments.select('localhost'); // @TODO: take from stdin
languages.select(env('LANGUAGE'));

// Application Modules
var database = require('./modules/database');
var messaging = require('./modules/messaging');
var authentication = require('./modules/authentication');
var routes = require('./routes');

// Configuration
app.configure(function(){
  var appRoot = { root: __dirname };
  var staticPath = env('PATH_STATIC', appRoot);
  var viewsPath = env('PATH_VIEWS', appRoot);

  app.set('port', env('APP_PORT'));
  app.set('views', viewsPath);
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(env('APP_COOKIE_SECRET')));
  app.use(express.session());

  messaging.init(app);
  authentication.init(app);

  app.use(app.router);
  app.use(require('stylus').middleware(staticPath));
  app.use(express['static'](staticPath));

  if (app.get('env') === 'development') {
    app.use(express.errorHandler());
  }
});

// Init routes for each language
languages.all.forEach(function(lang) {
  routes.init(app, lang.name);
});

// Boot
database.open(function() {
  http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });
});
