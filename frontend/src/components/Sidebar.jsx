import React from 'react';

export function Sidebar({ 
  projects, 
  loadingProjects, 
  active, 
  onSelectProject, 
  onNewChat,
  onDelete,
  onUpload,
  uploading,
  uploadMode,
  setUploadMode,
  projectName,
  setProjectName,
  githubUrl,
  setGithubUrl,
  selectedFile,
  setSelectedFile,
}) {
  const fileInputRef = React.useRef(null);
  const [drag, setDrag] = React.useState(false);
  const [selectedZip, setSelectedZip] = React.useState(null);
  const [uploadStatus, setUploadStatus] = React.useState('');
  const [error, setError] = React.useState('');

  const validateGithubUrl = (url) => {
    const pattern = /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/i;
    return pattern.test(url.trim());
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.zip')) {
      setSelectedZip(file);
      setProjectName(file.name.replace('.zip', ''));
      setUploadMode('zip');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedZip(file);
      setProjectName(file.name.replace('.zip', ''));
      setUploadMode('zip');
    }
  };

  const handleUpload = () => {
    setError('');
    if (!projectName.trim()) {
      setError('Enter a project name');
      return;
    }

    if (uploadMode === 'github') {
      if (!githubUrl.trim()) {
        setError('Enter a GitHub URL');
        return;
      }
      if (!validateGithubUrl(githubUrl)) {
        setError('Invalid URL. Use: github.com/user/repo');
        return;
      }
    }

    if (uploadMode === 'zip' && !selectedZip) {
      setError('Select a ZIP file');
      return;
    }

    if (uploadMode === 'github') {
      setUploadStatus('Cloning repository...');
    }
    onUpload();
  };

  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const getHue = (name) => {
    return (name.charCodeAt(0) * 47) % 360;
  };

  return (
    <div className="w-60 flex-shrink-0 bg-bg2 border-r border-white/[0.06] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2 mb-3.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green to-green-600 flex items-center justify-center text-sm shadow-lg shadow-green/30">
            🧠
          </div>
          <div className="text-sm font-semibold text-ink">
            Codebase <span className="text-green">AI</span>
          </div>
        </div>
        <button 
          onClick={onNewChat}
          className="w-full py-2 px-3 rounded-lg border border-white/10 bg-surface text-ink2 text-xs font-medium flex items-center gap-2 hover:bg-lift hover:text-ink transition-colors"
        >
          <span className="w-4 h-4 rounded bg-green/10 text-green flex items-center justify-center text-[10px]">+</span>
          New Chat
        </button>
      </div>

      {/* Nav */}
      <div className="px-2 py-2.5 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-surface text-ink text-xs font-medium">
          <span>💬</span> Chats <span className="ml-auto bg-surface text-ink3 text-[10px] px-1.5 py-0.5 rounded">{projects.length}</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-ink3 text-xs font-medium hover:bg-surface hover:text-ink2 cursor-pointer transition-colors mt-1">
          <span>📁</span> Projects
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-ink3 text-xs font-medium hover:bg-surface hover:text-ink2 cursor-pointer transition-colors mt-1">
          <span>⚙️</span> Settings
        </div>
      </div>

      {/* Upload Section */}
      <div className="px-3 py-2 flex-shrink-0">
        <div className="text-[9px] font-semibold text-ink3 uppercase tracking-widest">Upload</div>
      </div>

      <div 
        className={`mx-3 mb-2 p-3.5 rounded-lg border border-dashed cursor-pointer transition-all ${drag ? 'border-green bg-green/5' : 'border-white/10 bg-surface hover:border-green/50'}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
      >
        <input 
          ref={fileInputRef} 
          type="file" 
          accept=".zip" 
          className="hidden" 
          onChange={handleFileSelect}
        />
        <div className="text-center">
          <div className="text-lg mb-1">📦</div>
          <div className="text-[11px] font-medium text-ink2">
            {selectedZip ? selectedZip.name : 'Drop ZIP here'}
          </div>
          <div className="text-[10px] text-ink3 mt-0.5">or click to browse</div>
        </div>
      </div>

      <div className="px-3 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-px bg-white/6" />
          <div className="text-[9px] text-ink3 font-medium">or GitHub</div>
          <div className="flex-1 h-px bg-white/6" />
        </div>
        <div className="relative mb-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">🐙</span>
          <input 
            className="w-full bg-surface border border-white/6 rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-ink outline-none focus:border-white/16 transition-colors placeholder:text-ink3"
            placeholder="github.com/user/repo"
            value={githubUrl}
            onChange={(e) => { 
              setGithubUrl(e.target.value); 
              if (e.target.value.trim()) {
                setUploadMode('github');
              }
            }}
          />
        </div>
        <p className="text-[10px] text-ink3 mb-2 px-1">
          Example: github.com/facebook/react
        </p>
        <input 
          className="w-full bg-surface border border-white/6 rounded-lg py-1.5 px-3 text-[11px] text-ink outline-none focus:border-white/16 transition-colors placeholder:text-ink3 mb-2"
          placeholder="Project name..."
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <button 
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-2 rounded-lg border border-green/30 bg-green/10 text-green-2 text-[11px] font-semibold hover:bg-green/15 hover:border-green/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {uploading ? 'Processing...' : 'Upload & Analyze'}
        </button>
        {error && (
          <div className="mt-2 text-[10px] text-red bg-red/10 px-2 py-1.5 rounded-lg">
            {error}
          </div>
        )}
        {uploading && (
          <div className="mt-2 p-2 bg-green/10 rounded-lg border border-green/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-green/50 border-t-green rounded-full animate-spin" />
              <span className="text-[10px] text-green-2 font-medium">
                {uploadStatus || 'Processing...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className="px-3 py-2 flex-shrink-0">
        <div className="text-[9px] font-semibold text-ink3 uppercase tracking-widest">Your Projects</div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 chat-scroll">
        {loadingProjects ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2 p-2 rounded-lg mb-0.5">
              <div className="w-7 h-7 rounded-md bg-surface animate-pulse" />
              <div className="flex-1">
                <div className="h-2 w-16 bg-surface rounded animate-pulse mb-1" />
                <div className="h-1.5 w-10 bg-surface rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : projects.length === 0 ? (
          <div className="text-center py-4 text-[11px] text-ink3 leading-relaxed">
            No projects yet.<br />Upload a ZIP to begin.
          </div>
        ) : (
          projects.map((p) => (
            <div 
              key={p.project_id}
              onClick={() => onSelectProject(p)}
              className={`flex items-center gap-2 p-2 rounded-lg mb-0.5 cursor-pointer transition-colors relative group ${
                active?.project_id === p.project_id ? 'bg-green/10' : 'hover:bg-surface'
              }`}
            >
              <div 
                className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                  active?.project_id === p.project_id 
                    ? 'bg-green/20 text-green-2 border border-green/20' 
                    : 'bg-surface border border-white/6'
                }`}
                style={{
                  backgroundColor: active?.project_id === p.project_id ? undefined : `hsl(${getHue(p.name)}, 40%, 25%)`,
                  color: active?.project_id === p.project_id ? undefined : `hsl(${getHue(p.name)}, 70%, 65%)`,
                }}
              >
                {getInitials(p.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium truncate ${active?.project_id === p.project_id ? 'text-ink' : 'text-ink2'}`}>
                  {p.name}
                </div>
                <div className="text-[10px] text-ink3">
                  {p.total_files}f · {p.total_chunks}c · 
                  <span className={`ml-1 px-1 rounded text-[9px] font-semibold uppercase ${
                    p.status === 'ready' ? 'bg-green/10 text-green' : 'bg-yellow/10 text-yellow'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(p); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded border-none bg-red/10 text-red text-[10px] cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-red hover:text-white transition-all flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* User */}
      <div className="p-2 border-t border-white/6 flex-shrink-0">
        <div className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-surface transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green to-blue flex items-center justify-center text-[10px] font-bold text-white">
            U
          </div>
          <div>
            <div className="text-xs font-medium text-ink2">Developer</div>
            <div className="flex items-center gap-1 text-[10px] text-ink3">
              <span className="w-1.5 h-1.5 rounded-full bg-green shadow-sm shadow-green animate-pulse" />
              Online
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
