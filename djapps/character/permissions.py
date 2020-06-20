from rest_framework import permissions


class IsSuperuser(permissions.BasePermission):
  def has_permission(self, request, view):
    return request.user and request.user.is_authenticated and \
        request.user.is_superuser and request.user.is_staff

  def has_object_permission(self, request, view, obj):
    return self.has_permission(request, view)


class IsPlayerUser(permissions.BasePermission):
  def has_object_permission(self, request, view, player):
    return player.user == request.user
