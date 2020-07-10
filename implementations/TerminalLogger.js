module.exports = function() {
    const Logger = require('../utlis/Logger.js');
    const colors = require('colors');
    
    Logger.handler.on('log', (scope, type, tittle, value) => {
        //if( scope != 'debug')
        //{
            console.log(`[${scope}:${type}]`.green,` ${tittle}: `, value);
        //}
    });
}
