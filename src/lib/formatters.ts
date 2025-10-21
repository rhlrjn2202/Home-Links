export function formatPriceInINR(amount: string | number): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0, // Adjust as needed for decimal places
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

export function formatDateToIST(dateString: string): string {
  if (!dateString) {
    return 'N/A';
  }
  const date = new Date(dateString);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata', // Indian Standard Time
  });
}