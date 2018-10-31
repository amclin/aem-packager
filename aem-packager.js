#!/usr/bin/env node

const path = require('path')
const _ = require('lodash')

// Define defaults when configs are not provided
const defaults = {
  options: {
    srcDir: 'dist',
    buildDir: 'target'
  },
  defines: {
    name: 'My Project',
    description: 'My Project Description',
    groupId: 'npm',
    artifactId: 'myArtifactId',
    version: '0.0.1'
  },
}

/**
 * Renames properties on an object by appending a prefix to them
 * @param {Object} - Object to modify
 * @param {String} - prefix to append to the name of all the properties in the object
 * @returns {Object} - Updated object with renamed properties
 **/
const prefixProperties = function (obj, prefix) {
  Object.keys(obj).forEach(element => {
    var newProp = prefix + element
    Object.assign(obj, { [newProp]: obj[element] })
    delete obj[element]
  })

  return obj
}

/**
 * Parses the settings to generate a paths object containing
 * the various paths used in AEM and the build process
 * @param {Object} - plugin options object
 * @returns {Object} - paths
 */
const getPaths = function (options) {
  return {
    pom: path.resolve(__dirname, 'src/pom.xml'),
    mvnTarget: path.resolve(process.cwd(), options.buildDir),
    npmOut: path.resolve(process.cwd(), options.srcDir)
  }
}

/**
 * Gets a consolidated options object from the various sources
 * @param {Object} pkg - NPM package JSON
 */
const getOptions = function (pkg) {
  var options = {}
  // Default fallback options defined in this module
  const defaultOptions = defaults.options
  // Override values from the NPM package.json
  const pkgConfigOptions = _.get(pkg, 'aem-packager.options', {});

  _.defaults(
    options,
    pkgConfigOptions,
    defaultOptions
  )

  return options
}

/**
 * Prepares the list of Maven commands
 * @param {Ojbect} paths - Modules paths list
 * @param {Array} commands to run in Maven
 */
const getCommands = function (paths) {
  return [
    '-f',
    paths.pom,
    'clean',
    'install',
    '-Pnpm' // Force a build profile that lets us set the Maven build target folder
  ]
}

/**
 * Gets a consolidated list of Maven defines from the various sources
 * @param {Object} pkg - NPM package JSON
 # @param {Object} paths - List of module paths
 */
const getDefines = function (pkg, paths) {
  var defines = {}
  // Default fallback defined in this module
  const defaultDefines = defaults.defines
  // Standard properites extracted from NPM package.json values
  const pkgDefines = {
    artifactId: pkg.name,
    description: pkg.description,
    name: pkg.name,
    version: pkg.version
  }
  // Override values from the NPM package.json
  const pkgConfigDefines = _.get(pkg, 'aem-packager.defines', {});
  // Apply configurations from paths
  const pathOptions = {
    dist: paths.npmOut,
    buildTarget: paths.mvnTarget
  }

  _.defaults(
    defines,
    pathOptions,
    pkgConfigDefines,
    pkgDefines,
    defaultDefines
  )

  // Set a safe JCR install path if one was not determined
  defines.jcrPath = _.get(defines, 'jcrPath', getDefaultJCRPath(defines))

  return defines
}

/**
 * Generates the default JCR path
 * @param {Object} defines - The consolidates list of Maven variables
 * @returns {String} the JCR path where the package contents should be installed in AEM
 */
const getDefaultJCRPath = function ( defines ) {
  var segs = [
    '', // force leading slash
    'apps',
    defines.groupId,
    defines.artifactId,
    'clientlibs'
  ]
  return segs.join('/')
}

const [,, ...args] = process.argv // Get command line arguments

const mvn = require('maven').create(defaults.maven.options)
const pkg = require(path.resolve(process.cwd(), 'package.json'))

const options = getOptions(pkg)
const paths = getPaths(options)
const commands = getCommands(paths)
var defines = getDefines(pkg, paths)
// Prepare the variables for the pom.xml
defines = prefixProperties(defines, 'npm')

console.log(`Running AEM Packager with arguments ${args}`)
console.log(`Running AEM Packager with defaults ${defaults}`)

// Run maven to build a package
mvn.execute(commands, defines).then(result => {
  console.log(`AEM package has been created and can be found in ${paths.mvnTarget}`)
}).catch(result => {
  console.error('Failed to compile Maven package. See Maven log for details.')
  process.exit(1)
})
