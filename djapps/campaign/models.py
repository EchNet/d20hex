from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import ugettext_lazy as _

CAMPAIGN_NAME_MAX_LENGTH = 40


class Campaign(models.Model):
  """
    A campaign is the container of all characters and locations.
  """

  # The user who created this campaign.
  creator = models.ForeignKey(db_index=True,
                              to=get_user_model(),
                              on_delete=models.CASCADE,
                              null=False,
                              blank=False,
                              related_name="campaigns",
                              verbose_name=_("creator"))

  # The campaign name as displayed to the users.
  name = models.CharField(blank=False,
                          null=False,
                          max_length=CAMPAIGN_NAME_MAX_LENGTH,
                          verbose_name=_("name"))
