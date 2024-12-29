import { useMemo } from 'react';

interface Timesheet {
  id: string;
  work_date: string;
  hours: number;
  work_types: {
    name: string;
    rate_type: 'fixed' | 'hourly';
  };
  work_type_id: string;
}

interface WorkTypeRates {
  [key: string]: {
    hourly_rate?: number;
    fixed_rate?: number;
  };
}

export const useSalaryCalculations = (
  timesheets: Timesheet[],
  workTypeRates: WorkTypeRates
) => {
  // Memoize entry totals calculation
  const entryTotals = useMemo(() => {
    return timesheets.map(timesheet => {
      const rates = workTypeRates[timesheet.work_type_id];
      const isFixedRate = timesheet.work_types.rate_type === 'fixed';
      const rate = isFixedRate ? rates?.fixed_rate : rates?.hourly_rate;
      
      if (!rate) return 0;

      return isFixedRate 
        ? rate * timesheet.hours // For fixed rate, multiply by number of jobs
        : rate * timesheet.hours; // For hourly rate, multiply by hours worked
    });
  }, [timesheets, workTypeRates]);

  // Memoize total calculation
  const total = useMemo(() => {
    return entryTotals.reduce((sum, entryTotal) => sum + entryTotal, 0);
  }, [entryTotals]);

  return {
    entryTotals,
    total,
  };
};