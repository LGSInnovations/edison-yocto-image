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
 * @module test/customComm
 * @see {@link module:test/customComm~service}
 * @see {@link module:test/customComm~client}
 */

var path = require('path');
var expect = require('chai').expect;

describe('[customComm]', function () {

  /**
   * Service that uses iotkit service directory to advertise itself, but implements
   * it own communication protocol (i.e. no communication plugin is used).
   * @function module:test/customComm~service
   * @see {@link module:test/customComm~client}
   */
  function customCommService() {
    // read service specification
    var iotkit = require('iotkit-comm');
    var spec = new iotkit.ServiceSpec(path.join(__dirname, "resources/specs/9888-service-custom-comm.json"));

    // create service
    var net = require('net');
    var server = net.createServer(function (c) { //'connection' listener
      c.on('data', function (msg) {
        c.write(msg);
      });
    });

    // start service
    server.listen(spec.port, function () {
      // advertise service on LAN
      var directory = new iotkit.ServiceDirectory();
      directory.advertiseService(spec);
    });
  }

  before(function () {
    customCommService();
  });

  /**
   * Client to a service that's using a custom communication protocol (i.e. not using a plugin).
   * This client assumes that the service is advertising itself on the LAN (using
   * the iotkit service directory)
   * @function module:test/customComm~client
   * @see {@link module:test/customComm~service}
   */
  it("should successfully create client that connects to above service",
    function (done) {
      var iotkit = require('iotkit-comm');
      var serviceDirectory = new iotkit.ServiceDirectory();
      var query = new iotkit.ServiceQuery(path.join(__dirname, "resources/queries/service-query-custom-comm.json"));
      serviceDirectory.discoverServices(query, function (serviceSpec) {
        var net = require('net');
        var client = net.connect({port: serviceSpec.port, host: serviceSpec.address},
          function () {
            client.write('hello');
          });
        client.on('data', function (data) {
          expect(data.toString()).to.equal("hello");
          client.end();
        });
        client.on('end', function () {
          done();
        });
      });
    }
  );
});