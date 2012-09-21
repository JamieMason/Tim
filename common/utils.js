/**
 * Provides multiple getters each referencing a single pool of polymorphic sources.
 * The source in use can be changed centrally using select, affecting all getters.
 * This is useful in the case of environment config and languages for example.
 * @param {Object} params.extend
 * @param {String} params.dirRoot
 * @return module
 */
exports.packageProxy = function(params) {

  var module = params.extend;
  var modulePath = params.dirRoot;
  var dictionaries = {};
  var cursor = null;

  /**
   * Returns the named propery of dictionary, optionally performing a find/replace of the keys/values in replacements
   * @param  {String} dictionary
   * @param  {String} definition
   * @param  {Object} [replacements]
   * @return {Mixed}
   * @private
   */

  function getValue(dictionary, definition, replacements) {

    dictionary = (dictionary || cursor);

    if (!dictionaries[dictionary]) {
      dictionaries[dictionary] = require(modulePath + '/' + dictionary);
    }

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

    cursor = dictionary;
    return getValue.bind({}, null);

  };


  /**
   * Return a getter for the selected dictionary
   * @param  {String} [dictionary]
   * @return {Function} getValue
   */

  module.get = function(dictionary) {

    if (!dictionary && !cursor) {
      throw new Error('Call to get() when no call to select("dictionary") has been made');
    }

    return getValue.bind({}, dictionary);

  };

  return module;

};
