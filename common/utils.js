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
   * @param  {String}  dictionaryName
   * @return {Boolean}
   * @private
   */
  function isLoaded(dictionaryName) {
    return dictionaryName in dictionaries;
  }

  /**
   * @param  {String}  dictionaryName
   * @return {Object}
   * @private
   */
  function loadDictionary(dictionaryName) {
    return dictionaries[dictionaryName] = require(modulePath + '/' + dictionaryName);
  }

  /**
   * @return {Boolean}
   * @private
   */
  function hasSelectedDictionary() {
    return !!cursor;
  }

  /**
   * @param  {String}  dictionaryName
   * @return {Object}
   * @private
   */
  function getDictionary(dictionaryName) {
    var loadedDictionary = isLoaded(dictionaryName) ? dictionaries[dictionaryName] : loadDictionary(dictionaryName);
    if (loadedDictionary) {
      return loadedDictionary;
    }
    throw new Error('failed to find dictionaryName "' + dictionaryName + '"');
  }

  /**
   * @param  {String}  dictionaryName
   * @param  {String}  definitionName
   * @return {Mixed}
   * @private
   */
  function getDefinition(dictionaryName, definitionName) {
    return getDictionary(dictionaryName)[definitionName];
  }

  /**
   * @param  {String} value
   * @param  {Object} substitutions
   * @return {String}
   * @private
   */
  function insertSubstitutions(value, substitutions) {
    for (var token in substitutions) {
      value = value.replace(new RegExp('#{' + token + '}', 'g'), substitutions[token]);
    }
    return value;
  }

  /**
   * Returns the value of definitionName from the dictionary of name dictionaryName, optionally performing a find/replace of the keys/values in replacements
   * @param  {String} dictionaryName
   * @param  {String} definitionName
   * @param  {Object} [substitutions]
   * @return {Mixed}
   * @private
   */
  function translateDefinition(dictionaryName, definitionName, substitutions) {
    var value = getDefinition(dictionaryName, definitionName);
    return !substitutions ? value : insertSubstitutions(value, substitutions);
  }

  /**
   * Returns the value of definitionName from the currently selected dictionary, optionally performing a find/replace of the keys/values in replacements
   * @param  {String} definitionName
   * @param  {Object} [substitutions]
   * @return {Mixed}
   * @private
   */
  function selectedDictionaryReader(definitionName, substitutions) {
    return translateDefinition(cursor, definitionName, substitutions);
  }

  /**
   * Select the dictionary of name dictionaryName, all calls to functions returned by get() without params will return definitions from the selected dictionary.
   * @param  {String} dictionaryName
   * @return {Object} module
   */
  module.select = function(dictionaryName) {
    cursor = dictionaryName;
    getDictionary(cursor);
    return module;
  };

  /**
   * Return a getter for the selected dictionaryName
   * @param  {String} [dictionaryName]
   * @return {Function}
   */
  module.get = function(dictionaryName) {

    if (!dictionaryName) {
      return selectedDictionaryReader;
    }

    getDictionary(dictionaryName);

    return function(definitionName, substitutions) {
      return translateDefinition(dictionaryName, definitionName, substitutions);
    };

  };

  return module;

};
