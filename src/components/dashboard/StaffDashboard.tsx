import { useState, useEffect } from "react";
import { TimesheetForm } from "./TimesheetForm";
import { MonthlySubmissions } from "./MonthlySubmissions";
import { ExpenseList } from "./expense/ExpenseList";
import { ProfileManagement } from "./profile/ProfileManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

export const StaffDashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const [workTypeRates, setWorkTypeRates] = useState<Record<string, { hourly_rate?: number; fixed_rate?: number; }>>({});

  // Fetch work types for the current user
  const { data: workTypes = [] } = useQuery({
    queryKey: ["workTypes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("work_types")
        .select(`
          *,
          work_type_assignments!inner (
            hourly_rate,
            fixed_rate
          )
        `)
        .eq("work_type_assignments.staff_id", user.id);

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch timesheets for the current user
  const { data: timesheets = [], refetch: refetchTimesheets } = useQuery({
    queryKey: ["timesheets"],
    queryFn: async () => {
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
      return data || [];
    }
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchWorkTypeRates();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setCurrentUser(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
    }
  };

  const fetchWorkTypeRates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('work_type_assignments')
        .select('work_type_id, hourly_rate, fixed_rate')
        .eq('staff_id', user.id);

      if (error) throw error;

      const ratesMap = data.reduce((acc: Record<string, { hourly_rate?: number; fixed_rate?: number; }>, curr) => {
        acc[curr.work_type_id] = {
          hourly_rate: curr.hourly_rate,
          fixed_rate: curr.fixed_rate,
        };
        return acc;
      }, {});

      setWorkTypeRates(ratesMap);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch work type rates",
        variant: "destructive",
      });
    }
  };

  const handleTimesheetUpdate = () => {
    refetchTimesheets();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {currentUser?.full_name || 'Staff Member'}</h1>
        <p className="text-muted-foreground">Manage your timesheets and expenses</p>
      </div>

      <Tabs defaultValue="timesheets">
        <TabsList>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="timesheets">
          <div className="space-y-6">
            <TimesheetForm 
              workTypes={workTypes} 
              onTimesheetAdded={handleTimesheetUpdate}
            />
            <MonthlySubmissions 
              timesheets={timesheets}
              workTypeRates={workTypeRates}
              onTimesheetUpdated={handleTimesheetUpdate}
            />
          </div>
        </TabsContent>
        <TabsContent value="expenses">
          <ExpenseList />
        </TabsContent>
        <TabsContent value="profile">
          {currentUser && <ProfileManagement user={currentUser} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};