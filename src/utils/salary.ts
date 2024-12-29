interface WorkTypeRate {
  hourly_rate?: number;
  fixed_rate?: number;
}

export const calculateSalary = (
  hours: number,
  rateType: 'fixed' | 'hourly',
  rates?: WorkTypeRate
): number => {
  if (!rates) {
    console.log('No rates provided');
    return 0;
  }
  
  console.log('Calculating salary:', { hours, rateType, rates });
  
  if (rateType === 'fixed' && rates.fixed_rate) {
    return hours * rates.fixed_rate;
  }
  if (rateType === 'hourly' && rates.hourly_rate) {
    return hours * rates.hourly_rate;
  }
  
  console.log('No matching rate type found');
  return 0;
};