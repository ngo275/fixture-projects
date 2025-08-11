from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render

def home_view(request):
    return render(request, 'index.html', {
        'title': 'Django Demo',
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view),
    path('api/', include('myapp.urls')),
]