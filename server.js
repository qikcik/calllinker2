const Config = require('./configDocker.js');
const Logger = require('./utlis/Logger.js');

// ignore uncaughtException
//process.on('uncaughtException', function(exception) {
//    let logger = new Logger.ILog('uncaught');
//    logger.critical(exception);
//});

// show logger
require('./implementations/TerminalLogger.js')();

// dependency
const AMIActiveConnections = require('./implementations/AMICallControl.js');
const WebServer = require('./www/webServer.js');

let callControl = new AMIActiveConnections(Config.AmiLogin,Config.AmiPassword,Config.AmiAdress,Config.AmiPort);

let webServer = new WebServer(Config.webPort);

const BaseLinker = require('./implementations/BaseLinker.js');
let baseLinker = new BaseLinker(Config.baselinkerApi);

callControl.handler.on("inCall", (first,second)=>{
    webServer.sendThatInCall(first,second);
    webServer.sendThatInCall(second,first);

    baseLinker.getOrdersByExtension(first).then ( res => { webServer.sendOrders(second,first,res) } );
    baseLinker.getOrdersByExtension(second).then ( res => { webServer.sendOrders(first,second,res) } );
} );
callControl.handler.on("hangup", (first)=>{ 
    webServer.sendThatHangup(first);
} );

webServer.handler.on("logged",extension=>{
    callControl.resentForExtension(extension);
})

///setInterval(()=> console.log(callControl._bridges),1000);
