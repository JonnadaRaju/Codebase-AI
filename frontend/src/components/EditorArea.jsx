import React from 'react';
import { MODES } from '../constants';

const modeColors = {
  explain: 'text-vs-blue',
  interview: 'text-vs-yellow',
  review: 'text-vs-green',
  debug: 'text-vs-red',
  architecture: 'text-vs-purple',
};

export function EditorArea({
  tabs,
  activeTab,
  onTabSelect,
  onTabClose,
  selectedFile,
  messages,
  input,
  setInput,
  onSend,
  loading,
  mode,
  setMode,
  activeProject,
}) {
  const chatEndRef = React.useRef(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const renderFileContent = () => {
    if (!activeTab) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-ink3">
          <div className="text-6xl mb-4 opacity-30">🤖</div>
          <div className="text-lg font-medium mb-2">Codebase AI</div>
          <div className="text-sm">Select a project and ask questions about your code</div>
        </div>
      );
    }
    return (
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-ink3">
            <div className="text-5xl mb-3">💬</div>
            <div className="text-sm">Ask me anything about {activeProject?.name}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={msg.id || idx}>
                
                {/* USER MESSAGE */}
                {msg.role === 'user' && (
                  <div className="flex justify-end gap-3 items-end mb-4">
                    <div className="max-w-lg bg-gray-900 text-white px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-sm">
                      {msg.content}
                    </div>
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold bg-purple-500 text-white">
                      U
                    </div>
                  </div>
                )}

                {/* AI MESSAGE */}
                {msg.role === 'ai' && msg.content && (
                  <div className="flex gap-3 items-start mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                      🤖
                    </div>
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{msg.content}</pre>
                    </div>
                  </div>
                )}

              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center bg-vs-purple">
                  🤖
                </div>
                <div className="bg-vs-input rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-vs-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-vs-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-vs-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-vs-bg overflow-hidden">
      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="flex bg-vs-tab overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r border-vs-border ${
                activeTab === tab 
                  ? 'bg-vs-tab-active text-ink border-t-2 border-t-vs-blue -mb-px' 
                  : 'text-ink2 hover:bg-vs-hover border-t-2 border-t-transparent'
              }`}
              onClick={() => onTabSelect(tab)}
            >
              <span>{getFileIcon(tab)}</span>
              <span className="truncate max-w-[120px]">{tab.split('/').pop()}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onTabClose(tab); }}
                className="ml-1 w-4 h-4 flex items-center justify-center rounded hover:bg-vs-input text-ink3 hover:text-ink"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Editor Content */}
      {renderFileContent()}

      {/* Input */}
      <div className="border-t border-vs-border p-3 bg-vs-sidebar">
        <div className="flex gap-2 mb-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                mode === m.id 
                  ? `${modeColors[m.id]} bg-vs-input` 
                  : 'text-ink3 hover:text-ink hover:bg-vs-hover'
              }`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeProject ? 'Ask about your code...' : 'Select a project first'}
            disabled={!activeProject || loading}
            className="flex-1 bg-vs-input border border-vs-border rounded px-3 py-2 text-sm outline-none focus:border-vs-blue resize-none h-12"
            rows={2}
          />
          <button
            onClick={onSend}
            disabled={!activeProject || loading || !input.trim()}
            className="px-4 bg-vs-blue text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop();
  const icons = {
    js: '🟨', ts: '🔹', jsx: '⚛️', tsx: '⚛️',
    py: '🐍', html: '🌐', css: '🎨', json: '📋',
    md: '📝', sql: '🗄', go: '🔵', java: '☕',
    rs: '🦀', cpp: '⚙️', sh: '💻',
  };
  return icons[ext] || '📄';
}
