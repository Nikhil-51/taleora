// code by Nikhil-51
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Story, Profile } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft, Trash2, Heart, MessageCircle, Send } from 'lucide-react-native';

export default function StoryDetails() {
    const { colors } = useTheme();
    const { id } = useLocalSearchParams();
    const [story, setStory] = useState<Story | null>(null);
    const [chapters, setChapters] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    // Social State
    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const router = useRouter();

    useEffect(() => {
        async function fetchStoryAndChapters() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase.from('stories').select('*').eq('id', id).single();
            if (data) {
                setStory(data);
                if (user && user.id === data.author_id) {
                    setIsOwner(true);
                }

                if (data.type === 'novel') {
                    const { data: chaptersData } = await supabase
                        .from('stories')
                        .select('*')
                        .eq('parent_id', id)
                        .eq('type', 'chapter')
                        .order('created_at', { ascending: true });
                    if (chaptersData) setChapters(chaptersData);
                }

                // Fetch Likes
                const { count } = await supabase
                    .from('likes')
                    .select('id', { count: 'exact' })
                    .eq('story_id', id);
                setLikesCount(count || 0);

                if (user) {
                    const { data: likeData } = await supabase
                        .from('likes')
                        .select('id')
                        .eq('story_id', id)
                        .eq('user_id', user.id)
                        .single();
                    setIsLiked(!!likeData);
                }

                // Fetch Comments
                fetchComments();
            }
            setLoading(false);
        }
        fetchStoryAndChapters();
    }, [id]);

    async function fetchComments() {
        const { data: commentsData, error } = await supabase
            .from('comments')
            .select(`
                id,
                content,
                created_at,
                profiles:user_id (
                    id,
                    username,
                    display_name,
                    avatar_url
                )
            `)
            .eq('story_id', id)
            .order('created_at', { ascending: false });

        if (commentsData) setComments(commentsData);
    }

    async function toggleLike() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            Alert.alert('Sign in required', 'Please sign in to like this story');
            return;
        }

        if (isLiked) {
            // Unlike
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('story_id', id)
                .eq('user_id', user.id);

            if (!error) {
                setIsLiked(false);
                setLikesCount(prev => prev - 1);
            }
        } else {
            // Like
            const { error } = await supabase
                .from('likes')
                .insert({ story_id: id, user_id: user.id });

            if (!error) {
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
            }
        }
    }

    async function postComment() {
        if (!newComment.trim()) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            Alert.alert('Sign in required', 'Please sign in to comment');
            return;
        }

        setSubmittingComment(true);
        const { error } = await supabase
            .from('comments')
            .insert({
                story_id: id,
                user_id: user.id,
                content: newComment.trim()
            });

        if (error) {
            Alert.alert('Error', 'Failed to post comment');
        } else {
            setNewComment('');
            fetchComments();
        }
        setSubmittingComment(false);
    }

    async function handleDelete() {
        Alert.alert(
            "Delete Story",
            "Are you sure you want to delete this story? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase.from('stories').delete().eq('id', id);
                        if (error) {
                            Alert.alert('Error', 'Failed to delete story');
                        } else {
                            router.replace('/(tabs)');
                        }
                    }
                }
            ]
        );
    }

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
            <ScrollView>
                <View className="relative h-64 bg-gray-900">
                    <Image
                        source={{ uri: story.cover_url || 'https://via.placeholder.com/400x200' }}
                        className="w-full h-full opacity-60"
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-12 left-4 bg-black/30 p-2 rounded-full"
                    >
                        <ArrowLeft color="white" size={24} />
                    </TouchableOpacity>

                    <View className="absolute bottom-4 left-4 right-4 flex-row justify-between items-end">
                        <View>
                            <Text className="text-white text-3xl font-bold mb-2">{story.title}</Text>
                            <Text className="text-gray-300 text-base">Written by Authenticated User</Text>
                            <View className="bg-primary/80 self-start px-3 py-1 rounded-full mt-2">
                                <Text className="text-white text-xs uppercase font-bold">{story.type}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                                onPress={toggleLike}
                                style={{ backgroundColor: isLiked ? colors.primary : 'rgba(255,255,255,0.2)' }}
                                className="p-3 rounded-full mb-2 flex-row items-center"
                            >
                                <Heart
                                    color={isLiked ? colors.background : 'white'}
                                    fill={isLiked ? colors.background : 'transparent'}
                                    size={24}
                                />
                                <Text style={{ color: isLiked ? colors.background : 'white', marginLeft: 6, fontWeight: 'bold' }}>
                                    {likesCount}
                                </Text>
                            </TouchableOpacity>

                            {isOwner && (
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    className="bg-red-500/80 p-3 rounded-full mb-2"
                                >
                                    <Trash2 color="white" size={24} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                <View className="p-4">
                    {/* Action Bar */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MessageCircle size={20} color={colors.textSecondary} />
                            <Text style={{ color: colors.textSecondary, marginLeft: 6 }}>{comments.length} Comments</Text>
                        </View>
                        {/* Share placeholder */}
                    </View>
                    {story.type === 'story' ? (
                        <TouchableOpacity
                            style={{ backgroundColor: colors.primary }}
                            className="p-4 rounded-full items-center mb-6"
                            onPress={() => router.push(`/read/${story.id}`)}
                        >
                            <Text style={{ color: colors.background }} className="font-bold text-lg uppercase">Start Reading</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="mb-6">
                            <Text style={{ color: colors.text }} className="text-xl font-bold mb-4">Chapters</Text>
                            {chapters.length === 0 ? (
                                <Text style={{ color: colors.textSecondary }} className="italic">No chapters published yet.</Text>
                            ) : (
                                chapters.map((chapter, index) => (
                                    <TouchableOpacity
                                        key={chapter.id}
                                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                        className="p-4 rounded-lg mb-2 border flex-row items-center"
                                        onPress={() => router.push(`/read/${chapter.id}`)}
                                    >
                                        <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                                            <Text className="font-bold text-gray-600">{index + 1}</Text>
                                        </View>
                                        <Text style={{ color: colors.text }} className="font-medium text-lg">{chapter.title}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    )}

                    <Text style={{ color: colors.text }} className="text-xl font-bold mb-2">Description</Text>
                    <Text style={{ color: colors.textSecondary }} className="leading-6 text-base mb-8">{story.summary}</Text>

                    {/* Comments Section */}
                    <View style={{ marginBottom: 40 }}>
                        <Text style={{ color: colors.text }} className="text-xl font-bold mb-4">Comments</Text>

                        {/* New Comment Input */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: colors.card, borderRadius: 25, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: colors.border }}>
                            <TextInput
                                placeholder="Add a comment..."
                                placeholderTextColor={colors.textSecondary}
                                style={{ flex: 1, color: colors.text, height: 40 }}
                                value={newComment}
                                onChangeText={setNewComment}
                            />
                            <TouchableOpacity
                                onPress={postComment}
                                disabled={submittingComment || !newComment.trim()}
                                style={{ opacity: newComment.trim() ? 1 : 0.5 }}
                            >
                                {submittingComment ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <Send size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Comments List */}
                        {comments.length === 0 ? (
                            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 10 }}>No comments yet. Be the first to share your thoughts!</Text>
                        ) : (
                            comments.map(comment => (
                                <View key={comment.id} style={{ marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 16 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                        {comment.profiles?.avatar_url ? (
                                            <Image source={{ uri: comment.profiles.avatar_url }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }} />
                                        ) : (
                                            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, marginRight: 10 }} />
                                        )}
                                        <View>
                                            <Text style={{ color: colors.text, fontWeight: 'bold' }}>{comment.profiles?.display_name || 'Reader'}</Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>{comment.content}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
