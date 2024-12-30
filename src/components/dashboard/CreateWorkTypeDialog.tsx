import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const CreateWorkTypeDialog = () => {
  const [workTypeName, setWorkTypeName] = useState("");
  const [description, setDescription] = useState("");
  const [rateType, setRateType] = useState<"hourly" | "fixed">("hourly");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const createWorkType = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("work_types")
        .insert({
          name: workTypeName,
          rate_type: rateType,
          created_by: userData.user.id,
          description: description || null,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work type created successfully",
      });

      setWorkTypeName("");
      setDescription("");
      setRateType("hourly");
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Work Type
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Work Type</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workTypeName">Work Type Name</Label>
            <Input
              id="workTypeName"
              value={workTypeName}
              onChange={(e) => setWorkTypeName(e.target.value)}
              placeholder="Enter work type name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter work type description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rateType">Rate Type</Label>
            <Select value={rateType} onValueChange={(value: "hourly" | "fixed") => setRateType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select rate type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={createWorkType} className="w-full">
            Create Work Type
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};