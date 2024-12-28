import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const StaffDashboard = () => {
  const [workTypes, setWorkTypes] = useState<any[]>([]);
  const [selectedWorkType, setSelectedWorkType] = useState("");
  const [hours, setHours] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkTypes();
    fetchTimesheets();
  }, []);

  const fetchWorkTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("work_types")
        .select("*")
        .order("name");

      if (error) throw error;
      setWorkTypes(data || []);
    } catch (error: any) {
      console.error("Error fetching work types:", error);
      toast({
        title: "Error",
        description: "Failed to fetch work types",
        variant: "destructive",
      });
    }
  };

  const fetchTimesheets = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("timesheets")
        .select(`
          *,
          work_types (name)
        `)
        .eq("employee_id", userData.user.id)
        .order("work_date", { ascending: false });

      if (error) throw error;
      setTimesheets(data || []);
    } catch (error: any) {
      console.error("Error fetching timesheets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch timesheets",
        variant: "destructive",
      });
    }
  };

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
      fetchTimesheets();
    } catch (error: any) {
      console.error("Error logging hours:", error);
      toast({
        title: "Error",
        description: "Failed to log hours",
        variant: "destructive",
      });
    }
  };

  const totalHours = timesheets.reduce((sum, timesheet) => sum + Number(timesheet.hours), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Staff Dashboard</h1>
      
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
      
      <Card>
        <CardHeader>
          <CardTitle>This Month's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              {timesheets.map((timesheet) => (
                <div
                  key={timesheet.id}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div>
                    <p className="font-medium">{timesheet.work_types.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(timesheet.work_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <p className="font-bold">{timesheet.hours} hours</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 border-t">
              <span className="font-medium">Total Hours:</span>
              <span className="font-bold">{totalHours}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};