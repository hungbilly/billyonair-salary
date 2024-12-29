import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { TimesheetForm } from "./TimesheetForm";
import { TimesheetSummary } from "./TimesheetSummary";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const StaffDashboard = () => {
  const [workTypes, setWorkTypes] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Convert fetchTimesheets to a query function
  const fetchTimesheets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

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
      .order("work_date", { ascending: false });

    if (error) throw error;
    console.log("Fetched Timesheets with rate_type:", data);
    return data || [];
  };

  // Use React Query for timesheets
  const { data: timesheets = [] } = useQuery({
    queryKey: ["timesheets"],
    queryFn: fetchTimesheets
  });

  const handleTimesheetUpdated = () => {
    console.log("Invalidating timesheets query...");
    queryClient.invalidateQueries({ queryKey: ["timesheets"] });
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      await Promise.all([
        fetchWorkTypes(),
        fetchCurrentUser()
      ]);
    };

    initializeDashboard();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user details:", error);
        throw error;
      }

      setCurrentUser(data);
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
    }
  };

  const fetchWorkTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("work_types")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching work types:", error);
        throw error;
      }

      setWorkTypes(data || []);
    } catch (error: any) {
      console.error("Error fetching work types:", error);
      toast({
        title: "Error",
        description: "Failed to fetch work types",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">
            {currentUser?.full_name || 'Staff Member'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back!
          </p>
        </div>
      </div>
      
      <TimesheetForm 
        workTypes={workTypes} 
        onTimesheetAdded={handleTimesheetUpdated} 
      />
      <TimesheetSummary 
        timesheets={timesheets} 
        onTimesheetUpdated={handleTimesheetUpdated}
      />
    </div>
  );
};