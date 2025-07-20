-- ============================================================================
-- SCRIPT DE REVERSÃO - REMOVER TODAS AS MODIFICAÇÕES DO BANCO
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================================================

-- 📋 RESUMO DAS MODIFICAÇÕES A SEREM REVERTIDAS:
-- ✅ 4 Funções RPC criadas
-- ✅ 3 Índices criados

-- ============================================================================
-- 1. REMOVER FUNÇÕES RPC CRIADAS
-- ============================================================================

-- Remover função: get_conversation_count_by_sender()
DROP FUNCTION IF EXISTS get_conversation_count_by_sender();

-- Remover função: get_dashboard_metrics()
DROP FUNCTION IF EXISTS get_dashboard_metrics(TEXT);

-- Remover função: get_conversations_by_sender()
DROP FUNCTION IF EXISTS get_conversations_by_sender(TEXT, INTEGER, INTEGER);

-- Remover função: get_general_stats()
DROP FUNCTION IF EXISTS get_general_stats();

-- ============================================================================
-- 2. REMOVER ÍNDICES CRIADOS
-- ============================================================================

-- Remover índice: idx_chat_histories_sender_session
DROP INDEX IF EXISTS idx_chat_histories_sender_session;

-- Remover índice: idx_chat_histories_session_created
DROP INDEX IF EXISTS idx_chat_histories_session_created;

-- Remover índice: idx_chat_histories_sender_created
DROP INDEX IF EXISTS idx_chat_histories_sender_created;

-- ============================================================================
-- 3. VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se as funções foram removidas
SELECT 'Verificando funções restantes:' as status;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'get_conversation_count_by_sender',
    'get_dashboard_metrics',
    'get_conversations_by_sender',
    'get_general_stats'
  );

-- Verificar se os índices foram removidos
SELECT 'Verificando índices restantes:' as status;
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'pipiolo_sdr_chat_histories'
  AND indexname IN (
    'idx_chat_histories_sender_session',
    'idx_chat_histories_session_created',
    'idx_chat_histories_sender_created'
  );

-- ============================================================================
-- 4. MENSAGEM DE CONFIRMAÇÃO
-- ============================================================================

SELECT 
    '✅ REVERSÃO COMPLETA!' as status,
    'Todas as modificações foram removidas do banco de dados.' as message,
    'O banco agora está no estado original.' as result;

-- ============================================================================
-- INSTRUÇÕES:
-- 1. Execute este arquivo completo no Supabase SQL Editor
-- 2. Verifique se não há erros na execução
-- 3. As verificações finais mostrarão se a reversão foi bem-sucedida
-- 4. Se alguma função ou índice ainda aparecer, execute os comandos DROP individualmente
-- ============================================================================ 