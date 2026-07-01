import React, { useEffect } from "react";
import { Radio } from "lucide-react";
import { COLORS, FONT_MONO, SET_META } from "../../config/theme";
import { STRATEGY_SETS } from "../../data/staticEntities";
import { getExecutionsBySet } from "../../data/sessionData";
import { statAt } from "../../domain/sessionStats";
import { useLiveTape } from "../../hooks/useLiveTape";
import { fmtTime } from "../../utils/formatters";

import SetSummaryCard from "./SetSummaryCard";
import PnlComparisonChart from "./PnlComparisonChart";
import ExecutionHealthList from "./ExecutionHealthList";
import LiveTapePanel from "./LiveTapePanel";

/**
 * PortfolioView
 * Responsabilidad única: traducir (dominio + reloj de sesión + tape en vivo)
 * en los view-models que consumen sus hijos. No sabe dibujar tarjetas,
 * gráficos ni tablas — eso lo delega. Si mañana cambia el layout del home,
 * se edita acá sin tocar la lógica de negocio ni los componentes hijos.
 */
export default function PortfolioView({ onSelectSet, simIndex, currentTs }) {
  const { tape, getJitterFor, isSetRecentlyActive, tapeMax } = useLiveTape(simIndex);

  const pnlAt = (executionId) => statAt(executionId, simIndex).pnl + getJitterFor(executionId);

  const setSummaries = STRATEGY_SETS.map((set) => {
    const executions = getExecutionsBySet(set.id);
    const pnl = executions.reduce((acc, e) => acc + pnlAt(e.id), 0);
    const trades = executions.reduce((acc, e) => acc + statAt(e.id, simIndex).trades, 0);
    const running = executions.filter((e) => e.status === "running").length;
    return { set, executions, pnl, trades, running };
  });

  const comparisonData = setSummaries.map((s) => ({
    name: SET_META[s.set.id].short,
    pnl: s.pnl,
    fill: SET_META[s.set.id].color,
  }));

  const healthRows = STRATEGY_SETS.flatMap((set) =>
    getExecutionsBySet(set.id).map((execution) => {
      const stats = statAt(execution.id, simIndex);
      return { execution, pnl: pnlAt(execution.id), trades: stats.trades, winRate: stats.win_rate };
    })
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONT_MONO, fontSize: 11, color: COLORS.pos }}>
        <Radio size={13} />
        <span>HORA DE SESIÓN {fmtTime(currentTs)} — pulso en vivo, buffer de tape acotado a {tapeMax} eventos</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {setSummaries.map(({ set, executions, pnl, trades, running }) => (
          <SetSummaryCard
            key={set.id}
            set={set}
            executionCount={executions.length}
            runningCount={running}
            totalTrades={trades}
            pnl={pnl}
            isRecentlyActive={isSetRecentlyActive(set.id)}
            onClick={() => onSelectSet(set.id)}
          />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 14 }}>
        <PnlComparisonChart data={comparisonData} currentTs={currentTs} />
        <ExecutionHealthList rows={healthRows} currentTs={currentTs} />
      </div>

      <LiveTapePanel tape={tape} />
    </div>
  );
}
