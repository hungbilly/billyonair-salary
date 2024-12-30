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

interface TimesheetRow {
  'Date': string;
  'Time': string;
  'Work Type': string;
  'Hours/Jobs': number;
  'Rate': number;
  'Entry Total': number;
}

export const TimesheetDownload = ({ 
  timesheets,
  workTypeRates 
}: TimesheetDownloadProps) => {
  const { toast } = useToast();

  const downloadTableData = (format: 'csv' | 'xlsx') => {
    // Create initial data with numeric values
    const data: TimesheetRow[] = timesheets.map(timesheet => {
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
        'Hours/Jobs': Number(timesheet.hours),
        'Rate': Number(rate),
        'Entry Total': Number(entryTotal)
      };
    });

    const monthTotal = timesheets.reduce((total: number, timesheet) =>
      total + calculateEntryTotal(timesheet, workTypeRates), 0);

    // Create workbook and worksheet with numeric data
    const ws = XLSX.utils.json_to_sheet(data);

    // Add the monthly total row after the worksheet is created
    const totalRowIndex = data.length + 1;
    XLSX.utils.sheet_add_json(ws, [{
      'Date': '',
      'Time': '',
      'Work Type': '',
      'Hours/Jobs': null,
      'Rate': 'Monthly Total',
      'Entry Total': Number(monthTotal)
    }], { skipHeader: true, origin: totalRowIndex });

    // Format the Rate and Entry Total columns
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; R++) {
      const rateCell = ws[XLSX.utils.encode_cell({ r: R, c: 4 })];
      const totalCell = ws[XLSX.utils.encode_cell({ r: R, c: 5 })];
      
      if (rateCell) {
        if (R === range.e.r) {
          rateCell.v = 'Monthly Total';
          rateCell.t = 's';
        } else if (typeof rateCell.v === 'number') {
          rateCell.z = '"$"#,##0.00';
          const currentTimesheet = timesheets[R];
          if (currentTimesheet && currentTimesheet.work_types.rate_type === 'hourly') {
            rateCell.z += '"/hr"';
          }
        }
      }

      if (totalCell && typeof totalCell.v === 'number') {
        totalCell.z = '"$"#,##0.00';
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');

    // Download file with appropriate format
    if (format === 'xlsx') {
      XLSX.writeFile(wb, 'timesheet.xlsx');
    } else {
      // For CSV, use simpler options that are supported by the types
      const csvOptions = {
        bookType: 'csv' as const,
        bookSST: false,
        type: 'binary' as const
      };
      XLSX.writeFile(wb, 'timesheet.csv', csvOptions);
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