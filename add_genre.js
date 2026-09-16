const { Client } = require('pg');

const connectionString = 'postgres://postgres.rpqkowupbofedjnsunsj:Kirmada@4448@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to DB');

    // Add genre column if it doesn't exist
    await client.query(`
      ALTER TABLE public.stories 
      ADD COLUMN IF NOT EXISTS genre text;
    `);
    console.log('Added genre column');

    // Update existing stories with random genres
    const genres = ['Romance', 'Fantasy', 'Mystery', 'Sci-Fi', 'Thriller', 'Horror', 'Drama'];
    const { rows: stories } = await client.query('SELECT id FROM public.stories');
    
    for (const story of stories) {
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      await client.query('UPDATE public.stories SET genre = $1 WHERE id = $2', [randomGenre, story.id]);
    }
    console.log(`Updated ${stories.length} stories with random genres.`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
