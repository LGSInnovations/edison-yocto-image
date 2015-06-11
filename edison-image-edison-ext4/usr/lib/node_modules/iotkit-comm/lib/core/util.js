var configmgr = require('./config-manager.js');
var net = require('net');

exports.getRandomPort = function () {
  return Math.floor(Math.random() * (configmgr.config.port_max - configmgr.config.port_min)) +
    configmgr.config.port_min;
};

exports.getUnusedPort = function (protocol, found, attempts) {
  if (protocol !== "tcp") {
    throw new Error("Can't find an unused port for protocol " + protocol +
    ". Note: only the TCP protocol is supported.");
  }

  if (typeof attempts === 'undefined' || attempts === null) {
    attempts = configmgr.config.unusedPortDetectAttempts;
  }

  if (attempts === 0) {
    console.log("WARN: Could not find an unused port. " +
    "Please provide port number in specification, or try again later.");
    found(null);
    return;
  }

  var server = net.createServer(function (socket) { socket.end(); });
  var nextport = exports.getRandomPort();

  server.on ('error', function(e) {
    setImmediate(exports.getUnusedPort, protocol, found, attempts - 1);
  });

  server.listen(nextport, function () {
    server.close();
    found(nextport);
  });
};
