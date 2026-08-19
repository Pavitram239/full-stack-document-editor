from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Document, DocumentShare, DocumentAttachment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'email']


class DocumentShareSerializer(serializers.ModelSerializer):
    shared_with = UserSerializer(read_only=True)
    shared_with_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = DocumentShare
        fields = ['id', 'document', 'shared_with', 'shared_with_id', 'permission', 'created_at']
        read_only_fields = ['document']


class DocumentAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentAttachment
        fields = ['id', 'document', 'file', 'filename', 'file_type', 'uploaded_at']
        read_only_fields = ['document']


class DocumentListSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    is_owner = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()
    shares_count = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'content', 'owner', 'created_at', 'updated_at',
            'is_owner', 'permission', 'shares_count'
        ]

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return False
        return obj.owner_id == request.user.id

    def get_permission(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return 'none'
        if obj.owner_id == request.user.id:
            return 'owner'
        share = obj.shares.filter(shared_with=request.user).first()
        return share.permission if share else 'none'

    def get_shares_count(self, obj):
        return obj.shares.count()


class DocumentDetailSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    shares = DocumentShareSerializer(many=True, read_only=True)
    attachments = DocumentAttachmentSerializer(many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'content', 'owner', 'created_at', 'updated_at',
            'is_owner', 'permission', 'shares', 'attachments'
        ]

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return False
        return obj.owner_id == request.user.id

    def get_permission(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return 'none'
        if obj.owner_id == request.user.id:
            return 'owner'
        share = obj.shares.filter(shared_with=request.user).first()
        return share.permission if share else 'none'
