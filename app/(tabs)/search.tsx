import { View, Text, TextInput, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, User, BookOpen } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { supabase } from '@/lib/supabase';
import { Story, Profile } from '@/types';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
    const { colors } = useTheme();
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'stories' | 'people'>('stories');
    const [stories, setStories] = useState<Story[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Simple debounce implementation or use a hook if available. 
    // Implementing a custom useEffect debounce here since hooks/useDebounce might not exist.
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                performSearch();
            } else {
                setStories([]);
                setProfiles([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, activeTab]);

    async function performSearch() {
        setLoading(true);
        try {
            if (activeTab === 'stories') {
                const { data, error } = await supabase
                    .from('stories')
                    .select('*')
                    .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
                    .in('type', ['story', 'novel'])
                    .limit(20);

                if (data) setStories(data);
            } else {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
                    .limit(20);

                if (data) setProfiles(data);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1, paddingTop: 60 }}>
                <View className="px-5 mb-4">
                    <Text style={[Typography.heading1, { color: colors.text }]}>Search</Text>
                </View>

                {/* Search Bar */}
                <View className="px-5 mb-4">
                    <View
                        className="h-12 rounded-full flex-row items-center px-4"
                        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                    >
                        <SearchIcon color={colors.textSecondary} size={20} />
                        <TextInput
                            className="flex-1 ml-3 text-base"
                            style={{ color: colors.text }}
                            placeholder={activeTab === 'stories' ? "Search stories..." : "Search people..."}
                            placeholderTextColor={colors.textSecondary}
                            value={query}
                            onChangeText={setQuery}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Tabs */}
                <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 }}>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderBottomWidth: 2,
                            borderBottomColor: activeTab === 'stories' ? colors.primary : 'transparent',
                            alignItems: 'center'
                        }}
                        onPress={() => setActiveTab('stories')}
                    >
                        <Text style={{
                            color: activeTab === 'stories' ? colors.primary : colors.textSecondary,
                            fontWeight: activeTab === 'stories' ? 'bold' : 'normal',
                            fontSize: 16
                        }}>Stories</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderBottomWidth: 2,
                            borderBottomColor: activeTab === 'people' ? colors.primary : 'transparent',
                            alignItems: 'center'
                        }}
                        onPress={() => setActiveTab('people')}
                    >
                        <Text style={{
                            color: activeTab === 'people' ? colors.primary : colors.textSecondary,
                            fontWeight: activeTab === 'people' ? 'bold' : 'normal',
                            fontSize: 16
                        }}>People</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <>
                            {query.trim() === '' ? (
                                <>
                                    <Text style={[Typography.caption, { marginBottom: 16, color: colors.textSecondary }]}>TOP GENRES</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                        {['Romance', 'Fantasy', 'Sci-Fi', 'Mystery', 'Thriller'].map(tag => (
                                            <TouchableOpacity
                                                key={tag}
                                                style={{ backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border }}
                                                onPress={() => setQuery(tag)} // Quick search by tag
                                            >
                                                <Text style={{ color: colors.text }}>{tag}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            ) : (
                                <View>
                                    {activeTab === 'stories' ? (
                                        stories.length > 0 ? (
                                            stories.map(story => (
                                                <TouchableOpacity
                                                    key={story.id}
                                                    style={{ flexDirection: 'row', marginBottom: 16, backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}
                                                    onPress={() => router.push(`/story/${story.id}`)}
                                                >
                                                    <Image
                                                        source={{ uri: story.cover_url || 'https://via.placeholder.com/100' }}
                                                        style={{ width: 60, height: 80, borderRadius: 8, marginRight: 12 }}
                                                    />
                                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                                        <Text style={[Typography.heading4, { color: colors.text, marginBottom: 4 }]}>{story.title}</Text>
                                                        <Text style={[Typography.caption, { color: colors.textSecondary }]} numberOfLines={2}>{story.summary}</Text>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                            <BookOpen size={12} color={colors.primary} style={{ marginRight: 4 }} />
                                                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{story.type === 'novel' ? 'Novel' : 'Story'}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>No stories found.</Text>
                                        )
                                    ) : (
                                        profiles.length > 0 ? (
                                            profiles.map(profile => (
                                                <TouchableOpacity
                                                    key={profile.id}
                                                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}
                                                // Placeholder for profile navigation if needed
                                                >
                                                    {profile.avatar_url ? (
                                                        <Image source={{ uri: profile.avatar_url }} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }} />
                                                    ) : (
                                                        <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                                            <User size={24} color={colors.textSecondary} />
                                                        </View>
                                                    )}
                                                    <View>
                                                        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{profile.display_name || 'Reader'}</Text>
                                                        <Text style={{ color: colors.textSecondary }}>@{profile.username || 'username'}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>No people found.</Text>
                                        )
                                    )}
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </PremiumBackground >
    );
}
