import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  workTypeRates: Record<string, { hourly_rate?: number; fixed_rate?: number; }>;
  onDelete: () => void;
  onEdit: (timesheet: TimesheetTableRowProps) => void;
}

const formatTime = (time: string | null): string => {
  if (!time) return '-';
  return format(new Date(`2000-01-01T${time}`), 'hh:mm a');
};

export const TimesheetTableRow = ({
  id,
  work_date,
  hours,
  start_time,
  end_time,
  work_types,
  work_type_id,
  workTypeRates,
  onDelete,
  onEdit,
}: TimesheetTableRowProps) => {
  const { toast } = useToast();
  const rates = workTypeRates[work_type_id];
  const isFixedRate = work_types.rate_type === 'fixed';
  const rate = isFixedRate ? rates?.fixed_rate : rates?.hourly_rate;

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('timesheets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });

      onDelete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    }
  };

  return (
    <TableRow>
      <TableCell>{format(new Date(work_date), "MMM d, yyyy")}</TableCell>
      <TableCell>
        {start_time && end_time ? (
          `${formatTime(start_time)} - ${formatTime(end_time)}`
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>{work_types.name}</TableCell>
      <TableCell className="text-right">
        {hours} {isFixedRate ? 'job(s)' : 'hour(s)'}
      </TableCell>
      <TableCell className="text-right">
        ${rate?.toFixed(2) || '0.00'}/{isFixedRate ? 'job' : 'hour'}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
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
              work_type_id,
              workTypeRates,
              onDelete,
              onEdit,
            })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};