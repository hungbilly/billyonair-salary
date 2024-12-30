import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const previousMonth = subMonths(currentDate, 1);

  const { data: currentMonthData, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ["timesheets", format(currentDate, "yyyy-MM")],
    queryFn: async () => fetchMonthData(currentDate)
  });

  const { data: previousMonthData, isLoading: isLoadingPrevious } = useQuery({
    queryKey: ["timesheets", format(previousMonth, "yyyy-MM")],
    queryFn: async () => fetchMonthData(previousMonth)
  });

  const fetchMonthData = async (date: Date) => {
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

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

    // Also fetch expenses for the month
    const { data: monthExpenses, error: expensesError } = await supabase
      .from("expenses")
      .select("*")
      .eq("staff_id", user.id)
      .gte("expense_date", startDate.toISOString())
      .lte("expense_date", endDate.toISOString());

    if (expensesError) throw expensesError;

    return {
      timesheets: timesheetsWithRates,
      expenses: monthExpenses || []
    };
  };

  const calculateTotalSalary = (timesheets: Timesheet[]) => {
    if (!timesheets) return 0;
    
    return timesheets.reduce((total, timesheet) => {
      // Handle "Other" work type with custom rate
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

  if (isLoadingCurrent || isLoadingPrevious) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const renderMonthSummary = (data: any, date: Date) => {
    if (!data) return null;

    const totalSalary = calculateTotalSalary(data.timesheets);
    const totalExpenses = calculateTotalExpenses(data.expenses);
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
              For {format(date, "MMMM yyyy")}
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
              For {format(date, "MMMM yyyy")}
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
              For {format(date, "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Tabs defaultValue={format(currentDate, "yyyy-MM")}>
      <TabsList>
        <TabsTrigger value={format(currentDate, "yyyy-MM")}>
          {format(currentDate, "MMMM yyyy")}
        </TabsTrigger>
        <TabsTrigger value={format(previousMonth, "yyyy-MM")}>
          {format(previousMonth, "MMMM yyyy")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value={format(currentDate, "yyyy-MM")}>
        {renderMonthSummary(currentMonthData, currentDate)}
      </TabsContent>
      <TabsContent value={format(previousMonth, "yyyy-MM")}>
        {renderMonthSummary(previousMonthData, previousMonth)}
      </TabsContent>
    </Tabs>
  );
};