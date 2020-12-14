# pylint: disable=import-error,unused-wildcard-import,wildcard-import
"""Django settings module for testing environment such as Heroku"""
import django_heroku

from .base import *

# The following if statement is needed to prevent overwriting global variables when
# this settings file is interpreted
if os.environ.get('DJANGO_SETTINGS_MODULE') == 'tcf_core.settings.testing':
    # Use secure connection for database access
    DATABASES['default']['OPTIONS'] = {'sslmode': 'require'}

    # Configure Django App for Heroku.
    # This should be at the bottom
    # https://devcenter.heroku.com/articles/django-app-configuration
    # "This will automatically configure DATABASE_URL, ALLOWED_HOSTS, ... Logging"
    # https://github.com/heroku/django-heroku
    django_heroku.settings(locals())
