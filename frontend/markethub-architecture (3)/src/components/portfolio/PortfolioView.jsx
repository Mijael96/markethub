import React, { useEffect } from "react";
import { Radio } from "lucide-react";
import { COLORS, FONT_MONO, SET_META } from "../../config/theme";
import { getExecutionsBySet } from "../../data/sessionData";
import { statAt } from "../../domain/sessionStats";
import { useLiveTape } from "../../hooks/useLiveTape";
import { fmtTime } from "../../utils/formatters";

import SetSummaryCard from "./SetSummaryCard";
import PnlComparisonChart from "./PnlComparisonChart";
import ExecutionHealthList from "./ExecutionHealthList";
import LiveTapePanel from "./LiveTapePanel";
import { fmtDate, fmtTimeSession } from "../../utils/formatters";

/**
 * PortfolioView
 * Responsabilidad única: traducir (dominio + reloj de sesión + tape en vivo)
 * en los view-models que consumen sus hijos. No sabe dibujar tarjetas,
 * gráficos ni tablas — eso lo delega. Si mañana cambia el layout del home,
 * se edita acá sin tocar la lógica de negocio ni los componentes hijos.
 */
export default function PortfolioView({
  onSelectSet,
  simIndex,
  currentTs,
  simulationDatetime,
  strategySets,
  historicalTrades
}) {
  const { tape, getJitterFor, isSetRecentlyActive, tapeMax } =
    useLiveTape(simIndex);

  const pnlAt = (executionId) =>
    statAt(executionId, simIndex).pnl + getJitterFor(executionId);

  const setSummaries = strategySets.map((set) => {
    const executions = set.executions ?? [];
    return {
      set,
      executions,
    };
  });

  const comparisonData = strategySets.map((set) => ({
    name: set.name,
    pnl: set.baseline_pnl,
    fill: SET_META[set.id]?.color,
  }));

  const healthRows = strategySets.flatMap((set) =>
    set.executions.map((execution) => ({
      execution,
      strategyId: set.id,
      pnl: execution.total_pnl,
      trades: execution.total_trades,
    }))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: FONT_MONO,
          fontSize: 11,
          color: COLORS.pos,
        }}
      >
        <Radio size={13} />
        <span>
          HORA DE SESIÓN {fmtTimeSession(simulationDatetime)} — pulso en vivo
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        {setSummaries.map(({ set, executions, pnl, trades, running }) => (
          <SetSummaryCard
            key={set.id}
            set={set}
            executionCount={set.total_executions}
            runningCount={set.active_executions}
            totalTrades={set.baseline_trades}
            pnl={set.baseline_pnl}
          />
        ))}
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 14 }}
      >
        <PnlComparisonChart data={comparisonData} simulationDateTime={simulationDatetime} />
        <ExecutionHealthList rows={healthRows} currentTs={currentTs} />
      </div>

      <LiveTapePanel trades={historicalTrades} />
    </div>
  );
}
