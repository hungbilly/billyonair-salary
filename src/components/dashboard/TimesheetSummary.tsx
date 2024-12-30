import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkTypeRates } from "./types";
import { MonthlySubmissions } from "./MonthlySubmissions";

interface TimesheetSummaryProps {
  timesheets: any[];
  onTimesheetUpdated: () => void;
}

export const TimesheetSummary = ({ timesheets, onTimesheetUpdated }: TimesheetSummaryProps) => {
  const [workTypeRates, setWorkTypeRates] = useState<WorkTypeRates>({});
  
  const fetchWorkTypeRates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('work_type_assignments')
      .select('work_type_id, hourly_rate, fixed_rate')
      .eq('staff_id', user.id);

    if (error) {
      console.error('Error fetching work type rates:', error);
      return;
    }

    const ratesMap = data.reduce((acc: WorkTypeRates, curr) => {
      acc[curr.work_type_id] = {
        hourly_rate: curr.hourly_rate,
        fixed_rate: curr.fixed_rate,
      };
      return acc;
    }, {});

    setWorkTypeRates(ratesMap);
  };

  useEffect(() => {
    fetchWorkTypeRates();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timesheet History</CardTitle>
      </CardHeader>
      <CardContent>
        <MonthlySubmissions 
          timesheets={timesheets} 
          workTypeRates={workTypeRates}
          onTimesheetUpdated={onTimesheetUpdated}
        />
      </CardContent>
    </Card>
  );
};
