import json
import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from tempdoc.models import MapElement

logger = logging.getLogger(__name__)


class EchoConsumer(AsyncJsonWebsocketConsumer):
  def __init__(self, other):
    super().__init__(other)
    self.campaign_id = None

  @property
  def group_id(self):
    return f"c-{self.campaign_id}"

  async def connect(self):
    logger.info(f"connect {self.channel_name}")
    await self.accept()

  async def receive_json(self, message):
    # All messages from clients to server funnel through this method.
    # The framework parses the message as JSON prior to calling this method.
    # The structure of these messages is entirely up to the client.
    # logger.info(f"receive_json {str(message)}")
    # If campaign is specified, enroll in the campaign channel.  TODO: authenticate.
    if message.get("campaignId", None) is not None:
      await self._listen_to_campaign(message.get("campaignId"))
    if message.get("type") == "bg":
      # Apparently, group_send does JSON serialization underneath the hood.
      await self.channel_layer.group_send(self.group_id, {
          "type": "campaign.echo",
          "origin": self.channel_name,
          "message": message,
      })
      # Update the database.
      await self.update_or_create_map_element(
          {
              "campaign_id": self.campaign_id,
              "sector": 0,
              "layer": "bg",
              "position": f'{message["hex"]["row"]}:{message["hex"]["col"]}',
          }, message["value"])

  @database_sync_to_async
  def update_or_create_map_element(self, keys, value):
    MapElement.objects.update_or_create(**keys, defaults={"value": value})

  async def disconnect(self, close_code):
    logger.info(f"disconnect {self.channel_name}")
    # Unenroll in campaign channel.
    await self._listen_to_campaign(None)

  async def _listen_to_campaign(self, campaign_id):
    # Each consumer may enroll in one campaign channel at a time.
    if self.campaign_id != campaign_id:
      if self.campaign_id:
        logger.info(f"quit channel {self.group_id}")
        await self.channel_layer.group_discard(self.group_id, self.channel_name)
      self.campaign_id = campaign_id
      if campaign_id:
        await self.channel_layer.group_add(self.group_id, self.channel_name)
        logger.info(f"joind channel {self.group_id}")

  # Handler for campaign.echo event just sends the message to the client.
  async def campaign_echo(self, event):
    origin = event.get("origin")
    if origin == self.channel_name:
      return
    message = event.get("message")
    # Avoid race conditions around campaign switches.
    if message.get("campaignId") != self.campaign_id:
      return
    await self.send_json(message)
