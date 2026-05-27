"""
Account URL patterns.

CONCEPT: Each app has its own urls.py for modularity.
These URLs are "mounted" under /api/auth/ by the main urls.py
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('me/', views.MeView.as_view(), name='me'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    
    # CONCEPT: Token Refresh Endpoint
    # When the access token expires, the client sends the refresh token here
    # to get a NEW access token without re-entering username/password.
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]