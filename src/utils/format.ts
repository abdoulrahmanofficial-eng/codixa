export function formatEGP(amount: number): string {
  return `${amount.toLocaleString('en-US')} EGP`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}