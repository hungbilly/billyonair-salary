import { useState, useEffect } from "react";
import { TimesheetForm } from "./TimesheetForm";
import { MonthlySubmissions } from "./MonthlySubmissions";
import { ExpenseList } from "./expense/ExpenseList";
import { ProfileManagement } from "./profile/ProfileManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { WorkType, Timesheet, WorkTypeRates } from "./types";
import { ExpenseForm } from "./expense/ExpenseForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StaffDashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const [workTypeRates, setWorkTypeRates] = useState<WorkTypeRates>({});

  const { data: workTypes = [] } = useQuery<WorkType[]>({
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
      return (data || []).map(workType => ({
        ...workType,
        rate_type: workType.rate_type as 'fixed' | 'hourly'
      }));
    }
  });

  // Fetch timesheets for the current user
  const { data: timesheets = [], refetch: refetchTimesheets } = useQuery<Timesheet[]>({
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
      return (data || []).map(timesheet => ({
        ...timesheet,
        work_types: {
          ...timesheet.work_types,
          rate_type: timesheet.work_types.rate_type as 'fixed' | 'hourly'
        }
      }));
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

      const ratesMap = data.reduce((acc: WorkTypeRates, curr) => {
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

  const handleExpenseAdded = () => {
    // This will trigger a refetch of the expense list
    window.location.reload();
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseForm onExpenseAdded={handleExpenseAdded} />
              </CardContent>
            </Card>
            <ExpenseList />
          </div>
        </TabsContent>
        <TabsContent value="profile">
          {currentUser && <ProfileManagement user={currentUser} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};
