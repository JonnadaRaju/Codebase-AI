import React from 'react';
import { MoreHorizontal, ThumbsUp, ThumbsDown, Copy, Bookmark, Send, Sparkles } from 'lucide-react';
import { AnswerRenderer } from './AnswerRenderer';
import { QUICK_PROMPTS, MODES } from '../constants';

export function CenterChat({ 
  messages, 
  input, 
  setInput, 
  onSend, 
  loading,
  activeMode,
  activeProject,
  userAvatar,
  onQuickPrompt
}) {
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          {activeProject ? activeProject.name : 'Select a Project'}
        </h2>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
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
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                      <span>⚡</span>
                    </div>
                    <div className="flex-1 bg-white rounded-2xl shadow-md p-5">
                      <AnswerRenderer content={msg.content} />
                      <div className="flex items-center gap-4 mt-4 ml-1">
                        <button className="flex items-center gap-1 text-gray-400 hover:text-green-500 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                        <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                          <Copy className="w-3 h-3 inline mr-1" />
                          Copy
                        </button>
                        <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                          <Bookmark className="w-3 h-3 inline mr-1" />
                          Save
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {msg.role === 'user' && (
                  <>
                    <div className="text-gray-700 text-sm max-w-lg text-right">
                      {msg.content}
                    </div>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ backgroundColor: userAvatar?.color || '#22c55e' }}
                    >
                      {isImage ? (
                        <img src={userAvatar.value} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm">{getAvatarContent()}</span>
                      )}
                    </div>
                  </>
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
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 z-30">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask or search anything..."
            className="w-full outline-none resize-none text-gray-900 text-sm placeholder-gray-400 min-h-[52px] max-h-[150px] bg-gray-50 rounded-xl px-4 py-3"
            disabled={!activeProject}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || !activeProject || loading}
            className="absolute right-3 bottom-3 w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Sparkles className="w-3 h-3" />
              Improve
            </button>
            <span className="text-xs text-gray-400">
              Mode: <span className="text-green-600 font-medium">{MODES.find(m => m.id === activeMode)?.label}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
