// @fayth/ui — shared components
// Phase 1: minimal exports, components will be added as needed

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
