var messaging = require('../modules/messaging');
var registration = require('../modules/registration');

exports.get = function(req, res) {
  res.render('register', {
    title: res.locals.lang('/register.title')
  });
};

exports.post = function(req, res) {
  var body = req.body;

  registration.register({
    name: body.name,
    email: body.email,
    password: body.password,
    password2: body.password2,
    onComplete: function(err, user) {
      if (err) {
        messaging.queue('error', req, err);
        res.redirect(res.locals.lang('/register.route'));
      } else {
        messaging.queue('success', req, res.locals.lang('REGISTER_SUCCESS', {
          name: body.name,
          email: body.email
        }));
        res.redirect(res.locals.lang('/.route'));
      }
    }
  });
};
