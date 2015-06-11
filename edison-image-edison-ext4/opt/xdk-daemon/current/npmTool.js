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
var semver = require('semver');
var fs = require('fs');
var path = require('path');

//detect alternate path for node.js headers - needed for node-gyp to run
//------------------------------------------------------------
  var searchPath = ['/usr/include/node-gyp'];
  var version = semver.parse(process.version);//argv[0] || gyp.opts.target || process.version
  var nodeHeadersPath = null;
  for(var i in searchPath)
  {
    var gypiFile = 'common.gypi'
    var tmpNodeDir = path.resolve(searchPath[i],version.version);
    if (fs.existsSync(path.resolve(tmpNodeDir,gypiFile))) {
      nodeHeadersPath = tmpNodeDir;
      break;
    }
  }
//------------------------------------------------------------

//make NPMTool an EventEmitter;
sys.inherits(NPMTool, events.EventEmitter);

/**
 * This handles executing NPM commands on the IoT device
 */

function NPMTool() {
  if(false === (this instanceof NPMTool)) {
    return new NPMTool(appPath);
  }

  //_npmCommand - execute an actual NPM command
  //------------------------------------------------------------
  _npmCommand = function(npmCommandToRun,appPath)
  { 
    if(npmCommandToRun == undefined)
      npmCommandToRun = 'install';

    var spawn = require('child_process').spawn;
    var path = require('path');

    var nodeModule = path.normalize(appPath);
    nodeModule = path.resolve(nodeModule);

    //Assume node and npm execs are in the same directory instead of hardcoding '/usr/bin/npm';
    //This can be changed to a more intellegent 'search' for the npm app in the future (if needed);
    var npmBinary = process.execPath.match(/(.+\/).+$/)[1]+'npm';

    var args = [npmCommandToRun,'--color=always'] //Array of arguments to be passed to the program

    if(nodeHeadersPath != null)
    {
      args.push('--nodedir='+nodeHeadersPath);
    }
    var env = process.env;//fowarding process.env is esential for make, etc ot work//{} //JSON Object of Environment Variables
    var execArgv = [];
    
    //do not put the path of the package into Args, set the cwd instead
    var nodeArgs = execArgv.concat(args);
    
    //setting the correct cwd is vital to having npm install,etc work
    var child = spawn(npmBinary,nodeArgs,
      {
        env: env,
        cwd: nodeModule,
        detached:true
      }
    );

    return child;
  }


  //====================================================================================================================
  // Privleged Functions
  //====================================================================================================================

    // Run the NPM command
    //--------------------------------------
    this.runCommand = function(command,options,appPath,_emitter)
    {
      var _self = this;
      var fancyTitle = options.fancyTitle||'Intel (R) IoT - NPM Install';
      var titleNote =  options.titleNote||'(may take several minutes)'.grey;
      if(!_emitter) return;      
      _emitter.emit('console','\n');
      _emitter.emit('console','|================================================================\n');
      _emitter.emit('console','|    '+fancyTitle+' - '+titleNote+'\n');
      _emitter.emit('console','|================================================================\n');

      console.log(command,appPath);
      var installProcess = _npmCommand(command,appPath);

      installProcess.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
        _emitter.emit('console',data);
      });

      installProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
        _emitter.emit('console',data);
      });

      installProcess.on('close', function(code) {
        var exitCode = '[ '+code+' ]';
        _emitter.emit('console','|================================================================\n');
        _emitter.emit('console','|    NPM '+command.toUpperCase()+' COMPLETE!'+exitCode.green+'   '+exitCode.red+'\n');
        _emitter.emit('console','|================================================================\n');
      });
      installProcess.on('error',function(code){
        var exitCode = '[ '+code+' ]';
        _emitter.emit('console','|================================================================\n');
        _emitter.emit('console','|    NPM '+command.toUpperCase()+' ERROR! '+exitCode.red+'\n');
        _emitter.emit('console','|================================================================\n');
      });
      return installProcess;
    }    
    
    events.EventEmitter.call(this);


}

module.exports = NPMTool;
