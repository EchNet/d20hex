from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import ugettext_lazy as _

PLAYER_NAME_MAX_LENGTH = 40


class Player(models.Model):
  """
    A player persona.  A player is the owner of a player character.
  """

  # The user who owns this player.
  user = models.ForeignKey(db_index=True,
                           to=get_user_model(),
                           on_delete=models.CASCADE,
                           null=False,
                           blank=False,
                           related_name="players",
                           verbose_name=_("user"))

  # The player name as displayed to the users.
  name = models.CharField(blank=False,
                          null=False,
                          max_length=PLAYER_NAME_MAX_LENGTH,
                          verbose_name=_("name"))
