# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Real Estate Luxury Properties Dashboard** for managing WhatsApp conversations with high-end property leads. The app displays chat histories, client information, and provides tools for real estate agents to manage their client conversations effectively.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server on localhost:5173
- `npm run build` - Build for production
- `npm run lint` - Run ESLint code checking
- `npm run preview` - Preview production build

### Testing Database Connection
- Run `node src/utils/testSupabase.ts` to test Supabase connection
- Check `docs/database/testing/` for SQL function testing scripts

## Architecture Overview

### Frontend Stack
- **React 18.3.1** with TypeScript and Vite
- **Tailwind CSS** with custom brand colors (magenta, purple, gold)
- **React Router** for navigation
- **Supabase** for backend/database
- **Lucide React** for icons

### Key Architectural Patterns
- **Service Layer**: `ChatService` class handles all business logic and API calls
- **Context API**: Authentication state managed through `AuthContext`
- **Protected Routes**: All main functionality behind authentication via `ProtectedRoute`
- **RPC Functions**: Database operations optimized with Supabase RPC functions with fallback strategy
- **Custom Hooks**: `useAuth`, `useAsyncOperation` for reusable logic

### Database Schema
Core tables:
- `imoveis_milionarios_chat_histories` - Chat message storage with WhatsApp integration
- `imoveis_milionarios_lead_management` - Client information and CRM data
- `imoveis_milionarios_sdr_seller` - Real estate agent management
- `imoveis_milionarios_conversation_reads` - Read status tracking per agent

## Code Organization

### Component Structure
- `components/auth/` - Authentication components (LoginForm, ChangePasswordForm, ProtectedRoute)
- `components/common/` - Reusable UI components (Button, Card, Badge, MediaMessage components)
- `pages/` - Main page components (ChatViewerPage, LoginPage)
- `services/` - Business logic layer (ChatService)
- `hooks/` - Custom React hooks
- `contexts/` - React Context providers
- `types/` - TypeScript type definitions
- `utils/` - Utility functions for dates, images, etc.

### Media Message Handling
The app supports multiple message types:
- **Text messages** - Standard chat messages
- **Audio messages** - WhatsApp voice notes with play controls
- **Video messages** - Video files with preview and download
- **Image messages** - Images with preview and download
- **Document messages** - PDF/document files with download links

Each media type has its own component in `components/common/`.

## Key Features

### Chat Management
- Real-time chat viewing with pagination
- Message type detection and rendering
- Read status tracking per seller
- Conversation status management
- AI response toggle per conversation

### Client Management (Real Estate)
- Client qualification scoring for luxury properties
- CRM data display with property preferences
- Agent assignment and territory management
- Client status tracking through sales pipeline
- Budget range and property type preferences

### Authentication
- Supabase Auth integration
- Session management
- Password change functionality
- Protected route system

## Database Functions

The app uses Supabase RPC functions for performance:
- `get_chat_messages_with_pagination` - Optimized chat loading
- `get_chat_overview` - Dashboard metrics
- `get_conversations_overview` - Conversation summaries

All RPC functions have fallback implementations in `ChatService` if the database functions fail.

## Styling & Theming

- **Tailwind CSS** with custom configuration
- **Brand colors**: Magenta (#e11d48), Purple (#8b5cf6), Gold (#f59e0b)
- **Custom shadows**: Magenta and purple glow effects
- **Brazilian Portuguese** UI text and date formatting
- **GMT-3 timezone** for all date operations

## Environment Setup

Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

Configure in `.env.local` file for development.

## Development Notes

### Performance Considerations
- Uses RPC functions for database-heavy operations
- Implements pagination for chat histories
- Lazy loading for message media
- Optimized image processing utilities

### Business Logic
- Client qualification system for luxury real estate
- Multiple WhatsApp instance support
- Property inquiry and viewing workflow
- Agent performance tracking and commission management

### File Structure Best Practices
- Keep authentication logic in `contexts/AuthContext.tsx`
- Add new UI components to `components/common/`
- Business logic belongs in `services/ChatService.ts`
- Database schema changes require migration scripts in `docs/database/`

# Security prompt:

Please check through all the code you just wrote and make sure it follows security best practices. make sure there are no sensitive information in the front and and there are no vulnerabilities that can be exploited

# MCP
Utilize os MCPs (Model Context Protocol) abaixo para determinadas tarefas.
supabase -> Utilizar para implementar soluções completas de backend incluindo:
    - Banco de dados PostgreSQL com RLS (Row Level Security)
    - Sistema de autenticação (GoTrue) com JWT
    - API RESTful automática via PostgREST
    - Armazenamento de arquivos (Storage)
    - Funcionalidades Realtime para colaboração
    - Edge Functions para lógica serverless
    - Seguir convenções snake_case para tabelas e campos
context7 -> Utilizar para acessar documentação oficial sempre atualizada de bibliotecas e frameworks.
@magicuidesign/mcp -> Utilizar para criar e implementar componentes modernos de UI, seguindo boas práticas de design, acessibilidade e responsividade. Priorizar componentes reutilizáveis e consistência visual.