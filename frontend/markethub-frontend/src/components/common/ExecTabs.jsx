import React from "react";
import { Play, Pause } from "lucide-react";
import { COLORS, FONT_MONO } from "../../config/theme";

/** Tabs para elegir qué ejecución del conjunto se está mirando. */
export default function ExecTabs({ executions, selectedId, onSelect, accentColor }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {executions.map((exec) => {
        const isActive = exec.id === selectedId;
        return (
          <button
            key={exec.id}
            onClick={() => onSelect(exec.id)}
            style={{
              fontFamily: FONT_MONO, fontSize: 11, padding: "7px 12px", borderRadius: 3, cursor: "pointer",
              border: `1px solid ${isActive ? accentColor : COLORS.hairline}`,
              background: isActive ? `${accentColor}1A` : "transparent",
              color: isActive ? accentColor : COLORS.muted, letterSpacing: 0.2,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {exec.status === "running" ? <Play size={10} /> : <Pause size={10} />}
            {exec.name}
          </button>
        );
      })}
    </div>
  );
}
