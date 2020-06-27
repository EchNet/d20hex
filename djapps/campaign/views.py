from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, views

from player.models import Player

from .models import Campaign
from .permissions import (IsSuperuser, IsPlayerOwner)
from .serializers import CampaignSerializer


def check_campaigns_created_limit(creator):
  MAX_CAMPAIGNS_PER_PLAYER = 20
  campaigns_created = Campaign.objects.filter(creator=creator).count()
  if campaigns_created >= MAX_CAMPAIGNS_PER_PLAYER:
    raise PermissionDenied(detail="Maximum number of campaigns per player has been reached.")


class CreateCampaignView(generics.CreateAPIView):
  serializer_class = CampaignSerializer
  permission_classes = (
      permissions.IsAuthenticated,
      IsPlayerOwner,
  )

  def perform_create(self, serializer):
    creator_id = self.request.data.get("creator")
    creator = get_object_or_404(Player.objects.all(), id=creator_id)
    self.check_object_permissions(self.request, creator)
    check_campaigns_created_limit(creator)
    return super().perform_create(serializer)


class CampaignView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CampaignSerializer
  permission_classes = (permissions.AllowAny, )

  def get_object(self):
    campaign_id = self.kwargs.get("campaign_id")
    campaign = get_object_or_404(Campaign.objects.all(), id=campaign_id)
    self.check_object_permissions(self.request, campaign)
    return campaign


class PlayerCampaignsView(generics.ListAPIView):
  serializer_class = CampaignSerializer
  permission_classes = (IsSuperuser | IsPlayerOwner, )

  def get_queryset(self):
    player_id = self.kwargs.get("player_id")
    player = get_object_or_404(Player.objects.all(), id=player_id)
    self.check_object_permissions(self.request, player)
    return Campaign.objects.select_related("creator").filter(player_memberships__player=player)
