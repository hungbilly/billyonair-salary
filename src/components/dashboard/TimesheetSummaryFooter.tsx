interface TimesheetSummaryFooterProps {
  totalHours: number;
  totalSalary: number;
}

export const TimesheetSummaryFooter = ({ 
  totalHours, 
  totalSalary 
}: TimesheetSummaryFooterProps) => {
  return (
    <div className="flex justify-between pt-4 border-t">
      <div className="space-y-1">
        <p className="font-medium">Total Hours/Jobs:</p>
        <p className="font-medium">Total Salary:</p>
      </div>
      <div className="text-right space-y-1">
        <p className="font-bold">{totalHours}</p>
        <p className="font-bold text-green-600">${totalSalary.toFixed(2)}</p>
      </div>
    </div>
  );
};