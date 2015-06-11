#!/usr/bin/env node

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

var program = require('commander');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var rterm = require('read');
var async = require('async');
var os = require('os');

// load config file for iotkit-comm
var ConfigManager = require("./core/config-manager.js");
ConfigManager.init(__dirname, "config.json");

// setup command-line parser
// add supported commands
program.command('setupAuthentication <inputfile>')
  .description(os.EOL +
  '   creates, distributes, and configures authentication and encryption' + os.EOL +
  '   credentials for users on specified devices. Each line of "inputfile"' + os.EOL +
  '   has the format "username,host_address" where user with "username" has' + os.EOL +
  '   an account on host at "host_address". A sample "inputfile" looks like:' + os.EOL + os.EOL +
  '      # lines beginning with a hash are ignored' + os.EOL +
  '      johndoe,device1.local' + os.EOL +
  '      janedoe,device2.local' + os.EOL + os.EOL +
  '   If you are setting up authentication for this machine, please be sure to add' + os.EOL +
  '   a line for it as well (do not use "localhost" or "127.0.0.1" as this host\'s' + os.EOL +
  '   address).' + os.EOL + os.EOL +
  '   IMPORTANT NOTE: Each "inputfile" is treated as one group; what this means is that' + os.EOL +
  '   after running this command all specified users will have access (at least via SSH)' + os.EOL +
  '   to all specified devices.' + os.EOL + os.EOL +
  '   IMPORTANT NOTE: if there is a failure in configuring some of the specified devices,' + os.EOL +
  '   the same file can be passed in again and he script will try to configure all failed' + os.EOL +
  '   devices. Once a device is configured successfully, the script marks them in the' + os.EOL +
  '   "inputfile" as "done". To reconfigure a device, remove the keyword "done" from the' + os.EOL +
  '   respective line.' + os.EOL)
  .action(exec_setup_auth);

program.command('configureCredentials <username> <host_address>')
  .description(os.EOL +
  '   configure credentials created by a previous invocation of "setupAuthentication" (above)' + os.EOL +
  '   The arguments "username" and "host_address" are needed to access the appropriate' + os.EOL +
  '   credentials. Credentials are expected to be present in the current directory.')
  .action(exec_config_credentials);

function getSSHKeygenCmd(keypath) {
  return "ssh-keygen -N ''  -t rsa -f " + keypath;
}

function getSSL_CA_CertCmd(CAKeyPath, outCertPath, CAName) {
  return "openssl req -new -x509 -days 3650 -extensions v3_ca -key " + CAKeyPath + " -out " + outCertPath + " -nodes -subj '/C=xx/ST=mystate/L=mycity/O=myorg/CN=" + CAName + "'";
}

function getSSHHostCertCmd(cakey, host, pubkey) {
  return "ssh-keygen -s " + cakey + " -I service@" + host + " -h -n " + host + ",localhost -V +3650d " + pubkey;
}

function getSSHClientCertCmd(cakey, host, pubkey, user) {
  return "ssh-keygen -s " + cakey + " -I " + user + "@" + host + " -V +3650d " + pubkey;
}

function getSSLHostCertReqCmd(csr, privkey, host) {
  return "openssl req -out " + csr + " -key " + privkey + " -new -subj " + 
    "/C=xx/ST=mystate/L=mycity/O=myorg/CN=" + host;
}

function getSSLClientCertReqCmd(csr, privkey, host, user) {
  return "openssl req -out " + csr + " -key " + privkey + " -new -subj " + 
    "/C=xx/ST=mystate/L=mycity/O=myorg/CN=" + user + "@" + host;
}

function getSSLCertCmd(csr, cacert, cakey, certfilename) {
  return "openssl x509 -req -in " + csr + " -CA " + cacert + " -CAkey " + cakey + " -CAcreateserial -out " +
    certfilename + " -days 3650";
}

function getDistributeKeysCmd(inputs, state, mapname) {
  return "sshpass -p '" + inputs.password + "' scp -o StrictHostKeyChecking=no -r " +
    path.join(state.keydir, state.cadir) + " " + 
    path.join(state.keydir, state.devicedir, state.hostdir) + " " +
    path.join(state.keydir, state.devicedir, state.clientdir) + " " +
    inputs.username + "@" + inputs.host + ":~";
}

function getConfigureKeysCmd(host, user, password, keydirname) {
  var cmdprefix = "iotkit-comm configureCredentials";

  if (user !== 'root') {
    cmdprefix = "echo " + password + " | sudo -S " + cmdprefix;
  }

  return "sshpass -p '" + password + "' ssh -o StrictHostKeyChecking=no " + user +
    "@" + host + " '" + cmdprefix + " " + user + " " + host + "'";
}

