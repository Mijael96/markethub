import React, { useMemo, useState } from "react";
import { ComposedChart, Line, Scatter, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { COLORS, FONT_MONO } from "../../config/theme";
import { getExecutionsBySet, getExecutionById, getSeriesFor } from "../../data/sessionData";
import { getFinalStats } from "../../domain/sessionStats";
import Panel from "../common/Panel";
import ChartTooltip from "../common/ChartTooltip";
import ExecTabs from "../common/ExecTabs";
import ExecutionHeader from "../common/ExecutionHeader";
import { fmtARS, fmtPct, fmtNum, fmtTime } from "../../utils/formatters";

const SET_ID = "set-fierro";

/** Detecta cruces de signo en la posición para marcar entradas long/short sobre el precio. */
function withEntrySignals(series) {
  return series.map((point, i) => {
    const prev = series[i - 1];
    let signal = null;
    if (prev && Math.sign(prev.position) !== Math.sign(point.position) && point.position !== 0) {
      signal = point.position > 0 ? "entry-long" : "entry-short";
    }
    return { ...point, signal };
  });
}

export default function FierroView() {
  const executions = getExecutionsBySet(SET_ID);
  const [selectedId, setSelectedId] = useState(executions[0].id);
  const execution = getExecutionById(selectedId);
  const series = getSeriesFor(selectedId);
  const stats = getFinalStats(selectedId);
  const entryExitSeries = useMemo(() => withEntrySignals(series), [series]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ExecTabs executions={executions} selectedId={selectedId} onSelect={setSelectedId} accentColor={COLORS.fierro} />
      <ExecutionHeader
        execution={execution}
        totalPnl={stats.total_pnl}
        totalTrades={stats.total_trades}
        winRate={stats.win_rate}
        accentColor={COLORS.fierro}
        metrics={[
          { label: "Max drawdown", value: fmtARS(stats.metrics.max_drawdown) },
          { label: "Sharpe", value: stats.metrics.sharpe.toFixed(2) },
          { label: "Exposición/límite", value: fmtPct(stats.metrics.exposure_pct) },
        ]}
      />

      <Panel eyebrow={execution.instrument} title="Precio con entradas y salidas direccionales">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={entryExitSeries} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.hairline} vertical={false} />
            <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
            <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} width={56} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => `$${fmtNum(v, 1)}`} />} />
            <Line type="monotone" dataKey="price" name="Precio" stroke={COLORS.hi} strokeWidth={1.5} dot={false} />
            <Scatter dataKey={(d) => (d.signal === "entry-long" ? d.price : null)} name="Entrada long" fill={COLORS.pos} shape="triangle" />
            <Scatter dataKey={(d) => (d.signal === "entry-short" ? d.price : null)} name="Entrada short" fill={COLORS.neg} shape="triangle" />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Panel eyebrow="Posición" title="Exposición direccional vs límite">
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.fierro} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.fierro} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={COLORS.hairline} vertical={false} />
              <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
              <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtNum(v / 1e6, 1) + "M"} width={56} />
              <Tooltip content={<ChartTooltip valueFormatter={fmtARS} />} />
              <ReferenceLine y={execution.limit} stroke={COLORS.mutedDim} strokeDasharray="3 3" />
              <ReferenceLine y={-execution.limit} stroke={COLORS.mutedDim} strokeDasharray="3 3" />
              <ReferenceLine y={0} stroke={COLORS.hairline2} />
              <Area type="stepAfter" dataKey="position" name="Posición" stroke={COLORS.fierro} fill="url(#posGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel eyebrow="Curva de equity" title="PnL con drawdown marcado">
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.hairline} vertical={false} />
              <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
              <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtARS} width={56} />
              <Tooltip content={<ChartTooltip valueFormatter={fmtARS} />} />
              <Line type="monotone" dataKey="peak" name="Pico" stroke={COLORS.mutedDim} strokeWidth={1} dot={false} strokeDasharray="2 3" />
              <Line type="monotone" dataKey="pnl" name="PnL" stroke={COLORS.fierro} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
