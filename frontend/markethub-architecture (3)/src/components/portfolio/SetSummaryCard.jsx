import React from "react";
import { ChevronRight } from "lucide-react";
import { COLORS, FONT_DISPLAY, FONT_MONO, SET_META } from "../../config/theme";
import PnlTag from "../common/PnlTag";

export default function SetSummaryCard({
  set,
  executionCount,
  runningCount,
  totalTrades,
  pnl,
  isRecentlyActive,
  onClick,
}) {
  const meta = SET_META[set.id];
  const Icon = meta.icon;

  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        background: COLORS.panel,
        border: `1px solid ${isRecentlyActive ? meta.color : COLORS.hairline}`,
        borderRadius: 4,
        padding: 16,
        position: "relative",
        overflow: "hidden",
        transition: "border-color .3s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = meta.color)}
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = isRecentlyActive
          ? meta.color
          : COLORS.hairline)
      }
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 3,
          height: "100%",
          background: meta.color,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: COLORS.mutedDim,
              letterSpacing: 0.3,
              textTransform: "uppercase",
            }}
          >
            <h2 style={{ color: meta.color }}>{set.name}</h2>
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              lineHeight: 1.5,
              color: COLORS.muted,
            }}
          >
            {set.display_type}
          </div>
        </div>
        <ChevronRight size={16} color={COLORS.mutedDim} />
      </div>
      <div style={{ marginTop: 18 }}>
        <PnlTag value={pnl} size={19} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 14,
          fontFamily: FONT_MONO,
          fontSize: 11,
          color: COLORS.muted,
        }}
      >
        <span>{executionCount} ejec.</span>
        <span style={{ color: COLORS.pos }}>{runningCount} activas</span>
        <span>{totalTrades} trades</span>
      </div>
    </div>
  );
}
