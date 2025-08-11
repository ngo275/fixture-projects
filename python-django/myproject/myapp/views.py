from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Post
from .serializers import PostSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

@api_view(['GET'])
def api_overview(request):
    api_urls = {
        'List': '/posts/',
        'Detail View': '/posts/<int:id>/',
        'Create': '/posts/',
        'Update': '/posts/<int:id>/',
        'Delete': '/posts/<int:id>/',
    }
    return Response(api_urls)