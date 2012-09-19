exports.index = function(req, res) {
  res.render('index', {
    title: "Home"
  });
};

exports.login = function(req, res) {
  res.render('login', {
    title: 'Sign In'
  });
};

exports.restricted = function(req, res) {
  res.render('restricted', {
    title: 'Welcome to VIP!'
  });
};
