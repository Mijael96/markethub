from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..services.trading_service import TradingService
from ..serializers import StrategyBaselineResponseSerializer

class TradingBaselineController(APIView):
    """
    Controlador encargado de exponer el baseline analítico de la sesión,
    gestionando la comunicación HTTP y delegando la lógica al servicio correspondiente.
    """
    def get(self, request, *args, **kwargs):
        # Tiempo simulado por defecto para el corte analítico
        simulation_cutoff = request.query_params.get('cutoff', '2026-06-18T15:00:00Z')
        
        try:
            # Consumimos la lógica de negocio desde la capa de servicios
            baseline_data = TradingService.get_baseline_snapshot(cutoff_time_str=simulation_cutoff)
            
            # Serializamos la respuesta estructurada
            serializer = StrategyBaselineResponseSerializer(baseline_data, many=True)
            response_payload = {
                "simulation_datetime": simulation_cutoff,
                "strategy_sets": serializer.data
            }
            
            return Response(response_payload, status=status.HTTP_200_OK)
            
        except FileNotFoundError as err:
            return Response(
                {
                    "error": "Error de infraestructura: Archivos de datos no encontrados.", 
                    "detail": str(err)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as err:
            return Response(
                {
                    "error": "Error inesperado al procesar el baseline analítico.", 
                    "detail": str(err)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )