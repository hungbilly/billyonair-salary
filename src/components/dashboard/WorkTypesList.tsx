import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const WorkTypesList = () => {
  const { data: workTypes, isLoading } = useQuery({
    queryKey: ["workTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_types")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading work types...</div>;
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