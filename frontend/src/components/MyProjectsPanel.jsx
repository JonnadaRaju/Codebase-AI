import React, { useState, useRef } from 'react';
import { X, Upload, Github, Loader2 } from 'lucide-react';

export function MyProjectsPanel({ 
  isOpen, 
  onClose, 
  projects = [], 
  activeProject,
  onProjectSelect,
  onUpload,
  onDelete 
}) {
  const [projectName, setProjectName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileInputRef = useRef(null);

  const validateGithubUrl = (url) => {
    const pattern = /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/i;
    return pattern.test(url.trim());
  };

  const canUpload = projectName.trim().length > 0 && (githubUrl.trim().length > 0 || selectedFile !== null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!projectName.trim()) {
        setProjectName(file.name.replace('.zip', ''));
      }
    }
  };

  const handleUpload = async () => {
    setError('');
    
    if (!canUpload) {
      setError('Select a ZIP or enter GitHub URL');
      return;
    }

    if (!projectName.trim()) {
      setError('Enter a project name');
      return;
    }

    const mode = selectedFile ? 'zip' : 'github';

    if (mode === 'github' && !validateGithubUrl(githubUrl)) {
      setError('Invalid URL. Use: github.com/user/repo');
      return;
    }

    setUploading(true);
    if (mode === 'github') {
      setUploadStatus('Cloning repository...');
    }
    try {
      await onUpload(projectName, selectedFile, githubUrl);
      setProjectName('');
      setGithubUrl('');
      setSelectedFile(null);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  };

  const getInitialColor = (name) => {
    const colors = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ef4444', '#eab308'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          <div 
            className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header - fixed */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h2 className="font-semibold text-gray-900">My Projects</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Project List - scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {projects.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No projects yet</p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.project_id}
                    onClick={() => {
                      onProjectSelect(project);
                      onClose();
                    }}
                    className={`mx-1 my-1 p-3 rounded-xl border cursor-pointer transition-all ${
                      activeProject?.project_id === project.project_id
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-100 hover:border-green-200 hover:bg-green-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                        style={{ backgroundColor: getInitialColor(project.name) }}
                      >
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {project.name}
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5">
                            {project.total_files || 0}f · {project.total_chunks || 0}c ·
                            <span className="text-green-500 ml-1">
                              {project.status || 'READY'}
                            </span>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(project);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Upload Section - fixed at bottom */}
            <div className="flex-shrink-0 border-t border-gray-100 px-4 py-4 bg-white">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Upload New Project
              </p>
              
              {/* ZIP Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all"
              >
                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                <p className="text-sm text-gray-600">{selectedFile ? selectedFile.name : 'Drop ZIP here'}</p>
                <p className="text-xs text-gray-400">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* GitHub Input */}
              <div className="relative mt-3">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="github.com/user/repo"
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    if (e.target.value.trim()) {
                      setSelectedFile(null);
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 outline-none focus:border-green-300 focus:ring-1 focus:ring-green-100"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 px-1">
                Example: github.com/facebook/react
              </p>

              {/* Project Name Input */}
              <input
                type="text"
                placeholder="Project name..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full mt-3 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-green-300"
              />

              {/* Upload Button - ALWAYS VISIBLE */}
              <button
                onClick={handleUpload}
                disabled={uploading || !canUpload}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all mt-2 ${
                  canUpload && !uploading
                    ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadStatus || 'Processing...'}
                  </span>
                ) : 'Upload Project'}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-2 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          {deleteConfirm && (
            <>
              <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setDeleteConfirm(null)} />
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-white rounded-xl shadow-2xl z-50 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Delete Project?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete <span className="font-medium text-gray-700">"{deleteConfirm.name}"</span>? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDelete(deleteConfirm.project_id);
                      setDeleteConfirm(null);
                    }}
                    className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
