import json
import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from tempdoc.models import MapElement, Note

logger = logging.getLogger(__name__)


class EchoConsumer(AsyncJsonWebsocketConsumer):
  campaign_id = None

  @property
  def broadcasting(self):
    return self.campaign_id is not None

  @property
  def broadcast_group_id(self):
    return f"c-{self.campaign_id}"

  async def connect(self):
    logger.info(f"connect {self.channel_name}")
    await self.accept()

  async def disconnect(self, close_code):
    logger.info(f"disconnect {self.channel_name}")
    # Unenroll in campaign channel.
    await self._listen_to_campaign(None)

  async def receive_json(self, message):
    # All messages from clients to server funnel through this method.
    # The framework parses the message as JSON prior to calling this method.
    # logger.info(f"receive_json {str(message)}")
    await self.respond_by_updating_enrollment(message)
    # TODO encapsulate db access in service methods.
    await self.respond_by_updating_database(message)
    # TODO don't send in case of db error.
    await self.respond_by_sending(message)

  async def respond_by_updating_enrollment(self, message):
    # If campaign is specified, enroll in the campaign channel.  TODO: authenticate.
    if message.get("campaignId", None) is not None:
      await self._listen_to_campaign(message.get("campaignId"))

  async def respond_by_updating_database(self, message):
    message_type = message.get("type", None)
    if message_type == "bg":
      if message.get("value", None):
        await self.update_or_create_map_element(
            {
                "campaign_id": self.campaign_id,
                "layer": "bg",
                "position": f'{message["hex"]["row"]}:{message["hex"]["col"]}',
            }, {
                "sector": 0,
                "value": message["value"]
            })
      else:
        await self.delete_map_element({
            "campaign_id":
            self.campaign_id,
            "layer":
            "bg",
            "position":
            f'{message["hex"]["row"]}:{message["hex"]["col"]}',
        })
    elif message_type == "token":
      if message.get("position", None):
        await self.update_or_create_map_element(
            {
                "uuid": message.get("uuid", None),
                "campaign_id": self.campaign_id,
            }, {
                "sector": 0,
                "layer": "fg",
                "position": message["position"],
                "value": message["value"]
            })
      else:
        await self.delete_map_element({"campaign_id": self.campaign_id, "uuid": message["uuid"]})
    elif message_type == "note":
      await self.create_note({
          "campaign_id": self.campaign_id,
          "topic": message.get("topic"),
          "json": message.get("json", None),
          "text": message.get("text", None),
      })

  @database_sync_to_async
  def update_or_create_map_element(self, keys, defaults):
    MapElement.objects.update_or_create(**keys, defaults=defaults)

  @database_sync_to_async
  def delete_map_element(self, keys):
    MapElement.objects.filter(**keys).delete()

  @database_sync_to_async
  def create_note(self, props):
    Note.objects.create(**props)

  async def respond_by_sending(self, message):
    # group_send does JSON serialization underneath the hood.
    if message.get("type", None) == "ping":
      await self.send_json({**message, "type": "pong"})
    elif self.broadcasting:
      await self.channel_layer.group_send(self.broadcast_group_id, {
          "type": "campaign.echo",
          "origin": self.channel_name,
          "message": message,
      })

  async def _listen_to_campaign(self, campaign_id):
    # Each consumer may enroll in one campaign channel at a time.
    if self.campaign_id != campaign_id:
      if self.campaign_id:
        logger.info(f"quit channel {self.broadcast_group_id}")
        await self.channel_layer.group_discard(self.broadcast_group_id, self.channel_name)
      self.campaign_id = campaign_id
      if campaign_id:
        await self.channel_layer.group_add(self.broadcast_group_id, self.channel_name)
        logger.info(f"joined channel {self.broadcast_group_id}")

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
