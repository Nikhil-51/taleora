const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkGenre() {
  const { data, error } = await supabase
    .from('stories')
    .select('id, genre')
    .limit(1);
    
  if (error) {
    console.error('Error fetching genre:', error.message);
  } else {
    console.log('Genre column exists! Sample:', data);
  }
}

checkGenre();
