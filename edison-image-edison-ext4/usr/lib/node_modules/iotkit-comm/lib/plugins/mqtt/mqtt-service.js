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

var mqtt = require('mqtt');

/**
 * Name of interface this plugin would like to adhere to ({@tutorial plugin})
 */
MQTTService.prototype.interface = "client-interface";
MQTTService.prototype.provides_secure_comm = true;
MQTTService.prototype.communicates_via_proxy = true;

/**
 * Create a client that connects to an MQTT broker described in the service specification.
 * @param serviceSpec {object} {@tutorial service-spec-query}
 * @constructor
 */
function MQTTService(serviceSpec, crypto) {
  if (!serviceSpec.port) {
      serviceSpec.port = 1883;
  }

  if (crypto) {
    if(!serviceSpec.properties) {
      serviceSpec.properties = {};
    }
    serviceSpec.properties.secureaddress = crypto.getHost();
    serviceSpec.properties.secureport = crypto.getMosquittoSecurePort();
  }

  if (serviceSpec.type_params.mustsecure) {
    if (!crypto) {
      throw new Error("Cannot secure communication channel." +
      " Please setup and configure credentials using iotkit-comm setupAuthentication.");
    }
    var calist = [];
    calist.push(crypto.getCA_SSLCert());
    var opts = {
      keyPath: crypto.getUserPrivateKey(),
      certPath: crypto.getUserSSLCert(),
      ca: calist
    };
    console.log("Connecting securely to MQTT broker at " + serviceSpec.properties.secureaddress + ":" +
      serviceSpec.properties.secureport);
    this.client = mqtt.createSecureClient(serviceSpec.properties.secureport, serviceSpec.properties.secureaddress,
      opts);
  } else {
    var brokerAddress = serviceSpec.address ? serviceSpec.address : "127.0.0.1";
    this.client = mqtt.createClient(serviceSpec.port, brokerAddress);
  }
  this.spec = serviceSpec;
}

/**
 * Send a message to the broker. Equivalent to publishing to a topic.
 * @param msg {string} Message to send to broker.
 * @param context {object.<string, string>} context.topic contains the topic string
 */
MQTTService.prototype.send = function (msg, context) {
  if (context && context.topic) {
    this.client.publish(context.topic, msg);
  } else {
    this.client.publish(this.spec.name, msg);
  }
};

/**
 * Set a handler for all received messages.
 * @param handler {function(message,context)} called when a message is received
 */
MQTTService.prototype.setReceivedMessageHandler = function(handler) {
  throw new Error("WARNING: setReceivedMessageHandler() is not supported for MQTT Services." +
  " They can only publish data.");
};

/**
 * close connection. Sends FIN to the other side.
 */
MQTTService.prototype.done = function () {
  this.client.end();
};

module.exports = MQTTService;
