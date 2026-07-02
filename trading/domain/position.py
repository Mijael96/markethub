from dataclasses import dataclass



@dataclass
class PositionLot:

    qty: float

    price: float

    side: str



class FIFOInventory:


    def __init__(self):

        self.positions = {}



    def process_trade(
        self,
        exec_id: str,
        symbol: str,
        side: str,
        qty: float,
        price: float
    ):


        self._initialize(
            exec_id,
            symbol
        )


        queue = self.positions[exec_id][symbol]


        realized_pnl = 0.0

        remaining_qty = qty



        while (

            queue

            and remaining_qty > 0

            and queue[0].side != side

        ):


            lot = queue[0]


            closed_qty = min(

                lot.qty,

                remaining_qty

            )


            if side == "sell":

                realized_pnl += (

                    price - lot.price

                ) * closed_qty


            else:

                realized_pnl += (

                    lot.price - price

                ) * closed_qty



            lot.qty -= closed_qty

            remaining_qty -= closed_qty



            if lot.qty <= 0:

                queue.pop(0)



        if remaining_qty > 0:


            queue.append(

                PositionLot(

                    qty=remaining_qty,

                    price=price,

                    side=side

                )

            )


        return round(
            realized_pnl,
            2
        )



    def _initialize(
        self,
        exec_id,
        symbol
    ):


        if exec_id not in self.positions:

            self.positions[exec_id] = {}



        if symbol not in self.positions[exec_id]:

            self.positions[exec_id][symbol] = []