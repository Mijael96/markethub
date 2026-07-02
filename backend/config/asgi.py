import os
from django.core.asgi import get_asgi_application

# Establecemos la configuración de Django de manera temprana antes de importar Channels
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'markethub.settings')
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import trading.routing

application = ProtocolTypeRouter({
    # 1. Tráfico HTTP tradicional de Django (Vistas, API REST, Django Admin)
    "http": django_asgi_app,
    
    # 2. Tráfico de WebSockets manejado por Django Channels
    "websocket": AuthMiddlewareStack(
        URLRouter(
            trading.routing.websocket_urlpatterns
        )
    ),
})