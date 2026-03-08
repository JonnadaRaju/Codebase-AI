import React, { useState, useRef } from 'react';
import { X, Upload, Github } from 'lucide-react';

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !projectName.trim()) return;
    
    setUploading(true);
    try {
      await onUpload(projectName, file);
      setProjectName('');
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
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
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]"
            onClick={onClose}
          />
          <div 
            className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">My Projects</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Project List */}
            <div className="flex-1 overflow-y-auto p-3">
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
                          onDelete(project.project_id);
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

            {/* Upload Section */}
            <div className="px-4 py-4 border-t-2 border-dashed border-gray-100 mt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Upload New Project
              </p>
              
              {/* ZIP Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all"
              >
                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                <p className="text-sm text-gray-600">Drop ZIP here</p>
                <p className="text-xs text-gray-400">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
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
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 outline-none focus:border-green-300 focus:ring-1 focus:ring-green-100"
                />
              </div>

              {/* Project Name Input */}
              <input
                type="text"
                placeholder="Project name..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full mt-3 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-green-300"
              />

              {/* Upload Button */}
              <button
                onClick={() => {
                   if (fileInputRef.current) fileInputRef.current.click();
                }}
                disabled={uploading || !projectName.trim()}
                className="w-full mt-3 bg-green-500 text-white rounded-xl py-2.5 font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload Project'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
