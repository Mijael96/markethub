/**
 * sessionData.js
 * Punto único donde se materializan las series de toda la sesión, una vez,
 * a partir del catálogo de ejecuciones + los generadores por tipo.
 * Cualquier componente que necesite la serie de una ejecución la pide acá
 * (getSeriesFor) en vez de regenerarla — single source of truth.
 */

import { EXECUTIONS } from "./staticEntities";
import { generateSeriesFor } from "../domain/seriesGenerators";

const seriesByExecutionId = EXECUTIONS.reduce((acc, exec) => {
  acc[exec.id] = generateSeriesFor(exec);
  return acc;
}, {});

export function getSeriesFor(executionId) {
  const series = seriesByExecutionId[executionId];
  if (!series) throw new Error(`No existe serie para la ejecución "${executionId}"`);
  return series;
}

export function getExecutionsBySet(setId) {
  return EXECUTIONS.filter((e) => e.set_id === setId);
}

export function getExecutionById(executionId) {
  const exec = EXECUTIONS.find((e) => e.id === executionId);
  if (!exec) throw new Error(`No existe la ejecución "${executionId}"`);
  return exec;
}
