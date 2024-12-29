import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { calculateSalary } from "@/utils/salary";

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
}

const formatTime = (time: string | null): string => {
  if (!time) return '-';
  return format(new Date(`2000-01-01T${time}`), 'hh:mm a');
};

export const TimesheetTableRow = ({
  work_date,
  hours,
  start_time,
  end_time,
  work_types,
  work_type_id,
  workTypeRates,
}: TimesheetTableRowProps) => {
  const rates = workTypeRates[work_type_id];
  
  const salary = calculateSalary(
    hours,
    work_types.rate_type,
    rates
  );

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
        {hours} {work_types.rate_type === 'fixed' ? 'job(s)' : 'hour(s)'}
      </TableCell>
      <TableCell className="text-right text-green-600">
        ${salary.toFixed(2)}
      </TableCell>
    </TableRow>
  );
};