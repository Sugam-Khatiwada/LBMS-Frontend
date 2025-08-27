 /** @type {import('tailwindcss').Config} */
export default {
   content: ["./src/**/*.{html,js,jsx}"],
   theme: {
     extend: {
         colors: {
            // Primary/secondary for dark, modern palette
            primary: '#7c3aed',   // violet-600
            secondary: '#06b6d4', // cyan-500
            accent: '#f59e0b',    // amber-500
            // Background/muted suited for darker themes
            background: '#0b1220',
            muted: '#94a3b8',
            // Feedback
            error: '#ff6b6b',
            success: '#22c55e',
          },
     },
   },
   plugins: [],
 }