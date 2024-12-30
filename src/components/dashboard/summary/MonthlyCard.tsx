import { Card, CardContent } from "@/components/ui/card";

interface MonthlyCardProps {
  amount: number;
  date: Date;
  colorClass?: string;
}

export const MonthlyCard = ({ amount, date, colorClass = "text-green-600" }: MonthlyCardProps) => {
  return (
    <Card className="h-[60px]">
      <CardContent className="pt-4">
        <p className={`text-lg font-bold ${colorClass}`}>
          ${amount.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
};