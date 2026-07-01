import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Marranito — Fondo de ahorro",
    short_name: "Marranito",
    description: "El marranito del grupo: mira cuánto llevamos ahorrado.",
    start_url: "/",
    display: "standalone",
    background_color: "#100f1a",
    theme_color: "#6c5ce7",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
