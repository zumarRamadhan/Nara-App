import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--bg-page)",
        shell: "var(--bg-shell)",
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
          rowSelected: "var(--surface-row-selected)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
          faint: "var(--ink-faint)",
        },
        line: "var(--line)",
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          deep: "var(--accent-deep)",
        },
        success: {
          DEFAULT: "var(--success)",
          bg: "var(--success-bg)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          bg: "var(--danger-bg)",
        },
        warning: "var(--warning)",
      },
      borderRadius: {
        shell: "var(--radius-shell, 28px)",
        card: "var(--radius-card, 20px)",
        panel: "var(--radius-panel, 16px)",
        input: "999px",
        chip: "999px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
