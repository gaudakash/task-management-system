"""
Account Views — Handle HTTP requests for authentication.

CONCEPT: Views are the "controllers" in MVC pattern (Django calls it MVT — Model-View-Template).
Each view receives an HTTP request and returns an HTTP response.

In DRF, we use:
- APIView: Class-based, gives full control over HTTP methods (GET, POST, etc.)
- GenericAPIView: Adds common patterns (list, create, retrieve)
- ViewSet: Groups related views together (list + create + retrieve + update + delete)
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .serializers import UserRegistrationSerializer, UserSerializer, LoginSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    
    Creates a new user account.
    
    CONCEPT: generics.CreateAPIView provides a ready-made POST handler.
    It automatically:
    1. Deserializes the JSON body using our serializer
    2. Validates the data
    3. Calls serializer.create() to save to database
    4. Returns the created object as JSON with status 201
    
    permission_classes = [AllowAny] means this endpoint is PUBLIC
    (no authentication needed — because you can't login before registering!)
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens immediately after registration
        # so the user is "logged in" right away
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful!'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    POST /api/auth/login/
    
    Authenticates user and returns JWT tokens.
    
    CONCEPT: Authentication Flow:
    1. Client sends username + password
    2. Server hashes the provided password with the same algorithm
    3. Compares the hash with the stored hash in database
    4. If match → user is authenticated → generate and return JWT tokens
    5. If no match → return 401 Unauthorized
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Django's authenticate() checks username + password
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )

        if user is None:
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate JWT token pair
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful!'
        })


class MeView(APIView):
    """
    GET /api/auth/me/
    
    Returns the current authenticated user's info.
    
    CONCEPT: Protected Route
    Since we set DEFAULT_PERMISSION_CLASSES to IsAuthenticated in settings.py,
    this view REQUIRES a valid JWT token in the Authorization header.
    
    DRF automatically:
    1. Reads the 'Authorization: Bearer <token>' header
    2. Decodes and validates the JWT token
    3. Sets request.user to the corresponding User object
    4. If token is invalid/expired → returns 401 automatically
    """
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserListView(generics.ListAPIView):
    """
    GET /api/auth/users/
    
    Returns all users (for the "assign task" dropdown).
    Excludes the current user (you don't assign tasks to yourself).
    
    CONCEPT: ListAPIView provides a ready-made GET handler that:
    1. Queries the database using get_queryset()
    2. Serializes the queryset (list of objects → list of JSON)
    3. Returns paginated results
    """
    serializer_class = UserSerializer

    def get_queryset(self):
        # Exclude current user from the list
        return User.objects.exclude(id=self.request.user.id)