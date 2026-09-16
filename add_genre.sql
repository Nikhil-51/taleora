-- Run this in your Supabase SQL Editor to add the genre column and populate it with random genres
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS genre text;

-- Temporarily assign a random genre to existing stories
UPDATE public.stories
SET genre = (ARRAY['Romance', 'Fantasy', 'Mystery', 'Sci-Fi', 'Thriller', 'Horror', 'Drama'])[floor(random() * 7) + 1]
WHERE genre IS NULL;
