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
 * Returns a list of Maven commands as an array
 * @param {String} path - Path to maven pom.xml
 * @param {Array} commands to run in Maven
 */
const getCommands = function (path) {
  return [
    '-f',
    path,
    'clean',
    'install',
    '-Pnpm' // Force a build profile that lets us set the Maven build target folder
  ]
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
 * Parses the NPM package name from the running process
 * @returns {Object} Package name and group. '@foo/bar' would result in:
 *   { group: 'foo', name: 'bar' }
 */
const _parseProcessPackageName = function () {
  var info = {}
  var data = process.env.npm_package_name.split('/')
  if (data.length > 1) {
    // name and group are present
    info.name = data[1]
    info.group = data[0]
    // trim leading @ from group
    while (info.group.charAt(0) === '@') {
      info.group = info.group.substr(1)
    }
  } else {
    // Name only
    info.name = data[0]
  }

  return info
}

/**
 * Extracts the maven-safe package name from the running process
 * example: Project named '@foo/bar' would return 'bar'
 * @returns {String} Name of package without scope prefix
 */
const getPackageName = function () {
  return _parseProcessPackageName().name
}

/**
 * Extracts the group from the scoped NPM project title in the running process
 * example: Project named '@foo/bar' would return 'foo'
 * @returns {String} Extracted scoped without the leading @. Undefined if no match.
 */
const getPackageScope = function () {
  return _parseProcessPackageName().group
}

/**
 * Retreives the config values that can be determined from any project's package.json
 */
const getProjectConfigs = function () {
  var configs = {}
  const stdProps = ['description', 'version'] // Standard properties available in any package.json
  stdProps.forEach((prop) => {
    configs[prop] = getFromEnv(['npm', 'package', prop])
  })
  configs.name = getPackageName()
  configs.artifactId = configs.name
  configs.groupId = getPackageScope()

  return configs
}

module.exports = {
  prefixProperties,
  getCommands,
  getConfigsFromProcess,
  getPackageName,
  getPackageScope,
  getProjectConfigs
}
