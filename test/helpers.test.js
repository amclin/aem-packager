/* eslint-env mocha */

const expect = require('chai').expect
const {
  getCommands,
  getNPM,
  getProjectConfigs,
  getConfigsFromProcess,
  prefixProperties
} = require('../src/helpers.js')

const _getRandomString = function () {
  return Math.random().toString(36).substring(2, 15)
}

describe('getCommands()', () => {
  it('returns an array with the specified string in the correct order', () => {
    const test = _getRandomString()
    const expected = ['-f', test, 'clean', 'install', '-Pnpm']
    const actual = getCommands(test)
    expect(actual).to.deep.equal(expected)
  })
})

describe('getNPM()', () => {
  it('retrieves value from specified property in process.env with specified prefix.', () => {
    const expected = process.env.npm_config_node_version
    const actual = getNPM('node_version', 'npm_config_')
    const util = require('util')
    console.log(util.inspect(process.env, false, null, true /* enable colors */))
    expect(actual).to.equal(expected)
  })

  it('uses the prefix \'npm_package_\' when no prefix is provided.', () => {
    const expected = process.env.npm_package_name
    const actual = getNPM('name')
    expect(actual).to.equal(expected)
  })
})

describe('getProjectConfigs()', () => {
  it('retrieves the artifactId, description, name, and version from the process.', () => {
    const result = getProjectConfigs()
    const keys = ['name', 'version', 'description']
    keys.forEach((key) => {
      expect(result[key]).to.equal(process.env['npm_package_' + key])
    })
    expect(result.artifactId).to.equal(process.env.npm_package_name)
  })
})

describe('getConfigsFromProcess()', () => {
  it('retrieves specified configuration key map from process.env.npm_package_aem_packager namespace', () => {
    const space = 'npm_package_aem_packager'
    const key = 'key' + _getRandomString()
    const subkey = 'subKey' + _getRandomString()
    const expected = _getRandomString()
    const envKey = [space, key, subkey].join('_')
    const testObj = {}
    testObj[key] = {}
    testObj[key][subkey] = _getRandomString()
    // Put dummy data into process.env for testing
    process.env[envKey] = expected
    const result = getConfigsFromProcess(testObj)
    expect(result[key][subkey]).to.equal(expected)
  })
})

describe('prefixProperties()', () => {
  var testPrefix
  var testProperty
  var testValue
  var expectedProperty
  var testObj
  var resultObj

  beforeEach(() => {
    // Setup random values for each test
    testPrefix = _getRandomString()
    testProperty = _getRandomString()
    testValue = _getRandomString()
    expectedProperty = testPrefix + testProperty
    testObj = {
      [testProperty]: testValue
    }
  })

  it('mutates the original object as well as returns it', () => {
    resultObj = prefixProperties(testObj, testPrefix)
    expect(resultObj).to.equal(testObj) // Test assignmnet matches Mutated object
  })

  it('creates new properties using the provided prefix', () => {
    resultObj = prefixProperties(testObj, testPrefix)
    expect(resultObj[expectedProperty]).to.equal(testValue)
  })

  it('removes the original properties', () => {
    resultObj = prefixProperties(testObj, testPrefix)
    expect(resultObj[testProperty]).to.be.an('undefined')
  })
})
