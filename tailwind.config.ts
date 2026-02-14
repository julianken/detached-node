import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Formalize zinc as the primary palette
        // Using Tailwind's default zinc scale
      },
      fontFamily: {
        sans: ['var(--font-sans-stack)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono-stack)', 'ui-monospace', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'var(--tw-prose-body)',
            '--tw-prose-body': 'rgb(82 82 91)', // zinc-600
            '--tw-prose-headings': 'rgb(24 24 27)', // zinc-900
            '--tw-prose-links': 'rgb(24 24 27)', // zinc-900
            '--tw-prose-bold': 'rgb(24 24 27)', // zinc-900
            '--tw-prose-counters': 'rgb(113 113 122)', // zinc-500
            '--tw-prose-bullets': 'rgb(212 212 216)', // zinc-300
            '--tw-prose-hr': 'rgb(228 228 231)', // zinc-200
            '--tw-prose-quotes': 'rgb(24 24 27)', // zinc-900
            '--tw-prose-quote-borders': 'rgb(228 228 231)', // zinc-200
            '--tw-prose-captions': 'rgb(113 113 122)', // zinc-500
            '--tw-prose-code': 'rgb(24 24 27)', // zinc-900
            '--tw-prose-pre-code': 'rgb(228 228 231)', // zinc-200
            '--tw-prose-pre-bg': 'rgb(39 39 42)', // zinc-800
            '--tw-prose-th-borders': 'rgb(212 212 216)', // zinc-300
            '--tw-prose-td-borders': 'rgb(228 228 231)', // zinc-200
            // Invert colors for dark mode
            '--tw-prose-invert-body': 'rgb(161 161 170)', // zinc-400
            '--tw-prose-invert-headings': 'rgb(244 244 245)', // zinc-100
            '--tw-prose-invert-links': 'rgb(244 244 245)', // zinc-100
            '--tw-prose-invert-bold': 'rgb(244 244 245)', // zinc-100
            '--tw-prose-invert-counters': 'rgb(161 161 170)', // zinc-400
            '--tw-prose-invert-bullets': 'rgb(63 63 70)', // zinc-700
            '--tw-prose-invert-hr': 'rgb(63 63 70)', // zinc-700
            '--tw-prose-invert-quotes': 'rgb(244 244 245)', // zinc-100
            '--tw-prose-invert-quote-borders': 'rgb(63 63 70)', // zinc-700
            '--tw-prose-invert-captions': 'rgb(161 161 170)', // zinc-400
            '--tw-prose-invert-code': 'rgb(244 244 245)', // zinc-100
            '--tw-prose-invert-pre-code': 'rgb(212 212 216)', // zinc-300
            '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 0.5)',
            '--tw-prose-invert-th-borders': 'rgb(63 63 70)', // zinc-700
            '--tw-prose-invert-td-borders': 'rgb(63 63 70)', // zinc-700
          },
        },
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/typography'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function({ addUtilities }: any) {
      addUtilities({
        '.focus-ring': {
          'outline': 'none',
          '&:focus-visible': {
            'outline': 'none',
            'ring': '2px solid',
            'ring-color': 'rgb(24 24 27)',
            'ring-offset': '2px',
          },
          '.dark &:focus-visible': {
            'ring-color': 'rgb(250 250 250)',
          },
        },
      })
    },
  ],
} satisfies Config
