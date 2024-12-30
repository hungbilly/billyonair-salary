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
import { useState, useEffect } from "react";
import { TimesheetForm } from "./TimesheetForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { TimesheetDownload } from "./timesheet/TimesheetDownload";
import { calculateEntryTotal } from "./utils/timesheetCalculations";

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

interface MonthlyTableProps {
  timesheets: Timesheet[];
  workTypeRates: Record<string, { hourly_rate?: number; fixed_rate?: number; }>;
  onTimesheetUpdated: () => void;
}

export const MonthlyTable = ({ 
  timesheets, 
  workTypeRates, 
  onTimesheetUpdated 
}: MonthlyTableProps) => {
  const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(null);
  const [workTypes, setWorkTypes] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkTypes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
          .from("work_types")
          .select(`
            id,
            name,
            rate_type,
            work_type_assignments!inner (
              hourly_rate,
              fixed_rate
            )
          `)
          .eq("work_type_assignments.staff_id", user.id);

        if (error) throw error;
        console.log('MonthlyTable - Fetched work types:', data);
        setWorkTypes(data || []);
      } catch (error: any) {
        console.error('Error fetching work types:', error);
        toast({
          title: "Error",
          description: "Failed to load work types",
          variant: "destructive",
        });
      }
    };

    fetchWorkTypes();
  }, [toast]);

  const monthTotal = timesheets.reduce((total, timesheet) => 
    total + calculateEntryTotal(timesheet, workTypeRates), 0);

  return (
    <>
      <TimesheetDownload 
        timesheets={timesheets}
        workTypeRates={workTypeRates}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Work Type</TableHead>
            <TableHead className="text-right">Hours/Jobs</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead className="text-right">Entry Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timesheets.map((timesheet) => (
            <TimesheetTableRow
              key={timesheet.id}
              {...timesheet}
              rate={workTypeRates[timesheet.work_type_id]}
              rateType={timesheet.work_types.rate_type}
              onDelete={onTimesheetUpdated}
              onEdit={setEditingTimesheet}
            />
          ))}
          <TableRow className="font-bold">
            <TableCell colSpan={5} className="text-right">
              Monthly Total:
            </TableCell>
            <TableCell className="text-right text-green-600">
              ${monthTotal.toFixed(2)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>

      <Dialog open={!!editingTimesheet} onOpenChange={() => setEditingTimesheet(null)}>
        <DialogContent className="max-w-[800px] w-[95vw] h-[90vh] overflow-y-auto">
          {editingTimesheet && (
            <TimesheetForm
              workTypes={workTypes}
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