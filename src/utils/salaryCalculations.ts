interface WorkTypeRate {
  hourly_rate?: number;
  fixed_rate?: number;
}

export const calculateSalaryForTimesheet = (
  hours: number,
  rateType: 'fixed' | 'hourly',
  rates?: WorkTypeRate
): number => {
  if (!rates) return 0;

  if (rateType === 'fixed' && rates.fixed_rate) {
    return hours * rates.fixed_rate;
  } else if (rates.hourly_rate) {
    return hours * rates.hourly_rate;
  }
  
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
    const salary = calculateSalaryForTimesheet(
      timesheet.hours,
      timesheet.work_types.rate_type,
      rates
    );
    return total + salary;
  }, 0);
};