from django.db import models
from django.utils.translation import ugettext_lazy as _

CAMPAIGN_NAME_MAX_LENGTH = 40


class Campaign(models.Model):
  """
    A campaign is the container of all characters and locations.
  """

  # The player who created this campaign.
  creator = models.ForeignKey(
      blank=False,
      db_index=True,
      null=False,
      on_delete=models.CASCADE,
      related_name="campaigns",
      to="player.Player",
      verbose_name=_("creator"),
  )

  # The campaign name as displayed to the users.
  name = models.CharField(
      blank=False,
      max_length=CAMPAIGN_NAME_MAX_LENGTH,
      null=False,
      verbose_name=_("name"),
  )


class PlayerCampaignMembership(models.Model):
  """
    Association between Player and Campaign, annotated with the Player's permissions 
    with regard to that Campaign.

    The existence of a PlayerCampaignMembership for a Player and Campaign implies that
    the Player may create characters in the Campaign.  Additional permissions are given
    through permissions flags (example: can_manage).
  """
  class Meta:
    constraints = [
        models.UniqueConstraint(fields=["campaign", "player"], name="unique player and campaign")
    ]

  # The player who created this campaign.
  campaign = models.ForeignKey(
      blank=False,
      db_index=True,
      null=False,
      on_delete=models.CASCADE,
      related_name="player_memberships",
      to=Campaign,
      verbose_name=_("campaign"),
  )

  # The campaign name as displayed to the users.
  player = models.ForeignKey(
      blank=False,
      db_index=True,
      null=False,
      on_delete=models.CASCADE,
      related_name="campaign_memberships",
      to="player.Player",
      verbose_name=_("player"),
  )

  # If true, the player has GM permissions.
  can_manage = models.BooleanField(
      null=False,
      blank=False,
      default=False,
      verbose_name=_("gm"),
  )
