exports.index = function(req, res) {
  res.render('index', {
    title: res.locals.lang('/.title')
  });
};

exports.login = function(req, res) {
  res.render('login', {
    title: res.locals.lang('/login.title')
  });
};

exports.restricted = function(req, res) {
  res.render('restricted', {
    title: res.locals.lang('/restricted.title')
  });
};
