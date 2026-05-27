"""
Account Serializers — Convert data between Python objects and JSON.

CONCEPT: Serializers in DRF serve two purposes:
1. SERIALIZATION: Convert Django model instances → JSON (for API responses)
2. DESERIALIZATION: Convert incoming JSON → validated Python data (for creating/updating)

Think of serializers as "translators" between your database and the outside world.
They also handle VALIDATION — ensuring data is correct before saving.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Handles user registration with validation.
    
    CONCEPT: ModelSerializer automatically creates fields based on the model.
    We add extra validation for passwords.
    """
    
    # 'write_only=True' means this field accepts input but is NEVER returned in responses
    # This is crucial for security — we never send passwords back to the client
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],  # Uses Django's password validators
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'password2')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        """
        CONCEPT: Object-level validation.
        This runs AFTER individual field validations pass.
        We use it to compare two fields against each other.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Passwords do not match."
            })
        return attrs

    def validate_email(self, value):
        """
        CONCEPT: Field-level validation.
        Method named 'validate_<field_name>' is automatically called for that field.
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        """
        CONCEPT: Custom create method.
        We override this because:
        1. We need to remove 'password2' (it's not a model field)
        2. We use 'create_user()' instead of 'create()' to ensure password HASHING
        
        PASSWORD HASHING: Passwords are NEVER stored as plain text.
        Django uses PBKDF2 algorithm by default — it converts "mypassword" into
        something like "pbkdf2_sha256$600000$salt$hash" which is irreversible.
        Even if the database is compromised, attackers can't read passwords.
        """
        validated_data.pop('password2')  # Remove confirmation field
        user = User.objects.create_user(**validated_data)  # Hashes password automatically
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Simple serializer for displaying user info.
    Used for: current user profile, user listing (for task assignment dropdown).
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        # No password field here — never expose passwords in API responses!


class LoginSerializer(serializers.Serializer):
    """
    CONCEPT: Regular Serializer (not ModelSerializer).
    Used when you need to validate input that doesn't directly map to a model.
    Login just needs username + password, not a full User object.
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)