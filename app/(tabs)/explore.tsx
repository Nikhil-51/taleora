import React, { useState, useEffect } from 'react';
import { View, ScrollView, SafeAreaView, Text, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CategoryPill } from '@/components/ui/CategoryPill';
import StoryCard from '@/components/StoryCard';
import { Story } from '@/types';
import { supabase } from '@/lib/supabase';

const MOCK_CATEGORIES = ['Romance', 'Fantasy', 'Mystery', 'Sci-Fi', 'Thriller', 'Horror', 'Drama'];

export default function ExploreScreen() {
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState('Romance');
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, [activeCategory]);

  async function fetchStories() {
    try {
      setLoading(true);
      // For now, just fetch latest stories. In real app, filter by category/tags
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setStories(data);
      }
    } catch (e) {
      console.error(e);
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
          <View className="px-5 mb-6">
            <Text style={[Typography.heading1, { color: colors.text }]}>Explore</Text>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>Find your next favorite story.</Text>
          </View>

          {/* Search Bar Placeholder (Optional visual) */}
          <View
            className="mx-5 mb-8 h-12 rounded-full flex-row items-center px-4"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
          >
            <Text style={{ color: colors.textSecondary }}>Search by title, author, or tag...</Text>
          </View>

          {/* Categories */}
          <View className="mb-8 pl-5">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MOCK_CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat}
                  label={cat}
                  isActive={activeCategory === cat}
                  onPress={() => setActiveCategory(cat)}
                />
              ))}
            </ScrollView>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              {/* Featured / Trending Section */}
              <View className="px-4 mb-8">
                <SectionHeader title="Trending Now" href="/list/trending" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {stories.map((story, index) => (
                    <StoryCard key={story.id} story={story} index={index} />
                  ))}
                </ScrollView>
              </View>

              {/* Curated Collections */}
              <View className="px-4 mb-2">
                <SectionHeader title="Curated for You" href="/list/curated" />
                <View className="flex-row flex-wrap justify-between">
                  {/* Just showing list for now */}
                  {stories.map((story, index) => (
                    <View key={`curated-${story.id}`} style={{ width: '48%', marginBottom: 16 }}>
                      <StoryCard story={story} index={index + 5} />
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

        </ScrollView>
      </SafeAreaView>
    </PremiumBackground>
  );
}
