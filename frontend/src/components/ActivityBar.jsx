import React from 'react';

const icons = {
  explorer: (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1.5 1h5l.5.5v4l-.5.5h-5l-.5-.5v-4l.5-.5zm0 7h5l.5.5v4l-.5.5h-5l-.5-.5v-4l.5-.5zm7-7l.5-.5h5l.5.5v4l-.5.5h-5l-.5-.5v-4zm0 7l.5-.5h5l.5.5v4l-.5.5h-5l-.5-.5v-4zM2 2.5v11h12V3.5l-1-1H3l-1 1z"/>
    </svg>
  ),
  search: (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
    </svg>
  ),
  git: (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
    </svg>
  ),
  debug: (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6 1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V1zm4 8a4 4 0 0 0-4-4H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a4 4 0 0 0 4-4V9zm-1 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
    </svg>
  ),
  extensions: (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1.5 1.75V13.5h13.75v-1.5H2.75V1.75h-1.25zm0 3.5h12v1.5h-12v-1.5zm0 3.5h12v1.5h-12v-1.5zm0 3.5h12v1.5h-12v-1.5z"/>
    </svg>
  ),
  chat: (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
      <path d="M14 1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l4 4v-4h4a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
    </svg>
  ),
};

export function ActivityBar({ currentView, onViewChange, panelVisible, onTogglePanel }) {
  const views = ['explorer', 'search', 'git', 'debug', 'extensions'];

  return (
    <div className="w-12 bg-vs-activity flex flex-col items-center py-2">
      {views.map((view) => (
        <button
          key={view}
          onClick={() => onViewChange(view)}
          className={`w-full p-3 flex items-center justify-center transition-colors ${
            currentView === view 
              ? 'text-ink border-l-2 border-vs-blue bg-vs-hover' 
              : 'text-ink3 hover:text-ink hover:bg-vs-hover'
          }`}
          title={view.charAt(0).toUpperCase() + view.slice(1)}
        >
          {icons[view]}
        </button>
      ))}
      
      <div className="flex-1" />
      
      <button
        onClick={onTogglePanel}
        className={`w-full p-3 flex items-center justify-center transition-colors ${
          panelVisible 
            ? 'text-vs-blue border-l-2 border-vs-blue bg-vs-hover' 
            : 'text-ink3 hover:text-ink hover:bg-vs-hover'
        }`}
        title="Terminal/Chat"
      >
        {icons.chat}
      </button>
    </div>
  );
}
