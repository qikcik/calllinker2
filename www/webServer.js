//SOCKET.IO

const Express = require('express')
const Path = require('path');
const Events = require('events');
const Logger = require('../utlis/Logger.js');

const ValidatePhoneNumber = require('../utlis/ValidatePhoneNumber.js');

var log = new Logger.ILog("webserver");

module.exports = class WebServer {
    constructor(port) {

        //setup
        this.handler = new Events.EventEmitter();

        this._connectedClient = {};

        this._port = port;
        this._app = Express();
        this._server = require('http').createServer(this._app);
        this._io = require('socket.io')(this._server);
        this._app.use(Express.static(Path.join(__dirname, 'public')));

        this._server.listen(this._port, () => {log.success('initialize',`listen on port ${this._port}`)});
        this._setupSockets();
    }


    sendThatInCall(who,withWho) {
        for (let i in this._connectedClient)
            if(this._connectedClient[i].extension == who)
                this._connectedClient[i].client.emit(`inCall`, withWho);
    }

    sendOrders(who,withWho,orders) {
        for (let i in this._connectedClient)
            if(this._connectedClient[i].extension == who)
                this._connectedClient[i].client.emit(`orders`, {extension: withWho, orders: orders});
    }

    sendThatHangup(who) {
        for (let i in this._connectedClient)
            if(this._connectedClient[i].extension == who)
                this._connectedClient[i].client.emit(`hangup`,{});
    }

    //////////// PRIVATE

    _setupSockets()
    {
        this._io.on('connection', (client) => {
            // register
            client.on('login', (extension) => {
                try {
                    extension = ValidatePhoneNumber(extension);

                    this._connectedClient[client.id] = {
                        client: client,
                        extension:  extension,
                    }
                    client.emit('logged', extension);
                    this.handler.emit('logged', extension);
                    log.info(`io on logged`,`${client.id} connected to ${extension}`);

                    this.handler.emit('logged',extension);
                }
                catch(err) {
                    //client.emit('error', JSON.stringify({desc: 'on login', error: err}) );
                    log.critical(`io on logged`,err);
                }
                
            });
        
            // unregister
            client.on('disconnect', () => {
                try {
                    let extension = this._connectedClient[client.id].extension;

                    delete this._connectedClient[client.id];
                    log.info(`io on disconnect`,`${client.id} disconnect from ${extension}`);
                }
                catch(err) {
                    log.critical(`io on disconnect`,err);
                }
            })
        
        })

    }
}