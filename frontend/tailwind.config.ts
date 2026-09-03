import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapping from the existing CSS variables so the visual identity stays the same
        accent: 'var(--accent, #6366f1)',
        'accent-hover': 'var(--accent-hover, #4f46e5)',
        foreground: 'var(--foreground, #1e293b)',
        'muted-foreground': 'var(--muted-foreground, #64748b)',
        muted: 'var(--muted, #f1f5f9)',
        card: 'var(--card, #ffffff)',
        border: 'var(--border, #e2e8f0)',
        error: 'var(--error, #ef4444)',
        success: 'var(--success, #22c55e)',
        warning: 'var(--warning, #f59e0b)',
      },
    },
  },
  plugins: [],
} satisfies Config
