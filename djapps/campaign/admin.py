from django.contrib import admin

from .models import Campaign, PlayerCampaignMembership


class CampaignAdmin(admin.ModelAdmin):
  list_display = ("id", "name", "creator")


class PlayerCampaignMembershipAdmin(admin.ModelAdmin):
  list_display = ("id", "player", "campaign", "can_manage")


admin.site.register(Campaign, CampaignAdmin)
admin.site.register(PlayerCampaignMembership, PlayerCampaignMembershipAdmin)
