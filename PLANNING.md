# PLANNING.md - Dash Pipiolo SDR v1

## Visão Geral do Projeto

O **Dash Pipiolo SDR v1** é um sistema de dashboard para gerenciamento de conversas de vendas (SDR - Sales Development Representative) desenvolvido com React, TypeScript e Supabase. O projeto permite visualizar, filtrar e gerenciar conversas de WhatsApp com leads, incluindo suporte a mensagens de mídia (áudio, vídeo, imagem, documentos).

### Arquitetura Geral
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RPC)
- **Styling**: Tailwind CSS
- **Componentes**: Shadcn/ui + Custom Components

## Estrutura do Banco de Dados

### Tabelas Principais

#### 1. `pipiolo_sdr_chat_histories`
**Propósito**: Armazena todo o histórico de mensagens de chat

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `integer` | Chave primária (auto-incremento) |
| `session_id` | `varchar` | Identificador único da sessão/conversa |
| `message` | `jsonb` | Dados da mensagem (tipo: human/ai, conteúdo, timestamps) |
| `created_at` | `timestamp with time zone` | Data/hora da mensagem |
| `sender` | `varchar` | Identificador do remetente |
| `instance_name` | `varchar` | Nome da instância do bot |

**Índices**:
- `idx_chat_histories_sender_created`: Otimiza consultas por remetente e data
- `idx_chat_histories_sender_session`: Otimiza consultas por remetente e sessão
- `idx_chat_histories_session_created`: Otimiza consultas por sessão e data

**Triggers**:
- `trg_set_instance_name_and_sender_on_insert`: Define automaticamente instance_name e sender
- `trg_set_instance_name_on_insert`: Define automaticamente instance_name

#### 2. `pipiolo_sdr_lead_management`
**Propósito**: Gerencia informações completas dos leads

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `bigint` | Chave primária |
| `phone_id` | `varchar` | Identificador único do telefone (UNIQUE) |
| `phone_number` | `varchar` | Número de telefone |
| `name` | `varchar` | Nome do lead |
| `email` | `varchar` | Email do lead |
| `cpf` | `varchar` | CPF do lead |
| `cnpj` | `text` | CNPJ (para leads empresariais) |
| `corporate_name` | `text` | Razão social |
| `user_type` | `varchar` | Tipo de usuário |
| `customer_type` | `customer_type` | Enum: CPF, CNPJ |
| `crm_contact_id` | `varchar` | ID do contato no CRM |
| `crm_deal_id` | `varchar` | ID do negócio no CRM |
| `crm_deal_stage_id` | `varchar` | ID do estágio no CRM |
| `data` | `text` | Dados adicionais |
| `last_message_data` | `jsonb` | Dados da última mensagem |
| `next_follow_up_date` | `timestamp` | Data do próximo follow-up |
| `follow_up_stage` | `bigint` | Estágio do follow-up |
| `has_follow_upped` | `boolean` | Se já foi feito follow-up |
| `is_ai_enabled` | `boolean` | Se IA está habilitada |
| `user_source` | `jsonb` | Origem do usuário |
| `lead_conversation_status` | `lead_conversation_status` | Enum: rejected, proceeded, accepted, sale_completed |
| `lead_scoring` | `smallint` | Pontuação do lead |
| `path_source` | `varchar` | Fonte do lead |
| `full_address` | `text` | Endereço completo |
| `cep` | `text` | CEP |
| `desired_plan` | `text` | Plano desejado |
| `current_plan` | `text` | Plano atual |
| `active_loyalty_plan` | `text` | Plano de fidelidade ativo |
| `loyalty_expiration_date` | `date` | Data de expiração da fidelidade |
| `birth_date` | `date` | Data de nascimento |
| `instance_name` | `varchar` | Nome da instância |
| `sender` | `varchar` | Identificador do remetente |
| `manychat_id` | `varchar` | ID do ManyChat |
| `manychat_data` | `jsonb` | Dados do ManyChat |
| `chatwoot_*` | `integer/bigint` | IDs do Chatwoot |
| `offer_*_sent` | `boolean` | Flags de ofertas enviadas |
| `root_channel` | `varchar` | Canal raiz |
| `created_at` | `timestamp with time zone` | Data de criação |
| `updated_at` | `timestamp with time zone` | Data de atualização |

