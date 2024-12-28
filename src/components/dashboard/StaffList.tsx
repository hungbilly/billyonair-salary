import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

interface StaffListProps {
  users: any[];
}

export const StaffList = ({ users }: StaffListProps) => {
  const staffUsers = users.filter((user) => user.role === "staff");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff List
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name || "Not set"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone_number || "Not set"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};