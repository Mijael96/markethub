from trading.domain.trade import Trade
from trading.domain.position import FIFOInventory

from trading.dto.historical_trade import HistoricalTradeDTO



class HistoricalTradesService:



    def __init__(
        self,
        repository
    ):

        self.repository = repository



    def get_latest_trades(
        self,
        cutoff_time: str,
        limit=40
    ):

        cutoff_time = self._parse_date(cutoff_time)

        trades_data = (
            self.repository.get(
                "trades.json"
            )
        )


        stats = (
            self.repository.get(
                "stats.json"
            )
        )


        names = {

            item["exec_id"]:
                item.get(
                    "name",
                    "Estrategia desconocida"
                )

            for item in stats

        }



        inventory = FIFOInventory()



        trades = []



        trades_data.sort(

            key=lambda x: x["ts"]

        )



        for item in trades_data:


            timestamp = self._parse_date(
                item["ts"]
            )


            if timestamp > cutoff_time:

                continue



            trade = Trade(

                id=item.get(
                    "id",
                    f"T-{timestamp.timestamp()}"
                ),


                exec_id=item["exec_id"],


                symbol=item["symbol"],


                side=item["side"],


                qty=float(
                    item.get(
                        "qty",
                        0
                    )
                ),


                price=float(
                    item.get(
                        "price",
                        0
                    )
                ),


                realized_pnl=0,


                timestamp=timestamp

            )



            pnl = inventory.process_trade(

                exec_id=trade.exec_id,

                symbol=trade.symbol,

                side=trade.side,

                qty=trade.qty,

                price=trade.price

            )



            trades.append(

                HistoricalTradeDTO(

                    id=trade.id,


                    ts=trade.timestamp.isoformat(),


                    time_str=
                        trade.timestamp.strftime(
                            "%H:%M:%S"
                        ),


                    exec_id=trade.exec_id,


                    exec_name=
                        names.get(
                            trade.exec_id,
                            "Estrategia Mercado"
                        ),


                    symbol=trade.symbol,


                    side=trade.side,


                    qty=trade.qty,


                    price=trade.price,


                    realized_pnl=pnl

                )

            )



        trades.sort(

            key=lambda x:x.ts,

            reverse=True

        )


        return trades[:limit]



    def _parse_date(
        self,
        value
    ):

        from datetime import datetime

        return datetime.fromisoformat(

            value.replace(
                "Z",
                "+00:00"
            )

        )