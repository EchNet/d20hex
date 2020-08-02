import glob
import os

from django.conf import settings
from html.parser import HTMLParser
from os.path import isfile


class WebAssetFinder(HTMLParser):
  # For integration with parcel JS/CSS bundler.

  def __init__(self, **kwargs):
    super().__init__()
    self.url_prefix = kwargs.get("url_prefix", None)
    self._find_assets()

  def handle_starttag(self, tag, attrs):
    attrs = dict(attrs)
    if tag == "link" and attrs.get("rel", None) == "stylesheet":
      self._stylesheets.append(attrs.get("href")[1:])  # remove leading slash
    if tag == "script":
      self._scripts.append(attrs.get("src")[1:])

  def scan_html_file(self, fname):
    # Old method: scrape JS and CSS file names out of the generated index file.
    with open(fname, "r") as input_file:
      self.feed(input_file.read())

  def _find_assets(self):
    # Find the newest JS and CSS files in the parcel dist folder.
    self._stylesheets = [max(glob.glob("dist/*.css"), key=os.path.getctime)]
    self._scripts = [max(glob.glob("dist/*.js"), key=os.path.getctime)]

  def _reroot_all(self, pathlist):
    return (os.path.join(settings.STATIC_URL, self.url_prefix,
                         os.path.split(path)[1]) for path in pathlist)

  @property
  def stylesheets(self):
    return self._reroot_all(self._stylesheets)

  @property
  def scripts(self):
    return self._reroot_all(self._scripts)
