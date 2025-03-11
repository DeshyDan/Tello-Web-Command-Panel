import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Camera} from 'lucide-react';
import {useEffect, useState} from "react";
import TelloHttpClient, {DroneState} from "@/services/TelloHttpClient.ts";

interface Props {
    tello: TelloHttpClient;
}

const ControlPanel = ({tello}: Props) => {
    const [state, setState] = useState<DroneState | null>(null);
    const [responses, setResponses] = useState<string[]>([]);

    const addResponse = (message: string) => {
        setResponses(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const getStateAfterDelay = async (delay: number) => {
        setTimeout(async () => {
            try {
                const state = await tello.getState();
                setState(state);
                addResponse("State fetched successfully");
            } catch (error) {
                addResponse(error.message);
            }
        }, delay);
    };

    useEffect(() => {
        getStateAfterDelay(1000);
        const currentState = JSON.stringify(state);
        addResponse(currentState)
    }, []);

    // Event handlers for keypad presses
    const handleMove = async (direction: "up" | "down" | "left" | "right" | "forward" | "back") => {
        try {
            const response = await tello.move(direction);
            addResponse(response);
        } catch (error) {
            addResponse(error.message);
        }


    };

    const handleRotate = async (direction: "cw" | "ccw") => {
        try {
            const response = await tello.rotate(direction);
            addResponse(response);
        } catch (error) {
            addResponse(error.message);
        }
    };

    const handleFlip = async (direction: "left" | "right" | "forward" | "backward") => {
        try {
            const response = await tello.flip(direction);
            addResponse(response);
        } catch (error) {
            addResponse(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4">
            {/* Main Content */}
            <div className="">
                {/* Main Video Feed */}
                <Card className="bg-zinc-800 mb-4">
                    <CardContent className="relative p-0 h-[400px]">
                        <img
                            src="/api/placeholder/1200/400"
                            alt="Drone Feed"
                            className="w-full h-full object-cover"
                        />

                        {/* Camera Controls - Top Left */}
                        <div className="absolute top-4 left-4 flex gap-2">
                            <Button variant="secondary" className="gap-2 bg-zinc-800/80">
                                <Camera className="h-4 w-4"/>
                                Video
                            </Button>
                            <Button variant="secondary" className="gap-2 bg-zinc-800/80">
                                <Camera className="h-4 w-4"/>
                                Photo
                            </Button>
                        </div>

                        {/* Status Overlay - Top Right */}
                        <div className="absolute top-4 right-4 flex gap-4 items-center">
                            <div className="bg-zinc-800/80 px-3 py-1 rounded-md">00:32:00</div>
                            <div className="bg-zinc-800/80 px-3 py-1 rounded-md flex items-center gap-2">
                                {state === null ? (
                                    <div className="w-4 h-2 bg-gray-500 rounded-sm"/>
                                ) : state.batteryPercentage <= 20 ? (
                                    <>
                                        {state.batteryPercentage}
                                        <div className="w-4 h-2 bg-red-500 rounded-sm"/>
                                    </>
                                ) : state.batteryPercentage <= 50 ? (
                                    <>
                                        {state.batteryPercentage}
                                        <div className="w-4 h-2 bg-yellow-500 rounded-sm"/>
                                    </>
                                ) : (
                                    <>
                                        {state.batteryPercentage}
                                        <div className="w-4 h-2 bg-green-500 rounded-sm"/>
                                    </>
                                )}
                            </div>
                            {/* Telemetry Overlay */}
                            <div className="absolute left-4 bottom-4 space-y-2 bg-black/50 p-4 rounded-2xl">
                                <div>
                                    <div className="text-sm opacity-70">Speed</div>
                                    <div className="text-2xl">{state == null ? "-" : state.totalSpeed} m/s</div>
                                </div>
                                <div>
                                    <div className="text-sm opacity-70">Height</div>
                                    <div className="text-2xl">{state == null ? "-" : state.timeOfFlight} m</div>
                                </div>
                                <div>
                                    <div className="text-sm opacity-70">Temperature</div>
                                    <div className="text-2xl">{state == null ? "-" : state.averageTemperature} °C</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom Controls */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Flight Controls */}
                    <Card className="bg-zinc-800">
                        <CardContent className="p-4 space-y-6">
                            {/* Flight Speed Control */}
                            <div>
                                <h3 className="mb-4">Flight Speed (m/s)</h3>
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon" onClick={() => handleMove("back")}>-</Button>
                                    <span className="text-xl">100</span>
                                    <Button variant="outline" size="icon"
                                            onClick={() => handleMove("forward")}>+</Button>
                                </div>
                            </div>

                            {/* Altitude Limit Control */}
                            <div>
                                <h3 className="mb-4">Altitude limit (m)</h3>
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon" onClick={() => handleMove("down")}>-</Button>
                                    <span className="text-xl">950</span>
                                    <Button variant="outline" size="icon" onClick={() => handleMove("up")}>+</Button>
                                </div>
                            </div>

                            {/* Rotation Controls */}
                            <div>
                                <h3 className="mb-4">Rotation</h3>
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon"
                                            onClick={() => handleRotate("ccw")}>CCW</Button>
                                    <Button variant="outline" size="icon" onClick={() => handleRotate("cw")}>CW</Button>
                                </div>
                            </div>

                            {/* Flip Controls */}
                            <div>
                                <h3 className="mb-4">Flip</h3>
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon"
                                            onClick={() => handleFlip("left")}>Left</Button>
                                    <Button variant="outline" size="icon"
                                            onClick={() => handleFlip("right")}>Right</Button>
                                    <Button variant="outline" size="icon"
                                            onClick={() => handleFlip("forward")}>Forward</Button>
                                    <Button variant="outline" size="icon"
                                            onClick={() => handleFlip("backward")}>Backward</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Camera Settings */}
                    <Card className="bg-zinc-800">
                        <CardContent className="p-4">
                            <h3 className="mb-4">Camera Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="mb-2">Video Resolution</div>
                                    <Select defaultValue="720p">
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="720p">720P</SelectItem>
                                            <SelectItem value="1080p">1080P</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <div className="mb-2">Frames Per Second</div>
                                    <Select defaultValue="60">
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 FPS</SelectItem>
                                            <SelectItem value="60">60 FPS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Console Output */}
                    <Card className="bg-white text-black">
                        <CardContent className="p-4">
                            <div className="font-mono text-sm">
                                <div className="font-bold mb-2">DJI TELLO</div>
                                {/*TODO: Destructure the state from backend....Also print out resoibses in the console*/}
                                {responses.map((response, index) => (
                                    <div key={index} className="mb-1 font-mono text-sm">
                                        {response}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;