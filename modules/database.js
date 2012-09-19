var mongoose = require('mongoose');
var env = require('../environments').get();
var db = mongoose.createConnection(env('DB_HOST'), env('DB_DATABASE'), env('DB_PORT'));

db.on('error', console.error.bind(console, 'connection error:'));

exports.open = function(onComplete) {
  db.once('open', function() {
    onComplete(db);
  });
};

exports.get = function() {
  return db;
};
