import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkTypeSummary, WorkTypeRates } from "./types";
import { WorkTypeSummaryItem } from "./WorkTypeSummaryItem";
import { TimesheetSummaryFooter } from "./TimesheetSummaryFooter";
import { MonthlySubmissions } from "./MonthlySubmissions";
import { Separator } from "@/components/ui/separator";

interface TimesheetSummaryProps {
  timesheets: any[];
}

export const TimesheetSummary = ({ timesheets }: TimesheetSummaryProps) => {
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

  const calculateSalary = (hours: number, workTypeId: string, rateType: 'fixed' | 'hourly'): number | null => {
    const rates = workTypeRates[workTypeId];
    if (!rates) return null;

    if (rateType === 'fixed' && rates.fixed_rate) {
      return hours * rates.fixed_rate; // Multiply by hours (jobs) for fixed rate
    }
    if (rateType === 'hourly' && rates.hourly_rate) {
      return hours * rates.hourly_rate;
    }
    return null;
  };

  // Group timesheets by work type
  const workTypeSummaries = timesheets.reduce<Record<string, WorkTypeSummary>>((acc, timesheet) => {
    const workTypeId = timesheet.work_type_id;
    if (!acc[workTypeId]) {
      acc[workTypeId] = {
        name: timesheet.work_types.name,
        totalHours: 0,
        workTypeId,
        rateType: timesheet.work_types.rate_type,
      };
    }
    acc[workTypeId].totalHours += Number(timesheet.hours);
    return acc;
  }, {});

  // Calculate total salary across all work types
  const totalSalary = Object.values(workTypeSummaries).reduce((sum: number, summary) => {
    const salary = calculateSalary(summary.totalHours, summary.workTypeId, summary.rateType);
    return sum + (salary || 0);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month's Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            {Object.values(workTypeSummaries).map((summary) => (
              <WorkTypeSummaryItem
                key={summary.workTypeId}
                {...summary}
                workTypeRates={workTypeRates}
              />
            ))}
          </div>
          <TimesheetSummaryFooter
            totalSalary={totalSalary}
          />
          <Separator className="my-6" />
          <div>
            <h3 className="text-lg font-semibold mb-4">Submission History</h3>
            <MonthlySubmissions 
              timesheets={timesheets} 
              workTypeRates={workTypeRates}
              onTimesheetUpdated={fetchWorkTypeRates}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};