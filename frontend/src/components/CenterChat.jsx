import React, { useState } from 'react';
import { MoreHorizontal, ThumbsUp, ThumbsDown, Copy, Check, Download, Send, Sparkles, RefreshCw, FileText, Loader2 } from 'lucide-react';
import { AnswerRenderer } from './AnswerRenderer';
import { QUICK_PROMPTS, MODES, getFileIcon } from '../constants';

const modeIcons = {
  explain: '💡',
  interview: '🎯',
  review: '🔍',
  debug: '🐛',
  architecture: '🏗️',
};

export function CenterChat({ 
  messages, 
  input, 
  setInput, 
  onSend, 
  loading,
  activeMode,
  activeProject,
  userAvatar,
  onQuickPrompt,
  onRegenerate,
  files = [],
  onImprove,
  improving
}) {
  const messagesEndRef = React.useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showFilePicker, setShowFilePicker] = useState(false);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  React.useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.file-picker-wrapper')) {
        setShowFilePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getFileQuestion = (filename) => {
    const questions = {
      explain: `How does ${filename} work? Explain its purpose, main functions, and logic.`,
      review: `Review ${filename} for security issues, bugs, and code quality problems.`,
      debug: `Are there any potential errors or issues in ${filename}?`,
      interview: `Generate 5 interview questions based on the code in ${filename}.`,
      architecture: `Explain the role of ${filename} in the overall system architecture.`,
    };
    return questions[activeMode] || `Explain the file ${filename}`;
  };

  const getAvatarContent = () => {
    if (!userAvatar) return 'U';
    if (userAvatar.type === 'emoji') return userAvatar.value;
    if (userAvatar.type === 'custom') return null;
    if (userAvatar.type === 'initials') return userAvatar.value || 'U';
    return 'U';
  };

  const isImage = userAvatar?.type === 'custom';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const quickPrompts = QUICK_PROMPTS[activeMode] || QUICK_PROMPTS.explain;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">
          {activeProject?.name || 'Select a Project'}
        </h2>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 mt-20">
            <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-3xl">
              <span>{MODES.find(m => m.id === activeMode)?.emoji || '💡'}</span>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">How can I help you?</h3>
              <p className="text-sm text-gray-500 text-center max-w-xs mt-1">
                {activeProject
                  ? `Ask anything about "${activeProject.name}"`
                  : 'Select a mode and ask me anything about your codebase'
                }
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center px-8 mt-4 max-w-2xl mx-auto">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onQuickPrompt(prompt)}
                  className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600 hover:border-green-300 hover:text-green-600 cursor-pointer shadow-sm transition-all whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : ''} message-in`}>
                {msg.role === 'ai' && (
                  <>
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm flex-shrink-0">
                      {modeIcons[msg.mode] || '⚡'}
                    </div>
                    <div className="flex-1 bg-white rounded-2xl shadow-md p-5">
                      <div ref={el => { msg.answerRef = el; }}>
                        <AnswerRenderer content={msg.content} />
                      </div>
                      <div className="flex items-center gap-4 mt-4 ml-1">
                        <button className="flex items-center gap-1 text-gray-400 hover:text-green-500 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const element = msg.answerRef;
                            if (element) {
                              const visibleText = element.innerText;
                              navigator.clipboard.writeText(visibleText)
                                .then(() => {
                                  setCopiedId(idx);
                                  setTimeout(() => setCopiedId(null), 2000);
                                })
                                .catch(() => {});
                            }
                          }}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-all"
                        >
                          {copiedId === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-500" />
                              <span className="text-green-500">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            const element = msg.answerRef;
                            const content = element ? element.innerText : (typeof msg.content === 'string' ? msg.content : msg.content?.text || '');
                            const timestamp = new Date().toISOString().slice(0, 10);
                            const filename = `codebase-ai-${activeProject?.name || 'answer'}-${timestamp}.txt`;
                            const fileContent = `Project: ${activeProject?.name}\nMode: ${msg.mode}\nDate: ${new Date().toLocaleString()}\n${'─'.repeat(50)}\n\n${content}`;
                            const blob = new Blob([fileContent], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = filename;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Save
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {msg.role === 'user' && (
                  <div className="flex justify-end gap-3 items-end">
                    <div className="max-w-lg">
                      <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                    <div 
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm overflow-hidden"
                      style={{ backgroundColor: userAvatar?.color || '#22c55e' }}
                    >
                      {isImage ? (
                        <img src={userAvatar.value} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm">{getAvatarContent()}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                  <span>⚡</span>
                </div>
                <div className="bg-white rounded-2xl shadow-md p-5">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            {messages.length > 0 &&
              messages[messages.length-1].role === 'ai' && (
              <div className="flex justify-center my-4">
                <button
                  onClick={onRegenerate}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-md hover:bg-gray-700 disabled:opacity-50 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Response
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-end gap-3 mb-3">
          <textarea
            className="flex-1 outline-none resize-none text-gray-900 text-sm placeholder-gray-400 min-h-[44px] max-h-[120px] leading-relaxed bg-gray-50 rounded-xl px-4 py-3"
            placeholder="Ask or search anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!activeProject}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowFilePicker(!showFilePicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 font-medium transition-all"
              >
                <FileText className="w-3 h-3" />
                Browse Files
              </button>
              {showFilePicker && files.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select a file</p>
                  </div>
                  {files.map((file, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(getFileQuestion(file));
                        setShowFilePicker(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-all text-left"
                    >
                      <span className="text-sm">{getFileIcon(file)}</span>
                      <span className="text-xs text-gray-700 font-mono truncate">{file}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-200 text-xs text-green-600 bg-green-50 font-medium">
              <Sparkles className="w-3 h-3" />
              {MODES.find(m => m.id === activeMode)?.label}
            </button>
            <button
              onClick={onImprove}
              disabled={!input.trim() || improving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 font-medium disabled:opacity-40 transition-all"
            >
              {improving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Improve
                </>
              )}
            </button>
          </div>
          <button
            onClick={onSend}
            disabled={!input.trim() || loading || !activeProject}
            className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
