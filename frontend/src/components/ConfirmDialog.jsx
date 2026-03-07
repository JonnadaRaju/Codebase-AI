import React from 'react';

export function ConfirmDialog({ project, onConfirm, onCancel, loading }) {
  if (!project) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      <div 
        className="bg-bg2 border border-white/10 rounded-xl p-6 w-[300px] text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[28px] mb-2.5">🗑️</div>
        <div className="text-[15px] font-semibold text-ink mb-1.5">Delete Project?</div>
        <div className="text-xs text-ink3 leading-relaxed mb-4.5">
          Permanently delete <span className="text-red font-medium">"{project.name}"</span> and all its indexed vectors. This cannot be undone.
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.25 rounded-lg border border-white/10 bg-surface text-ink3 text-xs font-medium cursor-pointer hover:text-ink transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.25 rounded-lg border-none bg-red text-white text-xs font-semibold cursor-pointer hover:bg-red-600 transition-colors disabled:opacity-40"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
