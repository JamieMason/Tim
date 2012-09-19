/**
 * Provides multiple getters each referencing a single pool of polymorphic sources.
 * The source in use can be changed centrally using select, affecting all getters.
 * This is useful in the case of environment config and languages for example.
 * @param  {Object} pkgModule
 * @param  {String} pkgPath
 * @return pkgModule
 */
exports.packageProxy = function(pkgModule, pkgPath) {
  var dir = pkgPath;
  var modules = {};
  var cursor = null;

  pkgModule.select = function(name) {
    if (!modules[name]) {
      modules[name] = require(dir + '/' + name).get();
    }
    cursor = name;
    return modules[name];
  };

  pkgModule.get = function(name) {
    if (name) {
      if (!modules[name]) {
        modules[name] = require(dir + '/' + name).get();
      }
      return modules[name];
    }
    if (!cursor) {
      throw new Error('Call to get() when no call to select("what") has been made');
    }
    return modules[cursor];
  };

  return pkgModule;
};
