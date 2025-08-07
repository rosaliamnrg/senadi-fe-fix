// src/pages/fileknowledge.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
// import '../styles/style-fileknowledge.css';

export default function FileKnowledge() {
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.getKnowledgeFiles();
      setFiles(response.files);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch knowledge files');
      setLoading(false);
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadFile) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      await api.uploadKnowledgeFile(formData);
      
      // Reset file input
      setUploadFile(null);
      
      // Show success message
      setSuccess('File uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh file list
      fetchFiles();
      
      setLoading(false);
    } catch (err) {
      setError('Failed to upload file');
      setLoading(false);
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="file-knowledge-container">
      <h2>Knowledge Files</h2>
      
      <div className="upload-section">
        <h3>Upload New File</h3>
        <form className="upload-form" onSubmit={handleUpload}>
          <div className="file-input-container">
            <input 
              type="file" 
              id="file-upload" 
              onChange={handleFileChange}
              accept=".pdf,.xlsx,.csv,.txt,.doc,.docx"
              disabled={loading}
            />
            <label htmlFor="file-upload">
              {uploadFile ? uploadFile.name : 'Choose a file'}
            </label>
          </div>
          <button type="submit" disabled={loading || !uploadFile}>
            Upload
          </button>
        </form>
        <p className="file-help">
          Supported formats: PDF, Excel, CSV, TXT, DOC, DOCX
        </p>
      </div>
      
      <div className="file-list-section">
        <h3>Uploaded Files</h3>
        {files.length === 0 ? (
          <p>No files uploaded yet</p>
        ) : (
          <table className="file-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Uploaded By</th>
                <th>Upload Date</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>{file.filename}</td>
                  <td>{file.username}</td>
                  <td>{formatDate(file.uploaded_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {loading && <div className="loading-overlay">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
}