**Índices**:
- `idx_lead_management_phone_id`: Otimiza consultas por phone_id
- `idx_lead_management_sender`: Otimiza consultas por sender
- Constraint única em `phone_id`

**Triggers**:
- `update_updated_at_column_pipiolo_sdr_lead_management`: Atualiza automaticamente updated_at

#### 3. `pipiolo_sdr_sellers`
**Propósito**: Gerencia informações dos vendedores/SDRs

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `bigint` | Chave primária |
| `name` | `varchar` | Nome do vendedor |
| `role` | `varchar` | Função/cargo |
| `email` | `varchar` | Email (UNIQUE) |
| `avatar_url` | `text` | URL do avatar |
| `is_active` | `boolean` | Se está ativo |
| `created_at` | `timestamp with time zone` | Data de criação |
| `updated_at` | `timestamp with time zone` | Data de atualização |

**Índices**:
- `idx_pipiolo_sdr_sellers_active`: Otimiza consultas por status ativo
- `idx_pipiolo_sdr_sellers_email`: Otimiza consultas por email

**Triggers**:
- `update_pipiolo_sdr_sellers_updated_at`: Atualiza automaticamente updated_at

#### 4. `pipiolo_sdr_conversation_reads`
**Propósito**: Controla leituras de conversas pelos vendedores

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `bigint` | Chave primária |
| `phone_id` | `varchar` | ID do telefone |
| `seller_id` | `bigint` | ID do vendedor (FK → pipiolo_sdr_sellers) |
| `last_read_at` | `timestamp with time zone` | Última leitura |
| `read_count` | `integer` | Contador de leituras |
| `is_currently_viewing` | `boolean` | Se está visualizando atualmente |
| `created_at` | `timestamp with time zone` | Data de criação |
| `updated_at` | `timestamp with time zone` | Data de atualização |

**Relacionamentos**:
- `seller_id` → `pipiolo_sdr_sellers.id`

**Índices**:
- `idx_pipiolo_sdr_conversation_reads_phone_id`: Otimiza consultas por telefone
- `idx_pipiolo_sdr_conversation_reads_seller_id`: Otimiza consultas por vendedor
- Constraint única em `(phone_id, seller_id)`

**Triggers**:
- `update_pipiolo_sdr_conversation_reads_updated_at`: Atualiza automaticamente updated_at

#### 5. `sdr_alisson_vivo_vector_store`
**Propósito**: Armazena vetores para busca semântica (Vector DB)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `bigint` | Chave primária |
| `content` | `text` | Conteúdo textual |
| `metadata` | `jsonb` | Metadados do conteúdo |
| `embedding` | `vector` | Vetor de embedding |

### Tipos de Dados Customizados (Enums)

#### `customer_type`
- `CPF`: Cliente pessoa física
- `CNPJ`: Cliente pessoa jurídica

#### `lead_conversation_status`
- `rejected`: Rejeitado
- `proceeded`: Prosseguiu
- `accepted`: Aceito
- `sale_completed`: Venda concluída

### Funções RPC

#### `match_sdr_alisson_vivo_vector_store`
```sql
match_sdr_alisson_vivo_vector_store(
  query_embedding vector,
  match_count integer DEFAULT NULL,
  filter jsonb DEFAULT '{}'
)
```
**Retorna**: `TABLE(id bigint, content text, metadata jsonb, similarity double precision)`
**Propósito**: Busca semântica por similaridade de vetores

## Estrutura do Frontend

### Componentes Principais

