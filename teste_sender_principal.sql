-- 🧪 TESTE DA LÓGICA DE SENDER PRINCIPAL
-- Execute esta query no Supabase SQL Editor para verificar a consistência

-- 1. Análise de conversas com múltiplos senders
WITH conversation_analysis AS (
  SELECT 
    session_id,
    sender,
    COUNT(*) as message_count,
    MIN(created_at) as first_message
  FROM pipiolo_sdr_chat_histories 
  WHERE sender IS NOT NULL
  GROUP BY session_id, sender
),
multi_sender_conversations AS (
  SELECT 
    session_id,
    COUNT(*) as sender_count
  FROM conversation_analysis
  GROUP BY session_id
  HAVING COUNT(*) > 1
),
conversation_owners AS (
  SELECT 
    ca.session_id,
    ca.sender as principal_sender,
    ca.message_count,
    ROW_NUMBER() OVER (
      PARTITION BY ca.session_id 
      ORDER BY ca.message_count DESC, ca.first_message ASC
    ) as rn
  FROM conversation_analysis ca
)

-- 2. Resultado: Contagem por sender principal
SELECT 
  'CONTAGEM POR SENDER PRINCIPAL' as teste,
  co.principal_sender,
  COUNT(*) as conversations_owned
FROM conversation_owners co
WHERE co.rn = 1
GROUP BY co.principal_sender
ORDER BY conversations_owned DESC;

-- 3. Verificar conversas com múltiplos senders
SELECT 
  'CONVERSAS COM MÚLTIPLOS SENDERS' as teste,
  COUNT(*) as total_conversations_with_multiple_senders
FROM multi_sender_conversations;

-- 4. Verificar total de conversas únicas
SELECT 
  'TOTAL DE CONVERSAS ÚNICAS' as teste,
  COUNT(DISTINCT session_id) as total_unique_conversations
FROM pipiolo_sdr_chat_histories
WHERE sender IS NOT NULL;

-- 5. Verificar manychat especificamente
SELECT 
  'ANÁLISE MANYCHAT' as teste,
  COUNT(*) as conversations_owned_by_manychat
FROM conversation_owners
WHERE rn = 1 AND principal_sender = 'manychat';

-- 6. Verificação matemática (soma deve ser igual ao total)
WITH sender_totals AS (
  SELECT 
    co.principal_sender,
    COUNT(*) as conversations_owned
  FROM conversation_owners co
  WHERE co.rn = 1
  GROUP BY co.principal_sender
)
SELECT 
  'VERIFICAÇÃO MATEMÁTICA' as teste,
  SUM(conversations_owned) as soma_das_partes,
  (SELECT COUNT(DISTINCT session_id) FROM pipiolo_sdr_chat_histories WHERE sender IS NOT NULL) as total_real,
  CASE 
    WHEN SUM(conversations_owned) = (SELECT COUNT(DISTINCT session_id) FROM pipiolo_sdr_chat_histories WHERE sender IS NOT NULL)
    THEN '✅ CONSISTENTE' 
    ELSE '❌ INCONSISTENTE' 
  END as status
FROM sender_totals; 