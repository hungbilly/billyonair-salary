import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface ExpenseRowProps {
  expense: any;
  onEdit: (expense: any) => void;
  onDelete: (id: string) => void;
}

export const ExpenseRow = ({ expense, onEdit, onDelete }: ExpenseRowProps) => {
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

  return (
    <TableRow>
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
            onClick={() => onEdit(expense)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(expense.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};