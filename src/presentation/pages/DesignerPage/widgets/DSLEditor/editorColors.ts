/**
 * Monaco Editor Color Configuration
 *
 * IDE-like color scheme for the DSL Monaco Editor.
 * Supports both light and dark themes.
 */

export class Color {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number = 1
  ) {}

  toHex(): string {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
  }

  withOpacity(opacity: number): Color {
    return new Color(this.r, this.g, this.b, opacity);
  }
}

/**
 * Check if dark mode is active
 */
const isDarkMode = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

/**
 * Editor-specific color palette
 */
export class EditorColors {
  // Editor UI
  static get background(): Color {
    return isDarkMode() ? new Color(15, 23, 42, 1) : new Color(255, 255, 255, 1);
  }

  static get foreground(): Color {
    return isDarkMode() ? new Color(241, 245, 249, 1) : new Color(31, 41, 55, 1);
  }

  static get lineHighlight(): Color {
    return isDarkMode() ? new Color(51, 65, 85, 1) : new Color(243, 244, 246, 1);
  }

  static get selection(): Color {
    return new Color(59, 130, 246, 0.2);
  }

  static get cursor(): Color {
    return new Color(59, 130, 246, 1);
  }

  static get lineNumber(): Color {
    return isDarkMode() ? new Color(148, 163, 184, 0.6) : new Color(107, 114, 128, 0.6);
  }

  static get border(): Color {
    return isDarkMode() ? new Color(71, 85, 105, 1) : new Color(229, 231, 235, 1);
  }

  // Syntax highlighting
  static get comment(): Color {
    return isDarkMode() ? new Color(156, 163, 175, 1) : new Color(107, 114, 128, 1);
  }

  static get keyword(): Color {
    return isDarkMode() ? new Color(96, 165, 250, 1) : new Color(59, 130, 246, 1);
  }

  static get type(): Color {
    return isDarkMode() ? new Color(34, 211, 238, 1) : new Color(6, 182, 212, 1);
  }

  static get string(): Color {
    return isDarkMode() ? new Color(251, 191, 36, 1) : new Color(245, 158, 11, 1);
  }

  static get number(): Color {
    return isDarkMode() ? new Color(52, 211, 153, 1) : new Color(16, 185, 129, 1);
  }

  static get decorator(): Color {
    return isDarkMode() ? new Color(250, 204, 21, 1) : new Color(234, 179, 8, 1);
  }

  static get metadata(): Color {
    return isDarkMode() ? new Color(192, 132, 252, 1) : new Color(168, 85, 247, 1);
  }

  static get operator(): Color {
    return EditorColors.foreground;
  }

  static get identifier(): Color {
    return EditorColors.foreground;
  }

  static get function(): Color {
    return isDarkMode() ? new Color(253, 224, 71, 1) : new Color(250, 204, 21, 1);
  }

  static get constant(): Color {
    return isDarkMode() ? new Color(251, 113, 133, 1) : new Color(244, 63, 94, 1);
  }
}
