from django.contrib import admin
from .models import Document, DocumentShare, DocumentAttachment

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'created_at', 'updated_at')
    search_fields = ('title', 'content', 'owner__username')
    list_filter = ('created_at', 'updated_at')

@admin.register(DocumentShare)
class DocumentShareAdmin(admin.ModelAdmin):
    list_display = ('document', 'shared_with', 'permission', 'created_at')
    list_filter = ('permission', 'created_at')

@admin.register(DocumentAttachment)
class DocumentAttachmentAdmin(admin.ModelAdmin):
    list_display = ('filename', 'document', 'uploaded_at')
