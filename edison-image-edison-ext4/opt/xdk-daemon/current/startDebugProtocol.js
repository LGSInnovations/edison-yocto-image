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

//make AppWrapper an EventEmitter;
sys.inherits(startDebugProtocol, events.EventEmitter);


var inspector;

function startDebugProtocol(v8DebugPort,webSocketPort) {
  if(false === (this instanceof startDebugProtocol)) {
    return new startDebugProtocol(v8DebugPort,webSocketPort);
  }

  var fork = require('child_process').fork;
  var inspectorArgs = ['--debug-port='+v8DebugPort,'--web-port='+webSocketPort];
  var _self=this;
  var env = process.env;//fowarding process.env is esential for make, etc ot work
  var forkOptions = { env: env, silent: true };
  this.stop=function() {
    if(inspector && inspector.kill)
    {
      inspector.kill();//'SIGKILL'
    }
  };


  this.start=function(){
    var self=this;
    inspector = fork(
      require.resolve('./node-inspector-server/bin/inspector'),
      inspectorArgs,
      forkOptions
    );

    inspector.on('message', handleInspectorMessage);
    inspector.on('error',function(res){
      _self.emit('error',res);
      console.log('debug inspector error '+res);
    });
    inspector.on('exit',function(res){
      _self.emit('exit',res);
      console.log('debug inspector exit'+res);
    });

    inspector.on('close',function(res){
      _self.emit('close',res);
      console.log('debug inspector close'+res);
    });

    inspector.stdout.on('data',function(data){
      if(data.toString().indexOf("Node Inspector")!==-1)
        _self.emit('connected','started');
    });
    function handleInspectorMessage(msg) {
      switch(msg.event) {
        case 'SERVER.LISTENING':
          console.log('Visit %s to start debugging.', msg.address.url);
          break;
        case 'SERVER.ERROR':
          console.log('Cannot start remote debugging protocol server: %s.', msg.error.code);
          //Kill the process _
          self.emit('error','Restarting debugging protocol server');
          killProc();
          setTimeout(function(){
            self.start();
          },500);          
          break;
      }
    }
  };

  function killProc(){
    var sys = require('sys')
    var exec = require('child_process').exec;
    function outLog(error, stdout, stderr) { sys.puts(stdout) }
    exec("kill $(ps | grep [n]ode-inspector-server | awk '{print $1}')",outLog);
  }
  events.EventEmitter.call(this);
}

module.exports = startDebugProtocol;