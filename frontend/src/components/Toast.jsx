import React from 'react';

export function Toast({ message, type, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    s: 'bg-green-950 border-green-500/30 text-green-400',
    e: 'bg-red-950 border-red-500/30 text-red-400',
    i: 'bg-blue-950 border-blue-500/30 text-blue-400',
  };

  return (
    <div className={`fixed bottom-5 right-5 px-3.5 py-2.5 rounded-lg text-[12px] font-medium z-50 animate-in fade-in slide-in-from-bottom-2 border shadow-lg ${styles[type]}`}>
      {message}
    </div>
  );
}
