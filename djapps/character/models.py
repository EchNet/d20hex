from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import ugettext_lazy as _

CHARACTER_NAME_MAX_LENGTH = 40


class Character(models.Model):
  """
    A character is a unique individual actor in the campaign, capable of developing.
  """

  # Every character is part of a campaign.
  campaign = models.ForeignKey(
      db_index=True,
      to="campaign.Campaign",
      on_delete=models.CASCADE,
      null=False,
      blank=False,
      related_name="characters",
      verbose_name=_("campaign"),
  )

  # The player who owns this character.  For non-player characters, this is null.
  player = models.ForeignKey(
      db_index=True,
      to="player.Player",
      on_delete=models.CASCADE,
      null=True,
      blank=False,
      related_name="characters",
      verbose_name=_("player"),
  )

  # The character name (short) as displayed to the users.
  name = models.CharField(
      blank=False,
      null=False,
      max_length=CHARACTER_NAME_MAX_LENGTH,
      verbose_name=_("name"),
  )
