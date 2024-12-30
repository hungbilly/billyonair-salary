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
    <Card className="h-[80px]">
      {title && (
        <CardHeader className="py-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={!title ? 'pt-4' : 'py-2'}>
        <p className={`text-lg font-bold ${colorClass}`}>
          ${amount.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(date, "yyyy")}
        </p>
      </CardContent>
    </Card>
  );
};