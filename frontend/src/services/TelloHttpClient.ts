import axios, {AxiosInstance} from "axios";
import Logger from "@/services/Logger.ts";

const logger = new Logger('TelloHttpClient');

export interface DroneState {
    pitch: number;
    roll: number;
    yaw: number;
    speedX: number;
    speedY: number;
    speedZ: number;
    totalSpeed: number;
    tempLow: number;
    tempHigh: number;
    averageTemperature: number;
    timeOfFlight: number;
    height: number;
    batteryPercentage: number;
    barometerMeasurement: number;
    time: number;
    accelerationX: number;
    accelerationY: number;
    accelerationZ: number;
    totalAcceleration: number;
}

interface TelloResponse {
    message: string
}

class TelloHttpClient {
    private axiostInstance: AxiosInstance;

    constructor(url: string) {
        this.axiostInstance = axios.create({
            baseURL: url,
            headers: {'Content-Type': 'application/json'}
        });
    }

    async connect() {

        try {
            const response = await this.axiostInstance
                .post<TelloResponse>("/connect");
            logger.info(response)
            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            logger.info(response.data.message);
            return response.data.message;
        } catch (error: Error) {
            logger.error(error.message);

            throw error;
        }
    }

    async disconnect() {
        try {
            const response = await this.axiostInstance
                .post<TelloResponse>("/disconnect");

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            logger.info(response.data.message);
            return response.data.message;
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    async takeoff() {
        try {
            const response = await this.axiostInstance
                .post<TelloResponse>("/takeoff");

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }
            logger.info(response.data.message);
            return response.data.message;

        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    async move(direction: string) {
        try {
            const response = await this.axiostInstance
                .post<TelloResponse>("/move",
                    {
                        data: {"direction": direction}
                    });

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }
            logger.info(response.data.message);
            return response.data.message;

        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    async rotate(direction: string) {
        try {
            const response = await this.axiostInstance
                .post<TelloResponse>("/rotate",
                    {
                        data: {"direction": direction}
                    });

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }
            return response.data.message;
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    async flip(direction: string) {
        try {
            const response = await this.axiostInstance
                .post<TelloResponse>("/flip",
                    {
                        data: {"direction": direction}
                    });
            if (response.status !== 200) {
                throw new Error(response.data.message);
            }
            return response.data.message;

        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    async getState() {
        try {
            const response = await this.axiostInstance
                .get<TelloResponse>("/state");

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            const currentState = this.parseStateData(response.data.message);

            return currentState;

        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    private parseStateData(input: string): DroneState | null {
        const regex = /pitch:(-?\d+);roll:(-?\d+);yaw:(-?\d+);vgx:(-?\d+);vgy(\d+);vgz:(-?\d+);templ:(-?\d+);temph:(-?\d+);tof:(\d+);h:(\d+);bat:(\d+);baro: ([\d\.]+); time:(\d+);agx:([\d\.]+);agy:([\d\.]+);agz:([\d\.]+);/;

        const match = input.match(regex);

        if (match) {
            return {
                pitch: parseInt(match[1], 10),
                roll: parseInt(match[2], 10),
                yaw: parseInt(match[3], 10),
                speedX: parseInt(match[4], 10),
                speedY: parseInt(match[5], 10),
                speedZ: parseInt(match[6], 10),
                totalSpeed: this.calculateSpeed(parseInt(match[4], 10), parseInt(match[5], 10), parseInt(match[6], 10)),
                tempLow: parseInt(match[7], 10),
                tempHigh: parseInt(match[8], 10),
                averageTemperature: this.calculateAverageTemperature(parseInt(match[7], 10), parseInt(match[8], 10)),
                timeOfFlight: parseInt(match[9], 10),
                height: parseInt(match[10], 10),
                batteryPercentage: parseInt(match[11], 10),
                barometerMeasurement: parseFloat(match[12]),
                time: parseInt(match[13], 10),
                accelerationX: parseFloat(match[14]),
                accelerationY: parseFloat(match[15]),
                accelerationZ: parseFloat(match[16]),
                totalAcceleration: this.calculateTotalAcceleration(parseFloat(match[14]), parseFloat(match[15]), parseFloat(match[16]))
            };
        }

        // Return null if the input doesn't match the expected pattern
        return null;
    }

    private calculateSpeed(speedX: number, speedY: number, speedZ: number): number {
        return Math.sqrt(speedX ** 2 + speedY ** 2 + speedZ ** 2);
    }

    private calculateAverageTemperature(tempLow: number, tempHigh: number): number {
        return (tempLow + tempHigh) / 2;
    }

    private calculateTotalAcceleration(accelerationX: number, accelerationY: number, accelerationZ: number): number {
        return Math.sqrt(accelerationX ** 2 + accelerationY ** 2 + accelerationZ ** 2);
    }
}


export default TelloHttpClient;