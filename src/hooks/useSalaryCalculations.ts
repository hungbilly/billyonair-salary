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
    console.group('Calculating Entry Totals');
    const totals = timesheets.map(timesheet => {
      const rates = workTypeRates[timesheet.work_type_id];
      const isFixedRate = timesheet.work_types.rate_type === 'fixed';
      const rate = isFixedRate ? rates?.fixed_rate : rates?.hourly_rate;
      
      console.log('Entry Calculation:', {
        date: timesheet.work_date,
        workType: timesheet.work_types.name,
        rateType: isFixedRate ? 'fixed' : 'hourly',
        rate: rate || 0,
        hours: timesheet.hours,
        total: rate ? rate * timesheet.hours : 0
      });

      if (!rate) {
        console.warn('No rate found for work type:', timesheet.work_type_id);
        return 0;
      }

      return rate * timesheet.hours;
    });
    console.groupEnd();
    return totals;
  }, [timesheets, workTypeRates]);

  // Memoize total calculation
  const total = useMemo(() => {
    const finalTotal = entryTotals.reduce((sum, entryTotal) => sum + entryTotal, 0);
    console.log('Final Total:', {
      entryTotals,
      total: finalTotal
    });
    return finalTotal;
  }, [entryTotals]);

  return {
    entryTotals,
    total,
  };
};