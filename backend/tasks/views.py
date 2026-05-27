"""
Task Views — CRUD operations with authorization.

CONCEPT: ViewSets vs Individual Views
- ViewSet combines list, create, retrieve, update, delete into ONE class
- ModelViewSet provides all CRUD operations out of the box
- We override specific methods to add our custom logic

HTTP Method → ViewSet Method:
  GET    /tasks/      → list()
  POST   /tasks/      → create()
  GET    /tasks/{id}/ → retrieve()
  PUT    /tasks/{id}/ → update()
  PATCH  /tasks/{id}/ → partial_update()
  DELETE /tasks/{id}/ → destroy()
"""

from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from django.db.models import Q
from .models import Task
from .serializers import TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer
from .permissions import IsTaskRelated


class TaskViewSet(viewsets.ModelViewSet):
    """
    Complete CRUD API for tasks with role-based access control.
    
    CONCEPT: QuerySet Filtering for Security
    Instead of getting ALL tasks and filtering in Python,
    we filter at the DATABASE level using get_queryset().
    This is:
    1. MORE SECURE: Users never even see unauthorized data
    2. MORE EFFICIENT: Database handles filtering (indexed, optimized)
    """
    
    permission_classes = [permissions.IsAuthenticated, IsTaskRelated]

    def get_serializer_class(self):
        """
        CONCEPT: Different serializers for different actions.
        This is a clean pattern because create, read, and update
        have different field requirements.
        """
        if self.action == 'create':
            return TaskCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        return TaskSerializer  # For list, retrieve

    def get_queryset(self):
        """
        Return only tasks the current user is related to.
        
        CONCEPT: Q Objects for Complex Queries
        Django's Q objects allow OR/AND logic in database queries:
        
        Q(creator=user) | Q(assigned_to=user)
        
        Translates to SQL:
        SELECT * FROM tasks_task 
        WHERE creator_id = {user_id} OR assigned_to_id = {user_id}
        
        The pipe (|) operator means OR.
        The ampersand (&) operator means AND.
        
        select_related() performs a SQL JOIN, fetching related User objects
        in the SAME query instead of separate queries (N+1 problem prevention).
        """
        user = self.request.user
        return Task.objects.filter(
            Q(creator=user) | Q(assigned_to=user)
        ).select_related('creator', 'assigned_to')

    def perform_create(self, serializer):
        """
        CONCEPT: perform_create is called by CreateModelMixin.create()
        after validation passes. We use it to inject the creator
        (current user) into the saved object.
        
        The creator is NOT taken from the request body (security risk!)
        but from the authenticated user in the request.
        """
        serializer.save()

    def update(self, request, *args, **kwargs):
        """
        Override update to enforce role-based permissions.
        
        CONCEPT: Object-Level Permissions
        - get_object() automatically calls check_object_permissions()
        - which triggers our IsTaskRelated permission class
        - Then we apply additional business logic for what can be edited
        """
        instance = self.get_object()
        user = request.user

        # Check authorization based on task type and user role
        if instance.task_type == 'assigned':
            if user == instance.assigned_to:
                # Assignee: can only update status
                allowed_data = {}
                if 'status' in request.data:
                    allowed_data['status'] = request.data['status']
                if not allowed_data:
                    return Response(
                        {'error': 'As assignee, you can only update the task status.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                serializer = self.get_serializer(
                    instance, data=allowed_data, partial=True
                )
            elif user == instance.creator:
                # Assigner: can only update due_date
                allowed_data = {}
                if 'due_date' in request.data:
                    allowed_data['due_date'] = request.data['due_date']
                if not allowed_data:
                    return Response(
                        {'error': 'As assigner, you can only update the due date.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                serializer = self.get_serializer(
                    instance, data=allowed_data, partial=True
                )
            else:
                return Response(
                    {'error': 'You do not have permission to update this task.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif instance.task_type == 'personal':
            if user != instance.creator:
                return Response(
                    {'error': 'You do not have permission to update this task.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer = self.get_serializer(
                instance, data=request.data, partial=True
            )
        else:
            return Response(
                {'error': 'Invalid task type.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Return full task data in response
        response_serializer = TaskSerializer(instance)
        return Response(response_serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Override delete — only the creator can delete a task.
        
        CONCEPT: Soft Delete vs Hard Delete
        - Hard Delete: Actually removes the row from database (what we do here)
        - Soft Delete: Sets a 'deleted_at' timestamp, keeps the data (good for audit trails)
        For this assignment, hard delete is sufficient.
        """
        instance = self.get_object()
        
        if instance.creator != request.user:
            return Response(
                {'error': 'Only the task creator can delete this task.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance.delete()
        return Response(
            {'message': 'Task deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )