/**
 * Provides multiple getters each referencing a single pool of polymorphic sources.
 * The source in use can be changed centrally using select, affecting all getters.
 * This is useful in the case of environment config and languages for example.
 * @param  {Object} module
 * @param  {String} modulePath
 * @return module
 */
exports.packageProxy = function(module, modulePath) {

  var dictionaries = {};
  var cursor = null;

  /**
   * Returns the named propery of dictionary, optionally performing a find/replace of the keys/values in replacements
   * @param  {Object} dictionary
   * @param  {String} definition
   * @param  {Object} [replacements]
   * @return {Mixed}
   * @private
   */
  function getValue(dictionary, definition, replacements) {

    var value = dictionaries[dictionary][definition];
    var token;

    if (replacements) {
      for (token in replacements) {
        value = value.replace(new RegExp('#{' + token + '}', 'g'), replacements[token]);
      }
    }

    return value;

  }

  /**
   * Return a getter for the named dictionary, all subsequent calls to get will return the same dictionary.
   * If a further call to select is made, all present or future getters will all point to the new dictionary.
   * @param  {String} dictionary
   * @return {Function} getValue
   */
  module.select = function(dictionary) {

    if (!dictionaries[dictionary]) {
      dictionaries[dictionary] = require(modulePath + '/' + dictionary);
    }

    cursor = dictionary;

    return getValue.bind({}, dictionary);

  };

  /**
   * Return a getter for the selected dictionary
   * @return {Function} getValue
   */
  module.get = function() {

    if (!cursor) {
      throw new Error('Call to get() when no call to select("what") has been made');
    }

    return getValue.bind({}, cursor);

  };

  return module;
};
