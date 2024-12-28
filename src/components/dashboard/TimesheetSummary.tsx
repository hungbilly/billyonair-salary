import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TimesheetSummaryProps {
  timesheets: any[];
}

interface WorkTypeSummary {
  name: string;
  totalHours: number;
  workTypeId: string;
}

interface WorkTypeRates {
  [key: string]: {
    hourly_rate?: number;
    fixed_rate?: number;
  };
}

export const TimesheetSummary = ({ timesheets }: TimesheetSummaryProps) => {
  const [workTypeRates, setWorkTypeRates] = useState<WorkTypeRates>({});
  
  useEffect(() => {
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

    fetchWorkTypeRates();
  }, []);

  const calculateSalary = (hours: number, workTypeId: string): number | null => {
    const rates = workTypeRates[workTypeId];
    if (!rates) return null;

    if (rates.hourly_rate) {
      return hours * rates.hourly_rate;
    }
    if (rates.fixed_rate) {
      return rates.fixed_rate;
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
      };
    }
    acc[workTypeId].totalHours += Number(timesheet.hours);
    return acc;
  }, {});

  // Calculate total salary across all work types
  const totalSalary = Object.values(workTypeSummaries).reduce((sum: number, summary) => {
    const salary = calculateSalary(summary.totalHours, summary.workTypeId);
    return sum + (salary || 0);
  }, 0);

  // Calculate total hours across all work types
  const totalHours = Object.values(workTypeSummaries).reduce((sum: number, summary) => {
    return sum + summary.totalHours;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month's Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {Object.values(workTypeSummaries).map((summary) => {
              const rates = workTypeRates[summary.workTypeId];
              const salary = calculateSalary(summary.totalHours, summary.workTypeId);

              return (
                <div
                  key={summary.workTypeId}
                  className="flex flex-col space-y-2 p-4 border rounded"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{summary.name}</p>
                      {rates && (
                        <p className="text-sm text-muted-foreground">
                          Rate: {rates.hourly_rate ? 
                            `$${rates.hourly_rate}/hour` : 
                            rates.fixed_rate ? 
                            `$${rates.fixed_rate} fixed` : 
                            'Not set'}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{summary.totalHours} hours</p>
                      {salary !== null && (
                        <p className="text-sm font-medium text-green-600">
                          ${salary.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between pt-4 border-t">
            <div className="space-y-1">
              <p className="font-medium">Total Hours:</p>
              <p className="font-medium">Total Salary:</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-bold">{totalHours}</p>
              <p className="font-bold text-green-600">${totalSalary.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};