import { createBrowserClient } from '@supabase/ssr'
import { MemberVIP, AdminInternal, Notification } from './types'
export interface Database {
  public: {
    Tables: {
      data_member_vip: {
        Row: MemberVIP;
        Insert: MemberVIP;
        Update: Partial<MemberVIP>;
      };
      admin_internal: {
        Row: AdminInternal;
        Insert: AdminInternal;
        Update: Partial<AdminInternal>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'is_read'>;
        Update: Partial<Notification>;
      };
      profiles: {
        Row: { id: string; full_name: string | null; plan: string | null };
        Insert: { id: string; full_name?: string | null; plan?: string | null };
        Update: Partial<{ full_name: string | null; plan: string | null }>;
      };
      support_config: {
  Row: { id: number; whatsapp_number: string; telegram_link: string; support_email: string; operational_hours: string };
  Insert: { id?: number; whatsapp_number: string; telegram_link: string; support_email: string; operational_hours: string };
  Update: Partial<{ whatsapp_number: string; telegram_link: string; support_email: string; operational_hours: string }>;
};
support_faqs: {
  Row: { id: string; question: string; answer: string; created_at: string };
  Insert: { id?: string; question: string; answer: string };
  Update: Partial<{ question: string; answer: string }>;
};
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)