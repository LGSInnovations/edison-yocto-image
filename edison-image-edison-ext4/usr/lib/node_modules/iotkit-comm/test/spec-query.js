/*
 * Copyright (c) 2014 Intel Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Tests if a service query is correctly validated
 * @module test/specAndQuery
 * @see {@link module:test/specAndQuery~wellformedQuery}
 * @see {@link module:test/specAndQuery~wellformedSpec}
 * @see {@link module:test/specAndQuery~NonExistantQuery}
 * @see {@link module:test/specAndQuery~NonExistantSpec}
 * @see {@link module:test/specAndQuery~malformedQuery}
 */

var expect = require('chai').expect;
var path = require('path');

describe('[spec and query]', function () {

  /**
   * @function module:test/specAndQuery~wellformedQuery
   */
  it("should validate a correct query without throwing an error", function() {
    var iotkit = require('iotkit-comm');
    var query = new iotkit.ServiceQuery(path.join(__dirname, "resources/queries/temp-service-query-mqtt.json"));
    expect(query.name).to.be.a('string');
  });

  /**
   * @function module:test/specAndQuery~wellformedSpec
   */
  it("should validate a correct spec without throwing an error", function() {
    var iotkit = require('iotkit-comm');
    var spec = new iotkit.ServiceSpec(path.join(__dirname, "resources/specs/1883-temp-service-mqtt.json"));
    expect(spec.name).to.be.a('string');
  });

  /**
   * @function module:test/specAndQuery~malformedQuery
   */
  it("should fail if a query contains both address and port", function(done) {
    var iotkit = require('iotkit-comm');
    try {
      var spec = new iotkit.ServiceQuery(path.join(__dirname, "resources/specs/temp-service-query-mqtt.json"));
    } catch (err) {
      done();
    }
  });

  /**
   * @function module:test/specAndQuery~NonExistantQuery
   */
  it("should throw error when query is not present", function(done) {
    var iotkit = require('iotkit-comm');
    try {
      var spec = new iotkit.ServiceQuery(path.join(__dirname, "resources/queries/does-not-exist.json"));
    } catch (err) {
      done();
    }
  });

  /**
   * @function module:test/specAndQuery~NonExistantSpec
   */
  it("should throw error when spec is not present", function(done) {
    var iotkit = require('iotkit-comm');
    try {
      var spec = new iotkit.ServiceSpec(path.join(__dirname, "resources/specs/does-not-exist.json"));
    } catch (err) {
      done();
    }
  });
});