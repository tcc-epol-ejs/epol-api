# EPOL — Auth Backend (Supabase)

API Node.js/Express para **cadastro**, **login** e **recuperação de senha**,
conectada ao Postgres do Supabase. Cobre apenas os schemas `usuarios.usuarios`
e `usuarios.recuperacao_senha` do Dicionário de Dados — os próximos schemas
(`dados_politicos`) podem ser adicionados depois seguindo o mesmo padrão.

## 1. Pré-requisitos no Supabase

Antes de rodar o projeto, faça **2 ajustes no painel do Supabase**:

1. **Expor o schema `usuarios`**
   Vá em *Project Settings → API → Data API Settings → Exposed schemas* e
   adicione `usuarios` (o padrão só expõe `public`). Sem isso, toda chamada
   às tabelas `usuarios.usuarios` e `usuarios.recuperacao_senha` retorna erro
   do PostgREST.

2. **Copiar a chave `service_role`**
   Em *Project Settings → API*, copie a chave **service_role** (não a
   `anon`). Ela é necessária porque essas tabelas normalmente têm RLS
   habilitado, e o back-end precisa ler/escrever nelas diretamente.
   **Essa chave é secreta**: fica só no `.env` do back-end, nunca no
   front-end (Vite/React), nunca em repositório público.

## 2. Instalação

```bash
yarn install
cp .env.example .env
# edite o .env com SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e um JWT_SECRET próprio
yarn dev
```

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

## 3. Endpoints

### `POST /api/auth/cadastro`
Cria um registro em `usuarios.usuarios`.

```json
{
  "nome": "Maria Souza",
  "apelido": "Mari",
  "email": "maria@email.com",
  "senha": "umaSenhaForte123",
  "estado": "SP",
  "data_nascimento": "1990-05-20",
  "partido_preferencia_id": null
}
```
→ `201` com os dados do usuário (sem o hash da senha).

### `POST /api/auth/login`
```json
{ "email": "maria@email.com", "senha": "umaSenhaForte123" }
```
→ `200` com `{ usuario, token }` — `token` é um JWT que o front-end deve
guardar (ex: em memória/contexto React) e enviar como
`Authorization: Bearer <token>` nas próximas chamadas que exigirem login.

### `POST /api/auth/recuperar-senha`
```json
{ "email": "maria@email.com" }
```
Gera um token em `usuarios.recuperacao_senha` com validade configurável
(`RECUPERACAO_TOKEN_EXPIRA_HORAS`, padrão 1h). A resposta é sempre genérica,
para não revelar se o e-mail existe no banco.

> **Pendência:** o envio do e-mail com o link não está implementado ainda.
> Hoje a função `solicitarRecuperacaoSenha` apenas grava o token no banco
> (veja o `TODO` em `src/services/auth.service.js`). Quando for integrar um
> provedor de e-mail (Resend, SendGrid, etc.), envie um link do tipo
> `https://seu-front.com/redefinir-senha?token=...` usando esse token.

### `POST /api/auth/redefinir-senha`
```json
{ "token": "token_recebido_por_email", "novaSenha": "novaSenhaForte456" }
```
Valida se o token existe, não expirou e não foi usado; troca a senha e marca
o token como usado (`usado = true`), impedindo reuso.

## 4. Estrutura

```
src/
  config/supabaseClient.js   # client do Supabase com a service_role key
  controllers/                # validação de entrada da requisição HTTP
  services/auth.service.js    # regras de negócio + acesso às tabelas
  routes/                     # definição das rotas Express
  middlewares/errorHandler.js # tratamento centralizado de erros
  utils/                      # geração de token e classe de erro
  app.js / server.js          # montagem do Express e boot do servidor
```

## 5. Decisões tomadas

- **Hash de senha:** `bcrypt`, por ser o mais usado em projetos Node e ter
  suporte maduro — atende à regra do dicionário de dados (`senha_hash` via
  bcrypt ou argon2).
- **Sessão:** JWT assinado com `JWT_SECRET`, validade configurável via
  `JWT_EXPIRES_IN`. Se preferir sessões via cookie/Supabase Auth nativo no
  futuro, dá para trocar só a função `autenticarUsuario`.
- **Acesso ao banco:** via `@supabase/supabase-js` com a `service_role` key,
  em vez de `pg` direto — mantém a mesma lib que vocês já citaram no
  documento de tecnologias (Supabase como BaaS).
