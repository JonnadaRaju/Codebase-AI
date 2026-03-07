/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vs-bg': '#1e1e1e',
        'vs-sidebar': '#252526',
        'vs-activity': '#333333',
        'vs-status': '#007acc',
        'vs-status2': '#e51400',
        'vs-tab': '#2d2d2d',
        'vs-tab-active': '#1e1e1e',
        'vs-input': '#3c3c3c',
        'vs-hover': '#2a2d2e',
        'vs-border': '#454545',
        'vs-green': '#6A9955',
        'vs-blue': '#569cd6',
        'vs-orange': '#ce9178',
        'vs-yellow': '#dcdcaa',
        'vs-purple': '#c586c0',
        'vs-red': '#f14c4c',
        'vs-cyan': '#4ec9b0',
        'ink': '#cccccc',
        'ink2': '#858585',
        'ink3': '#6e6e6e',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
