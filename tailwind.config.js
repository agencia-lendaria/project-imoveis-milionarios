/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Duomo Theme - Nova paleta
        duomo: {
          // Paleta Principal do Design System
          primary: '#A55A4A', // Tom terroso elegante
          secondary: '#FFFFFF', // Branco puro
          accent: '#D4B254', // Dourado sofisticado
          background: '#EAE0D5', // Fundo bege claro
          
          // Textos
          'text-light': '#FFFFFF',
          'text-dark': '#333333',
          
          // Variações
          'primary-light': '#B36A5A',
          'primary-dark': '#954A3A',
          'accent-light': '#E0C066',
          'accent-dark': '#C8A542',
          'background-light': '#F0E7DC',
          'background-dark': '#E4D9CE',
        },
        
        // Milano Residence Theme (mantido para compatibilidade)
        milano: {
          // Paleta Principal
          primary: '#4A553A', // Verde oliva elegante
          secondary: '#FFFFFF', // Branco puro
          accent: '#D4B254', // Dourado Milano
          background: '#212121', // Fundo escuro sofisticado
          
          // Textos
          'text-light': '#FFFFFF',
          'text-dark': '#333333',
          
          // Bandeira Italiana
          'italy-green': '#009246',
          'italy-white': '#FFFFFF', 
          'italy-red': '#CE2B37',
          
          // Variações
          'primary-light': '#5A6649',
          'primary-dark': '#3A422B',
          'accent-light': '#E0C066',
          'accent-dark': '#C8A542',
          'background-light': '#2A2A2A',
          'background-dark': '#181818',
        },
        
        // Cores legacy para compatibilidade
        brand: {
          magenta: '#E91E63',
          'magenta-light': '#F8BBD9',
          'magenta-dark': '#AD1457',
          purple: '#800080',
          'purple-light': '#B366B3',
          'purple-dark': '#4D004D',
          gold: '#C5B17F', // Cor exata da especificação
          dark: '#1F2937', // Cor exata da especificação
          darker: '#111827', // Cor exata da especificação
          gray: '#666666',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'ui-serif', 'serif'],
        milano: ['Georgia', 'serif'], // Fonte elegante para títulos Milano
      },
      fontSize: {
        'milano-hero': ['8rem', { lineHeight: '1', fontWeight: 'bold' }],
        'milano-title': ['3rem', { lineHeight: '1.2', fontWeight: 'bold' }],
        'milano-subtitle': ['1.5rem', { lineHeight: '1.4' }],
        'milano-cta': ['2rem', { lineHeight: '1.3', fontWeight: 'bold' }],
      },
      boxShadow: {
        'duomo-glow': '0 0 10px rgba(212, 178, 84, 0.3), 0 0 20px rgba(212, 178, 84, 0.1)',
        'duomo-card': '0 4px 6px -1px rgba(165, 90, 74, 0.1), 0 2px 4px -1px rgba(165, 90, 74, 0.06)',
        'duomo-primary': '0 4px 6px -1px rgba(165, 90, 74, 0.2), 0 2px 4px -1px rgba(165, 90, 74, 0.1)',
        'milano-glow': '0 0 10px rgba(212, 178, 84, 0.3), 0 0 20px rgba(212, 178, 84, 0.1)',
        'milano-card': '0 4px 6px -1px rgba(33, 33, 33, 0.1), 0 2px 4px -1px rgba(33, 33, 33, 0.06)',
        'magenta': '0 4px 6px -1px rgba(233, 30, 99, 0.1), 0 2px 4px -1px rgba(233, 30, 99, 0.06)',
        'purple': '0 4px 6px -1px rgba(128, 0, 128, 0.1), 0 2px 4px -1px rgba(128, 0, 128, 0.06)',
      },
      textShadow: {
        'duomo-illuminated': '0 0 10px #D4B254, 0 0 20px #D4B254',
        'milano-illuminated': '0 0 10px #D4B254, 0 0 20px #D4B254',
      },
      backgroundImage: {
        'gradient-duomo': 'linear-gradient(135deg, #A55A4A 0%, #954A3A 100%)',
        'gradient-duomo-light': 'linear-gradient(135deg, #EAE0D5 0%, #E4D9CE 100%)',
        'gradient-italian': 'linear-gradient(to right, #009246 33%, #FFFFFF 33%, #FFFFFF 66%, #CE2B37 66%)',
        'gradient-milano': 'linear-gradient(135deg, #4A553A 0%, #3A422B 100%)',
      }
    },
  },
  plugins: [
    require('tailwindcss-textshadow')
  ],
};