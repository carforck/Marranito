import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Store } from "./index";
import type { Contribution, Member, FundSummary } from "@/lib/types";

// Almacén local en archivo JSON. Sirve para desarrollo y demo.
// En producción (Vercel) se reemplaza por el adaptador de Supabase.

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "fondo.json");
const CYCLE_YEAR = 2026;

interface DbShape {
  members: Member[];
  contributions: Contribution[];
}

async function read(): Promise<DbShape> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as DbShape;
  } catch {
    // Primera vez: datos de ejemplo para que la UI no se vea vacía.
    const seed = makeSeed();
    await write(seed);
    return seed;
  }
}

async function write(db: DbShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function makeSeed(): DbShape {
  const members: Member[] = [
    { id: "m1", name: "Carlos Carranza", createdAt: "2026-01-05T12:00:00Z" },
    { id: "m2", name: "Laura Gómez", createdAt: "2026-01-05T12:00:00Z" },
    { id: "m3", name: "Andrés Pérez", createdAt: "2026-01-06T12:00:00Z" },
  ];
  const contributions: Contribution[] = [
    mkc("m1", "Carlos Carranza", 200000, "2026-01-15", "confirmado"),
    mkc("m2", "Laura Gómez", 200000, "2026-01-16", "confirmado"),
    mkc("m3", "Andrés Pérez", 150000, "2026-01-20", "confirmado"),
    mkc("m1", "Carlos Carranza", 200000, "2026-02-15", "confirmado"),
    mkc("m2", "Laura Gómez", 200000, "2026-02-18", "pendiente"),
  ];
  return { members, contributions };
}

function mkc(
  memberId: string,
  memberName: string,
  amount: number,
  date: string,
  status: Contribution["status"],
): Contribution {
  return {
    id: randomUUID(),
    memberId,
    memberName,
    amount,
    date,
    status,
    createdAt: `${date}T12:00:00Z`,
  };
}

export class LocalStore implements Store {
  async getSummary(): Promise<FundSummary> {
    const db = await read();
    const confirmed = db.contributions.filter((c) => c.status === "confirmado");
    const pending = db.contributions.filter((c) => c.status === "pendiente");
    return {
      totalConfirmed: confirmed.reduce((s, c) => s + c.amount, 0),
      totalPending: pending.reduce((s, c) => s + c.amount, 0),
      memberCount: db.members.length,
      contributionCount: confirmed.length,
      cycleYear: CYCLE_YEAR,
    };
  }

  async listConfirmed(): Promise<Contribution[]> {
    const db = await read();
    return db.contributions
      .filter((c) => c.status === "confirmado")
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async listAll(): Promise<Contribution[]> {
    const db = await read();
    return [...db.contributions].sort((a, b) => b.date.localeCompare(a.date));
  }

  async listMembers(): Promise<Member[]> {
    const db = await read();
    return [...db.members].sort((a, b) => a.name.localeCompare(b.name));
  }

  async addMember(name: string): Promise<Member> {
    const db = await read();
    const member: Member = {
      id: randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    db.members.push(member);
    await write(db);
    return member;
  }

  async addContribution(input: {
    memberId: string;
    amount: number;
    date: string;
    confirmNow?: boolean;
  }): Promise<Contribution> {
    const db = await read();
    const member = db.members.find((m) => m.id === input.memberId);
    if (!member) throw new Error("Miembro no encontrado");
    const contribution: Contribution = {
      id: randomUUID(),
      memberId: member.id,
      memberName: member.name,
      amount: input.amount,
      date: input.date,
      status: input.confirmNow ? "confirmado" : "pendiente",
      createdAt: new Date().toISOString(),
    };
    db.contributions.push(contribution);
    await write(db);
    return contribution;
  }

  async confirmContribution(id: string): Promise<void> {
    const db = await read();
    const c = db.contributions.find((x) => x.id === id);
    if (!c) throw new Error("Aporte no encontrado");
    if (c.status === "pendiente") c.status = "confirmado";
    await write(db);
  }

  async reverseContribution(id: string, note: string): Promise<void> {
    const db = await read();
    const c = db.contributions.find((x) => x.id === id);
    if (!c) throw new Error("Aporte no encontrado");
    // Append-only: no se borra el registro, se marca reversado con motivo.
    c.status = "reversado";
    c.note = note.trim();
    await write(db);
  }
}
