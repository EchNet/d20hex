from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, serializers


class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = get_user_model()
    fields = ("id", "first_name", "last_name")


class WhoAmIView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = UserSerializer

  def get_object(self):
    return self.request.user
