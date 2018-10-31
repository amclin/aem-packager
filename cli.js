#!/usr/bin/env node

const [,, ...args] = process.argv // Get command line arguments
const path = require('path')

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
      npmName: 'My Project',
      npmDescription: 'My Project Description',
      npmGroupId: 'myGroupId',
      npmArtifactId: 'myArtifactId',
      npmVersion: '0.0.1',
      npmBuildOutput: paths.npmOut,
      npmBuildTarget: paths.mvnTarget,
      npmJcrPath: 'etc/designs/myGroupId/myArtifactId'
    },
    options: {}
  }
}
const config = Object.assign({}, defaults)
const mvn = require('maven').create(config.maven.options)

console.log(`Running AEM Packager with arguments ${args}`)
console.log(`Running AEM Packager with defaults ${defaults}`)

mvn.execute(
  config.maven.commands,
  config.maven.defines
).then(result => {
  console.log(`AEM package has been created and can be found in ${paths.mvnTarget}`)
}).catch(result => {
  console.error('Failed to compile Maven package. See Maven log for details.')
  process.exit(1)
})
