"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Mantiene la vista al día sin recargar la página, con tres mecanismos:
//  1) Realtime de Supabase (instantáneo cuando el canal entrega eventos).
//  2) Sondeo cada 12s, solo si la pestaña está visible.
//  3) Refresco al volver a la pestaña (focus / visibilitychange).
export function RealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 300); // agrupa ráfagas
    };

    // 1) Realtime (best-effort)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    let cleanupRealtime = () => {};
    if (url && key) {
      const sb = createClient(url, key, {
        realtime: { params: { eventsPerSecond: 3 } },
      });
      const channel = sb
        .channel("marranito-cambios")
        .on("postgres_changes", { event: "*", schema: "public", table: "aportes" }, refresh)
        .on("postgres_changes", { event: "*", schema: "public", table: "miembros" }, refresh)
        .on("postgres_changes", { event: "*", schema: "public", table: "ciclos" }, refresh)
        .subscribe();
      cleanupRealtime = () => sb.removeChannel(channel);
    }

    // 2) Sondeo cada 12s, solo con pestaña visible
    const poll = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 12000);

    // 3) Al volver a la pestaña
    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      clearTimeout(timer);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      cleanupRealtime();
    };
  }, [router]);

  return null;
}
