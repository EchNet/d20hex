from django.conf.urls import url

from . import consumers

websocket_urlpatterns = [
    url(r'^ws/map/$', consumers.EchoConsumer.as_asgi()),
]
