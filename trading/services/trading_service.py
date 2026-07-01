from datetime import datetime

from trading.dto.baseline import (
    StrategyBaseline,
    ExecutionBaseline
)



class BaselineService:


    def __init__(self, repository):
        self.repository = repository



    def build_snapshot(
        self,
        cutoff_time: str
    ):

        cutoff = self._parse_date(cutoff_time)


        strategy_sets = (
            self.repository.get(
                "strategy_sets.json"
            )
        )

        stats = (
            self.repository.get(
                "stats.json"
            )
        )

        pnl = (
            self.repository.get(
                "pnl.json"
            )
        )

        trades = (
            self.repository.get(
                "trades.json"
            )
        )


        stats_index = self._index_by_id(stats)

        pnl_index = self._get_latest_pnl(
            pnl,
            cutoff
        )

        trades_index = self._count_trades(
            trades,
            cutoff
        )


        return [
            self._build_strategy(
                strategy,
                stats_index,
                pnl_index,
                trades_index
            )

            for strategy in strategy_sets
        ]



    def _build_strategy(
        self,
        strategy,
        stats,
        pnl,
        trades
    ):


        executions = []

        total_pnl = 0
        total_trades = 0


        for exec_id in strategy["execution_ids"]:


            metadata = stats.get(exec_id)

            if not metadata:
                continue


            execution_pnl = pnl.get(
                exec_id,
                {}
            )


            trade_count = trades.get(
                exec_id,
                0
            )


            executions.append(

                ExecutionBaseline(

                    exec_id=exec_id,
                    name=metadata["name"],
                    status=metadata["status"],

                    total_trades=trade_count,

                    realized_pnl=
                        execution_pnl.get(
                            "realized",
                            0
                        ),

                    unrealized_pnl=
                        execution_pnl.get(
                            "unrealized",
                            0
                        ),

                    total_pnl=
                        execution_pnl.get(
                            "total",
                            0
                        )
                )
            )


            total_pnl += execution_pnl.get(
                "total",
                0
            )

            total_trades += trade_count



        return StrategyBaseline(

            id=strategy["id"],

            name=strategy["name"],

            type=strategy["type"],

            display_type=
                strategy["display_type"],

            description=
                strategy["description"],


            baseline_pnl=
                round(total_pnl,2),


            baseline_trades=
                total_trades,


            total_executions=
                len(executions),


            active_executions=
                sum(
                    1
                    for e in executions
                    if e.status == "running"
                ),


            executions=executions
        )



    def _get_latest_pnl(
        self,
        data,
        cutoff
    ):

        result = {}


        for item in data:

            timestamp = self._parse_date(
                item["ts"]
            )


            if timestamp <= cutoff:

                current = result.get(
                    item["exec_id"]
                )


                if (
                    not current
                    or timestamp >
                    self._parse_date(
                        current["ts"]
                    )
                ):

                    result[
                        item["exec_id"]
                    ] = item


        return result



    def _count_trades(
        self,
        trades,
        cutoff
    ):

        result = {}


        for trade in trades:

            if (
                self._parse_date(
                    trade["ts"]
                )
                <= cutoff
            ):

                exec_id = trade["exec_id"]

                result[exec_id] = (
                    result.get(exec_id,0)
                    + 1
                )


        return result



    def _index_by_id(
        self,
        items
    ):

        return {
            item["exec_id"]:
                item
            for item in items
        }



    def _parse_date(
        self,
        value
    ):

        return datetime.fromisoformat(
            value.replace(
                "Z",
                "+00:00"
            )
        )