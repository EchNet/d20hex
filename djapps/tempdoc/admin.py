from django.contrib import admin

from .models import MapElement


class MapElementAdmin(admin.ModelAdmin):
  list_display = ("id", "campaign", "position", "value")


admin.site.register(MapElement, MapElementAdmin)
