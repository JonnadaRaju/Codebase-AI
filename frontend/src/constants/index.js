export const MODES = [
  { id: 'explain', label: 'Explain', icon: '✦', emoji: '💡' },
  { id: 'interview', label: 'Interview', icon: '◈', emoji: '🎯' },
  { id: 'review', label: 'Review', icon: '⊕', emoji: '🔍' },
  { id: 'debug', label: 'Debug', icon: '⊗', emoji: '🐛' },
  { id: 'architecture', label: 'Architecture', icon: '⬡', emoji: '🏗️' },
];

export const FILE_ICONS = {
  py: '🐍',
  js: '🟨',
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
  txt: '📝',
  yaml: '⚙️',
  yml: '⚙️',
};

export const QUICK_PROMPTS = {
  explain: [
    'How does authentication work?',
    'Explain the database models',
    'What does the main file do?',
    'How are routes organized?'
  ],
  interview: [
    'Generate 5 interview questions',
    'Quiz me on this codebase',
    'What are tricky parts to explain?',
    'Generate senior-level questions'
  ],
  review: [
    'Find security vulnerabilities',
    'Check for code quality issues',
    'Review error handling',
    'Find performance problems'
  ],
  debug: [
    'Why might this crash?',
    'Find potential null errors',
    'Check async/await usage',
    'Find memory leaks'
  ],
  architecture: [
    'Explain the system design',
    'How do components connect?',
    'What is the data flow?',
    'Explain the folder structure'
  ],
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
