export type ColorMode = "light" | "dark";

export type ColorTokens = {
  // Core tokens
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;

  // Sidebar tokens (key for branding)
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;

  // UI tokens
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  border: string;
  input: string;
  ring: string;

  // Destructive (keep consistent)
  destructive: string;
};

export type ColorPreset = {
  id: string;
  name: string;
  description: string;
  light: ColorTokens;
  dark: ColorTokens;
  // Visual preview colors (simplified for UI)
  preview: {
    primary: string; // HEX for display
    sidebar: string; // HEX for display
    accent: string; // HEX for display
  };
};
