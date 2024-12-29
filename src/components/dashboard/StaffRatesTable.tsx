import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const StaffRatesTable = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("work_type_assignments")
        .select(`
          *,
          work_types (
            name,
            rate_type
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Fetched assignments:", data);
      setAssignments(data || []);
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch assignments",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Work Type Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Work Type</TableHead>
              <TableHead>Rate Type</TableHead>
              <TableHead>Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  {assignment.profiles.full_name || assignment.profiles.email}
                </TableCell>
                <TableCell>{assignment.work_types.name}</TableCell>
                <TableCell className="capitalize">
                  {assignment.work_types.rate_type}
                </TableCell>
                <TableCell>
                  ${assignment.work_types.rate_type === 'hourly' 
                    ? assignment.hourly_rate 
                    : assignment.fixed_rate}
                  {assignment.work_types.rate_type === 'hourly' ? '/hour' : ' fixed'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};