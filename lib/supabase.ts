import { createBrowserClient } from '@supabase/ssr'
import { MemberVIP, AdminInternal } from './types'

export type Database = {
  public: {
    Tables: {
      data_member_vip: {
        Row: MemberVIP;
        Insert: Omit<MemberVIP, 'id' | 'dibuat_pada'>;
        Update: Partial<MemberVIP>;
      };
      admin_internal: {
        Row: AdminInternal;
        Insert: Omit<AdminInternal, 'id' | 'dibuat_pada'>;
      };
    };
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// PAKAI createBrowserClient BIAR COOKIE KE-SET OTOMATIS UNTUK MIDDLEWARE
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)