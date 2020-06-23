from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, views

from .serializers import PlayerSerializer
from .permissions import (IsSuperuser, IsTheUser)


class CreatePlayerView(generics.CreateAPIView):
  serializer_class = PlayerSerializer
  permission_classes = (permissions.IsAuthenticated, )


class PlayerView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = PlayerSerializer
  permission_classes = (permissions.AllowAny, )

  def get_object(self):
    player_id = self.kwargs.get("player_id")
    player = get_object_or_404(Player.objects.all(), id=player_id)
    self.check_object_permissions(self.request, player)
    return player


class UserPlayersView(generics.ListAPIView):
  serializer_class = PlayerSerializer
  permission_classes = (IsSuperuser | IsTheUser, )

  def get_queryset(self):
    user_id = self.kwargs.get("user_id")
    user = get_object_or_404(get_user_model().objects.all(), id=user_id)
    self.check_object_permissions(self.request, user)
    return user.players.all()
