export type EntityFactoryActionHandler = {[key: string]: <T>(payload: T) => void}

/**
 * create a Endpoint for the EntityFactory Backend
 *
 * @constructor
 * @return {EntityFactoryEndpoint}
 */
export class EntityFactoryEndpoint {
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
    authenticate(user: string, password: string): void;
    /**
     * start to send a Action to the Entity Factory Backend
     * the message was set into the internal cache and try to send when the connection is available
     *
     * @param type {string} the action identifier
     * @param payload {object?} the action Payload
     */
    send<T>(type: string, payload?: T): void;
}

