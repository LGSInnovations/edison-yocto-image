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

//NOTES: may consider switching to useing promises (like XDK) instead of callbacks.
var runningApps = [];

var appWrapper = require('./appWrapper');
var mdns = require('mdns2');
var os = require('os');
var fs = require('fs');
var jf = require('jsonfile');
var path = require('path');

var daemonUpdater = require('./daemonUpdater');
var daemonUtils = require('./daemonUtils');
var WEBSOCKETOPEN=1; // =  WebSocket.Open

var currentFile_,
  pathToTmp_ = '/tmp',
  pathToProject_ = '/node_app_slot/',
  crashLog_ = __dirname+'/crash.log',
  configFile_ = __dirname+'/../config.json',
  basePort=58888;

var config = new require('./daemonConfig')(configFile_);

var portfinder = require('portfinder');
portfinder.basePort=basePort;

//Create a simple websocket server using ws
var WebSocketServer = require('ws').Server;
var serviceAdvertisement = null;
var productName = 'Intel XDK - IoT App Daemon (requires Intel XDK IoT Edition greater than 075)';
var productVersion = '0.0.31';

var globalWs_;

/**
 * this function is called at startup.  It finds an open port
 * and starts the web socket up.  If it fails, we try another port and continue on
 * till we get a connection
 * It will then broadcast the port and info to the Intel XDK.
 * Finally, we have listners for the web socket to dispatch messages.
 */

function initWebSocketServer(){

  portfinder.getPort(function(err,port){
    if(err===null){
      console.log("staring on baseport = "+port);
      basePort=port;
      //create a websocket server listening only on localhost (ssh tunnel will be used to connect XDK to IoT Device)
      wss = new WebSocketServer({host:'localhost',port: basePort,verifyClient:config.ipWhitelist});

      //Broadcast that this device is available to the Intel XDK.
      wss.on('listening', function(){
      //ZEROCONF/MDNS BROADCAST
      mdnsBroadcast();
      //RUN LAST KNOW APP
      runAtStartup();
     });

      wss.on('error',function(res){
        if(res.code==='EADDRINUSE')
        {
          return initWebSocketServer();
        }
      });
      /**
       * this event is triggered when the Intel XDK connects to the IoT daemon
       */

      // wss.on('headers',function(ws) {console.log(require('util').inspect(ws, {depth:null})); });

      wss.on('connection', function(ws) {
        console.log('clientAddress: '+ws.upgradeReq.connection.remoteAddress);

        
        globalWs_=ws;
        var binaryTask;
        sendToConsole(ws, productName+' v'+productVersion+' - commands: run, list, debug, status\n');
        returnStatus(ws);
        if(crashLogMsg&&crashLogMsg.length>0){
          sendToConsole(ws,'Recovering from a crash\n');
          sendToConsole(ws,crashLogMsg);
        }
        
        /**
         * Any web socket messages sent to the IoT device are handled here.
         * We inspect the message and route it approprialty.
         */
        ws.on('message', function(message, flags) {  
          if (flags.binary === true) {
            if(binaryTask==='upgrade')
              updateDaemon(ws,message);
            else if(binaryTask==='sync')
              downloadProject(ws, message);
            else if(binaryTask==='clean')
              downloadProject(ws,message,true);
          } else {
            console.log('received: %s', message);
            var messageData;
            try {
              messageData = JSON.parse(message);
            }
            catch(e){
              messageData={};
            }

            switch(messageData.channel) {
              case 'command':
                handleCommand(ws,messageData.message);
                break;
              case 'sync':
                binaryTask='sync';
                handleFileInfo(ws, messageData.message);
                break;
              case 'clean':
                binaryTask='clean';
                handleFileInfo(ws, messageData.message);
                break;
              case 'config':
                handleConfig(ws, messageData.message, messageData.data);
                break;
              case 'debugger':
                handleDebugRequests(ws,messageData.message);
                break;
              case 'status':
              returnStatus(ws,messageData.message);
                break;
              case 'upgrade':
              console.log('updating daemon');
              binaryTask='upgrade';
              //updateDaemon(ws,messageData.message);
                break;
              default:
                console.log('Invalid Message');
                break;
            }
          }
        });
      });
    }
  });
}

function handleFileInfo(ws, message) {
  if (message.type === "file") {
    currentFile_ = message.data;
  }
}

/**
 * This function handles service broadcasting via MDNS.
 */
