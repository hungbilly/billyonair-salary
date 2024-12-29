import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface TimesheetTableRowProps {
  id: string;
  work_date: string;
  hours: number;
  start_time: string | null;
  end_time: string | null;
  work_types: {
    name: string;
    rate_type: 'fixed' | 'hourly';
  };
  work_type_id: string;
  rate: {
    hourly_rate?: number | null;
    fixed_rate?: number | null;
  };
  rateType: 'fixed' | 'hourly';
  onDelete: () => void;
  onEdit: (timesheet: any) => void;
}

export const TimesheetTableRow = ({
  id,
  work_date,
  hours,
  start_time,
  end_time,
  work_types,
  work_type_id,
  rate,
  rateType,
  onDelete,
  onEdit
}: TimesheetTableRowProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  console.log('TimesheetTableRow - Props received:', {
    id,
    work_type_id,
    work_type_name: work_types.name,
    rateType,
    rate,
    hours
  });

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('timesheets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Timesheet entry deleted",
      });
      onDelete();
    } catch (error: any) {
      console.error('Error deleting timesheet:', error);
      toast({
        title: "Error",
        description: "Failed to delete timesheet entry",
        variant: "destructive",
      });
    }
    setShowDeleteDialog(false);
  };

  const formatTimeRange = () => {
    if (!start_time && !end_time) return "N/A";
    
    const formatTime = (time: string) => {
      // Parse the time string (assuming format like "14:30:00")
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a'); // Format as "2:30 PM"
    };

    if (start_time && end_time) {
      return `${formatTime(start_time)} - ${formatTime(end_time)}`;
    } else if (start_time) {
      return formatTime(start_time);
    } else if (end_time) {
      return formatTime(end_time);
    }
    
    return "N/A";
  };

  // Calculate the entry total based on rate type and hours
  const calculateEntryTotal = () => {
    console.log('Rate calculation details:', {
      work_type_id,
      work_type_name: work_types.name,
      rate_type: rateType,
      isFixedRate: rateType === 'fixed',
      rates: rate,
      rate: rateType === 'fixed' ? rate.fixed_rate : rate.hourly_rate
    });

    if (rateType === 'fixed') {
      const total = (rate.fixed_rate || 0) * hours;
      console.log('Fixed rate calculation:', {
        fixed_rate: rate.fixed_rate,
        hours,
        total
      });
      return total;
    } else {
      const total = (rate.hourly_rate || 0) * hours;
      console.log('Hourly rate calculation:', {
        hourly_rate: rate.hourly_rate,
        hours,
        total
      });
      return total;
    }
  };

  const entryTotal = calculateEntryTotal();

  return (
    <>
      <TableRow>
        <TableCell>{format(new Date(work_date), 'MMM d, yyyy')}</TableCell>
        <TableCell>{formatTimeRange()}</TableCell>
        <TableCell>{work_types.name}</TableCell>
        <TableCell className="text-right">{hours}</TableCell>
        <TableCell className="text-right">
          ${rateType === 'fixed' ? rate.fixed_rate?.toFixed(2) : rate.hourly_rate?.toFixed(2)}
          {rateType === 'hourly' && '/hr'}
        </TableCell>
        <TableCell className="text-right">${entryTotal.toFixed(2)}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit({
                id,
                work_date,
                hours,
                start_time,
                end_time,
                work_types,
                work_type_id
              })}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
    </>
  );
};