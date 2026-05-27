"""
Task Serializers — Handles data conversion and validation for tasks.

CONCEPT: Serializer Nesting
When a Task has ForeignKey to User, by default DRF shows just the user ID (integer).
But in the API response, we want to show user details (username, email).
We achieve this by NESTING the UserSerializer inside TaskSerializer.
"""

from rest_framework import serializers
from .models import Task
from accounts.serializers import UserSerializer


class TaskSerializer(serializers.ModelSerializer):
    """
    Full task serializer for read operations.
    
    CONCEPT: read_only fields
    - 'creator' is set automatically from the authenticated user (not from JSON input)
    - 'created_at', 'updated_at' are auto-generated
    - These fields appear in responses but are ignored in request bodies
    """
    
    # Nested serializers for readable output
    # CONCEPT: When reading (GET), we show full user objects like:
    # { "creator": { "id": 1, "username": "john", ... } }
    # instead of just: { "creator": 1 }
    creator = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    
    # Write-only field for setting assignee by ID
    # CONCEPT: When creating/updating (POST/PUT), the client sends:
    # { "assigned_to_id": 2 }
    # We use this ID to look up and link the User object.
    assigned_to_id = serializers.IntegerField(
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'due_date', 'task_type', 'creator', 'assigned_to',
            'assigned_to_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Cross-field validation:
        - If task_type is 'assigned', assigned_to_id must be provided
        - If task_type is 'personal', assigned_to should be null
        """
        task_type = attrs.get('task_type', getattr(self.instance, 'task_type', 'personal'))
        assigned_to_id = attrs.get('assigned_to_id')

        if task_type == 'assigned' and not assigned_to_id:
            # Check if this is an update and already has an assignee
            if not (self.instance and self.instance.assigned_to):
                raise serializers.ValidationError({
                    'assigned_to_id': 'Assigned tasks must have an assignee.'
                })

        if task_type == 'personal' and assigned_to_id:
            raise serializers.ValidationError({
                'assigned_to_id': 'Personal tasks cannot have an assignee.'
            })

        return attrs

    def validate_assigned_to_id(self, value):
        """Ensure the assignee user actually exists."""
        if value is not None:
            from django.contrib.auth.models import User
            if not User.objects.filter(id=value).exists():
                raise serializers.ValidationError("User not found.")
            
            # Can't assign to yourself
            request = self.context.get('request')
            if request and value == request.user.id:
                raise serializers.ValidationError("You cannot assign a task to yourself. Use personal task instead.")
        return value


class TaskCreateSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for creating tasks.
    Separating create and update serializers is a clean pattern.
    """
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'due_date', 'task_type', 'assigned_to_id'
        ]

    def validate(self, attrs):
        task_type = attrs.get('task_type', 'personal')
        assigned_to_id = attrs.get('assigned_to_id')

        if task_type == 'assigned' and not assigned_to_id:
            raise serializers.ValidationError({
                'assigned_to_id': 'Assigned tasks must have an assignee.'
            })
        if task_type == 'personal':
            attrs.pop('assigned_to_id', None)

        return attrs

    def validate_assigned_to_id(self, value):
        if value is not None:
            from django.contrib.auth.models import User
            if not User.objects.filter(id=value).exists():
                raise serializers.ValidationError("User not found.")
            request = self.context.get('request')
            if request and value == request.user.id:
                raise serializers.ValidationError("You cannot assign a task to yourself.")
        return value

    def create(self, validated_data):
        """
        CONCEPT: We override create() to:
        1. Set the creator to the currently authenticated user
        2. Handle the assigned_to_id → assigned_to relationship
        """
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        # The creator is the logged-in user (from request context)
        validated_data['creator'] = self.context['request'].user
        
        if assigned_to_id:
            from django.contrib.auth.models import User
            validated_data['assigned_to'] = User.objects.get(id=assigned_to_id)
        
        return super().create(validated_data)


class TaskUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating tasks.
    
    CONCEPT: Role-Based Field Permissions
    The key business logic — WHO can edit WHAT — is enforced here
    and in the view. The serializer controls which fields are accepted.
    """
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Task
        fields = [
            'title', 'description', 'status', 'priority',
            'due_date', 'assigned_to_id'
        ]

    def validate_assigned_to_id(self, value):
        if value is not None:
            from django.contrib.auth.models import User
            if not User.objects.filter(id=value).exists():
                raise serializers.ValidationError("User not found.")
        return value

    def update(self, instance, validated_data):
        """
        Update with role-based permission enforcement.
        """
        user = self.context['request'].user
        
        if instance.task_type == 'assigned':
            if instance.assigned_to == user:
                # ASSIGNEE: Can ONLY update status
                allowed_fields = {'status'}
                for field in list(validated_data.keys()):
                    if field not in allowed_fields:
                        validated_data.pop(field)
            
            elif instance.creator == user:
                # ASSIGNER: Can update due_date only, NOT status
                allowed_fields = {'due_date'}
                for field in list(validated_data.keys()):
                    if field not in allowed_fields:
                        validated_data.pop(field)
        
        # For PERSONAL tasks, creator can update everything (no restrictions)
        
        # Handle assigned_to_id
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        if assigned_to_id is not None and instance.creator == user:
            from django.contrib.auth.models import User
            instance.assigned_to = User.objects.get(id=assigned_to_id)
        
        # Update remaining fields
        for field, value in validated_data.items():
            setattr(instance, field, value)
        
        instance.save()
        return instance