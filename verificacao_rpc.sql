-- 🧪 VERIFICAÇÃO DAS RPC FUNCTIONS

-- 1. Testar RPC function para contagem de conversas por sender
SELECT 'Teste RPC: get_conversation_count_by_sender' as teste;
SELECT * FROM get_conversation_count_by_sender();

-- 2. Verificar conversas com sender NULL
SELECT 'Teste: Conversas com sender NULL' as teste;
SELECT 
  COUNT(DISTINCT session_id) as conversas_sem_sender,
  COUNT(*) as mensagens_sem_sender
FROM pipiolo_sdr_chat_histories 
WHERE sender IS NULL;

-- 3. Verificar total de conversas únicas no banco
SELECT 'Teste: Total de conversas únicas' as teste;
SELECT COUNT(DISTINCT session_id) as total_conversas
FROM pipiolo_sdr_chat_histories;

-- 4. Comparar totais (deve ser matemática consistente)
SELECT 'Teste: Verificação matemática' as teste;
WITH sender_totals AS (
  SELECT 
    sender,
    COUNT(DISTINCT session_id) as conversas
  FROM pipiolo_sdr_chat_histories
  GROUP BY sender
),
total_calc AS (
  SELECT 
    SUM(conversas) as soma_por_sender,
    (SELECT COUNT(DISTINCT session_id) FROM pipiolo_sdr_chat_histories) as total_real
  FROM sender_totals
)
SELECT 
  soma_por_sender,
  total_real,
  CASE 
    WHEN soma_por_sender = total_real THEN '✅ CONSISTENTE' 
    ELSE '❌ INCONSISTENTE' 
  END as status
FROM total_calc;

-- 5. Verificar dados específicos do manychat
SELECT 'Teste: Conversas do manychat' as teste;
SELECT COUNT(DISTINCT session_id) as conversas_manychat
FROM pipiolo_sdr_chat_histories 
WHERE sender = 'manychat';

-- 6. Distribuição completa por sender
SELECT 'Teste: Distribuição por sender' as teste;
SELECT 
  COALESCE(sender, 'NULL') as sender,
  COUNT(DISTINCT session_id) as conversas,
  COUNT(*) as mensagens
FROM pipiolo_sdr_chat_histories
GROUP BY sender
ORDER BY conversas DESC; 