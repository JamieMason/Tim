var site;
var register;
var authentication;

exports.init = function(app, lang) {

  site = site || require('./site');
  register = register || require('./register');
  authentication = authentication || require('../modules/authentication');

  function activateLanguage(req, res, next) {
    res.locals.lang = lang;
    next();
  }

  app.get(lang('/.route'), activateLanguage, site.index);
  app.get(lang('/login.route'), activateLanguage, site.login);
  app.get(lang('/register.route'), activateLanguage, register.get);
  app.post(lang('/register.route'), activateLanguage, register.post);
  app.get(lang('/restricted.route'), activateLanguage, authentication.restrictRoute, site.restricted);

};
