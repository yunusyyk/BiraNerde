from django.urls import path
from .views import MekanList

urlpatterns = [
    path('mekanlar/', MekanList.as_view(), name='mekan-list'),
]