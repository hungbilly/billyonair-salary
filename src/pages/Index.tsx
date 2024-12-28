import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { EmployerDashboard } from "@/components/dashboard/EmployerDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<"admin" | "employer" | "staff" | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setUserRole(data.role);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch user role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {!session ? (
          <div className="flex justify-center items-center min-h-[80vh]">
            <LoginForm />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-end mb-4">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
            {userRole === "admin" ? (
              <AdminDashboard />
            ) : userRole === "employer" ? (
              <EmployerDashboard />
            ) : (
              <StaffDashboard />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;