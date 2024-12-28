import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface TimesheetSummaryProps {
  timesheets: any[];
}

export const TimesheetSummary = ({ timesheets }: TimesheetSummaryProps) => {
  const totalHours = timesheets.reduce((sum, timesheet) => sum + Number(timesheet.hours), 0);

  return (
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
  );
};