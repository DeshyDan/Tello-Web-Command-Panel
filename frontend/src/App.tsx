import {useState} from 'react';
import TelloSocketClient from "@/services/TelloSocketClient.ts";
import ControlPanel from "@/pages/ControlPanel.tsx";
import Connect from "@/pages/Connect.tsx";


function App() {
    const [isConnected, setIsConnected] = useState(false);

    const telloClient = new TelloSocketClient("http://localhost:5001", ["websocket"]);

    return (
        <>
            {isConnected ? (
                <ControlPanel tello={telloClient}/>
            ) : (
                <Connect onConnect={() => {
                    telloClient.connect();
                    setIsConnected(telloClient.socket.connected)
                }}/>
            )
            }
        </>
    )
}

export default App;