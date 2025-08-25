 /** @type {import('tailwindcss').Config} */
export default {
   content: ["./src/**/*.{html,js,jsx}"],
   theme: {
     extend: {
        colors: {
          primary: '#ff6363',
          secondary: '#3faffa',
          accent: '#f9d56b',
          background: '#f0f0f0',
          muted: '#e0e0e0',
          error: '#ff4d4d',
          success: '#4caf50',
        },
     },
   },
   plugins: [],
 }