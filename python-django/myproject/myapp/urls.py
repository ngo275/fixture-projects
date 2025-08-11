from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'posts', views.PostViewSet)

urlpatterns = [
    path('', views.api_overview, name='api_overview'),
    path('', include(router.urls)),
]