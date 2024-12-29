import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TimesheetTableRow } from "./TimesheetTableRow";
import { calculateSalary } from "@/utils/salary";

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

interface MonthlyTableProps {
  timesheets: Timesheet[];
  workTypeRates: Record<string, { hourly_rate?: number; fixed_rate?: number; }>;
}

export const MonthlyTable = ({ timesheets, workTypeRates }: MonthlyTableProps) => {
  const calculateMonthlyTotal = (sheets: Timesheet[]): number => {
    return sheets.reduce((total, sheet) => {
      const rates = workTypeRates[sheet.work_type_id];
      if (!rates) return total;

      if (sheet.work_types.rate_type === 'fixed' && rates.fixed_rate) {
        return total + (rates.fixed_rate * sheet.hours); // Multiply by hours (which represents job count for fixed rate)
      } else if (sheet.work_types.rate_type === 'hourly' && rates.hourly_rate) {
        return total + (rates.hourly_rate * sheet.hours);
      }
      return total;
    }, 0);
  };

  return (
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
        {timesheets.map((sheet) => (
          <TimesheetTableRow
            key={sheet.id}
            {...sheet}
            workTypeRates={workTypeRates}
          />
        ))}
        <TableRow className="font-bold">
          <TableCell colSpan={4} className="text-right">
            Monthly Total:
          </TableCell>
          <TableCell className="text-right text-green-600">
            ${calculateMonthlyTotal(timesheets).toFixed(2)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};