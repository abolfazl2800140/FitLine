import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersianNumber } from "@/lib/persian";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  
  // Parse current value
  const [hours, minutes] = value ? value.split(":").map(Number) : [8, 0];
  
  const setHours = (h: number) => {
    const newHours = ((h % 24) + 24) % 24;
    onChange(`${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
  };
  
  const setMinutes = (m: number) => {
    const newMinutes = ((m % 60) + 60) % 60;
    onChange(`${String(hours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`);
  };

  const formatTime = (h: number, m: number) => {
    return `${toPersianNumber(String(h).padStart(2, "0"))}:${toPersianNumber(String(m).padStart(2, "0"))}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-right font-normal gap-2",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="h-4 w-4 text-muted-foreground" />
          {value ? formatTime(hours, minutes) : "انتخاب ساعت"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex items-center gap-4 justify-center">
          {/* Minutes - Right side for RTL */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMinutes(minutes + 5)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
              <span className="text-xl font-bold text-primary">
                {toPersianNumber(String(minutes).padStart(2, "0"))}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMinutes(minutes - 5)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <span className="text-2xl font-bold text-muted-foreground">:</span>

          {/* Hours - Left side for RTL */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setHours(hours + 1)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
              <span className="text-xl font-bold text-primary">
                {toPersianNumber(String(hours).padStart(2, "0"))}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setHours(hours - 1)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick select */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2 text-center">انتخاب سریع</p>
          <div className="grid grid-cols-4 gap-1">
            {["07:00", "08:00", "12:00", "13:00", "18:00", "20:00", "21:00", "22:00"].map((time) => (
              <Button
                key={time}
                variant={value === time ? "default" : "ghost"}
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  onChange(time);
                  setOpen(false);
                }}
              >
                {toPersianNumber(time)}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
