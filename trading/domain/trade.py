from dataclasses import dataclass
from datetime import datetime


@dataclass
class Trade:

    id: str
    exec_id: str
    symbol: str
    side: str
    qty: float
    price: float
    realized_pnl: float
    timestamp: datetime