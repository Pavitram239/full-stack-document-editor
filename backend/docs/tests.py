import io
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Document, DocumentShare, DocumentAttachment
from .utils import parse_uploaded_file

class DocumentAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.alice = User.objects.create_user(username='alice', email='alice@example.com')
        self.bob = User.objects.create_user(username='bob', email='bob@example.com')
        self.charlie = User.objects.create_user(username='charlie', email='charlie@example.com')

    def test_create_and_update_document(self):
        """Test document creation, title editing, and content update."""
        # Alice creates a document
        response = self.client.post(
            '/api/documents/',
            {'title': 'Project Proposal', 'content': '<p>Initial Draft</p>'},
            HTTP_X_USER_USERNAME='alice'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        doc_id = response.data['id']
        self.assertEqual(response.data['title'], 'Project Proposal')

        # Alice updates the title and content
        update_res = self.client.patch(
            f'/api/documents/{doc_id}/',
            {'title': 'Final Project Proposal', 'content': '<h1>Final Title</h1><p>Updated content</p>'},
            HTTP_X_USER_USERNAME='alice'
        )
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data['title'], 'Final Project Proposal')
        self.assertIn('Updated content', update_res.data['content'])

        # Verify DB persistence
        doc = Document.objects.get(pk=doc_id)
        self.assertEqual(doc.title, 'Final Project Proposal')

    def test_sharing_and_permission_enforcement(self):
        """Test sharing logic: view vs edit permissions, and forbidden access."""
        # Alice creates document
        doc = Document.objects.create(
            title="Alice's Secret Strategy",
            content="<p>Confidential info</p>",
            owner=self.alice
        )

        # Bob attempts to view without share -> 403 Forbidden
        bob_res = self.client.get(f'/api/documents/{doc.id}/', HTTP_X_USER_USERNAME='bob')
        self.assertEqual(bob_res.status_code, status.HTTP_403_FORBIDDEN)

        # Alice shares document with Bob (edit access)
        share_res = self.client.post(
            f'/api/documents/{doc.id}/share/',
            {'shared_with_id': self.bob.id, 'permission': 'edit'},
            HTTP_X_USER_USERNAME='alice'
        )
        self.assertEqual(share_res.status_code, status.HTTP_200_OK)

        # Bob can now view and edit
        bob_view = self.client.get(f'/api/documents/{doc.id}/', HTTP_X_USER_USERNAME='bob')
        self.assertEqual(bob_view.status_code, status.HTTP_200_OK)
        self.assertEqual(bob_view.data['permission'], 'edit')

        bob_edit = self.client.patch(
            f'/api/documents/{doc.id}/',
            {'content': '<p>Bob added comments</p>'},
            HTTP_X_USER_USERNAME='bob'
        )
        self.assertEqual(bob_edit.status_code, status.HTTP_200_OK)

        # Alice shares with Charlie (view only access)
        self.client.post(
            f'/api/documents/{doc.id}/share/',
            {'shared_with_id': self.charlie.id, 'permission': 'view'},
            HTTP_X_USER_USERNAME='alice'
        )

        # Charlie can view, but cannot edit
        charlie_view = self.client.get(f'/api/documents/{doc.id}/', HTTP_X_USER_USERNAME='charlie')
        self.assertEqual(charlie_view.status_code, status.HTTP_200_OK)
        self.assertEqual(charlie_view.data['permission'], 'view')

        charlie_edit = self.client.patch(
            f'/api/documents/{doc.id}/',
            {'content': '<p>Charlie hack attempt</p>'},
            HTTP_X_USER_USERNAME='charlie'
        )
        self.assertEqual(charlie_edit.status_code, status.HTTP_403_FORBIDDEN)

    def test_file_import_parsing(self):
        """Test file upload parsing for text and markdown files."""
        md_file = io.BytesIO(b"# Hello World\n\nThis is **bold** text in markdown.")
        md_file.name = 'sample_notes.md'

        response = self.client.post(
            '/api/documents/import/',
            {'file': md_file},
            format='multipart',
            HTTP_X_USER_USERNAME='alice'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Sample Notes')
        self.assertIn('<h1>Hello World</h1>', response.data['content'])
        self.assertIn('<strong>bold</strong>', response.data['content'])
