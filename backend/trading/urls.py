# markethub/trading/urls.py
from django.urls import path
from .controllers.trading_baseline_controller import TradingBaselineController
from .controllers.historical_trades_controller import HistoricalTradesController


urlpatterns = [
    # Mapea directamente al controlador de baseline
    path('trading/baseline/', TradingBaselineController.as_view(), name='trading-baseline-snapshot'),
    path('trading/historical-trades/', HistoricalTradesController.as_view(), name='trading-historical-trades'),
]