import { useEffect, useRef, useState } from "react";

const WS_URL = "ws://127.0.0.1:8000/ws/trading/simulation/";
const CONNECT_DELAY_MS = 10_000;

export function useSimulationSocket() {
  const socketRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [tickFromSocket, setTickFromSocket] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const socket = new WebSocket(WS_URL);

      socketRef.current = socket;

      socket.onopen = () => {
        console.info("[Simulation WS] Connected");
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        setTickFromSocket(payload);
      };

      socket.onerror = (err) => {
        console.error("[Simulation WS]", err);
      };

      socket.onclose = () => {
        console.info("[Simulation WS] Closed");
        setIsConnected(false);
      };
    }, CONNECT_DELAY_MS);

    return () => {
      clearTimeout(timer);

      socketRef.current?.close();
    };
  }, []);

  return {
    isConnected,
    tickFromSocket,
  };
}