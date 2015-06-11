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
 * Tests the zmq plugin using various clients. Clients are either subscribers in the zmq pub/sub model
 * or requesters in the zmq req/rep model. In each case the client first discovers the service (a publisher
 * or replier) and then interacts with it.
 * @module test/zmq
 * @see {@link module:test/zmq~subscriber}
 * @see {@link module:test/zmq~requester}
 * @see {@link module:test/zmq~publisher}
 * @see {@link module:test/zmq~replier}
 */

var path = require('path');
var expect = require('chai').expect;

describe('[zmq]', function () {

  /**
   * ZMQ service that publishes data on topic "mytopic". Used to test
   * a ZMQ subscriber.
   * @see {@link http://zeromq.org}
   * @see {@link module:test/zmq~subscriber}
   */
  function publisher() {
    var iotkit = require('iotkit-comm');
    var path = require('path');
    var spec = new iotkit.ServiceSpec(path.join(__dirname, "resources/specs/1885-temp-service-zmq-pubsub.json"));
    iotkit.createService(spec, function (service) {
      setInterval(function () {
        service.comm.send("my message");
      }, 300);
    });
  }

  /**
   * ZMQ service that replies to requests. Used to test
   * a ZMQ requester. Any request string results in the reply "hi"
   * @see {@link http://zeromq.org}
   * @see {@link module:test/zmq~replier}
   */
  function replier() {
    var iotkit = require('iotkit-comm');
    var path = require('path');

    var spec = new iotkit.ServiceSpec(path.join(__dirname, "resources/specs/8333-temp-service-zmq-reqrep.json"));
    iotkit.createService(spec, function (service) {
      service.comm.setReceivedMessageHandler(function(msg, context, client) {
        service.comm.send("hi");
      });

    });
  }

  before(function () {
    publisher();
    replier();
  });

  // The mdns browser returns all new services it finds. This means, that once it
  // finds a service record, it won't find it again unless that service went down and came back up.
  // Since the service we want to discover is not restarted between tests, just restart the
  // service browser for each test.
  beforeEach(function() {
    var iotkit = require('iotkit-comm');
  });

  describe('#subscriber', function () {
    /**
     * Subscribes to topic "mytopic" from a ZMQ publisher.
     * @see {@link example/zmq-publisher.js}
     * @function module:test/zmq~subscriber
     */
    it("should successfully subscribe to messages from ZMQ publisher",
      function(done) {
        var iotkit = require('iotkit-comm');
        var query = new iotkit.ServiceQuery(path.join(__dirname, "resources/queries/temp-service-query-zmq-pubsub.json"));
        iotkit.createClient(query, function (client) {
            client.comm.setReceivedMessageHandler(function(message, context) {
              expect(context.event).to.equal("message");
              expect(message.toString()).to.equal("my message");

              // close client connection
              client.comm.done();
              done();
            });
          },
          function (serviceSpec) {
            return true;
          });
      });
  }); // end #subscriber

  describe("#requester", function() {

    /**
     * Sends a request string to ZMQ replier. Any request should result in
     * the reply "hi".
     * @see {@link example/zmq-replier.js}
     * @function module:test/zmq~requester
     */
    it("should successfully receive reply from a ZMQ replier", function(done) {
      var iotkit = require('iotkit-comm');
      var query = new iotkit.ServiceQuery(path.join(__dirname, "resources/queries/temp-service-query-zmq-reqrep.json"));
      iotkit.createClient(query,
        function (client) {
          client.comm.setReceivedMessageHandler(function(message, context) {
            expect(context.event).to.equal("message");
            expect(message.toString()).to.equal("hi");
            client.comm.done();
            done();
          });
          client.comm.send("hello");
        },
        function (serviceSpec) {
          return true;
        }
      );
    });
  }); // end #requester

});