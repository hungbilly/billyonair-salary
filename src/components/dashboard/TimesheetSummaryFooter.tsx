interface TimesheetSummaryFooterProps {
  totalSalary: number;
}

export const TimesheetSummaryFooter = ({ 
  totalSalary 
}: TimesheetSummaryFooterProps) => {
  return (
    <div className="flex justify-between pt-4 border-t">
      <div>
        <p className="font-medium">Total Salary:</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-green-600">${totalSalary.toFixed(2)}</p>
      </div>
    </div>
  );
};