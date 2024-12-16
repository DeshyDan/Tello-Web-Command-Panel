import './App.css'
import {io, Socket} from "socket.io-client";
import {useEffect, useState} from "react";

// TODO : Add more attributes
interface DroneState {
    battery?: number;
    height?: number;
    temperature?: number;
}

function App() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string>("");
    const [moveStatus, setMoveStatus] = useState<string>("");
    const [droneState, setDroneState] = useState<DroneState>({});
    const [responses, setResponses] = useState<string[]>([]);

    //  Actually need to read how this works :(.
    useEffect(() => {
        const socket = io('http://localhost:5001/tello', {
            reconnection: true,
            withCredentials: true,
            extraHeaders: {
                'Access-Control-Allow-Origin': '*'
            },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Connection status listener
        // socket.on('connection_status', (data) => {
        //     console.log('Connection Status:', data);
        //     setConnectionStatus(data.message);
        //     setIsConnected(data.status === 'success');
        //     addResponse(`Connection: ${data.message}`);
        // });

        // Move status listener
        socket.on('move_status', (data) => {
            console.log('Move Status:', data);
            setMoveStatus(data.message);
            addResponse(`Movement: ${data.message}`);
        });

        // State update listener
        socket.on('state_update', (data) => {
            console.log('State Update:', data);
            if (data.status === 'success') {
                setDroneState(data.state);
                addResponse(`State Update: Received drone state`);
            } else {
                addResponse(`State Error: ${data.message}`);
            }
        });

        // Debug listeners
        socket.on('connect', () => {
            console.log('Socket Connected!');
            console.log('Transport:', socket.io.engine.transport.name);
            setIsConnected(true);

            // TODO: Connecton Status should be set from connection_status listener
            setConnectionStatus("Success")
            addResponse(`System: Socket Connected! (using ${socket.io.engine.transport.name})`);
        });

        socket.on('disconnect', () => {
            console.log('Socket Disconnected!');
            setIsConnected(false);
            setConnectionStatus("Error");
            addResponse('System: Socket Disconnected!');
        });

        socket.on('connect_error', (error) => {
            console.log('Connection Error:', error);
            const errorMessage = 'Connection error: ' + error.message;
            setConnectionStatus(errorMessage);
            addResponse(`System: ${errorMessage}`);
        });

        setSocket(socket);

        return () => {
            socket.disconnect();
        };
    }, []);

    const addResponse = (message: string) => {
        setResponses(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    // TODO: Look more into connection retrying strategy
    const connect = (e: React.MouseEvent) => {
        e.preventDefault();
        if (socket) {
            console.log('Attempting to connect');
            addResponse('Client: Attempting to connect to Tello. Not actually doing anything though');
            setConnectionStatus('Attempting to connect to Tello...');
        }
    };

    const sendMove = (direction: string) => {
        if (socket && isConnected) {
            console.log(`Sending move command: ${direction}`);
            addResponse(`Client: Sending move command: ${direction}`);
            socket.emit('move', direction);
        }
    };

    const getState = () => {
        if (socket && isConnected) {
            console.log('Requesting Tello state');
            addResponse('Client: Requesting Tello state');
            socket.emit('state');
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="space-x-2 mb-4">
                <button
                    onClick={connect}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    Connect to Tello
                </button>
                <button
                    onClick={() => sendMove('forward')}
                    className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
                >
                    Move Forward
                </button>
                <button
                    onClick={getState}
                    className="px-4 py-2 bg-purple-500 text-white rounded disabled:bg-gray-300"
                >
                    Get State
                </button>
            </div>

            {/* Status Displays */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Connection Status</h3>
                    <p>
                        {connectionStatus || 'Not Connected'}
                    </p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Move Status</h3>
                    <p >
                        {moveStatus || 'No recent movement'}
                    </p>
                </div>
            </div>

            {/* Drone State */}
            {Object.keys(droneState).length > 0 && (
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold mb-2">Drone State</h3>
                    <pre className="text-sm">{JSON.stringify(droneState, null, 2)}</pre>
                </div>
            )}

            {/* Response Log */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Response Log</h2>
                <div className="bg-gray-100 p-4 rounded-lg max-h-[300px] overflow-y-auto">
                    {responses.map((response, index) => (
                        <div key={index} className="mb-1 font-mono text-sm">
                            {response}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App;