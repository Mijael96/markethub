/**
 * theme.js
 * Única fuente de verdad para tokens visuales (colores, tipografías).
 * Ningún componente debe definir un color "a mano": todos importan de acá.
 * Esto es lo que permite, por ejemplo, cambiar la paleta completa de la app
 * tocando un solo archivo (Open/Closed: el resto del código no se modifica).
 */

export const FONT_DISPLAY = `"Space Grotesk", "Inter", system-ui, sans-serif`;
export const FONT_MONO = `"IBM Plex Mono", "JetBrains Mono", ui-monospace, "SF Mono", monospace`;
export const FONT_BODY = `"Inter", system-ui, sans-serif`;

export const COLORS = {
  bg: "#0A0C10",
  panel: "#14171D",
  raised: "#1B2027",
  hairline: "#242931",
  hairline2: "#2E343D",
  hi: "#ECEAE4",
  muted: "#888F9C",
  mutedDim: "#5C6270",
  carnicero: "#E4572E",
  tobogan: "#2EC4B6",
  doble: "#E8AA42",
  fierro: "#FF4D4D",
  pos: "#3DDC84",
  neg: "#FF5C5C",
};

/**
 * Metadata visual por conjunto de estrategias (color de marca, ícono, labels).
 * Vive acá y no en los componentes para que agregar un quinto conjunto
 * sea un cambio de datos, no de código (Open/Closed Principle).
 */
import { Beef, Waves, GitCompareArrows, Flame } from "lucide-react";

export const SET_META = {
  "set-carnicero": { color: COLORS.carnicero, icon: Beef, short: "Carnicero", label: "Market Making Bonos/Cedears" },
  "set-tobogan": { color: COLORS.tobogan, icon: Waves, short: "Tobogán", label: "Arbitraje Dólar/Cable" },
  "set-doble": { color: COLORS.doble, icon: GitCompareArrows, short: "Doble o Nada", label: "Arbitraje Cedear/Underlying" },
  "set-fierro": { color: COLORS.fierro, icon: Flame, short: "Fierro Caliente", label: "Trend/Momentum Futuros" },
};
