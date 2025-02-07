import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Home, Settings } from 'lucide-react';

const DroneInterface = () => {
  return (
      <div className="min-h-screen bg-black text-white p-4">
        {/* Left Sidebar */}
        <div className="fixed left-0 top-0 h-full w-16 bg-zinc-900 flex flex-col items-center py-4 gap-4">
          <div className="text-xl font-bold">WCP</div>
          <Button variant="ghost" size="icon">
            <Home className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="ml-16">
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
                  <Camera className="h-4 w-4" />
                  Video
                </Button>
                <Button variant="secondary" className="gap-2 bg-zinc-800/80">
                  <Camera className="h-4 w-4" />
                  Photo
                </Button>
              </div>

              {/* Status Overlay - Top Right */}
              <div className="absolute top-4 right-4 flex gap-4 items-center">
                <div className="bg-zinc-800/80 px-3 py-1 rounded-md">00:32:00</div>
                <div className="bg-zinc-800/80 px-3 py-1 rounded-md flex items-center gap-2">
                  10% <div className="w-4 h-2 bg-red-500 rounded-sm" />
                </div>
              </div>

              {/* Telemetry Overlay */}
              <div className="absolute left-4 bottom-4 space-y-2 bg-black/50 p-4 rounded-2xl">
                <div>
                  <div className="text-sm opacity-70">Speed</div>
                  <div className="text-2xl">50 m/s</div>
                </div>
                <div>
                  <div className="text-sm opacity-70">Altitude</div>
                  <div className="text-2xl">885 m</div>
                </div>
                <div>
                  <div className="text-sm opacity-70">Temperature</div>
                  <div className="text-2xl">30 °C</div>
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
                    <Button variant="outline" size="icon">-</Button>
                    <span className="text-xl">100</span>
                    <Button variant="outline" size="icon">+</Button>
                  </div>
                </div>

                {/* Altitude Limit Control */}
                <div>
                  <h3 className="mb-4">Altitude limit (m)</h3>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon">-</Button>
                    <span className="text-xl">950</span>
                    <Button variant="outline" size="icon">+</Button>
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
                        <SelectValue />
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
                        <SelectValue />
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
                  <div className="text-blue-600">Fetching state...</div>

                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default DroneInterface;