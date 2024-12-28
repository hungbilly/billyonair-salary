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

export const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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

      <div className="grid gap-6 md:grid-cols-2">
        <StaffList users={users} />
        <WorkTypesList />
      </div>

      <UserManagement users={users} onUserUpdated={fetchUsers} />
    </div>
  );
};