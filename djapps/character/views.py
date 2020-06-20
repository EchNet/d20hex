from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, views

from .serializers import CharacterSerializer
from .permissions import (IsSuperuser, IsPlayerUser)
from player.models import Player


class CharacterView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CharacterSerializer
  permission_classes = (permissions.AllowAny, )

  def get_object(self):
    character_id = self.kwargs.get("character_id")
    character = get_object_or_404(Character.objects.all(), id=character_id)
    self.check_object_permissions(self.request, character)
    return character


class PlayerCharactersView(generics.ListAPIView):
  serializer_class = CharacterSerializer
  permission_classes = (IsSuperuser | IsPlayerUser, )

  def get_queryset(self):
    player_id = self.kwargs.get("player_id")
    player = get_object_or_404(Player.objects.all(), id=player_id)
    self.check_object_permissions(self.request, player)
    return player.characters.all()
