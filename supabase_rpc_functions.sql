-- ============================================================================
-- RPC FUNCTIONS PARA DASHBOARD DE CONVERSAS - VERSÃO ESCALÁVEL
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================================================

-- 1. FUNÇÃO PARA CONTAGEM DE CONVERSAS POR SENDER
CREATE OR REPLACE FUNCTION get_conversation_count_by_sender()
RETURNS TABLE(
  sender TEXT, 
  conversation_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(h.sender, 'Sem origem') as sender,
    COUNT(DISTINCT h.session_id) as conversation_count
  FROM pipiolo_sdr_chat_histories h
  GROUP BY h.sender
  HAVING COUNT(DISTINCT h.session_id) > 0
  ORDER BY conversation_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FUNÇÃO PARA MÉTRICAS COMPLETAS DO DASHBOARD
CREATE OR REPLACE FUNCTION get_dashboard_metrics(sender_filter TEXT DEFAULT NULL)
RETURNS TABLE(
  total_conversations BIGINT,
  filtered_conversations BIGINT,
  sender_distribution JSONB,
  conversation_list JSONB
) AS $$
DECLARE
  total_count BIGINT;
  filtered_count BIGINT;
  sender_dist JSONB;
  conv_list JSONB;
BEGIN
  -- 1. Total de conversas únicas (sem filtro)
  SELECT COUNT(DISTINCT session_id) INTO total_count
  FROM pipiolo_sdr_chat_histories;
  
  -- 2. Conversas filtradas por sender (se aplicável)
  IF sender_filter IS NOT NULL THEN
    SELECT COUNT(DISTINCT session_id) INTO filtered_count
    FROM pipiolo_sdr_chat_histories
    WHERE sender = sender_filter;
  ELSE
    filtered_count := total_count;
  END IF;
  
  -- 3. Distribuição de conversas por sender
  SELECT jsonb_object_agg(
    COALESCE(sender, 'sem_origem'),
    conversation_count
  ) INTO sender_dist
  FROM (
    SELECT 
      sender,
      COUNT(DISTINCT session_id) as conversation_count
    FROM pipiolo_sdr_chat_histories
    GROUP BY sender
  ) s;
  
  -- 4. Lista de conversas com metadados (limitada e otimizada)
  SELECT jsonb_agg(
    jsonb_build_object(
      'session_id', session_id,
      'sender', sender,
      'last_message_date', last_message_date,
      'message_count', message_count
    )
    ORDER BY last_message_date DESC
  ) INTO conv_list
  FROM (
    SELECT DISTINCT ON (session_id)
      session_id,
      sender,
      MAX(created_at) as last_message_date,
      COUNT(*) as message_count
    FROM pipiolo_sdr_chat_histories
    WHERE (sender_filter IS NULL OR sender = sender_filter)
    GROUP BY session_id, sender
    ORDER BY session_id, MAX(created_at) DESC
    LIMIT 1000  -- Limitar para performance
  ) conversations;
  
  RETURN QUERY SELECT total_count, filtered_count, sender_dist, conv_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNÇÃO PARA BUSCAR CONVERSAS DE UM SENDER ESPECÍFICO
CREATE OR REPLACE FUNCTION get_conversations_by_sender(
  sender_name TEXT,
  page_size INTEGER DEFAULT 50,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  session_id TEXT,
  sender TEXT,
  last_message_date TIMESTAMPTZ,
  message_count BIGINT,
  total_count BIGINT
) AS $$
DECLARE
  total_conversations BIGINT;
BEGIN
  -- Contar total de conversas para este sender
  SELECT COUNT(DISTINCT h.session_id) INTO total_conversations
  FROM pipiolo_sdr_chat_histories h
  WHERE h.sender = sender_name;
  
  -- Retornar conversas paginadas
  RETURN QUERY
  SELECT DISTINCT ON (h.session_id)
    h.session_id,
    h.sender,
    MAX(h.created_at) as last_message_date,
    COUNT(*) as message_count,
    total_conversations as total_count
  FROM pipiolo_sdr_chat_histories h
  WHERE h.sender = sender_name
  GROUP BY h.session_id, h.sender
  ORDER BY h.session_id, MAX(h.created_at) DESC
  LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNÇÃO PARA ESTATÍSTICAS GERAIS (CACHE-FRIENDLY)
CREATE OR REPLACE FUNCTION get_general_stats()
RETURNS TABLE(
  total_messages BIGINT,
  total_conversations BIGINT,
  total_senders BIGINT,
  date_range_start TIMESTAMPTZ,
  date_range_end TIMESTAMPTZ,
  top_senders JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_messages,
    COUNT(DISTINCT session_id) as total_conversations,
    COUNT(DISTINCT sender) as total_senders,
    MIN(created_at) as date_range_start,
    MAX(created_at) as date_range_end,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'sender', sender,
          'conversations', conversation_count,
          'percentage', ROUND((conversation_count::DECIMAL / COUNT(DISTINCT session_id) OVER()) * 100, 2)
        )
        ORDER BY conversation_count DESC
      )
      FROM (
        SELECT 
          COALESCE(sender, 'Sem origem') as sender,
          COUNT(DISTINCT session_id) as conversation_count
        FROM pipiolo_sdr_chat_histories
        GROUP BY sender
        ORDER BY conversation_count DESC
        LIMIT 10
      ) top_senders_sub
    ) as top_senders
  FROM pipiolo_sdr_chat_histories;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. NOVA FUNÇÃO OTIMIZADA: BUSCAR CONVERSAS COM INFORMAÇÕES DE LEAD
