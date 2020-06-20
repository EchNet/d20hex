from django.conf.urls import url

from player import views

urlpatterns = [
    url(r"^player/(?P<player_id>[0-9]+)/?$", views.PlayerView.as_view()),
    url(r"^user/(?P<user_id>[0-9]+)/players/?$", views.UserPlayersView.as_view()),
]
