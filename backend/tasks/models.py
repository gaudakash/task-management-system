"""
Task Model — The heart of our application.

CONCEPT: Django Models
Models define the STRUCTURE of your database tables using Python classes.
Each class = one table. Each attribute = one column.
Django's ORM (Object-Relational Mapper) translates these into SQL:

    class Task → CREATE TABLE tasks_task (...)
    Task.objects.filter(status='todo') → SELECT * FROM tasks_task WHERE status = 'todo'

This abstraction means you write Python, not SQL, making your code
database-agnostic (works with SQLite, PostgreSQL, MySQL, etc.)
"""

from django.db import models
from django.contrib.auth.models import User


class Task(models.Model):
    """
    Task model with support for Personal and Assigned tasks.
    
    CONCEPT: Field Types
    - CharField: Short text with max_length (stored as VARCHAR in SQL)
    - TextField: Long text, no max_length (stored as TEXT)
    - DateField: Calendar date (stored as DATE)
    - DateTimeField: Date + time (stored as TIMESTAMP)
    - ForeignKey: Relationship to another table (creates an INTEGER column with FK constraint)
    """

    # ---- Choice Fields ----
    # CONCEPT: choices parameter restricts a field to predefined values.
    # In the database, only the first element (e.g., 'todo') is stored.
    # The second element (e.g., 'Todo') is the human-readable label.
    
    class Status(models.TextChoices):
        TODO = 'todo', 'Todo'
        IN_PROGRESS = 'in_progress', 'In Progress'
        DONE = 'done', 'Done'

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'

    class TaskType(models.TextChoices):
        PERSONAL = 'personal', 'Personal'
        ASSIGNED = 'assigned', 'Assigned'

    # ---- Core Fields ----
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO
    )
    
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    
    due_date = models.DateField(null=True, blank=True)
    
    task_type = models.CharField(
        max_length=20,
        choices=TaskType.choices,
        default=TaskType.PERSONAL
    )

    # ---- Relationship Fields ----
    # CONCEPT: ForeignKey creates a Many-to-One relationship.
    # 
    # 'creator' → The user who created this task (required, always set)
    #   - related_name='created_tasks' means you can do: user.created_tasks.all()
    #     to get all tasks created by this user
    #   - on_delete=CASCADE means: if the user is deleted, delete all their tasks too
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_tasks'
    )
    
    # 'assigned_to' → The user this task is assigned to (optional)
    #   - null=True, blank=True makes it optional
    #   - For personal tasks, this is NULL
    #   - For assigned tasks, this points to the assignee
    #   - on_delete=SET_NULL means: if the assignee is deleted, set this to NULL
    #     (don't delete the task, just remove the assignment)
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )

    # ---- Timestamp Fields ----
    # CONCEPT: auto_now_add sets the value when the object is FIRST created
    #          auto_now sets the value EVERY TIME the object is saved
    # These are useful for audit trails.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """
        CONCEPT: Meta class defines model-level metadata.
        - ordering: default sort order for querysets
        - Negative sign means descending (newest first)
        """
        ordering = ['-created_at']

    def __str__(self):
        """String representation shown in Django admin and shell."""
        return f"{self.title} ({self.get_task_type_display()})"