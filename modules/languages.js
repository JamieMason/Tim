var fs = require('fs');
var languageDir = fs.readdirSync(__dirname + '/../languages');

if(!languageDir || languageDir.length < 1) {
  throw new Error('Could not find language files');
}

require('../common/utils').packageProxy({
  extend: exports,
  dirRoot: __dirname + '/../languages'
});

exports.all = languageDir.map(function(fileName) {
  var name = fileName.replace('.json', '');
  return {
    fn: exports.get(name),
    name: name
  };
});
