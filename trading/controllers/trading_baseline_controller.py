from pathlib import Path

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ..repositories.json_repository import JsonRepository
from ..services.trading_service import BaselineService
from ..serializers import StrategyBaselineResponseSerializer



class TradingBaselineController(APIView):


    def get(self, request, *args, **kwargs):

        simulation_cutoff = request.query_params.get(
            'cutoff',
            '2026-06-18T15:00:00Z'
        )


        try:

            repository = JsonRepository(
                Path("trading/data")
            )


            baseline_service = BaselineService(
                repository
            )


            baseline_data = (
                baseline_service.build_snapshot(
                    cutoff_time=simulation_cutoff
                )
            )


            serializer = StrategyBaselineResponseSerializer(
                baseline_data,
                many=True
            )


            response_payload = {

                "simulation_datetime":
                    simulation_cutoff,

                "strategy_sets":
                    serializer.data
            }


            return Response(
                response_payload,
                status=status.HTTP_200_OK
            )


        except FileNotFoundError as err:

            return Response(

                {
                    "error":
                        "Archivos de datos no encontrados",

                    "detail":
                        str(err)
                },

                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


        except Exception as err:

            return Response(

                {
                    "error":
                        str(err)
                },

                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )