from django.db import models
from django.contrib.auth.models import User

class Document(models.Model):
    title = models.CharField(max_length=255, default='Untitled Document')
    content = models.TextField(blank=True, default='')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} (Owner: {self.owner.username})"


class DocumentShare(models.Model):
    PERMISSION_CHOICES = (
        ('view', 'View Only'),
        ('edit', 'Can Edit'),
    )

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='shares')
    shared_with = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_documents')
    permission = models.CharField(max_length=10, choices=PERMISSION_CHOICES, default='edit')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('document', 'shared_with')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.document.title} shared with {self.shared_with.username} ({self.permission})"


class DocumentAttachment(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/')
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50, blank=True, default='')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment {self.filename} for {self.document.title}"
