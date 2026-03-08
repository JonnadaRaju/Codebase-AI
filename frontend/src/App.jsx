import React from 'react';
import { ActivityBar } from './components/ActivityBar';
import { FileExplorer } from './components/FileExplorer';
import { EditorArea } from './components/EditorArea';
import { TerminalPanel } from './components/TerminalPanel';
import { StatusBar } from './components/StatusBar';
import { api } from './services/api';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { AvatarSelection } from './components/AvatarSelection';
import { Avatar } from './components/Avatar';

function App() {
  const [appView, setAppView] = React.useState('login');
  const [username, setUsername] = React.useState('');
  const [userAvatar, setUserAvatar] = React.useState(null);
  const [showAvatarDropdown, setShowAvatarDropdown] = React.useState(false);
  
  const [projects, setProjects] = React.useState([]);
  const [loadingProjects, setLoadingProjects] = React.useState(true);
  const [activeProject, setActiveProject] = React.useState(null);
  const [files, setFiles] = React.useState([]);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [openTabs, setOpenTabs] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [mode, setMode] = React.useState('explain');
  const [sidebarVisible, setSidebarVisible] = React.useState(true);
  const [panelVisible, setPanelVisible] = React.useState(true);
  const [panelHeight, setPanelHeight] = React.useState(250);
  const [activePanel, setActivePanel] = React.useState('chat');
  const [currentView, setCurrentView] = React.useState('explorer');
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('codebase_ai_token');
    const savedUsername = localStorage.getItem('codebase_ai_username');
    const savedAvatar = localStorage.getItem('codebase_ai_avatar');
    
    if (token && savedUsername) {
      setUsername(savedUsername);
      if (savedAvatar) {
        setUserAvatar(JSON.parse(savedAvatar));
        setAppView('chat');
      } else {
        setAppView('avatar');
      }
    } else {
      setAppView('login');
    }
  };

  const handleLogin = (user) => {
    setUsername(user);
    const savedAvatar = localStorage.getItem('codebase_ai_avatar');
    if (savedAvatar) {
      setUserAvatar(JSON.parse(savedAvatar));
      setAppView('chat');
      fetchProjects();
    } else {
      setAppView('avatar');
    }
  };

  const handleAvatarComplete = (avatar) => {
    setUserAvatar(avatar);
    setAppView('chat');
    fetchProjects();
  };

  const handleLogout = () => {
    localStorage.removeItem('codebase_ai_token');
    localStorage.removeItem('codebase_ai_username');
    localStorage.removeItem('codebase_ai_avatar');
    setUserAvatar(null);
    setUsername('');
    setAppView('login');
  };

  const handleChangeAvatar = () => {
    setShowAvatarDropdown(false);
    setAppView('avatar');
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleProjectSelect = async (project) => {
    setActiveProject(project);
    try {
      const projectFiles = await api.getProjectFiles(project.project_id);
      setFiles(projectFiles);
    } catch (e) {
      setFiles([]);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (!openTabs.find(t => t === file)) {
      setOpenTabs(prev => [...prev, file]);
    }
    setActiveTab(file);
  };

  const handleCloseTab = (file) => {
    const newTabs = openTabs.filter(t => t !== file);
    setOpenTabs(newTabs);
    if (activeTab === file) {
      setActiveTab(newTabs[newTabs.length - 1] || null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeProject || loading) return;

    const userMsg = { role: 'user', content: input, mode };
    setMessages(prev => [...prev, userMsg]);
    const query = input;
    setInput('');
    setLoading(true);
    setPanelVisible(true);
    setActivePanel('chat');

    try {
      const data = await api.query({
        projectId: activeProject.project_id,
        mode,
        question: query,
      });
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: data.answer, mode: data.mode, files: data.relevant_files }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: `Error: ${e.message}`, mode: 'error' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileAction = (filename, action) => {
    const prompts = {
      explain: `Explain the file ${filename} in detail.`,
      review: `Review ${filename} for bugs and issues.`,
      debug: `Find bugs in ${filename}.`,
      interview: `Generate questions about ${filename}.`,
      architecture: `Explain architecture of ${filename}.`,
    };
    setInput(prompts[action] || `Analyze ${filename}`);
    setPanelVisible(true);
    setActivePanel('chat');
  };

  const handleUpload = async (name, file) => {
    setUploading(true);
    try {
      const data = await api.uploadZip(name, file);
      await fetchProjects();
      setActiveProject(data);
      const projectFiles = await api.getProjectFiles(data.project_id);
      setFiles(projectFiles);
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  if (appView === 'login') {
    return <Login onLogin={handleLogin} onSwitchToRegister={() => setAppView('register')} />;
  }

  if (appView === 'register') {
    return <Register onLogin={handleLogin} onSwitchToLogin={() => setAppView('login')} />;
  }

  if (appView === 'avatar') {
    return <AvatarSelection username={username} onComplete={handleAvatarComplete} />;
  }

  return (
    <div className="flex h-screen flex-col bg-vs-bg">
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          panelVisible={panelVisible}
          onTogglePanel={() => setPanelVisible(!panelVisible)}
        />
        
        {sidebarVisible && (
          <FileExplorer
            files={files}
            projects={projects}
            activeProject={activeProject}
            onProjectSelect={handleProjectSelect}
            onFileSelect={handleFileSelect}
            onFileAction={handleFileAction}
            onUpload={handleUpload}
            uploading={uploading}
            userAvatar={userAvatar}
            username={username}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-10 bg-vs-activity flex items-center justify-between px-4 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Codebase AI</span>
            </div>
            <div className="relative">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
              >
                <Avatar avatar={userAvatar} size="sm" />
                <span className="text-gray-300 text-sm">{username}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {showAvatarDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-50">
                  <div className="p-3 border-b border-[#2a2a2a]">
                    <div className="flex items-center gap-2">
                      <Avatar avatar={userAvatar} size="md" />
                      <div>
                        <div className="text-white font-medium">{username}</div>
                        <div className="text-gray-500 text-xs">{username}@codebase.ai</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleChangeAvatar}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-[#212121] rounded-md transition-colors"
                    >
                      <span>🎨</span>
                      <span>Change Avatar</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-[#212121] rounded-md transition-colors"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <EditorArea
            tabs={openTabs}
            activeTab={activeTab}
            onTabSelect={setActiveTab}
            onTabClose={handleCloseTab}
            selectedFile={selectedFile}
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            loading={loading}
            mode={mode}
            setMode={setMode}
            activeProject={activeProject}
          />
          
          {panelVisible && (
            <TerminalPanel
              height={panelHeight}
              setHeight={setPanelHeight}
              activePanel={activePanel}
              setActivePanel={setActivePanel}
              messages={messages}
              loading={loading}
              mode={mode}
              input={input}
              setInput={setInput}
              onSend={handleSend}
            />
          )}
        </div>
      </div>
      
      <StatusBar 
        activeProject={activeProject}
        mode={mode}
      />
    </div>
  );
}

export default App;
