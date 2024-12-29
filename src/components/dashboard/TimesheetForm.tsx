import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { WorkTypeSelect } from "./WorkTypeSelect";
import { TimeInputs } from "./TimeInputs";
import { JobsHoursInput } from "./JobsHoursInput";

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
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkTypeRateType = async () => {
      if (!selectedWorkType) {
        setIsFixedRate(false);
        setSalary(null);
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
  }, [selectedWorkType, hours]);

  const validateInput = () => {
    if (!date || !selectedWorkType || !startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    const hoursValue = parseFloat(hours);
    if (isNaN(hoursValue) || hoursValue <= 0) {
      toast({
        title: "Error",
        description: isFixedRate 
          ? "Number of jobs must be greater than 0" 
          : "Hours must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateInput()) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("No user found");

      const hoursValue = parseFloat(hours);
      const timesheetData = {
        employee_id: userData.user.id,
        work_type_id: selectedWorkType,
        hours: hoursValue,
        work_date: format(date, "yyyy-MM-dd"),
        start_time: startTime,
        end_time: endTime,
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
    <div className={`w-full ${editingTimesheet ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto' : ''}`}>
      <div className={`${editingTimesheet ? 'min-h-screen flex items-center justify-center p-4' : ''}`}>
        <Card className={`w-full max-w-2xl mx-auto ${editingTimesheet ? 'relative' : ''}`}>
          <CardHeader>
            <CardTitle>{editingTimesheet ? "Edit Entry" : "Log Salary"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <WorkTypeSelect
                workTypes={workTypes}
                selectedWorkType={selectedWorkType}
                onWorkTypeChange={setSelectedWorkType}
              />
              
              <div className="grid gap-2">
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border mx-auto"
                />
              </div>

              <TimeInputs
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={setStartTime}
                onEndTimeChange={setEndTime}
              />
              
              <JobsHoursInput
                isFixedRate={isFixedRate}
                value={hours}
                onChange={setHours}
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
      </div>
    </div>
  );
};