import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AssignWorkTypeFormProps {
  staffList: any[];
  workType: any;
  onSubmit: (staffId: string, rate: string) => void;
}

export const AssignWorkTypeForm = ({ staffList, workType, onSubmit }: AssignWorkTypeFormProps) => {
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [rate, setRate] = useState<string>("");

  const handleSubmit = () => {
    onSubmit(selectedStaff, rate);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Staff Member</Label>
        <Select value={selectedStaff} onValueChange={setSelectedStaff}>
          <SelectTrigger>
            <SelectValue placeholder="Select staff member" />
          </SelectTrigger>
          <SelectContent>
            {staffList.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.full_name || staff.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{workType.rate_type === "hourly" ? "Hourly Rate" : "Fixed Rate"}</Label>
        <Input
          type="number"
          placeholder="Enter rate"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
      </div>
      <Button onClick={handleSubmit} className="w-full">
        Assign Work Type
      </Button>
    </div>
  );
};