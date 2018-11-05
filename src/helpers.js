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
 * Gets the project details from the NPM running process, and therefore from
 * the package.json of the calling project
 * @returns {Object} - Configuration options and defines from the running process
 */
const getConfigsFromProcess = function (defaults) {
  var result = {}

  // Walk the defaults object and map the names back to process.env names so we can find them
  _.forEach(defaults, (val, config) => {
    result[config] = {}
    _.forEach(defaults[config], (val, property) => {
      const searchSegments = [
        'npm',
        'package', // namespace of where package.json options are stored
        'aem-packager', // namespace of this plugin
        config,
        property
      ]
      // get the value
      result[config][property] = getFromEnv(searchSegments)
    })
  })

  return result
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

/**
 * Retreives the config values that can be determined from any project's package.json
 */
const getProjectConfigs = function () {
  var configs = {}
  const stdProps = ['name', 'description', 'version'] // Standard properties available in any package.json
  stdProps.forEach((prop) => {
    configs[prop] = getFromEnv(['npm', 'package', prop])
  })
  configs.artifactId = getFromEnv(['npm', 'package', 'name'])

  return configs
}

module.exports.prefixProperties = prefixProperties
module.exports.getConfigsFromProcess = getConfigsFromProcess
module.exports.getNPM = getNPM
module.exports.getProjectConfigs = getProjectConfigs
