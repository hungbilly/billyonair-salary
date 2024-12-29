import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface WorkTypeRateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string;
  assignment?: any;
  onSave: () => void;
}

export const WorkTypeRateDialog = ({ 
  isOpen, 
  onOpenChange, 
  staffId, 
  assignment, 
  onSave 
}: WorkTypeRateDialogProps) => {
  const [workTypes, setWorkTypes] = useState<any[]>([]);
  const [selectedWorkType, setSelectedWorkType] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchWorkTypes();
      if (assignment) {
        setSelectedWorkType(assignment.work_type_id);
        setRate(assignment.work_types.rate_type === 'hourly' 
          ? assignment.hourly_rate?.toString() 
          : assignment.fixed_rate?.toString());
      } else {
        setSelectedWorkType("");
        setRate("");
      }
    }
  }, [isOpen, assignment]);

  const fetchWorkTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("work_types")
        .select("*");

      if (error) throw error;
      setWorkTypes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      if (!selectedWorkType || !rate) {
        toast({
          title: "Error",
          description: "Please select a work type and enter a rate",
          variant: "destructive",
        });
        return;
      }

      const workType = workTypes.find(wt => wt.id === selectedWorkType);
      if (!workType) return;

      const rateValue = parseFloat(rate);
      if (isNaN(rateValue)) {
        toast({
          title: "Error",
          description: "Please enter a valid rate",
          variant: "destructive",
        });
        return;
      }

      if (assignment) {
        const { error } = await supabase
          .from("work_type_assignments")
          .update({
            [workType.rate_type === "hourly" ? "hourly_rate" : "fixed_rate"]: rateValue,
          })
          .eq("id", assignment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("work_type_assignments")
          .insert({
            work_type_id: selectedWorkType,
            staff_id: staffId,
            [workType.rate_type === "hourly" ? "hourly_rate" : "fixed_rate"]: rateValue,
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Rate ${assignment ? 'updated' : 'added'} successfully`,
      });

      onOpenChange(false);
      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{assignment ? 'Edit' : 'Add'} Work Type Rate</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Work Type</Label>
            <Select 
              value={selectedWorkType} 
              onValueChange={setSelectedWorkType}
              disabled={!!assignment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select work type" />
              </SelectTrigger>
              <SelectContent>
                {workTypes.map((workType) => (
                  <SelectItem key={workType.id} value={workType.id}>
                    {workType.name} ({workType.rate_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rate</Label>
            <Input
              type="number"
              placeholder="Enter rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            {assignment ? 'Update' : 'Add'} Rate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};