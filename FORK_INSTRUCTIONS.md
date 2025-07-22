# 📋 Instruções para Fork: SDR Agência Lendária

## 🎯 **Objetivo**
Criar um fork do projeto atual para usar tabelas com prefixo `sdr_agencia_lendaria_`

---

## 📂 **1. Preparação do Fork**

### **Clonar o Projeto**
```bash
# Clonar o repositório atual
git clone [URL_DO_REPO_ATUAL] sdr-agencia-lendaria-app
cd sdr-agencia-lendaria-app

# Remover origem e adicionar nova (se necessário)
git remote remove origin
git remote add origin [URL_DO_NOVO_REPO]
```

### **Alterar Identificação do Projeto**

**📝 package.json:**
```json
{
  "name": "sdr-agencia-lendaria-app",
  "version": "1.0.0",
  "private": true,
  "type": "module"
  // ... resto permanece igual
}
```

**📝 index.html:**
```html
<title>Dashboard SDR Agência Lendária</title>
```

---

## 🔧 **2. Configurar Variáveis de Ambiente**

**📝 .env:**
```env
# Variáveis de ambiente do Supabase
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzY3J4dWtya3dudXJrenFmanR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MDc5NTcsImV4cCI6MjA1NjE4Mzk1N30.e3aXYge4yU5RXLbYpNt4DdQhFC6nmaAtxV60WNthjVk
VITE_SUPABASE_URL=https://tscrxukrkwnurkzqfjty.supabase.co

# 🚨 MUDANÇA PRINCIPAL: Novo prefixo
VITE_PROJECT_PREFIX=sdr_agencia_lendaria

# Credenciais (manter ou atualizar conforme necessário)
login: agencia@academialendaria.ai
senha: 123456@Ag
```

**⚠️ IMPORTANTE**: A única mudança necessária no código é alterar a variável `VITE_PROJECT_PREFIX`!

---

## 🗄️ **3. Verificação de Tabelas no Banco**

### **Tabelas Existentes Confirmadas:**
- ✅ `sdr_agencia_lendaria_chat_histories`
- ✅ `sdr_agencia_lendaria_lead_management`

### **Tabelas que Podem Estar Faltando:**
Se necessário, crie estas tabelas baseadas nas do projeto atual:
- ❓ `sdr_agencia_lendaria_sdr_seller`
- ❓ `sdr_agencia_lendaria_conversation_reads`

---

## 🔧 **4. Funções RPC a Serem Criadas**

### **Execute no Supabase (SQL Editor):**

#### **4.1. Conversations Overview**
```sql
CREATE OR REPLACE FUNCTION public.get_sdr_agencia_lendaria_conversations_overview(sender_filter text DEFAULT NULL::text)
 RETURNS TABLE(session_id text, sender text, last_message_date timestamp with time zone, message_count bigint, lead_name text, lead_phone_id text, lead_scoring text, crm_deal_stage_id text, is_ai_enabled boolean, lead_conversation_status text, last_message_data jsonb, instance_name text, manychat_id text, manychat_data jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    conversations.session_id::TEXT,
    COALESCE(conversations.sender, 'Sem origem')::TEXT as sender,
    conversations.last_message_date,
    conversations.message_count,
    COALESCE(lm.name, 'Sem nome')::TEXT as lead_name,
    lm.phone_id::TEXT as lead_phone_id,
    lm.lead_scoring::TEXT,
    lm.crm_deal_stage_id::TEXT,
    COALESCE(lm.is_ai_enabled, true) as is_ai_enabled,
    lm.lead_conversation_status::TEXT,
    lm.last_message_data,
    lm.instance_name::TEXT,
    NULL::TEXT as manychat_id,
    NULL::JSONB as manychat_data
  FROM (
    SELECT 
      h.session_id,
      h.sender,
      MAX(h.created_at) as last_message_date,
      COUNT(*) as message_count
    FROM sdr_agencia_lendaria_chat_histories h
    WHERE (
      sender_filter IS NULL OR 
      h.sender = sender_filter OR
      (sender_filter = 'Sem origem' AND h.sender IS NULL)
    )
    GROUP BY h.session_id, h.sender
  ) conversations
  LEFT JOIN sdr_agencia_lendaria_lead_management lm ON conversations.session_id = lm.phone_id
  ORDER BY conversations.last_message_date DESC;
END;
$function$;
```

