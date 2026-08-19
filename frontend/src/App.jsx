import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DocumentList from './components/DocumentList';
import Editor from './components/Editor';
import ShareModal from './components/ShareModal';
import FileUploadModal from './components/FileUploadModal';
import {
  getUsers,
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  removeShare,
  importDocumentFile,
  attachFileToDoc
} from './api';

export default function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(true);

  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [attachDocId, setAttachDocId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize Users
  const fetchUsersData = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.users || []);
      const savedUsername = localStorage.getItem('doc_app_user') || 'alice';
      const matched = (res.data.users || []).find((u) => u.username === savedUsername);
      setCurrentUser(matched || res.data.current_user || res.data.users[0]);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch documents whenever filter, search or currentUser changes
  const fetchDocumentsList = async () => {
    setDocLoading(true);
    try {
      const res = await getDocuments(activeFilter, searchQuery);
      setDocuments(res.data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setDocLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchDocumentsList();
      if (selectedDocId) {
        fetchSingleDocument(selectedDocId);
      }
    }
  }, [currentUser, activeFilter, searchQuery]);

  const handleSwitchUser = (username) => {
    localStorage.setItem('doc_app_user', username);
    const target = users.find((u) => u.username === username);
    setCurrentUser(target);
    setSelectedDocId(null);
    setSelectedDoc(null);
  };

  // Fetch single document for Editor view
  const fetchSingleDocument = async (docId) => {
    setEditorLoading(true);
    setSaveError('');
    try {
      const res = await getDocument(docId);
      setSelectedDoc(res.data);
      setSelectedDocId(docId);
    } catch (err) {
      console.error('Error opening document:', err);
      alert('Could not load document or access denied.');
      setSelectedDocId(null);
      setSelectedDoc(null);
    } finally {
      setEditorLoading(false);
    }
  };

  // Create new blank document
  const handleCreateNewDoc = async () => {
    try {
      const res = await createDocument({
        title: 'Untitled Document',
        content: '<p>Start typing your document content here...</p>'
      });
      fetchDocumentsList();
      setSelectedDoc(res.data);
      setSelectedDocId(res.data.id);
    } catch (err) {
      console.error('Error creating document:', err);
      alert('Failed to create new document.');
    }
  };

  // Save document
  const handleSaveDoc = async ({ title, content }) => {
    if (!selectedDocId) return;
    setIsSaving(true);
    setSaveError('');
    try {
      const res = await updateDocument(selectedDocId, { title, content });
      setSelectedDoc(res.data);
      fetchDocumentsList();
    } catch (err) {
      console.error('Save error:', err);
      setSaveError(err.response?.data?.detail || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete document
  const handleDeleteDoc = async (docId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteDocument(docId);
      if (selectedDocId === docId) {
        setSelectedDocId(null);
        setSelectedDoc(null);
      }
      fetchDocumentsList();
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not delete document.');
    }
  };

  // Sharing
  const handleShareDoc = async (docId, targetUserId, permission) => {
    try {
      const res = await shareDocument(docId, {
        shared_with_id: targetUserId,
        permission
      });
      setSelectedDoc(res.data);
      fetchDocumentsList();
      alert('Document shared successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to share document.');
    }
  };

  const handleRemoveShare = async (docId, targetUserId) => {
    try {
      const res = await removeShare(docId, targetUserId);
      setSelectedDoc(res.data);
      fetchDocumentsList();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to revoke access.');
    }
  };

  // Import File as new doc
  const handleImportFile = async (formData) => {
    setIsUploading(true);
    try {
      const res = await importDocumentFile(formData);
      setIsImportModalOpen(false);
      fetchDocumentsList();
      setSelectedDoc(res.data);
      setSelectedDocId(res.data.id);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to parse and import file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Attach File to existing doc
  const handleAttachFile = async (docId, formData) => {
    setIsUploading(true);
    try {
      await attachFileToDoc(docId, formData);
      setIsImportModalOpen(false);
      setAttachDocId(null);
      fetchSingleDocument(docId);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to attach file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onGoHome={() => {
          setSelectedDocId(null);
          setSelectedDoc(null);
        }}
      />

      <div className="app-main-content">
        {!selectedDocId && (
          <Sidebar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onCreateNewDoc={handleCreateNewDoc}
            onOpenImportModal={() => {
              setAttachDocId(null);
              setIsImportModalOpen(true);
            }}
            currentDocCount={documents.length}
          />
        )}

        <main className={`main-view ${selectedDocId ? 'editor-mode' : ''}`}>
          {selectedDocId ? (
            editorLoading ? (
              <div className="editor-loading">
                <div className="spinner"></div>
                <p>Loading document...</p>
              </div>
            ) : (
              <Editor
                documentData={selectedDoc}
                onSave={handleSaveDoc}
                onBack={() => {
                  setSelectedDocId(null);
                  setSelectedDoc(null);
                  fetchDocumentsList();
                }}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                onOpenAttachModal={() => {
                  setAttachDocId(selectedDocId);
                  setIsImportModalOpen(true);
                }}
                isSaving={isSaving}
                saveError={saveError}
              />
            )
          ) : (
            <div className="dashboard-content">
              <div className="dashboard-header">
                <h2>
                  {activeFilter === 'all' && 'All Documents'}
                  {activeFilter === 'owned' && 'My Documents'}
                  {activeFilter === 'shared' && 'Shared with Me'}
                </h2>
                <span className="doc-count">{documents.length} documents</span>
              </div>

              <DocumentList
                documents={documents}
                loading={docLoading}
                onSelectDoc={(id) => fetchSingleDocument(id)}
                onDeleteDoc={handleDeleteDoc}
                activeFilter={activeFilter}
                searchQuery={searchQuery}
              />
            </div>
          )}
        </main>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentData={selectedDoc}
        users={users}
        currentUser={currentUser}
        onShare={handleShareDoc}
        onRemoveShare={handleRemoveShare}
      />

      {/* File Upload / Import Modal */}
      <FileUploadModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setAttachDocId(null);
        }}
        onImportFile={handleImportFile}
        onAttachFile={handleAttachFile}
        documentId={attachDocId}
        isUploading={isUploading}
      />
    </div>
  );
}
