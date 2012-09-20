var messaging = null;
var User = null;

/**
 * Query an email/password combination against the database, calling onComplete(err, user)
 * @param  {String}   email
 * @param  {String}   password
 * @param  {Function} onComplete
 */
exports.authenticate = function (email, password, onComplete) {

  console.log('authenticating', email);

  if (!email) {
    return onComplete('Email missing');
  }

  if (!password) {
    return onComplete('Password missing');
  }

  User.where('email').equals(email).findOne(function(err, user) {

    if (err) {
      return onComplete('Database error');
    }

    if (!user) {
      return onComplete('no user found with email ' + email);
    }

    var dbSalt = user.get('salt');
    var dbHash = user.get('hash');

    User.getPasswordHash({
      password: password,
      salt: dbSalt,
      onComplete: function(passwordHash) {
        passwordHash === dbHash ? onComplete(null, user) : onComplete('Email and password do not match');
      }
    });

  });

};

/**
 * Optional Express middleware for any routes which require authentication
 * @param  {Function}   req
 * @param  {Function}   res
 * @param  {Function}   next
 */
exports.restrictRoute = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    messaging.queue('error', req, 'Access denied!');
    res.redirect('/login');
  }
};

/**
 * Always-on Express middleware which provides the logged in user's data for rendering
 * @param  {Function}   req
 * @param  {Function}   res
 * @param  {Function}   next
 * @private
 */
function exposeUser(req, res, next) {
  var user = req.session && req.session.user ? req.session.user : null;

  res.locals.user = user ? {
    _id: user._id,
    created: user.created,
    email: user.email,
    name: user.name,
    roster: user.roster
  } : null;

  next();
}

/**
 * Defines GET /logout and POST /login.
 * GET /login needs defining elsewhere and should post the values email, password & redirectUrl
 * @param  {Object} app
 * @return {Object} exports
 */
exports.init = function(app) {

  messaging = require('../modules/messaging');
  User = require('../models/User').get();

  app.use(exposeUser);

  app.get('/logout', function(req, res) {
    req.session.destroy(function() {
      res.redirect('/');
    });
  });

  app.post('/login', function(req, res) {
    exports.authenticate(req.body.email, req.body.password, function(err, user) {
      if (err) {
        messaging.queue('error', req, err);
        res.redirect('/login');
      } else {
        req.session.regenerate(function() {
          req.session.user = user;
          // messaging.queue('success', req, 'Authenticated as ' + req.body.email);
          res.redirect(req.body.redirectUrl || '/');
        });
      }
    });
  });

  return exports;

};
