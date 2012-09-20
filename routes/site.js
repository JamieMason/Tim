var lang = require('../languages').get();

exports.index = function(req, res) {
  res.render('index', {
    title: lang('/.title')
  });
};

exports.login = function(req, res) {
  res.render('login', {
    title: lang('/login.title')
  });
};

exports.restricted = function(req, res) {
  res.render('restricted', {
    title: lang('/restricted.title')
  });
};
