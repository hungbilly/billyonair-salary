import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MonthlyExpense {
  month: string;
  expenses: any[];
  total: number;
}

export const ExpenseList = () => {
  const { data: expenses = [] } = useQuery({
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

  const downloadReceipt = async (receiptPath: string, description: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("expense_receipts")
        .download(receiptPath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${description}.${receiptPath.split(".").pop()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading receipt:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "default";
    }
  };

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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthGroup.expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {format(new Date(expense.expense_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>${expense.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(expense.status)}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {expense.receipt_path && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              downloadReceipt(expense.receipt_path, expense.description)
                            }
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};