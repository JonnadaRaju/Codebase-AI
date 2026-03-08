import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export function FloatingButtons({ onClearChat, onNewChat }) {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
      <button
        onClick={onClearChat}
        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-gray-700 transition-all"
      >
        <Trash2 className="w-4 h-4" />
        <span>Clear Chat</span>
      </button>
      
      <button
        onClick={onNewChat}
        className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:bg-gray-700 transition-all"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
