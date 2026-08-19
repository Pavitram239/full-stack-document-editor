from rest_framework.authentication import BaseAuthentication
from django.contrib.auth.models import User

class DemoHeaderAuthentication(BaseAuthentication):
    """
    DRF Authentication backend that authenticates requests based on
    the 'X-User-Username' or 'X-User-ID' header.
    Defaults to 'alice' if no header is supplied.
    """
    def authenticate(self, request):
        # Read header from request.headers or request.META
        username = request.headers.get('X-User-Username') or request.META.get('HTTP_X_USER_USERNAME')
        user_id = request.headers.get('X-User-ID') or request.META.get('HTTP_X_USER_ID')

        active_user = None
        if user_id and str(user_id).isdigit():
            active_user = User.objects.filter(id=int(user_id)).first()

        if not active_user and username:
            active_user, _ = User.objects.get_or_create(
                username=username,
                defaults={'first_name': username.capitalize(), 'email': f'{username}@example.com'}
            )

        if not active_user:
            active_user, _ = User.objects.get_or_create(
                username='alice',
                defaults={'first_name': 'Alice', 'email': 'alice@example.com'}
            )

        return (active_user, None)
