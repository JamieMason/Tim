var site = require('./site');
var register = require('./register');
var authentication = require('../modules/authentication');

exports.init = function(app) {
  app.get('/', site.index);
  app.get('/login', site.login);
  app.get('/register', register.view);
  app.post('/register', register.create);
  app.get('/restricted', authentication.middleware, site.restricted);
};
