import React, { useState } from 'react';
import { X, Share2, UserPlus, Trash2, Shield, Eye, Edit3 } from 'lucide-react';

export default function ShareModal({
  isOpen,
  onClose,
  documentData,
  users,
  currentUser,
  onShare,
  onRemoveShare
}) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [permission, setPermission] = useState('edit');
  const [error, setError] = useState('');

  if (!isOpen || !documentData) return null;

  // Filter out document owner from user options
  const shareableUsers = users.filter(
    (u) => u.id !== documentData.owner?.id && u.id !== currentUser?.id
  );

  const handleShareSubmit = (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a user to share with.');
      return;
    }
    setError('');
    onShare(documentData.id, selectedUserId, permission);
    setSelectedUserId('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Share2 size={20} className="text-blue-600" />
            <span>Share "{documentData.title}"</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-alert">{error}</div>}

          {/* Add Share Form */}
          <form onSubmit={handleShareSubmit} className="share-form">
            <div className="form-group">
              <label>Select User to Share With</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="form-select"
              >
                <option value="">-- Choose a user --</option>
                {shareableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name || u.username} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Permission Level</label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="form-select"
              >
                <option value="edit">Can Edit (Full editing rights)</option>
                <option value="view">View Only (Read-only access)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary btn-full">
              <UserPlus size={16} />
              <span>Grant Access</span>
            </button>
          </form>

          {/* Existing Shares List */}
          <div className="existing-shares-section">
            <h4>People with Access</h4>

            <div className="share-row owner-row">
              <div className="user-info">
                <div className="avatar">{documentData.owner?.username?.[0]?.toUpperCase() || 'O'}</div>
                <div>
                  <div className="user-name">{documentData.owner?.first_name || documentData.owner?.username} (Owner)</div>
                  <div className="user-email">{documentData.owner?.email}</div>
                </div>
              </div>
              <span className="badge badge-owner">Owner</span>
            </div>

            {documentData.shares && documentData.shares.length > 0 ? (
              documentData.shares.map((share) => (
                <div key={share.id} className="share-row">
                  <div className="user-info">
                    <div className="avatar">
                      {share.shared_with?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="user-name">
                        {share.shared_with?.first_name || share.shared_with?.username}
                      </div>
                      <div className="user-email">{share.shared_with?.email}</div>
                    </div>
                  </div>

                  <div className="share-controls">
                    {share.permission === 'edit' ? (
                      <span className="badge badge-edit-perm">
                        <Edit3 size={12} /> Can Edit
                      </span>
                    ) : (
                      <span className="badge badge-view-perm">
                        <Eye size={12} /> View Only
                      </span>
                    )}

                    <button
                      className="btn-icon btn-delete-share"
                      title="Revoke access"
                      onClick={() => onRemoveShare(documentData.id, share.shared_with?.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-shares-text">No other users have been granted access yet.</p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
