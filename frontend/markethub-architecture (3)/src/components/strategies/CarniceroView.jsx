import React, { useState } from "react";
import { AreaChart, Area, ComposedChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { COLORS, FONT_MONO } from "../../config/theme";
import { getExecutionsBySet, getExecutionById } from "../../data/sessionData";
import { getSeriesFor } from "../../data/sessionData";
import { getFinalStats } from "../../domain/sessionStats";
import Panel from "../common/Panel";
import ChartTooltip from "../common/ChartTooltip";
import ExecTabs from "../common/ExecTabs";
import ExecutionHeader from "../common/ExecutionHeader";
import { fmtARS, fmtBps, fmtPct, fmtNum, fmtTime } from "../../utils/formatters";

const SET_ID = "set-carnicero";

export default function CarniceroView() {
  const executions = getExecutionsBySet(SET_ID);
  const [selectedId, setSelectedId] = useState(executions[0].id);
  const execution = getExecutionById(selectedId);
  const series = getSeriesFor(selectedId);
  const stats = getFinalStats(selectedId);

  const fillFlowData = series.map((p) => ({ ts: p.ts, buy: p.trades_buy, sell: -p.trades_sell }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ExecTabs executions={executions} selectedId={selectedId} onSelect={setSelectedId} accentColor={COLORS.carnicero} />
      <ExecutionHeader
        execution={execution}
        totalPnl={stats.total_pnl}
        totalTrades={stats.total_trades}
        winRate={stats.win_rate}
        accentColor={COLORS.carnicero}
        metrics={[
          { label: "Spread capturado", value: fmtBps(stats.metrics.spread_capturado_bps) },
          { label: "Fill rate", value: fmtPct(stats.metrics.fill_rate) },
          { label: "Cancel ratio", value: fmtPct(stats.metrics.cancel_ratio) },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14 }}>
        <Panel eyebrow={execution.instrument} title="Inventario neto (oscila cerca de 0)">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.carnicero} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLORS.carnicero} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={COLORS.hairline} vertical={false} />
              <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
              <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtNum(v / 1000) + "K"} width={54} />
              <Tooltip content={<ChartTooltip valueFormatter={(v) => fmtNum(v)} />} />
              <ReferenceLine y={0} stroke={COLORS.hairline2} strokeDasharray="3 3" label={{ value: "flat", fill: COLORS.mutedDim, fontSize: 10, position: "insideTopLeft" }} />
              <Area type="monotone" dataKey="net_qty" name="Inventario" stroke={COLORS.carnicero} fill="url(#invGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel eyebrow="PnL" title="Realizado vs no realizado">
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.hairline} vertical={false} />
              <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
              <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtARS} width={56} />
              <Tooltip content={<ChartTooltip valueFormatter={fmtARS} />} />
              <Legend wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.muted }} />
              <Line type="monotone" dataKey="realized" name="Realizado" stroke={COLORS.pos} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="unrealized" name="No realizado" stroke={COLORS.doble} strokeWidth={2} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="total" name="Total" stroke={COLORS.hi} strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel eyebrow="Flujo de fills" title="Compras vs ventas ejecutadas por intervalo">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={fillFlowData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.hairline} vertical={false} />
            <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={{ stroke: COLORS.hairline }} tickLine={false} />
            <YAxis tick={{ fill: COLORS.mutedDim, fontFamily: FONT_MONO, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={0} stroke={COLORS.hairline2} />
            <Bar dataKey="buy" name="Compras" fill={COLORS.pos} radius={[2, 2, 0, 0]} />
            <Bar dataKey="sell" name="Ventas" fill={COLORS.neg} radius={[0, 0, 2, 2]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
