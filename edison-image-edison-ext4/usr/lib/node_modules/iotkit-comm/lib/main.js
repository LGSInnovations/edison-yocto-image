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

/** @module main */

'use strict';

var ConfigManager = require("./core/config-manager.js");
ConfigManager.init(__dirname, "config.json");

var PluginManager = require("./core/plugin-manager.js");
var util = require("./core/util.js");

/**
 * Class to create service instances ({@tutorial service})
 */
var Service = require("./core/Service.js");

/**
 * Class to create client instances ({@tutorial client})
 */
var Client = require("./core/Client.js");

/**
 * Provides access to this user's certificates, public keys, and
 * private keys if they were setup using iotkit-comm setupAuthentication
 * @type {Crypto|exports}
 */
exports.Crypto = require("./core/Crypto.js");

/**
 * Allows clients to search for services on the network; allows services
 * to advertise themselves on the network. Uses mDNS.
 */
exports.ServiceDirectory = require("./core/ServiceDirectory.js");

/**
 * The main config object for the library
 * @see {@link lib/config.json}, {@link module:configManager}
 */
exports.config = ConfigManager.config;

/**
 * Defines a service. Used in creating a service or when a client
 * wants to connect to a service.
 * @see {@tutorial service-spec-query}
 */
exports.ServiceSpec = require("./core/ServiceSpec.js");

/**
 * Class to represent the "kind" of services a client is search for in the LAN
 * @see {@link ServiceQuery}
 */
exports.ServiceQuery = require("./core/ServiceQuery.js");

/**
 * Simple function to test if iotkit-comm is installed correctly
 * @returns {string} A simple greeting
 */
exports.sayhello = function ()
{
  return "Hello Edison user!";
};

function advertiseAndCallback(service, serviceCreatedCallback) {
  if (!service.spec.advertise || service.spec.advertise.locally) {
    var serviceDirectory = new exports.ServiceDirectory();
    serviceDirectory.advertiseService(service.spec);
  }
  serviceCreatedCallback(service);
}

/**
 * Create a service and advertise it over the LAN
 * @param serviceSpec {object} JSON service spec object ({@tutorial service-spec-query})
 * @param serviceCreatedCallback {module:main~serviceCreatedCallback} returns created service instance ({@tutorial service})
 */
exports.createService = function (serviceSpec, serviceCreatedCallback) {
  var commplugin;
  try {
    commplugin =  PluginManager.getServicePlugin(serviceSpec.type.name);
  } catch (err) {
    console.log("ERROR: Could not load or find the appropriate communication plugin for service '" +
    serviceSpec.name + "'. Service needs communication plugin '" + serviceSpec.type.name + "'.");
    throw err;
  }

  var service;
  if (commplugin.prototype.communicates_via_proxy) { // not really a service; a client that uses a service
    service = new Service(serviceSpec, commplugin);
    advertiseAndCallback(service, serviceCreatedCallback);
  } else { // no port specified. Find one.
    util.getUnusedPort(serviceSpec.type.protocol, function (unusedPort) {
      serviceSpec.port = unusedPort;
      service = new Service(serviceSpec, commplugin);
      advertiseAndCallback(service, serviceCreatedCallback);
    });
  }
};
/**
 * @callback module:main~serviceCreatedCallback
 * @param service {object} instance of newly created service ({@tutorial service}).
 * Decide if they want to connect to this service or not ({@tutorial service-record}).
 */

/**
 * Create a client instance once a queried service is discovered.
 * @param serviceQuery {object} describes the "kind" of services the app wants to
 * look for ({@tutorial service-spec-query})
 * @param clientCreatedCallback {module:main~clientCreatedCallback} if app returned true as a result of the
 * serviceFilter callback, then this callback returns the newly created client instance that is initialized
 * to communicate with the service that was just found. * @param clientCreatedCallback {module:main~clientCreatedCallback} if app returned true as a result of the
 * serviceFilter callback, then this callback returns the newly created client instance that is initialized
 * to communicate with the service that was just found.
 * @param serviceFilter {module:main~serviceFilter} - called when a matching service is found. App must return 'true'
 * if it wants to communicate with this service.
 */
exports.createClient = function (serviceQuery, clientCreatedCallback, serviceFilter) {
  var commplugin;
  try {
    commplugin =  PluginManager.getClientPlugin(serviceQuery.type.name);
  } catch (err) {
    console.log("ERROR: Could not load communication plugin '" + serviceQuery.type.name +
    "'. The plugin was not found or produced errors while loading.");
    throw err;
  }

  // service is fully specified, this must be the child class "ServiceSpec". Connect directly
  if ((serviceQuery.address && serviceQuery.port) || commplugin.prototype.communicates_via_proxy) {
    var newclient = new Client(serviceQuery, commplugin);
    newclient.connect(clientCreatedCallback);
    return;
  }

  // search for service
  var serviceDirectory = new exports.ServiceDirectory();
  serviceDirectory.discoverServices(serviceQuery, function(serviceSpec) {
    if (!serviceFilter || serviceFilter(serviceSpec)) { // client wants to connect to service (it wasn't filtered)
      if (serviceQuery.type_params) {
        // note: service spec found using service directory does not have type_params. "type_params" is a field
        // provided by the user and it contains parameters for the respective comm plugin.
        serviceSpec.type_params = serviceQuery.type_params;
      }
      var newclient = new Client(serviceSpec, commplugin);
      newclient.connect(clientCreatedCallback);
    }
  });
};
/**
 * @callback module:main~serviceFilter
 * @param serviceRecord {object} a service record matching the query (see {@tutorial service-record})
 * @returns {boolean} Return 'true' if service described by serviceRecord is acceptable, 'false' otherwise
 */
/**
 * @callback module:main~clientCreatedCallback
 * @param client {object} client instance connected to the newly found service. A newly found service is one whose
 * record was accepted by {@link module:main~serviceFilter}.
 */
