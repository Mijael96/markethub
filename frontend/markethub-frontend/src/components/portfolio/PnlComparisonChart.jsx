import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { COLORS, FONT_MONO } from "../../config/theme";
import Panel from "../common/Panel";
import ChartTooltip from "../common/ChartTooltip";
import { fmtARS, fmtTimeSession } from "../../utils/formatters";

export default function PnlComparisonChart({ data, simulationDateTime }) {
  return (
    <Panel eyebrow={`Comparativa · a las ${fmtTimeSession(simulationDateTime)}`} title="PnL acumulado por conjunto">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.hairline} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: COLORS.muted, fontFamily: FONT_MONO, fontSize: 11 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
          <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtARS} width={56} />
          <Tooltip content={<ChartTooltip valueFormatter={fmtARS} />} cursor={{ fill: COLORS.hairline }} />
          <ReferenceLine y={0} stroke={COLORS.hairline2} />
          <Bar dataKey="pnl" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}
