import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WorkTypeSelectProps {
  workTypes: any[];
  selectedWorkType: string;
  onWorkTypeChange: (value: string) => void;
}

export const WorkTypeSelect = ({
  workTypes,
  selectedWorkType,
  onWorkTypeChange,
}: WorkTypeSelectProps) => {
  return (
    <div className="grid gap-2">
      <Label>Work Type</Label>
      <Select value={selectedWorkType} onValueChange={onWorkTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select work type" />
        </SelectTrigger>
        <SelectContent>
          {workTypes.map((workType) => (
            <SelectItem key={workType.id} value={workType.id}>
              {workType.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};