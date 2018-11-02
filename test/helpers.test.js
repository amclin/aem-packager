/* eslint-env mocha */

const expect = require('chai').expect
const { getNPM, prefixProperties } = require('../src/helpers.js')

const _getRandomString = function () {
  return Math.random().toString(36).substring(2, 15)
}

describe('getNPM()', () => {
  it('retrieves value from specified property in process.env with specified prefix.', () => {
    const expected = process.env.npm_config_node_version
    const actual = getNPM('node_version', 'npm_config_')
    expect(actual).to.equal(expected)
  })

  it('uses the prefix \'npm_package_\' when no prefix is provided.', () => {
    const expected = process.env.npm_package_name
    const actual = getNPM('name')
    expect(actual).to.equal(expected)
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
