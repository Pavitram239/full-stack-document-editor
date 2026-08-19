import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import {
  ArrowLeft,
  Save,
  Share2,
  Paperclip,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo,
  Redo,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye
} from 'lucide-react';

export default function Editor({
  documentData,
  onSave,
  onBack,
  onOpenShareModal,
  onOpenAttachModal,
  isSaving,
  saveError
}) {
  const [title, setTitle] = useState(documentData?.title || 'Untitled Document');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'unsaved', 'saving'
  const isOwner = documentData?.is_owner;
  const canEdit = isOwner || documentData?.permission === 'edit';

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
    ],
    content: documentData?.content || '',
    editable: canEdit,
    onUpdate: ({ editor }) => {
      setSaveStatus('unsaved');
    },
  });

  // Keep editor content in sync if documentData changes externally
  useEffect(() => {
    if (editor && documentData) {
      setTitle(documentData.title || 'Untitled Document');
      if (editor.getHTML() !== documentData.content) {
        editor.commands.setContent(documentData.content || '');
      }
    }
  }, [documentData?.id]);

  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
    }
  }, [isSaving]);

  const handleManualSave = () => {
    if (!editor) return;
    const updatedContent = editor.getHTML();
    onSave({ title, content: updatedContent });
    setSaveStatus('saved');
  };

  const handleTitleBlur = () => {
    if (title.trim() !== documentData.title) {
      handleManualSave();
    }
  };

  if (!editor) {
    return (
      <div className="editor-loading">
        <div className="spinner"></div>
        <p>Initializing editor...</p>
      </div>
    );
  }

  return (
    <div className="editor-container">
      {/* Top Navigation & Action Header */}
      <div className="editor-header">
        <div className="header-left">
          <button className="btn-icon" onClick={onBack} title="Back to documents">
            <ArrowLeft size={20} />
          </button>
          
          <div className="title-section">
            <input
              type="text"
              className="document-title-input"
              value={title}
              disabled={!canEdit}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaveStatus('unsaved');
              }}
              onBlur={handleTitleBlur}
              placeholder="Untitled Document"
            />

            <div className="save-status-indicator">
              {saveStatus === 'saved' && (
                <span className="status-badge status-saved">
                  <CheckCircle size={13} /> Saved
                </span>
              )}
              {saveStatus === 'unsaved' && (
                <span className="status-badge status-unsaved">
                  <Clock size={13} /> Unsaved changes
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="status-badge status-saving">
                  <div className="spinner-mini"></div> Saving...
                </span>
              )}
              {saveError && (
                <span className="status-badge status-error">
                  <AlertCircle size={13} /> {saveError}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="header-right">
          {canEdit && (
            <button className="btn-secondary" onClick={onOpenAttachModal}>
              <Paperclip size={16} />
              <span>Attach File</span>
            </button>
          )}

          {isOwner && (
            <button className="btn-secondary btn-share" onClick={onOpenShareModal}>
              <Share2 size={16} />
              <span>Share</span>
            </button>
          )}

          {canEdit && (
            <button className="btn-primary" onClick={handleManualSave} disabled={isSaving}>
              <Save size={16} />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>

      {!canEdit && (
        <div className="readonly-banner">
          <Eye size={16} />
          <span>You are viewing this document in <strong>View Only</strong> mode.</span>
        </div>
      )}

      {/* Formatting Toolbar */}
      {canEdit && (
        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button
              className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold (Ctrl+B)"
            >
              <Bold size={16} />
            </button>
            <button
              className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic (Ctrl+I)"
            >
              <Italic size={16} />
            </button>
            <button
              className={`toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon size={16} />
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button
              className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Heading 1"
            >
              <Heading1 size={16} />
            </button>
            <button
              className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
            >
              <Heading2 size={16} />
            </button>
            <button
              className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              title="Heading 3"
            >
              <Heading3 size={16} />
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button
              className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bulleted List"
            >
              <List size={16} />
            </button>
            <button
              className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button
              className="toolbar-btn"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo size={16} />
            </button>
            <button
              className="toolbar-btn"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Editor Body Canvas */}
      <div className="editor-workspace">
        <div className="editor-paper">
          <EditorContent editor={editor} className="tiptap-editor-content" />
        </div>
      </div>

      {/* Attachments Footer */}
      {documentData?.attachments && documentData.attachments.length > 0 && (
        <div className="attachments-footer">
          <div className="attachments-title">
            <Paperclip size={14} />
            <span>Attachments ({documentData.attachments.length})</span>
          </div>
          <div className="attachments-list">
            {documentData.attachments.map((att) => (
              <a
                key={att.id}
                href={`http://127.0.0.1:8000${att.file}`}
                target="_blank"
                rel="noreferrer"
                className="attachment-chip"
              >
                {att.filename}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
