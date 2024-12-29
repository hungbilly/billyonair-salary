import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TimeInputsProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export const TimeInputs = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: TimeInputsProps) => {
  const handleTimeChange = (value: string, onChange: (time: string) => void) => {
    // Round minutes to nearest 15
    const [hours, minutes] = value.split(':').map(Number);
    const roundedMinutes = Math.round(minutes / 15) * 15;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
    onChange(formattedTime);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label>Start Time</Label>
        <Input
          type="time"
          value={startTime}
          onChange={(e) => handleTimeChange(e.target.value, onStartTimeChange)}
          step="900" // 15 minutes in seconds (15 * 60)
        />
      </div>
      <div className="grid gap-2">
        <Label>End Time</Label>
        <Input
          type="time"
          value={endTime}
          onChange={(e) => handleTimeChange(e.target.value, onEndTimeChange)}
          step="900" // 15 minutes in seconds (15 * 60)
        />
      </div>
    </div>
  );
};