function mdnsBroadcast()
{
  if(serviceAdvertisement !== null)
  try
  {
    //trying to stop mdns adveritisement
    serviceAdvertisement.stop();
  }
  catch(err){console.log('unable to stop mdns adveritisement');}
  var txt_record = {
    name: config.data.name?config.data.name:"",
    version: productVersion
  };
  
  serviceAdvertisement = mdns.createAdvertisement(mdns.tcp('xdk-app-daemon'), basePort, {txtRecord: txt_record});
  serviceAdvertisement.start();
  console.log('MDNS Broadcast Sent:'+basePort);
}

/**
 * This function handles service broadcasting via MDNS.
 */
function handleConfig(ws, mode, data) {
  if(mode === 'set')
  {
    for(var i in data)
    {
      config.data[i] = data[i];
    }
    console.log(config.data);
    config.save();
    //mdnsBroadcast();
    process.exit();
  }
  else if(mode === 'time' && data.newTime !== undefined)
  {
    var tmpDate = parseInt(data.newTime);
    if(!isNaN(tmpDate))
    {
      var sys = require('sys');
      var exec = require('child_process').exec;
      exec("date +%s -s @"+tmpDate);
      setTimeout(function(){sendToConsole(ws,'\nNew System Time: '+Date()+'\n');},3000);
    }
  }
}

/**
 * This function handles downloading of the binary stream and untaring it.
 * If the 'clean' command is sent, we call npm rebuild on the modoules
 */
function downloadProject(ws, message,clean) {
  var fileName = "bundle.tar";
  if (currentFile_) {
    fileName = currentFile_.name;
  }
  var pathToZipFile = pathToTmp_ + "/" + fileName;
  var data = message;
  console.log("receviing file data");
  //Clear project
  var ignore=clean?'':'node_modules';
  
  fs.writeFile(pathToZipFile, data, function(error) {
    if (error) {
      sendWSData(ws,JSON.stringify({'message': 'error', 'data': 'Unable to download project'}));
      currentFile_ = null;
    } else {
      
      //Clear out the app path slot and then unzip it
      daemonUtils.clearFolder(pathToProject_,false,ignore);
      daemonUtils.unzip(pathToZipFile,pathToProject_)
      .then(function(){
        if(clean){
          return handleCommand(ws,'clean');
        }
        else {
          var colors = require('colors/safe');
          sendWSData(ws,JSON.stringify({'message': colors.yellow.bold('[ Upload Complete ]'), 'data': pathToProject_ }));
          currentFile_ = null;
        }
      }).
      fail(function(res){
        sendError(ws,'Error extracting update - '+res);
      });      
    }
  });
}

// this function handles updating the daemon itself  Please see daemonUpdater.js
function updateDaemon(ws,message) {
  update = new daemonUpdater();
  update.installUpdate(message);
  update.on('console',function(data){sendToConsole(ws, data.toString());});
  update.on('close',function(data){sendToConsole(ws, data.toString());});
  update.on('error',function(data){sendError(ws,data.toString());});
}

// return the status of the current running app.
// State is mostly set/managed in appWrapper.js
function returnStatus(ws,message){
  var status= {
    appPath:'',
    isRunning:false,
    isDebugging:false,
    version:productVersion,
    time:new Date().getTime()
  };
  if(currentlyRunningApp!==null)
  {
    status.appPath=currentlyRunningApp.applicationState.appPath;
    status.isRunning=currentlyRunningApp.applicationState.isRunning;
    status.isDebugging=currentlyRunningApp.applicationState.isDebugging;
  }
  sendWSData(ws,JSON.stringify({'channel':'status','message': status}));
}


//Global object to keep track of the currenly running app
var currentlyRunningApp = null;

function runAtStartup()
{
  currentlyRunningApp = new appWrapper(pathToProject_);
  currentlyRunningApp.on('close',function(data){currentlyRunningApp = null;});
  currentlyRunningApp.on('error',function(data){});
  currentlyRunningApp.start({silent:true});
}


function forceStopAllProcesses()
{
  var listOfProcesses = appWrapper().getStartedProcesses();
  for(var i in listOfProcesses) {
    var pid = listOfProcesses[i];
    try {
        process.kill(pid,0);
        try{
          process.kill(pid,'SIGKILL');
          delete listOfProcesses[i]; //assume kill went ok delete from process list
        }
        catch(err2){}
      }
      catch(er4) {
        delete listOfProcesses[i]; //caught process.kill(pid,0); = process does not exist
      }
  }

  for(var j = 0; j<listOfProcesses.length; j++) {
    if(listOfProcesses[j] === undefined) {
      listOfProcesses.splice(j,1);
    }
  }
  listOfProcesses = listOfProcesses.filter(function(n){ return n !== undefined });
}

