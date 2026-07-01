import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { COLORS, FONT_MONO } from "../../config/theme";
import { fmtARS } from "../../utils/formatters";

export default function PnlTag({ value, size = 14 }) {
  const isPositive = value >= 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: FONT_MONO, fontSize: size, color: isPositive ? COLORS.pos : COLORS.neg, fontWeight: 600 }}>
      {isPositive ? <ArrowUpRight size={size} /> : <ArrowDownRight size={size} />}
      {fmtARS(value)}
    </span>
  );
}
