import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { ArrowLeft } from 'lucide-react-native';

export default function CreateChapterScreen() {
    const { colors } = useTheme();
    const { id } = useLocalSearchParams(); // Novel ID
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handlePublish() {
        if (!title || !content) return Alert.alert('Error', 'Please fill in title and content');

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return Alert.alert('Error', 'Not authenticated');
        }

        const { error } = await supabase.from('stories').insert({
            title,
            content,
            author_id: user.id,
            type: 'chapter',
            parent_id: id
        });

        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Chapter published!');
            router.back();
        }
    }

    const inputStyle = {
        color: colors.text,
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1, paddingTop: 60 }}>
                <View className="px-5 mb-6 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft color={colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={[Typography.heading3, { color: colors.text }]}>Write Chapter</Text>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>

                    <Text style={[Typography.caption, { marginBottom: 8, color: colors.textSecondary }]}>CHAPTER TITLE</Text>
                    <TextInput
                        style={[inputStyle, Typography.heading2]}
                        placeholder="Chapter 1..."
                        placeholderTextColor={colors.textSecondary}
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={[Typography.caption, { marginBottom: 8, color: colors.textSecondary }]}>CONTENT</Text>
                    <TextInput
                        style={[inputStyle, Typography.body, { minHeight: 300 }]}
                        placeholder="Start tell your tale..."
                        placeholderTextColor={colors.textSecondary}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={{
                            backgroundColor: colors.primary,
                            padding: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            marginTop: 8
                        }}
                        onPress={handlePublish}
                        disabled={loading}
                    >
                        <Text style={{ color: colors.background, fontWeight: '700', fontSize: 18 }}>
                            {loading ? 'Publishing...' : 'Publish Chapter'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </PremiumBackground>
    );
}
