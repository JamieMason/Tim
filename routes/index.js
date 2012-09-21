var authentication;
var authRoutes;
var languages;
var register;
var site;
var langs;

exports.init = function(app, langName) {

  if (!authentication) {
    authentication = require('../modules/authentication');
    authRoutes = require('./authentication');
    languages = require('../modules/languages');
    register = require('./register');
    site = require('./site');
    langs = {
      nlNl: languages.get('nl-nl'),
      enGb: languages.get('en-gb')
    };
  }

  var lang = languages.get(langName);

  function provideLocals(index, req, res, next) {
    var locals = res.locals;

    // activate language
    languages.select(langName);
    locals.lang = lang;
    locals.langs = langs;

    // misc
    locals.urlIndex = index;

    // continue
    next();
  }

  app.get  (lang('/.route'),           provideLocals.bind(app, '/.route'),           site.index);
  app.get  (lang('/login.route'),      provideLocals.bind(app, '/login.route'),      site.login);
  app.post (lang('/login.route'),      provideLocals.bind(app, '/login.route'),      authRoutes.postLogin);
  app.get  (lang('/logout.route'),     provideLocals.bind(app, '/logout.route'),     authRoutes.logout);
  app.get  (lang('/register.route'),   provideLocals.bind(app, '/register.route'),   register.get);
  app.post (lang('/register.route'),   provideLocals.bind(app, '/register.route'),   register.post);
  app.get  (lang('/restricted.route'), provideLocals.bind(app, '/restricted.route'), authentication.restrictRoute, site.restricted);

};
