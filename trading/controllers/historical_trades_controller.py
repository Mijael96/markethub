from pathlib import Path


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


from ..repositories.json_repository import (
    JsonRepository
)


from ..services.historical_trades_service import (
    HistoricalTradesService
)


from ..serializers import (
    HistoricalTradeSerializer
)




class HistoricalTradesController(APIView):


    def get(
        self,
        request,
        *args,
        **kwargs
    ):


        cutoff = request.query_params.get(

            "cutoff",

            "2026-06-18T15:00:00Z"

        )



        try:

            limit = int(

                request.query_params.get(
                    "limit",
                    40
                )

            )

        except ValueError:

            limit = 40



        try:


            repository = JsonRepository(

                Path(
                    "trading/data"
                )

            )


            service = HistoricalTradesService(

                repository

            )


            trades = (

                service.get_latest_trades(

                    cutoff_time=cutoff,

                    limit=limit

                )

            )


            serializer = HistoricalTradeSerializer(

                trades,

                many=True

            )



            return Response(

                {

                    "simulation_cutoff":

                        cutoff,


                    "limit_applied":

                        limit,


                    "trades":

                        serializer.data

                },


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


                status=500

            )


        except Exception as err:


            return Response(

                {

                    "error":
                        str(err)

                },


                status=500

            )