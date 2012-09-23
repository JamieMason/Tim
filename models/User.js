var mongoose = require('mongoose');
var crypto = require('crypto');
var database;
var lang;
var keyLength = 128;
var iterations = 12000;
var User;

/**
 * @param  {Object} mongoose
 * @param  {Object} db
 * @return {Object}
 */

exports.get = function() {

  if (User) {
    return User;
  }

  if (!database) {
    database = require('../modules/database');
    lang = require('../modules/languages').get();
  }

  var db = database.get();

  /**
   * Schema
   */
  var schema = new mongoose.Schema({
    'hash': String,
    'salt': String,
    'created': {
      'type': Date,
      'default': Date.now
    },
    'email': {
      'type': String,
      'lowercase': true,
      'trim': true
    },
    'mobile': {
      'type': String,
      'trim': true
    },
    'name': {
      'type': String,
      'trim': true
    }
  });

  /**
   * Virtuals
   */

  schema.virtual('hasPassword').get(function() {
    return !!(this.hash && this.salt);
  });

  /**
   * Indexes
   */

  schema.path('email').index({ unique: true });

  /**
   * Statics
   */

  /**
   * Using a password and salt, get a Hash
   * @param  {String}   params.password
   * @param  {String}   params.salt
   * @param  {Function} params.onComplete fn(hash:String)
   * @static
   */

  schema.statics.getPasswordHash = function (params) {

    if (!params) {
      throw new Error('!params');
    }

    if (!params.password) {
      throw new Error('!params.password');
    }

    if (!params.salt) {
      throw new Error('!params.salt');
    }

    if (!params.onComplete) {
      throw new Error('!params.onComplete');
    }

    crypto.pbkdf2(params.password, params.salt, iterations, keyLength, function(err, hash) {

      if (err) {
        throw new Error('failed to retrieve hash for password');
      }

      params.onComplete(hash);

    });

  };

  /**
   * Get a random salt
   * @param  {Function} onComplete fn(salt:String)
   * @static
   */

  schema.statics.getPasswordSalt = function(onComplete) {

    if (!onComplete) {
      throw new Error('!onComplete');
    }

    crypto.randomBytes(keyLength, function(err, salt) {

      if (err) {
        throw new Error('failed to generate salt');
      }

      onComplete(salt.toString('base64'));

    });

  };

  /**
   * @param  {String}   [params.name]
   * @param  {String}   params.email
   * @param  {String}   params.password
   * @param  {String}   params.password2
   * @param  {Function} params.onComplete fn(err, res)
   * @static
   */

  schema.statics.register = function(params) {

    params = params || {};

    var user;
    var errors = [];

    if (!params.onComplete) {
      throw new Error('!params.onComplete');
    }

    if (!params.email) {
      errors.push(lang('EMAIL_NOT_SUPPLIED'));
    }

    if (!params.password) {
      errors.push(lang('PASSWORD_NOT_SUPPLIED'));
    }

    if (!params.password2) {
      errors.push(lang('REPEAT_PASSWORD_NOT_SUPPLIED'));
    }

    if (params.password !== params.password2) {
      errors.push(lang('PASSWORDS_DO_NOT_MATCH'));
    }

    if (errors.length) {
      return params.onComplete(errors, null);
    }

    function onSave(err, res) {
      params.onComplete(err, user);
    }

    user = new User({
      name: params.name || '',
      email: params.email
    });

    user.encryptPassword(params.password, function(err, res) {
      !err ? user.save(onSave) : params.onComplete(err, null);
    });

  };

  /**
   * Reports whether a user is registered with the supplied email
   * @param  {String}   email
   * @param  {Function} onComplete([err:Object], result:Boolean)
   */

  schema.statics.isRegistered = function(email, onComplete) {

    User.where('email').equals(email).findOne(function(err, user) {
      err ? onComplete(lang('DB_ERROR')) : onComplete(null, !!user);
    });

  };

  /**
   * Validators
   */

  var outsideNameWhitelist = /[^0-9A-Z \-\(\)_\.]/gi;
  var mobileMatch = /^(0|\+[0-9]{2})7[0-9]{9}$/;
  var outsideEmailWhitelist = /[^@0-9A-Z \-\(\)_\.]/gi;
  var outsidePasswordWhitelist = /[^0-9A-Z\-_\.]/gi;

  schema.path('email').validate(function(value) {
    var at = value.match(/@/g);
    return at && at.length === 1 && value.search(outsideEmailWhitelist) === -1;
  }, 'Invalid Email');

  schema.path('mobile').validate(function(value) {
    return !value || value.search(mobileMatch) !== -1;
  }, 'Invalid Mobile');

  schema.path('name').validate(function(value) {
    return !value || value.search(outsideNameWhitelist) === -1;
  }, 'Disallowed Characters in Name');

  /**
   * Methods
   */

  schema.methods.encryptPassword = function(password, onComplete) {

    var self = this;
    var passwordIsValid = password && password.length >= 6 && password.search(outsidePasswordWhitelist) === -1;

    if (!passwordIsValid) {
      return onComplete('Invalid Password');
    }

    schema.statics.getPasswordSalt(function(salt) {
      schema.statics.getPasswordHash({
        password: password,
        salt: salt,
        onComplete: function(hash) {
          self.hash = hash;
          self.salt = salt;

          onComplete(null, self);
        }
      });
    });

  };

  /**
   * Hooks
   */

  schema.pre('save', function (next, done) {

    var self = this;

    // don't save unless we have a hash and salt
    if (this.hasPassword !== true) {
      this.invalidate('hasPassword', 'User has no password');
    }

    // don't save if invalid
    this.validate(function (err) {
      return err ?
        done(Object.keys(err.errors).map(function(name) {
          return err.errors[name].type;
        }).join('\n'))
        : !self.isNew ?
          next()
          : User.where('email').equals(self.email).where('_id').ne(self._id).findOne(function(err, result) {
              return err ? done(err) : result ? done(['Email already registered']) : next();
            });
    });

  });

  /**
   * Model
   */

  User = db.model('User', schema);

  return User;

};
