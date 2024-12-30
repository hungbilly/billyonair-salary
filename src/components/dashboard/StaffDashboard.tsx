import { useState, useEffect } from "react";
import { TimesheetForm } from "./TimesheetForm";
import { MonthlySubmissions } from "./MonthlySubmissions";
import { ExpenseList } from "./expense/ExpenseList";
import { ProfileManagement } from "./profile/ProfileManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const StaffDashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
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
            <TimesheetForm />
            <MonthlySubmissions />
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