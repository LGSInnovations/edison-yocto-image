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
var remoteDebuggerProtocol = require('./startDebugProtocol.js');
var colors = require('colors');
var NPMTool = require('./npmTool');


var startedProcesses = [];
//=============================================================
var Promise = require('promise');
//Fail extension
Promise.prototype.fail = function (cb) {return this.then(undefined, cb)};

//==============================================================

//make AppWrapper an EventEmitter;
sys.inherits(AppWrapper, events.EventEmitter);

//var pidTable = {};
//In the future maybe implement a table of all started Application pids
//so that we can ensure all processes are stopped by calling process.kill on the table.

/**
 * AppWrapper class.  This is the running/debugging app on the IoT device
 * We keep track of the status and handle execution here.
 */

function AppWrapper(appPath) {
    if(false === (this instanceof AppWrapper)) {
        return new AppWrapper(appPath);
    }

    var v8PortStartRange = 5858;
    var chromePortStartRange = 6868;
    var applicationState = {
      'appPath':appPath,
      'isRunning':false,
      'appProcess':null,
      'isDebugging':false,
      'v8DebugPort':null,
      'chromeDebugPort':null,
      'debuggerProcess':null,
      'npmProcess':null
    }

    this.getStartedProcesses = function()
    {
      return startedProcesses;
    }
    this.applicationState = applicationState;
  //====================================================================================================================
  // Private Functions
  //====================================================================================================================

    function checkPort(startRange)
    {
      var portfinder = require('portfinder');
      portfinder.basePort = startRange;

      var getPort = Promise.denodeify(portfinder.getPort);
      return getPort();
    }


    function testPromise(success)
    {   
        var tp = new Promise(function(resolve,reject){
          if(success){
            resolve();
          } else {
            reject();
          }
        });
        return tp;
    }

    //_spawnApp
    //------------------------------------------------------------
    var _spawnApp = function(options)
    {
      var spawn = require('child_process').spawn;
      var path = require('path');

      var nodeModule = path.normalize(applicationState.appPath);
      nodeModule = path.resolve(nodeModule);

      var nodeBinary = process.execPath;
      var args = [] //Array of arguments to be passed to the program
      var env = process.env;//fowarding process.env is esential for make, etc ot work//{} //JSON Object of Environment Variables
      var execArgv = [];

      //If debug option is specified find a free port and use it
      if(options && options.debug && options.debugPort) {
        execArgv = ['--debug-brk='+options.debugPort]; //break on first line of code that is executed (may be want we want once we add a "stop debugging" button/feature)
      }

      var nodeArgs = execArgv.concat(args).concat([nodeModule]);
      var child = spawn(nodeBinary,nodeArgs, {env: env,detached:true})
      startedProcesses.push(child.pid);
      return child;
    };

    var parseLaunchOptions = function(options)
    {
      return new Promise(function(resolve,reject){
        if(options == undefined || options == null) {
          options = {};
        }
        if(options.debug)
        {
          checkPort(v8PortStartRange)
          .then(function(availablePort){
            options.v8DebugPort = availablePort;
            return checkPort(chromePortStartRange);
          })
          .then(function(availablePort){
            options.chromeDebugPort = availablePort;
            resolve(options);
          });
        }
        else
        {
          resolve(options);
        } 
      });
    };



  //====================================================================================================================
  // Privleged Functions
  //====================================================================================================================

    // NPM INSTALL - see npmTool.js
    //--------------------------------------
    this.install = function(options)
    {
      var _self = this;
      var fancyTitle = 'Intel (R) IoT - NPM Install';
      var titleNote =  '(may take several minutes)'.grey;

      var npm = new NPMTool();      
      applicationState.npmProcess=npm.runCommand('install',{fancyTitle:fancyTitle,titleNote:titleNote},appPath,_self);
      return applicationState.npmProcess;
    }

    this.clean = function(options){
      var _self = this;
      var fancyTitle = 'Intel (R) IoT - NPM Rebuild';
      var titleNote =  '(may take several minutes)'.grey;

      var npm = new NPMTool();      
      applicationState.npmProcess=npm.runCommand('rebuild',{fancyTitle:fancyTitle,titleNote:titleNote},appPath,_self);
      return applicationState.npmProcess;
    }

    // START
    //--------------------------------------
    this.startNew = function(options)
    {
      var _self = this;
    
    }

    // DEBUG
    //--------------------------------------
    // This launches the app in Debug mode and will send messages
    // to the XDK to launch Node Inspector
    this.debug = function()
    {
      var _self = this;
      
      applicationState.v8DebugPort = 5858;
      applicationState.chromeDebugPort = 7878;
       // checkPort(5858)
      //.then(function(v8Port){
      var options = {debug:true, debugPort: applicationState.v8DebugPort};
      _self.emit('console','=> Debugging App');
      applicationState.appProcess = _spawnApp(options);
      applicationState.isDebugging=true;
        //Event/errror handlers
      applicationState.appProcess.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
        _self.emit('console',data);
      });

      applicationState.appProcess.stderr.on('data', function (data) {
        //This is a hack - the first line back is stderr about 'debugger listening'
        if(data.toString().indexOf('debugger listening')!==-1) return;
        // don't stop debugging on first (any) error (JIRA HTML-5964)
        // applicationState.isDebugging=false;
        console.log('stderr: ' + data);
        // don't stop the program under test either when we write to stderr 
        // _self.stop(true);
        _self.emit('error',data);
      });

      applicationState.appProcess.on('close', function(code) {
        console.log('Child process closed');
        _self.stop(true);
        _self.emit('close',code);      
      });
        
      applicationState.appProcess.on('disconnect', function(code) {
        applicationState.isDebugging=false;
        console.log('Child process disconnected');
        _self.stop(true);
        _self.emit('close',code);
      });

      applicationState.appProcess.on('exit',function(code){
        console.log('Child process exited');
        _self.stop(true);
        _self.emit('close',code);
      })
 
          //Step 3: start V8 -> ChromeDevTools translation on websocket
      applicationState.debuggerProcess = remoteDebuggerProtocol(applicationState.v8DebugPort,applicationState.chromeDebugPort);
      applicationState.debuggerProcess.start();
      applicationState.debuggerProcess.on('error',function(code){
        console.log('=>debugger error<=',code);
        _self.stop(true);
        _self.emit('error',code);        
      });
      applicationState.debuggerProcess.on('connected',function(code){
        
        console.log('=>debugger connected<=',code);
        _self.emit('connected',code);
      });
      applicationState.debuggerProcess.on('close',function(code){
        console.log('=>debugger close<=',code);
        applicationState.isDebugging=false;
        _self.stop(true);
        _self.emit('close',code);
      });      
    }
    
    // START the app
    //--------------------------------------
    this.start = function(options)
    {
      var _self = this;
      if(!options){var options = {};}
     // checkPort(5858)
      //.then(function(v8Port){
        console.log('V8PORT REC');
        v8DebugPort = 5858;//v8Port;
        options.debugPort = v8DebugPort;
        applicationState.appProcess = _spawnApp(options);
        //pidTable[applicationState.appProcess.pid] = true; //implement in future
        applicationState.isRunning=true;

          //Event/errror handlers
        applicationState.appProcess.stdout.on('data', function (data) {
          console.log('stdout: ' + data);
          _self.emit('console',data);
        });

        applicationState.appProcess.stderr.on('data', function (data) {
          applicationState.isRunning=false;
          if(options.silent!==true)
          {
            console.log('stderr: ' + data);            
            _self.emit('error',data);
          }
        });

          applicationState.appProcess.on('close', function(code) {
            console.log('Child process closed');
            applicationState.isRunning=false;
            _self.emit('close',code);
            
        });
          
        applicationState.appProcess.on('disconnect', function(code) {
            console.log('Child process disconnected');
            applicationState.isRunning=false;
        });

        applicationState.appProcess.on('exit',function(){
          applicationState.isRunning=false;
          console.log('child exited');
        })     
    }

    // STOP the app
    //--------------------------------------
    this.stop = function(silent)
    {
      var _self = this;
      if(!silent) {
        _self.emit('console','=> Stopping App <=\n');
        console.log('=> Stopping App <=');
      }
      //Use a try/catch just in case the app is in an odd state
      try {
        if(applicationState.appProcess&& applicationState.appProcess.kill)
        {
          applicationState.appProcess.kill(); //'SIGKILL'
        }
        if(applicationState.debuggerProcess)
        {
          applicationState.debuggerProcess.stop();
        }
        console.log(applicationState.npmProcess);
        if(applicationState.npmProcess)
        {
          applicationState.npmProcess.kill();//'SIGKILL'
        }
      }
      catch(e){
        console.log("Error killing\n\r");
        console.log(e);
      }
      applicationState.isRunning=false;
      applicationState.isDebugging=false;
    }
    events.EventEmitter.call(this);

}

module.exports = AppWrapper;