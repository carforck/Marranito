"use client";

import { useActionState, useEffect, useState } from "react";
import { addMember, updateMember, deleteMember } from "./actions";
import { MEMBER_COLORS, MEMBER_EMOJIS } from "@/lib/constants";
import { EmojiAvatar } from "@/components/decor";
import type { Member } from "@/lib/types";

function randOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function Editor({
  member,
  onDone,
}: {
  member?: Member;
  onDone?: () => void;
}) {
  const editing = Boolean(member);
  // Al crear: emoji/color aleatorio (editable). Al editar: los actuales.
  const [emoji, setEmoji] = useState(member?.emoji ?? (() => randOf(MEMBER_EMOJIS)));
  const [color, setColor] = useState(member?.color ?? (() => randOf(MEMBER_COLORS)));

  const [state, formAction, pending] = useActionState(
    editing ? updateMember : addMember,
    { ok: false, error: null } as { ok: boolean; error: string | null },
  );

  // Cerrar el editor SOLO cuando la acción terminó bien.
  useEffect(() => {
    if (state?.ok) onDone?.();
  }, [state, onDone]);

  return (
    <form
      action={formAction}
      className="themed space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
    >
      {editing && <input type="hidden" name="id" value={member!.id} />}
      <input type="hidden" name="emoji" value={emoji} />
      <input type="hidden" name="color" value={color} />

      <div className="flex items-center gap-3">
        <EmojiAvatar emoji={emoji} color={color} />
        <input
          name="name"
          defaultValue={member?.name ?? ""}
          placeholder="Nombre del compañero"
          required
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-[var(--muted)]">Emoji</p>
        <div className="flex flex-wrap gap-1.5">
          {MEMBER_EMOJIS.map((e) => (
            <button
              type="button"
              key={e}
              onClick={() => setEmoji(e)}
              className={`h-8 w-8 rounded-lg text-lg leading-none transition ${
                emoji === e ? "bg-[var(--brand-soft)] ring-2 ring-[var(--brand)]" : "hover:bg-[var(--surface)]"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-[var(--muted)]">Color</p>
        <div className="flex flex-wrap gap-2">
          {MEMBER_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              aria-label={`color ${c}`}
              className={`h-7 w-7 rounded-full transition ${
                color === c ? "ring-2 ring-offset-2 ring-[var(--foreground)] ring-offset-[var(--surface-2)]" : ""
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      {state?.error && (
        <p className="text-sm font-medium text-[var(--danger)]">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Guardando…" : editing ? "Guardar" : "Agregar compañero"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-[var(--muted)]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function MembersManager({ members }: { members: Member[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Compañeros ({members.length})</h2>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-xl border border-[var(--brand)] px-3 py-1.5 text-sm font-semibold text-[var(--brand-soft-fg)]"
          >
            + Nuevo
          </button>
        )}
      </div>

      {creating && <Editor onDone={() => setCreating(false)} />}

      <div className="space-y-2">
        {members.map((m) =>
          editing === m.id ? (
            <Editor key={m.id} member={m} onDone={() => setEditing(null)} />
          ) : (
            <div
              key={m.id}
              className="themed flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5"
            >
              <EmojiAvatar emoji={m.emoji} color={m.color} size="sm" />
              <span className="flex-1 truncate font-medium">{m.name}</span>
              <button
                onClick={() => setEditing(m.id)}
                className="text-sm font-semibold text-[var(--brand-soft-fg)]"
              >
                Editar
              </button>
              <form action={deleteMember}>
                <input type="hidden" name="id" value={m.id} />
                <button
                  className="text-sm font-semibold text-[var(--danger)]"
                  title="Solo se puede borrar si no tiene aportes"
                >
                  Borrar
                </button>
              </form>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
