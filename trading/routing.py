from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Definimos el endpoint al cual se conectará el Frontend para escuchar la simulación en vivo.
    # Usamos as_view() de manera similar a las vistas basadas en clases de Django.
    re_path(r'^ws/trading/simulation/$', consumers.TradingSimulationConsumer.as_asgi()),
]