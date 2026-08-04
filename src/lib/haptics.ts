/**
 * Utility for triggering subtle haptic vibration feedback on touch/click events.
 * Uses navigator.vibrate when supported by device and browser permissions.
 */

export const triggerHaptic = (pattern: number | number[] = 12): void => {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch (err) {
    // Silently catch error if vibrate is denied by permissions policy or device
  }
};

/**
 * Standard preset haptic feedback patterns
 */
export const HAPTIC_PATTERNS = {
  light: 12,        // Light subtle tap (button tap, toggle)
  medium: 22,       // Medium action feedback (start test, modal open)
  success: [10, 40, 20], // Double tap on successful action
  warning: [30, 50, 30], // Warning alert
};