// command callbacks (one for each command)
function exec_setup_auth(inputfile, options) {
  var state = {};
  state.users = [];
  state.hosts = [];
  state.inputLineIdx = 0;

  // read input file
  state.deviceInputLines = fs.readFileSync(inputfile).toString().split(os.EOL);
  state.inputfile = inputfile;
  var currline = {};

  for (var i = 0; i < state.deviceInputLines.length; i++) {
    if (!state.deviceInputLines[i] || state.deviceInputLines[i].trim()[0] === '#') {
      continue;
    }

    currline.user = state.deviceInputLines[i].trim().split(',')[0];
    if (currline.user) {
      currline.user = currline.user.trim();
      state.users.push(currline.user);
    }

    currline.host = state.deviceInputLines[i].trim().split(',')[1];
    if (currline.host) {
      currline.host = currline.host.trim();
      state.hosts.push(currline.host);
    }
  }

  if (state.users.length !== state.hosts.length) {
    console.log("Error: input file " + inputfile + " did not have the correct format.");
    console.log("  The number of users must be the same as the number of hosts specified in the file.");
    process.exit(1);
  }

  state.keydir = ConfigManager.config.auth.keyDirName + ConfigManager.config.auth.keyDirSuffix;
  state.cadir = ConfigManager.config.auth.CAName + ConfigManager.config.auth.keyDirSuffix;
  state.newdir = false;
  state.renewedca = false;


  if (!fs.existsSync(state.keydir)) {
    console.log("Creating credential directory " + state.keydir + ".");
    fs.mkdirSync(state.keydir);
    state.newdir = true;
  } else {
    console.log("New credentials will be saved in directory " + state.keydir + ".");
  }
  
  var cadirpath = path.join(state.keydir, state.cadir);
  state.cakey = ConfigManager.config.auth.CAName + ConfigManager.config.auth.privateKeyNameSuffix;
  state.capubkey = state.cakey + ConfigManager.config.auth.SSHPubKeySuffix;
  state.cacert = ConfigManager.config.auth.CAName + ConfigManager.config.auth.SSLCertSuffix;
  
  if (!fs.existsSync(cadirpath)) {
    if (!state.newdir) { // CA is being replaced. All older host/user certificates may become invalid
      state.renewedca = true;
    }
    console.log("Creating certificate authority credentials in " + cadirpath);
    fs.mkdirSync(cadirpath);
    exec(getSSHKeygenCmd(path.join(cadirpath, state.cakey)), function (error, stdout, stderr) {
      if (error)
        throw new Error(stderr);
      exec(getSSL_CA_CertCmd(path.join(cadirpath, state.cakey), 
                  path.join(cadirpath, state.cacert), 
                  ConfigManager.config.auth.CAName),
           function (error, stdout, stderr) {
             if (error)
               throw new Error(stderr);
             startInteractiveSession(state);
           });
    });
  } else {
    console.log("note: using existing certificate authority credentials in\n  " + cadirpath + ".");
    startInteractiveSession(state);
  }
}

function startInteractiveSession(state) {
  var inputs = {};
  
  var getPassword = function (done) {
    rterm({"prompt": "Enter password for user '" + inputs.username + "' on host '" + inputs.host + "':",
      "silent": true}, function (e, r, isDefault) {
      if (e)
        done(e);
      done(null, r);
    });
  };

  var getDone = function (done) {
    rterm({"prompt": "Do you need to setup more devices [y/n]: ", "default": inputs.isdone},
      function (e, r, isDefault) {
        if (e)
          done(e);
        done(null, r);
      });
  };

  var getAuthSetupInputsForOneDevice = function (alldone) {
    // skip comments, empty lines, and already configured devices
      if (!state.deviceInputLines[state.inputLineIdx]) {
        state.inputLineIdx++;
        alldone();
        return;
      }

    var trimmedline = state.deviceInputLines[state.inputLineIdx].trim();
    var donestr = trimmedline.split(',')[2];
    if (donestr) {
      donestr = donestr.trim();
    }

    if (trimmedline[0] === '#' || donestr === 'done') {
      console.log("Skipping setup for: " + trimmedline);
      state.inputLineIdx++;
      alldone();
      return;
    }

    var startAuthSetup = function (e, responses) {
      if (e) {
        state.inputLineIdx++;
        alldone(e);
        return;
      }

      inputs.password = responses[0];

      console.log("Setting up authentication and encryption credentials for device " + inputs.host +
      " and user " + inputs.username + ":");
      console.log("");

      setupAuth(inputs, state,
        function (e) {
          state.inputLineIdx++;
          if (e) {
            alldone(e);
            return;
          }
          state.deviceInputLines[state.inputLineIdx - 1] =
            state.deviceInputLines[state.inputLineIdx - 1].concat(",done");
          alldone();
        });
    };

    inputs.username = state.deviceInputLines[state.inputLineIdx].trim().split(',')[0].trim();
    inputs.host = state.deviceInputLines[state.inputLineIdx].trim().split(',')[1].trim();

    async.series([getPassword],
                 startAuthSetup);
  };

  // start interactive sequence of taking inputs
  async.whilst(function () { return state.inputLineIdx < state.deviceInputLines.length; },
               getAuthSetupInputsForOneDevice,
                function (err) {
                  fs.writeFileSync(state.inputfile, state.deviceInputLines.join(os.EOL));
                  if (err)
                    if (err.message !== 'canceled')
                      throw err;
                    else {
                      console.log("");
                      process.exit(1);
                    }
               });
}

