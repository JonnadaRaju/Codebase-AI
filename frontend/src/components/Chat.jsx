import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { TopNavbar } from './TopNavbar';
import { CenterChat } from './CenterChat';
import { RightPanel } from './RightPanel';
import { FloatingButtons } from './FloatingButtons';
import { MyProjectsPanel } from './MyProjectsPanel';

export function Chat() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('explain');
  const [relFiles, setRelFiles] = useState([]);
  const [tokens, setTokens] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [showProjects, setShowProjects] = useState(false);
  const [uploading, setUploading] = useState(false);

  const username = localStorage.getItem('codebase_ai_username') || 'User';
  const userAvatar = JSON.parse(localStorage.getItem('codebase_ai_avatar') || 'null');

  useEffect(() => {
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

  const handleUpload = async (name, file) => {
    setUploading(true);
    try {
      const data = await api.uploadZip(name, file);
      await fetchProjects();
      setActiveProject(data);
      const projectFiles = await api.getProjectFiles(data.project_id);
      setFiles(projectFiles);
      setShowProjects(false);
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await api.deleteProject(projectId);
      if (activeProject?.project_id === projectId) {
        setActiveProject(null);
        setFiles([]);
      }
      await fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeProject || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setChatHistory(prev => [...prev, input]);
    const query = input;
    setInput('');
    setLoading(true);

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
      setRelFiles(data.relevant_files || []);
      setTokens(prev => prev + (data.tokens || 0));
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: `Error: ${e.message}`, mode: 'error' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleLogout = () => {
    localStorage.removeItem('codebase_ai_token');
    localStorage.removeItem('codebase_ai_username');
    localStorage.removeItem('codebase_ai_avatar');
    navigate('/login');
  };

  const handleChangeAvatar = () => {
    navigate('/avatar');
  };

  const handleFileClick = (file) => {
    console.log('File clicked:', file);
  };

  const handleHistoryClick = (query) => {
    setInput(query);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopNavbar
        activeMode={mode}
        onModeChange={setMode}
        username={username}
        userAvatar={userAvatar}
        onLogout={handleLogout}
        onChangeAvatar={handleChangeAvatar}
        onOpenProjects={() => setShowProjects(true)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <FloatingButtons
          onClearChat={handleClearChat}
          onNewChat={handleNewChat}
        />
        
        <CenterChat
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          loading={loading}
          activeMode={mode}
          activeProject={activeProject}
          userAvatar={userAvatar}
          onQuickPrompt={handleQuickPrompt}
        />
        
        <RightPanel
          files={files}
          relFiles={relFiles}
          chatHistory={chatHistory}
          tokens={tokens}
          onFileClick={handleFileClick}
          onHistoryClick={handleHistoryClick}
        />
      </div>

      <MyProjectsPanel
        isOpen={showProjects}
        onClose={() => setShowProjects(false)}
        projects={projects}
        activeProject={activeProject}
        onProjectSelect={handleProjectSelect}
        onUpload={handleUpload}
        onDelete={handleDelete}
      />
    </div>
  );
}
