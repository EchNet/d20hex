from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, views

from .serializers import CampaignSerializer
from .permissions import (IsSuperuser, IsTheUser)


class CampaignView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CampaignSerializer
  permission_classes = (permissions.AllowAny, )

  def get_object(self):
    campaign_id = self.kwargs.get("campaign_id")
    campaign = get_object_or_404(Campaign.objects.all(), id=campaign_id)
    self.check_object_permissions(self.request, campaign)
    return campaign


class UserCampaignsView(generics.ListAPIView):
  serializer_class = CampaignSerializer
  permission_classes = (IsSuperuser | IsTheUser, )

  def get_queryset(self):
    user_id = self.kwargs.get("user_id")
    user = get_object_or_404(get_user_model().objects.all(), id=user_id)
    self.check_object_permissions(self.request, user)
    return user.campaigns.all()
