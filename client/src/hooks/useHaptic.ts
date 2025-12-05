/**
 * Native-like haptic feedback hook
 * Provides vibration feedback for touch interactions
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const hapticPatterns: Record<HapticStyle, number[]> = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 20],
    warning: [20, 30, 20],
    error: [30, 50, 30, 50, 30],
    selection: [5],
};

export function useHaptic() {
    const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

    const trigger = (style: HapticStyle = 'light') => {
        if (isSupported) {
            navigator.vibrate(hapticPatterns[style]);
        }
    };

    const impact = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
        trigger(style);
    };

    const notification = (type: 'success' | 'warning' | 'error') => {
        trigger(type);
    };

    const selection = () => {
        trigger('selection');
    };

    return {
        isSupported,
        trigger,
        impact,
        notification,
        selection,
    };
}

// Standalone function for use outside React components
export function triggerHaptic(style: HapticStyle = 'light') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(hapticPatterns[style]);
    }
}