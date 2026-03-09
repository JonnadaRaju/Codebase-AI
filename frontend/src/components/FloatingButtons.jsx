import { Trash2, Plus } from 'lucide-react';

export default function FloatingButtons({
  onClearChat,
  onNewChat
}) {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-start gap-3">
      <button
        onClick={onClearChat}
        className="flex items-center gap-2 bg-gray-900 text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg text-sm font-medium hover:bg-gray-700 active:scale-95 transition-all whitespace-nowrap">
        <Trash2 className="w-4 h-4" />
        Clear Chat
      </button>
      <button
        onClick={onNewChat}
        className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:bg-gray-700 active:scale-95 transition-all">
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
