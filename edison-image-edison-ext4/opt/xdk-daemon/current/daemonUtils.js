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
 
var fs = require('fs');
var Promise = require('promise');

/**
 * This object has some helper functions for the daemon


/**
 * Synchronous folder removal
 * ignore is a string/folder we should skip (node_modules)
 */
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




function checkEnvPathForFile(fileToFind) {
  var fullFilePath = null;
  var fs = require('fs');
  var path = require('path');
  
  if(process.env.PATH) {
    var binPaths = process.env.PATH.split(':');
    for(var i in binPaths) {
      try {
        var pathToTest = path.resolve(binPaths[i],fileToFind);
        var fileStats = fs.statSync(pathToTest);
        if(fileStats.isFile()) {
          console.log(pathToTest);
          fullFilePath = pathToTest;
          break;
        }
      }
      catch(err) {

      }
    }
  }
  return fullFilePath;
}


function findTarBinary()
{ 
  var binaryNames = ['bsdtar','tar'];
  for(var i in binaryNames)
  {
    var tmpPath = checkEnvPathForFile(binaryNames[i]);
    if(tmpPath !== null) {
      return tmpPath;
    }
  }

  return 'tar';
}

//Shell out to the command line and execute unzip/tar
//The node modules to unzip/tar are really flakey, and 
//since BusyBox is used on the IoT device, we have to be careful about
//what is sent over so BusyBox can extract it.
function unzip(src,dest){
  return new Promise(function(resolve,reject){
    var sys=require('sys');
    var exec=require('child_process').exec;
    var pathToTar = findTarBinary();

    exec(pathToTar+' -xvf '+src+' -C '+dest,function(error,stout,sterr){
      if(error!==null)
        reject(error);
      else
        resolve(true);
    });
  });
}

module.exports = {
  clearFolder:clearFolder,
  unzip:unzip
};