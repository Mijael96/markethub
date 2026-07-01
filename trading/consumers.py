import asyncio
import logging
from pathlib import Path


from channels.generic.websocket import (
    AsyncJsonWebsocketConsumer
)


from trading.repositories.json_repository import (
    JsonRepository
)


from trading.services.trading_service import (
    BaselineService
)


from trading.services.simulation_service import (
    SimulationService
)



logger = logging.getLogger(
    "MarketHubSimulator"
)



class TradingSimulationConsumer(
    AsyncJsonWebsocketConsumer
):


    async def connect(self):

        await self.accept()


        repository = JsonRepository(
            Path("trading/data")
        )


        self.simulation = SimulationService(

            repository,

            BaselineService(
                repository
            )
        )


        self.running = True


        self.task = asyncio.create_task(
            self.start_simulation()
        )



    async def disconnect(
        self,
        close_code
    ):


        self.running = False


        if hasattr(
            self,
            "task"
        ):

            self.task.cancel()



    async def start_simulation(self):

        try:

            await self.simulation.run(
                self.send_json
            )


        except asyncio.CancelledError:

            logger.info(
                "Simulación cancelada"
            )


        except Exception as e:

            logger.exception(e)


            await self.send_json({

                "event_type":
                    "error",

                "message":
                    "Error en simulador"
            })