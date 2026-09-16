// code by Nikhil-51
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        if (!email || !password || !username) {
            Alert.alert('Please fill in all required fields');
            return;
        }
        setLoading(true);
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    display_name: displayName,
                },
            },
        });

        if (error) Alert.alert(error.message);
        else if (!session) Alert.alert('Please check your inbox for email verification!');

        setLoading(false);
    }

    return (
        <View className="flex-1 justify-center items-center bg-white p-4">
            <Text className="text-4xl font-bold text-primary mb-8">Join Taleora</Text>

            <TextInput
                className="w-full bg-gray-100 p-4 rounded-lg mb-4"
                placeholder="Username (Unique)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            <TextInput
                className="w-full bg-gray-100 p-4 rounded-lg mb-4"
                placeholder="Display Name (Optional)"
                value={displayName}
                onChangeText={setDisplayName}
            />

            <TextInput
                className="w-full bg-gray-100 p-4 rounded-lg mb-4"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <TextInput
                className="w-full bg-gray-100 p-4 rounded-lg mb-4"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                className="w-full bg-primary p-4 rounded-lg items-center"
                onPress={signUpWithEmail}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-white font-bold text-lg">Sign Up</Text>
                )}
            </TouchableOpacity>

            <View className="flex-row mt-4">
                <Text className="text-gray-500">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                        <Text className="text-primary font-bold">Sign In</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}
