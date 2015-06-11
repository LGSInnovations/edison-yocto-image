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
 * @file A dummy temperature sensor. Randomly chooses a reasonable
 * integer to publish as temperature. The thermostat looks for these
 * sensors (on the same LAN) and subscribes to the temperatures they
 * publish. Those temperatures are then accumulated into a mean
 * temperature.
 * @see {@link example/distributed-thermostat/thermostat.js}
 */
var iotkit = require('iotkit-comm');

// read the spec that describes the temperature sensing service
var spec = new iotkit.ServiceSpec('temperature-sensor-spec.json');

// would normally use 'port' number in spec, however, in this case, makes
// it easy to run many temperature sensors on the same local machine (low
// likelihood of 'address in use' errors)
spec.port = getRandomInt(8000, 60000);

// create the temperature sensing service described by the spec
// read above.
iotkit.createService(spec, function (service) {

  // periodically publish sensed temperature. The thermostat
  // will eventually find this sensor and subscribe to the
  // temperature being published.
  setInterval(function () {
    service.comm.send(getRandomInt(60, 90));
  }, 1000);
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}