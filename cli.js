#!/usr/bin/env node

/*
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

const path = require('path')

const [,, ...args] = process.argv // Get command line arguments
const pkg = require(path.resolve(process.cwd(), 'package.json')) // Extract the NPM project details

// Define paths used in various steps of the process
const paths = {
  pom: path.resolve(__dirname, 'src/pom.xml'),
  mvnTarget: path.resolve(process.cwd(), 'target'),
  npmOut: path.resolve(process.cwd(), 'dist')
}

// Define defaults when configs are not provided
const defaults = {
  maven: {
    commands: [
      '-f',
      paths.pom,
      'clean',
      'install',
      '-Pnpm' // Force a build profile that lets us set the Maven build target folder
    ],
    defines: {
      name: 'My Project',
      description: 'My Project Description',
      groupId: 'myGroupId',
      artifactId: 'myArtifactId',
      version: '0.0.1',
      buildOutput: paths.npmOut,
      buildTarget: paths.mvnTarget,
      jcrPath: 'etc/designs/myGroupId/myArtifactId'
    },
    options: {}
  }
}
const config = Object.assign({}, defaults)
const mvn = require('maven').create(config.maven.options)

// Default fallback defined in this module
const defaultDefines = defaults.maven.defines
// Get values mapped from standard NPM package.json values
const pkgDefines = {
  artifactId: pkg.name,
  description: pkg.description,
  name: pkg.name,
  version: pkg.version
}

var defines = Object.assign(
  {},
  defaultDefines,
  pkgDefines
)

// Prepare the variables for the pom.xml
defines = prefixProperties(defines, 'npm')
console.log(`Running AEM Packager with arguments ${args}`)
console.log(`Running AEM Packager with defaults ${defaults}`)

mvn.execute(
  config.maven.commands,
  defines
).then(result => {
  console.log(`AEM package has been created and can be found in ${paths.mvnTarget}`)
}).catch(result => {
  console.error('Failed to compile Maven package. See Maven log for details.')
  process.exit(1)
})
