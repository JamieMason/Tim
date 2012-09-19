var lang = {
  HELLO: 'hello'
};

exports.get = function() {
  return function(key) {
    return lang[key];
  };
};
