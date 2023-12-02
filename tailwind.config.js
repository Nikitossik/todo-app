const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: {
    relative: true,
    files: [
      "./src/**/*.{html,js}",
      "./node_modules/flowbite/**/*.js",
      "./node_modules/tw-elements/dist/js/**/*.js"
    ]
  },
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
    },
    screens: {
      sm: '37.5em',
      md: '48em',
      lg: '62em',
      xl: '75em',
      '2xl': '90em'
    },
    container: {
      padding: '1rem',
      center: true,
      screens: {
        'lg': '48rem'
      }
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#dc2e4b',
          '50': '#fef2f2',
          '100': '#fce8f3',
          '200': '#f7c6de',
          '300': '#f0a3c3',
          '400': '#e6678b',
          '500': '#dc2e4b',
          '600': '#c42540',
          '700': '#a31a2f',
          '800': '#851121',
          '900': '#630914',
          '950': '#40040a'
        },
        secondary: colors.amber,
        dark: colors.zinc
      }
    }
  },
  plugins: [
    require('flowbite/plugin'),
    require("tw-elements/dist/plugin")
  ],
}