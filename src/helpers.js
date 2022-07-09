const path = require('path')
const fs = require('fs')

const _packagePath = (process.env.npm_package_json)
  ? path.resolve(process.env.npm_package_json) // NPM 7 and later
  : path.resolve(process.cwd(), 'package.json') // NPM 6 and earlier

const _packageContents = JSON.parse(
  fs.readFileSync(_packagePath, 'utf8')
)

/**
 * Renames properties on an object by prepending a prefix to them. Mutates the original object.
 * @param {Object} - Object to modify
 * @param {String} - prefix to append to the name of all the properties in the object
 * @returns {Object} - Updated object with renamed properties
 **/
const prefixProperties = function (obj, prefix) {
  Object.keys(obj).forEach((prop) => {
    obj[prefix + prop] = obj[prop]
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

const getConfigsFromPackage = function () {
  return _packageContents['aem-packager']
}

/**
 * Parses the NPM package name from the running process
 * @returns {Object} Package name and group. '@foo/bar' would result in:
 *   { group: 'foo', name: 'bar' }
 */
const _parseProcessPackageName = function () {
  const info = {}
  const data = _packageContents.name.split('/')
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
  return {
    name: getPackageName(),
    artifactId: getPackageName(),
    groupId: getPackageScope(),
    version: _packageContents.version,
    description: _packageContents.description
  }
}

module.exports = {
  prefixProperties,
  getCommands,
  getConfigsFromPackage,
  getPackageName,
  getPackageScope,
  getProjectConfigs
}
