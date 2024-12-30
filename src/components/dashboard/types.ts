export interface WorkType {
  id: string;
  name: string;
  rate_type: 'fixed' | 'hourly';
  created_at: string;
  description?: string | null;
}

export interface Timesheet {
  id: string;
  employee_id: string;
  work_type_id: string;
  hours: number;
  work_date: string;
  created_at: string;
  updated_at: string;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
  custom_rate: number | null;
  work_types: {
    name: string;
    rate_type: 'fixed' | 'hourly';
  };
}

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