El sistema funciona de la siguiente manera:

Ni bien carga la pagina, simula que son las 15:00 hs y toma un snapshot del estado de las operaciones hasta ese momento del día.

Luego de 10 segundos abre la conexion con el web socket y toda la informacion pasa a ser "en tiempo real".

Cada 10 segundos se aumenta la hora en 10 minutos y se van reflejando todas las operaciones.

No se incluyó un estado de finalizacion de jornada o algo por el estilo.
