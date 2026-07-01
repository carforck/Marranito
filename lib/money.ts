// Utilidades de dinero. Todo en pesos enteros (COP).

/** Formatea pesos enteros a "$1.250.000". */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convierte un texto digitado por el usuario ("1.250.000", "1250000", "$1.250.000")
 * a pesos enteros. Devuelve null si no es un número válido o es negativo.
 */
export function parseCOP(input: string): number | null {
  const cleaned = input.replace(/[^\d]/g, "");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  if (!Number.isInteger(value) || value < 0) return null;
  return value;
}
