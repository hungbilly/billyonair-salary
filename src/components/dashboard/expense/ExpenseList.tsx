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
import { FileDown, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

interface MonthlyExpense {
  month: string;
  expenses: any[];
  total: number;
}

export const ExpenseList = () => {
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const { toast } = useToast();
  
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

  const handleDelete = async () => {
    if (!selectedExpense) return;

    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", selectedExpense);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      });
    } finally {
      setSelectedExpense(null);
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

  const getFileName = (path: string) => {
    if (!path) return "";
    const parts = path.split("/");
    return parts[parts.length - 1];
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
                    <TableHead>Actions</TableHead>
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
                          <div className="flex flex-col gap-2">
                            <span className="text-sm text-gray-500">
                              {getFileName(expense.receipt_path)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                downloadReceipt(expense.receipt_path, expense.description)
                              }
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement edit functionality
                              toast({
                                title: "Info",
                                description: "Edit functionality coming soon",
                              });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedExpense(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AlertDialog open={!!selectedExpense} onOpenChange={() => setSelectedExpense(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this expense entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};