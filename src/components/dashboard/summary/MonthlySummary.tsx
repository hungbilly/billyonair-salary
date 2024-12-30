import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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
  const currentDate = new Date();
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  const { data: timesheets, isLoading: isLoadingTimesheets } = useQuery({
    queryKey: ["timesheets", format(startDate, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First, get the work type assignments for the user
      const { data: assignments, error: assignmentsError } = await supabase
        .from('work_type_assignments')
        .select('work_type_id, hourly_rate, fixed_rate')
        .eq('staff_id', user.id);

      if (assignmentsError) throw assignmentsError;

      // Then get the timesheets with work types
      const { data, error } = await supabase
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

      if (error) throw error;

      // Combine the data with proper typing
      const timesheetsWithRates: Timesheet[] = (data as TimesheetData[]).map(timesheet => ({
        ...timesheet,
        work_type_assignments: assignments.filter(
          assignment => assignment.work_type_id === timesheet.work_type_id
        )
      }));

      return timesheetsWithRates;
    }
  });

  const { data: expenses, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["expenses", format(startDate, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("staff_id", user.id)
        .gte("expense_date", startDate.toISOString())
        .lte("expense_date", endDate.toISOString());

      if (error) throw error;
      return data || [];
    }
  });

  const calculateTotalSalary = () => {
    if (!timesheets) return 0;
    
    return timesheets.reduce((total, timesheet) => {
      const assignment = timesheet.work_type_assignments[0];
      if (!assignment) return total;

      if (timesheet.work_types.rate_type === 'fixed') {
        return total + (assignment.fixed_rate || 0) * timesheet.hours;
      } else {
        return total + (assignment.hourly_rate || 0) * timesheet.hours;
      }
    }, 0);
  };

  const calculateTotalExpenses = () => {
    if (!expenses) return 0;
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  if (isLoadingTimesheets || isLoadingExpenses) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const totalSalary = calculateTotalSalary();
  const totalExpenses = calculateTotalExpenses();
  const netAmount = totalSalary + totalExpenses;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Salary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">
            ${totalSalary.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            For {format(startDate, "MMMM yyyy")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-600">
            ${totalExpenses.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            For {format(startDate, "MMMM yyyy")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Net Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netAmount.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            For {format(startDate, "MMMM yyyy")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};