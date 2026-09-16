import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

interface CategoryPillProps {
    label: string;
    isActive?: boolean;
    onPress?: () => void;
    style?: ViewStyle;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({ label, isActive = false, onPress, style }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                {
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isActive ? Colors.primary : Colors.card,
                    borderWidth: 1,
                    borderColor: isActive ? Colors.primary : Colors.border,
                    marginRight: 8,
                },
                style
            ]}
        >
            <Text
                style={[
                    Typography.caption,
                    {
                        fontWeight: '600',
                        color: isActive ? Colors.background : Colors.textSecondary
                    }
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};
