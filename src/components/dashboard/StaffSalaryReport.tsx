import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalaryReportHeader } from "./salary-report/SalaryReportHeader";
import { TimesheetHistory } from "./salary-report/TimesheetHistory";
import { ExpenseHistory } from "./salary-report/ExpenseHistory";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStaffSalaryData } from "@/hooks/useStaffSalaryData";

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

  const { data: salaryData, refetch } = useStaffSalaryData(selectedStaffId);

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