import { TextStyle } from 'react-native';
import { Colors } from './Colors';

export const Typography = {
    heading1: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
        letterSpacing: 0.5,
    } as TextStyle,
    heading2: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.text,
        letterSpacing: 0.3,
    } as TextStyle,
    heading3: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        letterSpacing: 0.25,
    } as TextStyle,
    heading4: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        letterSpacing: 0.2,
    } as TextStyle,
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    } as TextStyle,
    body: {
        fontSize: 16,
        color: Colors.text,
        lineHeight: 24,
    } as TextStyle,
    caption: {
        fontSize: 12,
        color: Colors.textSecondary,
        letterSpacing: 0.2,
    } as TextStyle,
};
