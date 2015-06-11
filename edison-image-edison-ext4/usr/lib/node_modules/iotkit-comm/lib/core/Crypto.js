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

var configmgr = require('./config-manager.js');
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

var SSH_TUNNEL_CMD_SUCCESS_RE_STRING = "debug1: channel .+: new";
var SSH_TUNNEL_ADDRESS_IN_USE_RE_STRING = "bind: Address already in use";

function Crypto() {
  if (!configmgr.localstate) {
    throw new Error("No user credentials found. Please create credentials using iotkit-comm setupAuthentication");
  }

  if (!configmgr.globalstate) {
    throw new Error("No host credentials found. Please create credentials using iotkit-comm setupAuthentication");
  }

  if (configmgr.localstate.host !== configmgr.globalstate.host) {
    throw new Error("Credentials do not seem to have been setup correctly for this host. Please rerun " +
      "iotkit-comm setupAuthentication");
  }

  this.user = configmgr.localstate.user;
  this.host = configmgr.localstate.host;
  this.mosquittoSecurePort = configmgr.globalstate.mosquittoSecurePort;

  this.cacert = path.join(configmgr.getGlobalStateLoc(), configmgr.config.stateDirName,
    configmgr.config.auth.CAName + configmgr.config.auth.keyDirSuffix, configmgr.config.auth.CAName +
    configmgr.config.auth.SSLCertSuffix);
  if (!fs.existsSync(this.cacert)) {
    throw new Error("No CA certificate found. Please recreate credentials using iotkit-comm setupAuthentication");
  }

  this.hostpubkey = path.join(configmgr.homedir, "." + configmgr.config.stateDirName,
    this.host + configmgr.config.auth.hostKeyNameSuffix + configmgr.config.auth.keyDirSuffix,
    this.host + configmgr.config.auth.hostKeyNameSuffix + configmgr.config.auth.privateKeyNameSuffix +
    configmgr.config.auth.SSHPubKeySuffix);
  if (!fs.existsSync(this.hostpubkey)) {
    throw new Error("No host public key found. Please recreate credentials using iotkit-comm setupAuthentication");
  }

  this.hostkey = path.join(configmgr.homedir, "." + configmgr.config.stateDirName,
    this.host + configmgr.config.auth.hostKeyNameSuffix + configmgr.config.auth.keyDirSuffix,
    this.host + configmgr.config.auth.hostKeyNameSuffix + configmgr.config.auth.privateKeyNameSuffix);
  if (!fs.existsSync(this.hostkey)) {
    throw new Error("No host private key found. Please recreate credentials using iotkit-comm setupAuthentication");
  }

  this.hostsshcert = path.join(configmgr.homedir, "." + configmgr.config.stateDirName,
    this.host + configmgr.config.auth.hostKeyNameSuffix + configmgr.config.auth.keyDirSuffix,
    this.host + configmgr.config.auth.hostKeyNameSuffix + configmgr.config.auth.privateKeyNameSuffix +
    configmgr.config.auth.SSHCertSuffix + configmgr.config.auth.SSHPubKeySuffix);
  if (!fs.existsSync(this.hostsshcert)) {
    throw new Error("No host SSH certificate found. Please recreate credentials using iotkit-comm setupAuthentication");
  }

  this.hostsslcert = path.join(configmgr.homedir, "." + configmgr.config.stateDirName,
    this.host + configmgr.config.auth.hostKeyNameSuffix + configmgr.config.auth.keyDirSuffix,
    this.host + configmgr.config.auth.hostKeyNameSuffix + configmgr.config.auth.privateKeyNameSuffix +
    configmgr.config.auth.SSLCertSuffix);
  if (!fs.existsSync(this.hostsslcert)) {
    throw new Error("No host SSL certificate found. Please recreate credentials using iotkit-comm setupAuthentication");
  }

  this.userkey = path.join(configmgr.homedir, "." + configmgr.config.stateDirName,
    this.host + "_" + this.user + configmgr.config.auth.keyDirSuffix,
    this.host + "_" + this.user + configmgr.config.auth.privateKeyNameSuffix);
  if (!fs.existsSync(this.userkey)) {
    throw new Error("No user private key found. Please recreate credentials using iotkit-comm setupAuthentication");
  }

  this.userpubkey = path.join(configmgr.homedir, "." + configmgr.config.stateDirName,
    this.host + "_" + this.user + configmgr.config.auth.keyDirSuffix,
    this.host + "_" + this.user + configmgr.config.auth.privateKeyNameSuffix +
    configmgr.config.auth.SSHPubKeySuffix);
  if (!fs.existsSync(this.userpubkey)) {
    throw new Error("No user public key found. Please recreate credentials using iotkit-comm setupAuthentication");
  }

  this.usersshcert = path.join(configmgr.homedir, "." + configmgr.config.stateDirName,
    this.host + "_" + this.user + configmgr.config.auth.keyDirSuffix,
    this.host + "_" + this.user + configmgr.config.auth.privateKeyNameSuffix +
    configmgr.config.auth.SSHCertSuffix + configmgr.config.auth.SSHPubKeySuffix);
  if (!fs.existsSync(this.usersshcert)) {
    throw new Error("No user SSH certificate found. Please recreate credentials using iotkit-comm setupAuthentication");
  }

  this.usersslcert = path.join(configmgr.homedir, "." + configmgr.config.stateDirName,
    this.host + "_" + this.user + configmgr.config.auth.keyDirSuffix,
    this.host + "_" + this.user + configmgr.config.auth.privateKeyNameSuffix +
    configmgr.config.auth.SSLCertSuffix);
  if (!fs.existsSync(this.usersslcert)) {
    throw new Error("No user SSL certificate found. Please recreate credentials using iotkit-comm setupAuthentication");
  }

  this.tunnelproc = null;
  this.destroyingTunnel = false;
  this.portInUse = null;
  this.successRE = new RegExp(SSH_TUNNEL_CMD_SUCCESS_RE_STRING);
  this.portInUseRE = new RegExp(SSH_TUNNEL_ADDRESS_IN_USE_RE_STRING);
  this.IPRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
}

