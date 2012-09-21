var messaging;
var User;
var lang;

/**
 * Query an email/password combination against the database, calling onComplete(err, user)
 * @param  {String}   email
 * @param  {String}   password
 * @param  {Function} onComplete
 */
exports.authenticate = function (email, password, onComplete) {

  console.log('authenticating', email);

  if (!email) {
    return onComplete(lang('EMAIL_NOT_SUPPLIED'));
  }

  if (!password) {
    return onComplete(lang('PASSWORD_NOT_SUPPLIED'));
  }

  User.where('email').equals(email).findOne(function(err, user) {

    if (err) {
      return onComplete(lang('DB_ERROR'));
    }

    if (!user) {
      return onComplete(lang('EMAIL_NOT_FOUND', {
        email: email
      }));
    }

    var dbSalt = user.get('salt');
    var dbHash = user.get('hash');

    User.getPasswordHash({
      password: password,
      salt: dbSalt,
      onComplete: function(passwordHash) {
        passwordHash === dbHash ? onComplete(null, user) : onComplete(lang('AUTH_INCORRECT'));
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
    messaging.queue('error', req, lang('AUTH_REQUIRED'));
    res.redirect(lang('/login.route'));
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

  lang = require('../modules/languages').get();
  messaging = require('../modules/messaging');
  User = require('../models/User').get();

  app.use(exposeUser);
  return exports;

};
