export interface WorkType {
  id: string;
  name: string;
  rate_type: string;
  created_at: string;
}

export interface WorkTypeSummary {
  name: string;
  totalHours: number;
  workTypeId: string;
}

export interface WorkTypeRates {
  [key: string]: {
    hourly_rate?: number;
    fixed_rate?: number;
  };
}