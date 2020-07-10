/*

Npm Require: request-promise, request

*/

const RP = require('request-promise');
const Logger = require('../utlis/Logger.js');
const ValidatePhoneNumber = require('../utlis/ValidatePhoneNumber.js');
const events = require('events');

var log = new Logger.ILog("baselinker");

module.exports = class BaseLinker {


    /////////////////// PUBLIC ////////////////////////////

    constructor(apiToken) {

        this._apiToken = apiToken;

    }

    async getOrdersByExtension(extension)
    {
        return this._request("getOrdersByPhone",{phone: ValidatePhoneNumber(extension)});
    }


    ///////////////////////// UTILS //////////////////////////

    async _request(method, parameters) {
        return RP({
            method: 'POST',
            url: 'https://api.baselinker.com/connector.php',
            form: {
                token: this._apiToken,
                method: method,
                parameters: JSON.stringify(parameters)
            }
        });
    }
};