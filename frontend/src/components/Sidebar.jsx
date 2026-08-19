import React from 'react';
import { Plus, Upload, Folder, UserCheck, Share2, Info } from 'lucide-react';

export default function Sidebar({
  activeFilter,
  setActiveFilter,
  onCreateNewDoc,
  onOpenImportModal,
  currentDocCount
}) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-actions">
        <button className="btn-primary btn-new-doc" onClick={onCreateNewDoc}>
          <Plus size={18} />
          <span>New Document</span>
        </button>
        
        <button className="btn-secondary btn-import-doc" onClick={onOpenImportModal}>
          <Upload size={18} />
          <span>Import File</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group-title">WORKSPACE</div>
        
        <button
          className={`nav-item ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <Folder size={18} />
          <span>All Documents</span>
        </button>

        <button
          className={`nav-item ${activeFilter === 'owned' ? 'active' : ''}`}
          onClick={() => setActiveFilter('owned')}
        >
          <UserCheck size={18} />
          <span>My Documents</span>
        </button>

        <button
          className={`nav-item ${activeFilter === 'shared' ? 'active' : ''}`}
          onClick={() => setActiveFilter('shared')}
        >
          <Share2 size={18} />
          <span>Shared with Me</span>
        </button>
      </nav>

      <div className="sidebar-info-card">
        <div className="info-header">
          <Info size={16} />
          <span>Supported Files</span>
        </div>
        <p className="info-text">
          Upload <strong>.txt</strong>, <strong>.md</strong>, or <strong>.docx</strong> files to instantly convert them into editable rich-text documents.
        </p>
      </div>
    </aside>
  );
}
