"""
Custom Permissions for Task Management.

CONCEPT: Authorization vs Authentication
- AUTHENTICATION: "Who are you?" (handled by JWT — login/tokens)
- AUTHORIZATION: "What are you allowed to do?" (handled HERE)

DRF permissions are checked BEFORE the view logic runs.
If permission is denied, DRF returns 403 Forbidden automatically.

CONCEPT: Permission Classes
DRF checks permissions in order. Each permission class has two methods:
1. has_permission(request, view) — checked for ALL requests to this view
2. has_object_permission(request, view, obj) — checked for SPECIFIC object access
Both must return True for the request to proceed.
"""

from rest_framework import permissions


class IsTaskRelated(permissions.BasePermission):
    """
    Custom permission: Users can only access tasks they are related to.
    
    A user is "related" to a task if they are:
    - The creator (made the task)
    - The assignee (task assigned to them)
    
    This implements the General Rule: 
    "Users should not be able to access or modify tasks they are not related to"
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        # User must be either the creator or the assignee
        return obj.creator == user or obj.assigned_to == user