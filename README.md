# Dr. MVP

Django-ReactJS application shell, ready to deploy on Heroku.  Zero functionality, all infrastructure.

## What problems does this solve?

From zero to usable application stack in minimal time.

Deployment on Heroku so we spend less time on devops and more on application development.

## Setup Requirements

1. Python v3.7+
1. PostgreSQL 12+
1. Create a database called "dr_mvp" and grant full access to the default user.
1. Create a Python virtual environment, name it env.
1. Use PIP to install Python modules listed in requirements.txt
1. Latest versions of Node and NPM.
1. Use NPM to install node packages.
1. Redis (version?)
1. Link Django environment file.
```
  $ cd djmain/
  $ ln -s ../djconf/dev/settings.env ./.env
```

## Dev tools

See the Makefile.

Python code format: There is a yapf style file checked in at .style.yapf in the root folder.

## First Deploy to Heroku

* Create the Heroku app.
* Create the remote.
* Add postgres addon through command line.
* Add redis addon through command line.
* Add initial env var settings (script TBD).
* Add django and node buildpacks.
* Push.

## Add Facebook login.

* Create a Facebook app.
* Set App Domain to full domain name.
* In Heroku env vars, set SOCIAL_AUTH_FACEBOOK_KEY to App ID and SOCIAL_AUTH_FACEBOOK_SECRET to App Secret.
* Add product Facebook Login to app.
* Add https://domain.name/complete/facebook/ to Valid OAuth Redirect URIs.
