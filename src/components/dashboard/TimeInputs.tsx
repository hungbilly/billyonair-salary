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
    const formattedTime = `${hours.toString().padStart(2, '0')}:${roundedMinutes === 60 ? '00' : roundedMinutes.toString().padStart(2, '0')}`;
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
          list="time-list"
        />
      </div>
      <div className="grid gap-2">
        <Label>End Time</Label>
        <Input
          type="time"
          value={endTime}
          onChange={(e) => handleTimeChange(e.target.value, onEndTimeChange)}
          step="900" // 15 minutes in seconds (15 * 60)
          list="time-list"
        />
      </div>
      <datalist id="time-list">
        {Array.from({ length: 96 }, (_, i) => {
          const hour = Math.floor(i / 4);
          const minute = (i % 4) * 15;
          return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        }).map((time) => (
          <option key={time} value={time} />
        ))}
      </datalist>
    </div>
  );
};