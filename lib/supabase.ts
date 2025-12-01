import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://blllhxfsrrykgrnbadxq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbGxoeGZzcnJ5a2dybmJhZHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDY5MDQsImV4cCI6MjA4MDE4MjkwNH0.-2ZHa2tfbjN2gZSOb5kg5IpB_a8Smf8dhSdfENgJdDc';

export const supabase = createClient(supabaseUrl, supabaseKey);