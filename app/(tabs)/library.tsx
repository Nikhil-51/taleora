import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Story } from '@/types';
import StoryCard from '@/components/StoryCard';

const MOCK_SAVED: Story[] = [
    { id: 'library-1', title: 'The Silent Echo', author_id: '1', summary: 'A mystery thriller about sound.', cover_url: null, created_at: '', type: 'story' },
    { id: 'library-3', title: 'Space Odyssey', author_id: '3', summary: 'Journey to the stars.', cover_url: null, created_at: '', type: 'story' },
];

export default function LibraryScreen() {
    const { colors } = useTheme();

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1, paddingTop: 60 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    <View className="px-5 mb-8">
                        <Text style={[Typography.heading1, { color: colors.text }]}>Your Library</Text>
                        <Text style={[Typography.body, { color: colors.textSecondary }]}>Stories you've saved for later.</Text>
                    </View>

                    <View className="px-4">
                        {MOCK_SAVED.map((story, index) => (
                            <View key={story.id} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
                                <View style={{ width: 60, height: 90, backgroundColor: colors.textSecondary, borderRadius: 8, marginRight: 16, opacity: 0.3 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[Typography.title, { color: colors.text }]}>{story.title}</Text>
                                    <Text style={[Typography.caption, { marginTop: 4, color: colors.textSecondary }]}>2 Chapters left</Text>
                                    <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 12, width: '100%' }}>
                                        <View style={{ height: 4, backgroundColor: colors.primary, borderRadius: 2, width: '60%' }} />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </PremiumBackground>
    );
}
