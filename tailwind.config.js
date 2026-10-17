/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'math-cyan': '#00ACC1',
        'math-cyan-bg': '#B2EBF2',
        'math-orange': '#F4511E',
        'math-orange-bg': '#FFCCBC',
        'math-red': '#D32F2F',
        'math-red-bg': '#FFCDD2',
        'math-magenta': '#D81B60',
        'math-green': '#00897B',
        'math-amber': '#F57C00',
        'math-blue': '#1976D2',
        'math-indigo': '#3F51B5',
        'math-purple': '#D500F9',
        'math-grid': '#EEEEEE',
        'math-border': '#333333'
      },
      fontFamily: {
        mono: ['Courier New', 'Courier', 'monospace'],
      }
    },
  },
  plugins: [],
}
