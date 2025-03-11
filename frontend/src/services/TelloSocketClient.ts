import {io, Socket} from "socket.io-client";
import Logger from "@/services/Logger.ts";

const logger = new Logger('TelloSocketClient');

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    connection_status: (payload: string) => void;
    move_status: (payload: string) => void;
    rotate_status: (payload: string) => void;
    flip_status: (payload: string) => void;
    state_update: (payload: string) => void;
}

interface ClientToServerEvents {
    hello: () => void;
}

interface ServerMessage {
    status: string;
    message: string;
}

type Transport = "polling" | "websocket" | "webtransport";
type ValidMoves = "up" | "down" | "left" | "right" | "forward" | "back";
type ValidRotations = "cw" | "ccw";
type ValidFlips = "left" | "right" | "forward" | "backward";

class TelloSocketClient {
    readonly socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    constructor(domain: string, transport?: Transport[]) {
        this.socket = io(domain, {
            autoConnect: false,
            reconnection: true,
            withCredentials: true,
            extraHeaders: {
                'Access-Control-Allow-Origin': '*'
            },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
    }

    //@logMethodOperations
    public connect() {
        this.socket.connect();
    }

    //@logMethodOperations
    public disconnect() {
        this.socket.disconnect();
    }

    //@logMethodOperations
    public move(direction: ValidMoves) {
        this.socket.send("move", direction);
    }

    //@logMethodOperations
    public rotate(direction: ValidRotations) {
        this.socket.send("rotate", direction);
    }

    //@logMethodOperations
    public flip(direction: ValidFlips) {
        this.socket.send("flip", direction);
    }

    //@logMethodOperations
    public getState() {
        this.socket.send("state");
    }

    //@logMethodOperations
    public onConnectionStatus(callback?: (message: ServerMessage) => void) {
        this.registerEventHandler("connection_status", callback);
    }

    //@logMethodOperations
    public onMoveStatus(callback?: (message: ServerMessage) => void) {
        this.registerEventHandler("move_status", callback);
    }

    //@logMethodOperations
    public onRotateStatus(callback?: (message: ServerMessage) => void) {
        this.registerEventHandler("rotate_status", callback);
    }

    //@logMethodOperations
    public onFlipStatus(callback?: (message: ServerMessage) => void) {
        this.registerEventHandler("flip_status", callback);
    }

    //@logMethodOperations
    public onStateUpdate(callback?: (message: ServerMessage) => void) {
        this.registerEventHandler("state_update", callback);
    }

    private registerEventHandler(event: keyof ServerToClientEvents, callback?: (message: ServerMessage) => void) {
        this.socket.on(event, (payload: string) => {
            const message = this.parseMessageFromServer(payload);
            logger.info(`Received message from ${event}: ${JSON.stringify(message)}`);

            if (message.status === "error") {
                logger.error(`Error: ${message.message}`);
            } else {
                logger.info(`Success: ${message.message}`);
            }

            if (callback) {
                callback(message);
            }
        });
    }

    private parseMessageFromServer(message: string): ServerMessage {
        return JSON.parse(message);
    }
}

/*function logMethodOperations(originalMethod: any, context: ClassMethodDecoratorContext) {
    const methodName = String(context.name);

    function wrapper(this: any, ...args: any[]) {
        logger.info(`Entering method '${methodName}'.`);
        const result = originalMethod.call(this, ...args);
        logger.info(`Exiting method '${methodName}'.`);
        return result;
    }

    return wrapper;
}*/

export default TelloSocketClient;