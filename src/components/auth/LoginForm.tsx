import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateInputs = () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const clearSession = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.log("Error clearing session:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    setLoading(true);
    
    try {
      await clearSession();

      console.log("Attempting login with email:", email);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Login error:", authError);
        
        if (authError.message.includes("session_not_found")) {
          await clearSession();
        }
        
        toast({
          title: "Login Failed",
          description: "Username or password is incorrect",
          variant: "destructive",
        });
        return;
      }

      if (authData?.user) {
        // Fetch the user's profile to get their role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          toast({
            title: "Error",
            description: "Failed to fetch user role",
            variant: "destructive",
          });
          return;
        }

        // Update the auth session with the user's role
        const { data: { session }, error: updateError } = await supabase.auth.setSession({
          ...authData,
          user: {
            ...authData.user,
            role: profileData.role // Add role from profiles table
          }
        });

        if (updateError) {
          console.error("Error updating session:", updateError);
          return;
        }

        console.log("Login successful for user:", authData.user.email, "with role:", profileData?.role);
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      }
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      await clearSession();
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          TimeSheet Login
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};