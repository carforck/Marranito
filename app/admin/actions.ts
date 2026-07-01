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

type MemberResult = { ok: boolean; error: string | null };

export async function addMember(_prev: unknown, formData: FormData): Promise<MemberResult> {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Falta el nombre." };
  // Emoji/color aleatorios si no se eligieron; cada quien los cambia después.
  const emoji = String(formData.get("emoji") ?? "") || pick(MEMBER_EMOJIS);
  const color = String(formData.get("color") ?? "") || pick(MEMBER_COLORS);
  await getStore().addMember({ name, emoji, color });
  revalidateAll();
  return { ok: true, error: null };
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
  return { ok: true, error: null };
}

export async function deleteMember(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await getStore().deleteMember(id);
  revalidateAll();
}

export async function addContribution(formData: FormData) {
  await requireAuth();
  const memberId = String(formData.get("memberId") ?? "");
  const amount = parseCOP(String(formData.get("amount") ?? ""));
  const date = String(formData.get("date") ?? "");
  const confirmNow = formData.get("confirmNow") === "on";
  if (!memberId || amount === null || amount <= 0 || !date) return;
  await getStore().addContribution({ memberId, amount, date, confirmNow });
  revalidateAll();
}

export async function confirmContribution(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await getStore().confirmContribution(id);
  revalidateAll();
}

export async function reverseContribution(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!id || !note) return;
  await getStore().reverseContribution(id, note);
  revalidateAll();
}