// do all the auth setup for single edison here
function setupAuth(inputs, state, doneAuthSetup) {
  state.hostdir = inputs.host + ConfigManager.config.auth.hostKeyNameSuffix + 
    ConfigManager.config.auth.keyDirSuffix;
  state.clientdir = inputs.host + "_" + inputs.username + ConfigManager.config.auth.keyDirSuffix; 
  state.devicedir = inputs.host + ConfigManager.config.auth.keyDirSuffix;
  
  var devicedirpath = path.join(state.keydir, state.devicedir);
  var hostdirpath = path.join(devicedirpath, state.hostdir);
  var clientdirpath = path.join(devicedirpath, state.clientdir);
  var cadirpath = path.join(state.keydir, state.cadir);
  
  var createKeyDirs = function (done) {
    try {
      if (!fs.existsSync(devicedirpath)) {
        console.log("Creating device credential directory " + devicedirpath + ".");
        fs.mkdirSync(devicedirpath);
      } else {
        console.log("New device-specific credentials will be saved in " + devicedirpath + "."); 
      }
      
      if (!fs.existsSync(hostdirpath))
        fs.mkdirSync(hostdirpath);
      else { // host key dir exists
        if (state.renewedca) {
          console.log("error: credentials signed by a previous CA for host " + inputs.host + " already exist in " +
          hostdirpath + ". Will not create new ones.");
          process.exit(1);
        }
        console.log("note: credentials for host " + inputs.host + " already exist in " +
                    hostdirpath + ". Will not create new ones.");
      }
      
      if (!fs.existsSync(clientdirpath))
        fs.mkdirSync(clientdirpath);
      else {
        console.log("error: credentials for client " + inputs.username + 
                   " already exist in " + clientdirpath + ". Will not overwrite.");
        process.exit(1);
      }
    } catch (e) {
      done(e);
    }
    done();
  };
  
  var generateSSHHostKey = function (done) {
    state.hostkey = inputs.host + ConfigManager.config.auth.hostKeyNameSuffix + 
      ConfigManager.config.auth.privateKeyNameSuffix;
    state.hostpubkey = state.hostkey + ConfigManager.config.auth.SSHPubKeySuffix;
    
    if (fs.existsSync(path.join(hostdirpath, state.hostkey)))
        done();
    else {
      console.log("Creating SSH host credentials in " + hostdirpath);
      exec(getSSHKeygenCmd(path.join(hostdirpath, state.hostkey)), 
           function (error, stdout, stderr) {
            if (error)
              done(stderr);
            done();
           });
    }
  };
  
  var generateSSHClientKey = function (done) {
    console.log("Creating SSH client credentials in " + clientdirpath);
    state.clientkey = inputs.host + "_" + inputs.username + 
                                ConfigManager.config.auth.privateKeyNameSuffix;
    exec(getSSHKeygenCmd(path.join(clientdirpath, state.clientkey)), 
         function (error, stdout, stderr) {
           if (error)
             done(stderr);
           state.clientpubkey = state.clientkey + ConfigManager.config.auth.SSHPubKeySuffix;
           done();
         });
  };
  
  var generateSSHHostCert = function (done) {
    state.sshhostcert = state.hostkey + ConfigManager.config.auth.SSHCertSuffix +
             ConfigManager.config.auth.SSHPubKeySuffix;
    
    if (fs.existsSync(path.join(hostdirpath, state.sshhostcert))) {
      console.log("Found SSH host certificate in " + hostdirpath);
      done();
    }
    else {
      console.log("Creating SSH host certificate in " + hostdirpath);
      exec(getSSHHostCertCmd(path.join(cadirpath, state.cakey), 
                             inputs.host, 
                             path.join(hostdirpath, state.hostpubkey)), 
           function (error, stdout, stderr) {
             if (error)
               done(stderr); 
             done();
           });
    }
  };
  
  var generateSSHClientCert = function (done) {
    console.log("Creating SSH client certificate in " + clientdirpath);

    exec(getSSHClientCertCmd(path.join(cadirpath, state.cakey), inputs.host,
        path.join(clientdirpath, state.clientpubkey),
        inputs.username),
         function (error, stdout, stderr) {
           if (error)
             done(stderr);
           state.sshclientcert = state.hostkey + ConfigManager.config.auth.SSHCertSuffix + 
             ConfigManager.config.auth.SSHPubKeySuffix;
           done();
         });
  };

  var generateSSLHostCert = function (done) {
    state.hostcert = state.hostkey + ConfigManager.config.auth.SSLCertSuffix;
    
    if (fs.existsSync(path.join(hostdirpath, state.hostcert)))
        done();
    else {
      console.log("Creating SSL host certificate in " + hostdirpath);
      exec(getSSLHostCertReqCmd(path.join(hostdirpath, 
                                          state.hostkey + ConfigManager.config.auth.SSLCertReqSuffix), 
                                path.join(hostdirpath, state.hostkey),
                                inputs.host),
           function (error, stdout, stderr) {
             if (error)
               done(stderr);
             exec(getSSLCertCmd(path.join(hostdirpath, 
                                          state.hostkey + ConfigManager.config.auth.SSLCertReqSuffix),
                                path.join(cadirpath, state.cacert), 
                                path.join(cadirpath, state.cakey),
                                path.join(hostdirpath, 
                                          state.hostkey + ConfigManager.config.auth.SSLCertSuffix)),
                  function (error1, stdout1, stderr1) {
                    if (error1)
                      done(stderr1);
                    done();
                  });
           });
    }
  };
  
  var generateSSLClientCert = function (done) {
    console.log("Creating SSL client certificate in " + clientdirpath);
    exec(getSSLClientCertReqCmd(path.join(clientdirpath, 
                                          state.clientkey + ConfigManager.config.auth.SSLCertReqSuffix), 
                                path.join(clientdirpath, state.clientkey), 
                                inputs.host, inputs.username),
         function (error, stdout, stderr) {
           if (error)
             done(stderr);
           exec(getSSLCertCmd(path.join(clientdirpath, 
                                        state.clientkey + ConfigManager.config.auth.SSLCertReqSuffix),
                              path.join(cadirpath, state.cacert), 
                              path.join(cadirpath, state.cakey),
                              path.join(clientdirpath, 
                                        state.clientkey + ConfigManager.config.auth.SSLCertSuffix)),
                function (error1, stdout1, stderr1) {
                  if (error1)
                    done(stderr1);
                  state.clientcert = state.clientkey + ConfigManager.config.auth.SSLCertSuffix;
                  done();
                });
         });
  };

  var distributeKeys = function (done) {
    console.log("Distributing generated credentials to " + inputs.host);
    exec(getDistributeKeysCmd(inputs, state),
         function (error, stdout, stderr) {
           if (error) {
             if (stderr) {
               done(stderr);
               return;
             }
             else
               done("error: unable to distribute credentials.\n - Wrong hostname/username/password?\n - Network not connected?");
           }
           done();
         });
  };
  
  var configureKeys = function (done) {
    console.log("Configuring credentials on device " + inputs.host + " for user " + inputs.username);
    exec(getConfigureKeysCmd(inputs.host, inputs.username, inputs.password,
                             state.keydir),
         function (error, stdout, stderr) {
           if (error) {
             done(stderr);
             return;
           }
           console.log(stdout);
           done();
         });
  };
  
  async.series([createKeyDirs,
                generateSSHHostKey, generateSSHClientKey,
                generateSSHHostCert, generateSSHClientCert,
                generateSSLHostCert, generateSSLClientCert,
                distributeKeys, configureKeys],
               function(e) {
                 if (e) {
                   console.log("Error occurred while setting up credentials for host " + inputs.host + " and user " +
                   inputs.username);
                   doneAuthSetup(e);
                   return;
                 }
                 console.log("Done setting up credentials for host " + inputs.host + " and user " +
                 inputs.username);
                 doneAuthSetup();
               });
}

