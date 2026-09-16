import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { ArrowLeft, ImagePlus } from 'lucide-react-native';

export default function CreateStoryScreen() {
    const { colors } = useTheme();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [coverImage, setCoverImage] = useState<string | null>(null);

    async function pickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setCoverImage(result.assets[0].uri);
        }
    }

    async function uploadImage() {
        if (!coverImage) return null;

        const ext = coverImage.substring(coverImage.lastIndexOf('.') + 1);
        const fileName = `${Date.now()}.${ext}`;
        const formData = new FormData();

        formData.append('files', {
            uri: coverImage,
            name: fileName,
            type: `image/${ext}`,
        } as any);

        const { data, error } = await supabase.storage
            .from('story-covers')
            .upload(fileName, formData as any);

        if (error) {
            console.error('Upload error:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('story-covers')
            .getPublicUrl(fileName);

        return publicUrl;
    }

    async function handlePublish() {
        if (!title || !content) return alert('Please fill in title and content');
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let coverUrl = null;
        if (coverImage) {
            // Check if it's already a remote URL (unlikely here but good practice) or local
            if (!coverImage.startsWith('http')) {
                // We need to implement the fetch/blob logic similar to profile.tsx because FormData might be tricky in Expo sometimes, 
                // but let's stick to the method that worked in profile.tsx if strictly needed.
                // Actually, profile.tsx used fetch -> blob -> arraybuffer/base64. 
                // Let's copy that robust method.
                try {
                    const response = await fetch(coverImage);
                    const blob = await response.blob();
                    const arrayBuffer = await new Response(blob).arrayBuffer();

                    const fileExt = coverImage.split('.').pop();
                    const fileName = `${Date.now()}.${fileExt}`;
                    const filePath = `${user.id}/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('story-covers')
                        .upload(filePath, arrayBuffer, {
                            contentType: `image/${fileExt}`,
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('story-covers')
                        .getPublicUrl(filePath);

                    coverUrl = publicUrl;
                } catch (e) {
                    console.error(e);
                    alert('Failed to upload cover image');
                    setLoading(false);
                    return;
                }
            }
        }

        const { error } = await supabase.from('stories').insert({
            title,
            summary,
            content,
            cover_url: coverUrl,
            author_id: user.id,
            type: 'story'
        });

        setLoading(false);
        if (error) {
            console.error(error);
            alert('Error publishing story');
        } else {
            router.back();
        }
    }

    const inputStyle = {
        color: colors.text,
        backgroundColor: colors.card,
        borderColor: colors.border,
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1, paddingTop: 60 }}>
                <View className="px-5 mb-6 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft color={colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={[Typography.heading3, { color: colors.text }]}>New Story</Text>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                    <View className="mb-6">
                        <Text style={[Typography.caption, { marginBottom: 8, color: colors.textSecondary }]}>COVER IMAGE (OPTIONAL)</Text>
                        <TouchableOpacity
                            onPress={pickImage}
                            style={{
                                height: 200,
                                backgroundColor: colors.card,
                                borderRadius: 12,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: colors.border,
                                overflow: 'hidden'
                            }}
                        >
                            {coverImage ? (
                                <Image source={{ uri: coverImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <ImagePlus color={colors.textSecondary} size={40} />
                                    <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Tap to add cover</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="mb-6">
                        <Text style={[Typography.caption, { marginBottom: 8, color: colors.textSecondary }]}>TITLE</Text>
                        <TextInput
                            style={[styles.input, inputStyle]}
                            placeholder="Enter story title"
                            placeholderTextColor={colors.textSecondary}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View className="mb-6">
                        <Text style={[Typography.caption, { marginBottom: 8, color: colors.textSecondary }]}>SUMMARY</Text>
                        <TextInput
                            style={[styles.input, inputStyle, { height: 80 }]}
                            placeholder="What's your story about?"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            textAlignVertical="top"
                            value={summary}
                            onChangeText={setSummary}
                        />
                    </View>

                    <View className="mb-8">
                        <Text style={[Typography.caption, { marginBottom: 8, color: colors.textSecondary }]}>CONTENT</Text>
                        <TextInput
                            style={[styles.input, inputStyle, { height: 300 }]}
                            placeholder="Once upon a time..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            textAlignVertical="top"
                            value={content}
                            onChangeText={setContent}
                        />
                    </View>

                    <TouchableOpacity
                        style={{
                            backgroundColor: colors.primary,
                            padding: 16,
                            borderRadius: 12,
                            alignItems: 'center'
                        }}
                        onPress={handlePublish}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.background} />
                        ) : (
                            <Text style={{ color: colors.background, fontWeight: '700', fontSize: 18 }}>
                                Publish Story
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
    },
});
