#!/usr/bin/env node
const Console = console
Console.log('Starting AEM Packager.')

const _ = require('lodash')
const commandLineArgs = require('command-line-args')
const mvn = require('maven')
const path = require('path')
const { getConfig } = require('read-config-file')
const {
  getCommands,
  getConfigsFromPackage,
  getProjectConfigs,
  prefixProperties
} = require('./src/helpers.js')

// Define default fallbacks for all unset configs
const defaults = require('./src/defaults.json')
const { assemblePom, writePom } = require('./src/template.js')
defaults.options.jcrPath = undefined // Set here so it exists when we loop later. Cannot be declared undefined in JSON

// Merge configurations from various sources
const configs = {}
_.defaultsDeep(
  configs,
  getConfigsFromPackage(),
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
 * Attempts to load configs from a specified file
 * @param {String} configPath file to load
 * @returns {Promise} loader
 */
const loadConfigs = async function (configPath) {
  configPath = path.resolve(configPath)
  return getConfig('', configPath).then((result) => {
    Console.log(`Loaded configuration from ${configPath}`)
    return result.result
  }, (err) => {
    Console.error(`Could not load the specified configuration file from ${configPath}`)
    Console.error(err)
    process.exit(1)
  })
}

/**
 * Generates the default JCR path
 * @param {Object} opts - Must contain 2 properties: groupId and artifactId
 * @returns {String} the JCR path where the package contents should be installed in AEM
 */
const getDefaultJCRPath = function (opts) {
  Console.debug('Generating a default JCR installation path.')
  const segs = [
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
  const defines = {}
  // Apply configurations from paths
  const pathOptions = {
    srcDir: resolvePath(configs.options.srcDir),
    buildDir: resolvePath(configs.options.buildDir),
    jcrPath: configs.options.jcrPath // Doesn't use resolvePath() because this is not a filesystem path
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

/**
 * Runs the Maven packaging steps
 * @param {Object} configs Fully processed configuration object
 */
const runMvn = function (configs) {
  writePom(
    assemblePom({
      ...configs.options
    })
  )

  const pomPath = path.resolve(__dirname, 'src', 'pom.xml')
  const commands = getCommands(pomPath)
  let defines = getDefines(configs)
  // Prepare the variables for the pom.xml
  defines = prefixProperties(defines, 'npm')
  Console.log(`Running AEM Packager for ${defines.npmgroupId}.${defines.npmartifactId}`)
  // Run maven to build a package
  mvn.create({}).execute(commands, defines).then((result) => {
    Console.log(`AEM package has been created and can be found in the current user's Maven package repository or in ./${configs.options.buildDir}`)
  }).catch((result) => {
    Console.error(result)
    Console.error('Failed to compile Maven package. See Maven log for details.')
    process.exit(1)
  })
}

/**
 * Main entry function to run aem-packager
 */
const packageAEM = function () {
  // Get command line arguments
  const optionDefinitions = [
    { name: 'config', alias: 'c', type: String, multiple: false, defaultOption: true }
  ]
  const args = commandLineArgs(optionDefinitions)

  if (args.config) {
    // Config file is specified so try to load it
    loadConfigs(args.config).then((result) => {
      // Merge with the other configs
      _.defaultsDeep(
        result,
        configs
      )
      runMvn(result)
    })
  } else {
    // No config file, use only package.json and defaults
    runMvn(configs)
  }
}

packageAEM()
