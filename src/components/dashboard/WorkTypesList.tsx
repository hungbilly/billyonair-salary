import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Briefcase, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const WorkTypesList = () => {
  const [editingWorkType, setEditingWorkType] = useState<{ id: string; name: string } | null>(null);
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
      const { error } = await supabase
        .from("work_types")
        .update({ name })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workTypes"] });
      toast({
        title: "Success",
        description: "Work type updated successfully",
      });
      setEditingWorkType(null);
    },
    onError: (error) => {
      console.error("Error updating work type:", error);
      toast({
        title: "Error",
        description: "Failed to update work type",
        variant: "destructive",
      });
    },
  });

  const deleteWorkTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("work_types")
        .delete()
        .eq("id", id);

      if (error) throw error;
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
        description: "Failed to delete work type",
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

  const handleUpdateWorkType = () => {
    if (!editingWorkType) return;
    updateWorkTypeMutation.mutate(editingWorkType);
  };

  const handleDeleteWorkType = (id: string) => {
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rate Type</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workTypes?.map((workType) => (
              <TableRow key={workType.id}>
                <TableCell>{workType.name}</TableCell>
                <TableCell className="capitalize">{workType.rate_type}</TableCell>
                <TableCell>{new Date(workType.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog open={editingWorkType?.id === workType.id} onOpenChange={(open) => !open && setEditingWorkType(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingWorkType({ id: workType.id, name: workType.name })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Work Type</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Work Type Name"
                            value={editingWorkType?.name || ""}
                            onChange={(e) => setEditingWorkType(prev => prev ? { ...prev, name: e.target.value } : null)}
                          />
                          <Button onClick={handleUpdateWorkType} disabled={!editingWorkType?.name}>
                            Update Work Type
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteWorkType(workType.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};