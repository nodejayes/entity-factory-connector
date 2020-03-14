require('ts-tooling/src/types/array');
const WebSocket = require('isomorphic-ws');

function _unpack(data) {
    return JSON.parse(data);
}

function _pack(action) {
    return JSON.stringify(action);
}

function _sendCache() {
    if (this._isOpen !== true) {
        setTimeout(() => _sendCache.bind(this)(), 20);
        return;
    }
    for (let i = 0; i < this._cache.length; i++) {
        this._connection.send(this._cache.Pull(i));
    }
}

/**
 * create a Endpoint for the EntityFactory Backend
 */
class EntityFactoryEndpoint {
    /**
     * create a Endpoint for the EntityFactory Backend
     *
     * @constructor
     * @return {EntityFactoryEndpoint}
     */
    constructor() {
        this._connection = null;
        this._isOpen = false;
        this._cache = [];
        this._actions = {};
    }

    /**
     * register the Entity Factory Action Handlers
     *
     * @param actions {object} a HashMap containing the Actions String as key and the Action Handler as Function
     * @return {void}
     */
    register(actions) {
        this._actions = actions;
    }

    /**
     * connect to the Entity Factory Backend
     * when the Connection is lost the Connector try to reconnect
     *
     * @param url {string?} the URL to the Entity Factory Backend
     * @return {void}
     */
    connect(url) {
        url = url || location.href.replace('http', 'ws');
        this._connection = new WebSocket(url);
        this._connection.onopen = () => {
            this._isOpen = true;
        };
        this._connection.onclose = () => {
            this._isOpen = false;
            setTimeout(() => this.connect(url), 2000);
        };
        this._connection.onmessage = (msg) => {
            const action = _unpack(msg.data);
            const targetAction = this._actions[action.type];
            if (!targetAction || typeof targetAction !== typeof function () {}) {
                console.info('no valid Action found for ' + targetAction.type);
                return;
            }
            targetAction(action.payload);
        };
        this._connection.onerror = function (err) {
            console.error(err);
        };
    }

    /**
     * start to send a Action to the Entity Factory Backend
     * the message was set into the internal cache and try to send when the connection is available
     *
     * @param type {string} the action identifier
     * @param payload {object?} the action Payload
     */
    send(type, payload) {
        this._cache.push(_pack({type: type, payload: payload}));
        _sendCache.bind(this)();
    }
}

module.exports = {EntityFactoryEndpoint};
