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
/**
 * main.js
 * This script handles running a 'working' version of the daemon
 * We have three possible slots
 * /default - This is the default shipped daemon
 * /current - This is the daemon that is running
 * /previous - When upgrading, we move the current to preivous in case something is broken in current
 */

 var Promise = require('promise');
 var path_ = require('path');
 var ncp = require('ncp');
 var NCP=Promise.denodeify(ncp);
 var daemonScript='appDaemon.js';
 var daemonDirs = {
  DEFAULT:'default',
  CURRENT:'current',
  PREVIOUS:'previous'
};

var daemonPath=__dirname;
Promise.prototype.fail = function (cb) {return this.then(undefined, cb);};

function clearFolder(path,remove,ignore){
  var files;
  try {
    files=fs.readdirSync(path);
  }
  catch(e){ return;}
  var len=files.length;
  if(len>0){
    for(var i=0;i<len;i++){
      var destPath=path+'/'+files[i];
      destPath=destPath.replace("//","/");        
      if(fs.statSync(destPath).isFile())
      {        
        fs.unlinkSync(destPath);
      }
      else
      {
        if(!ignore||(ignore&&path.indexOf(ignore)===-1))
          clearFolder(destPath,true,ignore);
      }
    }
  }  
  if(remove&&(ignore&&path.indexOf(ignore)===-1))
    fs.rmdirSync(path);

}

var testDaemon = function(path){    
  return new Promise(function(resolve,reject){
    var fork = require('child_process').fork;
    var daemonCommand = fork(path_.join(path,daemonScript),[],{env:process.env});
    var timer=setTimeout(function(){
      resolve(true);
    },600);

    daemonCommand.on('close', function (code) {
      if(code)
        reject(code.toString());
      clearTimeout(timer);
      if (code !== 0) {
        console.log('ps process exited with code ' + code);
      }
    });
  });
};

testDaemon(path_.join(daemonPath,daemonDirs.CURRENT))
.then(function(){
  console.log('Current daemon started');
}).
fail(function(res){  
  testDaemon(path_.join(daemonPath,daemonDirs.PREVIOUS))
  .then(function(){
    console.log('Previous daemon started');
    //We need to copy the previous daemon over to the current.
    clearFolder(path_.join(daemonPath,daemonDirs.CURRENT));
    NCP(path_.join(daemonPath,daemonDirs.PREVIOUS),path_.join(daemonPath,daemonDirs.CURRENT)).
    then(function(){
      console.log('Previous daemon copied to current');
    })
    .fail(function(res){
      console.log('Error recovering previous daemon.  '+res);
    });
  })
  .fail(function(){
    testDaemon(path_.join(daemonPath,daemonDirs.DEFAULT))
    .then(function(){
      console.log('Default daemon started');
    })
    .fail(function(res){
      console.log('we are in trouble',res);
    });
  });
});