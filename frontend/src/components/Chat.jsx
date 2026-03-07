import React from 'react';
import { MODES, getModeColor } from '../constants';
import { renderAnswer } from '../utils/renderAnswer';

export function Chat({ 
  messages, 
  loading, 
  active, 
  mode, 
  question, 
  setQuestion, 
  onSend,
  onCopy,
  onRetry,
  copied,
  mode: currentMode,
}) {
  const chatEndRef = React.useRef(null);
  const chatContainerRef = React.useRef(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const currentModeData = MODES.find(m => m.id === currentMode);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="h-[52px] flex items-center justify-between px-5 border-b border-white/[0.06] bg-bg2 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-sm">💬</span>
          <span className={`text-[13px] font-medium ${active ? 'text-ink' : 'text-ink2'}`}>
            {active ? (active.name || active.project_name) : 'New Chat'}
          </span>
          {active && (
            <button className="w-5.5 h-5.5 rounded border-none bg-transparent text-ink3 text-[11px] cursor-pointer hover:bg-surface hover:text-ink2 transition-colors flex items-center justify-center">
              ✏️
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {active && (
            <button 
              onClick={() => {}}
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-white/6 bg-surface text-ink3 text-[11px] cursor-pointer hover:bg-lift hover:text-ink2 transition-colors"
            >
              🔄 Clear
            </button>
          )}
          <div className="w-6.5 h-6.5 rounded-md border border-white/6 bg-surface text-ink3 text-xs cursor-pointer hover:bg-lift hover:border-white/10 transition-colors flex items-center justify-center">
            🔖
          </div>
          <div className="w-6.5 h-6.5 rounded-md border border-white/6 bg-surface text-ink3 text-xs cursor-pointer hover:bg-lift hover:border-white/10 transition-colors flex items-center justify-center">
            ⚙️
          </div>
        </div>
      </div>

      {/* Mode Bar */}
      <div className="flex gap-1 px-5 py-2 border-b border-white/[0.06] bg-bg2 flex-shrink-0 overflow-x-auto">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent bg-transparent text-ink3 text-[11px] font-medium whitespace-nowrap transition-colors ${
              mode === m.id 
                ? `${getModeColor(m.id)} font-semibold` 
                : 'hover:bg-surface hover:text-ink2'
            }`}
            style={{
              backgroundColor: mode === m.id ? `var(--${getModeColor(m.id)}-g)` : undefined,
              borderColor: mode === m.id ? `rgba(${getModeColor(m.id) === 'yellow' ? '234,179,8' : getModeColor(m.id) === 'blue' ? '59,130,246' : getModeColor(m.id) === 'green' ? '34,197,94' : getModeColor(m.id) === 'red' ? '239,68,68' : '168,85,247'}, 0.2)` : undefined,
              color: mode === m.id ? `var(--${getModeColor(m.id)}-2)` : undefined,
            }}
            onClick={() => {}}
          >
            <span>{m.icon}</span>{m.label}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 chat-scroll" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-xl bg-green/10 border border-green/20 flex items-center justify-center text-[22px] shadow-lg shadow-green/10">
              {currentModeData?.icon}
            </div>
            <div className="text-base font-semibold text-ink">{currentModeData?.label} Mode</div>
            <div className="text-xs text-ink3 max-w-[260px] leading-relaxed">
              {active 
                ? `Ask anything about "${active.name || active.project_name}"` 
                : 'Select or upload a project to get started'
              }
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-1.5 duration-200 ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="text-[10px] font-medium text-ink3 px-1">
                {msg.role === 'user' ? 'You' : 'Codebase AI'}
              </div>
              <div 
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green/10 border border-green/15 text-ink rounded-br-sm'
                    : 'bg-surface border border-white/6 text-ink rounded-bl-sm max-w-[88%]'
                }`}
              >
                {msg.role === 'ai' && msg.mode && (
                  <div 
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold mb-2"
                    style={{
                      backgroundColor: `var(--${getModeColor(msg.mode)}-g)`,
                      borderColor: `rgba(${getModeColor(msg.mode) === 'yellow' ? '234,179,8' : getModeColor(msg.mode) === 'blue' ? '59,130,246' : getModeColor(msg.mode) === 'green' ? '34,197,94' : getModeColor(msg.mode) === 'red' ? '239,68,68' : '168,85,247'}, 0.2)`,
                      color: `var(--${getModeColor(msg.mode)}-2)`,
                    }}
                  >
                    {MODES.find(m => m.id === msg.mode)?.icon} {msg.mode}
                  </div>
                )}
                {msg.role === 'user' ? msg.text : renderAnswer(msg.text)}
              </div>
              <div className={`flex gap-1 px-1 opacity-0 hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                <button 
                  onClick={() => onCopy(msg.text)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md border border-white/6 bg-surface text-ink3 text-[10px] cursor-pointer hover:bg-lift hover:text-ink2 transition-colors"
                >
                  {copied === msg.text ? '✓ Copied' : '📋 Copy'}
                </button>
                {msg.role === 'user' && (
                  <button 
                    onClick={() => onRetry(msg.text)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md border border-white/6 bg-surface text-ink3 text-[10px] cursor-pointer hover:bg-lift hover:text-ink2 transition-colors"
                  >
                    🔄 Retry
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex flex-col gap-1.5 items-start animate-in fade-in">
            <div className="text-[10px] font-medium text-ink3 px-1">Codebase AI</div>
            <div className="flex items-center gap-1.5 px-4 py-3 bg-surface border border-white/6 rounded-2xl rounded-bl-sm">
              <div className="w-1.75 h-1.75 rounded-full bg-green animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.75 h-1.75 rounded-full bg-blue animate-bounce" style={{ animationDelay: '0.18s' }} />
              <div className="w-1.75 h-1.75 rounded-full bg-purple animate-bounce" style={{ animationDelay: '0.36s' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3.5 border-t border-white/[0.06] bg-bg2 flex-shrink-0">
        <div className="flex gap-2 items-end bg-surface border border-white/10 rounded-xl px-3.5 py-2 transition-all focus-within:border-white/16 focus-within:shadow-sm focus-within:shadow-white/5">
          <textarea
            className="flex-1 bg-transparent border-none text-ink text-[13px] outline-none resize-none min-h-[24px] max-h-[120px] leading-6 placeholder:text-ink3"
            placeholder={active ? currentModeData?.ph : 'Select a project first...'}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!active || loading}
            rows={1}
          />
          <button 
            onClick={onSend}
            disabled={!active || loading || !question.trim()}
            className="w-8.5 h-8.5 rounded-lg border-none bg-green text-white text-[13px] cursor-pointer hover:bg-green-600 transition-all disabled:bg-lift disabled:text-ink3 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
