import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { WorkTypeRateDialog } from "./WorkTypeRateDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface StaffWorkTypeRatesProps {
  workTypeRates: any[];
  staffId: string;
  onRatesChange: () => void;
}

export const StaffWorkTypeRates = ({ workTypeRates, staffId, onRatesChange }: StaffWorkTypeRatesProps) => {
  const [editingRate, setEditingRate] = useState<any>(null);
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteRate = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from("work_type_assignments")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rate deleted successfully",
      });
      onRatesChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Work Type Rates</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingRate(null);
            setIsRateDialogOpen(true);
          }}
        >
          Add Rate
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work Type</TableHead>
            <TableHead>Rate Type</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Actions</TableHead>
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
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingRate(assignment);
                        setIsRateDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteRate(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No work type rates assigned yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <WorkTypeRateDialog
        isOpen={isRateDialogOpen}
        onOpenChange={setIsRateDialogOpen}
        staffId={staffId}
        assignment={editingRate}
        onSave={onRatesChange}
      />
    </div>
  );
};