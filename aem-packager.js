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

// Define default fallbacks for all unset configs
const defaults = require('./src/defaults.json')

// Merge configurations from various sources
var configs = {}
_.defaultsDeep(
  configs,
  getConfigsFromProcess(defaults),
  {
    defines: getProjectConfigs()
  },
  defaults
)

/**
 * Resolves a path relative to the command being run
 * @param {String} p - path to resolve
 */
const resolvePath = function (p) {
  return path.resolve(process.cwd(), p)
}

/**
 * Generates the default JCR path
 * @param {Object} opts - Must contain 2 properties: groupId and artifactId
 * @returns {String} the JCR path where the package contents should be installed in AEM
 */
const getDefaultJCRPath = function (opts) {
  Console.debug('Generating a default JCR installation path.')
  var segs = [
    '', // force leading slash
    'apps',
    opts.groupId,
    opts.artifactId,
    'clientlibs'
  ]
  return segs.join('/')
}

/**
 * Gets a consolidated list of Maven defines from the various sources
 * @param {Object} configs - Plugin configurations
 */
const getDefines = function (configs) {
  Console.debug('Processing list of Defines.')
  var defines = {}
  // Apply configurations from paths
  const pathOptions = {
    srcDir: resolvePath(configs.options.srcDir),
    buildDir: resolvePath(configs.options.buildDir)
  }

  _.defaults(
    defines,
    pathOptions,
    configs.defines
  )

  // Set a safe JCR install path if one was not determined
  defines.jcrPath = _.get(defines, 'jcrPath', getDefaultJCRPath(defines))
  Console.debug(`Package contents will be installed to ${defines.jcrPath}`)

  return defines
}

// Get command line arguments
// const [,, ...args] = process.argv

const mvn = require('maven').create({})

const pomPath = path.resolve(__dirname, 'src/pom.xml')
const commands = getCommands(pomPath)
var defines = getDefines(configs)
// Prepare the variables for the pom.xml
defines = prefixProperties(defines, 'npm')

Console.log(`Running AEM Packager for ${defines.npmgroupId}.${defines.npmartifactId}`)

// Run maven to build a package
mvn.execute(commands, defines).then((result) => {
  Console.log(`AEM package has been created and can be found in the current user's Maven package repository or in ./${configs.options.buildDir}`)
}).catch((result) => {
  Console.error(result)
  Console.error('Failed to compile Maven package. See Maven log for details.')
  process.exit(1)
})
