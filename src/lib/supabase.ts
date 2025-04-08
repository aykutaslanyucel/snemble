
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qtarqrjwgdxnpweyukdi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0YXJxcmp3Z2R4bnB3ZXl1a2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Mjk5NDEsImV4cCI6MjA1OTIwNTk0MX0.6p3-SDm6zNwMSZHIgP41tCvaJUso3KVuIDZexopi9a4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
