# Especificação de Design - Tela de Login

## Visão Geral
Esta especificação detalha todos os elementos visuais e de design da tela de login do sistema Dashboard Agência Lendária para facilitar a adaptação em outros projetos.

## Layout Geral

### Estrutura da Página
- **Layout**: Tela cheia (min-height: 100vh)
- **Alinhamento**: Centralizado vertical e horizontalmente
- **Responsividade**: Container com max-width de 28rem (448px) em telas maiores
- **Padding**: 1rem (16px) nas bordas para dispositivos móveis

### Fundo da Página
- **Tipo**: Gradiente radial
- **Cores**: 
  - Início: `#111827` (brand-darker)
  - Meio: `#1F2937` (brand-dark) 
  - Fim: `#111827` (brand-darker)
- **Direção**: `from-brand-darker via-brand-dark to-brand-darker`
- **Classe Tailwind**: `bg-gradient-to-br`

## Seção do Logo e Título

### Logo
- **Arquivo**: `/logopipiolo.png`
- **Tamanho**: Height de 4rem (64px), width automático
- **Alinhamento**: Centralizado horizontalmente
- **Margem inferior**: 1rem (16px)

### Título Principal
- **Texto**: "Dashboard Agência Lendária"
- **Fonte**: Font-family padrão (Inter)
- **Tamanho**: 3xl (1.875rem/30px)
- **Peso**: Bold (font-weight: 700)
- **Cor**: `#C5B17F` (brand-gold)
- **Alinhamento**: Centralizado

### Subtítulo
- **Texto**: "Faça login para acessar o sistema"
- **Cor**: `#D1D5DB` (gray-300)
- **Margem superior**: 0.5rem (8px)
- **Alinhamento**: Centralizado

### Espaçamento
- **Margem inferior total da seção**: 2rem (32px)

## Card do Formulário

