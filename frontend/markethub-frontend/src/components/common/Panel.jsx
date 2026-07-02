import React from "react";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../../config/theme";

/**
 * Panel — único componente responsable del estilo visual de "tarjeta con
 * encabezado". Todas las vistas lo reutilizan en vez de repetir estilos
 * inline, así un cambio de diseño del contenedor se hace en un solo lugar.
 */
export default function Panel({ title, eyebrow, right, children, style }) {
  return (
    <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.hairline}`, borderRadius: 4, padding: "16px 18px", ...style }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            {eyebrow && (
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: COLORS.mutedDim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>
                {eyebrow}
              </div>
            )}
            {title && (
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 600, color: COLORS.hi, letterSpacing: 0.2 }}>
                {title}
              </div>
            )}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
