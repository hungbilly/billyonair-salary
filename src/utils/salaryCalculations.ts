interface WorkTypeRate {
  hourly_rate?: number;
  fixed_rate?: number;
}

export const calculateSalaryForTimesheet = (
  hours: number,
  rateType: 'fixed' | 'hourly',
  rates?: WorkTypeRate
): number => {
  console.log('Calculating salary with:', { hours, rateType, rates });
  
  if (!rates) {
    console.log('No rates provided, returning 0');
    return 0;
  }
  
  if (rateType === 'fixed' && rates.fixed_rate) {
    const total = hours * rates.fixed_rate;
    console.log('Fixed rate calculation:', { hours, rate: rates.fixed_rate, total });
    return total;
  } else if (rateType === 'hourly' && rates.hourly_rate) {
    const total = hours * rates.hourly_rate;
    console.log('Hourly rate calculation:', { hours, rate: rates.hourly_rate, total });
    return total;
  }
  
  console.log('No matching rate type found, returning 0');
  return 0;
};

export const calculateTotalSalary = (
  timesheets: Array<{
    hours: number;
    work_types: {
      rate_type: 'fixed' | 'hourly';
    };
    work_type_id: string;
  }>,
  workTypeRates: Record<string, WorkTypeRate>
): number => {
  return timesheets.reduce((total, timesheet) => {
    const rates = workTypeRates[timesheet.work_type_id];
    return total + calculateSalaryForTimesheet(
      timesheet.hours,
      timesheet.work_types.rate_type,
      rates
    );
  }, 0);
};