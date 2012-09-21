var authentication = require('../modules/authentication');
var messaging = require('../modules/messaging');
var lang = require('../modules/languages').get();

exports.logout = function(req, res) {
  req.session.destroy(function() {
    res.redirect(lang('/.route'));
  });
};

exports.postLogin = function(req, res) {
  authentication.authenticate(req.body.email, req.body.password, function(err, user) {
    if (err) {
      messaging.queue('error', req, err);
      res.redirect(lang('/login.route'));
    } else {
      req.session.regenerate(function() {
        var url = '#{url}.route'.replace('#{url}', req.body.redirectUrl || '/');
        req.session.user = user;
        res.redirect(lang(url));
      });
    }
  });
};
