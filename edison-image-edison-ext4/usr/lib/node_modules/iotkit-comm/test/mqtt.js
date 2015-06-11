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
 * Tests the MQTT plugin using various clients. The clients assume that an MQTT broker already exists. For this
 * test suite, the mosquitto broker and a mini broker built using the iotkit library is used. The suite features clients
 * that connect directly to a broker at a known address, clients that discover a broker and connect to it, and clients
 * that connect to a broker that is being used as a proxy by another client (Essentially, this client is acting like a
 * service by using the broker as a proxy.)
 * @module test/mqtt
 * @see {@link module:test/mqtt~direct_publisher}
 * @see {@link module:test/mqtt~direct_subscriber}
 * @see {@link module:test/mqtt~discover_publisher}
 * @see {@link module:test/mqtt~discover_subscriber}
 * @see {@link module:test/mqtt~discover_direct}
 * @see {@link module:test/mqtt~client_as_a_service}
 * @see {@link module:test/mqtt~subscribe_to_client_as_a_service}
 * @see {@link module:test/mqtt~mqttMiniBroker}
 */

var path = require('path');
var expect = require('chai').expect;

describe('[mqtt]', function () {
  /**
   * Publishes data directly to (i.e. without discovering) an MQTT broker (e.g. mosquitto) on topic 'mytopic'.
   * Preconditions are that the MQTT broker is running on a known address and port, and the broker specification
   * file {@link example/serviceSpecs/mqtt-borker-spec.json} has the address and port fields
   * correctly set. No changes are needed if this program is run on the Edison. Each Edison comes with a
   * running broker and the address and port fields of the specification file are set to '127.0.0.1' and '1883'
   * (see {@tutorial service-spec-query}).
   * @function module:test/mqtt~direct_publisher
   */
  it("should successfully publish to mosquitto broker",
    function (done) {
      var iotkit = require('iotkit-comm');
      var spec = new iotkit.ServiceSpec(path.join(__dirname, "resources/specs/1883-temp-service-mqtt.json"));
      iotkit.createService(spec, function (client) {
        setInterval(function () {
          client.comm.send("my other message");
        }, 200);
        done();
      });
    });

  /**
   * Subscribes to data directly from (i.e. without discovering) an MQTT broker (e.g. mosquitto) on topic 'mytopic'.
   * Preconditions are that the MQTT broker is running on a known address and port, and the broker specification
   * file {@link example/serviceSpecs/mqtt-borker-spec.json} has the address and port fields
   * correctly set. No changes are needed if this program is run on the Edison. Each Edison comes with a
   * running broker and the address and port fields of the specification file are set to '127.0.0.1' and '1883'
   * (see {@tutorial service-spec-query}).
   * @function module:test/mqtt~direct_subscriber
   */
  it("should successfully subscribe to data from mosquitto broker",
    function (done) {
      var iotkit = require('iotkit-comm');

      var spec = new iotkit.ServiceQuery(path.join(__dirname, "resources/queries/temp-service-query-mqtt.json"));
      iotkit.createClient(spec, function (client) {
        client.comm.setReceivedMessageHandler(function (message, context) {
          expect(context.event).to.equal("message");
          expect(message).to.equal("my other message");
          client.comm.done();
          done();
        });
      });
    });
});