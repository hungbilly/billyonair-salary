import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { DeleteExpenseDialog } from "./DeleteExpenseDialog";
import { EditExpenseDialog } from "./EditExpenseDialog";
import { ExpenseRow } from "./ExpenseRow";
import { format } from "date-fns";

interface MonthlyExpense {
  month: string;
  expenses: any[];
  total: number;
}

export const ExpenseList = () => {
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  
  const { data: expenses = [], refetch } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const groupExpensesByMonth = (expenses: any[]): MonthlyExpense[] => {
    const grouped = expenses.reduce((acc: { [key: string]: MonthlyExpense }, expense) => {
      const monthKey = format(new Date(expense.expense_date), "MMMM yyyy");
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          expenses: [],
          total: 0
        };
      }
      
      acc[monthKey].expenses.push(expense);
      acc[monthKey].total += Number(expense.amount);
      
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const monthlyExpenses = groupExpensesByMonth(expenses);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Expense History</h2>
      <Accordion type="single" collapsible className="w-full">
        {monthlyExpenses.map((monthGroup) => (
          <AccordionItem value={monthGroup.month} key={monthGroup.month}>
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex justify-between w-full pr-4">
                <span>{monthGroup.month}</span>
                <span className="text-green-600">
                  ${monthGroup.total.toFixed(2)}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthGroup.expenses.map((expense) => (
                    <ExpenseRow
                      key={expense.id}
                      expense={expense}
                      onEdit={setEditingExpense}
                      onDelete={setSelectedExpense}
                    />
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <DeleteExpenseDialog
        expenseId={selectedExpense}
        onOpenChange={() => setSelectedExpense(null)}
        onDelete={refetch}
      />

      <EditExpenseDialog
        expense={editingExpense}
        isOpen={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
        onUpdate={refetch}
      />
    </div>
  );
};