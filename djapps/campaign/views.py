from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, views

from player.models import Player

from .models import Campaign
from .serializers import CampaignSerializer
from .permissions import (IsSuperuser, IsPlayerOwner)


class CreateCampaignView(generics.CreateAPIView):
  serializer_class = CampaignSerializer
  permission_classes = (permissions.IsAuthenticated, )


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
    return Campaign.objects.filter(player_memberships__player=player)
