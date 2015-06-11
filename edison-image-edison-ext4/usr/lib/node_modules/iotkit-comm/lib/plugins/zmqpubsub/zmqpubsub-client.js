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

var zeromq = require('zmq');

ZMQPubSubClient.prototype.interface = "client-interface";
ZMQPubSubClient.prototype.provides_secure_comm = false;

/**
 * Create a zmq subscriber that connects to a publisher described by the given service specification
 * @param serviceSpec {object} {@tutorial service-spec-query}
 * @see {@link http://zeromq.org}
 * @constructor
 */
function ZMQPubSubClient(serviceSpec) {
  "use strict";
  this.socket = zeromq.socket('sub');
  this.socket.connect('tcp://' + serviceSpec.address + ':' + serviceSpec.port);

  this.spec = serviceSpec;
  this.socket.subscribe(this.spec.name);

  var self = this;
  this.socket.on('message', function (message) {
    if (self.receivedMsgHandler) {
      var strmsg = message.toString();
      var colonidx = strmsg.indexOf(":");
      self.receivedMsgHandler(strmsg.substring(colonidx+1), {event: 'message'});
    }
  });
}

ZMQPubSubClient.prototype.send = function (msg, context) {
  throw new Error("send() is not supported. A ZMQ subscriber can only receive messages from a publisher.");
};

ZMQPubSubClient.prototype.setReceivedMessageHandler = function (handler) {
  this.receivedMsgHandler = handler;
};

ZMQPubSubClient.prototype.done = function () {
    this.socket.close();
};

module.exports = ZMQPubSubClient;