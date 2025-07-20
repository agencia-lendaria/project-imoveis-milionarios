// Types for Real Estate Million Dollar Properties Project

export interface RealEstateAgent {
  id: number;
  created_at: string;
  updated_at?: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'on_leave';
  user_id?: string;
  creci_number?: string; // CRECI registration number for Brazilian real estate agents
  commission_percentage: number;
  specialization?: string; // Luxury properties, commercial, residential, etc.
  territory?: any; // Geographic area of operation (JSON)
  profile_image_url?: string;
  bio?: string;
  is_active: boolean;
  performance_metrics?: any; // Performance data (JSON)
}

export interface RealEstateLead {
  id: number;
  created_at: string;
  updated_at?: string;
  crm_contact_id?: string;
  phone_id?: string;
  phone_number?: string;
  name?: string;
  email?: string;
  cpf?: string;
  user_type?: string;
  crm_deal_id?: string;
  crm_deal_stage_id?: string;
  data?: string;
  last_message_data?: any;
  next_follow_up_date?: string;
  follow_up_stage: number;
  has_follow_upped: boolean;
  is_ai_enabled: boolean;
  user_source?: any;
  chatwoot_account_id?: number;
  chatwoot_inbox_id?: number;
  chatwoot_conversation_id?: number;
  chatwoot_contact_id?: number;
  birth_date?: string;
  lead_scoring?: number;
  path_source?: string;
  cnpj?: string;
  corporate_name?: string;
  full_address?: string;
  cep?: string;
  instance_name?: string;
  inbox_channel?: string;
  lead_conversation_status?: LeadConversationStatus;
  offer_video_sent?: boolean;
  offer_audio_sent?: boolean;
  offer_image_sent?: boolean;
  offer_document_sent?: boolean;
  user_profile?: string;
  customer_type?: CustomerType;
  // Real estate specific fields
  budget_range?: {
    min: number;
    max: number;
  };
  preferred_locations?: string[];
  property_type_preference?: PropertyType[];
  property_size_preference?: {
    min_area?: number;
    max_area?: number;
    min_bedrooms?: number;
    max_bedrooms?: number;
  };
  financing_pre_approved?: boolean;
  viewing_availability?: string;
  urgency_level?: 'low' | 'medium' | 'high' | 'urgent';
  referral_source?: string;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  message: {
    type: 'user' | 'ai' | 'agent';
    content: string;
    timestamp?: string;
    media_type?: 'text' | 'image' | 'video' | 'audio' | 'document';
    media_url?: string;
    media_name?: string;
  };
  created_at: string;
  sender?: string;
  instance_name?: string;
}

export interface ConversationRead {
  id: number;
  created_at: string;
  session_id: string;
  seller_id: number;
  read_at: string;
  last_read_message_id?: number;
}

export interface ConversationWithLeadInfo {
  session_id: string;
  sender: string;
  last_message_date: string;
  message_count: number;
  lead_name: string;
  lead_phone_id: string;
  lead_scoring?: string;
  crm_deal_stage_id?: string;
  is_ai_enabled: boolean;
  lead_conversation_status?: string;
  last_message_data?: any;
  instance_name?: string;
  manychat_id?: string;
  manychat_data?: any;
  // Real estate specific fields
  property_interest?: PropertyInterest;
  scheduled_viewing?: PropertyViewing;
}

export interface AgentInfo {
  sender: string;
  conversation_count: number;
  // Additional agent performance metrics
  conversion_rate?: number;
  avg_response_time?: number;
  active_leads?: number;
  closed_deals_this_month?: number;
}

// Real Estate specific types

export type PropertyType = 
  | 'apartment' 
  | 'house' 
  | 'condo' 
  | 'penthouse' 
  | 'mansion' 
  | 'farm' 
  | 'commercial' 
  | 'land' 
  | 'investment';

export type LeadConversationStatus = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'viewing_scheduled' 
  | 'viewing_completed' 
  | 'negotiating' 
  | 'proposal_sent' 
  | 'closed_won' 
  | 'closed_lost' 
  | 'nurturing';

export type CustomerType = 
  | 'individual_buyer' 
  | 'investor' 
  | 'corporate_buyer' 
  | 'international_buyer' 
  | 'relocation' 
  | 'upgrade_buyer' 
  | 'first_time_buyer';

export interface PropertyInterest {
  property_types: PropertyType[];
  budget_range: {
    min: number;
    max: number;
    currency: 'BRL' | 'USD' | 'EUR';
  };
  preferred_locations: string[];
  must_have_features: string[];
  nice_to_have_features?: string[];
  timeline: 'immediate' | '3_months' | '6_months' | '1_year' | 'flexible';
}

export interface PropertyViewing {
  id?: number;
  property_id?: string;
  scheduled_date: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  agent_id: number;
  lead_id: number;
  notes?: string;
  feedback?: PropertyViewingFeedback;
}

export interface PropertyViewingFeedback {
  rating: 1 | 2 | 3 | 4 | 5;
  liked_features: string[];
  concerns: string[];
  interest_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  next_steps: string;
}

// Dashboard metrics specific to real estate
export interface RealEstateDashboardMetrics {
  total_leads: number;
  qualified_leads: number;
  scheduled_viewings: number;
  completed_viewings: number;
  active_negotiations: number;
  closed_deals_this_month: number;
  total_sales_volume: number;
  average_deal_size: number;
  conversion_rate: number;
  avg_time_to_close: number; // in days
  top_performing_agents: AgentPerformance[];
  hot_properties: PropertyPerformance[];
}

export interface AgentPerformance {
  agent_id: number;
  agent_name: string;
  leads_this_month: number;
  viewings_this_month: number;
  deals_closed: number;
  sales_volume: number;
  conversion_rate: number;
}

export interface PropertyPerformance {
  property_id: string;
  property_address: string;
  inquiries: number;
  viewings: number;
  offers_received: number;
  days_on_market: number;
}

// Message types for real estate context
export type RealEstateMessageType = 
  | 'property_inquiry'
  | 'viewing_request' 
  | 'price_negotiation'
  | 'document_request'
  | 'financing_question'
  | 'general_question'
  | 'follow_up'
  | 'property_recommendation';

export interface RealEstateMessage extends ChatMessage {
  message_type?: RealEstateMessageType;
  property_reference?: string;
  action_required?: boolean;
  priority?: 'low' | 'medium' | 'high';
}