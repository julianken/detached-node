import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans-stack)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono-stack)', 'ui-monospace', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'var(--prose-body)',
            '--tw-prose-body': 'var(--prose-body)',
            '--tw-prose-headings': 'var(--prose-headings)',
            '--tw-prose-links': 'var(--prose-links)',
            '--tw-prose-bold': 'var(--prose-bold)',
            '--tw-prose-counters': 'var(--prose-counters)',
            '--tw-prose-bullets': 'var(--prose-bullets)',
            '--tw-prose-hr': 'var(--prose-hr)',
            '--tw-prose-quotes': 'var(--prose-quotes)',
            '--tw-prose-quote-borders': 'var(--prose-quote-borders)',
            '--tw-prose-captions': 'var(--prose-captions)',
            '--tw-prose-code': 'var(--prose-code)',
            '--tw-prose-pre-code': 'var(--prose-pre-code)',
            '--tw-prose-pre-bg': 'var(--prose-pre-bg)',
            '--tw-prose-th-borders': 'var(--prose-th-borders)',
            '--tw-prose-td-borders': 'var(--prose-td-borders)',
            // Invert inherits from CSS vars — no separate dark values needed
            '--tw-prose-invert-body': 'var(--prose-body)',
            '--tw-prose-invert-headings': 'var(--prose-headings)',
            '--tw-prose-invert-links': 'var(--prose-links)',
            '--tw-prose-invert-bold': 'var(--prose-bold)',
            '--tw-prose-invert-counters': 'var(--prose-counters)',
            '--tw-prose-invert-bullets': 'var(--prose-bullets)',
            '--tw-prose-invert-hr': 'var(--prose-hr)',
            '--tw-prose-invert-quotes': 'var(--prose-quotes)',
            '--tw-prose-invert-quote-borders': 'var(--prose-quote-borders)',
            '--tw-prose-invert-captions': 'var(--prose-captions)',
            '--tw-prose-invert-code': 'var(--prose-code)',
            '--tw-prose-invert-pre-code': 'var(--prose-pre-code)',
            '--tw-prose-invert-pre-bg': 'var(--prose-pre-bg)',
            '--tw-prose-invert-th-borders': 'var(--prose-th-borders)',
            '--tw-prose-invert-td-borders': 'var(--prose-td-borders)',
            // Prose headings use mono font
            h1: { fontFamily: 'var(--font-mono-stack)' },
            h2: { fontFamily: 'var(--font-mono-stack)' },
            h3: { fontFamily: 'var(--font-mono-stack)' },
            h4: { fontFamily: 'var(--font-mono-stack)' },
            a: {
              color: 'var(--prose-links)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              '&:hover': {
                color: 'var(--accent-muted)',
              },
            },
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
            'outline': '2px solid var(--focus-ring)',
            'outline-offset': '2px',
          },
        },
      })
    },
  ],
} satisfies Config
