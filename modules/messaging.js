/**
 * This middleware makes the property "messages" available to Jade,
 * containing all messages for the current user created via exports.queue
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
function middleware(req, res, next) {

  if (req.session && req.session.messages) {
    res.locals.messages = req.session.messages;
    delete req.session.messages;
  }

  next();

}

/**
 * Add a message to be displayed to the user
 * @param {String} type    "notice", "error", "warning" etc
 * @param {Object} req
 * @param {String} message
 */
exports.queue = function(type, req, message) {

  if (!req.session) {
    req.session = {};
  }

  if (!req.session.messages) {
    req.session.messages = [];
  }

  req.session.messages.push({
    type: type,
    message: message
  });

};

/**
 * @param  {Object} app
 * @return {exports}
 */
exports.init = function(app) {
  app.use(middleware);
  return exports;
};
