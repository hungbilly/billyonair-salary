import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TimesheetTableRow } from "./TimesheetTableRow";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { TimesheetForm } from "./TimesheetForm";

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
  onTimesheetUpdated: () => void;
}

export const MonthlyTable = ({ timesheets, workTypeRates, onTimesheetUpdated }: MonthlyTableProps) => {
  const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(null);

  const calculateMonthlyTotal = (sheets: Timesheet[]): number => {
    return sheets.reduce((total, sheet) => {
      const rates = workTypeRates[sheet.work_type_id];
      if (!rates) return total;

      if (sheet.work_types.rate_type === 'fixed' && rates.fixed_rate) {
        return total + (rates.fixed_rate * sheet.hours);
      } else if (sheet.work_types.rate_type === 'hourly' && rates.hourly_rate) {
        return total + (rates.hourly_rate * sheet.hours);
      }
      return total;
    }, 0);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Work Type</TableHead>
            <TableHead className="text-right">Hours/Jobs</TableHead>
            <TableHead className="text-right">Salary</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timesheets.map((sheet) => (
            <TimesheetTableRow
              key={sheet.id}
              {...sheet}
              workTypeRates={workTypeRates}
              onDelete={onTimesheetUpdated}
              onEdit={setEditingTimesheet}
            />
          ))}
          <TableRow className="font-bold">
            <TableCell colSpan={4} className="text-right">
              Monthly Total:
            </TableCell>
            <TableCell className="text-right text-green-600">
              ${calculateMonthlyTotal(timesheets).toFixed(2)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>

      <Dialog open={!!editingTimesheet} onOpenChange={() => setEditingTimesheet(null)}>
        <DialogContent className="max-w-2xl">
          {editingTimesheet && (
            <TimesheetForm
              workTypes={[]}
              onTimesheetAdded={() => {
                onTimesheetUpdated();
                setEditingTimesheet(null);
              }}
              editingTimesheet={editingTimesheet}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};