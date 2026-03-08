import React, { useState } from 'react';
import { Copy, MessageCircle, Settings } from 'lucide-react';
import { getFileIcon } from '../constants';

export function RightPanel({ 
  files = [], 
  relFiles = [],
  chatHistory = [],
  tokens = 0,
  onFileClick,
  onHistoryClick,
  modelName = 'llama3.2:3b',
  provider = 'Ollama'
}) {
  const [activeTab, setActiveTab] = useState('all');

  const fileCount = files.length;
  const usedCount = relFiles.length;

  const filteredFiles = activeTab === 'used' 
    ? files.filter(f => relFiles.includes(f))
    : files;

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* History Section */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-900">History Chat</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <Copy className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {chatHistory.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No history yet</p>
          ) : (
            chatHistory.slice(0, 10).map((item, idx) => (
              <button
                key={idx}
                onClick={() => onHistoryClick?.(item)}
                className="w-full flex gap-3 items-start p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  "{item.substring(0, 50)}..."
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Files Section */}
      <div className="px-4 py-3 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Files</h3>
        
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeTab === 'all' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            All ({fileCount})
          </button>
          <button
            onClick={() => setActiveTab('used')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeTab === 'used' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Used ({usedCount})
          </button>
        </div>
        
        <div className="max-h-48 overflow-y-auto space-y-1">
          {filteredFiles.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">No files</p>
          ) : (
            filteredFiles.map((file, idx) => (
              <button
                key={idx}
                onClick={() => onFileClick?.(file)}
                className="w-full flex gap-2 items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all text-left"
              >
                <span className="text-sm">{getFileIcon(file)}</span>
                <span className="text-xs font-mono text-gray-600 truncate flex-1">
                  {file.split('/').pop()}
                </span>
                {relFiles.includes(file) && (
                  <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-xs">used</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Model Card */}
      <div className="mx-3 mb-3 mt-auto">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs opacity-80 flex items-center gap-1">
                <span>⚡</span> Current Model
              </p>
              <p className="text-lg font-bold mt-1">{modelName}</p>
              <p className="text-xs opacity-70">{provider} · Local</p>
            </div>
            <button className="text-white/80 hover:text-white">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs opacity-70">Tokens Used</p>
            <p className="text-2xl font-bold">{tokens.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
