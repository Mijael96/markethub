# MarketHub — arquitectura

## Cómo correrlo

```bash
npm install
npm run dev      # levanta en http://localhost:5173 con hot reload
npm run build    # genera build de producción en dist/
npm run preview  # sirve el build de producción localmente
```

Requiere Node 18+. No necesita backend ni variables de entorno: todos los
datos son mock generados en el cliente (`src/data`, `src/domain`).

```
src/
  config/
    theme.js                 tokens visuales (colores, fuentes, metadata de marca por conjunto)
  utils/
    formatters.js             funciones puras de formato (fmtARS, fmtBps, fmtTime, ...)
    seededRandom.js            generador determinístico, única pieza de "azar" del sistema
  data/
    staticEntities.js          catálogo de conjuntos/ejecuciones + constantes de sesión
    sessionData.js             acceso memoizado a series por ejecución (capa de "API")
  domain/
    seriesGenerators.js        un generador de serie por tipo de estrategia (Strategy Pattern)
    sessionStats.js            statAt() / getFinalStats(): lógica de negocio pura, sin React
  hooks/
    useSessionClock.js         reloj único de sesión (simIndex / currentTs / sessionDone)
    useLiveTape.js              feed de WebSocket simulado, buffer acotado, jitter por ejecución
  components/
    common/                     piezas reutilizables sin conocimiento de negocio
      Panel.jsx, StatusDot.jsx, PnlTag.jsx, ChartTooltip.jsx, ExecTabs.jsx, ExecutionHeader.jsx
    layout/                     cáscara de la app
      TopBar.jsx, Sidebar.jsx, TickerTape.jsx
    portfolio/                  vista Home, descompuesta en sub-componentes
      PortfolioView.jsx, SetSummaryCard.jsx, PnlComparisonChart.jsx,
      ExecutionHealthList.jsx, LiveTapePanel.jsx
    strategies/                 una vista por tipo de estrategia
      CarniceroView.jsx, ToboganView.jsx, DobleView.jsx, FierroView.jsx
  App.jsx                       composición raíz: layout + reloj + router de vistas por registro
  index.jsx                     entry point (createRoot)
index.html                      HTML raíz que Vite usa como punto de partida
vite.config.js                  configuración de Vite + plugin de React
package.json
```

## Por qué está dividido así (SOLID)

**Single Responsibility.** Cada archivo tiene un único motivo para cambiar:
`formatters.js` solo cambia si cambia el formato de números; `sessionStats.js`
solo cambia si cambia la regla de negocio de PnL; `SetSummaryCard.jsx` solo
cambia si cambia el diseño de esa tarjeta puntual. Antes, todo esto vivía en
un solo archivo de 1000 líneas donde tocar el formato de moneda y tocar el
layout de una tarjeta eran el mismo "blast radius".

**Open/Closed.** Dos puntos de extensión explícitos:
- `GENERATORS_BY_TYPE` (seriesGenerators.js) y `PNL_AT_POINT_BY_TYPE`
  (sessionStats.js): agregar una quinta estrategia es agregar una entrada a
  un mapa, no editar un `if/else` que ya funciona para las otras cuatro.
- `VIEW_REGISTRY` (App.jsx) y `NAV_ITEMS` (Sidebar.jsx): agregar una vista
  nueva al menú es agregar una entrada a un array/objeto.

**Liskov Substitution.** Las 4 vistas de estrategia (`CarniceroView`,
`ToboganView`, `DobleView`, `FierroView`) cumplen el mismo contrato de
props (ninguna recibe props especiales del router) y son intercambiables
entre sí desde el punto de vista de `App.jsx` — todas se montan igual.

**Interface Segregation.** Los componentes de presentación (`SetSummaryCard`,
`PnlComparisonChart`, `ExecutionHealthList`, `LiveTapePanel`) reciben
exactamente los datos que necesitan ya calculados (`pnl`, `trades`,
`isRecentlyActive`...), no objetos de dominio completos con métodos que no
usan. Quien arma esos view-models es `PortfolioView`, no cada tarjeta.

**Dependency Inversion.** Los componentes de presentación no saben de dónde
salen los datos: `getSeriesFor`, `getExecutionsBySet` y `statAt` son la
única puerta de entrada al dominio. Si mañana `data/sessionData.js` se
reemplaza por llamadas reales a un backend, ningún componente de
`components/` se entera ni se modifica.

## Decisión de diseño relevante: el reloj único de sesión

`useSessionClock` vive en `App.jsx` y se pasa hacia abajo solo a las vistas
que lo necesitan (hoy, únicamente `PortfolioView`). Es la pieza que evita
que el dashboard muestre "el futuro" de la sesión: tanto el resumen por
conjunto como el tape en vivo calculan su PnL con `statAt(executionId,
simIndex)`, nunca con el cierre final — así nunca pueden divergir entre sí
ni adelantarse a la hora de sesión simulada.
