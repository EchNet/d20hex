from rest_framework import serializers

from player.serializers import PlayerSerializer
from tempdoc.models import MapElement, Note

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
        "uuid",
        "sector",
        "layer",
        "position",
        "value",
    )


class NoteSerializer(serializers.ModelSerializer):
  class Meta:
    model = Note
    fields = (
        "id",
        "topic",
        "json",
        "text",
        "created_on",
    )


class CampaignPlayerSerializer(serializers.Serializer):
  class Meta:
    model = PlayerCampaignMembership
    fields = (
        "id",
        "name",
        "can_manage",
    )

  id = serializers.SerializerMethodField()
  name = serializers.SerializerMethodField()
  can_manage = serializers.SerializerMethodField()

  def get_id(self, obj):
    return obj.player.id

  def get_name(self, obj):
    return obj.player.name

  def get_can_manage(self, obj):
    return obj.can_manage
