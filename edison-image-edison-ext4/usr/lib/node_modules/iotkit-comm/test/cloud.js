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
 * Tests interaction (authentication, data publication etc.) with the cloud.
 * @module test/cloud
 * @see {@link module:test/cloud~publish|test publishing data to cloud}
 * @see {@link module:test/cloud~subscribe|test subscribing to data from cloud}
 */

var expect = require('chai').expect;
var path = require('path');

describe('[cloud]', function () {

  describe('[publish]', function () {
    /**
     * @function module:test/cloud~publish
     */
    it("should successfully publish data to the cloud", function(done) {
      var iotkit = require('iotkit-comm');
      var spec = new iotkit.ServiceSpec(path.join(__dirname, "resources/specs/1884-temp-service-enableiot-cloud.json"));
      iotkit.createService(spec, function (service) {
        setInterval(function () {
          service.comm.send({name:'garage_sensor', valuestr: '68'});
        }, 500);
        done();
      });
    });
  });

  describe('[subscribe]', function () {
    /**
     * @function module:test/cloud~subscribe
     */
    it("should successfully subscribe to data from the cloud", function(done) {
      var iotkit = require('iotkit-comm');
      var spec = new iotkit.ServiceSpec(path.join(__dirname, "resources/specs/1884-temp-service-enableiot-cloud.json"));
      iotkit.createClient(spec, function (client) {
        client.comm.setReceivedMessageHandler(function(message, context) {
          expect(message.data.series[0].points[0].value).to.equal('68');
          client.comm.done();
          done();
        });
      });
    });
  });

});
