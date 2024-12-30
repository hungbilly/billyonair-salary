import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { EmployerDashboard } from "@/components/dashboard/EmployerDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/Logo";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<"admin" | "employer" | "staff" | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session);
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createProfile = async (userId: string, userEmail: string): Promise<"admin" | "employer" | "staff"> => {
    try {
      // First try to get the profile again to handle race conditions
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (existingProfile) {
        console.log("Profile already exists:", existingProfile);
        return existingProfile.role;
      }

      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: userEmail,
          role: "staff" as const,
        });

      if (insertError) throw insertError;
      
      console.log("Created new profile with role: staff");
      return "staff";
    } catch (error: any) {
      console.error("Error creating profile:", error);
      throw error;
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching user role for:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("role, email")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      console.log("User profile data:", data);

      if (!data) {
        // Profile doesn't exist, create it
        const userEmail = session?.user?.email;
        if (!userEmail) {
          throw new Error("User email not found");
        }
        
        const role = await createProfile(userId, userEmail);
        setUserRole(role);
      } else {
        console.log("Setting user role to:", data.role);
        setUserRole(data.role);
      }
    } catch (error: any) {
      console.error("Error fetching user role:", error);
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
      <div className="min-h-screen bg-gray-50 p-8">
        <Logo />
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-32 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Logo />
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