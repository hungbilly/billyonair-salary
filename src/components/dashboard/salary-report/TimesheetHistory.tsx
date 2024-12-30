import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlySubmissions } from "../MonthlySubmissions";

interface Timesheet {
  id: string;
  work_date: string;
  hours: number;
  start_time: string | null;
  end_time: string | null;
  work_types: {
    name: string;
    rate_type: 'fixed' | 'hourly';
  };
  work_type_id: string;
  custom_rate?: number | null;
  description?: string | null;
}

interface TimesheetHistoryProps {
  timesheets: Timesheet[];
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