### Container Principal
- **Fundo**: Branco (#FFFFFF)
- **Bordas**: Arredondadas (border-radius: 0.5rem/8px)
- **Sombra**: Extra large shadow (shadow-xl)
- **Padding**: 2rem (32px) em todos os lados

### Espaçamento entre Elementos
- **Entre campos**: 1.5rem (24px) - classe `space-y-6`

## Campos de Input

### Labels
- **Texto**: "Email" e "Senha"
- **Tamanho**: Small (0.875rem/14px)
- **Peso**: Medium (font-weight: 500)
- **Cor**: `#374151` (gray-700)
- **Margem inferior**: 0.5rem (8px)

### Containers dos Inputs
- **Posicionamento**: Relativo para acomodar ícones
- **Estrutura**: Input com ícones à esquerda e direita

### Ícones dos Inputs
- **Email**: Ícone Mail (lucide-react)
- **Senha**: Ícone Lock (lucide-react)
- **Visualizar senha**: Eye/EyeOff (lucide-react)
- **Tamanho**: 1.25rem (20px) - `h-5 w-5`
- **Cor**: `#9CA3AF` (gray-400)
- **Posição esquerda**: 0.75rem (12px) do início
- **Posição direita**: 0.75rem (12px) do final

### Estilo dos Inputs
- **Width**: 100% do container
- **Padding**: 
  - Esquerda: 2.5rem (40px) para acomodar ícone
  - Direita: 0.75rem (12px) ou 3rem (48px) se houver botão
  - Vertical: 0.75rem (12px)
- **Border**: 1px solid `#D1D5DB` (gray-300)
- **Border-radius**: 0.375rem (6px)
- **Background**: Branco
- **Placeholder**: `#6B7280` (gray-500)

### Estados de Focus
- **Outline**: Removido
- **Ring**: 1px `#C5B17F` (brand-gold)
- **Border**: `#C5B17F` (brand-gold)
- **Placeholder**: `#9CA3AF` (gray-400)

### Placeholders
- **Email**: "seu@email.com"
- **Senha**: "••••••••"

## Mensagens de Erro

### Container
- **Background**: `#FEF2F2` (red-50)
- **Padding**: 0.75rem (12px)
- **Border-radius**: 0.375rem (6px)
- **Display**: Flex com items centralizados
- **Gap**: 0.5rem (8px)

### Ícone de Erro
- **Tipo**: AlertCircle (lucide-react)
- **Tamanho**: 1.25rem (20px)
- **Cor**: `#DC2626` (red-600)
- **Flex-shrink**: 0

### Texto do Erro
- **Tamanho**: Small (0.875rem/14px)
- **Cor**: `#DC2626` (red-600)

## Botão de Login

### Estilo Base
- **Variant**: Primary (conforme Button component)
- **Width**: 100% (fullWidth: true)
- **Background**: `#C5B17F` (brand-gold)
- **Cor do texto**: `#111827` (brand-darker)
- **Hover**: Background com 90% de opacidade
- **Padding**: 0.5rem (8px) vertical, base do componente
- **Border-radius**: 0.5rem (8px)
- **Font-weight**: Medium
- **Transition**: Todas as cores

### Estado de Loading
- **Texto**: "Entrando..."
- **Componente**: LoadingSpinner + texto
- **Gap**: 0.5rem (8px) entre spinner e texto

### Estado Normal
- **Texto**: "Entrar"

## Seção de Informações

### Container
- **Margem superior**: 1.5rem (24px)
- **Alinhamento**: Centralizado

### Linha 1
- **Texto**: "Dashboard interno da Agência Lendária"
- **Tamanho**: Extra small (0.75rem/12px)
- **Cor**: `#6B7280` (gray-500)

### Linha 2
- **Texto**: "Para acesso autorizado apenas"
- **Tamanho**: Extra small (0.75rem/12px)
- **Cor**: `#9CA3AF` (gray-400)
- **Margem superior**: 0.25rem (4px)

## Paleta de Cores

### Cores Principais da Marca
```css
--brand-magenta: #E91E63
--brand-magenta-light: #F8BBD9
--brand-magenta-dark: #AD1457
--brand-purple: #800080
--brand-purple-light: #B366B3
--brand-purple-dark: #4D004D
--brand-gold: #C5B17F
--brand-dark: #1F2937
--brand-darker: #111827
--brand-gray: #666666
```

### Cores do Sistema
```css
--white: #FFFFFF
--gray-300: #D1D5DB
--gray-400: #9CA3AF
--gray-500: #6B7280
--gray-700: #374151
--red-50: #FEF2F2
--red-600: #DC2626
```

## Tipografia

### Font Family
- **Principal**: Inter, sans-serif
- **Configuração**: Importada via web fonts ou sistema

### Tamanhos Utilizados
- **3xl**: 1.875rem (30px) - Título principal
- **Base**: 1rem (16px) - Inputs e botão
- **Small**: 0.875rem (14px) - Labels e erros
- **Extra Small**: 0.75rem (12px) - Informações finais

### Pesos Utilizados
- **Bold**: 700 - Título principal
- **Medium**: 500 - Labels e botão
- **Normal**: 400 - Texto geral

## Componentes Externos

### Ícones
- **Biblioteca**: lucide-react
- **Ícones utilizados**: Mail, Lock, Eye, EyeOff, AlertCircle
- **Tamanho padrão**: 20px (h-5 w-5)

### Dependências de Estilo
- **Framework**: Tailwind CSS
- **Componentes customizados**: Button, LoadingSpinner

## Estados Interativos

### Loading Global
- **Indicador**: LoadingSpinner centralizado
- **Background**: Mesma estrutura da tela principal
- **Condição**: Quando `authLoading` é true

### Loading do Formulário
- **Campos desabilitados**: Opacity reduzida
- **Botão**: Spinner + texto "Entrando..."
- **Botão de senha**: Desabilitado

### Validação
- **Tempo real**: Limpa erros ao digitar
- **Envio**: Valida antes do submit
- **Feedback**: Mensagens específicas por tipo de erro

## Responsividade

### Breakpoints
- **Mobile**: Padding de 1rem nas bordas
- **Desktop**: Container com max-width de 28rem
- **Centralização**: Mantida em todas as telas

### Adaptações
- **Imagens**: Responsivas (width auto)
- **Textos**: Tamanhos fixos, legíveis em mobile
- **Formulário**: Largura total do container sempre