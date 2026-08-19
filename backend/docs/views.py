from rest_framework import status, views
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Document, DocumentShare, DocumentAttachment
from .serializers import (
    UserSerializer,
    DocumentListSerializer,
    DocumentDetailSerializer,
    DocumentShareSerializer,
    DocumentAttachmentSerializer
)
from .utils import parse_uploaded_file


def seed_demo_users():
    """Ensure baseline demo users exist for easy testing."""
    users_data = [
        {'username': 'alice', 'first_name': 'Alice Smith', 'email': 'alice@example.com'},
        {'username': 'bob', 'first_name': 'Bob Jones', 'email': 'bob@example.com'},
        {'username': 'charlie', 'first_name': 'Charlie Brown', 'email': 'charlie@example.com'},
    ]
    for udata in users_data:
        User.objects.get_or_create(
            username=udata['username'],
            defaults={'first_name': udata['first_name'], 'email': udata['email']}
        )


class UserListView(views.APIView):
    """
    Returns seeded users list and currently active user info.
    """
    def get(self, request):
        seed_demo_users()
        users = User.objects.all().order_by('id')
        current_user = request.user
        return Response({
            'current_user': UserSerializer(current_user).data if current_user and current_user.is_authenticated else None,
            'users': UserSerializer(users, many=True).data
        })


class DocumentListCreateView(views.APIView):
    """
    List documents owned by or shared with current user, or create new.
    """
    def get(self, request):
        seed_demo_users()
        user = request.user
        filter_type = request.query_params.get('filter', 'all')
        search_query = request.query_params.get('search', '').strip()

        if filter_type == 'owned':
            qs = Document.objects.filter(owner=user)
        elif filter_type == 'shared':
            qs = Document.objects.filter(shares__shared_with=user)
        else:
            qs = Document.objects.filter(
                Q(owner=user) | Q(shares__shared_with=user)
            ).distinct()

        if search_query:
            qs = qs.filter(
                Q(title__icontains=search_query) | Q(content__icontains=search_query)
            )

        serializer = DocumentListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        seed_demo_users()
        title = request.data.get('title', 'Untitled Document').strip() or 'Untitled Document'
        content = request.data.get('content', '')
        
        doc = Document.objects.create(
            title=title,
            content=content,
            owner=request.user
        )
        serializer = DocumentDetailSerializer(doc, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DocumentDetailView(views.APIView):
    """
    Retrieve, update or delete a specific document with permission checks.
    """
    def get_document(self, pk, user):
        doc = get_object_or_404(Document, pk=pk)
        if doc.owner_id == user.id:
            return doc, 'owner'
        share = doc.shares.filter(shared_with=user).first()
        if share:
            return doc, share.permission
        return None, None

    def get(self, request, pk):
        doc, perm = self.get_document(pk, request.user)
        if not doc:
            return Response({'detail': 'You do not have permission to view this document.'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = DocumentDetailSerializer(doc, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        doc, perm = self.get_document(pk, request.user)
        if not doc:
            return Response({'detail': 'Document not found or access denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        if perm != 'owner' and perm != 'edit':
            return Response({'detail': 'You have view-only access to this document.'}, status=status.HTTP_403_FORBIDDEN)

        if 'title' in request.data:
            new_title = str(request.data['title']).strip()
            if new_title:
                doc.title = new_title

        if 'content' in request.data:
            doc.content = str(request.data['content'])

        doc.save()
        serializer = DocumentDetailSerializer(doc, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk):
        doc, perm = self.get_document(pk, request.user)
        if not doc:
            return Response({'detail': 'Document not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)
        if perm != 'owner':
            return Response({'detail': 'Only the owner can delete this document.'}, status=status.HTTP_403_FORBIDDEN)

        doc.delete()
        return Response({'detail': 'Document deleted successfully.'}, status=status.HTTP_200_OK)


class DocumentShareView(views.APIView):
    """
    Manage document shares (grant or revoke access).
    """
    def post(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        if doc.owner_id != request.user.id:
            return Response({'detail': 'Only the document owner can share this document.'}, status=status.HTTP_403_FORBIDDEN)

        target_user_id = request.data.get('shared_with_id')
        permission = request.data.get('permission', 'edit')

        if not target_user_id:
            return Response({'detail': 'target user id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if int(target_user_id) == request.user.id:
            return Response({'detail': 'You cannot share a document with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        target_user = get_object_or_404(User, pk=target_user_id)
        
        share, created = DocumentShare.objects.update_or_create(
            document=doc,
            shared_with=target_user,
            defaults={'permission': permission}
        )

        serializer = DocumentDetailSerializer(doc, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        if doc.owner_id != request.user.id:
            return Response({'detail': 'Only the owner can remove shares.'}, status=status.HTTP_403_FORBIDDEN)

        target_user_id = request.query_params.get('shared_with_id') or request.data.get('shared_with_id')
        if not target_user_id:
            return Response({'detail': 'shared_with_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        DocumentShare.objects.filter(document=doc, shared_with_id=target_user_id).delete()
        serializer = DocumentDetailSerializer(doc, context={'request': request})
        return Response(serializer.data)


class DocumentImportView(views.APIView):
    """
    Upload a file (.txt, .md, .docx) and import it into a new editable document.
    """
    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'detail': 'No file was provided in the request.'}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES['file']
        filename = file_obj.name
        
        title, html_content = parse_uploaded_file(file_obj, filename)

        doc = Document.objects.create(
            title=title,
            content=html_content,
            owner=request.user
        )

        # Also store original attachment
        file_obj.seek(0)
        DocumentAttachment.objects.create(
            document=doc,
            file=file_obj,
            filename=filename,
            file_type=file_obj.content_type or ''
        )

        serializer = DocumentDetailSerializer(doc, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DocumentAttachmentView(views.APIView):
    """
    Attach a file to an existing document.
    """
    def post(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        if doc.owner_id != request.user.id:
            share = doc.shares.filter(shared_with=request.user, permission='edit').first()
            if not share:
                return Response({'detail': 'Permission denied to add attachments.'}, status=status.HTTP_403_FORBIDDEN)

        if 'file' not in request.FILES:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES['file']
        attachment = DocumentAttachment.objects.create(
            document=doc,
            file=file_obj,
            filename=file_obj.name,
            file_type=file_obj.content_type or ''
        )

        return Response(DocumentAttachmentSerializer(attachment).data, status=status.HTTP_201_CREATED)
