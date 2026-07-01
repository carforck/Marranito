import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

// Autenticación mínima por PIN para la zona de tesorería.
// El PIN nunca llega al navegador: se compara del lado del servidor y se
// guarda una cookie httpOnly firmada.

const COOKIE = "marranito_tesoreria";
const SECRET = process.env.ADMIN_SECRET ?? "marranito-dev-secret-cambia-esto";

function expectedToken(): string {
  const pin = process.env.ADMIN_PIN ?? "2913";
  return createHmac("sha256", SECRET).update(pin).digest("hex");
}

export function checkPin(pin: string): boolean {
  const expected = process.env.ADMIN_PIN ?? "2913";
  const a = Buffer.from(pin);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function startSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;
  const expected = expectedToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
