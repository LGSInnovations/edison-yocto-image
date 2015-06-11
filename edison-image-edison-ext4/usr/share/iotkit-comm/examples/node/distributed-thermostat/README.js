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
 * A thermostat that collects temperatures from sensors (on the same LAN)
 * as they are published. In this example, sensors (temperature-sensor.js)
 * periodically publish the temperature they are sensing and the thermostat (thermostat.js)
 * subscribes to this temperature data. The thermostat then computes a cumulative moving
 * average of the temperatures received and publishes it for others to subscribe.
 * Specifically, there is a dummy dashboard (dashboard.js) that subscribes to this mean temperature
 * and displays it.
 *
 * @see Tutorial on writing a [distributed application]{@tutorial apps}
 * @see {@link example/distributed-thermostat/temperature-sensor.js}
 * @see {@link example/distributed-thermostat/temperature-sensor-spec.js}
 * @see {@link example/distributed-thermostat/temperature-sensor-query.js}
 * @see {@link example/distributed-thermostat/thermostat.js}
 * @see {@link example/distributed-thermostat/thermostat-spec.js}
 * @see {@link example/distributed-thermostat/thermostat-query.js}
 * @see {@link example/distributed-thermostat/dashboard.js}
 *
 * @module example/distributedThermostat
 */