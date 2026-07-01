from datetime import datetime, timedelta

from trading.dto.simulation import (
    SimulationTick
)



class SimulationService:


    def __init__(
        self,
        repository,
        baseline_service
    ):

        self.repository = repository

        self.baseline_service = (
            baseline_service
        )



    async def run(self, callback):

        simulated_time = (
            datetime.fromisoformat(
                "2026-06-18T15:00:00+00:00"
            )
        )


        end_time = (
            datetime.fromisoformat(
                "2026-06-18T20:00:00+00:00"
            )
        )


        previous_time = (
            simulated_time -
            timedelta(seconds=1)
        )


        while simulated_time <= end_time:


            tick = (
                self._generate_tick(
                    simulated_time,
                    previous_time,
                    end_time
                )
            )


            await callback(
                tick.to_dict()
            )


            if simulated_time >= end_time:
                break


            previous_time = simulated_time


            simulated_time += (
                timedelta(minutes=10)
            )


            await self._sleep()



    async def _sleep(self):

        import asyncio

        await asyncio.sleep(10)



    def _generate_tick(
        self,
        current_time,
        previous_time,
        end_time
    ):


        cutoff = (
            current_time.strftime(
                "%Y-%m-%dT%H:%M:%SZ"
            )
        )


        strategies = (
            self.baseline_service
            .build_snapshot(
                cutoff
            )
        )


        trades = (
            self._get_new_trades(
                previous_time,
                current_time
            )
        )


        return SimulationTick(

            simulated_time=
                current_time.strftime(
                    "%H:%M:%S"
                ),


            simulated_time_iso=
                cutoff,


            is_finished=
                current_time >= end_time,


            strategy_sets=
                strategies,


            new_trades=
                trades
        )



    def _get_new_trades(
        self,
        start,
        end
    ):


        trades = (
            self.repository
            .get(
                "trades.json"
            )
        )


        stats = (
            self.repository
            .get(
                "stats.json"
            )
        )


        names = {
            x["exec_id"]:
            x["name"]

            for x in stats
        }


        result = []


        for trade in trades:


            timestamp = (
                datetime.fromisoformat(
                    trade["ts"]
                    .replace(
                        "Z",
                        "+00:00"
                    )
                )
            )


            if start < timestamp <= end:


                result.append({

                    "id":
                        trade.get(
                            "id",
                            f"T-{timestamp.timestamp()}"
                        ),


                    "ts":
                        trade["ts"],


                    "time_str":
                        timestamp.strftime(
                            "%H:%M:%S"
                        ),


                    "exec_id":
                        trade["exec_id"],


                    "exec_name":
                        names.get(
                            trade["exec_id"],
                            "Desconocida"
                        ),


                    "symbol":
                        trade.get(
                            "symbol"
                        ),


                    "side":
                        trade.get(
                            "side"
                        ),


                    "qty":
                        trade.get(
                            "qty"
                        ),


                    "price":
                        trade.get(
                            "price"
                        ),


                    "realized_pnl":
                        trade.get(
                            "realized_pnl",
                            trade.get(
                                "pnl",
                                0
                            )
                        )
                })


        return result