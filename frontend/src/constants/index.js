export const MODES = [
  { id: 'explain', label: 'Explain', icon: '✦', ph: 'How does the authentication work?' },
  { id: 'interview', label: 'Interview', icon: '◈', ph: 'Generate 5 interview questions' },
  { id: 'review', label: 'Review', icon: '⊕', ph: 'Review code quality and issues' },
  { id: 'debug', label: 'Debug', icon: '⊗', ph: 'Why is the database failing?' },
  { id: 'architecture', label: 'Architecture', icon: '⬡', ph: 'Explain the system architecture' },
];

export const FILE_ICONS = {
  py: '🐍',
  js: '🟡',
  ts: '🔹',
  jsx: '⚛️',
  tsx: '⚛️',
  html: '🌐',
  css: '🎨',
  json: '{}',
  md: '📄',
  sql: '🗄',
  go: '🔵',
  java: '☕',
  cpp: '⚙️',
  sh: '💲',
};

export const getFileIcon = (filename) => {
  const ext = filename.split('.').pop();
  return FILE_ICONS[ext] || '📄';
};

export const getModeColor = (mode) => {
  const colors = {
    explain: 'blue',
    interview: 'yellow',
    review: 'green',
    debug: 'red',
    architecture: 'purple',
  };
  return colors[mode] || 'green';
};
