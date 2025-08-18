import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

/**
 * Runtime schema for the `admin_analytics_summary` RPC response
 */
const AdminAnalyticsResponseSchema = z.object({
  totals: z.object({
    users: z.number(),
    pro: z.number(),
    free: z.number(),
    toolkits_7d: z.number(),
    toolkits_30d: z.number(),
    active_7d: z.number(),
  }),
  series: z.object({
    new_users_by_day: z.array(
      z.object({ day: z.string(), count: z.number() })
    ),
    toolkits_by_day: z.array(
      z.object({ day: z.string(), count: z.number() })
    ),
  }),
});

export type AdminAnalyticsResponse = z.infer<
  typeof AdminAnalyticsResponseSchema
>;

export interface AdminUser {
  id: string;
  email: string;
  plan: string;
  sub_status: string | null;
  created_at: string;
  last_active_at: string | null;
  toolkits_count: number;
  is_admin: boolean;
}

export interface AdminToolkit {
  id: string;
  profile_id: string;
  user_email: string;
  title: string;
  company: string;
  job_title: string;
  created_at: string;
}

/**
 * Check if current user is admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('admin_me_is_admin');
    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get analytics summary for admin dashboard
 */
export async function getAnalyticsSummary(
  days: number = 30
): Promise<AdminAnalyticsResponse> {
  const { data, error } = await supabase.rpc('admin_analytics_summary', { days });

  if (error) {
    console.error('Error fetching analytics:', error);
    throw new Error('Failed to fetch analytics data');
  }

  return AdminAnalyticsResponseSchema.parse(data);
}

/**
 * Get paginated users list with search and filters
 */
export async function getUsersList(params: {
  search?: string;
  planFilter?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<AdminUser[]> {
  const { 
    search = '', 
    planFilter = '', 
    limit = 25, 
    offset = 0 
  } = params;
  
  const { data, error } = await supabase.rpc('admin_users_list', {
    search,
    plan_filter: planFilter,
    limit_param: limit,
    offset_param: offset
  });
  
  if (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users data');
  }
  
  return data as AdminUser[];
}

/**
 * Get paginated toolkits list with search
 */
export async function getToolkitsList(params: {
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<AdminToolkit[]> {
  const { search = '', limit = 25, offset = 0 } = params;
  
  const { data, error } = await supabase.rpc('admin_toolkits_list', {
    search,
    limit_param: limit,
    offset_param: offset
  });
  
  if (error) {
    console.error('Error fetching toolkits:', error);
    throw new Error('Failed to fetch toolkits data');
  }
  
  return data as AdminToolkit[];
}