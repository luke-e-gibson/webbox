/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'line': "#474747",
        'tab': "#2d2d2d",
        'tabActive': "#1e1e1e",
        'background': "#252526",
        'text': '#969696',
        "tabLine": "#252526"
      }
    },
  },
  plugins: [],
}

