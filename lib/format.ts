export const euroFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2
});

export const percentFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 1
});

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
