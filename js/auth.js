const { createClient } = supabase;

const SUPABASE_URL = 'https://pzlqqtvcoxgsaylywnae.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6bHFxdHZjb3hnc2F5bHl3bmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDMwMDcsImV4cCI6MjA2OTUxOTAwN30.RW2eBtu0heivStyAV5q-6jWtonn1fIkNkz_zH0BjX3U';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
