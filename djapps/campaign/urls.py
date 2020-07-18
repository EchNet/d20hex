from django.conf.urls import url

from . import views

urlpatterns = [
    url(r"^campaign/?$", views.CreateCampaignView.as_view()),
    url(r"^campaign/(?P<campaign_id>[0-9]+)/?$", views.CampaignView.as_view()),
    url(r"^player/(?P<player_id>[0-9]+)/campaigns/?$", views.PlayerCampaignsView.as_view()),
    url(r"^campaign/(?P<campaign_id>[0-9]+)/action/?$", views.CampaignActionView.as_view()),
    url(r"^campaign/(?P<campaign_id>[0-9]+)/characters/?$",
        views.CampaignCharactersView.as_view()),
    url(r"^campaign/(?P<campaign_id>[0-9]+)/map/?$", views.CampaignMapView.as_view()),
]
