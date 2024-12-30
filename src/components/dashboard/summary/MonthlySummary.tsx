import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfYear, endOfYear, startOfMonth, endOfMonth } from "date-fns";
import { YearSelector } from "./YearSelector";
import { MonthlyStats } from "./MonthlyStats";
import { useState } from "react";

interface WorkTypeAssignment {
  work_type_id: string;
  hourly_rate: number | null;
  fixed_rate: number | null;
}

interface TimesheetData {
  id: string;
  hours: number;
  work_types: {
    name: string;
    rate_type: 'fixed' | 'hourly';
  };
  created_at: string;
  custom_rate: number | null;
  description: string | null;
  employee_id: string;
  end_time: string | null;
  start_time: string | null;
  updated_at: string;
  work_date: string;
  work_type_id: string;
}

interface Timesheet extends TimesheetData {
  work_type_assignments: WorkTypeAssignment[];
}

export const MonthlySummary = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const years = [currentYear - 1, currentYear];

  const { data: yearData, isLoading } = useQuery({
    queryKey: ["timesheets", selectedYear],
    queryFn: async () => fetchYearData(selectedYear)
  });

  const fetchYearData = async (year: number) => {
    const startDate = startOfYear(new Date(year, 0));
    const endDate = endOfYear(new Date(year, 0));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: assignments } = await supabase
      .from('work_type_assignments')
      .select('work_type_id, hourly_rate, fixed_rate')
      .eq('staff_id', user.id);

    const { data: timesheets } = await supabase
      .from("timesheets")
      .select(`
        *,
        work_types (
          name,
          rate_type
        )
      `)
      .eq("employee_id", user.id)
      .gte("work_date", startDate.toISOString())
      .lte("work_date", endDate.toISOString());

    const { data: expenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("staff_id", user.id)
      .gte("expense_date", startDate.toISOString())
      .lte("expense_date", endDate.toISOString());

    return {
      timesheets: timesheets?.map(timesheet => ({
        ...timesheet,
        work_type_assignments: assignments?.filter(
          assignment => assignment.work_type_id === timesheet.work_type_id
        ) || []
      })) as Timesheet[],
      expenses: expenses || []
    };
  };

  const calculateTotalSalary = (timesheets: Timesheet[]) => {
    if (!timesheets) return 0;
    
    return timesheets.reduce((total, timesheet) => {
      if (timesheet.work_types.name === "Other" && timesheet.custom_rate) {
        return total + (timesheet.custom_rate * timesheet.hours);
      }

      const assignment = timesheet.work_type_assignments[0];
      if (!assignment) return total;

      if (timesheet.work_types.rate_type === 'fixed') {
        return total + (assignment.fixed_rate || 0) * timesheet.hours;
      } else {
        return total + (assignment.hourly_rate || 0) * timesheet.hours;
      }
    }, 0);
  };

  const calculateTotalExpenses = (expenses: any[]) => {
    if (!expenses) return 0;
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const renderMonthSummary = (month: number) => {
    if (!yearData) return null;

    const monthStart = startOfMonth(new Date(selectedYear, month));
    const monthEnd = endOfMonth(monthStart);

    const monthTimesheets = yearData.timesheets.filter(
      timesheet => {
        const date = new Date(timesheet.work_date);
        return date >= monthStart && date <= monthEnd;
      }
    );

    const monthExpenses = yearData.expenses.filter(
      expense => {
        const date = new Date(expense.expense_date);
        return date >= monthStart && date <= monthEnd;
      }
    );

    const totalSalary = calculateTotalSalary(monthTimesheets);
    const totalExpenses = calculateTotalExpenses(monthExpenses);
    const netAmount = totalSalary + totalExpenses;

    return (
      <MonthlyStats
        totalSalary={totalSalary}
        totalExpenses={totalExpenses}
        netAmount={netAmount}
        date={monthStart}
        showTitle={month === 0} // Only show titles for January
      />
    );
  };

  return (
    <div className="space-y-8">
      <YearSelector
        years={years}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />
      <div className="space-y-8">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i}>
            {renderMonthSummary(i)}
          </div>
        ))}
      </div>
    </div>
  );
};