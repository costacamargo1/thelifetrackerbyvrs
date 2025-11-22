// src/auth/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://meviqcdalwhnoqndnihu.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldmlxY2RhbHdobm9xbmRuaWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MzU5NzAsImV4cCI6MjA3OTQxMTk3MH0.wxypnzkGfKxlc99F5PtyX1_DbidQX_isc8rAfyknZlA';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL ou ANON KEY não configuradas');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
