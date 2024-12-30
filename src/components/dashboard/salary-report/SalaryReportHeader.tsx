import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalaryReportHeaderProps {
  totalSalary: number;
  totalExpenses: number;
}

export const SalaryReportHeader = ({ totalSalary, totalExpenses }: SalaryReportHeaderProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Salary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">
            ${totalSalary.toFixed(2)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-600">
            ${totalExpenses.toFixed(2)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Net Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${
            totalSalary - totalExpenses >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            ${(totalSalary - totalExpenses).toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};