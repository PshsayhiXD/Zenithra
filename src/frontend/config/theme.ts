export type ThemeMode = "light" | "dark";

export interface ThemeLabels {
  light: string;
  dark: string;
  toggle: string;
}

export const themeStorageKey = "zenithra-theme";

export const themeLabels: ThemeLabels = {
  light: "Light",
  dark: "Dark",
  toggle: "Toggle color theme",
};
