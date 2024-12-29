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
    console.log('Work Type Rates:', workTypeRates);
    
    const totals = timesheets.map(timesheet => {
      const rates = workTypeRates[timesheet.work_type_id];
      const isFixedRate = timesheet.work_types.rate_type === 'fixed';
      const rate = isFixedRate ? rates?.fixed_rate : rates?.hourly_rate;
      
      console.group(`Entry Calculation for ${timesheet.work_types.name}`);
      console.log({
        workTypeId: timesheet.work_type_id,
        date: timesheet.work_date,
        workType: timesheet.work_types.name,
        rateType: timesheet.work_types.rate_type,
        availableRates: rates,
        selectedRate: rate,
        isFixedRate,
        hours: timesheet.hours,
        total: rate ? rate * timesheet.hours : 0
      });

      if (!rates) {
        console.warn(`No rates found for work type: ${timesheet.work_type_id}`, {
          workTypeName: timesheet.work_types.name,
          expectedRateType: timesheet.work_types.rate_type
        });
        console.groupEnd();
        return 0;
      }

      if (!rate) {
        console.warn(`Missing ${isFixedRate ? 'fixed' : 'hourly'} rate for work type:`, {
          workTypeName: timesheet.work_types.name,
          workTypeId: timesheet.work_type_id,
          availableRates: rates
        });
        console.groupEnd();
        return 0;
      }

      const total = rate * timesheet.hours;
      console.log(`Calculated total: $${total.toFixed(2)}`);
      console.groupEnd();
      return total;
    });

    console.log('All Entry Totals:', totals);
    console.groupEnd();
    return totals;
  }, [timesheets, workTypeRates]);

  // Memoize total calculation
  const total = useMemo(() => {
    const finalTotal = entryTotals.reduce((sum, entryTotal) => sum + entryTotal, 0);
    console.log('Final Monthly Total:', {
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