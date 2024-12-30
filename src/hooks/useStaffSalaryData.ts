import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStaffSalaryData = (selectedStaffId: string) => {
  return useQuery({
    queryKey: ["staff-salary", selectedStaffId],
    queryFn: async () => {
      if (!selectedStaffId) return null;

      console.log("Fetching salary data for staff:", selectedStaffId);

      // First, get the current user's role
      const { data: { user } } = await supabase.auth.getUser();
      const { data: currentUserProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role, email")
        .eq("id", user?.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }

      console.log("Current user role:", currentUserProfile?.role);

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
        .eq("employee_id", selectedStaffId);

      if (timesheetsError) {
        console.error("Error fetching timesheets:", timesheetsError);
        throw timesheetsError;
      }

      console.log("Raw timesheets data:", timesheets);

      // Get work type assignments for rates
      const { data: assignments, error: assignmentsError } = await supabase
        .from("work_type_assignments")
        .select("work_type_id, hourly_rate, fixed_rate")
        .eq("staff_id", selectedStaffId);

      if (assignmentsError) {
        console.error("Error fetching assignments:", assignmentsError);
        throw assignmentsError;
      }

      console.log("Staff work type assignments:", assignments);

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

      // Fetch expenses
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
};