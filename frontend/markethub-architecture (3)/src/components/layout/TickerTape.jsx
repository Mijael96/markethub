import React, { useMemo } from "react";
import { COLORS, FONT_MONO, SET_META } from "../../config/theme";
import { EXECUTIONS } from "../../data/staticEntities";
import { getSeriesFor } from "../../data/sessionData";
import { fmtARS, fmtBps } from "../../utils/formatters";

/**
 * Lee el valor de cada ejecución en `simIndex` y le aplica un jitter
 * determinístico (basado en `tick` + id de ejecución) para que la cinta se
 * "sienta viva" sin desincronizarse del reloj de sesión oficial.
 */
function buildTapeItems(tick, simIndex) {
  return EXECUTIONS.map((exec) => {
    const series = getSeriesFor(exec.id);
    const point = series[Math.min(simIndex, series.length - 1)];
    const meta = SET_META[exec.set_id];
    const jitter = Math.sin(tick * 1.7 + exec.id.length * 3.1) + Math.sin(tick * 0.6 + exec.id.charCodeAt(5)) * 0.5;

    if (exec.type === "mm_bonos_cedears") {
      const v = point.total + jitter * Math.abs(point.total || 50000) * 0.03;
      return { label: exec.instrument, value: fmtARS(v), up: v >= 0, color: meta.color };
    }
    if (exec.type === "arb_dolar_cable") {
      const v = point.spread_bps + jitter * 2;
      return { label: `${exec.legA}/${exec.legB}`, value: fmtBps(v), up: v >= 0, color: meta.color };
    }
    if (exec.type === "arb_cedears_underlying") {
      const v = point.gap_bps + jitter * 2;
      return { label: exec.cedear, value: fmtBps(v), up: v >= 0, color: meta.color };
    }
    const v = point.pnl + jitter * Math.abs(point.pnl || 50000) * 0.03;
    return { label: exec.instrument, value: fmtARS(v), up: v >= 0, color: meta.color };
  });
}

export default function TickerTape({ tick, simIndex }) {
  const items = useMemo(() => buildTapeItems(tick, simIndex), [tick, simIndex]);
  const row = [...items, ...items]; // duplicado para el loop continuo del scroll

  return (
    <div style={{ overflow: "hidden", borderBottom: `1px solid ${COLORS.hairline}`, background: "#0D1014", height: 34, display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 28, animation: "tape-scroll 38s linear infinite", whiteSpace: "nowrap", paddingLeft: 16 }}>
        {row.map((item, i) => (
          <span key={i} style={{ fontFamily: FONT_MONO, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: item.color, fontWeight: 700 }}>{item.label}</span>
            <span style={{ color: item.up ? COLORS.pos : COLORS.neg }}>{item.value}</span>
            <span style={{ color: COLORS.hairline2 }}>·</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes tape-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
