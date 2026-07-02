from dataclasses import dataclass, asdict


@dataclass
class ExecutionBaseline:

    exec_id: str
    name: str
    status: str
    total_trades: int

    realized_pnl: float
    unrealized_pnl: float
    total_pnl: float


    def to_dict(self):

        return asdict(self)



@dataclass
class StrategyBaseline:

    id: str
    name: str
    type: str
    display_type: str
    description: str

    baseline_pnl: float
    baseline_trades: int

    total_executions: int
    active_executions: int

    executions: list


    def to_dict(self):

        return {

            "id":
                self.id,

            "name":
                self.name,

            "type":
                self.type,

            "display_type":
                self.display_type,

            "description":
                self.description,

            "baseline_pnl":
                self.baseline_pnl,

            "baseline_trades":
                self.baseline_trades,

            "total_executions":
                self.total_executions,

            "active_executions":
                self.active_executions,

            "executions":
                [
                    execution.to_dict()
                    for execution in self.executions
                ]
        }