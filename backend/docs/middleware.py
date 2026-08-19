from django.contrib.auth.models import User

class DemoAuthMiddleware:
    """
    Middleware that inspects request headers ('X-User-Username' or 'X-User-ID')
    to simulate active user authentication without full login ceremony.
    Defaults to 'alice' if no header is supplied.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        username = request.headers.get('X-User-Username')
        user_id = request.headers.get('X-User-ID')

        active_user = None
        if user_id and user_id.isdigit():
            active_user = User.objects.filter(id=int(user_id)).first()
        
        if not active_user and username:
            active_user, _ = User.objects.get_or_create(
                username=username,
                defaults={'first_name': username.capitalize(), 'email': f'{username}@example.com'}
            )

        if not active_user:
            # Fallback default user: Alice
            active_user, _ = User.objects.get_or_create(
                username='alice',
                defaults={'first_name': 'Alice', 'email': 'alice@example.com'}
            )

        request.user = active_user
        return self.get_response(request)
