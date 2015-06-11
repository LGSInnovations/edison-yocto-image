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

/** @module config/configManager */

var fs = require('fs');
var path = require('path');

/** Directory name containing default plugins */
var CORE_PLUGINS_DIR_NAME = "plugins";

/** Directory name containing default plugin interfaces */
var CORE_PLUGIN_INTERFACE_DIR_NAME = "plugin-interfaces";

/** Name of the interface-of-interfaces file */
var PLUGIN_SUPER_INTERFACE_FILE_NAME = "interface-for-interfaces.json";

/** Name of user defined config file if present. Expected to be in the home directory. */
var USER_DEFINED_CONFIG_FILE_NAME = ".iotkit-comm-config.json";

/** Set user's home directory */
exports.homedir = getUserHomeDirPath();

exports.globalstate = null;

exports.localstate = null;

/** Set the platform-specific root directory */
//exports.rootdir = (process.platform === "win32") ? exports.homedir.split(path.sep)[0] : "/";

/** Get path of home directory */
function getUserHomeDirPath() {
  var homedir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
  if (homedir)
    return homedir;
  return ".";
}

exports.getGlobalStateLoc = function () {
  // todo: support for different platforms
  return "/usr/local";
};

/** Join default and user-defined configuration */
function concatUserDefinedConfigFile() {
  var userDefinedConfigFilePath = path.join(exports.homedir, USER_DEFINED_CONFIG_FILE_NAME);
  
  if (!fs.existsSync(userDefinedConfigFilePath)) {
    return;
  }

  var userConfig;
  try {
    userConfig = JSON.parse(fs.readFileSync(userDefinedConfigFilePath));
  } catch (err) {
    console.log("ERROR: empty or malformed configuration file at '" + userDefinedConfigFilePath +
      "'. Config file must be in JSON format.");
    throw err;
  }

  if (!userConfig.pluginDirPaths || userConfig.pluginDirPaths.length === 0) {
    return;
  }

  exports.config.pluginDirPaths = exports.config.pluginDirPaths.concat(userConfig.pluginDirPaths);
  exports.config.pluginInterfaceDirPaths = exports.config.pluginInterfaceDirPaths.concat(userConfig.pluginInterfaceDirPaths);
}

function loadLocalState(config) {
  var localStateMap = path.join(exports.homedir, "." + config.stateDirName, config.stateMapName);
  if (fs.existsSync(localStateMap)) {
    exports.localstate = JSON.parse(fs.readFileSync(localStateMap).toString());
  }
}

function loadGlobalState(config, location) {
  var globalStateMap = path.join(location, config.stateDirName, config.stateMapName);
  if (fs.existsSync(globalStateMap)) {
    exports.globalstate = JSON.parse(fs.readFileSync(globalStateMap).toString());
  }
}

/** Configuration object */
exports.config = null;

/** Read default and user-defined configuration files */
exports.init = function (dir, configFileName) {
  "use strict";
  exports.config = JSON.parse(fs.readFileSync(path.join(dir, configFileName)));
  exports.config.pluginDirPaths.push(path.join(dir, CORE_PLUGINS_DIR_NAME));
  var pluginInterfaceDirPath = path.join(dir, CORE_PLUGIN_INTERFACE_DIR_NAME);
  exports.config.pluginInterfaceDirPaths.push(pluginInterfaceDirPath);
  exports.config.superInterfaceFilePath = path.join(pluginInterfaceDirPath, PLUGIN_SUPER_INTERFACE_FILE_NAME);

  concatUserDefinedConfigFile();
  loadLocalState(exports.config);
  loadGlobalState(exports.config, exports.getGlobalStateLoc());
};