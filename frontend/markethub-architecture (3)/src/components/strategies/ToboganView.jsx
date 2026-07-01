import React, { useState } from "react";
import { ComposedChart, Area, Scatter, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { COLORS, FONT_MONO } from "../../config/theme";
import { getExecutionsBySet, getExecutionById, getSeriesFor } from "../../data/sessionData";
import { getFinalStats } from "../../domain/sessionStats";
import Panel from "../common/Panel";
import ChartTooltip from "../common/ChartTooltip";
import ExecTabs from "../common/ExecTabs";
import ExecutionHeader from "../common/ExecutionHeader";
import { fmtARS, fmtBps, fmtTime } from "../../utils/formatters";

const SET_ID = "set-tobogan";

export default function ToboganView() {
  const executions = getExecutionsBySet(SET_ID);
  const [selectedId, setSelectedId] = useState(executions[0].id);
  const execution = getExecutionById(selectedId);
  const series = getSeriesFor(selectedId);
  const stats = getFinalStats(selectedId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ExecTabs executions={executions} selectedId={selectedId} onSelect={setSelectedId} accentColor={COLORS.tobogan} />
      <ExecutionHeader
        execution={execution}
        totalPnl={stats.total_pnl}
        totalTrades={stats.total_trades}
        winRate={stats.win_rate}
        accentColor={COLORS.tobogan}
        metrics={[
          { label: "Spread prom.", value: fmtBps(stats.metrics.spread_promedio_bps) },
          { label: "Spread max", value: fmtBps(stats.metrics.spread_max_bps) },
          { label: "Convergencias", value: stats.metrics.convergencias },
        ]}
      />

      <Panel eyebrow={`${execution.legA} vs ${execution.legB}`} title="Spread entre patas — entradas/salidas de posición">
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.tobogan} stopOpacity={0.3} />
                <stop offset="100%" stopColor={COLORS.tobogan} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={COLORS.hairline} vertical={false} />
            <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
            <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}bps`} width={56} />
            <Tooltip content={<ChartTooltip valueFormatter={fmtBps} />} />
            <ReferenceLine y={18} stroke={COLORS.mutedDim} strokeDasharray="3 3" label={{ value: "entrada", fill: COLORS.mutedDim, fontSize: 9, position: "insideTopRight" }} />
            <ReferenceLine y={-18} stroke={COLORS.mutedDim} strokeDasharray="3 3" />
            <ReferenceLine y={0} stroke={COLORS.hairline2} />
            <Area type="monotone" dataKey="spread_bps" name="Spread" stroke={COLORS.tobogan} fill="url(#spreadGrad)" strokeWidth={2} dot={false} />
            <Scatter dataKey={(d) => (d.in_position ? d.spread_bps : null)} name="En posición" fill={COLORS.hi} shape="circle" />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Panel eyebrow="Resultado" title="PnL atribuible al cierre del spread">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.hairline} vertical={false} />
              <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
              <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtARS} width={56} />
              <Tooltip content={<ChartTooltip valueFormatter={fmtARS} />} />
              <Line type="stepAfter" dataKey="realized" name="PnL realizado" stroke={COLORS.pos} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
        <Panel eyebrow="Riesgo" title="Exposición neta (¿queda direccional?)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.hairline} vertical={false} />
              <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
              <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtARS} width={56} />
              <Tooltip content={<ChartTooltip valueFormatter={fmtARS} />} />
              <ReferenceLine y={0} stroke={COLORS.hairline2} />
              <Bar dataKey="net_exposure" name="Exposición neta" radius={[2, 2, 2, 2]} fill={COLORS.tobogan} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
