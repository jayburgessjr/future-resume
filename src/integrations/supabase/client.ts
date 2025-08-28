import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseConfig } from '@/lib/config';
import { logger } from '@/lib/logger';

let supabase: ReturnType<typeof createClient<Database>>;

try {
  const config = getSupabaseConfig();
  
  supabase = createClient<Database>(config.url, config.anonKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'future-resume-web',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  logger.debug('Supabase client initialized successfully');

} catch (error) {
  logger.error('Failed to initialize Supabase client:', error);
  throw new Error('Failed to initialize database connection. Please check your configuration.');
}

export { supabase };