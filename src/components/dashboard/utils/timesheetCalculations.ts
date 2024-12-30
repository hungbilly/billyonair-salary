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
): number => {
  if (timesheet.work_types.name === "Other" && timesheet.custom_rate) {
    const total = Number(timesheet.custom_rate) * Number(timesheet.hours);
    return isNaN(total) ? 0 : total;
  }

  const rates = workTypeRates[timesheet.work_type_id];
  const rate = timesheet.work_types.rate_type === 'fixed' 
    ? Number(rates?.fixed_rate || 0)
    : Number(rates?.hourly_rate || 0);
  
  const total = rate * Number(timesheet.hours);
  return isNaN(total) ? 0 : total;
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