The iotkit-comm sources contain the following sample programs:

* [hello world]{@link module:example/helloworld}: A simple hello world example to get started with using the
iotkit-comm library
* [basic client and server]{@link module:example/basicClientServer}: A basic client and server written using the
iotkit-comm library
* [basic secure client and server]{@link module:example/basicClientServerSecure}: A basic client and server that
communicate securely. This example shows how easy it is for any iotkit-comm client and server to communicate securely.
* [distributed thermostat]{@link module:example/distributedThermostat}: A dummy thermostat made up of several
 temperature sensors assumed to be distributed around the house.
* [mqtt]{@link module:example/mqtt}: A sample publisher (service) and subscriber (client) that use
a local MQTT broker to communicate.
* [zmqpubsub]{@link module:example/zmqpubsub}: A basic ZMQ publisher (service) that publishes messages
and a ZMQ subscriber (client) that subscribes to those messages.
* [cloud]{@link module:example/cloud}: A sensor service that publishes data to the cloud. A client
that subscribes to that data from the cloud. Needs iotkit-agent running on the system (see [cloud tutorial]{@tutorial
 cloud}).
