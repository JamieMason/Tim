var authentication;
var authRoutes;
var languages;
var allRoutes;
var register;
var site;

exports.init = function(app, languageName) {

  if (!authentication) {
    authentication = require('../modules/authentication');
    authRoutes = require('./authentication');
    languages = require('../modules/languages');
    register = require('./register');
    site = require('./site');

    allRoutes = [
      { route: '/login.route', label: '/login.label'},
      { route: '/register.route', label: '/register.label'},
      { route: '/restricted.route', label: '/restricted.label'},
      { route: '/users.route', label: '/users.label'}
    ];
  }

  var lang = languages.get(languageName);

  function provideLocals(index, req, res, next) {
    var locals = res.locals;
    languages.select(languageName);
    locals.lang = lang;
    locals.lang.currentName = languageName;
    locals.lang.all = languages.all;
    locals.routes = allRoutes;
    locals.urlIndex = index;
    next();
  }

  app.get  (lang('/.route'),           provideLocals.bind(app, '/.route'),           site.index);
  app.get  (lang('/login.route'),      provideLocals.bind(app, '/login.route'),      site.login);
  app.post (lang('/login.route'),      provideLocals.bind(app, '/login.route'),      authRoutes.postLogin);
  app.get  (lang('/logout.route'),     provideLocals.bind(app, '/logout.route'),     authRoutes.logout);
  app.get  (lang('/register.route'),   provideLocals.bind(app, '/register.route'),   register.get);
  app.post (lang('/register.route'),   provideLocals.bind(app, '/register.route'),   register.post);
  app.get  (lang('/restricted.route'), provideLocals.bind(app, '/restricted.route'), authentication.restrictRoute, site.restricted);
  app.get  (lang('/users.route'),      provideLocals.bind(app, '/users.route'),      site.users);

};
