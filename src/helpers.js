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
    delete obj[prop]
  })

  return obj
}

/**
 * Gets a specific property from the NPM process.env
 * dashes in search segments will be converted to underscore
 * @param {Array} searchPath - Array defining the path to the property
 */
const getFromEnv = function (searchPath) {
  var key = searchPath.join('_').replace('-', '_')
  return process.env[key]
}

/**
 * Gets an NPM package.json property by name
 * This is shorthand for process.env.npm_package_<name>
 * @param {String} name
 * @param {String} prefix - Optionap prefix for finding an option in the namespace
 */
const getNPM = function (name, prefix) {
  prefix = prefix || 'npm_package'
  prefix = prefix.replace(/_$/, '') // remove trailing _ if there is one
  return getFromEnv([prefix, name])
}

module.exports.prefixProperties = prefixProperties
module.exports.getNPM = getNPM
