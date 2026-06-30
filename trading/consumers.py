import asyncio
import logging
from datetime import datetime, timedelta
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .services.trading_service import TradingService

logger = logging.getLogger("MarketHubSimulator")

class TradingSimulationConsumer(AsyncJsonWebsocketConsumer):
    """
    Consumer de WebSockets encargado de controlar el reloj virtual de la sesión,
    avanzando de forma automática 10 minutos virtuales por cada 10 segundos reales.
    Empuja actualizaciones en tiempo real de métricas y trades ejecutados.
    """

    async def connect(self):
        """
        Evento disparado cuando el frontend inicia el handshake de conexión.
        """
        await self.accept()
        self.is_running = True
        
        # Iniciamos el bucle asincrónico de simulación en segundo plano
        self.simulation_task = asyncio.create_task(self.run_simulation())
        logger.info("Operador conectado. Simulación de sesión de trading iniciada.")

    async def disconnect(self, close_code):
        """
        Evento disparado al cerrar la pestaña o desconectarse el canal de comunicación.
        """
        self.is_running = False
        if hasattr(self, 'simulation_task'):
            self.simulation_task.cancel()
        logger.info(f"Operador desconectado. Código de cierre: {close_code}. Simulación detenida.")

    async def run_simulation(self):
        """
        Bucle asíncrono que avanza el reloj, calcula el estado analítico temporal 
        y filtra las operaciones correspondientes al delta temporal actual.
        """
        # Horarios límites de la simulación en formato timezone-aware (+00:00)
        simulated_time = datetime.fromisoformat("2026-06-18T15:00:00+00:00")
        target_end_time = datetime.fromisoformat("2026-06-18T20:00:00+00:00")
        
        # Mantenemos registro de cuándo fue la última actualización para saber qué trades capturar
        prev_simulated_time = simulated_time - timedelta(seconds=1)

        try:
            while self.is_running and simulated_time <= target_end_time:
                # Convertimos el timestamp actual a string para interactuar con la capa de servicio
                cutoff_str = simulated_time.strftime("%Y-%m-%dT%H:%M:%SZ")
                
                # 1. Obtenemos la snapshot de las estrategias al corte temporal usando el servicio base
                strategy_sets = TradingService.get_baseline_snapshot(cutoff_time_str=cutoff_str)
                
                # 2. Cargamos metadatos de las ejecuciones para enriquecer el listado en vivo
                stats_raw = TradingService._load_json_file('stats.json')
                stats_by_exec = {stat['exec_id']: stat['name'] for stat in stats_raw}

                # 3. Identificamos los nuevos trades ejecutados estrictamente dentro de esta porción de tiempo
                all_trades = TradingService._load_json_file('trades.json')
                new_trades_list = []

                for trade in all_trades:
                    trade_ts = TradingService._parse_timestamp(trade['ts'])
                    # Verificamos si el trade cayó en el intervalo (prev_simulated_time, simulated_time]
                    if prev_simulated_time < trade_ts <= simulated_time:
                        exec_id = trade.get('exec_id')
                        exec_name = stats_by_exec.get(exec_id, "Estrategia Desconocida")
                        
                        # SOLUCIÓN CRÍTICA: Intentamos obtener 'realized_pnl', si no existe 'pnl', de lo contrario 0.0
                        raw_pnl = trade.get("realized_pnl", trade.get("pnl", 0.0))
                        
                        new_trades_list.append({
                            "id": trade.get("id", f"T-{trade_ts.timestamp()}"),
                            "ts": trade.get("ts"),
                            "time_str": trade_ts.strftime("%H:%M:%S"),
                            "exec_id": exec_id,
                            "exec_name": exec_name,
                            "symbol": trade.get("symbol"),
                            "side": trade.get("side"),
                            "qty": trade.get("qty"),
                            "price": trade.get("price"),
                            "realized_pnl": raw_pnl  # <-- Ahora viaja el PnL correcto
                        })

                # Empujamos todo el payload unificado al front-end por medio del websocket
                await self.send_json({
                    "event_type": "simulation_tick",
                    "simulated_time": simulated_time.strftime("%H:%M:%S"),
                    "simulated_time_iso": cutoff_str,
                    "is_finished": simulated_time >= target_end_time,
                    "strategy_sets": strategy_sets,
                    "new_trades": new_trades_list
                })

                # Si ya alcanzamos las 20:00:00, rompemos el bucle y detenemos la simulación
                if simulated_time >= target_end_time:
                    logger.info("Se ha alcanzado la hora de fin de sesión (20:00:00). Deteniendo simulación.")
                    break

                # Guardamos el tiempo actual de corte como el previo del siguiente ciclo
                prev_simulated_time = simulated_time
                
                # Avanzamos el reloj virtual 10 minutos
                simulated_time += timedelta(minutes=10)
                
                # Dormimos 10 segundos reales de forma no bloqueante
                await asyncio.sleep(10.0)

        except asyncio.CancelledError:
            logger.info("La tarea de simulación ha sido cancelada exitosamente.")
        except Exception as err:
            logger.error(f"Error inesperado en la tarea de simulación: {str(err)}")
            await self.send_json({
                "event_type": "error",
                "message": "Error interno en el motor de simulación en vivo.",
                "detail": str(err)
            })