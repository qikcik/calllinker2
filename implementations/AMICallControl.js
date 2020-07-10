const AmiClient = require('asterisk-ami-client');
const Events = require('events');
const Logger = require('../utlis/Logger.js');
const Validate = require('../utlis/ValidatePhoneNumber.js');

var log = new Logger.ILog("callControl");

module.exports = class AMICallControl {
    constructor( login, password, host, port ) {

        // paramters check
        if(!login) throw new Error();
        if(!password) throw new Error();
        if(!host) throw new Error();
        if(!port) throw new Error();

        // declare handler
        this.handler = new Events.EventEmitter();

        // setup and log error and succes
        this.bridges = {};

        this._client = new AmiClient();
        this._client.connect(login, password, {host: host, port: port})
        .then(amiConnection => {
            
            this._client
                .on('connect', () => log.success('initialize','connect'))
                .on('disconnect', () => log.error('initialize','disconnect'))
                .on('reconnection', () => log.success('initialize','reconnect'))
                .on('internalError', error => log.error('AMIinternalError',error))
                .on('event', event => this._reciveEvent(event))

                log.success('initialize','success');
        })
        .catch(error => log.critical('initialize',error));
    }

    resentForExtension(extension)
    {
        let bridge = Object.values(this.bridges).filter( (bridge) => {
            return bridge.filter( n => n == Validate(extension)) != undefined;
        })[0];

        if(bridge)
        {
        console.log(bridge);
        this.handler.emit('inCall',bridge[1],bridge[0]);
        log.info('isInCall',`pair ${bridge[1]} and ${bridge[0]}`);
        }
    }

    _reciveEvent(AMIevent) {
        this._trackBridges(AMIevent);
        this._trackConnections(AMIevent);
    }

    _trackBridges(AMIevent) {
        try {
            if(AMIevent.Event == "BridgeCreate")
            {
                if(!this.bridges[AMIevent.BridgeUniqueid]) 
                {
                    this.bridges[AMIevent.BridgeUniqueid] = new Array();
                    log.debug('BridgeCreate',AMIevent); 
                    return;
                }     
                log.warning('_trackBridges',AMIevent);
            }
            else if(AMIevent.Event == "BridgeDestroy")
            {
                if(this.bridges[AMIevent.BridgeUniqueid]) 
                {
                    delete this.bridges[AMIevent.BridgeUniqueid];
                    log.debug('BridgeDestroy',AMIevent);
                    return;
                }
                log.warning('_trackBridges',AMIevent);
            }
        }
        catch (err) {
            log.error('_trackBridges',err);
        }
    }

    _trackConnections(AMIevent) {
        try {
            if(AMIevent.Event == "BridgeEnter")
            {
                log.debug('BridgeEnter',AMIevent);
                // check does bridge still exsist
                let actualBridge = this.bridges[AMIevent.BridgeUniqueid];
                let exstension = Validate(AMIevent.CallerIDNum);
                if(actualBridge)
                {
                    // check if extension isn't in bridge
                    if(! actualBridge.includes(exstension) )
                    {
                        // extension add to bridge
                        actualBridge.push(exstension);

                        if(actualBridge.length == 2)
                        {
                            this.handler.emit('inCall',actualBridge[1],actualBridge[0]);
                            log.info('connection',`pair ${actualBridge[1]} and ${actualBridge[0]}`);
                            return;
                        }
                        log.debug('_reciveEvent',`first in bridge ${exstension}`);
                    }
                    return;
                }
                log.warning('_trackConnections',AMIevent);
            }

            else if(AMIevent.Event == "BridgeLeave")
            {
                log.debug('BridgeLeave',AMIevent);
                // check do bridge still exsist
                let actualBridge = this.bridges[AMIevent.BridgeUniqueid];
                let exstension = Validate(AMIevent.CallerIDNum);
                if(actualBridge)
                {
                    // check if extension is in bridge
                    if( actualBridge.includes(exstension) )
                    {
                        this.handler.emit('hangup',exstension);
                        actualBridge.filter(v => v != exstension);
                        log.info('connection',`hangup ${exstension} `);
                    }
                    return;
                }
                log.warning('_trackConnections',AMIevent);
            }
        }
        catch (err) {
            log.error('_trackConnections',err);
        }
    }
}