export const getUpcomingSaturdays = (count: number = 10): string[] => {
  const saturdays: string[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const nextSaturday = new Date(today);

  // Calculate the number of days until the next Saturday
  const daysUntilNextSaturday = (6 - dayOfWeek + 7) % 7;
  nextSaturday.setDate(today.getDate() + daysUntilNextSaturday);

  for (let i = 0; i < count; i++) {
    saturdays.push(nextSaturday.toISOString().split('T')[0]);
    nextSaturday.setDate(nextSaturday.getDate() + 7);
  }

  return saturdays;
};
