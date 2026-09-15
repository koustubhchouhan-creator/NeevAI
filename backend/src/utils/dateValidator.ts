export function isValidISODate(dateStr: string): boolean {
  if (typeof dateStr !== "string") return false;
  // Accept a date (YYYY-MM-DD) or a full ISO-8601 datetime.
  const isoRegex =
    /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
  if (!isoRegex.test(dateStr)) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  // For plain dates, ensure the components match (e.g. 2022-02-30 becomes March 2)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return (
      date.getUTCFullYear() === y &&
      date.getUTCMonth() + 1 === m &&
      date.getUTCDate() === d
    );
  }
  return true;
}
