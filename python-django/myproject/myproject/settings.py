import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from the project .env file (located at python-django/.env)
# .env path is one level above BASE_DIR (BASE_DIR points to python-django/myproject)
load_dotenv(dotenv_path=BASE_DIR.parent / '.env')

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-your-secret-key-here')
DEBUG = os.environ.get('DEBUG', 'True').lower() in {'1', 'true', 'yes', 'on'}
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'myapp',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'myproject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'myproject.wsgi.application'


import re

db_url = 'postgresql://neondb_owner:npg_DefEoZqHy76K@ep-crimson-frog-ad3029nh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
# Example: postgresql://user:password@localhost:5432/dbname
pattern = r'^(?P<scheme>.+?)://(?P<user>[^:]+):(?P<password>[^@]+)@(?P<host>[^:/]+)(:(?P<port>\d+))?/(?P<dbname>[^?]+)(\?(?P<query>.*))?$'
match = re.match(pattern, db_url) if db_url else None

class TmpPostgres:
    def __init__(self, m):
        self.username = m.group('user') if m else None
        self.password = m.group('password') if m else None
        self.hostname = m.group('host') if m else None
        self.port = m.group('port') if m else None
        self.path = '/' + m.group('dbname') if m else ''
        self.query = m.group('query') if m else ''

tmpPostgres = TmpPostgres(match)

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': tmpPostgres.path.replace('/', ''),
#         'USER': tmpPostgres.username,
#         'PASSWORD': tmpPostgres.password,
#         'HOST': tmpPostgres.hostname,
#         'PORT': 5432,
#         'OPTIONS': {},
#     }
# }
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'django_blog_db'),
        'USER': os.environ.get('DB_USER', 'user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'password'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}