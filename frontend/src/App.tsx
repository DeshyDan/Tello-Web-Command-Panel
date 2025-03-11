// App.tsx
import {useState} from 'react';
import ControlPanel from "@/pages/ControlPanel.tsx";
import Connect from "@/pages/Connect.tsx";
import TelloSocketClient from "@/services/TelloSocketClient.ts";

function getTelloClient() {
    console.log("Creating Tello Client");
    return new TelloSocketClient("http://localhost:5001/tello", ["websocket"]);
}

function App() {
    const [telloClient] = useState(getTelloClient);

    const [isConnected, setIsConnected] = useState(false);

    return (
        <>
            {isConnected ? (
                <ControlPanel tello={telloClient}/>
            ) : (
                <Connect onConnect={() => {
                    telloClient.connect()
                    setIsConnected(() => (telloClient.socket.connected))

                }}/>
            )}
        </>
    );
}

export default App;