from django.contrib import admin

from .models import Player


class PlayerAdmin(admin.ModelAdmin):
  list_display = ("id", "name", "user")


admin.site.register(Player, PlayerAdmin)
