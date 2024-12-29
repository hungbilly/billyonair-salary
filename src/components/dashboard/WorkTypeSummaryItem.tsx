import { WorkTypeRates } from "./types";

interface WorkTypeSummaryItemProps {
  name: string;
  totalHours: number;
  workTypeId: string;
  workTypeRates: WorkTypeRates;
}

export const WorkTypeSummaryItem = ({ 
  name, 
  totalHours, 
  workTypeId, 
  workTypeRates 
}: WorkTypeSummaryItemProps) => {
  const rates = workTypeRates[workTypeId];
  const isFixedRate = rates?.fixed_rate != null;
  
  const calculateSalary = (): number | null => {
    if (!rates) return null;
    if (rates.hourly_rate) return totalHours * rates.hourly_rate;
    if (rates.fixed_rate) {
      // For fixed rate, multiply the rate by the number of entries (totalHours represents the count for fixed rate)
      return rates.fixed_rate * totalHours;
    }
    return null;
  };

  const salary = calculateSalary();

  return (
    <div className="flex flex-col space-y-2 p-4 border rounded">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{name}</p>
          {rates && (
            <p className="text-sm text-muted-foreground">
              Rate: {rates.hourly_rate ? 
                `$${rates.hourly_rate}/hour` : 
                rates.fixed_rate ? 
                `$${rates.fixed_rate} fixed` : 
                'Not set'}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold">
            {totalHours} {isFixedRate ? 'jobs' : 'hours'}
          </p>
          {salary !== null && (
            <p className="text-sm font-medium text-green-600">
              ${salary.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};