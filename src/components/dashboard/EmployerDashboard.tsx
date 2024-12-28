import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Users, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { WorkTypesList } from "./WorkTypesList";

export const EmployerDashboard = () => {
  const [newWorkTypeName, setNewWorkTypeName] = useState("");
  const [isAddingWorkType, setIsAddingWorkType] = useState(false);
  const { toast } = useToast();

  const handleAddWorkType = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("No user found");

      const { error } = await supabase.from("work_types").insert({
        name: newWorkTypeName,
        created_by: userData.user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work type added successfully",
      });

      setNewWorkTypeName("");
      setIsAddingWorkType(false);
    } catch (error: any) {
      console.error("Error adding work type:", error);
      toast({
        title: "Error",
        description: "Failed to add work type",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>
        <Dialog open={isAddingWorkType} onOpenChange={setIsAddingWorkType}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Work Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Work Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Work Type Name"
                value={newWorkTypeName}
                onChange={(e) => setNewWorkTypeName(e.target.value)}
              />
              <Button onClick={handleAddWorkType} disabled={!newWorkTypeName}>
                Add Work Type
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">164</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
          </CardContent>
        </Card>
      </div>

      <WorkTypesList />
    </div>
  );
};