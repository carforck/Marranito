"use server";

import { revalidatePath } from "next/cache";
import { getStore } from "@/lib/store";
import { parseCOP } from "@/lib/money";
import { checkPin, startSession, endSession, isAuthed } from "@/lib/auth";
import { MEMBER_COLORS, MEMBER_EMOJIS } from "@/lib/constants";

export async function login(_prev: unknown, formData: FormData) {
  const pin = String(formData.get("pin") ?? "");
  if (!checkPin(pin)) return { error: "PIN incorrecto." };
  await startSession();
  revalidatePath("/admin");
  return { error: null };
}

export async function logout() {
  await endSession();
  revalidatePath("/admin");
}

async function requireAuth() {
  if (!(await isAuthed())) throw new Error("No autorizado");
}

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/movimientos");
  revalidatePath("/companeros");
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

type MemberResult = { ok: boolean; error: string | null; message?: string };

export async function addMember(_prev: unknown, formData: FormData): Promise<MemberResult> {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Falta el nombre." };
  // Emoji/color aleatorios si no se eligieron; cada quien los cambia después.
  const emoji = String(formData.get("emoji") ?? "") || pick(MEMBER_EMOJIS);
  const color = String(formData.get("color") ?? "") || pick(MEMBER_COLORS);
  await getStore().addMember({ name, emoji, color });
  revalidateAll();
  return { ok: true, error: null, message: `${name} agregado al marranito.` };
}

export async function updateMember(_prev: unknown, formData: FormData): Promise<MemberResult> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return { ok: false, error: "Falta el nombre." };
  const emoji = String(formData.get("emoji") ?? "") || pick(MEMBER_EMOJIS);
  const color = String(formData.get("color") ?? "") || pick(MEMBER_COLORS);
  await getStore().updateMember(id, { name, emoji, color });
  revalidateAll();
  return { ok: true, error: null, message: `${name} actualizado.` };
}

type Res = { ok: boolean; message?: string; error?: string };

export async function deleteMember(_prev: unknown, formData: FormData): Promise<Res> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Falta el compañero." };
  const m = await getStore().getMember(id);
  await getStore().deleteMember(id);
  // Solo borra si no tiene aportes; si sigue existiendo, avisar.
  const stillThere = await getStore().getMember(id);
  if (stillThere)
    return { ok: false, error: `No se puede borrar a ${m?.name ?? "el compañero"}: tiene aportes registrados.` };
  revalidateAll();
  return { ok: true, message: `${m?.name ?? "Compañero"} eliminado.` };
}

export async function setQuota(_prev: unknown, formData: FormData): Promise<Res> {
  await requireAuth();
  const amount = parseCOP(String(formData.get("quota") ?? ""));
  await getStore().setMonthlyQuota(amount ?? 0);
  revalidateAll();
  return {
    ok: true,
    message: amount ? `Cuota mensual fijada en $${amount.toLocaleString("es-CO")}.` : "Cuota desactivada.",
  };
}

export async function addContribution(_prev: unknown, formData: FormData): Promise<Res> {
  await requireAuth();
  const memberId = String(formData.get("memberId") ?? "");
  const amount = parseCOP(String(formData.get("amount") ?? ""));
  const date = String(formData.get("date") ?? "");
  const confirmNow = formData.get("confirmNow") === "on";
  if (!memberId) return { ok: false, error: "Elige el compañero." };
  if (amount === null || amount <= 0) return { ok: false, error: "El monto no es válido." };
  if (!date) return { ok: false, error: "Falta la fecha." };
  try {
    const c = await getStore().addContribution({ memberId, amount, date, confirmNow });
    revalidateAll();
    return {
      ok: true,
      message: `Aporte de ${c.memberName} por $${amount.toLocaleString("es-CO")} registrado${
        confirmNow ? " y confirmado" : " (pendiente)"
      }.`,
    };
  } catch {
    return { ok: false, error: "No se pudo registrar. Intenta de nuevo." };
  }
}

export async function confirmContribution(_prev: unknown, formData: FormData): Promise<Res> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Falta el aporte." };
  const c = await getStore().getContribution(id);
  await getStore().confirmContribution(id);
  revalidateAll();
  return {
    ok: true,
    message: c
      ? `Aporte de ${c.memberName} por $${c.amount.toLocaleString("es-CO")} confirmado.`
      : "Aporte confirmado.",
  };
}

export async function reverseContribution(_prev: unknown, formData: FormData): Promise<Res> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!id) return { ok: false, error: "Falta el aporte." };
  if (!note) return { ok: false, error: "Escribe el motivo de la reversa." };
  const c = await getStore().getContribution(id);
  await getStore().reverseContribution(id, note);
  revalidateAll();
  return {
    ok: true,
    message: c ? `Aporte de ${c.memberName} reversado.` : "Aporte reversado.",
  };
}
