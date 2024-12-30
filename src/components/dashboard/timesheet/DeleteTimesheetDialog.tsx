import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteTimesheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  timesheetId: string;
}

export const DeleteTimesheetDialog = ({
  open,
  onOpenChange,
  onConfirmDelete,
  timesheetId
}: DeleteTimesheetDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('timesheets')
        .delete()
        .eq('id', timesheetId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Timesheet entry deleted",
      });
      
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      onConfirmDelete();
    } catch (error: any) {
      console.error('Error deleting timesheet:', error);
      toast({
        title: "Error",
        description: "Failed to delete timesheet entry",
        variant: "destructive",
      });
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this timesheet entry.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};