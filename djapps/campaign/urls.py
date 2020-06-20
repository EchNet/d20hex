from django.conf.urls import url

from . import views

urlpatterns = [
    url(r"^campaign/(?P<campaign_id>[0-9]+)/?$", views.CampaignView.as_view()),
    url(r"^user/(?P<user_id>[0-9]+)/campaigns/?$", views.UserCampaignsView.as_view()),
]
