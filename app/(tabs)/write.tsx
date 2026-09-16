import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { Plus, BookOpen, FileText, Trash2 } from 'lucide-react-native';
import { Story } from '@/types';
import { Alert } from 'react-native';

export default function WriteScreen() {
    const { colors } = useTheme();
    const [novels, setNovels] = useState<Story[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchContent();
    }, []);

    async function fetchContent() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return setLoading(false);

        // Fetch Novels
        const { data: novelsData } = await supabase
            .from('stories')
            .select('*')
            .eq('author_id', user.id)
            .eq('type', 'novel')
            .order('created_at', { ascending: false });

        if (novelsData) setNovels(novelsData);

        // Fetch Short Stories
        const { data: storiesData } = await supabase
            .from('stories')
            .select('*')
            .eq('author_id', user.id)
            .eq('type', 'short_story')
            .order('created_at', { ascending: false });

        if (storiesData) setStories(storiesData);

        setLoading(false);
    }

    async function handleDelete(id: string, type: 'novel' | 'story') {
        Alert.alert(
            "Delete Content",
            "Are you sure you want to delete this? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase
                            .from('stories')
                            .delete()
                            .eq('id', id);

                        if (error) {
                            Alert.alert("Error", "Failed to delete item");
                        } else {
                            // Refresh lists
                            if (type === 'novel') {
                                setNovels(prev => prev.filter(n => n.id !== id));
                            } else {
                                setStories(prev => prev.filter(s => s.id !== id));
                            }
                        }
                    }
                }
            ]
        );
    }

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1, paddingTop: 60 }}>
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchContent} tintColor={colors.primary} />}
                >
                    <Text style={[Typography.heading1, { marginBottom: 24, color: colors.text }]}>Studio</Text>

                    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 32 }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: colors.card,
                                padding: 20,
                                borderRadius: 16,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: colors.border,
                            }}
                            onPress={() => router.push('/write/create-story')}
                        >
                            <FileText size={32} color={colors.primary} style={{ marginBottom: 12 }} />
                            <Text style={[Typography.heading4, { color: colors.text }]}>New Story</Text>
                            <Text style={[Typography.caption, { textAlign: 'center', marginTop: 4, color: colors.textSecondary }]}>
                                Publish a single short story
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: colors.card,
                                padding: 20,
                                borderRadius: 16,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: colors.border
                            }}
                            onPress={() => router.push('/write/create-novel')}
                        >
                            <BookOpen size={32} color={colors.secondary} style={{ marginBottom: 12 }} />
                            <Text style={[Typography.heading4, { color: colors.text }]}>New Novel</Text>
                            <Text style={[Typography.caption, { textAlign: 'center', marginTop: 4, color: colors.textSecondary }]}>
                                Create a multi-chapter series
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={[Typography.heading3, { marginBottom: 16, color: colors.text }]}>My Novels</Text>

                    {novels.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderRadius: 12, marginBottom: 32 }}>
                            <Text style={{ color: colors.textSecondary }}>You haven't created any novels yet.</Text>
                        </View>
                    ) : (
                        <View style={{ marginBottom: 32 }}>
                            {novels.map(novel => (
                                <View
                                    key={novel.id}
                                    style={{
                                        backgroundColor: colors.card,
                                        padding: 16,
                                        borderRadius: 12,
                                        marginBottom: 12,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: colors.border
                                    }}
                                >
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                                        onPress={() => router.push(`/write/novel/${novel.id}`)}
                                    >
                                        <View style={{ width: 50, height: 70, backgroundColor: colors.background, borderRadius: 4, marginRight: 16 }} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={[Typography.heading4, { color: colors.text }]}>{novel.title}</Text>
                                            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                                                Manage Chapters
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleDelete(novel.id, 'novel')}
                                        style={{ padding: 8 }}
                                    >
                                        <Trash2 size={20} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    <Text style={[Typography.heading3, { marginBottom: 16, color: colors.text }]}>My Stories</Text>

                    {stories.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderRadius: 12 }}>
                            <Text style={{ color: colors.textSecondary }}>You haven't posted any short stories yet.</Text>
                        </View>
                    ) : (
                        stories.map(story => (
                            <View
                                key={story.id}
                                style={{
                                    backgroundColor: colors.card,
                                    padding: 16,
                                    borderRadius: 12,
                                    marginBottom: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: colors.border
                                }}
                            >
                                <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                                    onPress={() => router.push(`/story/${story.id}`)}
                                >
                                    <View style={{ width: 50, height: 70, backgroundColor: colors.background, borderRadius: 4, marginRight: 16 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[Typography.heading4, { color: colors.text }]}>{story.title}</Text>
                                        <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                                            {story.summary ? (story.summary.length > 40 ? story.summary.substring(0, 40) + '...' : story.summary) : 'No summary'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleDelete(story.id, 'story')}
                                    style={{ padding: 8 }}
                                >
                                    <Trash2 size={20} color={colors.error} />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}

                </ScrollView>
            </SafeAreaView>
        </PremiumBackground>
    );
}
