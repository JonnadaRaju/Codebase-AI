import React from 'react';
import { getFileIcon } from '../constants';

export function RightPanel({ 
  allFiles, 
  relFiles, 
  showAll, 
  setShowAll, 
  active, 
  onFileClick, 
  tokens,
  mode,
}) {
  const isUsed = (file) => relFiles.includes(file);

  return (
    <div className="w-[200px] flex-shrink-0 border-l border-white/[0.06] bg-bg2 flex flex-col overflow-hidden">
      <div className="px-3.5 py-3 border-b border-white/[0.06]">
        <div className="text-[10px] font-semibold text-ink3 uppercase tracking-wider">📁 Files</div>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-1 flex-shrink-0">
        <button
          onClick={() => setShowAll(true)}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-medium cursor-pointer transition-colors ${
            showAll 
              ? 'bg-surface text-ink border border-white/6' 
              : 'bg-transparent text-ink3 hover:bg-surface hover:text-ink2'
          }`}
        >
          All {allFiles.length > 0 && `(${allFiles.length})`}
        </button>
        <button
          onClick={() => setShowAll(false)}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-medium cursor-pointer transition-colors ${
            !showAll 
              ? 'bg-surface text-ink border border-white/6' 
              : 'bg-transparent text-ink3 hover:bg-surface hover:text-ink2'
          }`}
        >
          Used {relFiles.length > 0 && `(${relFiles.length})`}
        </button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 chat-scroll">
        {showAll ? (
          allFiles.length === 0 ? (
            <div className="text-center py-4 text-[11px] text-ink3 leading-relaxed">
              {active ? 'Loading files...' : 'Select a project\nto see its files'}
            </div>
          ) : (
            allFiles.map((file, i) => {
              const used = isUsed(file);
              return (
                <div
                  key={i}
                  onClick={() => onFileClick(file)}
                  className={`flex items-center gap-1.5 p-2 rounded-md mb-0.5 border border-transparent cursor-pointer transition-colors ${
                    used 
                      ? 'bg-green/5 border-green/12 hover:bg-green/10' 
                      : 'hover:bg-surface hover:border-white/6'
                  }`}
                  title={`[${mode}] ${file}`}
                >
                  <span className="text-[11px] flex-shrink-0">{getFileIcon(file)}</span>
                  <span className={`text-[10px] truncate font-mono ${used ? 'text-green-2' : 'text-ink3'}`}>
                    {file}
                  </span>
                  {used && <span className="ml-auto text-green text-[9px] flex-shrink-0">✦</span>}
                </div>
              );
            })
          )
        ) : (
          relFiles.length === 0 ? (
            <div className="text-center py-4 text-[11px] text-ink3 leading-relaxed">
              Files used in last answer appear here
            </div>
          ) : (
            relFiles.map((file, i) => (
              <div
                key={i}
                onClick={() => onFileClick(file)}
                className="flex items-center gap-1.5 p-2 rounded-md mb-0.5 border border-green/12 bg-green/5 cursor-pointer hover:bg-green/10 transition-colors"
                title={`[${mode}] ${file}`}
              >
                <span className="text-[11px] flex-shrink-0">{getFileIcon(file)}</span>
                <span className="text-[10px] truncate font-mono text-green-2">
                  {file}
                </span>
              </div>
            ))
          )
        )}
      </div>

      {/* Tokens Box */}
      <div className="p-2">
        <div className="p-3 rounded-lg border border-white/6 bg-surface">
          <div className="text-[9px] font-semibold text-ink3 uppercase tracking-wider">Tokens Used</div>
          <div className="text-2xl font-bold text-ink mt-0.5 mb-0.25 tracking-tight font-mono">
            {tokens > 0 ? tokens.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-ink3">
            {tokens > 0 ? (active ? 'Ollama · Local' : 'OpenRouter') : 'No queries yet'}
          </div>
        </div>
      </div>
    </div>
  );
}
