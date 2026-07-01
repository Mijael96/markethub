import React from "react";
import { Activity, Beef, Waves, GitCompareArrows, Flame } from "lucide-react";
import { COLORS, FONT_BODY, FONT_MONO } from "../../config/theme";

/**
 * Catálogo de navegación. Vive acá (y no hardcodeado en el render) para que
 * agregar/quitar una vista sea editar un array, no reescribir el JSX.
 */
export const NAV_ITEMS = [
  { id: "portfolio", label: "Portafolio", icon: Activity },
  { id: "set-carnicero", label: "El Carnicero", icon: Beef, color: COLORS.carnicero },
  { id: "set-tobogan", label: "Tobogán Cable", icon: Waves, color: COLORS.tobogan },
  { id: "set-doble", label: "Doble o Nada", icon: GitCompareArrows, color: COLORS.doble },
  { id: "set-fierro", label: "Fierro Caliente", icon: Flame, color: COLORS.fierro },
];

export default function Sidebar({ activeView, onSelectView }) {
  return (
    <div style={{ width: 200, borderRight: `1px solid ${COLORS.hairline}`, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectView(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 4, border: "none",
              background: isActive ? COLORS.raised : "transparent", cursor: "pointer", textAlign: "left",
              color: isActive ? COLORS.hi : COLORS.muted, fontFamily: FONT_BODY, fontSize: 13, fontWeight: isActive ? 600 : 400,
              borderLeft: isActive ? `2px solid ${item.color || COLORS.hi}` : "2px solid transparent",
            }}
          >
            <Icon size={15} color={isActive ? (item.color || COLORS.hi) : COLORS.mutedDim} />
            {item.label}
          </button>
        );
      })}
      <div style={{ marginTop: "auto", paddingTop: 16, fontFamily: FONT_MONO, fontSize: 10, color: COLORS.mutedDim, lineHeight: 1.6 }}>
        4 conjuntos<br />11 ejecuciones<br />802 trades<br />Sesión 14:00–20:00
      </div>
    </div>
  );
}
