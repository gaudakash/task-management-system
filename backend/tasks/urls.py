"""
Task URL patterns using DRF Router.

CONCEPT: DRF Routers
Instead of manually defining URL patterns for each CRUD operation,
Routers automatically generate them from ViewSets:

router.register('', TaskViewSet)  generates:
  GET    /api/tasks/       → TaskViewSet.list()
  POST   /api/tasks/       → TaskViewSet.create()
  GET    /api/tasks/{pk}/  → TaskViewSet.retrieve()
  PUT    /api/tasks/{pk}/  → TaskViewSet.update()
  PATCH  /api/tasks/{pk}/  → TaskViewSet.partial_update()
  DELETE /api/tasks/{pk}/  → TaskViewSet.destroy()

This follows REST conventions automatically!
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
]