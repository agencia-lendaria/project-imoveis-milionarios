# 🧹 LIMPEZA DO REPOSITÓRIO - REMOÇÃO DE ARQUIVOS DESNECESSÁRIOS

## ⚠️ **IMPORTANTE**
Estes comandos irão remover arquivos do repositório GitHub que não são necessários para o projeto final.

---

## 📋 **1. VERIFICAR STATUS ATUAL**
```bash
git status
```

## 📋 **2. REMOVER ARQUIVOS DE DOCUMENTAÇÃO TEMPORÁRIA**
```bash
# Documentação de desenvolvimento (temporária)
git rm AUTH_CREDENTIALS.md
git rm CHANGE_PASSWORD_GUIDE.md
git rm COMANDOS_COMMIT.md
git rm CURSOR_ERRORS.md
git rm "EXEMPLO_MELHORIAS_VISUAIS.MD"
git rm GUIA_REVERSAO.md
git rm IMPLEMENTATION_GUIDE.md
git rm IMPLEMENTATION_MEMORY_ERRORS.md
git rm LOGIN_DESIGN_SPECIFICATION.md
git rm MEDIA_COMPONENTS_UPGRADE.md
git rm OPTIMIZATION_SUMMARY.md
git rm PLANNING.md
git rm RPC_FUNCTIONS_DEPLOYED.md
git rm TEST_MILANO_THEME.md
git rm TRANSFORMATION_CHECKLIST.md
```

## 📋 **3. REMOVER ARQUIVOS SQL TEMPORÁRIOS**
```bash
# Scripts SQL de desenvolvimento
git rm revert_database_changes.sql
git rm supabase_rpc_functions.sql
git rm teste_sender_principal.sql
git rm verificacao_rpc.sql
```

## 📋 **4. REMOVER LOGOS ANTIGOS/TEMPORÁRIOS**
```bash
# Logos não utilizados
git rm logo-lendario-v3.png
git rm logopipiolo.png
git rm L-Agencia-Lendaria-White-32.svg
```

## 📋 **5. REMOVER ARQUIVOS DE BACKUP E TESTE**
```bash
# Arquivos de backup e teste
git rm src/utils/dateUtils.ts.backup
git rm src/utils/testSupabase.ts
```

## 📋 **6. REMOVER ARQUIVOS BUILD NA RAIZ**
```bash
# Arquivos que devem estar apenas em public/
git rm favicon.ico
git rm logo-duomo.png
# (mantendo apenas em public/)
```

## 📋 **7. ADICIONAR .GITIGNORE ATUALIZADO**
```bash
git add .gitignore
```

## 📋 **8. VERIFICAR STATUS**
```bash
git status
```

## 📋 **9. COMMIT DAS MUDANÇAS**
```bash
git commit -m "chore: limpeza do repositório - remoção de arquivos desnecessários

🧹 Arquivos removidos:
- Documentação temporária de desenvolvimento (*.md)
- Scripts SQL temporários (*.sql)
- Logos antigos não utilizados
- Arquivos de backup e teste
- Build files duplicados na raiz

✅ Melhorias:
- .gitignore atualizado para prevenir commits futuros
- Repositório mais limpo e organizado
- Apenas arquivos essenciais mantidos
- Logos mantidos apenas em public/

🎯 Resultado: Repositório otimizado com apenas arquivos necessários para o projeto.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## 📋 **10. PUSH DAS MUDANÇAS**
```bash
git push origin main
```

## 📋 **11. VERIFICAR RESULTADO**
```bash
git log --oneline -1
```

---

## 🎯 **RESUMO DA EXECUÇÃO**

Execute os comandos **na ordem** mostrada acima:

1. `git status`
2. Execute todos os `git rm` por categoria
3. `git add .gitignore`
4. `git status`
5. Cole o comando `git commit` completo
6. `git push origin main`
7. `git log --oneline -1`

---

## ✅ **ARQUIVOS QUE SERÃO MANTIDOS**

### 📁 **Arquivos Essenciais:**
- `README.md` - Documentação principal
- `CLAUDE.md` - Instruções do projeto
- `package.json` e `package-lock.json`
- `tailwind.config.js`, `vite.config.ts`, etc.

### 📁 **Código Fonte:**
- `src/` - Todo o código da aplicação
- `public/` - Assets públicos (logo-duomo.png, logopipiolo.png)
- `index.html` - Página principal

### 📁 **Configuração:**
- `.gitignore` (atualizado)
- Arquivos TypeScript config
- ESLint config

---

## 🧹 **ARQUIVOS QUE SERÃO REMOVIDOS**

### 📝 **Documentação Temporária (16 arquivos):**
- AUTH_CREDENTIALS.md
- CHANGE_PASSWORD_GUIDE.md
- COMANDOS_COMMIT.md
- CURSOR_ERRORS.md
- EXEMPLO_MELHORIAS_VISUAIS.MD
- GUIA_REVERSAO.md
- IMPLEMENTATION_GUIDE.md
- IMPLEMENTATION_MEMORY_ERRORS.md
- LOGIN_DESIGN_SPECIFICATION.md
- MEDIA_COMPONENTS_UPGRADE.md
- OPTIMIZATION_SUMMARY.md
- PLANNING.md
- RPC_FUNCTIONS_DEPLOYED.md
- TEST_MILANO_THEME.md
- TRANSFORMATION_CHECKLIST.md

### 🗄️ **Scripts SQL Temporários (4 arquivos):**
- revert_database_changes.sql
- supabase_rpc_functions.sql
- teste_sender_principal.sql
- verificacao_rpc.sql

### 🖼️ **Logos Antigos (3 arquivos):**
- logo-lendario-v3.png
- logopipiolo.png
- L-Agencia-Lendaria-White-32.svg

### 🔧 **Arquivos de Desenvolvimento (4 arquivos):**
- src/utils/dateUtils.ts.backup
- src/utils/testSupabase.ts
- favicon.ico (raiz)
- logo-duomo.png (raiz)

**Total**: 27 arquivos serão removidos

---

## 🎉 **RESULTADO FINAL**

Repositório limpo e organizado com apenas:
- ✅ Código fonte essencial
- ✅ Configuração necessária  
- ✅ README.md e CLAUDE.md
- ✅ Assets em public/
- ✅ .gitignore atualizado

**Status**: 🧹 **PRONTO PARA LIMPEZA!**