CREATE OR REPLACE FUNCTION get_conversations_with_lead_info(sender_filter TEXT DEFAULT NULL)
RETURNS TABLE(
  session_id TEXT,
  sender TEXT,
  last_message_date TIMESTAMPTZ,
  message_count BIGINT,
  lead_name TEXT,
  lead_phone_id TEXT,
  lead_scoring TEXT,
  crm_deal_stage_id TEXT,
  is_ai_enabled BOOLEAN,
  lead_conversation_status TEXT,
  last_message_data JSONB,
  instance_name TEXT,
  manychat_id TEXT,
  manychat_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    conversations.session_id,
    conversations.sender,
    conversations.last_message_date,
    conversations.message_count,
    COALESCE(lm.name, 'Sem nome') as lead_name,
    lm.phone_id as lead_phone_id,
    lm.lead_scoring,
    lm.crm_deal_stage_id,
    COALESCE(lm.is_ai_enabled, true) as is_ai_enabled,
    lm.lead_conversation_status::TEXT,
    lm.last_message_data,
    lm.instance_name,
    lm.manychat_id,
    lm.manychat_data
  FROM (
    SELECT 
      h.session_id,
      h.sender,
      MAX(h.created_at) as last_message_date,
      COUNT(*) as message_count
    FROM pipiolo_sdr_chat_histories h
    WHERE (sender_filter IS NULL OR h.sender = sender_filter)
    GROUP BY h.session_id, h.sender
  ) conversations
  LEFT JOIN pipiolo_sdr_lead_management lm ON conversations.session_id = lm.phone_id
  ORDER BY conversations.last_message_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO PARA BUSCAR MENSAGENS DE UMA CONVERSA COM FILTRO DE SENDER
CREATE OR REPLACE FUNCTION get_messages_by_session(
  session_id_param TEXT,
  sender_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  session_id TEXT,
  message JSONB,
  created_at TIMESTAMPTZ,
  sender TEXT,
  instance_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.session_id,
    h.message,
    h.created_at,
    h.sender,
    h.instance_name
  FROM pipiolo_sdr_chat_histories h
  WHERE h.session_id = session_id_param
    AND (sender_filter IS NULL OR h.sender = sender_filter)
  ORDER BY h.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNÇÃO PARA ATUALIZAR STATUS DA IA
CREATE OR REPLACE FUNCTION update_ai_status(
  phone_id_param TEXT,
  new_status BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pipiolo_sdr_lead_management
  SET is_ai_enabled = new_status
  WHERE phone_id = phone_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ÍNDICES PARA OTIMIZAÇÃO
-- Criar índices compostos para melhor performance
CREATE INDEX IF NOT EXISTS idx_chat_histories_sender_session 
ON pipiolo_sdr_chat_histories(sender, session_id);

CREATE INDEX IF NOT EXISTS idx_chat_histories_session_created 
ON pipiolo_sdr_chat_histories(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_histories_sender_created 
ON pipiolo_sdr_chat_histories(sender, created_at DESC);

-- Índices para tabela de leads
CREATE INDEX IF NOT EXISTS idx_lead_management_phone_id 
ON pipiolo_sdr_lead_management(phone_id);

CREATE INDEX IF NOT EXISTS idx_lead_management_sender 
ON pipiolo_sdr_lead_management(sender);

-- 13. FUNÇÃO PARA CONTAGEM DE LEADS COM STATUS REJECTED_POST_TRIGGER HOJE
CREATE OR REPLACE FUNCTION get_rejected_post_trigger_today()
RETURNS INTEGER AS $$
DECLARE
  rejected_count INTEGER;
BEGIN
  -- Contar leads com status 'rejected_post_trigger' criados hoje (usando created_at em GMT-3)
  SELECT COUNT(*) INTO rejected_count
  FROM pipiolo_sdr_lead_management
  WHERE DATE(created_at - INTERVAL '3 hours') = DATE(CURRENT_DATE)
    AND lead_conversation_status = 'rejected_post_trigger';
  
  RETURN rejected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. FUNÇÃO PARA TAXA DE CONVERSÃO DE LEADS CRIADOS HOJE
CREATE OR REPLACE FUNCTION get_conversion_rate_leads_created_today()
RETURNS DECIMAL AS $$
DECLARE
  total_leads_created_today INTEGER;
  converted_leads_created_today INTEGER;
  conversion_rate DECIMAL;
BEGIN
  -- Contar leads criados hoje (usando created_at em GMT-3)
  SELECT COUNT(*) INTO total_leads_created_today
  FROM pipiolo_sdr_lead_management
  WHERE DATE(created_at - INTERVAL '3 hours') = DATE(CURRENT_DATE);
  
  -- Contar leads criados hoje que já converteram (status = 'waiting_human')
  SELECT COUNT(*) INTO converted_leads_created_today
  FROM pipiolo_sdr_lead_management
  WHERE DATE(created_at - INTERVAL '3 hours') = DATE(CURRENT_DATE)
    AND lead_conversation_status = 'waiting_human';
  
  -- Calcular taxa de conversão
  IF total_leads_created_today > 0 THEN
    conversion_rate := (converted_leads_created_today::DECIMAL / total_leads_created_today) * 100;
  ELSE
    conversion_rate := 0;
  END IF;
  
  RETURN ROUND(conversion_rate, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. FUNÇÃO PARA CONVERSÕES DOS ÚLTIMOS 7 DIAS
CREATE OR REPLACE FUNCTION get_conversions_last_7_days()
RETURNS INTEGER AS $$
DECLARE
  conversions_count INTEGER;
BEGIN
  -- Contar conversões dos últimos 7 dias (usando updated_at em GMT-3)
  SELECT COUNT(*) INTO conversions_count
  FROM pipiolo_sdr_lead_management
  WHERE DATE(updated_at - INTERVAL '3 hours') >= DATE(CURRENT_DATE - INTERVAL '7 days')
    AND lead_conversation_status = 'waiting_human';
  
  RETURN conversions_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. FUNÇÃO COMBINADA PARA BUSCAR TODAS AS NOVAS MÉTRICAS
CREATE OR REPLACE FUNCTION get_enhanced_dashboard_metrics()
RETURNS TABLE(
  metric_name TEXT,
  metric_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'rejected_post_trigger'::TEXT, get_rejected_post_trigger_today()::DECIMAL
  UNION ALL
  SELECT 'conversion_rate_today'::TEXT, get_conversion_rate_leads_created_today()
  UNION ALL
  SELECT 'conversions_last_7_days'::TEXT, get_conversions_last_7_days()::DECIMAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INSTRUÇÕES DE USO:
-- 
-- 1. Execute este arquivo completo no Supabase SQL Editor
-- 2. Verifique se as funções foram criadas com sucesso
-- 3. Teste as funções:
--    SELECT * FROM get_conversation_count_by_sender();
--    SELECT * FROM get_dashboard_metrics();
--    SELECT * FROM get_general_stats();
--    SELECT * FROM get_conversations_with_lead_info();
--    SELECT * FROM get_messages_by_session('5511953441838@s.whatsapp.net');
-- ============================================================================ 