import React from "react";
import { COLORS, FONT_MONO } from "../../config/theme";

const STATUS_PRESENTATION = {
  running: { color: COLORS.pos, label: "En vivo" },
  paused: { color: COLORS.doble, label: "Pausada" },
  stopped: { color: COLORS.mutedDim, label: "Detenida" },
};

export default function StatusDot({ status }) {
  const presentation = STATUS_PRESENTATION[status] || STATUS_PRESENTATION.stopped;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT_MONO, fontSize: 11, color: presentation.color, letterSpacing: 0.4 }}>
      <span style={{
        width: 6, height: 6, borderRadius: 99, background: presentation.color,
        boxShadow: status === "running" ? `0 0 8px ${presentation.color}` : "none",
      }} />
      {presentation.label.toUpperCase()}
    </span>
  );
}
