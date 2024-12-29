import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
}

interface MonthlySubmissionsProps {
  timesheets: Timesheet[];
  workTypeRates: Record<string, { hourly_rate?: number; fixed_rate?: number; }>;
}

export const MonthlySubmissions = ({ timesheets, workTypeRates }: MonthlySubmissionsProps) => {
  // Group timesheets by month
  const monthlyTimesheets = timesheets.reduce((acc: Record<string, Timesheet[]>, timesheet) => {
    const monthKey = format(new Date(timesheet.work_date), "MMMM yyyy");
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(timesheet);
    return acc;
  }, {});

  const calculateSalary = (timesheet: Timesheet): number => {
    const rates = workTypeRates[timesheet.work_type_id];
    if (!rates) return 0;

    if (timesheet.work_types.rate_type === 'hourly' && rates.hourly_rate) {
      return timesheet.hours * rates.hourly_rate;
    }
    if (timesheet.work_types.rate_type === 'fixed' && rates.fixed_rate) {
      return rates.fixed_rate;
    }
    return 0;
  };

  const calculateMonthlyTotal = (sheets: Timesheet[]): number => {
    return sheets.reduce((total, sheet) => total + calculateSalary(sheet), 0);
  };

  const formatTime = (time: string | null): string => {
    if (!time) return '-';
    return format(new Date(`2000-01-01T${time}`), 'hh:mm a');
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {Object.entries(monthlyTimesheets).map(([month, sheets]) => (
        <AccordionItem value={month} key={month}>
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex justify-between w-full pr-4">
              <span>{month}</span>
              <span className="text-green-600">
                ${calculateMonthlyTotal(sheets).toFixed(2)}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Work Type</TableHead>
                  <TableHead className="text-right">Hours/Jobs</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sheets.map((sheet) => (
                  <TableRow key={sheet.id}>
                    <TableCell>{format(new Date(sheet.work_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {sheet.start_time && sheet.end_time ? (
                        `${formatTime(sheet.start_time)} - ${formatTime(sheet.end_time)}`
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{sheet.work_types.name}</TableCell>
                    <TableCell className="text-right">
                      {sheet.hours} {sheet.work_types.rate_type === 'fixed' ? 'job(s)' : 'hour(s)'}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      ${calculateSalary(sheet).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell colSpan={4} className="text-right">
                    Monthly Total:
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    ${calculateMonthlyTotal(sheets).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};