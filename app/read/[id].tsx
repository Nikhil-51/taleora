// code by Nikhil-51
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Story } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft, Settings } from 'lucide-react-native';

export default function Reader() {
    const { colors } = useTheme();
    const { id } = useLocalSearchParams();
    const [story, setStory] = useState<Story | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchContent() {
            const { data } = await supabase.from('stories').select('*').eq('id', id).single();
            if (data) setStory(data);
            setLoading(false);
        }
        fetchContent();
    }, [id]);

    if (loading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <ActivityIndicator color={colors.primary} />
        </View>
    );

    if (!story) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <Text style={{ color: colors.text }}>Story not found</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View style={{ borderBottomColor: colors.border }} className="flex-row items-center justify-between p-4 border-b">
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={{ color: colors.text }} className="font-bold text-lg max-w-[70%]" numberOfLines={1}>{story.title}</Text>
                <TouchableOpacity>
                    <Settings color={colors.text} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-5" contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={{ color: colors.text }} className="text-xl leading-8 font-serif">
                    {story.content || "No content available for this story yet."}
                </Text>

                <View className="mt-10 items-center">
                    <Text style={{ color: colors.textSecondary }}>End of Part</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
