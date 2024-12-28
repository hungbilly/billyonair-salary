import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const AssignWorkTypeDialog = ({ workType, onAssigned }: { workType: any; onAssigned?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [rate, setRate] = useState<string>("");
  const { toast } = useToast();

  const fetchStaffList = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "staff");

      if (error) throw error;
      setStaffList(data || []);
    } catch (error: any) {
      console.error("Error fetching staff:", error);
      toast({
        title: "Error",
        description: "Failed to fetch staff list",
        variant: "destructive",
      });
    }
  };

  const handleAssign = async () => {
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

      const { error } = await supabase.from("work_type_assignments").insert({
        work_type_id: workType.id,
        staff_id: selectedStaff,
        [workType.rate_type === "hourly" ? "hourly_rate" : "fixed_rate"]: rateValue,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work type assigned successfully",
      });

      setIsOpen(false);
      setSelectedStaff("");
      setRate("");
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
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Staff Member</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.full_name || staff.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{workType.rate_type === "hourly" ? "Hourly Rate" : "Fixed Rate"}</Label>
            <Input
              type="number"
              placeholder="Enter rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
          <Button onClick={handleAssign} className="w-full">
            Assign Work Type
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};