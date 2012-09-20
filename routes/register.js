var lang = require('../languages').get();

exports.get = function(req, res) {
  res.render('register', {
    title: lang('/register.title')
  });
};

exports.post = function(req, res) {
  res.send('@TODO handle posted reg form');
};
