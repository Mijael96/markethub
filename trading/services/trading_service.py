import os
import json
from datetime import datetime

class TradingService:
    # Obtiene la ruta de este archivo (trading/services/trading_service.py)
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    # Sube un nivel de directorio a 'trading/' y luego accede a 'data/'
    DATA_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..', 'data'))

    @classmethod
    def _load_json_file(cls, filename):
        """
        Método auxiliar para leer archivos de datos de forma segura
        dentro del directorio 'trading/data/'.
        """
        filepath = os.path.join(cls.DATA_DIR, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"El archivo de datos {filename} no existe en {cls.DATA_DIR}")
        
        with open(filepath, 'r', encoding='utf-8') as file:
            return json.load(file)

    @staticmethod
    def _parse_timestamp(ts_str):
        """
        Parsea un string ISO 8601 a un objeto datetime nativo de Python para comparar tiempos.
        """
        return datetime.fromisoformat(ts_str.replace('Z', '+00:00'))

    @classmethod
    def get_baseline_snapshot(cls, cutoff_time_str="2026-06-18T15:00:00Z"):
        """
        Lógica de negocio principal para agrupar y calcular la foto inicial (baseline)
        de la sesión consolidando únicamente lo ejecutado antes del límite de simulación.
        """
        cutoff_time = cls._parse_timestamp(cutoff_time_str)

        # Cargar los datasets crudos desde la carpeta de datos
        strategy_sets = cls._load_json_file('strategy_sets.json')
        stats = cls._load_json_file('stats.json')
        pnl_series = cls._load_json_file('pnl.json')
        trades = cls._load_json_file('trades.json')

        # Agrupar estadísticas generales por ID de ejecución para búsquedas rápidas O(1)
        stats_by_exec = {stat['exec_id']: stat for stat in stats}

        # Calcular el PnL acumulado más reciente para cada ejecución hasta el corte temporal
        pnl_by_exec = {}
        for pnl_point in pnl_series:
            pnl_ts = cls._parse_timestamp(pnl_point['ts'])
            if pnl_ts <= cutoff_time:
                exec_id = pnl_point['exec_id']
                # Mantener solo el punto temporal de PnL más cercano al límite fijado
                if exec_id not in pnl_by_exec or pnl_ts > cls._parse_timestamp(pnl_by_exec[exec_id]['ts']):
                    pnl_by_exec[exec_id] = pnl_point

        # Agrupar y contar los trades reales ejecutados hasta antes del tiempo de corte
        trades_count_by_exec = {}
        for trade in trades:
            trade_ts = cls._parse_timestamp(trade['ts'])
            if trade_ts <= cutoff_time:
                exec_id = trade['exec_id']
                trades_count_by_exec[exec_id] = trades_count_by_exec.get(exec_id, 0) + 1

        response_payload = []

        # Recorrer la jerarquía comercial para realizar el mapeo y agregación de métricas
        for s_set in strategy_sets:
            set_id = s_set['id']
            execution_ids = s_set.get('execution_ids', [])

            consolidated_pnl = 0.0
            consolidated_trades = 0
            executions_list = []

            for exec_id in execution_ids:
                stat_metadata = stats_by_exec.get(exec_id)
                if not stat_metadata:
                    continue

                # Obtener el último estado de PnL calculado para este intervalo de tiempo
                pnl_state = pnl_by_exec.get(exec_id, {
                    "realized": 0.0,
                    "unrealized": 0.0,
                    "total": 0.0
                })

                # Obtener trades históricos completados antes de las 15:00:00
                historical_trades = trades_count_by_exec.get(exec_id, 0)

                # Acumular montos para los totales del set estratégico global (las tarjetas del front)
                consolidated_pnl += pnl_state.get('total', pnl_state.get('total_pnl', 0.0))
                consolidated_trades += historical_trades
                
                # Mapear desagregado de salud por ejecución individual
                executions_list.append({
                    "exec_id": exec_id,
                    "name": stat_metadata['name'],
                    "status": stat_metadata['status'],
                    "total_trades": historical_trades,
                    "realized_pnl": pnl_state.get('realized', 0.0),
                    "unrealized_pnl": pnl_state.get('unrealized', 0.0),
                    "total_pnl": pnl_state.get('total', 0.0)
                })

            total_executions = len(executions_list)
            active_executions = sum(1 for execution in executions_list if execution['status'] == 'running')

            # Añadir caja global estructurada
            response_payload.append({
                "id": set_id,
                "name": s_set['name'],
                "type": s_set['type'],
                "display_type": s_set['display_type'],
                "description": s_set['description'],
                "baseline_pnl": round(consolidated_pnl, 2),
                "baseline_trades": consolidated_trades,
                "total_executions": total_executions,
                "active_executions": active_executions,
                "executions": executions_list
            })

        return response_payload