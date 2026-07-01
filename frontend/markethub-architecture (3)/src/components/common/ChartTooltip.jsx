import React from "react";
import { COLORS, FONT_MONO } from "../../config/theme";
import { fmtTime, fmtNum } from "../../utils/formatters";

/** Tooltip genérico para cualquier gráfico de recharts de la app. */
export default function ChartTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: COLORS.raised, border: `1px solid ${COLORS.hairline2}`, borderRadius: 3, padding: "8px 10px", fontFamily: FONT_MONO, fontSize: 11 }}>
      <div style={{ color: COLORS.mutedDim, marginBottom: 4 }}>{fmtTime(label)}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ color: entry.color, display: "flex", gap: 8, justifyContent: "space-between" }}>
          <span style={{ color: COLORS.muted }}>{entry.name}</span>
          <span>{valueFormatter ? valueFormatter(entry.value, entry.dataKey) : fmtNum(entry.value, 2)}</span>
        </div>
      ))}
    </div>
  );
}
