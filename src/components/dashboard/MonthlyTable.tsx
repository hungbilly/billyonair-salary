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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const calculateEntryTotal = (timesheet: Timesheet) => {
    if (timesheet.work_types.name === "Other" && timesheet.custom_rate) {
      return timesheet.custom_rate * timesheet.hours;
    }

    const rates = workTypeRates[timesheet.work_type_id];
    const rate = timesheet.work_types.rate_type === 'fixed' 
      ? rates?.fixed_rate 
      : rates?.hourly_rate;
    
    return rate ? rate * timesheet.hours : 0;
  };

  const downloadTableData = (format: 'csv' | 'xlsx') => {
    // Prepare the data
    const data = timesheets.map(timesheet => {
      const entryTotal = calculateEntryTotal(timesheet);
      const rate = timesheet.work_types.name === "Other" && timesheet.custom_rate 
        ? timesheet.custom_rate 
        : (timesheet.work_types.rate_type === 'fixed' 
          ? workTypeRates[timesheet.work_type_id]?.fixed_rate 
          : workTypeRates[timesheet.work_type_id]?.hourly_rate);

      return {
        'Date': new Date(timesheet.work_date).toLocaleDateString(),
        'Time': timesheet.work_types.name === "Other" ? "N/A" : 
          (timesheet.start_time && timesheet.end_time ? 
            `${timesheet.start_time} - ${timesheet.end_time}` : "N/A"),
        'Work Type': timesheet.work_types.name === "Other" && timesheet.description
          ? `Other: ${timesheet.description}`
          : timesheet.work_types.name,
        'Hours/Jobs': timesheet.hours,
        'Rate': `$${rate?.toFixed(2)}${timesheet.work_types.rate_type === 'hourly' ? '/hr' : ''}`,
        'Entry Total': `$${entryTotal.toFixed(2)}`
      };
    });

    // Add monthly total row
    const monthTotal = timesheets.reduce((total, timesheet) => total + calculateEntryTotal(timesheet), 0);
    data.push({
      'Date': '',
      'Time': '',
      'Work Type': '',
      'Hours/Jobs': '',
      'Rate': 'Monthly Total:',
      'Entry Total': `$${monthTotal.toFixed(2)}`
    });

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');

    // Download file
    if (format === 'xlsx') {
      XLSX.writeFile(wb, 'timesheet.xlsx');
    } else {
      XLSX.writeFile(wb, 'timesheet.csv');
    }

    toast({
      title: "Success",
      description: `Timesheet exported as ${format.toUpperCase()}`,
    });
  };

  const monthTotal = timesheets.reduce((total, timesheet) => {
    const rates = workTypeRates[timesheet.work_type_id];
    
    console.log('MonthlyTable - Processing timesheet entry:', {
      id: timesheet.id,
      workTypeName: timesheet.work_types.name,
      workTypeId: timesheet.work_type_id,
      hours: timesheet.hours,
      rateType: timesheet.work_types.rate_type,
      workTypes: timesheet.work_types,
      availableRates: rates,
      custom_rate: timesheet.custom_rate
    });

    if (timesheet.work_types.name === "Other" && timesheet.custom_rate) {
      const entryTotal = timesheet.custom_rate * timesheet.hours;
      console.log('MonthlyTable - Custom rate calculation:', {
        custom_rate: timesheet.custom_rate,
        hours: timesheet.hours,
        entryTotal,
        runningTotal: total + entryTotal
      });
      return total + entryTotal;
    }

    const rate = timesheet.work_types.rate_type === 'fixed' 
      ? rates?.fixed_rate 
      : rates?.hourly_rate;
    
    const entryTotal = rate ? rate * timesheet.hours : 0;
    
    console.log('MonthlyTable - Rate calculation:', {
      rateType: timesheet.work_types.rate_type,
      isFixedRate: timesheet.work_types.rate_type === 'fixed',
      selectedRate: rate,
      fixedRate: rates?.fixed_rate,
      hourlyRate: rates?.hourly_rate,
      hours: timesheet.hours,
      entryTotal,
      runningTotal: total + entryTotal
    });

    return total + entryTotal;
  }, 0);

  return (
    <>
      <div className="flex justify-end mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => downloadTableData('csv')}>
              Download as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadTableData('xlsx')}>
              Download as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
          {timesheets.map((timesheet) => {
            console.log('MonthlyTable - Rendering row:', {
              id: timesheet.id,
              workType: timesheet.work_types,
              rateType: timesheet.work_types.rate_type,
              custom_rate: timesheet.custom_rate
            });
            
            return (
              <TimesheetTableRow
                key={timesheet.id}
                {...timesheet}
                rate={workTypeRates[timesheet.work_type_id]}
                rateType={timesheet.work_types.rate_type}
                onDelete={onTimesheetUpdated}
                onEdit={setEditingTimesheet}
              />
            );
          })}
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
