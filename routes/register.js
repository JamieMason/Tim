exports.get = function(req, res) {
  res.render('register', {
    title: "Register"
  });
};

exports.post = function(req, res) {
  res.send('@TODO handle posted reg form');
};
