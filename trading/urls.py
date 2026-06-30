# markethub/trading/urls.py
from django.urls import path
from .controllers.trading_baseline_controller import TradingBaselineController

urlpatterns = [
    # Mapea directamente al controlador de baseline
    path('trading/baseline/', TradingBaselineController.as_view(), name='trading-baseline-snapshot'),
]