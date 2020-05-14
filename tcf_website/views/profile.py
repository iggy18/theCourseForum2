"""Views for user profile."""

from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def profile(request):
    """User profile view."""
    badge_message = request.user.update_badges()
    if badge_message:
         # Current problem: if two badges are earned at once, only one will show up

    return render(request, 'profile/profile.html')


@login_required
def reviews(request):
    """User reviews view."""
    return render(request, 'reviews/user_reviews.html')
