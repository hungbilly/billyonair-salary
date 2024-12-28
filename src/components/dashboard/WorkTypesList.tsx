import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const WorkTypesList = () => {
  const { data: workTypes, isLoading, error } = useQuery({
    queryKey: ["workTypes"],
    queryFn: async () => {
      console.log("Fetching work types...");
      
      // First get the user's profile to check their role
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

      // If user is an employer or admin, fetch all work types
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

      // If user is staff, fetch only assigned work types
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

  if (isLoading) {
    return <div>Loading work types...</div>;
  }

  if (error) {
    console.error("Error loading work types:", error);
    return <div>Error loading work types</div>;
  }

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {workTypes?.map((workType) => (
              <TableRow key={workType.id}>
                <TableCell>{workType.name}</TableCell>
                <TableCell className="capitalize">{workType.rate_type}</TableCell>
                <TableCell>{new Date(workType.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};