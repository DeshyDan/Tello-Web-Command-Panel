import {useState} from 'react';
import ControlPanel from "@/pages/ControlPanel.tsx";
import Connect from "@/pages/Connect.tsx";
import Logger from "@/services/Logger.ts";
import TelloHttpClient from "@/services/TelloHttpClient.ts";

const BACKEND_HOST_URL = "http://localhost:5001/tello";
const logger = new Logger('App');

function getTelloClient() {
    logger.info("Creating Tello Client");
    return new TelloHttpClient(BACKEND_HOST_URL);
}

function App() {
    const [telloClient] = useState(getTelloClient);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);


    return (
        <>
            {isConnected ? (
                <ControlPanel tello={telloClient}/>
            ) : (
                <Connect
                    isConnecting={isConnecting}
                    onConnect={async () => {
                        setIsConnecting(true);
                        try {
                            await telloClient.connect();
                            setIsConnected(true);
                        } catch (e: Error) {
                            setIsConnected(false);
                            logger.error(e.message);
                        } finally {
                            setIsConnecting(false);
                        }
                    }}
                />

            )}
        </>

    );
}

export default App;