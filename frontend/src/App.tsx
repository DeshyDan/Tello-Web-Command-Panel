import {useEffect, useState} from 'react';
import ControlPanel from "@/pages/ControlPanel.tsx";
import Connect from "@/pages/Connect.tsx";
import TelloSocketClient from './services/TelloSocketClient';


function App() {
    const [isConnected, setIsConnected] = useState(false);
    const [telloClient, setTelloClient] = useState<TelloSocketClient | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const handleConnect = () => {
        try {
            const tello = new TelloSocketClient("http://localhost:5001", ["websocket"]);
            tello.connect();
            setTelloClient(tello);
            setIsConnected(true);
        } catch (error) {
            setConnectionError("Failed to initialize drone connection");
            console.error("Connection Error:", error);
        }
    };

    useEffect(() => {
        return () => {
            if (telloClient) {
                telloClient.disconnect();
            }
        };
    }, [telloClient]);

    return (
        <>
            {connectionError && (
                <div className="error-banner">
                    {connectionError}
                </div>
            )}

            {isConnected && telloClient ? (
                <ControlPanel tello={telloClient}/>
            ) : (
                <Connect onConnect={handleConnect}/>
            )}
        </>
    );
}

export default App;