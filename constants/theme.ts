export const COLORS = {
    primary: '#4F46E5', // Indigo 600
    primaryDark: '#4338CA', // Indigo 700
    secondary: '#10B981', // Emerald 500
    background: '#F3F4F6', // Gray 100
    surface: '#FFFFFF',
    text: '#1F2937', // Gray 800
    textLight: '#6B7280', // Gray 500
    border: '#E5E7EB', // Gray 200
    danger: '#EF4444', // Red 500
    shadow: '#000000',
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
};

export const RADIUS = {
    s: 8,
    m: 12,
    l: 24,
    full: 9999,
};

export const SHADOWS = {
    card: {
        shadowColor: COLORS.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    floating: {
        shadowColor: COLORS.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    }
};
