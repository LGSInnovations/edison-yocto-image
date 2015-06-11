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
 * @file A dummy 'dashboard' to display mean temperature received from
 * the thermostat. In this example, the thermostat is receiving temperatures
 * published periodically by sensors and computing a cumulative mean of the
 * temperature data. The latest mean is then published as and when it is computed
 * @see {@link example/distributed-thermostat/thermostat.js}
 */

var iotkit = require('iotkit-comm');

// create service query to find the thermostat
var thermostatQuery = new iotkit.ServiceQuery('thermostat-query.json');

// create a client that subscribes to the mean temperature
// from the thermostat
iotkit.createClient(thermostatQuery, function (client) {
  client.comm.setReceivedMessageHandler(msgHandler);
});

// print mean temperature received from the thermostat
function msgHandler(msg) {
  console.log("Received mean temperature " + msg);
}