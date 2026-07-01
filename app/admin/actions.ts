"use server";

import { revalidatePath } from "next/cache";
import { getStore } from "@/lib/store";
import { parseCOP } from "@/lib/money";
import { checkPin, startSession, endSession, isAuthed } from "@/lib/auth";

export async function login(_prev: unknown, formData: FormData) {
  const pin = String(formData.get("pin") ?? "");
  if (!checkPin(pin)) {
    return { error: "PIN incorrecto." };
  }
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

export async function addMember(formData: FormData) {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await getStore().addMember(name);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function addContribution(formData: FormData) {
  await requireAuth();
  const memberId = String(formData.get("memberId") ?? "");
  const amount = parseCOP(String(formData.get("amount") ?? ""));
  const date = String(formData.get("date") ?? "");
  const confirmNow = formData.get("confirmNow") === "on";
  if (!memberId || amount === null || amount <= 0 || !date) return;
  await getStore().addContribution({ memberId, amount, date, confirmNow });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function confirmContribution(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await getStore().confirmContribution(id);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function reverseContribution(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!id || !note) return;
  await getStore().reverseContribution(id, note);
  revalidatePath("/admin");
  revalidatePath("/");
}
