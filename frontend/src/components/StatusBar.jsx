import React from 'react';

export function StatusBar({ activeProject, mode }) {
  const modeLabels = {
    explain: 'Explain Mode',
    interview: 'Interview Mode',
    review: 'Review Mode',
    debug: 'Debug Mode',
    architecture: 'Architecture Mode',
  };

  return (
    <div className="h-6 bg-vs-status flex items-center justify-between px-3 text-xs text-white">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span>🔀</span>
          <span>main*</span>
        </div>
        <div className="flex items-center gap-1">
          <span>❗</span>
          <span>0</span>
        </div>
        <div className="flex items-center gap-1">
          <span>⚠</span>
          <span>0</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {activeProject && (
          <div className="flex items-center gap-1">
            <span>📁</span>
            <span>{activeProject.name}</span>
          </div>
        )}
        <div className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded">
          <span>{modeLabels[mode]}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🤖</span>
          <span>Codebase AI</span>
        </div>
      </div>
    </div>
  );
}
