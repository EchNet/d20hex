from django.contrib.auth import get_user_model
from django.utils import timezone, dateformat
from rest_framework import generics, permissions, serializers, views


class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = get_user_model()
    fields = ("id", "first_name", "last_name", "email", "username")


class WhoAmIView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = UserSerializer

  def get_object(self):
    return self.request.user


class PingView(views.APIView):
  """
    Test endpoint.
  """
  def get(self, request, *args, **kwargs):
    return Response({"date": dateformat.format(timezone.now(), "Y-m-d H:i:s")})
