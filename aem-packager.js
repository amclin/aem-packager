#!/usr/bin/env node
const Console = console
Console.log('Starting AEM Packager.')

const {
  getCommands,
  getConfigsFromProcess,
  getProjectConfigs,
  prefixProperties
} = require('./src/helpers.js')
const path = require('path')
const _ = require('lodash')

// Define defaults when configs are not provided
const defaults = require('./src/defaults.json')

var configs = {}
_.defaults(
  configs,
  getConfigsFromProcess(defaults),
  getProjectConfigs(),
  defaults
)

/**
 * Parses the settings to generate a paths object containing
 * the various paths used in AEM and the build process
 * @param {Object} - plugin options object
 * @returns {Object} - paths
 */
const getPaths = function (options) {
  Console.debug('Processing Paths.')
  return {
    pom: path.resolve(__dirname, 'src/pom.xml'),
    mvnTarget: path.resolve(process.cwd(), options.buildDir),
    npmOut: path.resolve(process.cwd(), options.srcDir)
  }
}

/**
 * Generates the default JCR path
 * @param {Object} defines - The consolidates list of Maven variables
 * @returns {String} the JCR path where the package contents should be installed in AEM
 */
const getDefaultJCRPath = function (defines) {
  Console.debug('Generating a default JCR installation path.')
  var segs = [
    '', // force leading slash
    'apps',
    defines.groupId,
    defines.artifactId,
    'clientlibs'
  ]
  return segs.join('/')
}

/**
 * Gets a consolidated list of Maven defines from the various sources
 # @param {Object} paths - List of module paths
 */
const getDefines = function (paths) {
  Console.debug('Processing list of Defines.')
  var defines = {}
  var pkgDefines = getProjectConfigs()
  var pkgConfigDefines = {}
  const definesList = Object.keys(defaults.defines) // List of known defines for aem-packager

  // Get the list of defines NPM package.json
  definesList.forEach(function (prop) {
    pkgConfigDefines[prop] = getNPM(prop, 'npm_package_aem_packager_defines_')
  })

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
    defaults.defines // Default fallback defined in this module
  )

  // Set a safe JCR install path if one was not determined
  defines.jcrPath = _.get(defines, 'jcrPath', getDefaultJCRPath(defines))

  return defines
}

// Get command line arguments
// const [,, ...args] = process.argv

const mvn = require('maven').create({})

const paths = getPaths(configs.options)
const commands = getCommands(paths.pom)
var defines = getDefines(paths)
// Prepare the variables for the pom.xml
defines = prefixProperties(defines, 'npm')

Console.log(`Running AEM Packager for ${defines.npmgroupId}.${defines.npmartifactId}`)

// Run maven to build a package
mvn.execute(commands, defines).then((result) => {
  Console.log(`AEM package has been created and can be found in ${paths.mvnTarget}`)
}).catch((result) => {
  Console.error('Failed to compile Maven package. See Maven log for details.')
  process.exit(1)
})
