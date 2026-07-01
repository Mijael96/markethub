from dataclasses import dataclass


@dataclass
class SimulationTick:

    simulated_time: str
    simulated_time_iso: str

    is_finished: bool

    strategy_sets: list

    new_trades: list


    def to_dict(self):

        return {
            "event_type": "simulation_tick",

            "simulated_time":
                self.simulated_time,

            "simulated_time_iso":
                self.simulated_time_iso,

            "is_finished":
                self.is_finished,

            "strategy_sets":
            [
                strategy.to_dict()
                for strategy in self.strategy_sets
            ],

            "new_trades":
                self.new_trades
        }