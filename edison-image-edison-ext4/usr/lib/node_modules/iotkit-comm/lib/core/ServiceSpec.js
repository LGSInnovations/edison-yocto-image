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

var ServiceQuery = require("./ServiceQuery.js");

function ServiceSpec(source, otherAddresses) {

  // inheritance
  ServiceQuery.call(this, source);

  // check port
  if (this.sourceObj.port && typeof this.sourceObj.port !== 'number') {
    throw new Error("Must specify service port as a number.");
  }
  this.port = this.sourceObj.port;

  // check address
  if (this.sourceObj.address) {
    if (typeof this.sourceObj.address !== 'string') {
      throw new Error("Address must be a string (IPv4).");
    }
    this.address = this.sourceObj.address;
  }

  // check other addresses; this.address may be set by super class ServiceQuery
  if (otherAddresses) {
    if (!Array.isArray(otherAddresses))
      throw new Error("otherAddresses field must be an array (of IPv4 addresses).");
    this.otherAddresses = otherAddresses;
    if (!this.address) { // no address given
      this.address = this.otherAddresses[0];
    }
  }

  // check advertise (how to advertise this service)
  if (this.sourceObj.advertise) {
    if (typeof this.sourceObj.advertise.locally === 'undefined') {
      throw new Error("Missing boolean property 'advertise.locally. " +
        "Service needs to state if it must be locally advertised or not.");
    }
    if (typeof this.sourceObj.advertise.locally !== 'boolean') {
      throw new Error("advertise.locally must be a Boolean property.");
    }
    if (typeof this.sourceObj.advertise.cloud === 'undefined') {
      throw new Error("Missing boolean property 'advertise.cloud. " +
        "Service needs to state if it must be advertised in the cloud or not.");
    }
    if (typeof this.sourceObj.advertise.locally !== 'boolean') {
      throw new Error("advertise.cloud must be a Boolean property.");
    }
    this.advertise = this.sourceObj.advertise;
  }

  if (!this.advertise || this.advertise && this.advertise.locally) { // service might be advertised on LAN
    if (!this.name) // service does not have a name
      throw new Error("ServiceSpec.name must be a non-empty string. Preferably something user-friendly.");
  }
}

// inheritance
ServiceSpec.prototype = Object.create(ServiceQuery.prototype);
ServiceSpec.prototype.constructor = ServiceSpec;

module.exports = ServiceSpec;