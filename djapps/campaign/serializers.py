from rest_framework import serializers

from player.serializers import PlayerSerializer
from tempdoc.models import MapElement

from .models import (Campaign, PlayerCampaignMembership)


class CampaignSerializer(serializers.ModelSerializer):
  class Meta:
    model = Campaign
    fields = ("id", "name", "creator")

  creator = PlayerSerializer(read_only=True, many=False)


class NewCampaignSerializer(serializers.ModelSerializer):
  class Meta:
    model = Campaign
    fields = ("id", "name", "creator")

  def create(self, validated_data):
    new_campaign = super().create(validated_data)
    if new_campaign:
      PlayerCampaignMembership.objects.create(
          campaign=new_campaign,
          player=new_campaign.creator,
          can_manage=True,
      )
    return new_campaign


class PlayerCampaignMembershipSerializer(serializers.ModelSerializer):
  class Meta:
    model = PlayerCampaignMembership
    fields = ("player_id", "campaign", "can_manage")

  campaign = CampaignSerializer(read_only=True, many=False)


class TempDocSerializer(serializers.ModelSerializer):
  class Meta:
    model = MapElement
    fields = (
        "id",
        "sector",
        "layer",
        "position",
        "value",
    )
