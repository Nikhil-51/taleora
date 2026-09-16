import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Story } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';

export default function NovelDetailsScreen() {
    const { colors } = useTheme();
    const { id } = useLocalSearchParams();
    const [novel, setNovel] = useState<Story | null>(null);
    const [chapters, setChapters] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchNovelAndChapters();
    }, [id]);

    async function fetchNovelAndChapters() {
        setLoading(true);
        const { data: novelData, error: novelError } = await supabase
            .from('stories')
            .select('*')
            .eq('id', id)
            .single();

        if (novelError) {
            Alert.alert('Error', 'Failed to load novel');
            router.back();
            return;
        }

        setNovel(novelData);

        const { data: chaptersData, error: chaptersError } = await supabase
            .from('stories')
            .select('*')
            .eq('parent_id', id)
            .eq('type', 'chapter')
            .order('created_at', { ascending: true });

        if (chaptersData) {
            setChapters(chaptersData);
        }

        setLoading(false);
    }

    async function handleDeleteNovel() {
        Alert.alert(
            "Delete Novel",
            "Are you sure you want to delete this novel? All chapters will also be deleted.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase.from('stories').delete().eq('id', id);
                        if (error) {
                            Alert.alert('Error', 'Failed to delete novel');
                        } else {
                            router.replace('/(tabs)/write');
                        }
                    }
                }
            ]
        );
    }

    async function handleDeleteChapter(chapterId: string) {
        Alert.alert(
            "Delete Chapter",
            "Are you sure you want to delete this chapter?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase.from('stories').delete().eq('id', chapterId);
                        if (error) {
                            Alert.alert('Error', 'Failed to delete chapter');
                        } else {
                            fetchNovelAndChapters();
                        }
                    }
                }
            ]
        );
    }



    if (loading) {
        return (
            <PremiumBackground>
                <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </SafeAreaView>
            </PremiumBackground>
        );
    }

    if (!novel) return null;

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1, paddingTop: 60 }}>
                <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft color={colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={[Typography.heading3, { flex: 1, textAlign: 'center', color: colors.text }]}>Manage Novel</Text>
                    <TouchableOpacity onPress={handleDeleteNovel}>
                        <Trash2 color="red" size={24} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                    <Text style={[Typography.heading1, { marginBottom: 8, color: colors.text }]}>{novel.title}</Text>
                    <Text style={[Typography.body, { color: colors.textSecondary, marginBottom: 24 }]}>{novel.summary}</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={[Typography.heading3, { color: colors.text }]}>Chapters</Text>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => router.push(`/write/novel/${id}/chapter`)}
                        >
                            <Plus color={colors.primary} size={20} />
                            <Text style={{ color: colors.primary, marginLeft: 4, fontWeight: 'bold' }}>Add Chapter</Text>
                        </TouchableOpacity>
                    </View>

                    {chapters.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderRadius: 12 }}>
                            <Text style={{ color: colors.textSecondary }}>No chapters yet.</Text>
                        </View>
                    ) : (
                        chapters.map((chapter, index) => (
                            <View
                                key={chapter.id}
                                style={{
                                    backgroundColor: colors.card,
                                    padding: 16,
                                    borderRadius: 12,
                                    marginBottom: 12,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={[Typography.heading4, { marginBottom: 4, color: colors.text }]}>Chapter {index + 1}: {chapter.title}</Text>
                                    <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                                        {new Date(chapter.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteChapter(chapter.id)} style={{ padding: 8 }}>
                                    <Trash2 color="red" size={20} />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </PremiumBackground>
    );
}
