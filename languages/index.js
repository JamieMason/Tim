exports = require('../common/utils').packageProxy(exports, __dirname);

exports.init = function(app) {
  app.use(function(req, res, next) {
    res.locals.lang = exports.get();
    next();
  });
};