function getCopyClientCredentialsCmd (args) {
  return "cp -r " + args;
}

function getMkDirCmd (dir) {
  return "mkdir -p " + dir;
}

function getSSHDir () {
  return path.join(ConfigManager.homedir, ".ssh");
}

function getSSHD_Dir () {
  if (process.platform === 'darwin') {
    return "/etc";
  }
  return "/etc/ssh";
}

function getSSHDReloadConfigCmd() {
  if (process.platform === 'darwin') {
    return null;
  }
  return null;
}

function getSSHDConfig () {
  return path.join(getSSHD_Dir(), "sshd_config");
}

function getSSHConfig () {
  return path.join(getSSHDir(), "config");
}

function getKnownHosts() {
  return path.join(getSSHDir(), ConfigManager.config.auth.keyDirName + "_known_hosts");
}

function getAuthorizedKeys() {
  return path.join(getSSHDir(), "authorized_keys");
}

function getChangeOwnershipCmd (user, args) {
  return "chown -R " + user + " " + args;
}

function getGlobalStateDirOwner () {
  return 'nobody';
}

function getMosquittoDir() {
  if (process.platform === 'darwin') {
    return '/usr/local/etc/mosquitto';
  }
  return '/etc/mosquitto';
}
function getMosquittoConfig () {
  // todo: remove from here, how should we do protocol-specific configuration?
  // should plugins do this?
  return path.join(getMosquittoDir(), 'mosquitto.conf');
}

