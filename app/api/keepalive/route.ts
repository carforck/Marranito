import { getPool, hasSupabase } from "@/lib/db";

// Ping diario (Vercel Cron) para que Supabase no se pause por inactividad.
// Una consulta trivial cuenta como actividad y reinicia el reloj de pausa.
export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasSupabase()) {
    return Response.json({ ok: false, reason: "sin credenciales de Supabase" });
  }
  try {
    await getPool().query("select 1");
    return Response.json({ ok: true, ts: new Date().toISOString() });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
