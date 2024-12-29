import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
      value: hour.toString().padStart(2, '0'),
      label: `${displayHour}${period}`,
    };
  });

  const minutes = ['00', '15', '30', '45'].map(min => ({
    value: min,
    label: min,
  }));

  const handleTimeChange = (
    type: 'hour' | 'minute',
    value: string,
    currentTime: string,
    onChange: (time: string) => void
  ) => {
    const [currentHour, currentMinute] = currentTime ? currentTime.split(':') : ['00', '00'];
    const newTime = type === 'hour'
      ? `${value}:${currentMinute}`
      : `${currentHour}:${value}`;
    onChange(newTime);
  };

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label>Start Time</Label>
        <div className="flex gap-2">
          <Select
            value={startTime ? startTime.split(':')[0] : undefined}
            onValueChange={(value) => handleTimeChange('hour', value, startTime, onStartTimeChange)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour) => (
                <SelectItem key={hour.value} value={hour.value}>
                  {hour.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={startTime ? startTime.split(':')[1] : undefined}
            onValueChange={(value) => handleTimeChange('minute', value, startTime, onStartTimeChange)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((minute) => (
                <SelectItem key={minute.value} value={minute.value}>
                  {minute.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>End Time</Label>
        <div className="flex gap-2">
          <Select
            value={endTime ? endTime.split(':')[0] : undefined}
            onValueChange={(value) => handleTimeChange('hour', value, endTime, onEndTimeChange)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour) => (
                <SelectItem key={hour.value} value={hour.value}>
                  {hour.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={endTime ? endTime.split(':')[1] : undefined}
            onValueChange={(value) => handleTimeChange('minute', value, endTime, onEndTimeChange)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((minute) => (
                <SelectItem key={minute.value} value={minute.value}>
                  {minute.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};