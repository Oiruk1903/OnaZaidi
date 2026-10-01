/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f5f7f2",
          100: "#e8ede0",
          200: "#d3dbc6",
          300: "#b8c4a6",
          400: "#9db087",
          500: "#7d9465",
          600: "#627a50",
          700: "#4d623e",
          800: "#3e4d33",
          900: "#2f3d28",
        },
        sage: {
          50:  "#f6f7f2",
          100: "#e8efe2",
          200: "#d4e3ce",
          300: "#b5d4b5",
          400: "#95c399",
          500: "#6fae7a",
          600: "#55925f",
          700: "#42764d",
          800: "#345d3e",
          900: "#2a4a33",
        },
        earth: {
          50:  "#faf8f5",
          100: "#f2ede6",
          200: "#e6dfcf",
          300: "#d7cfb5",
          400: "#c5be9c",
          500: "#b0a87f",
          600: "#968c66",
          700: "#7c7352",
          800: "#635b42",
          900: "#4e4a36",
        },
        accent: {
          50:  "#fef3f2",
          100:  "#fce1df",
          200:  "#f8c4c0",
          300:  "#f29993",
          400:  "#ec736b",
          500:  "#e55248",
          600:  "#c93b31",
          700:  "#a92f29",
          800:  "#8b2623",
          900:  "#731f1d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"],
        heading: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
