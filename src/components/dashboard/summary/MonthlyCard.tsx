import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface MonthlyCardProps {
  title: string;
  amount: number;
  date: Date;
  colorClass?: string;
}

export const MonthlyCard = ({ title, amount, date, colorClass = "text-green-600" }: MonthlyCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${colorClass}`}>
          ${amount.toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground">
          For {format(date, "MMMM yyyy")}
        </p>
      </CardContent>
    </Card>
  );
};