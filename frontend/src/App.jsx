import React from 'react';
import { ActivityBar } from './components/ActivityBar';
import { FileExplorer } from './components/FileExplorer';
import { EditorArea } from './components/EditorArea';
import { TerminalPanel } from './components/TerminalPanel';
import { StatusBar } from './components/StatusBar';
import { api } from './services/api';

function App() {
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
    fetchProjects();
  }, []);

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
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
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
