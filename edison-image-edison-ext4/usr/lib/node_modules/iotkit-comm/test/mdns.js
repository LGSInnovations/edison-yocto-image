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
 * Tests mDNS service discovery and advertisement.
 * @module test/mdns
 * @see {@link module:test/mdns~discover}
 * @see {@link module:test/mdns~discover_connect}
 * @see {@link module:test/mdns~dummyService}
 */

var path = require('path');
var expect = require('chai').expect;

describe('[mdns][sanity]', function () {
  /**
   * Dummy service to test mDNS service discovery and advertisement. This service is a mini MQTT broadcast
   * broker.
   * @see {@link module:test/mdns~discover}
   * @see {@link module:test/mdns~discover_connect}
   * @function module:test/mdns~dummyService
   */
  function dummyService() {
    var iotkit = require('iotkit-comm');
    var path = require('path');
    var spec = new iotkit.ServiceSpec(path.join(__dirname, "resources/specs/1886-dummy-service-zmq-pubsub.json"));
    iotkit.createService(spec, function (service) {
      setInterval(function () {
        service.comm.send("my message");
      }, 300);
    });
  }

  before(function () {
    dummyService();
  });

  describe('#discover', function () {
    /**
     * Tests if a service can be found on the LAN. Expects a dummy service to be running on the LAN
     * and advertising itself. So this test actually tests both advertising and discovery.
     * @function module:test/mdns~discover
     */
    it("should be able to find a service for the given query", function (done) {
      var iotkit = require('iotkit-comm');
      var serviceDirectory = new iotkit.ServiceDirectory();
      var query = new iotkit.ServiceQuery(path.join(__dirname, "resources/queries/dummy-service-query-zmq-pubsub.json"));
      serviceDirectory.discoverServices(query, function (serviceSpec) {
        expect(serviceSpec.properties.dataType).to.equal("float");
        done();
      });
    });
  });

  describe('#discover-connect', function () {
    /**
     * Tests if a service can be found and connected to on the LAN. Expects a dummy service to be
     * running on the LAN and advertising itself. Notice that in iotkit, no explicit IP
     * addresses or protocol-specific code is needed to connect to a service. Connecting to a service of
     * a given type requires only that the service query mention that type.
     * @function module:test/mdns~discover_connect
     * @see {@tutorial service-spec-query}
     */
    it("should be able to find a service for the given query and connect to it", function (done) {
      var iotkit = require('iotkit-comm');
      var serviceDirectory = new iotkit.ServiceDirectory();
      var query = new iotkit.ServiceQuery(path.join(__dirname, "resources/queries/dummy-service-query-zmq-pubsub.json"));
      serviceDirectory.discoverServices(query, function (serviceSpec) {
        expect(serviceSpec.properties.dataType).to.equal("float");
        iotkit.createClient(serviceSpec, function (client) {
          client.comm.setReceivedMessageHandler(function (message, context) {
            expect(context.event).to.equal("message");
            expect(message.toString()).to.equal("my message");
            // close client connection
            client.comm.done();
            done();
          });
        });
      });
    });
  });

});