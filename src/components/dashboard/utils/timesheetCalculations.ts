export const calculateEntryTotal = (
  timesheet: {
    work_types: {
      name: string;
      rate_type: 'fixed' | 'hourly';
    };
    custom_rate?: number | null;
    hours: number;
    work_type_id: string;
  },
  workTypeRates: Record<string, { hourly_rate?: number; fixed_rate?: number; }>
) => {
  if (timesheet.work_types.name === "Other" && timesheet.custom_rate) {
    return timesheet.custom_rate * timesheet.hours;
  }

  const rates = workTypeRates[timesheet.work_type_id];
  const rate = timesheet.work_types.rate_type === 'fixed' 
    ? rates?.fixed_rate 
    : rates?.hourly_rate;
  
  return rate ? rate * timesheet.hours : 0;
};

export const formatTimeRange = (
  workTypeName: string,
  startTime: string | null,
  endTime: string | null
) => {
  if (workTypeName === "Other") return "N/A";
  if (!startTime && !endTime) return "N/A";
  
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  if (startTime && endTime) {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  } else if (startTime) {
    return formatTime(startTime);
  } else if (endTime) {
    return formatTime(endTime);
  }
  
  return "N/A";
};