import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useStaffList = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchStaffList = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      
      if (profile.role !== 'employer' && profile.role !== 'admin') {
        throw new Error("Only employers can assign work types");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "staff");

      if (error) throw error;
      setStaffList(data || []);
    } catch (error: any) {
      console.error("Error fetching staff:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch staff list",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return { staffList, fetchStaffList };
};