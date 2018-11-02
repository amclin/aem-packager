/* eslint-env mocha */

const expect = require('chai').expect
const { prefixProperties } = require('../src/helpers.js')

const _getRandomString = function () {
  return Math.random().toString(36).substring(2, 15)
}

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
