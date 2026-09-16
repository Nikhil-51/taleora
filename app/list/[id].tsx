import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { supabase } from '@/lib/supabase';
import { Story } from '@/types';
import StoryCard from '@/components/StoryCard';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ListScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();
  
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  let title = 'Stories';
  if (id === 'trending') title = 'Trending Now';
  else if (id === 'curated') title = 'Curated for You';

  useEffect(() => {
    fetchStories();
  }, [id]);

  async function fetchStories() {
    try {
      setLoading(true);
      // Simulating different fetches based on the ID. In a real app, you'd apply different filters.
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: id === 'curated' ? true : false }) // slightly different order for demo
        .limit(20);

      if (error) throw error;
      if (data) setStories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PremiumBackground>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15, padding: 5 }}>
            <ChevronLeft color={colors.text} size={28} />
          </TouchableOpacity>
          <Text style={[Typography.heading2, { color: colors.text, flex: 1 }]}>{title}</Text>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {stories.map((story, index) => (
                <View key={`list-${story.id}`} style={{ width: (width - 60) / 2, marginBottom: 20 }}>
                  {/* Since StoryCard has a fixed width in explore, we might need a custom layout here, but let's see if it fits */}
                  <StoryCard story={story} index={index} />
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </PremiumBackground>
  );
}
