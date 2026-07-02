from dataclasses import dataclass, asdict


@dataclass
class HistoricalTradeDTO:

    id: str
    ts: str
    time_str: str

    exec_id: str
    exec_name: str

    symbol: str
    side: str

    qty: float
    price: float

    realized_pnl: float


    def to_dict(self):

        return asdict(self)