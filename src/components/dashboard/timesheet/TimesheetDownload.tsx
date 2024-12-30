import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from 'xlsx';
import { useToast } from "@/components/ui/use-toast";
import { calculateEntryTotal } from "../utils/timesheetCalculations";

interface Timesheet {
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

interface TimesheetDownloadProps {
  timesheets: Timesheet[];
  workTypeRates: Record<string, { hourly_rate?: number; fixed_rate?: number; }>;
}

export const TimesheetDownload = ({ 
  timesheets,
  workTypeRates 
}: TimesheetDownloadProps) => {
  const { toast } = useToast();

  const downloadTableData = (format: 'csv' | 'xlsx') => {
    const data = timesheets.map(timesheet => {
      const entryTotal = calculateEntryTotal(timesheet, workTypeRates);
      const rate = timesheet.work_types.name === "Other" && timesheet.custom_rate
        ? timesheet.custom_rate
        : (timesheet.work_types.rate_type === 'fixed'
          ? workTypeRates[timesheet.work_type_id]?.fixed_rate || 0
          : workTypeRates[timesheet.work_type_id]?.hourly_rate || 0);

      return {
        'Date': new Date(timesheet.work_date).toLocaleDateString(),
        'Time': timesheet.work_types.name === "Other" ? "N/A" :
          (timesheet.start_time && timesheet.end_time ?
            `${timesheet.start_time} - ${timesheet.end_time}` : "N/A"),
        'Work Type': timesheet.work_types.name === "Other" && timesheet.description
          ? `Other: ${timesheet.description}`
          : timesheet.work_types.name,
        'Hours/Jobs': timesheet.hours,
        'Rate': rate,
        'Entry Total': entryTotal
      };
    });

    const monthTotal = timesheets.reduce((total: number, timesheet: Timesheet) =>
      total + calculateEntryTotal(timesheet, workTypeRates), 0 as number);

    data.push({
      'Date': '',
      'Time': '',
      'Work Type': '',
      'Hours/Jobs': '',
      'Rate': 'Monthly Total',
      'Entry Total': monthTotal
    });

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);

    // Format the Rate and Entry Total columns to show as currency
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; R++) {
      const rateCell = ws[XLSX.utils.encode_cell({ r: R, c: 4 })]; // Rate column
      const totalCell = ws[XLSX.utils.encode_cell({ r: R, c: 5 })]; // Entry Total column
      
      if (rateCell && typeof rateCell.v === 'number') {
        rateCell.z = '$#,##0.00';
      }
      if (totalCell && typeof totalCell.v === 'number') {
        totalCell.z = '$#,##0.00';
      }
    }

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

  return (
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
  );
};