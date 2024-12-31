import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExpenseFormProps {
  onExpenseAdded: () => void;
  expense?: any;
}

export const ExpenseForm = ({ onExpenseAdded, expense }: ExpenseFormProps) => {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      amount: expense?.amount || "",
      description: expense?.description || "",
      expense_date: expense?.expense_date || new Date().toISOString().split("T")[0],
      receipt: null as File | null,
    },
  });

  const handleSubmit = async (values: any) => {
    try {
      let receipt_path = expense?.receipt_path;
      let original_filename = expense?.original_filename;

      if (values.receipt) {
        const file = values.receipt;
        original_filename = file.name;
        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("expense_receipts")
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        receipt_path = fileName;
      }

      const expenseData = {
        amount: values.amount,
        description: values.description,
        expense_date: values.expense_date,
        receipt_path,
        original_filename,
        staff_id: (await supabase.auth.getUser()).data.user?.id,
      };

      if (expense) {
        const { error } = await supabase
          .from("expenses")
          .update(expenseData)
          .eq("id", expense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("expenses").insert(expenseData);
        if (error) throw error;
      }

      toast({
        title: `Expense ${expense ? "updated" : "created"} successfully`,
      });
      onExpenseAdded();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expense_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receipt"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Receipt</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {expense?.receipt_path && (
          <div className="text-sm text-gray-500">
            Current receipt: {expense.original_filename || expense.receipt_path}
          </div>
        )}

        <Button type="submit">
          {expense ? "Update Expense" : "Create Expense"}
        </Button>
      </form>
    </Form>
  );
};