import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkType } from "@/components/dashboard/types";

export const useWorkTypes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workTypes, isLoading, error } = useQuery({
    queryKey: ["workTypes"],
    queryFn: async () => {
      console.log("Fetching work types...");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      console.log("Current user:", user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");
      console.log("User role:", profile.role);

      if (profile.role === "employer" || profile.role === "admin") {
        const { data, error } = await supabase
          .from("work_types")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching work types:", error);
          throw error;
        }
        console.log("Fetched work types:", data);
        return data;
      }

      const { data, error } = await supabase
        .from("work_types")
        .select(`
          *,
          work_type_assignments!inner (
            hourly_rate,
            fixed_rate
          )
        `)
        .eq("work_type_assignments.staff_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching work types:", error);
        throw error;
      }
      console.log("Fetched work types:", data);
      return data;
    },
  });

  const updateWorkTypeMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      console.log("Updating work type:", { id, name });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("work_types")
        .update({ 
          name,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workTypes"] });
      toast({
        title: "Success",
        description: "Work type updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating work type:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update work type. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteWorkTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting work type:", id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("work_types")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workTypes"] });
      toast({
        title: "Success",
        description: "Work type deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting work type:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete work type. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    workTypes,
    isLoading,
    error,
    updateWorkType: updateWorkTypeMutation.mutate,
    deleteWorkType: deleteWorkTypeMutation.mutate,
  };
};