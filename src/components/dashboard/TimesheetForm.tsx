import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface TimesheetFormProps {
  workTypes: any[];
  onTimesheetAdded: () => void;
}

export const TimesheetForm = ({ workTypes, onTimesheetAdded }: TimesheetFormProps) => {
  const [selectedWorkType, setSelectedWorkType] = useState("");
  const [hours, setHours] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      if (!date || !selectedWorkType || !hours) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("No user found");

      const { error } = await supabase.from("timesheets").insert({
        employee_id: userData.user.id,
        work_type_id: selectedWorkType,
        hours: parseFloat(hours),
        work_date: format(date, "yyyy-MM-dd"),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hours logged successfully",
      });

      setSelectedWorkType("");
      setHours("");
      setDate(new Date());
      onTimesheetAdded();
    } catch (error: any) {
      console.error("Error logging hours:", error);
      toast({
        title: "Error",
        description: "Failed to log hours",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Work Type</Label>
            <Select value={selectedWorkType} onValueChange={setSelectedWorkType}>
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
          
          <div className="grid gap-2">
            <Label>Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Hours</Label>
            <Input
              type="number"
              step="0.5"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
            />
          </div>
          
          <Button onClick={handleSubmit}>Log Hours</Button>
        </div>
      </CardContent>
    </Card>
  );
};