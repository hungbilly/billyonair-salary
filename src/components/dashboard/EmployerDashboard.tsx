import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DashboardCards } from "./DashboardCards";
import { CreateWorkTypeDialog } from "./CreateWorkTypeDialog";
import { CreateUserDialog } from "./CreateUserDialog";
import { UserManagement } from "./UserManagement";
import { WorkTypesList } from "./WorkTypesList";
import { StaffList } from "./StaffList";
import { StaffSalaryReport } from "./StaffSalaryReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const EmployerDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-3xl font-bold">{currentUser?.full_name || 'Employer'}</h1>
        </div>
        <div className="flex gap-2">
          <CreateUserDialog onUserCreated={fetchUsers} />
          <CreateWorkTypeDialog />
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
        </div>
      </div>

      <DashboardCards
        totalUsers={users.length}
        activeStaffCount={users.filter((user) => user.role === "staff").length}
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="salary-report">Salary Report</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <StaffList users={users} />
            <WorkTypesList />
          </div>
          <UserManagement users={users} onUserUpdated={fetchUsers} />
        </TabsContent>
        <TabsContent value="salary-report">
          <StaffSalaryReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};