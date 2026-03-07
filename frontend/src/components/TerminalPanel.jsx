import React from 'react';
import { MODES } from '../constants';

export function TerminalPanel({ height, setHeight, activePanel, setActivePanel, messages, loading, mode, input, setInput, onSend }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const panelRef = React.useRef(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && panelRef.current) {
        const newHeight = window.innerHeight - e.clientY - 24;
        setHeight(Math.max(100, Math.min(500, newHeight)));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setHeight]);

  return (
    <div 
      ref={panelRef}
      className="bg-vs-sidebar border-t border-vs-border flex flex-col"
      style={{ height: height }}
    >
      {/* Resize Handle */}
      <div 
        className="h-1 bg-transparent cursor-ns-resize hover:bg-vs-blue transition-colors"
        onMouseDown={handleMouseDown}
      />

      {/* Panel Tabs */}
      <div className="flex items-center justify-between px-2 border-b border-vs-border">
        <div className="flex">
          <button
            onClick={() => setActivePanel('chat')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activePanel === 'chat' 
                ? 'text-ink border-vs-blue' 
                : 'text-ink3 border-transparent hover:text-ink'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActivePanel('problems')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activePanel === 'problems' 
                ? 'text-ink border-vs-blue' 
                : 'text-ink3 border-transparent hover:text-ink'
            }`}
          >
            ⚠️ Problems
          </button>
          <button
            onClick={() => setActivePanel('output')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activePanel === 'output' 
                ? 'text-ink border-vs-blue' 
                : 'text-ink3 border-transparent hover:text-ink'
            }`}
          >
            📤 Output
          </button>
        </div>
        <button className="text-ink3 hover:text-ink px-2">✕</button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activePanel === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-3">
              {messages.length === 0 ? (
                <div className="text-center text-ink3 text-sm py-4">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-xs ${
                        msg.role === 'user' ? 'bg-vs-blue' : 'bg-vs-purple'
                      }`}>
                        {msg.role === 'user' ? 'U' : 'AI'}
                      </div>
                      <div className={`max-w-[70%] rounded p-2 ${
                        msg.role === 'user' 
                          ? 'bg-vs-blue text-white' 
                          : 'bg-vs-input text-ink'
                      }`}>
                        <pre className="whitespace-pre-wrap text-xs">{msg.content}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-2 border-t border-vs-border">
              <div className="flex gap-1 mb-2">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {}}
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      mode === m.id 
                        ? 'bg-vs-input text-vs-blue' 
                        : 'text-ink3 hover:text-ink'
                    }`}
                  >
                    {m.icon}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-vs-input border border-vs-border rounded px-2 py-1 text-xs outline-none focus:border-vs-blue"
                />
                <button
                  onClick={onSend}
                  disabled={loading || !input.trim()}
                  className="px-3 bg-vs-blue text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'problems' && (
          <div className="h-full flex items-center justify-center text-ink3 text-sm">
            No problems detected
          </div>
        )}

        {activePanel === 'output' && (
          <div className="h-full p-3 font-mono text-xs text-ink2 overflow-auto">
            <div>$ Codebase AI initialized</div>
            <div className="text-vs-green">✓ Ready</div>
          </div>
        )}
      </div>
    </div>
  );
}
