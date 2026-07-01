import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Store, NewContribution, MemberInput } from "./index";
import type { Contribution, Member, FundSummary } from "@/lib/types";
import { CYCLE_YEAR } from "@/lib/constants";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "fondo.json");

interface DbShape {
  members: Member[];
  contributions: Contribution[];
  monthlyQuota?: number;
}

async function read(): Promise<DbShape> {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf-8")) as DbShape;
  } catch {
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
    { id: "m1", name: "Carlos Carranza", emoji: "🐷", color: "#6c5ce7", createdAt: "2026-01-05T12:00:00Z" },
    { id: "m2", name: "Laura Gómez", emoji: "🦊", color: "#22c55e", createdAt: "2026-01-05T12:00:00Z" },
    { id: "m3", name: "Andrés Pérez", emoji: "🐻", color: "#f59e0b", createdAt: "2026-01-06T12:00:00Z" },
  ];
  const contributions: Contribution[] = [
    mkc(members[0], 200000, "2026-01-15", "confirmado", "nequi"),
    mkc(members[1], 200000, "2026-02-16", "confirmado", "bancolombia"),
    mkc(members[2], 150000, "2026-03-20", "confirmado", "efectivo"),
    mkc(members[0], 200000, "2026-04-15", "confirmado", "nequi"),
    mkc(members[1], 200000, "2026-05-18", "pendiente", "daviplata"),
  ];
  return { members, contributions, monthlyQuota: 200000 };
}

function mkc(
  m: Member,
  amount: number,
  date: string,
  status: Contribution["status"],
  metodo: Contribution["metodo"],
): Contribution {
  return {
    id: randomUUID(),
    memberId: m.id,
    memberName: m.name,
    memberEmoji: m.emoji,
    memberColor: m.color,
    amount,
    date,
    status,
    metodo,
    createdAt: `${date}T12:00:00Z`,
  };
}

function decorate(c: Contribution, members: Member[]): Contribution {
  const m = members.find((x) => x.id === c.memberId);
  return m ? { ...c, memberName: m.name, memberEmoji: m.emoji, memberColor: m.color } : c;
}

export class LocalStore implements Store {
  async getSummary(): Promise<FundSummary> {
    const db = await read();
    const conf = db.contributions.filter((c) => c.status === "confirmado");
    const pend = db.contributions.filter((c) => c.status === "pendiente");
    return {
      totalConfirmed: conf.reduce((s, c) => s + c.amount, 0),
      totalPending: pend.reduce((s, c) => s + c.amount, 0),
      memberCount: db.members.length,
      contributionCount: conf.length,
      cycleYear: CYCLE_YEAR,
    };
  }

  async listConfirmed() {
    const db = await read();
    return db.contributions
      .filter((c) => c.status === "confirmado")
      .map((c) => decorate(c, db.members))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async listAll() {
    const db = await read();
    return db.contributions
      .map((c) => decorate(c, db.members))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async listByMember(memberId: string) {
    const db = await read();
    return db.contributions
      .filter((c) => c.memberId === memberId)
      .map((c) => decorate(c, db.members))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async listMembers() {
    const db = await read();
    return [...db.members].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getMember(id: string) {
    const db = await read();
    return db.members.find((m) => m.id === id) ?? null;
  }

  async addMember(input: MemberInput): Promise<Member> {
    const db = await read();
    const member: Member = {
      id: randomUUID(),
      name: input.name.trim(),
      emoji: input.emoji,
      color: input.color,
      createdAt: new Date().toISOString(),
    };
    db.members.push(member);
    await write(db);
    return member;
  }

  async updateMember(id: string, input: MemberInput) {
    const db = await read();
    const m = db.members.find((x) => x.id === id);
    if (m) {
      m.name = input.name.trim();
      m.emoji = input.emoji;
      m.color = input.color;
      await write(db);
    }
  }

  async deleteMember(id: string) {
    const db = await read();
    if (db.contributions.some((c) => c.memberId === id)) return;
    db.members = db.members.filter((m) => m.id !== id);
    await write(db);
  }

  async addContribution(input: NewContribution): Promise<Contribution> {
    const db = await read();
    const member = db.members.find((m) => m.id === input.memberId);
    if (!member) throw new Error("Miembro no encontrado");
    // Idempotencia: si ya existe un aporte con ese token, devolverlo.
    if (input.clientToken) {
      const dup = db.contributions.find((x) => x.clientToken === input.clientToken);
      if (dup) return decorate(dup, db.members);
    }
    const c: Contribution = {
      id: randomUUID(),
      memberId: member.id,
      memberName: member.name,
      memberEmoji: member.emoji,
      memberColor: member.color,
      amount: input.amount,
      date: input.date,
      status: input.confirmNow ? "confirmado" : "pendiente",
      descripcion: input.descripcion,
      metodo: input.metodo,
      soporteUrl: input.soporteUrl,
      clientToken: input.clientToken,
      createdAt: new Date().toISOString(),
    };
    db.contributions.push(c);
    await write(db);
    return c;
  }

  async confirmContribution(id: string) {
    const db = await read();
    const c = db.contributions.find((x) => x.id === id);
    if (c && c.status === "pendiente") c.status = "confirmado";
    await write(db);
  }

  async reverseContribution(id: string, note: string) {
    const db = await read();
    const c = db.contributions.find((x) => x.id === id);
    if (c) {
      c.status = "reversado";
      c.note = note.trim();
    }
    await write(db);
  }

  async getMonthlyQuota() {
    const db = await read();
    return db.monthlyQuota ?? 0;
  }

  async setMonthlyQuota(amount: number) {
    const db = await read();
    db.monthlyQuota = amount || 0;
    await write(db);
  }
}
