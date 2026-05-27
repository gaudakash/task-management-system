"""
Django Settings for Task Management System

CONCEPT: settings.py is the central configuration for your Django project.
It defines database connections, installed apps, middleware, and security settings.
"""

from pathlib import Path
from datetime import timedelta
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# CONCEPT: BASE_DIR gives us the absolute path to our project root
# so we can reference files/folders relative to it
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
# CONCEPT: SECRET_KEY is used by Django for cryptographic signing
# (sessions, tokens, password reset links). NEVER expose it publicly.
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-change-this-in-production-abc123xyz'
)

# SECURITY WARNING: don't run with debug turned on in production!
# CONCEPT: DEBUG=True shows detailed error pages. In production, set to False
# to avoid exposing internal code/stack traces to users.
DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Application definition
# CONCEPT: INSTALLED_APPS tells Django which modules to load.
# Order matters — Django processes them top to bottom.
INSTALLED_APPS = [
    'django.contrib.admin',        # Built-in admin panel
    'django.contrib.auth',         # Authentication framework
    'django.contrib.contenttypes', # Content type system (used by auth)
    'django.contrib.sessions',     # Session framework
    'django.contrib.messages',     # Messaging framework
    'django.contrib.staticfiles',  # Static file handling

    # Third-party apps
    'rest_framework',              # Django REST Framework for building APIs
    'corsheaders',                 # Cross-Origin Resource Sharing headers

    # Our apps
    'accounts',                    # User authentication & registration
    'tasks',                       # Task management (core feature)
]

# CONCEPT: Middleware is like a pipeline — every request/response passes through
# each middleware in order. Think of it as "filters" for HTTP traffic.
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',          # Must be high up - handles CORS
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'config.wsgi.application'

# Database
# CONCEPT: Django ORM abstracts database operations. You write Python classes (models)
# and Django translates them to SQL tables. We use SQLite for development (file-based,
# no setup needed) and can switch to PostgreSQL for production.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
# CONCEPT: These validators enforce password strength rules during registration.
# They check minimum length, similarity to username, common passwords, and numeric-only.
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'  # IST timezone
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ============================================================
# Django REST Framework Configuration
# ============================================================
# CONCEPT: DRF (Django REST Framework) extends Django to easily build REST APIs.
# Here we configure:
# 1. DEFAULT_AUTHENTICATION_CLASSES: How users prove their identity (JWT tokens)
# 2. DEFAULT_PERMISSION_CLASSES: Default access rules (must be authenticated)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# ============================================================
# JWT Configuration
# ============================================================
# CONCEPT: JWT (JSON Web Token) is a stateless authentication method.
# Instead of storing sessions on the server, we give the client a signed token.
#
# How it works:
# 1. User logs in with username/password
# 2. Server validates and returns two tokens:
#    - ACCESS token (short-lived, 1 day) — used for API requests
#    - REFRESH token (long-lived, 7 days) — used to get a new access token
# 3. Client sends access token in every request header: "Authorization: Bearer <token>"
# 4. Server decodes the token to identify the user (no database lookup needed!)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,              # Issue new refresh token on refresh
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),            # Token prefix in headers
}

# ============================================================
# CORS Configuration
# ============================================================
# CONCEPT: CORS (Cross-Origin Resource Sharing) is a browser security feature.
# By default, browsers block requests from one domain to another.
# Since our React frontend (port 5173) talks to Django backend (port 8000),
# we need to explicitly allow this "cross-origin" communication.
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",      # Vite dev server
    "http://localhost:3000",      # Alternative React port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# Also allow these headers in CORS requests
CORS_ALLOW_CREDENTIALS = True