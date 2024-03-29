from django.conf import settings


def context_settings(request=None):
  return {
      "DEBUG":
      settings.DEBUG,
      "configuration": [
          {
              "key": "DEBUG",
              "value": "1" if settings.DEBUG else ""
          },
          {
              "key": "HEARTBEAT",
              "value": "" if settings.DEBUG else "1"
          },
          {
              "key": "maxCampaignsPerPlayer",
              "value": 4
          },
      ]
  }
