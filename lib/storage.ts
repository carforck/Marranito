// Sube el comprobante al bucket público "soportes" de Supabase Storage
// usando la anon key (hay política que permite insertar a anon).
// Devuelve la URL pública, o null si no se pudo / no hay archivo.

export async function uploadSoporte(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null; // dev local sin Supabase

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;

  const res = await fetch(`${url}/storage/v1/object/soportes/${path}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: Buffer.from(await file.arrayBuffer()),
  });

  if (!res.ok) {
    console.error("Fallo subiendo soporte:", res.status, await res.text());
    return null;
  }
  return `${url}/storage/v1/object/public/soportes/${path}`;
}
