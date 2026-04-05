import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

interface RollingAvgSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function RollingAvgSlider({ value, onChange }: RollingAvgSliderProps) {
  return (
    <Card className="bg-card">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Rolling average:
          </span>
          <Slider
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            min={3}
            max={30}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-medium w-16 text-right">
            {value} days
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
