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
MQTTClient.prototype.interface = "client-interface";
MQTTClient.prototype.provides_secure_comm = true;
MQTTClient.prototype.communicates_via_proxy = false;

/**
 * Create a client that connects to an MQTT broker described in the service specification.
 * @param serviceSpec {object} {@tutorial service-spec-query}
 * @constructor
 */
function MQTTClient(serviceSpec, crypto) {
  if (serviceSpec.type_params.mustsecure) {
    if (!serviceSpec.properties || !serviceSpec.properties.secureport || !serviceSpec.properties.secureaddress) {
      throw new Error("Cannot create secure communication channel. Service not setup to communicate securely.");
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
    this.client = mqtt.createClient(serviceSpec.port, serviceSpec.address);
  }

  this.spec = serviceSpec;
  this.client.subscribe(this.spec.name);

  var self = this;
  this.client.on('message', function (topic, message) {
    if (self.receivedMsgHandler) {
      self.receivedMsgHandler(message, {event: 'message'});
    }
  });
}

/**
 * Send a message to the broker. Equivalent to publishing to a topic.
 * @param msg {string} Message to send to broker.
 * @param context {object.<string, string>} context.topic contains the topic string
 */
MQTTClient.prototype.send = function (msg, context) {
  throw new Error("send() is not supported for MQTT clients. They can only subscribe to data from MQTT services.");
};

/**
 * Set a handler for all received messages.
 * @param handler {function(message,context)} called when a message is received
 */
MQTTClient.prototype.setReceivedMessageHandler = function(handler) {
  this.receivedMsgHandler = handler;
};

/**
 * close connection. Sends FIN to the other side.
 */
MQTTClient.prototype.done = function () {
    this.client.end();
};

module.exports = MQTTClient;
