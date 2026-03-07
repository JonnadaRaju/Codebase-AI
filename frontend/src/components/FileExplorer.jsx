import React from 'react';
import { getFileIcon } from '../constants';

export function FileExplorer({ 
  files, 
  projects, 
  activeProject, 
  onProjectSelect, 
  onFileSelect, 
  onFileAction,
  onUpload,
  uploading 
}) {
  const [expanded, setExpanded] = React.useState({});
  const [uploadMode, setUploadMode] = React.useState(false);
  const [projectName, setProjectName] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [showUpload, setShowUpload] = React.useState(false);

  const toggleFolder = (name) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleFileRightClick = (e, file) => {
    e.preventDefault();
    setSelectedFile(file);
  };

  const handleAction = (action) => {
    if (selectedFile) {
      onFileAction(selectedFile, action);
      setSelectedFile(null);
    }
  };

  const handleUpload = () => {
    if (!projectName.trim()) return;
    const input = document.getElementById('file-upload');
    const file = input?.files?.[0];
    if (file) {
      onUpload(projectName, file);
      setShowUpload(false);
      setProjectName('');
    }
  };

  const groupedFiles = React.useMemo(() => {
    const groups = {};
    files.forEach(file => {
      const parts = file.split('/');
      if (parts.length > 1) {
        const folder = parts[0];
        if (!groups[folder]) groups[folder] = [];
        groups[folder].push(parts.slice(1).join('/'));
      } else {
        if (!groups['root']) groups['root'] = [];
        groups['root'].push(file);
      }
    });
    return groups;
  }, [files]);

  return (
    <div className="w-56 bg-vs-sidebar flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-9 flex items-center px-3 text-xs font-semibold uppercase tracking-wide text-ink2 bg-vs-sidebar">
        <span>Explorer</span>
      </div>

      {/* Projects Dropdown */}
      <div className="border-b border-vs-border">
        <div className="flex items-center px-2 py-1 text-ink hover:bg-vs-hover cursor-pointer"
          onClick={() => setExpanded(prev => ({ ...prev, projects: !prev.projects }))}
        >
          <span className={`text-xs transition-transform ${expanded.projects ? 'rotate-90' : ''}`}>▶</span>
          <span className="ml-1 text-sm font-medium">Projects</span>
        </div>
        
        {expanded.projects && (
          <div className="bg-vs-bg">
            {projects.map(p => (
              <div 
                key={p.project_id}
                onClick={() => onProjectSelect(p)}
                className={`flex items-center gap-2 px-6 py-1 text-sm cursor-pointer ${
                  activeProject?.project_id === p.project_id 
                    ? 'bg-vs-input text-ink' 
                    : 'text-ink2 hover:bg-vs-hover'
                }`}
              >
                <span>📁</span>
                <span className="truncate">{p.name}</span>
              </div>
            ))}
            <div 
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-6 py-1 text-sm cursor-pointer text-vs-green hover:bg-vs-hover"
            >
              <span>+</span>
              <span>Add Project</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-vs-sidebar border border-vs-border rounded p-4 w-80">
            <h3 className="text-sm font-semibold mb-3">Upload Project</h3>
            <input
              type="text"
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-vs-input border border-vs-border rounded px-3 py-1.5 text-sm mb-3 outline-none focus:border-vs-blue"
            />
            <input
              id="file-upload"
              type="file"
              accept=".zip"
              className="w-full text-sm mb-3"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setShowUpload(false)}
                className="flex-1 py-1.5 text-sm bg-vs-input rounded hover:bg-vs-hover"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 py-1.5 text-sm bg-vs-blue text-white rounded hover:bg-blue-600"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Project Files */}
      {activeProject && (
        <div className="flex-1 overflow-y-auto">
          <div 
            className="flex items-center px-2 py-1 text-sm cursor-pointer hover:bg-vs-hover"
            onClick={() => toggleFolder(activeProject.name)}
          >
            <span className={`text-xs transition-transform ${expanded[activeProject.name] ? 'rotate-90' : ''}`}>▶</span>
            <span className="ml-1 font-medium">{activeProject.name}</span>
          </div>
          
          {expanded[activeProject.name] && (
            <div className="bg-vs-bg">
              {Object.entries(groupedFiles).map(([folder, folderFiles]) => (
                <div key={folder}>
                  {folder !== 'root' && (
                    <div 
                      className="flex items-center px-4 py-0.5 text-sm cursor-pointer hover:bg-vs-hover"
                      onClick={() => toggleFolder(`${activeProject.name}/${folder}`)}
                    >
                      <span className={`text-xs w-3 ${expanded[`${activeProject.name}/${folder}`] ? 'rotate-90' : ''}`}>▶</span>
                      <span className="ml-1">📁 {folder}</span>
                    </div>
                  )}
                  {expanded[`${activeProject.name}/${folder}`] || folder === 'root' ? (
                    <div>
                      {folderFiles.map((file) => (
                        <div
                          key={file}
                          onClick={() => onFileSelect(folder === 'root' ? file : `${folder}/${file}`)}
                          onContextMenu={(e) => handleFileRightClick(e, folder === 'root' ? file : `${folder}/${file}`)}
                          className="flex items-center px-6 py-0.5 text-sm cursor-pointer hover:bg-vs-hover text-ink2"
                        >
                          <span className="mr-1.5">{getFileIcon(file)}</span>
                          <span className="truncate">{file.split('/').pop()}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {selectedFile && (
        <div 
          className="fixed bg-vs-sidebar border border-vs-border rounded shadow-lg py-1 z-50"
          style={{ left: 200, top: 200 }}
          onMouseLeave={() => setSelectedFile(null)}
        >
          <button onClick={() => handleAction('explain')} className="w-full px-4 py-1 text-sm text-left hover:bg-vs-hover">
            ✦ Explain
          </button>
          <button onClick={() => handleAction('review')} className="w-full px-4 py-1 text-sm text-left hover:bg-vs-hover">
            ⊕ Review
          </button>
          <button onClick={() => handleAction('debug')} className="w-full px-4 py-1 text-sm text-left hover:bg-vs-hover">
            ⊗ Debug
          </button>
          <button onClick={() => handleAction('interview')} className="w-full px-4 py-1 text-sm text-left hover:bg-vs-hover">
            ◈ Interview
          </button>
          <button onClick={() => handleAction('architecture')} className="w-full px-4 py-1 text-sm text-left hover:bg-vs-hover">
            ⬡ Architecture
          </button>
        </div>
      )}
    </div>
  );
}
