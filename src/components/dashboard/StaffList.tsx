import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { StaffListHeader } from "./staff/StaffListHeader";
import { StaffListRow } from "./staff/StaffListRow";

interface StaffListProps {
  users: any[];
}

export const StaffList = ({ users }: StaffListProps) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();
  const staffUsers = users.filter((user) => user.role === "staff");

  const handleDelete = async (userId: string) => {
    try {
      // First, delete all work type assignments for this user
      const { error: assignmentsError } = await supabase
        .from("work_type_assignments")
        .delete()
        .eq("staff_id", userId);

      if (assignmentsError) throw assignmentsError;

      // Then delete the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      });

      window.location.reload();
    } catch (error: any) {
      console.error("Error deleting staff member:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (user: any) => {
    setSelectedUser(selectedUser?.id === user.id ? null : user);
  };

  return (
    <Card className="col-span-2">
      <StaffListHeader />
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffUsers.map((user) => (
              <StaffListRow
                key={user.id}
                user={user}
                onDelete={handleDelete}
                onUpdate={() => window.location.reload()}
                isSelected={selectedUser?.id === user.id}
                onSelect={() => handleRowClick(user)}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};