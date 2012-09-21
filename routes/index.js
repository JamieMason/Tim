var site = require('./site');
var register = require('./register');
var authentication = require('../modules/authentication');
var lang = require('../modules/languages').get();

exports.init = function(app) {
  app.get(lang('/.route'), site.index);
  app.get(lang('/login.route'), site.login);
  app.get(lang('/register.route'), register.get);
  app.post(lang('/register.route'), register.post);
  app.get(lang('/restricted.route'), authentication.restrictRoute, site.restricted);
};
