"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSoundStore } from "./notification-sounds";

export function SoundControl() {
  const { volume, muted, setVolume, toggleMute } = useSoundStore();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{muted ? "Unmute" : "Mute"} notification sounds</p>
          </TooltipContent>
        </Tooltip>
        <Slider
          className="w-24"
          value={[volume]}
          min={0}
          max={1}
          step={0.1}
          onValueChange={([value]) => setVolume(value)}
        />
      </div>
    </TooltipProvider>
  );
} 