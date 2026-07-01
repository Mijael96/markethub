import React, { useState } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { COLORS, FONT_MONO } from "../../config/theme";
import { getExecutionsBySet, getExecutionById, getSeriesFor } from "../../data/sessionData";
import { getFinalStats } from "../../domain/sessionStats";
import Panel from "../common/Panel";
import ChartTooltip from "../common/ChartTooltip";
import ExecTabs from "../common/ExecTabs";
import ExecutionHeader from "../common/ExecutionHeader";
import { fmtBps, fmtNum, fmtTime } from "../../utils/formatters";

const SET_ID = "set-doble";

export default function DobleView() {
  const executions = getExecutionsBySet(SET_ID);
  const [selectedId, setSelectedId] = useState(executions[0].id);
  const execution = getExecutionById(selectedId);
  const series = getSeriesFor(selectedId);
  const stats = getFinalStats(selectedId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ExecTabs executions={executions} selectedId={selectedId} onSelect={setSelectedId} accentColor={COLORS.doble} />
      <ExecutionHeader
        execution={execution}
        totalPnl={stats.total_pnl}
        totalTrades={stats.total_trades}
        winRate={stats.win_rate}
        accentColor={COLORS.doble}
        metrics={[
          { label: "Brecha prom.", value: fmtBps(stats.metrics.gap_promedio_bps) },
          { label: "Brecha max", value: fmtBps(stats.metrics.gap_max_bps) },
          { label: "Brecha min", value: fmtBps(stats.metrics.gap_min_bps) },
        ]}
      />

      <Panel eyebrow={`${execution.cedear} (ratio ${execution.ratio.toFixed(3)})`} title="Dólar implícito cedear vs underlying (USD)">
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.hairline} vertical={false} />
            <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
            <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} width={56} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => `$${fmtNum(v, 1)}`} />} />
            <Legend wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.muted }} />
            <Line type="monotone" dataKey="fx_implicit" name="Implícito cedear" stroke={COLORS.doble} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="fx_real" name="Underlying USD" stroke={COLORS.tobogan} strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Panel eyebrow="Brecha" title="Evolución de la brecha que se intenta capturar">
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.doble} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.doble} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={COLORS.hairline} vertical={false} />
              <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
              <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}bps`} width={56} />
              <Tooltip content={<ChartTooltip valueFormatter={fmtBps} />} />
              <ReferenceLine y={0} stroke={COLORS.hairline2} />
              <Area type="monotone" dataKey="gap_bps" name="Brecha" stroke={COLORS.doble} fill="url(#gapGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel eyebrow="Patas" title="Long cedear / short underlying (emparejadas)">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.hairline} vertical={false} />
              <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
              <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.muted }} />
              <ReferenceLine y={0} stroke={COLORS.hairline2} />
              <Bar dataKey="long_qty" name="Long cedear" fill={COLORS.pos} radius={[2, 2, 0, 0]} />
              <Bar dataKey="short_qty" name="Short underlying" fill={COLORS.neg} radius={[0, 0, 2, 2]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
