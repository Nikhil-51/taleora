import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

interface PremiumBackgroundProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const PremiumBackground: React.FC<PremiumBackgroundProps> = ({ children, style }) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }, style]}>
            {/*
              User requested solid colors. Removing gradient.
              Keeping the structure in case we want to revert or add simple solid patterns.
            */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />

            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor removed from here to be dynamic
    },
    content: {
        flex: 1,
    },
    accentGlow: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.15,
    }
});
