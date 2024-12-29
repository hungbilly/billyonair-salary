import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MonthlyTable } from "./MonthlyTable";
import { useSalaryCalculations } from "@/hooks/useSalaryCalculations";

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
  onTimesheetUpdated: () => void;
}

export const MonthlySubmissions = ({ 
  timesheets, 
  workTypeRates, 
  onTimesheetUpdated 
}: MonthlySubmissionsProps) => {
  // Group timesheets by month
  const monthlyTimesheets = timesheets.reduce((acc: Record<string, Timesheet[]>, timesheet) => {
    const monthKey = format(new Date(timesheet.work_date), "MMMM yyyy");
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(timesheet);
    return acc;
  }, {});

  return (
    <Accordion type="single" collapsible className="w-full">
      {Object.entries(monthlyTimesheets).map(([month, sheets]) => {
        const { total: monthTotal } = useSalaryCalculations(sheets, workTypeRates);
        return (
          <AccordionItem value={month} key={month}>
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex justify-between w-full pr-4">
                <span>{month}</span>
                <span className="text-green-600">
                  ${monthTotal.toFixed(2)}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <MonthlyTable 
                timesheets={sheets} 
                workTypeRates={workTypeRates} 
                onTimesheetUpdated={onTimesheetUpdated}
              />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};