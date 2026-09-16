import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
    FadeInDown,
    FadeInUp
} from 'react-native-reanimated';

interface AnimatedCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    delay?: number;
    direction?: 'up' | 'down';
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    style,
    delay = 0,
    direction = 'up'
}) => {

    // Choose the entering animation based on direction
    const EnteringAnimation = direction === 'up'
        ? FadeInDown.delay(delay).springify().damping(12)
        : FadeInUp.delay(delay).springify().damping(12);

    return (
        <Animated.View
            entering={EnteringAnimation}
            style={style}
        >
            {children}
        </Animated.View>
    );
};
