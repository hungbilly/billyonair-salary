import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TimesheetSummaryProps {
  timesheets: any[];
}

export const TimesheetSummary = ({ timesheets }: TimesheetSummaryProps) => {
  const [workTypeRates, setWorkTypeRates] = useState<Record<string, { hourly_rate?: number; fixed_rate?: number }>>({});
  const totalHours = timesheets.reduce((sum, timesheet) => sum + Number(timesheet.hours), 0);
  
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

      const ratesMap = data.reduce((acc: any, curr) => {
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

  const calculateSalary = (timesheet: any) => {
    const rates = workTypeRates[timesheet.work_type_id];
    if (!rates) return null;

    if (rates.hourly_rate) {
      return Number(timesheet.hours) * rates.hourly_rate;
    }
    if (rates.fixed_rate) {
      return rates.fixed_rate;
    }
    return null;
  };

  const totalSalary = timesheets.reduce((sum, timesheet) => {
    const salary = calculateSalary(timesheet);
    return sum + (salary || 0);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month's Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {timesheets.map((timesheet) => {
              const rates = workTypeRates[timesheet.work_type_id];
              const salary = calculateSalary(timesheet);

              return (
                <div
                  key={timesheet.id}
                  className="flex flex-col space-y-2 p-4 border rounded"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{timesheet.work_types.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(timesheet.work_date), "MMM d, yyyy")}
                      </p>
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
                      <p className="font-bold">{timesheet.hours} hours</p>
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