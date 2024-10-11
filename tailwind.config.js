/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/**/*.html`], // Scans all .html files in /views directory
  theme: { 
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  
  daisyui: {
    themes: ['fantasy'], // Apply fantasy theme
  },

};

