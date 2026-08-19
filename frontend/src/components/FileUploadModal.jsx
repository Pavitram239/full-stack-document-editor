import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FileUploadModal({
  isOpen,
  onClose,
  onImportFile,
  onAttachFile,
  documentId, // null if importing as new document
  isUploading
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const supportedTypes = ['.txt', '.md', '.docx'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!documentId && !supportedTypes.includes(ext)) {
      setError(`Unsupported file format (${ext}). Supported formats: .txt, .md, .docx`);
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    if (documentId) {
      onAttachFile(documentId, formData);
    } else {
      onImportFile(formData);
    }

    setSelectedFile(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Upload size={20} className="text-blue-600" />
            <span>{documentId ? 'Attach File to Document' : 'Import Document from File'}</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!documentId && (
            <div className="supported-formats-banner">
              <span className="banner-title">Supported Formats:</span>
              <div className="format-tags">
                <span className="format-tag">.txt (Plain Text)</span>
                <span className="format-tag">.md (Markdown)</span>
                <span className="format-tag">.docx (Word Document)</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="file-drop-area">
              <Upload size={32} className="drop-icon" />
              <p className="drop-text">
                {selectedFile ? (
                  <span className="selected-filename">
                    <CheckCircle2 size={16} className="text-green-600 inline" /> {selectedFile.name}
                  </span>
                ) : (
                  'Click to browse or drag and drop your file here'
                )}
              </p>
              <input
                type="file"
                className="file-input-hidden"
                accept={documentId ? '*' : '.txt,.md,.docx'}
                onChange={handleFileChange}
              />
            </div>

            <button
              type="submit"
              className="btn-primary btn-full mt-4"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <span>Uploading & Processing...</span>
              ) : documentId ? (
                <span>Attach File</span>
              ) : (
                <span>Convert & Create Document</span>
              )}
            </button>
          </form>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