function getMosquittoRestartCmd () {
  if (process.platform === 'darwin') {
    return "";
  }
  return "systemctl restart mosquitto";
}

function exec_config_credentials(username, hostname, options) {
  var hostkeydir = hostname + ConfigManager.config.auth.hostKeyNameSuffix +
      ConfigManager.config.auth.keyDirSuffix,
    clientkeydir = hostname + "_" + username + ConfigManager.config.auth.keyDirSuffix,
    cakeydir = ConfigManager.config.auth.CAName + ConfigManager.config.auth.keyDirSuffix,
    localstatedir = path.join(ConfigManager.homedir, "." + ConfigManager.config.stateDirName),
    globalstatedir = path.join(ConfigManager.getGlobalStateLoc(), ConfigManager.config.stateDirName),
    localstate = {},
    globalstate = {};
  
  // read existing state or prepare to create new state
  // local state
  if (!fs.existsSync(localstatedir)) {
    console.log("Creating local credential and configuration storage directory " + localstatedir);
    fs.mkdirSync(localstatedir);
  } else {
    console.log("Found local credential and configuration storage directory at " + localstatedir);
    try {
      var localstatemap = path.join(localstatedir, ConfigManager.config.stateMapName);
      if (fs.existsSync(localstatemap)) {
        localstate = JSON.parse(fs.readFileSync(localstatemap).toString());
      }
    } catch (e) {
      // parse exceptions aren't very user friendly, say this instead
      throw new Error("Unable to read required file " + localstatemap +
      " from the credential directory.");
    }
  }

  localstate.host = hostname;
  localstate.user = username;

  // global state
  var initGlobalState = function (done) {
    if (!fs.existsSync(globalstatedir)) {
      console.log("Creating local credential and configuration storage directory " + localstatedir);
      exec (getMkDirCmd(globalstatedir), function (error, stdout, stderr) {
        if (error)
          done(stderr);
        globalstate.host = hostname;
        done();
      });
    } else {
      var globalstatemap = path.join(globalstatedir, ConfigManager.config.stateMapName);
      try {
        if (fs.existsSync(globalstatemap))
          globalstate = JSON.parse(fs.readFileSync(globalstatemap));
      } catch (e) {
        // parse exceptions aren't very user friendly, say this instead
        throw new Error("Unable to read information necessary to configure credentials");
      }
      globalstate.host = hostname;
      done();
    }
  };

  var copyClientCredentials = function (done) {
    console.log("Copying credentials for user " + localstate.user + " to " + localstatedir);
    exec(getCopyClientCredentialsCmd(clientkeydir + " " + hostkeydir + " " + localstatedir),
    function (error, stdout, stderr) {
      if (error)
        done (stderr);
      clientkeydir = path.join(localstatedir, clientkeydir);
      done();
    });
  };

  var copyHostAndCACredentials = function (done) {
    console.log("Copying credentials for host " + localstate.host + " to " + globalstatedir);
    exec(getCopyClientCredentialsCmd(hostkeydir + " " + cakeydir + " " + globalstatedir),
      function (error, stdout, stderr) {
        if (error)
          done (stderr);
        hostkeydir = path.join(globalstatedir, hostkeydir);
        cakeydir = path.join(globalstatedir, cakeydir);
        done();
      });
  };

  var configureSSHClientKnownHosts = function (done) {
    console.log("Configuring certificate authority credential in known hosts file " + getKnownHosts());
    if (fs.existsSync(getSSHDir())) {
      var cakeyprefix = "@cert-authority";
      var knownHosts = getKnownHosts();
      var cakeystr = cakeyprefix + " *.local,localhost " +
        fs.readFileSync(path.join(cakeydir, ConfigManager.config.auth.CAName +
        ConfigManager.config.auth.privateKeyNameSuffix + ConfigManager.config.auth.SSHPubKeySuffix)).toString().trim();

      var knownHostLines = [], found = -1;
      if (fs.existsSync(knownHosts)) {
        knownHostLines = fs.readFileSync(knownHosts).toString().split(os.EOL);
        for (var i = 0; i < knownHostLines.length; i++) {
          if (knownHostLines[i].trim().indexOf(cakeyprefix) === 0) {
            found = i;
          }
          if (knownHostLines[i].trim()[0] !== '#') {
            knownHostLines[i] = '#' + knownHostLines[i];
          }
        }
      }

      if (found === -1) {
        knownHostLines.push(cakeystr);
        knownHostLines.push("");
      } else {
        knownHostLines.splice(found+1, 0, cakeystr);
      }

      fs.writeFileSync(knownHosts, knownHostLines.join(os.EOL));
    }
    done();
  };

  var configureSSHClientAuthorizedKeys = function (done) {
    console.log("Configuring certificate authority credential in authorized keys file " + getAuthorizedKeys());
    if (fs.existsSync(getSSHDir())) {
      var sectionHeader = "# added by iotkit-comm";
      var sectionFooter = "# end iotkit-comm";

      var authorizedKeys = getAuthorizedKeys();
      var caprefix = "cert-authority";
      var cakeystr = caprefix + " " + fs.readFileSync(path.join(cakeydir, ConfigManager.config.auth.CAName +
        ConfigManager.config.auth.privateKeyNameSuffix + ConfigManager.config.auth.SSHPubKeySuffix)).toString().trim();

      var configLines = [], sectionHeaderIdx = -1, i = 0;
      if (fs.existsSync(authorizedKeys)) {
        configLines = fs.readFileSync(authorizedKeys).toString().split(os.EOL);
        for (; i < configLines.length; i++) {
          if (configLines[i].trim().indexOf(sectionHeader) === 0) { // found section header
            sectionHeaderIdx = i;
            for (i = i + 1; i < configLines.length && configLines[i].trim().indexOf(sectionFooter) !== 0; i++) {
              if (configLines[i].trim().indexOf(caprefix) === 0) {
                configLines[i] = '#' + configLines[i];
              }
            }
            break;
          }
        }
      }

      if (sectionHeaderIdx === -1) {
        configLines.push(sectionHeader);
        configLines.push(cakeystr);
        configLines.push(sectionFooter);
        configLines.push("");
      } else {
        configLines.splice(sectionHeaderIdx+1, 0, cakeystr);
      }

      fs.writeFileSync(authorizedKeys, configLines.join(os.EOL));
    }
    done();
  };

  var configureSSHClient = function (done) {
    var sshConfig = getSSHConfig();
    var configLines = [];

    if (!fs.existsSync(sshConfig)) {
      if (!fs.existsSync(getSSHDir()))
        fs.mkdirSync(getSSHDir());
    } else {
      configLines = fs.readFileSync(sshConfig).toString().split(os.EOL);
    }

    console.log("Configuring SSH client: " + sshConfig);

    var sectionHeader = "# added by iotkit-comm";
    var hostLinePrefix = "Host";
    var hostLine = hostLinePrefix + " *.local localhost";

    var identityLinePrefix = "IdentityFile";
    var identityLine = "  " + identityLinePrefix + " = " + path.join(clientkeydir, localstate.host + "_" +
      localstate.user + ConfigManager.config.auth.privateKeyNameSuffix);

    var knownHostsLinePrefix = "UserKnownHostsFile";
    var knownHostsLine = "  " + knownHostsLinePrefix + " = " + getKnownHosts();
    var sectionFooter = "# end iotkit-comm";

    var i = 0, sectionHeaderIdx = -1;
    for (; i < configLines.length; i++) {
      if (configLines[i].trim().indexOf(sectionHeader) === 0) { // found section header
        sectionHeaderIdx = i;
        for (i = i + 1; i < configLines.length && configLines[i].trim().indexOf(sectionFooter) !== 0; i++) {
          if (configLines[i].trim().indexOf(hostLinePrefix) === 0) {
            configLines[i] = '#' + configLines[i];
          }
          if (configLines[i].trim().indexOf(identityLinePrefix) === 0) {
            configLines[i] = '#' + configLines[i];
          }

          if (configLines[i].trim().indexOf(knownHostsLinePrefix) === 0) {
            configLines[i] = '#' + configLines[i];
          }
        }
        break;
      }
    } // end for

    if (sectionHeaderIdx === -1) { // no config lines found
      configLines.push(sectionHeader)
      configLines.push(hostLine);
      configLines.push(identityLine);
      configLines.push(knownHostsLine);
      configLines.push(sectionFooter);
      configLines.push(""); // needed to put newline at the end (see join below)
    } else { // some config lines not found
      // add new ones
      configLines.splice(sectionHeaderIdx+1, 0, identityLine);
      configLines.splice(sectionHeaderIdx+1, 0, knownHostsLine);
      configLines.splice(sectionHeaderIdx+1, 0, hostLine);
    }

    fs.writeFileSync(sshConfig, configLines.join(os.EOL));
    done();
  };

  var configureSSHD = function (done) {
    var sshdConfig = getSSHDConfig();

    if (fs.existsSync(sshdConfig)) {
      console.log("Configuring SSH server: " + sshdConfig);
      var hostKey = globalstate.host + ConfigManager.config.auth.hostKeyNameSuffix +
        ConfigManager.config.auth.privateKeyNameSuffix;

      var authConfigLinesHeaderPattern = "added by iotkit-comm";
      var sshdAuthConfigLines =
        ["# 2 lines below added by iotkit-comm",
          "HostKey " + path.join(hostkeydir, hostKey),
          "HostCertificate " + path.join(hostkeydir, hostKey +
          ConfigManager.config.auth.SSHCertSuffix + ConfigManager.config.auth.SSHPubKeySuffix)
        ];

      var configLines = fs.readFileSync(sshdConfig).toString().split(os.EOL), i = 0;
      for (; i < configLines.length; i++) {
        if (configLines[i].indexOf(authConfigLinesHeaderPattern) !== -1) {
          break;
        }
      }

      if (i < configLines.length) { // found iotkit-comm config lines
        var numlines = parseInt(configLines[i].trim().split(' ')[1]);
        configLines.splice(i, numlines + 1, sshdAuthConfigLines[0], sshdAuthConfigLines[1], sshdAuthConfigLines[2]);
      } else {
        configLines.push("");
        configLines = configLines.concat(sshdAuthConfigLines);
      }

      fs.writeFileSync(sshdConfig, configLines.join(os.EOL));

      //var sshdreloadcmd = getSSHDReloadConfigCmd();
      //if (sshdreloadcmd) {
      //  exec(sshdreloadcmd, function (error, stdout, stderr) {
      //    if (error) {
      //      done(stderr);
      //      return;
      //    }
      //    done();
      //  });
      //} else {
      //  done();
      //}
    } else {
      console.log("WARNING: SSH server configuration was not successful");
      console.log("  Could not locate SSH service configuration file expected at " + sshdConfig);
    }

    done();
  };

  var configureMosquitto = function (done) {
    var mosquittoConfig = getMosquittoConfig();

    if (fs.existsSync(mosquittoConfig)) {
      console.log("Configuring Mosquitto server: " + mosquittoConfig);
      var sectionHeader = "# added by iotkit-comm";
      var addLines =
        [sectionHeader,
          "user " + getGlobalStateDirOwner(),
          "port 1883",
          "",
          "cafile " + path.join(cakeydir, ConfigManager.config.auth.CAName +
          ConfigManager.config.auth.SSLCertSuffix),
          "certfile " + path.join(hostkeydir, globalstate.host +
          ConfigManager.config.auth.hostKeyNameSuffix + ConfigManager.config.auth.privateKeyNameSuffix +
          ConfigManager.config.auth.SSLCertSuffix),
          "keyfile " + path.join(hostkeydir, globalstate.host +
          ConfigManager.config.auth.hostKeyNameSuffix + ConfigManager.config.auth.privateKeyNameSuffix),
          "require_certificate true",
          "use_identity_as_username true",
          "# end iotkit-comm",
        ""];

      console.log("When run as root, Mosquitto server will now switch to running as user: " + getGlobalStateDirOwner());

      var configLines = fs.readFileSync(mosquittoConfig).toString().split(os.EOL);
      var listenerPorts = [];
      var wsRe = /\s+/;
      var mqttDefaultSecurePort = 8883;
      var sectionStartIdx = -1;

      for (var i = 0; i < configLines.length; i++) {
        var configLine = configLines[i].trim();

        if (configLine.indexOf(sectionHeader) === 0) { // found existing iotkit-comm configuration
          sectionStartIdx = i;
          configLines[i+4] = addLines[4];
          configLines[i+5] = addLines[5];
          configLines[i+6] = addLines[6];
          break;
        }

        if (configLine.indexOf('user') === 0) {
          if (configLine.split(wsRe)[1] !== getGlobalStateDirOwner()) {
            configLines[i] = '#' + configLines[i];
          } else {
            addLines[1] = "";
          }
        }

        if (configLine.indexOf('listener') === 0) {
          listenerPorts.push(parseInt(configLine.split(wsRe)[1]));
        }

        if (configLine.indexOf('port') === 0) {
          addLines[2] = "";
        }
      }

      if (sectionStartIdx === -1) { // iotkit-comm section not found. Add to end.
        if (!listenerPorts.length) { // no listeners found
          addLines[3] = "listener " + mqttDefaultSecurePort;
        } else { // existing listeners found
          listenerPorts.sort(function (p1, p2) {
            if (p1 < p2) {
              return -1;
            }

            if (p1 > p2) {
              return 1;
            }

            return 0;
          });
          addLines[3] = "listener " + (listenerPorts[listenerPorts.length - 1] + 1);
        }
        configLines = configLines.concat(addLines);
        globalstate.mosquittoSecurePort = parseInt(addLines[3].split(wsRe)[1]);
        console.log("Mosquitto server can now accept secure connections on port " +
        globalstate.mosquittoSecurePort);
      } else {
        globalstate.mosquittoSecurePort = parseInt(configLines[sectionStartIdx + 3].trim().split(wsRe)[1]);
        console.log("Mosquitto server can now accept secure connections on port " +
        globalstate.mosquittoSecurePort);
      }

      fs.writeFileSync(mosquittoConfig, configLines.join(os.EOL));
    } else {
      console.log("WARNING: Mosquitto server was not configured");
      console.log("  The configuration file expected at " + mosquittoConfig + " was not found");
    }

    done();
  };

  // configureCredentials is executed via sudo for non-root users.
  // This causes the iotkit-comm state folder in that user's home directory to belong
  // to root. Correct this by changing ownership to this user.
  var changeLocalStateOwnership = function (done) {
    exec (getChangeOwnershipCmd(localstate.user, localstatedir + " " + getKnownHosts() + " " + getAuthorizedKeys()),
      function (error, stdout, stderr) {
        if (error) {
          done(stderr);
          return;
        }
        done();
      });
  };

  // Global state/keydir owner is 'root'. This does not work for mosquitto which runs as user 'mosquitto'.
  // change ownership to a well known user on the system so that private keys are readable by
  // both SSH and mosquitto (which will be configured to run as that well known user, see
  // configureMosquitto() ).
  var changeGlobalStateOwnership = function (done) {
    console.log("Setting owner of " + globalstatedir + " to: " + getGlobalStateDirOwner());
    exec (getChangeOwnershipCmd(getGlobalStateDirOwner(), globalstatedir),
      function (error, stdout, stderr) {
        if (error) {
          done(stderr);
          return;
        }
        done();
      });
  };

  var restartMosquitto = function (done) {
    var cmd = getMosquittoRestartCmd();

    if (!cmd) {
      console.log("MANUAL ACTION REQUIRED: Please restart Mosquitto server on device " + globalstate.host);
      done();
      return;
    }

    exec (cmd, function (error, stdout, stderr) {
      if (error) {
        done(stderr);
        return;
      }
      console.log("Restarted Mosquitto server.");
      done();
    });
  };

  var saveState = function (done) {
    try {
      fs.writeFileSync(path.join(localstatedir, ConfigManager.config.stateMapName), JSON.stringify(localstate));
      fs.writeFileSync(path.join(globalstatedir, ConfigManager.config.stateMapName), JSON.stringify(globalstate));
    } catch (e) {
      done(e);
      return;
    }
    done();
  };

  async.series([initGlobalState, copyClientCredentials, copyHostAndCACredentials, configureSSHClient,
      configureSSHClientKnownHosts, configureSSHClientAuthorizedKeys, configureSSHD, configureMosquitto,
      saveState, changeLocalStateOwnership, changeGlobalStateOwnership, restartMosquitto],
    function (e) {
      if (e)
        throw e;
    });
}

// begin
if (process.argv.length === 2) {
  process.argv.push("-h");
}

program.parse(process.argv);