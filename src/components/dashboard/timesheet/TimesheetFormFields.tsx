import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { WorkTypeSelect } from "../WorkTypeSelect";
import { TimeInputs } from "../TimeInputs";
import { JobsHoursInput } from "../JobsHoursInput";
import { OtherWorkTypeDetails } from "./OtherWorkTypeDetails";

interface TimesheetFormFieldsProps {
  workTypes: any[];
  selectedWorkType: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  hours: string;
  isFixedRate: boolean;
  description: string;
  rate: string;
  onWorkTypeChange: (value: string) => void;
  onDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onHoursChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onRateChange: (value: string) => void;
}

export const TimesheetFormFields = ({
  workTypes,
  selectedWorkType,
  date,
  startTime,
  endTime,
  hours,
  isFixedRate,
  description,
  rate,
  onWorkTypeChange,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onHoursChange,
  onDescriptionChange,
  onRateChange,
}: TimesheetFormFieldsProps) => {
  const selectedWorkTypeData = workTypes.find(wt => wt.id === selectedWorkType);
  const isOtherWorkType = selectedWorkTypeData?.name === "Other";

  return (
    <div className="grid gap-4">
      <WorkTypeSelect
        workTypes={workTypes}
        selectedWorkType={selectedWorkType}
        onWorkTypeChange={onWorkTypeChange}
      />
      
      {isOtherWorkType && (
        <OtherWorkTypeDetails
          description={description}
          rate={rate}
          onDescriptionChange={onDescriptionChange}
          onRateChange={onRateChange}
          isHourlyRate={!isFixedRate}
        />
      )}

      <div className="grid gap-2">
        <Label>Date</Label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          className="rounded-md border"
        />
      </div>

      <TimeInputs
        startTime={startTime}
        endTime={endTime}
        onStartTimeChange={onStartTimeChange}
        onEndTimeChange={onEndTimeChange}
      />
      
      <JobsHoursInput
        isFixedRate={isFixedRate}
        value={hours}
        onChange={onHoursChange}
      />
    </div>
  );
};