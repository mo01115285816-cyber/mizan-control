'use client';

import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ecfgmznpkyekgpqsdhhr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZmdtem5wa3lla2dwcXNkaGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMDQxNzAsImV4cCI6MjEwMjU4MDE3MH0.oEsbiq2G9iUmS6kcGGvAFKVf9fraDDB0kmukac6XQjE';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function requireSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('إعدادات Supabase غير موجودة في بيئة لوحة التحكم');
  }
}
