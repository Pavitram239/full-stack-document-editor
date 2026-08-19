from django.urls import path
from .views import (
    UserListView,
    DocumentListCreateView,
    DocumentDetailView,
    DocumentShareView,
    DocumentImportView,
    DocumentAttachmentView,
)

urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
    path('documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/import/', DocumentImportView.as_view(), name='document-import'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    path('documents/<int:pk>/share/', DocumentShareView.as_view(), name='document-share'),
    path('documents/<int:pk>/attach/', DocumentAttachmentView.as_view(), name='document-attach'),
]
