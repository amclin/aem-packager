const _ = require('lodash')

/**
 * Renames properties on an object by prepending a prefix to them. Mutates the original object.
 * @param {Object} - Object to modify
 * @param {String} - prefix to append to the name of all the properties in the object
 * @returns {Object} - Updated object with renamed properties
 **/
const prefixProperties = function (obj, prefix) {
  _.forEach(obj, function (val, prop) {
    obj[prefix + prop] = val
    delete obj[prefix]
  })

  return obj
}

/**
 * Gets an NPM package.json property by name
 * This is shorthand for process.env.npm_package_<name>
 * @param {String} name
 * @param {String} prefix - Optionap prefix for finding an option in the namespace
 */
const getNPM = function (name, prefix) {
  prefix = prefix || '';
  return process.env[`npm_package_${prefix}${name}`]
}

module.exports.prefixProperties = prefixProperties
module.exports.getNPM = getNPM
