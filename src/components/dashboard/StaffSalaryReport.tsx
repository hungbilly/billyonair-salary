import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalaryReportHeader } from "./salary-report/SalaryReportHeader";
import { TimesheetHistory } from "./salary-report/TimesheetHistory";
import { ExpenseHistory } from "./salary-report/ExpenseHistory";

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

  const { data: salaryData, refetch } = useQuery({
    queryKey: ["staff-salary", selectedStaffId],
    queryFn: async () => {
      if (!selectedStaffId) return null;

      console.log("Fetching salary data for staff:", selectedStaffId);

      // First, get the work type assignments for this staff member
      const { data: assignments, error: assignmentsError } = await supabase
        .from("work_type_assignments")
        .select("work_type_id, hourly_rate, fixed_rate")
        .eq("staff_id", selectedStaffId);

      if (assignmentsError) {
        console.error("Error fetching assignments:", assignmentsError);
        throw assignmentsError;
      }

      console.log("Staff work type assignments:", assignments);

      // Then fetch timesheets with work types
      const { data: timesheets, error: timesheetsError } = await supabase
        .from("timesheets")
        .select(`
          id,
          work_date,
          hours,
          start_time,
          end_time,
          description,
          custom_rate,
          work_type_id,
          work_types (
            id,
            name,
            rate_type
          )
        `)
        .eq("employee_id", selectedStaffId)
        .order("work_date", { ascending: false });

      if (timesheetsError) {
        console.error("Error fetching timesheets:", timesheetsError);
        throw timesheetsError;
      }

      console.log("Fetched timesheets:", timesheets);

      // Combine timesheets with their assignments
      const timesheetsWithRates = timesheets?.map((timesheet: any) => ({
        ...timesheet,
        work_types: {
          ...timesheet.work_types,
          work_type_assignments: [
            assignments?.find((a: any) => a.work_type_id === timesheet.work_type_id) || 
            { hourly_rate: null, fixed_rate: null }
          ]
        }
      }));

      console.log("Timesheets with rates:", timesheetsWithRates);

      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("staff_id", selectedStaffId)
        .order("expense_date", { ascending: false });

      if (expensesError) throw expensesError;

      return {
        timesheets: timesheetsWithRates || [],
        expenses: expenses || []
      };
    },
    enabled: !!selectedStaffId
  });

  const calculateTotalSalary = () => {
    if (!salaryData?.timesheets) return 0;
    
    return salaryData.timesheets.reduce((total, timesheet) => {
      if (timesheet.work_types.name === "Other" && timesheet.custom_rate) {
        return total + (timesheet.custom_rate * timesheet.hours);
      }

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

  const workTypeRates = salaryData?.timesheets.reduce((acc: Record<string, any>, timesheet) => {
    const assignments = timesheet.work_types.work_type_assignments;
    if (assignments && assignments.length > 0) {
      acc[timesheet.work_type_id] = {
        hourly_rate: assignments[0].hourly_rate,
        fixed_rate: assignments[0].fixed_rate,
      };
    }
    return acc;
  }, {}) || {};

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
        <div className="space-y-6">
          <SalaryReportHeader 
            totalSalary={calculateTotalSalary()}
            totalExpenses={calculateTotalExpenses()}
          />
          
          <div className="grid gap-6">
            <TimesheetHistory 
              timesheets={salaryData.timesheets}
              workTypeRates={workTypeRates}
              onTimesheetUpdated={refetch}
            />
            
            <ExpenseHistory 
              expenses={salaryData.expenses}
              onExpenseUpdated={refetch}
            />
          </div>
        </div>
      )}
    </div>
  );
};