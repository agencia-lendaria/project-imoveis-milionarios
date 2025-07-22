import { supabase } from '../config/supabaseClient';
import { TABLE_NAMES, RPC_FUNCTIONS } from '../config/tables';
import type { 
  ChatMessage, 
  ConversationWithLeadInfo, 
  AgentInfo 
} from '../types/realEstate';

export class ChatService {
  /**
   * Buscar conversas com informações de lead usando RPC otimizada (com fallback)
   */
  static async getConversationsWithLeadInfo(senderFilter?: string): Promise<ConversationWithLeadInfo[]> {
    try {
      console.log('🔄 Tentando buscar conversas com lead info via RPC...');
      
      // Tentar usar a função RPC primeiro
      const { data: rpcData, error: rpcError } = await supabase
        .rpc(RPC_FUNCTIONS.GET_CONVERSATIONS_OVERVIEW, {
          sender_filter: senderFilter || null
        });

      if (!rpcError && rpcData) {
        console.log('✅ Conversas encontradas via RPC:', rpcData.length);
        return rpcData;
      }

      console.log('⚠️ RPC não disponível, usando fallback tradicional...');
      
      // Fallback: usar queries tradicionais
      return await this.getConversationsWithLeadInfoFallback(senderFilter);
    } catch (error) {
      console.error('❌ Erro no RPC, tentando fallback:', error);
      return await this.getConversationsWithLeadInfoFallback(senderFilter);
    }
  }

  /**
   * Fallback para buscar conversas sem RPC
   */
  private static async getConversationsWithLeadInfoFallback(senderFilter?: string): Promise<ConversationWithLeadInfo[]> {
    try {
      console.log('🔄 Buscando conversas via fallback...');
      
      // Construir query base
      let query = supabase
        .from(TABLE_NAMES.CHAT_HISTORIES)
        .select('session_id, created_at, sender')
        .order('created_at', { ascending: false });

      // Aplicar filtro de sender se selecionado
      if (senderFilter) {
        query = query.eq('sender', senderFilter);
      }

      const { data: chatData, error: chatError } = await query;
      if (chatError) throw chatError;

      // Agrupar por session_id
      const sessionMap = new Map<string, {
        session_id: string;
        sender: string;
        last_message_date: string;
        message_count: number;
      }>();
      
      chatData?.forEach(item => {
        const sessionId = item.session_id;
        
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, {
            session_id: sessionId,
            sender: item.sender,
            last_message_date: item.created_at,
            message_count: 1
          });
        } else {
          const session = sessionMap.get(sessionId)!;
          session.message_count++;
          if (new Date(item.created_at) > new Date(session.last_message_date)) {
            session.last_message_date = item.created_at;
          }
        }
      });

      const uniqueSessions = Array.from(sessionMap.values())
        .sort((a, b) => new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime());

      // Buscar dados de lead
      if (uniqueSessions.length > 0) {
        const phoneIds = uniqueSessions.map(s => s.session_id);
        const { data: leadData, error: leadError } = await supabase
          .from(TABLE_NAMES.LEAD_MANAGEMENT)
          .select('phone_id, name, email, lead_scoring, crm_deal_stage_id, is_ai_enabled, lead_conversation_status, last_message_data, instance_name')
          .in('phone_id', phoneIds);

        if (leadError) {
          console.error('❌ Erro ao buscar dados de lead:', leadError);
        }

        // Combinar dados
        return uniqueSessions.map(session => ({
          session_id: session.session_id,
          sender: session.sender,
          last_message_date: session.last_message_date,
          message_count: session.message_count,
          lead_name: leadData?.find(l => l.phone_id === session.session_id)?.name || 'Sem nome',
          lead_phone_id: session.session_id,
          lead_scoring: leadData?.find(l => l.phone_id === session.session_id)?.lead_scoring,
          crm_deal_stage_id: leadData?.find(l => l.phone_id === session.session_id)?.crm_deal_stage_id,
          is_ai_enabled: leadData?.find(l => l.phone_id === session.session_id)?.is_ai_enabled ?? true,
          lead_conversation_status: leadData?.find(l => l.phone_id === session.session_id)?.lead_conversation_status,
          last_message_data: leadData?.find(l => l.phone_id === session.session_id)?.last_message_data,
          instance_name: leadData?.find(l => l.phone_id === session.session_id)?.instance_name,
          manychat_id: null,
          manychat_data: null
        }));
      }

