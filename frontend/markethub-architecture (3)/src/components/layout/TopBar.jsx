import React from "react";
import { Activity, AlertTriangle } from "lucide-react";

import { COLORS, FONT_DISPLAY, FONT_MONO } from "../../config/theme";

import { fmtDate, fmtTimeSession } from "../../utils/formatters";

export default function TopBar({ currentTs, sessionDone, simulationDatetime }) {

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: `1px solid ${COLORS.hairline}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${COLORS.carnicero}, ${COLORS.fierro})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Activity size={15} color="#0A0C10" strokeWidth={2.5} />
        </div>

        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: 0.3,
          }}
        >
          MarketHub
        </span>

        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: COLORS.mutedDim,
            border: `1px solid ${COLORS.hairline2}`,
            padding: "2px 6px",
            borderRadius: 3,
          }}
        >
          SSR · SESIÓN {fmtDate(simulationDatetime)}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: FONT_MONO,
            fontSize: 12,
            color: sessionDone ? COLORS.mutedDim : COLORS.pos,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,

              background: sessionDone ? COLORS.mutedDim : COLORS.pos,

              boxShadow: sessionDone ? "none" : `0 0 6px ${COLORS.pos}`,
            }}
          />
          {sessionDone ? "SESIÓN CERRADA" : "HORA DE SESIÓN"}·{" "}
          {fmtTimeSession(simulationDatetime)}
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: COLORS.mutedDim,
          }}
        >
          <AlertTriangle size={12} />
          Datos 100% inventados — no representan mercado real
        </div>
      </div>
    </div>
  );
}
