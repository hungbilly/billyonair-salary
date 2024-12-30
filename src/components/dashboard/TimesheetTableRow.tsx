import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { DeleteTimesheetDialog } from "./timesheet/DeleteTimesheetDialog";
import { useState } from "react";

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
  custom_rate?: number | null;
  description?: string | null;
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
  custom_rate,
  description,
  onDelete,
  onEdit
}: TimesheetTableRowProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  console.log('TimesheetTableRow - Props received:', {
    id,
    work_type_id,
    work_type_name: work_types.name,
    rateType,
    rate,
    custom_rate,
    description,
    hours
  });

  const formatTimeRange = () => {
    if (work_types.name === "Other") return "N/A";
    if (!start_time && !end_time) return "N/A";
    
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
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

  const calculateEntryTotal = () => {
    console.log('Rate calculation details:', {
      work_type_id,
      work_type_name: work_types.name,
      rate_type: rateType,
      isFixedRate: rateType === 'fixed',
      rates: rate,
      rate: rateType === 'fixed' ? rate.fixed_rate : rate.hourly_rate,
      custom_rate
    });

    if (work_types.name === "Other" && custom_rate) {
      const total = custom_rate * hours;
      console.log('Custom rate calculation:', {
        custom_rate,
        hours,
        total
      });
      return total;
    }

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

  const formatWorkTypeName = () => {
    if (work_types.name === "Other" && description) {
      return `Other: ${description}`;
    }
    return work_types.name;
  };

  const entryTotal = calculateEntryTotal();

  return (
    <>
      <TableRow>
        <TableCell>{format(new Date(work_date), 'MMM d, yyyy')}</TableCell>
        <TableCell>{formatTimeRange()}</TableCell>
        <TableCell>{formatWorkTypeName()}</TableCell>
        <TableCell className="text-right">{hours}</TableCell>
        <TableCell className="text-right">
          ${work_types.name === "Other" && custom_rate 
            ? custom_rate.toFixed(2) 
            : (rateType === 'fixed' ? rate.fixed_rate?.toFixed(2) : rate.hourly_rate?.toFixed(2))}
          {rateType === 'hourly' && '/hr'}
        </TableCell>
        <TableCell className="text-right">${entryTotal.toFixed(2)}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onEdit({
                  id,
                  work_date,
                  hours,
                  start_time,
                  end_time,
                  work_types,
                  work_type_id,
                  custom_rate,
                  description
                });
              }}
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

      {showDeleteDialog && (
        <DeleteTimesheetDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirmDelete={onDelete}
          timesheetId={id}
        />
      )}
    </>
  );
};