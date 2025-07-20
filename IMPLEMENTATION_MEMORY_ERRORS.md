# 🧠 MEMÓRIA DE ERROS DE IMPLEMENTAÇÃO - PROJETO DASHBOARD

## 📝 Registro de Erros e Soluções

### 🔐 AUTENTICAÇÃO

#### 1. Erro: "Session não persiste após refresh"
**Problema:** Usuário é deslogado ao recarregar a página
**Solução:** Implementar `getSession()` no useEffect do AuthProvider
**Código:** 
```typescript
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setLoading(false);
  });
}, []);
```

#### 2. Erro: "Redirect loops infinitos"
**Problema:** Usuário fica em loop entre login e dashboard
**Solução:** Verificar estado de loading antes de redirectionar
**Código:**
```typescript
if (loading) return <LoadingSpinner />;
if (!session && !loading) return <Navigate to="/login" />;
```

#### 3. Erro: "Supabase Auth não inicializa"
**Problema:** onAuthStateChange não funciona
**Solução:** Configurar listener corretamente e fazer cleanup
**Código:**
```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
      setLoading(false);
    }
  );
  return () => subscription.unsubscribe();
}, []);
```

#### 4. Erro: "Invalid login credentials"
**Problema:** Credenciais corretas não funcionam
**Solução:** Verificar se confirmação de email está desabilitada no Supabase
**Configuração:** Authentication > Settings > Email confirmation = disabled

#### 5. Erro: "Tipos TypeScript incorretos"
**Problema:** Session e User types não são tipados
**Solução:** Usar tipos do Supabase Auth
**Código:**
```typescript
import { Session, User } from '@supabase/supabase-js';
```

### 📱 COMPONENTES REACT

#### 6. Erro: "Component re-renders infinitos"
**Problema:** useEffect sem dependências corretas
**Solução:** Sempre incluir todas as dependências no array
**Código:**
```typescript
useEffect(() => {
  // função
}, [dependency1, dependency2]); // incluir TODAS as dependências
```

#### 7. Erro: "State não atualiza"
**Problema:** Mutação direta do estado
**Solução:** Sempre criar novo objeto/array
**Código:**
```typescript
// ❌ Errado
state.push(newItem);
setState(state);

// ✅ Correto  
setState(prev => [...prev, newItem]);
```

### 🎨 TAILWIND CSS

#### 8. Erro: "Classes não aplicam"
**Problema:** Classes dinâmicas não são detectadas
**Solução:** Incluir classes completas no HTML ou usar safelist
**Configuração:**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    'bg-brand-gold',
    'text-brand-darker'
  ]
}
```

### 🗄️ SUPABASE

#### 9. Erro: "RLS Policy blocks data"
**Problema:** Row Level Security bloqueia consultas
**Solução:** Verificar políticas ou usar service_role key para admin
**SQL:**
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'nome_da_tabela';
```

#### 10. Erro: "Environment variables undefined"
**Problema:** Variáveis de ambiente não carregam
**Solução:** Prefixar com VITE_ e reiniciar servidor
**Exemplo:**
```env
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave
```

### 🔄 REACT ROUTER

#### 11. Erro: "Navigate não funciona"
**Problema:** Navigate usado fora do Router context
**Solução:** Garantir que componente está dentro de BrowserRouter
**Código:**
```typescript
// App.tsx
<BrowserRouter>
  <AuthProvider>
    <Routes>...</Routes>
  </AuthProvider>
</BrowserRouter>
```

### 📦 VITE

#### 12. Erro: "Module not found"
**Problema:** Imports relativos incorretos
**Solução:** Usar caminhos absolutos ou verificar tsconfig
**Configuração:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    }
  }
}
```

## 🔧 CONFIGURAÇÕES IMPORTANTES

### Supabase Auth Settings:
- Email confirmation: **DISABLED** ❌
- Password requirements: min 6 chars
- JWT expiry: 1 hour
- Refresh token expiry: 30 days
- Enable third-party providers: conforme necessário

### Environment Variables:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### TypeScript Settings:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## 📋 CHECKLIST DE DEBUG

### Quando algo não funciona:

#### 🔍 **Verificações Básicas:**
- [ ] Console do navegador (F12)
- [ ] Network tab para requisições
- [ ] Verificar se variáveis de ambiente estão carregadas
- [ ] Confirmar se servidor de desenvolvimento está rodando
- [ ] Verificar se há erros de TypeScript

#### 🔍 **Verificações Supabase:**
- [ ] URL e chave estão corretas
- [ ] Projeto Supabase está ativo
- [ ] Políticas RLS estão configuradas
- [ ] Tabelas existem e têm dados

#### 🔍 **Verificações React:**
- [ ] Componente está dentro dos Providers necessários
- [ ] Props estão sendo passadas corretamente
- [ ] Estados estão sendo atualizados corretamente
- [ ] useEffect tem dependências corretas

## 📞 PROCESSO DE RESOLUÇÃO

### 1. **Identificar o Erro**
- Ler mensagem de erro completa
- Verificar onde o erro ocorre
- Reproduzir o erro consistentemente

### 2. **Debuggar**
- Usar console.log estratégicos
- Verificar valores de variáveis
- Testar em partes menores

### 3. **Pesquisar**
- Consultar documentação oficial
- Procurar em Stack Overflow
- Verificar GitHub issues

### 4. **Documentar**
- Adicionar erro e solução neste arquivo
- Incluir código de exemplo
- Marcar data e contexto

## 📅 LOG DE ERROS

### Data: [INSERIR DATA]
**Erro:** [Descrição do erro]
**Contexto:** [Onde/quando aconteceu]
**Solução:** [Como foi resolvido]
**Código:**
```typescript
// código da solução
```

---

## ⚠️ ATENÇÃO - PONTOS CRÍTICOS

### 🔴 **NUNCA ESQUECER:**
1. Sempre verificar console de erros primeiro
2. Usar TypeScript rigorosamente
3. Testar em navegador privado
4. Fazer backup antes de mudanças grandes
5. Documentar novos erros neste arquivo

### 🟡 **BOAS PRÁTICAS:**
1. Usar try/catch em operações async
2. Validar props com TypeScript
3. Implementar loading states
4. Fazer cleanup de useEffect
5. Testar em diferentes dispositivos

## 🎯 COMO USAR ESTE ARQUIVO

1. **Ao encontrar um erro:** Primeiro consulte este arquivo
2. **Ao resolver um erro:** Documente a solução aqui
3. **Antes de implementar:** Revise erros comuns da área
4. **Durante debug:** Use os checklists fornecidos
5. **Ao final do projeto:** Revisar e organizar o conteúdo

---

*Última atualização: 04/07/2025 - Implementação de Autenticação Completa* 