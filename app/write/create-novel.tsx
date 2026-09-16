import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { ArrowLeft, ImagePlus } from 'lucide-react-native';

export default function CreateNovelScreen() {
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

    async function handleCreate() {
        if (!title) return alert('Please enter a title');
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let coverUrl = null;
        if (coverImage) {
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

        const { error } = await supabase.from('stories').insert({
            title,
            summary,
            cover_url: coverUrl,
            author_id: user.id,
            type: 'novel'
        });

        setLoading(false);
        if (error) {
            console.error(error);
            alert('Error creating novel');
        } else {
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
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1, paddingTop: 60 }}>
                <View className="px-5 mb-6 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft color={colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={[Typography.heading3, { color: colors.text }]}>New Novel</Text>
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
                            style={[inputStyle]}
                            placeholder="Enter novel title"
                            placeholderTextColor={colors.textSecondary}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View className="mb-6">
                        <Text style={[Typography.caption, { marginBottom: 8, color: colors.textSecondary }]}>SUMMARY</Text>
                        <TextInput
                            style={[inputStyle, { height: 100 }]}
                            placeholder="What's your novel about?"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            textAlignVertical="top"
                            value={summary}
                            onChangeText={setSummary}
                        />
                    </View>

                    <TouchableOpacity
                        style={{
                            backgroundColor: colors.primary,
                            padding: 16,
                            borderRadius: 12,
                            alignItems: 'center'
                        }}
                        onPress={handleCreate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.background} />
                        ) : (
                            <Text style={{ color: colors.background, fontWeight: '700', fontSize: 18 }}>
                                Create Novel
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </PremiumBackground>
    );
}
