import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface OtherWorkTypeDetailsProps {
  description: string;
  rate: string;
  onDescriptionChange: (value: string) => void;
  onRateChange: (value: string) => void;
  isHourlyRate: boolean;
}

export const OtherWorkTypeDetails = ({
  description,
  rate,
  onDescriptionChange,
  onRateChange,
  isHourlyRate,
}: OtherWorkTypeDetailsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Enter work description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label>{isHourlyRate ? "Hourly Rate" : "Fixed Rate"} ($)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Enter rate"
          value={rate}
          onChange={(e) => onRateChange(e.target.value)}
        />
      </div>
    </div>
  );
};