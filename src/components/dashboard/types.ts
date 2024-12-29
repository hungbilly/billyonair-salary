export interface WorkTypeSummary {
  name: string;
  totalHours: number;
  workTypeId: string;
  rateType: 'fixed' | 'hourly';
}

export interface WorkTypeRates {
  [key: string]: {
    hourly_rate?: number;
    fixed_rate?: number;
  };
}