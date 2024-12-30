import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlySubmissions } from "../MonthlySubmissions";

interface TimesheetHistoryProps {
  timesheets: any[];
  workTypeRates: Record<string, { hourly_rate?: number; fixed_rate?: number; }>;
  onTimesheetUpdated: () => void;
}

export const TimesheetHistory = ({ 
  timesheets,
  workTypeRates,
  onTimesheetUpdated 
}: TimesheetHistoryProps) => {
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