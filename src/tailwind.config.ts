import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Safe area utilities for mobile
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        focus: {
          DEFAULT: "hsl(var(--focus))",
          foreground: "hsl(var(--focus-foreground))",
        },
        break: {
          DEFAULT: "hsl(var(--break))",
          foreground: "hsl(var(--break-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Safe area utilities plugin
    function({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.pt-safe': {
          paddingTop: 'max(env(safe-area-inset-top), 0px)',
        },
        '.pb-safe': {
          paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
        },
        '.pl-safe': {
          paddingLeft: 'max(env(safe-area-inset-left), 0px)',
        },
        '.pr-safe': {
          paddingRight: 'max(env(safe-area-inset-right), 0px)',
        },
        '.mt-safe': {
          marginTop: 'max(env(safe-area-inset-top), 0px)',
        },
        '.mb-safe': {
          marginBottom: 'max(env(safe-area-inset-bottom), 0px)',
        },
        '.ml-safe': {
          marginLeft: 'max(env(safe-area-inset-left), 0px)',
        },
        '.mr-safe': {
          marginRight: 'max(env(safe-area-inset-right), 0px)',
        },
        '.min-h-screen-safe': {
          minHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        },
        '.h-screen-safe': {
          height: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        },
        '.top-safe': {
          top: 'env(safe-area-inset-top)',
        },
        '.bottom-safe': {
          bottom: 'env(safe-area-inset-bottom)',
        },
        '.left-safe': {
          left: 'env(safe-area-inset-left)',
        },
        '.right-safe': {
          right: 'env(safe-area-inset-right)',
        },
      }
      addUtilities(newUtilities)
    },
  ],
} satisfies Config;

export default config;