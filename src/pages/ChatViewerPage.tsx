import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';
import type { ChatMessage } from '../types/realEstate';
import { formatGMT0ToBrazilianTime, isAudioMessage, isTranscriptionMessage, isAudioErrorMessage, getMediaMessageType, extractTranscriptionText } from '../utils/dateUtils';
import { imageFileToBase64, isValidImageFile } from '../utils/imageUtils';
import { Search, ChevronLeft, ChevronRight, Bot, User, Mic, MessageSquare, Users, Power, Send, Loader2, Image as ImageIcon, Paperclip, X, Filter, Eye, Clock, LogOut, Key, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ImagePreview from '../components/common/ImagePreview';
import ImageMessage from '../components/common/ImageMessage';
import AudioMessage from '../components/common/AudioMessage';
import DocumentMessage from '../components/common/DocumentMessage';
import VideoMessage from '../components/common/VideoMessage';
import ChangePasswordForm from '../components/auth/ChangePasswordForm';
import { useAuth } from '../hooks/useAuth';
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import { ChatService, ConversationWithLeadInfo, ChatMessage as ServiceChatMessage } from '../services/chatService';
import { Header } from '../components/duomo';
// import { IlluminatedSign, ItalianFlag } from '../components/milano';

// ✅ SISTEMA MIGRADO PARA IMOVEIS MILIONÁRIOS
// - Sistema de corretores: imoveis_milionarios_sdr_seller
// - Sistema de leitura: imoveis_milionarios_conversation_reads
// - Contexto: Sistema para gerenciamento de leads imobiliários de luxo

interface RealEstateAgent {
  id: number;
  name: string;
  specialization: string; // Especialização do corretor (imóveis de luxo, comercial, etc.)
  avatar_url?: string;
  is_active: boolean;
  creci_number?: string;
}

interface ReadStatus {
  agent_id: number;
  agent_name: string;
  last_read_at: string;
  read_count: number;
  is_currently_viewing: boolean;
}

interface ConversationReadInfo {
  phone_id: string;
  read_by: ReadStatus[];
  unread_count: number;
  last_message_id: number;
  is_unread_for_current_user: boolean;
}

interface ClientInfo {
  name: string;
  phone_id: string;
  lead_scoring?: string;
  crm_deal_stage_id?: string;
  is_ai_enabled?: boolean;
  lead_conversation_status?: 'new' | 'contacted' | 'qualified' | 'viewing_scheduled' | 'viewing_completed' | 'negotiating' | 'proposal_sent' | 'closed_won' | 'closed_lost' | 'nurturing';
  read_info?: ConversationReadInfo;
  last_message_data?: {
    created_at: string;
  };
  // Campos para integração com sistemas externos
  instance_name?: string;
  manychat_id?: string;
  manychat_data?: any;
  // Campos específicos para imóveis
  budget_range?: string;
  property_type_preference?: string;
  preferred_locations?: string[];
}

interface ChatSession {
  session_id: string;
  last_message_date: string;
  message_count: number;
  sender?: string; // Adicionar sender info
}

interface SourceInfo {
  sender: string;
  count: number;
  label: string;
}

const ChatViewerPage: React.FC = () => {
  const { signOut, user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSender, setSelectedSender] = useState<string>(''); // Filtro por origem do lead
  const [availableSenders, setAvailableSenders] = useState<SourceInfo[]>([]); // Lista de origens disponíveis
  const [clientInfo, setClientInfo] = useState<Record<string, ClientInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  
  // ESTADOS PARA CORRETORES IMOBILIÁRIOS
  const [currentAgent, setCurrentAgent] = useState<RealEstateAgent | null>(null);
  const [availableAgents, setAvailableAgents] = useState<RealEstateAgent[]>([]);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [agentSearchTerm, setAgentSearchTerm] = useState('');
  const [conversationReadInfo, setConversationReadInfo] = useState<Record<string, ConversationReadInfo>>({});
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  
  // Estados para métricas simples
  const [totalConversations, setTotalConversations] = useState(0);
  
  // Estados para novas métricas
  const [rejectedPostTrigger, setRejectedPostTrigger] = useState(0);
  
  // Refs para controlar scroll
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollToBottomRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Refs para controlar realtime e polling
  const realtimeChannelRef = useRef<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const sessionsPerPage = 10;

  // Função para logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      clearReadStatusCache(); // Limpar cache antes do logout
      await signOut();
      // O AuthProvider irá automaticamente redirecionar para login
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      setIsLoggingOut(false);
    }
  };

  // Função para abrir modal de mudança de senha
  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  // Função para fechar modal de mudança de senha
  const handleCloseChangePassword = () => {
    setIsChangePasswordModalOpen(false);
  };

  // Função para rolar para o final
  const scrollToBottom = () => {
    if (messagesContainerRef.current && shouldScrollToBottomRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Função para detectar se está no final da conversa
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px de tolerância
      shouldScrollToBottomRef.current = isAtBottom;
    }
  };

  // Função para atualizar sessões quando há nova mensagem
  const updateSessionsOnNewMessage = (sessionId: string) => {
    setSessions(prev => {
      const updatedSessions = prev.map(session => {
        if (session.session_id === sessionId) {
          return {
            ...session,
            message_count: session.message_count + 1,
            last_message_date: new Date().toISOString()
          };
        }
        return session;
      });
      
      // Reordenar por data da última mensagem
      return updatedSessions.sort((a, b) => 
        new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime()
      );
    });
  };

  // Configurar Supabase Realtime
  useEffect(() => {
    console.log('🔄 Configurando Supabase Realtime...');
    
    const channel = supabase
      .channel('chat_messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'pipiolo_sdr_chat_histories' 
        },
        (payload) => {
          console.log('📨 Nova mensagem recebida via Realtime:', payload);
          
          const newMessage = payload.new as ChatMessage;
          
          // Se a mensagem é da sessão atualmente selecionada, adicionar às mensagens
          if (selectedSession && newMessage.session_id === selectedSession) {
            setMessages(prev => {
              // Verificar se a mensagem já existe para evitar duplicatas
              const messageExists = prev.some(msg => msg.id === newMessage.id);
              if (!messageExists) {
                console.log('✅ Adicionando nova mensagem à conversa atual');
                shouldScrollToBottomRef.current = true; // Forçar scroll para baixo
                return [...prev, newMessage];
              }
              return prev;
            });
          }
          
          // Atualizar a lista de sessões
          updateSessionsOnNewMessage(newMessage.session_id);
        }
      )
      .subscribe((status) => {
        console.log('📡 Status do Realtime:', status);
      });

    realtimeChannelRef.current = channel;

    // Cleanup function
    return () => {
      console.log('🔌 Desconectando Realtime...');
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [selectedSession]); // Dependência do selectedSession para recriar o listener

  // Configurar Polling Automático
  useEffect(() => {
    if (selectedSession) {
      console.log('⏰ Iniciando polling automático para sessão:', selectedSession);
      
      // Limpar interval anterior se existir
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Configurar novo interval
      pollingIntervalRef.current = setInterval(() => {
        console.log('🔄 Executando polling automático...');
        fetchMessages(true); // preserveScroll = true
      }, 5000); // A cada 5 segundos
    }

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        console.log('⏹️ Parando polling automático');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [selectedSession]);

  // Cleanup geral quando o componente é desmontado
  useEffect(() => {
    return () => {
      // Limpar realtime
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
      
      // Limpar polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // 🚀 HOOK OTIMIZADO: Buscar senders usando RPC (mais eficiente)
  const {
    execute: fetchAvailableSenders,
    isLoading: isLoadingSenders,
    error: sendersError
  } = useAsyncOperation(
    async () => {
      const senderData = await ChatService.getConversationCountBySender();
      return senderData.map(item => ({
        sender: item.sender,
        count: item.conversation_count,
        label: `${item.sender} (${item.conversation_count} conversas)`
      }));
    },
    {
      onSuccess: (senderList: SenderInfo[]) => {
        setAvailableSenders(senderList);
        
        // Calcular total de conversas
        const totalConversations = senderList.reduce((sum: number, sender: SenderInfo) => sum + sender.count, 0);
        setTotalConversations(totalConversations);
        
        console.log('✅ Senders encontrados:', senderList.map((s: SenderInfo) => `${s.sender}: ${s.count}`));
      },
      onError: (error) => {
        console.error('❌ Erro ao buscar senders:', error);
      }
    }
  );

  // 🚀 HOOK OTIMIZADO: Buscar métricas aprimoradas do dashboard
  const {
    execute: fetchDashboardMetrics
  } = useAsyncOperation(
    async () => {
      const metrics = await ChatService.getEnhancedDashboardMetrics();
      return metrics;
    },
    {
      onSuccess: (metrics) => {
        setRejectedPostTrigger(metrics.rejected_post_trigger);
        console.log('✅ Métricas aprimoradas do dashboard obtidas:', metrics);
      },
      onError: (error) => {
        console.error('❌ Erro ao buscar métricas aprimoradas do dashboard:', error);
        setRejectedPostTrigger(0);
      }
    }
  );

  // 🚀 HOOK OTIMIZADO: Buscar conversas com lead info usando RPC
  const {
    execute: fetchSessionsWithLeadInfo,
    isLoading: isLoadingConversations,
    error: conversationsError
  } = useAsyncOperation(
    async () => {
      const conversations = await ChatService.getConversationsWithLeadInfo(selectedSender || undefined);
      return conversations;
    },
    {
      onSuccess: (conversations: ConversationWithLeadInfo[]) => {
        // Converter para formato esperado pelo estado atual
        const sessionsData = conversations.map(conv => ({
          session_id: conv.session_id,
          last_message_date: conv.last_message_date,
          message_count: conv.message_count,
          sender: conv.sender
        }));
        
        const leadData: Record<string, LeadInfo> = {};
        conversations.forEach(conv => {
          leadData[conv.session_id] = {
            name: conv.lead_name,
            phone_id: conv.lead_phone_id,
            lead_scoring: conv.lead_scoring,
            crm_deal_stage_id: conv.crm_deal_stage_id,
            is_ai_enabled: conv.is_ai_enabled,
            lead_conversation_status: conv.lead_conversation_status as 'rejected' | 'accepted' | 'proceeded',
            last_message_data: conv.last_message_data,
            instance_name: conv.instance_name,
            manychat_id: conv.manychat_id,
            manychat_data: conv.manychat_data
          };
        });
        
        setSessions(sessionsData);
        setClientInfo(leadData);
        
        console.log(`📊 Conversas com lead info (${selectedSender ? `filtro: ${selectedSender}` : 'sem filtro'}):`, conversations.length);
      },
      onError: (error) => {
        console.error('❌ Erro ao buscar conversas com lead info:', error);
      }
    }
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Buscar senders disponíveis primeiro
        await fetchAvailableSenders();
        
        // Buscar métricas do dashboard
        await fetchDashboardMetrics();
        
        // Buscar conversas com lead info
        await fetchSessionsWithLeadInfo();
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSender]); // Adicionar selectedSender como dependência

  // 🚀 HOOK OTIMIZADO: Buscar mensagens usando RPC
  const {
    execute: executeGetMessages,
    isLoading: isLoadingMessagesHook,
    error: messagesError
  } = useAsyncOperation(
    async (sessionId: string, senderFilter?: string) => {
      const messages = await ChatService.getMessagesBySession(sessionId, senderFilter);
      return messages;
    },
    {
      onSuccess: (newMessages: ServiceChatMessage[], { preserveScroll }: { preserveScroll?: boolean } = {}) => {
        // Verificar se há novas mensagens antes de atualizar
        setMessages(prev => {
          // Se for um refresh automático e não há mudanças, não atualizar
          if (preserveScroll && prev.length === newMessages.length) {
            return prev;
          }
          return newMessages as ChatMessage[];
        });
        
        // Controlar scroll
        setTimeout(() => {
          if (preserveScroll && messagesContainerRef.current) {
            // Manter posição atual do scroll
          } else {
            scrollToBottom();
          }
        }, 100);
      },
      onError: (error) => {
        console.error('❌ Erro ao buscar mensagens:', error);
        setMessages([]);
      }
    }
  );

  const fetchMessages = async (preserveScroll = false) => {
    if (!selectedSession) {
      setMessages([]);
      return;
    }

    // Não mostrar loading se for um refresh automático
    if (!preserveScroll) {
      setIsLoadingMessages(true);
    }
    
    // Salvar posição do scroll se necessário
    let scrollPosition = 0;
    if (preserveScroll && messagesContainerRef.current) {
      scrollPosition = messagesContainerRef.current.scrollTop;
    }

    try {
      await executeGetMessages(selectedSession, selectedSender || undefined);
      
      // Restaurar posição do scroll se necessário
      if (preserveScroll && messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = scrollPosition;
      }
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
    } finally {
      if (!preserveScroll) {
        setIsLoadingMessages(false);
      }
    }
  };

  useEffect(() => {
    // Sempre rolar para o final ao trocar de sessão
    shouldScrollToBottomRef.current = true;
    fetchMessages();
  }, [selectedSession, selectedSender]); // Adicionar selectedSender como dependência

  // Scroll para o final quando novas mensagens chegam
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🚀 HOOK OTIMIZADO: Atualizar status da IA usando RPC
  const {
    execute: executeUpdateAIStatus,
    isLoading: isUpdatingAI,
    error: updateAIError
  } = useAsyncOperation(
    async (phoneId: string, newStatus: boolean) => {
      const success = await ChatService.updateAIStatus(phoneId, newStatus);
      return { phoneId, newStatus, success };
    },
    {
      onSuccess: ({ phoneId, newStatus, success }) => {
        if (success) {
          // Update local state
          setClientInfo(prev => ({
            ...prev,
            [phoneId]: {
              ...prev[phoneId],
              is_ai_enabled: newStatus
            }
          }));
          
          console.log(`IA ${newStatus ? 'ativada' : 'desativada'} para o lead ${phoneId}`);
        } else {
          throw new Error('Falha ao atualizar status da IA');
        }
      },
      onError: (error) => {
        console.error('❌ Erro ao atualizar status da IA:', error);
        alert('Erro ao atualizar status da IA. Tente novamente.');
      }
    }
  );

  const toggleAIStatus = async (phoneId: string) => {
    if (isUpdatingAI) return;
    
    const currentStatus = clientInfo[phoneId]?.is_ai_enabled ?? true;
    const newStatus = !currentStatus;
    
    await executeUpdateAIStatus(phoneId, newStatus);
  };

  // Função para lidar com seleção de imagens
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => isValidImageFile(file));
    
    if (imageFiles.length !== files.length) {
      alert('Apenas arquivos de imagem são permitidos (JPEG, PNG, GIF, WebP).');
    }
    
    // Limitar a 5 imagens por vez
    if (selectedImages.length + imageFiles.length > 5) {
      alert('Máximo de 5 imagens por mensagem.');
      return;
    }
    
    setSelectedImages(prev => [...prev, ...imageFiles]);
    
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (event.target) {
      event.target.value = '';
    }
  };

  // Função para remover imagem selecionada
  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ SISTEMA DUAL DE WEBHOOKS - NOVAS FUNÇÕES

  // Função para verificar o tipo de instância e buscar dados do ManyChat
  const checkInstanceType = async (phoneId: string) => {
    try {
          const { data, error } = await supabase
      .from('pipiolo_sdr_lead_management')
      .select('instance_name, manychat_id, manychat_data')
      .eq('phone_id', phoneId)
      .single();

      if (error) {
        console.error('❌ Erro ao buscar dados da instância:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Erro na verificação do tipo de instância:', error);
      return null;
    }
  };

  // Função para enviar mensagem para o webhook ManyChat/N8N
  const sendToManyChat = async (message: string, manychatId: string, manychatData: any) => {
    try {
      console.log('📤 Enviando mensagem para ManyChat via N8N...');

      if (!manychatId) {
        throw new Error('manychat_id é obrigatório para envio via ManyChat');
      }

      const payload = {
        ai_message: message,
        manychat_id: manychatId,
        manychat: manychatData || {}
      };

      const response = await fetch('https://n8n-n8n.pzgynv.easypanel.host/webhook/ia-allisson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API N8N: ${response.status} - ${errorText}`);
      }

      console.log('✅ Mensagem enviada com sucesso para ManyChat');
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar para ManyChat:', error);
      throw error;
    }
  };

  // Função para enviar mensagem via Evolution API (comportamento atual)
  const sendToEvolution = async (phoneId: string, message: string, images: File[] = []) => {
    try {
      console.log('📤 Enviando mensagem via Evolution API...');

      if (images.length > 0) {
        // Para múltiplas imagens, enviar uma por vez
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const caption = i === 0 && message.trim() ? message.trim() : undefined;
          
          // ✅ CORRIGIDO: Usar diretamente o resultado da função (já retorna base64 limpo)
          const base64Data = await imageFileToBase64(file);
          
          // ✅ ESTRUTURA CORRETA: Campos diretos, não aninhados
          const mediaPayload = {
            number: phoneId,
            mediatype: "image",
            mimetype: file.type, // ✅ ADICIONADO: mimetype obrigatório
            caption: caption || "", // ✅ Campo opcional
            media: base64Data, // ✅ CORRETO: Base64 sem prefixo
            fileName: file.name // ✅ ADICIONADO: fileName obrigatório
          };

          const response = await fetch('https://evolution-ops.agencialendaria.ai/message/sendMedia/sdr_pipiolo_119867', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'EAAJsUfD8wKYBOyqTveYqUZCbZCYwqneFBEfjZAJT9MfYzgSZABONr89cc5foZA0epEV3szT7FbNXIrpN4ReeEifmH8vakeNpMZBUUfuHGkKgLfBcXeTwGuC1dM7wwhlhSeUCYsV8KSHbl4A3Tm7PMwDxXAIF5yLg9VnwAy2quQQZB6fNtZBEWyOe8vmzQQ5ZCsZBinhQZDZD'
            },
            body: JSON.stringify(mediaPayload)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API Evolution: ${response.status} - ${errorText}`);
          }
          
          console.log(`✅ Imagem ${i + 1} enviada com sucesso via Evolution`);
        }
      } else if (message.trim()) {
        // Enviar apenas texto
        const textPayload = {
          number: phoneId,
          text: message.trim()
        };
        
        const response = await fetch('https://evolution-ops.agencialendaria.ai/message/sendText/sdr_pipiolo_119867', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'EAAJsUfD8wKYBOyqTveYqUZCbZCYwqneFBEfjZAJT9MfYzgSZABONr89cc5foZA0epEV3szT7FbNXIrpN4ReeEifmH8vakeNpMZBUUfuHGkKgLfBcXeTwGuC1dM7wwhlhSeUCYsV8KSHbl4A3Tm7PMwDxXAIF5yLg9VnwAy2quQQZB6fNtZBEWyOe8vmzQQ5ZCsZBinhQZDZD'
          },
          body: JSON.stringify(textPayload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro na API Evolution: ${response.status} - ${errorText}`);
        }

        console.log('✅ Mensagem de texto enviada com sucesso via Evolution');
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar via Evolution:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if ((!messageText.trim() && selectedImages.length === 0) || isSending || !selectedSession) return;

    setIsSending(true);
    
    // Declare tempMessage outside the try block to ensure it's accessible in catch
    let tempMessage: ChatMessage | null = null;
    
    try {
      // Preparar conteúdo da mensagem
      let messageContent = messageText.trim();
      
      // Se há imagens, processar cada uma
      if (selectedImages.length > 0) {
        console.log('Convertendo imagens para Base64...');
        
        const imageData = await Promise.all(
          selectedImages.map(async (file) => {
            const base64 = await imageFileToBase64(file);
            return {
              base64,
              fileName: file.name,
              mimeType: file.type,
              caption: messageContent || undefined
            };
          })
        );
        
        // Se há texto, manter o texto + dados das imagens
        // Se não há texto, apenas os dados das imagens
        messageContent = messageContent ? 
          `${messageContent}\n\n[IMAGES]${JSON.stringify({ images: imageData })}` :
          `[IMAGES]${JSON.stringify({ images: imageData })}`;
      }

      // Create a temporary message to show immediately in the chat
      tempMessage = {
        id: Date.now(), // Temporary ID
        session_id: selectedSession,
        message: {
          type: 'ai',
          content: messageContent,
        },
        created_at: new Date().toISOString()
      };

      // Add the temporary message to the chat immediately
      setMessages(prev => [...prev, tempMessage!]);
      
      // Clear the input fields immediately for better UX
      const messageToSend = messageContent;
      const imagesToSend = [...selectedImages];
      setMessageText('');
      setSelectedImages([]);

      // 1. First, save the message to the database
      const messageData = {
        session_id: selectedSession,
        message: {
          type: 'ai',
          content: messageToSend,
          additional_kwargs: {},
          response_metadata: {},
          tool_calls: [],
          invalid_tool_calls: []
        },
        created_at: new Date().toISOString(),
        sender: selectedSender || null // Incluir sender se selecionado
      };

      const { error: dbError } = await supabase
        .from('pipiolo_sdr_chat_histories')
        .insert([messageData]);

      if (dbError) {
        console.error('Error saving message to database:', dbError);
        throw new Error('Falha ao salvar mensagem no banco de dados');
      }

      // 2. ✅ SISTEMA DUAL DE WEBHOOKS: Verificar tipo de instância e enviar adequadamente
      console.log('🔍 Verificando tipo de instância para:', selectedSession);
      
      const instanceData = await checkInstanceType(selectedSession);
      const isManyChat = instanceData?.instance_name === 'manychat';
      
      if (isManyChat) {
        console.log('🎯 Detectado ManyChat - enviando via N8N');
        
        // Validar se há imagens (ManyChat não suporta ainda)
        if (imagesToSend.length > 0) {
          throw new Error('Envio de imagens via ManyChat ainda não está implementado. Use apenas texto.');
        }
        
        // Validar dados obrigatórios do ManyChat
        if (!instanceData.manychat_id) {
          throw new Error('manychat_id não encontrado para esta conversa ManyChat');
        }
        
        // Enviar para ManyChat via N8N
        await sendToManyChat(
          messageToSend,
          instanceData.manychat_id,
          instanceData.manychat_data
        );
      } else {
        console.log('🎯 Instância padrão - enviando via Evolution API');
        
        // Enviar via Evolution API (comportamento padrão)
        await sendToEvolution(selectedSession, messageToSend, imagesToSend);
      }

      // Show success feedback
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successDiv.textContent = 'Mensagem enviada com sucesso!';
      document.body.appendChild(successDiv);
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);
      
      // Update sessions list to reflect new message count and date
      updateSessionsOnNewMessage(selectedSession);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // ✅ FALLBACK PARA MANYCHAT: Se falhou com ManyChat, tentar Evolution como fallback
      let fallbackSucceeded = false;
      
      // Verificar se o erro foi relacionado ao ManyChat e se podemos fazer fallback
      if (error instanceof Error && 
          (error.message.includes('ManyChat') || error.message.includes('N8N')) &&
          selectedImages.length === 0) { // Só fazer fallback se não há imagens
        
        console.log('⚠️ Erro no ManyChat - tentando fallback para Evolution API...');
        
        try {
          const messageToSend = messageText.trim();
          await sendToEvolution(selectedSession!, messageToSend, []);
          fallbackSucceeded = true;
          
          console.log('✅ Fallback para Evolution API realizado com sucesso');
          
          // Mostrar aviso de fallback
          const fallbackDiv = document.createElement('div');
          fallbackDiv.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-md';
          fallbackDiv.textContent = 'Mensagem enviada via fallback (Evolution API)';
          document.body.appendChild(fallbackDiv);
          setTimeout(() => {
            if (document.body.contains(fallbackDiv)) {
              document.body.removeChild(fallbackDiv);
            }
          }, 4000);
          
        } catch (fallbackError) {
          console.error('❌ Fallback também falhou:', fallbackError);
          fallbackSucceeded = false;
        }
      }
      
      // Se o fallback não funcionou ou não foi aplicável, mostrar erro
      if (!fallbackSucceeded) {
        // Remove the temporary message on error (only if tempMessage was created)
        if (tempMessage) {
          setMessages(prev => prev.filter(msg => msg.id !== tempMessage!.id));
        }
        
        // Restore the message text and images so user can try again
        setMessageText(messageText);
        setSelectedImages(selectedImages);
        
        // Show error feedback with more specific messages
        let errorMessage = 'Erro ao enviar mensagem';
        if (error instanceof Error) {
          if (error.message.includes('API:') || error.message.includes('Evolution')) {
            errorMessage = 'Erro na API do WhatsApp. Verifique sua conexão.';
          } else if (error.message.includes('N8N') || error.message.includes('ManyChat')) {
            errorMessage = 'Erro na integração ManyChat. Tente novamente.';
          } else if (error.message.includes('Base64') || error.message.includes('imagem')) {
            errorMessage = 'Erro ao processar imagem. Tente uma imagem menor.';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Erro de conexão. Verifique sua internet.';
          } else {
            errorMessage = error.message;
          }
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-md';
        errorDiv.textContent = errorMessage;
        document.body.appendChild(errorDiv);
        setTimeout(() => {
          if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
          }
        }, 5000);
      } else {
        // Se o fallback funcionou, atualizar a sessão
        updateSessionsOnNewMessage(selectedSession!);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // FUNÇÃO PARA OBTER INDICADOR DE LEITURA (movida para cima para evitar erro de inicialização)
  const getReadIndicator = (phoneId: string) => {
    try {
      const readInfo = conversationReadInfo[phoneId];
      
      if (!readInfo || !currentAgent) {
        return {
          icon: '⚪',
          status: 'Nova conversa',
          isUnread: false,
          className: 'text-gray-500'
        };
      }

      if (readInfo.is_unread_for_current_user) {
        return {
          icon: '🔵',
          status: 'Não lida',
          isUnread: true,
          className: 'text-blue-600 font-bold'
        };
      }

      const currentUserRead = readInfo.read_by?.find(r => r.agent_id === currentAgent.id);
      const otherReaders = readInfo.read_by?.filter(r => r.agent_id !== currentAgent.id) || [];

      if (currentUserRead && otherReaders.length === 0) {
        return {
          icon: '✅',
          status: `Lida por você às ${formatTime(currentUserRead.last_read_at)}`,
          isUnread: false,
          className: 'text-green-600'
        };
      }

      if (otherReaders.length > 0) {
        const lastReader = otherReaders.sort((a, b) => 
          new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime()
        )[0];
        
        return {
          icon: '👥',
          status: `Lida por ${lastReader.agent_name} às ${formatTime(lastReader.last_read_at)}`,
          isUnread: false,
          className: 'text-blue-600'
        };
      }

      return {
        icon: '⚪',
        status: 'Lida',
        isUnread: false,
        className: 'text-gray-600'
      };
    } catch (error) {
      console.error('Erro em getReadIndicator:', error);
      return {
        icon: '⚪',
        status: 'Nova conversa',
        isUnread: false,
        className: 'text-gray-500'
      };
    }
  };

  // FUNÇÃO PARA FORMATAR TEMPO (movida para cima para ser usada em getReadIndicator)
  const formatTime = (dateString: string) => {
    try {
      if (!dateString) return '--:--';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--:--';
      
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Erro ao formatar tempo:', error);
      return '--:--';
    }
  };

  // ✅ CORREÇÃO APLICADA: Filtro aprimorado para incluir sender
  // Filter sessions based on search term, selected sender, and unread status
  const filteredSessions = sessions.filter(session => {
    try {
      const searchLower = searchTerm.toLowerCase();
      const lead = clientInfo[session.session_id];
      const matchesSearch = (
        session.session_id.toLowerCase().includes(searchLower) ||
        (lead?.name?.toLowerCase().includes(searchLower))
      );
      
      // ✅ CORREÇÃO: Filtro por sender (se selecionado)
      const matchesSender = selectedSender ? session.sender === selectedSender : true;
      
      // 🔍 NOVA CORREÇÃO: Quando "Todos os números", mostrar apenas conversas com dados de lead
      // Isso evita mostrar conversas órfãs sem nome
      const hasLeadData = selectedSender || clientInfo[session.session_id];
      
      // Filtro por status de leitura (apenas se vendedor estiver selecionado)
      if (showOnlyUnread && currentAgent) {
        const readIndicator = getReadIndicator(session.session_id);
        return matchesSearch && matchesSender && hasLeadData && readIndicator.isUnread;
      }
      
      return matchesSearch && matchesSender && hasLeadData;
    } catch (error) {
      console.error('Erro no filtro de sessões:', error);
      return true; // Em caso de erro, mostrar a sessão
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  const startIndex = (currentPage - 1) * sessionsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + sessionsPerPage);

  const formatPhoneId = (phoneId: string) => {
    const cleanPhone = phoneId.replace('@c.us', '').replace(/\D/g, '');
    if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
      const number = cleanPhone.substring(2);
      return number.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phoneId;
  };

  const formatLastMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  // New function to format message timestamps consistently
  const formatMessageTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreRange = (score: string): string => {
    const numScore = parseInt(score);
    if (numScore >= 1 && numScore <= 4) return 'cold';
    if (numScore >= 5 && numScore <= 7) return 'warm';
    if (numScore >= 8 && numScore <= 10) return 'hot';
    return '';
  };

  const getScoreEmoji = (score: string): string => {
    const range = getScoreRange(score);
    switch (range) {
      case 'cold': return '❄️ Frio';
      case 'warm': return '🌡️ Morno';
      case 'hot': return '🔥 Quente';
      default: return '';
    }
  };

  const getStatusEmoji = (status: string): string => {
    switch (status) {
      case 'in_progress': return '⏳ Em andamento';
      case 'scheduled': return '✅ Agendado';
      case 'not_qualified': return '🚫 Não Qualificado';
      default: return '';
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'in_progress':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'scheduled':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'not_qualified':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return '';
    }
  };

  const getScoreClass = (score: string): string => {
    const range = getScoreRange(score);
    switch (range) {
      case 'hot':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'warm':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'cold':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return '';
    }
  };

  const getBorderClass = (score: string): string => {
    const range = getScoreRange(score);
    switch (range) {
      case 'hot':
        return 'border-l-4 border-green-500';
      case 'warm':
        return 'border-l-4 border-amber-500';
      case 'cold':
        return 'border-l-4 border-red-500';
      default:
        return 'border-l-4 border-duomo-primary/30';
    }
  };

  const cleanMessageContent = (content: string): string => {
    if (!content) return '';
    
    // Remove XML tags like <text>, </text>, <audio>, </audio>, etc.
    return content
      .replace(/<\/?text>/g, '')
      .replace(/<\/?audio>/g, '')
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove any other XML/HTML tags
      .trim();
  };

  // Função para verificar se a mensagem contém imagens
  const hasImages = (content: string): boolean => {
    return content.includes('[IMAGES]');
  };

  // Função para extrair dados das imagens
  const extractImageData = (content: string) => {
    const imageMatch = content.match(/\[IMAGES\](.+)/);
    if (imageMatch) {
      try {
        return JSON.parse(imageMatch[1]);
      } catch (e) {
        console.error('Error parsing image data:', e);
        return null;
      }
    }
    return null;
  };

  // Função para extrair texto sem os dados das imagens
  const extractTextContent = (content: string): string => {
    return content.replace(/\[IMAGES\].+/, '').trim();
  };

  const renderMessageContent = (message: ChatMessage) => {
    const content = message.message?.content || '';
    const messageType = getMediaMessageType(content);
    const timestamp = formatGMT0ToBrazilianTime(message.created_at);
    
    switch (messageType) {
      case 'audio':
        return (
          <AudioMessage 
            transcription={extractTranscriptionText(content)}
            timestamp={timestamp}
          />
        );
      
      case 'transcription':
        return (
          <AudioMessage 
            transcription={extractTranscriptionText(content)}
            timestamp={timestamp}
          />
        );
      
      case 'audio-error':
        return (
          <AudioMessage 
            transcription={extractTranscriptionText(content)}
            isError={true}
            timestamp={timestamp}
          />
        );
      
      case 'image':
        const imageData = extractImageData(content);
        const textContent = extractTextContent(content);
        
        return (
          <div className="space-y-3">
            {textContent && (
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {textContent}
              </div>
            )}
            {imageData && imageData.images && (
              <div className="space-y-3">
                {imageData.images.map((img: any, index: number) => (
                  <ImageMessage
                    key={index}
                    imageUrl={`data:${img.mimeType};base64,${img.base64}`}
                    caption={img.caption}
                    fileName={img.fileName}
                    timestamp={timestamp}
                  />
                ))}
              </div>
            )}
          </div>
        );
      
      case 'video':
        // Para implementação futura de mensagens de vídeo
        return (
          <VideoMessage 
            fileName="video.mp4"
            timestamp={timestamp}
            caption={cleanMessageContent(content)}
          />
        );
      
      case 'document':
        // Para implementação futura de mensagens de documento
        return (
          <DocumentMessage 
            fileName="document.pdf"
            timestamp={timestamp}
            caption={cleanMessageContent(content)}
          />
        );
      
      case 'text':
      default:
        // Mensagem de texto normal
        const cleanContent = cleanMessageContent(content);
        return (
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {cleanContent}
          </div>
        );
    }
  };

  // Nova função para determinar as cores baseadas no status de conversação
  const getConversationStatusClass = (status?: string): string => {
    switch (status) {
      case 'rejected':
        return 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300';
      case 'rejected_post_trigger':
        return 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300';
      case 'accepted':
        return 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300';
      case 'waiting_human':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300';
      case 'proceeded':
      default:
        return 'bg-gray-50 border-gray-200 hover:border-duomo-primary/30 hover:bg-duomo-primary/5';
    }
  };

  // Nova função para obter informações do status de conversação
  const getConversationStatusBadge = (status?: string) => {
    switch (status) {
      case 'rejected':
        return {
          text: '🚫 Recusou Oferta',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'rejected_post_trigger':
        return {
          text: '🚫 Recusou Oferta Pós-Disparo',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'accepted':
        return {
          text: '✅ Aceitou Oferta',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'waiting_human':
        return {
          text: '⏳⚠️ Aguardando Equipe Comercial',
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'proceeded':
        return {
          text: '⏳ Em Progresso',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      default:
        return {
          text: '❓ Status Indefinido',
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
    }
  };

  // FUNÇÃO PARA CRIAR NOVO VENDEDOR
  const createNewSeller = async (name: string, specialization: string) => {
    try {
      // Obter o usuário atual para associar ao vendedor
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('Usuário não autenticado');
      }

      // Dados para inserção com campos obrigatórios
      let insertData = {
        name: name.trim(),
        specialization: specialization.trim(),
        is_active: true,
        status: 'active'
      };

      // Criar vendedor no Supabase
      const { data, error } = await supabase
        .from('imoveis_milionarios_sdr_seller')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      const newAgent: RealEstateAgent = {
        id: data.id,
        name: data.name,
        specialization: data.specialization || 'Imóveis de Luxo',
        avatar_url: data.avatar_url,
        is_active: data.is_active
      };

      // Atualizar estado local
      setAvailableAgents(prev => [...prev, newAgent]);
      setCurrentAgent(newAgent);
      setIsAgentModalOpen(false);
      
      // Salvar vendedor atual no localStorage para persistência de sessão
      localStorage.setItem('current-agent', JSON.stringify(newAgent));
      
      console.log('✅ Vendedor criado no Supabase:', newAgent);
    } catch (error: any) {
      console.error('❌ Erro ao criar vendedor:', error);
      
      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao criar vendedor. Tente novamente.';
      
      if (error?.code === '42501') {
        errorMessage = 'Erro de permissão: Você não tem autorização para criar vendedores. Entre em contato com o administrador.';
      } else if (error?.message?.includes('row-level security')) {
        errorMessage = 'Erro de segurança: Política de acesso à tabela impede a criação. Contate o administrador.';
      } else if (error?.message?.includes('not authenticated')) {
        errorMessage = 'Usuário não autenticado. Faça login novamente.';
      }
      
      alert(errorMessage);
    }
  };

  // FUNÇÃO PARA BUSCAR VENDEDORES
  const fetchSellers = async () => {
    try {
      // Buscar todos os vendedores ativos do Supabase
      const { data, error } = await supabase
        .from('imoveis_milionarios_sdr_seller')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const agents: RealEstateAgent[] = (data || []).map(agent => ({
        id: agent.id,
        name: agent.name,
        specialization: agent.specialization || 'Imóveis de Luxo',
        avatar_url: agent.profile_image_url,
        is_active: agent.is_active,
        creci_number: agent.creci_number
      }));

      setAvailableAgents(agents);
      console.log('✅ Corretores carregados do Supabase:', agents.length);
    } catch (error) {
      console.error('❌ Erro ao buscar vendedores:', error);
      // Fallback: manter vendedor padrão se houver erro
      setAvailableAgents([
        { id: 1, name: 'João Silva', role: 'Equipe Comercial', is_active: true }
      ]);
    }
  };

  // SISTEMA DE CACHE PARA STATUS DE LEITURA
  const readStatusCache = new Map<string, { data: ConversationReadInfo, timestamp: number }>();
  const CACHE_TTL = 30000; // 30 segundos
  const BATCH_SIZE = 50; // Máximo de IDs por requisição
  const CONCURRENT_BATCHES = 3; // Máximo de lotes simultâneos

  // VERSÃO OTIMIZADA COM CACHE E PAGINAÇÃO INTELIGENTE
  const fetchReadStatus = async (phoneIds: string[]) => {
    if (!currentAgent || phoneIds.length === 0) return;

    try {
      // 1. FILTRAR IDs QUE PRECISAM SER BUSCADOS (não estão em cache válido)
      const now = Date.now();
      const idsToFetch: string[] = [];
      const cachedResults: Record<string, ConversationReadInfo> = {};

      phoneIds.forEach(phoneId => {
        const cached = readStatusCache.get(phoneId);
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
          cachedResults[phoneId] = cached.data;
        } else {
          idsToFetch.push(phoneId);
        }
      });

      console.log(`📊 Cache hit: ${Object.keys(cachedResults).length}, Cache miss: ${idsToFetch.length}`);

      // 2. SE TODOS ESTÃO EM CACHE, USAR CACHE
      if (idsToFetch.length === 0) {
        setConversationReadInfo(prev => ({ ...prev, ...cachedResults }));
        return;
      }

      // 3. BUSCAR APENAS OS QUE NÃO ESTÃO EM CACHE (COM PAGINAÇÃO)
      const batches = [];
      for (let i = 0; i < idsToFetch.length; i += BATCH_SIZE) {
        batches.push(idsToFetch.slice(i, i + BATCH_SIZE));
      }

      console.log(`🔄 Buscando ${idsToFetch.length} IDs em ${batches.length} lotes de até ${BATCH_SIZE} IDs`);

      // 4. BUSCAR LOTES EM PARALELO (máximo 3 por vez para não sobrecarregar)
      const newReadInfo: Record<string, ConversationReadInfo> = { ...cachedResults };
      
      for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
        const currentBatches = batches.slice(i, i + CONCURRENT_BATCHES);
        
        const batchPromises = currentBatches.map(async (batch, batchIndex) => {
          const globalIndex = i + batchIndex;
          console.log(`📦 Lote ${globalIndex + 1}/${batches.length}: ${batch.length} IDs`);
          
          const { data, error } = await supabase
            .from('pipiolo_sdr_conversation_reads')
            .select(`
              *,
              imoveis_milionarios_sdr_seller!inner(name)
            `)
            .in('phone_id', batch);

          if (error) {
            console.error(`❌ Erro no lote ${globalIndex + 1}:`, error);
            return [];
          }

          return data || [];
        });

        const batchResults = await Promise.all(batchPromises);
        const flatResults = batchResults.flat();

        // 5. PROCESSAR RESULTADOS E ATUALIZAR CACHE
        const currentBatchIds = currentBatches.flat();
        currentBatchIds.forEach(phoneId => {
          const phoneReads = flatResults.filter(read => read.phone_id === phoneId);
          
          const readBy: ReadStatus[] = phoneReads.map(read => ({
            agent_id: read.seller_id,
            agent_name: read.imoveis_milionarios_sdr_seller.name,
            last_read_at: read.last_read_at,
            read_count: read.read_count,
            is_currently_viewing: read.is_currently_viewing
          }));

          const currentUserRead = readBy.find(r => r.agent_id === currentAgent.id);
          const lastMessageTime = sessions.find(s => s.session_id === phoneId)?.last_message_date;
          const lastMessageDate = lastMessageTime ? new Date(lastMessageTime) : new Date(0);
          const userLastReadDate = currentUserRead ? new Date(currentUserRead.last_read_at) : new Date(0);
          const isUnreadForCurrentUser = !currentUserRead || lastMessageDate > userLastReadDate;

          const conversationInfo: ConversationReadInfo = {
            phone_id: phoneId,
            read_by: readBy,
            unread_count: isUnreadForCurrentUser ? 1 : 0,
            last_message_id: 0,
            is_unread_for_current_user: isUnreadForCurrentUser
          };

          // ATUALIZAR CACHE
          readStatusCache.set(phoneId, { 
            data: conversationInfo, 
            timestamp: now 
          });

          newReadInfo[phoneId] = conversationInfo;
        });

        // 6. ATUALIZAR ESTADO INCREMENTALMENTE PARA MELHOR UX
        setConversationReadInfo(prev => ({ ...prev, ...newReadInfo }));
      }

      console.log(`✅ Status carregado: ${Object.keys(newReadInfo).length} conversas (${Object.keys(cachedResults).length} do cache)`);

    } catch (error) {
      console.error('❌ Erro ao buscar status de leitura:', error);
      
      // FALLBACK: marcar como não lidas apenas as que falharam
      const fallbackReadInfo: Record<string, ConversationReadInfo> = {};
      phoneIds.forEach(phoneId => {
        if (!readStatusCache.has(phoneId)) {
          fallbackReadInfo[phoneId] = {
            phone_id: phoneId,
            read_by: [],
            unread_count: 1,
            last_message_id: 0,
            is_unread_for_current_user: true
          };
        }
      });
      
      setConversationReadInfo(prev => ({ ...prev, ...fallbackReadInfo }));
    }
  };

  // FUNÇÃO PARA LIMPAR CACHE QUANDO NECESSÁRIO
  const clearReadStatusCache = () => {
    readStatusCache.clear();
    console.log('🗑️ Cache de status de leitura limpo');
  };

  // FUNÇÃO PARA MARCAR COMO LIDA
  const markConversationAsRead = async (phoneId: string) => {
    if (!currentAgent || !phoneId) return;

    try {
      // Upsert no Supabase (inserir ou atualizar)
      const { data, error } = await supabase
        .from('pipiolo_sdr_conversation_reads')
        .upsert({
          phone_id: phoneId,
          seller_id: currentAgent.id,
          last_read_at: new Date().toISOString(),
          read_count: 1,
          is_currently_viewing: true
        }, {
          onConflict: 'phone_id,seller_id'
        })
        .select(`
          *,
          imoveis_milionarios_sdr_seller!inner(name)
        `);

      if (error) throw error;

      // Atualizar estado local imediatamente para melhor UX
      setConversationReadInfo(prev => {
        const existing = prev[phoneId] || {
          phone_id: phoneId,
          read_by: [],
          unread_count: 0,
          last_message_id: 0,
          is_unread_for_current_user: true
        };

        const updatedReadBy = [
          ...(existing.read_by?.filter(r => r.agent_id !== currentAgent.id) || []),
          {
            agent_id: currentAgent.id,
            agent_name: currentAgent.name,
            last_read_at: new Date().toISOString(),
            read_count: 1,
            is_currently_viewing: true
          }
        ];

        return {
          ...prev,
          [phoneId]: {
            ...existing,
            is_unread_for_current_user: false,
            unread_count: 0,
            read_by: updatedReadBy
          }
        };
      });

      // Invalidar cache para essa conversa para garantir dados atualizados
      readStatusCache.delete(phoneId);
      
      console.log(`✅ Conversa ${phoneId} marcada como lida no Supabase por ${currentAgent.name}`);
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
      // Ainda assim atualizar estado local para UX
      setConversationReadInfo(prev => {
        const existing = prev[phoneId] || {
          phone_id: phoneId,
          read_by: [],
          unread_count: 0,
          last_message_id: 0,
          is_unread_for_current_user: true
        };

        return {
          ...prev,
          [phoneId]: {
            ...existing,
            is_unread_for_current_user: false,
            unread_count: 0
          }
        };
      });
    }
  };



  // MODAL DE SELEÇÃO DE VENDEDOR
  // Função otimizada para filtrar vendedores baseado no termo de busca
  const filteredAgents = useMemo(() => {
    if (!agentSearchTerm.trim()) {
      return availableAgents;
    }
    return availableAgents.filter(seller =>
      seller.name.toLowerCase().includes(agentSearchTerm.toLowerCase()) ||
      seller.specialization.toLowerCase().includes(agentSearchTerm.toLowerCase())
    );
  }, [availableAgents, agentSearchTerm]);

  // Handlers otimizados para evitar re-renders
  const handleAgentSelect = useCallback((agent: RealEstateAgent) => {
    setCurrentAgent(agent);
    setIsAgentModalOpen(false);
    setAgentSearchTerm(''); // Limpar busca ao selecionar
    localStorage.setItem('current-agent', JSON.stringify(agent));
  }, []);

  const handleCreateNewSeller = useCallback(() => {
    const name = prompt('Digite seu nome:');
    const specialization = prompt('Digite sua equipe (ex: Equipe Comercial, Equipe CS, Gerência, Coordenação, etc.):');
    if (name && specialization) {
      createNewSeller(name, specialization);
      setAgentSearchTerm(''); // Limpar busca após criar
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsAgentModalOpen(false);
    setAgentSearchTerm(''); // Limpar busca ao fechar
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAgentSearchTerm(e.target.value);
  }, []);

  const AgentSelectionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Selecione seu perfil de vendedor</h3>
        
        {/* Campo de busca */}
        <div className="relative mb-4">
          <input
            key="seller-search-input" // Key estável para evitar re-criação
            type="text"
            placeholder="Buscar vendedor por nome ou área..."
            value={agentSearchTerm}
            onChange={handleSearchChange}
            autoFocus
            className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-duomo-primary focus:bg-white border border-gray-200 transition-all text-sm"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-duomo-primary" size={18} />
        </div>

        {/* Lista de vendedores */}
        <div className="flex-1 overflow-hidden">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {agentSearchTerm ? (
                <>
                  <User size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhum vendedor encontrado para "{agentSearchTerm}"</p>
                  <p className="text-xs mt-1">Tente buscar por outro nome ou área</p>
                </>
              ) : (
                <>
                  <User size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhum vendedor cadastrado</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredAgents.map(seller => (
                <button
                  key={seller.id}
                  onClick={() => handleAgentSelect(seller)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-duomo-primary/10 rounded-full flex items-center justify-center">
                      <User size={16} className="text-duomo-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{seller.name}</div>
                      <div className="text-xs text-gray-500 truncate">{seller.specialization}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botão criar novo vendedor */}
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={handleCreateNewSeller}
            className="w-full px-4 py-2 bg-duomo-primary text-white rounded-lg hover:bg-duomo-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <User size={16} />
            + Criar Novo Vendedor
          </button>
        </div>

        {/* Botão fechar (opcional) */}
        {currentAgent && (
          <button
            onClick={handleCloseModal}
            className="mt-2 w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );

  // INICIALIZAÇÃO DE VENDEDORES
  useEffect(() => {
    const initializeSellers = async () => {
      try {
        await fetchSellers();
        
        // Recuperar vendedor atual salvo no localStorage (apenas para persistência de sessão)
        const savedAgent = localStorage.getItem('current-agent');
        if (savedAgent) {
          try {
            const agent = JSON.parse(savedAgent);
            // Verificar se o vendedor ainda existe no Supabase
            const { data, error } = await supabase
              .from('imoveis_milionarios_sdr_seller')
              .select('*')
              .eq('id', agent.id)
              .eq('is_active', true)
              .single();
            
            if (data && !error) {
              // Vendedor ainda existe, usar dados atualizados
              setCurrentAgent({
                id: data.id,
                name: data.name,
                specialization: data.specialization || 'Imóveis de Luxo',
                avatar_url: data.avatar_url,
                is_active: data.is_active
              });
            } else {
              // Vendedor não existe mais, limpar localStorage e abrir modal
              localStorage.removeItem('current-agent');
              setTimeout(() => setIsAgentModalOpen(true), 500);
            }
          } catch (err) {
            console.warn('Erro ao verificar vendedor salvo:', err);
            localStorage.removeItem('current-agent');
            setTimeout(() => setIsAgentModalOpen(true), 500);
          }
        } else {
          // Nenhum vendedor salvo, abrir modal
          setTimeout(() => setIsAgentModalOpen(true), 500);
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar vendedores:', error);
        // Fallback: abrir modal após erro
        setTimeout(() => setIsAgentModalOpen(true), 1000);
      }
    };

    initializeSellers();
  }, []);

  // 📊 CARREGAMENTO INICIAL DE DADOS QUANDO SELLER MUDA
  useEffect(() => {
    if (!currentAgent) return;
    
    const loadData = async () => {
      try {
        // 📊 Carregar métricas primeiro
        await fetchAvailableSenders();
        
        // 👥 Carregar vendedores
        await fetchSellers();
        
        console.log('✅ Dados carregados com sucesso');
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
      }
    };
    
    loadData();
  }, [currentAgent]);

  // CARREGAMENTO PRIORITÁRIO: CONVERSAS VISÍVEIS PRIMEIRO
  useEffect(() => {
    if (sessions.length > 0 && currentAgent) {
      const phoneIds = sessions.map(s => s.session_id);
      
      // Implementar carregamento prioritário
      const loadPrioritizedStatus = async () => {
        // 1. PRIORIDADE ALTA: Carregar conversas visíveis primeiro (primeira página)
        const itemsPerPage = 20;
        const visibleSessionIds = phoneIds.slice(0, itemsPerPage);
        
        if (visibleSessionIds.length > 0) {
          console.log('🚀 Carregando prioridade alta: conversas visíveis');
          await fetchReadStatus(visibleSessionIds);
        }
        
        // 2. PRIORIDADE BAIXA: Carregar o restante com delay
        const remainingSessionIds = phoneIds.slice(itemsPerPage);
        if (remainingSessionIds.length > 0) {
          setTimeout(async () => {
            console.log('⏳ Carregando prioridade baixa: conversas restantes');
            await fetchReadStatus(remainingSessionIds);
          }, 1000); // Delay de 1 segundo
        }
      };
      
      // Usar timeout para evitar chamar muito rapidamente
      const timer = setTimeout(() => {
        loadPrioritizedStatus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [sessions.length, currentAgent?.id]); // Usar apenas propriedades primitivas

  return (
    <div className="min-h-screen bg-duomo-background text-duomo-text-dark">
      {/* Header Milano */}
      <Header title="DUOMO" className="border-b border-duomo-accent/20" />
      {/* Modal de Seleção de Vendedor */}
      {isAgentModalOpen && <AgentSelectionModal />}

      {/* Modal de Mudança de Senha */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full">
            <ChangePasswordForm 
              onClose={handleCloseChangePassword}
              onSuccess={() => {
                console.log('✅ Senha alterada com sucesso!');
                // Modal será fechada automaticamente pelo componente
              }}
            />
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Main Content */}
      <div className="p-6">
        
        {/* Agent Selector and Status */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Current Agent Display */}
            {currentAgent && (
              <div className="flex items-center gap-3 bg-milano-background-light/50 rounded-lg p-4 border border-milano-accent/20">
                <div className="w-10 h-10 bg-milano-accent/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-milano-accent" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-milano-text-light">{currentAgent.name}</div>
                  <div className="text-sm text-milano-accent">{currentAgent.specialization}</div>
                  {currentAgent.creci_number && (
                    <div className="text-xs text-gray-400">CRECI: {currentAgent.creci_number}</div>
                  )}
                </div>
                <button
                  onClick={() => setIsAgentModalOpen(true)}
                  className="px-3 py-1 text-sm bg-milano-accent text-milano-text-dark rounded-md hover:bg-milano-accent-light transition-colors"
                >
                  Trocar Corretor
                </button>
              </div>
            )}
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Sistema Ativo</span>
            </div>
          </div>
        </div>
        
        {/* Filtro de Sender */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter size={18} className="text-duomo-primary" />
              <span className="text-sm font-medium text-gray-700">Filtrar por número:</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <select
                value={selectedSender}
                onChange={(e) => {
                  setSelectedSender(e.target.value);
                  setCurrentPage(1); // Reset para primeira página
                  setSelectedSession(null); // Limpar sessão selecionada
                }}
                className="flex-1 sm:flex-none sm:min-w-[200px] px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-duomo-primary focus:border-transparent text-sm"
              >
                <option value="">Todos os números</option>
                {availableSenders.map((sender) => (
                  <option key={sender.sender} value={sender.sender}>
                    {sender.label}
                  </option>
                ))}
              </select>
              {selectedSender && (
                <button
                  onClick={() => {
                    setSelectedSender('');
                    setCurrentPage(1);
                    setSelectedSession(null);
                  }}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors flex-shrink-0"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Indicador de Filtros Ativos */}
        {(searchTerm || showOnlyUnread || selectedSender) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Filter size={16} />
              <span className="text-sm font-medium">Filtros Ativos:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedSender && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    📱 {selectedSender}
                  </span>
                )}
                {searchTerm && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    📝 "{searchTerm}"
                  </span>
                )}
                {showOnlyUnread && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    🔵 Não lidas
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-duomo-primary-light/20 flex items-center justify-center">
                <Users size={24} className="text-duomo-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-duomo-primary">
                  {selectedSender ? 'Conversas do Número' : 'Total de Conversas'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedSender ? filteredSessions.length : totalConversations}
                </p>
                {selectedSender && (
                  <p className="text-xs text-gray-500">Filtrado por: {selectedSender}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-duomo-primary-light/20 flex items-center justify-center">
                <MessageSquare size={24} className="text-duomo-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-duomo-primary">Mensagens na Conversa</p>
                <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                <p className="text-xs text-gray-500">
                  {selectedSession ? `Conversa: ${formatPhoneId(selectedSession)}` : 'Nenhuma conversa selecionada'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <X size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-duomo-primary">Recusas Pós-Disparo</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedPostTrigger}</p>
                <p className="text-xs text-gray-500">Ofertas rejeitadas hoje</p>
              </div>
            </div>
          </div>
          

        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Sessions List */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Conversas</h2>
              {currentAgent && (
                <button 
                  onClick={() => {
                    setShowOnlyUnread(!showOnlyUnread);
                    setCurrentPage(1); // Reset para primeira página
                  }}
                  className={`flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors min-w-0 flex-shrink-0 ${
                    showOnlyUnread 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <span>🔵</span>
                  <span className="hidden sm:inline">
                    {showOnlyUnread ? 'Mostrando apenas não lidas' : 'Filtrar não lidas'}
                  </span>
                  <span className="sm:hidden">
                    {showOnlyUnread ? 'Não lidas' : 'Filtrar'}
                  </span>
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-duomo-primary focus:bg-white border border-gray-200 transition-all text-sm sm:text-base"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-duomo-primary" size={18} />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {paginatedSessions.map((session) => {
                  const lead = clientInfo[session.session_id] || { 
                    name: 'Sem nome', 
                    phone_id: session.session_id,
                    crm_deal_stage_id: '',
                    lead_scoring: '',
                    is_ai_enabled: true,
                    lead_conversation_status: 'proceeded', // Default
                    last_message_data: { created_at: session.last_message_date }
                  };
                  
                  // Debug para sessions sem lead info
                  if (!clientInfo[session.session_id]) {
                    console.log('⚠️ Session sem lead info:', session.session_id, 'Sender:', session.sender);
                  }
                  
                  // Obter indicador de leitura de forma segura
                  let readIndicator = { icon: '⚪', status: 'Nova conversa', isUnread: false, className: 'text-gray-500' };
                  try {
                    if (currentAgent) {
                      readIndicator = getReadIndicator(session.session_id);
                    }
                  } catch (e) {
                    console.warn('Erro ao obter indicador de leitura:', e);
                  }
                  
                  return (
                    <button
                      key={session.session_id}
                      onClick={() => {
                        setSelectedSession(session.session_id);
                        if (currentAgent) {
                          markConversationAsRead(session.session_id);
                        }
                      }}
                      className={`w-full text-left p-4 transition-all duration-200 rounded-xl relative ${
                        selectedSession === session.session_id 
                          ? 'bg-duomo-primary/5 border-2 border-duomo-primary shadow-sm' 
                          : readIndicator.isUnread 
                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-md' 
                            : getConversationStatusClass(lead.lead_conversation_status)
                      } ${getBorderClass(lead.lead_scoring || '')}`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Header com indicador inline */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-duomo-primary uppercase tracking-wide">Contato:</span>
                              {currentAgent && (
                                <>
                                  <span className="text-xs">{readIndicator.icon}</span>
                                  <span className={`text-xs hidden sm:inline ${readIndicator.className}`}>
                                    {readIndicator.status}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            {/* Nome com responsividade melhorada */}
                            <div className={`text-sm font-medium leading-tight mb-1 ${
                              selectedSession === session.session_id ? 'text-duomo-primary' : 'text-gray-900'
                            } ${readIndicator.isUnread ? 'font-bold' : 'font-medium'}`}>
                              <div className="line-clamp-2 sm:line-clamp-1 break-words">
                                {lead.name}
                              </div>
                            </div>
                            
                            {/* Telefone */}
                            <div className="text-xs text-gray-500 truncate">
                              {formatPhoneId(session.session_id)}
                            </div>
                            
                            {/* Sender apenas em telas maiores */}
                            {session.sender && (
                              <div className="text-xs text-duomo-primary font-medium truncate hidden md:block mt-1">
                                Sender: {session.sender}
                              </div>
                            )}
                          </div>
                          
                          {/* Info lateral compacta */}
                          <div className="text-right flex-shrink-0 min-w-0">
                            <div className="text-xs text-duomo-primary whitespace-nowrap mb-1">
                              {formatLastMessageDate(session.last_message_date)}
                            </div>
                            <div className="text-xs text-gray-500 whitespace-nowrap mb-1">
                              {session.message_count} msg
                            </div>
                            <div className={`text-xs font-semibold whitespace-nowrap ${
                              lead.is_ai_enabled ? 'text-green-600' : 'text-red-500'
                            }`}>
                              {lead.is_ai_enabled ? 'ON' : 'OFF'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Badges responsivos */}
                        <div className="flex items-center gap-1 flex-wrap">
                          {/* Badge de Status de Conversação compacto */}
                          {lead.lead_conversation_status && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border max-w-full ${getConversationStatusBadge(lead.lead_conversation_status).className}`}>
                              <span className="truncate">
                                {getConversationStatusBadge(lead.lead_conversation_status).text}
                              </span>
                            </span>
                          )}
                          
                          {/* Badges existentes compactos */}
                          {lead.crm_deal_stage_id && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium max-w-full ${getStatusClass(lead.crm_deal_stage_id)}`}>
                              <span className="truncate">
                                {getStatusEmoji(lead.crm_deal_stage_id)}
                              </span>
                            </span>
                          )}
                          {lead.lead_scoring && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium max-w-full ${getScoreClass(lead.lead_scoring)}`}>
                              <span className="truncate">
                                {getScoreEmoji(lead.lead_scoring)} ({lead.lead_scoring})
                              </span>
                            </span>
                          )}
                        </div>
                        
                        {/* Status de leitura detalhado apenas mobile */}
                        {currentAgent && (
                          <div className="sm:hidden">
                            <span className={`text-xs ${readIndicator.className}`}>
                              {readIndicator.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pagination controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-duomo-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-duomo-primary/5 w-full sm:w-auto min-w-0"
                >
                  <ChevronLeft size={16} className="flex-shrink-0" />
                  <span className="hidden sm:inline">Anterior</span>
                  <span className="sm:hidden">Ant.</span>
                </button>
                <span className="text-sm font-medium text-duomo-primary whitespace-nowrap order-first sm:order-none">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-duomo-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-duomo-primary/5 w-full sm:w-auto min-w-0"
                >
                  <span className="hidden sm:inline">Próximo</span>
                  <span className="sm:hidden">Prox.</span>
                  <ChevronRight size={16} className="flex-shrink-0" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Messages Display */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[700px] sm:h-[800px]">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-gray-200 p-4 sm:p-6 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-duomo-primary/10 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-duomo-primary sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                        {clientInfo[selectedSession]?.name || 'Contato'}
                      </h3>
                      <p className="text-sm text-duomo-primary truncate">
                        {formatPhoneId(selectedSession)}
                      </p>
                      {/* Mostrar sender atual se filtrado */}
                      {selectedSender && (
                        <p className="text-xs text-gray-500 truncate">
                          Origem: {selectedSender}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* AI Toggle Button */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700">IA:</span>
                    <button
                      onClick={() => toggleAIStatus(selectedSession)}
                      disabled={isUpdatingAI}
                      className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-duomo-primary focus:ring-offset-2 ${
                        clientInfo[selectedSession]?.is_ai_enabled 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      } ${isUpdatingAI ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-white transition-transform duration-200 ${
                          clientInfo[selectedSession]?.is_ai_enabled ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'
                        }`}
                      >
                        {isUpdatingAI ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <Power 
                            size={10} 
                            className={`mt-1 ml-1 sm:mt-1.5 sm:ml-1.5 sm:w-3 sm:h-3 ${
                              clientInfo[selectedSession]?.is_ai_enabled ? 'text-green-500' : 'text-gray-400'
                            }`} 
                          />
                        )}
                      </span>
                    </button>
                    <span className={`text-xs font-semibold ${
                      clientInfo[selectedSession]?.is_ai_enabled ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {clientInfo[selectedSession]?.is_ai_enabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6"
              >
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        <MessageSquare size={64} className="text-duomo-primary mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma mensagem encontrada</h3>
                        <p>Esta conversa não possui mensagens registradas.</p>
                        {selectedSender && (
                          <p className="text-sm text-gray-400 mt-2">
                            Filtrado por Origem: {selectedSender}
                          </p>
                        )}
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-4 ${
                            message.message?.type === 'ai' ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl p-5 ${
                              message.message?.type === 'ai'
                                ? 'bg-gray-50 text-gray-900 border border-gray-200'
                                : 'bg-duomo-primary-light/20 text-duomo-primary border border-duomo-primary/20 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              {message.message?.type === 'ai' ? (
                                <Bot size={18} className="text-duomo-primary flex-shrink-0" />
                              ) : (
                                <User size={18} className="text-duomo-primary flex-shrink-0" />
                              )}
                              <span className={`text-xs font-semibold flex-shrink-0 ${
                                message.message?.type === 'ai' ? 'text-duomo-primary' : 'text-duomo-primary'
                              }`}>
                                {message.message?.type === 'ai' ? 'Agente IA' : 'Cliente'}
                              </span>
                              <span className={`text-xs truncate ${
                                message.message?.type === 'ai' ? 'text-duomo-primary/70' : 'text-duomo-primary/70'
                              }`}>
                                {formatMessageTimestamp(message.created_at)}
                              </span>
                            </div>
                            {renderMessageContent(message)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Message Input Area */}
              <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-gray-50">
                {/* Image Preview Area */}
                {selectedImages.length > 0 && (
                  <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon size={16} className="text-duomo-primary" />
                      <span className="text-sm font-medium text-gray-700">
                        {selectedImages.length} imagem(ns) selecionada(s)
                      </span>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {selectedImages.map((file, index) => (
                        <ImagePreview
                          key={index}
                          file={file}
                          onRemove={() => removeSelectedImage(index)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-duomo-primary focus:border-transparent bg-white"
                      rows={2}
                      disabled={isSending}
                    />
                  </div>
                  
                  {/* Image Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                    className="px-4 py-3 rounded-xl border border-gray-300 hover:border-duomo-primary hover:bg-duomo-primary/5 transition-all duration-200 flex items-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Anexar imagens"
                  >
                    <Paperclip size={20} className="text-duomo-primary" />
                  </button>
                  
                  <button
                    onClick={sendMessage}
                    disabled={(!messageText.trim() && selectedImages.length === 0) || isSending}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 flex-shrink-0 ${
                      (!messageText.trim() && selectedImages.length === 0) || isSending
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-duomo-primary text-white hover:bg-duomo-primary-dark shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isSending ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Enviar
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Pressione Enter para enviar ou Shift+Enter para nova linha • Máximo 5 imagens por mensagem
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-16">
              <div className="w-20 h-20 rounded-full bg-duomo-primary/10 flex items-center justify-center mb-6">
                <MessageSquare size={40} className="text-duomo-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Selecione uma conversa</h3>
              <p className="text-center max-w-md text-duomo-primary leading-relaxed">
                Escolha uma conversa da lista ao lado para visualizar o histórico completo de mensagens entre o cliente e o agente IA.
              </p>
              {selectedSender && (
                <p className="text-sm text-gray-400 mt-4">
                  Filtrado por Origem: {selectedSender}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatViewerPage;