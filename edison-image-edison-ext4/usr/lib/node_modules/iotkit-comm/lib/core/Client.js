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

/** @module client */

var Crypto = require("./Crypto.js");

/**
 * Initializes a client object that can connect to a service
 * described by serviceSpec.
 * @param {object} serviceSpec - {@tutorial service-spec-query}
 * @constructor module:client~Client
 */
function Client(serviceSpec, commplugin) {
  this.spec = serviceSpec;
  this.commplugin = commplugin;
}

Client.prototype.connect = function (done) {
  // setup secure channels if needed
  var c = null;
  var canSecure = true;
  try {
    c = new Crypto();
  } catch (e) {
    c = null;
    canSecure = false;
  }

  if (!this.spec.type_params) {
    this.spec.type_params = {};
  }

  if (!this.spec.properties) {
    this.spec.properties = {};
  }

  this.spec.type_params.mustsecure = this.spec.type_params.mustsecure || this.spec.properties.__mustsecure;

  if (this.spec.type_params.mustsecure)
  { // client or server want a secure channel
    if (!canSecure && !this.commplugin.prototype.provides_secure_comm)
    { // no credentials setup and plugin does not provide own security mechanism
      throw new Error("Cannot connect securely because credentials are not setup (a secure\n" +
      "communication channel was requested either by the service or the client).\n" +
      "Run iotkit-comm setupAuthentication to create and configure credentials.");
    }

    if (!this.spec.properties.__mustsecure && !this.spec.properties.__cansecure && !this.spec.properties.__user)
    { // cannot create secure channel because server is not configured for it
      throw new Error("Cannot connect securely because the server does not support secure communications.");
    }

    if (canSecure && !this.commplugin.prototype.provides_secure_comm) {
      // create secure tunnel
      console.log("Setting up secure communication channel...");
      var self = this;
      c.createSecureTunnel(this.spec, function (localport, localaddr) {
        self.spec.address = localaddr;
        self.spec.port = localport;
        console.log("Secure tunnel setup at " + self.spec.address + ":" + self.spec.port);
        self.comm = new self.commplugin(self.spec, c);
        done(self);
      });
    } else {
      this.comm = new this.commplugin(this.spec, c);
      done(this);
    }
  } else {
    this.comm = new this.commplugin(this.spec, c);
    done(this);
  }
};

module.exports = Client;
