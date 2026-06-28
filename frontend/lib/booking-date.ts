export function getMinBookingDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export function isBookingDateValid(date: string, minDate: string = getMinBookingDate()): boolean {
  if (!date || date.length !== 10) return false;
  return date >= minDate;
}

function formatDisplayDate(isoDate: string, locale: string): string {
  const [year, month, day] = isoDate.split('-');
  return locale === 'ru' ? `${day}.${month}.${year}` : `${month}/${day}/${year}`;
}

export function getBookingDateError(
  date: string,
  locale: string,
  minDate: string = getMinBookingDate(),
): string | null {
  if (!date || date.length !== 10) return null;
  if (date >= minDate) return null;

  const formattedMin = formatDisplayDate(minDate, locale);
  return locale === 'ru'
    ? `Нельзя выбрать прошедшую дату. Минимальная дата — ${formattedMin}`
    : `Past dates are not allowed. Minimum date is ${formattedMin}`;
}
