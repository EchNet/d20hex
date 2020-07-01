from django.conf import settings
from django.utils.crypto import constant_time_compare, salted_hmac
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode


class TokenCodec:
  key_salt = "com.d20hex.utils.token"
  secret = settings.SECRET_KEY

  def encode(self, payload_string):
    encoded_payload_string = urlsafe_base64_encode(force_bytes(payload_string))
    hash_string = salted_hmac(self.key_salt, payload_string, secret=self.secret).hexdigest()[::2]
    return f"{encoded_payload_string}-{hash_string}"

  def decode(self, token):
    if not token.find("-"):
      raise ValueError()
    encoded_payload_string, hash_string = token.split("-")
    payload_string = force_text(urlsafe_base64_decode(encoded_payload_string))
    if not constant_time_compare(self.encode(payload_string), token):
      raise ValueError()
    return payload_string
