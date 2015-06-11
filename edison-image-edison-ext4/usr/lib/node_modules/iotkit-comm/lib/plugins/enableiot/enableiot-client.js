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
EnableIoTClient.prototype.interface = "client-interface";
EnableIoTClient.prototype.provides_secure_comm = true;
EnableIoTClient.prototype.communicates_via_proxy = true;

var receivedMsgHandler;
var sensor = '';
var sensorType = '';
var activationCode = '';
var deviceID = '';
var subscribeTo = '';
var frequencyInterval = '';
var currentTime = 0;
var previousTime = 0;
/**
 * Create a client that connects to the {@tutorial cloud}. The cloud is described just like any other service:
 * by using a service specification.
 * @param serviceSpec {object} specification for the cloud ({@tutorial service-spec-query})
 * @constructor
 */
function EnableIoTClient(serviceSpec) {
  this.spec = serviceSpec;
  var deviceconfig;

  var self = this;

  var nameParts = this.spec.name.split("/");
  if (!nameParts[nameParts.length - 1] || !nameParts[nameParts.length - 2]) {
    throw new Error(this.spec.name +
        " has an incorrect format. Correct format is [namespace]/sensorType/sensorName");
  }
  sensor = nameParts[nameParts.length - 1];
  sensorType = nameParts[nameParts.length - 2];
  activationCode = this.spec.type_params.activationCode;
  deviceID = this.spec.type_params.deviceid;
  subscribeTo = this.spec.type_params.subscribeto;
  frequencyInterval = this.spec.type_params.frequencyInterval;

  activateDevice.call(this);
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
        if(!activationCode) {
            throw new Error(this.spec.name +
                " does not contain activation code");
        }
        if(!deviceID) {
            throw new Error(this.spec.name +
                " does not contain device ID");
        }
        var response = iotkitlib.activateADevice2(activationCode, deviceID);
    }
}

EnableIoTClient.prototype.send = function(msg, context) {
  throw new Error("send() is not supported. A cloud-client can only receive messages from the cloud.");
};

function retrieveData() {
    var retrieveObj = iotkitlib.createRetrieveDataObject(previousTime, currentTime);
    if(subscribeTo) {
        iotkitlib.addDeviceId(retrieveObj, subscribeTo);
    }
    if(sensor) {
        iotkitlib.addSensorName(retrieveObj, sensor);
    }

    var message = iotkitlib.retrieveData2(retrieveObj);
    receivedMsgHandler(message);
}

/**
 * Set a handler for all received messages.
 * @param handler {function} called when a message is received
 */
EnableIoTClient.prototype.setReceivedMessageHandler = function(handler) {
  receivedMsgHandler = handler;

  setInterval(function () {
      if(currentTime === 0) {
          currentTime = new Date().getTime() / 1000 | 0;
          previousTime = currentTime - frequencyInterval;
      } else {
          previousTime = currentTime;
          currentTime = new Date().getTime() / 1000 | 0;
      }

      retrieveData();
  }, frequencyInterval * 1000);
};

/**
 * close connection. Sends FIN to the {@tutorial cloud}.
 */
EnableIoTClient.prototype.done = function (context) {
    iotkitlib.iotkit_cleanup();
};

module.exports = EnableIoTClient;
