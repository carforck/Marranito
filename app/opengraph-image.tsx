import { ImageResponse } from "next/og";

export const alt = "Marranito — Fondo de ahorro transparente";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(150deg, #7d70f2 0%, #5a49d6 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        {/* marca: cerdito geométrico con divs */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 40,
              background: "#ff9db3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", gap: 30, position: "absolute", top: 40 }}>
              <div style={{ width: 12, height: 12, borderRadius: 12, background: "#3a2a45" }} />
              <div style={{ width: 12, height: 12, borderRadius: 12, background: "#3a2a45" }} />
            </div>
            <div
              style={{
                position: "absolute",
                top: 62,
                width: 56,
                height: 40,
                borderRadius: 20,
                background: "#f9718f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <div style={{ width: 9, height: 13, borderRadius: 9, background: "#c74d69" }} />
              <div style={{ width: 9, height: 13, borderRadius: 9, background: "#c74d69" }} />
            </div>
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>Marranito</div>
        </div>

        <div style={{ marginTop: 40, fontSize: 40, fontWeight: 700, opacity: 0.95 }}>
          El fondo de ahorro del grupo
        </div>
        <div style={{ marginTop: 12, fontSize: 30, opacity: 0.8 }}>
          Transparente · todos ven cuánto llevamos ahorrado 🐷
        </div>
      </div>
    ),
    { ...size },
  );
}
