var authentication;
var authRoutes;
var languages;
var register;
var site;

exports.init = function(app, langName) {

  if (!authentication) {
    authentication = require('../modules/authentication');
    authRoutes = require('./authentication');
    languages = require('../modules/languages');
    register = require('./register');
    site = require('./site');
  }

  var lang = languages.get(langName);

  function activateLanguage(req, res, next) {
    languages.select(langName);
    res.locals.lang = lang;
    next();
  }

  app.get(lang('/.route'), activateLanguage, site.index);
  app.get(lang('/login.route'), activateLanguage, site.login);
  app.post(lang('/login.route'), activateLanguage, authRoutes.postLogin);
  app.get(lang('/logout.route'), activateLanguage, authRoutes.logout);
  app.get(lang('/register.route'), activateLanguage, register.get);
  app.post(lang('/register.route'), activateLanguage, register.post);
  app.get(lang('/restricted.route'), activateLanguage, authentication.restrictRoute, site.restricted);

};
