import React from "react";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../../config/theme";
import StatusDot from "./StatusDot";
import PnlTag from "./PnlTag";
import { fmtPct } from "../../utils/formatters";

/**
 * ExecutionHeader — fila de cabecera con nombre/estado/PnL de la ejecución
 * seleccionada + N métricas adicionales propias del tipo de estrategia
 * (las que recibe por prop `metrics`, no hardcodeadas acá).
 */
export default function ExecutionHeader({ execution, totalPnl, totalTrades, winRate, accentColor, metrics }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 14, flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 220px", background: COLORS.panel, border: `1px solid ${COLORS.hairline}`, borderLeft: `3px solid ${accentColor}`, borderRadius: 4, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, color: COLORS.hi }}>{execution.name}</span>
          <StatusDot status={execution.status} />
        </div>
        <PnlTag value={totalPnl} size={20} />
        <div style={{ display: "flex", gap: 14, marginTop: 10, fontFamily: FONT_MONO, fontSize: 11, color: COLORS.muted }}>
          <span>{totalTrades} trades</span>
          <span>WR {fmtPct(winRate)}</span>
        </div>
      </div>
      {metrics.map((metric, i) => (
        <div key={i} style={{ flex: "1 1 140px", background: COLORS.panel, border: `1px solid ${COLORS.hairline}`, borderRadius: 4, padding: 14, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: COLORS.mutedDim, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>{metric.label}</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 18, color: COLORS.hi, fontWeight: 600 }}>{metric.value}</div>
        </div>
      ))}
    </div>
  );
}
