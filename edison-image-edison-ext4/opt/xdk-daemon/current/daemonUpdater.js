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
 
var sys = require('util');
var events = require('events');

//=============================================================
var Promise = require('promise');
var ncp = require('ncp');
var fs = require('fs');
var NCP=Promise.denodeify(ncp);
var NPMTool = require('./npmTool');
var daemonUtils = require('./daemonUtils');
//Fail extension
Promise.prototype.fail = function (cb) {return this.then(undefined, cb);};

//==============================================================

//make AppWrapper an EventEmitter;
sys.inherits(DaemonUpdater, events.EventEmitter);


var pathToTmp_ = '/tmp',
    currentDir='/home/root/appDaemon/current/',
    previousDir='/home/root/appDaemon/previous/';

/**
 * This handles updating the daemoon code.  We have two slots 
 * that we store, the current and previous.  The idea is 
 * that previous will work and we can roll back if the update failed
 * to current.
 */

function DaemonUpdater() {
  if(false === (this instanceof DaemonUpdater)) {
    return new DaemonUpdater();
  }


  //Copy the current daemon to the previous slot
  function copyCurrent(){
    daemonUtils.clearFolder(previousDir);
    return NCP(currentDir,previousDir);
  }



  //Untar the bundle and install it
  this.installUpdate=function(message) {
    var _self = this;
    var fileName = 'update.tar';    
    var pathToZipFile = pathToTmp_ + "/" + fileName;
    var data = message;
    fs.writeFile(pathToZipFile, data, function(error) {
      if (error) {
        console.log("Error writing daemon to disk.",error);
        _self.emit('error',error);
      } else {
        // unzip the bundle        
        copyCurrent()
        .then(function(){
         // try {
            //Clear the currrent folder and unzip it
            daemonUtils.clearFolder(currentDir);
            daemonUtils.unzip(pathToZipFile,currentDir)
            .then(function(){
              console.log("running npm install");
              var installer=_self.runNPMRebuild();
              installer.on('close',function(res){
                //_self.emit('close','Installer completed');
                //kill the current process
                console.log("restarting process");
                _self.emit('console','Upgrade complete.  Process restarting');
                process.exit(code=0);
              });
              installer.on('error',function(res){
                console.log('error ',res);
                daemonUtils.clearFolder(currentDir);
                NCP(previousDir,currentDir).then(function(){
                  _self.emit('error','NPM error: '+res);
                });                
              });
            })
            .fail(function(res){
              console.log("error ",res);
              NCP(previousDir,currentDir).then(function(){
                _self.emit('error',res);
              });
            });            
        }).
        fail(function(res){
          //ws.send(JSON.stringify({'message': 'error', 'data': 'Unable to extract update'}));
          daemonUtils.clearFolder(currentDir);
          NCP(previousDir,currentDir).then(function(){
            _self.emit('error','Unable to extract update '+res);
          });                          
        });
      }
    });
  };


  //NPM rebuild command.  The node_modules directory is included in the tar
  this.runNPMRebuild=function(){
    var _self = this;
    var fancyTitle = 'Intel (R) IoT - daemon update';
    var titleNote =  '(may take several minutes)'.grey;

    var npm = new NPMTool();
    return npm.runCommand('rebuild',{fancyTitle:fancyTitle,titleNote:titleNote},currentDir,_self);
  };
  events.EventEmitter.call(this);
}

module.exports = DaemonUpdater;