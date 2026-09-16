import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const TAB_BAR_WIDTH = width - 40; // 20 padding on each side
  const TAB_WIDTH = TAB_BAR_WIDTH / state.routes.length;
  
  const indicatorSize = 48;
  const translateX = useSharedValue(0);

  useEffect(() => {
    const centerOffset = (TAB_WIDTH - indicatorSize) / 2;
    translateX.value = withSpring(state.index * TAB_WIDTH + centerOffset, {
      damping: 25,
      stiffness: 200,
    });
  }, [state.index]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={[styles.blurView, { borderColor: colors.border }]}>
        
        {/* Animated Indicator */}
        <Animated.View 
          style={[
            styles.indicator, 
            { 
              width: indicatorSize, 
              height: indicatorSize,
              borderRadius: indicatorSize / 2,
              top: (65 - indicatorSize) / 2,
              backgroundColor: 'rgba(139, 92, 246, 0.25)' 
            },
            animatedIndicatorStyle
          ]} 
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const Icon = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              {Icon && Icon({ 
                focused: isFocused, 
                color: isFocused ? '#8B5CF6' : colors.textSecondary, 
                size: 24 
              })}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 65,
    borderRadius: 35,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  blurView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 35,
    borderWidth: 1,
    backgroundColor: 'rgba(11, 14, 20, 0.6)',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    zIndex: 1,
  },
  indicator: {
    position: 'absolute',
    zIndex: 0,
  },
});
