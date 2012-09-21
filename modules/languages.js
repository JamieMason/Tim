require('../common/utils').packageProxy({
  extend: exports,
  dirRoot: __dirname + '/../languages',
  onCreate: function(newLang) {
    console.log(newLang);
  }
});

exports.init = function(app) {
  app.use(function(req, res, next) {
    res.locals.lang = exports.get();
    next();
  });
};
