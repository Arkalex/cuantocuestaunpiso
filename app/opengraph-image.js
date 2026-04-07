import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "¿Puedo comprarme un piso en España?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        {/* House icon */}
        <div style={{ fontSize: 96, marginBottom: 32, display: "flex" }}>🏠</div>

        {/* Main title */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 24,
            display: "flex",
          }}
        >
          ¿Puedo comprarme un piso en España?
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#bfdbfe",
            textAlign: "center",
            lineHeight: 1.4,
            marginBottom: 48,
            display: "flex",
          }}
        >
          Calculadora con datos del INE y Ministerio de Vivienda
        </div>

        {/* Pills row */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Precio por m²", "Cuota hipoteca", "Esfuerzo salarial"].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 999,
                  padding: "10px 24px",
                  color: "#ffffff",
                  fontSize: 20,
                  display: "flex",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            color: "#93c5fd",
            fontSize: 22,
            display: "flex",
          }}
        >
          cuantocuestaunpiso.es
        </div>
      </div>
    ),
    { ...size }
  );
}
