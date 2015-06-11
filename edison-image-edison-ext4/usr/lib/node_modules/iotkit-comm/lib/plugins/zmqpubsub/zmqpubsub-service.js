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

ZMQPubSubService.prototype.interface = "service-interface";
ZMQPubSubService.prototype.provides_secure_comm = false;

/**
 * Create a zmq publisher based on the given service specification
 * @param serviceSpec {object} {@tutorial service-spec-query}
 * @see {@link http://zeromq.org}
 * @constructor
 */
function ZMQPubSubService(serviceSpec) {
  this.socket = zeromq.socket('pub');
  if (serviceSpec.address) {
    this.socket.bindSync('tcp://' + serviceSpec.address + ':' + serviceSpec.port);
  } else {
    this.socket.bindSync('tcp://*:' + serviceSpec.port);
  }
  this.spec = serviceSpec;
}

function publish(msg, context, client) {
  if (context && context.topic) {
    msg = context.topic + ":" + msg;
  } else {
    msg = this.spec.name + ":" + msg;
  }
  client.send(msg);
}

ZMQPubSubService.prototype.send = function (msg, context, client) {
  if (client) {
    publish.call(this, msg, context, client);
  } else {
    publish.call(this, msg, context, this.socket);
  }
};

ZMQPubSubService.prototype.broadcast = function (msg, context, clients) {
  if (clients) {
    for (var i = 0; i < clients.length; i++) {
      publish.call(this, msg, context, clients[i]);
    }
  } else {
    publish.call(this, msg, context, this.socket);
  }
};

ZMQPubSubService.prototype.administerClientConnection = function (context, client) {
  console.log("WARNING: administerClientConnection() is not yet supported.");
};

ZMQPubSubService.prototype.setReceivedMessageHandler = function (handler) {
  throw new Error("setReceivedMessageHandler() is not supported. " +
    "A ZMQ publisher cannot receive messages from the subscriber");
};

ZMQPubSubService.prototype.done = function () {
    this.socket.close();
};

module.exports = ZMQPubSubService;