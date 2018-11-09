/* eslint-env mocha */

const expect = require('chai').expect
const {
  getCommands,
  getConfigsFromProcess,
  getProjectConfigs,
  getPackageName,
  getPackageScope,
  prefixProperties
} = require('../src/helpers.js')

/**
 * Generates a random alphanumeric string
 */
const _getRandomString = function () {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Sets a global value in process.env
 * @param {String} key property in process.env to set
 * @param {Any} value value to popluate
 */
const _setEnv = function (key, value) {
  process.env[key] = value
}

describe('getCommands()', () => {
  it('returns an array with the specified string in the correct order', () => {
    const test = _getRandomString()
    const expected = ['-f', test, 'clean', 'install', '-Pnpm']
    const actual = getCommands(test)
    expect(actual).to.deep.equal(expected)
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

describe('getPackageName()', () => {
  it('retrieves the name used of the package running NPM process.', () => {
    const expected = 'test' + _getRandomString()
    _setEnv('npm_package_name', expected)
    const actual = getPackageName()
    expect(actual).to.equal(expected)
  })
  it('strips out the prefix for scoped packages', () => {
    const expected = 'test' + _getRandomString()
    const packageName = ['@', _getRandomString(), '/', expected].join('')
    _setEnv('npm_package_name', packageName)
    const actual = getPackageName()
    expect(actual).to.equal(expected)
  })
})

describe('getPackageScope()', () => {
  it('retrieves the scope used as a prefix on running NPM package name.', () => {
    const expected = 'test' + _getRandomString()
    const packageName = ['@', expected, '/', _getRandomString()].join('')
    _setEnv('npm_package_name', packageName)
    const actual = getPackageScope()
    expect(actual).to.equal(expected)
  })
  it('returns undefined when there is no scope in the running NPM package name.', () => {
    const packageName = 'test' + _getRandomString()
    _setEnv('npm_package_name', packageName)
    const actual = getPackageScope()
    expect(actual).to.be.an('undefined')
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
