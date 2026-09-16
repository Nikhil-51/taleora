const dark = {
    primary: '#FFD700', // Gold
    background: '#0B0E14', // Matte Deep Slate/Black
    secondary: '#FFD700',
    card: '#151921', // Lighter Slate for cards
    text: '#F8FAFC', // High Contrast Off-white
    textSecondary: '#94A3B8', // Muted Blue-Grey
    accent: '#6366F1', // Indigo
    border: '#2D3748', // Subtle Border
    success: '#10B981',
    error: '#EF4444',
};

const light = {
    primary: '#D4AF37', // Darker Gold for visibility on white
    background: '#FFFFFF', // White
    secondary: '#D4AF37',
    card: '#F1F5F9', // Very light grey
    text: '#0F172A', // Dark Slate
    textSecondary: '#64748B', // Slate
    accent: '#6366F1', // Indigo
    border: '#E2E8F0', // Light Border
    success: '#10B981',
    error: '#EF4444',
};

export const Colors = {
    ...dark,
    light,
    dark,
};
