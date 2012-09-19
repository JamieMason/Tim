var CONFIG = {
  APP_PORT: process.env.PORT || 3000,
  APP_COOKIE_SECRET: 'Monkey Island',
  DB_HOST: 'localhost',
  DB_PORT: 27017,
  DB_DATABASE: 'threepwood'
};

exports.get = function() {
  return function(key) {
    return CONFIG[key];
  };
};
