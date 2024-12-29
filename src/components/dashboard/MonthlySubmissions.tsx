import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MonthlyTable } from "./MonthlyTable";
import { calculateSalary } from "@/utils/salary";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  const calculateMonthlyTotal = (sheets: Timesheet[]): number => {
    return sheets.reduce((total, sheet) => {
      const rates = workTypeRates[sheet.work_type_id];
      const salary = calculateSalary(
        sheet.hours,
        sheet.work_types.rate_type,
        rates
      );
      return total + salary;
    }, 0);
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
            <MonthlyTable timesheets={sheets} workTypeRates={workTypeRates} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};