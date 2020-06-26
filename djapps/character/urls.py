from django.conf.urls import url

from . import views

urlpatterns = [
    url(r"^character/?$", views.CreateCharacterView.as_view()),
    url(r"^character/(?P<character_id>[0-9]+)/?$", views.CharacterView.as_view()),
    url(r"^player/(?P<player_id>[0-9]+)/characters/?$", views.PlayerCharactersView.as_view()),
]
