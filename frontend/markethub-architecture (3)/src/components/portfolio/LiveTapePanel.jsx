import React from "react";
import { COLORS, FONT_MONO } from "../../config/theme";
import Panel from "../common/Panel";
import { fmtTime, fmtNum, fmtARS } from "../../utils/formatters";

const COLUMNS = `
  90px
  minmax(280px, 2fr)
  90px
  120px
  100px
`;

export default function LiveTapePanel({ trades }) {
  return (
    <Panel eyebrow="Tape" title="Últimos trades en tiempo real">
      <div
        style={{
          maxHeight: 280,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: COLUMNS,
            gap: 8,
            padding: "4px 10px",
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: COLORS.mutedDim,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            borderBottom: `1px solid ${COLORS.hairline}`,
          }}
        >
          <span>Hora</span>
          <span>Ejecución</span>
          <span>Símbolo</span>
          <span>Precio</span>
          <span>Cant.</span>
        </div>
        {trades.map((t) => (
          <div
            key={t.id}
            style={{
              display: "grid",
              gridTemplateColumns: COLUMNS,
              gap: 8,
              padding: "6px 10px",
              fontFamily: FONT_MONO,
              fontSize: 12,
              borderBottom: `1px solid ${COLORS.hairline}`,
            }}
          >
            <span style={{ color: COLORS.mutedDim }}>{t.time_str}</span>
            <span
              style={{
                color: COLORS.hi,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {t.exec_name}
            </span>
            <span style={{ color: t.color }}>{t.symbol}</span>
            <span style={{ color: t.side === "buy" ? COLORS.pos : COLORS.neg }}>
              {t.side === "buy" ? "▲" : "▼"} {fmtNum(t.price, 1)}
            </span>
            <span style={{ color: COLORS.muted }}>{fmtNum(t.qty)}</span>
          </div>
        ))}
        {trades.length === 0 && (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              color: COLORS.mutedDim,
              fontFamily: FONT_MONO,
              fontSize: 12,
            }}
          >
            Esperando primer evento…
          </div>
        )}
      </div>
    </Panel>
  );
}
