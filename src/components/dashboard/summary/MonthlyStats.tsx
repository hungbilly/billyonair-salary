import { MonthlyCard } from "./MonthlyCard";

interface MonthlyStatsProps {
  totalSalary: number;
  totalExpenses: number;
  netAmount: number;
  date: Date;
}

export const MonthlyStats = ({ totalSalary, totalExpenses, netAmount, date }: MonthlyStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MonthlyCard
        title="Total Salary"
        amount={totalSalary}
        date={date}
        colorClass="text-green-600"
      />
      <MonthlyCard
        title="Total Expenses"
        amount={totalExpenses}
        date={date}
        colorClass="text-blue-600"
      />
      <MonthlyCard
        title="Net Amount"
        amount={netAmount}
        date={date}
        colorClass={netAmount >= 0 ? 'text-green-600' : 'text-red-600'}
      />
    </div>
  );
};