import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { TopNavbar } from './TopNavbar';
import { CenterChat } from './CenterChat';
import { RightPanel } from './RightPanel';
import { MyProjectsPanel } from './MyProjectsPanel';
import { Trash2, Plus } from 'lucide-react';

export function Chat() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
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

  const handleUpload = async (name, file, githubUrl = null) => {
    setUploading(true);
    try {
      let data;
      if (githubUrl) {
        data = await api.uploadGithub(name, githubUrl);
      } else if (file) {
        data = await api.uploadZip(name, file);
      } else {
        throw new Error('No file or GitHub URL provided');
      }
      await fetchProjects();
      setActiveProject(data);
      const projectFiles = await api.getProjectFiles(data.project_id);
      setFiles(projectFiles);
      setShowProjects(false);
    } catch (e) {
      console.error(e);
      throw e;
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

  const handleImprove = async () => {
    if (!input.trim()) return;
    if (!activeProject) return;

    setImproving(true);
    
    let fullContent = '';
    const tempMsg = { role: 'ai', content: '', mode: 'improve' };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await api.queryStream(
        {
          projectId: activeProject.project_id,
          mode: 'explain',
          question: `Rewrite this question to be more specific and detailed for a code analysis tool. Return ONLY the improved question, nothing else: "${input}"`,
        },
        (chunk) => {
          fullContent += chunk;
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { 
              ...tempMsg, 
              content: fullContent 
            };
            return newMsgs;
          });
        },
        () => {},
        (error) => {
          setMessages(prev => prev.slice(0, -1));
          console.error(error);
        }
      );
      
      if (fullContent) {
        setInput(fullContent.trim());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImproving(false);
      setMessages(prev => prev.slice(0, -1));
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

    let fullContent = '';
    let aiMsgAdded = false;
    const tempAiMsg = { role: 'ai', content: '', mode, files: [] };

    try {
      await api.queryStream(
        {
          projectId: activeProject.project_id,
          mode,
          question: query,
        },
        (chunk) => {
          fullContent += chunk;
          setMessages(prev => {
            const newMsgs = [...prev];
            if (!aiMsgAdded) {
              newMsgs.push({ 
                ...tempAiMsg, 
                content: fullContent,
                mode,
                files: [] 
              });
              aiMsgAdded = true;
            } else {
              newMsgs[newMsgs.length - 1] = { 
                ...tempAiMsg, 
                content: fullContent,
                mode,
                files: [] 
              };
            }
            return newMsgs;
          });
        },
        (data) => {
          setRelFiles(data.relevant_files || []);
        },
        (error) => {
          setMessages(prev => [
            ...prev,
            { role: 'ai', content: `Error: ${error}`, mode: 'error' }
          ]);
        }
      );
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

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      setMessages(prev => prev.slice(0, -1));
      setInput(lastUserMsg.content);
      setTimeout(() => handleSend(), 0);
    }
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
        {/* Left strip for chat actions */}
        <div className="w-14 flex-shrink-0 border-r border-gray-100 flex flex-col items-center justify-center gap-3 bg-white">
          <button
            onClick={handleClearChat}
            title="Clear Chat"
            className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleNewChat}
            title="New Chat"
            className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

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
          onRegenerate={handleRegenerate}
          files={files}
          onImprove={handleImprove}
          improving={improving}
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
