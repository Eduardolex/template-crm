import { COLOR_PRESETS } from "./presets";
import type { ColorPreset, ColorMode, ColorTokens } from "./preset-types";

export { COLOR_PRESETS };
export type { ColorPreset, ColorMode, ColorTokens };

/**
 * Get preset by ID
 */
export function getPresetById(id: string): ColorPreset | undefined {
  return COLOR_PRESETS.find((preset) => preset.id === id);
}

/**
 * Get color tokens for a specific preset and mode
 */
export function getColorTokens(
  presetId: string,
  mode: ColorMode
): ColorTokens | null {
  const preset = getPresetById(presetId);
  if (!preset) return null;
  return preset[mode];
}

/**
 * Generate CSS string for injecting into <style> tag
 * Creates :root and .dark selectors with all CSS variables
 */
export function generateColorCSS(presetId: string): string {
  const preset = getPresetById(presetId);
  if (!preset) return "";

  const lightTokens = preset.light;
  const darkTokens = preset.dark;

  // Helper to convert tokens to CSS variables
  const tokensToCSSVars = (tokens: ColorTokens): string => {
    return Object.entries(tokens)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `  --${cssVar}: ${value};`;
      })
      .join("\n");
  };

  return `
:root {
${tokensToCSSVars(lightTokens)}
}

.dark {
${tokensToCSSVars(darkTokens)}
}
`.trim();
}

/**
 * Get default preset ID
 */
export const DEFAULT_PRESET_ID = "professional-blue";

/**
 * Validate preset ID
 */
export function isValidPresetId(id: string): boolean {
  return COLOR_PRESETS.some((preset) => preset.id === id);
}
