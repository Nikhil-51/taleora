import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Typography } from '@/constants/Typography';
import { Colors } from '@/constants/Colors';
import { Link } from 'expo-router';

interface SectionHeaderProps {
    title: string;
    href?: string;
    onPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, href, onPress }) => {
    const content = (
        <View className="flex-row justify-between items-center mb-4 px-1">
            <Text style={Typography.heading2}>{title}</Text>
            <TouchableOpacity onPress={onPress}>
                <Text style={{ ...Typography.caption, color: Colors.primary, fontWeight: '600', fontSize: 13 }}>
                    See All
                </Text>
            </TouchableOpacity>
        </View>
    );

    if (href) {
        return (
            <Link href={href} asChild>
                <TouchableOpacity>
                    {/* Wrapping simplified content if it was complex, but for header mostly just title/btn */}
                    {/* If href is provided, typically the whole "See All" area might be the link, or just the text. 
               Here we'll make the button clickable via Link if pure TouchableOpacity is wrapped. 
               However, Link asChild expects a single child. 
               Lets adjust: Render View, and wrap "See All" in Link.
           */}
                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <Text style={Typography.heading2}>{title}</Text>
                        <Text style={{ ...Typography.caption, color: Colors.primary, fontWeight: '600', fontSize: 13 }}>
                            See All
                        </Text>
                    </View>
                </TouchableOpacity>
            </Link>
        );
    }

    // Simplified version: separate Title and Action
    return (
        <View className="flex-row justify-between items-center mb-4 px-1">
            <Text style={Typography.heading2}>{title}</Text>
            {href ? (
                <Link href={href} asChild>
                    <TouchableOpacity>
                        <Text style={{ ...Typography.caption, color: Colors.primary, fontWeight: '600', fontSize: 13 }}>
                            See All
                        </Text>
                    </TouchableOpacity>
                </Link>
            ) : (
                <TouchableOpacity onPress={onPress}>
                    <Text style={{ ...Typography.caption, color: Colors.primary, fontWeight: '600', fontSize: 13 }}>
                        See All
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
