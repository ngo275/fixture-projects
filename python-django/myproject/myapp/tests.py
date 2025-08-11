from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Post

class PostAPITestCase(APITestCase):
    def setUp(self):
        self.post = Post.objects.create(
            title="Test Post",
            content="This is a test post",
            author="Test Author"
        )

    def test_get_posts(self):
        url = reverse('post-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_post(self):
        url = reverse('post-list')
        data = {
            'title': 'New Post',
            'content': 'New content',
            'author': 'New Author'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 2)

    def test_get_post_detail(self):
        url = reverse('post-detail', kwargs={'pk': self.post.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.post.title)