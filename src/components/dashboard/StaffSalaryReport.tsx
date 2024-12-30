import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface WorkTypeAssignment {
  hourly_rate: number | null;
  fixed_rate: number | null;
}

interface Timesheet {
  id: string;
  work_date: string;
  hours: number;
  work_types: {
    name: string;
    rate_type: 'fixed' | 'hourly';
    work_type_assignments: WorkTypeAssignment[];
  };
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  expense_date: string;
}

export const StaffSalaryReport = () => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  const { data: staffList } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "staff")
        .order("full_name");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: salaryData } = useQuery({
    queryKey: ["staff-salary", selectedStaffId],
    queryFn: async () => {
      if (!selectedStaffId) return null;

      const { data: timesheets, error: timesheetsError } = await supabase
        .from("timesheets")
        .select(`
          *,
          work_types (
            name,
            rate_type,
            work_type_assignments (
              hourly_rate,
              fixed_rate
            )
          )
        `)
        .eq("employee_id", selectedStaffId)
        .order("work_date", { ascending: false });

      if (timesheetsError) throw timesheetsError;

      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("staff_id", selectedStaffId)
        .order("expense_date", { ascending: false });

      if (expensesError) throw expensesError;

      return {
        timesheets: timesheets || [],
        expenses: expenses || []
      };
    },
    enabled: !!selectedStaffId
  });

  const calculateTotalSalary = () => {
    if (!salaryData?.timesheets) return 0;
    
    return salaryData.timesheets.reduce((total, timesheet) => {
      const assignments = timesheet.work_types.work_type_assignments;
      if (!assignments || assignments.length === 0) return total;

      const assignment = assignments[0];
      if (!assignment) return total;

      if (timesheet.work_types.rate_type === 'fixed') {
        return total + (assignment.fixed_rate || 0) * timesheet.hours;
      } else {
        return total + (assignment.hourly_rate || 0) * timesheet.hours;
      }
    }, 0);
  };

  const calculateTotalExpenses = () => {
    if (!salaryData?.expenses) return 0;
    return salaryData.expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Staff Salary Report</h2>
        <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select staff member" />
          </SelectTrigger>
          <SelectContent>
            {staffList?.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.full_name || staff.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStaffId && salaryData && (
        <div className="grid gap-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  ${calculateTotalSalary().toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  ${calculateTotalExpenses().toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Net Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${
                  calculateTotalSalary() - calculateTotalExpenses() >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  ${(calculateTotalSalary() - calculateTotalExpenses()).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Timesheets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salaryData.timesheets.slice(0, 5).map((timesheet) => {
                    const assignment = timesheet.work_types.work_type_assignments[0];
                    return (
                      <div key={timesheet.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{timesheet.work_types.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(timesheet.work_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${((assignment?.hourly_rate || assignment?.fixed_rate || 0) * timesheet.hours).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salaryData.expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(expense.expense_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <p className="font-medium">${expense.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};