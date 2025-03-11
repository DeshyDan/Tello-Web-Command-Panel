// TODO: Add functionality to log to a file

class Logger {
    private readonly origin: string;

    constructor(origin: string) {
        this.origin = origin;
    }

    public debug(message: any) {
        console.debug(`${this.getTimeStamp()} [DEBUG] ${this.origin} ${message}`);
    }

    public info(message: any) {
        console.info(`${this.getTimeStamp()} [INFO] ${this.origin} ${message}`);
    }

    public warn(message: any) {
        console.warn(`${this.getTimeStamp()} [WARN] ${this.origin} ${message}`);
    }

    public error(message: any) {
        console.error(`${this.getTimeStamp()} [ERROR] ${this.origin} ${message}`);
    }

    private getTimeStamp() {
        return new Date().toISOString();
    }
}

export default Logger;