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

var iotkitlib = require('iotkit');

/**
 * Name of interface this plugin would like to adhere to ({@tutorial plugin})
 * @type {string}
 */
EnableIoTService.prototype.interface = "client-interface";
EnableIoTService.prototype.provides_secure_comm = true;
EnableIoTService.prototype.communicates_via_proxy = true;

/**
 * Create a client that connects to the {@tutorial cloud}. The cloud is described just like any other service:
 * by using a service specification.
 * @param serviceSpec {object} specification for the cloud ({@tutorial service-spec-query})
 * @constructor
 */
function EnableIoTService(serviceSpec) {
  this.spec = serviceSpec;

  var nameParts = this.spec.name.split("/");
  if (!nameParts[nameParts.length - 1] || !nameParts[nameParts.length - 2]) {
    throw new Error(this.spec.name +
    " has an incorrect format. Correct format is [namespace]/sensorType/sensorName");
  }
  this.sensor = nameParts[nameParts.length - 1];
  this.sensorType = nameParts[nameParts.length - 2];
  this.activationCode = this.spec.type_params.activationCode;
  this.deviceID = this.spec.type_params.deviceid;
  activateDevice.call(this);
  registerSensor.call(this);
}

/*
 * Activate a device with the cloud. Once registered, data can be published to the
 * cloud for this device.
 * @param sensor {string} name of the sensor to register
 * @param sensorType {string} supported types are 'temperature.v1.0', 'humidity.v1.0' ({@tutorial cloud})
 */
function activateDevice() {
    var isActivated = iotkitlib.isDeviceActivated(); // if device is already active; no need to activate again

    if(!isActivated) {
        if(!this.activationCode) {
            throw new Error(this.spec.name +
                " does not contain activation code");
        }
        if(!this.deviceID) {
            throw new Error(this.spec.name +
                " does not contain device ID");
        }
        var response = iotkitlib.activateADevice2(this.activationCode, this.deviceID);
        console.log('Device activation Response :', response);
    }
}

/*
 * Register a new sensor with the cloud. Once registered, data can be published to the
 * cloud for this sensor.
 * @param sensor {string} name of the sensor to register
 * @param sensorType {string} supported types are 'temperature.v1.0', 'humidity.v1.0' ({@tutorial cloud})
 */
function registerSensor() {
    var sensorId = iotkitlib.getSensorComponentId(this.sensor);
    if(!sensorId) {
        var response = iotkitlib.addComponent(this.sensor, this.sensorType);
        console.log('Sensor registration response :', response);
    }
}

/**
 * Send a message to the cloud broker. Equivalent to publishing to a topic.
 * @param msg {string} Message to send to cloud broker (see {@tutorial cloud}).
 * @param context {object.<string, string>} context.topic is contains the topic string
 */
EnableIoTService.prototype.send = function (msg, context) {
    var response = iotkitlib.submitData(msg.name, msg.valuestr);
    console.log('Data submit response :', response);
};

/**
 * Set a handler for all received messages.
 * @param handler {function} called when a message is received
 */
EnableIoTService.prototype.setReceivedMessageHandler = function(handler) {
  console.log("WARNING: setReceivedMessageHandler() is not supported because cloud does not send any messages.");
};

/**
 * close connection. Sends FIN to the {@tutorial cloud}.
 */
EnableIoTService.prototype.done = function (context) {
    iotkitlib.iotkit_cleanup();
};

module.exports = EnableIoTService;
