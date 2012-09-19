exports.view = function(req, res) {
  res.render('register', {
    title: "Register"
  });
};

exports.create = function(req, res) {
  res.send('@TODO handle posted reg form');
};
