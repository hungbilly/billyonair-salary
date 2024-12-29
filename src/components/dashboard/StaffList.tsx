import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Pencil, Trash2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface StaffListProps {
  users: any[];
}

export const StaffList = ({ users }: StaffListProps) => {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [workTypeRates, setWorkTypeRates] = useState<any[]>([]);
  const { toast } = useToast();
  const staffUsers = users.filter((user) => user.role === "staff");

  useEffect(() => {
    if (selectedUser) {
      fetchWorkTypeRates();
    }
  }, [selectedUser]);

  const fetchWorkTypeRates = async () => {
    try {
      const { data, error } = await supabase
        .from("work_type_assignments")
        .select(`
          *,
          work_types (
            name,
            rate_type
          )
        `)
        .eq('staff_id', selectedUser.id);

      if (error) throw error;
      setWorkTypeRates(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch work type rates",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFullName(user.full_name || "");
    setPhoneNumber(user.phone_number || "");
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      });

      // Refresh the page to update the list
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });

      setIsDialogOpen(false);
      // Refresh the page to update the list
      window.location.reload();
    } catch (error: any) {
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffUsers.map((user) => (
              <>
                <TableRow 
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(user)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <ChevronRight 
                        className={`h-4 w-4 transition-transform ${
                          selectedUser?.id === user.id ? 'rotate-90' : ''
                        }`}
                      />
                      {user.full_name || "Not set"}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone_number || "Not set"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(user);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(user.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {selectedUser?.id === user.id && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Work Type Rates</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Work Type</TableHead>
                              <TableHead>Rate Type</TableHead>
                              <TableHead>Rate</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {workTypeRates.length > 0 ? (
                              workTypeRates.map((assignment) => (
                                <TableRow key={assignment.id}>
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
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                  No work type rates assigned
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <Button onClick={handleUpdate} className="w-full">
                Update Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};