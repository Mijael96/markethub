from dataclasses import dataclass


@dataclass
class PnL:

    realized: float = 0
    unrealized: float = 0
    total: float = 0