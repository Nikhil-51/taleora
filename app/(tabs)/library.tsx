import { View, Text, SafeAreaView, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { supabase } from '@/lib/supabase';
import { Story } from '@/types';
import { Link } from 'expo-router';

export default function LibraryScreen() {
    const { colors } = useTheme();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLibrary();
    }, []);

    async function fetchLibrary() {
        try {
            // For now, fetch random stories to simulate a library
            const { data, error } = await supabase
                .from('stories')
                .select('*')
                .limit(5);

            if (data) setStories(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1, paddingTop: 60 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    <View className="px-5 mb-8">
                        <Text style={[Typography.heading1, { color: colors.text }]}>Your Library</Text>
                        <Text style={[Typography.body, { color: colors.textSecondary }]}>Stories you've saved for later.</Text>
                    </View>

                    <View className="px-4">
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                        ) : (
                            stories.map((story) => (
                                <Link key={story.id} href={`/story/${story.id}`} asChild>
                                    <TouchableOpacity 
                                        activeOpacity={0.8}
                                        style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}
                                    >
                                        <Image 
                                            source={{ uri: story.cover_url || 'https://via.placeholder.com/150' }} 
                                            style={{ width: 60, height: 90, borderRadius: 8, marginRight: 16, backgroundColor: colors.textSecondary }} 
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={[Typography.title, { color: colors.text }]} numberOfLines={1}>{story.title}</Text>
                                            <Text style={[Typography.caption, { marginTop: 4, color: colors.textSecondary }]} numberOfLines={1}>{story.summary}</Text>
                                            <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 12, width: '100%' }}>
                                                <View style={{ height: 4, backgroundColor: colors.primary, borderRadius: 2, width: `${Math.floor(Math.random() * 80 + 10)}%` }} />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </Link>
                            ))
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </PremiumBackground>
    );
}
