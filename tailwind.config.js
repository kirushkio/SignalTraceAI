/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#07080D',
          dark: '#030407',
          light: '#0D1017'
        },
        surface: {
          DEFAULT: '#171A25',
          dark: '#11131C',
          light: '#1F2433',
          card: '#151822',
          border: '#23293D',
          hover: '#1E2333'
        },
        signal: {
          cyan: '#39CFFF',
          blue: '#3478FF',
          magenta: '#FF2FB3',
          purple: '#9333EA',
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        'cyan-glow': '0 0 25px -3px rgba(57, 207, 255, 0.35)',
        'blue-glow': '0 0 25px -3px rgba(52, 120, 255, 0.35)',
        'magenta-glow': '0 0 25px -3px rgba(255, 47, 179, 0.35)',
        'orb-core': '0 0 60px 10px rgba(57, 207, 255, 0.4), 0 0 100px 30px rgba(52, 120, 255, 0.25), 0 0 120px 40px rgba(255, 47, 179, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'orbit-slow': 'spin 30s linear infinite',
        'orbit-reverse': 'spinReverse 40s linear infinite',
        'float': 'floatOrb 6s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' }
        },
        spinReverse: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' }
        },
        floatOrb: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      }
    },
  },
  plugins: [],
}
