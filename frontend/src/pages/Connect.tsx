import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import tello from "../assets/tello.png"
import logo from "../assets/dji.svg"

interface Props {
    onConnect: () => void
}

const Connect = ({onConnect}: Props) => {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center">
            {/* Header */}
            <header className="w-full py-8 flex justify-center">
                <div className="flex items-center gap-3">
                    <img
                        src={logo}
                        alt="DJI Logo"
                        className="h-20"
                    />
                    <h1 className="text-white text-7xl font-bold">Web Control Panel</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-3xl flex-grow flex flex-col items-center justify-center px-4">
                <Card className="w-full bg-black border-gray-800">
                    <CardContent className="p-12 flex flex-col items-center">
                        {/* Drone Image */}
                        <div className="mb-8">
                            <img
                                src={tello}
                                alt="DJI Ryze Tello Drone"
                                className="w-96 h-auto"
                            />
                        </div>

                        {/* Drone Name */}
                        <h2 className=" text-white text-5xl font-bold mb-8">DJI RYZE TELLO</h2>

                        {/* Connect Button */}
                        <Button
                            variant="secondary"

                            className="h-30 w-60 rounded-2xl text-3xl px-8 bg-white text-black hover:bg-gray-300"
                            onClick={() => onConnect()}
                        >
                            Connect
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default Connect;