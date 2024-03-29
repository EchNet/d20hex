from django.contrib.postgres.fields import JSONField
from django.db import models
from django_extensions.db.models import CreationDateTimeField
from django.utils.translation import ugettext_lazy as _

UUID_MAX_LENGTH = 48
LAYER_MAX_LENGTH = 8
POSITION_MAX_LENGTH = 48
TOPIC_MAX_LENGTH = 96
VALUE_MAX_LENGTH = 96


class Note(models.Model):

  campaign = models.ForeignKey(
      blank=False,
      db_index=True,
      null=False,
      on_delete=models.CASCADE,
      related_name="notes",
      to="campaign.Campaign",
      verbose_name=_("campaign"),
  )

  topic = models.CharField(
      db_index=True,
      blank=False,
      null=False,
      max_length=TOPIC_MAX_LENGTH,
      verbose_name=_("topic"),
  )

  json = JSONField(
      blank=True,
      null=True,
      verbose_name=_("json"),
  )

  text = models.TextField(
      blank=True,
      null=True,
      verbose_name=_("text"),
  )

  created_on = CreationDateTimeField(
      db_index=True,
      editable=False,
      verbose_name=_("created_on"),
  )


class MapElement(models.Model):

  uuid = models.CharField(
      db_index=True,
      blank=True,
      null=True,
      max_length=UUID_MAX_LENGTH,
      verbose_name=_("uuid"),
  )

  campaign = models.ForeignKey(
      blank=False,
      db_index=True,
      null=False,
      on_delete=models.CASCADE,
      related_name="map_elements",
      to="campaign.Campaign",
      verbose_name=_("campaign"),
  )

  sector = models.PositiveIntegerField(
      db_index=True,
      blank=False,
      null=False,
      verbose_name=_("sector"),
  )

  layer = models.CharField(
      db_index=True,
      blank=False,
      null=False,
      max_length=LAYER_MAX_LENGTH,
      verbose_name=_("layer"),
  )

  # TEMPORARY: row:col
  position = models.CharField(
      db_index=True,
      blank=False,
      null=False,
      max_length=POSITION_MAX_LENGTH,
      verbose_name=_("position"),
  )

  value = models.TextField(
      blank=False,
      null=False,
      verbose_name=_("value"),
  )
