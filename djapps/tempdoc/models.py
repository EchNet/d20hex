from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.utils.translation import ugettext_lazy as _

KEY_MAX_LENGTH = 40


class TempDoc(models.Model):
  """
    Temporary doc storage.
  """

  campaign = models.ForeignKey(
      blank=False,
      db_index=True,
      null=False,
      on_delete=models.CASCADE,
      related_name="documents",
      to="campaign.Campaign",
      verbose_name=_("campaign"),
  )

  key = models.CharField(
      blank=False,
      null=False,
      max_length=KEY_MAX_LENGTH,
      verbose_name=_("key"),
  )

  data = JSONField(
      blank=False,
      null=False,
      verbose_name=_("data"),
  )