      return [];
    } catch (error) {
      console.error('❌ Erro no fallback:', error);
      throw error;
    }
  }

  /**
   * Buscar mensagens de uma conversa específica (com fallback)
   */
  static async getMessagesBySession(sessionId: string, senderFilter?: string): Promise<ChatMessage[]> {
    try {
      console.log('🔄 Tentando buscar mensagens via RPC...');
      
      // Tentar usar a função RPC primeiro
      const { data: rpcData, error: rpcError } = await supabase
        .rpc(RPC_FUNCTIONS.GET_CHAT_MESSAGES_WITH_PAGINATION, {
          p_session_id: sessionId,
          p_sender_filter: senderFilter || null,
          p_limit: 1000,
          p_offset: 0
        });

      if (!rpcError && rpcData) {
        console.log('✅ Mensagens encontradas via RPC:', rpcData.length);
        return rpcData;
      }

      console.log('⚠️ RPC não disponível, usando fallback tradicional...');
      
      // Fallback: usar queries tradicionais
      let query = supabase
        .from(TABLE_NAMES.CHAT_HISTORIES)
        .select('*')
        .eq('session_id', sessionId);

      if (senderFilter) {
        query = query.eq('sender', senderFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar mensagens:', error);
        throw new Error(`Erro ao buscar mensagens: ${error.message}`);
      }

      console.log('✅ Mensagens encontradas via fallback:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro no ChatService.getMessagesBySession:', error);
      throw error;
    }
  }

  /**
   * Buscar contagem de conversas por sender (com fallback)
   */
  static async getConversationCountBySender(): Promise<AgentInfo[]> {
    try {
      console.log('🔄 Tentando buscar contagem por sender via RPC...');
      
      // Tentar usar a função RPC primeiro
      const { data: rpcData, error: rpcError } = await supabase
        .rpc(RPC_FUNCTIONS.GET_CHAT_OVERVIEW);

      if (!rpcError && rpcData) {
        console.log('✅ Senders encontrados via RPC:', rpcData.length);
        return rpcData.map((item: any) => ({
          sender: item.sender,
          conversation_count: Number(item.conversation_count)
        }));
      }

      console.log('⚠️ RPC não disponível, usando fallback tradicional...');
      
      // Fallback: usar queries tradicionais
      const { data, error } = await supabase
        .from(TABLE_NAMES.CHAT_HISTORIES)
        .select('sender, session_id')
        .not('sender', 'is', null);

      if (error) throw error;

      // Agrupar por sender e contar conversas únicas
      const senderMap = new Map<string, Set<string>>();
      
      data?.forEach(item => {
        if (!senderMap.has(item.sender)) {
          senderMap.set(item.sender, new Set());
        }
        senderMap.get(item.sender)!.add(item.session_id);
      });

      const senderList = Array.from(senderMap.entries())
        .map(([sender, sessions]) => ({
          sender,
          conversation_count: sessions.size
        }))
        .sort((a, b) => b.conversation_count - a.conversation_count);

      console.log('✅ Senders encontrados via fallback:', senderList.length);
      return senderList;
    } catch (error) {
      console.error('❌ Erro no ChatService.getConversationCountBySender:', error);
      throw error;
    }
  }

  /**
   * Atualizar status da IA (com fallback)
   */
  static async updateAIStatus(phoneId: string, newStatus: boolean): Promise<boolean> {
    try {
      console.log('🔄 Tentando atualizar status da IA via RPC...');
      
      // Tentar usar a função RPC primeiro
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('update_ai_status', {
          phone_id_param: phoneId,
          new_status: newStatus
        });

      if (!rpcError) {
        console.log('✅ Status da IA atualizado via RPC:', rpcData);
        return true;
      }

      console.log('⚠️ RPC não disponível, usando fallback tradicional...');
      
      // Fallback: usar update tradicional
      const { error } = await supabase
        .from('imoveis_milionarios_lead_management')
        .update({ is_ai_enabled: newStatus })
        .eq('phone_id', phoneId);

      if (error) {
        console.error('❌ Erro ao atualizar status da IA:', error);
        throw new Error(`Erro ao atualizar status da IA: ${error.message}`);
      }

      console.log('✅ Status da IA atualizado via fallback');
      return true;
    } catch (error) {
      console.error('❌ Erro no ChatService.updateAIStatus:', error);
      throw error;
    }
  }

  /**
   * Buscar estatísticas gerais (com fallback)
   */
  static async getGeneralStats() {
    try {
      console.log('🔄 Tentando buscar estatísticas via RPC...');
      
      // Tentar usar a função RPC primeiro
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_general_stats');

      if (!rpcError && rpcData) {
        console.log('✅ Estatísticas obtidas via RPC:', rpcData[0] || {});
        return rpcData[0] || null;
      }

      console.log('⚠️ RPC não disponível, usando fallback tradicional...');
      
      // Fallback: calcular estatísticas manualmente
      const { data, error } = await supabase
        .from(TABLE_NAMES.CHAT_HISTORIES)
        .select('session_id, sender, created_at');

      if (error) throw error;

      const uniqueSessions = new Set(data?.map(item => item.session_id) || []);
      const uniqueSenders = new Set(data?.map(item => item.sender).filter(Boolean) || []);

      const stats = {
        total_messages: data?.length || 0,
        total_conversations: uniqueSessions.size,
        total_senders: uniqueSenders.size,
        date_range_start: data?.length ? Math.min(...data.map(item => new Date(item.created_at).getTime())) : null,
        date_range_end: data?.length ? Math.max(...data.map(item => new Date(item.created_at).getTime())) : null
      };

      console.log('✅ Estatísticas calculadas via fallback:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro no ChatService.getGeneralStats:', error);
      throw error;
    }
  }


  /**
   * Enviar mensagem para Evolution API
   */
  static async sendToEvolution(phoneId: string, message: string, images: File[] = []): Promise<any> {
    try {
      console.log('🔄 Enviando mensagem para Evolution API...');
      
      const formData = new FormData();
      formData.append('phoneId', phoneId);
      formData.append('message', message);
      
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      const response = await fetch('/api/send-message', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Mensagem enviada via Evolution API:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro no ChatService.sendToEvolution:', error);
      throw error;
    }
  }

  /**
   * Enviar mensagem para ManyChat
   */
  static async sendToManyChat(message: string, manychatId: string, manychatData: any): Promise<any> {
    try {
      console.log('🔄 Enviando mensagem para ManyChat...');
      
      const response = await fetch('/api/send-manychat-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          manychatId,
          manychatData
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Mensagem enviada via ManyChat:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro no ChatService.sendToManyChat:', error);
      throw error;
    }
  }
} 