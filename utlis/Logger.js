var events = require('events'); 
var eventEmitter = new events.EventEmitter();

class ILog {
    constructor(inScope) {
        this._inScope = inScope;
    }
    debug(tittle, error) {
        eventEmitter.emit('log', 'debug', this._inScope, tittle, error);
    }
    info(tittle, error) {
        eventEmitter.emit('log', 'info', this._inScope, tittle, error);
    }
    warning(tittle, error) {
        eventEmitter.emit('log', 'warning', this._inScope, tittle, error);
    }
    error(tittle, error) {
        eventEmitter.emit('log', 'error', this._inScope, tittle, error);
    }
    critical(tittle, error) {
        eventEmitter.emit('log', 'critical', this._inScope, tittle, error);
    }
    success(tittle, error) {
        eventEmitter.emit('log', 'success', this._inScope, tittle, error);
    }
}


module.exports = {
    ILog: ILog,
    handler: eventEmitter
}