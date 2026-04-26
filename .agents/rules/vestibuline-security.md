---
trigger: always_on
---

# Antigravity Rules — Segurança & Variáveis de Ambiente
# vestibuline | NextJS + BFF Java + JWT | v1.0 2026

## CONTEXTO DE SEGURANÇA

O vestibuline protege todas as rotas autenticadas via **JWT emitido pelo BFF Java**. O token é decodificado exclusivamente pelo arquivo `src/app/service/jwtDecoder.ts`. Nenhuma outra camada da aplicação deve tocar, validar ou decodificar o JWT diretamente.

Todas as chaves de API, URLs de serviços, IPs de máquina e credenciais vivem exclusivamente no arquivo `.env` — nunca expostos no código-fonte.

---

## REGRA 1 — JWT: Único Ponto de Decodificação

O arquivo `src/app/service/jwtDecoder.ts` é o **único lugar** da aplicação autorizado a decodificar e validar o JWT. Nunca replicar essa lógica em outro arquivo, componente ou Route Handler.

```ts
// ✅ src/app/service/jwtDecoder.ts — único ponto de decodificação
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function decodeJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch {
    throw new Error('Token inválido ou expirado')
  }
}

// ❌ ERRADO — decodificar JWT fora do jwtDecoder.ts
// src/app/api/ranking/route.ts
import jwt from 'jsonwebtoken'
const decoded = jwt.decode(token) // PROIBIDO — lógica duplicada e insegura
```

---

## REGRA 2 — Proteção de Rotas: Server-Side Sempre

A validação do JWT deve ocorrer **sempre no servidor**, nunca no cliente. Toda rota protegida deve chamar `decodeJWT` antes de qualquer acesso a dados.

```ts
// ✅ src/app/api/profile/route.ts — validação server-side
import { NextRequest, NextResponse } from 'next/server'
import { decodeJWT } from '@/app/service/jwtDecoder'

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    )
  }

  try {
    const payload = await decodeJWT(token)
    // payload contém os dados do aluno — prosseguir com a requisição
    const data = await fetchBFF(`/profile/${payload.sub}`, token)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Token inválido ou expirado' },
      { status: 401 }
    )
  }
}

// ❌ ERRADO — validar token no Client Component
'use client'
const token = localStorage.getItem('token')
const decoded = JSON.parse(atob(token.split('.')[1])) // NUNCA fazer isso
```

---

## REGRA 3 — Variáveis de Ambiente: Regras Absolutas

Toda chave de API, URL de serviço, IP de máquina, credencial ou secret **deve** viver no `.env`. Nunca escrever esses valores diretamente no código-fonte.

### Nomenclatura obrigatória

```bash
# .env

# BFF Java
BFF_URL=http://ip-da-maquina:porta

# Autenticação
JWT_SECRET=seu-secret-aqui

# Serviços externos
NEXT_PUBLIC_ANALYTICS_ID=id-publico   # NEXT_PUBLIC_ apenas para o que o browser PRECISA ver
PAYMENT_API_KEY=chave-privada         # sem NEXT_PUBLIC_ — apenas server-side
EMAIL_SERVICE_KEY=chave-privada

# Ambiente
NODE_ENV=development
```

### Prefixo `NEXT_PUBLIC_` — usar com extremo critério

```
NEXT_PUBLIC_  →  exposta ao browser (bundle client-side)
               →  usar APENAS para IDs públicos não-secretos
               →  exemplos válidos: analytics ID, feature flags públicas

sem prefixo   →  disponível apenas no servidor
               →  usar para TUDO que for sensível:
                  JWT_SECRET, BFF_URL, API keys, IPs, credenciais
```

```ts
// ✅ CORRETO — variável sensível acessada só no servidor
const bffUrl = process.env.BFF_URL // Route Handler ou Server Component

// ❌ ERRADO — secret exposto no client bundle
const secret = process.env.NEXT_PUBLIC_JWT_SECRET // NUNCA fazer isso
```

---

## REGRA 4 — O que Nunca Pode Aparecer no Código-Fonte

Ao gerar qualquer arquivo, verificar que nenhum dos itens abaixo está hardcoded:

```
❌ IPs de máquina ou servidor    → ex: "http://192.168.0.1:8080"
❌ Chaves de API                 → ex: "sk-proj-abc123..."
❌ JWT Secret                    → ex: "minha-chave-secreta"
❌ Credenciais de banco          → ex: "postgres://user:senha@host"
❌ URLs do BFF Java              → ex: "http://backend.vestibuline.com.br"
❌ Tokens de acesso              → ex: Bearer tokens hardcoded
❌ Senhas de qualquer serviço    → ex: SMTP, Redis, S3
```

Se qualquer um desses valores for necessário, **parar a geração** e indicar a variável de ambiente correta a ser usada:

