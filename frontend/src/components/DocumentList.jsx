import React from 'react';
import { FileText, Clock, Share2, Trash2, Edit3, Eye, User } from 'lucide-react';

export default function DocumentList({
  documents,
  loading,
  onSelectDoc,
  onDeleteDoc,
  activeFilter,
  searchQuery
}) {
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html || "";
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) {
    return (
      <div className="doc-list-state">
        <div className="spinner"></div>
        <p>Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="doc-list-state empty-state">
        <FileText size={48} className="empty-icon" />
        <h3>No documents found</h3>
        <p>
          {searchQuery
            ? `No matches for "${searchQuery}"`
            : activeFilter === 'shared'
            ? 'No documents have been shared with you yet.'
            : activeFilter === 'owned'
            ? 'You have not created any documents yet.'
            : 'Get started by creating a new document or importing a file.'}
        </p>
      </div>
    );
  }

  return (
    <div className="document-grid">
      {documents.map((doc) => {
        const previewText = stripHtml(doc.content).slice(0, 140) || 'Empty document...';
        const isOwner = doc.is_owner;
        
        return (
          <div
            key={doc.id}
            className="document-card"
            onClick={() => onSelectDoc(doc.id)}
          >
            <div className="card-header">
              <div className="card-title-group">
                <FileText size={20} className="doc-icon" />
                <h3 className="card-title" title={doc.title}>{doc.title}</h3>
              </div>
              
              {isOwner ? (
                <button
                  className="btn-card-delete"
                  title="Delete Document"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDoc(doc.id, doc.title);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              ) : null}
            </div>

            <div className="card-preview">
              <p>{previewText}</p>
            </div>

            <div className="card-footer">
              <div className="badge-group">
                {isOwner ? (
                  <span className="badge badge-owner">Owned</span>
                ) : (
                  <span className="badge badge-shared">
                    <Share2 size={12} /> {doc.owner?.first_name || doc.owner?.username || 'Shared'}
                  </span>
                )}

                {doc.permission === 'edit' || isOwner ? (
                  <span className="badge badge-edit-perm" title="You can edit this document">
                    <Edit3 size={11} /> Edit
                  </span>
                ) : (
                  <span className="badge badge-view-perm" title="View only access">
                    <Eye size={11} /> View Only
                  </span>
                )}

                {doc.shares_count > 0 && isOwner && (
                  <span className="badge badge-shares-count">
                    Shared with {doc.shares_count}
                  </span>
                )}
              </div>

              <div className="card-time">
                <Clock size={12} />
                <span>Updated {formatDate(doc.updated_at)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
