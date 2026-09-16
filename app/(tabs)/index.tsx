import React, { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { View, Text, ScrollView, SafeAreaView, Dimensions, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { SectionHeader } from '@/components/ui/SectionHeader';
import StoryCard from '@/components/StoryCard';
import { Story } from '@/types';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useTheme();
  const [featuredStory, setFeaturedStory] = useState<Story | null>(null);
  const [trendingStories, setTrendingStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    try {
      setLoading(true);

      // Fetch Trending (just latest for now)
      const { data: latest, error: latestError } = await supabase
        .from('stories')
        .select('*')
        .in('type', ['story', 'novel'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (latestError) throw latestError;

      if (latest && latest.length > 0) {
        setTrendingStories(latest);
        setFeaturedStory(latest[0]); // Just pick the first as featured for now
      }

    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PremiumBackground>
      <SafeAreaView style={{ flex: 1, paddingTop: 60 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-5 mb-8">
            <Text style={[Typography.heading1, { color: colors.text }]}>For You</Text>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>Daily recommendations based on your taste.</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              {featuredStory && (
                <View className="px-5 mb-10">
                  <Text style={[Typography.title, { marginBottom: 12, color: colors.primary }]}>Editor's Pick</Text>
                  <Link href={`/story/${featuredStory.id}`} asChild>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: 16,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: colors.border,
                        height: 220,
                      }}
                    >
                      <View style={{ flex: 1, padding: 20, justifyContent: 'flex-end' }}>
                        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#2D3748', opacity: 0.3 }} />
                        <Text style={[Typography.heading2, { color: colors.text }]}>{featuredStory.title}</Text>
                        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                          {featuredStory.summary && featuredStory.summary.length > 50 ? featuredStory.summary.substring(0, 50) + '...' : featuredStory.summary}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Link>
                </View>
              )}

              {/* Trending Section */}
              <View className="px-4 mb-4">
                <SectionHeader title="Trending This Week" href="/list/trending" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {trendingStories.map((story, index) => (
                    <StoryCard key={story.id} story={story} index={index} />
                  ))}
                </ScrollView>
              </View>
            </>
          )}

          {/* Continue Reading (Mock - static for layout demo, updating colors only) */}
          <View className="px-5 mb-10 mt-8">
            <SectionHeader title="Continue Reading" href="/library" />
            <View style={{
              backgroundColor: colors.card,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <View style={{ width: 40, height: 60, backgroundColor: colors.textSecondary, borderRadius: 4, marginRight: 12, opacity: 0.3 }} />
              <View style={{ flex: 1 }}>
                <Text style={[Typography.title, { color: colors.text }]}>The Silent Echo</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>Chapter 4 • 12 mins left</Text>
                <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 8, width: '100%' }}>
                  <View style={{ height: 4, backgroundColor: colors.primary, borderRadius: 2, width: '35%' }} />
                </View>
              </View>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </PremiumBackground>
  );
}
