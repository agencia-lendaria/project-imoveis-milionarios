import { createClient } from '@supabase/supabase-js';

// Supabase URL and anon key should be stored in environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Re-export types from realEstate module for convenience
export type {
  RealEstateAgent,
  RealEstateLead,
  ChatMessage,
  ConversationRead,
  ConversationWithLeadInfo,
  AgentInfo,
  PropertyType,
  LeadConversationStatus,
  CustomerType,
  PropertyInterest,
  PropertyViewing,
  RealEstateDashboardMetrics,
  RealEstateMessageType,
  RealEstateMessage
} from '../types/realEstate';