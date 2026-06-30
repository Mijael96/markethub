from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Al poner 'api/v1/' acá, todas las rutas que definas en trading se le sumarán a este prefijo.
    # Esto evita tener que repetir 'api/v1/' dentro del urls.py de tu aplicación.
    path('api/v1/', include('trading.urls')),
]