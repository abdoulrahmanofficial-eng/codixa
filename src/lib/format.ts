export function fmt(n: number | undefined | null): string {
  return (n || 0).toLocaleString('en-US');
}
