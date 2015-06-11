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
 * @file The thermostat. Collects temperature readings from sensors distributed around
 * the house. Assumes all sensors are on the same LAN. As readings are received, a
 * cumulative moving average temperature is computed and published. An application like
 * a 'home dashboard' can then subscribe to this near real-time mean temperature and
 * display it.
 * @see {@link example/distributed-thermostat/temperature-sensor.js}
 * @see {@link example/distributed-thermostat/dashboard.js}
 * @see {@link http://zeromq.org/}
 */
var iotkit = require('iotkit-comm');

// create a query for temperature sensors on the network
// the query in 'temperature-sensor-query.json' looks for only those sensors
// that are publishing ambient floating-point temperatures.
var sensorQuery = new iotkit.ServiceQuery('temperature-sensor-query.json');

// no. of sensors this thermostat is subscribing to
var sensorCount = 0;

// maybe better to use a simple moving average, but then again,
// this is just a demo of how to use iotkit
var cumulativeMovingAverage = 0;

// no. of temperature samples received from all sensors until now
var sampleCount = 0;

// service instance to publish the latest mean temperature
var mypublisher = null;

// whenever a temperature sensor is found, the callback is called with a new
// 'client' instance. This instance can be used to communicate
// with the corresponding sensor.
iotkit.createClient(sensorQuery, function (client) {

  console.log("Found new temperature sensor - " + client.spec.address + ':' + client.spec.port);

  // When messages arrive, execute the given callback
  client.comm.setReceivedMessageHandler(msgHandler);

  function msgHandler(msg) {

    console.log("Received sample temperature " + msg + " from " +
      client.spec.address + ":" + client.spec.port);

    // compute the mean of the temperatures as they arrive
    cumulativeMovingAverage = (parseInt(msg) + sampleCount * cumulativeMovingAverage) / (sampleCount + 1);
    sampleCount++;

    console.log("New average ambient temperature (cumulative): " + cumulativeMovingAverage);

    // the master (thermostat) publishes the average temperature so others
    // can subscribe to it. See distributed-thermostat/dashboard.js
    if (mypublisher) mypublisher.comm.send(cumulativeMovingAverage);
  }
}, serviceFilter);

// If this function returns false a client instance for the respective temperature
// sensor is not returned. In other words, the callback in the third argument
// of 'createClient' above is not called when this function returns 'false'.
function serviceFilter(serviceSpec) {

  // only want ambient temperature sensors
  if (serviceSpec.properties.sensorType !== 'ambient')
    return false;

  // will accept only 10 temperature sensors
  if (sensorCount === 10) {
    return false;
  }
  sensorCount++;
  return true;
}

// create the service that will publish the latest mean temperature
var spec = new iotkit.ServiceSpec('thermostat-spec.json');
iotkit.createService(spec, function (service) {
  mypublisher = service;
});
