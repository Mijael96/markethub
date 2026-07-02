import React, { useState } from "react";
import { COLORS, FONT_BODY } from "./config/theme";
import { useSessionClock } from "./hooks/useSessionClock";
import { useBaseline } from "./hooks/useBaseline";
import { useHistoricalTrades } from "./hooks/useHistoricalTrades";
import { useSimulationSocket } from "./hooks/useSimulationSocket";

import TopBar from "./components/layout/TopBar";
import Sidebar from "./components/layout/Sidebar";

import PortfolioView from "./components/portfolio/PortfolioView";
import CarniceroView from "./components/strategies/CarniceroView";
import ToboganView from "./components/strategies/ToboganView";
import DobleView from "./components/strategies/DobleView";
import FierroView from "./components/strategies/FierroView";

const VIEW_REGISTRY = {
  portfolio: PortfolioView,
  "set-carnicero": CarniceroView,
  "set-tobogan": ToboganView,
  "set-doble": DobleView,
  "set-fierro": FierroView,
};

export default function App() {
  const [activeView, setActiveView] = useState("portfolio");

  const [tick, setTick] = useState(0);

  const { simIndex, currentTs } = useSessionClock();

  const { baseline } = useBaseline();

  const { trades } = useHistoricalTrades();

  const { tickFromSocket, isConnected } = useSimulationSocket();

  const [liveTrades, setLiveTrades] = React.useState([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    setLiveTrades(trades);
  }, [trades]);

  React.useEffect(() => {
    if (!tickFromSocket?.new_trades?.length) {
      return;
    }

    setLiveTrades(previous => {
      const map = new Map();
  
      [...tickFromSocket.new_trades, ...previous].forEach(trade => {
          map.set(trade.id, trade);
      });
  
      return [...map.values()]
          .sort((a, b) => new Date(b.ts) - new Date(a.ts))
          .slice(0, 40);
    });
  }, [tickFromSocket]);

  const ActiveViewComponent = VIEW_REGISTRY[activeView] ?? PortfolioView;

  const simulationDatetime =
    tickFromSocket?.simulated_time_iso ?? baseline?.simulation_datetime;

  const strategySets =
    tickFromSocket?.strategy_sets ?? baseline?.strategy_sets ?? [];

  // const liveTrades = tickFromSocket?.new_trades ?? trades ?? [];

  const viewProps =
    activeView === "portfolio"
      ? {
          onSelectSet: setActiveView,
          simIndex,
          currentTs,
          simulationDatetime: simulationDatetime,
          strategySets,
          historicalTrades: liveTrades,
        }
      : {};

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        color: COLORS.hi,
        fontFamily: FONT_BODY,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar currentTs={currentTs} simulationDatetime={simulationDatetime} />

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar activeView={activeView} onSelectView={setActiveView} />

        <div
          style={{
            flex: 1,
            padding: 20,
            overflowX: "hidden",
          }}
        >
          <ActiveViewComponent {...viewProps} />
        </div>
      </div>

      <GlobalStyles />
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`

::-webkit-scrollbar {
 width:8px;
 height:8px;
}


::-webkit-scrollbar-thumb {
 background:${COLORS.hairline2};
 border-radius:4px;
}


::-webkit-scrollbar-track {
 background:transparent;
}


button:focus-visible {

 outline:
 2px solid ${COLORS.tobogan};

 outline-offset:1px;

}


@media (prefers-reduced-motion: reduce){

 *[style*="animation"]{

 animation:none !important;

 }

}

`}</style>
  );
}
