var site = require('./site');
var register = require('./register');
var authentication = require('../modules/authentication');

exports.init = function(app) {
  app.get('/', site.index);
  app.get('/login', site.login);
  app.get('/register', register.get);
  app.post('/register', register.post);
  app.get('/restricted', authentication.restrictRoute, site.restricted);
};
