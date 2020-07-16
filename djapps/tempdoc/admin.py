from django.contrib import admin

from .models import TempDoc


class TempDocAdmin(admin.ModelAdmin):
  list_display = ("id", "campaign", "key")


admin.site.register(TempDoc, TempDocAdmin)
