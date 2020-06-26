import logging

from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, views

from campaign.models import Campaign, PlayerCampaignMembership
from player.models import Player

from .models import Character
from .serializers import CharacterSerializer
from .permissions import IsSuperuser, IsPlayerUser

logger = logging.getLogger(__name__)


def may_create_player_character(player, campaign):
  return PlayerCampaignMembership.objects.filter(player=player, campaign=campaign).exists()


def may_create_non_player_character(user, campaign):
  return PlayerCampaignMembership.objects.filter(player__user=user,
                                                 campaign=campaign,
                                                 can_manage=True).exists()


def max_characters_reached(player):
  MAX_CHARACTERS_PER_PLAYER = 50
  return Character.objects.filter(player=player).count() >= MAX_CHARACTERS_PER_PLAYER


class CreateCharacterView(generics.CreateAPIView):
  serializer_class = CharacterSerializer
  permission_classes = (
      permissions.IsAuthenticated,
      IsPlayerUser,
  )

  def perform_create(self, serializer):
    logger.info(f"perform_create {self.request.data}")
    campaign = get_object_or_404(Campaign.objects.all(), id=self.request.data.get("campaign"))
    player_id = self.request.data.get("player", None)
    if player_id is not None:
      player = get_object_or_404(Player.objects.all(), id=player_id)
      self.check_object_permissions(self.request, player)
      if not may_create_player_character(player, campaign):
        logger.info(f"perform_create may not create player character")
        raise PermissionDenied()
      if max_characters_reached(player):
        logger.info(f"max player characters")
        raise PermissionDenied(detail="Maximum number of campaigns per player has been reached.")
    else:
      if not may_create_non_player_character(self.request.user, campaign):
        logger.info(f"perform_create may not create NPC")
        raise PermissionDenied()

    return super().perform_create(serializer)


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
    queryset = player.characters.all()
    campaign_id = self.request.data.get("campaign", None)
    if campaign_id is not None:
      queryset = queryset.filter(campaign_id=campaign_id)
    return queryset


"""
class CampaignCharactersView(generics.ListAPIView):
  serializer_class = CharacterSerializer
  permission_classes = (IsSuperuser | CanManageCampaign, )

  def get_queryset(self):
    campaign_id = self.kwargs.get("campaign_id")
    campaign = get_object_or_404(Campaign.objects.all(), id=campaign_id)
    self.check_object_permissions(self.request, campaign)
    return campaign.characters.all()
"""


class CharacterView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CharacterSerializer
  permission_classes = (permissions.AllowAny, )

  def get_object(self):
    character_id = self.kwargs.get("character_id")
    character = get_object_or_404(Character.objects.all(), id=character_id)
    self.check_object_permissions(self.request, character)
    return character
