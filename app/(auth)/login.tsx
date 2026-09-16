// code by Nikhil-51
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert(error.message);
        setLoading(false);
    }

    return (
        <View className="flex-1 justify-center items-center bg-white p-4">
            <Text className="text-4xl font-bold text-primary mb-8">Taleora</Text>

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
                onPress={signInWithEmail}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-white font-bold text-lg">Sign In</Text>
                )}
            </TouchableOpacity>

            <View className="flex-row mt-4">
                <Text className="text-gray-500">Don't have an account? </Text>
                <Link href="/(auth)/signup" asChild>
                    <TouchableOpacity>
                        <Text className="text-primary font-bold">Sign Up</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}
