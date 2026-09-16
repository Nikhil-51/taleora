import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { User, Settings, LogOut, Camera, Moon, Sun } from 'lucide-react-native';
import { Profile } from '@/types';

export default function ProfileScreen() {
    const { theme, colors, toggleTheme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        getProfile();
    }, []);

    async function getProfile() {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.replace('/(auth)/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) {
                throw error;
            }

            if (data) {
                setProfile(data);
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function updateProfileAvatar(avatarUrl: string) {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No user on the session!');

            const updates = {
                id: session.user.id,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) {
                throw error;
            }

            await getProfile(); // Refresh profile
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function pickImage() {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                uploadImage(result.assets[0]);
            }
        } catch (error) {
            Alert.alert('Error picking image');
        }
    }

    async function uploadImage(asset: ImagePicker.ImagePickerAsset) {
        try {
            setUploading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No user on the session!');

            const response = await fetch(asset.uri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();

            const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
            const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, arrayBuffer, {
                    contentType: asset.mimeType ?? 'image/jpeg',
                    upsert: false
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            if (data) {
                await updateProfileAvatar(data.publicUrl);
            }

        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Upload Error', error.message);
            }
        } finally {
            setUploading(false);
        }
    }


    function handleSignOut() {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase.auth.signOut();
                        if (error) Alert.alert('Error', error.message);
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ padding: 20, paddingTop: 60, alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 30 }}>Profile</Text>

                <TouchableOpacity onPress={pickImage} disabled={uploading}>
                    <View style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        backgroundColor: colors.card,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 16,
                        borderWidth: 2,
                        borderColor: colors.primary,
                        overflow: 'hidden'
                    }}>
                        {profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <User size={60} color={colors.textSecondary} />
                        )}
                        {uploading && (
                            <View style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator color={colors.primary} />
                            </View>
                        )}
                    </View>
                    <View style={{ position: 'absolute', bottom: 16, right: 0, backgroundColor: colors.primary, padding: 8, borderRadius: 20 }}>
                        <Camera size={16} color={colors.background} />
                    </View>
                </TouchableOpacity>

                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 }}>
                    {profile?.display_name || 'Reader'}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 32 }}>
                    @{profile?.username || 'username'}
                </Text>

                <View style={{ width: '100%', backgroundColor: colors.card, borderRadius: 12, padding: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {theme === 'dark' ? <Moon size={20} color={colors.text} /> : <Sun size={20} color={colors.text} />}
                            <Text style={{ fontSize: 16, color: colors.text, marginLeft: 12 }}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: colors.primary }}
                            thumbColor={colors.background}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSignOut}
                    style={{
                        width: '100%',
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 20,
                        borderWidth: 1,
                        borderColor: colors.error
                    }}
                >
                    <LogOut size={20} color={colors.error} />
                    <Text style={{ fontSize: 16, color: colors.error, marginLeft: 12, fontWeight: '600' }}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