#### **4.2. Chat Overview**
```sql
CREATE OR REPLACE FUNCTION public.get_sdr_agencia_lendaria_chat_overview()
 RETURNS TABLE(sender text, conversation_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(h.sender, 'Sem origem')::TEXT as sender,
    COUNT(DISTINCT h.session_id) as conversation_count
  FROM sdr_agencia_lendaria_chat_histories h
  GROUP BY h.sender
  ORDER BY conversation_count DESC;
END;
$function$;
```

#### **4.3. Chat Messages with Pagination**
```sql
CREATE OR REPLACE FUNCTION public.get_sdr_agencia_lendaria_chat_messages_with_pagination(
  p_session_id text,
  p_sender_filter text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
 RETURNS TABLE(
   id integer,
   session_id text,
   sender text,
   message jsonb,
   created_at timestamp with time zone,
   instance_name text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.session_id::TEXT,
    h.sender::TEXT,
    h.message,
    h.created_at,
    h.instance_name::TEXT
  FROM sdr_agencia_lendaria_chat_histories h
  WHERE h.session_id = p_session_id
    AND (p_sender_filter IS NULL OR h.sender = p_sender_filter)
  ORDER BY h.created_at ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;
```

---

## ✅ **5. Testes e Validação**

### **Comandos para Executar:**
```bash
# 1. Instalar dependências
npm install

# 2. Verificar build
npm run build

# 3. Rodar em desenvolvimento
npm run dev

# 4. Abrir no navegador
# Acesse: http://localhost:5173
```

### **Checklist de Validação:**
- [ ] ✅ Build passa sem erros
- [ ] ✅ Aplicação carrega no navegador
- [ ] ✅ Dashboard mostra métricas corretas
- [ ] ✅ Lista de conversas carrega
- [ ] ✅ Mensagens de conversa carregam
- [ ] ✅ Não há dados de outros projetos

---

## 🚀 **6. Vantagens do Sistema de Prefixos**

### **✨ Por que isso é tão simples:**
- ✅ **Zero código alterado**: Apenas `.env` muda
- ✅ **Isolamento automático**: Cada projeto usa suas tabelas
- ✅ **Performance otimizada**: RPC específicas do projeto
- ✅ **Manutenção fácil**: Sistema centralizado em `src/config/tables.ts`
- ✅ **Escalável**: Pode criar quantos projetos quiser

### **🔥 Resultado Esperado:**
**Novo projeto funcionando em ~10 minutos!** 🎉

---

## 🆘 **7. Troubleshooting**

### **Problema: Tabelas não encontradas**
- Verifique se as tabelas `sdr_agencia_lendaria_*` existem no banco
- Confirme se `VITE_PROJECT_PREFIX` está correto no `.env`

### **Problema: Funções RPC não funcionam**
- Execute os scripts SQL no Supabase SQL Editor
- Verifique se as funções foram criadas: `SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%sdr_agencia_lendaria%';`

### **Problema: Dados de outros projetos aparecem**
- Confirme que `.env` tem `VITE_PROJECT_PREFIX=sdr_agencia_lendaria`
- Reinicie o servidor de desenvolvimento (`npm run dev`)

---

## 📞 **8. Suporte**

Se encontrar problemas:
1. Verifique se seguiu todos os passos
2. Confirme que as tabelas existem no banco
3. Teste as funções RPC diretamente no Supabase
4. Verifique os logs do console do navegador

**🎯 Meta**: Sistema completamente isolado e funcional para SDR Agência Lendária!