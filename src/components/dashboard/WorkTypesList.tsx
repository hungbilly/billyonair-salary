import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { WorkTypesTable } from "./WorkTypesTable";
import { WorkType } from "./types";

export const WorkTypesList = () => {
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
      const { error } = await supabase
        .from("work_types")
        .update({ name })
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
    onError: (error) => {
      console.error("Error updating work type:", error);
      toast({
        title: "Error",
        description: "Failed to update work type. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteWorkTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting work type:", id);
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
    onError: (error) => {
      console.error("Error deleting work type:", error);
      toast({
        title: "Error",
        description: "Failed to delete work type. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading work types...</div>;
  }

  if (error) {
    console.error("Error loading work types:", error);
    return <div>Error loading work types</div>;
  }

  const handleUpdateWorkType = (id: string, name: string) => {
    console.log("Handling update work type:", { id, name });
    updateWorkTypeMutation.mutate({ id, name });
  };

  const handleDeleteWorkType = (id: string) => {
    console.log("Handling delete work type:", id);
    if (confirm("Are you sure you want to delete this work type?")) {
      deleteWorkTypeMutation.mutate(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work Types
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <WorkTypesTable
          workTypes={workTypes as WorkType[]}
          onEdit={handleUpdateWorkType}
          onDelete={handleDeleteWorkType}
        />
      </CardContent>
    </Card>
  );
};