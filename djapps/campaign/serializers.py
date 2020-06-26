from rest_framework import serializers

from .models import (Campaign, PlayerCampaignMembership)


class CampaignSerializer(serializers.ModelSerializer):
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
