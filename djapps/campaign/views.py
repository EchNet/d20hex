import json
import logging

from dateutil.relativedelta import relativedelta
from datetime import datetime
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework import exceptions, generics, permissions, views
from rest_framework.response import Response

from character.serializers import CharacterSerializer
from player.models import Player
from player.serializers import PlayerSerializer
from utils.token import TokenCodec

from .models import Campaign, PlayerCampaignMembership
from .permissions import (IsSuperuser, IsPlayerOwner)
from .serializers import (
    CampaignSerializer,
    NewCampaignSerializer,
    PlayerCampaignMembershipSerializer,
    TempDocSerializer,
)

logger = logging.getLogger(__name__)

# The following functions belong in a service class.


def check_campaigns_created_limit(creator):
  MAX_CAMPAIGNS_PER_PLAYER = 4
  campaigns_created = Campaign.objects.filter(creator=creator).count()
  if campaigns_created >= MAX_CAMPAIGNS_PER_PLAYER:
    raise PermissionDenied("Maximum number of campaigns per player has been reached.")


def check_player_can_manage_campaign(player, campaign):
  return PlayerCampaignMembership.objects.filter(player=player,
                                                 campaign=campaign,
                                                 can_manage=True).exists()


class CreateCampaignView(generics.CreateAPIView):
  serializer_class = NewCampaignSerializer
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


class CampaignCharactersView(generics.ListAPIView):
  serializer_class = CharacterSerializer
  permission_classes = (permissions.AllowAny, )

  def get_queryset(self):
    campaign_id = self.kwargs.get("campaign_id")
    campaign = get_object_or_404(Campaign.objects.all(), id=campaign_id)
    return campaign.characters.all()


class PlayerCampaignsView(generics.ListAPIView):
  serializer_class = PlayerCampaignMembershipSerializer
  permission_classes = (IsSuperuser | IsPlayerOwner, )

  def get_queryset(self):
    player_id = self.kwargs.get("player_id")
    player = get_object_or_404(Player.objects.all(), id=player_id)
    self.check_object_permissions(self.request, player)
    return PlayerCampaignMembership.objects \
        .select_related("campaign") \
        .select_related("campaign__creator") \
        .filter(player=player)

  def get(self, request, *args, **kwargs):
    if request.GET.get("ticket", ""):
      try:
        stuff = json.loads(TokenCodec().decode(request.GET.get("ticket")))
        logger.info(stuff)
        campaign_id = stuff[0]
        expiration = int(stuff[1])
      except:
        raise exceptions.ParseError("Ticket is invalid.")
      if expiration < datetime.now().timestamp():
        raise exceptions.ParseError("Ticket has expired.")
      player_id = self.kwargs.get("player_id")
      PlayerCampaignMembership.objects.get_or_create(player_id=player_id, campaign_id=campaign_id)
    return super().get(request, *args, **kwargs)


class CampaignActionView(views.APIView):
  permission_classes = (IsSuperuser | IsPlayerOwner, )

  def post(self, request, *args, **kwargs):
    player = get_object_or_404(Player.objects.all(), id=request.data.get("granter", ""))
    self.check_object_permissions(self.request, player)
    campaign = get_object_or_404(Campaign.objects.all(), id=self.kwargs.get("campaign_id"))
    check_player_can_manage_campaign(player, campaign)
    if request.data.get("action", "") != "ticket":
      raise ValidationError()
    expiration = int((datetime.now() + relativedelta(days=3)).timestamp())
    logger.info(campaign.id, expiration)
    ticket = TokenCodec().encode(json.dumps([campaign.id, expiration]))
    response_data = {"ticket": ticket}
    return Response(response_data)


class CampaignMapView(generics.ListAPIView):
  serializer_class = TempDocSerializer

  def get_queryset(self):
    campaign_id = self.kwargs.get("campaign_id")
    campaign = get_object_or_404(Campaign.objects.all(), id=campaign_id)
    return campaign.documents.all()
