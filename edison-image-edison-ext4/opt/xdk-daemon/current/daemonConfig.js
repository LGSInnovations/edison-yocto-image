/**
 * @license Copyright 2013 - 2014 Intel Corporation All Rights Reserved.
 *
 * The source code, information and material ("Material") contained herein is owned by Intel Corporation or its
 * suppliers or licensors, and title to such Material remains with Intel Corporation or its suppliers or
 * licensors. The Material contains proprietary information of Intel or its suppliers and licensors. The
 * Material is protected by worldwide copyright laws and treaty provisions. No part of the Material may be used,
 * copied, reproduced, modified, published, uploaded, posted, transmitted, distributed or disclosed in any way
 * without Intel's prior express written permission. No license under any patent, copyright or other intellectual
 * property rights in the Material is granted to or conferred upon you, either expressly, by implication,
 * inducement, estoppel or otherwise. Any license under such intellectual property rights must be express and
 * approved by Intel in writing.
 *
 * Unless otherwise agreed by Intel in writing, you may not remove or alter this notice or any other notice
 * embedded in Materials by Intel or Intel's suppliers or licensors in any way.
 */

var os = require('os');
var fs = require('fs');
var jf = require('jsonfile');
var path = require('path');

/**
 * daemonConfig class
 */

function daemonConfig(filePath,silent) {
    if(false === (this instanceof daemonConfig)) {
        return new daemonConfig(filePath,silent);
    }
    
    var self_ = this;
    var configFileTimestamp;
    var configFilePath;
    var verbose = silent?false:true;

  //====================================================================================================================
  // Privleged Functions
  //====================================================================================================================

    this.load = function(configFile)
    {
      var configData = {name:'',whitelist:[]};
      if(configFile)
      {
        configFilePath = path.normalize(configFile);
      }

      try {
        configFileTimestamp = fs.statSync(configFilePath).mtime;
        if(verbose){console.log('Loading '+configFilePath+' last modified: '+configFileTimestamp);}
        configData = jf.readFileSync(configFilePath);
      }
      catch(err) {
        console.log('error reading config file: '+configFilePath);
      }
      if(!configData.whitelist) {
        configData.whitelist = [];
      }
      return configData;
    };

    this.save = function()
    {
      try {
        jf.writeFileSync(configFilePath,this.data);
      }
      catch(err) {
        console.log('error writing config file: '+configFilePath);
      }
    };

    this.ipWhitelist = function(data)
    {
      if(fs.statSync(configFilePath).mtime != configFileTimestamp) {
        self_.data = self_.load();
      }

      //Allow Whitelist to be disabled
      if(self_.data.whitelistEnabled !== undefined && self_.data.whitelistEnabled === false) {
        return true;
      }

      var clientAddress = data.req.headers['x-forwarded-for'] || data.req.connection.remoteAddress;
      
      if(clientAddress === '127.0.0.1' || clientAddress === 'localhost') { 
        return true;
      }
      
      for(var i in self_.data.whitelist)
      {
        if(self_.data.whitelist[i] == clientAddress) {
          return true;
        }
      }
      console.log('UNAUTHORIZED: IP address '+clientAddress+' is not in the whitelist (see config.json)');
      return false;
    };

    //load the config file into the data object
    this.data = this.load(filePath);
}

module.exports = daemonConfig;