#### Autenticação
- `LoginForm.tsx`: Formulário de login
- `ProtectedRoute.tsx`: Componente de rota protegida
- `ChangePasswordForm.tsx`: Formulário de alteração de senha

#### Componentes de Mídia (Upgrade Recente)
- `AudioMessage.tsx`: Componente para mensagens de áudio
- `VideoMessage.tsx`: Componente para mensagens de vídeo
- `ImageMessage.tsx`: Componente para mensagens de imagem
- `DocumentMessage.tsx`: Componente para mensagens de documento

#### Componentes Comuns
- `Badge.tsx`: Componente de badge
- `Button.tsx`: Componente de botão customizado
- `Card.tsx`: Componente de card
- `DateFilter.tsx`: Filtro de datas
- `FilterDropdown.tsx`: Dropdown de filtros
- `LoadingSpinner.tsx`: Indicador de carregamento
- `MetricCard.tsx`: Card de métricas
- `Pagination.tsx`: Componente de paginação
- `SearchInput.tsx`: Campo de busca

### Páginas
- `ChatViewerPage.tsx`: Página principal do visualizador de chat
- `LoginPage.tsx`: Página de login

### Serviços
- `chatService.ts`: Serviço para operações de chat
- `supabaseClient.ts`: Cliente do Supabase

### Hooks Customizados
- `useAuth.ts`: Hook de autenticação
- `useAsyncOperation.ts`: Hook para operações assíncronas

### Utilities
- `dateUtils.ts`: Utilidades para datas e detecção de tipos de mídia
- `imageUtils.ts`: Utilidades para imagens
- `testSupabase.ts`: Testes de conexão com Supabase

## Funcionalidades Implementadas

### 1. Autenticação
- Login com credenciais
- Rotas protegidas
- Contexto de autenticação
- Alteração de senha

### 2. Visualização de Chat
- Listagem de conversas
- Filtros por data, remetente, palavra-chave
- Paginação
- Busca em tempo real

### 3. Suporte a Mídia
- **Áudio**: Player com transcrição
- **Vídeo**: Player integrado
- **Imagem**: Preview com modal
- **Documento**: Download com ícones por tipo

### 4. Interface Responsiva
- Design mobile-first
- Componentes adaptativos
- Tailwind CSS

## Arquivos de Configuração

### Core
- `vite.config.ts`: Configuração do Vite
- `tsconfig.json`: Configuração do TypeScript
- `tailwind.config.js`: Configuração do Tailwind CSS
- `eslint.config.js`: Configuração do ESLint

### Deployment
- `package.json`: Dependências e scripts
- `postcss.config.js`: Configuração do PostCSS

## Melhorias Recentes

### Upgrade dos Componentes de Mídia
- Implementação de componentes específicos para cada tipo de mídia
- Design system com gradientes personalizados
- Detecção inteligente de tipos de mensagem
- Correção de bugs na identificação de transcrições

### Otimizações de Performance
- Índices otimizados para consultas frequentes
- Triggers automáticos para atualização de timestamps
- Paginação eficiente
- Carregamento lazy de componentes

## Próximos Passos

1. **Implementar filtros avançados**
   - Filtro por status do lead
   - Filtro por tipo de cliente
   - Filtro por vendedor responsável

2. **Adicionar métricas em tempo real**
   - Dashboard de estatísticas
   - Gráficos de conversão
   - Alertas de follow-up

3. **Melhorar UX**
   - Notificações push
   - Atalhos de teclado
   - Temas customizáveis

4. **Integração com CRM**
   - Sincronização automática
   - Webhooks para atualizações
   - API de terceiros

## Observações Técnicas

- O projeto utiliza o padrão **Component-Service-Hook** para organização
- Todos os componentes são **funcionais** com TypeScript
- O banco de dados utiliza **triggers** para automatização
- A busca semântica é implementada com **pgvector**
- O sistema de autenticação é baseado no **Supabase Auth**