import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JobsHoursInputProps {
  isFixedRate: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const JobsHoursInput = ({ isFixedRate, value, onChange }: JobsHoursInputProps) => {
  return (
    <div className="grid gap-2">
      <Label>{isFixedRate ? 'Number of Jobs' : 'Hours'}</Label>
      <Input
        type="number"
        step={isFixedRate ? "1" : "0.5"}
        min={isFixedRate ? "1" : "0.5"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
      />
    </div>
  );
};