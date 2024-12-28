import './App.css'
import {io, Socket} from "socket.io-client";
import {useCallback, useEffect, useRef, useState} from "react";
import Connect from "@/pages/Connect.tsx";

function App() {
    const [isConnected, setIsConnected] = useState(false);
    const [responses, setResponses] = useState<string[]>([]);
    const [moveStatus, setMoveStatus] = useState<string>('');
    const [connectionStatus, setConnectionStatus] = useState<string>('');
    const [droneState, setDroneState] = useState<any>(null);
    const socket = useRef<Socket | null>(null);

    const connect = useCallback(() => {
        if (socket.current !== null) {
            return;
        }

        socket.current = io('http://localhost:5001/tello', {
            reconnection: true,
            withCredentials: true,
            extraHeaders: {
                'Access-Control-Allow-Origin': '*'
            },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.current.on("connect", () => {
            console.log('Socket Connected!');
            setIsConnected(true);
            addResponse(`System: Socket Connected! (using ${socket.current?.io.engine.transport.name})`);
        });
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (socket.current) {
                socket.current.disconnect();
                setIsConnected(false);
            }
        };
    }, [connect]);

    useEffect(() => {
        if (!socket.current) return;

        // Move status listener
        socket.current.on('move_status', (data) => {
            console.log('Move Status:', data);
            setMoveStatus(data.message);
            addResponse(`Movement: ${data.message}`);
        });

        // State update listener
        socket.current.on('state_update', (data) => {
            console.log('State Update:', data);
            if (data.status === 'success') {
                setDroneState(data.state);
                addResponse(`State Update: Received drone state`);
            } else {
                addResponse(`State Error: ${data.message}`);
            }
        });

        // Debug listeners
        socket.current.on('disconnect', () => {
            console.log('Socket Disconnected!');
            setIsConnected(false);
            setConnectionStatus("Error");
            addResponse('System: Socket Disconnected!');
        });

        socket.current.on('connect_error', (error) => {
            console.log('Connection Error:', error);
            const errorMessage = 'Connection error: ' + error.message;
            setConnectionStatus(errorMessage);
            addResponse(`System: ${errorMessage}`);
        });

        // Cleanup function to remove event listeners
        return () => {
            if (socket.current) {
                socket.current.off('move_status');
                socket.current.off('state_update');
                socket.current.off('connect');
                socket.current.off('disconnect');
                socket.current.off('connect_error');
            }
        };
    }, []);

    const addResponse = useCallback((message: string) => {
        setResponses(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    }, []);

    return (
        <>
            {!isConnected && <Connect onConnect={connect} isConnected={isConnected}/>}
        </>
    );
}

export default App;