```ts
// Ao invés de gerar isso:
const res = await fetch('http://192.168.0.50:8080/api/ranking')

// Gerar sempre isso:
const res = await fetch(`${process.env.BFF_URL}/ranking`)
```

---

## REGRA 5 — JWT Nunca no Client-Side

O token JWT **nunca** deve ser manipulado, lido, decodificado ou armazenado de forma acessível ao JavaScript do browser.

```ts
// ❌ PROIBIDO — armazenar JWT no localStorage (acessível por JS)
localStorage.setItem('token', jwtToken)

// ❌ PROIBIDO — armazenar JWT no sessionStorage
sessionStorage.setItem('token', jwtToken)

// ✅ CORRETO — JWT em cookie HttpOnly (inacessível ao JS do browser)
// Configurado pelo BFF Java no momento do login:
// Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/
```

Ao gerar código de autenticação no client-side, nunca acessar o token diretamente. O cookie HttpOnly é enviado automaticamente pelo browser em cada requisição.

---

## REGRA 6 — Dados do Aluno: Nunca Persistir no Client

O vestibuline lida com dados de estudantes, potencialmente menores de idade. Nenhum dado pessoal identificável deve ser persistido no client-side.

```ts
// ❌ PROIBIDO — dados pessoais no localStorage
localStorage.setItem('aluno', JSON.stringify({ nome, cpf, email, escola }))

// ❌ PROIBIDO — dados pessoais em variáveis globais do window
window.alunoAtual = { id, nome, progresso }

// ✅ CORRETO — dados do aluno apenas em estado React (memória da sessão)
// Obtidos via SWR/React Query a partir de endpoint autenticado
const { data: aluno } = useSWR('/api/me', fetcher)
// Vivem apenas em memória enquanto a sessão está ativa
```

---

## REGRA 7 — Route Handlers: Sempre Validar Antes de Executar

Todo Route Handler em `src/app/api/` que acessa dados do aluno deve seguir este fluxo obrigatório: **validar token → extrair payload → executar ação**. Nunca inverter a ordem.

```ts
// ✅ Fluxo obrigatório em todo Route Handler protegido
export async function GET(req: NextRequest) {
  // 1. Extrair token
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // 2. Validar via jwtDecoder (único ponto autorizado)
  let payload: JWTPayload
  try {
    payload = await decodeJWT(token)
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  // 3. Executar ação apenas após validação bem-sucedida
  const data = await fetchBFF(`/dados/${payload.sub}`, token)
  return NextResponse.json(data)
}
```

---

## REGRA 8 — Mensagens de Erro: Nunca Expor Detalhes Internos

Erros retornados ao client nunca devem expor detalhes da infraestrutura (stack trace, nome de serviço, IP, estrutura do banco).

```ts
// ❌ ERRADO — expõe detalhes internos
catch (error) {
  return NextResponse.json({
    error: error.message, // pode vazar "connect ECONNREFUSED 192.168.0.50:8080"
    stack: error.stack,   // NUNCA expor stack trace
  }, { status: 500 })
}

// ✅ CORRETO — mensagem genérica para o client, log interno no servidor
catch (error) {
  console.error('[API /profile] Erro ao buscar dados:', error) // log server-side
  return NextResponse.json(
    { error: 'Ops, algo deu errado. Tenta novamente em instantes.' },
    { status: 500 }
  )
}
```

A mensagem de erro ao usuário segue o tom de voz do vestibuline: empática, sem tecnicismo, orientada à solução.

---

## REGRA 9 — `.env` no `.gitignore`: Verificação Obrigatória

O arquivo `.env` **nunca** deve ser commitado. Ao gerar código que adiciona novas variáveis de ambiente, sempre lembrar de documentá-las no `.env.example` (sem os valores reais).

```bash
# .env.example — commitado no repositório (sem valores reais)
BFF_URL=
JWT_SECRET=
PAYMENT_API_KEY=
EMAIL_SERVICE_KEY=
NEXT_PUBLIC_ANALYTICS_ID=
```

```bash
# .gitignore — verificar que estas entradas existem
.env
.env.local
.env.production
.env*.local
```

---

## REGRA 10 — Proibições Absolutas de Segurança

```
❌ Decodificar JWT fora de src/app/service/jwtDecoder.ts
❌ Acessar process.env.JWT_SECRET fora do jwtDecoder.ts
❌ Hardcode de IPs, URLs, chaves ou credenciais no código-fonte
❌ Prefixo NEXT_PUBLIC_ em qualquer variável sensível ou secreta
❌ JWT armazenado em localStorage ou sessionStorage
❌ Dados pessoais do aluno persistidos no client-side
❌ Stack traces ou mensagens de erro internas expostas ao browser
❌ Route Handler executando ação antes de validar o JWT
❌ Arquivo .env commitado no repositório
❌ Lógica de autenticação replicada fora da camada service/
```

---

*vestibuline | antigravity-security.md | v1.0 2026*