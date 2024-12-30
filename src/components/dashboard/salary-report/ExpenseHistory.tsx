import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseList } from "../expense/ExpenseList";

interface ExpenseHistoryProps {
  expenses: any[];
  onExpenseUpdated: () => void;
}

export const ExpenseHistory = ({ expenses, onExpenseUpdated }: ExpenseHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense History</CardTitle>
      </CardHeader>
      <CardContent>
        <ExpenseList 
          expenses={expenses} 
          onExpenseUpdated={onExpenseUpdated}
        />
      </CardContent>
    </Card>
  );
};