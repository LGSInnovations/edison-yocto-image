var http = require('http'),
    EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits,
    extend = require('util')._extend,
    path = require('path'),
    WebSocketServer = require('ws').Server,
    Session = require('./session'),
    buildUrl = require('../index.js').buildInspectorUrl,
    WEBROOT = path.join(__dirname, '../front-end'),
    daemonConfig = new require(__dirname+'/../../daemonConfig')(__dirname+'/../../../config.json');

function debugAction(req, res) {
  res.sendfile(path.join(WEBROOT, 'inspector.html'));
}

function overridesAction(req, res) {
  res.sendfile(path.join(__dirname, '../front-end-node/Overrides.js'));
}

function handleWebSocketConnection(socket) {
  var debugPort = this._getDebuggerPort(socket.upgradeReq.url);
  this._createSession(debugPort).join(socket);
}

function handleServerListening() {
  this.emit('listening');
}

function handleServerError(err) {
  if (err._handledByInspector) return;
  err._handledByInspector = true;
  this.emit('error', err);
}

function DebugServer() {}

inherits(DebugServer, EventEmitter);

DebugServer.prototype.start = function(options) {
  this._config = extend({}, options);

  this.wsServer = new WebSocketServer({
    host:'localhost',
    port: this._config.webPort,
    verifyClient:daemonConfig.ipWhitelist
  });
  this.wsServer.on('connection', handleWebSocketConnection.bind(this));
  this.wsServer.on('error', handleServerError.bind(this));
};

DebugServer.prototype._getDebuggerPort = function(url) {
  return parseInt((/\?port=(\d+)/.exec(url) || [null, this._config.debugPort])[1], 10);
};

DebugServer.prototype._createSession = function(debugPort) {
  return Session.create(debugPort, this._config);
};

DebugServer.prototype.close = function() {
  if (this.wsServer) {
    this.wsServer.close();
    this.emit('close');
  }
};

DebugServer.prototype.address = function() {
  var address = 'n/a';
  var config = this._config;
  address.url = buildUrl(config.webHost, address.port, config.debugPort);
  return address;
};

exports.DebugServer = DebugServer;
