import { useState } from "react";
import { format, subWeeks, subMonths } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  start: Date | undefined;
  end: Date | undefined;
  onChangeStart: (date: Date | undefined) => void;
  onChangeEnd: (date: Date | undefined) => void;
}

export function DateRangePicker({
  start,
  end,
  onChangeStart,
  onChangeEnd,
}: DateRangePickerProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const presets = [
    { label: "1W", getStart: () => subWeeks(new Date(), 1) },
    { label: "2W", getStart: () => subWeeks(new Date(), 2) },
    { label: "1M", getStart: () => subMonths(new Date(), 1) },
    { label: "3M", getStart: () => subMonths(new Date(), 3) },
  ];

  const isPresetActive = (getStart: () => Date) => {
    if (!start || end) return false;
    return Math.abs(start.getTime() - getStart().getTime()) < 86400000;
  };

  const applyPreset = (getStart: () => Date) => {
    onChangeStart(getStart());
    onChangeEnd(undefined);
  };

  const isAllActive = !start && !end;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-1">
        {presets.map((p) => (
          <Button
            key={p.label}
            variant={isPresetActive(p.getStart) ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset(p.getStart)}
          >
            {p.label}
          </Button>
        ))}
        <Button
          variant={isAllActive ? "default" : "outline"}
          size="sm"
          onClick={() => {
            onChangeStart(undefined);
            onChangeEnd(undefined);
          }}
        >
          All
        </Button>
      </div>

      <span className="text-muted-foreground">|</span>

      <Popover open={startOpen} onOpenChange={setStartOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[160px] justify-start text-left font-normal",
              !start && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {start ? format(start, "MMM d, yyyy") : "Start date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={start}
            onSelect={(d) => {
              onChangeStart(d);
              setStartOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground">-</span>

      <Popover open={endOpen} onOpenChange={setEndOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[160px] justify-start text-left font-normal",
              !end && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {end ? format(end, "MMM d, yyyy") : "End date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={end}
            onSelect={(d) => {
              onChangeEnd(d);
              setEndOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

    </div>
  );
}
