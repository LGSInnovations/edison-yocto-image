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

var fs = require('fs');

/**
 * The service query object. Users provide this to find the desired service records returned by mDNS.
 * @param rawQueryObj {object} ({@tutorial service-spec-query})
 * @constructor module:client~ServiceQuery
 */
function ServiceQuery(source) {
  if (typeof source === "string") {
    if (fs.existsSync(source)) { // file path
      try {
        this.sourceObj = JSON.parse(fs.readFileSync(source));
      } catch (err) {
        throw new Error("Invalid " + this.constructor.name + " in file " + source + ". File must contain valid JSON.");
      }
    } else { // possibly json string
      try {
        this.sourceObj = JSON.parse(source);
      } catch (err) {
        throw new Error(this.constructor.name + " (" + source + ") " +
          "must be a valid JSON file, string, or object. " +
          "If the service specification was provided in a file, it does not exist. " +
          "If it was intended to be a string, it is invalid.");
      }
    }
  } else if (typeof source === "object") {
    this.sourceObj = source;
  } else {
    throw new Error("Incorrect argument type: first argument must be a 'string' or an 'object'.");
  }

  // make sure service query does not contain address or port
  if (this.constructor.name === "ServiceQuery" && (this.sourceObj.address || this.sourceObj.port)) {
    throw new Error("A service query cannot contain an address or port number; use service specification instead.");
  }

  // check type
  if (!this.sourceObj.type || !this.sourceObj.type.name) {
    throw new Error("Must specify service type and type.name.");
  }

  if(!this.sourceObj.type.protocol) {
    this.sourceObj.type.protocol = "tcp";
  } else if (this.sourceObj.type.protocol !== "tcp") {
    throw new Error("Protocol " + this.sourceObj.type.protocol + " is not yet supported.");
  }

  if (this.sourceObj.type.subtypes) {
    if (!Array.isArray(this.sourceObj.type.subtypes)) {
      throw new Error("Subtypes of a service type must be in an array.");
    }
    if (this.sourceObj.type.subtypes.length > 1) {
      throw new Error("More than one subtype is not supported at this time.");
    }
  }
  this.type = this.sourceObj.type;

  // check name
  if (!this.sourceObj.name) {
    throw new Error (this.constructor.name + " must have a name. Preferably something user-friendly.");
  }
  if (typeof this.sourceObj.name !== "string") {
    throw new Error("Must specify service name as a non-zero string.");
  }
  this.nameRegEx = new RegExp(this.sourceObj.name);
  this.name = this.sourceObj.name;

  // check properties
  var properties = null;

  // 'properties' comes from JSON service query, whereas txtRecord comes from a mdns service record
  // This object could be initialized from any of these sources. So any differences, need to be
  // handled appropriately.
  if (this.sourceObj.properties && this.sourceObj.txtRecord)
    throw new Error("Can't have both 'properties' and 'txtRecord' field. They are the same thing.");

  if (this.sourceObj.properties)
    properties = this.sourceObj.properties;
  else if (this.sourceObj.txtRecord)
    properties = this.sourceObj.txtRecord;

  if (properties) {
    if (typeof properties !== 'object' || Array.isArray(properties)) {
      throw new Error("Must specify service properties as an object containing name/value pairs.");
    }
    this.properties = properties;
  }

  // check communication parameters (goes to plugin)
  if (this.sourceObj.type_params) {
    if (typeof this.sourceObj.type_params !== 'object') {
      throw new Error("Communication params field must be an object. It should contain name/value pairs.");
    }
    this.type_params = this.sourceObj.type_params;
  }
}

module.exports = ServiceQuery;
