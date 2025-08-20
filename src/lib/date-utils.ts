export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // Sunday - 0, ..., Saturday - 6
  const diffToSaturday = (dayOfWeek - 6 + 7) % 7;
  
  const startOfWeek = new Date(d);
  startOfWeek.setDate(d.getDate() - diffToSaturday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { start: startOfWeek, end: endOfWeek };
};

export const getPreviousWeekRange = (date: Date): { start: Date; end: Date } => {
    const d = new Date(date);
    d.setDate(d.getDate() - 7);
    return getWeekRange(d);
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
