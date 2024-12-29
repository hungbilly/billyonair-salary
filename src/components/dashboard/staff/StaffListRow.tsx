import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { StaffEditDialog } from "./StaffEditDialog";
import { StaffWorkTypeRates } from "./StaffWorkTypeRates";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface StaffListRowProps {
  user: any;
  onDelete: (userId: string) => void;
  onUpdate: () => void;
  isSelected: boolean;
  onSelect: () => void;
}

export const StaffListRow = ({ user, onDelete, onUpdate, isSelected, onSelect }: StaffListRowProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [workTypeRates, setWorkTypeRates] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchWorkTypeRates = async () => {
    try {
      console.log("Fetching work type rates for user:", user.id);
      const { data, error } = await supabase
        .from("work_type_assignments")
        .select(`
          *,
          work_types (
            name,
            rate_type
          )
        `)
        .eq('staff_id', user.id);

      if (error) throw error;
      console.log("Fetched work type rates:", data);
      setWorkTypeRates(data || []);
    } catch (error: any) {
      console.error("Error fetching work type rates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch work type rates",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isSelected) {
      fetchWorkTypeRates();
    }
  }, [isSelected, user.id]);

  return (
    <>
      <TableRow 
        className="cursor-pointer hover:bg-muted/50"
        onClick={onSelect}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <ChevronRight 
              className={`h-4 w-4 transition-transform ${
                isSelected ? 'rotate-90' : ''
              }`}
            />
            {user.full_name || "Not set"}
          </div>
        </TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.phone_number || "Not set"}</TableCell>
        <TableCell>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(user.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isSelected && (
        <TableRow>
          <TableCell colSpan={4}>
            <StaffWorkTypeRates
              workTypeRates={workTypeRates}
              staffId={user.id}
              onRatesChange={fetchWorkTypeRates}
            />
          </TableCell>
        </TableRow>
      )}
      <StaffEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={user}
        onUpdate={onUpdate}
      />
    </>
  );
};