function stopGracefully() {
    if(currentlyRunningApp !== null) {      
      currentlyRunningApp.stop();
    }
    forceStopAllProcesses();
}

// Broker to handle the command send from the Intel XDK and dispatch it.
function handleCommand(ws, message)
{
  var myNewApp;
  sendToConsole(ws, '\nIntel XDK - Message Received: '+message+'\n');
  if(message === 'run'){
    stopGracefully();
    currentlyRunningApp = new appWrapper(pathToProject_);
    currentlyRunningApp.on('console',function(data){sendToConsole(ws, data.toString());});
    currentlyRunningApp.on('close',function(data){returnStatus(ws);currentlyRunningApp = null;});
    currentlyRunningApp.on('error',function(data){sendError(ws,data.toString());});
    currentlyRunningApp.start();
    returnStatus(ws);
 }
 else if(message === 'stop'){    
    stopGracefully();
    returnStatus(ws);
  }
  else if(message === 'install'){
    currentlyRunningApp = new appWrapper(pathToProject_);
    currentlyRunningApp.on('console',function(data){sendToConsole(ws, data.toString());});    
    currentlyRunningApp.on('error',function(res){
      sendToConsole(ws,res.toString());
    });
    currentlyRunningApp.install();
  }
  else if(message === 'clean') {
    currentlyRunningApp = new appWrapper(pathToProject_);
    currentlyRunningApp.on('console',function(data){sendToConsole(ws, data.toString());});    
    currentlyRunningApp.on('error',function(res){
      sendToConsole(ws,res.toString());
    });
    currentlyRunningApp.clean();
  }
  else if(message === 'debug'){
    stopGracefully();
    currentlyRunningApp = new appWrapper(pathToProject_);
    currentlyRunningApp.debug();
    returnStatus(ws);
    currentlyRunningApp.on('console',function(data){sendData(ws,data.toString());});
    currentlyRunningApp.on('close',function(data){returnStatus(ws);currentlyRunningApp = null;});
    currentlyRunningApp.on('error',function(data){sendError(ws,data.toString());});
    currentlyRunningApp.on('connected',function(data){sendCommand(ws,'debug',data);});
  }
  else if(message === 'list'){
    //Not Implemented Yet
  }
  else if(message === 'shutdown'){
    //Not Implemented Yet
  }
}


/**
 * communication functions back to the Intel XDK via websockets
 */

//Check the websocket is actually open and can send data
function validWebSocket(ws){  
  return (ws&&ws.readyState===WEBSOCKETOPEN);
}

 //Send the actual WebSocket data
function sendWSData(ws,data){
  if(!validWebSocket(ws)) return;
  ws.send(data);
}

//Helper to send an error command
function sendError(ws,message){  
  sendWSData(ws,JSON.stringify({'channel':'error','message': message}));
}

//Helper to send a command back to the Intel XDK
function sendCommand(ws,channel,message){
  if(!validWebSocket(ws)) return;
  sendWSData(ws,JSON.stringify({'channel':channel,'message': message})); 
}

//Send data to the console in the Intel XDK
function sendData(ws,data)
{
  sendToConsole(ws, data);
}

function sendToConsole(ws, msg) {
  sendWSData(ws,JSON.stringify({channel: "console", message: msg}));
  
}


//Startup the daemon
//-------------------------------------------------------------
var crashLogMsg=null;
if(fs.existsSync(crashLog_))
  crashLogMsg=fs.readFileSync(crashLog_).toString();
writeCrashLog('');


initWebSocketServer();
//-------------------------------------------------------------

function writeCrashLog(msg){
  fs.writeFile(crashLog_, msg, function(err) {
    if(err) {
        console.log(err);
    } 
  }); 
}

/**
 * Exit handlers for app.
 */
function onExit(){
  if(currentlyRunningApp!==null)
  {
    console.log('killing child processes');
    currentlyRunningApp.stop();
  }
  process.exit();
}

function onException(ex){
  console.log('uncaughtException occured: '+ex.stack.toString());
  sendToConsole(globalWs_,'uncaughtException occured: '+ex.stack.toString());
  writeCrashLog(ex.stack.toString());
  
  return false;
}

process.on('exit',onExit);
//catches ctrl+c event
process.on('SIGINT', onExit);
//catches uncaught exceptions
process.on('uncaughtException',onException);
