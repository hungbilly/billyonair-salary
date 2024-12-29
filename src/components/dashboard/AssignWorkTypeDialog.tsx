import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AssignWorkTypeForm } from "./assign-work-type/AssignWorkTypeForm";
import { useStaffList } from "./assign-work-type/useStaffList";

export const AssignWorkTypeDialog = ({ workType, onAssigned }: { workType: any; onAssigned?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { staffList, fetchStaffList } = useStaffList();
  const { toast } = useToast();

  const handleAssign = async (selectedStaff: string, rate: string) => {
    try {
      if (!selectedStaff || !rate) {
        toast({
          title: "Error",
          description: "Please select a staff member and enter a rate",
          variant: "destructive",
        });
        return;
      }

      const rateValue = parseFloat(rate);
      if (isNaN(rateValue)) {
        toast({
          title: "Error",
          description: "Please enter a valid rate",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      
      if (profile.role !== 'employer' && profile.role !== 'admin') {
        throw new Error("Only employers can assign work types");
      }

      const { error: insertError } = await supabase
        .from("work_type_assignments")
        .insert({
          work_type_id: workType.id,
          staff_id: selectedStaff,
          [workType.rate_type === "hourly" ? "hourly_rate" : "fixed_rate"]: rateValue,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          toast({
            title: "Error",
            description: "This staff member is already assigned to this work type",
            variant: "destructive",
          });
          return;
        }
        throw insertError;
      }

      toast({
        title: "Success",
        description: "Work type assigned successfully",
      });

      setIsOpen(false);
      if (onAssigned) onAssigned();
    } catch (error: any) {
      console.error("Error assigning work type:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign work type",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) fetchStaffList();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Work Type to Staff</DialogTitle>
        </DialogHeader>
        <AssignWorkTypeForm 
          staffList={staffList}
          workType={workType}
          onSubmit={handleAssign}
        />
      </DialogContent>
    </Dialog>
  );
};