Crypto.prototype.getHost = function () {
  return this.host;
};

Crypto.prototype.getUserPrivateKey = function () {
  return this.userkey;
};

Crypto.prototype.getHostPrivateKey = function () {
  return this.hostkey;
};

Crypto.prototype.getUserPublicKey = function () {
  return this.userpubkey;
};

Crypto.prototype.getHostPublicKey = function () {
  return this.hostpubkey;
};

Crypto.prototype.getCA_SSLCert = function () {
  return this.cacert;
};

Crypto.prototype.getUserSSHCert = function () {
  return this.usersshcert;
};

Crypto.prototype.getHostSSHCert = function () {
  return this.hostsshcert;
};

Crypto.prototype.getUserSSLCert = function () {
  return this.usersslcert;
};

Crypto.prototype.getHostSSLCert = function () {
  return this.hostsslcert;
};

Crypto.prototype.getMosquittoSecurePort = function () {
  return this.mosquittoSecurePort;
};

function getRandomPort(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getCreateSecureTunnelCmd() {
  return "ssh";
}

function getCreateSecureTunnelArgs(remoteHost, localPort, remotePort, remoteUser) {
  var outargs = [];
  outargs.push("-v");
  outargs.push(remoteUser + "@" + remoteHost);
  outargs.push("-L");
  outargs.push(localPort + ":" + remoteHost + ":" + remotePort);
  outargs.push("-o");
  outargs.push("ExitOnForwardFailure=yes");
  outargs.push("-N");
  return outargs;
}

function startTunnel(self, serviceSpec, done) {
  var localport = getRandomPort(configmgr.config.port_min, configmgr.config.port_max);

  // get the dns name of the host (address is not OK because certs were setup with
  // dns names like device.local; also, remove the last "." if it exists in the dns name
  // for certs to work.
  var fqdn = null;
  if (serviceSpec.sourceObj && serviceSpec.sourceObj.host) {
    fqdn = serviceSpec.sourceObj.host;
  } else {
    if (this.IPRegex.test(serviceSpec.address)) { // numeric ip address, won't work for certs
      throw new Error("ERROR: Cannot create secure tunnel. DNS name for host " + serviceSpec.address +
        " is not known.");
    }
    fqdn = serviceSpec.address;
  }

  if (fqdn[fqdn.length-1] === '.') { // the root domain '.'; get rid of it, does not work for certs
    fqdn = fqdn.substring(0, fqdn.length - 1);
  }

  var args = getCreateSecureTunnelArgs(fqdn, localport, serviceSpec.port,
    serviceSpec.properties.__user);

  // if tunnel creation succeeded, callback caller with the port at which tunnel was created
  var detectTunnelCreation = function(data) {
    if (self.successRE.test(data)) {
      self.tunnelproc.stderr.removeListener('data', detectTunnelCreation);
      done(localport, configmgr.config.localaddr);
    }

    if (self.portInUseRE.test(data)) {
      self.tunnelproc.stderr.removeListener('data', detectTunnelCreation);
      self.portInUse = localport;
    }
  };

  // execute command to create new tunnel in separate process
  self.tunnelproc = spawn (getCreateSecureTunnelCmd(), args);

  self.tunnelproc.stderr.setEncoding('utf8');
  self.tunnelproc.stderr.on('data', detectTunnelCreation);

  // tunnel creation failed. If tunnel died unintentionally throw an error.
  self.tunnelproc.on('exit', function (code, signal) {
    if (!code && !self.destroyingTunnel && !self.portInUse) {
      throw new Error("ERROR: Secure communication channel broke down unexpectedly or could not be setup. Quitting...");
    }

    // bind: port already in use. Try creating the tunnel on another port.
    if (self.portInUse) {
      console.log("Could not create tunnel at chosen port (" + self.portInUse + "), trying again with a new port...");

      // reset state
      self.destroySecureTunnel();
      self.tunnelproc = null;
      self.portInUse = null;
      self.destroyingTunnel = false;

      startTunnel(self, serviceSpec, done);
    }
  });
}

Crypto.prototype.createSecureTunnel = function (serviceSpec, done) {

  if (this.tunnelproc) {
    console.log("WARNING: a secure tunnel already exists. " +
    "To create a new one, use a new instance of the Crypto object.");
    done(null, null);
    return;
  }

  if (!serviceSpec.properties || !serviceSpec.properties.__user || !serviceSpec.port || !serviceSpec.address) {
    throw new Error("Could not create secure tunnel to service:\n" + serviceSpec);
  }

  // Create tunnel. Detect and handle successful and unsuccessful tunnel creation
  var self = this;
  startTunnel(self, serviceSpec, done);
};

Crypto.prototype.destroySecureTunnel = function () {
  if (this.tunnelproc) {
    this.destroyingTunnel = true;
    this.tunnelproc.kill();
  }
};

module.exports = Crypto;