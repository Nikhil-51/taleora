import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Story } from '@/types';
import { Link } from 'expo-router';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';

interface StoryCardProps {
    story: Story;
    index?: number;
}

export default function StoryCard({ story, index = 0 }: StoryCardProps) {
    const { colors } = useTheme();

    return (
        <AnimatedCard delay={index * 100} direction="up">
            <Link href={`/story/${story.id}`} asChild>
                <TouchableOpacity
                    className="mr-5 w-40 active:opacity-90"
                    style={{
                        transform: [{ scale: 1 }]
                    }}
                >
                    <Image
                        source={{ uri: story.cover_url || 'https://via.placeholder.com/150' }}
                        className="w-full h-56 rounded-2xl mb-3 bg-slate-800"
                        resizeMode="cover"
                        style={{ borderWidth: 1, borderColor: colors.border }}
                    />
                    <Text
                        style={[Typography.body, { color: colors.text }]}
                        className="font-bold mb-1"
                        numberOfLines={1}
                    >
                        {story.title}
                    </Text>
                    <Text
                        style={[Typography.caption, { color: colors.textSecondary }]}
                        numberOfLines={2}
                    >
                        {story.summary}
                    </Text>
                    {/* Placeholder for rating or stats */}
                    <View className="flex-row items-center mt-2">
                        <Text style={{ ...Typography.caption, fontSize: 10, color: colors.primary }}>
                            ★ 4.8
                        </Text>
                        <Text style={{ ...Typography.caption, fontSize: 10, marginLeft: 8, color: colors.textSecondary }}>
                            2.4k Reads
                        </Text>
                    </View>
                </TouchableOpacity>
            </Link>
        </AnimatedCard>
    );
}
