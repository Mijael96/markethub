from rest_framework import serializers

class ExecutionBaselineSerializer(serializers.Serializer):
    """
    Serializador para las ejecuciones individuales (nivel micro).
    """
    exec_id = serializers.CharField()
    name = serializers.CharField()
    status = serializers.CharField()
    total_trades = serializers.IntegerField()
    realized_pnl = serializers.FloatField()
    unrealized_pnl = serializers.FloatField()
    total_pnl = serializers.FloatField()

class StrategyBaselineResponseSerializer(serializers.Serializer):
    """
    Serializador para los conjuntos de estrategias consolidados (nivel macro).
    """
    id = serializers.CharField()
    name = serializers.CharField()
    type = serializers.CharField()
    display_type = serializers.CharField()
    description = serializers.CharField()
    baseline_pnl = serializers.FloatField()
    baseline_trades = serializers.IntegerField()
    # Nuevos campos solicitados para métricas de salud del conjunto
    total_executions = serializers.IntegerField()
    active_executions = serializers.IntegerField()
    executions = ExecutionBaselineSerializer(many=True)

class HistoricalTradeSerializer(serializers.Serializer):

    id = serializers.CharField()

    ts = serializers.CharField()

    time_str = serializers.CharField()

    exec_id = serializers.CharField()

    exec_name = serializers.CharField()

    symbol = serializers.CharField()

    side = serializers.CharField()

    qty = serializers.FloatField()

    price = serializers.FloatField()

    realized_pnl = serializers.FloatField()