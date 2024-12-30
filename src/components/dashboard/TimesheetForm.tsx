import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TimesheetFormFields } from "./timesheet/TimesheetFormFields";
import { format } from "date-fns";

interface TimesheetFormProps {
  workTypes: any[];
  onTimesheetAdded: () => void;
  editingTimesheet?: {
    id: string;
    work_date: string;
    hours: number;
    start_time: string | null;
    end_time: string | null;
    work_type_id: string;
  };
}

export const TimesheetForm = ({ workTypes, onTimesheetAdded, editingTimesheet }: TimesheetFormProps) => {
  const [selectedWorkType, setSelectedWorkType] = useState(editingTimesheet?.work_type_id || "");
  const [hours, setHours] = useState(editingTimesheet ? editingTimesheet.hours.toString() : "");
  const [date, setDate] = useState<Date | undefined>(
    editingTimesheet ? new Date(editingTimesheet.work_date) : new Date()
  );
  const [startTime, setStartTime] = useState(editingTimesheet?.start_time || "");
  const [endTime, setEndTime] = useState(editingTimesheet?.end_time || "");
  const [isFixedRate, setIsFixedRate] = useState(false);
  const [salary, setSalary] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkTypeRateType = async () => {
      if (!selectedWorkType) {
        setIsFixedRate(false);
        setSalary(null);
        return;
      }

      const selectedWorkTypeData = workTypes.find(wt => wt.id === selectedWorkType);
      if (selectedWorkTypeData?.name === "Other") {
        const rateValue = parseFloat(rate) || 0;
        const hoursValue = parseFloat(hours) || 0;
        setSalary(rateValue * hoursValue);
        return;
      }

      const { data: workTypeData, error: workTypeError } = await supabase
        .from('work_types')
        .select('rate_type')
        .eq('id', selectedWorkType)
        .single();

      if (workTypeError) {
        console.error('Error fetching work type rate type:', workTypeError);
        return;
      }

      const { data: rateData, error: rateError } = await supabase
        .from('work_type_assignments')
        .select('hourly_rate, fixed_rate')
        .eq('work_type_id', selectedWorkType)
        .single();

      if (rateError) {
        console.error('Error fetching rate:', rateError);
        return;
      }

      const isFixed = workTypeData.rate_type === 'fixed';
      setIsFixedRate(isFixed);

      const hoursValue = parseFloat(hours) || 0;
      if (isFixed) {
        setSalary(hoursValue * (rateData.fixed_rate || 0));
      } else {
        setSalary(hoursValue * (rateData.hourly_rate || 0));
      }
    };

    fetchWorkTypeRateType();
  }, [selectedWorkType, hours, rate]);

  const handleSubmit = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("No user found");

      const selectedWorkTypeData = workTypes.find(wt => wt.id === selectedWorkType);
      const isOtherWorkType = selectedWorkTypeData?.name === "Other";

      // Validate required fields based on work type
      if (isOtherWorkType) {
        if (!description || !rate) {
          toast({
            title: "Error",
            description: "Please fill in both description and rate for Other work type",
            variant: "destructive",
          });
          return;
        }
      } else {
        if (!startTime || !endTime) {
          toast({
            title: "Error",
            description: "Please fill in start time and end time",
            variant: "destructive",
          });
          return;
        }
      }

      if (!date || !selectedWorkType) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const hoursValue = isOtherWorkType ? 1 : parseFloat(hours);
      if (!isOtherWorkType && (isNaN(hoursValue) || hoursValue <= 0)) {
        toast({
          title: "Error",
          description: isFixedRate 
            ? "Number of jobs must be greater than 0" 
            : "Hours must be greater than 0",
          variant: "destructive",
        });
        return;
      }

      const timesheetData = {
        employee_id: userData.user.id,
        work_type_id: selectedWorkType,
        hours: hoursValue,
        work_date: format(date, "yyyy-MM-dd"),
        start_time: isOtherWorkType ? null : startTime,
        end_time: isOtherWorkType ? null : endTime,
        ...(isOtherWorkType && {
          description,
          custom_rate: parseFloat(rate),
        }),
      };

      if (editingTimesheet) {
        const { error } = await supabase
          .from("timesheets")
          .update(timesheetData)
          .eq('id', editingTimesheet.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Entry updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("timesheets")
          .insert(timesheetData);

        if (error) throw error;

        toast({
          title: "Success",
          description: `Salary logged: $${salary?.toFixed(2)}`,
        });
      }

      setSelectedWorkType("");
      setHours("");
      setDate(new Date());
      setStartTime("");
      setEndTime("");
      setSalary(null);
      setDescription("");
      setRate("");
      onTimesheetAdded();
    } catch (error: any) {
      console.error("Error logging hours:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to log hours",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={editingTimesheet ? "border-0 shadow-none" : undefined}>
      <CardHeader>
        <CardTitle>{editingTimesheet ? "Edit Entry" : "Log Salary"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <TimesheetFormFields
            workTypes={workTypes}
            selectedWorkType={selectedWorkType}
            date={date}
            startTime={startTime}
            endTime={endTime}
            hours={hours}
            isFixedRate={isFixedRate}
            description={description}
            rate={rate}
            onWorkTypeChange={setSelectedWorkType}
            onDateChange={setDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onHoursChange={setHours}
            onDescriptionChange={setDescription}
            onRateChange={setRate}
          />

          {salary !== null && (
            <div className="text-lg font-semibold text-green-600">
              Estimated Salary: ${salary.toFixed(2)}
            </div>
          )}
          
          <Button onClick={handleSubmit}>
            {editingTimesheet ? "Update Entry" : "Log Salary"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};