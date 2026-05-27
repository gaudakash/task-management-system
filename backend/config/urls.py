"""
URL Configuration — The "routing table" for our entire backend.

CONCEPT: Django uses URL patterns to map incoming HTTP requests to the correct
view (handler function). Think of it like a phone directory:
- /api/auth/* → accounts app handles it
- /api/tasks/* → tasks app handles it
- /admin/* → Django's built-in admin panel
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),               # Django admin panel
    path('api/auth/', include('accounts.urls')),    # Auth routes (register, login, etc.)
    path('api/tasks/', include('tasks.urls')),      # Task CRUD routes
]