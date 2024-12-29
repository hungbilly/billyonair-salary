interface WorkTypeRate {
  hourly_rate?: number;
  fixed_rate?: number;
}

export const calculateSalary = (
  hours: number,
  rateType: 'fixed' | 'hourly',
  rates?: WorkTypeRate
): number => {
  if (!rates) return 0;

  if (rateType === 'fixed' && rates.fixed_rate) {
    return rates.fixed_rate * hours;
  }
  if (rateType === 'hourly' && rates.hourly_rate) {
    return hours * rates.hourly_rate;
  }
  return 0;
};