"use server";

import { revalidatePath } from "next/cache";
import { getStore } from "@/lib/store";
import { parseCOP } from "@/lib/money";
import { uploadSoporte } from "@/lib/storage";
import type { PaymentMethod } from "@/lib/types";

// Registro ABIERTO: cualquiera puede registrar su aporte. Entra como
// "pendiente" y el tesorero lo confirma.
export async function registrarAporte(_prev: unknown, formData: FormData) {
  const memberId = String(formData.get("memberId") ?? "");
  const amount = parseCOP(String(formData.get("amount") ?? ""));
  const date = String(formData.get("date") ?? "");
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const metodo = String(formData.get("metodo") ?? "") as PaymentMethod;
  const clientToken = String(formData.get("clientToken") ?? "") || undefined;
  const file = formData.get("soporte") as File | null;

  if (!memberId) return { ok: false, error: "Elige quién aporta." };
  if (amount === null || amount <= 0) return { ok: false, error: "El monto no es válido." };
  if (!date) return { ok: false, error: "Falta la fecha." };

  try {
    let soporteUrl: string | undefined;
    if (file && file.size > 0) {
      const uploaded = await uploadSoporte(file);
      if (!uploaded)
        return { ok: false, error: "No se pudo subir el comprobante. Vuelve a intentar (o registra sin él)." };
      soporteUrl = uploaded;
    }

    const saved = await getStore().addContribution({
      memberId,
      amount,
      date,
      descripcion: descripcion || undefined,
      metodo: metodo || undefined,
      soporteUrl,
      clientToken,
    });

    revalidatePath("/");
    revalidatePath("/movimientos");
    revalidatePath("/admin");
    revalidatePath("/companeros");
    return { ok: true, error: null, amount: saved.amount, member: saved.memberName };
  } catch (e) {
    // Nunca fallar en silencio: el usuario siempre recibe un mensaje.
    console.error("registrarAporte falló:", e);
    return {
      ok: false,
      error: "No se pudo guardar tu aporte. Revisa tu conexión e intenta de nuevo en un momento.",
    };
  }
}
