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
     * @param tokenName {string} the name of the token stored in local storage
     * @return {EntityFactoryEndpoint}
     */
    constructor(tokenName) {
        this._connection = null;
        this._isOpen = false;
        this._cache = [];
        this._actions = {};
        this._rights = {};
        if (!tokenName) {
            throw new Error('please specify a unique tokenName in constructor of EntityFactoryEndpoint');
        }
        this._tokenName = tokenName;
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
     * if the current endpoint authenticated again a entity-factory-gateway
     * @readonly
     * @return {boolean}
     */
    get isAuthenticated() {
        return !!localStorage.getItem(this._tokenName);
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
        const token = localStorage.getItem(this._tokenName);
        if (token) {
            url += '?token=' + encodeURI(token);
        }
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
            if (action.type === 'receiveToken') {
                localStorage.setItem(this._tokenName, action.payload);
                this._connection.close();
                return;
            }
            if (action.type === 'invalidToken') {
                console.warn('invalid token the old token was removed from local store');
                this.logout();
                return;
            }
            if (action.type === 'myRights') {
                this._rights = action.payload;
                return;
            }
            const targetAction = this._actions[action.type];
            if (!targetAction || typeof targetAction !== typeof function () {}) {
                console.info('no valid Action found for ' + targetAction.type);
                return;
            }
            targetAction(action.payload);
        };
        this._connection.onerror = function (err) {
            // console.error(err);
        };
    }

    /**
     * authenticate the connector on a entity-factory-gateway
     *
     * @param user {string} the username
     * @param password {string} the password
     * @return {void}
     */
    authenticate(user, password) {
        this.send('requestToken', {user: user, password: password});
    }

    /**
     * remove the authentication token
     */
    logout() {
        localStorage.removeItem(this._tokenName);
        this._connection.close();
    }

    /**
     * check if some rights are in the authentication context
     * can connected with "and" or "or"
     *
     * @param mode {string} the type of connect names together (and or or)
     * @param names {string[]} the list of rights
     * @return {boolean} are the rights condition true
     */
    hasRights(mode, names) {
        const groups = Object.keys(this._rights);
        if (groups.length < 1) {
            return false;
        }
        if (mode === 'and') {
            for (let i = 0; i < groups.length; i++) {
                for (let j = 0; j < names.length; j++) {
                    const groupRights = this._rights[groups[i]];
                    if (!groupRights || !groupRights.rights) {
                        continue;
                    }
                    if (!groupRights.rights.Contains(names[j])) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            for (let i = 0; i < groups.length; i++) {
                for (let j = 0; j < names.length; j++) {
                    const groupRights = this._rights[groups[i]];
                    if (!groupRights || !groupRights.rights) {
                        continue;
                    }
                    if (groupRights.rights.Contains(names[j])) {
                        return true;
                    }
                }
            }
            return false;
        }
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
