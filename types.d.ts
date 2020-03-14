export type EntityFactoryActionHandler = {[key: string]: <T>(payload: T) => void}

/**
 * create a Endpoint for the EntityFactory Backend
 *
 * @constructor
 * @return {EntityFactoryEndpoint}
 */
export class EntityFactoryEndpoint {
    /**
     *
     * @param tokenName the name where the authentication token is stored in the local storage
     */
    constructor(tokenName: string);
    /**
     * register the Entity Factory Action Handlers
     *
     * @param actions a HashMap containing the Actions String as key and the Action Handler as Function
     * @return {void}
     */
    register(actions: EntityFactoryActionHandler): void;
    /**
     * connect to the Entity Factory Backend
     * when the Connection is lost the Connector try to reconnect
     *
     * @param url {string?} the URL to the Entity Factory Backend
     * @return {void}
     */
    connect(url?: string): void;
    /**
     * authenticate the connector on a entity-factory-gateway
     *
     * @param user the username
     * @param password the password
     */
    authenticate(user: string, password: string): void;
    /**
     * check if some rights are in the authentication context
     * can connected with "and" or "or"
     *
     * @param mode the type of connect names together (and or or)
     * @param names the list of rights
     * @return are the rights condition true
     */
    hasRights(mode: 'and' | 'or', names: string[]): boolean;
    /**
     * start to send a Action to the Entity Factory Backend
     * the message was set into the internal cache and try to send when the connection is available
     *
     * @param type {string} the action identifier
     * @param payload {object?} the action Payload
     */
    send<T>(type: string, payload?: T): void;
}

